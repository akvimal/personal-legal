/**
 * GET /api/integrations/email/connect - Start email OAuth flow
 * Redirects user to Google authentication for Gmail access
 */

import { NextRequest, NextResponse } from 'next/server';
import { ApiErrors } from '@/lib/api-response';
import { getUserFromRequest } from '@/lib/api-auth';
import { getEmailAuthorizationUrl, isEmailOAuthConfigured } from '@/lib/email-oauth';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const tokenPayload = await getUserFromRequest(request);
    if (!tokenPayload) {
      return ApiErrors.unauthorized();
    }

    // Check if email OAuth is configured
    if (!isEmailOAuthConfigured()) {
      return ApiErrors.serviceUnavailable(
        'Email integration is not configured. Please set up OAuth credentials.'
      );
    }

    // Generate authorization URL with user ID as state
    const authUrl = getEmailAuthorizationUrl(tokenPayload.userId);

    // Redirect to Google OAuth page
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Email OAuth error:', error);
    return ApiErrors.internalError('Failed to start email OAuth flow');
  }
}
