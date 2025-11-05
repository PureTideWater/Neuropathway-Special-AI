-- PathWise Database Schema
-- Version: 1.0.0
-- Description: Initial schema for PathWise IEP Copilot and Adaptive Learning Platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    oauth_sub VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('teacher', 'admin', 'parent', 'student', 'specialist')),
    district_id UUID,
    phone_number VARCHAR(20),
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_district_id ON users(district_id);
CREATE INDEX idx_users_oauth_sub ON users(oauth_sub);

-- ============================================
-- DISTRICTS TABLE
-- ============================================
CREATE TABLE districts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    state VARCHAR(2) NOT NULL,
    settings JSONB DEFAULT '{}',
    compliance_config JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_districts_code ON districts(code);
CREATE INDEX idx_districts_state ON districts(state);

-- Add foreign key for users.district_id
ALTER TABLE users ADD CONSTRAINT fk_users_district
    FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE SET NULL;

-- ============================================
-- STUDENTS TABLE
-- ============================================
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    student_id_number VARCHAR(50) UNIQUE NOT NULL,
    date_of_birth DATE NOT NULL,
    grade_level VARCHAR(20),
    district_id UUID REFERENCES districts(id) ON DELETE CASCADE,
    demographics JSONB DEFAULT '{}',
    profile_json JSONB DEFAULT '{}',
    learning_preferences JSONB DEFAULT '{}',
    cognitive_profile JSONB DEFAULT '{}',
    sensory_profile JSONB DEFAULT '{}',
    iep_id UUID,
    primary_teacher_id UUID REFERENCES users(id),
    guardian_ids UUID[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_district_id ON students(district_id);
CREATE INDEX idx_students_iep_id ON students(iep_id);
CREATE INDEX idx_students_primary_teacher ON students(primary_teacher_id);
CREATE INDEX idx_students_student_id_number ON students(student_id_number);

-- ============================================
-- IEPS (Individualized Education Plans) TABLE
-- ============================================
CREATE TABLE ieps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    version INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'approved', 'active', 'archived', 'expired')),
    title VARCHAR(255),
    goal_text TEXT,
    goals JSONB DEFAULT '[]',
    accommodations_json JSONB DEFAULT '{}',
    modifications JSONB DEFAULT '{}',
    services JSONB DEFAULT '[]',
    related_services JSONB DEFAULT '[]',
    assessment_data JSONB DEFAULT '{}',
    start_date DATE,
    end_date DATE,
    review_date DATE,
    meeting_date DATE,
    team_members UUID[],
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    parent_consent BOOLEAN DEFAULT false,
    parent_consent_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    attachments JSONB DEFAULT '[]',
    compliance_checklist JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT valid_dates CHECK (end_date >= start_date),
    CONSTRAINT unique_student_version UNIQUE (student_id, version)
);

CREATE INDEX idx_ieps_student_id ON ieps(student_id);
CREATE INDEX idx_ieps_status ON ieps(status);
CREATE INDEX idx_ieps_created_by ON ieps(created_by);
CREATE INDEX idx_ieps_start_date ON ieps(start_date);
CREATE INDEX idx_ieps_end_date ON ieps(end_date);
CREATE INDEX idx_ieps_version ON ieps(student_id, version);

-- Add foreign key for students.iep_id (current active IEP)
ALTER TABLE students ADD CONSTRAINT fk_students_iep
    FOREIGN KEY (iep_id) REFERENCES ieps(id) ON DELETE SET NULL;

-- ============================================
-- CONTENT LIBRARY TABLE
-- ============================================
CREATE TABLE content_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject VARCHAR(100) NOT NULL,
    grade_level VARCHAR(20),
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('lesson', 'activity', 'assessment', 'resource', 'video', 'audio', 'document', 'interactive')),
    format VARCHAR(50) NOT NULL,
    difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'adaptive')),
    metadata_json JSONB DEFAULT '{}',
    tags TEXT[],
    learning_objectives JSONB DEFAULT '[]',
    accessibility_features JSONB DEFAULT '{}',
    s3_uri TEXT,
    thumbnail_url TEXT,
    duration_minutes INTEGER,
    created_by UUID REFERENCES users(id),
    district_id UUID REFERENCES districts(id),
    is_public BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    view_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_content_subject ON content_library(subject);
CREATE INDEX idx_content_grade ON content_library(grade_level);
CREATE INDEX idx_content_type ON content_library(content_type);
CREATE INDEX idx_content_created_by ON content_library(created_by);
CREATE INDEX idx_content_district ON content_library(district_id);
CREATE INDEX idx_content_tags ON content_library USING GIN(tags);

-- ============================================
-- SESSIONS TABLE (Learning/Adaptive Sessions)
-- ============================================
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES content_library(id) ON DELETE SET NULL,
    session_type VARCHAR(50) NOT NULL CHECK (session_type IN ('adaptive_learning', 'assessment', 'practice', 'review')),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    metrics_json JSONB DEFAULT '{}',
    engagement_score DECIMAL(5,2),
    accuracy_score DECIMAL(5,2),
    completion_status VARCHAR(50) DEFAULT 'in_progress' CHECK (completion_status IN ('in_progress', 'completed', 'abandoned', 'interrupted')),
    content_delivered JSONB DEFAULT '[]',
    student_responses JSONB DEFAULT '[]',
    ai_adaptations JSONB DEFAULT '[]',
    teacher_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sessions_student_id ON sessions(student_id);
