/**
 * GET /api/notifications/count - Get unread notification count
 * Returns the number of unread notifications for the authenticated user
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors, handleApiError } from '@/lib/api-response';
import { getUserFromRequest } from '@/lib/api-auth';
import { getUnreadCount } from '@/lib/notification-service';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const tokenPayload = await getUserFromRequest(request);
    if (!tokenPayload) {
      return ApiErrors.unauthorized();
    }

    const count = await getUnreadCount(tokenPayload.userId);

    return successResponse({ count });
  } catch (error) {
    return handleApiError(error);
  }
}
