/*
  # Add reporting functionality

  1. New Tables
    - `reports`
      - `id` (uuid, primary key)
      - `reporter_id` (uuid, references profiles)
      - `reported_id` (uuid, references profiles)
      - `reported_bot_id` (uuid, references bots)
      - `type` (text, enum: 'user', 'bot')
      - `reason` (text)
      - `status` (text, enum: 'pending', 'resolved', 'dismissed')
      - `details` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `resolved_by` (uuid, references profiles)
      - `resolution_notes` (text)

  2. Security
    - Enable RLS on reports table
    - Add policies for report creation and viewing
*/

-- Add is_admin column to profiles first
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- Create reports table
CREATE TABLE reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES profiles(id) NOT NULL,
  reported_id uuid REFERENCES profiles(id),
  reported_bot_id uuid REFERENCES bots(id),
  type text NOT NULL CHECK (type IN ('user', 'bot')),
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  details text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  resolved_by uuid REFERENCES profiles(id),
  resolution_notes text,
  CONSTRAINT valid_report CHECK (
    (type = 'user' AND reported_id IS NOT NULL AND reported_bot_id IS NULL) OR
    (type = 'bot' AND reported_bot_id IS NOT NULL AND reported_id IS NULL)
  )
);

-- Create indexes
CREATE INDEX reports_reporter_id_idx ON reports(reporter_id);
CREATE INDEX reports_reported_id_idx ON reports(reported_id);
CREATE INDEX reports_reported_bot_id_idx ON reports(reported_bot_id);
CREATE INDEX reports_status_idx ON reports(status);

-- Enable RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Users can view their own reports"
  ON reports FOR SELECT
  TO authenticated
  USING (reporter_id = auth.uid());

CREATE POLICY "Admins can view all reports"
  ON reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND is_admin = true
    )
  );

CREATE POLICY "Admins can update reports"
  ON reports FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND is_admin = true
    )
  );

-- Function to submit a report
CREATE OR REPLACE FUNCTION submit_report(
  p_type text,
  p_reported_id uuid,
  p_reason text,
  p_details text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_report_id uuid;
BEGIN
  -- Validate input
  IF p_type NOT IN ('user', 'bot') THEN
    RAISE EXCEPTION 'Invalid report type';
  END IF;

  IF p_reason IS NULL OR trim(p_reason) = '' THEN
    RAISE EXCEPTION 'Reason is required';
  END IF;

  -- Create report
  INSERT INTO reports (
    reporter_id,
    reported_id,
    reported_bot_id,
    type,
    reason,
    details
  )
  VALUES (
    auth.uid(),
    CASE WHEN p_type = 'user' THEN p_reported_id ELSE NULL END,
    CASE WHEN p_type = 'bot' THEN p_reported_id ELSE NULL END,
    p_type,
    p_reason,
    p_details
  )
  RETURNING id INTO v_report_id;

  RETURN v_report_id;
END;
$$;

-- Function to resolve a report
CREATE OR REPLACE FUNCTION resolve_report(
  p_report_id uuid,
  p_status text,
  p_notes text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate input
  IF p_status NOT IN ('resolved', 'dismissed') THEN
    RAISE EXCEPTION 'Invalid resolution status';
  END IF;

  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Only admins can resolve reports';
  END IF;

  -- Update report
  UPDATE reports
  SET
    status = p_status,
    resolved_by = auth.uid(),
    resolution_notes = p_notes,
    updated_at = now()
  WHERE id = p_report_id;

  RETURN FOUND;
END;
$$;

-- Add helpful comments
COMMENT ON TABLE reports IS 'Stores user and bot reports';
COMMENT ON FUNCTION submit_report IS 'Submits a new report for a user or bot';
COMMENT ON FUNCTION resolve_report IS 'Resolves or dismisses a report';