/**
 * GET /api/tasks - List tasks with pagination and filters
 * POST /api/tasks - Create new task
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

    // Document filter
    const documentId = searchParams.get('documentId');
    if (documentId) {
      where.documentId = documentId;
    }

    // Event filter
    const eventId = searchParams.get('eventId');
    if (eventId) {
      where.eventId = eventId;
    }

    // Overdue filter
    const overdue = searchParams.get('overdue');
    if (overdue === 'true') {
      where.dueDate = {
        lt: new Date(),
      };
      where.status = {
        not: 'completed',
      };
    }

    // Fetch tasks
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ status: 'asc' }, { priority: 'desc' }, { dueDate: 'asc' }],
        include: {
          document: {
            select: {
              id: true,
              title: true,
              category: true,
            },
          },
          event: {
            select: {
              id: true,
              title: true,
              eventDate: true,
            },
          },
        },
      }),
      prisma.task.count({ where }),
    ]);

    return successResponse(tasks, {
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
    validateRequiredFields(body, ['title', 'priority']);

    // Verify document belongs to user if specified
    if (body.documentId) {
      const document = await prisma.document.findFirst({
        where: {
          id: body.documentId,
          userId: tokenPayload.userId,
        },
      });

      if (!document) {
        return ApiErrors.notFound('Document');
      }
    }

    // Verify event belongs to user if specified
    if (body.eventId) {
      const event = await prisma.event.findFirst({
        where: {
          id: body.eventId,
          userId: tokenPayload.userId,
        },
      });

      if (!event) {
        return ApiErrors.notFound('Event');
      }
    }

    // Create task
    const task = await prisma.task.create({
      data: {
        userId: tokenPayload.userId,
        documentId: body.documentId || null,
        eventId: body.eventId || null,
        title: body.title,
        description: body.description || null,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        priority: body.priority,
        status: body.status || 'pending',
      },
      include: {
        document: true,
        event: true,
      },
    });

    return createdResponse(task);
  } catch (error) {
    return handleApiError(error);
  }
}
