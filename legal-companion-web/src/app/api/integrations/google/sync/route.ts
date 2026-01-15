/**
 * POST /api/integrations/google/sync - Trigger manual sync
 * Syncs files from Google Drive to the application
 */

import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, ApiErrors, handleApiError } from '@/lib/api-response';
import { getUserFromRequest } from '@/lib/api-auth';
import { syncDriveFiles } from '@/lib/google-drive-sync';

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

    if (connection.status === 'syncing') {
      return ApiErrors.badRequest('Sync already in progress');
    }

    // Start sync in background (simplified - in production, use job queue)
    syncDriveFiles(connectionId).catch((error) => {
      console.error('Sync error:', error);
    });

    return successResponse({
      message: 'Sync started',
      connectionId: connection.id,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
