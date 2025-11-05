-- PathWise Sample Data Seeder
-- This file contains sample data for development and testing

-- ============================================
-- DISTRICTS
-- ============================================
INSERT INTO districts (id, name, code, state, settings, compliance_config) VALUES
('00000000-0000-0000-0000-000000000001', 'Springfield School District', 'SPRINGFIELD-001', 'IL',
    '{"timezone": "America/Chicago", "academic_year": "2024-2025"}',
    '{"ferpa_mode": "strict", "parent_access": true, "audit_retention_days": 2555}'
),
('00000000-0000-0000-0000-000000000002', 'Riverside Unified', 'RIVERSIDE-002', 'CA',
    '{"timezone": "America/Los_Angeles", "academic_year": "2024-2025"}',
    '{"ferpa_mode": "strict", "parent_access": true, "audit_retention_days": 2555}'
);

-- ============================================
-- USERS
-- ============================================
INSERT INTO users (id, oauth_sub, email, first_name, last_name, role, district_id, preferences) VALUES
-- Teachers
('10000000-0000-0000-0000-000000000001', 'google-oauth|teacher1', 'sarah.johnson@springfield.edu', 'Sarah', 'Johnson', 'teacher', '00000000-0000-0000-0000-000000000001',
    '{"notifications": {"email": true, "sms": false}, "theme": "light", "language": "en"}'
),
('10000000-0000-0000-0000-000000000002', 'google-oauth|teacher2', 'michael.chen@riverside.edu', 'Michael', 'Chen', 'teacher', '00000000-0000-0000-0000-000000000002',
    '{"notifications": {"email": true, "sms": true}, "theme": "light", "language": "en"}'
),

-- Specialists
('10000000-0000-0000-0000-000000000003', 'google-oauth|specialist1', 'emily.davis@springfield.edu', 'Emily', 'Davis', 'specialist', '00000000-0000-0000-0000-000000000001',
    '{"notifications": {"email": true, "sms": false}, "theme": "light", "language": "en"}'
),

-- Admins
('10000000-0000-0000-0000-000000000004', 'google-oauth|admin1', 'admin@springfield.edu', 'Robert', 'Martinez', 'admin', '00000000-0000-0000-0000-000000000001',
    '{"notifications": {"email": true, "sms": true}, "theme": "dark", "language": "en"}'
),

-- Parents
('10000000-0000-0000-0000-000000000005', 'google-oauth|parent1', 'jennifer.williams@email.com', 'Jennifer', 'Williams', 'parent', '00000000-0000-0000-0000-000000000001',
    '{"notifications": {"email": true, "sms": true}, "theme": "light", "language": "en"}'
),
('10000000-0000-0000-0000-000000000006', 'google-oauth|parent2', 'david.brown@email.com', 'David', 'Brown', 'parent', '00000000-0000-0000-0000-000000000001',
    '{"notifications": {"email": true, "sms": true}, "theme": "light", "language": "es"}'
),

-- Students
('10000000-0000-0000-0000-000000000007', 'google-oauth|student1', 'emma.williams@student.edu', 'Emma', 'Williams', 'student', '00000000-0000-0000-0000-000000000001',
    '{"notifications": {"email": false, "sms": false}, "theme": "light", "language": "en"}'
),
('10000000-0000-0000-0000-000000000008', 'google-oauth|student2', 'lucas.brown@student.edu', 'Lucas', 'Brown', 'student', '00000000-0000-0000-0000-000000000001',
    '{"notifications": {"email": false, "sms": false}, "theme": "high_contrast", "language": "en"}'
);

-- ============================================
-- STUDENTS
-- ============================================
INSERT INTO students (id, user_id, student_id_number, date_of_birth, grade_level, district_id, demographics, profile_json, learning_preferences, cognitive_profile, sensory_profile, primary_teacher_id, guardian_ids) VALUES
('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000007', 'STU-2024-0001', '2014-05-15', '4th', '00000000-0000-0000-0000-000000000001',
    '{"gender": "female", "ethnicity": "caucasian", "primary_language": "English"}',
    '{"strengths": ["visual learning", "mathematics"], "challenges": ["reading comprehension", "attention span"]}',
    '{"preferred_modality": "visual", "pace": "moderate", "supports_needed": ["extended time", "frequent breaks"]}',
    '{"processing_speed": "below_average", "working_memory": "average", "attention": "needs_support"}',
    '{"visual": "typical", "auditory": "sensitive", "tactile": "typical"}',
    '10000000-0000-0000-0000-000000000001',
    ARRAY['10000000-0000-0000-0000-000000000005']::UUID[]
),
('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000008', 'STU-2024-0002', '2013-09-22', '5th', '00000000-0000-0000-0000-000000000001',
    '{"gender": "male", "ethnicity": "hispanic", "primary_language": "Spanish", "ell_status": true}',
    '{"strengths": ["hands-on learning", "science"], "challenges": ["written expression", "organization"]}',
    '{"preferred_modality": "kinesthetic", "pace": "slower", "supports_needed": ["visual aids", "translated materials", "step-by-step instructions"]}',
    '{"processing_speed": "below_average", "working_memory": "below_average", "attention": "needs_significant_support"}',
    '{"visual": "typical", "auditory": "typical", "tactile": "seeking"}',
    '10000000-0000-0000-0000-000000000001',
    ARRAY['10000000-0000-0000-0000-000000000006']::UUID[]
);

