/**
 * POST /api/integrations/google/disconnect - Disconnect Google Drive
 * Revokes tokens and removes connection
 */

import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, ApiErrors, handleApiError } from '@/lib/api-response';
import { getUserFromRequest } from '@/lib/api-auth';
import { decryptToken, revokeToken } from '@/lib/google-oauth';

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
    const connection = await prisma.driveConnection.findFirst({
      where: {
        id: connectionId,
        userId: tokenPayload.userId,
      },
    });

    if (!connection) {
      return ApiErrors.notFound('Drive connection');
    }

    // Revoke access token if available
    if (connection.accessToken) {
      try {
        const accessToken = decryptToken(connection.accessToken);
        await revokeToken(accessToken);
      } catch (error) {
        console.error('Failed to revoke token:', error);
        // Continue with disconnection even if revocation fails
      }
    }

    // Delete connection and all synced files
    await prisma.driveConnection.delete({
      where: { id: connection.id },
    });

    return successResponse({
      message: 'Google Drive disconnected successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
