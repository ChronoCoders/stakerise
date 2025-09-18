import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailPayload {
  to: string;
  subject: string;
  content: string;
  type: string;
  userId: string;
}

const emailTemplates = {
  kyc_approved: (name: string) => ({
    subject: "KYC Verification Approved",
    content: `Dear ${name},\n\nYour KYC verification has been approved. You can now access all platform features.\n\nBest regards,\nStakeRise Team`,
  }),
  kyc_rejected: (name: string, reason: string) => ({
    subject: "KYC Verification Rejected",
    content: `Dear ${name},\n\nYour KYC verification has been rejected for the following reason:\n\n${reason}\n\nPlease review and resubmit your documents.\n\nBest regards,\nStakeRise Team`,
  }),
  document_received: (name: string, docType: string) => ({
    subject: "Document Received",
    content: `Dear ${name},\n\nWe have received your ${docType} document. Our team will review it shortly.\n\nBest regards,\nStakeRise Team`,
  }),
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );

    const { to, subject, content, type, userId }: EmailPayload =
      await req.json();

    // Create notification history record
    const { error: historyError } = await supabase
      .from("notification_history")
      .insert({
        user_id: userId,
        type,
        subject,
        content,
        status: "pending",
      });

    if (historyError) {
      throw new Error(
        `Failed to create notification history: ${historyError.message}`,
      );
    }

    // Here you would integrate with your email service provider
    // For example, using Resend, SendGrid, or other email services

    // Simulate email sending (replace with actual email service)
    const emailSent = true;

    if (emailSent) {
      // Update notification status
      await supabase
        .from("notification_history")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("type", type);

      return new Response(
        JSON.stringify({ success: true, message: "Email sent successfully" }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    } else {
      throw new Error("Failed to send email");
    }
  } catch (error) {
    console.error("Error sending email:", error);

    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});
