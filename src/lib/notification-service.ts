import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export interface NotificationSettings {
  kyc_status_updates: boolean;
  document_updates: boolean;
  security_alerts: boolean;
  marketing_updates: boolean;
  email: string;
}

export interface NotificationHistory {
  id: string;
  type: string;
  subject: string;
  content: string;
  status: "pending" | "sent" | "failed";
  sent_at: string | null;
  error: string | null;
  created_at: string;
}

export class NotificationService {
  async getSettings(): Promise<NotificationSettings | null> {
    const { data, error } = await supabase
      .from("notification_settings")
      .select("*")
      .single();

    if (error) throw error;
    return data;
  }

  async updateSettings(settings: Partial<NotificationSettings>): Promise<void> {
    const { error } = await supabase
      .from("notification_settings")
      .update(settings)
      .eq("user_id", supabase.auth.user()?.id);

    if (error) throw error;
  }

  async getNotificationHistory(): Promise<NotificationHistory[]> {
    const { data, error } = await supabase
      .from("notification_history")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async sendEmail(
    type: string,
    to: string,
    subject: string,
    content: string,
  ): Promise<void> {
    const response = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to,
        subject,
        content,
        type,
        userId: supabase.auth.user()?.id,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to send email");
    }
  }
}

export const notificationService = new NotificationService();
