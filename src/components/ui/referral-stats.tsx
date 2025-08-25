import React from "react";
import { Card, CardContent } from "./card";
import { Users, Gift, TrendingUp, Clock } from "lucide-react";
import { referralService, ReferralStats } from "@/lib/referral-service";
import { toast } from "sonner";

export function ReferralStats() {
  const [stats, setStats] = React.useState<ReferralStats>({
    totalReferrals: 0,
    activeReferrals: 0,
    totalRewards: 0,
    pendingRewards: 0,
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await referralService.getReferralStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to load referral stats:", error);
        toast.error("Failed to load referral statistics");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Total Referrals</h3>
          </div>
          <p className="text-2xl font-bold">
            {loading ? "..." : stats.totalReferrals}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold">Active Referrals</h3>
          </div>
          <p className="text-2xl font-bold">
            {loading ? "..." : stats.activeReferrals}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold">Total Rewards</h3>
          </div>
          <p className="text-2xl font-bold">
            ${loading ? "..." : stats.totalRewards.toFixed(2)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            <h3 className="font-semibold">Pending Rewards</h3>
          </div>
          <p className="text-2xl font-bold">
            ${loading ? "..." : stats.pendingRewards.toFixed(2)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
