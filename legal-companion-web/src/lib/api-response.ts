/**
 * API Response Utilities
 * Standardized response formats for API endpoints
 */

import { NextResponse } from 'next/server';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

/**
 * Success response helper
 */
export function successResponse<T>(data: T, meta?: ApiResponse['meta']) {
  return NextResponse.json<ApiResponse<T>>(
    {
      success: true,
      data,
      ...(meta && { meta }),
    },
    { status: 200 }
  );
}

/**
 * Created response helper (201)
 */
export function createdResponse<T>(data: T) {
  return NextResponse.json<ApiResponse<T>>(
    {
      success: true,
      data,
    },
    { status: 201 }
  );
}

/**
 * Error response helper
 */
export function errorResponse(
  code: string,
  message: string,
  status: number = 400,
  details?: unknown
) {
  return NextResponse.json<ApiResponse>(
    {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
    },
    { status }
  );
}

/**
 * Common error responses
 */
export const ApiErrors = {
  badRequest: (message: string, details?: unknown) =>
    errorResponse('BAD_REQUEST', message, 400, details),

  unauthorized: (message: string = 'Unauthorized') =>
    errorResponse('UNAUTHORIZED', message, 401),

  forbidden: (message: string = 'Forbidden') =>
    errorResponse('FORBIDDEN', message, 403),

  notFound: (resource: string = 'Resource') =>
    errorResponse('NOT_FOUND', `${resource} not found`, 404),

  conflict: (message: string) => errorResponse('CONFLICT', message, 409),

  validationError: (details: unknown) =>
    errorResponse('VALIDATION_ERROR', 'Validation failed', 422, details),

  internalError: (message: string = 'Internal server error') =>
    errorResponse('INTERNAL_ERROR', message, 500),

  serviceUnavailable: (message: string = 'Service temporarily unavailable') =>
    errorResponse('SERVICE_UNAVAILABLE', message, 503),
};

/**
 * Catch and format errors
 */
export function handleApiError(error: unknown) {
  console.error('API Error:', error);

  if (error instanceof Error) {
    // Prisma errors
    if (error.name === 'PrismaClientKnownRequestError') {
      const prismaError = error as { code: string; meta?: Record<string, unknown> };

      switch (prismaError.code) {
        case 'P2002':
          return ApiErrors.conflict('A record with this value already exists');
        case 'P2025':
          return ApiErrors.notFound();
        default:
          return ApiErrors.internalError('Database error');
      }
    }

    // Validation errors
    if (error.name === 'ValidationError') {
      return ApiErrors.validationError(error.message);
    }

    return ApiErrors.internalError(error.message);
  }

  return ApiErrors.internalError();
}
