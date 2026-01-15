/**
 * PUT /api/notifications/read-all - Mark all notifications as read
 * Marks all unread notifications as read for the authenticated user
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors, handleApiError } from '@/lib/api-response';
import { getUserFromRequest } from '@/lib/api-auth';
import { markAllNotificationsAsRead } from '@/lib/notification-service';

export async function PUT(request: NextRequest) {
  try {
    // Authenticate user
    const tokenPayload = await getUserFromRequest(request);
    if (!tokenPayload) {
      return ApiErrors.unauthorized();
    }

    await markAllNotificationsAsRead(tokenPayload.userId);

    return successResponse({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
