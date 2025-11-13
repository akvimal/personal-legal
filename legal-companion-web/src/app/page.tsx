'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UploadDocumentModal } from '@/components/features/upload-document-modal';
import { mockDocuments, mockInsuranceDocuments, mockEvents, mockNotifications, categoryLabels } from '@/lib/mock-data';
import { formatRelativeTime, formatCurrency } from '@/lib/utils';
import {
  Upload,
  MessageSquare,
  FileEdit,
  Search,
  Bell,
  AlertTriangle,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

export default function DashboardPage() {
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Combine all documents for upload modal
  const allDocuments = [...mockDocuments, ...mockInsuranceDocuments];

  // Calculate stats
  const activeContracts = mockDocuments.filter(d => d.status === 'active').length;
  const pendingTasks = 5;
  const activeAlerts = mockNotifications.filter(n => !n.isRead).length;

  // Get urgent events (next 7 days)
  const urgentEvents = mockEvents
    .filter(e => {
      const daysUntil = Math.ceil((e.eventDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 7 && daysUntil >= 0 && e.status === 'upcoming';
    })
    .sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime())
    .slice(0, 2);

  // Get upcoming events
  const upcomingEvents = mockEvents
    .filter(e => e.status === 'upcoming')
    .sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime())
    .slice(0, 6);

  // Get recent documents
  const recentDocuments = mockDocuments
    .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
    .slice(0, 3);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 lg:ml-0">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 lg:px-8 py-4 mt-14 lg:mt-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">
                Welcome back! Here's what's happening with your legal matters.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" className="relative" title="Global Search (Coming Soon)">
                <Search className="h-5 w-5" />
              </Button>
              <Link href="/notifications">
                <Button variant="outline" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {activeAlerts > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-critical text-white text-xs rounded-full flex items-center justify-center">
                      {activeAlerts}
                    </span>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8 space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-3">
                <Button
                  className="flex-1 sm:flex-none"
                  onClick={() => setShowUploadModal(true)}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
                <Link href="/assistant" className="flex-1 sm:flex-none">
                  <Button variant="secondary" className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Ask AI Assistant
                  </Button>
                </Link>
                <Link href="/templates" className="flex-1 sm:flex-none">
                  <Button variant="outline" className="w-full">
                    <FileEdit className="h-4 w-4 mr-2" />
                    Generate Template
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Urgent Attention Required */}
          {urgentEvents.length > 0 && (
            <Card className="border-critical-200 bg-critical-50/50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-critical" />
                  <CardTitle className="text-critical">
                    Urgent Attention Required - {urgentEvents.length} Critical Deadline{urgentEvents.length > 1 ? 's' : ''} in Next 7 Days
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {urgentEvents.map((event) => {
                  const doc = mockDocuments.find(d => d.id === event.documentId);
                  return (
                    <div key={event.id} className="bg-white rounded-lg border border-critical-200 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {event.priority === 'critical' ? (
                              <AlertTriangle className="h-4 w-4 text-critical" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-warning" />
                            )}
                            <h3 className="font-semibold text-gray-900">{event.title}</h3>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm">View Document</Button>
                            <Button size="sm" variant="outline">Create Task</Button>
                            <Button size="sm" variant="ghost">Snooze</Button>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="critical" className="mb-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatRelativeTime(event.eventDate)}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            {format(event.eventDate, 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Legal Health Score</h3>
                  <TrendingUp className="h-4 w-4 text-success" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">82</span>
                    <span className="text-sm text-gray-500">/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-success h-2 rounded-full" style={{ width: '82%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Link href="/documents">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600">Documents</h3>
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-3xl font-bold text-gray-900">{mockDocuments.length}</div>
                    <p className="text-sm text-gray-500">Total documents</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/documents">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600">Active Contracts</h3>
                    <CheckCircle className="h-4 w-4 text-success" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-3xl font-bold text-gray-900">{activeContracts}</div>
                    <p className="text-sm text-gray-500">Currently active</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/tasks">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600">Pending Tasks</h3>
                    <Clock className="h-4 w-4 text-warning" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-3xl font-bold text-gray-900">{pendingTasks}</div>
                    <p className="text-sm text-gray-500">Action required</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Documents */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Documents</CardTitle>
                    <Link href="/documents">
                      <Button variant="ghost" size="sm">
                        View All <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                  <p className="text-sm text-gray-600">Showing 3 of {mockDocuments.length} documents</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentDocuments.map((doc) => (
                    <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:border-primary transition-colors cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-1">{doc.title}</h3>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-2">
                            <Badge variant="outline">{categoryLabels[doc.category]}</Badge>
                            <span>•</span>
                            <span className={doc.status === 'active' ? 'text-success' : 'text-gray-500'}>
                              {doc.status === 'active' ? 'Active' : 'Expired'}
                            </span>
                            <span>•</span>
                            <span>Expires: {format(doc.endDate!, 'MMM d, yyyy')}</span>
                          </div>
                          {doc.upcomingEvents > 0 && (
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>📅 {doc.upcomingEvents} upcoming events</span>
                              {doc.pendingTasks > 0 && <span>⏰ {doc.pendingTasks} tasks pending</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Events */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Events</CardTitle>
                  <Link href="/calendar">
                    <Button variant="ghost" size="sm" className="mt-2">
                      View Calendar <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="text-sm">
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">{format(event.eventDate, 'MMM dd')}</p>
                          <p className="text-gray-600 truncate">{event.title}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* AI Suggestion */}
          <Card className="border-secondary-200 bg-secondary-50/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">💡 AI Suggestion</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    "I noticed your health insurance is expiring soon. Would you like me to help compare renewal options?"
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary">Yes, Help Me</Button>
                    <Button size="sm" variant="outline">Not Now</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Upload Document Modal */}
      <UploadDocumentModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        documents={allDocuments}
        onUpload={(file, category, metadata) => {
          console.log('Document uploaded:', { file, category, metadata });
        }}
      />
    </div>
  );
}
