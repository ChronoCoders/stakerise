export const STAKING_ABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "stakeIndex",
        type: "uint256",
      },
    ],
    name: "claimRewards",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "enum StakeTokenType",
        name: "tokenType",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "tier",
        type: "uint256",
      },
    ],
    name: "stake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "enum StakeTokenType",
        name: "",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "stakingConfigs",
    outputs: [
      {
        internalType: "uint256",
        name: "minStakeAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "lockupPeriod",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "annualRewardRate",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "earlyUnstakePenalty",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPoolInfo",
    outputs: [
      {
        internalType: "uint256",
        name: "totalValueLocked",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "availableLiquidity",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "totalStakers",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "userStakes",
    outputs: [
      {
        internalType: "enum StakeTokenType",
        name: "tokenType",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "tier",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "startTime",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "lastClaimTime",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "isActive",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "stakeIndex",
        type: "uint256",
      },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export const ERC20_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export const TokenType = {
  STR: 0,
  BTC: 1,
  ETH: 2,
  LTC: 3,
  USDT: 4,
  USDC: 5,
};

// Staking configuration for each token and duration
export const StakingConfig = {
  [TokenType.STR]: {
    symbol: "STR",
    name: "StakeRise",
    decimals: 18,
    tiers: [
      { duration: 12, apy: 12.5, minAmount: "500", penalty: 15 },
      { duration: 24, apy: 18, minAmount: "250", penalty: 10 },
    ],
  },
  [TokenType.BTC]: {
    symbol: "BTC",
    name: "Bitcoin",
    decimals: 8,
    tiers: [
      { duration: 6, apy: 5, minAmount: "0.1", penalty: 20 },
      { duration: 12, apy: 7.5, minAmount: "0.05", penalty: 15 },
    ],
  },
  [TokenType.ETH]: {
    symbol: "ETH",
    name: "Ethereum",
    decimals: 18,
    tiers: [
      { duration: 6, apy: 6, minAmount: "1", penalty: 20 },
      { duration: 12, apy: 9, minAmount: "0.5", penalty: 15 },
    ],
  },
  [TokenType.LTC]: {
    symbol: "LTC",
    name: "Litecoin",
    decimals: 8,
    tiers: [
      { duration: 6, apy: 5.5, minAmount: "5", penalty: 20 },
      { duration: 12, apy: 8, minAmount: "2.5", penalty: 15 },
    ],
  },
  [TokenType.USDT]: {
    symbol: "USDT",
    name: "Tether",
    decimals: 6,
    tiers: [
      { duration: 6, apy: 6, minAmount: "1000", penalty: 15 },
      { duration: 12, apy: 8, minAmount: "500", penalty: 10 },
    ],
  },
  [TokenType.USDC]: {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    tiers: [
      { duration: 6, apy: 6, minAmount: "1000", penalty: 15 },
      { duration: 12, apy: 8, minAmount: "500", penalty: 10 },
    ],
  },
};

// Contract addresses (replace with actual deployed addresses)
export const CONTRACT_ADDRESSES = {
  STAKING: "0x0000000000000000000000000000000000000000", // Replace with actual address
  STR: "0x0000000000000000000000000000000000000000", // Replace with actual address
  BTC: "0x0000000000000000000000000000000000000000", // Replace with actual address
  ETH: "0x0000000000000000000000000000000000000000", // Replace with actual address
  LTC: "0x0000000000000000000000000000000000000000", // Replace with actual address
  USDT: "0x0000000000000000000000000000000000000000", // Replace with actual address
  USDC: "0x0000000000000000000000000000000000000000", // Replace with actual address
};
