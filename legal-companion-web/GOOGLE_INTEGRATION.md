# Google OAuth & Drive Integration Architecture

## Overview

Users can sign in with Google and grant access to a specific Google Drive folder containing their legal documents. The system automatically syncs and processes these documents without manual upload.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    USER FLOW                             │
│                                                           │
│  User → Google Sign In → OAuth Consent → Grant Access   │
│            ↓                                             │
│  Select Drive Folder → Sync Documents → Process         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                 AUTHENTICATION LAYER                      │
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Google     │  │   NextAuth   │  │     JWT      │  │
│  │   OAuth 2.0  │  │   or Clerk   │  │   Tokens     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              GOOGLE DRIVE INTEGRATION                     │
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │          Google Drive API v3                      │   │
│  │  - List Folders & Files                           │   │
│  │  - Download Files                                 │   │
│  │  - Watch for Changes (Webhooks)                   │   │
│  │  - Metadata Extraction                            │   │
│  └──────────────────────────────────────────────────┘   │
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Folder     │  │   File       │  │   Sync       │  │
│  │   Watcher    │  │   Processor  │  │   Manager    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                 PROCESSING PIPELINE                       │
│                                                           │
│  Drive File → Download → OCR/Parse → Extract Events →    │
│  Categorize → Create Document → Add to Library           │
└─────────────────────────────────────────────────────────┘
```

---

## 1. Google OAuth Authentication

### OAuth 2.0 Flow

```
1. User clicks "Sign in with Google"
2. Redirect to Google OAuth consent screen
3. User grants permissions:
   - Basic profile (email, name)
   - Google Drive read access (drive.readonly or drive.file)
4. Google redirects back with authorization code
5. Exchange code for access token + refresh token
6. Store tokens securely (encrypted in database)
7. Create user session
```

### Required OAuth Scopes

```javascript
const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/drive.readonly',  // Read-only access
  // OR
  'https://www.googleapis.com/auth/drive.file',      // Access only to files created by app
];
```

### OAuth Configuration

```typescript
// OAuth 2.0 Client Configuration
interface GoogleOAuthConfig {
  clientId: string;              // From Google Cloud Console
  clientSecret: string;          // From Google Cloud Console
  redirectUri: string;           // Your callback URL
  scopes: string[];              // Permissions to request
}

// Example using NextAuth.js
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/drive.readonly',
          access_type: 'offline',  // To get refresh token
          prompt: 'consent',        // Force consent screen
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      return session;
    },
  },
};
```

---

## 2. Google Drive Integration

### Drive Connection Setup

```typescript
interface DriveConnection {
  id: string;
  userId: string;
  googleAccountEmail: string;
  status: 'connected' | 'disconnected' | 'error' | 'syncing';

  // Watched folder
  folderId: string;
  folderName: string;
  folderPath: string;

  // Sync settings
  autoSync: boolean;
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'manual';
  lastSync: Date;
  nextSync?: Date;

  // File filters
  fileTypes: string[];  // ['pdf', 'docx', 'jpg', 'png']
  includeSubfolders: boolean;

  // Statistics
  totalFiles: number;
  syncedFiles: number;
  failedFiles: number;

  // Webhook
  webhookChannelId?: string;
  webhookResourceId?: string;
  webhookExpiration?: Date;

  connectedAt: Date;
  updatedAt: Date;
}
```

### Folder Selection Flow

```
1. User connects Google Drive
2. Fetch folder list from Drive API
3. Display folder tree/picker
4. User selects target folder (e.g., "My Documents/Legal")
5. Request permissions for that folder
6. Set up folder watching (webhooks)
7. Start initial sync
```

### Drive API Operations

```typescript
import { google } from 'googleapis';

class GoogleDriveService {
  private drive: any;

