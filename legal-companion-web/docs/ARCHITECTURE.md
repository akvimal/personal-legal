# Architecture Documentation

## System Overview

Personal Legal Companion is a full-stack web application built using modern web technologies with a focus on type safety, performance, and user experience. The architecture follows a client-server model with clear separation of concerns.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client Layer                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Next.js 16 (React 19)                    │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐ │  │
│  │  │   Pages    │  │ Components │  │   Stores   │ │  │
│  │  │ (App Router)│ │    (UI)    │  │  (Zustand) │ │  │
│  │  └────────────┘  └────────────┘  └────────────┘ │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    API Layer (Future)                   │
│  ┌──────────────────────────────────────────────────┐  │
│  │         RESTful API / GraphQL                     │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐ │  │
│  │  │   Auth     │  │  Documents │  │   Events   │ │  │
│  │  │   Service  │  │   Service  │  │   Service  │ │  │
│  │  └────────────┘  └────────────┘  └────────────┘ │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  Data & Services Layer                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐       │
│  │  Database  │  │  File      │  │  AI/LLM    │       │
│  │  (SQL/NoSQL)│ │  Storage   │  │  Service   │       │
│  └────────────┘  └────────────┘  └────────────┘       │
└─────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Technology Stack

#### Core Framework
- **Next.js 16.0.1** - React framework with App Router
- **React 19.2.0** - Component-based UI library
- **TypeScript 5.9.3** - Type-safe JavaScript

#### Styling & UI
- **Tailwind CSS v4** - Utility-first CSS framework
- **Lucide React** - Icon system
- **Custom Components** - Reusable UI component library

#### State Management
- **Zustand 5.0.8** - Lightweight state management
- React Context API - Component-level state
- URL State - Route-based state

#### Utilities
- **date-fns** - Date manipulation
- **clsx** - Conditional class names
- **tailwind-merge** - Merge Tailwind classes

### Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Dashboard
│   ├── documents/               # Document routes
│   │   ├── page.tsx            # Document list
│   │   └── [id]/page.tsx       # Document detail
│   ├── insurance/               # Insurance routes
│   ├── assistant/               # AI assistant
│   ├── legal-help/              # Legal guidance
│   ├── calendar/                # Calendar view
│   ├── tasks/                   # Task management
│   ├── templates/               # Templates
│   ├── notifications/           # Notifications
│   └── settings/                # Settings
│
├── components/                   # React components
│   ├── ui/                      # Base UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   └── input.tsx
│   ├── layout/                  # Layout components
│   │   └── sidebar.tsx
│   └── features/                # Feature components
│       ├── upload-document-modal.tsx
│       └── create-event-modal.tsx
│
├── types/                        # TypeScript definitions
│   └── index.ts                 # Centralized types
│
├── lib/                          # Utilities
│   ├── mock-data.ts             # Development data
│   └── utils.ts                 # Helper functions
│
├── stores/                       # State management
│   └── index.ts                 # Zustand stores
│
├── hooks/                        # Custom React hooks
│   └── use-*.ts
│
└── utils/                        # Additional utilities
```

### Design Patterns

#### 1. Component Architecture

**Atomic Design Principles:**
- **Atoms**: Basic UI elements (Button, Input, Badge)
- **Molecules**: Simple component groups (Card, Modal)
- **Organisms**: Complex components (Sidebar, DocumentList)
- **Templates**: Page layouts
- **Pages**: Complete views

**Component Pattern:**
```tsx
'use client'

import { FC } from 'react'
import { ComponentProps } from './types'

