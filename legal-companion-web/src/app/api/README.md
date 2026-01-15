# API Documentation

Comprehensive RESTful API for the Personal Legal Companion application built with Next.js App Router and Prisma ORM.

## Base URL

```
http://localhost:3002/api
```

## Authentication

All protected endpoints require a JWT bearer token in the Authorization header:

```
Authorization: Bearer <your_access_token>
```

### Token Generation

Tokens are generated on:
- User registration (`POST /api/auth/register`)
- User login (`POST /api/auth/login`)
- Token refresh (`POST /api/auth/refresh`)

### Token Expiration

- Access Token: 7 days
- Refresh Token: 30 days

---

## Response Format

All API responses follow a standardized format:

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }
  }
}
```

### Common Error Codes

- `BAD_REQUEST` (400) - Invalid request data
- `UNAUTHORIZED` (401) - Missing or invalid authentication
- `FORBIDDEN` (403) - Insufficient permissions
- `NOT_FOUND` (404) - Resource not found
- `CONFLICT` (409) - Resource conflict (e.g., duplicate email)
- `VALIDATION_ERROR` (422) - Request validation failed
- `INTERNAL_ERROR` (500) - Internal server error

---

## Endpoints

### Authentication

#### Register User

```http
POST /api/auth/register
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "fullName": "John Doe",
  "location": "Chennai, Tamil Nadu, India" // optional
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "location": "Chennai, Tamil Nadu, India",
      "createdAt": "2026-01-15T10:00:00.000Z",
      "updatedAt": "2026-01-15T10:00:00.000Z"
    },
    "accessToken": "jwt_token",
    "refreshToken": "jwt_refresh_token",
    "expiresIn": "7d"
  }
}
```

---

#### Login

```http
POST /api/auth/login
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "jwt_token",
    "refreshToken": "jwt_refresh_token",
    "expiresIn": "7d"
  }
}
```

---

#### Get Current User

```http
GET /api/auth/me
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "preferences": {
        "country": "India",
        "language": "en",
        "emailNotifications": true,
        ...
      },
      ...
    }
  }
}
```

---

#### Refresh Token

```http
POST /api/auth/refresh
```

**Request Body:**

```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "new_jwt_token",
    "expiresIn": "7d"
  }
}
```

---

#### Logout

```http
POST /api/auth/logout
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

---

### Documents

#### List Documents

```http
GET /api/documents
```

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

- `page` (integer, default: 1) - Page number
- `limit` (integer, default: 10, max: 100) - Items per page
- `category` (string) - Filter by category (employment, property, business, financial, insurance, consumer, family, legal)
- `status` (string) - Filter by status (active, expiring_soon, expired, archived)
- `search` (string) - Search in title, type, parties, tags

**Example:**

```
GET /api/documents?page=1&limit=10&category=employment&status=active
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Employment Agreement - Acme Corp",
      "category": "employment",
      "documentType": "Employment Contract",
      "status": "active",
      "filePath": "/documents/employment-acme-2024.pdf",
      "fileType": "application/pdf",
      "fileSize": 1024000,
      "pages": 12,
      "uploadedAt": "2024-01-15T10:00:00.000Z",
      "signedDate": "2024-01-15T00:00:00.000Z",
      "startDate": "2024-02-01T00:00:00.000Z",
      "endDate": "2026-01-31T00:00:00.000Z",
      "parties": ["John Doe", "Acme Corporation"],
      "tags": ["employment", "contract", "full-time"],
      "country": "India",
      "region": "Tamil Nadu",
      "language": "en",
      "_count": {
        "events": 3,
        "tasks": 2
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25
  }
}
```

---

#### Get Document by ID

```http
GET /api/documents/{id}
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

Returns document with related events, tasks, insurance policy, and drive file.

---

#### Create Document

```http
POST /api/documents
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "title": "Employment Agreement",
  "category": "employment",
  "documentType": "Employment Contract",
  "status": "active",
  "filePath": "/documents/employment-2024.pdf",
  "fileType": "application/pdf",
  "fileSize": 1024000,
  "pages": 12,
  "signedDate": "2024-01-15",
  "startDate": "2024-02-01",
  "endDate": "2026-01-31",
  "parties": ["John Doe", "Acme Corp"],
  "tags": ["employment", "contract"],
  "country": "India",
  "region": "Tamil Nadu",
  "language": "en",
  "metadata": {}
}
```

**Required Fields:**
- title, category, documentType, filePath, fileType, fileSize, country, region

**Response:** `201 Created`

---

#### Update Document

```http
PUT /api/documents/{id}
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:** Partial document object

