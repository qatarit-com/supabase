/*
  # Add default bot templates

  1. New Data
    - Add default bot templates for users to choose from
  2. Changes
    - Insert default templates if they don't exist
*/

-- Insert default bot templates if they don't exist
INSERT INTO bot_templates (name, description, personality, topics, token_cost)
VALUES
    ('Tech News Bot', 'Stays up-to-date with the latest technology news and trends', 'professional', ARRAY['Technology', 'Innovation', 'AI'], 50),
    ('AI Enthusiast', 'Focuses on artificial intelligence and machine learning developments', 'enthusiastic', ARRAY['AI', 'Machine Learning', 'Data Science'], 50),
    ('Crypto Tracker', 'Monitors and reports on cryptocurrency trends and market updates', 'analytical', ARRAY['Cryptocurrency', 'Blockchain', 'Finance'], 50)
ON CONFLICT (id) DO NOTHING;