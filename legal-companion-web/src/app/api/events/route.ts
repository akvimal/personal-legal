/**
 * GET /api/events - List events with pagination and filters
 * POST /api/events - Create new event
 */

import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import {
  successResponse,
  createdResponse,
  ApiErrors,
  handleApiError,
} from '@/lib/api-response';
import { getUserFromRequest } from '@/lib/api-auth';
import { parsePaginationParams, validateRequiredFields } from '@/lib/api-validation';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const tokenPayload = await getUserFromRequest(request);
    if (!tokenPayload) {
      return ApiErrors.unauthorized();
    }

    const searchParams = request.nextUrl.searchParams;
    const { page, limit, skip } = parsePaginationParams(searchParams);

    // Build filters
    const where: any = {
      userId: tokenPayload.userId,
    };

    // Status filter
    const status = searchParams.get('status');
    if (status) {
      where.status = status;
    }

    // Priority filter
    const priority = searchParams.get('priority');
    if (priority) {
      where.priority = priority;
    }

    // Event type filter
    const eventType = searchParams.get('eventType');
    if (eventType) {
      where.eventType = eventType;
    }

    // Document filter
    const documentId = searchParams.get('documentId');
    if (documentId) {
      where.documentId = documentId;
    }

    // Date range filter
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    if (startDate || endDate) {
      where.eventDate = {};
      if (startDate) {
        where.eventDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.eventDate.lte = new Date(endDate);
      }
    }

    // Fetch events
    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { eventDate: 'asc' },
        include: {
          document: {
            select: {
              id: true,
              title: true,
              category: true,
            },
          },
          reminders: true,
          _count: {
            select: {
              tasks: true,
            },
          },
        },
      }),
      prisma.event.count({ where }),
    ]);

    return successResponse(events, {
      page,
      limit,
      total,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const tokenPayload = await getUserFromRequest(request);
    if (!tokenPayload) {
      return ApiErrors.unauthorized();
    }

    const body = await request.json();

    // Validate required fields
    validateRequiredFields(body, [
      'documentId',
      'eventType',
      'title',
      'eventDate',
      'priority',
    ]);

    // Verify document belongs to user
    const document = await prisma.document.findFirst({
      where: {
        id: body.documentId,
        userId: tokenPayload.userId,
      },
    });

    if (!document) {
      return ApiErrors.notFound('Document');
    }

    // Create event
    const event = await prisma.event.create({
      data: {
        userId: tokenPayload.userId,
        documentId: body.documentId,
        eventType: body.eventType,
        title: body.title,
        description: body.description || '',
        eventDate: new Date(body.eventDate),
        priority: body.priority,
        isRecurring: body.isRecurring || false,
        recurrencePattern: body.recurrencePattern || null,
        responsibleParty: body.responsibleParty || null,
        consequence: body.consequence || null,
        advanceNoticeDays: body.advanceNoticeDays || null,
        status: body.status || 'upcoming',
      },
      include: {
        document: true,
      },
    });

    // Create default reminders if specified
    if (body.reminderDays && Array.isArray(body.reminderDays)) {
      await prisma.reminder.createMany({
        data: body.reminderDays.map((days: number) => ({
          eventId: event.id,
          daysBefore: days,
        })),
      });
    }

    return createdResponse(event);
  } catch (error) {
    return handleApiError(error);
  }
}
