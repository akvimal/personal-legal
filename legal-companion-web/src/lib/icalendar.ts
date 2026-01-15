/**
 * iCalendar (.ics) Export/Import Utilities
 * Generate and parse iCalendar format for event export/import
 */

import { Event } from '@/generated/prisma';

interface ICalEvent {
  uid: string;
  summary: string;
  description?: string;
  dtstart: Date;
  dtend: Date;
  created: Date;
  lastModified: Date;
  status: string;
  priority?: number;
  location?: string;
}

/**
 * Format date for iCalendar (YYYYMMDDTHHmmssZ)
 */
function formatICalDate(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    date.getUTCFullYear().toString() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    'Z'
  );
}

/**
 * Parse iCalendar date (YYYYMMDDTHHmmssZ or YYYYMMDD)
 */
function parseICalDate(dateStr: string): Date {
  // Handle date-only format (YYYYMMDD)
  if (dateStr.length === 8) {
    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6)) - 1;
    const day = parseInt(dateStr.substring(6, 8));
    return new Date(Date.UTC(year, month, day));
  }

  // Handle date-time format (YYYYMMDDTHHmmssZ)
  const year = parseInt(dateStr.substring(0, 4));
  const month = parseInt(dateStr.substring(4, 6)) - 1;
  const day = parseInt(dateStr.substring(6, 8));
  const hour = parseInt(dateStr.substring(9, 11));
  const minute = parseInt(dateStr.substring(11, 13));
  const second = parseInt(dateStr.substring(13, 15));

  return new Date(Date.UTC(year, month, day, hour, minute, second));
}

/**
 * Escape special characters in iCalendar text
 */
function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Unescape iCalendar text
 */
