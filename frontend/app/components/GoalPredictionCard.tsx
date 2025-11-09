'use client';

/**
 * Goal Prediction Card Component
 * COMPETITIVE ADVANTAGE: Shows ML prediction with confidence and recommended actions
 * Reusable widget that can be embedded in IEP views, dashboards, reports
 */

import { useState, useEffect } from 'react';
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  SparklesIcon,
  ChartBarIcon,
  LightBulbIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

export interface GoalPredictionData {
  predicted_outcome: 'will_meet' | 'at_risk';
  confidence: number;
  days_until_target: number;
  current_progress_rate: number;
  required_progress_rate: number;
  factors: {
    positive: string[];
    negative: string[];
  };
  recommended_interventions: string[];
  prediction_date: Date;
}

interface GoalPredictionCardProps {
  goalId: string;
  goalDomain: string;
  targetDate: Date;
  onRefresh?: () => void;
}

export function GoalPredictionCard({
  goalId,
  goalDomain,
  targetDate,
  onRefresh,
}: GoalPredictionCardProps) {
  const [prediction, setPrediction] = useState<GoalPredictionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetchPrediction();
  }, [goalId]);

  const fetchPrediction = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/goals/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalId }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch prediction');
      }

      const data = await response.json();

      if (data.success) {
        setPrediction(data.data);
      } else {
        setError(data.error || 'Unknown error');
      }
    } catch (err) {
      console.error('Error fetching prediction:', err);
      setError('Failed to load prediction');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <SparklesIcon className="h-6 w-6 text-purple-600 animate-spin" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Progress Prediction</h3>
            <p className="text-sm text-gray-500">Analyzing progress data...</p>
          </div>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !prediction) {
    return (
      <div className="bg-red-50 rounded-lg border border-red-200 p-6">
        <div className="flex items-center gap-3">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
          <div>
            <h3 className="text-lg font-semibold text-red-900">Prediction Unavailable</h3>
            <p className="text-sm text-red-700">{error || 'Unable to load prediction'}</p>
          </div>
        </div>
        <button
          onClick={fetchPrediction}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  const isAtRisk = prediction.predicted_outcome === 'at_risk';
  const isHighConfidence = prediction.confidence >= 75;

  return (
    <div
      className={`rounded-lg border-2 p-6 transition-all ${
        isAtRisk
          ? 'bg-red-50 border-red-500'
          : 'bg-green-50 border-green-500'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {isAtRisk ? (
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
          ) : (
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-lg font-bold ${isAtRisk ? 'text-red-900' : 'text-green-900'}`}>
                {isAtRisk ? '⚠️ At Risk' : '✅ On Track'}
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                <SparklesIcon className="h-3 w-3" />
                AI Prediction
              </span>
            </div>
            <p className={`text-sm ${isAtRisk ? 'text-red-700' : 'text-green-700'}`}>
              {prediction.confidence.toFixed(1)}% confidence
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <ClockIcon className="h-4 w-4" />
            {prediction.days_until_target} days left
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Target: {new Date(targetDate).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Progress Rate Comparison */}
      <div className="bg-white/60 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <ChartBarIcon className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-semibold text-gray-900">Progress Rate Analysis</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-600">Current Rate</p>
            <p className="text-xl font-bold text-gray-900">
              {prediction.current_progress_rate.toFixed(1)}%
              <span className="text-sm text-gray-500 font-normal">/week</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Needed Rate</p>
            <p className={`text-xl font-bold ${
              prediction.current_progress_rate >= prediction.required_progress_rate
                ? 'text-green-600'
                : 'text-red-600'
            }`}>
              {prediction.required_progress_rate.toFixed(1)}%
              <span className="text-sm font-normal">/week</span>
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                isAtRisk ? 'bg-red-500' : 'bg-green-500'
              }`}
              style={{
                width: `${Math.min(100, (prediction.current_progress_rate / prediction.required_progress_rate) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Toggle Details */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-4 py-2 bg-white/60 hover:bg-white/80 rounded-lg transition-colors text-sm font-medium text-gray-700 mb-4"
      >
        {expanded ? '▼ Hide Details' : '▶ Show Detailed Analysis'}
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="space-y-4">
          {/* Positive Factors */}
          {prediction.factors.positive.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-green-900 mb-2">✅ Positive Factors</h4>
              <ul className="space-y-1">
                {prediction.factors.positive.map((factor, idx) => (
                  <li key={idx} className="text-sm text-green-800 flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">•</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Negative Factors */}
          {prediction.factors.negative.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-red-900 mb-2">⚠️ Areas of Concern</h4>
              <ul className="space-y-1">
                {prediction.factors.negative.map((factor, idx) => (
                  <li key={idx} className="text-sm text-red-800 flex items-start gap-2">
                    <span className="text-red-600 mt-0.5">•</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommended Interventions */}
          {prediction.recommended_interventions.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <LightBulbIcon className="h-5 w-5 text-blue-600" />
                <h4 className="text-sm font-semibold text-blue-900">Recommended Actions</h4>
              </div>
              <ul className="space-y-2">
                {prediction.recommended_interventions.map((intervention, idx) => (
                  <li key={idx} className="text-sm text-blue-900 flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">{idx + 1}.</span>
                    <span>{intervention}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 mt-4">
        {isAtRisk && (
          <button
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            onClick={() => alert('Schedule intervention meeting (feature coming soon)')}
          >
            Schedule Intervention Meeting
          </button>
        )}
        <button
          onClick={fetchPrediction}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
        >
          Refresh
        </button>
      </div>

      {/* Timestamp */}
      <p className="text-xs text-gray-500 mt-4 text-center">
        Prediction generated on {new Date(prediction.prediction_date).toLocaleString()}
      </p>
    </div>
  );
}
