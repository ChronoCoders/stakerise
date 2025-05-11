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
import { 
  Coins, Clock, AlertTriangle, TrendingUp, 
  Calculator, RefreshCw, CheckCircle2, Loader2 
} from 'lucide-react';

export function StakingInterface() {
  const { stakingService } = useWeb3();
  const [selectedToken, setSelectedToken] = React.useState(TokenType.STR);
  const [selectedTier, setSelectedTier] = React.useState(0);
  const [amount, setAmount] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [balance, setBalance] = React.useState('0');
  const [showConfirmation, setShowConfirmation] = React.useState(false);
  const [compoundRewards, setCompoundRewards] = React.useState(true);

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
      setShowConfirmation(false);

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

  const calculateRewards = () => {
    if (!amount) return { monthly: '0', total: '0', apy: selectedTierConfig.apy };

    const principal = Number(amount);
    const monthlyRate = selectedTierConfig.apy / 12 / 100;
    const months = selectedTierConfig.duration;

    if (compoundRewards) {
      // Compound monthly
      const total = principal * Math.pow(1 + monthlyRate, months);
      const monthly = (total - principal) / months;
      const actualAPY = ((total / principal - 1) * 100).toFixed(2);
      return {
        monthly: monthly.toFixed(4),
        total: (total - principal).toFixed(4),
        apy: actualAPY
      };
    } else {
      // Simple interest
      const monthly = principal * monthlyRate;
      const total = monthly * months;
      return {
        monthly: monthly.toFixed(4),
        total: total.toFixed(4),
        apy: selectedTierConfig.apy
      };
    }
  };

  const rewards = calculateRewards();

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Stake Tokens</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Lock Period</span>
                  </div>
                  <p className="text-2xl font-bold">{selectedTierConfig.duration} months</p>
                </div>

                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Effective APY</span>
                  </div>
                  <p className="text-2xl font-bold">{rewards.apy}%</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    Early unstaking will incur a {selectedTierConfig.penalty}% penalty
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-4 rounded-lg bg-muted/50">
                <Calculator className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Compound Rewards</span>
                <Button
                  variant={compoundRewards ? "default" : "outline"}
                  size="sm"
                  className="ml-auto"
                  onClick={() => setCompoundRewards(!compoundRewards)}
                >
                  {compoundRewards ? 'Enabled' : 'Disabled'}
                </Button>
              </div>

              {amount && (
                <div className="p-4 rounded-lg bg-primary/5 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Estimated Monthly Rewards</span>
                    <span className="font-medium">
                      {rewards.monthly} {selectedConfig.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Rewards (at maturity)</span>
                    <span className="font-medium">
                      {rewards.total} {selectedConfig.symbol}
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

              {!showConfirmation ? (
                <Button
                  className="w-full"
                  onClick={() => setShowConfirmation(true)}
                  disabled={
                    !amount ||
                    !hasEnoughBalance ||
                    !meetsMinAmount
                  }
                >
                  Review Stake
                </Button>
              ) : (
                <div className="space-y-4 p-4 rounded-lg border bg-card/50">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Confirm Stake</h3>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount:</span>
                        <span>{amount} {selectedConfig.symbol}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span>{selectedTierConfig.duration} months</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">APY:</span>
                        <span>{rewards.apy}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Rewards:</span>
                        <span>{rewards.total} {selectedConfig.symbol}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowConfirmation(false)}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleStake}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Staking...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Confirm Stake
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <StakingHistory />
    </div>
  );
}