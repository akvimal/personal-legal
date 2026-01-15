# Database Schema Documentation

Comprehensive PostgreSQL database schema for the Personal Legal Companion application using Prisma ORM.

## Overview

The database consists of **17 models** organized into 7 functional areas:
1. User & Authentication (2 models)
2. Documents (1 model)
3. Events & Reminders (2 models)
4. Tasks (1 model)
5. Notifications (1 model)
6. AI Assistant (2 models)
7. Integrations - Email & Google Drive (4 models)
8. Insurance (2 models)
9. Legal Guidance (1 model)

---

## Models

### 1. User & Authentication

#### User
Central user model with all relations.

**Fields:**
- `id` (UUID) - Primary key
- `email` (String, unique) - User email
- `password` (String, nullable) - Hashed password (null for OAuth users)
- `fullName` (String) - User's full name
- `location` (String, nullable) - User location
- `avatarUrl` (String, nullable) - Profile picture URL
- `createdAt`, `updatedAt` - Timestamps

**Relations:**
- One-to-Many: documents, events, tasks, notifications, chatMessages
- One-to-One: preferences
- One-to-Many: emailConnections, driveConnections, insurancePolicies, legalGuidanceRequests

**Indexes:** email

---

#### UserPreferences
User-specific settings and preferences.

**Fields:**
- `country`, `region`, `language` - Location and language settings
- `emailNotifications`, `pushNotifications`, `smsNotifications` - Notification preferences
- `quietHoursStart`, `quietHoursEnd` - Notification quiet hours
- `defaultReminderDays` (Int[]) - Default reminder schedule
- `aiAssistance` - AI assistance level ('proactive' | 'moderate' | 'minimal')

**Relations:**
- One-to-One with User (CASCADE delete)

---

### 2. Documents

#### Document
Core document storage model.

**Fields:**
- `title`, `category`, `documentType`, `status`
- `filePath`, `fileType`, `fileSize`, `pages` - File information
- `uploadedAt`, `signedDate`, `startDate`, `endDate` - Date tracking
- `parties` (String[]) - Involved parties
- `tags` (String[]) - Document tags
- `country`, `region`, `language` - Location
- `metadata` (JSON) - Flexible metadata storage
- `upcomingEvents`, `pendingTasks` - Counters

**Relations:**
- Many-to-One with User (CASCADE delete)
- One-to-Many: events, tasks, chatMessages
- One-to-One: insurancePolicy, driveFile

**Indexes:** userId, category, status, endDate

---

### 3. Events & Reminders

#### Event
Calendar events and deadlines.

**Fields:**
- `eventType` - Type of event (contract_expiry, payment_due, etc.)
- `title`, `description` - Event details
- `eventDate` - When the event occurs
- `priority` - Event priority level
- `isRecurring`, `recurrencePattern` - Recurrence settings
- `responsibleParty`, `consequence`, `advanceNoticeDays` - Additional info
- `status` - Event status (upcoming, completed, missed, dismissed)

**Relations:**
- Many-to-One with User and Document (CASCADE delete)
- One-to-Many: reminders, tasks

**Indexes:** userId, documentId, eventDate, status, priority

---

#### Reminder
Reminders for events.

**Fields:**
- `daysBefore` - Days before event to remind
- `sent` - Whether reminder was sent
- `sentAt` - When reminder was sent

**Relations:**
- Many-to-One with Event (CASCADE delete)

**Indexes:** eventId, sent

---

### 4. Tasks

#### Task
Task management.

**Fields:**
- `title`, `description` - Task details
- `dueDate` - When task is due
- `priority` - Task priority
- `status` - Task status (pending, in_progress, completed)
- `completedAt` - Completion timestamp

**Relations:**
- Many-to-One with User (CASCADE delete)
- Many-to-One with Document (SET NULL on delete)
- Many-to-One with Event (SET NULL on delete)

**Indexes:** userId, status, priority, dueDate

---

### 5. Notifications

#### Notification
User notifications.

**Fields:**
- `type` - Notification type (critical, warning, info, success)
- `title`, `message` - Notification content
- `documentId`, `eventId`, `taskId` - Related entities (nullable)
- `isRead`, `readAt` - Read status
- `actions` (JSON) - Available actions

