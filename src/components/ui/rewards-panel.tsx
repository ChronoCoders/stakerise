import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TokenType, StakingConfig } from '@/lib/staking-abi';
import { Coins, ArrowRight } from 'lucide-react';

interface Reward {
  stakeIndex: number;
  tokenType: TokenType;
  amount: string;
  nextClaimDate: Date;
}

interface RewardsPanelProps {
  rewards: Reward[];
  onClaim: (stakeIndex: number) => Promise<void>;
  onCompound: (stakeIndex: number) => Promise<void>;
}

export function RewardsPanel({ rewards, onClaim, onCompound }: RewardsPanelProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Available Rewards</h2>
          <Coins className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="space-y-4">
          {rewards.map((reward) => (
            <div
              key={reward.stakeIndex}
              className="p-4 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {reward.amount} {StakingConfig[reward.tokenType].symbol}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    (Stake #{reward.stakeIndex + 1})
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  Next claim: {reward.nextClaimDate.toLocaleDateString()}
                </span>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => onCompound(reward.stakeIndex)}
                >
                  Compound
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => onClaim(reward.stakeIndex)}
                >
                  Claim <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {rewards.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              No rewards available for claiming
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}