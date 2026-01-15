/**
 * GET /api/integrations/email/messages - Get processed emails
 * Returns list of processed T&C emails with extracted information
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
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build where clause
    const where: any = {
      connection: {
        userId: tokenPayload.userId,
      },
    };

    if (connectionId) {
      where.connectionId = connectionId;
    }

    if (category) {
      where.category = category;
    }

    if (priority) {
      where.priority = priority;
    }

    // Get total count
    const total = await prisma.processedEmail.count({ where });

    // Get processed emails
    const emails = await prisma.processedEmail.findMany({
      where,
      include: {
        connection: {
          select: {
            emailAddress: true,
            provider: true,
          },
        },
      },
      orderBy: {
        receivedAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return successResponse({
      emails,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
