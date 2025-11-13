'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { UploadDocumentModal } from '@/components/features/upload-document-modal';
import { mockDocuments, mockInsuranceDocuments, categoryLabels } from '@/lib/mock-data';
import { formatRelativeTime, formatCurrency } from '@/lib/utils';
import { Document, DocumentCategory, DocumentStatus } from '@/types';
import Link from 'next/link';
import {
  Upload,
  Search,
  Bell,
  Filter,
  FileText,
  Download,
  MessageSquare,
  Calendar as CalendarIcon,
  Edit,
  MoreVertical,
  AlertTriangle,
} from 'lucide-react';
import { format } from 'date-fns';

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<DocumentCategory[]>([
    'employment',
  ]);
  const [selectedStatuses, setSelectedStatuses] = useState<DocumentStatus[]>([
    'active',
  ]);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Action handlers
  const handleDownload = (doc: Document) => {
    alert(`Downloading ${doc.title}...\n\nIn production, this would download the actual document file.`);
  };

  // Combine all documents (regular + insurance)
  const allDocuments = [...mockDocuments, ...mockInsuranceDocuments];

  // Filter documents
  const filteredDocuments = allDocuments.filter((doc) => {
    const matchesSearch =
      searchQuery === '' ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategories.length === 0 || selectedCategories.includes(doc.category);

    const matchesStatus =
      selectedStatuses.length === 0 || selectedStatuses.includes(doc.status);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const toggleCategory = (category: DocumentCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const toggleStatus = (status: DocumentStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const categoryCount: Record<DocumentCategory, number> = {
    employment: allDocuments.filter((d) => d.category === 'employment').length,
    property: allDocuments.filter((d) => d.category === 'property').length,
    business: allDocuments.filter((d) => d.category === 'business').length,
    financial: allDocuments.filter((d) => d.category === 'financial').length,
    insurance: allDocuments.filter((d) => d.category === 'insurance').length,
    consumer: allDocuments.filter((d) => d.category === 'consumer').length,
    family: allDocuments.filter((d) => d.category === 'family').length,
    legal: allDocuments.filter((d) => d.category === 'legal').length,
  };

  const statusCount = {
    active: allDocuments.filter((d) => d.status === 'active').length,
    expiring_soon: allDocuments.filter((d) => d.status === 'expiring_soon').length,
    expired: allDocuments.filter((d) => d.status === 'expired').length,
    archived: allDocuments.filter((d) => d.status === 'archived').length,
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 lg:ml-0">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 lg:px-8 py-4 mt-14 lg:mt-0">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Documents Library</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage and organize all your legal documents
              </p>
            </div>
            <Button onClick={() => setShowUploadModal(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>
        </header>

        <div className="p-4 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-4 space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Filters
                    </h3>

                    {/* Category Filter */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Category</h4>
                      <div className="space-y-2">
                        {Object.entries(categoryLabels).map(([key, label]) => {
                          const category = key as DocumentCategory;
                          const count = categoryCount[category];
                          if (count === 0) return null;
                          return (
                            <label
                              key={category}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedCategories.includes(category)}
                                onChange={() => toggleCategory(category)}
                                className="rounded border-gray-300 text-primary focus:ring-primary"
                              />
                              <span className="text-sm text-gray-700 flex-1">{label}</span>
                              <span className="text-xs text-gray-500">({count})</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Status Filter */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Status</h4>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedStatuses.includes('active')}
                            onChange={() => toggleStatus('active')}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="text-sm text-gray-700 flex-1">Active</span>
                          <span className="text-xs text-gray-500">
                            ({statusCount.active})
                          </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedStatuses.includes('expiring_soon')}
                            onChange={() => toggleStatus('expiring_soon')}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="text-sm text-gray-700 flex-1">Expiring Soon</span>
                          <span className="text-xs text-gray-500">
                            ({statusCount.expiring_soon})
                          </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedStatuses.includes('expired')}
                            onChange={() => toggleStatus('expired')}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="text-sm text-gray-700 flex-1">Expired</span>
                          <span className="text-xs text-gray-500">
                            ({statusCount.expired})
                          </span>
                        </label>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setSelectedCategories([]);
                        setSelectedStatuses([]);
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Documents List */}
            <div className="lg:col-span-3 space-y-4">
              {/* Search and Sort */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="search"
                        placeholder="Search documents..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <select className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                      <option>Recent First</option>
                      <option>Oldest First</option>
                      <option>Name (A-Z)</option>
                      <option>Expiry Date</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              {/* Results */}
              <div className="text-sm text-gray-600 mb-2">
                Showing {filteredDocuments.length} document
                {filteredDocuments.length !== 1 && 's'}
              </div>

              {/* Document Cards */}
              <div className="space-y-4">
                {filteredDocuments.map((doc) => (
                  <Card key={doc.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <h3 className="font-semibold text-lg text-gray-900">
                              {doc.title}
                            </h3>
                            <button className="p-1 hover:bg-gray-100 rounded">
                              <MoreVertical className="h-5 w-5 text-gray-400" />
                            </button>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <Badge variant="outline">{categoryLabels[doc.category]}</Badge>
                            <span className="text-gray-300">•</span>
                            <Badge
                              variant={
                                doc.status === 'active'
                                  ? 'success'
                                  : doc.status === 'expiring_soon'
                                  ? 'warning'
                                  : 'default'
                              }
                            >
                              {doc.status === 'active'
                                ? 'Active'
                                : doc.status === 'expiring_soon'
                                ? 'Expiring Soon'
                                : 'Expired'}
                            </Badge>
                            {doc.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          <div className="text-sm text-gray-600 space-y-1 mb-4">
                            <p>
                              Added: {format(doc.uploadedAt, 'MMM d, yyyy')} • Expires:{' '}
                              {doc.endDate ? (
                                <>
                                  {format(doc.endDate, 'MMM d, yyyy')}{' '}
                                  <span
                                    className={
                                      doc.status === 'expiring_soon'
                                        ? 'text-warning font-medium'
                                        : ''
                                    }
                                  >
                                    ({formatRelativeTime(doc.endDate)})
                                  </span>
                                </>
                              ) : (
                                'N/A'
                              )}
                            </p>
                            {doc.upcomingEvents > 0 && (
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <CalendarIcon className="h-3 w-3" />
                                  {doc.upcomingEvents} upcoming events
                                </span>
                                {doc.pendingTasks > 0 && (
                                  <span className="flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    {doc.pendingTasks} pending tasks
                                  </span>
                                )}
                              </div>
                            )}
                            <p className="text-gray-500">
                              Parties: {doc.parties.join(', ')}
                            </p>
                            {doc.metadata && (
                              <p className="text-gray-500">
                                {doc.category === 'employment' &&
                                  `Salary: ${formatCurrency(doc.metadata.salary)}/year, Notice: ${
                                    doc.metadata.noticePeriod
                                  }`}
                                {doc.category === 'property' &&
                                  `Rent: ${formatCurrency(doc.metadata.monthlyRent)}/month, Lock-in: ${
                                    doc.metadata.lockInPeriod
                                  }`}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Link href={`/documents/${doc.id}`}>
                              <Button size="sm" variant="default">
                                <FileText className="h-3 w-3 mr-1.5" />
                                View
                              </Button>
                            </Link>
                            <Button size="sm" variant="outline" title="Ask AI (Coming Soon)">
                              <MessageSquare className="h-3 w-3 mr-1.5" />
                              Ask AI
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownload(doc)}
                            >
                              <Download className="h-3 w-3 mr-1.5" />
                              Download
                            </Button>
                            <Link href="/calendar">
                              <Button size="sm" variant="outline">
                                <CalendarIcon className="h-3 w-3 mr-1.5" />
                                Events
                              </Button>
                            </Link>
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3 mr-1.5" />
                              Edit Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredDocuments.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No documents found
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Try adjusting your filters or search query
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategories([]);
                        setSelectedStatuses([]);
                      }}
                    >
                      Clear all filters
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Upload Document Modal */}
      <UploadDocumentModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={(file, category, metadata) => {
          console.log('Document uploaded:', { file, category, metadata });
          // In a real app, this would upload to the server
          // For now, just log it
        }}
      />
    </div>
  );
}
