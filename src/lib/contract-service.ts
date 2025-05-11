import { ethers } from 'ethers';
import { STAKING_ABI, ERC20_ABI, TokenType, CONTRACT_ADDRESSES, StakingConfig } from './staking-abi';

export interface Transaction {
  id: string;
  type: 'stake' | 'unstake' | 'claim';
  tokenType: TokenType;
  amount: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
  hash: string;
}

export interface PoolInfo {
  totalValueLocked: ethers.BigNumber;
  availableLiquidity: ethers.BigNumber;
  totalStakers: ethers.BigNumber;
}

export class StakingService {
  provider: any;
  signer: any;
  stakingContract: any;
  tokenContracts: any;
  initialized: boolean;

  constructor() {
    this.provider = null;
    this.signer = null;
    this.stakingContract = null;
    this.tokenContracts = {};
    this.initialized = false;
  }

  async initialize() {
    if (window.ethereum) {
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      this.stakingContract = new ethers.Contract(
        CONTRACT_ADDRESSES.STAKING,
        STAKING_ABI,
        this.signer
      );

      this.tokenContracts = {
        [TokenType.STR]: new ethers.Contract(
          CONTRACT_ADDRESSES.STR,
          ERC20_ABI,
          this.signer
        ),
        [TokenType.BTC]: new ethers.Contract(
          CONTRACT_ADDRESSES.BTC,
          ERC20_ABI,
          this.signer
        ),
        [TokenType.ETH]: new ethers.Contract(
          CONTRACT_ADDRESSES.ETH,
          ERC20_ABI,
          this.signer
        ),
        [TokenType.LTC]: new ethers.Contract(
          CONTRACT_ADDRESSES.LTC,
          ERC20_ABI,
          this.signer
        ),
        [TokenType.USDT]: new ethers.Contract(
          CONTRACT_ADDRESSES.USDT,
          ERC20_ABI,
          this.signer
        ),
        [TokenType.USDC]: new ethers.Contract(
          CONTRACT_ADDRESSES.USDC,
          ERC20_ABI,
          this.signer
        )
      };

      this.initialized = true;
      return true;
    }
    throw new Error("Ethereum provider not found");
  }

  async getTokenBalance(tokenType: TokenType) {
    if (!this.initialized) await this.initialize();
    const account = await this.signer.getAddress();
    return this.tokenContracts[tokenType].balanceOf(account);
  }

  async getAllBalances() {
    if (!this.initialized) await this.initialize();
    const account = await this.signer.getAddress();
    
    const balances: { [key in TokenType]?: ethers.BigNumber } = {};
    for (const [type, contract] of Object.entries(this.tokenContracts)) {
      balances[type as unknown as TokenType] = await contract.balanceOf(account);
    }
    return balances;
  }

  async getStakingConfig(tokenType: TokenType, tier: number) {
    if (!this.initialized) await this.initialize();
    return this.stakingContract.stakingConfigs(tokenType, tier);
  }

  async getPoolInfo(): Promise<PoolInfo> {
    if (!this.initialized) await this.initialize();
    return this.stakingContract.getPoolInfo();
  }

  async getUserStakes() {
    if (!this.initialized) await this.initialize();
    
    const account = await this.signer.getAddress();
    const stakes = [];
    
    try {
      let index = 0;
      while (true) {
        const stake = await this.stakingContract.userStakes(account, index);
        if (stake) {
          stakes.push({
            index,
            tokenType: Number(stake.tokenType),
            tier: Number(stake.tier),
            amount: stake.amount,
            startTime: new Date(Number(stake.startTime) * 1000),
            lastClaimTime: new Date(Number(stake.lastClaimTime) * 1000),
            isActive: stake.isActive,
            pendingRewards: await this.calculatePendingRewards(index)
          });
          index++;
        }
      }
    } catch (error) {
      // End of stakes reached
    }
    
    return stakes;
  }

  async calculatePendingRewards(stakeIndex: number) {
    if (!this.initialized) await this.initialize();
    
    try {
      const stake = await this.getUserStakes();
      if (!stake[stakeIndex]) return "0";

      const config = StakingConfig[stake[stakeIndex].tokenType];
      const tier = config.tiers[stake[stakeIndex].tier];
      
      const timeElapsed = Date.now() / 1000 - stake[stakeIndex].lastClaimTime.getTime() / 1000;
      const yearInSeconds = 365 * 24 * 60 * 60;
      
      const rewards = stake[stakeIndex].amount.mul(tier.apy).mul(timeElapsed).div(yearInSeconds).div(100);
      return rewards.toString();
    } catch (error) {
      console.error("Error calculating rewards:", error);
      return "0";
    }
  }

  async approveToken(tokenType: TokenType, amount: ethers.BigNumber) {
    if (!this.initialized) await this.initialize();
    
    const tx = await this.tokenContracts[tokenType].approve(
      CONTRACT_ADDRESSES.STAKING,
      amount
    );
    
    return tx.wait();
  }

  async stakeTokens(amount: ethers.BigNumber, tokenType: TokenType, tier: number) {
    if (!this.initialized) await this.initialize();
    
    await this.approveToken(tokenType, amount);
    
    const tx = await this.stakingContract.stake(amount, tokenType, tier);
    return tx.wait();
  }

  async claimRewards(stakeIndex: number) {
    if (!this.initialized) await this.initialize();
    
    const tx = await this.stakingContract.claimRewards(stakeIndex);
    return tx.wait();
  }

  async withdrawStake(stakeIndex: number) {
    if (!this.initialized) await this.initialize();
    
    const tx = await this.stakingContract.withdraw(stakeIndex);
    return tx.wait();
  }

  async getTransactionHistory(): Promise<Transaction[]> {
    if (!this.initialized) await this.initialize();
    
    const account = await this.signer.getAddress();
    const filter = {
      address: CONTRACT_ADDRESSES.STAKING,
      topics: [null, account]
    };
    
    const events = await this.provider.getLogs(filter);
    return events.map(event => this.parseTransactionEvent(event));
  }

  private parseTransactionEvent(event: any): Transaction {
    // Implementation would depend on actual event structure
    return {
      id: event.transactionHash,
      type: 'stake',
      tokenType: TokenType.STR,
      amount: '0',
      timestamp: Date.now(),
      status: 'completed',
      hash: event.transactionHash
    };
  }

  convertToTokenAmount(amount: string, tokenType: TokenType) {
    const config = StakingConfig[tokenType];
    return ethers.parseUnits(amount, config.decimals);
  }

  convertFromTokenAmount(amount: ethers.BigNumber, tokenType: TokenType) {
    const config = StakingConfig[tokenType];
    return ethers.formatUnits(amount, config.decimals);
  }
  
  getTokenSymbol(tokenType: TokenType) {
    return StakingConfig[tokenType].symbol;
  }
}