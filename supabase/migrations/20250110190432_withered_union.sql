/*
  # Fix Authentication Schema

  1. Changes
    - Add NOT NULL constraints to critical fields
    - Add unique constraint to email
    - Add default values for better data consistency
    - Improve error handling in trigger function
    - Add indexes for better query performance

  2. Security
    - Maintain existing RLS policies
    - Add additional validation in trigger function
*/

-- Drop existing trigger first to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Modify profiles table
ALTER TABLE profiles
  ALTER COLUMN email SET NOT NULL,
  ALTER COLUMN name SET DEFAULT 'Anonymous',
  ADD CONSTRAINT profiles_email_unique UNIQUE (email);

-- Add index for email lookups
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles (email);

-- Update the function with better error handling and validation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Validate email
  IF new.email IS NULL THEN
    RAISE EXCEPTION 'Email cannot be null';
  END IF;

  -- Insert profile with validated data
  INSERT INTO profiles (id, email, name)
  VALUES (
    new.id,
    new.email,
    COALESCE(
      NULLIF(TRIM(new.raw_user_meta_data->>'name'), ''),
      'User_' || substr(new.id::text, 1, 8)
    )
  );
  
  RETURN new;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'User with this email already exists';
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error creating user profile: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Add helpful comments
COMMENT ON FUNCTION handle_new_user() IS 'Creates a user profile when a new user signs up';
COMMENT ON TABLE profiles IS 'User profiles with additional information';
COMMENT ON COLUMN profiles.email IS 'User email address (unique)';
COMMENT ON COLUMN profiles.name IS 'Display name for the user';