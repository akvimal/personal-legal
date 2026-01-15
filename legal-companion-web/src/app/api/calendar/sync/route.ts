/**
 * POST /api/calendar/sync - Trigger calendar sync
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors, handleApiError } from '@/lib/api-response';
import { getUserFromRequest } from '@/lib/api-auth';
import { syncEventsToCalendar, syncCalendarBidirectional } from '@/lib/calendar-sync-service';

export async function POST(request: NextRequest) {
  try {
    const tokenPayload = await getUserFromRequest(request);
    if (!tokenPayload) {
      return ApiErrors.unauthorized();
    }

    const body = await request.json();
    const { connectionId, bidirectional } = body;

    if (!connectionId) {
      return ApiErrors.badRequest('Connection ID is required');
    }

    let result;
    if (bidirectional) {
      result = await syncCalendarBidirectional(connectionId);
    } else {
      result = await syncEventsToCalendar(connectionId);
    }

    return successResponse({ result });
  } catch (error) {
    return handleApiError(error);
  }
}
