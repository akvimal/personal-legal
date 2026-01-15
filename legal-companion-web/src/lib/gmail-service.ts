/**
 * Gmail API Service
 * Handles Gmail operations for email monitoring
 */

const GMAIL_API_BASE_URL = 'https://gmail.googleapis.com/gmail/v1';

// Gmail API scopes required
export const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.metadata',
];

export interface GmailMessage {
  id: string;
  threadId: string;
  labelIds?: string[];
  snippet: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
    body?: {
      data?: string;
      size: number;
    };
    parts?: Array<{
      mimeType: string;
      body?: {
        data?: string;
        size: number;
      };
    }>;
  };
  internalDate: string;
  sizeEstimate: number;
}

export interface GmailListResponse {
  messages: Array<{ id: string; threadId: string }>;
  nextPageToken?: string;
  resultSizeEstimate: number;
}

export interface ProcessedEmail {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string;
  date: Date;
  snippet: string;
  body: string;
  isLegal: boolean;
  category?: string;
}

/**
 * List messages from Gmail
 */
export async function listMessages(
  accessToken: string,
  options: {
    query?: string;
    maxResults?: number;
    pageToken?: string;
    labelIds?: string[];
  } = {}
): Promise<GmailListResponse> {
  const { query, maxResults = 100, pageToken, labelIds } = options;

  const params = new URLSearchParams({
    ...(query && { q: query }),
    maxResults: maxResults.toString(),
    ...(pageToken && { pageToken }),
    ...(labelIds && { labelIds: labelIds.join(',') }),
  });

  const response = await fetch(
    `${GMAIL_API_BASE_URL}/users/me/messages?${params}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Failed to list messages: ${error.error?.message || response.statusText}`
    );
  }

  return response.json();
}

/**
 * Get a specific message
 */
export async function getMessage(
  accessToken: string,
  messageId: string,
  format: 'full' | 'metadata' | 'minimal' = 'full'
): Promise<GmailMessage> {
  const params = new URLSearchParams({ format });

  const response = await fetch(
    `${GMAIL_API_BASE_URL}/users/me/messages/${messageId}?${params}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Failed to get message: ${error.error?.message || response.statusText}`
    );
  }

  return response.json();
}

/**
 * Get user profile
 */
