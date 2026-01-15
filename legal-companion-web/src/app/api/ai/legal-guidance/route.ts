/**
 * POST /api/ai/legal-guidance - Get legal guidance for a scenario
 * Provides risk assessment, recommendations, and next steps
 */

import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, ApiErrors, handleApiError } from '@/lib/api-response';
import { getUserFromRequest } from '@/lib/api-auth';
import { getProviderInstance, isAIConfigured } from '@/lib/ai-service';
import { getLegalGuidancePrompt, AI_ASSISTANT_SYSTEM_PROMPT } from '@/lib/ai-prompts';

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
    const { scenario, category, country, region } = body;

    if (!scenario) {
      return ApiErrors.badRequest('Scenario is required');
    }

    if (!category) {
      return ApiErrors.badRequest('Category is required');
    }

    // Use user's location if not provided
    const user = await prisma.user.findUnique({
      where: { id: tokenPayload.userId },
      include: { preferences: true },
    });

    const userCountry = country || user?.preferences?.country || 'Unknown';
    const userRegion = region || user?.preferences?.region || 'Unknown';

    // Generate legal guidance prompt
    const prompt = getLegalGuidancePrompt(
      scenario,
      category,
      userCountry,
      userRegion
    );

    // Get AI provider
    const provider = await getProviderInstance();

    // Call AI
    const response = await provider.chat(
      [{ role: 'user', content: prompt }],
      {
        systemPrompt: AI_ASSISTANT_SYSTEM_PROMPT,
        temperature: 0.5, // Moderate temperature for balanced guidance
        maxTokens: 3072,
      }
    );

    // Parse JSON response
    let guidance;
    try {
      guidance = JSON.parse(response.content);
    } catch (error) {
      // If parsing fails, return raw response
      guidance = {
        summary: response.content,
        error: 'Failed to parse structured guidance',
      };
    }

    // Store legal guidance request
    await prisma.legalGuidanceRequest.create({
      data: {
        userId: tokenPayload.userId,
        scenario,
        category,
        country: userCountry,
        region: userRegion,
        response: guidance,
      },
    });

    return successResponse({
      guidance,
      model: response.model,
      usage: response.usage,
      jurisdiction: {
        country: userCountry,
        region: userRegion,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
