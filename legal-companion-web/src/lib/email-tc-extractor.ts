/**
 * Terms & Conditions Extraction Service
 * AI-powered extraction of T&C information from emails
 */

import { getProviderInstance, isAIConfigured } from './ai-service';

export interface ExtractedTerms {
  summary: string;
  keyPoints: string[];
  pricing?: {
    amount?: number;
    currency?: string;
    frequency?: string;
    changes?: string;
  };
  renewalDate?: string;
  cancellationPolicy?: string;
  dataUsage?: string[];
  risks: Array<{
    severity: 'high' | 'medium' | 'low';
    description: string;
    recommendation: string;
  }>;
  significantChanges: string[];
  actionRequired?: string;
  riskScore: number; // 0-100
}

/**
 * Extract T&C information from email using AI
 */
export async function extractTermsFromEmail(
  subject: string,
  body: string,
  category: string
): Promise<ExtractedTerms> {
  if (!isAIConfigured()) {
    throw new Error('AI service is not configured');
  }

  const prompt = buildExtractionPrompt(subject, body, category);
  const provider = await getProviderInstance();

  const response = await provider.chat(
    [{ role: 'user', content: prompt }],
    {
      systemPrompt: getSystemPrompt(),
      temperature: 0.3, // Lower temperature for consistent extraction
      maxTokens: 3072,
    }
  );

  try {
    return JSON.parse(response.content);
  } catch (error) {
    // If parsing fails, return a basic structure
    return {
      summary: response.content,
      keyPoints: [],
      risks: [],
      significantChanges: [],
      riskScore: 0,
    };
  }
}

/**
 * Build extraction prompt
 */
function buildExtractionPrompt(
  subject: string,
  body: string,
  category: string
): string {
  return `Analyze this email and extract important terms and conditions information.

Email Subject: ${subject}

Email Category: ${category}

Email Body:
${body}

Please extract and analyze the following information in JSON format:

1. **summary**: A brief summary of what this email is about (2-3 sentences)

2. **keyPoints**: Array of key points or important terms (5-10 items)

3. **pricing** (if mentioned):
   - amount: Numeric amount
   - currency: Currency code (USD, EUR, etc.)
   - frequency: Billing frequency (monthly, yearly, etc.)
   - changes: Description of any price changes

4. **renewalDate**: Next renewal or effective date (YYYY-MM-DD format if found)

5. **cancellationPolicy**: Summary of cancellation or termination terms

6. **dataUsage**: Array of data collection/usage policies mentioned

7. **risks**: Array of potential issues or red flags:
   - severity: "high" | "medium" | "low"
   - description: What the risk is
   - recommendation: What action to take

8. **significantChanges**: Array of important changes from previous terms (if this is an update)

9. **actionRequired**: What the user needs to do (if any action is required)

10. **riskScore**: Overall risk score from 0-100 (0 = no risk, 100 = high risk)
    Consider: auto-renewal terms, price increases, data sharing, unfavorable clauses, hard-to-cancel terms

Return ONLY valid JSON with these fields. If a field is not applicable, use null or empty array.`;
}

/**
 * System prompt for T&C extraction
 */
function getSystemPrompt(): string {
  return `You are an AI assistant specialized in analyzing Terms of Service, Privacy Policies, and subscription-related emails. Your role is to:

1. Extract key information accurately
2. Identify potential risks or concerning clauses
3. Highlight changes that affect the user
4. Assess the overall risk level
5. Provide actionable recommendations

Focus on:
- Price changes and hidden fees
- Auto-renewal terms
- Cancellation difficulty
- Data collection and sharing
- Significant policy changes
- Time-sensitive requirements

Be objective and highlight both positive and negative aspects. Always return valid JSON.`;
}

/**
 * Analyze risk level based on extracted terms
 */
export function calculateRiskScore(terms: Partial<ExtractedTerms>): number {
  let score = 0;

  // High risk factors (20 points each)
  if (terms.risks?.some((r) => r.severity === 'high')) {
    score += 20;
  }

  // Price increases (15 points)
  if (
    terms.pricing?.changes &&
    (terms.pricing.changes.toLowerCase().includes('increase') ||
      terms.pricing.changes.toLowerCase().includes('raised'))
  ) {
    score += 15;
  }

  // Auto-renewal without clear cancellation (15 points)
  if (
    terms.renewalDate &&
    (!terms.cancellationPolicy ||
      terms.cancellationPolicy.toLowerCase().includes('difficult') ||
      terms.cancellationPolicy.toLowerCase().includes('fee'))
  ) {
    score += 15;
  }

  // Medium risk factors (10 points each)
  const mediumRiskCount = terms.risks?.filter(
    (r) => r.severity === 'medium'
  ).length || 0;
  score += Math.min(mediumRiskCount * 10, 30);

  // Significant changes (10 points)
  if (terms.significantChanges && terms.significantChanges.length > 0) {
    score += 10;
  }

  // Action required (10 points)
  if (terms.actionRequired) {
    score += 10;
  }

  return Math.min(score, 100);
}

/**
 * Generate user-friendly summary
 */
export function generateEmailSummary(terms: ExtractedTerms): string {
  const parts: string[] = [];

  parts.push(terms.summary);

  if (terms.pricing?.changes) {
    parts.push(`💰 Pricing: ${terms.pricing.changes}`);
  }

  if (terms.renewalDate) {
    parts.push(`📅 Renewal: ${terms.renewalDate}`);
  }

  if (terms.risks.length > 0) {
    const highRisks = terms.risks.filter((r) => r.severity === 'high');
    if (highRisks.length > 0) {
      parts.push(`⚠️ ${highRisks.length} high-priority concern(s) found`);
    }
  }

  if (terms.actionRequired) {
    parts.push(`✋ Action Required: ${terms.actionRequired}`);
  }

  return parts.join('\n\n');
}
