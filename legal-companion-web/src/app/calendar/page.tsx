'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreateEventModal } from '@/components/features/create-event-modal';
import { mockEvents, mockDocuments, mockInsuranceDocuments, eventTypeLabels } from '@/lib/mock-data';
import { formatRelativeTime } from '@/lib/utils';
import { Event } from '@/types';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  MoreVertical,
  Plus,
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import Link from 'next/link';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month');
  const [filterType, setFilterType] = useState<string>('all');
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Combine all documents for event creation
  const allDocuments = [...mockDocuments, ...mockInsuranceDocuments];

  // Get events for the current month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Filter events
  const filteredEvents = events.filter(event => {
    if (filterType !== 'all' && event.eventType !== filterType) return false;
    return event.status === 'upcoming';
  });

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter(event =>
      isSameDay(new Date(event.eventDate), date)
    );
  };

  // Get selected date events
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  // Get upcoming events (next 30 days)
  const upcomingEvents = filteredEvents
    .filter(event => {
      const daysUntil = Math.ceil((event.eventDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil >= 0 && daysUntil <= 30;
    })
    .sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-critical text-white';
      case 'high': return 'bg-warning text-white';
      case 'medium': return 'bg-primary text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 lg:ml-0">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 lg:px-8 py-4 mt-14 lg:mt-0">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Calendar & Events</h1>
              <p className="text-sm text-gray-600 mt-1">
                Track important dates and deadlines
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export iCal
              </Button>
              <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-3 py-1.5 text-sm ${
                    viewMode === 'month' ? 'bg-primary text-white' : 'bg-white text-gray-700'
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 text-sm border-l border-gray-300 ${
                    viewMode === 'list' ? 'bg-primary text-white' : 'bg-white text-gray-700'
                  }`}
                >
                  List
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Event Type</h4>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="eventType"
                          value="all"
                          checked={filterType === 'all'}
                          onChange={(e) => setFilterType(e.target.value)}
                          className="text-primary focus:ring-primary"
                        />
                        <span className="text-sm">All Events</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="eventType"
                          value="contract_expiry"
                          checked={filterType === 'contract_expiry'}
                          onChange={(e) => setFilterType(e.target.value)}
                          className="text-primary focus:ring-primary"
                        />
                        <span className="text-sm">Contract Expiry</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="eventType"
                          value="payment_due"
                          checked={filterType === 'payment_due'}
                          onChange={(e) => setFilterType(e.target.value)}
                          className="text-primary focus:ring-primary"
                        />
                        <span className="text-sm">Payment Due</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="eventType"
                          value="renewal_date"
                          checked={filterType === 'renewal_date'}
                          onChange={(e) => setFilterType(e.target.value)}
                          className="text-primary focus:ring-primary"
                        />
                        <span className="text-sm">Renewal</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="eventType"
                          value="review_date"
                          checked={filterType === 'review_date'}
                          onChange={(e) => setFilterType(e.target.value)}
                          className="text-primary focus:ring-primary"
                        />
                        <span className="text-sm">Review</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Legend</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-critical"></div>
                        <span>Critical</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-warning"></div>
                        <span>High Priority</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                        <span>Medium</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {viewMode === 'month' ? (
                /* Month View */
                <>
                  {/* Calendar Header */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">
                          {format(currentDate, 'MMMM yyyy')}
                        </h2>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentDate(new Date())}
                          >
                            Today
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Calendar Grid */}
                      <div className="grid grid-cols-7 gap-1">
                        {/* Day Headers */}
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                          <div key={day} className="text-center text-xs font-medium text-gray-600 py-2">
                            {day}
                          </div>
                        ))}

                        {/* Calendar Days */}
                        {daysInMonth.map((day) => {
                          const dayEvents = getEventsForDate(day);
                          const isSelected = selectedDate && isSameDay(day, selectedDate);
                          const isCurrentDay = isToday(day);

                          return (
                            <button
                              key={day.toISOString()}
                              onClick={() => setSelectedDate(day)}
                              className={`
                                min-h-[80px] p-2 border rounded-lg text-left transition-colors
                                ${!isSameMonth(day, currentDate) ? 'bg-gray-50 text-gray-400' : 'bg-white'}
                                ${isSelected ? 'ring-2 ring-primary' : ''}
                                ${isCurrentDay ? 'border-primary border-2' : 'border-gray-200'}
                                hover:bg-gray-50
                              `}
                            >
                              <div className="text-sm font-medium mb-1">
                                {format(day, 'd')}
                              </div>
                              <div className="space-y-1">
                                {dayEvents.slice(0, 2).map((event) => (
                                  <div
                                    key={event.id}
                                    className={`text-xs px-1 py-0.5 rounded truncate ${getPriorityColor(event.priority)}`}
                                    title={event.title}
                                  >
                                    {event.title.substring(0, 15)}...
                                  </div>
                                ))}
                                {dayEvents.length > 2 && (
                                  <div className="text-xs text-gray-500">
                                    +{dayEvents.length - 2} more
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Selected Date Events */}
                  {selectedDate && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">
                          Events on {format(selectedDate, 'MMMM d, yyyy')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedDateEvents.length > 0 ? (
                          <div className="space-y-3">
                            {selectedDateEvents.map((event) => {
                              const doc = mockDocuments.find(d => d.id === event.documentId);
                              return (
                                <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Badge variant={event.priority === 'critical' ? 'critical' : event.priority === 'high' ? 'warning' : 'info'}>
                                          {event.priority}
                                        </Badge>
                                        <span className="text-sm text-gray-600">{eventTypeLabels[event.eventType]}</span>
                                      </div>
                                      <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
                                      <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                                      {doc && (
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                          <FileText className="h-4 w-4" />
                                          <span>{doc.title}</span>
                                        </div>
                                      )}
                                    </div>
                                    <button className="p-2 hover:bg-gray-100 rounded">
                                      <MoreVertical className="h-5 w-5 text-gray-400" />
                                    </button>
                                  </div>
                                  <div className="flex gap-2 mt-4">
                                    {doc && (
                                      <Link href={`/documents/${doc.id}`}>
                                        <Button size="sm">View Document</Button>
                                      </Link>
                                    )}
                                    <Link href="/tasks">
                                      <Button size="sm" variant="outline">Create Task</Button>
                                    </Link>
                                    <Button size="sm" variant="outline">Snooze</Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-center text-gray-500 py-8">
                            No events on this date
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                /* List View */
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Events (Next 30 Days)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {upcomingEvents.length > 0 ? (
                      <div className="space-y-4">
                        {upcomingEvents.map((event) => {
                          const doc = mockDocuments.find(d => d.id === event.documentId);
                          return (
                            <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-start gap-4">
                                {/* Date Badge */}
                                <div className="flex-shrink-0 w-16 text-center">
                                  <div className="text-xs text-gray-600">{format(event.eventDate, 'MMM')}</div>
                                  <div className="text-2xl font-bold text-gray-900">{format(event.eventDate, 'd')}</div>
                                  <div className="text-xs text-gray-600">{format(event.eventDate, 'EEE')}</div>
                                </div>

                                {/* Event Details */}
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge variant={event.priority === 'critical' ? 'critical' : event.priority === 'high' ? 'warning' : 'info'}>
                                      {event.priority}
                                    </Badge>
                                    <span className="text-sm text-gray-600">{eventTypeLabels[event.eventType]}</span>
                                    <span className="text-sm text-gray-500">• {formatRelativeTime(event.eventDate)}</span>
                                  </div>
                                  <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
                                  <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                                  {doc && (
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                      <FileText className="h-4 w-4" />
                                      <span>{doc.title}</span>
                                    </div>
                                  )}
                                  <div className="flex gap-2">
                                    {doc && (
                                      <Link href={`/documents/${doc.id}`}>
                                        <Button size="sm">View Document</Button>
                                      </Link>
                                    )}
                                    <Link href="/tasks">
                                      <Button size="sm" variant="outline">Create Task</Button>
                                    </Link>
                                    <Button size="sm" variant="outline">Snooze</Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-8">
                        No upcoming events in the next 30 days
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        documents={allDocuments}
        onCreateEvent={(eventData) => {
          setEvents(prev => [...prev, eventData]);
          console.log('Event created:', eventData);
        }}
      />
    </div>
  );
}
