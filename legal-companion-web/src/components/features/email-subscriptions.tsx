'use client';

import { useState, useEffect } from 'react';
import {
  Mail,
  RefreshCw,
  AlertCircle,
  Shield,
  DollarSign,
  Calendar,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface EmailSubscriptionsProps {
  connectionId: string;
  className?: string;
}

interface ProcessedEmail {
  id: string;
  subject: string;
  from: string;
  receivedAt: string;
  category: string;
  priority: string;
  extractedTerms?: any;
}

export function EmailSubscriptions({
  connectionId,
  className = '',
}: EmailSubscriptionsProps) {
  const [emails, setEmails] = useState<ProcessedEmail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch processed emails
  const fetchEmails = async () => {
    try {
      const response = await fetch(
        `/api/integrations/email/messages?connectionId=${connectionId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch emails');
      }

      const data = await response.json();
      setEmails(data.data.emails);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load emails');
    } finally {
      setIsLoading(false);
    }
  };

  // Scan for new emails
  const handleScan = async () => {
    setIsScanning(true);
    setError(null);

    try {
      const response = await fetch('/api/integrations/email/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ connectionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to scan emails');
      }

      // Refresh the list
      await fetchEmails();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan emails');
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, [connectionId]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCategoryLabel = (category: string) => {
    return category.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-12 ${className}`}>
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Monitored Emails
            </h2>
            <p className="text-sm text-gray-500">
              {emails.length} T&C emails tracked
            </p>
          </div>
        </div>
        <Button
          onClick={handleScan}
          disabled={isScanning}
          variant="outline"
          size="sm"
        >
          {isScanning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Scan Emails
            </>
          )}
        </Button>
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

      {/* Empty State */}
      {emails.length === 0 && !isLoading && (
        <div className="border border-gray-200 rounded-lg p-12 bg-white text-center">
          <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Emails Processed Yet
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Click "Scan Emails" to start monitoring your inbox for T&C updates
          </p>
          <Button onClick={handleScan} disabled={isScanning}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Scan Now
          </Button>
        </div>
      )}

      {/* Email List */}
      {emails.length > 0 && (
        <div className="space-y-4">
          {emails.map((email) => (
            <div
              key={email.id}
              className="border border-gray-200 rounded-lg p-6 bg-white hover:border-gray-300 transition-colors"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 mb-1 truncate">
                    {email.subject}
                  </h3>
                  <p className="text-sm text-gray-600">{email.from}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(email.receivedAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getPriorityColor(
                      email.priority
                    )}`}
                  >
                    {email.priority}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    {getCategoryLabel(email.category)}
                  </span>
                </div>
              </div>

              {/* Extracted Info */}
              {email.extractedTerms && (
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  {/* Summary */}
                  {email.extractedTerms.summary && (
                    <p className="text-sm text-gray-700">
                      {email.extractedTerms.summary}
                    </p>
                  )}

                  {/* Key Details */}
                  <div className="grid grid-cols-3 gap-4">
                    {/* Pricing */}
                    {email.extractedTerms.pricing && (
                      <div className="flex items-start gap-2">
                        <DollarSign className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-gray-700">
                            Pricing
                          </p>
                          <p className="text-xs text-gray-600">
                            {email.extractedTerms.pricing.amount &&
                              `${email.extractedTerms.pricing.currency}${email.extractedTerms.pricing.amount}`}
                            {email.extractedTerms.pricing.frequency &&
                              ` / ${email.extractedTerms.pricing.frequency}`}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Renewal Date */}
                    {email.extractedTerms.renewalDate && (
                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-gray-700">
                            Renewal
                          </p>
                          <p className="text-xs text-gray-600">
                            {email.extractedTerms.renewalDate}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Risk Score */}
                    {email.extractedTerms.riskScore !== undefined && (
                      <div className="flex items-start gap-2">
                        <Shield className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-gray-700">
                            Risk Score
                          </p>
                          <p className="text-xs text-gray-600">
                            {email.extractedTerms.riskScore}/100
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Risks */}
                  {email.extractedTerms.risks &&
                    email.extractedTerms.risks.length > 0 && (
                      <div className="pt-3 border-t border-gray-100">
                        <p className="text-xs font-medium text-gray-700 mb-2">
                          Identified Risks:
                        </p>
                        <div className="space-y-2">
                          {email.extractedTerms.risks.map(
                            (risk: any, index: number) => (
                              <div
                                key={index}
                                className={`p-2 rounded border ${getPriorityColor(
                                  risk.severity
                                )}`}
                              >
                                <p className="text-xs font-medium">
                                  {risk.description}
                                </p>
                                {risk.recommendation && (
                                  <p className="text-xs mt-1 opacity-80">
                                    💡 {risk.recommendation}
                                  </p>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
