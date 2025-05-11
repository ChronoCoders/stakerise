import React from 'react';
import { Card, CardContent } from './card';
import { Button } from './button';
import { Input } from './input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './select';
import { TokenType, StakingConfig } from '@/lib/staking-abi';
import { useWeb3 } from '@/contexts/Web3Context';
import { activityService } from '@/lib/activity-service';
import { StakingHistory } from './staking-history';
import { toast } from 'sonner';
import { Coins, Clock, AlertTriangle } from 'lucide-react';

export function StakingPanel() {
  const { stakingService } = useWeb3();
  const [selectedToken, setSelectedToken] = React.useState(TokenType.STR);
  const [selectedTier, setSelectedTier] = React.useState(0);
  const [amount, setAmount] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [balance, setBalance] = React.useState('0');

  React.useEffect(() => {
    const loadBalance = async () => {
      if (stakingService) {
        try {
          const tokenBalance = await stakingService.getTokenBalance(selectedToken);
          setBalance(stakingService.convertFromTokenAmount(tokenBalance, selectedToken));
        } catch (error) {
          console.error('Failed to load balance:', error);
          toast.error('Failed to load token balance');
        }
      }
    };

    loadBalance();
  }, [stakingService, selectedToken]);

  const handleStake = async () => {
    if (!stakingService || !amount) return;

    try {
      setLoading(true);
      const tokenAmount = stakingService.convertToTokenAmount(amount, selectedToken);
      await stakingService.stakeTokens(tokenAmount, selectedToken, selectedTier);

      // Log activity
      await activityService.logActivity(
        'token_staked',
        `Staked ${amount} ${StakingConfig[selectedToken].symbol} for ${StakingConfig[selectedToken].tiers[selectedTier].duration} months`
      );

      toast.success('Tokens staked successfully');
      setAmount('');

      // Refresh balance
      const newBalance = await stakingService.getTokenBalance(selectedToken);
      setBalance(stakingService.convertFromTokenAmount(newBalance, selectedToken));
    } catch (error) {
      console.error('Failed to stake tokens:', error);
      toast.error('Failed to stake tokens');
    } finally {
      setLoading(false);
    }
  };

  const selectedConfig = StakingConfig[selectedToken];
  const selectedTierConfig = selectedConfig.tiers[selectedTier];
  const hasEnoughBalance = Number(amount) <= Number(balance);
  const meetsMinAmount = Number(amount) >= Number(selectedTierConfig.minAmount);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-6">
            <Coins className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Stake Tokens</h2>
          </div>

          <div className="space-y-6">
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Available Balance</span>
                <span className="text-sm">
                  {balance} {selectedConfig.symbol}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Select Token</label>
                <Select
                  value={selectedToken.toString()}
                  onValueChange={(value) => setSelectedToken(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TokenType)
                      .filter(([key]) => isNaN(Number(key)))
                      .map(([key, value]) => (
                        <SelectItem key={value} value={value.toString()}>
                          {StakingConfig[value].symbol}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Amount to Stake</label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`Enter amount (min. ${selectedTierConfig.minAmount})`}
                  min={selectedTierConfig.minAmount}
                  step="any"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Staking Duration</label>
                <Select
                  value={selectedTier.toString()}
                  onValueChange={(value) => setSelectedTier(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedConfig.tiers.map((tier, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {tier.duration} Months - {tier.apy}% APY
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>Lock Period: {selectedTierConfig.duration} months</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <span>Early Unstaking Penalty: {selectedTierConfig.penalty}%</span>
                </div>
              </div>

              {amount && (
                <div className="p-4 rounded-lg bg-primary/5 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Estimated APY</span>
                    <span className="font-medium">{selectedTierConfig.apy}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Estimated Monthly Rewards</span>
                    <span className="font-medium">
                      {((Number(amount) * selectedTierConfig.apy) / 12 / 100).toFixed(4)} {selectedConfig.symbol}
                    </span>
                  </div>
                </div>
              )}

              {amount && (!hasEnoughBalance || !meetsMinAmount) && (
                <p className="text-sm text-destructive">
                  {!hasEnoughBalance
                    ? 'Insufficient balance'
                    : `Minimum stake amount is ${selectedTierConfig.minAmount} ${selectedConfig.symbol}`}
                </p>
              )}

              <Button
                className="w-full"
                onClick={handleStake}
                disabled={
                  loading ||
                  !amount ||
                  !hasEnoughBalance ||
                  !meetsMinAmount
                }
              >
                {loading ? 'Staking...' : 'Stake Now'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <StakingHistory />
    </div>
  );
}