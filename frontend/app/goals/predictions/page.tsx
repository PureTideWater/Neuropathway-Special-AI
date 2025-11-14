'use client';

/**
 * Goal Predictions Dashboard
 * COMPETITIVE ADVANTAGE: See all at-risk goals across all students
 * BUSINESS VALUE: Proactive intervention prevents IEP failures and lawsuits
 */

import { useState, useEffect } from 'react';
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  SparklesIcon,
  FunnelIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  UserIcon,
  CalendarIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import { GoalPredictionCard } from '@/app/components/GoalPredictionCard';

interface AtRiskGoal {
  goalId: string;
  studentName: string;
  goalDomain: string;
  targetDate: string;
  daysRemaining: number;
  confidence: number;
  predictedOutcome: string;
  teacherName: string;
}

export default function GoalPredictionsDashboard() {
  const [atRiskGoals, setAtRiskGoals] = useState<AtRiskGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'confidence' | 'days' | 'student'>('confidence');
  const [filterDomain, setFilterDomain] = useState<string>('all');

  useEffect(() => {
    fetchAtRiskGoals();
  }, []);

  const fetchAtRiskGoals = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/goals/predict/at-risk?threshold=70', {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAtRiskGoals(data.data.goals || []);
        }
      }
    } catch (error) {
      console.error('Error fetching at-risk goals:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sort goals
  const sortedGoals = [...atRiskGoals].sort((a, b) => {
    switch (sortBy) {
      case 'confidence':
        return b.confidence - a.confidence;
      case 'days':
        return a.daysRemaining - b.daysRemaining;
      case 'student':
        return a.studentName.localeCompare(b.studentName);
      default:
        return 0;
    }
  });

  // Filter by domain
  const filteredGoals =
    filterDomain === 'all'
      ? sortedGoals
      : sortedGoals.filter((g) => g.goalDomain === filterDomain);

  // Get unique domains for filter
  const domains = ['all', ...new Set(atRiskGoals.map((g) => g.goalDomain))];

  // Stats
  const totalAtRisk = atRiskGoals.length;
  const highConfidence = atRiskGoals.filter((g) => g.confidence >= 85).length;
  const urgentGoals = atRiskGoals.filter((g) => g.daysRemaining < 30).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <ExclamationTriangleIcon className="h-10 w-10" />
                <h1 className="text-3xl font-bold">At-Risk Goals Dashboard</h1>
              </div>
              <p className="text-red-100">
                AI-powered early warning system for IEP goals • Prevent failures before they happen
              </p>
            </div>

            <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
              <SparklesIcon className="h-5 w-5" />
              <span className="text-sm font-medium">ML Predictions v1.0</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-800">Total At-Risk Goals</p>
                <p className="text-4xl font-bold text-red-900 mt-2">{totalAtRisk}</p>
              </div>
              <ExclamationTriangleIcon className="h-12 w-12 text-red-400" />
            </div>
            <p className="text-xs text-red-700 mt-2">Require immediate attention</p>
          </div>

          <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-800">High Confidence</p>
                <p className="text-4xl font-bold text-orange-900 mt-2">{highConfidence}</p>
              </div>
              <SparklesIcon className="h-12 w-12 text-orange-400" />
            </div>
            <p className="text-xs text-orange-700 mt-2">85%+ prediction confidence</p>
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-800">Urgent (&#60;30 days)</p>
                <p className="text-4xl font-bold text-yellow-900 mt-2">{urgentGoals}</p>
              </div>
              <CalendarIcon className="h-12 w-12 text-yellow-400" />
            </div>
            <p className="text-xs text-yellow-700 mt-2">Less than 1 month to target</p>
          </div>
        </div>

        {/* Filters & Sort */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Domain Filter */}
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-5 w-5 text-gray-500" />
              <label className="text-sm font-medium text-gray-700">Filter by Domain:</label>
              <select
                value={filterDomain}
                onChange={(e) => setFilterDomain(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              >
                {domains.map((domain) => (
                  <option key={domain} value={domain}>
                    {domain === 'all' ? 'All Domains' : domain}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2 ml-auto">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSortBy('confidence')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    sortBy === 'confidence'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Confidence
                </button>
                <button
                  onClick={() => setSortBy('days')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    sortBy === 'days'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Days Left
                </button>
                <button
                  onClick={() => setSortBy('student')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    sortBy === 'student'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Student Name
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Goals List */}
        {loading ? (
          <div className="text-center py-12">
            <SparklesIcon className="h-16 w-16 text-purple-600 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600 font-medium">Loading predictions...</p>
          </div>
        ) : filteredGoals.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <p className="text-xl font-semibold text-gray-900">No At-Risk Goals Found!</p>
            <p className="text-gray-600 mt-2">
              {filterDomain === 'all'
                ? 'All students are on track to meet their IEP goals 🎉'
                : `No at-risk goals in ${filterDomain} domain`}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredGoals.map((goal) => (
              <div
                key={goal.goalId}
                className="bg-white rounded-xl shadow-sm border-2 border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Goal Header */}
                <div
                  className="p-6 cursor-pointer bg-gradient-to-r from-gray-50 to-white"
                  onClick={() =>
                    setSelectedGoal(selectedGoal === goal.goalId ? null : goal.goalId)
                  }
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <UserIcon className="h-5 w-5 text-purple-600" />
                        <h3 className="text-lg font-bold text-gray-900">{goal.studentName}</h3>
                        <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                          {goal.confidence.toFixed(1)}% confidence
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <AcademicCapIcon className="h-4 w-4" />
                          <span>{goal.goalDomain}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" />
                          <span>
                            Target: {new Date(goal.targetDate).toLocaleDateString()} ({goal.daysRemaining} days left)
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <UserIcon className="h-4 w-4" />
                          <span>Teacher: {goal.teacherName}</span>
                        </div>
                      </div>
                    </div>

                    <button className="text-gray-400 hover:text-gray-600">
                      {selectedGoal === goal.goalId ? (
                        <ArrowUpIcon className="h-5 w-5" />
                      ) : (
                        <ArrowDownIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Prediction Details */}
                {selectedGoal === goal.goalId && (
                  <div className="p-6 border-t border-gray-200 bg-gray-50">
                    <GoalPredictionCard
                      goalId={goal.goalId}
                      goalDomain={goal.goalDomain}
                      targetDate={new Date(goal.targetDate)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Help Text */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 How Predictions Work</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              • Our AI analyzes progress trends, attendance, accommodation usage, and intervention
              frequency
            </li>
            <li>• Predictions update weekly as new progress data is entered</li>
            <li>
              • High confidence (75%+) predictions should trigger immediate intervention planning
            </li>
            <li>• Early intervention can turn "at-risk" goals into successful outcomes</li>
            <li>• All predictions are logged for legal compliance and outcome tracking</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
