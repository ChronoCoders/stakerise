import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export interface ReferralCode {
  id: string;
  code: string;
  active: boolean;
  created_at: string;
  expires_at: string | null;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  code_id: string;
  status: "pending" | "active" | "rewarded";
  created_at: string;
  activated_at: string | null;
}

export interface ReferralReward {
  id: string;
  referral_id: string;
  amount: number;
  token_type: string;
  status: "pending" | "processed";
  created_at: string;
  processed_at: string | null;
}

export interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalRewards: number;
  pendingRewards: number;
}

export class ReferralService {
  async generateReferralCode(): Promise<ReferralCode> {
    const code = this.generateUniqueCode();

    const { data, error } = await supabase
      .from("referral_codes")
      .insert({
        code,
        active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getReferralCode(): Promise<ReferralCode | null> {
    const { data, error } = await supabase
      .from("referral_codes")
      .select("*")
      .eq("active", true)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getReferrals(): Promise<Referral[]> {
    const { data, error } = await supabase
      .from("referrals")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getRewards(): Promise<ReferralReward[]> {
    const { data, error } = await supabase
      .from("referral_rewards")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getReferralStats(): Promise<ReferralStats> {
    const [referrals, rewards] = await Promise.all([
      this.getReferrals(),
      this.getRewards(),
    ]);

    return {
      totalReferrals: referrals.length,
      activeReferrals: referrals.filter((r) => r.status === "active").length,
      totalRewards: rewards.reduce((sum, r) => sum + r.amount, 0),
      pendingRewards: rewards
        .filter((r) => r.status === "pending")
        .reduce((sum, r) => sum + r.amount, 0),
    };
  }

  private generateUniqueCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const length = 8;
    let code = "";

    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return code;
  }
}

export const referralService = new ReferralService();
