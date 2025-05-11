// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "./KYCVerifier.sol";

contract KYCStaking is 
    Initializable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable 
{
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    
    struct StakingTier {
        uint256 minAmount;
        uint256 lockupPeriod;
        uint256 annualRewardRate;
        uint256 earlyUnstakePenalty;
    }
    
    struct Stake {
        uint256 amount;
        uint256 startTime;
        uint256 endTime;
        uint256 lastClaimTime;
        uint256 tier;
        bool active;
    }
    
    KYCVerifier public kycVerifier;
    mapping(uint256 => mapping(uint256 => StakingTier)) public stakingTiers;
    mapping(address => Stake[]) public userStakes;
    
    uint256 public totalStaked;
    uint256 public totalStakers;
    uint256 public availableLiquidity;
    
    event Staked(
        address indexed user,
        uint256 amount,
        uint256 tier,
        uint256 duration
    );
    event Unstaked(
        address indexed user,
        uint256 stakeIndex,
        uint256 amount,
        uint256 penalty
    );
    event RewardsClaimed(
        address indexed user,
        uint256 stakeIndex,
        uint256 amount
    );
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    function initialize(address _kycVerifier) public initializer {
        __AccessControl_init();
        __Pausable_init();
        __ReentrancyGuard_init();
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
        
        kycVerifier = KYCVerifier(_kycVerifier);
    }
    
    function setStakingTier(
        uint256 tokenType,
        uint256 tierId,
        uint256 minAmount,
        uint256 lockupPeriod,
        uint256 annualRewardRate,
        uint256 earlyUnstakePenalty
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(minAmount > 0, "Invalid minimum amount");
        require(lockupPeriod > 0, "Invalid lockup period");
        require(annualRewardRate > 0, "Invalid reward rate");
        require(earlyUnstakePenalty <= 100, "Invalid penalty percentage");
        
        stakingTiers[tokenType][tierId] = StakingTier({
            minAmount: minAmount,
            lockupPeriod: lockupPeriod,
            annualRewardRate: annualRewardRate,
            earlyUnstakePenalty: earlyUnstakePenalty
        });
    }
    
    function stake(
        uint256 amount,
        uint256 tokenType,
        uint256 tierId
    ) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(
            kycVerifier.isKYCApproved(msg.sender),
            "KYC verification required"
        );
        require(
            !kycVerifier.isBlacklisted(msg.sender),
            "Account is blacklisted"
        );
        
        StakingTier storage tier = stakingTiers[tokenType][tierId];
        require(amount >= tier.minAmount, "Amount below minimum");
        require(tier.lockupPeriod > 0, "Invalid tier");
        
        IERC20Upgradeable token = IERC20Upgradeable(getTokenAddress(tokenType));
        require(
            token.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
        
        if (userStakes[msg.sender].length == 0) {
            totalStakers++;
        }
        
        userStakes[msg.sender].push(Stake({
            amount: amount,
            startTime: block.timestamp,
            endTime: block.timestamp + tier.lockupPeriod,
            lastClaimTime: block.timestamp,
            tier: tierId,
            active: true
        }));
        
        totalStaked += amount;
        availableLiquidity += amount;
        
        emit Staked(msg.sender, amount, tierId, tier.lockupPeriod);
    }
    
    function unstake(uint256 stakeIndex) external nonReentrant {
        require(stakeIndex < userStakes[msg.sender].length, "Invalid stake index");
        
        Stake storage userStake = userStakes[msg.sender][stakeIndex];
        require(userStake.active, "Stake not active");
        
        uint256 amount = userStake.amount;
        uint256 penalty = 0;
        
        if (block.timestamp < userStake.endTime) {
            StakingTier storage tier = stakingTiers[0][userStake.tier];
            penalty = (amount * tier.earlyUnstakePenalty) / 100;
        }
        
        userStake.active = false;
        totalStaked -= amount;
        availableLiquidity -= amount;
        
        if (getActiveStakeCount(msg.sender) == 0) {
            totalStakers--;
        }
        
        IERC20Upgradeable token = IERC20Upgradeable(getTokenAddress(0));
        require(
            token.transfer(msg.sender, amount - penalty),
            "Transfer failed"
        );
        
        if (penalty > 0) {
            // Transfer penalty to fee collector
            require(
                token.transfer(getFeeCollector(), penalty),
                "Penalty transfer failed"
            );
        }
        
        emit Unstaked(msg.sender, stakeIndex, amount, penalty);
    }
    
    function claimRewards(uint256 stakeIndex) external nonReentrant {
        require(stakeIndex < userStakes[msg.sender].length, "Invalid stake index");
        
        Stake storage userStake = userStakes[msg.sender][stakeIndex];
        require(userStake.active, "Stake not active");
        
        uint256 rewards = calculateRewards(msg.sender, stakeIndex);
        require(rewards > 0, "No rewards to claim");
        
        userStake.lastClaimTime = block.timestamp;
        
        IERC20Upgradeable token = IERC20Upgradeable(getTokenAddress(0));
        require(token.transfer(msg.sender, rewards), "Transfer failed");
        
        emit RewardsClaimed(msg.sender, stakeIndex, rewards);
    }
    
    function calculateRewards(
        address user,
        uint256 stakeIndex
    ) public view returns (uint256) {
        Stake storage userStake = userStakes[user][stakeIndex];
        if (!userStake.active) return 0;
        
        StakingTier storage tier = stakingTiers[0][userStake.tier];
        
        uint256 timeElapsed = block.timestamp - userStake.lastClaimTime;
        uint256 yearInSeconds = 365 days;
        
        return (userStake.amount * tier.annualRewardRate * timeElapsed) / (yearInSeconds * 100);
    }
    
    function getActiveStakeCount(address user) public view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < userStakes[user].length; i++) {
            if (userStakes[user][i].active) count++;
        }
        return count;
    }
    
    function getPoolInfo() external view returns (
        uint256 _totalValueLocked,
        uint256 _availableLiquidity,
        uint256 _totalStakers
    ) {
        return (totalStaked, availableLiquidity, totalStakers);
    }
    
    function getTokenAddress(uint256 tokenType) internal pure returns (address) {
        // Replace with actual token addresses
        return address(0);
    }
    
    function getFeeCollector() internal pure returns (address) {
        // Replace with actual fee collector address
        return address(0);
    }
    
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}