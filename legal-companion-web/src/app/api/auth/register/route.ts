/**
 * POST /api/auth/register
 * User registration endpoint
 */

import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import {
  successResponse,
  ApiErrors,
  handleApiError,
  createdResponse,
} from '@/lib/api-response';
import { hashPassword, generateAuthTokens, sanitizeUser } from '@/lib/api-auth';
import { validateRegistration } from '@/lib/api-validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    validateRegistration(body);

    const { email, password, fullName, location } = body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return ApiErrors.conflict('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        location: location || null,
      },
    });

    // Create default user preferences
    await prisma.userPreferences.create({
      data: {
        userId: user.id,
        country: 'India',
        region: 'Tamil Nadu',
        language: 'en',
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        aiAssistance: 'moderate',
        defaultReminderDays: [1, 3, 7],
      },
    });

    // Generate tokens
    const tokens = await generateAuthTokens(user);

    return createdResponse({
      user: sanitizeUser(user),
      ...tokens,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
