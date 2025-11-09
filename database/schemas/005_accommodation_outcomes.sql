/**
 * Accommodation Outcomes Table - Data Moat Feature
 *
 * PURPOSE: Track accommodation effectiveness across all districts
 * COMPETITIVE ADVANTAGE: The more data we collect, the better our recommendations
 * NETWORK EFFECT: More districts = better recommendations for everyone
 * PATENT OPPORTUNITY: Collaborative filtering for educational accommodations
 * DATA MOAT: Competitors can't replicate without our scale
 */

-- Table: accommodation_outcomes
-- Stores effectiveness data for accommodations across all students/districts
CREATE TABLE IF NOT EXISTS accommodation_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  district_id UUID,

  -- Accommodation details
  accommodation_type TEXT NOT NULL, -- 'Extended time', 'Visual supports', etc.
  accommodation_category TEXT CHECK (accommodation_category IN (
    'testing', 'classroom', 'materials', 'environment', 'technology'
  )),

  -- Student profile (anonymized for privacy)
  disability_category TEXT,
  grade_level INTEGER,
  cognitive_profile JSONB, -- Anonymized cognitive profile

  -- Outcome measurement
  outcome_score DECIMAL(5,2) NOT NULL CHECK (outcome_score >= 0 AND outcome_score <= 100),
  outcome_type TEXT DEFAULT 'goal_progress', -- What metric we're measuring

  -- Context
  duration_weeks INTEGER, -- How long accommodation was in place
  implementation_quality TEXT CHECK (implementation_quality IN ('high', 'medium', 'low', 'unknown')),
  teacher_notes TEXT,

  -- Metadata
  recorded_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),

  -- Constraints
  CONSTRAINT fk_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_district FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE SET NULL
);

-- Table: accommodation_recommendations
-- Store ML-generated recommendations and their accuracy
CREATE TABLE IF NOT EXISTS accommodation_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,

  -- Recommendation
  accommodation_type TEXT NOT NULL,
  predicted_effectiveness DECIMAL(5,2) NOT NULL,
  confidence_score DECIMAL(5,2) NOT NULL,

  -- Evidence base
  evidence_students_count INTEGER,
  evidence_districts_count INTEGER,

  -- Rationale
  rationale TEXT,
  similar_students JSONB, -- Array of similar student IDs with similarity scores

  -- Outcome tracking (did teacher implement? did it work?)
  implemented BOOLEAN DEFAULT FALSE,
  implemented_at TIMESTAMP,
  actual_effectiveness DECIMAL(5,2), -- If implemented, what was actual outcome?
  prediction_accuracy DECIMAL(5,2), -- How accurate was our prediction?

  -- Metadata
  recommended_at TIMESTAMP DEFAULT NOW(),
  model_version TEXT DEFAULT 'v1.0.0',

  CONSTRAINT fk_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Indexes for collaborative filtering performance
CREATE INDEX idx_accommodation_outcomes_student ON accommodation_outcomes(student_id);
CREATE INDEX idx_accommodation_outcomes_district ON accommodation_outcomes(district_id);
CREATE INDEX idx_accommodation_outcomes_type ON accommodation_outcomes(accommodation_type);
CREATE INDEX idx_accommodation_outcomes_category ON accommodation_outcomes(disability_category);
CREATE INDEX idx_accommodation_outcomes_score ON accommodation_outcomes(outcome_score);
CREATE INDEX idx_accommodation_outcomes_grade ON accommodation_outcomes(grade_level);

-- Composite index for collaborative filtering queries
CREATE INDEX idx_accommodation_cf_lookup ON accommodation_outcomes(
  disability_category, grade_level, accommodation_type
);

-- GIN index for cognitive profile similarity search
CREATE INDEX idx_accommodation_cognitive_profile ON accommodation_outcomes USING GIN (cognitive_profile);

CREATE INDEX idx_accommodation_recommendations_student ON accommodation_recommendations(student_id);
CREATE INDEX idx_accommodation_recommendations_type ON accommodation_recommendations(accommodation_type);
CREATE INDEX idx_accommodation_recommendations_implemented ON accommodation_recommendations(implemented);

