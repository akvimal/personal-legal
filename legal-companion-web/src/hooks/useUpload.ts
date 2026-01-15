import { useState, useCallback } from 'react';
import type { DocumentCategory } from '@/types';

interface UploadProgress {
  progress: number;
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  file: File | null;
  error: string | null;
}

/**
 * Hook for handling file uploads with progress tracking
 */
export function useUpload() {
  const [uploadState, setUploadState] = useState<UploadProgress>({
    progress: 0,
    status: 'idle',
    file: null,
    error: null,
  });

  // Validate file
  const validateFile = useCallback((file: File): { valid: boolean; error?: string } => {
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds 10MB limit' };
    }

    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/png',
      'image/jpeg',
      'image/jpg',
    ];

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Invalid file type. Only PDF, Word, and images are allowed' };
    }

    return { valid: true };
  }, []);

  // Upload file
  const uploadFile = useCallback(
    async (
      file: File,
      category: DocumentCategory,
      metadata?: {
        title?: string;
        tags?: string[];
        [key: string]: any;
      }
    ) => {
      // Validate file
      const validation = validateFile(file);
      if (!validation.valid) {
        setUploadState({
          progress: 0,
          status: 'error',
          file: null,
          error: validation.error || 'Invalid file',
        });
        throw new Error(validation.error);
      }

      setUploadState({
        progress: 0,
        status: 'uploading',
        file,
        error: null,
      });

      try {
        // TODO: Replace with actual file upload API call
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise((resolve) => setTimeout(resolve, 200));
          setUploadState((prev) => ({
            ...prev,
            progress,
            status: progress === 100 ? 'processing' : 'uploading',
          }));
        }

        // Simulate processing
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock response
        const response = {
          id: `doc-${Date.now()}`,
          title: metadata?.title || file.name,
          category,
          filePath: URL.createObjectURL(file),
          fileType: file.type,
          fileSize: file.size,
          uploadedAt: new Date(),
          tags: metadata?.tags || [],
        };

        setUploadState({
          progress: 100,
          status: 'success',
          file,
          error: null,
        });

        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Upload failed';
        setUploadState({
          progress: 0,
          status: 'error',
          file: null,
          error: errorMessage,
        });
        throw err;
      }
    },
    [validateFile]
  );

  // Reset upload state
  const reset = useCallback(() => {
    setUploadState({
      progress: 0,
      status: 'idle',
      file: null,
      error: null,
    });
  }, []);

  return {
    ...uploadState,
    uploadFile,
    validateFile,
    reset,
  };
}
