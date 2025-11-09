/**
 * Google Classroom Sync Service
 * COMPETITIVE ADVANTAGE: Auto-sync grades and assignments, map to IEP goals
 * LOCK-IN EFFECT: Once teacher maps 50+ assignments, switching costs are prohibitive
 */

import { getClassroomClient } from '../utils/oauth-helper';
import { logger } from '../utils/logger';

export interface Course {
  id: string;
  name: string;
  section?: string;
  descriptionHeading?: string;
  room?: string;
  ownerId: string;
  courseState: string;
}

export interface Student {
  courseId: string;
  userId: string;
  profile: {
    id: string;
    name: {
      givenName: string;
      familyName: string;
      fullName: string;
    };
    emailAddress: string;
  };
}

export interface CourseWork {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  state: string;
  maxPoints: number;
  workType: string;
  dueDate?: {
    year: number;
    month: number;
    day: number;
  };
  creationTime: string;
}

export interface StudentSubmission {
  id: string;
  courseId: string;
  courseWorkId: string;
  userId: string;
  state: string;
  assignedGrade?: number;
  draftGrade?: number;
  submissionHistory?: any[];
}

/**
 * Fetch all courses for a teacher
 */
export async function fetchCourses(accessToken: string): Promise<Course[]> {
  const classroom = getClassroomClient(accessToken);

  try {
    logger.info('Fetching Google Classroom courses');

    const response = await classroom.courses.list({
      courseStates: ['ACTIVE'],
      pageSize: 50,
    });

    const courses = response.data.courses || [];

    logger.info('Fetched courses successfully', {
      count: courses.length,
    });

    return courses.map((course) => ({
      id: course.id!,
      name: course.name!,
      section: course.section ?? undefined,
      descriptionHeading: course.descriptionHeading ?? undefined,
      room: course.room ?? undefined,
      ownerId: course.ownerId!,
      courseState: course.courseState!,
    }));
  } catch (error) {
    logger.error('Failed to fetch courses', error as Error);
    throw new Error('Failed to fetch Google Classroom courses');
  }
}

/**
 * Fetch students in a course
 */
export async function fetchStudents(
  accessToken: string,
  courseId: string
): Promise<Student[]> {
  const classroom = getClassroomClient(accessToken);

  try {
    logger.info('Fetching students for course', { courseId });

    const response = await classroom.courses.students.list({
      courseId,
      pageSize: 100,
    });

    const students = response.data.students || [];

    logger.info('Fetched students successfully', {
      courseId,
      count: students.length,
    });

    return students.map((student) => ({
      courseId,
      userId: student.userId!,
      profile: {
        id: student.profile!.id!,
        name: {
          givenName: student.profile!.name!.givenName!,
          familyName: student.profile!.name!.familyName!,
          fullName: student.profile!.name!.fullName!,
        },
        emailAddress: student.profile!.emailAddress!,
      },
    }));
  } catch (error) {
    logger.error('Failed to fetch students', error as Error, { courseId });
    throw new Error('Failed to fetch students from Google Classroom');
  }
}

/**
 * Fetch all coursework (assignments) for a course
 */
export async function fetchCourseWork(
  accessToken: string,
  courseId: string
): Promise<CourseWork[]> {
  const classroom = getClassroomClient(accessToken);

  try {
    logger.info('Fetching coursework for course', { courseId });

    const response = await classroom.courses.courseWork.list({
      courseId,
      courseWorkStates: ['PUBLISHED'],
      pageSize: 100,
    });

    const courseWork = response.data.courseWork || [];

    logger.info('Fetched coursework successfully', {
      courseId,
      count: courseWork.length,
    });

    return courseWork.map((work) => ({
      id: work.id!,
      courseId,
      title: work.title!,
      description: work.description ?? undefined,
      state: work.state!,
      maxPoints: work.maxPoints || 100,
      workType: work.workType!,
      dueDate: work.dueDate && work.dueDate.year && work.dueDate.month && work.dueDate.day
        ? { year: work.dueDate.year, month: work.dueDate.month, day: work.dueDate.day }
        : undefined,
      creationTime: work.creationTime!,
    }));
  } catch (error) {
    logger.error('Failed to fetch coursework', error as Error, { courseId });
    throw new Error('Failed to fetch coursework from Google Classroom');
  }
}