-- ============================================
-- IEPS
-- ============================================
INSERT INTO ieps (id, student_id, version, status, title, start_date, end_date, review_date, meeting_date, created_by, team_members, parent_consent, parent_consent_date) VALUES
('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 1, 'active',
    'IEP - Emma Williams - 2024-2025',
    '2024-09-01', '2025-08-31', '2025-02-01', '2024-08-15',
    '10000000-0000-0000-0000-000000000001',
    ARRAY['10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000005']::UUID[],
    true, '2024-08-16 10:30:00'
),
('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 1, 'active',
    'IEP - Lucas Brown - 2024-2025',
    '2024-09-01', '2025-08-31', '2025-02-01', '2024-08-20',
    '10000000-0000-0000-0000-000000000001',
    ARRAY['10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000006']::UUID[],
    true, '2024-08-21 14:00:00'
);

-- Update students with their IEP IDs
UPDATE students SET iep_id = '30000000-0000-0000-0000-000000000001' WHERE id = '20000000-0000-0000-0000-000000000001';
UPDATE students SET iep_id = '30000000-0000-0000-0000-000000000002' WHERE id = '20000000-0000-0000-0000-000000000002';

-- Update IEPs with structured data
UPDATE ieps SET
    goals = '[
        {
            "id": 1,
            "domain": "Reading",
            "goal": "Emma will improve reading comprehension skills",
            "baseline": "Currently reads at 2nd grade level",
            "target": "Will read and comprehend at 3rd grade level with 80% accuracy",
            "timeline": "By June 2025"
        },
        {
            "id": 2,
            "domain": "Attention/Focus",
            "goal": "Emma will increase sustained attention during independent work",
            "baseline": "Can focus for 5-7 minutes",
            "target": "Will sustain attention for 15-20 minutes with minimal redirects",
            "timeline": "By June 2025"
        }
    ]'::jsonb,
    accommodations_json = '{
        "testing": ["Extended time (1.5x)", "Quiet setting", "Frequent breaks"],
        "classroom": ["Preferential seating", "Visual schedules", "Chunked assignments"],
        "materials": ["Audio books", "Highlighted texts", "Graphic organizers"]
    }'::jsonb,
    services = '[
        {"service": "Resource Room", "frequency": "5x week", "duration": "30 min"},
        {"service": "Speech Therapy", "frequency": "2x week", "duration": "30 min"}
    ]'::jsonb
WHERE id = '30000000-0000-0000-0000-000000000001';

UPDATE ieps SET
    goals = '[
        {
            "id": 1,
            "domain": "Written Expression",
            "goal": "Lucas will improve written expression skills",
            "baseline": "Writes 1-2 simple sentences with errors",
            "target": "Will write a 5-sentence paragraph with proper structure and minimal errors",
            "timeline": "By June 2025"
        },
        {
            "id": 2,
            "domain": "Organization",
            "goal": "Lucas will demonstrate organizational skills",
            "baseline": "Rarely completes multi-step assignments",
            "target": "Will use visual checklist to complete 80% of multi-step tasks",
            "timeline": "By June 2025"
        }
    ]'::jsonb,
    accommodations_json = '{
        "testing": ["Extended time (2x)", "Test read aloud", "Answers dictated to scribe"],
        "classroom": ["Visual task lists", "Frequent check-ins", "Reduced written output"],
        "materials": ["Bilingual materials", "Simplified instructions", "Visual supports"],
        "language": ["ESL support", "Translation services for parent communication"]
    }'::jsonb,
    services = '[
        {"service": "Resource Room", "frequency": "Daily", "duration": "45 min"},
        {"service": "ESL Support", "frequency": "3x week", "duration": "30 min"},
        {"service": "Occupational Therapy", "frequency": "1x week", "duration": "30 min"}
    ]'::jsonb
WHERE id = '30000000-0000-0000-0000-000000000002';

