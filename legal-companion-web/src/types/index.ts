// Document Categories
export type DocumentCategory =
  | 'employment'
  | 'property'
  | 'business'
  | 'financial'
  | 'insurance'
  | 'consumer'
  | 'family'
  | 'legal';

// Document Status
export type DocumentStatus = 'active' | 'expiring_soon' | 'expired' | 'archived';

// Event Types
export type EventType =
  | 'contract_expiry'
  | 'payment_due'
  | 'renewal_date'
  | 'review_date'
  | 'obligation_end'
  | 'milestone';

// Priority Levels
export type Priority = 'critical' | 'high' | 'medium' | 'low';

// Document Interface
export interface Document {
  id: string;
  title: string;
  category: DocumentCategory;
  documentType: string;
  status: DocumentStatus;
  filePath: string;
  fileType: string;
  fileSize: number;
  pages?: number;
  uploadedAt: Date;
  signedDate?: Date;
  startDate?: Date;
  endDate?: Date;
  parties: string[];
  tags: string[];
  country: string;
  region: string;
  language: string;
  metadata?: Record<string, any>;
  upcomingEvents: number;
  pendingTasks: number;
}

// Event Interface
export interface Event {
  id: string;
  documentId: string;
  eventType: EventType;
  title: string;
  description: string;
  eventDate: Date;
  priority: Priority;
  isRecurring: boolean;
  recurrencePattern?: string;
  responsibleParty?: string;
  consequence?: string;
  advanceNoticeDays?: number;
  status: 'upcoming' | 'completed' | 'missed' | 'dismissed';
  reminders: Reminder[];
}

// Reminder Interface
export interface Reminder {
  id: string;
  eventId: string;
  daysBefore: number;
  sent: boolean;
  sentAt?: Date;
}

// Task Interface
export interface Task {
  id: string;
  documentId?: string;
  eventId?: string;
  title: string;
  description?: string;
  dueDate?: Date;
  priority: Priority;
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: Date;
  createdAt: Date;
}

// Notification Interface
export interface Notification {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  documentId?: string;
  eventId?: string;
  taskId?: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

// Chat Message Interface
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: DocumentSource[];
  timestamp: Date;
}

export interface DocumentSource {
  documentId: string;
  documentTitle: string;
  section?: string;
  page?: number;
}

// Template Interface
export interface Template {
  id: string;
  title: string;
  category: DocumentCategory;
  country: string;
  region: string;
  languages: string[];
  description: string;
  fields: TemplateField[];
  clauses: string[];
}

export interface TemplateField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'number' | 'select' | 'checkbox';
  required: boolean;
  options?: string[];
  defaultValue?: any;
}

// User Preferences Interface
export interface UserPreferences {
  country: string;
  region: string;
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    quietHoursStart?: string;
    quietHoursEnd?: string;
  };
  reminders: {
    defaultSchedule: number[]; // Days before event
  };
  aiAssistance: 'proactive' | 'moderate' | 'minimal';
}

// Email Integration Interfaces
export interface EmailConnection {
  id: string;
  userId: string;
  provider: 'gmail' | 'outlook' | 'yahoo' | 'imap';
  email: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync: Date;
  syncFrequency: 'realtime' | 'hourly' | 'daily';
  connectedAt: Date;
}

export interface ProcessedEmail {
  id: string;
  connectionId: string;
  subject: string;
  from: string;
  receivedAt: Date;
  isLegal: boolean;
  category: 'subscription' | 'contract' | 'agreement' | 'notice' | 'other';
  priority: 'high' | 'medium' | 'low';
  extractedTerms?: ExtractedTerms;
  reviewStatus: 'pending' | 'approved' | 'rejected';
}

export interface ExtractedTerms {
  id: string;
  serviceName: string;
  provider: string;
  effectiveDate?: Date;
  pricing?: {
    amount: number;
    currency: string;
    billingCycle: 'monthly' | 'yearly' | 'one-time';
    renewalDate?: Date;
    autoRenew: boolean;
  };
  keyTerms: string[];
  risks: {
    type: 'financial' | 'privacy' | 'legal';
    description: string;
    severity: 'high' | 'medium' | 'low';
  }[];
  recommendation?: string;
}

// General Legal Help Interfaces
export type GuidanceCategory =
  | 'employment'
  | 'property'
  | 'business'
  | 'contracts'
  | 'family'
  | 'consumer'
  | 'lending'
  | 'general';

export interface LegalGuidanceRequest {
  id: string;
  userId: string;
  scenario: string;
  category: GuidanceCategory;
  location: {
    country: string;
    region: string;
  };
  createdAt: Date;
}

export interface LegalGuidanceResponse {
  id: string;
  requestId: string;
  summary: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  guidance: {
    overview: string;
    keyConsiderations: string[];
    dos: string[];
    donts: string[];
    redFlags: string[];
  };
  requiredDocuments: {
    documentType: string;
    purpose: string;
    mandatory: boolean;
    templateAvailable: boolean;
  }[];
  checklist: ChecklistItem[];
  risks: {
    type: 'legal' | 'financial' | 'reputational';
    description: string;
    likelihood: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
    mitigation: string;
  }[];
  applicableLaws: {
    law: string;
    jurisdiction: string;
    summary: string;
  }[];
  needsLawyer: boolean;
  lawyerRecommendation?: string;
  generatedAt: Date;
}

