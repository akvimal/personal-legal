# AI/LLM Integration Documentation

## Overview

The Personal Legal Companion platform integrates AI-powered features for document analysis, legal guidance, and interactive Q&A. The system is built with a flexible, provider-agnostic architecture that supports multiple LLM providers.

## Architecture

### Provider Abstraction Layer

The AI service uses a provider-agnostic interface (`LLMProvider`) that allows easy switching between different AI providers:

```typescript
interface LLMProvider {
  chat(messages: ChatMessage[], options?: ChatOptions): Promise<AIResponse>;
  chatStream(messages: ChatMessage[], onChunk: (chunk: string) => void, options?: ChatOptions): Promise<AIResponse>;
  isConfigured(): boolean;
  getName(): string;
}
```

### Supported Providers

1. **OpenAI** (`src/lib/ai-providers/openai.ts`)
   - GPT-4 Turbo Preview
   - GPT-3.5 Turbo
   - Streaming support via Server-Sent Events

2. **Anthropic** (`src/lib/ai-providers/anthropic.ts`)
   - Claude 3 Sonnet
   - Claude 3 Opus
   - Streaming support via Server-Sent Events

3. **Google AI** (Coming Soon)
   - Gemini Pro
   - Gemini Ultra

## Configuration

### 1. Environment Setup

Copy `.env.example` to `.env` and configure your AI provider:

```bash
# Option 1: OpenAI
OPENAI_API_KEY="sk-..."

# Option 2: Anthropic
ANTHROPIC_API_KEY="sk-ant-..."

# Optional: Explicit provider selection (auto-detected if not set)
AI_PROVIDER="openai"
AI_MODEL="gpt-4-turbo-preview"
```

### 2. Provider Selection Logic

The system automatically detects and uses the first configured provider:
1. Checks for `AI_PROVIDER` environment variable
2. Falls back to first available API key (OpenAI → Anthropic → Google)
3. Returns error if no provider is configured

## API Endpoints

### 1. Document Analysis (`POST /api/ai/analyze-document`)

Extracts structured information from legal documents.

**Request:**
```json
{
  "documentId": "uuid",
  "documentText": "optional text override"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "document": {
      "id": "uuid",
      "title": "Employment Contract",
      "category": "employment"
    },
    "analysis": {
      "summary": "...",
      "keyTerms": ["salary", "benefits", "termination"],
      "parties": ["Employee: John Doe", "Employer: Acme Corp"],
      "dates": [
        {
          "date": "2024-01-15",
          "context": "Contract start date",
          "type": "effective_date"
        }
      ],
      "obligations": [
        {
          "party": "Employer",
          "obligation": "Pay monthly salary of $5,000",
          "deadline": "Last day of each month"
        }
      ],
      "risks": [
        {
          "severity": "medium",
          "description": "Non-compete clause may limit future employment",
          "recommendation": "Review with attorney before signing"
        }
      ],
      "compliance": {
        "jurisdiction": "California, USA",
        "applicableLaws": ["California Labor Code"],
        "complianceIssues": []
      },
      "metadata": {
        "documentType": "Employment Contract",
        "category": "employment",
        "confidence": 0.95
      }
    },
    "model": "gpt-4-turbo-preview",
    "usage": {
      "promptTokens": 1500,
      "completionTokens": 800,
      "totalTokens": 2300
    }
  }
}
```

### 2. Chat with Documents (`POST /api/ai/chat`)

Interactive Q&A about documents with citation tracking.

**Request:**
```json
{
  "message": "What are my notice period obligations?",
  "documentId": "uuid",
  "conversationHistory": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Based on the employment contract...",
    "document": {
      "id": "uuid",
      "title": "Employment Contract"
    },
    "model": "gpt-4-turbo-preview",
    "usage": { ... }
  }
}
```

### 3. Legal Guidance (`POST /api/ai/legal-guidance`)

Get AI-powered legal guidance for scenarios.

**Request:**
```json
{
  "scenario": "I received a termination notice with 1 week notice but my contract says 2 weeks",
  "category": "employment",
  "country": "United States",
  "region": "California"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "guidance": {
      "summary": "...",
      "riskAssessment": {
        "overallRisk": "medium",
        "risks": ["Potential breach of contract", "..."]
      },
      "recommendations": [
        "Document all communications",
        "Contact HR immediately",
        "Consult employment attorney"
      ],
      "nextSteps": [
        "1. Review employment contract",
        "2. Request written explanation",
        "3. File complaint if necessary"
      ],
      "resources": [
        "California Department of Industrial Relations",
        "..."
      ]
    },
    "jurisdiction": {
      "country": "United States",
      "region": "California"
    }
  }
}
```

