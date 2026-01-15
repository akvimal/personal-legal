/**
 * GET /api/calendar/export - Export events to iCal format
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors, handleApiError } from '@/lib/api-response';
import { getUserFromRequest } from '@/lib/api-auth';
import { exportEventsToICal } from '@/lib/icalendar';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const tokenPayload = await getUserFromRequest(request);
    if (!tokenPayload) {
      return ApiErrors.unauthorized();
    }

    // Get user's events
    const events = await prisma.event.findMany({
      where: { userId: tokenPayload.userId },
      orderBy: { eventDate: 'asc' },
    });

    // Generate iCal content
    const icalContent = exportEventsToICal(events);

    // Return as downloadable file
    return new Response(icalContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="events.ics"',
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
