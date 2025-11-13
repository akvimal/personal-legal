'use client';

import { use } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockDocuments, mockInsuranceDocuments, mockEvents, mockTasks, categoryLabels } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';
import {
  FileText,
  Download,
  MessageSquare,
  Calendar,
  Edit,
  Trash2,
  Eye,
  Share2,
  ChevronLeft,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

export default function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const allDocuments = [...mockDocuments, ...mockInsuranceDocuments];
  const document = allDocuments.find(d => d.id === id);

  if (!document) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 lg:ml-0 flex items-center justify-center">
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Document Not Found</h2>
              <p className="text-gray-600 mb-4">The document you're looking for doesn't exist.</p>
              <Link href="/documents">
                <Button>Back to Documents</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Find related events and tasks
  const relatedEvents = mockEvents.filter(e => e.documentId === id);
  const relatedTasks = mockTasks.filter(t => t.documentId === id);

  // Action handlers
  const handleDownload = () => {
    // In a real app, this would trigger a file download
    alert(`Downloading ${document.title}...\n\nIn production, this would download the actual document file.`);
  };

  const handleShare = () => {
    // In a real app, this would open a share dialog or copy link
    if (navigator.share) {
      navigator.share({
        title: document.title,
        text: `Check out this document: ${document.title}`,
        url: window.location.href,
      }).catch(() => {
        // Fallback to copy link
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${document.title}"?\n\nThis action cannot be undone.`)) {
      // In a real app, this would call an API to delete the document
      alert('Document deleted successfully!\n\nRedirecting to documents page...');
      window.location.href = '/documents';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'expiring_soon':
        return 'warning';
      case 'expired':
        return 'critical';
      default:
        return 'outline';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 lg:ml-0">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 lg:px-8 py-4 mt-14 lg:mt-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/documents">
                <Button variant="ghost" size="sm">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{document.title}</h1>
                <p className="text-sm text-gray-600 mt-1">{categoryLabels[document.category]}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm" title="Edit (Coming Soon)">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Document Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Document Preview</span>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      Full Screen
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-100 rounded-lg aspect-[8.5/11] flex items-center justify-center">
                    <div className="text-center">
                      <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">PDF Preview</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {document.pages} pages • {(document.fileSize / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <Button className="mt-4">
                        <Eye className="h-4 w-4 mr-2" />
                        View Full Document
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Document Analysis */}
              {document.metadata && (
                <Card>
                  <CardHeader>
                    <CardTitle>AI Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-900">Document Processed</p>
                          <p className="text-sm text-blue-700 mt-1">
                            This document has been analyzed by our AI. Key information has been extracted.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Extracted Metadata */}
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(document.metadata).map(([key, value]) => (
                        <div key={key} className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                          <p className="font-medium text-gray-900">
                            {typeof value === 'number' && key.includes('salary') || key.includes('rent') || key.includes('premium') || key.includes('coverage')
                              ? formatCurrency(value)
                              : String(value)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Related Events */}
              {relatedEvents.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Upcoming Events ({relatedEvents.length})</span>
                      <Link href="/calendar">
                        <Button variant="outline" size="sm">
                          View All
                        </Button>
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {relatedEvents.map(event => (
                        <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant={event.priority === 'critical' ? 'critical' : 'warning'}>
                                  {event.priority}
                                </Badge>
                                <span className="text-xs text-gray-600">
                                  {format(event.eventDate, 'MMM d, yyyy')}
                                </span>
                              </div>
                              <h4 className="font-medium text-gray-900">{event.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                            </div>
                            <Calendar className="h-5 w-5 text-gray-400 flex-shrink-0" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Related Tasks */}
              {relatedTasks.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Related Tasks ({relatedTasks.length})</span>
                      <Link href="/tasks">
                        <Button variant="outline" size="sm">
                          View All
                        </Button>
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {relatedTasks.map(task => (
                        <div key={task.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                          <CheckCircle className={`h-4 w-4 ${task.status === 'completed' ? 'text-success' : 'text-gray-300'}`} />
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                              {task.title}
                            </p>
                            {task.dueDate && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                Due: {format(task.dueDate, 'MMM d, yyyy')}
                              </p>
                            )}
                          </div>
                          <Badge variant={task.priority === 'critical' ? 'critical' : 'outline'} className="text-xs">
                            {task.priority}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Document Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Document Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    <Badge variant={getStatusColor(document.status)} className="capitalize">
                      {document.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Document Type</p>
                    <p className="text-sm font-medium text-gray-900">{document.documentType}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Uploaded</p>
                    <p className="text-sm font-medium text-gray-900">
                      {format(document.uploadedAt, 'MMM d, yyyy')}
                    </p>
                  </div>

                  {document.signedDate && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Signed Date</p>
                      <p className="text-sm font-medium text-gray-900">
                        {format(document.signedDate, 'MMM d, yyyy')}
                      </p>
                    </div>
                  )}

                  {document.startDate && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Start Date</p>
                      <p className="text-sm font-medium text-gray-900">
                        {format(document.startDate, 'MMM d, yyyy')}
                      </p>
                    </div>
                  )}

                  {document.endDate && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">End Date</p>
                      <p className="text-sm font-medium text-gray-900">
                        {format(document.endDate, 'MMM d, yyyy')}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Location</p>
                    <p className="text-sm font-medium text-gray-900">
                      {document.region}, {document.country}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Language</p>
                    <p className="text-sm font-medium text-gray-900">{document.language}</p>
                  </div>

                  {document.tags.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Tags</p>
                      <div className="flex flex-wrap gap-1">
                        {document.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Parties */}
              {document.parties.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Parties Involved</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {document.parties.map((party, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Users className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-900">{party}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/assistant">
                    <Button variant="outline" className="w-full justify-start">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Ask AI About This Document
                    </Button>
                  </Link>
                  <Link href="/calendar">
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="h-4 w-4 mr-2" />
                      View Related Events
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-critical hover:bg-critical/10"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Document
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
