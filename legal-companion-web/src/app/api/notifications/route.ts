/**
 * GET /api/notifications - List notifications with pagination and filters
 * POST /api/notifications - Create notification (internal use)
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
import { parsePaginationParams } from '@/lib/api-validation';

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

    // Read status filter
    const isRead = searchParams.get('isRead');
    if (isRead !== null) {
      where.isRead = isRead === 'true';
    }

    // Type filter
    const type = searchParams.get('type');
    if (type) {
      where.type = type;
    }

    // Fetch notifications
    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: {
          userId: tokenPayload.userId,
          isRead: false,
        },
      }),
    ]);

    return successResponse(
      notifications,
      {
        page,
        limit,
        total,
        unreadCount,
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

    // Create notification
    const notification = await prisma.notification.create({
      data: {
        userId: tokenPayload.userId,
        type: body.type || 'info',
        title: body.title,
        message: body.message,
        documentId: body.documentId || null,
        eventId: body.eventId || null,
        taskId: body.taskId || null,
        actions: body.actions || null,
      },
    });

    return createdResponse(notification);
  } catch (error) {
    return handleApiError(error);
  }
}
