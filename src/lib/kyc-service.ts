import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export type VerificationStatus = 'pending' | 'in_review' | 'approved' | 'rejected' | 'expired';
export type DocumentType = 'passport' | 'drivers_license' | 'national_id' | 'proof_of_address';

export interface KYCStatus {
  id: string;
  status: VerificationStatus;
  risk_level: number;
  verification_date: string | null;
  expiration_date: string | null;
  rejection_reason: string | null;
}

export interface KYCDocument {
  id: string;
  document_type: DocumentType;
  document_number: string;
  issuing_country: string;
  issue_date: string;
  expiry_date: string;
  document_url: string;
  verification_status: VerificationStatus;
}

export interface VerificationRequest {
  id: string;
  user_id: string;
  status: VerificationStatus;
  risk_level: number;
  documents: KYCDocument[];
  created_at: string;
  updated_at: string;
  verification_date: string | null;
  expiration_date: string | null;
}

export class KYCService {
  async getStatus(): Promise<KYCStatus | null> {
    const { data, error } = await supabase
      .from('kyc_status')
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async getDocuments(): Promise<KYCDocument[]> {
    const { data, error } = await supabase
      .from('kyc_documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async uploadDocument(
    documentType: DocumentType,
    file: File,
    metadata: Omit<KYCDocument, 'id' | 'document_url' | 'verification_status'>
  ): Promise<KYCDocument> {
    // Upload document to storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${documentType}_${Date.now()}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('kyc-documents')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Create document record
    const { data, error } = await supabase
      .from('kyc_documents')
      .insert({
        ...metadata,
        document_type: documentType,
        document_url: uploadData.path,
        verification_status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getVerificationHistory(): Promise<any[]> {
    const { data, error } = await supabase
      .from('kyc_verification_history')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Admin functions
  async getAllVerifications(): Promise<VerificationRequest[]> {
    const { data: statusData, error: statusError } = await supabase
      .from('kyc_status')
      .select('*')
      .order('created_at', { ascending: false });

    if (statusError) throw statusError;

    const verifications: VerificationRequest[] = [];
    
    for (const status of statusData) {
      const { data: documents, error: docError } = await supabase
        .from('kyc_documents')
        .select('*')
        .eq('user_id', status.user_id);

      if (docError) throw docError;

      verifications.push({
        ...status,
        documents: documents || []
      });
    }

    return verifications;
  }

  async updateVerificationStatus(
    userId: string,
    status: VerificationStatus,
    riskLevel?: number
  ): Promise<void> {
    const updates: any = {
      status,
      verification_date: status === 'approved' ? new Date().toISOString() : null,
      expiration_date: status === 'approved' ? 
        new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : null
    };

    if (typeof riskLevel === 'number') {
      updates.risk_level = riskLevel;
    }

    const { error: statusError } = await supabase
      .from('kyc_status')
      .update(updates)
      .eq('user_id', userId);

    if (statusError) throw statusError;

    // Update all documents status
    const { error: docError } = await supabase
      .from('kyc_documents')
      .update({ verification_status: status })
      .eq('user_id', userId);

    if (docError) throw docError;

    // Add to verification history
    const { error: historyError } = await supabase
      .from('kyc_verification_history')
      .insert({
        user_id: userId,
        status,
        notes: `Status updated to ${status}${
          typeof riskLevel === 'number' ? ` with risk level ${riskLevel}` : ''
        }`
      });

    if (historyError) throw historyError;
  }
}

export const kycService = new KYCService();