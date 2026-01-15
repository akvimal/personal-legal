/**
 * GET /api/search - Global search endpoint
 * Search across all content types with filtering
 */

import { NextRequest } from 'next/server';
import { successResponse, ApiErrors, handleApiError } from '@/lib/api-response';
import { getUserFromRequest } from '@/lib/api-auth';
import { globalSearch } from '@/lib/search-service';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const tokenPayload = await getUserFromRequest(request);
    if (!tokenPayload) {
      return ApiErrors.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const types = searchParams.get('types')?.split(',');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const dateFrom = searchParams.get('from');
    const dateTo = searchParams.get('to');

    if (!query || query.trim().length === 0) {
      return ApiErrors.badRequest('Search query is required');
    }

    if (query.length < 2) {
      return ApiErrors.badRequest('Search query must be at least 2 characters');
    }

    // Perform search
    const results = await globalSearch({
      query: query.trim(),
      types,
      limit,
      offset: (page - 1) * limit,
      userId: tokenPayload.userId,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
    });

    return successResponse(results);
  } catch (error) {
    return handleApiError(error);
  }
}
