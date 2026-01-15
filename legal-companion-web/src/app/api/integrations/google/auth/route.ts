/**
 * GET /api/integrations/google/auth - Start Google OAuth flow
 * Redirects user to Google authentication page
 */

import { NextRequest, NextResponse } from 'next/server';
import { ApiErrors } from '@/lib/api-response';
import { getUserFromRequest } from '@/lib/api-auth';
import { getAuthorizationUrl, isGoogleOAuthConfigured } from '@/lib/google-oauth';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const tokenPayload = await getUserFromRequest(request);
    if (!tokenPayload) {
      return ApiErrors.unauthorized();
    }

    // Check if Google OAuth is configured
    if (!isGoogleOAuthConfigured()) {
      return ApiErrors.serviceUnavailable(
        'Google Drive integration is not configured. Please set up OAuth credentials.'
      );
    }

    // Generate authorization URL with user ID as state
    const authUrl = getAuthorizationUrl(tokenPayload.userId);

    // Redirect to Google OAuth page
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Google auth error:', error);
    return ApiErrors.internalError('Failed to start Google OAuth flow');
  }
}