-- View: accommodation_effectiveness_summary
-- Aggregate effectiveness statistics for each accommodation
CREATE OR REPLACE VIEW accommodation_effectiveness_summary AS
SELECT
  accommodation_type,
  accommodation_category,

  -- Overall statistics
  COUNT(*) AS total_outcomes,
  COUNT(DISTINCT student_id) AS unique_students,
  COUNT(DISTINCT district_id) AS districts_count,

  -- Effectiveness metrics
  ROUND(AVG(outcome_score), 1) AS avg_effectiveness,
  ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY outcome_score), 1) AS median_effectiveness,
  ROUND(STDDEV(outcome_score), 1) AS std_deviation,

  -- Confidence intervals (95%)
  ROUND(AVG(outcome_score) - (1.96 * STDDEV(outcome_score) / SQRT(COUNT(*))), 1) AS ci_lower,
  ROUND(AVG(outcome_score) + (1.96 * STDDEV(outcome_score) / SQRT(COUNT(*))), 1) AS ci_upper,

  -- Success rate (% of outcomes above 70)
  ROUND(
    100.0 * COUNT(CASE WHEN outcome_score >= 70 THEN 1 END) / COUNT(*),
    1
  ) AS success_rate_pct,

  -- By disability category
  jsonb_object_agg(
    disability_category,
    jsonb_build_object(
      'avg_effectiveness', ROUND(AVG(outcome_score), 1),
      'sample_size', COUNT(*)
    )
  ) FILTER (WHERE disability_category IS NOT NULL) AS by_disability,

  -- Last updated
  MAX(recorded_at) AS last_updated

FROM accommodation_outcomes

GROUP BY accommodation_type, accommodation_category

HAVING COUNT(*) >= 5  -- Only show accommodations with at least 5 data points

ORDER BY avg_effectiveness DESC;

-- View: top_accommodations_by_category
-- Most effective accommodations for each disability category
CREATE OR REPLACE VIEW top_accommodations_by_category AS
WITH ranked_accommodations AS (
  SELECT
    disability_category,
    accommodation_type,
    AVG(outcome_score) AS avg_effectiveness,
    COUNT(*) AS sample_size,
    COUNT(DISTINCT district_id) AS districts_count,
    ROW_NUMBER() OVER (
      PARTITION BY disability_category
      ORDER BY AVG(outcome_score) DESC, COUNT(*) DESC
    ) AS rank
  FROM accommodation_outcomes
  WHERE disability_category IS NOT NULL
  GROUP BY disability_category, accommodation_type
  HAVING COUNT(*) >= 3  -- Minimum 3 outcomes
)
SELECT
  disability_category,
  accommodation_type,
  ROUND(avg_effectiveness, 1) AS avg_effectiveness,
  sample_size,
  districts_count,
  rank
FROM ranked_accommodations
WHERE rank <= 5  -- Top 5 per category
ORDER BY disability_category, rank;

-- View: data_moat_metrics
-- THE BUSINESS METRIC: Track our data advantage over competitors
CREATE OR REPLACE VIEW data_moat_metrics AS
SELECT
  -- Total data collected
  COUNT(*) AS total_outcomes_recorded,
  COUNT(DISTINCT student_id) AS unique_students,
  COUNT(DISTINCT district_id) AS participating_districts,

  -- Data quality
  COUNT(CASE WHEN cognitive_profile IS NOT NULL THEN 1 END) AS outcomes_with_cognitive_data,
  ROUND(
    100.0 * COUNT(CASE WHEN cognitive_profile IS NOT NULL THEN 1 END) / COUNT(*),
    1
  ) AS cognitive_data_rate_pct,

  -- Coverage (how many accommodation types we have data on)
  COUNT(DISTINCT accommodation_type) AS accommodation_types_covered,

  -- Network effect strength
  ROUND(AVG(districts_per_accommodation), 1) AS avg_districts_per_accommodation,

  -- Recommendation accuracy
  (SELECT ROUND(AVG(prediction_accuracy), 1)
   FROM accommodation_recommendations
   WHERE prediction_accuracy IS NOT NULL) AS avg_prediction_accuracy,

  -- Growth metrics
  COUNT(CASE WHEN recorded_at > NOW() - INTERVAL '30 days' THEN 1 END) AS outcomes_last_30_days,
  COUNT(CASE WHEN recorded_at > NOW() - INTERVAL '7 days' THEN 1 END) AS outcomes_last_7_days,

  -- Last updated
  MAX(recorded_at) AS last_outcome_recorded

