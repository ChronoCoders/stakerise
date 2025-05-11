import React from 'react';
import { Card, CardContent } from './card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from './table';
import { Button } from './button';
import { RefreshCw, History, ArrowUpDown, Loader2 } from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { TokenType, StakingConfig } from '@/lib/staking-abi';
import { activityService } from '@/lib/activity-service';
import { toast } from 'sonner';

interface StakeInfo {
  index: number;
  tokenType: TokenType;
  tier: number;
  amount: string;
  startTime: Date;
  lastClaimTime: Date;
  isActive: boolean;
  pendingRewards: string;
}

export function StakingHistory() {
  const { stakingService } = useWeb3();
  const [stakes, setStakes] = React.useState<StakeInfo[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [actionLoading, setActionLoading] = React.useState<number | null>(null);
  const [sortConfig, setSortConfig] = React.useState({
    key: 'startTime',
    direction: 'desc'
  });

  const loadStakes = async () => {
    if (!stakingService) return;

    try {
      setLoading(true);
      const userStakes = await stakingService.getUserStakes();
      setStakes(userStakes);
    } catch (error) {
      console.error('Failed to load stakes:', error);
      toast.error('Failed to load staking history');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadStakes();
    // Set up an interval to refresh pending rewards
    const interval = setInterval(loadStakes, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [stakingService]);

  const handleSort = (key: string) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === 'asc'
          ? 'desc'
          : 'asc'
    });

    const sortedStakes = [...stakes].sort((a: any, b: any) => {
      if (sortConfig.direction === 'asc') {
        return a[key] > b[key] ? 1 : -1;
      }
      return a[key] < b[key] ? 1 : -1;
    });

    setStakes(sortedStakes);
  };

  const handleUnstake = async (stakeIndex: number) => {
    if (!stakingService) return;

    try {
      setActionLoading(stakeIndex);
      const stake = stakes[stakeIndex];
      await stakingService.withdrawStake(stakeIndex);
      
      // Log activity
      await activityService.logActivity(
        'token_unstaked',
        `Unstaked ${stake.amount} ${StakingConfig[stake.tokenType].symbol}`
      );

      toast.success('Successfully unstaked tokens');
      loadStakes();
    } catch (error) {
      console.error('Failed to unstake:', error);
      toast.error('Failed to unstake tokens');
    } finally {
      setActionLoading(null);
    }
  };

  const handleClaimRewards = async (stakeIndex: number) => {
    if (!stakingService) return;

    try {
      setActionLoading(stakeIndex);
      const stake = stakes[stakeIndex];
      await stakingService.claimRewards(stakeIndex);

      // Log activity
      await activityService.logActivity(
        'rewards_claimed',
        `Claimed ${stake.pendingRewards} ${StakingConfig[stake.tokenType].symbol} rewards`
      );

      toast.success('Successfully claimed rewards');
      loadStakes();
    } catch (error) {
      console.error('Failed to claim rewards:', error);
      toast.error('Failed to claim rewards');
    } finally {
      setActionLoading(null);
    }
  };

  const calculateTimeRemaining = (startTime: Date, duration: number) => {
    const endTime = new Date(startTime.getTime() + duration * 30 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const remaining = endTime.getTime() - now.getTime();
    
    if (remaining <= 0) return 'Matured';
    
    const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
    const months = Math.floor(days / 30);
    
    if (months > 0) {
      return `${months}m ${days % 30}d`;
    }
    return `${days}d`;
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Staking History</h2>
          </div>
          <Button variant="outline" onClick={loadStakes} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('startTime')}
                    className="h-8 flex items-center gap-1"
                  >
                    Start Date <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Token</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('amount')}
                    className="h-8 flex items-center gap-1"
                  >
                    Amount <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Time Remaining</TableHead>
                <TableHead>APY</TableHead>
                <TableHead>Pending Rewards</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stakes.map((stake) => {
                const config = StakingConfig[stake.tokenType];
                const tier = config.tiers[stake.tier];
                const timeRemaining = calculateTimeRemaining(stake.startTime, tier.duration);
                const isMatured = timeRemaining === 'Matured';
                
                return (
                  <TableRow key={stake.index}>
                    <TableCell>
                      {stake.startTime.toLocaleDateString()}
                    </TableCell>
                    <TableCell>{config.symbol}</TableCell>
                    <TableCell>{stake.amount}</TableCell>
                    <TableCell>{tier.duration} months</TableCell>
                    <TableCell>{timeRemaining}</TableCell>
                    <TableCell>{tier.apy}%</TableCell>
                    <TableCell>
                      {stake.pendingRewards} {config.symbol}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          stake.isActive
                            ? isMatured
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {stake.isActive
                          ? isMatured
                            ? 'Matured'
                            : 'Active'
                          : 'Ended'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleClaimRewards(stake.index)}
                          disabled={
                            actionLoading === stake.index ||
                            !stake.isActive ||
                            Number(stake.pendingRewards) === 0
                          }
                        >
                          {actionLoading === stake.index ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Claim'
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant={isMatured ? 'default' : 'outline'}
                          onClick={() => handleUnstake(stake.index)}
                          disabled={actionLoading === stake.index || !stake.isActive}
                        >
                          {actionLoading === stake.index ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Unstake'
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {stakes.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center text-muted-foreground"
                  >
                    {loading ? 'Loading stakes...' : 'No staking history found'}
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