export const Component: FC<ComponentProps> = ({ prop1, prop2 }) => {
  // 1. Hooks (state, effects, custom hooks)
  // 2. Event handlers
  // 3. Derived data
  // 4. Render helpers

  return (
    <div className="component-container">
      {/* JSX */}
    </div>
  )
}
```

#### 2. State Management Strategy

**Local State (useState):**
- Component-specific UI state
- Form inputs
- Toggle states

**Global State (Zustand):**
- User authentication
- Document list
- Events and tasks
- Notifications

**Server State (Future - React Query):**
- API data caching
- Background refetching
- Optimistic updates

**URL State:**
- Filters
- Search queries
- Pagination
- Active document ID

#### 3. Routing Architecture

**App Router Structure:**
```
/                          → Dashboard
/documents                 → Document list
/documents/[id]            → Document detail
/documents/[id]/edit       → Document edit (future)
/insurance                 → Insurance policies
/assistant                 → AI assistant
/legal-help                → Legal guidance
/calendar                  → Event calendar
/tasks                     → Task management
/templates                 → Document templates
/notifications             → Notification center
/settings                  → User settings
```

**Route Features:**
- Server Components (default)
- Client Components (with 'use client')
- Loading states (loading.tsx)
- Error boundaries (error.tsx)
- Dynamic routes ([id])
- Route groups ((auth))

#### 4. Data Flow Pattern

```
User Action → Event Handler → State Update → UI Re-render
                                    │
                                    ├─→ Local State (useState)
                                    ├─→ Global State (Zustand)
                                    └─→ Server State (API call)
```

**Example Flow:**
```tsx
// 1. User clicks upload button
const handleUpload = async (file: File) => {
  // 2. Update loading state
  setIsUploading(true)

  // 3. Call API (future)
  const result = await uploadDocument(file)

  // 4. Update global state
  addDocument(result)

  // 5. Show notification
  showNotification('Document uploaded successfully')

  // 6. Reset loading state
  setIsUploading(false)
}
```

### Styling Architecture

#### Tailwind CSS Configuration

**Custom Theme:**
```typescript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      primary: '#2563EB',      // Blue
      secondary: '#8B5CF6',    // Purple
      success: '#10B981',      // Green
      warning: '#F59E0B',      // Amber
      critical: '#EF4444',     // Red
      neutral: { /* gray scale */ }
    },
    spacing: {
      // Custom spacing scale
    },
    borderRadius: {
      // Custom radius values
    }
  }
}
```

**Utility Patterns:**
```tsx
// Conditional classes
className={cn(
  'base-classes',
  variant === 'primary' && 'primary-classes',
  isDisabled && 'disabled-classes'
)}

// Responsive classes
className="text-sm md:text-base lg:text-lg"

// State-based classes
className="hover:bg-blue-600 focus:ring-2 active:scale-95"
```

#### Component Variants

**Button Variants:**
```tsx
const variants = {
  default: 'bg-neutral-100 hover:bg-neutral-200',
  primary: 'bg-primary text-white hover:bg-blue-600',
  secondary: 'bg-secondary text-white hover:bg-purple-600',
  outline: 'border border-neutral-300 hover:bg-neutral-50',
  ghost: 'hover:bg-neutral-100',
  danger: 'bg-critical text-white hover:bg-red-600'
}
```

### Type System

#### Core Types

**Document Type:**
```typescript
interface Document {
  id: string
  title: string
  category: DocumentCategory
  status: DocumentStatus
  uploadDate: Date
  expiryDate?: Date
  fileUrl: string
  fileType: string
  fileSize: number
  extractedText?: string
  parties: Party[]
  keyTerms: KeyTerm[]
  events: Event[]
  tags: string[]
  metadata: Record<string, any>
}
```

**Event Type:**
```typescript
interface Event {
  id: string
  title: string
  type: EventType
  date: Date
  relatedDocumentId?: string
  description?: string
  status: EventStatus
  reminder?: ReminderConfig
  recurrence?: RecurrenceConfig
}
```

#### Type Safety Patterns

**Discriminated Unions:**
```typescript
type DocumentStatus =
  | 'active'
  | 'expiring_soon'
  | 'expired'
  | 'archived'

type NotificationType =
  | { type: 'deadline'; deadline: Date }
  | { type: 'expiry'; document: Document }
  | { type: 'task'; task: Task }
```

**Generic Types:**
```typescript
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error }
```

## Backend Architecture (Planned)

### API Design

**RESTful Endpoints:**
```
# Authentication
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

# Documents
GET    /api/documents              # List with filters
POST   /api/documents              # Upload
GET    /api/documents/:id          # Get by ID
PUT    /api/documents/:id          # Update
DELETE /api/documents/:id          # Delete
POST   /api/documents/:id/analyze  # AI analysis

