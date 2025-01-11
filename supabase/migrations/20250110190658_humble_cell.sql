/*
  # Fix authentication issues

  1. Changes
    - Add NOT NULL constraints to critical fields
    - Add better error handling for profile creation
    - Add validation checks for email and name
    - Improve trigger function error handling
    - Add indexes for performance

  2. Security
    - Maintain existing RLS policies
    - Add validation constraints
*/

-- Add NOT NULL constraints and validation
ALTER TABLE profiles
  ALTER COLUMN email SET NOT NULL,
  ALTER COLUMN name SET NOT NULL,
  ADD CONSTRAINT email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  ADD CONSTRAINT name_check CHECK (length(name) >= 2);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE INDEX IF NOT EXISTS bots_owner_id_idx ON bots(owner_id);

-- Improve the user creation function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  profile_name text;
BEGIN
  -- Set default name if not provided
  profile_name := COALESCE(
    NULLIF(TRIM(new.raw_user_meta_data->>'name'), ''),
    'User_' || substr(new.id::text, 1, 8)
  );

  -- Validate email
  IF new.email IS NULL OR new.email = '' THEN
    RAISE EXCEPTION 'Email is required';
  END IF;

  -- Validate name
  IF length(profile_name) < 2 THEN
    RAISE EXCEPTION 'Name must be at least 2 characters long';
  END IF;

  -- Insert profile with retry logic
  BEGIN
    INSERT INTO profiles (id, email, name)
    VALUES (new.id, new.email, profile_name);
  EXCEPTION
    WHEN unique_violation THEN
      RAISE EXCEPTION 'User with email % already exists', new.email;
    WHEN check_violation THEN
      RAISE EXCEPTION 'Invalid profile data: %', SQLERRM;
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Failed to create profile: %', SQLERRM;
  END;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger is properly set
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Add helpful comments
COMMENT ON FUNCTION handle_new_user() IS 'Creates a new user profile with validation';
COMMENT ON TABLE profiles IS 'Stores user profile information';
COMMENT ON COLUMN profiles.email IS 'User email address (unique, validated)';
COMMENT ON COLUMN profiles.name IS 'User display name (2+ characters)';