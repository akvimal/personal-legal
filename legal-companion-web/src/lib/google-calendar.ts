/**
 * Google Calendar API Service
 * Interacts with Google Calendar API for event management
 */

import { refreshAccessTokenIfNeeded } from './google-oauth';

const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';

export interface GoogleCalendar {
  id: string;
  summary: string;
  description?: string;
  timeZone: string;
  primary: boolean;
}

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  location?: string;
  status: string;
  recurrence?: string[];
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: string;
      minutes: number;
    }>;
  };
  created: string;
  updated: string;
}

export interface CreateEventData {
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  location?: string;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: 'email' | 'popup';
      minutes: number;
    }>;
  };
}

/**
 * List user's calendars
 */
export async function listCalendars(
  accessToken: string,
  refreshToken?: string
): Promise<GoogleCalendar[]> {
  // Refresh token if needed
  const validToken = await refreshAccessTokenIfNeeded(accessToken, refreshToken);

  const response = await fetch(`${CALENDAR_API_BASE}/users/me/calendarList`, {
    headers: {
      Authorization: `Bearer ${validToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to list calendars: ${error}`);
  }

  const data = await response.json();
  return data.items || [];
}

/**
 * Get calendar details
 */
export async function getCalendar(
  calendarId: string,
  accessToken: string,
  refreshToken?: string
): Promise<GoogleCalendar> {
  const validToken = await refreshAccessTokenIfNeeded(accessToken, refreshToken);

  const response = await fetch(`${CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}`, {
    headers: {
      Authorization: `Bearer ${validToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get calendar: ${error}`);
  }

  return await response.json();
}

/**
 * List events from a calendar
 */
export async function listEvents(
  calendarId: string,
  accessToken: string,
  options: {
    timeMin?: Date;
    timeMax?: Date;
    maxResults?: number;
    pageToken?: string;
    showDeleted?: boolean;
    singleEvents?: boolean;
  } = {},
  refreshToken?: string
): Promise<{ events: GoogleCalendarEvent[]; nextPageToken?: string }> {
  const validToken = await refreshAccessTokenIfNeeded(accessToken, refreshToken);

  const params = new URLSearchParams({
    ...(options.timeMin && { timeMin: options.timeMin.toISOString() }),
    ...(options.timeMax && { timeMax: options.timeMax.toISOString() }),
    ...(options.maxResults && { maxResults: options.maxResults.toString() }),
    ...(options.pageToken && { pageToken: options.pageToken }),
    ...(options.showDeleted !== undefined && { showDeleted: options.showDeleted.toString() }),
    ...(options.singleEvents !== undefined && { singleEvents: options.singleEvents.toString() }),
  });

  const response = await fetch(
    `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
    {
      headers: {
        Authorization: `Bearer ${validToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to list events: ${error}`);
  }

  const data = await response.json();
  return {
    events: data.items || [],
    nextPageToken: data.nextPageToken,
  };
}

/**
 * Get a specific event
 */
export async function getEvent(
  calendarId: string,
  eventId: string,
  accessToken: string,
  refreshToken?: string
): Promise<GoogleCalendarEvent> {
  const validToken = await refreshAccessTokenIfNeeded(accessToken, refreshToken);

  const response = await fetch(
    `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(
      eventId
    )}`,
    {
      headers: {
        Authorization: `Bearer ${validToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get event: ${error}`);
  }

  return await response.json();
}

/**
 * Create a calendar event
 */
export async function createEvent(
  calendarId: string,
  eventData: CreateEventData,
  accessToken: string,
  refreshToken?: string
): Promise<GoogleCalendarEvent> {
  const validToken = await refreshAccessTokenIfNeeded(accessToken, refreshToken);

  const response = await fetch(
    `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${validToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create event: ${error}`);
  }

  return await response.json();
}

/**
 * Update a calendar event
 */
export async function updateEvent(
  calendarId: string,
  eventId: string,
  eventData: Partial<CreateEventData>,
  accessToken: string,
  refreshToken?: string
): Promise<GoogleCalendarEvent> {
  const validToken = await refreshAccessTokenIfNeeded(accessToken, refreshToken);

  const response = await fetch(
    `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(
      eventId
    )}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${validToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update event: ${error}`);
  }

  return await response.json();
}

/**
 * Delete a calendar event
 */
export async function deleteEvent(
  calendarId: string,
  eventId: string,
  accessToken: string,
  refreshToken?: string
): Promise<void> {
  const validToken = await refreshAccessTokenIfNeeded(accessToken, refreshToken);

  const response = await fetch(
    `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(
      eventId
    )}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${validToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to delete event: ${error}`);
  }
}

/**
 * Watch calendar for changes (webhook)
 */
export async function watchCalendar(
  calendarId: string,
  webhookUrl: string,
  accessToken: string,
  refreshToken?: string
): Promise<{ id: string; resourceId: string; expiration: string }> {
  const validToken = await refreshAccessTokenIfNeeded(accessToken, refreshToken);

  const response = await fetch(
    `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events/watch`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${validToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: `calendar-watch-${Date.now()}`,
        type: 'web_hook',
        address: webhookUrl,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to watch calendar: ${error}`);
  }

  const data = await response.json();
  return {
    id: data.id,
    resourceId: data.resourceId,
    expiration: data.expiration,
  };
}

/**
 * Stop watching calendar
 */
export async function stopWatching(
  channelId: string,
  resourceId: string,
  accessToken: string,
  refreshToken?: string
): Promise<void> {
  const validToken = await refreshAccessTokenIfNeeded(accessToken, refreshToken);

  const response = await fetch(`${CALENDAR_API_BASE}/channels/stop`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${validToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: channelId,
      resourceId: resourceId,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to stop watching: ${error}`);
  }
}
