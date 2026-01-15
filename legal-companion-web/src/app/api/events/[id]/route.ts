/**
 * GET /api/events/[id] - Get event by ID
 * PUT /api/events/[id] - Update event
 * DELETE /api/events/[id] - Delete event
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

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Authenticate user
    const tokenPayload = await getUserFromRequest(request);
    if (!tokenPayload) {
      return ApiErrors.unauthorized();
    }

    const { id } = params;

    // Fetch event with relations
    const event = await prisma.event.findFirst({
      where: {
        id,
        userId: tokenPayload.userId,
      },
      include: {
        document: true,
        reminders: {
          orderBy: { daysBefore: 'asc' },
        },
        tasks: {
          where: { status: { not: 'completed' } },
          orderBy: { priority: 'desc' },
        },
      },
    });

    if (!event) {
      return ApiErrors.notFound('Event');
    }

    return successResponse(event);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Authenticate user
    const tokenPayload = await getUserFromRequest(request);
    if (!tokenPayload) {
      return ApiErrors.unauthorized();
    }

    const { id } = params;
    const body = await request.json();

    // Check if event exists and belongs to user
    const existingEvent = await prisma.event.findFirst({
      where: {
        id,
        userId: tokenPayload.userId,
      },
    });

    if (!existingEvent) {
      return ApiErrors.notFound('Event');
    }

    // Update event
    const event = await prisma.event.update({
      where: { id },
      data: {
        eventType: body.eventType,
        title: body.title,
        description: body.description,
        eventDate: body.eventDate ? new Date(body.eventDate) : undefined,
        priority: body.priority,
        status: body.status,
        isRecurring: body.isRecurring,
        recurrencePattern: body.recurrencePattern,
        responsibleParty: body.responsibleParty,
        consequence: body.consequence,
        advanceNoticeDays: body.advanceNoticeDays,
      },
      include: {
        document: true,
        reminders: true,
      },
    });

    return successResponse(event);
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

    // Check if event exists and belongs to user
    const existingEvent = await prisma.event.findFirst({
      where: {
        id,
        userId: tokenPayload.userId,
      },
    });

    if (!existingEvent) {
      return ApiErrors.notFound('Event');
    }

    // Delete event (cascade will handle reminders and related tasks)
    await prisma.event.delete({
      where: { id },
    });

    return successResponse({
      message: 'Event deleted successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
