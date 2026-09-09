// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DisputeArbitration
 * @dev Decentralized Kleros-style juror arbitration court for contested vulnerability reports.
 */
contract DisputeArbitration {
    enum Ruling { Pending, ResearcherWins, CompanyWins }

    struct DisputeCase {
        uint256 disputeId;
        uint256 contributionId;
        uint256 votesForResearcher;
        uint256 votesForCompany;
        Ruling ruling;
        bool isResolved;
    }

    mapping(uint256 => DisputeCase) public cases;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event JurorVoted(uint256 indexed disputeId, address indexed juror, Ruling vote);
    event RulingExecuted(uint256 indexed disputeId, Ruling ruling);

    function castVote(uint256 disputeId, Ruling vote) external {
        require(vote == Ruling.ResearcherWins || vote == Ruling.CompanyWins, "Invalid vote option");
        require(!hasVoted[disputeId][msg.sender], "Juror has already voted in this dispute");

        DisputeCase storage dCase = cases[disputeId];
        require(!dCase.isResolved, "Dispute already resolved");

        hasVoted[disputeId][msg.sender] = true;

        if (vote == Ruling.ResearcherWins) {
            dCase.votesForResearcher += 1;
        } else {
            dCase.votesForCompany += 1;
        }

        emit JurorVoted(disputeId, msg.sender, vote);

        // Auto-resolve when quorum of 3 votes is reached
        if (dCase.votesForResearcher + dCase.votesForCompany >= 3) {
            if (dCase.votesForResearcher > dCase.votesForCompany) {
                dCase.ruling = Ruling.ResearcherWins;
            } else {
                dCase.ruling = Ruling.CompanyWins;
            }
            dCase.isResolved = true;
            emit RulingExecuted(disputeId, dCase.ruling);
        }
    }
}
