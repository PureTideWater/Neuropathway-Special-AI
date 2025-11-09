/**
 * Integration Tables - Google Classroom, Canvas, Schoology
 *
 * PURPOSE: Store OAuth tokens and synced data from third-party platforms
 * COMPETITIVE ADVANTAGE: Assignment-to-IEP-goal mappings create lock-in
 * BUSINESS VALUE: Teachers invest hours mapping, making switching cost prohibitive
 */

-- Table: integrations
-- Stores OAuth tokens and connection status for each integration
CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,

  -- Integration provider
  provider TEXT NOT NULL CHECK (provider IN ('google_classroom', 'canvas', 'schoology', 'clever')),

  -- OAuth tokens (encrypted in production)
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP,

  -- Provider-specific metadata
  metadata JSONB, -- { courses_count, last_sync_at, scopes, etc. }

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  connected_at TIMESTAMP DEFAULT NOW(),
  last_sync_at TIMESTAMP,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Constraints
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT unique_user_provider UNIQUE (user_id, provider)
);

-- Table: grade_imports
-- Stores grades/submissions imported from external platforms
CREATE TABLE IF NOT EXISTS grade_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL,
  student_id UUID NOT NULL,

  -- Assignment details
  course_id TEXT NOT NULL, -- External platform course ID
  coursework_id TEXT NOT NULL, -- External platform assignment ID
  assignment_name TEXT NOT NULL,
  assignment_type TEXT, -- 'assignment', 'quiz', 'test', etc.

  -- Grade data
  grade DECIMAL(5,2), -- Numeric grade
  max_points DECIMAL(5,2),
  percentage DECIMAL(5,2), -- Grade as percentage
  letter_grade TEXT,

  -- Submission details
  submission_state TEXT, -- 'turned_in', 'late', 'missing', etc.
  submitted_at TIMESTAMP,
  graded_at TIMESTAMP,

  -- IEP goal mapping (THE LOCK-IN FEATURE)
  goal_id UUID, -- Link to IEP goal

  -- Import metadata
  imported_at TIMESTAMP DEFAULT NOW(),
  raw_data JSONB, -- Full API response for debugging

  -- Constraints
  CONSTRAINT fk_integration FOREIGN KEY (integration_id) REFERENCES integrations(id) ON DELETE CASCADE,
  CONSTRAINT fk_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_goal FOREIGN KEY (goal_id) REFERENCES iep_goals(id) ON DELETE SET NULL
);

-- Table: assignment_goal_mappings
-- THE LOCK-IN TABLE: Teacher-created mappings between assignments and IEP goals
CREATE TABLE IF NOT EXISTS assignment_goal_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL,

  -- External assignment
  course_id TEXT NOT NULL,
  coursework_id TEXT NOT NULL,
  assignment_name TEXT NOT NULL,

  -- IEP goal
  goal_id UUID NOT NULL,

  -- Mapping metadata
  created_by UUID NOT NULL, -- Teacher who created mapping
  auto_sync BOOLEAN DEFAULT TRUE, -- Auto-update goal progress from grades?
  weight DECIMAL(3,2) DEFAULT 1.0, -- Weight this assignment in goal progress (0.0-1.0)

  -- Usage tracking (for analytics)
  grades_synced_count INTEGER DEFAULT 0,
  last_sync_at TIMESTAMP,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Constraints
  CONSTRAINT fk_integration FOREIGN KEY (integration_id) REFERENCES integrations(id) ON DELETE CASCADE,
  CONSTRAINT fk_goal FOREIGN KEY (goal_id) REFERENCES iep_goals(id) ON DELETE CASCADE,
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES users(id),
  CONSTRAINT unique_assignment_goal UNIQUE (integration_id, coursework_id, goal_id)
);

