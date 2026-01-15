/**
 * AI Prompt Templates
 * Prompt engineering for legal document analysis and guidance
 */

/**
 * System prompt for AI assistant
 */
export const AI_ASSISTANT_SYSTEM_PROMPT = `You are a helpful legal assistant for the Personal Legal Companion app. Your role is to help users understand their legal documents, track obligations, and provide general legal guidance.

IMPORTANT GUIDELINES:
- You are NOT a licensed lawyer and cannot provide legal advice
- Always remind users to consult a licensed attorney for specific legal matters
- Focus on document understanding, deadline tracking, and obligation management
- Be clear, concise, and accurate
- Cite specific sections or pages when referencing documents
- If unsure, acknowledge limitations and suggest professional consultation

CAPABILITIES:
- Analyze legal documents and extract key information
- Explain legal terms and clauses in simple language
- Identify important dates, deadlines, and obligations
- Assess potential risks and issues
- Suggest best practices for document management
- Provide general legal guidance (not advice)

Always format your responses clearly with:
- Bold headings for sections
- Bullet points for lists
- Citations when referencing documents`;

/**
 * Document analysis prompt
 */
export function getDocumentAnalysisPrompt(
  documentText: string,
  documentTitle: string,
  category: string
): string {
  return `Analyze this ${category} document titled "${documentTitle}" and extract the following information:

DOCUMENT TEXT:
${documentText}

Please provide a comprehensive analysis in JSON format with the following structure:
{
  "summary": "Brief 2-3 sentence summary of the document",
  "keyTerms": ["list", "of", "important", "terms"],
  "parties": ["Party 1 Name", "Party 2 Name"],
  "dates": [
    {
      "date": "YYYY-MM-DD",
      "context": "What this date represents",
      "type": "deadline|start_date|end_date|signature_date|other"
    }
  ],
  "obligations": [
    {
      "party": "Party name",
      "obligation": "Description of obligation",
      "deadline": "YYYY-MM-DD or null"
    }
  ],
  "risks": [
    {
      "severity": "high|medium|low",
      "description": "Risk description",
      "recommendation": "How to mitigate"
    }
  ],
  "compliance": {
    "jurisdiction": "Applicable jurisdiction",
    "applicableLaws": ["Law 1", "Law 2"],
    "complianceIssues": ["Issue 1", "Issue 2"]
  },
  "metadata": {
    "documentType": "Specific document type",
    "category": "${category}",
    "confidence": 0.0-1.0
  }
}

Ensure all dates are in YYYY-MM-DD format. Be thorough but concise.`;
}

/**
 * Legal guidance prompt
 */
export function getLegalGuidancePrompt(
  scenario: string,
  category: string,
  country: string,
  region: string
): string {
  return `A user from ${region}, ${country} has the following legal scenario in the ${category} category:

SCENARIO:
${scenario}

Please provide comprehensive legal guidance (NOT legal advice) in JSON format:
{
  "summary": "Brief summary of the situation",
  "analysis": "Detailed analysis of the scenario",
  "risks": [
    {
      "risk": "Potential risk description",
      "severity": "high|medium|low"
    }
  ],
  "recommendations": [
    "Actionable recommendation 1",
    "Actionable recommendation 2"
  ],
  "dosDonts": {
    "dos": ["Do this", "Do that"],
    "donts": ["Don't do this", "Don't do that"]
  },
  "applicableLaws": [
    "Relevant law or regulation 1",
    "Relevant law or regulation 2"
  ],
  "nextSteps": [
    "Step 1",
    "Step 2"
  ],
  "lawyerRecommended": true|false,
  "lawyerReason": "Why professional legal counsel is recommended (if applicable)"
}

IMPORTANT:
- This is general guidance, not legal advice
- Consider ${country} and ${region} laws and regulations
- Be practical and actionable
- Recommend lawyer consultation for complex matters`;
}

/**
 * Event extraction prompt
 */
