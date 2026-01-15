/**
 * API Request Validation Utilities
 * Validation schemas and helpers for API endpoints
 */

/**
 * Validation error class
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Parse and validate pagination params
 */
export function parsePaginationParams(searchParams: URLSearchParams): {
  page: number;
  limit: number;
  skip: number;
} {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Parse and validate sort params
 */
export function parseSortParams(searchParams: URLSearchParams): {
  orderBy: string;
  order: 'asc' | 'desc';
} {
  const orderBy = searchParams.get('orderBy') || 'createdAt';
  const order = (searchParams.get('order') || 'desc') as 'asc' | 'desc';

  return { orderBy, order };
}

/**
 * Validate required fields
 */
export function validateRequiredFields(
  data: Record<string, unknown>,
  requiredFields: string[]
): void {
  const errors: Record<string, string[]> = {};

  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      errors[field] = [`${field} is required`];
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Validation failed', errors);
  }
}

/**
 * Validate registration data
 */
export function validateRegistration(data: {
  email: string;
  password: string;
  fullName: string;
}): void {
  const errors: Record<string, string[]> = {};

  // Email validation
  if (!data.email) {
    errors.email = ['Email is required'];
  } else if (!isValidEmail(data.email)) {
    errors.email = ['Invalid email format'];
  }

  // Password validation
  if (!data.password) {
    errors.password = ['Password is required'];
  } else {
    const passwordValidation = isValidPassword(data.password);
    if (!passwordValidation.valid) {
      errors.password = passwordValidation.errors;
    }
  }

  // Full name validation
  if (!data.fullName) {
    errors.fullName = ['Full name is required'];
  } else if (data.fullName.length < 2) {
    errors.fullName = ['Full name must be at least 2 characters long'];
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Validation failed', errors);
  }
}

/**
 * Validate document data
 */
export function validateDocument(data: {
  title: string;
  category: string;
  documentType: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  country: string;
  region: string;
}): void {
  const errors: Record<string, string[]> = {};

  const requiredFields = [
    'title',
    'category',
    'documentType',
    'filePath',
    'fileType',
    'fileSize',
    'country',
    'region',
  ];

  for (const field of requiredFields) {
    if (!data[field as keyof typeof data]) {
      errors[field] = [`${field} is required`];
    }
  }

  // File size validation (max 10MB)
  if (data.fileSize && data.fileSize > 10 * 1024 * 1024) {
    errors.fileSize = ['File size must not exceed 10MB'];
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Validation failed', errors);
  }
}
