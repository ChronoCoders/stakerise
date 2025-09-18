import React from "react";
import { Card, CardContent } from "./card";
import { Button } from "./button";
import { Input } from "./input";
import { Users, Copy, Share2 } from "lucide-react";
import { toast } from "sonner";

interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  pendingReferrals: number;
  totalEarnings: number;
  referralCode: string;
  referralLink: string;
}

const SAMPLE_STATS: ReferralStats = {
  totalReferrals: 12,
  activeReferrals: 8,
  pendingReferrals: 4,
  totalEarnings: 500,
  referralCode: "STR25XYZ",
  referralLink: "https://stakerise.com/ref/STR25XYZ",
};

export function ReferralProgram() {
  const copyToClipboard = (text: string, type: "code" | "link") => {
    navigator.clipboard.writeText(text);
    toast.success(
      `${type === "code" ? "Referral code" : "Referral link"} copied to clipboard`,
    );
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-6">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Referral Program</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground mb-1">
              Total Referrals
            </p>
            <p className="text-2xl font-semibold">
              {SAMPLE_STATS.totalReferrals}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground mb-1">Total Earnings</p>
            <p className="text-2xl font-semibold">
              ${SAMPLE_STATS.totalEarnings}
            </p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Your Referral Code
            </label>
            <div className="flex gap-2">
              <Input value={SAMPLE_STATS.referralCode} readOnly />
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  copyToClipboard(SAMPLE_STATS.referralCode, "code")
                }
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">
              Referral Link
            </label>
            <div className="flex gap-2">
              <Input value={SAMPLE_STATS.referralLink} readOnly />
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  copyToClipboard(SAMPLE_STATS.referralLink, "link")
                }
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Button className="w-full">
            <Share2 className="w-4 h-4 mr-2" /> Share Referral Link
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Earn 5% of your referrals' staking rewards
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