function unescapeICalText(text: string): string {
  return text
    .replace(/\\n/g, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\');
}

/**
 * Fold long lines (max 75 characters per line)
 */
function foldLine(line: string): string {
  if (line.length <= 75) {
    return line;
  }

  const lines: string[] = [];
  let remaining = line;

  while (remaining.length > 75) {
    lines.push(remaining.substring(0, 75));
    remaining = ' ' + remaining.substring(75); // Continuation lines start with space
  }

  if (remaining.length > 0) {
    lines.push(remaining);
  }

  return lines.join('\r\n');
}

/**
 * Export single event to iCalendar format
 */
export function exportEventToICal(event: Event): string {
  const lines: string[] = [];

  lines.push('BEGIN:VCALENDAR');
  lines.push('VERSION:2.0');
  lines.push('PRODID:-//Personal Legal Companion//EN');
  lines.push('CALSCALE:GREGORIAN');
  lines.push('METHOD:PUBLISH');
  lines.push('BEGIN:VEVENT');

  // UID (unique identifier)
  lines.push(`UID:${event.id}@personal-legal-companion`);

  // Summary (title)
  lines.push(`SUMMARY:${escapeICalText(event.title)}`);

  // Description
  if (event.description) {
    lines.push(`DESCRIPTION:${escapeICalText(event.description)}`);
  }

  // Start time
  lines.push(`DTSTART:${formatICalDate(event.eventDate)}`);

  // End time (assume 1 hour duration)
  const endDate = new Date(event.eventDate.getTime() + 60 * 60 * 1000);
  lines.push(`DTEND:${formatICalDate(endDate)}`);

  // Created time
  lines.push(`DTSTAMP:${formatICalDate(event.createdAt)}`);
  lines.push(`CREATED:${formatICalDate(event.createdAt)}`);

  // Last modified
  lines.push(`LAST-MODIFIED:${formatICalDate(event.updatedAt)}`);

  // Status
  const status = event.status === 'completed' ? 'CONFIRMED' : 'TENTATIVE';
  lines.push(`STATUS:${status}`);

  // Priority (map from our priority to iCal priority 1-9, where 1=high)
  const priorityMap: Record<string, number> = {
    critical: 1,
    high: 3,
    medium: 5,
    low: 7,
  };
  lines.push(`PRIORITY:${priorityMap[event.priority] || 5}`);

  // Categories (event type)
  lines.push(`CATEGORIES:${event.eventType.replace(/_/g, ' ').toUpperCase()}`);

  lines.push('END:VEVENT');
  lines.push('END:VCALENDAR');

  // Fold long lines and join with CRLF
  return lines.map(foldLine).join('\r\n');
}

/**
 * Export multiple events to iCalendar format
 */
export function exportEventsToICal(events: Event[]): string {
  const lines: string[] = [];

  lines.push('BEGIN:VCALENDAR');
  lines.push('VERSION:2.0');
  lines.push('PRODID:-//Personal Legal Companion//EN');
  lines.push('CALSCALE:GREGORIAN');
  lines.push('METHOD:PUBLISH');

  for (const event of events) {
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${event.id}@personal-legal-companion`);
    lines.push(`SUMMARY:${escapeICalText(event.title)}`);

    if (event.description) {
      lines.push(`DESCRIPTION:${escapeICalText(event.description)}`);
    }

    lines.push(`DTSTART:${formatICalDate(event.eventDate)}`);

    const endDate = new Date(event.eventDate.getTime() + 60 * 60 * 1000);
    lines.push(`DTEND:${formatICalDate(endDate)}`);

    lines.push(`DTSTAMP:${formatICalDate(event.createdAt)}`);
    lines.push(`CREATED:${formatICalDate(event.createdAt)}`);
    lines.push(`LAST-MODIFIED:${formatICalDate(event.updatedAt)}`);

    const status = event.status === 'completed' ? 'CONFIRMED' : 'TENTATIVE';
    lines.push(`STATUS:${status}`);

    const priorityMap: Record<string, number> = {
      critical: 1,
      high: 3,
      medium: 5,
      low: 7,
    };
    lines.push(`PRIORITY:${priorityMap[event.priority] || 5}`);

    lines.push(`CATEGORIES:${event.eventType.replace(/_/g, ' ').toUpperCase()}`);
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');

  return lines.map(foldLine).join('\r\n');
}

/**
 * Parse iCalendar content and extract events
 */
export function parseICalendar(icalContent: string): ICalEvent[] {
  const events: ICalEvent[] = [];
  const lines = icalContent.split(/\r?\n/);

  // Unfold lines (lines starting with space are continuations)
  const unfoldedLines: string[] = [];
  let currentLine = '';

  for (const line of lines) {
    if (line.startsWith(' ') || line.startsWith('\t')) {
      currentLine += line.substring(1);
    } else {
      if (currentLine) {
        unfoldedLines.push(currentLine);
      }
      currentLine = line;
    }
  }
  if (currentLine) {
    unfoldedLines.push(currentLine);
  }

  // Parse events
  let inEvent = false;
  let currentEvent: Partial<ICalEvent> = {};

  for (const line of unfoldedLines) {
    const trimmedLine = line.trim();

    if (trimmedLine === 'BEGIN:VEVENT') {
      inEvent = true;
      currentEvent = {};
      continue;
    }

    if (trimmedLine === 'END:VEVENT') {
      if (currentEvent.uid && currentEvent.summary && currentEvent.dtstart) {
        events.push(currentEvent as ICalEvent);
      }
      inEvent = false;
      continue;
    }

    if (!inEvent) continue;

    const colonIndex = trimmedLine.indexOf(':');
    if (colonIndex === -1) continue;

    const key = trimmedLine.substring(0, colonIndex).split(';')[0]; // Remove parameters
    const value = trimmedLine.substring(colonIndex + 1);

    switch (key) {
      case 'UID':
        currentEvent.uid = value;
        break;
      case 'SUMMARY':
        currentEvent.summary = unescapeICalText(value);
        break;
      case 'DESCRIPTION':
        currentEvent.description = unescapeICalText(value);
        break;
      case 'DTSTART':
        currentEvent.dtstart = parseICalDate(value);
        break;
      case 'DTEND':
        currentEvent.dtend = parseICalDate(value);
        break;
      case 'CREATED':
        currentEvent.created = parseICalDate(value);
        break;
      case 'LAST-MODIFIED':
        currentEvent.lastModified = parseICalDate(value);
        break;
      case 'STATUS':
        currentEvent.status = value;
        break;
      case 'PRIORITY':
        currentEvent.priority = parseInt(value);
        break;
      case 'LOCATION':
        currentEvent.location = unescapeICalText(value);
        break;
    }
  }

  return events;
}

/**
 * Convert parsed iCal event to our Event data format
 */
export function iCalEventToAppEvent(
  icalEvent: ICalEvent,
  userId: string,
  documentId: string
): {
  title: string;
  description: string;
  eventDate: Date;
  eventType: string;
  priority: string;
  status: string;
} {
  // Map iCal priority to our priority
  const priorityMap: Record<number, string> = {
    1: 'critical',
    2: 'critical',
    3: 'high',
    4: 'high',
    5: 'medium',
    6: 'medium',
    7: 'low',
    8: 'low',
    9: 'low',
  };

  return {
    title: icalEvent.summary,
    description: icalEvent.description || '',
    eventDate: icalEvent.dtstart,
    eventType: 'milestone', // Default type
    priority: priorityMap[icalEvent.priority || 5] || 'medium',
    status: icalEvent.status === 'CONFIRMED' ? 'completed' : 'upcoming',
  };
}