-- ============================================
-- IEP GOALS (detailed)
-- ============================================
INSERT INTO iep_goals (iep_id, goal_number, domain, goal_text, baseline_data, target_criteria, measurement_method, timeline, current_progress, status) VALUES
('30000000-0000-0000-0000-000000000001', 1, 'Reading Comprehension',
    'Emma will improve reading comprehension skills by answering literal and inferential questions about grade-level texts.',
    'Currently reads at 2nd grade level with 45% comprehension accuracy on grade-level materials',
    'Will read and comprehend 3rd grade level texts with 80% accuracy on comprehension questions',
    'Running records, comprehension assessments, teacher observations',
    '12 months (September 2024 - August 2025)',
    35.5, 'active'
),
('30000000-0000-0000-0000-000000000001', 2, 'Attention/Focus',
    'Emma will increase sustained attention during independent work tasks.',
    'Can focus for 5-7 minutes on independent tasks before requiring redirection',
    'Will sustain attention for 15-20 minutes on independent tasks with no more than 1-2 redirects',
    'Teacher observation logs, time-on-task data collection',
    '12 months (September 2024 - August 2025)',
    42.0, 'active'
),
('30000000-0000-0000-0000-000000000002', 1, 'Written Expression',
    'Lucas will improve written expression skills by writing organized, multi-sentence paragraphs.',
    'Currently writes 1-2 simple sentences with multiple spelling and grammar errors',
    'Will write a 5-sentence paragraph with topic sentence, supporting details, and conclusion with 80% accuracy',
    'Writing samples, rubric assessments, quarterly evaluations',
    '12 months (September 2024 - August 2025)',
    28.0, 'active'
),
('30000000-0000-0000-0000-000000000002', 2, 'Organization',
    'Lucas will demonstrate organizational skills by using visual supports to complete multi-step assignments.',
    'Rarely completes multi-step assignments independently (less than 20% completion rate)',
    'Will use visual checklist to independently complete 80% of multi-step tasks',
    'Task completion data, checklist monitoring, teacher records',
    '12 months (September 2024 - August 2025)',
    55.0, 'active'
);

-- ============================================
-- CONTENT LIBRARY
-- ============================================
INSERT INTO content_library (id, title, description, subject, grade_level, content_type, format, difficulty_level, tags, learning_objectives, accessibility_features, created_by, district_id, is_public) VALUES
('40000000-0000-0000-0000-000000000001', 'Reading Comprehension - Main Idea',
    'Interactive lesson on identifying the main idea in short passages',
    'Reading', '3rd-4th', 'lesson', 'interactive', 'intermediate',
    ARRAY['reading', 'comprehension', 'main idea', 'elementary'],
    '["Identify main idea in a paragraph", "Distinguish main idea from supporting details", "Summarize key points"]'::jsonb,
    '{"text_to_speech": true, "adjustable_font_size": true, "high_contrast": true, "audio_support": true}'::jsonb,
    '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', false
),
('40000000-0000-0000-0000-000000000002', 'Math Facts Practice - Addition',
    'Adaptive math facts practice with immediate feedback',
    'Mathematics', '3rd-5th', 'activity', 'interactive', 'adaptive',
    ARRAY['math', 'addition', 'fluency', 'practice'],
    '["Master single-digit addition", "Improve math fact fluency", "Build confidence with numbers"]'::jsonb,
    '{"text_to_speech": true, "visual_supports": true, "adjustable_difficulty": true}'::jsonb,
    '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', false
),
('40000000-0000-0000-0000-000000000003', 'Writing Workshop - Paragraph Structure',
    'Step-by-step guide to writing a structured paragraph',
    'Writing', '4th-6th', 'lesson', 'video', 'intermediate',
    ARRAY['writing', 'paragraph', 'structure', 'organization'],
    '["Understand paragraph structure", "Write topic sentences", "Add supporting details", "Write concluding sentences"]'::jsonb,
    '{"captions": true, "transcript": true, "bilingual_support": true, "visual_organizers": true}'::jsonb,
    '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', false
);

-- ============================================
-- SESSIONS (Learning Sessions)
-- ============================================
INSERT INTO sessions (id, student_id, lesson_id, session_type, start_time, end_time, duration_seconds, metrics_json, engagement_score, accuracy_score, completion_status) VALUES
('50000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'adaptive_learning',
    '2024-11-01 10:00:00', '2024-11-01 10:22:00', 1320,
    '{"questions_attempted": 12, "questions_correct": 8, "hints_used": 3, "time_per_question_avg": 110}'::jsonb,
    78.5, 66.7, 'completed'
),
('50000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'adaptive_learning',
    '2024-11-02 10:00:00', '2024-11-02 10:25:00', 1500,
    '{"questions_attempted": 15, "questions_correct": 12, "hints_used": 2, "time_per_question_avg": 100}'::jsonb,
    85.0, 80.0, 'completed'
),
('50000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000003', 'adaptive_learning',
    '2024-11-01 13:00:00', '2024-11-01 13:18:00', 1080,
    '{"paragraphs_written": 1, "words_written": 45, "grammar_errors": 8, "revisions_made": 3}'::jsonb,
    72.0, 55.0, 'completed'
),
('50000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', 'practice',
    '2024-11-03 09:30:00', '2024-11-03 09:42:00', 720,
    '{"problems_attempted": 20, "problems_correct": 14, "time_per_problem_avg": 36}'::jsonb,
    88.0, 70.0, 'completed'
);

COMMENT ON TABLE districts IS 'Sample districts for development';
COMMENT ON TABLE users IS 'Sample users across all roles';
COMMENT ON TABLE students IS 'Sample student profiles with diverse needs';
