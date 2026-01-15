/**
 * GET /api/integrations/google/folders - List Google Drive folders
 * Returns available folders for syncing
 */

import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, ApiErrors, handleApiError } from '@/lib/api-response';
import { getUserFromRequest } from '@/lib/api-auth';
import { listFolders } from '@/lib/google-drive';
import { decryptToken, refreshAccessToken, encryptToken, isTokenExpired } from '@/lib/google-oauth';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const tokenPayload = await getUserFromRequest(request);
    if (!tokenPayload) {
      return ApiErrors.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get('connectionId');

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

    if (!connection.accessToken || !connection.refreshToken) {
      return ApiErrors.unauthorized('No valid tokens found');
    }

    // Decrypt tokens
    let accessToken = decryptToken(connection.accessToken);

    // Refresh token if expired
    if (isTokenExpired(connection.tokenExpiry?.getTime())) {
      const refreshToken = decryptToken(connection.refreshToken);
      const newTokens = await refreshAccessToken(refreshToken);
      accessToken = newTokens.access_token;

      // Update tokens in database
      await prisma.driveConnection.update({
        where: { id: connection.id },
        data: {
          accessToken: encryptToken(newTokens.access_token),
          tokenExpiry: newTokens.expiry_date
            ? new Date(newTokens.expiry_date)
            : null,
        },
      });
    }

    // List folders
    const folders = await listFolders(accessToken);

    // Add root folder as an option
    const allFolders = [
      {
        id: 'root',
        name: 'My Drive',
        path: '/My Drive',
      },
      ...folders,
    ];

    return successResponse({
      folders: allFolders,
      connectionId: connection.id,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
