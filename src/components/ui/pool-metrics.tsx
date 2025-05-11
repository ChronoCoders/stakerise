import React from 'react';
import { Card, CardContent } from './card';
import { AnalyticsChart } from './analytics-chart';
import { useWeb3 } from '@/contexts/Web3Context';
import { ethers } from 'ethers';
import { TokenType, StakingConfig } from '@/lib/staking-abi';
import { AlertTriangle, TrendingUp, Activity, DollarSign } from 'lucide-react';

export function PoolMetrics() {
  const { stakingService } = useWeb3();
  const [poolInfo, setPoolInfo] = React.useState({
    totalValueLocked: ethers.BigNumber.from(0),
    availableLiquidity: ethers.BigNumber.from(0),
    totalStakers: ethers.BigNumber.from(0),
    utilizationRate: 0
  });

  React.useEffect(() => {
    const loadPoolInfo = async () => {
      if (stakingService) {
        try {
          const info = await stakingService.getPoolInfo();
          const utilization = info.availableLiquidity.eq(0) ? 
            0 : 
            info.totalValueLocked.mul(100).div(info.availableLiquidity).toNumber();
          
          setPoolInfo({
            ...info,
            utilizationRate: utilization
          });
        } catch (error) {
          console.error('Failed to load pool info:', error);
        }
      }
    };

    loadPoolInfo();
    const interval = setInterval(loadPoolInfo, 30000);
    return () => clearInterval(interval);
  }, [stakingService]);

  const formatValue = (value: ethers.BigNumber) => {
    return ethers.formatUnits(value, StakingConfig[TokenType.STR].decimals);
  };

  const getUtilizationColor = (rate: number) => {
    if (rate > 90) return 'text-red-500';
    if (rate > 75) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Total Value Locked</h3>
            </div>
            <p className="text-2xl font-bold">
              ${Number(formatValue(poolInfo.totalValueLocked)).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Available Liquidity</h3>
            </div>
            <p className="text-2xl font-bold">
              ${Number(formatValue(poolInfo.availableLiquidity)).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Total Stakers</h3>
            </div>
            <p className="text-2xl font-bold">
              {poolInfo.totalStakers.toString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Utilization Rate</h3>
            </div>
            <p className={`text-2xl font-bold ${getUtilizationColor(poolInfo.utilizationRate)}`}>
              {poolInfo.utilizationRate}%
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Pool Performance</h3>
            <AnalyticsChart
              data={[
                { date: '2025-03', tvl: 1000000, liquidity: 800000, utilization: 80 },
                { date: '2025-04', tvl: 1200000, liquidity: 900000, utilization: 75 },
                { date: '2025-05', tvl: 1500000, liquidity: 1200000, utilization: 85 }
              ]}
              title="Pool Metrics Over Time"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Risk Parameters</h3>
            <div className="space-y-4">
              {Object.entries(StakingConfig).map(([tokenType, config]) => (
                <div key={tokenType} className="p-4 rounded-lg bg-muted/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{config.symbol}</span>
                    <span className="text-sm text-muted-foreground">
                      Max APY: {Math.max(...config.tiers.map(t => t.apy))}%
                    </span>
                  </div>
                  <div className="space-y-2">
                    {config.tiers.map((tier, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{tier.duration}m Lock</span>
                        <span className="text-yellow-500">{tier.penalty}% Penalty</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}