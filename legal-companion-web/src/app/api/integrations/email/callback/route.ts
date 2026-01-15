/**
 * GET /api/integrations/email/callback - Email OAuth callback
 * Handles OAuth response and stores tokens
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ApiErrors } from '@/lib/api-response';
import {
  exchangeEmailCodeForTokens,
  encryptEmailToken,
} from '@/lib/email-oauth';
import { getProfile } from '@/lib/gmail-service';

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
    const tokens = await exchangeEmailCodeForTokens(code);

    // Get Gmail profile
    const profile = await getProfile(tokens.access_token);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: state },
    });

    if (!user) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/integrations?error=user_not_found`
      );
    }

    // Encrypt tokens
    const encryptedAccessToken = encryptEmailToken(tokens.access_token);
    const encryptedRefreshToken = tokens.refresh_token
      ? encryptEmailToken(tokens.refresh_token)
      : null;

    // Check if connection already exists
    let connection = await prisma.emailConnection.findFirst({
      where: {
        userId: state,
        emailAddress: profile.emailAddress,
      },
    });

    if (connection) {
      // Update existing connection
      connection = await prisma.emailConnection.update({
        where: { id: connection.id },
        data: {
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken,
          tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
          status: 'connected',
        },
      });
    } else {
      // Create new connection
      connection = await prisma.emailConnection.create({
        data: {
          userId: state,
          provider: 'gmail',
          emailAddress: profile.emailAddress,
          status: 'connected',
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken,
          tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
          autoMonitor: true,
          monitorFrequency: 'realtime',
        },
      });
    }

    // Redirect to integrations page with success
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/integrations?success=email_connected&connectionId=${connection.id}`
    );
  } catch (error) {
    console.error('Email callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/integrations?error=callback_failed`
    );
  }
}
