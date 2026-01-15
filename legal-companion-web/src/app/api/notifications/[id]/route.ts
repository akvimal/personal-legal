/**
 * PUT /api/notifications/:id/read - Mark notification as read
 * DELETE /api/notifications/:id - Delete notification
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors, handleApiError } from '@/lib/api-response';
import { getUserFromRequest } from '@/lib/api-auth';
import { markNotificationAsRead, deleteNotification } from '@/lib/notification-service';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    // Authenticate user
    const tokenPayload = await getUserFromRequest(request);
    if (!tokenPayload) {
      return ApiErrors.unauthorized();
    }

    const { id } = await context.params;

    const notification = await markNotificationAsRead(id, tokenPayload.userId);

    return successResponse({ notification });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    // Authenticate user
    const tokenPayload = await getUserFromRequest(request);
    if (!tokenPayload) {
      return ApiErrors.unauthorized();
    }

    const { id } = await context.params;

    await deleteNotification(id, tokenPayload.userId);

    return successResponse({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