-- Table: sync_logs
-- Track sync operations for debugging and analytics
CREATE TABLE IF NOT EXISTS sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL,

  -- Sync details
  sync_type TEXT NOT NULL, -- 'manual', 'scheduled', 'webhook'
  sync_status TEXT NOT NULL CHECK (sync_status IN ('started', 'completed', 'failed')),

  -- Results
  items_synced INTEGER DEFAULT 0, -- Number of items synced
  error_message TEXT,
  error_stack TEXT,

  -- Performance
  duration_ms INTEGER, -- How long sync took
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,

  -- Metadata
  metadata JSONB, -- Detailed sync stats

  CONSTRAINT fk_integration FOREIGN KEY (integration_id) REFERENCES integrations(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_integrations_user_id ON integrations(user_id);
CREATE INDEX idx_integrations_provider ON integrations(provider);
CREATE INDEX idx_integrations_active ON integrations(is_active) WHERE is_active = TRUE;

CREATE INDEX idx_grade_imports_student_id ON grade_imports(student_id);
CREATE INDEX idx_grade_imports_goal_id ON grade_imports(goal_id);
CREATE INDEX idx_grade_imports_integration_id ON grade_imports(integration_id);
CREATE INDEX idx_grade_imports_coursework ON grade_imports(course_id, coursework_id);

CREATE INDEX idx_assignment_mappings_goal_id ON assignment_goal_mappings(goal_id);
CREATE INDEX idx_assignment_mappings_integration_id ON assignment_goal_mappings(integration_id);
CREATE INDEX idx_assignment_mappings_created_by ON assignment_goal_mappings(created_by);

CREATE INDEX idx_sync_logs_integration_id ON sync_logs(integration_id);
CREATE INDEX idx_sync_logs_started_at ON sync_logs(started_at DESC);

-- View: active_integrations
-- Show all active integrations with connection health
CREATE OR REPLACE VIEW active_integrations AS
SELECT
  i.id,
  i.user_id,
  i.provider,
  i.is_active,
  i.connected_at,
  i.last_sync_at,
  i.token_expires_at,

  -- Token health
  CASE
    WHEN i.token_expires_at IS NULL THEN 'unknown'
    WHEN i.token_expires_at > NOW() THEN 'valid'
    ELSE 'expired'
  END AS token_status,

  -- Mapping count (lock-in metric)
  COUNT(DISTINCT agm.id) AS mappings_count,

  -- Sync health
  CASE
    WHEN i.last_sync_at IS NULL THEN 'never_synced'
    WHEN i.last_sync_at > NOW() - INTERVAL '1 day' THEN 'healthy'
    WHEN i.last_sync_at > NOW() - INTERVAL '7 days' THEN 'stale'
    ELSE 'inactive'
  END AS sync_health,

  -- User info
  u.email AS user_email,
  u.first_name || ' ' || u.last_name AS user_name,
  u.role AS user_role

FROM integrations i
JOIN users u ON i.user_id = u.id
LEFT JOIN assignment_goal_mappings agm ON i.id = agm.integration_id

WHERE i.is_active = TRUE

GROUP BY i.id, i.user_id, i.provider, i.is_active, i.connected_at,
         i.last_sync_at, i.token_expires_at, u.email, u.first_name,
         u.last_name, u.role

ORDER BY i.last_sync_at DESC NULLS LAST;

-- View: lock_in_metrics
-- THE BUSINESS METRIC: How much have teachers invested in mappings?
CREATE OR REPLACE VIEW lock_in_metrics AS
SELECT
  i.user_id,
  i.provider,
  u.email,
  u.first_name || ' ' || u.last_name AS teacher_name,

  -- Mapping investment (the lock-in metric)
  COUNT(DISTINCT agm.id) AS total_mappings,
  COUNT(DISTINCT agm.goal_id) AS goals_mapped,
  COUNT(DISTINCT agm.coursework_id) AS assignments_mapped,

  -- Sync activity
  SUM(agm.grades_synced_count) AS total_grades_synced,
  MAX(agm.last_sync_at) AS most_recent_sync,

  -- Time investment estimate (5 min per mapping)
  COUNT(DISTINCT agm.id) * 5 AS estimated_minutes_invested,

  -- First mapping date (when they started investing)
  MIN(agm.created_at) AS first_mapping_date,

  -- Days since first mapping (sunk cost)
  EXTRACT(DAY FROM NOW() - MIN(agm.created_at)) AS days_invested

FROM integrations i
JOIN users u ON i.user_id = u.id
LEFT JOIN assignment_goal_mappings agm ON i.id = agm.integration_id

WHERE i.is_active = TRUE

GROUP BY i.user_id, i.provider, u.email, u.first_name, u.last_name

HAVING COUNT(DISTINCT agm.id) > 0

ORDER BY total_mappings DESC;

-- Function: update_integration_timestamp
-- Auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION update_integration_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trigger_update_integrations_timestamp
  BEFORE UPDATE ON integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_integration_timestamp();

CREATE TRIGGER trigger_update_assignment_mappings_timestamp
  BEFORE UPDATE ON assignment_goal_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_integration_timestamp();

-- Function: increment_sync_count
-- Auto-increment grades_synced_count when new grade is imported
CREATE OR REPLACE FUNCTION increment_mapping_sync_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE assignment_goal_mappings
  SET
    grades_synced_count = grades_synced_count + 1,
    last_sync_at = NOW()
  WHERE coursework_id = NEW.coursework_id
    AND goal_id = NEW.goal_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_sync_count
  AFTER INSERT ON grade_imports
  FOR EACH ROW
  WHEN (NEW.goal_id IS NOT NULL)
  EXECUTE FUNCTION increment_mapping_sync_count();

COMMENT ON TABLE integrations IS 'OAuth connections to third-party platforms (Google Classroom, Canvas, etc.)';
COMMENT ON TABLE grade_imports IS 'Grades/submissions imported from external platforms';
COMMENT ON TABLE assignment_goal_mappings IS 'THE LOCK-IN TABLE: Teacher-created mappings between assignments and IEP goals';
COMMENT ON TABLE sync_logs IS 'Track sync operations for debugging and analytics';
COMMENT ON VIEW active_integrations IS 'All active integrations with connection health status';
COMMENT ON VIEW lock_in_metrics IS 'Business metrics showing teacher time investment in mappings (switching cost)';
