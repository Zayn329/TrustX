// TrustBountyEscrow.sol ABI (minimal for our use case)
export const TRUST_BOUNTY_ESCROW_ABI = [
  {
    "inputs": [],
    "name": "escrowCounter",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "bountyId",
        "type": "uint256"
      }
    ],
    "name": "createEscrow",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "escrowId",
        "type": "uint256"
      },
      {
        "internalType": "address payable",
        "name": "researcher",
        "type": "address"
      }
    ],
    "name": "releaseEscrow",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "escrowId",
        "type": "uint256"
      }
    ],
    "name": "raiseDispute",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "escrowId", "type": "uint256" },
      { "indexed": false, "internalType": "address", "name": "researcher", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "EscrowReleased",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "escrowId", "type": "uint256" },
      { "indexed": false, "internalType": "address", "name": "disputedBy", "type": "address" }
    ],
    "name": "EscrowDisputed",
    "type": "event"
  }
] as const;
