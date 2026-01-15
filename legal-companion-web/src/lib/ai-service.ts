/**
 * AI Service
 * Abstraction layer for LLM providers (OpenAI, Anthropic Claude, etc.)
 */

// AI Provider Types
export type AIProvider = 'openai' | 'anthropic' | 'google' | 'local';

// Message roles
export type MessageRole = 'system' | 'user' | 'assistant';

// Chat message
export interface ChatMessage {
  role: MessageRole;
  content: string;
}

// AI Response
export interface AIResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  citations?: Citation[];
}

// Citation for source tracking
export interface Citation {
  documentId: string;
  documentTitle: string;
  section?: string;
  page?: number;
  text: string;
}

// Document Analysis Result
export interface DocumentAnalysis {
  summary: string;
  keyTerms: string[];
  parties: string[];
  dates: Array<{
    date: string;
    context: string;
    type: 'deadline' | 'start_date' | 'end_date' | 'signature_date' | 'other';
  }>;
  obligations: Array<{
    party: string;
    obligation: string;
    deadline?: string;
  }>;
  risks: Array<{
    severity: 'high' | 'medium' | 'low';
    description: string;
    recommendation: string;
  }>;
  compliance: {
    jurisdiction: string;
    applicableLaws: string[];
    complianceIssues: string[];
  };
  metadata: {
    documentType: string;
    category: string;
    confidence: number;
  };
}

// Legal Guidance Response
export interface LegalGuidanceResponse {
  summary: string;
  analysis: string;
  risks: Array<{
    risk: string;
    severity: 'high' | 'medium' | 'low';
  }>;
  recommendations: string[];
  dosDonts: {
    dos: string[];
    donts: string[];
  };
  applicableLaws: string[];
  nextSteps: string[];
  lawyerRecommended: boolean;
  lawyerReason?: string;
}

// Event Extraction Result
export interface ExtractedEvent {
  title: string;
  date: string;
  type: 'deadline' | 'renewal' | 'payment' | 'review' | 'expiry' | 'milestone';
  priority: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  reminderDays: number[];
}

/**
 * LLM Provider Interface
 * Implement this interface for each LLM provider
 */
export interface LLMProvider {
  /**
   * Generate chat completion
   */
  chat(messages: ChatMessage[], options?: ChatOptions): Promise<AIResponse>;

  /**
   * Generate streaming chat completion
   */
  chatStream(
    messages: ChatMessage[],
    onChunk: (chunk: string) => void,
    options?: ChatOptions
  ): Promise<AIResponse>;

  /**
   * Check if provider is configured
   */
  isConfigured(): boolean;

  /**
   * Get provider name
   */
  getName(): string;
}

// Chat options
export interface ChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

/**
 * Get configured AI provider
 */
export function getAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER as AIProvider;
  return provider || 'openai';
}

/**
 * Check if AI is configured
 */
export function isAIConfigured(): boolean {
  const provider = getAIProvider();

  switch (provider) {
    case 'openai':
      return !!process.env.OPENAI_API_KEY;
    case 'anthropic':
      return !!process.env.ANTHROPIC_API_KEY;
    case 'google':
      return !!process.env.GOOGLE_AI_API_KEY;
    default:
      return false;
  }
}

/**
 * Get AI provider instance
 * This will be implemented in separate provider files
 */
export async function getProviderInstance(): Promise<LLMProvider> {
  const provider = getAIProvider();

  // Import dynamically based on provider
  // This allows us to only load the provider that's configured
  switch (provider) {
    case 'openai': {
      const { OpenAIProvider } = await import('./ai-providers/openai');
      return new OpenAIProvider();
    }
    case 'anthropic': {
      const { AnthropicProvider } = await import('./ai-providers/anthropic');
      return new AnthropicProvider();
    }
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}