### 4. Extract Events (`POST /api/ai/extract-events`)

Extract calendar events and deadlines from documents.

**Request:**
```json
{
  "documentId": "uuid",
  "documentText": "optional text override",
  "autoCreateEvents": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "document": { ... },
    "extractedEvents": [
      {
        "title": "Contract Renewal Deadline",
        "date": "2024-12-31",
        "description": "...",
        "type": "deadline",
        "priority": "high",
        "reminderDays": 30
      }
    ],
    "createdEvents": [ ... ],  // If autoCreateEvents: true
    "autoCreated": true
  }
}
```

## React Components

### 1. AIChat Component

Interactive chat interface with streaming support and citation tracking.

```tsx
import { AIChat } from '@/components/features/ai-chat';

<AIChat
  documentId="uuid"
  documentTitle="Employment Contract"
  initialMessages={[]}
  onMessageSent={(message) => console.log('User sent:', message)}
  onError={(error) => console.error('Error:', error)}
/>
```

**Features:**
- Real-time message streaming
- Conversation history
- Citation tracking with source links
- Auto-scroll to latest message
- Keyboard shortcuts (Enter to send, Shift+Enter for newline)

### 2. DocumentAnalysis Component

Comprehensive document analysis with structured results.

```tsx
import { DocumentAnalysis } from '@/components/features/document-analysis';

<DocumentAnalysis
  documentId="uuid"
  documentTitle="Employment Contract"
  documentText="optional text override"
  onAnalysisComplete={(analysis) => console.log('Analysis:', analysis)}
  onError={(error) => console.error('Error:', error)}
/>
```

**Features:**
- One-click analysis
- Structured result display
- Risk visualization with color coding
- Expandable sections
- Re-analysis support

### 3. LegalGuidance Component

Legal guidance form and results display.

```tsx
import { LegalGuidance } from '@/components/features/legal-guidance';

<LegalGuidance
  onGuidanceReceived={(guidance) => console.log('Guidance:', guidance)}
  onError={(error) => console.error('Error:', error)}
/>
```

**Features:**
- Category selection
- Jurisdiction input
- Detailed scenario description
- Risk assessment visualization
- Actionable recommendations

### 4. DocumentUploadWithAnalysis Component

Integrated upload, analysis, and chat workflow.

```tsx
import { DocumentUploadWithAnalysis } from '@/components/features/document-upload-with-analysis';

<DocumentUploadWithAnalysis
  documentData={{
    title: "New Document",
    category: "contract",
    description: "..."
  }}
  showAnalysisTab={true}
  showChatTab={true}
  onUploadSuccess={(doc) => console.log('Uploaded:', doc)}
  onAnalysisComplete={(analysis) => console.log('Analyzed:', analysis)}
/>
```

**Features:**
- Tabbed interface (Upload → Analysis → Chat)
- Auto-switch to analysis after upload
- Persistent document context across tabs

### 5. CitationCard Component

Display sources and citations for AI responses.

```tsx
import { CitationCard } from '@/components/features/citation-card';

<CitationCard
  citations={[
    {
      documentId: "uuid",
      documentTitle: "Employment Contract",
      excerpt: "The employee shall provide 2 weeks notice...",
      page: 5,
      url: "/documents/uuid"
    }
  ]}
/>
```

## Prompt Engineering

### System Prompt

All AI interactions use a carefully crafted system prompt that:
- Establishes the AI as a legal assistant (not a lawyer)
- Emphasizes the need to consult licensed attorneys
- Sets expectations for document analysis and guidance
- Defines response format and structure

### Prompt Templates

Located in `src/lib/ai-prompts.ts`:

1. **Document Analysis** - Extracts structured metadata from documents
2. **Document Q&A** - Answers questions about specific documents
3. **Legal Guidance** - Provides scenario-based legal guidance
4. **Event Extraction** - Identifies dates and deadlines
5. **Risk Assessment** - Evaluates legal risks

## Best Practices

### 1. Token Management

