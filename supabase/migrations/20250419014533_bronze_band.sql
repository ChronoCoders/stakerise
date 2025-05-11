-- Create activity log table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'activity_log'
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
  END IF;
END $$;

-- Create policies if they don't exist
DO $$ 
BEGIN
  -- Select policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'activity_log' 
    AND policyname = 'Users can view their own activity log'
  ) THEN
    CREATE POLICY "Users can view their own activity log"
      ON activity_log
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  -- Insert policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'activity_log' 
    AND policyname = 'Users can insert their own activity log'
  ) THEN
    CREATE POLICY "Users can insert their own activity log"
      ON activity_log
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;