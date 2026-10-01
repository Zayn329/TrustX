// TrustBountyEscrow.sol ABI (minimal for our use case)
export const TRUST_BOUNTY_ESCROW_ABI = [
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
  }
] as const;