```typescript
const options: ChatOptions = {
  temperature: 0.3,  // Lower = more consistent (good for extraction)
  maxTokens: 4096,   // Limit response length
};
```

**Recommended Settings:**
- Document Analysis: `temperature: 0.3, maxTokens: 4096`
- Legal Guidance: `temperature: 0.5, maxTokens: 3072`
- Chat: `temperature: 0.7, maxTokens: 2048`

### 2. Error Handling

```typescript
try {
  const response = await provider.chat(messages, options);
  // Handle response
} catch (error) {
  if (error.message.includes('API key')) {
    // Provider not configured
  } else if (error.message.includes('rate limit')) {
    // Rate limit exceeded
  } else {
    // Generic error
  }
}
```

### 3. Cost Optimization

- Use appropriate `maxTokens` limits
- Choose the right model for each task (GPT-3.5 for simple, GPT-4 for complex)
- Cache repeated analyses
- Implement rate limiting
- Monitor token usage via response metadata

### 4. Security

- **Never** include sensitive data in prompts unless necessary
- Validate all user inputs before sending to AI
- Sanitize AI responses before display
- Implement rate limiting per user
- Log all AI interactions for audit trails

## Testing

### Manual Testing

1. **Test AI Configuration:**
   ```bash
   curl http://localhost:3002/api/ai/chat \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"message": "Hello, are you configured?"}'
   ```

2. **Test Document Analysis:**
   - Upload a sample document
   - Trigger analysis via UI or API
   - Verify structured response

3. **Test Chat:**
   - Start a conversation
   - Ask document-specific questions
   - Verify citation tracking

### Automated Testing (Future)

```typescript
// Example test structure
describe('AI Service', () => {
  it('should analyze document correctly', async () => {
    const analysis = await analyzeDocument(documentId);
    expect(analysis.summary).toBeDefined();
    expect(analysis.keyTerms).toBeInstanceOf(Array);
  });
});
```

## Monitoring & Analytics

### Track Key Metrics

1. **Usage Metrics:**
   - Total AI requests per day/month
   - Requests per user
   - Requests per feature (analysis, chat, guidance)

2. **Performance Metrics:**
   - Average response time
   - Token usage per request
   - Cost per request

3. **Quality Metrics:**
   - User satisfaction ratings
   - Error rates
   - Feature adoption rates

### Cost Tracking

```typescript
// Example cost calculation
const COST_PER_1K_TOKENS = {
  'gpt-4-turbo-preview': { input: 0.01, output: 0.03 },
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
  'claude-3-sonnet': { input: 0.003, output: 0.015 },
};

function calculateCost(model: string, usage: TokenUsage): number {
  const rates = COST_PER_1K_TOKENS[model];
  return (usage.promptTokens / 1000) * rates.input +
         (usage.completionTokens / 1000) * rates.output;
}
```

## Troubleshooting

### Common Issues

1. **"AI service is not configured"**
   - Check `.env` file has correct API key
   - Verify API key is valid
   - Restart dev server after adding API key

2. **"Failed to parse structured response"**
   - AI returned invalid JSON
   - Try increasing `temperature` slightly
   - Check prompt template formatting

3. **Rate limit errors**
   - Implement exponential backoff
   - Upgrade API plan
   - Add rate limiting per user

4. **High costs**
   - Reduce `maxTokens`
   - Use GPT-3.5 for simpler tasks
   - Implement caching for repeated queries
   - Add request throttling

## Future Enhancements

1. **Streaming Responses**
   - Real-time token-by-token display
   - Better UX for long responses
   - Requires `chatStream` implementation

2. **Document Caching**
   - Cache analyzed documents
   - Reduce redundant API calls
   - Implement TTL for cache invalidation

3. **Multi-Document Context**
   - Analyze multiple documents together
   - Cross-reference information
   - Compare contract terms

4. **Fine-Tuning**
   - Train on legal document corpus
   - Improve accuracy for specific jurisdictions
   - Custom models for specialized legal areas

5. **Voice Interface**
   - Speech-to-text for queries
   - Text-to-speech for responses
   - Hands-free interaction

## Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Anthropic Claude Documentation](https://docs.anthropic.com/claude/docs)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)
- [LangChain Documentation](https://python.langchain.com/docs/get_started/introduction)

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review GitHub issues
3. Contact development team
4. Submit bug report with logs and reproduction steps
