import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Notification } from '@/types';
import { mockNotifications } from '@/lib/mock-data';

interface NotificationStore {
  // State
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;

  // Filters
  filters: {
    type: Notification['type'] | 'all';
    isRead: 'all' | 'read' | 'unread';
  };

  // Actions
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  updateNotification: (id: string, updates: Partial<Notification>) => void;
  deleteNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismissNotification: (id: string) => void;
  clearAll: () => void;

  // Filters
  setFilter: (key: keyof NotificationStore['filters'], value: any) => void;
  resetFilters: () => void;

  // Computed/Derived
  getNotificationById: (id: string) => Notification | undefined;
  getFilteredNotifications: () => Notification[];
  getUnreadCount: () => number;
  getNotificationsByType: (type: Notification['type']) => Notification[];
  getCriticalNotifications: () => Notification[];

  // Utility
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  notifications: mockNotifications,
  isLoading: false,
  error: null,
  filters: {
    type: 'all' as const,
    isRead: 'all' as const,
  },
};

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Actions
      setNotifications: (notifications) => set({ notifications }),

      addNotification: (notification) =>
        set((state) => ({
          notifications: [notification, ...state.notifications],
        })),

      updateNotification: (id, updates) =>
        set((state) => ({
          notifications: state.notifications.map((notif) =>
            notif.id === id ? { ...notif, ...updates } : notif
          ),
        })),

      deleteNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((notif) => notif.id !== id),
        })),

      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((notif) =>
            notif.id === id
              ? { ...notif, isRead: true, readAt: new Date() }
              : notif
          ),
        })),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((notif) => ({
            ...notif,
            isRead: true,
            readAt: notif.isRead ? notif.readAt : new Date(),
          })),
        })),

      dismissNotification: (id) => {
        get().deleteNotification(id);
      },

      clearAll: () =>
        set({
          notifications: [],
        }),

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

      // Computed/Derived
      getNotificationById: (id) => {
        return get().notifications.find((notif) => notif.id === id);
      },

      getFilteredNotifications: () => {
        const { notifications, filters } = get();
        let filtered = [...notifications];

        // Filter by type
        if (filters.type !== 'all') {
          filtered = filtered.filter((notif) => notif.type === filters.type);
        }

        // Filter by read status
        if (filters.isRead === 'read') {
          filtered = filtered.filter((notif) => notif.isRead);
        } else if (filters.isRead === 'unread') {
          filtered = filtered.filter((notif) => !notif.isRead);
        }

        // Sort by created date (newest first)
        filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        return filtered;
      },

      getUnreadCount: () => {
        return get().notifications.filter((notif) => !notif.isRead).length;
      },

      getNotificationsByType: (type) => {
        return get().notifications.filter((notif) => notif.type === type);
      },

      getCriticalNotifications: () => {
        return get()
          .notifications.filter((notif) => notif.type === 'critical' && !notif.isRead)
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      },

      // Utility
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      reset: () => set(initialState),
    }),
    {
      name: 'notification-storage',
      partialize: (state) => ({
        notifications: state.notifications,
        filters: state.filters,
      }),
    }
  )
);
