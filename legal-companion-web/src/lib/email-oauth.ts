/**
 * Email OAuth Service (Gmail)
 * Extends Google OAuth for Gmail API access
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const EMAIL_REDIRECT_URI =
  process.env.NEXT_PUBLIC_API_URL + '/api/integrations/email/callback' ||
  'http://localhost:3002/api/integrations/email/callback';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

// Gmail API scopes
const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.metadata',
  'https://www.googleapis.com/auth/userinfo.email',
];

// Encryption for tokens
const ENCRYPTION_KEY =
  process.env.TOKEN_ENCRYPTION_KEY ||
  process.env.JWT_SECRET?.slice(0, 32).padEnd(32, '0') ||
  '00000000000000000000000000000000';
const ALGORITHM = 'aes-256-cbc';

export interface EmailTokens {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
  token_type: string;
  scope: string;
}

/**
 * Check if email OAuth is configured
 */
export function isEmailOAuthConfigured(): boolean {
  return !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);
}

/**
 * Generate authorization URL for Gmail
 */
export function getEmailAuthorizationUrl(state?: string): string {
  if (!isEmailOAuthConfigured()) {
    throw new Error('Email OAuth is not configured');
  }

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: EMAIL_REDIRECT_URI,
    response_type: 'code',
    scope: GMAIL_SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    ...(state && { state }),
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeEmailCodeForTokens(
  code: string
): Promise<EmailTokens> {
  if (!isEmailOAuthConfigured()) {
    throw new Error('Email OAuth is not configured');
  }

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: EMAIL_REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Failed to exchange code for tokens: ${error.error_description || response.statusText}`
    );
  }

  const data = await response.json();

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expiry_date: data.expires_in
      ? Date.now() + data.expires_in * 1000
      : undefined,
    token_type: data.token_type,
    scope: data.scope,
  };
}

/**
 * Refresh access token
 */
export async function refreshEmailAccessToken(
  refreshToken: string
): Promise<EmailTokens> {
  if (!isEmailOAuthConfigured()) {
    throw new Error('Email OAuth is not configured');
  }

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Failed to refresh token: ${error.error_description || response.statusText}`
    );
  }

  const data = await response.json();

  return {
    access_token: data.access_token,
    refresh_token: refreshToken,
    expiry_date: data.expires_in
      ? Date.now() + data.expires_in * 1000
      : undefined,
    token_type: data.token_type,
    scope: data.scope,
  };
}

/**
 * Revoke token
 */
export async function revokeEmailToken(token: string): Promise<void> {
  const response = await fetch(
    `https://oauth2.googleapis.com/revoke?token=${token}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to revoke token');
  }
}

/**
 * Encrypt token
 */
export function encryptEmailToken(token: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY),
    iv
  );

  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt token
 */
export function decryptEmailToken(encryptedToken: string): string {
  const parts = encryptedToken.split(':');
  if (parts.length !== 2) {
    throw new Error('Invalid encrypted token format');
  }

  const [ivHex, encrypted] = parts;
  const iv = Buffer.from(ivHex, 'hex');

  const decipher = createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY),
    iv
  );

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Check if token is expired
 */
export function isEmailTokenExpired(expiryDate?: number): boolean {
  if (!expiryDate) return true;
  return Date.now() >= expiryDate - 5 * 60 * 1000;
}