# Events
GET    /api/events
POST   /api/events
PUT    /api/events/:id
DELETE /api/events/:id

# Insurance
GET    /api/insurance
POST   /api/insurance
GET    /api/insurance/:id
PUT    /api/insurance/:id

# AI Assistant
POST   /api/assistant/query        # Chat query
GET    /api/assistant/history      # Chat history

# Legal Help
POST   /api/legal-help/query       # Legal guidance
GET    /api/legal-help/scenarios   # Popular scenarios

# Templates
GET    /api/templates              # List templates
POST   /api/templates/:id/generate # Generate document

# Notifications
GET    /api/notifications
PUT    /api/notifications/:id/read
```

### Database Schema

**Core Tables:**
```sql
-- Users
users (
  id, email, name, password_hash,
  created_at, updated_at
)

-- Documents
documents (
  id, user_id, title, category, status,
  file_url, file_type, file_size,
  upload_date, expiry_date,
  extracted_text, metadata,
  created_at, updated_at
)

-- Events
events (
  id, user_id, document_id, title, type,
  date, description, status,
  reminder_config, recurrence_config,
  created_at, updated_at
)

-- Tasks
tasks (
  id, user_id, document_id, event_id,
  title, description, priority, status,
  due_date, completed_at,
  created_at, updated_at
)

-- Insurance Policies
insurance_policies (
  id, user_id, document_id,
  type, provider, policy_number,
  start_date, end_date, premium,
  coverage_details,
  created_at, updated_at
)

-- Notifications
notifications (
  id, user_id, type, title, message,
  priority, read, action_url,
  created_at, read_at
)

-- Chat History
chat_messages (
  id, user_id, role, content,
  document_ids, metadata,
  created_at
)
```

### Service Layer

**Service Architecture:**
```
┌─────────────────────────────────────┐
│         Controller Layer            │
│  (Handle HTTP requests/responses)   │
└─────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│          Service Layer              │
│  ┌──────────┐  ┌──────────┐        │
│  │ Document │  │  Event   │        │
│  │ Service  │  │ Service  │        │
│  └──────────┘  └──────────┘        │
└─────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│        Repository Layer             │
│  (Database access & queries)        │
└─────────────────────────────────────┘
```

**Service Pattern:**
```typescript
class DocumentService {
  constructor(
    private documentRepo: DocumentRepository,
    private storageService: StorageService,
    private aiService: AIService
  ) {}

  async uploadDocument(file: File, userId: string) {
    // 1. Upload file to storage
    const fileUrl = await this.storageService.upload(file)

    // 2. Extract text (OCR/PDF parsing)
    const extractedText = await this.aiService.extractText(fileUrl)

    // 3. Analyze document
    const analysis = await this.aiService.analyzeDocument(extractedText)

    // 4. Create database record
    const document = await this.documentRepo.create({
      userId,
      fileUrl,
      extractedText,
      ...analysis
    })

    // 5. Extract events
    await this.eventService.extractEvents(document)

    return document
  }
}
```

### AI Integration

**LLM Service Architecture:**
```typescript
interface AIService {
  // Document analysis
  extractText(fileUrl: string): Promise<string>
  analyzeDocument(text: string): Promise<DocumentAnalysis>
  extractEvents(text: string): Promise<Event[]>

  // Q&A
  queryDocument(query: string, documentIds: string[]): Promise<AIResponse>

  // Legal guidance
  provideLegalGuidance(scenario: string): Promise<LegalGuidance>
  assessRisk(document: Document): Promise<RiskAssessment>
}
```

**AI Prompts:**
```typescript
const DOCUMENT_ANALYSIS_PROMPT = `
Analyze the following legal document and extract:
1. Document type and category
2. Key parties involved
3. Important dates and deadlines
4. Key terms and obligations
5. Potential risks or red flags

Document text: {text}
`

