// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

contract STRToken is 
    Initializable,
    ERC20Upgradeable, 
    ERC20BurnableUpgradeable,
    PausableUpgradeable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable
{
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant BLACKLISTER_ROLE = keccak256("BLACKLISTER_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant RECOVERY_ROLE = keccak256("RECOVERY_ROLE");
    
    uint256 private constant INITIAL_SUPPLY = 100_000_000 * 10**18;
    uint256 public constant MAX_TRANSFER_AMOUNT = INITIAL_SUPPLY / 100; // 1% of total supply
    uint256 public constant RATE_LIMIT_DURATION = 1 hours;
    uint256 public constant RATE_LIMIT_AMOUNT = INITIAL_SUPPLY / 1000; // 0.1% per hour
    uint256 public constant TIMELOCK_DELAY = 2 days;
    uint256 public constant RECOVERY_DELAY = 30 days;
    uint256 public constant MAX_BURN_RATE = 1000; // 0.1% per day
    
    mapping(address => bool) private _blacklisted;
    mapping(address => uint256) private _lastTransferTimestamp;
    mapping(address => uint256) private _transferredInTimeWindow;
    mapping(bytes32 => uint256) private _pendingOperations;
    mapping(address => uint256) private _recoveryRequests;
    mapping(address => uint256) private _lastBurnTimestamp;
    mapping(address => uint256) private _burnedInWindow;
    mapping(address => bool) private _transferHooks;
    
    event Blacklisted(address indexed account, address indexed by);
    event RemovedFromBlacklist(address indexed account, address indexed by);
    event MaxTransferExceeded(address indexed from, address indexed to, uint256 amount);
    event RateLimitExceeded(address indexed from, address indexed to, uint256 amount);
    event OperationQueued(bytes32 indexed operationId, uint256 executionTime);
    event OperationExecuted(bytes32 indexed operationId);
    event OperationCancelled(bytes32 indexed operationId);
    event RecoveryRequested(address indexed account, uint256 unlockTime);
    event RecoveryExecuted(address indexed account, address indexed newAddress);
    event TransferHookAdded(address indexed hook);
    event TransferHookRemoved(address indexed hook);
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __ERC20_init("StakeRise", "STR");
        __ERC20Burnable_init();
        __Pausable_init();
        __AccessControl_init();
        __ReentrancyGuard_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(BLACKLISTER_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
        _grantRole(RECOVERY_ROLE, msg.sender);
        
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    function queueOperation(bytes32 operationId) internal {
        _pendingOperations[operationId] = block.timestamp + TIMELOCK_DELAY;
        emit OperationQueued(operationId, _pendingOperations[operationId]);
    }

    function isOperationPending(bytes32 operationId) public view returns (bool) {
        return _pendingOperations[operationId] != 0 && 
               _pendingOperations[operationId] > block.timestamp;
    }

    function isOperationReady(bytes32 operationId) public view returns (bool) {
        return _pendingOperations[operationId] != 0 && 
               _pendingOperations[operationId] <= block.timestamp;
    }

    function cancelOperation(bytes32 operationId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_pendingOperations[operationId] != 0, "STR: Operation not found");
        delete _pendingOperations[operationId];
        emit OperationCancelled(operationId);
    }

    function requestRecovery() external {
        require(_recoveryRequests[msg.sender] == 0, "STR: Recovery already requested");
        _recoveryRequests[msg.sender] = block.timestamp + RECOVERY_DELAY;
        emit RecoveryRequested(msg.sender, _recoveryRequests[msg.sender]);
    }

    function executeRecovery(
        address oldAddress,
        address newAddress
    ) external onlyRole(RECOVERY_ROLE) {
        require(_recoveryRequests[oldAddress] != 0, "STR: No recovery requested");
        require(block.timestamp >= _recoveryRequests[oldAddress], "STR: Recovery time not reached");
        require(newAddress != address(0), "STR: Invalid new address");
        
        uint256 balance = balanceOf(oldAddress);
        _transfer(oldAddress, newAddress, balance);
        delete _recoveryRequests[oldAddress];
        
        emit RecoveryExecuted(oldAddress, newAddress);
    }

    function addTransferHook(address hook) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(hook != address(0), "STR: Invalid hook address");
        _transferHooks[hook] = true;
        emit TransferHookAdded(hook);
    }

    function removeTransferHook(address hook) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_transferHooks[hook], "STR: Hook not found");
        _transferHooks[hook] = false;
        emit TransferHookRemoved(hook);
    }

    function recoverERC20(
        address tokenAddress,
        uint256 amount
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(tokenAddress != address(this), "STR: Cannot recover STR token");
        IERC20Upgradeable(tokenAddress).transfer(msg.sender, amount);
    }

    function recoverEther() external onlyRole(DEFAULT_ADMIN_ROLE) {
        payable(msg.sender).transfer(address(this).balance);
    }
    
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function blacklist(address account) external onlyRole(BLACKLISTER_ROLE) {
        require(account != address(0), "STR: Cannot blacklist zero address");
        require(!_blacklisted[account], "STR: Account already blacklisted");
        
        _blacklisted[account] = true;
        emit Blacklisted(account, msg.sender);
    }
    
    function removeFromBlacklist(address account) external onlyRole(BLACKLISTER_ROLE) {
        require(_blacklisted[account], "STR: Account not blacklisted");
        
        _blacklisted[account] = false;
        emit RemovedFromBlacklist(account, msg.sender);
    }
    
    function isBlacklisted(address account) external view returns (bool) {
        return _blacklisted[account];
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, amount);

        require(!paused(), "STR: Token transfers are paused");
        require(!_blacklisted[from], "STR: Sender is blacklisted");
        require(!_blacklisted[to], "STR: Recipient is blacklisted");
        
        // Skip checks for minting
        if(from != address(0)) {
            // Check max transfer limit
            require(amount <= MAX_TRANSFER_AMOUNT, "STR: Transfer amount exceeds limit");
            
            // Check rate limiting
            uint256 currentWindow = block.timestamp / RATE_LIMIT_DURATION;
            uint256 lastWindow = _lastTransferTimestamp[from] / RATE_LIMIT_DURATION;
            
            if(currentWindow != lastWindow) {
                _transferredInTimeWindow[from] = 0;
            }
            
            _transferredInTimeWindow[from] += amount;
            require(_transferredInTimeWindow[from] <= RATE_LIMIT_AMOUNT, "STR: Rate limit exceeded");
            
            _lastTransferTimestamp[from] = block.timestamp;
        }

        // Execute transfer hooks
        for (address hook in _transferHooks) {
            if (_transferHooks[hook]) {
                ITransferHook(hook).beforeTransfer(from, to, amount);
            }
        }
    }

    function _beforeBurn(
        address account,
        uint256 amount
    ) internal virtual {
        uint256 currentWindow = block.timestamp / 1 days;
        uint256 lastWindow = _lastBurnTimestamp[account] / 1 days;
        
        if(currentWindow != lastWindow) {
            _burnedInWindow[account] = 0;
        }
        
        _burnedInWindow[account] += amount;
        uint256 maxBurn = totalSupply() / MAX_BURN_RATE;
        require(_burnedInWindow[account] <= maxBurn, "STR: Burn rate exceeded");
        
        _lastBurnTimestamp[account] = block.timestamp;
    }

    // Required override for compatibility
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(AccessControlUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    uint256[45] private __gap; // Storage gap for upgrades
}

interface ITransferHook {
    function beforeTransfer(address from, address to, uint256 amount) external;
}