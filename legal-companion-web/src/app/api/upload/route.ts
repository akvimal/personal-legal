/**
 * POST /api/upload - File upload endpoint
 * Handles multipart/form-data file uploads
 */

import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import {
  successResponse,
  createdResponse,
  ApiErrors,
  handleApiError,
} from '@/lib/api-response';
import { getUserFromRequest } from '@/lib/api-auth';
import {
  validateFile,
  generateUniqueFilename,
  getFileCategory,
} from '@/lib/file-upload';
import { saveFile } from '@/lib/file-storage';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const tokenPayload = await getUserFromRequest(request);
    if (!tokenPayload) {
      return ApiErrors.unauthorized();
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const documentDataString = formData.get('documentData') as string | null;

    if (!file) {
      return ApiErrors.badRequest('No file provided');
    }

    if (!documentDataString) {
      return ApiErrors.badRequest('No document data provided');
    }

    let documentData;
    try {
      documentData = JSON.parse(documentDataString);
    } catch {
      return ApiErrors.badRequest('Invalid document data format');
    }

    // Validate required document fields
    if (!documentData.title || !documentData.category || !documentData.documentType) {
      return ApiErrors.badRequest(
        'Missing required document fields: title, category, documentType'
      );
    }

    if (!documentData.country || !documentData.region) {
      return ApiErrors.badRequest('Missing required fields: country, region');
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate file (client-side validation mirror)
    const fileForValidation = new File([buffer], file.name, { type: file.type });
    Object.defineProperty(fileForValidation, 'size', { value: buffer.length });

    const validation = validateFile(fileForValidation);
    if (!validation.valid) {
      return ApiErrors.validationError({
        file: validation.errors,
      });
    }

    // Generate unique filename
    const uniqueFilename = generateUniqueFilename(file.name);

    // Save file to storage
    const saveResult = await saveFile(buffer, uniqueFilename);

    if (!saveResult.success) {
      return ApiErrors.internalError(
        saveResult.error || 'Failed to save file'
      );
    }

    // Get file category
    const fileCategory = getFileCategory(file.type);

    // Create document in database
    const document = await prisma.document.create({
      data: {
        userId: tokenPayload.userId,
        title: documentData.title,
        category: documentData.category,
        documentType: documentData.documentType,
        status: 'active',
        filePath: saveResult.filePath!,
        fileType: file.type,
        fileSize: buffer.length,
        pages: null, // TODO: Extract page count for PDFs
        signedDate: documentData.signedDate
          ? new Date(documentData.signedDate)
          : null,
        startDate: documentData.startDate
          ? new Date(documentData.startDate)
          : null,
        endDate: documentData.endDate ? new Date(documentData.endDate) : null,
        parties: documentData.parties || [],
        tags: documentData.tags || [],
        country: documentData.country,
        region: documentData.region,
        language: documentData.language || 'en',
        metadata: {
          originalFilename: file.name,
          uploadedFilename: uniqueFilename,
          fileCategory,
          publicUrl: saveResult.publicUrl,
        },
      },
    });

    // TODO: Queue for OCR processing
    // await queueOCRJob(document.id, saveResult.filePath!);

    return createdResponse({
      document,
      message: 'File uploaded successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// Set max body size for file uploads (10MB)
export const config = {
  api: {
    bodyParser: false, // Disable default body parser for multipart/form-data
  },
};
