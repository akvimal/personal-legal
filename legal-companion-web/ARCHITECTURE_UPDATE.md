# Legal Companion - Enhanced Architecture

## New Features Overview

### 1. Email Integration & Terms Extraction
Automatically monitor and extract legal information from emails (subscriptions, contracts, agreements).

### 2. General Legal Help
Proactive legal guidance before engaging in any legal activity or transaction.

---

## Enhanced Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Web App     │  │  Mobile Apps │  │ Email Client │          │
│  │              │  │  (iOS/Android)│  │ Integration  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                            │
                    ┌───────▼────────┐
                    │   API Gateway  │
                    │  + WebSocket   │
                    └───────┬────────┘
                            │
┌─────────────────────────────────────────────────────────────────┐
│                   ENHANCED SERVICES LAYER                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Legal AI     │  │  Email       │  │  Terms       │          │
│  │ Assistant    │  │  Integration │  │  Extractor   │          │
│  │ (RAG + LLM)  │  │  Service     │  │  Service     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ General      │  │  Document    │  │  Template    │          │
│  │ Legal Help   │  │  Intelligence│  │  Generator   │          │
│  │ (Advisory)   │  │  Service     │  │  Service     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Smart Event  │  │ Notification │  │  Risk        │          │
│  │ Extraction   │  │ & Reminder   │  │  Assessment  │          │
│  │ (NER + LLM)  │  │  Engine      │  │  Service     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Feature 1: Email Integration & Terms Extraction

### Overview
Automatically connect to user's email, scan for legal/subscription emails, extract terms & conditions, and create documents with reminders.

### Use Cases
1. **Subscription Services**: Netflix, Spotify, SaaS tools
2. **Service Agreements**: Internet providers, utility services
3. **Employment Offers**: Offer letters sent via email
4. **Contract Amendments**: Updates to existing agreements
5. **Legal Notices**: Court notices, compliance emails

### Email Integration Service

#### Supported Email Providers
- Gmail (OAuth 2.0)
- Outlook/Office 365
- Yahoo Mail
- IMAP/SMTP (Generic)

#### Architecture

```
Email Account → Email Fetching → Email Classification →
Content Extraction → Document Creation → Event Extraction →
Notifications
```

#### Components

**1. Email Connection Manager**
```typescript
interface EmailConnection {
  id: string;
  userId: string;
  provider: 'gmail' | 'outlook' | 'yahoo' | 'imap';
  email: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync: Date;
  syncFrequency: 'realtime' | 'hourly' | 'daily';
  filters: EmailFilter[];
  connectedAt: Date;
}

interface EmailFilter {
  id: string;
  fromDomains?: string[];  // e.g., ['netflix.com', '*.legal.com']
  subjectKeywords?: string[];  // e.g., ['subscription', 'terms', 'agreement']
  hasAttachment?: boolean;
  attachmentTypes?: string[];  // ['pdf', 'docx']
}
```

**2. Email Classifier (AI-Powered)**
```typescript
interface EmailClassification {
  emailId: string;
  isLegalEmail: boolean;
  confidence: number;
  category: 'subscription' | 'contract' | 'agreement' | 'notice' | 'other';
  priority: 'high' | 'medium' | 'low';
  suggestedAction: 'extract_terms' | 'create_document' | 'ignore';
  detectedEntities: {
    companies: string[];
    dates: Date[];
    amounts: number[];
    legalTerms: string[];
  };
}
```

**3. Terms & Conditions Extractor**
```typescript
interface ExtractedTerms {
  id: string;
  emailId: string;
  source: 'email_body' | 'attachment' | 'linked_url';
  extractedAt: Date;

  // Basic Info
  serviceName: string;
  provider: string;
  effectiveDate?: Date;

  // Financial Terms
  pricing?: {
    amount: number;
    currency: string;
    billingCycle: 'monthly' | 'yearly' | 'one-time';
    renewalDate?: Date;
    autoRenew?: boolean;
    cancellationDeadline?: Date;
  };

  // Key Terms
  keyTerms: ExtractedTerm[];

  // Important Clauses
  importantClauses: {
    type: 'cancellation' | 'refund' | 'data_usage' | 'liability' | 'dispute';
    clause: string;
    importance: 'critical' | 'high' | 'medium';
    userImpact?: string;
  }[];

  // Obligations
  userObligations: string[];
  providerObligations: string[];

  // Risks
  identifiedRisks: {
    type: 'financial' | 'privacy' | 'legal';
    description: string;
    severity: 'high' | 'medium' | 'low';
    recommendation?: string;
  }[];
}

interface ExtractedTerm {
  term: string;
  value: string;
  category: string;
  highlighted: boolean;
}
```

