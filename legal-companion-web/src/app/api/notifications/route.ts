/**
 * GET /api/notifications - Get user notifications
 * Returns paginated list of notifications for the authenticated user
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors, handleApiError } from '@/lib/api-response';
import { getUserFromRequest } from '@/lib/api-auth';
import { getUserNotifications } from '@/lib/notification-service';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const tokenPayload = await getUserFromRequest(request);
    if (!tokenPayload) {
      return ApiErrors.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const notifications = await getUserNotifications(tokenPayload.userId, limit, unreadOnly);

    return successResponse({ notifications });
  } catch (error) {
    return handleApiError(error);
  }
}