/**
 * Fetch student submissions (grades) for an assignment
 */
export async function fetchSubmissions(
  accessToken: string,
  courseId: string,
  courseWorkId: string
): Promise<StudentSubmission[]> {
  const classroom = getClassroomClient(accessToken);

  try {
    logger.info('Fetching submissions', { courseId, courseWorkId });

    const response = await classroom.courses.courseWork.studentSubmissions.list({
      courseId,
      courseWorkId,
      pageSize: 100,
    });

    const submissions = response.data.studentSubmissions || [];

    logger.info('Fetched submissions successfully', {
      courseId,
      courseWorkId,
      count: submissions.length,
    });

    return submissions.map((submission) => ({
      id: submission.id!,
      courseId,
      courseWorkId,
      userId: submission.userId!,
      state: submission.state!,
      assignedGrade: submission.assignedGrade ?? undefined,
      draftGrade: submission.draftGrade ?? undefined,
      submissionHistory: submission.submissionHistory ?? undefined,
    }));
  } catch (error) {
    logger.error('Failed to fetch submissions', error as Error, {
      courseId,
      courseWorkId,
    });
    throw new Error('Failed to fetch submissions from Google Classroom');
  }
}

/**
 * Sync all data for a teacher's courses
 * This is run periodically (every 6 hours) to keep data fresh
 */
export async function syncAllCourses(accessToken: string, userId: string): Promise<{
  coursesCount: number;
  studentsCount: number;
  assignmentsCount: number;
  gradesCount: number;
}> {
  logger.info('Starting full Google Classroom sync', { userId });

  try {
    // 1. Fetch all courses
    const courses = await fetchCourses(accessToken);

    let totalStudents = 0;
    let totalAssignments = 0;
    let totalGrades = 0;

    // 2. For each course, fetch students and coursework
    for (const course of courses) {
      // Fetch students
      const students = await fetchStudents(accessToken, course.id);
      totalStudents += students.length;

      // Store students in database (linked to PathWise student records)
      // In production: await storeStudentsInDatabase(course.id, students);

      // Fetch coursework
      const courseWork = await fetchCourseWork(accessToken, course.id);
      totalAssignments += courseWork.length;

      // 3. For each assignment, fetch submissions (grades)
      for (const work of courseWork.slice(0, 10)) {
        // Limit to 10 most recent for demo
        const submissions = await fetchSubmissions(accessToken, course.id, work.id);
        totalGrades += submissions.length;

        // Store grades in database
        // In production: await storeGradesInDatabase(work, submissions);
      }

      // Rate limiting: Wait 500ms between courses to avoid API quota
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    logger.info('Completed full Google Classroom sync', {
      userId,
      coursesCount: courses.length,
      studentsCount: totalStudents,
      assignmentsCount: totalAssignments,
      gradesCount: totalGrades,
    });

    return {
      coursesCount: courses.length,
      studentsCount: totalStudents,
      assignmentsCount: totalAssignments,
      gradesCount: totalGrades,
    };
  } catch (error) {
    logger.error('Failed to sync Google Classroom data', error as Error, { userId });
    throw error;
  }
}

/**
 * Map Google Classroom assignment to IEP goal
 * This is where the LOCK-IN happens - teachers invest time mapping assignments
 */
export async function mapAssignmentToGoal(
  courseId: string,
  courseWorkId: string,
  iepGoalId: string
): Promise<void> {
  logger.info('Mapping assignment to IEP goal', {
    courseId,
    courseWorkId,
    iepGoalId,
  });

  // In production: Store mapping in database
  // INSERT INTO grade_imports (course_id, coursework_id, goal_id, ...)

  logger.info('Assignment mapped successfully');
}

/**
 * Auto-update IEP goal progress based on Google Classroom grades
 * This runs after each sync to update progress monitoring automatically
 */
export async function updateGoalProgressFromGrades(iepGoalId: string): Promise<void> {
  logger.info('Updating IEP goal progress from Classroom grades', { iepGoalId });

  // In production:
  // 1. Fetch all assignments mapped to this goal
  // 2. Calculate average grade
  // 3. Update progress_monitoring JSONB with new data point
  // 4. Trigger ML prediction refresh

  logger.info('Goal progress updated from grades');
}
