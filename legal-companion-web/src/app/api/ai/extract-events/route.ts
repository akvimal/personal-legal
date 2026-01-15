/**
 * POST /api/ai/extract-events - Extract calendar events from document
 * Identifies deadlines, important dates, and obligations
 */

import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, ApiErrors, handleApiError } from '@/lib/api-response';
import { getUserFromRequest } from '@/lib/api-auth';
import { getProviderInstance, isAIConfigured } from '@/lib/ai-service';
import { getEventExtractionPrompt, AI_ASSISTANT_SYSTEM_PROMPT } from '@/lib/ai-prompts';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const tokenPayload = await getUserFromRequest(request);
    if (!tokenPayload) {
      return ApiErrors.unauthorized();
    }

    // Check if AI is configured
    if (!isAIConfigured()) {
      return ApiErrors.serviceUnavailable(
        'AI service is not configured. Please set up your AI provider API key.'
      );
    }

    const body = await request.json();
    const { documentId, documentText, autoCreateEvents } = body;

    if (!documentId) {
      return ApiErrors.badRequest('Document ID is required');
    }

    // Fetch document
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        userId: tokenPayload.userId,
      },
    });

    if (!document) {
      return ApiErrors.notFound('Document');
    }

    // Use provided text or placeholder
    const textToAnalyze =
      documentText ||
      '[Document text not yet extracted. OCR integration required.]';

    // Get AI provider
    const provider = await getProviderInstance();

    // Generate event extraction prompt
    const prompt = getEventExtractionPrompt(
      textToAnalyze,
      document.title,
      document.category
    );

    // Call AI
    const response = await provider.chat(
      [{ role: 'user', content: prompt }],
      {
        systemPrompt: AI_ASSISTANT_SYSTEM_PROMPT,
        temperature: 0.3, // Lower temperature for precise date extraction
        maxTokens: 3072,
      }
    );

    // Parse JSON response
    let extractedEvents;
    try {
      extractedEvents = JSON.parse(response.content);
    } catch (error) {
      // If parsing fails, return error
      return ApiErrors.internalError(
        'Failed to parse event extraction response'
      );
    }

    // Validate extracted events structure
    if (!Array.isArray(extractedEvents)) {
      return ApiErrors.internalError(
        'Invalid event extraction format'
      );
    }

    // Auto-create events in database if requested
    let createdEvents = [];
    if (autoCreateEvents && extractedEvents.length > 0) {
      // Create events in database
      const eventsToCreate = extractedEvents
        .filter((event: any) => event.date && event.title)
        .map((event: any) => ({
          userId: tokenPayload.userId,
          documentId: document.id,
          title: event.title,
          description: event.description || null,
          eventDate: new Date(event.date),
          eventType: event.type || 'deadline',
          priority: event.priority || 'medium',
          status: 'upcoming' as const,
          reminderDays: event.reminderDays || 7,
        }));

      if (eventsToCreate.length > 0) {
        // Use createMany for batch creation
        await prisma.event.createMany({
          data: eventsToCreate,
          skipDuplicates: true,
        });

        // Fetch the created events to return them
        createdEvents = await prisma.event.findMany({
          where: {
            userId: tokenPayload.userId,
            documentId: document.id,
            title: {
              in: eventsToCreate.map((e) => e.title),
            },
          },
          orderBy: {
            eventDate: 'asc',
          },
        });
      }
    }

    return successResponse({
      document: {
        id: document.id,
        title: document.title,
        category: document.category,
      },
      extractedEvents,
      createdEvents: createdEvents.length > 0 ? createdEvents : undefined,
      model: response.model,
      usage: response.usage,
      autoCreated: autoCreateEvents && createdEvents.length > 0,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
