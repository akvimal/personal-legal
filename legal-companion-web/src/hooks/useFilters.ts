import { useState, useCallback, useMemo } from 'react';

interface FilterConfig<T> {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'date' | 'range';
  options?: { value: T; label: string }[];
}

/**
 * Generic hook for managing filters
 */
export function useFilters<T extends Record<string, any>>(initialFilters: T) {
  const [filters, setFilters] = useState<T>(initialFilters);
  const [isFiltering, setIsFiltering] = useState(false);

  // Update a single filter
  const setFilter = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Update multiple filters at once
  const setMultipleFilters = useCallback((updates: Partial<T>) => {
    setFilters((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  // Reset filters to initial state
  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  // Clear a specific filter
  const clearFilter = useCallback(
    <K extends keyof T>(key: K) => {
      setFilters((prev) => ({
        ...prev,
        [key]: initialFilters[key],
      }));
    },
    [initialFilters]
  );

  // Check if filters are active (different from initial)
  const hasActiveFilters = useMemo(() => {
    return Object.keys(filters).some(
      (key) => JSON.stringify(filters[key]) !== JSON.stringify(initialFilters[key])
    );
  }, [filters, initialFilters]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    return Object.keys(filters).filter(
      (key) => JSON.stringify(filters[key]) !== JSON.stringify(initialFilters[key])
    ).length;
  }, [filters, initialFilters]);

  return {
    filters,
    setFilter,
    setMultipleFilters,
    resetFilters,
    clearFilter,
    hasActiveFilters,
    activeFilterCount,
    isFiltering,
    setIsFiltering,
  };
}

/**
 * Hook for date range filtering
 */
export function useDateRange(initialStart?: Date, initialEnd?: Date) {
  const [startDate, setStartDate] = useState<Date | null>(initialStart || null);
  const [endDate, setEndDate] = useState<Date | null>(initialEnd || null);

  const setRange = useCallback((start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
  }, []);

  const clearRange = useCallback(() => {
    setStartDate(null);
    setEndDate(null);
  }, []);

  const isInRange = useCallback(
    (date: Date) => {
      if (!startDate && !endDate) return true;
      if (startDate && date < startDate) return false;
      if (endDate && date > endDate) return false;
      return true;
    },
    [startDate, endDate]
  );

  return {
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    setRange,
    clearRange,
    isInRange,
    hasRange: !!(startDate || endDate),
  };
}
