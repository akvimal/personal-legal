'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Lightbulb,
  FileText,
  Briefcase,
  Home,
  ShoppingCart,
  Users,
  DollarSign,
  Shield,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  ChevronRight,
  Scale,
  BookOpen,
  ExternalLink,
} from 'lucide-react';

const popularQuestions = [
  {
    question: 'What should I check before renting a property?',
    category: 'property',
    icon: Home,
  },
  {
    question: 'How do I hire a freelancer legally?',
    category: 'employment',
    icon: Briefcase,
  },
  {
    question: 'What documents do I need to start a business?',
    category: 'business',
    icon: Briefcase,
  },
  {
    question: 'Should I sign this NDA?',
    category: 'employment',
    icon: FileText,
  },
  {
    question: 'How do I lend money safely to a friend?',
    category: 'lending',
    icon: DollarSign,
  },
  {
    question: 'What rights do I have as a consumer?',
    category: 'consumer',
    icon: ShoppingCart,
  },
];

const categories = [
  { id: 'employment', label: 'Employment & Work', icon: Briefcase, color: 'bg-blue-100 text-blue-800' },
  { id: 'property', label: 'Property & Real Estate', icon: Home, color: 'bg-green-100 text-green-800' },
  { id: 'business', label: 'Business & Startup', icon: Briefcase, color: 'bg-purple-100 text-purple-800' },
  { id: 'contracts', label: 'Contracts & Agreements', icon: FileText, color: 'bg-yellow-100 text-yellow-800' },
  { id: 'consumer', label: 'Consumer Rights', icon: ShoppingCart, color: 'bg-pink-100 text-pink-800' },
  { id: 'family', label: 'Family Matters', icon: Users, color: 'bg-indigo-100 text-indigo-800' },
  { id: 'lending', label: 'Lending & Borrowing', icon: DollarSign, color: 'bg-orange-100 text-orange-800' },
  { id: 'general', label: 'General Legal', icon: Scale, color: 'bg-gray-100 text-gray-800' },
];

// Mock guidance response
const mockGuidance = {
  scenario: 'What should I check before renting a property?',
  riskLevel: 'medium' as const,
  summary: 'Renting property in Chennai, Tamil Nadu requires careful verification and proper documentation to avoid disputes. Following the checklist below will help protect your interests.',
  guidance: {
    overview: 'Before renting a property, it\'s crucial to verify ownership, understand your rights under the Tamil Nadu Rent Control Act, and ensure all terms are clearly documented in a registered rental agreement.',
    keyConsiderations: [
      'Verify landlord ownership documents',
      'Check property maintenance history',
      'Understand notice period (typically 2-3 months)',
      'Clarify all included amenities and services',
      'Document property condition before moving in',
    ],
    dos: [
      'Get rental agreement registered',
      'Request NOC from society/owner',
      'Keep all payment receipts',
      'Take photos/videos before moving in',
      'Complete police verification',
    ],
    donts: [
      'Pay security deposit in cash without receipt',
      'Sign agreement without reading thoroughly',
      'Agree to vague maintenance terms',
      'Skip property inspection',
      'Accept verbal agreements only',
    ],
    redFlags: [
      'Landlord requests 6+ months security deposit',
      'No written agreement offered',
      'History of disputes with previous tenants',
      'Unclear or disputed property ownership',
      'Refusal to register the agreement',
    ],
  },
  requiredDocuments: [
    { documentType: 'Rental Agreement', purpose: 'Legal binding contract', mandatory: true, templateAvailable: true },
    { documentType: 'Property Ownership Proof', purpose: 'Verify landlord ownership', mandatory: true, templateAvailable: false },
    { documentType: 'Police Verification Form', purpose: 'Tenant verification', mandatory: true, templateAvailable: true },
    { documentType: 'Previous Utility Bills', purpose: 'Check pending dues', mandatory: false, templateAvailable: false },
    { documentType: 'Society NOC', purpose: 'Permission from apartment society', mandatory: false, templateAvailable: false },
  ],
  checklist: [
    { id: '1', item: 'Verify owner identity and property title', category: 'verification', completed: false, priority: 'must_have' as const },
    { id: '2', item: 'Review rental agreement draft carefully', category: 'documentation', completed: false, priority: 'must_have' as const },
    { id: '3', item: 'Inspect property condition thoroughly', category: 'inspection', completed: false, priority: 'must_have' as const },
    { id: '4', item: 'Negotiate terms if needed', category: 'negotiation', completed: false, priority: 'should_have' as const },
    { id: '5', item: 'Sign agreement with two witnesses', category: 'documentation', completed: false, priority: 'must_have' as const },
    { id: '6', item: 'Get agreement registered at Sub-Registrar office', category: 'documentation', completed: false, priority: 'must_have' as const },
    { id: '7', item: 'Complete police verification process', category: 'compliance', completed: false, priority: 'must_have' as const },
  ],
  risks: [
    {
      type: 'legal' as const,
      description: 'Unregistered agreement may not be enforceable in court',
      likelihood: 'medium' as const,
      impact: 'high' as const,
      mitigation: 'Always register the rental agreement within 4 months',
    },
    {
      type: 'financial' as const,
      description: 'Excessive security deposit may not be recoverable',
      likelihood: 'low' as const,
      impact: 'medium' as const,
      mitigation: 'Limit security deposit to 2-3 months rent as per standard practice',
    },
  ],
  applicableLaws: [
    {
      law: 'Tamil Nadu Buildings (Lease and Rent Control) Act, 1960',
      jurisdiction: 'Tamil Nadu',
      summary: 'Governs rental agreements and tenant-landlord relationships in Tamil Nadu',
    },
    {
      law: 'Transfer of Property Act, 1882',
      jurisdiction: 'India',
      summary: 'Defines lease and rights/obligations of parties',
    },
    {
      law: 'Registration Act, 1908',
      jurisdiction: 'India',
      summary: 'Requires registration of leases exceeding 11 months',
    },
  ],
  needsLawyer: false,
  lawyerRecommendation: 'Not mandatory for standard residential rentals under ₹50,000/month. However, consider consulting a lawyer if: property value is high, commercial property, complex terms, or existing disputes.',
};

