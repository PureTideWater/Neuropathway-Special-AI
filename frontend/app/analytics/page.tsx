'use client';

/**
 * Analytics Dashboard
 * COMPETITIVE ADVANTAGE: Data-driven insights for teachers
 * MagicSchool doesn't have IEP-specific analytics
 */

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AnalyticsDashboardPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => setLoading(false), 1000);
  }, [timeRange]);

  // Mock analytics data
  const overviewStats = {
    totalIEPs: 34,
    activeStudents: 32,
    goalsOnTrack: 89, // percentage
    avgProgressRate: 12.5, // percentage points per month
    totalTimeSaved: '147h 30m',
    complianceScore: 98,
  };

  const progressTrendData = [
    { month: 'Aug', avgProgress: 8 },
    { month: 'Sep', avgProgress: 11 },
    { month: 'Oct', avgProgress: 15 },
    { month: 'Nov', avgProgress: 18 },
  ];

  const goalDomainData = [
    { domain: 'Reading', count: 28, onTrack: 25 },
    { domain: 'Math', count: 22, onTrack: 19 },
    { domain: 'Writing', count: 18, onTrack: 16 },
    { domain: 'Behavior', count: 12, onTrack: 11 },
    { domain: 'Social Skills', count: 8, onTrack: 8 },
  ];

  const complianceBreakdown = [
    { name: 'Fully Compliant', value: 30 },
    { name: 'Minor Issues', value: 3 },
    { name: 'Needs Review', value: 1 },
  ];

  const timeUsageData = [
    { task: 'IEP Creation (AI)', hours: 1.2 },
    { task: 'IEP Creation (Manual)', hours: 6.5 },
    { task: 'Progress Reports (AI)', hours: 0.5 },
    { task: 'Progress Reports (Manual)', hours: 2.0 },
    { task: 'Compliance Checks (AI)', hours: 0.3 },
    { task: 'Compliance Checks (Manual)', hours: 1.5 },
  ];

  const accommodationsEffectiveness = [
    { accommodation: 'Extended Time', effectiveness: 94, usageCount: 28 },
    { accommodation: 'Visual Supports', effectiveness: 89, usageCount: 22 },
    { accommodation: 'Small Group', effectiveness: 87, usageCount: 18 },
    { accommodation: 'Breaks', effectiveness: 85, usageCount: 15 },
    { accommodation: 'Preferential Seating', effectiveness: 82, usageCount: 20 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Data-driven insights for your IEP program
              </p>
            </div>

            {/* Time Range Selector */}
            <div className="flex gap-2">
              {['7d', '30d', '90d', '1y'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeRange === range
                      ? 'bg-sky-500 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {range === '7d' && 'Last 7 Days'}
                  {range === '30d' && 'Last 30 Days'}
                  {range === '90d' && 'Last 90 Days'}
                  {range === '1y' && 'Last Year'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total IEPs"
            value={overviewStats.totalIEPs}
            subtitle={`${overviewStats.activeStudents} active students`}
            icon="📋"
            trend="+3 this month"
          />
          <StatCard
            title="Goals On Track"
            value={`${overviewStats.goalsOnTrack}%`}
            subtitle="Across all students"
            icon="🎯"
            trend="+5% from last month"
            trendPositive
          />
          <StatCard
            title="Time Saved with AI"
            value={overviewStats.totalTimeSaved}
            subtitle="vs traditional methods"
            icon="⏱️"
            trend="147 hours saved"
            trendPositive
          />
          <StatCard
            title="Avg Progress Rate"
            value={`${overviewStats.avgProgressRate}%`}
            subtitle="Per month across goals"
            icon="📈"
            trend="+2.3% from baseline"
            trendPositive
          />
          <StatCard
            title="Compliance Score"
            value={`${overviewStats.complianceScore}%`}
            subtitle="State & federal compliance"
            icon="✅"
            trend="98/100 rating"
            trendPositive
          />
          <StatCard
            title="AI Template Usage"
            value="76%"
            subtitle="Of IEPs use smart templates"
            icon="🤖"
            trend="+12% adoption"
            trendPositive
          />
        </div>

        {/* Progress Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Progress Over Time */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Average Student Progress Over Time
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis label={{ value: 'Progress %', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="avgProgress"
                  stroke="#0ea5e9"
                  strokeWidth={3}
                  name="Average Progress %"
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-sm text-gray-500 mt-2">
              📊 Students showing consistent improvement trend
            </p>
          </div>

          {/* Compliance Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Compliance Status Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={complianceBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {complianceBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <p className="text-sm text-gray-500 mt-2">
              ✅ 88% fully compliant - above district average
            </p>
          </div>
        </div>

        {/* Goal Domain Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Goal Performance by Domain
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={goalDomainData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="domain" />
              <YAxis label={{ value: 'Number of Goals', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#94a3b8" name="Total Goals" />
              <Bar dataKey="onTrack" fill="#10b981" name="On Track" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
            {goalDomainData.map((domain) => (
              <div key={domain.domain} className="text-center">
                <p className="text-sm font-medium text-gray-700">{domain.domain}</p>
                <p className="text-2xl font-bold text-sky-600">
                  {Math.round((domain.onTrack / domain.count) * 100)}%
                </p>
                <p className="text-xs text-gray-500">success rate</p>
              </div>
            ))}
          </div>
        </div>

        {/* Time Savings Comparison */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Time Savings: AI vs Manual
            </h3>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
              82% time saved
            </span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={timeUsageData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" label={{ value: 'Hours', position: 'insideBottom', offset: -5 }} />
              <YAxis type="category" dataKey="task" width={150} />
              <Tooltip />
              <Bar dataKey="hours" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-sm text-gray-500 mt-4">
            💡 <strong>Insight:</strong> AI-powered features save an average of 5.2 hours per IEP
          </p>
        </div>

        {/* Accommodation Effectiveness */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Most Effective Accommodations
          </h3>
          <div className="space-y-4">
            {accommodationsEffectiveness.map((item, index) => (
              <div key={item.accommodation}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-medium text-gray-700">
                      {index + 1}. {item.accommodation}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({item.usageCount} students)
                    </span>
                  </div>
                  <span className="text-lg font-bold text-sky-600">
                    {item.effectiveness}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-sky-500 to-sky-600 h-2 rounded-full transition-all"
                    style={{ width: `${item.effectiveness}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            💡 <strong>Recommendation:</strong> Extended time showing highest effectiveness - consider expanding usage
          </p>
        </div>

        {/* AI Insights Panel */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-sm border border-purple-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🤖</span>
            <h3 className="text-lg font-semibold text-gray-900">AI-Powered Insights</h3>
          </div>

          <div className="space-y-3">
            <InsightCard
              type="success"
              message="Your IEPs are performing 23% better than district average"
              action="Share best practices with colleagues"
            />
            <InsightCard
              type="warning"
              message="3 students showing slower progress in math goals"
              action="Consider intensifying math interventions"
            />
            <InsightCard
              type="info"
              message="AI templates saved you 52 hours this month"
              action="Explore more template options"
            />
            <InsightCard
              type="success"
              message="100% compliance rate maintained for 3 months"
              action="Continue current practices"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendPositive = false,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  trend?: string;
  trendPositive?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-sm text-gray-500 mb-2">{subtitle}</p>
      {trend && (
        <p
          className={`text-xs font-medium ${
            trendPositive ? 'text-green-600' : 'text-gray-600'
          }`}
        >
          {trend}
        </p>
      )}
    </div>
  );
}

function InsightCard({
  type,
  message,
  action,
}: {
  type: 'success' | 'warning' | 'info';
  message: string;
  action: string;
}) {
  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const icons = {
    success: '✅',
    warning: '⚠️',
    info: '💡',
  };

  return (
    <div className={`${styles[type]} border rounded-lg p-4`}>
      <div className="flex items-start gap-3">
        <span className="text-xl">{icons[type]}</span>
        <div className="flex-1">
          <p className="font-medium">{message}</p>
          <p className="text-sm mt-1 opacity-80">→ {action}</p>
        </div>
      </div>
    </div>
  );
}
