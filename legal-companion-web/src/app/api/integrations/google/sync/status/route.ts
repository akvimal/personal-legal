/**
 * GET /api/integrations/google/sync/status - Get sync status
 * Returns current sync progress and statistics
 */

import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, ApiErrors, handleApiError } from '@/lib/api-response';
import { getUserFromRequest } from '@/lib/api-auth';

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

    // Get file sync statistics
    const fileStats = await prisma.driveFile.groupBy({
      by: ['syncStatus'],
      where: {
        connectionId: connection.id,
      },
      _count: true,
    });

    const stats = {
      pending: 0,
      syncing: 0,
      completed: 0,
      failed: 0,
    };

    fileStats.forEach((stat) => {
      stats[stat.syncStatus as keyof typeof stats] = stat._count;
    });

    // Get recent sync errors
    const recentErrors = await prisma.driveFile.findMany({
      where: {
        connectionId: connection.id,
        syncStatus: 'failed',
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 5,
      select: {
        driveFileName: true,
        errorMessage: true,
        updatedAt: true,
      },
    });

    return successResponse({
      connection: {
        id: connection.id,
        status: connection.status,
        googleAccountEmail: connection.googleAccountEmail,
        folderName: connection.folderName,
        autoSync: connection.autoSync,
        syncFrequency: connection.syncFrequency,
        lastSync: connection.lastSync,
        nextSync: connection.nextSync,
      },
      stats: {
        total: connection.totalFiles,
        synced: connection.syncedFiles,
        failed: connection.failedFiles,
        byStatus: stats,
      },
      recentErrors,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
