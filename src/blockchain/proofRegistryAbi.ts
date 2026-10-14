export const PROOF_REGISTRY_ABI = [
  {
    type: 'function',
    name: 'anchorProof',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'bountyId', type: 'uint256' },
      { name: 'proofHash', type: 'bytes32' },
      { name: 'researcherDid', type: 'string' },
      { name: 'signature', type: 'bytes' },
      { name: 'nonce', type: 'uint256' }
    ],
    outputs: []
  },
  {
    type: 'event',
    name: 'ProofAnchored',
    anonymous: false,
    inputs: [
      { indexed: true, name: 'proofHash', type: 'bytes32' },
      { indexed: true, name: 'bountyId', type: 'uint256' },
      { indexed: false, name: 'researcherDid', type: 'string' },
      { indexed: true, name: 'signer', type: 'address' },
      { indexed: false, name: 'signature', type: 'bytes' },
      { indexed: false, name: 'nonce', type: 'uint256' }
    ]
  }
] as const;
