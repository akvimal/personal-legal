/**
 * POST /api/auth/refresh
 * Refresh access token endpoint
 */

import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, ApiErrors, handleApiError } from '@/lib/api-response';
import { verifyToken, generateAccessToken, sanitizeUser } from '@/lib/api-auth';
import { validateRequiredFields } from '@/lib/api-validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    validateRequiredFields(body, ['refreshToken']);

    const { refreshToken } = body;

    // Verify refresh token
    const tokenPayload = await verifyToken(refreshToken);

    if (!tokenPayload) {
      return ApiErrors.unauthorized('Invalid or expired refresh token');
    }

    // Fetch user
    const user = await prisma.user.findUnique({
      where: { id: tokenPayload.userId },
    });

    if (!user) {
      return ApiErrors.notFound('User');
    }

    // Generate new access token
    const accessToken = await generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    return successResponse({
      user: sanitizeUser(user),
      accessToken,
      expiresIn: '7d',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
