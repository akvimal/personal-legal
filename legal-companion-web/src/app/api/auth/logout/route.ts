/**
 * POST /api/auth/logout
 * User logout endpoint
 * Note: In JWT-based auth, logout is handled client-side by removing the token
 * This endpoint is provided for consistency and can be extended for token blacklisting
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors, handleApiError } from '@/lib/api-response';
import { getUserFromRequest } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const tokenPayload = await getUserFromRequest(request);

    if (!tokenPayload) {
      return ApiErrors.unauthorized();
    }

    // TODO: Implement token blacklisting if needed
    // For now, client will remove the token

    return successResponse({
      message: 'Logged out successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
