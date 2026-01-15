/**
 * POST /api/integrations/google/connect - Complete Google Drive connection
 * Finalizes connection setup with folder selection
 */

import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, ApiErrors, handleApiError } from '@/lib/api-response';
import { getUserFromRequest } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const tokenPayload = await getUserFromRequest(request);
    if (!tokenPayload) {
      return ApiErrors.unauthorized();
    }

    const body = await request.json();
    const {
      connectionId,
      folderId,
      folderName,
      folderPath,
      includeSubfolders = true,
      autoSync = true,
      syncFrequency = 'realtime',
      fileTypes = ['pdf', 'doc', 'docx', 'jpg', 'png', 'tiff', 'txt', 'rtf'],
    } = body;

    if (!connectionId || !folderId || !folderName || !folderPath) {
      return ApiErrors.badRequest(
        'Connection ID, folder ID, name, and path are required'
      );
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

    // Update connection with folder settings
    const updatedConnection = await prisma.driveConnection.update({
      where: { id: connection.id },
      data: {
        folderId,
        folderName,
        folderPath,
        includeSubfolders,
        autoSync,
        syncFrequency,
        fileTypes,
        status: 'connected',
      },
    });

    return successResponse({
      connection: {
        id: updatedConnection.id,
        googleAccountEmail: updatedConnection.googleAccountEmail,
        status: updatedConnection.status,
        folderId: updatedConnection.folderId,
        folderName: updatedConnection.folderName,
        folderPath: updatedConnection.folderPath,
        autoSync: updatedConnection.autoSync,
        syncFrequency: updatedConnection.syncFrequency,
        lastSync: updatedConnection.lastSync,
      },
      message: 'Google Drive connected successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
