import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as authClient from '@/lib/auth-client';

interface User {
  id: string;
  email: string;
  fullName: string;
  location: string | null;
  avatarUrl?: string | null;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

interface AuthStore {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (
    email: string,
    password: string,
    fullName: string,
    location?: string
  ) => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  setUser: (user: User | null) => void;
  initialize: () => Promise<void>;
  checkAuth: () => Promise<boolean>;

  // Utility
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isInitialized: false,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Initialize auth state from stored tokens
      initialize: async () => {
        const isAuth = authClient.isAuthenticated();

        if (!isAuth) {
          set({ isInitialized: true });
          return;
        }

        set({ isLoading: true });

        try {
          // Try to get current user with stored token
          const user = await authClient.getCurrentUser();
          set({
            user,
            isAuthenticated: true,
            isInitialized: true,
            isLoading: false,
          });
        } catch (error) {
          // Token invalid or expired, clear auth state
          authClient.clearAuthTokens();
          set({
            user: null,
            isAuthenticated: false,
            isInitialized: true,
            isLoading: false,
          });
        }
      },

      // Check authentication status
      checkAuth: async () => {
        const isAuth = authClient.isAuthenticated();

        if (!isAuth) {
          set({ user: null, isAuthenticated: false });
          return false;
        }

        try {
          const user = await authClient.getCurrentUser();
          set({ user, isAuthenticated: true });
          return true;
        } catch (error) {
          authClient.clearAuthTokens();
          set({ user: null, isAuthenticated: false });
          return false;
        }
      },

      // Login
      login: async (email, password) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authClient.login({ email, password });

          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Login failed';

          set({
            error: errorMessage,
            isLoading: false,
            user: null,
            isAuthenticated: false,
          });

          throw error;
        }
      },

      // Logout
      logout: async () => {
        set({ isLoading: true });

        try {
          await authClient.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });

          // TODO: Clear all other stores on logout
          // You might want to reset document, event, task stores, etc.
        }
      },

      // Register
      register: async (email, password, fullName, location) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authClient.register({
            email,
            password,
            fullName,
            location,
          });

          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Registration failed';

          set({
            error: errorMessage,
            isLoading: false,
            user: null,
            isAuthenticated: false,
          });

          throw error;
        }
      },

      // Update user
      updateUser: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      },

      // Set user
      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
        });
      },

      // Utility
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      reset: () => {
        authClient.clearAuthTokens();
        set(initialState);
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
