import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { InsurancePolicy, InsuranceSummary, InsuranceType } from '@/types';
import { mockInsurancePolicies, mockInsuranceSummary } from '@/lib/mock-data';

interface InsuranceStore {
  // State
  policies: InsurancePolicy[];
  summary: InsuranceSummary;
  selectedPolicy: InsurancePolicy | null;
  isLoading: boolean;
  error: string | null;

  // Filters
  filters: {
    insuranceType: InsuranceType | 'all';
    status: InsurancePolicy['status'] | 'all';
  };

  // Actions
  setPolicies: (policies: InsurancePolicy[]) => void;
  addPolicy: (policy: InsurancePolicy) => void;
  updatePolicy: (id: string, updates: Partial<InsurancePolicy>) => void;
  deletePolicy: (id: string) => void;
  selectPolicy: (id: string | null) => void;

  // Summary
  updateSummary: () => void;

  // Filters
  setFilter: (key: keyof InsuranceStore['filters'], value: any) => void;
  resetFilters: () => void;

  // Computed/Derived
  getPolicyById: (id: string) => InsurancePolicy | undefined;
  getFilteredPolicies: () => InsurancePolicy[];
  getPoliciesByType: (type: InsuranceType) => InsurancePolicy[];
  getExpiringPolicies: (days?: number) => InsurancePolicy[];
  getActivePolicies: () => InsurancePolicy[];

  // Utility
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

// Helper function to calculate summary
const calculateSummary = (policies: InsurancePolicy[]): InsuranceSummary => {
  const now = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const activePolicies = policies.filter((p) => p.status === 'active');
  const expiringPolicies = policies.filter(
    (p) => p.status === 'expiring_soon' || (p.renewalDate >= now && p.renewalDate <= thirtyDaysFromNow)
  );

  const totalPremium = policies.reduce((sum, p) => {
    // Convert to annual premium
    let annualPremium = p.premiumAmount;
    if (p.premiumFrequency === 'monthly') annualPremium *= 12;
    else if (p.premiumFrequency === 'quarterly') annualPremium *= 4;
    else if (p.premiumFrequency === 'half-yearly') annualPremium *= 2;
    return sum + annualPremium;
  }, 0);

  const totalCoverage = policies.reduce((sum, p) => sum + p.coverageAmount, 0);

  const byType: InsuranceSummary['byType'] = {};
  const types: InsuranceType[] = ['health', 'auto', 'life', 'property', 'travel'];

  types.forEach((type) => {
    const typePolicies = policies.filter((p) => p.insuranceType === type);
    if (typePolicies.length > 0) {
      const typeCoverage = typePolicies.reduce((sum, p) => sum + p.coverageAmount, 0);
      const typePremium = typePolicies.reduce((sum, p) => {
        let annualPremium = p.premiumAmount;
        if (p.premiumFrequency === 'monthly') annualPremium *= 12;
        else if (p.premiumFrequency === 'quarterly') annualPremium *= 4;
        else if (p.premiumFrequency === 'half-yearly') annualPremium *= 2;
        return sum + annualPremium;
      }, 0);

      byType[type] = {
        count: typePolicies.length,
        totalCoverage: typeCoverage,
        totalPremium: typePremium,
      };
    }
  });

  const upcomingRenewals = policies
    .filter((p) => p.renewalDate >= now)
    .sort((a, b) => a.renewalDate.getTime() - b.renewalDate.getTime())
    .slice(0, 5)
    .map((p) => ({
      policyId: p.id,
      policyNumber: p.policyNumber,
      insuranceType: p.insuranceType,
      renewalDate: p.renewalDate,
      premiumAmount: p.premiumAmount,
    }));

  const recentClaims = policies
    .flatMap((p) => p.claims || [])
    .sort((a, b) => b.claimDate.getTime() - a.claimDate.getTime())
    .slice(0, 5);

  return {
    totalPolicies: policies.length,
    activePolicies: activePolicies.length,
    expiringPolicies: expiringPolicies.length,
    totalPremium,
    totalCoverage,
    byType,
    upcomingRenewals,
    recentClaims,
  };
};

const initialState = {
  policies: mockInsurancePolicies,
  summary: mockInsuranceSummary,
  selectedPolicy: null,
  isLoading: false,
  error: null,
  filters: {
    insuranceType: 'all' as const,
    status: 'all' as const,
  },
};

export const useInsuranceStore = create<InsuranceStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Actions
      setPolicies: (policies) => {
        set({ policies });
        get().updateSummary();
      },

      addPolicy: (policy) => {
        set((state) => ({
          policies: [...state.policies, policy],
        }));
        get().updateSummary();
      },

      updatePolicy: (id, updates) => {
        set((state) => ({
          policies: state.policies.map((policy) =>
            policy.id === id ? { ...policy, ...updates } : policy
          ),
          selectedPolicy:
            state.selectedPolicy?.id === id
              ? { ...state.selectedPolicy, ...updates }
              : state.selectedPolicy,
        }));
        get().updateSummary();
      },

      deletePolicy: (id) => {
        set((state) => ({
          policies: state.policies.filter((policy) => policy.id !== id),
          selectedPolicy:
            state.selectedPolicy?.id === id ? null : state.selectedPolicy,
        }));
        get().updateSummary();
      },

      selectPolicy: (id) =>
        set((state) => ({
          selectedPolicy: id
            ? state.policies.find((policy) => policy.id === id) || null
            : null,
        })),

      // Summary
      updateSummary: () => {
        const policies = get().policies;
        const summary = calculateSummary(policies);
        set({ summary });
      },

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
      getPolicyById: (id) => {
        return get().policies.find((policy) => policy.id === id);
      },

      getFilteredPolicies: () => {
        const { policies, filters } = get();
        let filtered = [...policies];

        // Filter by insurance type
        if (filters.insuranceType !== 'all') {
          filtered = filtered.filter(
            (policy) => policy.insuranceType === filters.insuranceType
          );
        }

        // Filter by status
        if (filters.status !== 'all') {
          filtered = filtered.filter((policy) => policy.status === filters.status);
        }

        // Sort by renewal date (nearest first)
        filtered.sort((a, b) => a.renewalDate.getTime() - b.renewalDate.getTime());

        return filtered;
      },

      getPoliciesByType: (type) => {
        return get().policies.filter((policy) => policy.insuranceType === type);
      },

      getExpiringPolicies: (days = 30) => {
        const now = new Date();
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);

        return get().policies.filter((policy) => {
          const renewalDate = new Date(policy.renewalDate);
          return renewalDate >= now && renewalDate <= futureDate;
        });
      },

      getActivePolicies: () => {
        return get().policies.filter((policy) => policy.status === 'active');
      },

      // Utility
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      reset: () => set(initialState),
    }),
    {
      name: 'insurance-storage',
      partialize: (state) => ({
        policies: state.policies,
        filters: state.filters,
      }),
    }
  )
);