export interface ChecklistItem {
  id: string;
  item: string;
  category: string;
  completed: boolean;
  priority: 'must_have' | 'should_have' | 'nice_to_have';
}

// Google Drive Integration Interfaces
export interface DriveConnection {
  id: string;
  userId: string;
  googleAccountEmail: string;
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  folderId: string;
  folderName: string;
  folderPath: string;
  autoSync: boolean;
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'manual';
  lastSync: Date;
  nextSync?: Date;
  fileTypes: string[];
  includeSubfolders: boolean;
  totalFiles: number;
  syncedFiles: number;
  failedFiles: number;
  connectedAt: Date;
  updatedAt: Date;
}

export interface DriveFile {
  id: string;
  driveFileId: string;
  driveFileName: string;
  driveFilePath: string;
  mimeType: string;
  fileSize: number;
  driveCreatedAt: Date;
  driveModifiedAt: Date;
  syncStatus: 'pending' | 'syncing' | 'completed' | 'failed';
  syncAttempts: number;
  lastSyncAt?: Date;
  errorMessage?: string;
  documentId?: string;
}

export interface DriveFolder {
  id: string;
  name: string;
  path: string;
  parents?: string[];
  modifiedTime: Date;
}

export interface DriveSyncProgress {
  status: 'idle' | 'syncing' | 'completed' | 'failed';
  totalFiles: number;
  processedFiles: number;
  failedFiles: number;
  currentFile?: string;
  progress: number;
}

// Insurance Specific Interfaces
export type InsuranceType = 'health' | 'auto' | 'life' | 'property' | 'travel' | 'other';

export interface InsurancePolicy {
  id: string;
  documentId: string;
  policyNumber: string;
  insuranceType: InsuranceType;
  provider: string;
  policyHolder: string;
  insuredMembers?: string[]; // For health/life insurance
  premiumAmount: number;
  premiumFrequency: 'monthly' | 'quarterly' | 'half-yearly' | 'yearly';
  coverageAmount: number;
  startDate: Date;
  endDate: Date;
  renewalDate: Date;
  gracePeriod?: number; // Days
  status: 'active' | 'expiring_soon' | 'expired' | 'lapsed' | 'claimed';

  // Coverage details
  coverage: {
    type: string;
    amount: number;
    description?: string;
  }[];

  // Exclusions
  exclusions?: string[];

  // Benefits
  benefits?: {
    name: string;
    description: string;
    limit?: number;
  }[];

  // Claim history
  claims?: InsuranceClaim[];

  // Additional details based on insurance type
  healthInsurance?: {
    network: 'cashless' | 'reimbursement' | 'both';
    networkHospitals?: string[];
    roomRentLimit?: number;
    copayment?: number; // Percentage
    waitingPeriod?: number; // Months
    preExistingDiseaseCovered: boolean;
    maternityCovered: boolean;
  };

  autoInsurance?: {
    vehicleNumber: string;
    vehicleMake: string;
    vehicleModel: string;
    vehicleYear: number;
    coverageType: 'comprehensive' | 'third-party' | 'own-damage';
    idv: number; // Insured Declared Value
    ncb?: number; // No Claim Bonus percentage
    addOns?: string[];
  };

  lifeInsurance?: {
    policyType: 'term' | 'whole-life' | 'endowment' | 'ulip' | 'money-back';
    sumAssured: number;
    maturityDate?: Date;
    nominees: {
      name: string;
      relationship: string;
      share: number; // Percentage
    }[];
    riders?: {
      name: string;
      coverageAmount: number;
      premium: number;
    }[];
  };

  propertyInsurance?: {
    propertyAddress: string;
    propertyType: 'home' | 'commercial' | 'rental';
    buildingValue: number;
    contentsValue: number;
    coveredPerils: string[];
    deductible?: number;
  };

  metadata?: Record<string, any>;
}

export interface InsuranceClaim {
  id: string;
  policyId: string;
  claimNumber: string;
  claimDate: Date;
  claimAmount: number;
  approvedAmount?: number;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'settled';
  claimType: string;
  description: string;
  documents?: string[];
  settlementDate?: Date;
  rejectionReason?: string;
}

export interface InsuranceSummary {
  totalPolicies: number;
  activePolicies: number;
  expiringPolicies: number;
  totalPremium: number; // Annual
  totalCoverage: number;
  byType: {
    [key in InsuranceType]?: {
      count: number;
      totalCoverage: number;
      totalPremium: number;
    };
  };
  upcomingRenewals: {
    policyId: string;
    policyNumber: string;
    insuranceType: InsuranceType;
    renewalDate: Date;
    premiumAmount: number;
  }[];
  recentClaims: InsuranceClaim[];
}
