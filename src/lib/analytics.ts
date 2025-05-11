import { ethers } from 'ethers';
import { TokenType, StakingConfig } from './staking-abi';

export interface AnalyticsData {
  tvl: number;
  apy: number;
  stakes: number;
  date: string;
}

export interface StakingMetrics {
  totalStaked: ethers.BigNumber;
  totalRewards: ethers.BigNumber;
  averageApy: number;
  stakingCount: number;
}

export const calculateStakingMetrics = (stakes: any[]): StakingMetrics => {
  let totalStaked = ethers.BigNumber.from(0);
  let totalRewards = ethers.BigNumber.from(0);
  let totalApy = 0;

  stakes.forEach(stake => {
    if (stake.isActive) {
      totalStaked = totalStaked.add(stake.amount);
      totalRewards = totalRewards.add(stake.pendingRewards);
      const config = StakingConfig[stake.tokenType];
      const tier = config.tiers[stake.tier];
      totalApy += tier.apy;
    }
  });

  const activeStakes = stakes.filter(s => s.isActive).length;
  const averageApy = activeStakes > 0 ? totalApy / activeStakes : 0;

  return {
    totalStaked,
    totalRewards,
    averageApy,
    stakingCount: activeStakes
  };
};

export const formatTokenAmount = (amount: ethers.BigNumber, tokenType: TokenType): string => {
  const decimals = StakingConfig[tokenType].decimals;
  return ethers.formatUnits(amount, decimals);
};

export const parseTokenAmount = (amount: string, tokenType: TokenType): ethers.BigNumber => {
  const decimals = StakingConfig[tokenType].decimals;
  return ethers.parseUnits(amount, decimals);
};