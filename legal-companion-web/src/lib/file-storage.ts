/**
 * File Storage Service
 * Abstraction layer for file storage (local/cloud)
 * Currently implements local storage, cloud-ready interface for future migration
 */

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const mkdir = promisify(fs.mkdir);
const access = promisify(fs.access);

// Storage configuration
const STORAGE_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
const PUBLIC_URL_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

/**
 * Ensure upload directory exists
 */
export async function ensureUploadDir(): Promise<void> {
  try {
    await access(STORAGE_DIR);
  } catch {
    await mkdir(STORAGE_DIR, { recursive: true });
  }
}

/**
 * Save file to storage
 */
export async function saveFile(
  buffer: Buffer,
  filename: string
): Promise<{
  success: boolean;
  filePath?: string;
  publicUrl?: string;
  error?: string;
}> {
  try {
    await ensureUploadDir();

    const filePath = path.join(STORAGE_DIR, filename);
    await writeFile(filePath, buffer);

    return {
      success: true,
      filePath: `/uploads/${filename}`,
      publicUrl: `${PUBLIC_URL_BASE}/uploads/${filename}`,
    };
  } catch (error) {
    console.error('File save error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save file',
    };
  }
}

/**
 * Delete file from storage
 */
export async function deleteFile(filename: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const filePath = path.join(STORAGE_DIR, filename);
    await unlink(filePath);

    return { success: true };
  } catch (error) {
    console.error('File delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete file',
    };
  }
}

/**
 * Get file path from storage
 */
export function getFilePath(filename: string): string {
  return path.join(STORAGE_DIR, filename);
}

/**
 * Get public URL for file
 */
export function getPublicUrl(filename: string): string {
  return `${PUBLIC_URL_BASE}/uploads/${filename}`;
}

/**
 * Cloud Storage Interface (for future implementation)
 * This interface can be implemented for S3, GCS, Azure Blob, etc.
 */
export interface CloudStorageProvider {
  upload(buffer: Buffer, filename: string): Promise<string>;
  delete(filename: string): Promise<void>;
  getSignedUrl(filename: string, expiresIn: number): Promise<string>;
  getPublicUrl(filename: string): string;
}

/**
 * S3 Storage Provider (placeholder for future implementation)
 */
export class S3StorageProvider implements CloudStorageProvider {
  async upload(buffer: Buffer, filename: string): Promise<string> {
    // TODO: Implement S3 upload with AWS SDK
    // const s3 = new AWS.S3();
    // await s3.putObject({
    //   Bucket: process.env.AWS_S3_BUCKET,
    //   Key: filename,
    //   Body: buffer,
    // }).promise();
    throw new Error('S3 storage not yet implemented');
  }

  async delete(filename: string): Promise<void> {
    // TODO: Implement S3 delete
    throw new Error('S3 storage not yet implemented');
  }

  async getSignedUrl(filename: string, expiresIn: number): Promise<string> {
    // TODO: Implement S3 signed URL
    throw new Error('S3 storage not yet implemented');
  }

  getPublicUrl(filename: string): string {
    // TODO: Implement S3 public URL
    throw new Error('S3 storage not yet implemented');
  }
}

/**
 * Google Cloud Storage Provider (placeholder for future implementation)
 */
export class GCSStorageProvider implements CloudStorageProvider {
  async upload(buffer: Buffer, filename: string): Promise<string> {
    // TODO: Implement GCS upload
    throw new Error('GCS storage not yet implemented');
  }

  async delete(filename: string): Promise<void> {
    // TODO: Implement GCS delete
    throw new Error('GCS storage not yet implemented');
  }

  async getSignedUrl(filename: string, expiresIn: number): Promise<string> {
    // TODO: Implement GCS signed URL
    throw new Error('GCS storage not yet implemented');
  }

  getPublicUrl(filename: string): string {
    // TODO: Implement GCS public URL
    throw new Error('GCS storage not yet implemented');
  }
}
