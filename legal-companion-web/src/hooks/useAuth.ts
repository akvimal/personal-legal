import { useCallback } from 'react';
import { useAuthStore } from '@/stores';

/**
 * Hook for authentication and user management
 */
export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    register,
    updateUser,
    setError,
  } = useAuthStore();

  // Login with credentials
  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        await login(email, password);
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Login failed',
        };
      }
    },
    [login]
  );

  // Logout user
  const signOut = useCallback(() => {
    logout();
  }, [logout]);

  // Register new user
  const signUp = useCallback(
    async (email: string, password: string, fullName: string) => {
      try {
        await register(email, password, fullName);
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Registration failed',
        };
      }
    },
    [register]
  );

  // Update user profile
  const updateProfile = useCallback(
    async (updates: { fullName?: string; location?: string; avatarUrl?: string }) => {
      try {
        // TODO: Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        updateUser(updates);
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Profile update failed',
        };
      }
    },
    [updateUser]
  );

  // Clear auth error
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    signIn,
    signOut,
    signUp,
    updateProfile,
    clearError,
  };
}
