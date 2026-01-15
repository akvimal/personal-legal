'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { refreshAccessToken } from '@/lib/auth-client';

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Auth Provider
 * Initializes authentication state and sets up automatic token refresh
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const { initialize, isInitialized } = useAuthStore();

  useEffect(() => {
    // Initialize auth state from stored tokens
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

  useEffect(() => {
    // Set up automatic token refresh every 6 hours
    // Access tokens expire in 7 days, so refreshing every 6 hours keeps them valid
    const refreshInterval = setInterval(
      () => {
        refreshAccessToken().catch((error) => {
          console.error('Auto token refresh failed:', error);
        });
      },
      6 * 60 * 60 * 1000
    ); // 6 hours

    return () => clearInterval(refreshInterval);
  }, []);

  return <>{children}</>;
}
