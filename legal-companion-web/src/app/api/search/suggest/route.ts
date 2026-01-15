/**
 * GET /api/search/suggest - Search autocomplete
 * Returns search suggestions for autocomplete
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors, handleApiError } from '@/lib/api-response';
import { getUserFromRequest } from '@/lib/api-auth';
import { getSearchSuggestions } from '@/lib/search-service';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const tokenPayload = await getUserFromRequest(request);
    if (!tokenPayload) {
      return ApiErrors.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '5');

    if (!query || query.trim().length === 0) {
      return successResponse({ suggestions: [] });
    }

    if (query.length < 2) {
      return successResponse({ suggestions: [] });
    }

    // Get suggestions
    const suggestions = await getSearchSuggestions(
      query.trim(),
      tokenPayload.userId,
      Math.min(limit, 10) // Max 10 suggestions
    );

    return successResponse({ suggestions });
  } catch (error) {
    return handleApiError(error);
  }
}
