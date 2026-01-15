/**
 * POST /api/auth/login
 * User login endpoint
 */

import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, ApiErrors, handleApiError } from '@/lib/api-response';
import { verifyPassword, generateAuthTokens, sanitizeUser } from '@/lib/api-auth';
import { validateRequiredFields } from '@/lib/api-validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    validateRequiredFields(body, ['email', 'password']);

    const { email, password } = body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return ApiErrors.unauthorized('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return ApiErrors.unauthorized('Invalid email or password');
    }

    // Generate tokens
    const tokens = await generateAuthTokens(user);

    return successResponse({
      user: sanitizeUser(user),
      ...tokens,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
