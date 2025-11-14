'use client';

/**
 * Google Classroom Integration Page
 * COMPETITIVE ADVANTAGE: Creates lock-in through assignment-to-IEP-goal mappings
 * BUSINESS VALUE: Once teacher maps 50+ assignments, switching costs are prohibitive
 */

import { useState, useEffect } from 'react';
import {
  LinkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface Integration {
  id: string;
  provider: string;
  isActive: boolean;
  connectedAt: Date;
  lastSyncAt?: Date;
  tokenStatus: 'valid' | 'expired' | 'unknown';
  mappingsCount: number;
}

interface Course {
  id: string;
  name: string;
  section?: string;
  room?: string;
}

interface Assignment {
  id: string;
  title: string;
  maxPoints: number;
  dueDate?: string;
  workType: string;
}

interface IEPGoal {
  id: string;
  domain: string;
  goalText: string;
  studentName: string;
}

export default function GoogleClassroomPage() {
  const [integration, setIntegration] = useState<Integration | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // For mapping UI
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<string>('');
  const [iepGoals, setIEPGoals] = useState<IEPGoal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<string>('');
  const [mappings, setMappings] = useState<any[]>([]);

  const userId = 'user-uuid-123'; // In production: get from session

  useEffect(() => {
    checkIntegrationStatus();
    loadIEPGoals();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadCourseAssignments(selectedCourse);
    }
  }, [selectedCourse]);

  const checkIntegrationStatus = async () => {
    setLoading(true);

    try {
      // In production: Check if user has Google Classroom connected
      // const response = await fetch(`/api/integrations/status?userId=${userId}&provider=google_classroom`);

      // Mock data for demonstration
      const mockIntegration: Integration = {
        id: 'integration-uuid-123',
        provider: 'google_classroom',
        isActive: false, // Start disconnected
        connectedAt: new Date(),
        tokenStatus: 'unknown',
        mappingsCount: 0,
      };

      setIntegration(mockIntegration);
    } catch (error) {
      console.error('Error checking integration status:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectGoogleClassroom = async () => {
    setConnecting(true);

    try {
      // Step 1: Get OAuth URL
      const response = await fetch(`/api/integrations/google-classroom/auth-url?userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        // Step 2: Redirect to Google OAuth
        window.location.href = data.data.authUrl;
      }
    } catch (error) {
      console.error('Error connecting Google Classroom:', error);
      setConnecting(false);
    }
  };

  const disconnectGoogleClassroom = async () => {
    if (!confirm('Are you sure you want to disconnect Google Classroom? Your assignment mappings will be lost.')) {
      return;
    }

    try {
      await fetch('/api/integrations/google-classroom/disconnect', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      setIntegration(null);
      setCourses([]);
      setMappings([]);
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  const syncNow = async () => {
    setSyncing(true);

    try {
      const response = await fetch('/api/integrations/google-classroom/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Synced successfully!\nCourses: ${data.data.coursesCount}\nAssignments: ${data.data.assignmentsCount}\nGrades: ${data.data.gradesCount}`);

        // Reload courses
        await loadCourses();
        await checkIntegrationStatus();
      }
    } catch (error) {
      console.error('Error syncing:', error);
    } finally {
      setSyncing(false);
    }
  };

  const loadCourses = async () => {
    try {
      const response = await fetch(`/api/integrations/google-classroom/courses?userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        setCourses(data.data.courses);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const loadCourseAssignments = async (courseId: string) => {
    try {
      const response = await fetch(
        `/api/integrations/google-classroom/courses/${courseId}/coursework?userId=${userId}`
      );
      const data = await response.json();

      if (data.success) {
        setAssignments(data.data.coursework);
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
    }
  };

  const loadIEPGoals = async () => {
    // Mock IEP goals for demonstration
    setIEPGoals([
      {
        id: 'goal-uuid-1',
        domain: 'Reading Comprehension',
        goalText: 'Student will improve reading comprehension from 45% to 80% accuracy',
        studentName: 'Johnny Doe',
      },
      {
        id: 'goal-uuid-2',
        domain: 'Math Problem Solving',
        goalText: 'Student will solve 2-step word problems with 70% accuracy',
        studentName: 'Sarah Smith',
      },
      {
        id: 'goal-uuid-3',
        domain: 'Written Expression',
        goalText: 'Student will write 5-sentence paragraphs with proper structure',
        studentName: 'Michael Johnson',
      },
    ]);
  };

  const createMapping = async () => {
    if (!selectedAssignment || !selectedGoal) {
      alert('Please select both an assignment and an IEP goal');
      return;
    }

    try {
      const response = await fetch('/api/integrations/google-classroom/map-assignment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: selectedCourse,
          courseWorkId: selectedAssignment,
          iepGoalId: selectedGoal,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const assignment = assignments.find((a) => a.id === selectedAssignment);
        const goal = iepGoals.find((g) => g.id === selectedGoal);

        setMappings([
          ...mappings,
          {
            id: Date.now().toString(),
            assignmentName: assignment?.title,
            goalDomain: goal?.domain,
            studentName: goal?.studentName,
            createdAt: new Date(),
          },
        ]);

        setSelectedAssignment('');
        setSelectedGoal('');

        alert('Mapping created! Grades will now auto-sync to IEP goal progress.');
      }
    } catch (error) {
      console.error('Error creating mapping:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="h-12 w-12 text-purple-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading integration status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <LinkIcon className="h-10 w-10" />
                <h1 className="text-3xl font-bold">Google Classroom Integration</h1>
              </div>
              <p className="text-blue-100">
                Auto-sync grades and map assignments to IEP goals • Save hours of manual data entry
              </p>
            </div>

            {integration?.isActive && (
              <div className="text-right">
                <div className="flex items-center gap-2 bg-green-500 rounded-lg px-4 py-2">
                  <CheckCircleIcon className="h-5 w-5" />
                  <span className="font-medium">Connected</span>
                </div>
                <p className="text-sm text-blue-100 mt-1">
                  {integration.mappingsCount} assignments mapped
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Connection Status */}
        {!integration || !integration.isActive ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <AcademicCapIcon className="h-8 w-8 text-blue-600" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Connect Your Google Classroom
              </h2>
              <p className="text-gray-600 mb-6">
                Automatically import grades from Google Classroom and map assignments to IEP goals.
                Save hours of manual data entry every week!
              </p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-semibold text-green-900 mb-2">✨ What You'll Get:</h3>
                <ul className="text-sm text-green-800 space-y-1 text-left">
                  <li>• Auto-import grades every 6 hours</li>
                  <li>• Map assignments to IEP goals (one-time setup)</li>
                  <li>• Real-time progress monitoring updates</li>
                  <li>• Eliminate manual grade entry</li>
                  <li>• Evidence-based goal progress tracking</li>
                </ul>
              </div>

              <button
                onClick={connectGoogleClassroom}
                disabled={connecting}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {connecting ? (
                  <>
                    <ArrowPathIcon className="h-5 w-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <LinkIcon className="h-5 w-5" />
                    Connect Google Classroom
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 mt-4">
                We only request read-only access to your courses, students, and grades. We never
                modify your Google Classroom data.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Connected - Show Tools */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Sync Status Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Sync Status</h3>
                  <ClockIcon className="h-6 w-6 text-gray-400" />
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Last Sync</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {integration.lastSyncAt
                        ? new Date(integration.lastSyncAt).toLocaleString()
                        : 'Never'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Next Scheduled Sync</p>
                    <p className="text-sm text-gray-900">In 4 hours (automatic)</p>
                  </div>

                  <button
                    onClick={syncNow}
                    disabled={syncing}
                    className="w-full mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {syncing ? (
                      <>
                        <ArrowPathIcon className="h-5 w-5 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <ArrowPathIcon className="h-5 w-5" />
                        Sync Now
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Mappings Stats Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Assignment Mappings</h3>
                  <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-4xl font-bold text-purple-600">{integration.mappingsCount || mappings.length}</p>
                    <p className="text-sm text-gray-600">Assignments mapped to IEP goals</p>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600">Time Investment</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {(integration.mappingsCount || mappings.length) * 5} minutes
                    </p>
                    <p className="text-xs text-gray-500">Estimated setup time saved with PathWise</p>
                  </div>
                </div>
              </div>

              {/* Lock-in Indicator Card */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-sm border-2 border-orange-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-orange-900">Integration Value</h3>
                  <ChartBarIcon className="h-6 w-6 text-orange-600" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-orange-800">Auto-sync enabled</span>
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-orange-800">Real-time updates</span>
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-orange-800">Evidence tracking</span>
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  </div>

                  <div className="pt-3 border-t border-orange-200 mt-3">
                    <p className="text-xs text-orange-800 font-medium">
                      ⏱️ You're saving approximately {(integration.mappingsCount || mappings.length) * 2} hours per month in manual data entry!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mapping Tool */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Create Assignment-to-IEP-Goal Mapping
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Course Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    1. Select Course
                  </label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => {
                      setSelectedCourse(e.target.value);
                      setSelectedAssignment('');
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Choose a course...</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name} {course.section && `(${course.section})`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Assignment Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    2. Select Assignment
                  </label>
                  <select
                    value={selectedAssignment}
                    onChange={(e) => setSelectedAssignment(e.target.value)}
                    disabled={!selectedCourse}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Choose an assignment...</option>
                    {assignments.map((assignment) => (
                      <option key={assignment.id} value={assignment.id}>
                        {assignment.title} ({assignment.maxPoints} pts)
                      </option>
                    ))}
                  </select>
                </div>

                {/* IEP Goal Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    3. Select IEP Goal
                  </label>
                  <select
                    value={selectedGoal}
                    onChange={(e) => setSelectedGoal(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Choose a goal...</option>
                    {iepGoals.map((goal) => (
                      <option key={goal.id} value={goal.id}>
                        {goal.studentName} - {goal.domain}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={createMapping}
                disabled={!selectedAssignment || !selectedGoal}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Create Mapping
              </button>
            </div>

            {/* Existing Mappings */}
            {mappings.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Your Assignment Mappings ({mappings.length})
                </h3>

                <div className="space-y-3">
                  {mappings.map((mapping) => (
                    <div
                      key={mapping.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{mapping.assignmentName}</p>
                        <p className="text-sm text-gray-600">
                          → {mapping.studentName}: {mapping.goalDomain}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        <span className="text-xs text-gray-500">
                          {new Date(mapping.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Disconnect Button */}
            <div className="mt-8 text-center">
              <button
                onClick={disconnectGoogleClassroom}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
              >
                Disconnect Google Classroom
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
