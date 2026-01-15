/**
 * GET /api/integrations/google/callback - Google OAuth callback
 * Handles OAuth response and stores tokens
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ApiErrors } from '@/lib/api-response';
import {
  exchangeCodeForTokens,
  getUserInfo,
  encryptToken,
} from '@/lib/google-oauth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // userId
    const error = searchParams.get('error');

    // Handle OAuth error
    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/integrations?error=${error}`
      );
    }

    // Validate code and state
    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/integrations?error=missing_parameters`
      );
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);

    // Get user info from Google
    const googleUser = await getUserInfo(tokens.access_token);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: state },
    });

    if (!user) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/integrations?error=user_not_found`
      );
    }

    // Encrypt tokens before storing
    const encryptedAccessToken = encryptToken(tokens.access_token);
    const encryptedRefreshToken = tokens.refresh_token
      ? encryptToken(tokens.refresh_token)
      : null;

    // Check if connection already exists
    let connection = await prisma.driveConnection.findFirst({
      where: {
        userId: state,
        googleAccountEmail: googleUser.email,
      },
    });

    if (connection) {
      // Update existing connection
      connection = await prisma.driveConnection.update({
        where: { id: connection.id },
        data: {
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken,
          tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
          status: 'pending_setup', // User needs to select folder
        },
      });
    } else {
      // Create new connection
      connection = await prisma.driveConnection.create({
        data: {
          userId: state,
          googleAccountEmail: googleUser.email,
          status: 'pending_setup',
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken,
          tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
          // Temporary values - will be set during folder selection
          folderId: 'root',
          folderName: 'My Drive',
          folderPath: '/My Drive',
          fileTypes: ['pdf', 'doc', 'docx', 'jpg', 'png'],
        },
      });
    }

    // Redirect to integrations page with success
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/integrations?success=true&connectionId=${connection.id}`
    );
  } catch (error) {
    console.error('Google callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/integrations?error=callback_failed`
    );
  }
}
