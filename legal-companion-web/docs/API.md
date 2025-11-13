# API Documentation

API reference for the Personal Legal Companion backend (planned implementation).

## Base URL

```
Development: http://localhost:8000/api
Production: https://api.legalcompanion.com/api
```

## Authentication

All API requests (except authentication endpoints) require a valid JWT token.

### Request Headers

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Error Response Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

---

## Authentication Endpoints

### Register User

Create a new user account.

```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": "usr_123",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `400` - Invalid input
- `409` - Email already exists

---

### Login

Authenticate and receive a JWT token.

```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "usr_123",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `401` - Invalid credentials

---

### Get Current User

Get authenticated user's profile.

```http
GET /auth/me
```

**Response:** `200 OK`
```json
{
  "id": "usr_123",
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-20T14:20:00Z"
}
```

---

### Logout

Invalidate the current token.

```http
POST /auth/logout
```

**Response:** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

---

## Document Endpoints

### List Documents

Get all documents for the authenticated user.

```http
GET /documents
```

**Query Parameters:**
- `category` (optional) - Filter by category
- `status` (optional) - Filter by status
- `search` (optional) - Search in title and content
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20)
- `sortBy` (optional) - Sort field (default: uploadDate)
- `sortOrder` (optional) - asc or desc (default: desc)

**Example:**
```http
GET /documents?category=employment&status=active&page=1&limit=10
```

