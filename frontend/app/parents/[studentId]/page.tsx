'use client';

/**
 * Parent Communication Portal
 * COMPETITIVE ADVANTAGE: Legal protection through timestamped communications
 *
 * Key Features:
 * - 24/7 access to student progress
 * - Automatic notification acknowledgments (legal protection!)
 * - Multilingual support (huge for ESL families)
 * - Two-way messaging with teachers
 * - Upcoming meeting calendar
 */

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  BellIcon,
  CheckCircleIcon,
  ChartBarIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';

interface ProgressUpdate {
  id: string;
  date: Date;
  goalName: string;
  progress: number;
  teacherNote: string;
  acknowledged: boolean;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  requiresAcknowledgment: boolean;
  acknowledged: boolean;
  priority: 'high' | 'medium' | 'low';
}

export default function ParentPortalPage() {
  const params = useParams();
  const studentId = params.studentId as string;

  const [language, setLanguage] = useState('English');
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'IEP Annual Review Scheduled',
      message: 'Your child\'s annual IEP review is scheduled for December 15, 2024 at 2:00 PM. Please confirm your attendance.',
      timestamp: new Date('2024-11-08'),
      requiresAcknowledgment: true,
      acknowledged: false,
      priority: 'high',
    },
    {
      id: '2',
      title: 'Progress Report Available',
      message: 'Quarter 1 progress report is now available for review.',
      timestamp: new Date('2024-11-05'),
      requiresAcknowledgment: true,
      acknowledged: true,
      priority: 'medium',
    },
    {
      id: '3',
      title: 'Great Progress This Week!',
      message: 'Johnny showed excellent improvement in reading comprehension this week.',
      timestamp: new Date('2024-11-01'),
      requiresAcknowledgment: false,
      acknowledged: false,
      priority: 'low',
    },
  ]);

  const [progressUpdates] = useState<ProgressUpdate[]>([
    {
      id: '1',
      date: new Date('2024-11-08'),
      goalName: 'Reading Comprehension',
      progress: 75,
      teacherNote: 'Johnny is making excellent progress. He can now answer 3 out of 4 comprehension questions correctly.',
      acknowledged: true,
    },
    {
      id: '2',
      date: new Date('2024-11-01'),
      goalName: 'Math Problem Solving',
      progress: 60,
      teacherNote: 'Steady progress. Continues to improve with word problems when given visual supports.',
      acknowledged: true,
    },
    {
      id: '3',
      date: new Date('2024-10-25'),
      goalName: 'Social Skills',
      progress: 85,
      teacherNote: 'Outstanding! Johnny is initiating conversations with peers more frequently.',
      acknowledged: true,
    },
  ]);

  const acknowledgeNotification = (notificationId: string) => {
    setNotifications(notifications.map(n =>
      n.id === notificationId ? { ...n, acknowledged: true } : n
    ));

    // In real app: POST to backend to timestamp acknowledgment for legal compliance
    console.log(`Notification ${notificationId} acknowledged at ${new Date().toISOString()}`);
  };

  const unacknowledgedCount = notifications.filter(n =>
    n.requiresAcknowledgment && !n.acknowledged
  ).length;

  const studentName = 'Johnny Doe'; // In real app: fetch from API

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{studentName}'s Progress Portal</h1>
              <p className="mt-2 text-blue-100">
                Welcome! Stay connected with your child's educational journey
              </p>
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-transparent text-white font-medium cursor-pointer focus:outline-none"
                >
                  <option value="English" className="text-gray-900">🇺🇸 English</option>
                  <option value="Spanish" className="text-gray-900">🇪🇸 Español</option>
                  <option value="French" className="text-gray-900">🇫🇷 Français</option>
                  <option value="Chinese" className="text-gray-900">🇨🇳 中文</option>
                </select>
              </div>

              {unacknowledgedCount > 0 && (
                <div className="relative">
                  <BellIcon className="h-8 w-8" />
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
                    {unacknowledgedCount}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Goals</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">8</p>
              </div>
              <DocumentTextIcon className="h-12 w-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Progress</p>
                <p className="text-3xl font-bold text-green-600 mt-1">73%</p>
              </div>
              <ChartBarIcon className="h-12 w-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Next Meeting</p>
                <p className="text-lg font-bold text-gray-900 mt-1">Dec 15</p>
              </div>
              <CalendarIcon className="h-12 w-12 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Messages</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">3</p>
              </div>
              <ChatBubbleLeftRightIcon className="h-12 w-12 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Notifications Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Important Notifications</h2>
                {unacknowledgedCount > 0 && (
                  <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                    {unacknowledgedCount} need attention
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border ${
                      notification.priority === 'high'
                        ? 'border-red-200 bg-red-50'
                        : notification.priority === 'medium'
                        ? 'border-yellow-200 bg-yellow-50'
                        : 'border-blue-200 bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                          {notification.priority === 'high' && (
                            <span className="px-2 py-0.5 bg-red-200 text-red-800 text-xs font-medium rounded">
                              URGENT
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
                        <p className="text-xs text-gray-500">
                          {notification.timestamp.toLocaleDateString()}
                        </p>
                      </div>

                      {notification.requiresAcknowledgment && (
                        <div>
                          {notification.acknowledged ? (
                            <div className="flex items-center gap-1 text-green-600 text-sm">
                              <CheckCircleIcon className="h-5 w-5" />
                              <span>Acknowledged</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => acknowledgeNotification(notification.id)}
                              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Acknowledge
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Legal Protection Notice */}
              <div className="mt-6 p-4 bg-gray-100 rounded-lg border border-gray-300">
                <div className="flex items-start gap-2">
                  <ShieldCheckIcon className="h-5 w-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Legal Protection</p>
                    <p className="text-xs text-gray-600 mt-1">
                      All acknowledgments are timestamped and legally recorded for your protection.
                      Acknowledgment timestamp: {new Date().toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Updates */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Progress Updates</h2>

              <div className="space-y-6">
                {progressUpdates.map((update) => (
                  <div key={update.id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{update.goalName}</h3>
                      <span className="text-sm text-gray-500">{update.date.toLocaleDateString()}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-semibold text-blue-600">{update.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all"
                          style={{ width: `${update.progress}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                      <span className="font-medium">Teacher's Note:</span> {update.teacherNote}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                  Message Teacher
                </button>
                <button className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                  View Full IEP
                </button>
                <button className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                  Schedule Meeting
                </button>
                <button className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                  Download Reports
                </button>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Upcoming Events</h3>
              <div className="space-y-3">
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <CalendarIcon className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-semibold text-purple-900">Annual IEP Review</span>
                  </div>
                  <p className="text-xs text-purple-700">December 15, 2024 @ 2:00 PM</p>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <CalendarIcon className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-900">Progress Check-In</span>
                  </div>
                  <p className="text-xs text-blue-700">January 10, 2025 @ 3:30 PM</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-indigo-900 mb-4">Need Help?</h3>
              <div className="space-y-2 text-sm text-indigo-800">
                <p><span className="font-medium">Teacher:</span> Ms. Sarah Johnson</p>
                <p><span className="font-medium">Email:</span> s.johnson@school.edu</p>
                <p><span className="font-medium">Phone:</span> (555) 123-4567</p>
                <p className="text-xs text-indigo-600 mt-3">
                  Available Mon-Fri, 8:00 AM - 4:00 PM
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
