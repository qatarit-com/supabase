/*
  # Add More Bot Templates and Features

  1. New Templates
    - Add more specialized bot templates
    - Include different personalities and use cases
  
  2. New Features
    - Add scheduling capabilities
    - Add engagement metrics
    - Add content preferences
*/

-- Add new columns to bots table for enhanced features
ALTER TABLE bots
  ADD COLUMN IF NOT EXISTS posting_schedule jsonb DEFAULT '{"frequency": "daily", "times": ["09:00", "15:00", "20:00"]}'::jsonb,
  ADD COLUMN IF NOT EXISTS content_preferences jsonb DEFAULT '{"maxLength": 280, "includeImages": false, "tone": "professional"}'::jsonb,
  ADD COLUMN IF NOT EXISTS engagement_metrics jsonb DEFAULT '{"likes": 0, "shares": 0, "replies": 0, "engagement_rate": 0}'::jsonb;

-- Create temporary table for new templates
CREATE TEMP TABLE new_templates (
  name text,
  description text,
  personality text,
  topics text[],
  token_cost int
);

-- Insert new template data
INSERT INTO new_templates (name, description, personality, topics, token_cost)
VALUES
  ('Social Media Manager', 'Manages your social media presence with engaging content and consistent posting', 'friendly', ARRAY['Social Media', 'Marketing', 'Engagement'], 75),
  ('Research Assistant', 'Stays updated with academic papers and research developments', 'analytical', ARRAY['Research', 'Science', 'Academia'], 60),
  ('Industry Analyst', 'Provides in-depth analysis of market trends and industry developments', 'professional', ARRAY['Business', 'Markets', 'Industry Analysis'], 80),
  ('Content Curator', 'Curates and shares the best content in your field', 'enthusiastic', ARRAY['Content', 'Curation', 'Trends'], 65),
  ('Startup Monitor', 'Tracks startup ecosystem, funding news, and innovation trends', 'professional', ARRAY['Startups', 'Venture Capital', 'Innovation'], 70),
  ('Dev News Bot', 'Covers programming languages, frameworks, and developer tools', 'technical', ARRAY['Programming', 'Development', 'Software'], 55);

-- Insert new templates
INSERT INTO bot_templates (name, description, personality, topics, token_cost)
SELECT 
  nt.name,
  nt.description,
  nt.personality,
  nt.topics,
  nt.token_cost
FROM new_templates nt
WHERE NOT EXISTS (
  SELECT 1 
  FROM bot_templates bt 
  WHERE bt.name = nt.name
);

-- Add functions for new features
CREATE OR REPLACE FUNCTION update_bot_schedule(
  p_bot_id uuid,
  p_schedule jsonb
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE bots
  SET 
    posting_schedule = p_schedule,
    updated_at = now()
  WHERE id = p_bot_id
  AND owner_id = auth.uid();
  
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION update_bot_preferences(
  p_bot_id uuid,
  p_preferences jsonb
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE bots
  SET 
    content_preferences = p_preferences,
    updated_at = now()
  WHERE id = p_bot_id
  AND owner_id = auth.uid();
  
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION update_engagement_metrics(
  p_bot_id uuid,
  p_metrics jsonb
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE bots
  SET 
    engagement_metrics = p_metrics,
    updated_at = now()
  WHERE id = p_bot_id
  AND owner_id = auth.uid();
  
  RETURN FOUND;
END;
$$;

-- Clean up
DROP TABLE new_templates;