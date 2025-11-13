'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EventType, Priority, Document } from '@/types';
import { eventTypeLabels } from '@/lib/mock-data';
import {
  X,
  Calendar,
  AlertCircle,
  CheckCircle,
  Loader2,
  FileText,
  Clock,
} from 'lucide-react';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateEvent?: (eventData: any) => void;
  documents: Document[];
  preselectedDocumentId?: string;
}

export function CreateEventModal({
  isOpen,
  onClose,
  onCreateEvent,
  documents,
  preselectedDocumentId
}: CreateEventModalProps) {
  const [eventType, setEventType] = useState<EventType>('contract_expiry');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [documentId, setDocumentId] = useState(preselectedDocumentId || '');
  const [advanceNoticeDays, setAdvanceNoticeDays] = useState('7');
  const [responsibleParty, setResponsibleParty] = useState('');
  const [consequence, setConsequence] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState('');
  const [creating, setCreating] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!title || !eventDate || !documentId) return;

    setCreating(true);

    // Simulate creation process
    setTimeout(() => {
      const eventData = {
        id: `event-${Date.now()}`,
        documentId,
        eventType,
        title,
        description,
        eventDate: new Date(eventDate),
        priority,
        isRecurring,
        recurrencePattern: isRecurring ? recurrencePattern : undefined,
        responsibleParty: responsibleParty || undefined,
        consequence: consequence || undefined,
        advanceNoticeDays: advanceNoticeDays ? parseInt(advanceNoticeDays) : undefined,
        status: 'upcoming' as const,
        reminders: [],
      };

      if (onCreateEvent) {
        onCreateEvent(eventData);
      }

      setCreateSuccess(true);
      setCreating(false);

      // Auto-close after success
      setTimeout(() => {
        handleClose();
      }, 1500);
    }, 1000);
  };

  const handleClose = () => {
    setEventType('contract_expiry');
    setTitle('');
    setDescription('');
    setEventDate('');
    setPriority('medium');
    setDocumentId(preselectedDocumentId || '');
    setAdvanceNoticeDays('7');
    setResponsibleParty('');
    setConsequence('');
    setIsRecurring(false);
    setRecurrencePattern('');
    setCreating(false);
    setCreateSuccess(false);
    onClose();
  };

  const priorityColors: Record<Priority, string> = {
    critical: 'border-critical text-critical bg-critical/5',
    high: 'border-warning text-warning bg-warning/5',
    medium: 'border-primary text-primary bg-primary/5',
    low: 'border-gray-400 text-gray-700 bg-gray-50',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="border-b sticky top-0 bg-white z-10">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Create New Event
              </CardTitle>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                disabled={creating}
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {!createSuccess ? (
              <>
                {/* Related Document */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Related Document *
                  </label>
                  <select
                    value={documentId}
                    onChange={(e) => setDocumentId(e.target.value)}
                    disabled={creating}
                    className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select a document...</option>
                    {documents.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.title}
                      </option>
                    ))}
                  </select>
                  {documentId && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <FileText className="h-3 w-3" />
                      {documents.find(d => d.id === documentId)?.documentType}
                    </div>
                  )}
                </div>

                {/* Event Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Type *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {(Object.entries(eventTypeLabels) as [EventType, string][]).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => setEventType(key)}
                        disabled={creating}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                          eventType === key
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-gray-200 text-gray-700 hover:border-primary/50'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Title *
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Contract Renewal Due"
                    disabled={creating}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add details about this event..."
                    disabled={creating}
                    rows={3}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Date and Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Date *
                    </label>
                    <Input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      disabled={creating}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority *
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as Priority)}
                      disabled={creating}
                      className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>

                {/* Advanced Options */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Additional Details (Optional)</h4>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Advance Notice (days)
                        </label>
                        <Input
                          type="number"
                          value={advanceNoticeDays}
                          onChange={(e) => setAdvanceNoticeDays(e.target.value)}
                          placeholder="7"
                          disabled={creating}
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Responsible Party
                        </label>
                        <Input
                          value={responsibleParty}
                          onChange={(e) => setResponsibleParty(e.target.value)}
                          placeholder="e.g., Legal Team"
                          disabled={creating}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Consequence if Missed
                      </label>
                      <Input
                        value={consequence}
                        onChange={(e) => setConsequence(e.target.value)}
                        placeholder="e.g., Contract auto-renews"
                        disabled={creating}
                      />
                    </div>

                    {/* Recurring */}
                    <div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isRecurring}
                          onChange={(e) => setIsRecurring(e.target.checked)}
                          disabled={creating}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm font-medium text-gray-700">Recurring Event</span>
                      </label>
                      {isRecurring && (
                        <Input
                          value={recurrencePattern}
                          onChange={(e) => setRecurrencePattern(e.target.value)}
                          placeholder="e.g., Monthly, Quarterly, Annually"
                          disabled={creating}
                          className="mt-2"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      <p className="font-medium mb-1">Automatic Reminders</p>
                      <p className="text-blue-700">
                        You'll receive reminders {advanceNoticeDays || '7'} days before this event,
                        and on the event date via email and in-app notifications.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={handleSubmit}
                    disabled={!title || !eventDate || !documentId || creating}
                    className="flex-1"
                  >
                    {creating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating Event...
                      </>
                    ) : (
                      <>
                        <Calendar className="h-4 w-4 mr-2" />
                        Create Event
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    disabled={creating}
                  >
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Event Created Successfully!
                </h3>
                <p className="text-gray-600">
                  Your event has been added to the calendar. Reminders will be sent automatically.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
