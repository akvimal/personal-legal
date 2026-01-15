/**
 * GET /api/documents - List documents with pagination and filters
 * POST /api/documents - Create new document
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
import { parsePaginationParams, validateDocument } from '@/lib/api-validation';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const tokenPayload = await getUserFromRequest(request);
    if (!tokenPayload) {
      return ApiErrors.unauthorized();
    }

    const searchParams = request.nextUrl.searchParams;
    const { page, limit, skip } = parsePaginationParams(searchParams);

    // Build filters
    const where: any = {
      userId: tokenPayload.userId,
    };

    // Category filter
    const category = searchParams.get('category');
    if (category) {
      where.category = category;
    }

    // Status filter
    const status = searchParams.get('status');
    if (status) {
      where.status = status;
    }

    // Search query
    const search = searchParams.get('search');
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { documentType: { contains: search, mode: 'insensitive' } },
        { parties: { has: search } },
        { tags: { has: search } },
      ];
    }

    // Fetch documents
    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              events: true,
              tasks: true,
            },
          },
        },
      }),
      prisma.document.count({ where }),
    ]);

    return successResponse(
      documents,
      {
        page,
        limit,
        total,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const tokenPayload = await getUserFromRequest(request);
    if (!tokenPayload) {
      return ApiErrors.unauthorized();
    }

    const body = await request.json();

    // Validate document data
    validateDocument(body);

    // Create document
    const document = await prisma.document.create({
      data: {
        userId: tokenPayload.userId,
        title: body.title,
        category: body.category,
        documentType: body.documentType,
        status: body.status || 'active',
        filePath: body.filePath,
        fileType: body.fileType,
        fileSize: body.fileSize,
        pages: body.pages || null,
        signedDate: body.signedDate ? new Date(body.signedDate) : null,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        parties: body.parties || [],
        tags: body.tags || [],
        country: body.country,
        region: body.region,
        language: body.language || 'en',
        metadata: body.metadata || null,
      },
    });

    return createdResponse(document);
  } catch (error) {
    return handleApiError(error);
  }
}
