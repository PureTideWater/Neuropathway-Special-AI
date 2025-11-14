/**
 * Goal Predictions Table - ML Prediction Storage
 *
 * PURPOSE: Store ML predictions for IEP goal achievement
 * COMPETITIVE ADVANTAGE: Track prediction accuracy, enable proactive intervention
 * LEGAL PROTECTION: Audit trail showing early intervention attempts
 */

-- Table: goal_predictions
CREATE TABLE IF NOT EXISTS goal_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL,

  -- Prediction results
  predicted_outcome TEXT NOT NULL CHECK (predicted_outcome IN ('will_meet', 'at_risk')),
  confidence_score DECIMAL(5,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),

  -- Context at time of prediction
  current_progress DECIMAL(5,2), -- Student progress % at prediction time
  days_until_target INTEGER,
  progress_rate DECIMAL(6,3), -- % per week
  required_rate DECIMAL(6,3), -- % per week needed

  -- Contributing factors (JSONB for flexibility)
  contributing_factors JSONB, -- { positive: [...], negative: [...] }
  feature_values JSONB, -- All ML features for analysis

  -- Recommendations
  recommended_interventions JSONB, -- Array of intervention strings

  -- Metadata
  model_version TEXT NOT NULL DEFAULT 'v1.0.0',
  prediction_date TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),

  -- Outcome tracking (populated after goal target date)
  actual_outcome TEXT CHECK (actual_outcome IN ('met', 'not_met', 'goal_modified', NULL)),
  actual_outcome_date TIMESTAMP,
  prediction_accuracy BOOLEAN, -- Was prediction correct?

  -- Indexes for performance
  CONSTRAINT fk_goal FOREIGN KEY (goal_id) REFERENCES iep_goals(id) ON DELETE CASCADE
);

-- Indexes for fast queries
CREATE INDEX idx_goal_predictions_goal_id ON goal_predictions(goal_id);
CREATE INDEX idx_goal_predictions_outcome ON goal_predictions(predicted_outcome);
CREATE INDEX idx_goal_predictions_date ON goal_predictions(prediction_date DESC);
CREATE INDEX idx_goal_predictions_confidence ON goal_predictions(confidence_score);

-- View: goals_at_risk
-- All goals currently predicted to be at risk (for compliance dashboard)
CREATE OR REPLACE VIEW goals_at_risk AS
SELECT
  gp.id AS prediction_id,
  gp.goal_id,
  gp.predicted_outcome,
  gp.confidence_score,
  gp.days_until_target,
  gp.recommended_interventions,
  gp.prediction_date,

  -- Join with goal data
  g.domain AS goal_domain,
  g.goal_text,
  g.target_date,
  g.baseline,
  g.target_criteria,
  g.student_id,

  -- Join with student data
  s.first_name,
  s.last_name,
  s.grade_level,

  -- Join with IEP data
  i.iep_number,
  i.district_id

FROM goal_predictions gp
JOIN iep_goals g ON gp.goal_id = g.id
JOIN students s ON g.student_id = s.id
JOIN ieps i ON g.iep_id = i.id

WHERE gp.predicted_outcome = 'at_risk'
  AND gp.confidence_score >= 70.0  -- High confidence predictions only
  AND gp.prediction_date = (
    -- Get most recent prediction for each goal
    SELECT MAX(prediction_date)
    FROM goal_predictions gp2
    WHERE gp2.goal_id = gp.goal_id
  )
  AND g.target_date > NOW() -- Goal is still active
  AND gp.actual_outcome IS NULL -- Not yet resolved

ORDER BY gp.confidence_score DESC, gp.days_until_target ASC;

-- View: prediction_accuracy_metrics
-- Track ML model accuracy over time
CREATE OR REPLACE VIEW prediction_accuracy_metrics AS
SELECT
  model_version,
  COUNT(*) AS total_predictions,
  COUNT(CASE WHEN prediction_accuracy = TRUE THEN 1 END) AS correct_predictions,
  COUNT(CASE WHEN prediction_accuracy = FALSE THEN 1 END) AS incorrect_predictions,

  -- Accuracy rate
  ROUND(
    100.0 * COUNT(CASE WHEN prediction_accuracy = TRUE THEN 1 END) / NULLIF(COUNT(*), 0),
    2
  ) AS accuracy_rate,

  -- False positive rate (predicted at_risk but actually met)
  ROUND(
    100.0 * COUNT(CASE
      WHEN predicted_outcome = 'at_risk' AND actual_outcome = 'met'
      THEN 1
    END) / NULLIF(COUNT(CASE WHEN predicted_outcome = 'at_risk' THEN 1 END), 0),
    2
  ) AS false_positive_rate,

  -- False negative rate (predicted will_meet but didn't meet)
  ROUND(
    100.0 * COUNT(CASE
      WHEN predicted_outcome = 'will_meet' AND actual_outcome = 'not_met'
      THEN 1
    END) / NULLIF(COUNT(CASE WHEN predicted_outcome = 'will_meet' THEN 1 END), 0),
    2
  ) AS false_negative_rate,

  -- Average confidence
  ROUND(AVG(confidence_score), 2) AS avg_confidence,

  -- Date range
  MIN(prediction_date) AS first_prediction,
  MAX(prediction_date) AS last_prediction

FROM goal_predictions
WHERE actual_outcome IS NOT NULL  -- Only include predictions that have been validated

GROUP BY model_version
ORDER BY last_prediction DESC;

-- Function: update_prediction_accuracy
-- Automatically calculate accuracy when actual outcome is recorded
CREATE OR REPLACE FUNCTION update_prediction_accuracy()
RETURNS TRIGGER AS $$
BEGIN
  -- When actual_outcome is set, calculate if prediction was correct
  IF NEW.actual_outcome IS NOT NULL AND OLD.actual_outcome IS NULL THEN
    NEW.prediction_accuracy := (
      CASE
        WHEN NEW.predicted_outcome = 'will_meet' AND NEW.actual_outcome = 'met' THEN TRUE
        WHEN NEW.predicted_outcome = 'at_risk' AND NEW.actual_outcome IN ('not_met', 'goal_modified') THEN TRUE
        ELSE FALSE
      END
    );
    NEW.actual_outcome_date := NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Calculate prediction accuracy on update
CREATE TRIGGER trigger_update_prediction_accuracy
  BEFORE UPDATE ON goal_predictions
  FOR EACH ROW
  WHEN (NEW.actual_outcome IS DISTINCT FROM OLD.actual_outcome)
  EXECUTE FUNCTION update_prediction_accuracy();

-- Sample data for testing (will be removed in production)
-- INSERT INTO goal_predictions (
--   goal_id, predicted_outcome, confidence_score, current_progress,
--   days_until_target, progress_rate, required_rate,
--   contributing_factors, recommended_interventions, model_version
-- ) VALUES (
--   'goal-uuid-example',
--   'at_risk',
--   78.5,
--   58.0,
--   45,
--   0.5,
--   1.2,
--   '{"positive": ["Consistent attendance"], "negative": ["Declining progress trend", "Low accommodation usage"]}'::jsonb,
--   '["Schedule intervention meeting within 2 weeks", "Increase service frequency"]'::jsonb,
--   'v1.0.0-xgboost'
-- );

COMMENT ON TABLE goal_predictions IS 'ML predictions for IEP goal achievement - enables proactive intervention';
COMMENT ON VIEW goals_at_risk IS 'Current high-confidence at-risk goal predictions for compliance monitoring';
COMMENT ON VIEW prediction_accuracy_metrics IS 'ML model performance tracking - monitor and improve accuracy over time';
