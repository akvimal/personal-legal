import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, Priority } from '@/types';
import { mockTasks } from '@/lib/mock-data';

interface TaskStore {
  // State
  tasks: Task[];
  selectedTask: Task | null;
  isLoading: boolean;
  error: string | null;

  // Filters
  filters: {
    status: Task['status'] | 'all';
    priority: Priority | 'all';
  };

  // Actions
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  selectTask: (id: string | null) => void;
  toggleTaskStatus: (id: string) => void;
  markTaskCompleted: (id: string) => void;
  markTaskInProgress: (id: string) => void;
  markTaskPending: (id: string) => void;

  // Filters
  setFilter: (key: keyof TaskStore['filters'], value: any) => void;
  resetFilters: () => void;

  // Computed/Derived
  getTaskById: (id: string) => Task | undefined;
  getFilteredTasks: () => Task[];
  getTasksByDocument: (documentId: string) => Task[];
  getTasksByEvent: (eventId: string) => Task[];
  getTasksByStatus: (status: Task['status']) => Task[];
  getOverdueTasks: () => Task[];
  getTasksStats: () => {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    overdue: number;
  };

  // Utility
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  tasks: mockTasks,
  selectedTask: null,
  isLoading: false,
  error: null,
  filters: {
    status: 'all' as const,
    priority: 'all' as const,
  },
};

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Actions
      setTasks: (tasks) => set({ tasks }),

      addTask: (task) =>
        set((state) => ({
          tasks: [...state.tasks, task],
        })),

      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          ),
          selectedTask:
            state.selectedTask?.id === id
              ? { ...state.selectedTask, ...updates }
              : state.selectedTask,
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
          selectedTask:
            state.selectedTask?.id === id ? null : state.selectedTask,
        })),

      selectTask: (id) =>
        set((state) => ({
          selectedTask: id
            ? state.tasks.find((task) => task.id === id) || null
            : null,
        })),

      toggleTaskStatus: (id) =>
        set((state) => {
          const task = state.tasks.find((t) => t.id === id);
          if (!task) return state;

          let newStatus: Task['status'];
          if (task.status === 'pending') newStatus = 'in_progress';
          else if (task.status === 'in_progress') newStatus = 'completed';
          else newStatus = 'pending';

          return {
            tasks: state.tasks.map((t) =>
              t.id === id
                ? {
                    ...t,
                    status: newStatus,
                    completedAt: newStatus === 'completed' ? new Date() : undefined,
                  }
                : t
            ),
          };
        }),

      markTaskCompleted: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, status: 'completed', completedAt: new Date() }
              : task
          ),
        })),

      markTaskInProgress: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, status: 'in_progress', completedAt: undefined }
              : task
          ),
        })),

      markTaskPending: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, status: 'pending', completedAt: undefined }
              : task
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

      // Computed/Derived
      getTaskById: (id) => {
        return get().tasks.find((task) => task.id === id);
      },

      getFilteredTasks: () => {
        const { tasks, filters } = get();
        let filtered = [...tasks];

        // Filter by status
        if (filters.status !== 'all') {
          filtered = filtered.filter((task) => task.status === filters.status);
        }

        // Filter by priority
        if (filters.priority !== 'all') {
          filtered = filtered.filter((task) => task.priority === filters.priority);
        }

        // Sort: overdue first, then by due date, then by priority
        filtered.sort((a, b) => {
          const now = new Date();
          const aOverdue = a.dueDate && a.dueDate < now && a.status !== 'completed';
          const bOverdue = b.dueDate && b.dueDate < now && b.status !== 'completed';

          if (aOverdue && !bOverdue) return -1;
          if (!aOverdue && bOverdue) return 1;

          if (a.dueDate && b.dueDate) {
            return a.dueDate.getTime() - b.dueDate.getTime();
          }

          const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        });

        return filtered;
      },

      getTasksByDocument: (documentId) => {
        return get().tasks.filter((task) => task.documentId === documentId);
      },

      getTasksByEvent: (eventId) => {
        return get().tasks.filter((task) => task.eventId === eventId);
      },

      getTasksByStatus: (status) => {
        return get().tasks.filter((task) => task.status === status);
      },

      getOverdueTasks: () => {
        const now = new Date();
        return get().tasks.filter(
          (task) =>
            task.dueDate &&
            task.dueDate < now &&
            task.status !== 'completed'
        );
      },

      getTasksStats: () => {
        const tasks = get().tasks;
        const now = new Date();

        return {
          total: tasks.length,
          pending: tasks.filter((t) => t.status === 'pending').length,
          inProgress: tasks.filter((t) => t.status === 'in_progress').length,
          completed: tasks.filter((t) => t.status === 'completed').length,
          overdue: tasks.filter(
            (t) =>
              t.dueDate &&
              t.dueDate < now &&
              t.status !== 'completed'
          ).length,
        };
      },

      // Utility
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      reset: () => set(initialState),
    }),
    {
      name: 'task-storage',
      partialize: (state) => ({
        tasks: state.tasks,
        filters: state.filters,
      }),
    }
  )
);
