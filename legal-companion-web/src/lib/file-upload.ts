/**
 * File Upload Utilities
 * Validation and helper functions for file uploads
 */

// Maximum file size: 10MB
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Supported file types
export const SUPPORTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/tiff': ['.tiff', '.tif'],
  'text/plain': ['.txt'],
  'application/rtf': ['.rtf'],
} as const;

export const ALLOWED_MIME_TYPES = Object.keys(SUPPORTED_FILE_TYPES);

export const ALLOWED_EXTENSIONS = Object.values(SUPPORTED_FILE_TYPES).flat();

/**
 * Validate file type
 */
export function validateFileType(file: File): {
  valid: boolean;
  error?: string;
} {
  const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not supported. Allowed types: PDF, Word, Images (JPG, PNG, TIFF), TXT, RTF`,
    };
  }

  // Check file extension
  if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
    return {
      valid: false,
      error: `File extension ${fileExtension} is not supported`,
    };
  }

  return { valid: true };
}

/**
 * Validate file size
 */
export function validateFileSize(file: File): {
  valid: boolean;
  error?: string;
} {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size ${formatFileSize(file.size)} exceeds maximum allowed size of ${formatFileSize(MAX_FILE_SIZE)}`,
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: 'File is empty',
    };
  }

  return { valid: true };
}

/**
 * Validate file
 */
export function validateFile(file: File): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  const typeValidation = validateFileType(file);
  if (!typeValidation.valid && typeValidation.error) {
    errors.push(typeValidation.error);
  }

  const sizeValidation = validateFileSize(file);
  if (!sizeValidation.valid && sizeValidation.error) {
    errors.push(sizeValidation.error);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
}

/**
 * Get file extension
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Get file type category
 */
export function getFileCategory(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  if (
    mimeType.includes('word') ||
    mimeType === 'application/msword' ||
    mimeType.includes('wordprocessingml')
  )
    return 'document';
  if (mimeType === 'text/plain') return 'text';
  return 'other';
}

/**
 * Generate unique filename
 */
export function generateUniqueFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = getFileExtension(originalFilename);
  const nameWithoutExt = originalFilename.replace(`.${extension}`, '');

  // Sanitize filename
  const sanitized = nameWithoutExt
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);

  return `${sanitized}-${timestamp}-${random}.${extension}`;
}

/**
 * Create file upload payload
 */
export interface FileUploadPayload {
  file: File;
  documentData: {
    title: string;
    category: string;
    documentType: string;
    country: string;
    region: string;
    language?: string;
    parties?: string[];
    tags?: string[];
    signedDate?: string;
    startDate?: string;
    endDate?: string;
  };
}

/**
 * Upload file to server
 */
export async function uploadFile(
  payload: FileUploadPayload,
  onProgress?: (progress: number) => void
): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    // Validate file
    const validation = validateFile(payload.file);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.errors.join(', '),
      };
    }

    // Create FormData
    const formData = new FormData();
    formData.append('file', payload.file);
    formData.append('documentData', JSON.stringify(payload.documentData));

    // Get access token
    const accessToken = localStorage.getItem('auth_access_token');

    // Upload with progress tracking
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error?.message || 'Upload failed',
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}
