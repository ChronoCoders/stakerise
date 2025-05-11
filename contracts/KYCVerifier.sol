// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";

contract KYCVerifier is Initializable, AccessControlUpgradeable, PausableUpgradeable {
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    
    enum VerificationStatus { NONE, PENDING, IN_REVIEW, APPROVED, REJECTED, EXPIRED }
    enum RiskLevel { LOW, MEDIUM_LOW, MEDIUM, MEDIUM_HIGH, HIGH, VERY_HIGH }
    
    struct KYCData {
        VerificationStatus status;
        RiskLevel riskLevel;
        uint256 verificationDate;
        uint256 expirationDate;
        string rejectionReason;
    }
    
    mapping(address => KYCData) private _kycData;
    mapping(address => bool) private _blacklisted;
    
    uint256 public constant KYC_VALIDITY_PERIOD = 365 days;
    uint256 public constant VERIFICATION_TIMEOUT = 30 days;
    
    event KYCStatusChanged(
        address indexed account,
        VerificationStatus status,
        RiskLevel riskLevel,
        uint256 expirationDate
    );
    event AccountBlacklisted(address indexed account, address indexed by);
    event AccountUnblacklisted(address indexed account, address indexed by);
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    function initialize() public initializer {
        __AccessControl_init();
        __Pausable_init();
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }
    
    function submitKYC(address account) external {
        require(account != address(0), "Invalid address");
        require(!_blacklisted[account], "Account is blacklisted");
        require(
            _kycData[account].status == VerificationStatus.NONE ||
            _kycData[account].status == VerificationStatus.REJECTED ||
            _kycData[account].status == VerificationStatus.EXPIRED,
            "KYC already in progress or approved"
        );
        
        _kycData[account].status = VerificationStatus.PENDING;
        _kycData[account].verificationDate = block.timestamp;
        
        emit KYCStatusChanged(
            account,
            VerificationStatus.PENDING,
            _kycData[account].riskLevel,
            0
        );
    }
    
    function updateKYCStatus(
        address account,
        VerificationStatus status,
        RiskLevel riskLevel,
        string calldata rejectionReason
    ) external onlyRole(VERIFIER_ROLE) {
        require(account != address(0), "Invalid address");
        require(!_blacklisted[account], "Account is blacklisted");
        require(
            _kycData[account].status != VerificationStatus.NONE,
            "KYC not submitted"
        );
        
        if (status == VerificationStatus.APPROVED) {
            require(
                riskLevel != RiskLevel.HIGH && riskLevel != RiskLevel.VERY_HIGH,
                "High risk accounts cannot be approved"
            );
        }
        
        _kycData[account].status = status;
        _kycData[account].riskLevel = riskLevel;
        _kycData[account].verificationDate = block.timestamp;
        
        if (status == VerificationStatus.APPROVED) {
            _kycData[account].expirationDate = block.timestamp + KYC_VALIDITY_PERIOD;
        } else if (status == VerificationStatus.REJECTED) {
            _kycData[account].rejectionReason = rejectionReason;
        }
        
        emit KYCStatusChanged(
            account,
            status,
            riskLevel,
            _kycData[account].expirationDate
        );
    }
    
    function blacklistAccount(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(account != address(0), "Invalid address");
        require(!_blacklisted[account], "Account already blacklisted");
        
        _blacklisted[account] = true;
        _kycData[account].status = VerificationStatus.REJECTED;
        
        emit AccountBlacklisted(account, msg.sender);
    }
    
    function unblacklistAccount(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(account != address(0), "Invalid address");
        require(_blacklisted[account], "Account not blacklisted");
        
        _blacklisted[account] = false;
        
        emit AccountUnblacklisted(account, msg.sender);
    }
    
    function getKYCStatus(address account) external view returns (
        VerificationStatus status,
        RiskLevel riskLevel,
        uint256 verificationDate,
        uint256 expirationDate,
        string memory rejectionReason
    ) {
        KYCData storage data = _kycData[account];
        
        // Check if KYC has expired
        if (
            data.status == VerificationStatus.APPROVED &&
            block.timestamp >= data.expirationDate
        ) {
            return (
                VerificationStatus.EXPIRED,
                data.riskLevel,
                data.verificationDate,
                data.expirationDate,
                ""
            );
        }
        
        return (
            data.status,
            data.riskLevel,
            data.verificationDate,
            data.expirationDate,
            data.rejectionReason
        );
    }
    
    function isKYCApproved(address account) external view returns (bool) {
        return (
            _kycData[account].status == VerificationStatus.APPROVED &&
            block.timestamp < _kycData[account].expirationDate
        );
    }
    
    function isBlacklisted(address account) external view returns (bool) {
        return _blacklisted[account];
    }
    
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}