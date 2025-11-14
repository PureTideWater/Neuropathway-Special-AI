'use client';

/**
 * Enterprise District Dashboard
 *
 * PREMIUM TIER FEATURE ($50K-150K/year)
 * District-wide risk assessment, network insights, and compliance overview
 *
 * COMPETITIVE ADVANTAGE:
 * - Only platform with district-level ML predictions
 * - Network effect insights (similar districts comparison)
 * - Actionable compliance risk assessment
 *
 * REVENUE JUSTIFICATION:
 * - Prevents IEP failures district-wide (legal protection worth $100K+)
 * - Resource allocation optimization (save $50K-100K in wasted interventions)
 * - Benchmark insights (compare to similar districts)
 * - Compliance insurance (avoid state/federal violations)
 *
 * BUSINESS VALUE:
 * - Justifies premium enterprise pricing
 * - Executive-level reporting (superintendent dashboards)
 * - Demonstrates ROI clearly (prevention = cost savings)
 */

import { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UsersIcon,
  AcademicCapIcon,
  ClockIcon,
  ShieldCheckIcon,
  SparklesIcon,
  FireIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

interface RiskStudent {
  studentId: string;
  studentName: string;
  grade: number;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  goalsAtRisk: number;
  trend: 'increasing' | 'decreasing' | 'stable' | 'new';
  primaryConcern: string;
  recommendedAction: string;
}

interface DistrictMetrics {
  totalStudents: number;
  studentsAtRisk: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  goalsAtRisk: {
    total: number;
    percentage: number;
  };
  interventionsRecommended: number;
  complianceScore: number;
  trendDirection: 'improving' | 'declining' | 'stable';
}

interface BenchmarkComparison {
  metric: string;
  districtValue: number;
  similarDistrictsAvg: number;
  nationalAvg: number;
  trend: 'above' | 'at' | 'below';
  interpretation: string;
}

export default function EnterpriseDashboard() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DistrictMetrics | null>(null);
  const [riskStudents, setRiskStudents] = useState<RiskStudent[]>([]);
  const [benchmarks, setBenchmarks] = useState<BenchmarkComparison[]>([]);
  const [filterRiskLevel, setFilterRiskLevel] = useState<string>('all');
  const [networkSize, setNetworkSize] = useState(0);

  useEffect(() => {
    fetchDistrictDashboard();
  }, []);

  const fetchDistrictDashboard = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/district-dashboard');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMetrics(data.data.metrics);
          setRiskStudents(data.data.riskStudents || []);
          setBenchmarks(data.data.benchmarks || []);
          setNetworkSize(data.data.networkSize || 0);
        }
      }
    } catch (error) {
      console.error('Error fetching district dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'increasing') return <TrendingUpIcon className="h-5 w-5 text-red-600" />;
    if (trend === 'decreasing') return <TrendingDownIcon className="h-5 w-5 text-green-600" />;
    return <CheckCircleIcon className="h-5 w-5 text-gray-600" />;
  };

  const filteredStudents = filterRiskLevel === 'all'
    ? riskStudents
    : riskStudents.filter(s => s.riskLevel === filterRiskLevel);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-white/20 backdrop-blur-lg rounded-xl border border-white/30">
                  <ChartBarIcon className="h-10 w-10" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">Enterprise District Dashboard</h1>
                  <p className="text-blue-100 mt-1">
                    District-wide risk assessment powered by ML predictions
                  </p>
                </div>
              </div>
            </div>

            <div className="hidden md:flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 bg-yellow-400/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-yellow-300/30">
                <FireIcon className="h-5 w-5 text-yellow-200" />
                <span className="text-sm font-medium">Enterprise Tier</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <SparklesIcon className="h-5 w-5" />
                <span className="text-sm font-medium">Network: {networkSize.toLocaleString()}+ students</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-20">
            <SparklesIcon className="h-20 w-20 text-purple-600 mx-auto mb-4 animate-pulse" />
            <p className="text-xl text-gray-600 font-medium">Analyzing district-wide data...</p>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg border-2 border-blue-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <UsersIcon className="h-8 w-8 text-blue-600" />
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    metrics?.trendDirection === 'improving' ? 'bg-green-100 text-green-800' :
                    metrics?.trendDirection === 'declining' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {metrics?.trendDirection || 'stable'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">Total Students</p>
                <p className="text-4xl font-bold text-gray-900">{metrics?.totalStudents || 0}</p>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-orange-500 rounded-xl shadow-lg p-6 text-white">
                <ExclamationTriangleIcon className="h-8 w-8 mb-2" />
                <p className="text-sm mb-1 text-red-100">Students At-Risk</p>
                <p className="text-4xl font-bold">
                  {(metrics?.studentsAtRisk.critical || 0) + (metrics?.studentsAtRisk.high || 0)}
                </p>
                <p className="text-xs mt-2 text-red-100">
                  Critical: {metrics?.studentsAtRisk.critical || 0} | High: {metrics?.studentsAtRisk.high || 0}
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl shadow-lg p-6 text-white">
                <AcademicCapIcon className="h-8 w-8 mb-2" />
                <p className="text-sm mb-1 text-orange-100">Goals At-Risk</p>
                <p className="text-4xl font-bold">{metrics?.goalsAtRisk.total || 0}</p>
                <p className="text-xs mt-2 text-orange-100">
                  {metrics?.goalsAtRisk.percentage || 0}% of total goals
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-blue-500 rounded-xl shadow-lg p-6 text-white">
                <ShieldCheckIcon className="h-8 w-8 mb-2" />
                <p className="text-sm mb-1 text-green-100">Compliance Score</p>
                <p className="text-4xl font-bold">{metrics?.complianceScore || 0}%</p>
                <p className="text-xs mt-2 text-green-100">
                  {metrics?.interventionsRecommended || 0} interventions recommended
                </p>
              </div>
            </div>

            {/* Risk Level Distribution */}
            <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <ExclamationTriangleIcon className="h-7 w-7 text-red-600" />
                Student Risk Distribution
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-shadow"
                     onClick={() => setFilterRiskLevel('critical')}>
                  <div className="text-center">
                    <p className="text-sm font-medium text-red-800 mb-2">Critical Risk</p>
                    <p className="text-5xl font-bold text-red-900">{metrics?.studentsAtRisk.critical || 0}</p>
                    <p className="text-xs text-red-700 mt-2">Immediate action required</p>
                  </div>
                </div>

                <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-shadow"
                     onClick={() => setFilterRiskLevel('high')}>
                  <div className="text-center">
                    <p className="text-sm font-medium text-orange-800 mb-2">High Risk</p>
                    <p className="text-5xl font-bold text-orange-900">{metrics?.studentsAtRisk.high || 0}</p>
                    <p className="text-xs text-orange-700 mt-2">Close monitoring needed</p>
                  </div>
                </div>

                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-shadow"
                     onClick={() => setFilterRiskLevel('medium')}>
                  <div className="text-center">
                    <p className="text-sm font-medium text-yellow-800 mb-2">Medium Risk</p>
                    <p className="text-5xl font-bold text-yellow-900">{metrics?.studentsAtRisk.medium || 0}</p>
                    <p className="text-xs text-yellow-700 mt-2">Preventive measures advised</p>
                  </div>
                </div>

                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-shadow"
                     onClick={() => setFilterRiskLevel('low')}>
                  <div className="text-center">
                    <p className="text-sm font-medium text-green-800 mb-2">Low Risk</p>
                    <p className="text-5xl font-bold text-green-900">{metrics?.studentsAtRisk.low || 0}</p>
                    <p className="text-xs text-green-700 mt-2">On track for success</p>
                  </div>
                </div>
              </div>

              {filterRiskLevel !== 'all' && (
                <div className="mt-4">
                  <button
                    onClick={() => setFilterRiskLevel('all')}
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    ← Show All Students
                  </button>
                </div>
              )}
            </div>

            {/* At-Risk Students List */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <UsersIcon className="h-7 w-7 text-purple-600" />
                At-Risk Students ({filteredStudents.length})
              </h2>

              <div className="space-y-4">
                {filteredStudents.map((student, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-md border-2 border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">{student.studentName}</h3>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getRiskBadgeColor(student.riskLevel)}`}>
                            {student.riskLevel.toUpperCase()} RISK
                          </span>
                          <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
                            Grade {student.grade}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                            <p className="text-xs text-red-800 mb-1">Goals At-Risk</p>
                            <p className="text-2xl font-bold text-red-900">{student.goalsAtRisk}</p>
                          </div>

                          <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                            <p className="text-xs text-orange-800 mb-1">Primary Concern</p>
                            <p className="text-sm font-semibold text-orange-900">{student.primaryConcern}</p>
                          </div>

                          <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                            <p className="text-xs text-purple-800 mb-1">Trend</p>
                            <div className="flex items-center gap-2">
                              {getTrendIcon(student.trend)}
                              <p className="text-sm font-semibold text-purple-900">{student.trend}</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 bg-blue-50 rounded-lg p-4 border border-blue-200">
                          <p className="text-xs font-semibold text-blue-900 mb-1">📋 Recommended Action</p>
                          <p className="text-sm text-blue-800">{student.recommendedAction}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Benchmark Comparison */}
            <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <ChartBarIcon className="h-7 w-7 text-blue-600" />
                District Benchmarks vs. Network
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Metric</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Your District</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Similar Districts</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">National Avg</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {benchmarks.map((benchmark, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-900">{benchmark.metric}</p>
                          <p className="text-xs text-gray-600">{benchmark.interpretation}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-lg font-bold text-purple-600">{benchmark.districtValue}%</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm text-gray-700">{benchmark.similarDistrictsAvg}%</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm text-gray-700">{benchmark.nationalAvg}%</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            benchmark.trend === 'above' ? 'bg-green-100 text-green-800' :
                            benchmark.trend === 'below' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {benchmark.trend === 'above' ? '↑ Above' :
                             benchmark.trend === 'below' ? '↓ Below' :
                             '= At'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Enterprise Value Proposition */}
            <div className="bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 text-white rounded-2xl shadow-2xl p-8">
              <div className="flex items-start gap-6">
                <div className="p-4 bg-white/20 backdrop-blur-lg rounded-xl">
                  <FireIcon className="h-12 w-12" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3">Enterprise Network Effect</h3>
                  <p className="text-purple-100 mb-4">
                    This dashboard is powered by anonymized data from {networkSize.toLocaleString()}+ students across hundreds of districts.
                    Your insights improve as more districts join the PathWise network.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
                      <p className="text-3xl font-bold">${(metrics?.interventionsRecommended || 0) * 2}K</p>
                      <p className="text-sm text-purple-100">Estimated savings from early intervention</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
                      <p className="text-3xl font-bold">{metrics?.complianceScore || 0}%</p>
                      <p className="text-sm text-purple-100">Compliance score (legal protection)</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
                      <p className="text-3xl font-bold">{networkSize.toLocaleString()}+</p>
                      <p className="text-sm text-purple-100">Students in network (growing daily)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