**Response:** `200 OK`

---

#### Delete Document

```http
DELETE /api/documents/{id}
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

---

#### Analyze Document (AI)

```http
POST /api/documents/{id}/analyze
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

*Note: AI analysis is a placeholder. Will be implemented in Issue #10.*

---

### Events

#### List Events

```http
GET /api/events
```

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

- `page`, `limit` - Pagination
- `status` (string) - Filter by status (upcoming, completed, missed, dismissed)
- `priority` (string) - Filter by priority (critical, high, medium, low)
- `eventType` (string) - Filter by type (contract_expiry, payment_due, renewal_date, review_date, obligation_end, milestone)
- `documentId` (uuid) - Filter by document
- `startDate` (ISO date) - Filter events from this date
- `endDate` (ISO date) - Filter events until this date

**Response:** `200 OK`

Returns events with document details, reminders, and task counts.

---

#### Create Event

```http
POST /api/events
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "documentId": "uuid",
  "eventType": "contract_expiry",
  "title": "Contract Expiry",
  "description": "Employment contract expiry",
  "eventDate": "2026-01-31",
  "priority": "high",
  "isRecurring": false,
  "recurrencePattern": null,
  "responsibleParty": "John Doe",
  "consequence": "Contract renewal required",
  "advanceNoticeDays": 60,
  "status": "upcoming",
  "reminderDays": [7, 14, 30]
}
```

**Required Fields:**
- documentId, eventType, title, eventDate, priority

**Response:** `201 Created`

---

#### Get Event by ID

```http
GET /api/events/{id}
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

---

#### Update Event

```http
PUT /api/events/{id}
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

---

#### Delete Event

```http
DELETE /api/events/{id}
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

---

### Tasks

#### List Tasks

```http
GET /api/tasks
```

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

- `page`, `limit` - Pagination
- `status` (string) - Filter by status (pending, in_progress, completed)
- `priority` (string) - Filter by priority (critical, high, medium, low)
- `documentId` (uuid) - Filter by document
- `eventId` (uuid) - Filter by event
- `overdue` (boolean) - Filter overdue tasks (true/false)

**Response:** `200 OK`

Returns tasks with document and event details.

---

#### Create Task

```http
POST /api/tasks
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "documentId": "uuid",
  "eventId": "uuid",
  "title": "Review contract terms",
  "description": "Review all clauses before renewal",
  "dueDate": "2025-12-01",
  "priority": "high",
  "status": "pending"
}
```

**Required Fields:**
- title, priority

**Response:** `201 Created`

---

#### Get Task by ID

```http
GET /api/tasks/{id}
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

---

#### Update Task

```http
PUT /api/tasks/{id}
```

**Headers:** `Authorization: Bearer <token>`

**Note:** When status is changed to 'completed', `completedAt` is automatically set.

**Response:** `200 OK`

---

#### Delete Task

