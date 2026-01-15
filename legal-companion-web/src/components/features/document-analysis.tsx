'use client';

import { useState } from 'react';
import {
  Loader2,
  AlertCircle,
  FileText,
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle,
  Scale,
  Tag,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type DocumentAnalysis as DocumentAnalysisType } from '@/lib/ai-service';

interface DocumentAnalysisProps {
  documentId: string;
  documentTitle: string;
  documentText?: string;
  onAnalysisComplete?: (analysis: DocumentAnalysisType) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function DocumentAnalysis({
  documentId,
  documentTitle,
  documentText,
  onAnalysisComplete,
  onError,
  className = '',
}: DocumentAnalysisProps) {
  const [analysis, setAnalysis] = useState<DocumentAnalysisType | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/analyze-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId,
          documentText,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || 'Failed to analyze document'
        );
      }

      const data = await response.json();
      setAnalysis(data.data.analysis);
      onAnalysisComplete?.(data.data.analysis);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
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

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              AI Document Analysis
            </h2>
            <p className="text-sm text-gray-500">{documentTitle}</p>
          </div>
        </div>
        {!analysis && (
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Analyze Document
              </>
            )}
          </Button>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-900 mb-1">
                Analysis Failed
              </h3>
              <p className="text-sm text-red-700">{error}</p>
              <Button
                onClick={handleAnalyze}
                variant="outline"
                size="sm"
                className="mt-3 border-red-300 text-red-700 hover:bg-red-100"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isAnalyzing && !error && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              Analyzing Document
            </h3>
            <p className="text-sm text-blue-700">
              AI is reading and extracting key information from your document...
            </p>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && !isAnalyzing && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="flex items-start gap-3 mb-3">
              <FileText className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
              <h3 className="text-base font-semibold text-gray-900">Summary</h3>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {analysis.summary}
            </p>
          </div>

          {/* Metadata */}
          {analysis.metadata && (
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="flex items-start gap-3 mb-4">
                <Tag className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                <h3 className="text-base font-semibold text-gray-900">
                  Document Details
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Type:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {analysis.metadata.documentType}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Category:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {analysis.metadata.category}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Confidence:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {Math.round(analysis.metadata.confidence * 100)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Key Terms */}
          {analysis.keyTerms && analysis.keyTerms.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="flex items-start gap-3 mb-3">
                <Tag className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                <h3 className="text-base font-semibold text-gray-900">
                  Key Terms
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.keyTerms.map((term, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                  >
                    {term}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Parties */}
          {analysis.parties && analysis.parties.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="flex items-start gap-3 mb-3">
                <Users className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                <h3 className="text-base font-semibold text-gray-900">
                  Parties Involved
                </h3>
              </div>
              <ul className="space-y-2">
                {analysis.parties.map((party, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 text-sm text-gray-700"
                  >
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    {party}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Important Dates */}
          {analysis.dates && analysis.dates.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="flex items-start gap-3 mb-3">
                <Calendar className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                <h3 className="text-base font-semibold text-gray-900">
                  Important Dates
                </h3>
              </div>
              <div className="space-y-3">
                {analysis.dates.map((dateInfo, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {dateInfo.date}
                        </span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          {dateInfo.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{dateInfo.context}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Obligations */}
          {analysis.obligations && analysis.obligations.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="flex items-start gap-3 mb-3">
                <CheckCircle className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                <h3 className="text-base font-semibold text-gray-900">
                  Obligations
                </h3>
              </div>
              <div className="space-y-3">
                {analysis.obligations.map((obligation, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {obligation.party}
                      </span>
                      {obligation.deadline && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {obligation.deadline}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700">
                      {obligation.obligation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risks */}
          {analysis.risks && analysis.risks.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="flex items-start gap-3 mb-3">
                <AlertTriangle className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                <h3 className="text-base font-semibold text-gray-900">
                  Risk Assessment
                </h3>
              </div>
              <div className="space-y-3">
                {analysis.risks.map((risk, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${getRiskColor(
                      risk.severity
                    )}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm font-semibold uppercase">
                        {risk.severity} Risk
                      </span>
                    </div>
                    <p className="text-sm font-medium mb-2">{risk.description}</p>
                    <div className="pl-6 text-sm">
                      <span className="font-medium">Recommendation: </span>
                      {risk.recommendation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compliance */}
          {analysis.compliance && (
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="flex items-start gap-3 mb-4">
                <Scale className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                <h3 className="text-base font-semibold text-gray-900">
                  Compliance Information
                </h3>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Jurisdiction
                  </h4>
                  <p className="text-sm text-gray-900">
                    {analysis.compliance.jurisdiction}
                  </p>
                </div>
                {analysis.compliance.applicableLaws &&
                  analysis.compliance.applicableLaws.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Applicable Laws
                      </h4>
                      <ul className="space-y-1">
                        {analysis.compliance.applicableLaws.map((law, index) => (
                          <li
                            key={index}
                            className="flex items-center gap-2 text-sm text-gray-700"
                          >
                            <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            {law}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                {analysis.compliance.complianceIssues &&
                  analysis.compliance.complianceIssues.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Compliance Issues
                      </h4>
                      <ul className="space-y-2">
                        {analysis.compliance.complianceIssues.map(
                          (issue, index) => (
                            <li
                              key={index}
                              className="flex items-start gap-2 text-sm text-gray-700 p-2 bg-yellow-50 rounded border border-yellow-200"
                            >
                              <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                              {issue}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* Re-analyze Button */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleAnalyze}
              variant="outline"
              className="border-gray-300"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Re-analyze Document
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
