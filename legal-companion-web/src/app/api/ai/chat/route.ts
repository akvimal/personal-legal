/**
 * POST /api/ai/chat - Chat with AI assistant about documents
 * Supports document-based Q&A with citation tracking
 */

import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, ApiErrors, handleApiError } from '@/lib/api-response';
import { getUserFromRequest } from '@/lib/api-auth';
import { getProviderInstance, isAIConfigured, type ChatMessage } from '@/lib/ai-service';
import { getDocumentQAPrompt, AI_ASSISTANT_SYSTEM_PROMPT } from '@/lib/ai-prompts';

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
    const { message, documentId, conversationHistory } = body;

    if (!message) {
      return ApiErrors.badRequest('Message is required');
    }

    let prompt = message;
    let document = null;

    // If document context is provided
    if (documentId) {
      document = await prisma.document.findFirst({
        where: {
          id: documentId,
          userId: tokenPayload.userId,
        },
      });

      if (!document) {
        return ApiErrors.notFound('Document');
      }

      // Build document Q&A prompt
      const documentText = '[Document text will be available after OCR integration]';
      const history = conversationHistory
        ? conversationHistory
            .map((msg: any) => `${msg.role}: ${msg.content}`)
            .join('\n')
        : undefined;

      prompt = getDocumentQAPrompt(
        message,
        documentText,
        document.title,
        history
      );
    }

    // Get AI provider
    const provider = await getProviderInstance();

    // Build conversation messages
    const messages: ChatMessage[] = conversationHistory || [];
    messages.push({ role: 'user', content: prompt });

    // Call AI
    const response = await provider.chat(messages, {
      systemPrompt: AI_ASSISTANT_SYSTEM_PROMPT,
      temperature: 0.7,
      maxTokens: 2048,
    });

    // Store chat message in database
    await prisma.chatMessage.create({
      data: {
        userId: tokenPayload.userId,
        documentId: documentId || null,
        role: 'user',
        content: message,
      },
    });

    await prisma.chatMessage.create({
      data: {
        userId: tokenPayload.userId,
        documentId: documentId || null,
        role: 'assistant',
        content: response.content,
        sources: document
          ? JSON.stringify([
              {
                documentId: document.id,
                documentTitle: document.title,
              },
            ])
          : null,
      },
    });

    return successResponse({
      message: response.content,
      model: response.model,
      usage: response.usage,
      document: document
        ? {
            id: document.id,
            title: document.title,
          }
        : null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
