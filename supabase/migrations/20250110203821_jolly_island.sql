/*
  # Add bot template generation function

  1. New Functions
    - `create_bot_template`: Generates a new bot template based on user preferences
    - `generate_template_name`: Helper function to generate template names
    - `generate_template_description`: Helper function to generate descriptions

  2. Security
    - Functions are SECURITY DEFINER to ensure proper access control
    - Input validation for all parameters
*/

-- Helper function to generate template names
CREATE OR REPLACE FUNCTION generate_template_name(
  p_topics text[],
  p_personality text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_prefix text;
  v_suffix text;
BEGIN
  -- Select appropriate prefix based on personality
  v_prefix := CASE p_personality
    WHEN 'professional' THEN 'Enterprise'
    WHEN 'casual' THEN 'Social'
    WHEN 'enthusiastic' THEN 'Dynamic'
    WHEN 'analytical' THEN 'Expert'
    ELSE 'Smart'
  END;

  -- Select suffix based on primary topic
  v_suffix := CASE 
    WHEN p_topics[1] ILIKE '%AI%' THEN 'AI Assistant'
    WHEN p_topics[1] ILIKE '%tech%' THEN 'Tech Analyst'
    WHEN p_topics[1] ILIKE '%data%' THEN 'Data Insights'
    WHEN p_topics[1] ILIKE '%market%' THEN 'Market Observer'
    ELSE 'Content Bot'
  END;

  RETURN v_prefix || ' ' || v_suffix;
END;
$$;

-- Helper function to generate template descriptions
CREATE OR REPLACE FUNCTION generate_template_description(
  p_topics text[],
  p_personality text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_action text;
  v_focus text;
BEGIN
  -- Select action based on personality
  v_action := CASE p_personality
    WHEN 'professional' THEN 'Analyzes and reports on'
    WHEN 'casual' THEN 'Shares insights about'
    WHEN 'enthusiastic' THEN 'Explores and discovers'
    WHEN 'analytical' THEN 'Provides detailed analysis of'
    ELSE 'Monitors and updates on'
  END;

  -- Create focus area from topics
  v_focus := array_to_string(p_topics, ', ');

  RETURN v_action || ' ' || v_focus || ' with a ' || p_personality || ' approach';
END;
$$;

-- Main template generation function
CREATE OR REPLACE FUNCTION create_bot_template(
  p_owner_id uuid,
  p_topics text[],
  p_personality text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_template_id uuid;
  v_name text;
  v_description text;
  v_token_cost integer;
BEGIN
  -- Input validation
  IF p_owner_id IS NULL THEN
    RAISE EXCEPTION 'Owner ID is required';
  END IF;

  IF p_topics IS NULL OR array_length(p_topics, 1) = 0 THEN
    RAISE EXCEPTION 'At least one topic is required';
  END IF;

  IF p_personality IS NULL OR p_personality NOT IN ('professional', 'casual', 'enthusiastic', 'analytical') THEN
    RAISE EXCEPTION 'Invalid personality type';
  END IF;

  -- Generate template details
  v_name := generate_template_name(p_topics, p_personality);
  v_description := generate_template_description(p_topics, p_personality);
  v_token_cost := 50 + (array_length(p_topics, 1) * 5); -- Base cost + extra for more topics

  -- Create template
  INSERT INTO bot_templates (
    name,
    description,
    personality,
    topics,
    token_cost,
    created_at
  )
  VALUES (
    v_name,
    v_description,
    p_personality,
    p_topics,
    v_token_cost,
    now()
  )
  RETURNING id INTO v_template_id;

  -- Deduct tokens from user
  PERFORM use_tokens(
    p_owner_id,
    25,
    'Generated template: ' || v_name
  );

  -- Return template data
  RETURN jsonb_build_object(
    'id', v_template_id,
    'name', v_name,
    'description', v_description,
    'personality', p_personality,
    'topics', p_topics,
    'token_cost', v_token_cost
  );
END;
$$;

-- Add helpful comments
COMMENT ON FUNCTION create_bot_template IS 'Generates a new bot template based on user preferences';
COMMENT ON FUNCTION generate_template_name IS 'Generates an appropriate name for a bot template';
COMMENT ON FUNCTION generate_template_description IS 'Generates a description for a bot template';