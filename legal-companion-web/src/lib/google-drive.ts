/**
 * Google Drive API Service
 * Handles Google Drive file operations
 */

const DRIVE_API_BASE_URL = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime: string;
  modifiedTime: string;
  parents?: string[];
  webViewLink?: string;
  thumbnailLink?: string;
}

export interface DriveFolder {
  id: string;
  name: string;
  path: string;
}

export interface ListFilesOptions {
  folderId?: string;
  pageSize?: number;
  pageToken?: string;
  includeSubfolders?: boolean;
  mimeTypes?: string[];
}

export interface ListFilesResponse {
  files: DriveFile[];
  nextPageToken?: string;
  totalFiles: number;
}

// Supported file types for legal documents
const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/tiff',
  'text/plain',
  'application/rtf',
  'application/vnd.google-apps.document', // Google Docs
];

/**
 * List files from Google Drive
 */
export async function listFiles(
  accessToken: string,
  options: ListFilesOptions = {}
): Promise<ListFilesResponse> {
  const {
    folderId,
    pageSize = 100,
    pageToken,
    includeSubfolders = true,
    mimeTypes = SUPPORTED_MIME_TYPES,
  } = options;

  // Build query
  const queryParts: string[] = [];

  // Filter by folder
  if (folderId) {
    if (includeSubfolders) {
      queryParts.push(`'${folderId}' in parents`);
    } else {
      queryParts.push(`'${folderId}' in parents and trashed=false`);
    }
  }

  // Filter by file types
  if (mimeTypes.length > 0) {
    const mimeTypeQuery = mimeTypes
      .map((type) => `mimeType='${type}'`)
      .join(' or ');
    queryParts.push(`(${mimeTypeQuery})`);
  }

  // Exclude trashed files
  queryParts.push('trashed=false');

  const query = queryParts.join(' and ');

  const params = new URLSearchParams({
    q: query,
    pageSize: pageSize.toString(),
    fields:
      'nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime, parents, webViewLink, thumbnailLink)',
    orderBy: 'modifiedTime desc',
    ...(pageToken && { pageToken }),
  });

  const response = await fetch(`${DRIVE_API_BASE_URL}/files?${params}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Failed to list files: ${error.error?.message || response.statusText}`
    );
  }

  const data = await response.json();

  return {
    files: data.files || [],
    nextPageToken: data.nextPageToken,
    totalFiles: data.files?.length || 0,
  };
}

/**
 * Get file metadata
 */
export async function getFile(
  accessToken: string,
  fileId: string
): Promise<DriveFile> {
  const params = new URLSearchParams({
    fields:
      'id, name, mimeType, size, createdTime, modifiedTime, parents, webViewLink, thumbnailLink',
  });

  const response = await fetch(
    `${DRIVE_API_BASE_URL}/files/${fileId}?${params}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Failed to get file: ${error.error?.message || response.statusText}`
    );
  }

  return response.json();
}

/**
 * Download file content
 */
export async function downloadFile(
  accessToken: string,
  fileId: string,
  mimeType?: string
): Promise<Buffer> {
  // For Google Workspace files, we need to export them
  const isGoogleWorkspaceFile = mimeType?.startsWith('application/vnd.google-apps.');

  let url: string;
  if (isGoogleWorkspaceFile) {
    // Export Google Docs as PDF
    const exportMimeType =
      mimeType === 'application/vnd.google-apps.document'
        ? 'application/pdf'
        : 'application/pdf';
    url = `${DRIVE_API_BASE_URL}/files/${fileId}/export?mimeType=${exportMimeType}`;
  } else {
    url = `${DRIVE_API_BASE_URL}/files/${fileId}?alt=media`;
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Failed to download file: ${error.error?.message || response.statusText}`
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * List folders in Drive
 */
export async function listFolders(
  accessToken: string,
  parentFolderId?: string
): Promise<DriveFolder[]> {
  const query = parentFolderId
    ? `'${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`
    : `mimeType='application/vnd.google-apps.folder' and trashed=false`;

  const params = new URLSearchParams({
    q: query,
    pageSize: '100',
    fields: 'files(id, name, parents)',
    orderBy: 'name',
  });

  const response = await fetch(`${DRIVE_API_BASE_URL}/files?${params}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Failed to list folders: ${error.error?.message || response.statusText}`
    );
  }

  const data = await response.json();

  // Get folder paths
  const folders = await Promise.all(
    (data.files || []).map(async (folder: any) => {
      const path = await getFolderPath(accessToken, folder.id);
      return {
        id: folder.id,
        name: folder.name,
        path,
      };
    })
  );

  return folders;
}

/**
 * Get folder path
 */
export async function getFolderPath(
  accessToken: string,
  folderId: string
): Promise<string> {
  if (folderId === 'root') {
    return '/My Drive';
  }

  const parts: string[] = [];
  let currentId = folderId;

  while (currentId !== 'root') {
    const params = new URLSearchParams({
      fields: 'name, parents',
    });

    const response = await fetch(
      `${DRIVE_API_BASE_URL}/files/${currentId}?${params}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) break;

    const data = await response.json();
    parts.unshift(data.name);

    if (!data.parents || data.parents.length === 0) break;
    currentId = data.parents[0];
  }

  return `/My Drive/${parts.join('/')}`;
}

/**
 * Upload file to Google Drive
 */
export async function uploadFile(
  accessToken: string,
  fileName: string,
  content: Buffer,
  mimeType: string,
  folderId?: string
): Promise<DriveFile> {
  const metadata = {
    name: fileName,
    ...(folderId && { parents: [folderId] }),
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const body =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    content.toString('binary') +
    closeDelimiter;

  const response = await fetch(
    `${DRIVE_UPLOAD_URL}/files?uploadType=multipart`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Failed to upload file: ${error.error?.message || response.statusText}`
    );
  }

  return response.json();
}

/**
 * Watch for file changes (set up webhook)
 */
export async function watchFolder(
  accessToken: string,
  folderId: string,
  webhookUrl: string,
  channelId: string
): Promise<{ channelId: string; resourceId: string; expiration: number }> {
  const response = await fetch(
    `${DRIVE_API_BASE_URL}/files/${folderId}/watch`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: channelId,
        type: 'web_hook',
        address: webhookUrl,
        expiration: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Failed to watch folder: ${error.error?.message || response.statusText}`
    );
  }

  return response.json();
}

/**
 * Stop watching folder
 */
export async function stopWatching(
  accessToken: string,
  channelId: string,
  resourceId: string
): Promise<void> {
  const response = await fetch(`${DRIVE_API_BASE_URL}/channels/stop`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: channelId,
      resourceId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Failed to stop watching: ${error.error?.message || response.statusText}`
    );
  }
}

/**
 * Check if file type is supported
 */
export function isSupportedFileType(mimeType: string): boolean {
  return SUPPORTED_MIME_TYPES.includes(mimeType);
}
