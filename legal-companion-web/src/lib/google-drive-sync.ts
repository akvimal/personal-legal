/**
 * Google Drive Sync Service
 * Handles syncing files from Google Drive to the application
 */

import prisma from './prisma';
import { listFiles, downloadFile, getFile } from './google-drive';
import { decryptToken, refreshAccessToken, encryptToken, isTokenExpired } from './google-oauth';
import { saveFile } from './file-storage';
import { validateFile } from './file-upload';

export interface SyncProgress {
  total: number;
  completed: number;
  failed: number;
  current?: string;
}

export interface SyncResult {
  success: boolean;
  filesProcessed: number;
  filesSucceeded: number;
  filesFailed: number;
  errors: Array<{ fileId: string; fileName: string; error: string }>;
}

/**
 * Get valid access token for connection (refresh if needed)
 */
async function getValidAccessToken(connectionId: string): Promise<string> {
  const connection = await prisma.driveConnection.findUnique({
    where: { id: connectionId },
  });

  if (!connection) {
    throw new Error('Connection not found');
  }

  if (!connection.accessToken || !connection.refreshToken) {
    throw new Error('No valid tokens found');
  }

  let accessToken = decryptToken(connection.accessToken);

  // Refresh token if expired
  if (isTokenExpired(connection.tokenExpiry?.getTime())) {
    const refreshToken = decryptToken(connection.refreshToken);
    const newTokens = await refreshAccessToken(refreshToken);
    accessToken = newTokens.access_token;

    // Update tokens in database
    await prisma.driveConnection.update({
      where: { id: connectionId },
      data: {
        accessToken: encryptToken(newTokens.access_token),
        tokenExpiry: newTokens.expiry_date
          ? new Date(newTokens.expiry_date)
          : null,
      },
    });
  }

  return accessToken;
}

/**
 * Sync files from Google Drive
 */
