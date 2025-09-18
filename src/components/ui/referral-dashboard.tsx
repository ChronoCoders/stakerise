import React from "react";
import { ReferralStats } from "./referral-stats";
import { ReferralCode } from "./referral-code";
import { ReferralHistory } from "./referral-history";

export function ReferralDashboard() {
  return (
    <div className="space-y-6">
      <ReferralStats />
      <ReferralCode />
      <ReferralHistory />
    </div>
  );
}
