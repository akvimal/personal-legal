/**
 * POST /api/ai/analyze-document - Analyze document with AI
 * Extracts metadata, key terms, obligations, risks, and compliance info
 */

import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, ApiErrors, handleApiError } from '@/lib/api-response';
import { getUserFromRequest } from '@/lib/api-auth';
import { getProviderInstance, isAIConfigured } from '@/lib/ai-service';
import { getDocumentAnalysisPrompt, AI_ASSISTANT_SYSTEM_PROMPT } from '@/lib/ai-prompts';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const tokenPayload = await getUserFromRequest(request);
    if (!tokenPayload) {
      return ApiErrors.unauthorized();
    }

    // Check if AI is configured
    if (!isAIConfigured()) {
      return ApiErrors.serviceUnavailable(
        'AI service is not configured. Please set up your AI provider API key.'
      );
    }

    const body = await request.json();
    const { documentId, documentText } = body;

    if (!documentId) {
      return ApiErrors.badRequest('Document ID is required');
    }

    // Fetch document
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        userId: tokenPayload.userId,
      },
    });

    if (!document) {
      return ApiErrors.notFound('Document');
    }

    // Use provided text or placeholder
    const textToAnalyze =
      documentText ||
      '[Document text not yet extracted. OCR integration required.]';

    // Get AI provider
    const provider = await getProviderInstance();

    // Generate analysis prompt
    const prompt = getDocumentAnalysisPrompt(
      textToAnalyze,
      document.title,
      document.category
    );

    // Call AI
    const response = await provider.chat(
      [{ role: 'user', content: prompt }],
      {
        systemPrompt: AI_ASSISTANT_SYSTEM_PROMPT,
        temperature: 0.3, // Lower temperature for more consistent extraction
        maxTokens: 4096,
      }
    );

    // Parse JSON response
    let analysis;
    try {
      analysis = JSON.parse(response.content);
    } catch (error) {
      // If parsing fails, return raw response
      analysis = {
        summary: response.content,
        error: 'Failed to parse structured analysis',
      };
    }

    // TODO: Store analysis in database
    // await prisma.document.update({
    //   where: { id: documentId },
    //   data: {
    //     metadata: {
    //       ...document.metadata,
    //       aiAnalysis: analysis,
    //       analyzedAt: new Date().toISOString(),
    //     },
    //   },
    // });

    return successResponse({
      document: {
        id: document.id,
        title: document.title,
        category: document.category,
      },
      analysis,
      model: response.model,
      usage: response.usage,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
