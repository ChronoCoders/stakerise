import React from "react";
import { Card, CardContent } from "./card";
import { Button } from "./button";
import { Input } from "./input";
import { Copy, RefreshCw } from "lucide-react";
import { referralService } from "@/lib/referral-service";
import { toast } from "sonner";

export function ReferralCode() {
  const [code, setCode] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  const loadCode = async () => {
    try {
      setLoading(true);
      const referralCode = await referralService.getReferralCode();
      if (referralCode) {
        setCode(referralCode.code);
      } else {
        const newCode = await referralService.generateReferralCode();
        setCode(newCode.code);
      }
    } catch (error) {
      console.error("Failed to load referral code:", error);
      toast.error("Failed to load referral code");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadCode();
  }, []);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy to clipboard");
    }
  };

  const referralLink = code ? `${window.location.origin}?ref=${code}` : "";

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Your Referral Code</h2>
          <Button variant="outline" onClick={loadCode} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Referral Code
            </label>
            <div className="flex gap-2">
              <Input value={code || ""} readOnly />
              <Button
                variant="outline"
                onClick={() => code && handleCopy(code)}
                disabled={!code}
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
              <Input value={referralLink} readOnly />
              <Button
                variant="outline"
                onClick={() => handleCopy(referralLink)}
                disabled={!code}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-primary/5">
            <h3 className="font-medium mb-2">How it works</h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Share your referral code or link with friends</li>
              <li>• When they sign up and stake, you both earn rewards</li>
              <li>• Earn 5% of their staking rewards</li>
              <li>• No limit on the number of referrals</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
