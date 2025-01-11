/*
  # Add synthetic test data

  1. Test Data Creation
    - 50 test users with profiles
    - 50 bots with various configurations
    - 200 bot posts with engagement metrics
    - Token transactions and balances
    
  2. Data Distribution
    - Users have varying numbers of bots (1-3)
    - Bots have different posting frequencies and engagement levels
    - Posts have realistic engagement patterns
    
  3. Note: This is test data only, not for production use
*/

-- Function to generate random timestamps within the last 30 days
CREATE OR REPLACE FUNCTION random_recent_timestamp()
RETURNS timestamptz AS $$
BEGIN
  RETURN now() - (random() * interval '30 days');
END;
$$ LANGUAGE plpgsql;

-- Create test users and profiles
DO $$
DECLARE
  v_user_id uuid;
  v_names text[] := ARRAY[
    'Tech', 'Data', 'AI', 'Crypto', 'Dev', 'Code', 'Web', 'Net', 'Cloud', 'Sys'
  ];
  v_suffixes text[] := ARRAY[
    'Master', 'Guru', 'Pro', 'Expert', 'Ninja'
  ];
  v_domains text[] := ARRAY[
    'example.com', 'testmail.com', 'demosite.com', 'techbot.com', 'aibot.com'
  ];
  v_name text;
  v_email text;
BEGIN
  -- Create 50 test users
  FOR i IN 1..50 LOOP
    -- Generate random name and email
    v_name := v_names[1 + mod(i, array_length(v_names, 1))] || 
              v_suffixes[1 + mod(i, array_length(v_suffixes, 1))] ||
              i::text;
    v_email := lower(v_name) || '@' || 
               v_domains[1 + mod(i, array_length(v_domains, 1))];
    
    -- Insert into auth.users
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_user_meta_data
    )
    VALUES (
      gen_random_uuid(),
      v_email,
      -- Using a dummy hashed password (not for production!)
      '$2a$10$RgfGYL8b5RrCZBrXHh4xLeq9FvXkh9Y8WEJXqk3M3hU/WAkjF5Vhu',
      now(),
      jsonb_build_object('name', v_name)
    )
    RETURNING id INTO v_user_id;

    -- Profile will be created by trigger
  END LOOP;
END;
$$;

-- Create bots for users
DO $$
DECLARE
  v_user record;
  v_template record;
  v_bot_id uuid;
  v_topics text[];
  v_personalities text[] := ARRAY['professional', 'casual', 'enthusiastic', 'analytical'];
  v_post_frequencies text[] := ARRAY['low', 'medium', 'high'];
BEGIN
  -- For each user
  FOR v_user IN SELECT id FROM profiles LOOP
    -- Create 1-3 bots per user
    FOR i IN 1..floor(random() * 3 + 1)::int LOOP
      -- Select random template
      SELECT * INTO v_template 
      FROM bot_templates 
      ORDER BY random() 
      LIMIT 1;
      
      -- Generate random topics
      v_topics := v_template.topics;
      
      -- Create bot
      INSERT INTO bots (
        id,
        owner_id,
        name,
        personality,
        topics,
        status,
        daily_post_limit,
        template_id,
        created_at,
        posting_schedule,
        content_preferences,
        engagement_metrics
      )
      VALUES (
        gen_random_uuid(),
        v_user.id,
        v_template.name || ' ' || floor(random() * 1000)::text,
        v_personalities[1 + floor(random() * array_length(v_personalities, 1))],
        v_topics,
        CASE WHEN random() > 0.2 THEN 'active' ELSE 'paused' END,
        floor(random() * 10 + 5)::int,
        v_template.id,
        random_recent_timestamp(),
        jsonb_build_object(
          'frequency', v_post_frequencies[1 + floor(random() * array_length(v_post_frequencies, 1))],
          'times', array['09:00', '15:00', '20:00']
        ),
        jsonb_build_object(
          'maxLength', 280,
          'includeImages', random() > 0.5,
          'tone', v_personalities[1 + floor(random() * array_length(v_personalities, 1))]
        ),
        jsonb_build_object(
          'likes', floor(random() * 1000)::int,
          'shares', floor(random() * 500)::int,
          'replies', floor(random() * 200)::int,
          'engagement_rate', random() * 0.8 + 0.1
        )
      )
      RETURNING id INTO v_bot_id;

      -- Update bot stats
      UPDATE bot_stats
      SET
        tokens_spent = floor(random() * 1000)::int,
        tokens_earned = floor(random() * 500)::int,
        posts_count = floor(random() * 100)::int,
        avg_engagement = random() * 0.8 + 0.1,
        total_interactions = floor(random() * 5000)::int,
        updated_at = random_recent_timestamp()
      WHERE bot_id = v_bot_id;
    END LOOP;
  END LOOP;
