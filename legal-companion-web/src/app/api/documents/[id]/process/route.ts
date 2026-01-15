/**
 * POST /api/documents/[id]/process - Trigger OCR processing for a document
 */

import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, ApiErrors, handleApiError } from '@/lib/api-response';
import { getUserFromRequest } from '@/lib/api-auth';
import { processDocument, queueOCRJob } from '@/lib/ocr-processor';
import { getFilePath } from '@/lib/file-storage';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Authenticate user
    const tokenPayload = await getUserFromRequest(request);
    if (!tokenPayload) {
      return ApiErrors.unauthorized();
    }

    const { id } = params;

    // Check if document exists and belongs to user
    const document = await prisma.document.findFirst({
      where: {
        id,
        userId: tokenPayload.userId,
      },
    });

    if (!document) {
      return ApiErrors.notFound('Document');
    }

    // Queue OCR job
    const queueResult = await queueOCRJob(document.id, document.filePath);

    if (!queueResult.success) {
      return ApiErrors.internalError(
        queueResult.error || 'Failed to queue OCR job'
      );
    }

    // Process document immediately (for now, in future use queue)
    const ocrResult = await processDocument(
      getFilePath(document.filePath.replace('/uploads/', '')),
      document.fileType
    );

    // Update document with extracted text (if database supports it)
    // For now, just return the result
    // TODO: Store extracted text in database

    return successResponse({
      document,
      ocrResult,
      jobId: queueResult.jobId,
      message: 'Document queued for processing',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
