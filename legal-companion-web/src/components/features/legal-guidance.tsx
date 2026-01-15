'use client';

import { useState } from 'react';
import {
  Loader2,
  AlertCircle,
  Scale,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LegalGuidanceProps {
  onGuidanceReceived?: (guidance: any) => void;
  onError?: (error: string) => void;
  className?: string;
}

const LEGAL_CATEGORIES = [
  'contract',
  'employment',
  'intellectual_property',
  'real_estate',
  'family',
  'criminal',
  'immigration',
  'business',
  'tax',
  'consumer_rights',
  'other',
];

export function LegalGuidance({
  onGuidanceReceived,
  onError,
  className = '',
}: LegalGuidanceProps) {
  const [scenario, setScenario] = useState('');
  const [category, setCategory] = useState('contract');
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState('');
  const [guidance, setGuidance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!scenario.trim()) {
      setError('Please describe your legal scenario');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGuidance(null);

    try {
      const response = await fetch('/api/ai/legal-guidance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenario: scenario.trim(),
          category,
          country: country.trim() || undefined,
          region: region.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || 'Failed to get legal guidance'
        );
      }

      const data = await response.json();
      setGuidance(data.data.guidance);
      onGuidanceReceived?.(data.data.guidance);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setScenario('');
    setCategory('contract');
    setCountry('');
    setRegion('');
    setGuidance(null);
    setError(null);
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
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <Scale className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Legal Guidance Assistant
          </h2>
          <p className="text-sm text-gray-500">
            Get AI-powered legal guidance for your scenario
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">Important Notice</p>
            <p>
              This AI assistant provides general legal information only and is
              NOT a substitute for professional legal advice. Always consult with
              a licensed attorney for your specific situation.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      {!guidance && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Legal Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {LEGAL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe Your Scenario
            </label>
            <textarea
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              placeholder="Describe your legal situation in detail. Include relevant facts, dates, and any specific questions you have..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={isLoading}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">
                {scenario.length} characters
              </span>
              <span className="text-xs text-gray-500">
                Be as specific as possible for better guidance
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country (Optional)
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g., United States"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State/Region (Optional)
              </label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="e.g., California"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={!scenario.trim() || isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 h-12"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing Scenario...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Get Legal Guidance
              </>
            )}
          </Button>
        </form>
      )}

      {/* Guidance Results */}
      {guidance && !isLoading && (
        <div className="space-y-6">
          {/* Summary */}
          {guidance.summary && (
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="flex items-start gap-3 mb-3">
                <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <h3 className="text-base font-semibold text-gray-900">
                  Guidance Summary
                </h3>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {guidance.summary}
              </p>
            </div>
          )}

          {/* Risk Assessment */}
          {guidance.riskAssessment && (
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                <h3 className="text-base font-semibold text-gray-900">
                  Risk Assessment
                </h3>
              </div>
              <div className="space-y-4">
                {guidance.riskAssessment.overallRisk && (
                  <div
                    className={`p-4 rounded-lg border ${getRiskColor(
                      guidance.riskAssessment.overallRisk
                    )}`}
                  >
                    <span className="text-sm font-semibold uppercase">
                      {guidance.riskAssessment.overallRisk} Risk Overall
                    </span>
                  </div>
                )}
                {guidance.riskAssessment.risks &&
                  guidance.riskAssessment.risks.length > 0 && (
                    <ul className="space-y-2">
                      {guidance.riskAssessment.risks.map(
                        (risk: string, index: number) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-sm text-gray-700"
                          >
                            <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                            {risk}
                          </li>
                        )
                      )}
                    </ul>
                  )}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {guidance.recommendations && guidance.recommendations.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="flex items-start gap-3 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <h3 className="text-base font-semibold text-gray-900">
                  Recommendations
                </h3>
              </div>
              <ul className="space-y-3">
                {guidance.recommendations.map(
                  (recommendation: string, index: number) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200"
                    >
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">
                        {recommendation}
                      </span>
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

          {/* Next Steps */}
          {guidance.nextSteps && guidance.nextSteps.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="flex items-start gap-3 mb-3">
                <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <h3 className="text-base font-semibold text-gray-900">
                  Suggested Next Steps
                </h3>
              </div>
              <ol className="space-y-3">
                {guidance.nextSteps.map((step: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-semibold">
                      {index + 1}
                    </span>
                    <span className="text-sm text-gray-700 pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Additional Resources */}
          {guidance.resources && guidance.resources.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="flex items-start gap-3 mb-3">
                <Lightbulb className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <h3 className="text-base font-semibold text-gray-900">
                  Additional Resources
                </h3>
              </div>
              <ul className="space-y-2">
                {guidance.resources.map((resource: string, index: number) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-gray-700"
                  >
                    <CheckCircle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    {resource}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* New Scenario Button */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleReset}
              variant="outline"
              className="border-gray-300"
            >
              Get Guidance for Another Scenario
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
