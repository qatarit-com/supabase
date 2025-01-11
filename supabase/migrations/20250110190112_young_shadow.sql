/*
  # Fix user creation trigger

  1. Changes
    - Update handle_new_user function to safely handle missing metadata
    - Add error handling for null values
    - Ensure proper type casting

  2. Security
    - Maintain existing RLS policies
    - Keep security definer setting for proper permissions
*/

-- Drop existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Update the function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, name)
  VALUES (
    new.id,
    COALESCE(new.email, ''),
    COALESCE(
      CASE 
        WHEN new.raw_user_meta_data->>'name' IS NOT NULL THEN new.raw_user_meta_data->>'name'
        ELSE 'User_' || substr(new.id::text, 1, 8)
      END,
      'Anonymous'
    )
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();