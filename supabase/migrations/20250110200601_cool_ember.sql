/*
  # Add Bot Statistics Tracking

  1. New Tables
    - `bot_stats`
      - `id` (uuid, primary key)
      - `bot_id` (uuid, references bots)
      - `owner_id` (uuid, references profiles)
      - `tokens_spent` (integer)
      - `tokens_earned` (integer)
      - `posts_count` (integer)
      - `avg_engagement` (float)
      - `total_interactions` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `bot_stats` table
    - Add policies for authenticated users to read their own stats

  3. Functions
    - Add functions to update bot statistics
*/

-- Create bot_stats table
CREATE TABLE IF NOT EXISTS bot_stats (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id uuid REFERENCES bots(id) ON DELETE CASCADE NOT NULL,
    owner_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    tokens_spent integer DEFAULT 0,
    tokens_earned integer DEFAULT 0,
    posts_count integer DEFAULT 0,
    avg_engagement float DEFAULT 0,
    total_interactions integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT positive_tokens_spent CHECK (tokens_spent >= 0),
    CONSTRAINT positive_tokens_earned CHECK (tokens_earned >= 0),
    CONSTRAINT positive_posts_count CHECK (posts_count >= 0),
    CONSTRAINT valid_engagement CHECK (avg_engagement >= 0 AND avg_engagement <= 1),
    CONSTRAINT positive_interactions CHECK (total_interactions >= 0)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS bot_stats_bot_id_idx ON bot_stats(bot_id);
CREATE INDEX IF NOT EXISTS bot_stats_owner_id_idx ON bot_stats(owner_id);

-- Enable RLS
ALTER TABLE bot_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own bot stats"
    ON bot_stats FOR SELECT
    TO authenticated
    USING (owner_id = auth.uid());

-- Function to initialize bot stats
CREATE OR REPLACE FUNCTION initialize_bot_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO bot_stats (bot_id, owner_id)
    VALUES (NEW.id, NEW.owner_id);
    RETURN NEW;
END;
$$;

-- Create trigger to initialize stats when a new bot is created
DROP TRIGGER IF EXISTS on_bot_created ON bots;
CREATE TRIGGER on_bot_created
    AFTER INSERT ON bots
    FOR EACH ROW
    EXECUTE FUNCTION initialize_bot_stats();

-- Function to update bot stats
CREATE OR REPLACE FUNCTION update_bot_stats(
    p_bot_id uuid,
    p_tokens_spent integer DEFAULT 0,
    p_tokens_earned integer DEFAULT 0,
    p_engagement float DEFAULT 0,
    p_interactions integer DEFAULT 0
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_owner_id uuid;
BEGIN
    -- Get bot owner
    SELECT owner_id INTO v_owner_id
    FROM bots
    WHERE id = p_bot_id;

    -- Check authorization
    IF v_owner_id != auth.uid() THEN
        RETURN false;
    END IF;

    -- Update stats
    UPDATE bot_stats
    SET
        tokens_spent = tokens_spent + p_tokens_spent,
        tokens_earned = tokens_earned + p_tokens_earned,
        posts_count = CASE 
            WHEN p_tokens_spent > 0 THEN posts_count + 1
            ELSE posts_count
        END,
        avg_engagement = CASE 
            WHEN posts_count = 0 THEN p_engagement
            ELSE (avg_engagement * posts_count + p_engagement) / (posts_count + 1)
        END,
        total_interactions = total_interactions + p_interactions,
        updated_at = now()
    WHERE bot_id = p_bot_id;

    RETURN true;
END;
$$;

-- Initialize stats for existing bots
INSERT INTO bot_stats (bot_id, owner_id)
SELECT id, owner_id
FROM bots b
WHERE NOT EXISTS (
    SELECT 1 
    FROM bot_stats bs 
    WHERE bs.bot_id = b.id
);

-- Add helpful comments
COMMENT ON TABLE bot_stats IS 'Tracks statistics for each bot including token usage and engagement metrics';
COMMENT ON FUNCTION update_bot_stats IS 'Updates bot statistics with new activity data';