const LEGAL_GUIDANCE_PROMPT = `
Provide legal guidance for the following scenario:
{scenario}

Include:
1. Overview and considerations
2. Key legal requirements
3. Do's and Don'ts
4. Red flags to watch for
5. Required documents
6. Applicable laws
`
```

## Security Architecture

### Authentication & Authorization

**Auth Flow:**
```
1. User login → Generate JWT token
2. Store token in httpOnly cookie
3. Include token in API requests
4. Verify token on server
5. Authorize based on user role
```

**Security Measures:**
- Password hashing (bcrypt)
- JWT token authentication
- CSRF protection
- Rate limiting
- Input validation & sanitization
- SQL injection prevention
- XSS protection

### Data Security

**Document Storage:**
- Encrypted at rest
- Encrypted in transit (HTTPS)
- Secure file upload validation
- Access control per document
- Audit logging

**Privacy:**
- GDPR compliance
- Data anonymization
- Right to deletion
- Data export functionality

## Performance Optimization

### Frontend Optimization

**Code Splitting:**
```tsx
// Route-based splitting (automatic in Next.js)
const DynamicComponent = dynamic(() => import('./Component'))

// Component-based splitting
const HeavyComponent = lazy(() => import('./HeavyComponent'))
```

**Image Optimization:**
```tsx
import Image from 'next/image'

<Image
  src="/document.png"
  alt="Document"
  width={500}
  height={300}
  loading="lazy"
  placeholder="blur"
/>
```

**Caching Strategy:**
- Static assets: Long-term cache
- API responses: Short-term cache
- Images: CDN with cache headers

### Backend Optimization

**Database Indexing:**
```sql
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_events_date ON events(date);
```

**Query Optimization:**
- Use pagination
- Implement cursor-based pagination for large lists
- Use database views for complex queries
- Cache frequently accessed data

**API Optimization:**
- Response compression (gzip)
- API rate limiting
- Request batching
- GraphQL for flexible queries

## Deployment Architecture

### Development Environment
```
Local Development:
- Next.js dev server (localhost:3000)
- Mock data
- Hot module replacement
```

### Production Environment (Planned)
```
┌─────────────────────────────────────┐
│         CDN (Static Assets)         │
└─────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│      Load Balancer / Nginx          │
└─────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        ▼                 ▼
┌──────────────┐  ┌──────────────┐
│   Next.js    │  │   Next.js    │
│   Server 1   │  │   Server 2   │
└──────────────┘  └──────────────┘
        │                 │
        └────────┬────────┘
                 ▼
┌─────────────────────────────────────┐
│         Database (PostgreSQL)       │
└─────────────────────────────────────┘
```

**Hosting Options:**
- Vercel (recommended for Next.js)
- AWS (EC2 + RDS + S3)
- Google Cloud Platform
- DigitalOcean

## Monitoring & Observability

### Logging
- Application logs (Winston/Pino)
- Error tracking (Sentry)
- Access logs
- Audit logs

### Metrics
- Response times
- Error rates
- API usage
- User activity

### Alerting
- Server downtime
- Error spikes
- Performance degradation
- Security events

## Testing Strategy

### Frontend Testing
```typescript
// Unit tests (Jest + React Testing Library)
test('Button renders correctly', () => {
  render(<Button>Click me</Button>)
  expect(screen.getByText('Click me')).toBeInTheDocument()
})

// Integration tests
test('Document upload flow', async () => {
  // Test user flow
})

// E2E tests (Playwright/Cypress)
test('User can upload and view document', async ({ page }) => {
  // Test full user journey
})
```

### Backend Testing
```typescript
// Unit tests
describe('DocumentService', () => {
  test('uploads document successfully', async () => {
    // Test service logic
  })
})

// Integration tests
describe('POST /api/documents', () => {
  test('creates document with valid data', async () => {
    // Test API endpoint
  })
})
```

## Future Enhancements

### Planned Features
- Real-time collaboration
- Mobile app (React Native)
- Document version control
- Advanced search (Elasticsearch)
- Calendar integrations
- Email notifications
- Webhook support
- API for third-party integrations

### Scalability Considerations
- Microservices architecture
- Message queue (RabbitMQ/Kafka)
- Caching layer (Redis)
- Database sharding
- Horizontal scaling
- Background job processing

## Conclusion

This architecture provides a solid foundation for a scalable, maintainable, and secure personal legal assistant application. The modular design allows for incremental development and easy addition of new features.
