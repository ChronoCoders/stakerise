/*
  # Referral System Schema

  1. New Tables
    - `referral_codes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `code` (text, unique)
      - `active` (boolean)
      - `created_at` (timestamp)
      - `expires_at` (timestamp, optional)

    - `referrals`
      - `id` (uuid, primary key)
      - `referrer_id` (uuid, references users)
      - `referred_id` (uuid, references users)
      - `code_id` (uuid, references referral_codes)
      - `status` (enum: pending, active, rewarded)
      - `created_at` (timestamp)
      - `activated_at` (timestamp)

    - `referral_rewards`
      - `id` (uuid, primary key)
      - `referral_id` (uuid, references referrals)
      - `amount` (numeric)
      - `token_type` (text)
      - `status` (enum: pending, processed)
      - `created_at` (timestamp)
      - `processed_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for referral management
*/

-- Create referral status enum
CREATE TYPE referral_status AS ENUM ('pending', 'active', 'rewarded');
CREATE TYPE reward_status AS ENUM ('pending', 'processed');

-- Create referral_codes table
CREATE TABLE IF NOT EXISTS referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  code text UNIQUE NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  CONSTRAINT valid_code CHECK (code ~ '^[A-Z0-9]{8,12}$')
);

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  code_id uuid REFERENCES referral_codes(id) ON DELETE CASCADE,
  status referral_status DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  activated_at timestamptz,
  CONSTRAINT unique_referred_user UNIQUE (referred_id)
);

-- Create referral_rewards table
CREATE TABLE IF NOT EXISTS referral_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id uuid REFERENCES referrals(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  token_type text NOT NULL,
  status reward_status DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  CONSTRAINT positive_amount CHECK (amount > 0)
);

-- Enable RLS
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;

-- Create policies for referral_codes
CREATE POLICY "Users can view their own referral codes"
  ON referral_codes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own referral codes"
  ON referral_codes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policies for referrals
CREATE POLICY "Users can view referrals they're involved in"
  ON referrals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Users can create referrals"
  ON referrals
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policies for referral_rewards
CREATE POLICY "Users can view their own rewards"
  ON referral_rewards
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM referrals
      WHERE referrals.id = referral_rewards.referral_id
      AND (referrals.referrer_id = auth.uid() OR referrals.referred_id = auth.uid())
    )
  );

-- Create indexes
CREATE INDEX idx_referral_codes_user ON referral_codes(user_id);
CREATE INDEX idx_referral_codes_code ON referral_codes(code);
CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred ON referrals(referred_id);
CREATE INDEX idx_referrals_code ON referrals(code_id);
CREATE INDEX idx_referral_rewards_referral ON referral_rewards(referral_id);