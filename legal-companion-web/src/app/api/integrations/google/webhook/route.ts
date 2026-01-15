/**
 * POST /api/integrations/google/webhook - Google Drive webhook handler
 * Handles Google Drive push notifications for file changes
 */

import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { syncSingleFile } from '@/lib/google-drive-sync';

export async function POST(request: NextRequest) {
  try {
    // Get webhook headers
    const channelId = request.headers.get('x-goog-channel-id');
    const resourceState = request.headers.get('x-goog-resource-state');
    const resourceId = request.headers.get('x-goog-resource-id');

    console.log('Webhook received:', {
      channelId,
      resourceState,
      resourceId,
    });

    // Validate webhook
    if (!channelId || !resourceState) {
      return NextResponse.json(
        { error: 'Invalid webhook request' },
        { status: 400 }
      );
    }

    // Handle different resource states
    if (resourceState === 'sync') {
      // Initial sync notification - acknowledge
      return NextResponse.json({ status: 'ok' });
    }

    if (resourceState === 'update' || resourceState === 'add') {
      // File was updated or added - trigger sync
      // In production, add to job queue instead of processing immediately

      // For now, just log and return success
      console.log('File change detected, would trigger sync here');

      // TODO: Implement actual sync trigger
      // const connection = await prisma.driveConnection.findFirst({
      //   where: { /* match by channel ID or resource ID */ }
      // });
      // if (connection) {
      //   await syncDriveFiles(connection.id);
      // }

      return NextResponse.json({ status: 'ok' });
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/integrations/google/webhook - Webhook verification
 * Google may send GET requests to verify the webhook URL
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({ status: 'ok' });
}
