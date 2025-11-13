# Type System Documentation

Complete reference for all TypeScript types and interfaces in the Personal Legal Companion application.

**Location:** `src/types/index.ts`

## Table of Contents

- [Core Types](#core-types)
- [Document Types](#document-types)
- [Event Types](#event-types)
- [Task Types](#task-types)
- [Notification Types](#notification-types)
- [Insurance Types](#insurance-types)
- [Chat & AI Types](#chat--ai-types)
- [Template Types](#template-types)
- [Legal Guidance Types](#legal-guidance-types)
- [Integration Types](#integration-types)
- [User Preference Types](#user-preference-types)

---

## Core Types

### Priority Levels

```typescript
type Priority = 'critical' | 'high' | 'medium' | 'low'
```

Used throughout the application for tasks, events, and notifications.

---

## Document Types

### DocumentCategory

```typescript
type DocumentCategory =
  | 'employment'
  | 'property'
  | 'business'
  | 'financial'
  | 'insurance'
  | 'consumer'
  | 'family'
  | 'legal'
```

Categories for organizing legal documents.

### DocumentStatus

```typescript
type DocumentStatus =
  | 'active'
  | 'expiring_soon'
  | 'expired'
  | 'archived'
```

Lifecycle status of a document.

### Document

Main document interface representing a legal document.

```typescript
interface Document {
  id: string
  title: string
  category: DocumentCategory
  documentType: string
  status: DocumentStatus
  filePath: string
  fileType: string
  fileSize: number
  pages?: number
  uploadedAt: Date
  signedDate?: Date
  startDate?: Date
  endDate?: Date
  parties: string[]
  tags: string[]
  country: string
  region: string
  language: string
  metadata?: Record<string, any>
  upcomingEvents: number
  pendingTasks: number
}
```

**Key Fields:**
- `id` - Unique document identifier
- `category` - Document category for organization
- `status` - Current lifecycle status
- `parties` - Names of involved parties
- `tags` - User-defined tags for searching
- `upcomingEvents` - Count of upcoming events
- `pendingTasks` - Count of pending tasks

**Example:**
```typescript
const document: Document = {
  id: 'doc_123',
  title: 'Employment Contract',
  category: 'employment',
  documentType: 'Contract',
  status: 'active',
  filePath: '/documents/contract.pdf',
  fileType: 'application/pdf',
  fileSize: 2457600,
  pages: 12,
  uploadedAt: new Date('2024-01-15'),
  signedDate: new Date('2024-01-10'),
  startDate: new Date('2024-01-15'),
  endDate: new Date('2025-01-15'),
  parties: ['John Doe', 'Acme Corp'],
  tags: ['employment', 'contract'],
  country: 'India',
  region: 'Tamil Nadu',
  language: 'en',
  upcomingEvents: 2,
  pendingTasks: 1
}
```

---

## Event Types

### EventType

```typescript
type EventType =
  | 'contract_expiry'
  | 'payment_due'
  | 'renewal_date'
  | 'review_date'
  | 'obligation_end'
  | 'milestone'
```

Types of calendar events extracted from documents.

### Event

Calendar event or deadline extracted from documents.

```typescript
interface Event {
  id: string
  documentId: string
  eventType: EventType
  title: string
  description: string
  eventDate: Date
  priority: Priority
  isRecurring: boolean
  recurrencePattern?: string
  responsibleParty?: string
  consequence?: string
  advanceNoticeDays?: number
  status: 'upcoming' | 'completed' | 'missed' | 'dismissed'
  reminders: Reminder[]
}
```

**Example:**
```typescript
const event: Event = {
  id: 'evt_456',
  documentId: 'doc_123',
  eventType: 'contract_expiry',
  title: 'Employment Contract Expiry',
  description: 'Contract expires and requires renewal',
  eventDate: new Date('2025-01-15'),
  priority: 'high',
  isRecurring: false,
  responsibleParty: 'John Doe',
  consequence: 'Contract becomes void',
  advanceNoticeDays: 30,
  status: 'upcoming',
  reminders: [...]
}
```

### Reminder

Reminder configuration for events.

```typescript
interface Reminder {
  id: string
  eventId: string
  daysBefore: number
  sent: boolean
  sentAt?: Date
}
```

---

## Task Types

### Task

Action items related to documents or events.

```typescript
interface Task {
  id: string
  documentId?: string
  eventId?: string
  title: string
  description?: string
  dueDate?: Date
  priority: Priority
  status: 'pending' | 'in_progress' | 'completed'
  completedAt?: Date
  createdAt: Date
}
```

**Example:**
```typescript
const task: Task = {
  id: 'task_789',
  documentId: 'doc_123',
  title: 'Review employment contract',
  description: 'Review updated terms before renewal',
  dueDate: new Date('2024-12-15'),
  priority: 'high',
  status: 'pending',
  createdAt: new Date('2024-11-01')
}
```

---

## Notification Types

### Notification

Alert messages for users.

```typescript
interface Notification {
  id: string
  type: 'critical' | 'warning' | 'info' | 'success'
  title: string
  message: string
  documentId?: string
  eventId?: string
  taskId?: string
  isRead: boolean
  readAt?: Date
  createdAt: Date
  actions?: NotificationAction[]
}
```

### NotificationAction

Action buttons in notifications.

```typescript
interface NotificationAction {
  label: string
  action: string
  variant?: 'primary' | 'secondary' | 'danger'
}
```

**Example:**
```typescript
const notification: Notification = {
  id: 'notif_111',
  type: 'warning',
  title: 'Contract Expiring Soon',
  message: 'Your employment contract expires in 30 days',
  documentId: 'doc_123',
  isRead: false,
  createdAt: new Date(),
  actions: [
    {
      label: 'View Document',
      action: '/documents/doc_123',
      variant: 'primary'
    }
  ]
}
```

---

## Insurance Types

### InsuranceType

```typescript
type InsuranceType =
  | 'health'
  | 'auto'
  | 'life'
  | 'property'
  | 'travel'
  | 'other'
```

### InsurancePolicy

Comprehensive insurance policy information.

```typescript
interface InsurancePolicy {
  // Basic Info
  id: string
  documentId: string
  policyNumber: string
  insuranceType: InsuranceType
  provider: string
  policyHolder: string
  insuredMembers?: string[]

  // Financial
  premiumAmount: number
  premiumFrequency: 'monthly' | 'quarterly' | 'half-yearly' | 'yearly'
  coverageAmount: number

  // Dates
  startDate: Date
  endDate: Date
  renewalDate: Date
  gracePeriod?: number

  // Status
  status: 'active' | 'expiring_soon' | 'expired' | 'lapsed' | 'claimed'

  // Coverage
  coverage: {
    type: string
    amount: number
    description?: string
  }[]

  exclusions?: string[]

  benefits?: {
    name: string
    description: string
    limit?: number
  }[]

  claims?: InsuranceClaim[]

  // Type-specific details
  healthInsurance?: HealthInsuranceDetails
  autoInsurance?: AutoInsuranceDetails
  lifeInsurance?: LifeInsuranceDetails
  propertyInsurance?: PropertyInsuranceDetails

  metadata?: Record<string, any>
}
```

### Type-Specific Insurance Details

**Health Insurance:**
```typescript
interface HealthInsuranceDetails {
  network: 'cashless' | 'reimbursement' | 'both'
  networkHospitals?: string[]
  roomRentLimit?: number
  copayment?: number
  waitingPeriod?: number
  preExistingDiseaseCovered: boolean
  maternityCovered: boolean
}
```

**Auto Insurance:**
```typescript
interface AutoInsuranceDetails {
  vehicleNumber: string
  vehicleMake: string
  vehicleModel: string
  vehicleYear: number
  coverageType: 'comprehensive' | 'third-party' | 'own-damage'
  idv: number
  ncb?: number
  addOns?: string[]
}
```

**Life Insurance:**
```typescript
interface LifeInsuranceDetails {
  policyType: 'term' | 'whole-life' | 'endowment' | 'ulip' | 'money-back'
  sumAssured: number
  maturityDate?: Date
  nominees: {
    name: string
    relationship: string
    share: number
  }[]
  riders?: {
    name: string
    coverageAmount: number
    premium: number
  }[]
}
```

**Property Insurance:**
```typescript
interface PropertyInsuranceDetails {
  propertyAddress: string
  propertyType: 'home' | 'commercial' | 'rental'
  buildingValue: number
  contentsValue: number
  coveredPerils: string[]
  deductible?: number
}
```

### InsuranceClaim

```typescript
interface InsuranceClaim {
  id: string
  policyId: string
  claimNumber: string
  claimDate: Date
  claimAmount: number
  approvedAmount?: number
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'settled'
  claimType: string
  description: string
  documents?: string[]
  settlementDate?: Date
  rejectionReason?: string
}
```

### InsuranceSummary

Aggregated insurance statistics.

```typescript
interface InsuranceSummary {
  totalPolicies: number
  activePolicies: number
  expiringPolicies: number
  totalPremium: number
  totalCoverage: number
  byType: {
    [key in InsuranceType]?: {
      count: number
      totalCoverage: number
      totalPremium: number
    }
  }
  upcomingRenewals: Array<{
    policyId: string
    policyNumber: string
    insuranceType: InsuranceType
    renewalDate: Date
    premiumAmount: number
  }>
  recentClaims: InsuranceClaim[]
}
```

---

## Chat & AI Types

### ChatMessage

AI assistant conversation messages.

```typescript
interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: DocumentSource[]
  timestamp: Date
}
```

### DocumentSource

Source citation for AI responses.

```typescript
interface DocumentSource {
  documentId: string
  documentTitle: string
  section?: string
  page?: number
}
```

**Example:**
```typescript
const message: ChatMessage = {
  id: 'msg_123',
  role: 'assistant',
  content: 'Your annual salary is $80,000 according to your employment contract.',
  sources: [
    {
      documentId: 'doc_123',
      documentTitle: 'Employment Contract',
      section: 'Compensation',
      page: 3
    }
  ],
  timestamp: new Date()
}
```

---

## Template Types

### Template

Document template for generation.

```typescript
interface Template {
  id: string
  title: string
  category: DocumentCategory
  country: string
  region: string
  languages: string[]
  description: string
  fields: TemplateField[]
  clauses: string[]
}
```

### TemplateField

Form field for template generation.

```typescript
interface TemplateField {
  id: string
  name: string
  label: string
  type: 'text' | 'textarea' | 'date' | 'number' | 'select' | 'checkbox'
  required: boolean
  options?: string[]
  defaultValue?: any
}
```

---

## Legal Guidance Types

### GuidanceCategory

```typescript
type GuidanceCategory =
  | 'employment'
  | 'property'
  | 'business'
  | 'contracts'
  | 'family'
  | 'consumer'
  | 'lending'
  | 'general'
```

### LegalGuidanceRequest

Request for legal guidance.

```typescript
interface LegalGuidanceRequest {
  id: string
  userId: string
  scenario: string
  category: GuidanceCategory
  location: {
    country: string
    region: string
  }
  createdAt: Date
}
```

### LegalGuidanceResponse

AI-generated legal guidance.

```typescript
interface LegalGuidanceResponse {
  id: string
  requestId: string
  summary: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'

  guidance: {
    overview: string
    keyConsiderations: string[]
    dos: string[]
    donts: string[]
    redFlags: string[]
  }

  requiredDocuments: {
    documentType: string
    purpose: string
    mandatory: boolean
    templateAvailable: boolean
  }[]

  checklist: ChecklistItem[]

  risks: {
    type: 'legal' | 'financial' | 'reputational'
    description: string
    likelihood: 'low' | 'medium' | 'high'
    impact: 'low' | 'medium' | 'high'
    mitigation: string
  }[]

  applicableLaws: {
    law: string
    jurisdiction: string
    summary: string
  }[]

  needsLawyer: boolean
  lawyerRecommendation?: string
  generatedAt: Date
}
```

### ChecklistItem

```typescript
interface ChecklistItem {
  id: string
  item: string
  category: string
  completed: boolean
  priority: 'must_have' | 'should_have' | 'nice_to_have'
}
```

---

## Integration Types

### Email Integration

**EmailConnection:**
```typescript
interface EmailConnection {
  id: string
  userId: string
  provider: 'gmail' | 'outlook' | 'yahoo' | 'imap'
  email: string
  status: 'connected' | 'disconnected' | 'error'
  lastSync: Date
  syncFrequency: 'realtime' | 'hourly' | 'daily'
  connectedAt: Date
}
```

**ProcessedEmail:**
```typescript
interface ProcessedEmail {
  id: string
  connectionId: string
  subject: string
  from: string
  receivedAt: Date
  isLegal: boolean
  category: 'subscription' | 'contract' | 'agreement' | 'notice' | 'other'
  priority: 'high' | 'medium' | 'low'
  extractedTerms?: ExtractedTerms
  reviewStatus: 'pending' | 'approved' | 'rejected'
}
```

**ExtractedTerms:**
```typescript
interface ExtractedTerms {
  id: string
  serviceName: string
  provider: string
  effectiveDate?: Date
  pricing?: {
    amount: number
    currency: string
    billingCycle: 'monthly' | 'yearly' | 'one-time'
    renewalDate?: Date
    autoRenew: boolean
  }
  keyTerms: string[]
  risks: {
    type: 'financial' | 'privacy' | 'legal'
    description: string
    severity: 'high' | 'medium' | 'low'
  }[]
  recommendation?: string
}
```

### Google Drive Integration

**DriveConnection:**
```typescript
interface DriveConnection {
  id: string
  userId: string
  googleAccountEmail: string
  status: 'connected' | 'disconnected' | 'error' | 'syncing'
  folderId: string
  folderName: string
  folderPath: string
  autoSync: boolean
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'manual'
  lastSync: Date
  nextSync?: Date
  fileTypes: string[]
  includeSubfolders: boolean
  totalFiles: number
  syncedFiles: number
  failedFiles: number
  connectedAt: Date
  updatedAt: Date
}
```

**DriveFile:**
```typescript
interface DriveFile {
  id: string
  driveFileId: string
  driveFileName: string
  driveFilePath: string
  mimeType: string
  fileSize: number
  driveCreatedAt: Date
  driveModifiedAt: Date
  syncStatus: 'pending' | 'syncing' | 'completed' | 'failed'
  syncAttempts: number
  lastSyncAt?: Date
  errorMessage?: string
  documentId?: string
}
```

**DriveSyncProgress:**
```typescript
interface DriveSyncProgress {
  status: 'idle' | 'syncing' | 'completed' | 'failed'
  totalFiles: number
  processedFiles: number
  failedFiles: number
  currentFile?: string
  progress: number
}
```

---

## User Preference Types

### UserPreferences

```typescript
interface UserPreferences {
  country: string
  region: string
  language: string

  notifications: {
    email: boolean
    push: boolean
    sms: boolean
    quietHoursStart?: string
    quietHoursEnd?: string
  }

  reminders: {
    defaultSchedule: number[]
  }

  aiAssistance: 'proactive' | 'moderate' | 'minimal'
}
```

**Example:**
```typescript
const preferences: UserPreferences = {
  country: 'India',
  region: 'Tamil Nadu',
  language: 'en',
  notifications: {
    email: true,
    push: true,
    sms: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00'
  },
  reminders: {
    defaultSchedule: [30, 7, 1]
  },
  aiAssistance: 'moderate'
}
```

---

## Type Guards & Utilities

### Type Guards

Use TypeScript type guards to safely check types:

```typescript
function isDocument(obj: any): obj is Document {
  return obj && typeof obj.id === 'string' && 'category' in obj
}

function isEvent(obj: any): obj is Event {
  return obj && typeof obj.id === 'string' && 'eventType' in obj
}
```

### Type Narrowing

```typescript
function getItemStatus(item: Document | Event | Task) {
  if ('category' in item) {
    // item is Document
    return item.status
  } else if ('eventType' in item) {
    // item is Event
    return item.status
  } else {
    // item is Task
    return item.status
  }
}
```

---

## Best Practices

### 1. Always Use Explicit Types

```typescript
// ✅ Good
const document: Document = { ... }

// ❌ Bad
const document = { ... }
```

### 2. Use Type Aliases for Unions

```typescript
// ✅ Good
type Status = 'active' | 'expired'

// ❌ Bad
const status: 'active' | 'expired' = 'active'
```

### 3. Leverage Optional Properties

```typescript
interface Event {
  id: string
  title: string
  description?: string  // Optional
}
```

### 4. Use Readonly for Immutable Data

```typescript
interface Config {
  readonly apiUrl: string
  readonly maxSize: number
}
```

### 5. Discriminated Unions

```typescript
type Result =
  | { status: 'success'; data: Document }
  | { status: 'error'; error: string }
```

---

## Import & Usage

```typescript
// Import types
import type {
  Document,
  Event,
  Task,
  InsurancePolicy
} from '@/types'

// Use in components
interface DocumentCardProps {
  document: Document
  onSelect: (id: string) => void
}

// Use in functions
function formatDocument(doc: Document): string {
  return `${doc.title} (${doc.category})`
}
```

---

## Type Extensions

When extending types:

```typescript
// Extend existing type
interface ExtendedDocument extends Document {
  customField: string
}

// Partial types
type PartialDocument = Partial<Document>

// Pick specific fields
type DocumentSummary = Pick<Document, 'id' | 'title' | 'category'>

// Omit fields
type DocumentWithoutMetadata = Omit<Document, 'metadata'>
```

---

## See Also

- [Architecture Documentation](./ARCHITECTURE.md) - System architecture
- [API Documentation](./API.md) - API request/response types
- [Components Documentation](./COMPONENTS.md) - Component prop types
- [Contributing Guide](./CONTRIBUTING.md) - TypeScript guidelines
