-- =====================================================
-- MOBILE DATA COLLECTION + MARKETPLACE + ROI DASHBOARD
-- Combined schema for Features #12, #13, #14
-- =====================================================

-- =====================================================
-- FEATURE #12: MOBILE DATA COLLECTION
-- =====================================================

CREATE TABLE IF NOT EXISTS mobile_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  goal_id UUID,
  observation_type TEXT NOT NULL CHECK (observation_type IN ('behavior', 'academic', 'social', 'communication')),
  notes TEXT NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  device_id TEXT NOT NULL,
  synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE INDEX idx_mobile_observations_student_id ON mobile_observations(student_id);
CREATE INDEX idx_mobile_observations_goal_id ON mobile_observations(goal_id);
CREATE INDEX idx_mobile_observations_device_id ON mobile_observations(device_id);
CREATE INDEX idx_mobile_observations_synced_at ON mobile_observations(synced_at);

CREATE TABLE IF NOT EXISTS mobile_progress_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  device_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_goal FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE
);

CREATE INDEX idx_mobile_progress_data_goal_id ON mobile_progress_data(goal_id);
CREATE INDEX idx_mobile_progress_data_device_id ON mobile_progress_data(device_id);
CREATE INDEX idx_mobile_progress_data_timestamp ON mobile_progress_data(timestamp DESC);

-- =====================================================
-- FEATURE #13: IEP TEMPLATE MARKETPLACE
-- =====================================================

CREATE TABLE IF NOT EXISTS marketplace_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('goals', 'accommodations', 'services', 'full-iep')),
  content JSONB NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  author_id UUID NOT NULL,
  author_name TEXT NOT NULL,
  author_verified BOOLEAN NOT NULL DEFAULT false,
  disability TEXT,
  grade_level TEXT,
  tags TEXT[],
  preview TEXT,
  status TEXT NOT NULL DEFAULT 'pending-review' CHECK (status IN ('pending-review', 'approved', 'rejected', 'archived')),
  rating DECIMAL(3,2),
  review_count INTEGER DEFAULT 0,
  purchase_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_marketplace_templates_category ON marketplace_templates(category);
CREATE INDEX idx_marketplace_templates_author_id ON marketplace_templates(author_id);
CREATE INDEX idx_marketplace_templates_status ON marketplace_templates(status);
CREATE INDEX idx_marketplace_templates_rating ON marketplace_templates(rating DESC);
CREATE INDEX idx_marketplace_templates_purchase_count ON marketplace_templates(purchase_count DESC);
CREATE INDEX idx_marketplace_templates_tags ON marketplace_templates USING GIN(tags);

CREATE TABLE IF NOT EXISTS marketplace_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL,
  user_id UUID NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  platform_fee DECIMAL(10,2) NOT NULL,
  author_earnings DECIMAL(10,2) NOT NULL,
  payment_method_id TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'refunded', 'failed')),
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_template FOREIGN KEY (template_id) REFERENCES marketplace_templates(id) ON DELETE CASCADE,
  CONSTRAINT unique_user_template UNIQUE (user_id, template_id)
);

CREATE INDEX idx_marketplace_purchases_template_id ON marketplace_purchases(template_id);
CREATE INDEX idx_marketplace_purchases_user_id ON marketplace_purchases(user_id);
CREATE INDEX idx_marketplace_purchases_purchased_at ON marketplace_purchases(purchased_at DESC);

CREATE TABLE IF NOT EXISTS marketplace_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL,
  user_id UUID NOT NULL,
  purchase_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_template FOREIGN KEY (template_id) REFERENCES marketplace_templates(id) ON DELETE CASCADE,
  CONSTRAINT fk_purchase FOREIGN KEY (purchase_id) REFERENCES marketplace_purchases(id) ON DELETE CASCADE,
  CONSTRAINT unique_purchase_review UNIQUE (purchase_id)
);

CREATE INDEX idx_marketplace_reviews_template_id ON marketplace_reviews(template_id);
CREATE INDEX idx_marketplace_reviews_user_id ON marketplace_reviews(user_id);
CREATE INDEX idx_marketplace_reviews_rating ON marketplace_reviews(rating);

-- =====================================================
-- FEATURE #14: DISTRICT ROI DASHBOARD
-- =====================================================

CREATE TABLE IF NOT EXISTS district_roi_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id UUID NOT NULL,
  metric_date DATE NOT NULL,
  time_range TEXT NOT NULL CHECK (time_range IN ('daily', 'weekly', 'monthly', 'yearly')),

  -- Time savings
  hours_saved DECIMAL(10,2) NOT NULL DEFAULT 0,
  hours_saved_iep_generation DECIMAL(10,2) DEFAULT 0,
  hours_saved_meeting_prep DECIMAL(10,2) DEFAULT 0,
  hours_saved_compliance DECIMAL(10,2) DEFAULT 0,
  hours_saved_data_collection DECIMAL(10,2) DEFAULT 0,
  value_of_time_saved DECIMAL(10,2) DEFAULT 0,

  -- Compliance
  compliance_rate DECIMAL(5,2),
  critical_violations_count INTEGER DEFAULT 0,

  -- Parent satisfaction
  parent_satisfaction_rating DECIMAL(3,2),
  parent_response_rate DECIMAL(5,2),

  -- Student outcomes
  goals_met_percentage DECIMAL(5,2),
  average_goal_progress DECIMAL(5,2),
  students_on_track INTEGER DEFAULT 0,
  students_at_risk INTEGER DEFAULT 0,

  -- Usage
  active_users INTEGER DEFAULT 0,
  total_students INTEGER DEFAULT 0,
  total_ieps INTEGER DEFAULT 0,
  ai_generated_ieps INTEGER DEFAULT 0,
  mobile_data_points INTEGER DEFAULT 0,

  -- Metadata
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_district_metric_date UNIQUE (district_id, metric_date, time_range)
);

CREATE INDEX idx_district_roi_metrics_district_id ON district_roi_metrics(district_id);
CREATE INDEX idx_district_roi_metrics_metric_date ON district_roi_metrics(metric_date DESC);
CREATE INDEX idx_district_roi_metrics_time_range ON district_roi_metrics(time_range);

-- Triggers
CREATE TRIGGER update_marketplace_templates_updated_at
  BEFORE UPDATE ON marketplace_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Views
CREATE OR REPLACE VIEW marketplace_bestsellers AS
SELECT
  id,
  title,
  category,
  price,
  author_name,
  rating,
  review_count,
  purchase_count
FROM marketplace_templates
WHERE status = 'approved'
ORDER BY purchase_count DESC
LIMIT 50;

CREATE OR REPLACE VIEW seller_earnings AS
SELECT
  mt.author_id,
  mt.author_name,
  COUNT(DISTINCT mp.id) AS total_sales,
  SUM(mp.author_earnings) AS total_earnings,
  COUNT(DISTINCT mt.id) AS active_templates,
  AVG(mt.rating) AS average_rating
FROM marketplace_templates mt
LEFT JOIN marketplace_purchases mp ON mt.id = mp.template_id AND mp.status = 'completed'
WHERE mt.status = 'approved'
GROUP BY mt.author_id, mt.author_name;

COMMENT ON TABLE mobile_observations IS 'FEATURE #12: Mobile classroom observations - offline-first';
COMMENT ON TABLE marketplace_templates IS 'FEATURE #13: Template marketplace - 20% platform fee revenue';
COMMENT ON TABLE district_roi_metrics IS 'FEATURE #14: ROI dashboard - drives renewals';
