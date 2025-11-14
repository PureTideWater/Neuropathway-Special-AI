-- =====================================================
-- STATE COMPLIANCE REPORT GENERATOR
-- Database Schema for IEP Compliance Tracking
-- =====================================================
--
-- BUSINESS VALUE:
-- - Automated compliance = premium pricing tier
-- - Reduces legal risk for districts
-- - Differentiator vs competitors (IEP Online, Frontline)
--
-- COMPETITIVE ADVANTAGE:
-- - AI-powered compliance checking
-- - 50-state requirement database
-- - Automated remediation suggestions
-- =====================================================

-- Compliance Reports Table
-- Stores results of IEP compliance checks
CREATE TABLE IF NOT EXISTS compliance_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  iep_id UUID NOT NULL,
  district_id UUID NOT NULL,
  state CHAR(2) NOT NULL, -- US state code
  checked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  checked_by UUID, -- User who triggered the check

  -- Overall compliance status
  overall_status TEXT NOT NULL CHECK (overall_status IN ('compliant', 'non-compliant', 'needs-review')),
  compliance_score INTEGER NOT NULL CHECK (compliance_score >= 0 AND compliance_score <= 100),

  -- Issue counts
  critical_issue_count INTEGER NOT NULL DEFAULT 0,
  warning_count INTEGER NOT NULL DEFAULT 0,
  info_count INTEGER NOT NULL DEFAULT 0,

  -- Compliance by category
  federal_compliance BOOLEAN NOT NULL DEFAULT false,
  state_compliance BOOLEAN NOT NULL DEFAULT false,

  -- Detailed results (JSONB for flexibility)
  issues JSONB NOT NULL DEFAULT '[]', -- Array of ComplianceIssue objects
  remediation_plan JSONB, -- AI-generated remediation plan

  -- Report metadata
  report_format TEXT CHECK (report_format IN ('json', 'pdf', 'html')),
  pdf_url TEXT,
  html_report TEXT,

  -- Audit trail
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- Indexes for performance
  CONSTRAINT fk_iep FOREIGN KEY (iep_id) REFERENCES ieps(id) ON DELETE CASCADE
);

CREATE INDEX idx_compliance_reports_iep_id ON compliance_reports(iep_id);
CREATE INDEX idx_compliance_reports_district_id ON compliance_reports(district_id);
CREATE INDEX idx_compliance_reports_state ON compliance_reports(state);
CREATE INDEX idx_compliance_reports_checked_at ON compliance_reports(checked_at DESC);
CREATE INDEX idx_compliance_reports_overall_status ON compliance_reports(overall_status);
CREATE INDEX idx_compliance_reports_compliance_score ON compliance_reports(compliance_score);

-- State Requirements Table
-- Master list of federal and state-specific IEP requirements
CREATE TABLE IF NOT EXISTS state_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requirement_id TEXT NOT NULL UNIQUE, -- e.g., 'PLOP', 'CA_TRIENNIAL'

  -- Jurisdiction
  jurisdiction TEXT NOT NULL CHECK (jurisdiction IN ('federal', 'state')),
  state CHAR(2), -- NULL for federal requirements, state code for state requirements

  -- Requirement details
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  citation TEXT NOT NULL, -- Legal citation (e.g., '34 CFR §300.320(a)(1)')
  category TEXT, -- e.g., 'goals', 'assessments', 'services', 'procedures'

  -- Severity and enforcement
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'warning', 'info')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  effective_date DATE,
  expiration_date DATE,

  -- Validation logic
  validation_rules JSONB, -- Machine-readable validation rules

  -- Educational resources
  guidance_url TEXT,
  template_language TEXT, -- Sample IEP language that satisfies this requirement

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_state_requirement_state CHECK (
    (jurisdiction = 'federal' AND state IS NULL) OR
    (jurisdiction = 'state' AND state IS NOT NULL)
  )
);

