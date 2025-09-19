import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  details: string;
  ip_address: string | null;
  created_at: string;
}

export class ActivityService {
  async getActivityLog(): Promise<ActivityLog[]> {
    const { data, error } = await supabase
      .from("activity_log")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async logActivity(action: string, details: string): Promise<void> {
    const { error } = await supabase.from("activity_log").insert({
      action,
      details,
      ip_address: await this.getClientIP(),
    });

    if (error) throw error;
  }

  private async getClientIP(): Promise<string | null> {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error("Failed to get client IP:", error);
      return null;
    }
  }

  // Helper method to format activity details
  formatActivityDetails(action: string, params: Record<string, any>): string {
    const templates: Record<string, (p: any) => string> = {
      token_staked: (p) =>
        `Staked ${p.amount} ${p.token} for ${p.duration} months`,
      token_unstaked: (p) => `Unstaked ${p.amount} ${p.token}`,
      rewards_claimed: (p) => `Claimed ${p.amount} ${p.token} rewards`,
      kyc_submitted: () => "Submitted KYC documents for verification",
      kyc_updated: (p) => `KYC status updated to ${p.status}`,
      settings_updated: (p) => `Updated ${p.setting} settings`,
      login: (p) => `Logged in from ${p.browser} on ${p.os}`,
      logout: () => "Logged out",
    };

    return templates[action]?.(params) || action;
  }
}

export const activityService = new ActivityService();
