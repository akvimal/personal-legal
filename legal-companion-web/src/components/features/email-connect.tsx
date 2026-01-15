'use client';

import { useState } from 'react';
import { Mail, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmailConnectProps {
  onConnected?: (connectionId: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function EmailConnect({
  onConnected,
  onError,
  className = '',
}: EmailConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleConnect = () => {
    setIsConnecting(true);
    setError(null);

    // Redirect to OAuth endpoint
    window.location.href = '/api/integrations/email/connect';
  };

  // Check if returning from OAuth flow
  if (typeof window !== 'undefined' && !success) {
    const urlParams = new URLSearchParams(window.location.search);
    const emailConnected = urlParams.get('success') === 'email_connected';
    const connId = urlParams.get('connectionId');

    if (emailConnected && connId) {
      setSuccess(true);
      onConnected?.(connId);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }

    const errorParam = urlParams.get('error');
    if (errorParam && !error) {
      setError(errorParam.replace(/_/g, ' '));
      onError?.(errorParam);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
          <Mail className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Email Monitoring
          </h2>
          <p className="text-sm text-gray-500">
            Automatically track Terms of Service and subscription changes
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
              <p className="text-sm text-red-700 capitalize">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success State */}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-green-900 mb-1">
                Email Connected!
              </h3>
              <p className="text-sm text-green-700">
                Your email account is now connected. Click "Scan Emails" to start monitoring.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Connection Card */}
      {!success && (
        <div className="border border-gray-200 rounded-lg p-6 bg-white">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Connect Your Email
            </h3>
            <p className="text-sm text-gray-600 max-w-md mb-6">
              Connect your Gmail account to automatically monitor Terms of Service updates,
              subscription changes, and important notices.
            </p>

            <div className="w-full max-w-sm space-y-3 mb-6">
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Auto-detect T&C updates</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Extract pricing and renewal dates</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Risk assessment and alerts</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Automatic calendar event creation</span>
              </div>
            </div>

            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Connect Gmail
                </>
              )}
            </Button>

            <p className="text-xs text-gray-500 mt-4">
              By connecting, you'll be redirected to Google to authorize access.
              We only read emails related to terms and subscriptions.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
