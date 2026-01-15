'use client';

import { FileText, ExternalLink } from 'lucide-react';

interface Citation {
  documentId: string;
  documentTitle: string;
  excerpt?: string;
  page?: number;
  url?: string;
}

interface CitationCardProps {
  citations: Citation[];
  className?: string;
}

export function CitationCard({ citations, className = '' }: CitationCardProps) {
  if (!citations || citations.length === 0) {
    return null;
  }

  return (
    <div className={`mt-3 pt-3 border-t border-gray-200 ${className}`}>
      <div className="flex items-start gap-2 mb-2">
        <FileText className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Sources ({citations.length})
        </span>
      </div>
      <div className="space-y-2">
        {citations.map((citation, index) => (
          <div
            key={`${citation.documentId}-${index}`}
            className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded flex items-center justify-center text-xs font-semibold">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {citation.documentTitle}
                  </h4>
                  {citation.page && (
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      Page {citation.page}
                    </span>
                  )}
                </div>
                {citation.excerpt && (
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {citation.excerpt}
                  </p>
                )}
                {citation.url && (
                  <a
                    href={citation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 mt-2"
                  >
                    <span>View document</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