  constructor(accessToken: string) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    this.drive = google.drive({ version: 'v3', auth });
  }

  /**
   * List all folders in user's Drive
   */
  async listFolders() {
    const response = await this.drive.files.list({
      q: "mimeType='application/vnd.google-apps.folder' and trashed=false",
      fields: 'files(id, name, parents, modifiedTime)',
      orderBy: 'name',
    });
    return response.data.files;
  }

  /**
   * List files in a specific folder
   */
  async listFilesInFolder(folderId: string, includeSubfolders: boolean = false) {
    let query = `'${folderId}' in parents and trashed=false`;

    // File type filter
    const supportedTypes = [
      "mimeType='application/pdf'",
      "mimeType='application/vnd.openxmlformats-officedocument.wordprocessingml.document'",
      "mimeType='image/jpeg'",
      "mimeType='image/png'",
    ];
    query += ` and (${supportedTypes.join(' or ')})`;

    const response = await this.drive.files.list({
      q: query,
      fields: 'files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink)',
      pageSize: 100,
    });

    return response.data.files;
  }

  /**
   * Download file content
   */
  async downloadFile(fileId: string): Promise<Buffer> {
    const response = await this.drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'arraybuffer' }
    );
    return Buffer.from(response.data);
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(fileId: string) {
    const response = await this.drive.files.get({
      fileId,
      fields: 'id, name, mimeType, size, createdTime, modifiedTime, owners, webViewLink',
    });
    return response.data;
  }

  /**
   * Set up change notifications (webhooks)
   */
  async watchFolder(folderId: string, webhookUrl: string) {
    const response = await this.drive.files.watch({
      fileId: folderId,
      requestBody: {
        id: generateUUID(),
        type: 'web_hook',
        address: webhookUrl,
      },
    });

    return {
      channelId: response.data.id,
      resourceId: response.data.resourceId,
      expiration: new Date(parseInt(response.data.expiration)),
    };
  }

  /**
   * Stop watching folder
   */
  async stopWatching(channelId: string, resourceId: string) {
    await this.drive.channels.stop({
      requestBody: {
        id: channelId,
        resourceId: resourceId,
      },
    });
  }
}
```

---

## 3. File Sync Pipeline

### Initial Sync Process

```
Step 1: Fetch all files from selected folder
  → Get list of files with metadata
  → Filter by supported file types
  → Check if file already synced (by Drive file ID)

Step 2: Download files
  → Download file content from Drive
  → Store temporarily or directly to object storage
  → Generate checksum for duplicate detection

Step 3: Process each file
  → Extract text (OCR if image/scanned)
  → Classify document type
  → Extract metadata (parties, dates, amounts)
  → Extract events and obligations
  → Generate embeddings for AI search

Step 4: Create document record
  → Save to database
  → Link to original Drive file
  → Track sync status
  → Create events and reminders

Step 5: Mark as synced
  → Update sync status
  → Record sync timestamp
  → Update statistics
```

### Real-time Sync (Webhooks)

```
Drive Change Notification (Webhook) → Validate Notification →
Check Change Type (add/modify/delete) → Download New/Updated File →
Process → Update Document → Notify User
```

### Webhook Handler

```typescript
interface DriveWebhookNotification {
  channelId: string;
  resourceId: string;
  resourceState: 'add' | 'update' | 'remove' | 'trash' | 'untrash' | 'change';
  resourceUri: string;
  changed: string;  // Comma-separated list of changed aspects
}