**Relations:**
- Many-to-One with User (CASCADE delete)

**Indexes:** userId, isRead, type, createdAt

---

### 6. AI Assistant

#### ChatMessage
Chat conversation history.

**Fields:**
- `role` - Message role (user, assistant)
- `content` (Text) - Message content
- `sources` (JSON) - Document sources for citations

**Relations:**
- Many-to-One with User (CASCADE delete)
- Many-to-One with Document (SET NULL on delete)

**Indexes:** userId, documentId, timestamp

---

#### Template
Document templates.

**Fields:**
- `title`, `category` - Template identification
- `country`, `region`, `languages` - Location and language
- `description` (Text) - Template description
- `fields` (JSON) - Form fields definition
- `clauses` (String[]) - Template clauses
- `isActive` - Active status

**Indexes:** category, country, isActive

---

### 7. Integrations

#### EmailConnection
Email account connections.

**Fields:**
- `provider` - Email provider (gmail, outlook, yahoo, imap)
- `email` - Connected email address
- `status` - Connection status
- `syncFrequency` - Sync frequency setting
- `lastSync` - Last sync timestamp
- `accessToken`, `refreshToken`, `tokenExpiry` - OAuth tokens (encrypted)

**Relations:**
- Many-to-One with User (CASCADE delete)
- One-to-Many: processedEmails

**Indexes:** userId, status

---

#### ProcessedEmail
Processed emails from connections.

**Fields:**
- `subject`, `from`, `receivedAt` - Email metadata
- `isLegal` - Whether email contains legal content
- `category` - Email category
- `priority` - Priority level
- `extractedTerms` (JSON) - Extracted T&C terms
- `reviewStatus` - Review status

**Relations:**
- Many-to-One with EmailConnection (CASCADE delete)

**Indexes:** connectionId, isLegal, receivedAt

---

#### DriveConnection
Google Drive connections.

**Fields:**
- `googleAccountEmail` - Connected Google account
- `status` - Connection status
- `folderId`, `folderName`, `folderPath` - Folder settings
- `includeSubfolders` - Include subfolders flag
- `autoSync`, `syncFrequency` - Sync settings
- `fileTypes` (String[]) - File types to sync
- `totalFiles`, `syncedFiles`, `failedFiles` - Sync statistics
- `lastSync`, `nextSync` - Sync timestamps
- `accessToken`, `refreshToken`, `tokenExpiry` - OAuth tokens

**Relations:**
- Many-to-One with User (CASCADE delete)
- One-to-Many: files

**Indexes:** userId, status

---

#### DriveFile
Files from Google Drive.

**Fields:**
- `driveFileId` (unique) - Google Drive file ID
- `driveFileName`, `driveFilePath` - File identification
- `mimeType`, `fileSize` - File metadata
- `driveCreatedAt`, `driveModifiedAt` - Drive timestamps
- `syncStatus` - Sync status
- `syncAttempts` - Number of sync attempts
- `lastSyncAt`, `errorMessage` - Sync tracking
- `documentId` - Linked document (nullable, unique)

**Relations:**
- Many-to-One with DriveConnection (CASCADE delete)
- One-to-One with Document (SET NULL on delete)

**Indexes:** connectionId, syncStatus, driveFileId

---

### 8. Insurance

#### InsurancePolicy
Insurance policy management.

**Fields:**
- `policyNumber` (unique) - Policy number
- `insuranceType` - Type of insurance
- `provider`, `policyHolder`, `insuredMembers` - Policy details
- `premiumAmount`, `premiumFrequency`, `coverageAmount` - Financial details
- `startDate`, `endDate`, `renewalDate`, `gracePeriod` - Dates
- `status` - Policy status
- `coverage` (JSON), `exclusions` (String[]), `benefits` (JSON) - Coverage details
- `healthInsurance`, `autoInsurance`, `lifeInsurance`, `propertyInsurance` (JSON) - Type-specific details

**Relations:**
- Many-to-One with User (CASCADE delete)
- One-to-One with Document (CASCADE delete)
- One-to-Many: claims

**Indexes:** userId, insuranceType, status, renewalDate

---

#### InsuranceClaim
Insurance claims tracking.

