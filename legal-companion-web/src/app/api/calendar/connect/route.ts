/**
 * POST /api/calendar/connect - Connect to Google Calendar
 * Creates calendar connection after OAuth
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors, handleApiError } from '@/lib/api-response';
import { getUserFromRequest } from '@/lib/api-auth';
import { encryptToken } from '@/lib/google-oauth';
import { listCalendars } from '@/lib/google-calendar';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const tokenPayload = await getUserFromRequest(request);
    if (!tokenPayload) {
      return ApiErrors.unauthorized();
    }

    const body = await request.json();
    const { accessToken, refreshToken, tokenExpiry, calendarId, calendarName, email } = body;

    if (!accessToken || !calendarId) {
      return ApiErrors.badRequest('Access token and calendar ID are required');
    }

    // Get calendar details
    const calendars = await listCalendars(accessToken, refreshToken);
    const calendar = calendars.find((c) => c.id === calendarId);

    if (!calendar) {
      return ApiErrors.badRequest('Calendar not found');
    }

    // Create or update connection
    let connection = await prisma.calendarConnection.findFirst({
      where: { userId: tokenPayload.userId, email: email || tokenPayload.email },
    });

    if (connection) {
      connection = await prisma.calendarConnection.update({
        where: { id: connection.id },
        data: {
          accessToken: encryptToken(accessToken),
          refreshToken: refreshToken ? encryptToken(refreshToken) : null,
          tokenExpiry: tokenExpiry ? new Date(tokenExpiry) : null,
          calendarId,
          calendarName: calendarName || calendar.summary,
          timeZone: calendar.timeZone,
          status: 'connected',
        },
      });
    } else {
      connection = await prisma.calendarConnection.create({
        data: {
          userId: tokenPayload.userId,
          provider: 'google',
          email: email || tokenPayload.email,
          accessToken: encryptToken(accessToken),
          refreshToken: refreshToken ? encryptToken(refreshToken) : null,
          tokenExpiry: tokenExpiry ? new Date(tokenExpiry) : null,
          calendarId,
          calendarName: calendarName || calendar.summary,
          timeZone: calendar.timeZone,
          status: 'connected',
        },
      });
    }

    return successResponse({ connection });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const tokenPayload = await getUserFromRequest(request);
    if (!tokenPayload) {
      return ApiErrors.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get('id');

    if (!connectionId) {
      return ApiErrors.badRequest('Connection ID is required');
    }

    await prisma.calendarConnection.delete({
      where: { id: connectionId, userId: tokenPayload.userId },
    });

    return successResponse({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