**4. Email-to-Document Converter**
```typescript
interface EmailDocument {
  id: string;
  emailId: string;
  title: string;
  category: DocumentCategory;
  extractedTerms: ExtractedTerms;
  originalEmail: {
    subject: string;
    from: string;
    date: Date;
    bodyPreview: string;
    attachments: EmailAttachment[];
  };
  status: 'pending_review' | 'approved' | 'rejected';
  createdAt: Date;
}

interface EmailAttachment {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  extracted: boolean;
}
```

### Email Extraction Pipeline

```
Step 1: Connect Email Account
  → OAuth authentication
  → Set up sync schedule
  → Configure filters

Step 2: Fetch Emails
  → Fetch new emails based on filters
  → Download attachments if applicable
  → Store raw email data

Step 3: Classify Email (AI)
  → Analyze subject line
  → Scan email body
  → Check sender domain
  → Classify as legal/non-legal
  → Assign category and priority

Step 4: Extract Terms (AI/NLP)
  → Parse email body
  → Extract text from PDF attachments
  → Extract from linked T&C pages
  → Identify key terms, dates, amounts
  → Extract obligations and rights
  → Identify risks and red flags

Step 5: Create Document
  → Generate structured document
  → Attach original email
  → Add extracted metadata
  → Flag for user review

Step 6: Event & Reminder Creation
  → Extract renewal dates
  → Extract cancellation deadlines
  → Create payment reminders
  → Set up notifications

Step 7: User Review & Approval
  → Present extracted info to user
  → Allow edits/corrections
  → Approve or reject
  → Save to document library
```

### LLM Prompt for Email Extraction

```
You are a legal document analyzer specializing in email-based terms and conditions.

Email Subject: {subject}
Email From: {from}
Email Date: {date}
Email Body: {body}

Task: Extract the following information:

1. Service/Product Name
2. Provider/Company
3. Pricing Details (amount, billing cycle, renewal date)
4. Key Terms & Conditions
5. User Obligations
6. Provider Obligations
7. Cancellation Policy
8. Refund Policy
9. Auto-renewal Information
10. Important Deadlines
11. Data Usage/Privacy Terms
12. Dispute Resolution Terms
13. Jurisdiction
14. Identified Risks (financial, privacy, legal)

Format the output as structured JSON.
Highlight any concerning clauses or unfavorable terms.
Calculate risk score (0-100) based on:
- Unfair cancellation terms
- Hidden fees
- Automatic renewal without easy opt-out
- Broad liability limitations
- Invasive data collection

Return comprehensive analysis for user review.
```

### UI Components for Email Integration

**1. Email Connection Page**
```
┌─ Connect Email Account ────────────────────────┐
│                                                 │
│  Connect your email to automatically extract   │
│  legal information from subscriptions and      │
│  agreements.                                    │
│                                                 │
│  ┌────────────────────────────────────────┐   │
│  │ 📧 Gmail                               │   │
│  │ Connect to monitor legal emails        │   │
│  │                         [Connect →]    │   │
│  └────────────────────────────────────────┘   │
│                                                 │
│  ┌────────────────────────────────────────┐   │
│  │ 📧 Outlook/Office 365                  │   │
│  │ Connect to monitor legal emails        │   │
│  │                         [Connect →]    │   │
│  └────────────────────────────────────────┘   │
│                                                 │
│  ⚙️ Advanced Settings:                         │
│  ☑️ Scan for subscription emails               │
│  ☑️ Scan for contract attachments              │
│  ☑️ Monitor terms & conditions updates         │
│  ☐ Scan all emails (not recommended)          │
│                                                 │
│  Sync Frequency: [Hourly ▾]                   │
│                                                 │
│  🔒 Your privacy is important. We only access  │
│     emails matching legal patterns.            │
│                                                 │
└─────────────────────────────────────────────────┘
```