export async function getProfile(accessToken: string) {
  const response = await fetch(`${GMAIL_API_BASE_URL}/users/me/profile`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Failed to get profile: ${error.error?.message || response.statusText}`
    );
  }

  return response.json();
}

/**
 * Extract header value from message
 */
export function getHeader(message: GmailMessage, headerName: string): string {
  const header = message.payload.headers.find(
    (h) => h.name.toLowerCase() === headerName.toLowerCase()
  );
  return header?.value || '';
}

/**
 * Decode base64 email body
 */
export function decodeBody(encodedBody: string): string {
  try {
    // Gmail uses base64url encoding (- instead of +, _ instead of /)
    const base64 = encodedBody.replace(/-/g, '+').replace(/_/g, '/');
    return Buffer.from(base64, 'base64').toString('utf-8');
  } catch (error) {
    console.error('Failed to decode body:', error);
    return '';
  }
}

/**
 * Extract email body from message
 */
export function extractBody(message: GmailMessage): string {
  // Try to get body from payload.body
  if (message.payload.body?.data) {
    return decodeBody(message.payload.body.data);
  }

  // Try to get body from parts (multipart message)
  if (message.payload.parts) {
    // Look for text/plain first
    const textPart = message.payload.parts.find(
      (part) => part.mimeType === 'text/plain'
    );
    if (textPart?.body?.data) {
      return decodeBody(textPart.body.data);
    }

    // Fall back to text/html
    const htmlPart = message.payload.parts.find(
      (part) => part.mimeType === 'text/html'
    );
    if (htmlPart?.body?.data) {
      return decodeBody(htmlPart.body.data);
    }

    // Try nested parts
    for (const part of message.payload.parts) {
      if (part.body?.data) {
        return decodeBody(part.body.data);
      }
    }
  }

  return message.snippet || '';
}

/**
 * Process Gmail message into simplified format
 */
export function processMessage(message: GmailMessage): ProcessedEmail {
  const subject = getHeader(message, 'Subject');
  const from = getHeader(message, 'From');
  const to = getHeader(message, 'To');
  const dateStr = getHeader(message, 'Date');
  const body = extractBody(message);

  // Check if email is legal-related based on keywords
  const isLegal = checkIfLegal(subject, body, from);
  const category = isLegal ? categorizeEmail(subject, body) : undefined;

  return {
    id: message.id,
    threadId: message.threadId,
    subject,
    from,
    to,
    date: dateStr ? new Date(dateStr) : new Date(parseInt(message.internalDate)),
    snippet: message.snippet,
    body,
    isLegal,
    category,
  };
}

/**
 * Check if email is legal-related
 */
export function checkIfLegal(subject: string, body: string, from: string): boolean {
  const keywords = [
    'terms of service',
    'terms and conditions',
    'user agreement',
    'privacy policy',
    'subscription',
    'renewal',
    'auto-renew',
    'contract',
    'agreement',
    'cancellation policy',
    'billing',
    'payment',
    'plan change',
    'price increase',
    'rate change',
    'policy update',
    'legal notice',
    'service agreement',
  ];

  const text = `${subject} ${body} ${from}`.toLowerCase();

  return keywords.some((keyword) => text.includes(keyword));
}

/**
 * Categorize email type
 */
export function categorizeEmail(subject: string, body: string): string {
  const text = `${subject} ${body}`.toLowerCase();

  if (
    text.includes('terms of service') ||
    text.includes('terms and conditions') ||
    text.includes('user agreement')
  ) {
    return 'terms_of_service';
  }

  if (text.includes('privacy policy') || text.includes('data policy')) {
    return 'privacy_policy';
  }

  if (
    text.includes('subscription') ||
    text.includes('renewal') ||
    text.includes('auto-renew')
  ) {
    return 'subscription';
  }

  if (
    text.includes('billing') ||
    text.includes('payment') ||
    text.includes('invoice')
  ) {
    return 'billing';
  }

  if (
    text.includes('contract') ||
    text.includes('agreement') ||
    text.includes('amendment')
  ) {
    return 'contract';
  }

  if (
    text.includes('cancellation') ||
    text.includes('termination') ||
    text.includes('refund')
  ) {
    return 'cancellation';
  }

  if (
    text.includes('price increase') ||
    text.includes('rate change') ||
    text.includes('plan change')
  ) {
    return 'price_change';
  }

  return 'other';
}

/**
 * Build search query for legal emails
 */
export function buildLegalEmailQuery(since?: Date): string {
  const keywords = [
    'terms of service',
    'terms and conditions',
    'privacy policy',
    'subscription renewal',
    'contract',
    'agreement',
    'billing notice',
  ];

  // Build OR query for keywords
  const keywordQuery = keywords.map((k) => `"${k}"`).join(' OR ');

  // Add date filter if provided
  if (since) {
    const dateStr = since.toISOString().split('T')[0].replace(/-/g, '/');
    return `(${keywordQuery}) after:${dateStr}`;
  }

  return `(${keywordQuery})`;
}

/**
 * Watch for new emails (set up push notifications)
 */
export async function watchMailbox(
  accessToken: string,
  topicName: string
): Promise<{ historyId: string; expiration: string }> {
  const response = await fetch(`${GMAIL_API_BASE_URL}/users/me/watch`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topicName,
      labelIds: ['INBOX'],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Failed to watch mailbox: ${error.error?.message || response.statusText}`
    );
  }

  return response.json();
}

/**
 * Stop watching mailbox
 */
export async function stopWatch(accessToken: string): Promise<void> {
  const response = await fetch(`${GMAIL_API_BASE_URL}/users/me/stop`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Failed to stop watching: ${error.error?.message || response.statusText}`
    );
  }
}
