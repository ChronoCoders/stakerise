import React from "react";
import { Card, CardContent } from "./card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "./table";
import { Button } from "./button";
import { RefreshCw } from "lucide-react";
import {
  referralService,
  Referral,
  ReferralReward,
} from "@/lib/referral-service";
import { toast } from "sonner";

export function ReferralHistory() {
  const [referrals, setReferrals] = React.useState<Referral[]>([]);
  const [rewards, setRewards] = React.useState<ReferralReward[]>([]);
  const [loading, setLoading] = React.useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [referralData, rewardData] = await Promise.all([
        referralService.getReferrals(),
        referralService.getRewards(),
      ]);
      setReferrals(referralData);
      setRewards(rewardData);
    } catch (error) {
      console.error("Failed to load referral data:", error);
      toast.error("Failed to load referral history");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Referral History</h2>
          <Button variant="outline" onClick={loadData} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Referred User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reward</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referrals.map((referral) => {
                const reward = rewards.find(
                  (r) => r.referral_id === referral.id,
                );

                return (
                  <TableRow key={referral.id}>
                    <TableCell>
                      {new Date(referral.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-mono">
                      {referral.referred_id.slice(0, 6)}...
                      {referral.referred_id.slice(-4)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                        ${
                          referral.status === "active"
                            ? "bg-green-100 text-green-800"
                            : referral.status === "rewarded"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {referral.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {reward ? (
                        <div className="flex items-center gap-2">
                          <span>
                            {reward.amount} {reward.token_type}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                            ${reward.status === "processed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                          >
                            {reward.status}
                          </span>
                        </div>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {referrals.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground"
                  >
                    {loading ? "Loading referrals..." : "No referrals found"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