export async function syncDriveFiles(
  connectionId: string,
  onProgress?: (progress: SyncProgress) => void
): Promise<SyncResult> {
  const connection = await prisma.driveConnection.findUnique({
    where: { id: connectionId },
  });

  if (!connection) {
    throw new Error('Connection not found');
  }

  // Update connection status
  await prisma.driveConnection.update({
    where: { id: connectionId },
    data: { status: 'syncing' },
  });

  const result: SyncResult = {
    success: true,
    filesProcessed: 0,
    filesSucceeded: 0,
    filesFailed: 0,
    errors: [],
  };

  try {
    const accessToken = await getValidAccessToken(connectionId);

    // List files from Drive
    const response = await listFiles(accessToken, {
      folderId: connection.folderId,
      includeSubfolders: connection.includeSubfolders,
      pageSize: 100,
    });

    const totalFiles = response.files.length;
    onProgress?.({ total: totalFiles, completed: 0, failed: 0 });

    // Process each file
    for (let i = 0; i < response.files.length; i++) {
      const driveFile = response.files[i];

      try {
        onProgress?.({
          total: totalFiles,
          completed: i,
          failed: result.filesFailed,
          current: driveFile.name,
        });

        // Check if file already synced
        const existingFile = await prisma.driveFile.findFirst({
          where: {
            connectionId,
            driveFileId: driveFile.id,
          },
        });

        // Skip if already synced and not modified
        if (
          existingFile &&
          existingFile.driveModifiedAt.toISOString() === driveFile.modifiedTime
        ) {
          result.filesProcessed++;
          result.filesSucceeded++;
          continue;
        }

        // Download file from Drive
        const fileBuffer = await downloadFile(
          accessToken,
          driveFile.id,
          driveFile.mimeType
        );

        // Validate file
        const file = new File([fileBuffer], driveFile.name, {
          type: driveFile.mimeType,
        });
        const validation = validateFile(file);

        if (!validation.valid) {
          throw new Error(validation.errors.join(', '));
        }

        // Save file to storage
        const timestamp = Date.now();
        const fileName = `${timestamp}-${driveFile.name}`;
        const saveResult = await saveFile(fileBuffer, fileName);

        if (!saveResult.success) {
          throw new Error(saveResult.error || 'Failed to save file');
        }

        // Create document
        const document = await prisma.document.create({
          data: {
            userId: connection.userId,
            title: driveFile.name,
            category: 'other', // Will be updated by AI analysis
            fileUrl: saveResult.filePath!,
            fileSize: parseInt(driveFile.size || '0'),
            mimeType: driveFile.mimeType,
            uploadedAt: new Date(),
            status: 'uploaded',
            source: 'google_drive',
          },
        });

        // Create or update drive file record
        if (existingFile) {
          await prisma.driveFile.update({
            where: { id: existingFile.id },
            data: {
              driveFileName: driveFile.name,
              mimeType: driveFile.mimeType,
              fileSize: parseInt(driveFile.size || '0'),
              driveModifiedAt: new Date(driveFile.modifiedTime),
              syncStatus: 'completed',
              lastSyncAt: new Date(),
              documentId: document.id,
              errorMessage: null,
            },
          });
        } else {
          await prisma.driveFile.create({
            data: {
              connectionId,
              driveFileId: driveFile.id,
              driveFileName: driveFile.name,
              driveFilePath: driveFile.name, // Simplified path
              mimeType: driveFile.mimeType,
              fileSize: parseInt(driveFile.size || '0'),
              driveCreatedAt: new Date(driveFile.createdTime),
              driveModifiedAt: new Date(driveFile.modifiedTime),
              syncStatus: 'completed',
              lastSyncAt: new Date(),
              documentId: document.id,
            },
          });
        }

        result.filesSucceeded++;
      } catch (error) {
        result.filesFailed++;
        result.errors.push({
          fileId: driveFile.id,
          fileName: driveFile.name,
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        // Update or create drive file with error
        const existingFile = await prisma.driveFile.findFirst({
          where: {
            connectionId,
            driveFileId: driveFile.id,
          },
        });

        if (existingFile) {
          await prisma.driveFile.update({
            where: { id: existingFile.id },
            data: {
              syncStatus: 'failed',
              syncAttempts: existingFile.syncAttempts + 1,
              errorMessage:
                error instanceof Error ? error.message : 'Unknown error',
            },
          });
        } else {
          await prisma.driveFile.create({
            data: {
              connectionId,
              driveFileId: driveFile.id,
              driveFileName: driveFile.name,
              driveFilePath: driveFile.name,
              mimeType: driveFile.mimeType,
              fileSize: parseInt(driveFile.size || '0'),
              driveCreatedAt: new Date(driveFile.createdTime),
              driveModifiedAt: new Date(driveFile.modifiedTime),
              syncStatus: 'failed',
              syncAttempts: 1,
              errorMessage:
                error instanceof Error ? error.message : 'Unknown error',
            },
          });
        }
      }

      result.filesProcessed++;
    }

    // Update connection stats
    await prisma.driveConnection.update({
      where: { id: connectionId },
      data: {
        status: 'connected',
        totalFiles: totalFiles,
        syncedFiles: result.filesSucceeded,
        failedFiles: result.filesFailed,
        lastSync: new Date(),
      },
    });

    onProgress?.({
      total: totalFiles,
      completed: result.filesSucceeded,
      failed: result.filesFailed,
    });
  } catch (error) {
    // Update connection status to error
    await prisma.driveConnection.update({
      where: { id: connectionId },
      data: { status: 'error' },
    });

    result.success = false;
    throw error;
  }

  return result;
}

/**
 * Sync a single file from Google Drive
 */
export async function syncSingleFile(
  connectionId: string,
  driveFileId: string
): Promise<{ success: boolean; documentId?: string; error?: string }> {
  try {
    const connection = await prisma.driveConnection.findUnique({
      where: { id: connectionId },
    });

    if (!connection) {
      throw new Error('Connection not found');
    }

    const accessToken = await getValidAccessToken(connectionId);

    // Get file metadata
    const driveFile = await getFile(accessToken, driveFileId);

    // Download file
    const fileBuffer = await downloadFile(
      accessToken,
      driveFile.id,
      driveFile.mimeType
    );

    // Validate file
    const file = new File([fileBuffer], driveFile.name, {
      type: driveFile.mimeType,
    });
    const validation = validateFile(file);

    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    // Save file
    const timestamp = Date.now();
    const fileName = `${timestamp}-${driveFile.name}`;
    const saveResult = await saveFile(fileBuffer, fileName);

    if (!saveResult.success) {
      throw new Error(saveResult.error || 'Failed to save file');
    }

    // Create document
    const document = await prisma.document.create({
      data: {
        userId: connection.userId,
        title: driveFile.name,
        category: 'other',
        fileUrl: saveResult.filePath!,
        fileSize: parseInt(driveFile.size || '0'),
        mimeType: driveFile.mimeType,
        uploadedAt: new Date(),
        status: 'uploaded',
        source: 'google_drive',
      },
    });

    // Update or create drive file record
    await prisma.driveFile.upsert({
      where: { driveFileId: driveFile.id },
      update: {
        driveFileName: driveFile.name,
        mimeType: driveFile.mimeType,
        fileSize: parseInt(driveFile.size || '0'),
        driveModifiedAt: new Date(driveFile.modifiedTime),
        syncStatus: 'completed',
        lastSyncAt: new Date(),
        documentId: document.id,
        errorMessage: null,
      },
      create: {
        connectionId,
        driveFileId: driveFile.id,
        driveFileName: driveFile.name,
        driveFilePath: driveFile.name,
        mimeType: driveFile.mimeType,
        fileSize: parseInt(driveFile.size || '0'),
        driveCreatedAt: new Date(driveFile.createdTime),
        driveModifiedAt: new Date(driveFile.modifiedTime),
        syncStatus: 'completed',
        lastSyncAt: new Date(),
        documentId: document.id,
      },
    });

    return { success: true, documentId: document.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
