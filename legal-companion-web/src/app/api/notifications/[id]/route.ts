/**
 * PUT /api/notifications/[id] - Mark notification as read
 * DELETE /api/notifications/[id] - Delete notification
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

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Authenticate user
    const tokenPayload = await getUserFromRequest(request);
    if (!tokenPayload) {
      return ApiErrors.unauthorized();
    }

    const { id } = params;

    // Check if notification exists and belongs to user
    const existingNotification = await prisma.notification.findFirst({
      where: {
        id,
        userId: tokenPayload.userId,
      },
    });

    if (!existingNotification) {
      return ApiErrors.notFound('Notification');
    }

    // Mark as read
    const notification = await prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return successResponse(notification);
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

    // Check if notification exists and belongs to user
    const existingNotification = await prisma.notification.findFirst({
      where: {
        id,
        userId: tokenPayload.userId,
      },
    });

    if (!existingNotification) {
      return ApiErrors.notFound('Notification');
    }

    // Delete notification
    await prisma.notification.delete({
      where: { id },
    });

    return successResponse({
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
