import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Event, EventType, Priority } from '@/types';
import { mockEvents } from '@/lib/mock-data';

interface EventStore {
  // State
  events: Event[];
  selectedEvent: Event | null;
  isLoading: boolean;
  error: string | null;

  // Filters
  filters: {
    eventType: EventType | 'all';
    priority: Priority | 'all';
    status: Event['status'] | 'all';
    dateRange: {
      start: Date | null;
      end: Date | null;
    };
  };

  // View mode
  viewMode: 'month' | 'list';

  // Actions
  setEvents: (events: Event[]) => void;
  addEvent: (event: Event) => void;
  updateEvent: (id: string, updates: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  selectEvent: (id: string | null) => void;
  markEventCompleted: (id: string) => void;
  markEventDismissed: (id: string) => void;

  // Filters
  setFilter: (key: keyof EventStore['filters'], value: any) => void;
  resetFilters: () => void;

  // View mode
  setViewMode: (mode: 'month' | 'list') => void;

  // Computed/Derived
  getEventById: (id: string) => Event | undefined;
  getFilteredEvents: () => Event[];
  getEventsByDocument: (documentId: string) => Event[];
  getUpcomingEvents: (days?: number) => Event[];
  getEventsByDateRange: (start: Date, end: Date) => Event[];
  getCriticalEvents: () => Event[];

  // Utility
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  events: mockEvents,
  selectedEvent: null,
  isLoading: false,
  error: null,
  filters: {
    eventType: 'all' as const,
    priority: 'all' as const,
    status: 'all' as const,
    dateRange: {
      start: null,
      end: null,
    },
  },
  viewMode: 'month' as const,
};

export const useEventStore = create<EventStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Actions
      setEvents: (events) => set({ events }),

      addEvent: (event) =>
        set((state) => ({
          events: [...state.events, event],
        })),

      updateEvent: (id, updates) =>
        set((state) => ({
          events: state.events.map((event) =>
            event.id === id ? { ...event, ...updates } : event
          ),
          selectedEvent:
            state.selectedEvent?.id === id
              ? { ...state.selectedEvent, ...updates }
              : state.selectedEvent,
        })),

      deleteEvent: (id) =>
        set((state) => ({
          events: state.events.filter((event) => event.id !== id),
          selectedEvent:
            state.selectedEvent?.id === id ? null : state.selectedEvent,
        })),

      selectEvent: (id) =>
        set((state) => ({
          selectedEvent: id
            ? state.events.find((event) => event.id === id) || null
            : null,
        })),

      markEventCompleted: (id) =>
        set((state) => ({
          events: state.events.map((event) =>
            event.id === id ? { ...event, status: 'completed' } : event
          ),
        })),

      markEventDismissed: (id) =>
        set((state) => ({
          events: state.events.map((event) =>
            event.id === id ? { ...event, status: 'dismissed' } : event
          ),
        })),

      // Filters
      setFilter: (key, value) =>
        set((state) => ({
          filters: {
            ...state.filters,
            [key]: value,
          },
        })),

      resetFilters: () =>
        set({
          filters: initialState.filters,
        }),

      // View mode
      setViewMode: (mode) => set({ viewMode: mode }),

      // Computed/Derived
      getEventById: (id) => {
        return get().events.find((event) => event.id === id);
      },

      getFilteredEvents: () => {
        const { events, filters } = get();
        let filtered = [...events];

        // Filter by event type
        if (filters.eventType !== 'all') {
          filtered = filtered.filter((event) => event.eventType === filters.eventType);
        }

        // Filter by priority
        if (filters.priority !== 'all') {
          filtered = filtered.filter((event) => event.priority === filters.priority);
        }

        // Filter by status
        if (filters.status !== 'all') {
          filtered = filtered.filter((event) => event.status === filters.status);
        }

        // Filter by date range
        if (filters.dateRange.start && filters.dateRange.end) {
          filtered = filtered.filter((event) => {
            const eventDate = new Date(event.eventDate);
            return (
              eventDate >= filters.dateRange.start! &&
              eventDate <= filters.dateRange.end!
            );
          });
        }

        // Sort by event date (nearest first)
        filtered.sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());

        return filtered;
      },

      getEventsByDocument: (documentId) => {
        return get().events.filter((event) => event.documentId === documentId);
      },

      getUpcomingEvents: (days = 30) => {
        const now = new Date();
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);

        return get()
          .events.filter((event) => {
            const eventDate = new Date(event.eventDate);
            return (
              event.status === 'upcoming' &&
              eventDate >= now &&
              eventDate <= futureDate
            );
          })
          .sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());
      },

      getEventsByDateRange: (start, end) => {
        return get()
          .events.filter((event) => {
            const eventDate = new Date(event.eventDate);
            return eventDate >= start && eventDate <= end;
          })
          .sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());
      },

      getCriticalEvents: () => {
        return get()
          .events.filter(
            (event) =>
              event.priority === 'critical' && event.status === 'upcoming'
          )
          .sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());
      },

      // Utility
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      reset: () => set(initialState),
    }),
    {
      name: 'event-storage',
      partialize: (state) => ({
        events: state.events,
        filters: state.filters,
        viewMode: state.viewMode,
      }),
    }
  )
);
