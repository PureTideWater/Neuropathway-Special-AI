'use client';

/**
 * Progress Monitoring Dashboard
 * KILLER FEATURE: Real-time IEP goal tracking
 * MagicSchool has NOTHING like this
 */

import { use, useState, useEffect } from 'react';
import {
  ChartBarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function ProgressMonitoringPage({ params }: { params: Promise<{ studentId: string }> }) {
  const resolvedParams = use(params);
  const [progressData, setProgressData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch progress data
    fetch(`http://localhost:4002/api/progress/student/${resolvedParams.studentId}`)
      .then((res) => res.json())
      .then((data) => {
        setProgressData(data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load progress data:', err);
        setLoading(false);
      });
  }, [resolvedParams.studentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-16 h-16 border-4 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading progress data...</p>
        </div>
      </div>
    );
  }

  if (!progressData) {
    return <div>Error loading progress data</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{progressData.studentName}</h1>
              <p className="mt-1 text-gray-600">IEP Progress Monitoring Dashboard</p>
            </div>
            <button className="btn-primary">
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              Generate Meeting Report
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Goals</span>
              <ChartBarIcon className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{progressData.summary.totalGoals}</p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">On Track</span>
              <CheckCircleIcon className="h-5 w-5 text-success-600" />
            </div>
            <p className="text-3xl font-bold text-success-600">{progressData.summary.onTrack}</p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Needs Attention</span>
              <ExclamationTriangleIcon className="h-5 w-5 text-warning-600" />
            </div>
            <p className="text-3xl font-bold text-warning-600">{progressData.summary.needsAttention}</p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Overall Progress</span>
              <TrendingUpIcon className="h-5 w-5 text-primary-600" />
            </div>
            <p className="text-3xl font-bold text-primary-600">{progressData.summary.overallProgress.toFixed(1)}%</p>
          </div>
        </div>

        {/* AI Insights Banner */}
        {progressData.aiInsights && (
          <div className="card bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 mb-8">
            <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2" />
              AI-Powered Insights
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {progressData.aiInsights.map((insight: any, idx: number) => (
                <div key={idx} className="bg-white rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    {insight.type === 'positive_trend' && '📈 Positive Trend'}
                    {insight.type === 'intervention_suggestion' && '💡 Suggestion'}
                    {insight.type === 'accommodation_recommendation' && '🎯 Recommendation'}
                  </p>
                  <p className="text-sm text-gray-700">{insight.message}</p>
                  <p className="text-xs text-gray-500 mt-2">Confidence: {(insight.confidence * 100).toFixed(0)}%</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Goal Progress - Individual Goals */}
        {progressData.goalProgress.map((goal: any, idx: number) => (
          <div key={idx} className="card mb-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{goal.domain}</h3>
                <p className="text-gray-600 mt-1">{goal.goalText}</p>
              </div>
              <div className="flex items-center space-x-2">
                {goal.predictions.onTrack ? (
                  <>
                    <CheckCircleIcon className="h-6 w-6 text-success-600" />
                    <span className="badge-success">On Track</span>
                  </>
                ) : (
                  <>
                    <ExclamationTriangleIcon className="h-6 w-6 text-warning-600" />
                    <span className="badge-warning">Needs Attention</span>
                  </>
                )}
              </div>
            </div>

            {/* Progress Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Current Level</p>
                <p className="text-2xl font-bold text-primary-600">{goal.currentLevel}{typeof goal.currentLevel === 'number' && goal.currentLevel < 100 ? '%' : ''}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Target Level</p>
                <p className="text-2xl font-bold text-gray-900">{goal.targetLevel}{typeof goal.targetLevel === 'number' && goal.targetLevel < 100 ? '%' : ''}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Improvement</p>
                <p className="text-2xl font-bold text-success-600">+{goal.improvement}{typeof goal.improvement === 'number' && goal.improvement < 100 ? '%' : ''}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Projected Completion</p>
                <p className="text-lg font-medium text-gray-900">
                  {new Date(goal.predictions.projectedCompletion).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Progress Chart */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-4">Progress Over Time</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={goal.dataPoints}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    formatter={(value: any, name: any) => [value, name === 'value' ? 'Score' : name]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#0ea5e9"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#0ea5e9' }}
                    name="Progress"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Data Points Table */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Data Points</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 text-gray-600 font-medium">Date</th>
                      <th className="text-left py-2 px-3 text-gray-600 font-medium">Score</th>
                      <th className="text-left py-2 px-3 text-gray-600 font-medium">Source</th>
                      <th className="text-left py-2 px-3 text-gray-600 font-medium">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {goal.dataPoints.slice(-5).reverse().map((dp: any, dpIdx: number) => (
                      <tr key={dpIdx} className="border-b last:border-b-0">
                        <td className="py-2 px-3 text-gray-900">
                          {new Date(dp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="py-2 px-3 font-medium text-gray-900">{dp.value}{typeof dp.value === 'number' && dp.value < 100 ? '%' : ''}</td>
                        <td className="py-2 px-3">
                          <span className="badge-primary text-xs">
                            {dp.source.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-gray-600">{dp.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recommendations */}
            {goal.predictions.recommendedActions && (
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Recommended Next Steps</h4>
                <ul className="space-y-1">
                  {goal.predictions.recommendedActions.map((action: string, aIdx: number) => (
                    <li key={aIdx} className="text-sm text-blue-800 flex items-start">
                      <span className="mr-2">•</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Accommodation Effectiveness */}
            {goal.accommodationEffectiveness && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Accommodation Effectiveness</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {Object.entries(goal.accommodationEffectiveness).map(([accom, effectiveness]: [string, any]) => (
                    <div key={accom} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">{accom}</span>
                      <span className="text-sm font-medium text-success-600">
                        {(effectiveness * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Meeting Prep Section */}
        <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <h3 className="text-lg font-semibold text-green-900 mb-4">📋 IEP Meeting Readiness</h3>
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-sm text-green-700 mb-1">Data Points Collected</p>
              <p className="text-2xl font-bold text-green-900">{progressData.meetingReady.dataPoints}</p>
            </div>
            <div>
              <p className="text-sm text-green-700 mb-1">Graphs Available</p>
              <p className="text-2xl font-bold text-green-900">
                {progressData.meetingReady.graphsAvailable ? '✓ Yes' : '✗ No'}
              </p>
            </div>
            <div>
              <p className="text-sm text-green-700 mb-1">Evidence Quality</p>
              <p className="text-2xl font-bold text-green-900 capitalize">{progressData.meetingReady.evidenceQuality}</p>
            </div>
            <div>
              <button className="btn-primary w-full">
                <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                Export Report
              </button>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm font-medium text-gray-900 mb-2">Parent Summary (Plain Language)</p>
            <p className="text-sm text-gray-700">{progressData.meetingReady.parentSummary}</p>
          </div>
        </div>

        {/* Feature Highlight */}
        <div className="mt-8 card bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <h3 className="text-lg font-semibold text-purple-900 mb-3">
            🚀 Why This Beats MagicSchool
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium text-purple-900 mb-2">MagicSchool</p>
              <p className="text-purple-700">❌ No progress tracking</p>
              <p className="text-purple-700">❌ No data visualization</p>
              <p className="text-purple-700">❌ No IEP connection</p>
            </div>
            <div>
              <p className="font-medium text-blue-900 mb-2">Traditional Method</p>
              <p className="text-blue-700">❌ Manual data entry</p>
              <p className="text-blue-700">❌ Excel spreadsheets</p>
              <p className="text-blue-700">❌ Hours of prep</p>
            </div>
            <div>
              <p className="font-medium text-success-900 mb-2">PathWise</p>
              <p className="text-success-700">✅ Automatic tracking</p>
              <p className="text-success-700">✅ Real-time charts</p>
              <p className="text-success-700">✅ One-click reports</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