export default function LegalHelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showGuidance, setShowGuidance] = useState(false);
  const [checklist, setChecklist] = useState(mockGuidance.checklist);

  const handleQuestionClick = (question: string) => {
    setSearchQuery(question);
    setShowGuidance(true);
  };

  const handleAsk = () => {
    if (searchQuery.trim()) {
      setShowGuidance(true);
    }
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const completedCount = checklist.filter((item) => item.completed).length;
  const progressPercentage = (completedCount / checklist.length) * 100;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 lg:ml-0">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 lg:px-8 py-4 mt-14 lg:mt-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Legal Guidance</h1>
            <p className="text-sm text-gray-600 mt-1">
              Get proactive legal advice before signing, renting, hiring, or taking any legal action
            </p>
          </div>
        </header>

        <div className="p-4 lg:p-8">
          {!showGuidance ? (
            /* Ask Question View */
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Search Box */}
              <Card className="border-2 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Lightbulb className="h-6 w-6 text-primary" />
                    <h2 className="text-lg font-semibold text-gray-900">
                      What do you need help with?
                    </h2>
                  </div>
                  <div className="flex gap-3">
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAsk()}
                      placeholder="Type your question or scenario..."
                      className="text-base"
                    />
                    <Button onClick={handleAsk} disabled={!searchQuery.trim()}>
                      Ask AI
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Popular Questions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-warning" />
                    Popular Questions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {popularQuestions.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuestionClick(item.question)}
                      className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors flex items-center gap-3"
                    >
                      <item.icon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{item.question}</span>
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* Browse by Category */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Browse by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        className="p-4 rounded-lg border border-gray-200 hover:border-primary hover:shadow-md transition-all text-left"
                      >
                        <cat.icon className="h-6 w-6 text-primary mb-2" />
                        <h3 className="font-medium text-sm text-gray-900">{cat.label}</h3>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Guidance Response View */
            <div className="max-w-5xl mx-auto space-y-6">
              {/* Back Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowGuidance(false)}
                className="mb-4"
              >
                ← Back to Questions
              </Button>

              {/* Risk Level & Summary */}
              <Card className={`border-2 ${mockGuidance.riskLevel === 'medium' ? 'border-warning/30 bg-warning/5' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2">
                        {mockGuidance.scenario}
                      </h2>
                      <p className="text-gray-700">{mockGuidance.summary}</p>
                    </div>
                    <Badge
                      variant={mockGuidance.riskLevel === 'medium' ? 'warning' : 'success'}
                      className="flex-shrink-0 text-sm px-3 py-1"
                    >
                      {mockGuidance.riskLevel === 'medium' && <AlertCircle className="h-4 w-4 mr-1" />}
                      {mockGuidance.riskLevel.toUpperCase()} RISK
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Overview */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{mockGuidance.guidance.overview}</p>
                    </CardContent>
                  </Card>

                  {/* Key Considerations */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Key Considerations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {mockGuidance.guidance.keyConsiderations.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-700">
                            <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Do's and Don'ts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-success/30 bg-success/5">
                      <CardHeader>
                        <CardTitle className="text-success flex items-center gap-2">
                          <CheckCircle className="h-5 w-5" />
                          Do
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {mockGuidance.guidance.dos.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                              <span className="text-success font-bold">✓</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="border-critical/30 bg-critical/5">
                      <CardHeader>
                        <CardTitle className="text-critical flex items-center gap-2">
                          <AlertCircle className="h-5 w-5" />
                          Don't
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {mockGuidance.guidance.donts.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                              <span className="text-critical font-bold">✗</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Red Flags */}
                  <Card className="border-critical/30">
                    <CardHeader>
                      <CardTitle className="text-critical flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Red Flags to Watch Out For
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {mockGuidance.guidance.redFlags.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-700">
                            <span className="text-critical text-lg">🚩</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Applicable Laws */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Scale className="h-5 w-5" />
                        Applicable Laws & Regulations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {mockGuidance.applicableLaws.map((law, idx) => (
                        <div key={idx} className="border-l-4 border-primary pl-4">
                          <h4 className="font-semibold text-gray-900">{law.law}</h4>
                          <p className="text-xs text-gray-500 mb-1">{law.jurisdiction}</p>
                          <p className="text-sm text-gray-700">{law.summary}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Need a Lawyer */}
                  <Card className="border-secondary/30 bg-secondary/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-secondary" />
                        Do I Need a Lawyer?
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-4">{mockGuidance.lawyerRecommendation}</p>
                      <Button variant="secondary">
                        Find a Lawyer
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Checklist */}
                  <Card className="sticky top-24">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Checklist</span>
                        <Badge variant="outline">
                          {completedCount}/{checklist.length}
                        </Badge>
                      </CardTitle>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                        <div
                          className="bg-success h-2 rounded-full transition-all"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {checklist.map((item) => (
                        <label
                          key={item.id}
                          className="flex items-start gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => toggleChecklistItem(item.id)}
                            className="mt-0.5 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span
                            className={`text-sm flex-1 ${
                              item.completed ? 'line-through text-gray-500' : 'text-gray-700'
                            }`}
                          >
                            {item.item}
                            {item.priority === 'must_have' && (
                              <Badge variant="critical" className="ml-2 text-xs">
                                Required
                              </Badge>
                            )}
                          </span>
                        </label>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Required Documents */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Required Documents
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {mockGuidance.requiredDocuments.map((doc, idx) => (
                        <div key={idx} className="text-sm">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium text-gray-900">{doc.documentType}</p>
                              <p className="text-xs text-gray-600">{doc.purpose}</p>
                            </div>
                            {doc.mandatory && (
                              <Badge variant="critical" className="text-xs flex-shrink-0">
                                Required
                              </Badge>
                            )}
                          </div>
                          {doc.templateAvailable && (
                            <Button variant="outline" size="sm" className="mt-2 w-full">
                              Get Template
                            </Button>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Button className="w-full">Save Guidance</Button>
                    <Button variant="outline" className="w-full">
                      Share
                    </Button>
                    <Button variant="outline" className="w-full">
                      Ask Follow-up
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
