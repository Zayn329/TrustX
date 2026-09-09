// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TrustBountyEscrow
 * @dev Programmatic Smart Contract Escrow for the Trust Engine Bug Bounty Platform.
 */
contract TrustBountyEscrow {
    enum EscrowStatus { Funded, Locked, Released, Disputed }

    struct Escrow {
        uint256 id;
        uint256 bountyId;
        address companyAddress;
        address researcherAddress;
        uint256 amount;
        EscrowStatus status;
        uint256 createdAt;
    }

    uint256 public escrowCounter;
    mapping(uint256 => Escrow) public escrows;

    event EscrowFunded(uint256 indexed escrowId, uint256 indexed bountyId, address company, uint256 amount);
    event EscrowReleased(uint256 indexed escrowId, address researcher, uint256 amount);
    event EscrowDisputed(uint256 indexed escrowId, address disputedBy);

    function createEscrow(uint256 bountyId) external payable returns (uint256) {
        require(msg.value > 0, "Must fund escrow with ETH");

        escrowCounter++;
        escrows[escrowCounter] = Escrow({
            id: escrowCounter,
            bountyId: bountyId,
            companyAddress: msg.sender,
            researcherAddress: address(0),
            amount: msg.value,
            status: EscrowStatus.Funded,
            createdAt: block.timestamp
        });

        emit EscrowFunded(escrowCounter, bountyId, msg.sender, msg.value);
        return escrowCounter;
    }

    function releaseEscrow(uint256 escrowId, address payable researcher) external {
        Escrow storage escrow = escrows[escrowId];
        require(msg.sender == escrow.companyAddress, "Only company can release escrow");
        require(escrow.status == EscrowStatus.Funded || escrow.status == EscrowStatus.Locked, "Invalid escrow status");

        escrow.researcherAddress = researcher;
        escrow.status = EscrowStatus.Released;

        (bool success, ) = researcher.call{value: escrow.amount}("");
        require(success, "ETH Transfer failed");

        emit EscrowReleased(escrowId, researcher, escrow.amount);
    }

    function raiseDispute(uint256 escrowId) external {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.status == EscrowStatus.Funded || escrow.status == EscrowStatus.Locked, "Cannot dispute");

        escrow.status = EscrowStatus.Disputed;
        emit EscrowDisputed(escrowId, msg.sender);
    }
}
