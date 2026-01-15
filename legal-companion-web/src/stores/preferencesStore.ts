import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserPreferences } from '@/types';

interface PreferencesStore {
  // State
  preferences: UserPreferences;
  isLoading: boolean;
  error: string | null;

  // Actions
  setPreferences: (preferences: Partial<UserPreferences>) => void;
  updateNotificationPreferences: (
    notifications: Partial<UserPreferences['notifications']>
  ) => void;
  updateReminderPreferences: (
    reminders: Partial<UserPreferences['reminders']>
  ) => void;
  setCountry: (country: string) => void;
  setRegion: (region: string) => void;
  setLanguage: (language: string) => void;
  setAiAssistance: (level: UserPreferences['aiAssistance']) => void;

  // Utility
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  preferences: {
    country: 'India',
    region: 'Tamil Nadu',
    language: 'en',
    notifications: {
      email: true,
      push: true,
      sms: false,
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00',
    },
    reminders: {
      defaultSchedule: [1, 3, 7], // Days before event
    },
    aiAssistance: 'moderate' as const,
  },
  isLoading: false,
  error: null,
};

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Actions
      setPreferences: (preferences) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            ...preferences,
          },
        })),

      updateNotificationPreferences: (notifications) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            notifications: {
              ...state.preferences.notifications,
              ...notifications,
            },
          },
        })),

      updateReminderPreferences: (reminders) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            reminders: {
              ...state.preferences.reminders,
              ...reminders,
            },
          },
        })),

      setCountry: (country) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            country,
          },
        })),

      setRegion: (region) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            region,
          },
        })),

      setLanguage: (language) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            language,
          },
        })),

      setAiAssistance: (level) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            aiAssistance: level,
          },
        })),

      // Utility
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      reset: () => set(initialState),
    }),
    {
      name: 'preferences-storage',
      partialize: (state) => ({
        preferences: state.preferences,
      }),
    }
  )
);
