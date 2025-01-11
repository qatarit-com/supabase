/*
  # Fix database errors and improve authentication

  1. Changes
    - Drop and recreate profiles table with proper constraints
    - Add better error handling for concurrent operations
    - Add proper cascading for user deletion
    - Improve indexes

  2. Security
    - Maintain RLS policies
    - Add proper constraints
*/

-- Recreate profiles table with proper constraints
CREATE TABLE IF NOT EXISTS new_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT valid_name CHECK (length(trim(name)) >= 2)
);

-- Copy data if old table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'profiles') THEN
    INSERT INTO new_profiles (id, email, name, created_at, updated_at)
    SELECT id, email, name, created_at, updated_at
    FROM profiles;
  END IF;
END $$;

-- Drop old table and rename new one
DROP TABLE IF EXISTS profiles CASCADE;
ALTER TABLE new_profiles RENAME TO profiles;

-- Create indexes
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE INDEX IF NOT EXISTS profiles_created_at_idx ON profiles(created_at);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Recreate policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Improve trigger function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  profile_name text;
  max_retries constant int := 3;
  current_try int := 0;
  last_error text;
BEGIN
  -- Input validation
  IF new.email IS NULL OR new.email = '' THEN
    RAISE EXCEPTION 'Email is required';
  END IF;

  -- Clean and validate email
  IF new.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;

  -- Get or generate name
  profile_name := COALESCE(
    NULLIF(TRIM(new.raw_user_meta_data->>'name'), ''),
    'User_' || substr(new.id::text, 1, 8)
  );

  -- Validate name
  IF length(profile_name) < 2 THEN
    RAISE EXCEPTION 'Name must be at least 2 characters long';
  END IF;

  -- Retry loop for handling race conditions
  LOOP
    BEGIN
      INSERT INTO profiles (id, email, name)
      VALUES (new.id, lower(new.email), profile_name);
      
      RETURN new;
    EXCEPTION
      WHEN unique_violation THEN
        RAISE EXCEPTION 'User with email % already exists', new.email;
      WHEN check_violation THEN
        RAISE EXCEPTION 'Invalid profile data: %', SQLERRM;
      WHEN OTHERS THEN
        last_error := SQLERRM;
        current_try := current_try + 1;
        
        IF current_try >= max_retries THEN
          RAISE EXCEPTION 'Failed to create profile after % attempts. Last error: %', max_retries, last_error;
        END IF;
        
        -- Wait a bit before retrying (exponential backoff)
        PERFORM pg_sleep(power(2, current_try)::int * 0.1);
        CONTINUE;
    END;
  END LOOP;
END;
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Add helpful comments
COMMENT ON TABLE profiles IS 'User profiles with validation and constraints';
COMMENT ON FUNCTION handle_new_user() IS 'Creates user profile with retries and validation';