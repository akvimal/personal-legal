/**
 * Calendar Sync Service
 * Handles two-way synchronization between app events and external calendars
 */

import prisma from './prisma';
import { listEvents as listGoogleEvents, createEvent, updateEvent, deleteEvent } from './google-calendar';
import { decryptToken } from './google-oauth';
import { emitToUser } from './socket-server';

export interface SyncProgress {
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
  status: string;
}

export interface SyncResult {
  success: boolean;
  eventsProcessed: number;
  eventsSucceeded: number;
  eventsFailed: number;
  errors: string[];
}

/**
 * Sync app events to Google Calendar (one-way: app → calendar)
 */
export async function syncEventsToCalendar(
  connectionId: string,
  onProgress?: (progress: SyncProgress) => void
): Promise<SyncResult> {
  const connection = await prisma.calendarConnection.findUnique({
    where: { id: connectionId },
    include: {
      user: true,
    },
  });

  if (!connection) {
    throw new Error('Calendar connection not found');
  }

  // Update status to syncing
  await prisma.calendarConnection.update({
    where: { id: connectionId },
    data: { status: 'syncing' },
  });

  // Get all unsync events for the user
  const userEvents = await prisma.event.findMany({
    where: {
      userId: connection.userId,
      status: 'upcoming',
      calendarSync: null, // Not yet synced
    },
    take: 100, // Limit for initial sync
  });

  const errors: string[] = [];
  let succeeded = 0;
  let failed = 0;

  // Decrypt tokens
  const accessToken = connection.accessToken
    ? decryptToken(connection.accessToken)
    : null;
  const refreshToken = connection.refreshToken
    ? decryptToken(connection.refreshToken)
    : null;

  if (!accessToken) {
    throw new Error('Access token not found');
  }

  for (let i = 0; i < userEvents.length; i++) {
    const event = userEvents[i];

    try {
      // Report progress
      onProgress?.({
        total: userEvents.length,
        processed: i + 1,
        succeeded,
        failed,
        status: `Syncing event: ${event.title}`,
      });

      // Emit progress via WebSocket
      emitToUser(connection.userId, 'sync:progress', {
        connectionId,
        progress: Math.round(((i + 1) / userEvents.length) * 100),
        status: `Syncing event: ${event.title}`,
      });

      // Create event in Google Calendar
      const calendarEvent = await createEvent(
        connection.calendarId,
        {
          summary: event.title,
          description: event.description,
          start: {
            dateTime: event.eventDate.toISOString(),
            timeZone: connection.timeZone,
          },
          end: {
            dateTime: new Date(event.eventDate.getTime() + 60 * 60 * 1000).toISOString(), // 1 hour duration
            timeZone: connection.timeZone,
          },
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'popup', minutes: 1440 }, // 1 day before
            ],
          },
        },
        accessToken,
        refreshToken || undefined
      );

      // Create sync record
      await prisma.calendarSyncedEvent.create({
        data: {
          connectionId,
          eventId: event.id,
          externalEventId: calendarEvent.id,
          syncStatus: 'synced',
          lastSyncAt: new Date(),
          syncDirection: 'app_to_calendar',
        },
      });

      succeeded++;
    } catch (error) {
      console.error(`Failed to sync event ${event.id}:`, error);
      errors.push(`Failed to sync "${event.title}": ${error}`);
      failed++;

      // Create error sync record
      try {
        await prisma.calendarSyncedEvent.create({
          data: {
            connectionId,
            eventId: event.id,
            syncStatus: 'error',
            errorMessage: error instanceof Error ? error.message : String(error),
            syncDirection: 'app_to_calendar',
          },
        });
      } catch (dbError) {
        console.error('Failed to create error sync record:', dbError);
      }
    }
  }

  // Update connection status and stats
  await prisma.calendarConnection.update({
    where: { id: connectionId },
    data: {
      status: failed === 0 ? 'connected' : 'error',
      lastSync: new Date(),
    },
  });

  // Emit completion
  emitToUser(connection.userId, 'sync:completed', {
    connectionId,
    success: failed === 0,
    filesProcessed: userEvents.length,
  });

  return {
    success: failed === 0,
    eventsProcessed: userEvents.length,
    eventsSucceeded: succeeded,
    eventsFailed: failed,
    errors,
  };
}

/**
 * Sync calendar events to app (one-way: calendar → app)
 */
