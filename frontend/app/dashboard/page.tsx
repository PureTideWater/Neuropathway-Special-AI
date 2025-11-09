'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChartBarIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  UsersIcon,
  ClockIcon,
  BellIcon,
  SparklesIcon,
  MicrophoneIcon,
  UserGroupIcon,
  CalendarIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const [userRole] = useState<'teacher' | 'admin' | 'parent' | 'student'>('teacher');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <SparklesIcon className="h-8 w-8 text-primary-600" />
                <h1 className="text-2xl font-bold text-gray-900 font-display">PathWise</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg hover:bg-gray-100 relative">
                <BellIcon className="h-6 w-6 text-gray-600" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-danger-500 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
                  SJ
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Sarah Johnson</p>
                  <p className="text-xs text-gray-500 capitalize">{userRole}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, Sarah!</h2>
          <p className="text-gray-600">Here's what's happening with your students today.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card hover:shadow-medium transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Students</p>
                <p className="text-3xl font-bold text-gray-900">24</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-lg">
                <UsersIcon className="h-8 w-8 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="card hover:shadow-medium transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active IEPs</p>
                <p className="text-3xl font-bold text-gray-900">18</p>
              </div>
              <div className="p-3 bg-secondary-100 rounded-lg">
                <DocumentTextIcon className="h-8 w-8 text-secondary-600" />
              </div>
            </div>
          </div>

          <div className="card hover:shadow-medium transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Upcoming Reviews</p>
                <p className="text-3xl font-bold text-gray-900">3</p>
              </div>
              <div className="p-3 bg-warning-100 rounded-lg">
                <ClockIcon className="h-8 w-8 text-warning-600" />
              </div>
            </div>
          </div>

          <div className="card hover:shadow-medium transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg Progress</p>
                <p className="text-3xl font-bold text-gray-900">78%</p>
              </div>
              <div className="p-3 bg-success-100 rounded-lg">
                <ChartBarIcon className="h-8 w-8 text-success-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href="/iep/create"
                  className="flex items-center p-4 border-2 border-primary-200 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-all group"
                >
                  <div className="p-2 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
                    <DocumentTextIcon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">Create IEP</p>
                    <p className="text-sm text-gray-500">Start a new IEP with AI</p>
                  </div>
                </Link>

                <Link
                  href="/observations"
                  className="flex items-center p-4 border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all group"
                >
                  <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <MicrophoneIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">Quick Observations</p>
                    <p className="text-sm text-gray-500">🎤 Voice-to-text notes</p>
                  </div>
                </Link>

                <Link
                  href="/meetings/prep/iep-123"
                  className="flex items-center p-4 border-2 border-indigo-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-all group"
                >
                  <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                    <CalendarIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">Meeting Prep</p>
                    <p className="text-sm text-gray-500">⚡ Ready in 30 seconds</p>
                  </div>
                </Link>

                <Link
                  href="/parents/student-123"
                  className="flex items-center p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all group"
                >
                  <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <UserGroupIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">Parent Portal</p>
                    <p className="text-sm text-gray-500">🛡️ Legal protection</p>
                  </div>
                </Link>

                <Link
                  href="/analytics"
                  className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all group"
                >
                  <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                    <ChartBarIcon className="h-6 w-6 text-gray-600" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">Analytics</p>
                    <p className="text-sm text-gray-500">View progress data</p>
                  </div>
                </Link>

                {userRole === 'admin' && (
                  <Link
                    href="/admin/compliance"
                    className="flex items-center p-4 border-2 border-red-200 rounded-lg hover:border-red-400 hover:bg-red-50 transition-all group"
                  >
                    <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                      <ShieldCheckIcon className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">Compliance</p>
                      <p className="text-sm text-gray-500">⚠️ District dashboard</p>
                    </div>
                  </Link>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {[
                  {
                    student: 'Emma Williams',
                    action: 'completed adaptive learning session',
                    time: '2 hours ago',
                    type: 'success',
                  },
                  {
                    student: 'Lucas Brown',
                    action: 'IEP review scheduled',
                    time: '4 hours ago',
                    type: 'info',
                  },
                  {
                    student: 'Sophia Martinez',
                    action: 'made progress on reading goal (85%)',
                    time: '1 day ago',
                    type: 'success',
                  },
                ].map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className={`w-2 h-2 mt-2 rounded-full ${activity.type === 'success' ? 'bg-success-500' : 'bg-primary-500'}`}></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{activity.student}</span> {activity.action}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Upcoming & Alerts */}
          <div className="space-y-6">
            {/* Upcoming Reviews */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Reviews</h3>
              <div className="space-y-3">
                {[
                  { student: 'Emma Williams', date: 'Feb 1, 2025', type: 'Annual Review' },
                  { student: 'Lucas Brown', date: 'Feb 15, 2025', type: 'Progress Review' },
                  { student: 'Noah Garcia', date: 'Mar 3, 2025', type: 'Annual Review' },
                ].map((review, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900 text-sm">{review.student}</p>
                    <p className="text-xs text-gray-600 mt-1">{review.type}</p>
                    <p className="text-xs text-primary-600 mt-1 font-medium">{review.date}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Suggestions */}
            <div className="card bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-200">
              <div className="flex items-center space-x-2 mb-4">
                <SparklesIcon className="h-5 w-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900">AI Suggestions</h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-sm text-gray-900 mb-2">
                    Emma's reading comprehension has improved 15% this month. Consider updating her goal targets.
                  </p>
                  <button className="text-xs font-medium text-primary-600 hover:text-primary-700">
                    Review Goal →
                  </button>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-sm text-gray-900 mb-2">
                    Lucas may benefit from kinesthetic learning activities based on recent session data.
                  </p>
                  <button className="text-xs font-medium text-primary-600 hover:text-primary-700">
                    See Recommendations →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