CREATE INDEX idx_state_requirements_jurisdiction ON state_requirements(jurisdiction);
CREATE INDEX idx_state_requirements_state ON state_requirements(state);
CREATE INDEX idx_state_requirements_category ON state_requirements(category);
CREATE INDEX idx_state_requirements_severity ON state_requirements(severity);
CREATE INDEX idx_state_requirements_active ON state_requirements(is_active);

-- Compliance Issues Table
-- Individual compliance violations found in IEPs
CREATE TABLE IF NOT EXISTS compliance_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL,
  requirement_id TEXT NOT NULL, -- Links to state_requirements.requirement_id

  -- Issue details
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'warning', 'info')),
  finding TEXT NOT NULL, -- What was found (or not found)
  remediation TEXT NOT NULL, -- How to fix it

  -- IEP section affected
  iep_section TEXT, -- e.g., 'goals', 'plop', 'services'

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'resolved', 'wont-fix')),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  resolution_notes TEXT,

  -- Audit trail
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_compliance_report FOREIGN KEY (report_id) REFERENCES compliance_reports(id) ON DELETE CASCADE,
  CONSTRAINT fk_requirement FOREIGN KEY (requirement_id) REFERENCES state_requirements(requirement_id)
);

CREATE INDEX idx_compliance_issues_report_id ON compliance_issues(report_id);
CREATE INDEX idx_compliance_issues_requirement_id ON compliance_issues(requirement_id);
CREATE INDEX idx_compliance_issues_severity ON compliance_issues(severity);
CREATE INDEX idx_compliance_issues_status ON compliance_issues(status);

-- District Compliance Metrics Table
-- Aggregate compliance metrics for district-level reporting
CREATE TABLE IF NOT EXISTS district_compliance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id UUID NOT NULL,
  state CHAR(2) NOT NULL,

  -- Time period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Metrics
  total_ieps INTEGER NOT NULL DEFAULT 0,
  compliant_ieps INTEGER NOT NULL DEFAULT 0,
  non_compliant_ieps INTEGER NOT NULL DEFAULT 0,
  needs_review_ieps INTEGER NOT NULL DEFAULT 0,

  -- Calculated fields
  compliance_rate DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE
      WHEN total_ieps > 0 THEN (compliant_ieps::DECIMAL / total_ieps * 100)
      ELSE 0
    END
  ) STORED,

  avg_compliance_score DECIMAL(5,2),

  -- Issue breakdown
  total_critical_issues INTEGER NOT NULL DEFAULT 0,
  total_warnings INTEGER NOT NULL DEFAULT 0,

  -- Top violations (JSONB array)
  common_violations JSONB DEFAULT '[]',

  -- Trend analysis
  trend TEXT CHECK (trend IN ('improving', 'stable', 'declining')),
  previous_compliance_rate DECIMAL(5,2),

  -- Metadata
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_district_period UNIQUE (district_id, period_start, period_end)
);

CREATE INDEX idx_district_compliance_metrics_district_id ON district_compliance_metrics(district_id);
CREATE INDEX idx_district_compliance_metrics_period ON district_compliance_metrics(period_start, period_end);
CREATE INDEX idx_district_compliance_metrics_compliance_rate ON district_compliance_metrics(compliance_rate);

-- =====================================================
-- VIEWS FOR ANALYTICS
-- =====================================================

-- Latest compliance status for each IEP
CREATE OR REPLACE VIEW latest_iep_compliance AS
SELECT DISTINCT ON (iep_id)
  iep_id,
  id AS report_id,
  district_id,
  state,
  overall_status,
  compliance_score,
  critical_issue_count,
  warning_count,
  federal_compliance,
  state_compliance,
  checked_at
FROM compliance_reports
ORDER BY iep_id, checked_at DESC;

-- Non-compliant IEPs requiring immediate attention
CREATE OR REPLACE VIEW critical_compliance_issues AS
SELECT
  cr.iep_id,
  cr.district_id,
  cr.state,
  cr.overall_status,
  cr.compliance_score,
  cr.critical_issue_count,
  cr.checked_at,
  i.student_name,
  i.student_id
