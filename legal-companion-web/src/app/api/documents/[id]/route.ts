/**
 * GET /api/documents/[id] - Get document by ID
 * PUT /api/documents/[id] - Update document
 * DELETE /api/documents/[id] - Delete document
 */

import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, ApiErrors, handleApiError } from '@/lib/api-response';
import { getUserFromRequest } from '@/lib/api-auth';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Authenticate user
    const tokenPayload = await getUserFromRequest(request);
    if (!tokenPayload) {
      return ApiErrors.unauthorized();
    }

    const { id } = params;

    // Fetch document with relations
    const document = await prisma.document.findFirst({
      where: {
        id,
        userId: tokenPayload.userId,
      },
      include: {
        events: {
          orderBy: { eventDate: 'asc' },
          take: 10,
        },
        tasks: {
          where: { status: { not: 'completed' } },
          orderBy: { dueDate: 'asc' },
          take: 10,
        },
        insurancePolicy: true,
        driveFile: true,
      },
    });

    if (!document) {
      return ApiErrors.notFound('Document');
    }

    return successResponse(document);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Authenticate user
    const tokenPayload = await getUserFromRequest(request);
    if (!tokenPayload) {
      return ApiErrors.unauthorized();
    }

    const { id } = params;
    const body = await request.json();

    // Check if document exists and belongs to user
    const existingDocument = await prisma.document.findFirst({
      where: {
        id,
        userId: tokenPayload.userId,
      },
    });

    if (!existingDocument) {
      return ApiErrors.notFound('Document');
    }

    // Update document
    const document = await prisma.document.update({
      where: { id },
      data: {
        title: body.title,
        category: body.category,
        documentType: body.documentType,
        status: body.status,
        signedDate: body.signedDate ? new Date(body.signedDate) : undefined,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        parties: body.parties,
        tags: body.tags,
        metadata: body.metadata,
      },
    });

    return successResponse(document);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Authenticate user
    const tokenPayload = await getUserFromRequest(request);
    if (!tokenPayload) {
      return ApiErrors.unauthorized();
    }

    const { id } = params;

    // Check if document exists and belongs to user
    const existingDocument = await prisma.document.findFirst({
      where: {
        id,
        userId: tokenPayload.userId,
      },
    });

    if (!existingDocument) {
      return ApiErrors.notFound('Document');
    }

    // Delete document (cascade will handle related records)
    await prisma.document.delete({
      where: { id },
    });

    return successResponse({
      message: 'Document deleted successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