END;
$$;

-- Create token balances and transactions
DO $$
DECLARE
  v_user record;
  v_balance int;
  v_transaction_types text[] := ARRAY['purchase', 'use', 'refund'];
  v_transaction_descriptions text[] := ARRAY[
    'Purchased token package',
    'Used tokens for bot creation',
    'Used tokens for content generation',
    'Refund for unused tokens'
  ];
BEGIN
  FOR v_user IN SELECT id FROM profiles LOOP
    -- Create random balance
    v_balance := floor(random() * 1000 + 100)::int;
    
    INSERT INTO token_balances (user_id, balance)
    VALUES (v_user.id, v_balance)
    ON CONFLICT (user_id) DO UPDATE
    SET balance = EXCLUDED.balance;
    
    -- Create 5-10 random transactions
    FOR i IN 1..floor(random() * 5 + 5)::int LOOP
      INSERT INTO token_transactions (
        user_id,
        amount,
        type,
        description,
        created_at
      )
      VALUES (
        v_user.id,
        floor(random() * 100 + 10)::int,
        v_transaction_types[1 + floor(random() * array_length(v_transaction_types, 1))],
        v_transaction_descriptions[1 + floor(random() * array_length(v_transaction_descriptions, 1))],
        random_recent_timestamp()
      );
    END LOOP;
  END LOOP;
END;
$$;

-- Create bot posts
DO $$
DECLARE
  v_bot record;
  v_content_templates text[] := ARRAY[
    'Exciting developments in #AI today! {topic} is revolutionizing how we {action}.',
    'Breaking: New research shows {topic} could transform the future of {industry}.',
    'Just discovered an amazing {topic} implementation that boosts {metric} by {number}%!',
    'Top {number} trends in {topic} you need to know about. #Tech #Innovation',
    '🚀 Big news in {industry}: {topic} adoption growing by {number}% YoY.',
    'How {topic} is changing the game in {industry}. Thread 🧵',
    'Fascinating use case: {industry} company saves {number}% using {topic}.',
    'New milestone: {topic} reaches {number}K users worldwide! 🌍',
    'Just published: Complete guide to {topic} in {industry}. Check it out! 📚',
    'Weekly {topic} update: {number} new developments you should know about.'
  ];
  v_topics text[] := ARRAY['AI', 'Machine Learning', 'Blockchain', 'Cloud Computing', 'IoT', 'Cybersecurity'];
  v_industries text[] := ARRAY['Healthcare', 'Finance', 'Manufacturing', 'Retail', 'Education'];
  v_actions text[] := ARRAY['work', 'learn', 'grow', 'innovate', 'transform'];
  v_metrics text[] := ARRAY['efficiency', 'productivity', 'performance', 'accuracy', 'revenue'];
BEGIN
  -- For each bot
  FOR v_bot IN SELECT * FROM bots LOOP
    -- Create 1-10 posts per bot
    FOR i IN 1..floor(random() * 10 + 1)::int LOOP
      INSERT INTO bot_posts (
        bot_id,
        content,
        hashtags,
        engagement_score,
        published_at
      )
      VALUES (
        v_bot.id,
        replace(
          replace(
            replace(
              replace(
                replace(
                  v_content_templates[1 + floor(random() * array_length(v_content_templates, 1))],
                  '{topic}',
                  v_topics[1 + floor(random() * array_length(v_topics, 1))]
                ),
                '{industry}',
                v_industries[1 + floor(random() * array_length(v_industries, 1))]
              ),
              '{action}',
              v_actions[1 + floor(random() * array_length(v_actions, 1))]
            ),
            '{metric}',
            v_metrics[1 + floor(random() * array_length(v_metrics, 1))]
          ),
          '{number}',
          floor(random() * 90 + 10)::text
        ),
        ARRAY[
          '#' || v_topics[1 + floor(random() * array_length(v_topics, 1))],
          '#' || v_industries[1 + floor(random() * array_length(v_industries, 1))]
        ],
        random() * 0.8 + 0.1,
        random_recent_timestamp()
      );
    END LOOP;
  END LOOP;
END;
$$;

-- Add helpful comments
COMMENT ON FUNCTION random_recent_timestamp IS 'Generates random timestamps within the last 30 days';