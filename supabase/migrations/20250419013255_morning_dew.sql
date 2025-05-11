/*
  # Activity Log Schema

  1. New Tables
    - `activity_log`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `action` (text)
      - `details` (text)
      - `ip_address` (text)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on `activity_log` table
    - Add policy for users to view their own activity log
*/

-- Create activity log table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'activity_log'
  ) THEN
    CREATE TABLE activity_log (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
      action text NOT NULL,
      details text,
      ip_address text,
      created_at timestamptz DEFAULT now()
    );

    -- Enable RLS
    ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

    -- Create policy
    CREATE POLICY "Users can view their own activity log"
      ON activity_log
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;