**2. Extracted Terms Review**
```
┌─ Review Extracted Terms ───────────────────────┐
│                                                 │
│  📧 From: subscriptions@netflix.com            │
│  📅 Received: Nov 1, 2025                      │
│  📄 Subject: Your Netflix Subscription Update  │
│                                                 │
│  ┌─ Extracted Information ─────────────────┐  │
│  │                                          │  │
│  │  Service: Netflix Premium Plan          │  │
│  │  Provider: Netflix Inc.                  │  │
│  │                                          │  │
│  │  💰 Pricing:                            │  │
│  │  Amount: ₹649/month                     │  │
│  │  Next Billing: Dec 1, 2025              │  │
│  │  Auto-Renewal: Yes ⚠️                   │  │
│  │  Cancellation Deadline: Nov 30, 2025    │  │
│  │                                          │  │
│  │  📋 Key Terms:                          │  │
│  │  • Price increase from ₹599 to ₹649    │  │
│  │  • New sharing policy (1 household)     │  │
│  │  • 4K streaming included                │  │
│  │                                          │  │
│  │  ⚠️ Identified Risks:                   │  │
│  │  • Price increase (8% hike)             │  │
│  │  • Restricted account sharing           │  │
│  │                                          │  │
│  │  💡 Recommendation:                     │  │
│  │  Consider canceling if you don't use    │  │
│  │  4K. Basic plan at ₹199 might suffice.  │  │
│  │                                          │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  [✓ Save as Document]  [✗ Ignore]  [✏️ Edit]  │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Feature 2: General Legal Help (Ask Before You Act)

### Overview
Provide proactive legal guidance before users engage in any legal activity or transaction.

### Use Cases
1. **Before Signing**: "Should I sign this NDA?"
2. **Before Renting**: "What should I check before renting?"
3. **Before Hiring**: "What legal documents do I need to hire a contractor?"
4. **Before Starting Business**: "What licenses do I need for a food business in Chennai?"
5. **Before Lending Money**: "How do I protect myself when lending to a friend?"

### General Legal Help Service

#### Architecture

```
User Query → Intent Detection → Context Gathering →
Knowledge Base Search → LLM Generation → Risk Assessment →
Actionable Guidance → Checklist Generation
```

#### Components

**1. Legal Guidance Request**
```typescript
interface LegalGuidanceRequest {
  id: string;
  userId: string;
  scenario: string;  // User's description
  category: GuidanceCategory;
  context: {
    location: {
      country: string;
      region: string;
      city?: string;
    };
    parties: {
      role: 'individual' | 'business' | 'organization';
      description?: string;
    }[];
    transactionType?: string;
    estimatedValue?: number;
    urgency: 'immediate' | 'within_week' | 'planning';
  };
  userDocuments?: string[];  // Related existing documents
  createdAt: Date;
}

type GuidanceCategory =
  | 'employment'
  | 'property'
  | 'business'
  | 'contracts'
  | 'family'
  | 'consumer'
  | 'lending'
  | 'intellectual_property'
  | 'general';
```

**2. Legal Guidance Response**
```typescript
interface LegalGuidanceResponse {
  id: string;
  requestId: string;

  // Summary
  summary: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';

  // Detailed Guidance
  guidance: {
    overview: string;
    keyConsiderations: string[];
    dos: string[];
    donts: string[];
    redFlags: string[];
  };

  // Legal Requirements
  legalRequirements: {
    mandatory: LegalRequirement[];
    recommended: LegalRequirement[];
    optional: LegalRequirement[];
  };

  // Documents Needed
  requiredDocuments: {
    documentType: string;
    purpose: string;
    mandatory: boolean;
    template?: string;  // Link to template
  }[];

  // Checklist
  checklist: ChecklistItem[];

  // Risk Assessment
  risks: {
    type: 'legal' | 'financial' | 'reputational';
    description: string;
    likelihood: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
    mitigation: string;
  }[];

  // Next Steps
  nextSteps: {
    step: string;
    priority: 'immediate' | 'high' | 'medium' | 'low';
    timeline?: string;
    cost?: string;
  }[];

  // Related Laws & Regulations
  applicableLaws: {
    law: string;
    jurisdiction: string;
    summary: string;
    link?: string;
  }[];

  // Professional Advice
  needsLawyer: boolean;
  lawyerRecommendation?: string;

  // Additional Resources
  resources: {
    title: string;
    type: 'article' | 'video' | 'template' | 'government_site';
    url: string;
  }[];

  generatedAt: Date;
}

interface LegalRequirement {
  requirement: string;
  description: string;
  jurisdiction: string;
  penalty?: string;
  deadline?: string;
}