FROM accommodation_outcomes

CROSS JOIN (
  SELECT COUNT(DISTINCT district_id)::decimal / COUNT(DISTINCT accommodation_type) AS districts_per_accommodation
  FROM accommodation_outcomes
) AS coverage;

-- Function: calculate_similarity_score
-- Calculate cognitive profile similarity between two students
CREATE OR REPLACE FUNCTION calculate_similarity_score(
  profile1 JSONB,
  profile2 JSONB
) RETURNS DECIMAL AS $$
DECLARE
  similarity DECIMAL := 0;
  key TEXT;
  total_keys INTEGER := 0;
  matching_keys INTEGER := 0;
BEGIN
  -- Simple Jaccard similarity for now
  -- In production: Use cosine similarity or more sophisticated algorithm

  FOR key IN SELECT jsonb_object_keys(profile1)
  LOOP
    total_keys := total_keys + 1;
    IF profile2 ? key AND profile1->key = profile2->key THEN
      matching_keys := matching_keys + 1;
    END IF;
  END LOOP;

  IF total_keys > 0 THEN
    similarity := matching_keys::decimal / total_keys;
  END IF;

  RETURN similarity;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function: get_similar_students
-- Find students with similar cognitive profiles (for collaborative filtering)
CREATE OR REPLACE FUNCTION get_similar_students(
  p_student_id UUID,
  p_limit INTEGER DEFAULT 50
) RETURNS TABLE (
  similar_student_id UUID,
  similarity_score DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH target_student AS (
    SELECT cognitive_profile, disability_category, grade_level
    FROM students
    WHERE id = p_student_id
  )
  SELECT
    s.id AS similar_student_id,
    calculate_similarity_score(
      t.cognitive_profile,
      s.cognitive_profile
    ) AS similarity_score
  FROM students s
  CROSS JOIN target_student t
  WHERE s.id != p_student_id
    AND s.disability_category = t.disability_category  -- Same disability category
    AND ABS(s.grade_level - t.grade_level) <= 2  -- Within 2 grade levels
  ORDER BY similarity_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function: update_recommendation_accuracy
-- Automatically calculate prediction accuracy when outcome is recorded
CREATE OR REPLACE FUNCTION update_recommendation_accuracy()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE accommodation_recommendations
  SET
    actual_effectiveness = NEW.outcome_score,
    prediction_accuracy = 100 - ABS(predicted_effectiveness - NEW.outcome_score)
  WHERE student_id = NEW.student_id
    AND accommodation_type = NEW.accommodation_type
    AND implemented = TRUE
    AND actual_effectiveness IS NULL;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_recommendation_accuracy
  AFTER INSERT ON accommodation_outcomes
  FOR EACH ROW
  EXECUTE FUNCTION update_recommendation_accuracy();

COMMENT ON TABLE accommodation_outcomes IS 'THE DATA MOAT: Accommodation effectiveness data across all districts - competitive advantage grows with scale';
COMMENT ON TABLE accommodation_recommendations IS 'ML-generated accommodation recommendations with accuracy tracking';
COMMENT ON VIEW accommodation_effectiveness_summary IS 'Aggregate effectiveness statistics for each accommodation type';
COMMENT ON VIEW top_accommodations_by_category IS 'Most effective accommodations for each disability category';
COMMENT ON VIEW data_moat_metrics IS 'BUSINESS METRIC: Our data advantage over competitors (network effect strength)';
COMMENT ON FUNCTION get_similar_students IS 'Collaborative filtering - find students with similar profiles for recommendation';