FROM compliance_reports cr
JOIN ieps i ON cr.iep_id = i.id
WHERE cr.overall_status = 'non-compliant'
  AND cr.critical_issue_count > 0
  AND cr.id IN (
    SELECT DISTINCT ON (iep_id) id
    FROM compliance_reports
    ORDER BY iep_id, checked_at DESC
  )
ORDER BY cr.critical_issue_count DESC, cr.checked_at DESC;

-- Compliance trend over time
CREATE OR REPLACE VIEW compliance_trends AS
SELECT
  district_id,
  state,
  DATE_TRUNC('month', checked_at) AS month,
  COUNT(*) AS total_checks,
  COUNT(*) FILTER (WHERE overall_status = 'compliant') AS compliant_count,
  COUNT(*) FILTER (WHERE overall_status = 'non-compliant') AS non_compliant_count,
  AVG(compliance_score) AS avg_compliance_score,
  SUM(critical_issue_count) AS total_critical_issues
FROM compliance_reports
GROUP BY district_id, state, DATE_TRUNC('month', checked_at)
ORDER BY district_id, month DESC;

-- Most common compliance violations
CREATE OR REPLACE VIEW common_violations AS
SELECT
  ci.requirement_id,
  sr.name AS requirement_name,
  sr.severity,
  sr.citation,
  COUNT(*) AS violation_count,
  COUNT(DISTINCT ci.report_id) AS affected_ieps,
  COUNT(DISTINCT cr.district_id) AS affected_districts
