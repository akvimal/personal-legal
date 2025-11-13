'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockInsurancePolicies, mockInsuranceSummary } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';
import {
  Shield,
  Heart,
  Car,
  Users,
  Home as HomeIcon,
  TrendingUp,
  Calendar,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Download,
  Plus,
} from 'lucide-react';
import { format } from 'date-fns';

export default function InsurancePage() {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [expandedPolicy, setExpandedPolicy] = useState<string | null>(null);

  const summary = mockInsuranceSummary;

  // Filter policies by type
  const filteredPolicies = selectedType === 'all'
    ? mockInsurancePolicies
    : mockInsurancePolicies.filter(p => p.insuranceType === selectedType);

  const getInsuranceIcon = (type: string) => {
    switch (type) {
      case 'health':
        return Heart;
      case 'auto':
        return Car;
      case 'life':
        return Users;
      case 'property':
        return HomeIcon;
      default:
        return Shield;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-success bg-success/10';
      case 'expiring_soon':
        return 'text-warning bg-warning/10';
      case 'expired':
        return 'text-critical bg-critical/10';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const togglePolicy = (policyId: string) => {
    setExpandedPolicy(expandedPolicy === policyId ? null : policyId);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 lg:ml-0">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 lg:px-8 py-4 mt-14 lg:mt-0">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="h-7 w-7 text-primary" />
                Insurance Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage and track all your insurance policies in one place
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Policy
            </Button>
          </div>
        </header>

        <div className="p-4 lg:p-8 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Policies</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{summary.totalPolicies}</p>
                    <p className="text-xs text-success mt-1">{summary.activePolicies} active</p>
                  </div>
                  <Shield className="h-12 w-12 text-primary opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Coverage</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {formatCurrency(summary.totalCoverage)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Sum insured</p>
                  </div>
                  <TrendingUp className="h-12 w-12 text-success opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Annual Premium</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {formatCurrency(summary.totalPremium)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Per year</p>
                  </div>
                  <Calendar className="h-12 w-12 text-warning opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Upcoming Renewals</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{summary.upcomingRenewals.length}</p>
                    <p className="text-xs text-warning mt-1">Next 3 months</p>
                  </div>
                  <AlertCircle className="h-12 w-12 text-warning opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coverage by Type */}
          <Card>
            <CardHeader>
              <CardTitle>Coverage by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(summary.byType).map(([type, data]) => {
                  const Icon = getInsuranceIcon(type);
                  return (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedType === type
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-primary/50'
                      }`}
                    >
                      <Icon className="h-6 w-6 text-primary mb-2" />
                      <p className="text-sm font-semibold capitalize text-gray-900">{type}</p>
                      <p className="text-xs text-gray-600 mt-1">{data.count} {data.count === 1 ? 'policy' : 'policies'}</p>
                      <p className="text-sm font-medium text-gray-900 mt-2">
                        {formatCurrency(data.totalCoverage)}
                      </p>
                    </button>
                  );
                })}
              </div>
              {selectedType !== 'all' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedType('all')}
                  className="mt-4"
                >
                  Clear filter
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Policies List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedType === 'all' ? 'All Policies' : `${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Insurance`}
              </h2>
              <span className="text-sm text-gray-600">{filteredPolicies.length} policies</span>
            </div>

            {filteredPolicies.map((policy) => {
              const Icon = getInsuranceIcon(policy.insuranceType);
              const isExpanded = expandedPolicy === policy.id;

              return (
                <Card key={policy.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    {/* Policy Header */}
                    <button
                      onClick={() => togglePolicy(policy.id)}
                      className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="p-3 rounded-lg bg-primary/10">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className="font-semibold text-gray-900">{policy.provider}</h3>
                                <p className="text-sm text-gray-600 mt-0.5">Policy: {policy.policyNumber}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="info" className="capitalize">
                                    {policy.insuranceType}
                                  </Badge>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(policy.status)}`}>
                                    {policy.status.replace('_', ' ')}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-600">Coverage</p>
                                <p className="text-xl font-bold text-gray-900">
                                  {formatCurrency(policy.coverageAmount)}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  Premium: {formatCurrency(policy.premiumAmount)}/{policy.premiumFrequency}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                              <div>
                                <p className="text-xs text-gray-500">Policy Holder</p>
                                <p className="text-sm font-medium text-gray-900 mt-0.5">{policy.policyHolder}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Start Date</p>
                                <p className="text-sm font-medium text-gray-900 mt-0.5">
                                  {format(policy.startDate, 'MMM d, yyyy')}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Renewal Date</p>
                                <p className="text-sm font-medium text-warning mt-0.5">
                                  {format(policy.renewalDate, 'MMM d, yyyy')}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Grace Period</p>
                                <p className="text-sm font-medium text-gray-900 mt-0.5">
                                  {policy.gracePeriod} days
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        )}
                      </div>
                    </button>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="border-t border-gray-200 bg-gray-50 p-6 space-y-6">
                        {/* Coverage Details */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Coverage Details</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {policy.coverage.map((cov, idx) => (
                              <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{cov.type}</p>
                                    {cov.description && (
                                      <p className="text-xs text-gray-600 mt-1">{cov.description}</p>
                                    )}
                                  </div>
                                  <p className="text-sm font-semibold text-primary ml-2">
                                    {typeof cov.amount === 'number' ? formatCurrency(cov.amount) : cov.amount}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Benefits */}
                        {policy.benefits && policy.benefits.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Benefits</h4>
                            <div className="space-y-2">
                              {policy.benefits.map((benefit, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-sm">
                                  <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                                  <div>
                                    <span className="font-medium text-gray-900">{benefit.name}</span>
                                    <span className="text-gray-600"> - {benefit.description}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Exclusions */}
                        {policy.exclusions && policy.exclusions.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Exclusions</h4>
                            <div className="space-y-2">
                              {policy.exclusions.map((exclusion, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                  <span className="text-critical mt-0.5">✗</span>
                                  <span>{exclusion}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Type-specific Details */}
                        {policy.healthInsurance && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Health Insurance Details</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white rounded-lg p-4">
                              <div>
                                <p className="text-xs text-gray-500">Network Type</p>
                                <p className="text-sm font-medium text-gray-900 mt-1 capitalize">
                                  {policy.healthInsurance.network}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Room Rent Limit</p>
                                <p className="text-sm font-medium text-gray-900 mt-1">
                                  {formatCurrency(policy.healthInsurance.roomRentLimit || 0)}/day
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Waiting Period</p>
                                <p className="text-sm font-medium text-gray-900 mt-1">
                                  {policy.healthInsurance.waitingPeriod} months
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Maternity Coverage</p>
                                <p className="text-sm font-medium text-gray-900 mt-1">
                                  {policy.healthInsurance.maternityCovered ? 'Yes' : 'No'}
                                </p>
                              </div>
                            </div>
                            {policy.insuredMembers && policy.insuredMembers.length > 0 && (
                              <div className="mt-3">
                                <p className="text-sm font-medium text-gray-700 mb-2">Insured Members:</p>
                                <div className="flex flex-wrap gap-2">
                                  {policy.insuredMembers.map((member, idx) => (
                                    <Badge key={idx} variant="outline">{member}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {policy.autoInsurance && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Auto Insurance Details</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white rounded-lg p-4">
                              <div>
                                <p className="text-xs text-gray-500">Vehicle</p>
                                <p className="text-sm font-medium text-gray-900 mt-1">
                                  {policy.autoInsurance.vehicleMake} {policy.autoInsurance.vehicleModel}
                                </p>
                                <p className="text-xs text-gray-600">{policy.autoInsurance.vehicleNumber}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">IDV</p>
                                <p className="text-sm font-medium text-gray-900 mt-1">
                                  {formatCurrency(policy.autoInsurance.idv)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">NCB</p>
                                <p className="text-sm font-medium text-gray-900 mt-1">
                                  {policy.autoInsurance.ncb}%
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Coverage Type</p>
                                <p className="text-sm font-medium text-gray-900 mt-1 capitalize">
                                  {policy.autoInsurance.coverageType.replace('-', ' ')}
                                </p>
                              </div>
                            </div>
                            {policy.autoInsurance.addOns && policy.autoInsurance.addOns.length > 0 && (
                              <div className="mt-3">
                                <p className="text-sm font-medium text-gray-700 mb-2">Add-ons:</p>
                                <div className="flex flex-wrap gap-2">
                                  {policy.autoInsurance.addOns.map((addon, idx) => (
                                    <Badge key={idx} variant="success">{addon}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {policy.lifeInsurance && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Life Insurance Details</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white rounded-lg p-4">
                              <div>
                                <p className="text-xs text-gray-500">Policy Type</p>
                                <p className="text-sm font-medium text-gray-900 mt-1 capitalize">
                                  {policy.lifeInsurance.policyType}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Sum Assured</p>
                                <p className="text-sm font-medium text-gray-900 mt-1">
                                  {formatCurrency(policy.lifeInsurance.sumAssured)}
                                </p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-xs text-gray-500 mb-2">Nominees</p>
                                <div className="flex flex-wrap gap-2">
                                  {policy.lifeInsurance.nominees.map((nominee, idx) => (
                                    <Badge key={idx} variant="outline">
                                      {nominee.name} ({nominee.share}%)
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                            {policy.lifeInsurance.riders && policy.lifeInsurance.riders.length > 0 && (
                              <div className="mt-3">
                                <p className="text-sm font-medium text-gray-700 mb-2">Riders:</p>
                                <div className="space-y-2">
                                  {policy.lifeInsurance.riders.map((rider, idx) => (
                                    <div key={idx} className="text-sm text-gray-700 flex justify-between">
                                      <span>{rider.name}</span>
                                      <span>{formatCurrency(rider.coverageAmount)} (₹{rider.premium}/year)</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {policy.propertyInsurance && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Property Insurance Details</h4>
                            <div className="bg-white rounded-lg p-4 space-y-3">
                              <div>
                                <p className="text-xs text-gray-500">Property Address</p>
                                <p className="text-sm font-medium text-gray-900 mt-1">
                                  {policy.propertyInsurance.propertyAddress}
                                </p>
                              </div>
                              <div className="grid grid-cols-3 gap-4">
                                <div>
                                  <p className="text-xs text-gray-500">Building Value</p>
                                  <p className="text-sm font-medium text-gray-900 mt-1">
                                    {formatCurrency(policy.propertyInsurance.buildingValue)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Contents Value</p>
                                  <p className="text-sm font-medium text-gray-900 mt-1">
                                    {formatCurrency(policy.propertyInsurance.contentsValue)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Deductible</p>
                                  <p className="text-sm font-medium text-gray-900 mt-1">
                                    {formatCurrency(policy.propertyInsurance.deductible || 0)}
                                  </p>
                                </div>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Covered Perils:</p>
                                <div className="flex flex-wrap gap-2">
                                  {policy.propertyInsurance.coveredPerils.map((peril, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">{peril}</Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 border-t border-gray-200">
                          <Button size="sm">
                            <FileText className="h-4 w-4 mr-2" />
                            View Policy
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <Button size="sm" variant="outline">
                            File Claim
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
