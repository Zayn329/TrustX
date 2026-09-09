// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ChainlinkOracleBridge
 * @dev Receives automated PoC verification results from Chainlink Functions oracle nodes.
 */
contract ChainlinkOracleBridge {
    struct VerificationResult {
        uint256 reportId;
        bool isVerified;
        uint256 coveragePercentage;
        uint256 timestamp;
    }

    mapping(uint256 => VerificationResult) public results;

    event VerificationFulfilled(uint256 indexed reportId, bool isVerified, uint256 coverage);

    function fulfillVerification(uint256 reportId, bool isVerified, uint256 coverage) external {
        results[reportId] = VerificationResult({
            reportId: reportId,
            isVerified: isVerified,
            coveragePercentage: coverage,
            timestamp: block.timestamp
        });

        emit VerificationFulfilled(reportId, isVerified, coverage);
    }
}
