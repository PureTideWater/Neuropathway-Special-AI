'use client';

/**
 * State Compliance Report Generator Page
 * Check IEPs against federal IDEA and state-specific requirements
 *
 * BUSINESS VALUE: Premium feature - automated compliance reduces legal risk
 * COMPETITIVE ADVANTAGE: 50-state requirement database + AI remediation
 */

import { useState, useEffect } from 'react';
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

interface ComplianceIssue {
  ruleId: string;
  ruleName: string;
  severity: 'critical' | 'warning' | 'info';
  description: string;
  citation: string;
  finding: string;
  remediation: string;
}

interface ComplianceResult {
  iepId: string;
  state: string;
  checkedAt: string;
  overallStatus: 'compliant' | 'non-compliant' | 'needs-review';
  complianceScore: number;
  issues: ComplianceIssue[];
  criticalIssueCount: number;
  warningCount: number;
  federalCompliance: boolean;
  stateCompliance: boolean;
  pdfUrl?: string;
}

interface DistrictStats {
  totalIEPs: number;
  compliantIEPs: number;
  complianceRate: number;
  criticalIssues: number;
  warnings: number;
  commonViolations: Array<{
    rule: string;
    count: number;
    severity: string;
  }>;
}

export default function ComplianceReportsPage() {
  const [selectedState, setSelectedState] = useState('CA');
  const [iepId, setIepId] = useState('');
  const [complianceResult, setComplianceResult] = useState<ComplianceResult | null>(null);
  const [districtStats, setDistrictStats] = useState<DistrictStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'single' | 'district'>('single');

  const districtId = 'district-123'; // In production: Get from auth context

  const US_STATES = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  ];

  useEffect(() => {
    fetchDistrictStats();
  }, [selectedState]);

  const fetchDistrictStats = async () => {
    try {
      const response = await fetch(
        `http://localhost:4004/api/compliance/stats/${districtId}?state=${selectedState}&timeRange=30d`
      );
      const data = await response.json();
      if (data.success) {
        setDistrictStats(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch district stats:', err);
    }
  };

  const checkCompliance = async () => {
    if (!iepId.trim()) {
      setError('Please enter an IEP ID');
      return;
    }

    setLoading(true);
    setError(null);
    setComplianceResult(null);

    try {
      const response = await fetch(
        `http://localhost:4004/api/compliance/check/${iepId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            state: selectedState,
            generatePDF: false,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setComplianceResult(data.data);
      } else {
        setError(data.error?.message || 'Failed to check compliance');
      }
    } catch (err) {
      setError('Network error - please try again');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generatePDFReport = async () => {
    if (!iepId.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:4004/api/compliance/report/${iepId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            state: selectedState,
            includeRemediation: true,
            format: 'pdf',
          }),
        }
      );

      const data = await response.json();

      if (data.success && data.data.pdfUrl) {
        window.open(data.data.pdfUrl, '_blank');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to generate PDF report');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      default:
        return 'text-blue-700 bg-blue-50 border-blue-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'non-compliant':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            State Compliance Report Generator
          </h1>
          <p className="text-gray-600">
            Automated IEP compliance checking against federal IDEA and state-specific requirements
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('single')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'single'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Single IEP Check
            </button>
            <button
              onClick={() => setActiveTab('district')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'district'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              District Dashboard
            </button>
          </nav>
        </div>

        {activeTab === 'single' ? (
          <>
            {/* Input Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {US_STATES.map((state) => (
                      <key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IEP ID
                  </label>
                  <input
                    type="text"
                    value={iepId}
                    onChange={(e) => setIepId(e.target.value)}
                    placeholder="Enter IEP ID"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={checkCompliance}
                    disabled={loading}
                    className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
                    {loading ? 'Checking...' : 'Check Compliance'}
                  </button>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}
            </div>

            {/* Results Section */}
            {complianceResult && (
              <div className="space-y-6">
                {/* Overall Status Card */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                      Compliance Status
                    </h2>
                    <button
                      onClick={generatePDFReport}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center"
                    >
                      <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                      Download PDF
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div
                      className={`p-4 rounded-lg border-2 ${getStatusColor(
                        complianceResult.overallStatus
                      )}`}
                    >
                      <div className="text-sm font-medium mb-1">Overall Status</div>
                      <div className="text-2xl font-bold capitalize">
                        {complianceResult.overallStatus.replace('-', ' ')}
                      </div>
                    </div>

                    <div className="p-4 rounded-lg border-2 border-gray-200">
                      <div className="text-sm font-medium text-gray-600 mb-1">
                        Compliance Score
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {complianceResult.complianceScore}/100
                      </div>
                    </div>

                    <div className="p-4 rounded-lg border-2 border-red-200 bg-red-50">
                      <div className="text-sm font-medium text-red-700 mb-1">
                        Critical Issues
                      </div>
                      <div className="text-2xl font-bold text-red-700">
                        {complianceResult.criticalIssueCount}
                      </div>
                    </div>

                    <div className="p-4 rounded-lg border-2 border-yellow-200 bg-yellow-50">
                      <div className="text-sm font-medium text-yellow-700 mb-1">
                        Warnings
                      </div>
                      <div className="text-2xl font-bold text-yellow-700">
                        {complianceResult.warningCount}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-4">
                    <div className="flex items-center">
                      {complianceResult.federalCompliance ? (
                        <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
                      ) : (
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
                      )}
                      <span className="text-sm text-gray-700">
                        Federal IDEA Compliance:{' '}
                        {complianceResult.federalCompliance ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      {complianceResult.stateCompliance ? (
                        <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
                      ) : (
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
                      )}
                      <span className="text-sm text-gray-700">
                        State Compliance: {complianceResult.stateCompliance ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Issues List */}
                {complianceResult.issues.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      Compliance Issues ({complianceResult.issues.length})
                    </h2>

                    <div className="space-y-4">
                      {complianceResult.issues.map((issue, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border-2 ${getSeverityColor(
                            issue.severity
                          )}`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center mb-1">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-bold uppercase mr-2 ${
                                    issue.severity === 'critical'
                                      ? 'bg-red-600 text-white'
                                      : 'bg-yellow-600 text-white'
                                  }`}
                                >
                                  {issue.severity}
                                </span>
                                <h3 className="font-bold">{issue.ruleName}</h3>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {issue.description}
                              </p>
                              <p className="text-xs text-gray-500 italic mb-2">
                                Citation: {issue.citation}
                              </p>
                            </div>
                          </div>

                          <div className="border-t border-gray-200 pt-3 mt-3">
                            <p className="text-sm font-semibold text-gray-900 mb-1">
                              Finding:
                            </p>
                            <p className="text-sm text-gray-700 mb-3">{issue.finding}</p>

                            <p className="text-sm font-semibold text-gray-900 mb-1">
                              Remediation:
                            </p>
                            <p className="text-sm text-gray-700">{issue.remediation}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {complianceResult.issues.length === 0 && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-8 text-center">
                    <CheckCircleIcon className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-green-900 mb-2">
                      Fully Compliant!
                    </h3>
                    <p className="text-green-700">
                      This IEP meets all federal IDEA and state requirements.
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          /* District Dashboard */
          districtStats && (
            <div className="space-y-6">
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="text-sm font-medium text-gray-600 mb-1">Total IEPs</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {districtStats.totalIEPs}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="text-sm font-medium text-gray-600 mb-1">
                    Compliance Rate
                  </div>
                  <div className="text-3xl font-bold text-green-600">
                    {districtStats.complianceRate.toFixed(1)}%
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="text-sm font-medium text-gray-600 mb-1">
                    Critical Issues
                  </div>
                  <div className="text-3xl font-bold text-red-600">
                    {districtStats.criticalIssues}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="text-sm font-medium text-gray-600 mb-1">Warnings</div>
                  <div className="text-3xl font-bold text-yellow-600">
                    {districtStats.warnings}
                  </div>
                </div>
              </div>

              {/* Common Violations */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Common Violations
                </h2>
                <div className="space-y-3">
                  {districtStats.commonViolations.map((violation, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold uppercase mr-3 ${
                            violation.severity === 'critical'
                              ? 'bg-red-600 text-white'
                              : 'bg-yellow-600 text-white'
                          }`}
                        >
                          {violation.severity}
                        </span>
                        <span className="font-medium text-gray-900">
                          {violation.rule.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <span className="text-2xl font-bold text-gray-700">
                        {violation.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
