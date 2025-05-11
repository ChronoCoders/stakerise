/*
  # Add email notifications support
  
  1. New Tables
    - `notification_settings`
      - `user_id` (uuid, primary key)
      - `email` (text)
      - `kyc_status_updates` (boolean)
      - `document_updates` (boolean)
      - `security_alerts` (boolean)
      - `marketing_updates` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `notification_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid)
      - `type` (text)
      - `subject` (text)
      - `content` (text)
      - `status` (text)
      - `sent_at` (timestamp)
      - `error` (text)
  
  2. Security
    - Enable RLS on both tables
    - Add policies for user access
*/

-- Create notification settings table
CREATE TABLE IF NOT EXISTS notification_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  kyc_status_updates boolean DEFAULT true,
  document_updates boolean DEFAULT true,
  security_alerts boolean DEFAULT true,
  marketing_updates boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create notification history table
CREATE TABLE IF NOT EXISTS notification_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  subject text NOT NULL,
  content text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  sent_at timestamptz,
  error text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_history ENABLE ROW LEVEL SECURITY;

-- Create policies for notification_settings
CREATE POLICY "Users can view their own notification settings"
  ON notification_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification settings"
  ON notification_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for notification_history
CREATE POLICY "Users can view their own notification history"
  ON notification_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at
CREATE TRIGGER update_notification_settings_updated_at
  BEFORE UPDATE ON notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();