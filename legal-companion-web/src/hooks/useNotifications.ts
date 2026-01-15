import { useCallback, useMemo } from 'react';
import { useNotificationStore } from '@/stores';
import type { Notification } from '@/types';

/**
 * Hook for managing notifications
 */
export function useNotifications() {
  const {
    notifications,
    isLoading,
    error,
    filters,
    addNotification,
    updateNotification,
    deleteNotification,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    clearAll,
    setFilter,
    resetFilters,
    getNotificationById,
    getFilteredNotifications,
    getUnreadCount,
    getNotificationsByType,
    getCriticalNotifications,
    setLoading,
    setError,
  } = useNotificationStore();

  // Memoized filtered notifications
  const filteredNotifications = useMemo(
    () => getFilteredNotifications(),
    [getFilteredNotifications]
  );

  // Memoized unread count
  const unreadCount = useMemo(() => getUnreadCount(), [getUnreadCount]);

  // Memoized critical notifications
  const criticalNotifications = useMemo(
    () => getCriticalNotifications(),
    [getCriticalNotifications]
  );

  // Create notification
  const createNotification = useCallback(
    async (notification: Notification) => {
      setLoading(true);
      setError(null);
      try {
        // TODO: Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 200));
        addNotification(notification);
        return notification;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create notification';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [addNotification, setLoading, setError]
  );

  // Filter by type
  const filterByType = useCallback(
    (type: Notification['type'] | 'all') => {
      setFilter('type', type);
    },
    [setFilter]
  );

  // Filter by read status
  const filterByReadStatus = useCallback(
    (status: 'all' | 'read' | 'unread') => {
      setFilter('isRead', status);
    },
    [setFilter]
  );

  // Show only unread
  const showUnread = useCallback(() => {
    filterByReadStatus('unread');
  }, [filterByReadStatus]);

  // Show all
  const showAll = useCallback(() => {
    resetFilters();
  }, [resetFilters]);

  return {
    // State
    notifications,
    filteredNotifications,
    criticalNotifications,
    unreadCount,
    isLoading,
    error,
    filters,

    // Actions
    createNotification,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    clearAll,
    filterByType,
    filterByReadStatus,
    showUnread,
    showAll,
    resetFilters,

    // Selectors
    getNotificationById,
    getNotificationsByType,
  };
}
