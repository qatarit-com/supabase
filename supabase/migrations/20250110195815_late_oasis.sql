/*
  # Clean up duplicate bot templates

  1. Changes
    - Remove duplicate templates while preserving referenced ones
    - Update template descriptions and content
    - Ensure unique template names
    
  2. Notes
    - Uses temporary table to stage changes
    - Preserves referenced templates
    - Updates content safely
*/

-- Create temporary table for template data
CREATE TEMP TABLE template_staging (
  name text,
  description text,
  personality text,
  topics text[],
  token_cost int
);

-- Insert desired template data
INSERT INTO template_staging (name, description, personality, topics, token_cost)
VALUES
  ('Tech News Bot', 'Stays up-to-date with the latest technology news and trends', 'professional', ARRAY['Technology', 'Innovation', 'AI'], 50),
  ('AI Enthusiast', 'Focuses on artificial intelligence and machine learning developments', 'enthusiastic', ARRAY['AI', 'Machine Learning', 'Data Science'], 50),
  ('Crypto Tracker', 'Monitors and reports on cryptocurrency trends and market updates', 'analytical', ARRAY['Cryptocurrency', 'Blockchain', 'Finance'], 50);

-- Remove duplicates while preserving referenced templates
WITH ranked_templates AS (
  SELECT 
    id,
    name,
    ROW_NUMBER() OVER (PARTITION BY name ORDER BY 
      CASE WHEN id IN (SELECT template_id FROM bots WHERE template_id IS NOT NULL) THEN 0 ELSE 1 END,
      created_at ASC
    ) as rn
  FROM bot_templates
)
DELETE FROM bot_templates
WHERE id IN (
  SELECT id 
  FROM ranked_templates 
  WHERE rn > 1
);

-- Update remaining templates with new content
UPDATE bot_templates bt
SET
  description = ts.description,
  personality = ts.personality,
  topics = ts.topics,
  token_cost = ts.token_cost
FROM template_staging ts
WHERE bt.name = ts.name;

-- Insert any missing templates
INSERT INTO bot_templates (name, description, personality, topics, token_cost)
SELECT 
  ts.name,
  ts.description,
  ts.personality,
  ts.topics,
  ts.token_cost
FROM template_staging ts
WHERE NOT EXISTS (
  SELECT 1 
  FROM bot_templates bt 
  WHERE bt.name = ts.name
);

-- Clean up
DROP TABLE template_staging;