interface ChecklistItem {
  id: string;
  item: string;
  category: string;
  completed: boolean;
  priority: 'must_have' | 'should_have' | 'nice_to_have';
  dueDate?: Date;
}
```

### Scenario Templates

**Common Legal Scenarios with Pre-built Guidance:**

1. **Renting Property (Tenant)**
   - Documents to request from landlord
   - Clauses to check in rental agreement
   - Security deposit rules (Tamil Nadu)
   - Rent control act applicability
   - Police verification requirements
   - Checklist before moving in

2. **Renting Property (Landlord)**
   - Tenant verification process
   - Rental agreement essentials
   - Tax implications
   - Eviction process (if needed)
   - Property insurance

3. **Hiring Employees**
   - Employment contract essentials
   - PF/ESI compliance
   - Offer letter format
   - Probation period rules
   - Non-compete enforceability

4. **Starting a Business**
   - Business registration options
   - Licenses required by industry
   - GST registration
   - MSME registration benefits
   - Partnership deed (if applicable)

5. **Freelance/Consulting Work**
   - Service agreement template
   - Payment terms
   - IP ownership
   - Liability limitations
   - Dispute resolution

6. **Lending Money**
   - Promissory note
   - Interest rate limits
   - Repayment schedule
   - Witness requirements
   - Collection process

7. **Buying Property**
   - Title verification
   - Encumbrance certificate
   - Sale deed essentials
   - Stamp duty (Tamil Nadu)
   - Registration process

### LLM Prompt for General Legal Help

```
You are a legal advisory AI for users in {country}, {region}.

User Scenario: {scenario}
Category: {category}
Context: {context}

Provide comprehensive legal guidance including:

1. Risk Assessment (Low/Medium/High/Critical)
2. Key Legal Considerations
3. Mandatory Legal Requirements (specific to {jurisdiction})
4. Recommended Documents
5. Step-by-Step Checklist
6. Potential Risks and Mitigation Strategies
7. Red Flags to Watch Out For
8. Applicable Laws and Regulations
9. When to Consult a Lawyer
10. Estimated Timeline
11. Estimated Costs (if applicable)

Focus on practical, actionable advice.
Cite specific laws and regulations from {jurisdiction}.
Highlight jurisdiction-specific nuances (e.g., Tamil Nadu Rent Control Act).
Be clear about what requires professional legal counsel.

Format response in structured JSON.
```

### UI Components for General Legal Help

**1. Legal Help Dashboard**
```
┌─ General Legal Help ───────────────────────────┐
│                                                 │
│  Get legal guidance before taking action       │
│                                                 │
│  ┌─────────────────────────────────────────┐  │
│  │ 💬 What do you need help with?          │  │
│  │                                          │  │
│  │ [Type your question or scenario...]     │  │
│  │                                          │  │
│  │                              [Ask AI →] │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  💡 Popular Questions:                         │
│  ┌────────────────────────────────────────┐   │
│  │ • What should I check before renting?  │   │
│  │ • How do I hire a freelancer legally?  │   │
│  │ • What documents for starting business?│   │
│  │ • Should I sign this NDA?              │   │
│  │ • How to lend money safely?            │   │
│  └────────────────────────────────────────┘   │
│                                                 │
│  📋 Browse by Category:                        │
│  [Employment] [Property] [Business]            │
│  [Contracts] [Consumer] [Family]               │
│                                                 │
│  ──────────────────────────────────────────── │
│                                                 │
│  📖 Recent Guidance:                           │
│  ┌────────────────────────────────────────┐   │
│  │ Renting Property Checklist             │   │
│  │ Nov 3, 2025 • Property                 │   │
│  │ [View →]                               │   │
│  └────────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
```

**2. Guidance Response**
```
┌─ Legal Guidance: Renting Property ─────────────┐
│                                                 │
│  Risk Level: 🟡 MEDIUM                         │
│                                                 │
│  📝 Overview:                                  │
│  Renting property in Chennai, Tamil Nadu      │
│  requires careful verification and proper      │
│  documentation to avoid disputes.              │
│                                                 │
│  ✅ Key Considerations:                        │
│  • Verify landlord ownership                   │
│  • Check property maintenance history          │
│  • Understand notice period (typically 2-3 mo) │
│  • Clarify all included amenities              │
│  • Document property condition before move-in  │
│                                                 │
│  ✅ Do:                                         │
│  ✓ Get rental agreement registered             │
│  ✓ Request NOC from society/owner              │
│  ✓ Keep all payment receipts                   │
│  ✓ Take photos/videos before moving in         │
│  ✓ Get police verification done                │
│                                                 │
│  ❌ Don't:                                      │
│  ✗ Pay security deposit in cash                │
│  ✗ Sign agreement without reading thoroughly   │
│  ✗ Agree to vague maintenance terms            │
│  ✗ Skip property inspection                    │
│                                                 │
│  🚩 Red Flags:                                 │
│  • Landlord requests 6+ months security        │
│  • No written agreement offered                │
│  • Previous tenant disputes                    │
│  • Unclear ownership                           │
│                                                 │
│  📄 Required Documents:                        │
│  1. Rental Agreement (✓ Template Available)    │
│  2. Landlord's Property Ownership Proof        │
│  3. Police Verification Form                   │
│  4. Previous Electricity/Water Bills           │
│  5. Society NOC (if apartment)                 │
│                                                 │
│  ✓ Checklist (7 items):                       │
│  ☐ Verify owner identity and title            │
│  ☐ Review rental agreement draft              │
│  ☐ Inspect property condition                 │
│  ☐ Negotiate terms if needed                  │
│  ☐ Sign agreement with witnesses              │
│  ☐ Get agreement registered                   │
│  ☐ Complete police verification               │
│                                                 │
│  ⚖️ Applicable Laws:                           │
│  • Tamil Nadu Buildings (Lease and Rent       │
│    Control) Act, 1960                          │
│  • Transfer of Property Act, 1882              │
│                                                 │
│  👨‍⚖️ Need a Lawyer?                            │
│  Not mandatory for standard rentals, but       │
│  recommended if:                                │
│  • High-value property (>₹50k/month)           │
│  • Commercial property                          │
│  • Complex terms or disputes                   │
│                                                 │
│  [💾 Save Guidance]  [📋 View Checklist]       │
│  [📄 Get Templates]  [👨‍⚖️ Find Lawyer]         │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Integration Points

