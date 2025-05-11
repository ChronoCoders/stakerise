/*
  # Add activity log table

  1. New Tables
    - `activity_log`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `action` (text)
      - `details` (text)
      - `ip_address` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `activity_log` table
    - Add policy for authenticated users to read their own activity log
*/

CREATE TABLE IF NOT EXISTS activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  details text,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own activity log"
  ON activity_log
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);