export async function syncEventsFromCalendar(
  connectionId: string
): Promise<SyncResult> {
  const connection = await prisma.calendarConnection.findUnique({
    where: { id: connectionId },
  });

  if (!connection) {
    throw new Error('Calendar connection not found');
  }

  // Decrypt tokens
  const accessToken = connection.accessToken
    ? decryptToken(connection.accessToken)
    : null;
  const refreshToken = connection.refreshToken
    ? decryptToken(connection.refreshToken)
    : null;

  if (!accessToken) {
    throw new Error('Access token not found');
  }

  // Get events from calendar
  const { events: calendarEvents } = await listGoogleEvents(
    connection.calendarId,
    accessToken,
    {
      timeMin: new Date(), // Only future events
      maxResults: 100,
      singleEvents: true,
    },
    refreshToken || undefined
  );

  const errors: string[] = [];
  let succeeded = 0;
  let failed = 0;

  for (const calendarEvent of calendarEvents) {
    try {
      // Check if event already exists
      const existingSync = await prisma.calendarSyncedEvent.findFirst({
        where: {
          connectionId,
          externalEventId: calendarEvent.id,
        },
        include: {
          event: true,
        },
      });

      if (existingSync) {
        // Update existing event
        await prisma.event.update({
          where: { id: existingSync.eventId },
          data: {
            title: calendarEvent.summary,
            description: calendarEvent.description || '',
            eventDate: new Date(
              calendarEvent.start.dateTime || calendarEvent.start.date || ''
            ),
          },
        });

        await prisma.calendarSyncedEvent.update({
          where: { id: existingSync.id },
          data: {
            lastSyncAt: new Date(),
            syncStatus: 'synced',
          },
        });
      } else {
        // Create new event in app
        // Note: We need a documentId, so we create a placeholder or skip
        // For now, we'll skip creating events from calendar if no document exists
        console.log(`Skipping event creation for ${calendarEvent.summary} - no associated document`);
      }

      succeeded++;
    } catch (error) {
      console.error(`Failed to sync calendar event ${calendarEvent.id}:`, error);
      errors.push(`Failed to sync "${calendarEvent.summary}": ${error}`);
      failed++;
    }
  }

  await prisma.calendarConnection.update({
    where: { id: connectionId },
    data: {
      lastSync: new Date(),
    },
  });

  return {
    success: failed === 0,
    eventsProcessed: calendarEvents.length,
    eventsSucceeded: succeeded,
    eventsFailed: failed,
    errors,
  };
}

/**
 * Bidirectional sync
 */
export async function syncCalendarBidirectional(
  connectionId: string,
  onProgress?: (progress: SyncProgress) => void
): Promise<SyncResult> {
  // First sync app → calendar
  const toCalendarResult = await syncEventsToCalendar(connectionId, onProgress);

  // Then sync calendar → app
  const fromCalendarResult = await syncEventsFromCalendar(connectionId);

  return {
    success: toCalendarResult.success && fromCalendarResult.success,
    eventsProcessed:
      toCalendarResult.eventsProcessed + fromCalendarResult.eventsProcessed,
    eventsSucceeded:
      toCalendarResult.eventsSucceeded + fromCalendarResult.eventsSucceeded,
    eventsFailed:
      toCalendarResult.eventsFailed + fromCalendarResult.eventsFailed,
    errors: [...toCalendarResult.errors, ...fromCalendarResult.errors],
  };
}

/**
 * Handle event update and sync to calendar
 */
export async function syncEventUpdate(eventId: string): Promise<void> {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      calendarSync: {
        include: {
          connection: true,
        },
      },
    },
  });

  if (!event || !event.calendarSync) {
    return; // Event not synced to any calendar
  }

  const { connection } = event.calendarSync;

  // Decrypt tokens
  const accessToken = connection.accessToken
    ? decryptToken(connection.accessToken)
    : null;
  const refreshToken = connection.refreshToken
    ? decryptToken(connection.refreshToken)
    : null;

  if (!accessToken || !event.calendarSync.externalEventId) {
    return;
  }

  try {
    // Update event in Google Calendar
    await updateEvent(
      connection.calendarId,
      event.calendarSync.externalEventId,
      {
        summary: event.title,
        description: event.description,
        start: {
          dateTime: event.eventDate.toISOString(),
          timeZone: connection.timeZone,
        },
        end: {
          dateTime: new Date(event.eventDate.getTime() + 60 * 60 * 1000).toISOString(),
          timeZone: connection.timeZone,
        },
      },
      accessToken,
      refreshToken || undefined
    );

    // Update sync record
    await prisma.calendarSyncedEvent.update({
      where: { id: event.calendarSync.id },
      data: {
        lastSyncAt: new Date(),
        syncStatus: 'synced',
      },
    });

    console.log(`Event ${eventId} synced to calendar`);
  } catch (error) {
    console.error(`Failed to sync event update ${eventId}:`, error);

    // Update sync record with error
    await prisma.calendarSyncedEvent.update({
      where: { id: event.calendarSync.id },
      data: {
        syncStatus: 'error',
        errorMessage: error instanceof Error ? error.message : String(error),
      },
    });
  }
}

/**
 * Handle event deletion and remove from calendar
 */
export async function syncEventDeletion(eventId: string): Promise<void> {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      calendarSync: {
        include: {
          connection: true,
        },
      },
    },
  });

  if (!event || !event.calendarSync) {
    return; // Event not synced
  }

  const { connection } = event.calendarSync;

  // Decrypt tokens
  const accessToken = connection.accessToken
    ? decryptToken(connection.accessToken)
    : null;
  const refreshToken = connection.refreshToken
    ? decryptToken(connection.refreshToken)
    : null;

  if (!accessToken || !event.calendarSync.externalEventId) {
    return;
  }

  try {
    // Delete event from Google Calendar
    await deleteEvent(
      connection.calendarId,
      event.calendarSync.externalEventId,
      accessToken,
      refreshToken || undefined
    );

    console.log(`Event ${eventId} deleted from calendar`);
  } catch (error) {
    console.error(`Failed to delete event from calendar ${eventId}:`, error);
  }
}
