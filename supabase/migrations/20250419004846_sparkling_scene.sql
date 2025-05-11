/*
  # KYC/AML Schema Implementation

  1. New Tables
    - `kyc_status`
      - Tracks user verification status
      - Stores verification documents and status
      - Maintains verification history
    
    - `kyc_documents`
      - Stores document references and metadata
      - Links to user profiles
      - Tracks document validity and expiration

  2. Security
    - Enable RLS on all tables
    - Only allow users to read their own data
    - Admin access for verification team

  3. Changes
    - Add verification requirements
    - Document tracking
    - Status management
*/

-- Create enum for KYC status
CREATE TYPE kyc_verification_status AS ENUM (
  'pending',
  'in_review',
  'approved',
  'rejected',
  'expired'
);

-- Create enum for document types
CREATE TYPE kyc_document_type AS ENUM (
  'passport',
  'drivers_license',
  'national_id',
  'proof_of_address'
);

-- Create KYC status table
CREATE TABLE IF NOT EXISTS kyc_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  status kyc_verification_status NOT NULL DEFAULT 'pending',
  risk_level smallint DEFAULT 0,
  verification_date timestamptz,
  expiration_date timestamptz,
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_risk_level CHECK (risk_level BETWEEN 0 AND 5)
);

-- Create KYC documents table
CREATE TABLE IF NOT EXISTS kyc_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type kyc_document_type NOT NULL,
  document_number text,
  issuing_country text,
  issue_date date,
  expiry_date date,
  document_url text,
  verification_status kyc_verification_status DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create verification history table
CREATE TABLE IF NOT EXISTS kyc_verification_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  status kyc_verification_status NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE kyc_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_verification_history ENABLE ROW LEVEL SECURITY;

-- Policies for kyc_status
CREATE POLICY "Users can view their own KYC status"
  ON kyc_status
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for kyc_documents
CREATE POLICY "Users can view their own documents"
  ON kyc_documents
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents"
  ON kyc_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policies for verification history
CREATE POLICY "Users can view their verification history"
  ON kyc_verification_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update kyc_status updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_kyc_status_updated_at
  BEFORE UPDATE ON kyc_status
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kyc_documents_updated_at
  BEFORE UPDATE ON kyc_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();