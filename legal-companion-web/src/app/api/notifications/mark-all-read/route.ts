/**
 * PUT /api/notifications/mark-all-read - Mark all notifications as read
 */

import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, ApiErrors, handleApiError } from '@/lib/api-response';
import { getUserFromRequest } from '@/lib/api-auth';

export async function PUT(request: NextRequest) {
  try {
    // Authenticate user
    const tokenPayload = await getUserFromRequest(request);
    if (!tokenPayload) {
      return ApiErrors.unauthorized();
    }

    // Mark all unread notifications as read
    const result = await prisma.notification.updateMany({
      where: {
        userId: tokenPayload.userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return successResponse({
      message: 'All notifications marked as read',
      count: result.count,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
