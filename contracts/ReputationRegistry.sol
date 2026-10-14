// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ReputationRegistry
 * @dev On-chain portable reputation registry mapping DIDs to verifiable trust score increments.
 */
contract ReputationRegistry {
    address public owner;
    address public verifier;

    struct ReputationRecord {
        string did;
        uint256 trustScore;
        uint256 verifiedSubmissionsCount;
    }

    mapping(string => ReputationRecord) public records;

    event ReputationUpdated(string did, uint256 newScore, uint256 increment);

    modifier onlyOwner() {
        require(msg.sender == owner, "ReputationRegistry: caller is not the owner");
        _;
    }

    modifier onlyAuthorizedWriter() {
        require(msg.sender == owner || msg.sender == verifier, "ReputationRegistry: caller is not authorized");
        _;
    }

    constructor(address initialVerifier) {
        owner = msg.sender;
        require(initialVerifier != address(0), "ReputationRegistry: invalid verifier");
        verifier = initialVerifier;
    }

    function setVerifier(address nextVerifier) external onlyOwner {
        require(nextVerifier != address(0), "ReputationRegistry: invalid verifier");
        verifier = nextVerifier;
    }

    function updateReputation(string calldata did, uint256 increment) external onlyAuthorizedWriter {
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