**Response:** `200 OK`
```json
{
  "documents": [
    {
      "id": "doc_123",
      "title": "Employment Contract",
      "category": "employment",
      "status": "active",
      "uploadDate": "2024-01-15T10:30:00Z",
      "expiryDate": "2025-01-15T00:00:00Z",
      "fileUrl": "https://storage.example.com/documents/doc_123.pdf",
      "fileType": "application/pdf",
      "fileSize": 2457600,
      "parties": [
        {
          "name": "John Doe",
          "role": "employee",
          "email": "john@example.com"
        },
        {
          "name": "Acme Corp",
          "role": "employer"
        }
      ],
      "tags": ["employment", "contract", "full-time"],
      "metadata": {
        "pageCount": 12,
        "language": "en"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

---

### Get Document by ID

Get a specific document's details.

```http
GET /documents/:id
```

**Response:** `200 OK`
```json
{
  "id": "doc_123",
  "title": "Employment Contract",
  "category": "employment",
  "status": "active",
  "uploadDate": "2024-01-15T10:30:00Z",
  "expiryDate": "2025-01-15T00:00:00Z",
  "fileUrl": "https://storage.example.com/documents/doc_123.pdf",
  "fileType": "application/pdf",
  "fileSize": 2457600,
  "extractedText": "Full text content...",
  "parties": [...],
  "keyTerms": [
    {
      "term": "Salary",
      "value": "$80,000 per year",
      "section": "Compensation"
    }
  ],
  "events": [
    {
      "id": "evt_456",
      "title": "Contract Renewal",
      "date": "2025-01-15T00:00:00Z"
    }
  ],
  "tags": ["employment", "contract"],
  "metadata": {}
}
```

**Errors:**
- `404` - Document not found

---

### Upload Document

Upload a new document.

```http
POST /documents
```

**Request:** `multipart/form-data`
```
file: <file>
title: "Employment Contract"
category: "employment"
tags: ["employment", "contract"]
expiryDate: "2025-01-15"
metadata: {"notes": "Important contract"}
```

**Response:** `201 Created`
```json
{
  "id": "doc_123",
  "title": "Employment Contract",
  "category": "employment",
  "status": "active",
  "uploadDate": "2024-01-15T10:30:00Z",
  "fileUrl": "https://storage.example.com/documents/doc_123.pdf",
  "processingStatus": "pending"
}
```

**Processing Pipeline:**
1. File uploaded to storage
2. Text extraction (OCR/PDF parsing)
3. AI analysis and event extraction
4. Document ready for use

**Errors:**
- `400` - Invalid file or data
- `413` - File too large (max 50MB)
- `415` - Unsupported file type

---

### Update Document

Update document metadata.

```http
PUT /documents/:id
```

**Request Body:**
```json
{
  "title": "Updated Employment Contract",
  "category": "employment",
  "status": "active",
  "expiryDate": "2025-06-15T00:00:00Z",
  "tags": ["employment", "contract", "updated"]
}
```

**Response:** `200 OK`
```json
{
  "id": "doc_123",
  "title": "Updated Employment Contract",
  "category": "employment",
  "status": "active",
  "updatedAt": "2024-01-20T15:30:00Z"
}
```

**Errors:**
- `404` - Document not found
- `400` - Invalid data

---

### Delete Document

Delete a document permanently.

```http
DELETE /documents/:id
```

**Response:** `204 No Content`

**Errors:**
- `404` - Document not found

---

### Analyze Document

Trigger AI analysis of document.

```http
POST /documents/:id/analyze
```

**Request Body:**
```json
{
  "analysisType": "full", // or "events", "risk", "terms"
  "options": {
    "extractEvents": true,
    "assessRisk": true,
    "identifyParties": true
  }
}
```

**Response:** `200 OK`
```json
{
  "analysis": {
    "documentType": "Employment Contract",
    "parties": [...],
    "keyTerms": [...],
    "events": [...],
    "riskAssessment": {
      "overallRisk": "low",
      "flags": []
    },
    "summary": "This is an employment contract between..."
  }
}
```

---

## Event Endpoints

### List Events

Get all events for the authenticated user.

```http
GET /events
```

**Query Parameters:**
- `type` (optional) - Filter by event type
- `status` (optional) - Filter by status
- `startDate` (optional) - Filter events after this date
- `endDate` (optional) - Filter events before this date
- `documentId` (optional) - Filter by related document

**Response:** `200 OK`
```json
{
  "events": [
    {
      "id": "evt_123",
      "title": "Contract Renewal Deadline",
      "type": "deadline",
      "date": "2025-01-15T00:00:00Z",
      "status": "upcoming",
      "relatedDocumentId": "doc_123",
      "reminder": {
        "enabled": true,
        "advanceDays": 30
      },
      "description": "Employment contract renewal deadline"
    }
  ]
}
```

---

### Create Event

Create a new event.

```http
POST /events
```

**Request Body:**
```json
{
  "title": "Contract Renewal",
  "type": "deadline",
  "date": "2025-01-15T00:00:00Z",
  "relatedDocumentId": "doc_123",
  "description": "Renew employment contract",
  "reminder": {
    "enabled": true,
    "advanceDays": 30
  },
  "recurrence": {
    "enabled": false
  }
}
```

**Response:** `201 Created`
```json
{
  "id": "evt_456",
  "title": "Contract Renewal",
  "type": "deadline",
  "date": "2025-01-15T00:00:00Z",
  "status": "upcoming",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

---

### Update Event

Update an event.

```http
PUT /events/:id
```

**Request Body:** (same as create)

**Response:** `200 OK`

---

### Delete Event

Delete an event.

```http
DELETE /events/:id
```

**Response:** `204 No Content`

---

## Insurance Endpoints

### List Insurance Policies

Get all insurance policies.

```http
GET /insurance
```

**Query Parameters:**
- `type` - Filter by insurance type
- `status` - Filter by status

**Response:** `200 OK`
```json
{
  "policies": [
    {
      "id": "ins_123",
      "type": "health",
      "provider": "ABC Insurance",
      "policyNumber": "POL-123456",
      "startDate": "2024-01-01T00:00:00Z",
      "endDate": "2024-12-31T23:59:59Z",
      "premium": 5000,
      "premiumFrequency": "annual",
      "coverageAmount": 500000,
      "status": "active",
      "documentId": "doc_789"
    }
  ]
}
```

---

### Create Insurance Policy

Create a new insurance policy.

```http
POST /insurance
```

**Request Body:**
```json
{
  "type": "health",
  "provider": "ABC Insurance",
  "policyNumber": "POL-123456",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "premium": 5000,
  "premiumFrequency": "annual",
  "coverageAmount": 500000,
  "documentId": "doc_789",
  "coverageDetails": {
    "hospitalCoverage": true,
    "ambulanceCoverage": true
  }
}
```

**Response:** `201 Created`

---

### Get Insurance Policy

Get a specific insurance policy.

```http
GET /insurance/:id
```

**Response:** `200 OK`

---

### Update Insurance Policy

Update an insurance policy.

```http
PUT /insurance/:id
```

**Response:** `200 OK`

---

### Delete Insurance Policy

Delete an insurance policy.

```http
DELETE /insurance/:id
```

**Response:** `204 No Content`

---

## AI Assistant Endpoints

### Query Documents

Ask questions about documents.

```http
POST /assistant/query
```

**Request Body:**
```json
{
  "query": "What is my salary according to the employment contract?",
  "documentIds": ["doc_123"],
  "conversationId": "conv_456" // optional, for continuing conversation
}
```

**Response:** `200 OK`
```json
{
  "response": "According to your employment contract, your annual salary is $80,000.",
  "sources": [
    {
      "documentId": "doc_123",
      "documentTitle": "Employment Contract",
      "excerpt": "...annual salary of $80,000...",
      "page": 3
    }
  ],
  "conversationId": "conv_456"
}
```

---

### Get Chat History

Get conversation history.

```http
GET /assistant/history
```

**Query Parameters:**
- `conversationId` (optional) - Get specific conversation
- `limit` (optional) - Number of messages

**Response:** `200 OK`
```json
{
  "conversations": [
    {
      "id": "conv_456",
      "messages": [
        {
          "id": "msg_1",
          "role": "user",
          "content": "What is my salary?",
          "timestamp": "2024-01-15T10:30:00Z"
        },
        {
          "id": "msg_2",
          "role": "assistant",
          "content": "Your annual salary is $80,000.",
          "timestamp": "2024-01-15T10:30:05Z",
          "sources": [...]
        }
      ],
      "updatedAt": "2024-01-15T10:30:05Z"
    }
  ]
}
```

---

## Legal Help Endpoints

### Get Legal Guidance

Get AI-powered legal guidance for a scenario.

```http
POST /legal-help/query
```

**Request Body:**
```json
{
  "scenario": "I want to rent an apartment",
  "context": {
    "country": "India",
    "region": "Tamil Nadu"
  },
  "details": "Looking to rent a 2BHK apartment..."
}
```

**Response:** `200 OK`
```json
{
  "guidance": {
    "overview": "When renting an apartment in Tamil Nadu...",
    "keyConsiderations": [
      "Verify ownership documents",
      "Check rent control regulations"
    ],
    "dos": [
      "Sign a written rental agreement",
      "Verify property ownership"
    ],
    "donts": [
      "Don't pay large advance without agreement",
      "Don't skip police verification"
    ],
    "redFlags": [
      "Owner refusing written agreement",
      "Unusually low rent"
    ],
    "requiredDocuments": [
      "Rental Agreement",
      "Owner's property documents",
      "Police verification form"
    ],
    "applicableLaws": [
      "Tamil Nadu Rent Control Act",
      "Transfer of Property Act"
    ],
    "checklist": [
      {
        "item": "Verify property ownership",
        "completed": false
      }
    ],
    "needsLawyer": false,
    "riskLevel": "medium"
  }
}
```

---

### Get Popular Scenarios

Get list of popular legal scenarios.

```http
GET /legal-help/scenarios
```

**Query Parameters:**
- `category` (optional) - Filter by category

**Response:** `200 OK`
```json
{
  "scenarios": [
    {
      "id": "scenario_1",
      "title": "Renting an Apartment",
      "category": "property",
      "description": "Legal guidance for renting residential property",
      "icon": "home"
    }
  ]
}
```

---

## Template Endpoints

### List Templates

Get available document templates.

```http
GET /templates
```

**Query Parameters:**
- `category` (optional) - Filter by category
- `country` (optional) - Filter by country
- `region` (optional) - Filter by region

**Response:** `200 OK`
```json
{
  "templates": [
    {
      "id": "tmpl_123",
      "name": "Rental Agreement",
      "category": "property",
      "description": "Standard rental agreement template",
      "country": "India",
      "region": "Tamil Nadu",
      "fields": [
        {
          "id": "landlord_name",
          "label": "Landlord Name",
          "type": "text",
          "required": true
        }
      ]
    }
  ]
}
```

---

### Generate Document from Template

Generate a document using a template.

```http
POST /templates/:id/generate
```

**Request Body:**
```json
{
  "fields": {
    "landlord_name": "John Doe",
    "tenant_name": "Jane Smith",
    "monthly_rent": 15000,
    "property_address": "123 Main St"
  },
  "format": "pdf" // or "docx"
}
```

**Response:** `200 OK`
```json
{
  "documentUrl": "https://storage.example.com/generated/doc_789.pdf",
  "documentId": "doc_789"
}
```

---

## Notification Endpoints

### List Notifications

Get user notifications.

```http
GET /notifications
```

**Query Parameters:**
- `type` (optional) - Filter by type
- `read` (optional) - Filter by read status
- `page`, `limit` - Pagination

**Response:** `200 OK`
```json
{
  "notifications": [
    {
      "id": "notif_123",
      "type": "deadline",
      "priority": "high",
      "title": "Contract Expiring Soon",
      "message": "Your employment contract expires in 30 days",
      "actionUrl": "/documents/doc_123",
      "read": false,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "unreadCount": 5
}
```

---

### Mark Notification as Read

Mark a notification as read.

```http
PUT /notifications/:id/read
```

**Response:** `200 OK`
```json
{
  "id": "notif_123",
  "read": true,
  "readAt": "2024-01-15T11:00:00Z"
}
```

---

### Mark All as Read

Mark all notifications as read.

```http
PUT /notifications/read-all
```

**Response:** `200 OK`
```json
{
  "message": "All notifications marked as read"
}
```

---

## Task Endpoints

### List Tasks

Get all tasks.

```http
GET /tasks
```

**Query Parameters:**
- `status` - Filter by status
- `priority` - Filter by priority

**Response:** `200 OK`
```json
{
  "tasks": [
    {
      "id": "task_123",
      "title": "Review employment contract",
      "description": "Review and sign the updated contract",
      "priority": "high",
      "status": "pending",
      "dueDate": "2024-01-20T00:00:00Z",
      "relatedDocumentId": "doc_123",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### Create Task

Create a new task.

```http
POST /tasks
```

**Request Body:**
```json
{
  "title": "Review contract",
  "description": "Review employment contract terms",
  "priority": "high",
  "dueDate": "2024-01-20",
  "relatedDocumentId": "doc_123"
}
```

**Response:** `201 Created`

---

### Update Task

Update a task.

```http
PUT /tasks/:id
```

**Response:** `200 OK`

---

### Delete Task

Delete a task.

```http
DELETE /tasks/:id
```

**Response:** `204 No Content`

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| `INVALID_INPUT` | Invalid input data | Request validation failed |
| `UNAUTHORIZED` | Unauthorized | No or invalid authentication token |
| `FORBIDDEN` | Forbidden | Insufficient permissions |
| `NOT_FOUND` | Resource not found | Requested resource doesn't exist |
| `CONFLICT` | Resource conflict | Resource already exists |
| `FILE_TOO_LARGE` | File too large | File exceeds size limit |
| `UNSUPPORTED_TYPE` | Unsupported file type | File type not supported |
| `RATE_LIMIT` | Rate limit exceeded | Too many requests |
| `SERVER_ERROR` | Internal server error | Unexpected server error |

---

## Rate Limiting

API requests are rate-limited per user:
- 100 requests per minute (general endpoints)
- 10 requests per minute (AI endpoints)
- 20 uploads per hour

Rate limit headers:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1642248000
```

---

## Webhooks (Future)

Configure webhooks to receive real-time updates.

### Events

- `document.uploaded`
- `document.analyzed`
- `event.upcoming`
- `task.due`
- `notification.created`

### Webhook Payload

```json
{
  "event": "document.uploaded",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "documentId": "doc_123",
    "title": "Employment Contract"
  }
}
```

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import { LegalCompanionAPI } from '@legal-companion/sdk'

const api = new LegalCompanionAPI({
  apiKey: process.env.API_KEY
})

// Upload document
const document = await api.documents.upload({
  file: fileBuffer,
  title: 'Employment Contract',
  category: 'employment'
})

// Query AI assistant
const response = await api.assistant.query({
  query: 'What is my salary?',
  documentIds: [document.id]
})
```

---

## Testing

### Test Environment

```
Base URL: https://api-staging.legalcompanion.com/api
```

### Test Credentials

Contact support for test account credentials.

---

## Support

For API support:
- Email: api-support@legalcompanion.com
- Documentation: https://docs.legalcompanion.com
- Status: https://status.legalcompanion.com
