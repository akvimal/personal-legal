/**
 * GET /api/auth/me
 * Get current user endpoint
 */

import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, ApiErrors, handleApiError } from '@/lib/api-response';
import { getUserFromRequest, sanitizeUser } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    // Get user from token
    const tokenPayload = await getUserFromRequest(request);

    if (!tokenPayload) {
      return ApiErrors.unauthorized();
    }

    // Fetch user with preferences
    const user = await prisma.user.findUnique({
      where: { id: tokenPayload.userId },
      include: {
        preferences: true,
      },
    });

    if (!user) {
      return ApiErrors.notFound('User');
    }

    return successResponse({
      user: sanitizeUser(user),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
