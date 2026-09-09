// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ReputationRegistry
 * @dev On-chain portable reputation registry mapping DIDs to verifiable trust score increments.
 */
contract ReputationRegistry {
    struct ReputationRecord {
        string did;
        uint256 trustScore;
        uint256 verifiedSubmissionsCount;
    }

    mapping(string => ReputationRecord) public records;

    event ReputationUpdated(string indexed did, uint256 newScore, uint256 increment);

    function updateReputation(string calldata did, uint256 increment) external {
        ReputationRecord storage record = records[did];
        if (bytes(record.did).length == 0) {
            record.did = did;
            record.trustScore = 50 + increment; // Base score + delta
        } else {
            record.trustScore += increment;
        }
        record.verifiedSubmissionsCount += 1;

        if (record.trustScore > 100) {
            record.trustScore = 100;
        }

        emit ReputationUpdated(did, record.trustScore, increment);
    }

    function getReputation(string calldata did) external view returns (uint256 trustScore, uint256 verifiedCount) {
        ReputationRecord memory record = records[did];
        return (record.trustScore, record.verifiedSubmissionsCount);
    }
}
