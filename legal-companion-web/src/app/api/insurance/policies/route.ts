/**
 * GET /api/insurance/policies - List insurance policies with pagination and filters
 * POST /api/insurance/policies - Create new insurance policy
 */

import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import {
  successResponse,
  createdResponse,
  ApiErrors,
  handleApiError,
} from '@/lib/api-response';
import { getUserFromRequest } from '@/lib/api-auth';
import { parsePaginationParams, validateRequiredFields } from '@/lib/api-validation';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const tokenPayload = await getUserFromRequest(request);
    if (!tokenPayload) {
      return ApiErrors.unauthorized();
    }

    const searchParams = request.nextUrl.searchParams;
    const { page, limit, skip } = parsePaginationParams(searchParams);

    // Build filters
    const where: any = {
      userId: tokenPayload.userId,
    };

    // Insurance type filter
    const insuranceType = searchParams.get('insuranceType');
    if (insuranceType) {
      where.insuranceType = insuranceType;
    }

    // Status filter
    const status = searchParams.get('status');
    if (status) {
      where.status = status;
    }

    // Expiring soon filter
    const expiringSoon = searchParams.get('expiringSoon');
    if (expiringSoon === 'true') {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      where.renewalDate = {
        lte: thirtyDaysFromNow,
        gte: new Date(),
      };
      where.status = 'active';
    }

    // Fetch policies
    const [policies, total] = await Promise.all([
      prisma.insurancePolicy.findMany({
        where,
        skip,
        take: limit,
        orderBy: { renewalDate: 'asc' },
        include: {
          document: {
            select: {
              id: true,
              title: true,
              filePath: true,
            },
          },
          _count: {
            select: {
              claims: true,
            },
          },
        },
      }),
      prisma.insurancePolicy.count({ where }),
    ]);

    return successResponse(policies, {
      page,
      limit,
      total,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const tokenPayload = await getUserFromRequest(request);
    if (!tokenPayload) {
      return ApiErrors.unauthorized();
    }

    const body = await request.json();

    // Validate required fields
    validateRequiredFields(body, [
      'documentId',
      'policyNumber',
      'insuranceType',
      'provider',
      'policyHolder',
      'premiumAmount',
      'premiumFrequency',
      'coverageAmount',
      'startDate',
      'endDate',
      'renewalDate',
      'coverage',
    ]);

    // Verify document belongs to user
    const document = await prisma.document.findFirst({
      where: {
        id: body.documentId,
        userId: tokenPayload.userId,
      },
    });

    if (!document) {
      return ApiErrors.notFound('Document');
    }

    // Create insurance policy
    const policy = await prisma.insurancePolicy.create({
      data: {
        userId: tokenPayload.userId,
        documentId: body.documentId,
        policyNumber: body.policyNumber,
        insuranceType: body.insuranceType,
        provider: body.provider,
        policyHolder: body.policyHolder,
        insuredMembers: body.insuredMembers || [],
        premiumAmount: body.premiumAmount,
        premiumFrequency: body.premiumFrequency,
        coverageAmount: body.coverageAmount,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        renewalDate: new Date(body.renewalDate),
        gracePeriod: body.gracePeriod || null,
        status: body.status || 'active',
        coverage: body.coverage,
        exclusions: body.exclusions || [],
        benefits: body.benefits || null,
        healthInsurance: body.healthInsurance || null,
        autoInsurance: body.autoInsurance || null,
        lifeInsurance: body.lifeInsurance || null,
        propertyInsurance: body.propertyInsurance || null,
        metadata: body.metadata || null,
      },
      include: {
        document: true,
      },
    });

    return createdResponse(policy);
  } catch (error) {
    return handleApiError(error);
  }
}
