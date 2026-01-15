import { useCallback, useMemo } from 'react';
import { useEventStore } from '@/stores';
import type { Event, EventType, Priority } from '@/types';

/**
 * Hook for managing events
 */
export function useEvents() {
  const {
    events,
    selectedEvent,
    isLoading,
    error,
    filters,
    viewMode,
    addEvent,
    updateEvent,
    deleteEvent,
    selectEvent,
    markEventCompleted,
    markEventDismissed,
    setFilter,
    resetFilters,
    setViewMode,
    getEventById,
    getFilteredEvents,
    getEventsByDocument,
    getUpcomingEvents,
    getEventsByDateRange,
    getCriticalEvents,
    setLoading,
    setError,
  } = useEventStore();

  // Memoized filtered events
  const filteredEvents = useMemo(() => getFilteredEvents(), [getFilteredEvents]);

  // Get upcoming events (default 30 days)
  const upcomingEvents = useMemo(() => getUpcomingEvents(30), [getUpcomingEvents]);

  // Get critical events
  const criticalEvents = useMemo(() => getCriticalEvents(), [getCriticalEvents]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: events.length,
      upcoming: events.filter((e) => e.status === 'upcoming').length,
      completed: events.filter((e) => e.status === 'completed').length,
      missed: events.filter((e) => e.status === 'missed').length,
      critical: criticalEvents.length,
      byType: {
        contract_expiry: events.filter((e) => e.eventType === 'contract_expiry').length,
        payment_due: events.filter((e) => e.eventType === 'payment_due').length,
        renewal_date: events.filter((e) => e.eventType === 'renewal_date').length,
        review_date: events.filter((e) => e.eventType === 'review_date').length,
        obligation_end: events.filter((e) => e.eventType === 'obligation_end').length,
        milestone: events.filter((e) => e.eventType === 'milestone').length,
      },
    };
  }, [events, criticalEvents]);

  // Create event
  const createEvent = useCallback(
    async (event: Event) => {
      setLoading(true);
      setError(null);
      try {
        // TODO: Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        addEvent(event);
        return event;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create event';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [addEvent, setLoading, setError]
  );

  // Update event
  const editEvent = useCallback(
    async (id: string, updates: Partial<Event>) => {
      setLoading(true);
      setError(null);
      try {
        // TODO: Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        updateEvent(id, updates);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update event';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [updateEvent, setLoading, setError]
  );

  // Delete event
  const removeEvent = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        // TODO: Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        deleteEvent(id);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete event';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [deleteEvent, setLoading, setError]
  );

  // Filter by type
  const filterByType = useCallback(
    (type: EventType | 'all') => {
      setFilter('eventType', type);
    },
    [setFilter]
  );

  // Filter by priority
  const filterByPriority = useCallback(
    (priority: Priority | 'all') => {
      setFilter('priority', priority);
    },
    [setFilter]
  );

  return {
    // State
    events,
    filteredEvents,
    upcomingEvents,
    criticalEvents,
    selectedEvent,
    isLoading,
    error,
    filters,
    viewMode,
    stats,

    // Actions
    createEvent,
    editEvent,
    removeEvent,
    selectEvent,
    markEventCompleted,
    markEventDismissed,
    filterByType,
    filterByPriority,
    resetFilters,
    setViewMode,

    // Selectors
    getEventById,
    getEventsByDocument,
    getEventsByDateRange,
  };
}
