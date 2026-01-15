'use client';

import { useState, useEffect } from 'react';
import {
  Cloud,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader2,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface GoogleDriveSyncStatusProps {
  connectionId: string;
  onDisconnect?: () => void;
  className?: string;
}

interface SyncStats {
  total: number;
  synced: number;
  failed: number;
  byStatus: {
    pending: number;
    syncing: number;
    completed: number;
    failed: number;
  };
}

interface ConnectionInfo {
  id: string;
  status: string;
  googleAccountEmail: string;
  folderName: string;
  autoSync: boolean;
  syncFrequency: string;
  lastSync: string | null;
  nextSync: string | null;
}

export function GoogleDriveSyncStatus({
  connectionId,
  onDisconnect,
  className = '',
}: GoogleDriveSyncStatusProps) {
  const [connection, setConnection] = useState<ConnectionInfo | null>(null);
  const [stats, setStats] = useState<SyncStats | null>(null);
  const [recentErrors, setRecentErrors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch sync status
  const fetchStatus = async () => {
    try {
      const response = await fetch(
        `/api/integrations/google/sync/status?connectionId=${connectionId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch sync status');
      }

      const data = await response.json();
      setConnection(data.data.connection);
      setStats(data.data.stats);
      setRecentErrors(data.data.recentErrors);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load status');
    } finally {
      setIsLoading(false);
    }
  };

  // Manual sync trigger
  const handleSync = async () => {
    setIsSyncing(true);
    setError(null);

    try {
      const response = await fetch('/api/integrations/google/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ connectionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to start sync');
      }

      // Refresh status after starting sync
      setTimeout(fetchStatus, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start sync');
    } finally {
      setIsSyncing(false);
    }
  };

  // Disconnect
  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect Google Drive?')) {
      return;
    }

    setIsDisconnecting(true);
    setError(null);

    try {
      const response = await fetch('/api/integrations/google/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ connectionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect');
      }

      onDisconnect?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect');
      setIsDisconnecting(false);
    }
  };

  // Load initial status
  useEffect(() => {
    fetchStatus();

    // Poll for status updates every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [connectionId]);

  if (isLoading) {
    return (
      <div className={`border border-gray-200 rounded-lg p-8 bg-white ${className}`}>
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (!connection || !stats) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-600 bg-green-50';
      case 'syncing':
        return 'text-blue-600 bg-blue-50';
      case 'error':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4" />;
      case 'syncing':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'error':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Cloud className="w-4 h-4" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
            <Cloud className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Google Drive Sync
            </h2>
            <p className="text-sm text-gray-500">{connection.googleAccountEmail}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleSync}
            disabled={isSyncing || connection.status === 'syncing'}
            variant="outline"
            size="sm"
          >
            {isSyncing || connection.status === 'syncing' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync Now
              </>
            )}
          </Button>
          <Button
            onClick={handleDisconnect}
            disabled={isDisconnecting}
            variant="outline"
            size="sm"
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Connection Info */}
      <div className="border border-gray-200 rounded-lg p-6 bg-white">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Status</p>
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                connection.status
              )}`}
            >
              {getStatusIcon(connection.status)}
              <span className="capitalize">{connection.status}</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Folder</p>
            <p className="text-sm font-medium text-gray-900">
              {connection.folderName}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Auto Sync</p>
            <p className="text-sm font-medium text-gray-900">
              {connection.autoSync ? 'Enabled' : 'Disabled'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Frequency</p>
            <p className="text-sm font-medium text-gray-900 capitalize">
              {connection.syncFrequency}
            </p>
          </div>
          {connection.lastSync && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Last Sync</p>
              <p className="text-sm text-gray-700 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDistanceToNow(new Date(connection.lastSync), {
                  addSuffix: true,
                })}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sync Statistics */}
      <div className="border border-gray-200 rounded-lg p-6 bg-white">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          Sync Statistics
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-900">
              {stats.byStatus.completed}
            </p>
            <p className="text-xs text-green-700">Synced</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Loader2 className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-900">
              {stats.byStatus.pending + stats.byStatus.syncing}
            </p>
            <p className="text-xs text-blue-700">Pending</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
            <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-900">
              {stats.byStatus.failed}
            </p>
            <p className="text-xs text-red-700">Failed</p>
          </div>
        </div>
      </div>

      {/* Recent Errors */}
      {recentErrors.length > 0 && (
        <div className="border border-red-200 rounded-lg p-6 bg-red-50">
          <h3 className="text-base font-semibold text-red-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Recent Errors
          </h3>
          <div className="space-y-2">
            {recentErrors.map((error, index) => (
              <div
                key={index}
                className="p-3 bg-white rounded border border-red-200"
              >
                <p className="text-sm font-medium text-gray-900">
                  {error.driveFileName}
                </p>
                <p className="text-xs text-red-700 mt-1">{error.errorMessage}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDistanceToNow(new Date(error.updatedAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
