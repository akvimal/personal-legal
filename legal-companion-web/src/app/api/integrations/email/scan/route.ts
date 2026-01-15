/**
 * POST /api/integrations/email/scan - Scan emails for T&C
 * Scans connected email account for terms of service and related emails
 */

import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, ApiErrors, handleApiError } from '@/lib/api-response';
import { getUserFromRequest } from '@/lib/api-auth';
import { decryptEmailToken, refreshEmailAccessToken, encryptEmailToken, isEmailTokenExpired } from '@/lib/email-oauth';
import {
  listMessages,
  getMessage,
  processMessage,
  buildLegalEmailQuery,
} from '@/lib/gmail-service';
import { extractTermsFromEmail } from '@/lib/email-tc-extractor';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const tokenPayload = await getUserFromRequest(request);
    if (!tokenPayload) {
      return ApiErrors.unauthorized();
    }

    const body = await request.json();
    const { connectionId, since } = body;

    if (!connectionId) {
      return ApiErrors.badRequest('Connection ID is required');
    }

    // Get connection
    const connection = await prisma.emailConnection.findFirst({
      where: {
        id: connectionId,
        userId: tokenPayload.userId,
      },
    });

    if (!connection) {
      return ApiErrors.notFound('Email connection');
    }

    if (!connection.accessToken || !connection.refreshToken) {
      return ApiErrors.unauthorized('No valid tokens found');
    }

    // Decrypt and refresh token if needed
    let accessToken = decryptEmailToken(connection.accessToken);

    if (isEmailTokenExpired(connection.tokenExpiry?.getTime())) {
      const refreshToken = decryptEmailToken(connection.refreshToken);
      const newTokens = await refreshEmailAccessToken(refreshToken);
      accessToken = newTokens.access_token;

      await prisma.emailConnection.update({
        where: { id: connection.id },
        data: {
          accessToken: encryptEmailToken(newTokens.access_token),
          tokenExpiry: newTokens.expiry_date
            ? new Date(newTokens.expiry_date)
            : null,
        },
      });
    }

    // Build search query for legal emails
    const sinceDate = since ? new Date(since) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // Default: last 90 days
    const query = buildLegalEmailQuery(sinceDate);

    // List relevant messages
    const listResponse = await listMessages(accessToken, {
      query,
      maxResults: 50, // Limit for performance
    });

    const processedEmails = [];
    const errors = [];

    // Process each message
    for (const msg of listResponse.messages || []) {
      try {
        // Get full message
        const fullMessage = await getMessage(accessToken, msg.id);
        const processedMsg = processMessage(fullMessage);

        // Skip if not legal-related
        if (!processedMsg.isLegal) {
          continue;
        }

        // Check if already processed
        const existing = await prisma.processedEmail.findFirst({
          where: {
            connectionId: connection.id,
            gmailMessageId: processedMsg.id,
          },
        });

        if (existing) {
          continue; // Skip already processed
        }

        // Extract T&C information using AI (only for T&C emails)
        let extractedTerms = null;
        if (
          processedMsg.category === 'terms_of_service' ||
          processedMsg.category === 'privacy_policy' ||
          processedMsg.category === 'subscription'
        ) {
          try {
            extractedTerms = await extractTermsFromEmail(
              processedMsg.subject,
              processedMsg.body,
              processedMsg.category
            );
          } catch (aiError) {
            console.error('AI extraction failed:', aiError);
            // Continue without extraction
          }
        }

        // Store processed email
        const stored = await prisma.processedEmail.create({
          data: {
            connectionId: connection.id,
            gmailMessageId: processedMsg.id,
            subject: processedMsg.subject,
            from: processedMsg.from,
            receivedAt: processedMsg.date,
            isLegal: processedMsg.isLegal,
            category: processedMsg.category,
            priority: extractedTerms?.riskScore && extractedTerms.riskScore > 70
              ? 'high'
              : extractedTerms?.riskScore && extractedTerms.riskScore > 40
              ? 'medium'
              : 'low',
            extractedTerms: extractedTerms ? JSON.parse(JSON.stringify(extractedTerms)) : null,
            reviewStatus: 'pending',
          },
        });

        processedEmails.push({
          id: stored.id,
          subject: stored.subject,
          from: stored.from,
          category: stored.category,
          priority: stored.priority,
          receivedAt: stored.receivedAt,
        });

        // Create calendar event if renewal date found
        if (extractedTerms?.renewalDate) {
          try {
            await prisma.event.create({
              data: {
                userId: tokenPayload.userId,
                title: `Renewal: ${processedMsg.subject.substring(0, 50)}`,
                description: `Subscription renewal from ${processedMsg.from}`,
                eventDate: new Date(extractedTerms.renewalDate),
                eventType: 'deadline',
                priority: 'medium',
                status: 'upcoming',
                reminderDays: 7,
              },
            });
          } catch (eventError) {
            console.error('Failed to create event:', eventError);
          }
        }
      } catch (error) {
        errors.push({
          messageId: msg.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Update connection stats
    await prisma.emailConnection.update({
      where: { id: connection.id },
      data: {
        totalEmails: listResponse.resultSizeEstimate || 0,
        processedEmails: processedEmails.length,
        lastScan: new Date(),
      },
    });

    return successResponse({
      scanned: listResponse.resultSizeEstimate || 0,
      processed: processedEmails.length,
      errors: errors.length,
      emails: processedEmails,
      errorDetails: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