**Fields:**
- `claimNumber` (unique) - Claim number
- `claimDate`, `claimAmount`, `approvedAmount` - Claim details
- `status` - Claim status
- `claimType`, `description` - Claim type and description
- `documents` (String[]) - Supporting documents
- `settlementDate`, `rejectionReason` - Resolution details

**Relations:**
- Many-to-One with InsurancePolicy (CASCADE delete)

**Indexes:** policyId, status, claimDate

---

### 9. Legal Guidance

#### LegalGuidanceRequest
Legal guidance requests and responses.

**Fields:**
- `scenario` (Text) - User's legal scenario
- `category` - Guidance category
- `country`, `region` - Location
- `response` (JSON) - AI-generated guidance response

**Relations:**
- Many-to-One with User (CASCADE delete)

**Indexes:** userId, category, createdAt

---

## Relationships Summary

### One-to-One
- User ↔ UserPreferences
- Document ↔ InsurancePolicy
- Document ↔ DriveFile

### One-to-Many
- User → Documents, Events, Tasks, Notifications, ChatMessages
- User → EmailConnections, DriveConnections, InsurancePolicies
- Document → Events, Tasks, ChatMessages
- Event → Reminders, Tasks
- EmailConnection → ProcessedEmails
- DriveConnection → DriveFiles
- InsurancePolicy → InsuranceClaims

---

## Cascade Delete Behavior

**CASCADE** - Child records deleted when parent is deleted:
- User deletion → All user data deleted
- Document deletion → Related events, tasks, messages deleted
- Event deletion → Reminders and related tasks deleted

**SET NULL** - Foreign key set to null when parent is deleted:
- Document deletion → Tasks/ChatMessages remain but unlinked
- Event deletion → Tasks remain but unlinked

---

## Indexes

Indexes are created on:
- All foreign keys for relationship queries
- Status fields for filtering (status, isRead, sent)
- Date fields for range queries (eventDate, dueDate, createdAt, renewalDate)
- Unique identifiers (email, policyNumber, claimNumber, driveFileId)

---

## JSON Fields

Several models use JSON fields for flexible storage:
- `Document.metadata` - Additional document metadata
- `Notification.actions` - Available actions
- `ChatMessage.sources` - Document citations
- `Template.fields` - Form field definitions
- `ProcessedEmail.extractedTerms` - Extracted T&C
- `InsurancePolicy.coverage/benefits/typeSpecificDetails` - Insurance details
- `LegalGuidanceRequest.response` - AI response

---

## Setup Instructions

### 1. Environment Configuration

Create `.env` file:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/personal_legal?schema=public"
```

### 2. Generate Prisma Client

```bash
npx prisma generate
```

### 3. Create Database Migration

```bash
npx prisma migrate dev --name init
```

### 4. Seed Database

```bash
npx prisma db seed
```

---

## Development Commands

```bash
# Format schema
npx prisma format

# Validate schema
npx prisma validate

# Open Prisma Studio (DB GUI)
npx prisma studio

# Generate TypeScript types
npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Seed database
npx prisma db seed
```

---

## Production Deployment

```bash
# Generate client
npx prisma generate

# Run migrations
npx prisma migrate deploy
```

---

## Performance Considerations

1. **Indexes**: All foreign keys and frequently queried fields are indexed
2. **JSON Fields**: Use for flexible data that doesn't need strict schema
3. **Text Fields**: Used for potentially long content (description, content)
4. **Array Fields**: PostgreSQL native arrays for tags, parties, exclusions
5. **Cascading Deletes**: Automatic cleanup of related records

---

## Security

- OAuth tokens stored in TEXT fields for encryption in application layer
- Passwords should be hashed before storage (nullable for OAuth-only users)
- Sensitive fields should be encrypted at application level before storage

---

## Future Enhancements

- [ ] Add audit log table for tracking changes
- [ ] Add soft delete support with `deletedAt` field
- [ ] Add full-text search indexes for searchable content
- [ ] Add database-level encryption for sensitive fields
- [ ] Add row-level security policies
- [ ] Add materialized views for complex queries
- [ ] Add partitioning for large tables (documents, events)

---

## Schema Version

**Current Version**: 1.0.0
**Last Updated**: 2026-01-15
**Prisma Version**: 7.2.0
**Database**: PostgreSQL 14+
