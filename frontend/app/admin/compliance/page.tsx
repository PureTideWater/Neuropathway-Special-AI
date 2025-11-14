'use client';

/**
 * District Compliance Dashboard
 * COMPETITIVE ADVANTAGE: Prevent lawsuits before they happen
 *
 * Key Features:
 * - Real-time compliance monitoring across ALL teachers
 * - Automated deadline alerts (60, 30, 7 days before)
 * - One-click state audit reports
 * - Legal protection through proactive monitoring
 * - ROI metrics for school board presentations
 */

import { useState } from 'react';
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
  DocumentTextIcon,
  UserGroupIcon,
  BellAlertIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

interface ComplianceItem {
  id: string;
  studentName: string;
  teacher: string;
  issueType: string;
  dueDate: Date;
  daysRemaining: number;
  severity: 'critical' | 'warning' | 'info';
  status: 'overdue' | 'due-soon' | 'on-track';
}

interface TeacherStats {
  name: string;
  totalIEPs: number;
  compliant: number;
  atRisk: number;
  overdue: number;
  complianceRate: number;
}

export default function ComplianceDashboardPage() {
  const [timeFilter, setTimeFilter] = useState('30-days');

  // Mock compliance data
  const complianceItems: ComplianceItem[] = [
    {
      id: '1',
      studentName: 'Johnny Doe',
      teacher: 'Ms. Sarah Johnson',
      issueType: 'Annual Review Due',
      dueDate: new Date('2024-12-01'),
      daysRemaining: 7,
      severity: 'critical',
      status: 'due-soon',
    },
    {
      id: '2',
      studentName: 'Emily Smith',
      teacher: 'Mr. Michael Brown',
      issueType: 'Re-evaluation Due',
      dueDate: new Date('2024-11-25'),
      daysRemaining: 3,
      severity: 'critical',
      status: 'due-soon',
    },
    {
      id: '3',
      studentName: 'David Wilson',
      teacher: 'Ms. Sarah Johnson',
      issueType: 'Progress Report',
      dueDate: new Date('2024-12-15'),
      daysRemaining: 21,
      severity: 'warning',
      status: 'on-track',
    },
    {
      id: '4',
      studentName: 'Lisa Anderson',
      teacher: 'Dr. Rachel Green',
      issueType: 'Parent Notification',
      dueDate: new Date('2024-11-20'),
      daysRemaining: -2,
      severity: 'critical',
      status: 'overdue',
    },
  ];

  const teacherStats: TeacherStats[] = [
    {
      name: 'Ms. Sarah Johnson',
      totalIEPs: 12,
      compliant: 10,
      atRisk: 2,
      overdue: 0,
      complianceRate: 83,
    },
    {
      name: 'Mr. Michael Brown',
      totalIEPs: 15,
      compliant: 13,
      atRisk: 1,
      overdue: 1,
      complianceRate: 87,
    },
    {
      name: 'Dr. Rachel Green',
      totalIEPs: 10,
      compliant: 8,
      atRisk: 1,
      overdue: 1,
      complianceRate: 80,
    },
    {
      name: 'Mrs. Jennifer Lee',
      totalIEPs: 14,
      compliant: 14,
      atRisk: 0,
      overdue: 0,
      complianceRate: 100,
    },
  ];

  const overallStats = {
    totalIEPs: 156,
    compliantRate: 94,
    criticalIssues: 3,
    upcomingDeadlines: 8,
    timeSavedThisMonth: '142 hours',
    preventedViolations: 12,
  };

  const criticalItems = complianceItems.filter(item => item.severity === 'critical');
  const overdueItems = complianceItems.filter(item => item.status === 'overdue');

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">District Compliance Dashboard</h1>
              <p className="mt-2 text-red-100">
                Real-time monitoring • Prevent violations before they happen
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button className="px-6 py-3 bg-white text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2">
                <ArrowDownTrayIcon className="h-5 w-5" />
                Export Audit Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Critical Alerts Banner */}
        {criticalItems.length > 0 && (
          <div className="mb-6 bg-red-50 border-2 border-red-500 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <h2 className="text-lg font-bold text-red-900 mb-2">
                  ⚠️ {criticalItems.length} Critical Compliance Issues Require Immediate Attention
                </h2>
                <div className="space-y-2">
                  {criticalItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {item.studentName} - {item.issueType}
                        </p>
                        <p className="text-sm text-gray-600">Teacher: {item.teacher}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${item.daysRemaining < 0 ? 'text-red-600' : 'text-orange-600'}`}>
                          {item.daysRemaining < 0 ? `${Math.abs(item.daysRemaining)} days overdue` : `${item.daysRemaining} days left`}
                        </p>
                        <p className="text-sm text-gray-600">Due: {item.dueDate.toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Overall Compliance</p>
              <ShieldCheckIcon className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-4xl font-bold text-green-600">{overallStats.compliantRate}%</p>
            <p className="text-sm text-gray-500 mt-1">{overallStats.totalIEPs} total IEPs</p>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${overallStats.compliantRate}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Critical Issues</p>
              <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-4xl font-bold text-red-600">{overallStats.criticalIssues}</p>
            <p className="text-sm text-gray-500 mt-1">Require immediate action</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Upcoming Deadlines</p>
              <ClockIcon className="h-8 w-8 text-orange-500" />
            </div>
            <p className="text-4xl font-bold text-orange-600">{overallStats.upcomingDeadlines}</p>
            <p className="text-sm text-gray-500 mt-1">Next 30 days</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Violations Prevented</p>
              <CheckCircleIcon className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-4xl font-bold text-blue-600">{overallStats.preventedViolations}</p>
            <p className="text-sm text-gray-500 mt-1">This month</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Compliance Issues List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">All Compliance Items</h2>
                <div className="flex items-center gap-2">
                  <select
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="7-days">Next 7 Days</option>
                    <option value="30-days">Next 30 Days</option>
                    <option value="90-days">Next 90 Days</option>
                    <option value="all">All</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                {complianceItems.map(item => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg border-2 ${
                      item.status === 'overdue'
                        ? 'border-red-500 bg-red-50'
                        : item.severity === 'critical'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-semibold text-gray-900">{item.studentName}</p>
                          {item.status === 'overdue' && (
                            <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded uppercase">
                              OVERDUE
                            </span>
                          )}
                          {item.severity === 'critical' && item.status !== 'overdue' && (
                            <span className="px-2 py-0.5 bg-orange-600 text-white text-xs font-bold rounded uppercase">
                              URGENT
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{item.issueType}</p>
                        <p className="text-sm text-gray-500">Teacher: {item.teacher}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          item.daysRemaining < 0
                            ? 'text-red-600'
                            : item.daysRemaining < 7
                            ? 'text-orange-600'
                            : 'text-green-600'
                        }`}>
                          {item.daysRemaining < 0
                            ? `${Math.abs(item.daysRemaining)} days overdue`
                            : `${item.daysRemaining} days left`}
                        </p>
                        <p className="text-sm text-gray-500">Due: {item.dueDate.toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Teacher Performance */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Teacher Compliance Rates</h2>

              <div className="space-y-4">
                {teacherStats.map((teacher, index) => (
                  <div key={index} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <UserGroupIcon className="h-5 w-5 text-gray-400" />
                        <p className="font-semibold text-gray-900">{teacher.name}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          teacher.complianceRate >= 95
                            ? 'text-green-600'
                            : teacher.complianceRate >= 85
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}>
                          {teacher.complianceRate}%
                        </p>
                      </div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className={`h-2 rounded-full ${
                          teacher.complianceRate >= 95
                            ? 'bg-green-500'
                            : teacher.complianceRate >= 85
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${teacher.complianceRate}%` }}
                      />
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-600">
                        Total: <span className="font-medium">{teacher.totalIEPs}</span>
                      </span>
                      <span className="text-green-600">
                        Compliant: <span className="font-medium">{teacher.compliant}</span>
                      </span>
                      {teacher.atRisk > 0 && (
                        <span className="text-yellow-600">
                          At Risk: <span className="font-medium">{teacher.atRisk}</span>
                        </span>
                      )}
                      {teacher.overdue > 0 && (
                        <span className="text-red-600">
                          Overdue: <span className="font-medium">{teacher.overdue}</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Quick Actions & Alerts */}
          <div className="lg:col-span-1">
            {/* Alert Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BellAlertIcon className="h-5 w-5 text-blue-600" />
                Automated Alerts
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">60-day notice</span>
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">30-day notice</span>
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">7-day urgent alert</span>
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Overdue notifications</span>
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors">
                  View All Critical Issues
                </button>
                <button className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                  Generate State Report
                </button>
                <button className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                  Email Teachers
                </button>
                <button className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                  Schedule Training
                </button>
              </div>
            </div>

            {/* ROI Metrics */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-purple-900 mb-4">
                📊 This Month's Impact
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-purple-700 font-medium">Time Saved</p>
                  <p className="text-2xl font-bold text-purple-900">{overallStats.timeSavedThisMonth}</p>
                </div>
                <div>
                  <p className="text-purple-700 font-medium">Violations Prevented</p>
                  <p className="text-2xl font-bold text-purple-900">{overallStats.preventedViolations}</p>
                </div>
                <div>
                  <p className="text-purple-700 font-medium">Compliance Rate Improvement</p>
                  <p className="text-2xl font-bold text-purple-900">+6%</p>
                </div>
                <div className="pt-3 border-t border-purple-300">
                  <p className="text-xs text-purple-800">
                    💡 Present these metrics to your school board to demonstrate PathWise ROI
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
