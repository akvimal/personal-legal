import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  fullName: string;
  location: string;
  avatarUrl?: string;
  createdAt: Date;
}

interface AuthStore {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;

  // Utility
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

// Mock user for development
const mockUser: User = {
  id: 'user-1',
  email: 'rajesh.kumar@email.com',
  fullName: 'Rajesh Kumar',
  location: 'Chennai, Tamil Nadu, India',
  createdAt: new Date('2024-01-01'),
};

const initialState = {
  user: mockUser, // Set to null in production
  isAuthenticated: true, // Set to false in production
  isLoading: false,
  error: null,
  token: null,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Actions
      login: async (email, password) => {
        set({ isLoading: true, error: null });

        try {
          // TODO: Replace with actual API call
          // Simulating API delay
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Mock successful login
          if (email && password) {
            set({
              user: mockUser,
              isAuthenticated: true,
              token: 'mock-jwt-token',
              isLoading: false,
            });
          } else {
            throw new Error('Invalid credentials');
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          token: null,
          error: null,
        });

        // TODO: Clear all other stores on logout
        // You might want to clear localStorage or call reset on other stores
      },

      register: async (email, password, fullName) => {
        set({ isLoading: true, error: null });

        try {
          // TODO: Replace with actual API call
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const newUser: User = {
            id: `user-${Date.now()}`,
            email,
            fullName,
            location: '',
            createdAt: new Date(),
          };

          set({
            user: newUser,
            isAuthenticated: true,
            token: 'mock-jwt-token',
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Registration failed',
            isLoading: false,
          });
          throw error;
        }
      },

      updateUser: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      },

      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
        });
      },

      setToken: (token) => {
        set({ token });
      },

      // Utility
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      reset: () => set({ ...initialState, user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
