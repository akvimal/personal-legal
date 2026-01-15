/**
 * GET /api/insurance/summary - Get insurance summary statistics
 */

import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, ApiErrors, handleApiError } from '@/lib/api-response';
import { getUserFromRequest } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const tokenPayload = await getUserFromRequest(request);
    if (!tokenPayload) {
      return ApiErrors.unauthorized();
    }

    // Fetch all user's policies
    const policies = await prisma.insurancePolicy.findMany({
      where: {
        userId: tokenPayload.userId,
      },
      include: {
        claims: true,
      },
    });

    // Calculate summary statistics
    const totalPolicies = policies.length;
    const activePolicies = policies.filter((p) => p.status === 'active').length;

    // Calculate total annual premium
    const totalAnnualPremium = policies.reduce((sum, policy) => {
      let annualAmount = policy.premiumAmount;

      // Convert to annual amount based on frequency
      switch (policy.premiumFrequency) {
        case 'monthly':
          annualAmount *= 12;
          break;
        case 'quarterly':
          annualAmount *= 4;
          break;
        case 'half-yearly':
          annualAmount *= 2;
          break;
        // yearly is already annual
      }

      return sum + annualAmount;
    }, 0);

    // Calculate total coverage
    const totalCoverage = policies.reduce((sum, policy) => sum + policy.coverageAmount, 0);

    // Get policies by type
    const byType = policies.reduce(
      (acc, policy) => {
        acc[policy.insuranceType] = (acc[policy.insuranceType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Get expiring soon (within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const expiringSoon = policies.filter(
      (p) => p.status === 'active' && p.renewalDate <= thirtyDaysFromNow && p.renewalDate >= new Date()
    ).length;

    // Get claims summary
    const allClaims = policies.flatMap((p) => p.claims);
    const totalClaims = allClaims.length;
    const pendingClaims = allClaims.filter(
      (c) => c.status === 'submitted' || c.status === 'under_review'
    ).length;
    const approvedClaims = allClaims.filter((c) => c.status === 'approved' || c.status === 'settled')
      .length;

    const summary = {
      totalPolicies,
      activePolicies,
      totalAnnualPremium,
      totalCoverage,
      byType,
      expiringSoon,
      claims: {
        total: totalClaims,
        pending: pendingClaims,
        approved: approvedClaims,
      },
    };

    return successResponse(summary);
  } catch (error) {
    return handleApiError(error);
  }
}