FROM compliance_issues ci
JOIN compliance_reports cr ON ci.report_id = cr.id
JOIN state_requirements sr ON ci.requirement_id = sr.requirement_id
WHERE ci.status = 'open'
GROUP BY ci.requirement_id, sr.name, sr.severity, sr.citation
ORDER BY violation_count DESC;

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to calculate district compliance rate
CREATE OR REPLACE FUNCTION calculate_district_compliance_rate(
  p_district_id UUID,
  p_state CHAR(2),
  p_days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
  total_ieps INTEGER,
  compliant_ieps INTEGER,
  compliance_rate DECIMAL(5,2),
  avg_score DECIMAL(5,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER AS total_ieps,
    COUNT(*) FILTER (WHERE overall_status = 'compliant')::INTEGER AS compliant_ieps,
    ROUND(
      COUNT(*) FILTER (WHERE overall_status = 'compliant')::DECIMAL /
      COUNT(*)::DECIMAL * 100,
      2
    ) AS compliance_rate,
    ROUND(AVG(compliance_score), 2) AS avg_score
  FROM (
    SELECT DISTINCT ON (iep_id)
      iep_id,
      overall_status,
      compliance_score
    FROM compliance_reports
    WHERE district_id = p_district_id
      AND state = p_state
      AND checked_at >= NOW() - (p_days_back || ' days')::INTERVAL
    ORDER BY iep_id, checked_at DESC
  ) latest_reports;
END;
$$ LANGUAGE plpgsql;

-- Function to get compliance improvement suggestions
CREATE OR REPLACE FUNCTION get_compliance_suggestions(
  p_district_id UUID,
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  requirement_id TEXT,
  requirement_name TEXT,
  violation_count BIGINT,
  potential_impact DECIMAL(5,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ci.requirement_id,
    sr.name AS requirement_name,
    COUNT(*) AS violation_count,
    ROUND(
      COUNT(*) *
      CASE sr.severity
        WHEN 'critical' THEN 15.0
        WHEN 'warning' THEN 5.0
        ELSE 1.0
      END,
      2
    ) AS potential_impact
  FROM compliance_issues ci
  JOIN compliance_reports cr ON ci.report_id = cr.id
  JOIN state_requirements sr ON ci.requirement_id = sr.requirement_id
  WHERE cr.district_id = p_district_id
    AND ci.status = 'open'
  GROUP BY ci.requirement_id, sr.name, sr.severity
  ORDER BY potential_impact DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_compliance_reports_updated_at
  BEFORE UPDATE ON compliance_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_state_requirements_updated_at
  BEFORE UPDATE ON state_requirements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_issues_updated_at
  BEFORE UPDATE ON compliance_issues
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SEED DATA: Federal Requirements
-- =====================================================

INSERT INTO state_requirements (requirement_id, jurisdiction, state, name, description, citation, category, severity, template_language) VALUES
('PLOP', 'federal', NULL, 'Present Levels of Performance', 'IEP must include statement of child''s present levels of academic achievement and functional performance', '34 CFR §300.320(a)(1)', 'assessment', 'critical', 'The student currently performs at [grade level] in [subject]. Strengths include [list]. Areas of need include [list].'),
('MEASURABLE_GOALS', 'federal', NULL, 'Measurable Annual Goals', 'IEP must include measurable annual goals, including academic and functional goals', '34 CFR §300.320(a)(2)', 'goals', 'critical', 'By [date], the student will [specific behavior] with [accuracy %] in [conditions] as measured by [assessment].'),
('PROGRESS_MEASUREMENT', 'federal', NULL, 'Progress Measurement', 'Description of how child''s progress will be measured and when reports will be provided', '34 CFR §300.320(a)(3)', 'progress', 'critical', 'Progress will be measured through [method] and reported to parents [frequency].'),
('SPECIAL_ED_SERVICES', 'federal', NULL, 'Special Education Services', 'Statement of special education, related services, and supplementary aids to be provided', '34 CFR §300.320(a)(4)', 'services', 'critical', 'The student will receive [service type] for [duration] [frequency] in [location] provided by [provider].'),
('LRE_EXPLANATION', 'federal', NULL, 'LRE Explanation', 'Explanation of the extent, if any, to which child will not participate with nondisabled children', '34 CFR §300.320(a)(5)', 'placement', 'warning', 'The student will participate in general education [percentage]% of the time. Removal is necessary because [justification].'),
('ACCOMMODATIONS', 'federal', NULL, 'Testing Accommodations', 'Statement of individual appropriate accommodations necessary to measure academic achievement', '34 CFR §300.320(a)(6)', 'accommodations', 'warning', 'For district and state assessments, the student will receive: [list accommodations].'),
('TRANSITION_SERVICES', 'federal', NULL, 'Transition Services (Age 16+)', 'Beginning not later than first IEP in effect when child turns 16, appropriate measurable postsecondary goals and transition services', '34 CFR §300.320(b)', 'transition', 'critical', 'Postsecondary Goal: [goal]. Transition services: [services]. Agency linkages: [agencies].')
ON CONFLICT (requirement_id) DO NOTHING;

-- Sample state-specific requirements
INSERT INTO state_requirements (requirement_id, jurisdiction, state, name, description, citation, category, severity) VALUES
('CA_TRIENNIAL', 'state', 'CA', 'Triennial Assessment', 'Reassessment required at least once every 3 years unless parent and district agree it is unnecessary', 'Cal. Ed. Code §56381', 'assessment', 'critical'),
('TX_ARD_COMMITTEE', 'state', 'TX', 'ARD Committee Composition', 'ARD committee must include all required members including LEA representative, special ed teacher, general ed teacher, and parent', '19 TAC §89.1050', 'procedures', 'critical'),
('NY_12_MONTH', 'state', 'NY', '12-Month Services Consideration', 'IEP team must consider whether student requires 12-month school year services', '8 NYCRR §200.6(k)', 'services', 'warning')
ON CONFLICT (requirement_id) DO NOTHING;

COMMENT ON TABLE compliance_reports IS 'IEP compliance check results - PREMIUM FEATURE';
COMMENT ON TABLE state_requirements IS 'Master list of 50-state IEP requirements - COMPETITIVE MOAT';
COMMENT ON VIEW critical_compliance_issues IS 'High-priority compliance issues requiring immediate attention';
