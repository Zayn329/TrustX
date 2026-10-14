export const REPUTATION_REGISTRY_ABI = [
  {
    type: 'function',
    name: 'updateReputation',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'did', type: 'string' }, { name: 'increment', type: 'uint256' }],
    outputs: []
  },
  {
    type: 'event',
    name: 'ReputationUpdated',
    anonymous: false,
    inputs: [
      { indexed: false, name: 'did', type: 'string' },
      { indexed: false, name: 'newScore', type: 'uint256' },
      { indexed: false, name: 'increment', type: 'uint256' }
    ]
  }
] as const;
