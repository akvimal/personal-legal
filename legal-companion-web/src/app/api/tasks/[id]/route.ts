/**
 * GET /api/tasks/[id] - Get task by ID
 * PUT /api/tasks/[id] - Update task
 * DELETE /api/tasks/[id] - Delete task
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

    // Fetch task with relations
    const task = await prisma.task.findFirst({
      where: {
        id,
        userId: tokenPayload.userId,
      },
      include: {
        document: true,
        event: true,
      },
    });

    if (!task) {
      return ApiErrors.notFound('Task');
    }

    return successResponse(task);
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

    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        userId: tokenPayload.userId,
      },
    });

    if (!existingTask) {
      return ApiErrors.notFound('Task');
    }

    // Update task
    const task = await prisma.task.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        priority: body.priority,
        status: body.status,
        completedAt:
          body.status === 'completed' && !existingTask.completedAt
            ? new Date()
            : existingTask.completedAt,
      },
      include: {
        document: true,
        event: true,
      },
    });

    return successResponse(task);
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

    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        userId: tokenPayload.userId,
      },
    });

    if (!existingTask) {
      return ApiErrors.notFound('Task');
    }

    // Delete task
    await prisma.task.delete({
      where: { id },
    });

    return successResponse({
      message: 'Task deleted successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
