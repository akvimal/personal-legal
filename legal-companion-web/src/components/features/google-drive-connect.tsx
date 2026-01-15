'use client';

import { useState } from 'react';
import { Cloud, Folder, Settings, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GoogleDriveConnectProps {
  onConnected?: (connectionId: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

interface DriveFolder {
  id: string;
  name: string;
  path: string;
}

export function GoogleDriveConnect({
  onConnected,
  onError,
  className = '',
}: GoogleDriveConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<DriveFolder | null>(null);
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);
  const [isCompletingSetup, setIsCompletingSetup] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = () => {
    setIsConnecting(true);
    setError(null);

    // Redirect to OAuth endpoint
    window.location.href = '/api/integrations/google/auth';
  };

  const handleLoadFolders = async (connId: string) => {
    setIsLoadingFolders(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/integrations/google/folders?connectionId=${connId}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to load folders');
      }

      const data = await response.json();
      setFolders(data.data.folders);
      setConnectionId(connId);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load folders';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoadingFolders(false);
    }
  };

  const handleCompleteSetup = async () => {
    if (!connectionId || !selectedFolder) return;

    setIsCompletingSetup(true);
    setError(null);

    try {
      const response = await fetch('/api/integrations/google/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          connectionId,
          folderId: selectedFolder.id,
          folderName: selectedFolder.name,
          folderPath: selectedFolder.path,
          includeSubfolders: true,
          autoSync: true,
          syncFrequency: 'realtime',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || 'Failed to complete setup'
        );
      }

      const data = await response.json();
      onConnected?.(connectionId);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to complete setup';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsCompletingSetup(false);
    }
  };

  // Check if returning from OAuth flow
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const connId = urlParams.get('connectionId');
    const success = urlParams.get('success');

    if (success === 'true' && connId && !connectionId && !isLoadingFolders) {
      handleLoadFolders(connId);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
          <Cloud className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Google Drive Integration
          </h2>
          <p className="text-sm text-gray-500">
            Automatically sync documents from your Google Drive
          </p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-900 mb-1">
                Connection Error
              </h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Initial Connection */}
      {!connectionId && !isLoadingFolders && (
        <div className="border border-gray-200 rounded-lg p-6 bg-white">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center mb-4">
              <Cloud className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Connect Your Google Drive
            </h3>
            <p className="text-sm text-gray-600 max-w-md mb-6">
              Securely connect your Google Drive to automatically sync legal
              documents. We'll only access files you choose to share.
            </p>
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Cloud className="w-4 h-4 mr-2" />
                  Connect Google Drive
                </>
              )}
            </Button>
            <p className="text-xs text-gray-500 mt-4">
              By connecting, you'll be redirected to Google to authorize access
            </p>
          </div>
        </div>
      )}

      {/* Loading Folders */}
      {isLoadingFolders && (
        <div className="border border-gray-200 rounded-lg p-8 bg-white">
          <div className="flex flex-col items-center justify-center text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Loading Folders
            </h3>
            <p className="text-sm text-gray-600">
              Fetching your Google Drive folders...
            </p>
          </div>
        </div>
      )}

      {/* Folder Selection */}
      {connectionId && folders.length > 0 && !isCompletingSetup && (
        <div className="border border-gray-200 rounded-lg p-6 bg-white">
          <div className="flex items-start gap-3 mb-4">
            <Folder className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                Select Folder to Sync
              </h3>
              <p className="text-sm text-gray-600">
                Choose which folder contains your legal documents
              </p>
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto mb-4">
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => setSelectedFolder(folder)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                  selectedFolder?.id === folder.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Folder
                    className={`w-5 h-5 flex-shrink-0 ${
                      selectedFolder?.id === folder.id
                        ? 'text-blue-600'
                        : 'text-gray-400'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {folder.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {folder.path}
                    </p>
                  </div>
                  {selectedFolder?.id === folder.id && (
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200 mb-4">
            <Settings className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div className="flex-1 text-sm text-blue-900">
              <p className="font-medium mb-1">Sync Settings</p>
              <ul className="text-xs space-y-1">
                <li>• Include subfolders: Yes</li>
                <li>• Auto-sync: Enabled</li>
                <li>• Frequency: Real-time (when files change)</li>
              </ul>
            </div>
          </div>

          <Button
            onClick={handleCompleteSetup}
            disabled={!selectedFolder}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Complete Setup
          </Button>
        </div>
      )}

      {/* Completing Setup */}
      {isCompletingSetup && (
        <div className="border border-gray-200 rounded-lg p-8 bg-white">
          <div className="flex flex-col items-center justify-center text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Setting Up Connection
            </h3>
            <p className="text-sm text-gray-600">
              Configuring Google Drive sync...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
