import { useCallback, useMemo } from 'react';
import { useTaskStore } from '@/stores';
import type { Task, Priority } from '@/types';

/**
 * Hook for managing tasks
 */
export function useTasks() {
  const {
    tasks,
    selectedTask,
    isLoading,
    error,
    filters,
    addTask,
    updateTask,
    deleteTask,
    selectTask,
    toggleTaskStatus,
    markTaskCompleted,
    markTaskInProgress,
    markTaskPending,
    setFilter,
    resetFilters,
    getTaskById,
    getFilteredTasks,
    getTasksByDocument,
    getTasksByEvent,
    getTasksByStatus,
    getOverdueTasks,
    getTasksStats,
    setLoading,
    setError,
  } = useTaskStore();

  // Memoized filtered tasks
  const filteredTasks = useMemo(() => getFilteredTasks(), [getFilteredTasks]);

  // Memoized overdue tasks
  const overdueTasks = useMemo(() => getOverdueTasks(), [getOverdueTasks]);

  // Memoized stats
  const stats = useMemo(() => getTasksStats(), [getTasksStats]);

  // Create task
  const createTask = useCallback(
    async (task: Task) => {
      setLoading(true);
      setError(null);
      try {
        // TODO: Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        addTask(task);
        return task;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create task';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [addTask, setLoading, setError]
  );

  // Update task
  const editTask = useCallback(
    async (id: string, updates: Partial<Task>) => {
      setLoading(true);
      setError(null);
      try {
        // TODO: Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        updateTask(id, updates);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [updateTask, setLoading, setError]
  );

  // Delete task
  const removeTask = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        // TODO: Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        deleteTask(id);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete task';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [deleteTask, setLoading, setError]
  );

  // Filter by status
  const filterByStatus = useCallback(
    (status: Task['status'] | 'all') => {
      setFilter('status', status);
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
    tasks,
    filteredTasks,
    overdueTasks,
    selectedTask,
    isLoading,
    error,
    filters,
    stats,

    // Actions
    createTask,
    editTask,
    removeTask,
    selectTask,
    toggleTaskStatus,
    markTaskCompleted,
    markTaskInProgress,
    markTaskPending,
    filterByStatus,
    filterByPriority,
    resetFilters,

    // Selectors
    getTaskById,
    getTasksByDocument,
    getTasksByEvent,
    getTasksByStatus,
  };
}