async function handleDriveWebhook(notification: DriveWebhookNotification) {
  // 1. Validate notification
  const connection = await findDriveConnectionByChannelId(notification.channelId);
  if (!connection) return;

  // 2. Fetch changes
  const changes = await getDriveChanges(connection.folderId);

  // 3. Process changes
  for (const change of changes) {
    if (change.type === 'add' || change.type === 'update') {
      // New or updated file
      await syncFile(connection.userId, change.fileId);
    } else if (change.type === 'remove') {
      // File deleted
      await markDocumentAsDeleted(change.fileId);
    }
  }

  // 4. Update last sync time
  await updateLastSync(connection.id);
}
```

---

## 4. Database Schema

```sql
-- Drive connections
drive_connections (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  google_account_email VARCHAR(255),
  status VARCHAR(50),

  folder_id VARCHAR(255),
  folder_name VARCHAR(500),
  folder_path TEXT,

  auto_sync BOOLEAN DEFAULT true,
  sync_frequency VARCHAR(20),
  last_sync TIMESTAMP,
  next_sync TIMESTAMP,

  file_types TEXT[],
  include_subfolders BOOLEAN DEFAULT false,

  total_files INTEGER DEFAULT 0,
  synced_files INTEGER DEFAULT 0,
  failed_files INTEGER DEFAULT 0,

  webhook_channel_id VARCHAR(255),
  webhook_resource_id VARCHAR(255),
  webhook_expiration TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Synced files tracking
drive_files (
  id UUID PRIMARY KEY,
  connection_id UUID REFERENCES drive_connections(id),
  document_id UUID REFERENCES documents(id),

  drive_file_id VARCHAR(255) UNIQUE,
  drive_file_name VARCHAR(500),
  drive_file_path TEXT,

  mime_type VARCHAR(100),
  file_size BIGINT,
  drive_created_at TIMESTAMP,
  drive_modified_at TIMESTAMP,

  sync_status VARCHAR(50), -- pending, syncing, completed, failed
  sync_attempts INTEGER DEFAULT 0,
  last_sync_at TIMESTAMP,
  error_message TEXT,

  checksum VARCHAR(64), -- For duplicate detection

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Sync logs
drive_sync_logs (
  id UUID PRIMARY KEY,
  connection_id UUID REFERENCES drive_connections(id),
  sync_type VARCHAR(50), -- initial, scheduled, webhook, manual

  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  status VARCHAR(50), -- running, completed, failed

  files_found INTEGER,
  files_synced INTEGER,
  files_failed INTEGER,
  files_skipped INTEGER,

  error_details JSONB,

  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 5. Security Considerations

### Token Management

```typescript
// Encrypt access tokens before storing
import crypto from 'crypto';

function encryptToken(token: string): string {
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

function decryptToken(encryptedToken: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedToken.split(':');

  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
```

### Token Refresh

```typescript
async function refreshGoogleAccessToken(refreshToken: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  const { credentials } = await oauth2Client.refreshAccessToken();

  return {
    accessToken: credentials.access_token!,
    expiresAt: new Date(credentials.expiry_date!),
  };
}
```

### Permissions & Privacy

```
1. Request minimum necessary scopes
2. Explain what data will be accessed (only selected folder)
3. Don't access files outside designated folder
4. Encrypt tokens at rest
5. Log all access for audit
6. Allow users to disconnect anytime
7. Delete all data when disconnected
8. Comply with Google API Terms of Service
```

---

## 6. User Experience Flow

### Initial Setup

```
┌─ Connect Google Drive ─────────────────────────┐
│                                                 │
│  📁 Automatically sync your legal documents    │
│     from Google Drive                          │
│                                                 │
│  Benefits:                                      │
│  ✓ No manual uploads needed                    │
│  ✓ Auto-sync new documents                     │
│  ✓ Keep documents in Drive                     │
│  ✓ Read-only access                            │
│                                                 │
│  [Sign in with Google →]                       │
│                                                 │
│  🔒 We only access the folder you choose       │
│                                                 │
└─────────────────────────────────────────────────┘
```

### After OAuth Success

```
┌─ Select Your Legal Documents Folder ───────────┐
│                                                 │
│  Choose the folder containing your documents   │
│                                                 │
│  📁 My Drive                                    │
│    📁 Documents                                 │
│      📁 Legal ✓ Selected                        │
│        📄 Rental_Agreement.pdf                  │
│        📄 Employment_Contract.pdf               │
│      📁 Personal                                │
│      📁 Work                                    │
│    📁 Photos                                    │
│    📁 Projects                                  │
│                                                 │
│  ☑️ Include subfolders                         │
│  ☑️ Auto-sync new files                        │
│                                                 │
│  Sync frequency: [Hourly ▾]                    │
│                                                 │
│  [Cancel]  [Start Syncing →]                   │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Syncing Progress

```
┌─ Syncing Documents from Google Drive ──────────┐
│                                                 │
│  📂 Folder: My Drive/Documents/Legal           │
│  👤 Account: user@gmail.com                    │
│                                                 │
│  Progress: ████████████░░░░░░░░ 65%            │
│                                                 │
│  ✓ Processed: 13 files                         │
│  ⏳ Remaining: 7 files                          │
│  ⚠️ Failed: 0 files                            │
│                                                 │
│  Currently processing:                          │
│  📄 Insurance_Policy_2025.pdf                  │
│  Extracting text and analyzing...              │
│                                                 │
│  [Cancel Sync]                                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Sync Complete

```
┌─ Sync Complete! ────────────────────────────────┐
│                                                 │
│  ✅ Successfully synced 18 documents           │
│  ⚠️ 2 files couldn't be processed              │
│                                                 │
│  📄 Documents added to your library             │
│  📅 23 events extracted                         │
│  ⏰ 45 reminders set up                         │
│                                                 │
│  Next sync: Today at 3:00 PM                   │
│                                                 │
│  [View Documents] [View Failed Files]          │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Drive Settings Page

```
┌─ Google Drive Integration ──────────────────────┐
│                                                 │
│  Status: 🟢 Connected                          │
│  Account: user@gmail.com                       │
│  Connected: Nov 5, 2025                        │
│                                                 │
│  ──────────────────────────────────────────    │
│                                                 │
│  📁 Synced Folder:                             │
│  My Drive > Documents > Legal                  │
│  [Change Folder]                               │
│                                                 │
│  ──────────────────────────────────────────    │
│                                                 │
│  Sync Settings:                                │
│  ☑️ Auto-sync new files                        │
│  ☑️ Include subfolders                         │
│  Frequency: [Hourly ▾]                         │
│                                                 │
│  File types:                                    │
│  ☑️ PDF documents                               │
│  ☑️ Word documents (.docx)                     │
│  ☑️ Images (for OCR)                           │
│                                                 │
│  ──────────────────────────────────────────    │
│                                                 │
│  Sync Statistics:                               │
│  Total files: 47                                │
│  Last sync: 2 hours ago                        │
│  Next sync: in 58 minutes                      │
│                                                 │
│  [Sync Now] [Pause Auto-Sync]                  │
│                                                 │
│  ──────────────────────────────────────────    │
│                                                 │
│  ⚠️ Danger Zone:                               │
│  [Disconnect Google Drive]                     │
│  This will stop syncing but keep existing docs │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 7. API Endpoints

```typescript
// Authentication
POST   /api/auth/google/signin        // Initiate Google OAuth
GET    /api/auth/google/callback      // OAuth callback
POST   /api/auth/signout              // Sign out

// Drive Connection
POST   /api/drive/connect              // Connect Drive after OAuth
GET    /api/drive/connection           // Get connection status
DELETE /api/drive/disconnect           // Disconnect Drive
PUT    /api/drive/settings             // Update sync settings

// Folder Operations
GET    /api/drive/folders              // List available folders
POST   /api/drive/select-folder        // Select sync folder
GET    /api/drive/folder/{id}/files    // List files in folder

// Sync Operations
POST   /api/drive/sync/start           // Start manual sync
POST   /api/drive/sync/pause           // Pause auto-sync
POST   /api/drive/sync/resume          // Resume auto-sync
GET    /api/drive/sync/status          // Get sync status
GET    /api/drive/sync/history         // Get sync history

// File Operations
GET    /api/drive/files                // List synced files
GET    /api/drive/files/{id}           // Get file details
POST   /api/drive/files/{id}/resync    // Retry failed file
DELETE /api/drive/files/{id}           // Unsync file

// Webhooks (Internal)
POST   /api/webhooks/drive             // Drive change notifications
```

---

## 8. Error Handling

### Common Error Scenarios

```typescript
enum DriveErrorType {
  OAUTH_FAILED = 'oauth_failed',
  TOKEN_EXPIRED = 'token_expired',
  PERMISSION_DENIED = 'permission_denied',
  FOLDER_NOT_FOUND = 'folder_not_found',
  QUOTA_EXCEEDED = 'quota_exceeded',
  FILE_TOO_LARGE = 'file_too_large',
  UNSUPPORTED_FILE_TYPE = 'unsupported_file_type',
  NETWORK_ERROR = 'network_error',
  PROCESSING_FAILED = 'processing_failed',
}

interface DriveError {
  type: DriveErrorType;
  message: string;
  fileId?: string;
  fileName?: string;
  retryable: boolean;
  userAction?: string;
}
```

### Error Recovery

```typescript
async function syncFileWithRetry(
  fileId: string,
  maxRetries: number = 3
): Promise<void> {
  let attempts = 0;
  let lastError: Error | null = null;

  while (attempts < maxRetries) {
    try {
      await syncFile(fileId);
      return; // Success
    } catch (error) {
      attempts++;
      lastError = error as Error;

      if (!isRetryableError(error)) {
        // Non-retryable error, fail immediately
        throw error;
      }

      if (attempts < maxRetries) {
        // Exponential backoff
        const delay = Math.pow(2, attempts) * 1000;
        await sleep(delay);
      }
    }
  }

  // All retries failed
  throw new Error(`Failed after ${maxRetries} attempts: ${lastError?.message}`);
}
```

---

## 9. Implementation Checklist

### Phase 1: OAuth Setup
- [ ] Create Google Cloud Project
- [ ] Enable Google Drive API
- [ ] Create OAuth 2.0 credentials
- [ ] Configure redirect URIs
- [ ] Implement OAuth flow
- [ ] Store tokens securely
- [ ] Implement token refresh

### Phase 2: Drive Integration
- [ ] Implement Drive API client
- [ ] List folders functionality
- [ ] File listing and filtering
- [ ] File download
- [ ] Metadata extraction

### Phase 3: Sync System
- [ ] Initial sync implementation
- [ ] Duplicate detection
- [ ] Webhook setup
- [ ] Real-time sync
- [ ] Retry mechanism
- [ ] Error handling

### Phase 4: UI Components
- [ ] Sign in with Google button
- [ ] Folder picker
- [ ] Sync progress indicator
- [ ] Settings page
- [ ] Error notifications

### Phase 5: Testing & Optimization
- [ ] OAuth flow testing
- [ ] Large folder handling
- [ ] Network error scenarios
- [ ] Token expiration handling
- [ ] Performance optimization

---

## 10. Environment Variables

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/auth/google/callback

# Encryption
ENCRYPTION_KEY=your_32_byte_hex_key

# Webhooks
DRIVE_WEBHOOK_URL=https://yourdomain.com/api/webhooks/drive
WEBHOOK_SECRET=your_webhook_secret

# NextAuth (if using)
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_nextauth_secret
```

---

This architecture provides a seamless experience where users never have to manually upload documents - they just connect their Drive once and everything syncs automatically!