export function getEventExtractionPrompt(
  documentText: string,
  documentTitle: string
): string {
  return `Extract all important dates, deadlines, and events from this document titled "${documentTitle}":

DOCUMENT TEXT:
${documentText}

Identify all dates that require action, tracking, or awareness. Return a JSON array:
[
  {
    "title": "Event title (clear and actionable)",
    "date": "YYYY-MM-DD",
    "type": "deadline|renewal|payment|review|expiry|milestone",
    "priority": "critical|high|medium|low",
    "description": "What happens on this date and any required actions",
    "reminderDays": [1, 7, 30] // Suggested reminder days before event
  }
]

Guidelines:
- Include contract expiry dates, payment deadlines, renewal dates, review periods
- Set priority based on consequences of missing the date
- critical: Legal consequences or significant financial impact
- high: Important but manageable consequences
- medium: Routine matters
- low: Informational dates
- Suggest appropriate reminder days based on event type and priority`;
}

/**
 * Document Q&A prompt
 */
export function getDocumentQAPrompt(
  question: string,
  documentText: string,
  documentTitle: string,
  conversationHistory?: string
): string {
  let prompt = `Answer this question about the document titled "${documentTitle}":

QUESTION:
${question}

DOCUMENT TEXT:
${documentText}`;

  if (conversationHistory) {
    prompt += `\n\nCONVERSATION HISTORY:
${conversationHistory}`;
  }

  prompt += `\n\nProvide a clear, accurate answer based on the document. If the answer isn't in the document, say so. Always cite specific sections or pages when referencing the document.

Format your response with:
- Direct answer to the question
- Relevant quotes or citations from the document
- Any caveats or additional context
- Reminder to consult a lawyer if needed for legal advice`;

  return prompt;
}

/**
 * Risk assessment prompt
 */
export function getRiskAssessmentPrompt(
  documentText: string,
  documentType: string
): string {
  return `Perform a risk assessment on this ${documentType} document:

DOCUMENT TEXT:
${documentText}

Identify potential risks, red flags, and issues. Return JSON:
{
  "overallRisk": "high|medium|low",
  "risks": [
    {
      "category": "Risk category",
      "severity": "high|medium|low",
      "description": "Detailed risk description",
      "impact": "Potential impact if risk materializes",
      "mitigation": "Recommended mitigation strategies",
      "location": "Section or clause where risk is found"
    }
  ],
  "redFlags": [
    "Immediate concern 1",
    "Immediate concern 2"
  ],
  "recommendations": [
    "Priority recommendation 1",
    "Priority recommendation 2"
  ]
}

Look for:
- Unfavorable terms or clauses
- Missing important provisions
- Ambiguous language
- Unreasonable obligations
- Liability issues
- Compliance concerns
- Renewal and termination terms`;
}

/**
 * Clause explanation prompt
 */
export function getClauseExplanationPrompt(
  clause: string,
  documentType: string
): string {
  return `Explain this clause from a ${documentType} document in simple, clear language:

CLAUSE:
${clause}

Provide:
1. Plain English explanation
2. What it means practically
3. Why it matters
4. Any potential concerns
5. Common variations or standards

Keep the explanation accessible to non-lawyers while being accurate.`;
}

/**
 * Template generation prompt
 */
export function getTemplateGenerationPrompt(
  templateType: string,
  jurisdiction: string,
  customization: Record<string, string>
): string {
  const customFields = Object.entries(customization)
    .map(([key, value]) => `- ${key}: ${value}`)
    .join('\n');

  return `Generate a ${templateType} template for ${jurisdiction} jurisdiction with these details:

${customFields}

Create a professional, legally sound template that includes:
- All standard clauses for this document type
- Jurisdiction-specific requirements
- Clear, unambiguous language
- Proper formatting and structure
- Placeholders for customization

Format as markdown with clear section headings.

IMPORTANT: Include a disclaimer that this is a template and should be reviewed by a licensed attorney before use.`;
}