CREATE INDEX idx_sessions_lesson_id ON sessions(lesson_id);
CREATE INDEX idx_sessions_start_time ON sessions(start_time);
CREATE INDEX idx_sessions_session_type ON sessions(session_type);
CREATE INDEX idx_sessions_completion_status ON sessions(completion_status);

-- ============================================
-- AI AUDIT TABLE (FERPA Compliance)
-- ============================================
CREATE TABLE ai_audit (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    student_id UUID REFERENCES students(id) ON DELETE SET NULL,
    service_name VARCHAR(100) NOT NULL,
    operation_type VARCHAR(100) NOT NULL,
    prompt TEXT,
    prompt_hash VARCHAR(64),
    response_text TEXT,
    response_hash VARCHAR(64),
    model_used VARCHAR(100),
    tokens_used INTEGER,
    latency_ms INTEGER,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    CONSTRAINT valid_hashes CHECK (
        prompt_hash IS NULL OR length(prompt_hash) = 64
    )
);

CREATE INDEX idx_ai_audit_user_id ON ai_audit(user_id);
CREATE INDEX idx_ai_audit_student_id ON ai_audit(student_id);
CREATE INDEX idx_ai_audit_timestamp ON ai_audit(timestamp);
CREATE INDEX idx_ai_audit_service ON ai_audit(service_name);
CREATE INDEX idx_ai_audit_operation ON ai_audit(operation_type);

-- ============================================
-- IEP GOALS TABLE
-- ============================================
CREATE TABLE iep_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    iep_id UUID NOT NULL REFERENCES ieps(id) ON DELETE CASCADE,
    goal_number INTEGER NOT NULL,
    domain VARCHAR(100) NOT NULL,
    goal_text TEXT NOT NULL,
    baseline_data TEXT,
    target_criteria TEXT,
    measurement_method VARCHAR(255),
    timeline VARCHAR(100),
    progress_monitoring JSONB DEFAULT '[]',
    current_progress DECIMAL(5,2),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'achieved', 'discontinued', 'modified')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT unique_iep_goal_number UNIQUE (iep_id, goal_number)
);

CREATE INDEX idx_iep_goals_iep_id ON iep_goals(iep_id);
CREATE INDEX idx_iep_goals_domain ON iep_goals(domain);
CREATE INDEX idx_iep_goals_status ON iep_goals(status);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    channel VARCHAR(50) CHECK (channel IN ('in_app', 'email', 'sms', 'push')),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_type ON notifications(type);

-- ============================================
-- AUDIT LOG TABLE (System-wide audit trail)
-- ============================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,
    changes JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_districts_updated_at BEFORE UPDATE ON districts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ieps_updated_at BEFORE UPDATE ON ieps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_library_updated_at BEFORE UPDATE ON content_library
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_iep_goals_updated_at BEFORE UPDATE ON iep_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- Active IEPs with student information
CREATE VIEW active_ieps_with_students AS
SELECT
    i.id as iep_id,
    i.version,
    i.status,
    i.start_date,
    i.end_date,
    s.id as student_id,
    s.student_id_number,
    u.first_name,
    u.last_name,
    s.grade_level,
    i.goals,
    i.accommodations_json
FROM ieps i
JOIN students s ON i.student_id = s.id
JOIN users u ON s.user_id = u.id
WHERE i.is_active = true AND i.status IN ('active', 'approved');

-- Student performance summary
CREATE VIEW student_performance_summary AS
SELECT
    s.id as student_id,
    s.student_id_number,
    COUNT(DISTINCT ses.id) as total_sessions,
    AVG(ses.engagement_score) as avg_engagement,
    AVG(ses.accuracy_score) as avg_accuracy,
    COUNT(DISTINCT ses.id) FILTER (WHERE ses.completion_status = 'completed') as completed_sessions
FROM students s
LEFT JOIN sessions ses ON s.id = ses.student_id
GROUP BY s.id, s.student_id_number;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- JSONB indexes for common queries
CREATE INDEX idx_students_profile ON students USING GIN(profile_json);
CREATE INDEX idx_ieps_goals ON ieps USING GIN(goals);
CREATE INDEX idx_ieps_accommodations ON ieps USING GIN(accommodations_json);
CREATE INDEX idx_content_metadata ON content_library USING GIN(metadata_json);
CREATE INDEX idx_sessions_metrics ON sessions USING GIN(metrics_json);

-- ============================================
-- GRANTS (adjust based on your role structure)
-- ============================================

-- These are examples - adjust based on your actual database roles
-- GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO pathwise_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO pathwise_app;

COMMENT ON TABLE users IS 'Core user accounts with role-based access control';
COMMENT ON TABLE students IS 'Student profiles with learning and cognitive data';
COMMENT ON TABLE ieps IS 'Individualized Education Plans with versioning support';
COMMENT ON TABLE sessions IS 'Learning session tracking for adaptive engine';
COMMENT ON TABLE content_library IS 'Multi-modal learning content repository';
COMMENT ON TABLE ai_audit IS 'FERPA-compliant audit trail for all AI operations';
COMMENT ON TABLE audit_logs IS 'System-wide audit trail for compliance';
