/**
 * POST /api/integrations/email/disconnect - Disconnect email account
 * Revokes tokens and removes connection
 */

import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, ApiErrors, handleApiError } from '@/lib/api-response';
import { getUserFromRequest } from '@/lib/api-auth';
import { decryptEmailToken, revokeEmailToken } from '@/lib/email-oauth';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const tokenPayload = await getUserFromRequest(request);
    if (!tokenPayload) {
      return ApiErrors.unauthorized();
    }

    const body = await request.json();
    const { connectionId } = body;

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

    // Revoke access token if available
    if (connection.accessToken) {
      try {
        const accessToken = decryptEmailToken(connection.accessToken);
        await revokeEmailToken(accessToken);
      } catch (error) {
        console.error('Failed to revoke token:', error);
        // Continue with disconnection even if revocation fails
      }
    }

    // Delete connection and all processed emails
    await prisma.emailConnection.delete({
      where: { id: connection.id },
    });

    return successResponse({
      message: 'Email account disconnected successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