### 1. Email → Document Pipeline
```
Email Received → AI Classification → Terms Extraction →
Document Created → User Review → Approved →
Added to Library → Events Created → Reminders Set
```

### 2. Legal Help → Document Generation
```
User Query → Guidance Generated → Documents Recommended →
Templates Offered → User Fills Template →
Document Created → Saved to Library
```

### 3. Legal Help → Task Creation
```
Guidance Checklist → Convert to Tasks →
Assign Due Dates → Track Completion →
Mark Done → Update Legal Health Score
```

---

## Database Schema Updates

```sql
-- Email Integration
email_connections (
  id, user_id, provider, email, status,
  last_sync, sync_frequency, filters_json,
  created_at, updated_at
)

processed_emails (
  id, connection_id, email_id, subject, from_email,
  received_at, classification_json, is_legal,
  category, priority, processed_at
)

extracted_terms (
  id, email_id, document_id,
  service_name, provider, effective_date,
  pricing_json, key_terms_json,
  important_clauses_json, risks_json,
  extracted_at, review_status
)

-- General Legal Help
legal_guidance_requests (
  id, user_id, scenario, category,
  context_json, created_at
)

legal_guidance_responses (
  id, request_id, summary, risk_level,
  guidance_json, requirements_json,
  checklist_json, risks_json,
  applicable_laws_json, generated_at
)

guidance_checklists (
  id, response_id, items_json,
  completed_count, total_count,
  status, created_at, completed_at
)
```

---

## API Endpoints

### Email Integration
```
POST   /api/email/connect
GET    /api/email/connections
DELETE /api/email/connections/{id}
POST   /api/email/sync
GET    /api/email/processed
GET    /api/email/{id}/terms
POST   /api/email/{id}/approve
POST   /api/email/{id}/create-document
```

### General Legal Help
```
POST   /api/legal-help/ask
GET    /api/legal-help/requests
GET    /api/legal-help/requests/{id}
GET    /api/legal-help/scenarios
GET    /api/legal-help/categories
POST   /api/legal-help/{id}/checklist
PUT    /api/legal-help/{id}/checklist/{itemId}
```

---

## Implementation Priority

### Phase 1 (MVP)
1. General Legal Help - Basic scenarios
2. Email connection (Gmail OAuth)
3. Basic email classification
4. Simple terms extraction

### Phase 2 (Enhanced)
1. Advanced terms extraction with AI
2. Risk assessment
3. Multiple email provider support
4. Automated document creation from emails

### Phase 3 (Advanced)
1. Real-time email monitoring
2. Proactive guidance recommendations
3. Integration with lawyer network
4. Jurisdiction-specific knowledge base
5. Multi-language support

---

This enhanced architecture positions the Legal Companion as a comprehensive, proactive legal assistant that helps users both manage existing documents and make informed decisions before taking action.