```http
DELETE /api/tasks/{id}
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

---

### Insurance

#### List Insurance Policies

```http
GET /api/insurance/policies
```

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

- `page`, `limit` - Pagination
- `insuranceType` (string) - Filter by type (health, auto, life, property, travel, other)
- `status` (string) - Filter by status (active, expiring_soon, expired, lapsed, claimed)
- `expiringSoon` (boolean) - Filter policies expiring within 30 days (true/false)

**Response:** `200 OK`

Returns policies with document details and claims count.

---

#### Create Insurance Policy

```http
POST /api/insurance/policies
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "documentId": "uuid",
  "policyNumber": "POL-2024-001",
  "insuranceType": "health",
  "provider": "HDFC ERGO",
  "policyHolder": "John Doe",
  "insuredMembers": ["John Doe", "Jane Doe"],
  "premiumAmount": 15000,
  "premiumFrequency": "yearly",
  "coverageAmount": 500000,
  "startDate": "2024-01-01",
  "endDate": "2025-01-01",
  "renewalDate": "2025-01-01",
  "gracePeriod": 30,
  "status": "active",
  "coverage": { ... },
  "exclusions": ["Pre-existing conditions"],
  "benefits": { ... },
  "healthInsurance": { ... }
}
```

**Required Fields:**
- documentId, policyNumber, insuranceType, provider, policyHolder, premiumAmount, premiumFrequency, coverageAmount, startDate, endDate, renewalDate, coverage

**Response:** `201 Created`

---

#### Get Insurance Summary

```http
GET /api/insurance/summary
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "totalPolicies": 5,
    "activePolicies": 4,
    "totalAnnualPremium": 75000,
    "totalCoverage": 2500000,
    "byType": {
      "health": 2,
      "auto": 1,
      "life": 1,
      "property": 1
    },
    "expiringSoon": 2,
    "claims": {
      "total": 3,
      "pending": 1,
      "approved": 2
    }
  }
}
```

---

### Notifications

#### List Notifications

```http
GET /api/notifications
```

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

- `page`, `limit` - Pagination
- `isRead` (boolean) - Filter by read status (true/false)
- `type` (string) - Filter by type (critical, warning, info, success)

**Response:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "warning",
      "title": "Contract Expiry",
      "message": "Your employment contract expires in 30 days",
      "documentId": "uuid",
      "eventId": "uuid",
      "taskId": null,
      "isRead": false,
      "readAt": null,
      "actions": null,
      "createdAt": "2026-01-15T10:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "unreadCount": 5
  }
}
```

---

#### Mark Notification as Read

```http
PUT /api/notifications/{id}
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

---

#### Mark All Notifications as Read

```http
PUT /api/notifications/mark-all-read
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "message": "All notifications marked as read",
    "count": 5
  }
}
```

---

#### Delete Notification

```http
DELETE /api/notifications/{id}
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

---

## Rate Limiting

Rate limiting is not yet implemented but will be added in future updates.

Planned limits:
- Authentication endpoints: 10 requests per minute
- Regular endpoints: 100 requests per minute

---

## CORS

CORS is configured to allow requests from the Next.js frontend.

---

## Environment Variables

Required environment variables:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/personal_legal"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
NODE_ENV="development"
```

---

## Testing

### Using cURL

**Register:**

```bash
curl -X POST http://localhost:3002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123",
    "fullName": "Test User"
  }'
```

**Login:**

```bash
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123"
  }'
```

**Get Documents:**

```bash
curl -X GET http://localhost:3002/api/documents \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Using Postman

1. Import the base URL: `http://localhost:3002/api`
2. Create an environment variable for `access_token`
3. Set Authorization header: `Bearer {{access_token}}`
4. Test all endpoints

---

## Database

The API uses Prisma ORM with PostgreSQL. See `prisma/README.md` for database schema documentation.

---

## Error Handling

All errors are caught and formatted consistently:

1. **Validation Errors** - 422 with field-level details
2. **Authentication Errors** - 401 with message
3. **Authorization Errors** - 403 with message
4. **Not Found Errors** - 404 with resource type
5. **Database Errors** - 500 with generic message (details logged server-side)

---

## Security Best Practices

1. **Passwords** - Hashed with bcrypt (10 rounds)
2. **JWT Tokens** - Signed with HS256 algorithm
3. **SQL Injection** - Protected by Prisma parameterized queries
4. **XSS Protection** - Next.js auto-escaping
5. **CSRF Protection** - Stateless JWT approach
6. **Input Validation** - Server-side validation on all inputs

---

## Future Enhancements

- [ ] WebSocket support for real-time notifications
- [ ] File upload endpoints with S3 integration
- [ ] OAuth2 integration (Google, Microsoft)
- [ ] API rate limiting with Redis
- [ ] OpenAPI/Swagger documentation
- [ ] API versioning (v2, v3)
- [ ] Webhook support for external integrations
- [ ] Advanced search with ElasticSearch
- [ ] Caching with Redis
- [ ] Request logging and analytics

---

## Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/yourusername/personal-legal/issues)
- Email: support@personallegal.com

---

**Version:** 1.0.0
**Last Updated:** 2026-01-15
**API Status:** Production Ready ✅
