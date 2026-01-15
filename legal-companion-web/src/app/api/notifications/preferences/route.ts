/**
 * GET /api/notifications/preferences - Get notification preferences
 * PUT /api/notifications/preferences - Update notification preferences
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors, handleApiError } from '@/lib/api-response';
import { getUserFromRequest } from '@/lib/api-auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const tokenPayload = await getUserFromRequest(request);
    if (!tokenPayload) {
      return ApiErrors.unauthorized();
    }

    // Get or create preferences
    let preferences = await prisma.userPreferences.findUnique({
      where: { userId: tokenPayload.userId },
    });

    if (!preferences) {
      preferences = await prisma.userPreferences.create({
        data: {
          userId: tokenPayload.userId,
        },
      });
    }

    return successResponse({ preferences });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Authenticate user
    const tokenPayload = await getUserFromRequest(request);
    if (!tokenPayload) {
      return ApiErrors.unauthorized();
    }

    const body = await request.json();

    // Update preferences
    const preferences = await prisma.userPreferences.upsert({
      where: { userId: tokenPayload.userId },
      update: {
        emailNotifications: body.emailNotifications,
        pushNotifications: body.pushNotifications,
        smsNotifications: body.smsNotifications,
        quietHoursStart: body.quietHoursStart,
        quietHoursEnd: body.quietHoursEnd,
      },
      create: {
        userId: tokenPayload.userId,
        emailNotifications: body.emailNotifications ?? true,
        pushNotifications: body.pushNotifications ?? true,
        smsNotifications: body.smsNotifications ?? false,
        quietHoursStart: body.quietHoursStart,
        quietHoursEnd: body.quietHoursEnd,
      },
    });

    return successResponse({ preferences });
  } catch (error) {
    return handleApiError(error);
  }
}
