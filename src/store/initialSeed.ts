import { Identity, Bounty, VulnerabilityReport, TechnicalVerification, BlockchainEvent, Dispute, SybilRiskIndicator } from '../types';
import { generateHash, generateSignature } from '../domain/crypto';

export const INITIAL_RESEARCHER: Identity = {
  did: 'did:trust:0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  handle: 'alex_sec',
  displayName: 'Alex Rivers',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  role: 'RESEARCHER',
  joinedTimestamp: Date.now() - 120 * 24 * 3600 * 1000, // 120 days ago
  publicKey: '0x04e12f8b91a01c345d9e87123456789abcdef0123456789abcdef0123456789abc',
  bio: 'Senior Smart Contract Security Researcher & Cryptographer. Specialized in EVM reentrancy & zk-proof verification.',
  verifiedPlatforms: [
    {
      platformName: 'Bug Bounty Network',
      externalUsername: 'alex_sec_bbn',
      proofUrl: 'https://bugbounty.net/users/alex_sec',
      verifiedAt: Date.now() - 90 * 24 * 3600 * 1000,
    },
    {
      platformName: 'Open Source Security Foundation',
      externalUsername: 'alexrivers-oss',
      proofUrl: 'https://openssf.org/members/alexrivers',
      verifiedAt: Date.now() - 60 * 24 * 3600 * 1000,
    },
    {
      platformName: 'Web3 Security Guild',
      externalUsername: 'alex.eth',
      proofUrl: 'https://w3sg.org/p/0x71C',
      verifiedAt: Date.now() - 30 * 24 * 3600 * 1000,
    },
  ],
};

export const INITIAL_ORGANIZATION: Identity = {
  did: 'did:trust:0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7',
  handle: 'defilabs_official',
  displayName: 'DeFi Protocol Labs',
  avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=250',
  role: 'ORGANIZATION',
  joinedTimestamp: Date.now() - 365 * 24 * 3600 * 1000,
  publicKey: '0x03a789bcde0123456789abcdef0123456789abcdef0123456789abcdef012345',
  bio: 'Decentralized liquidity protocols & autonomous money market vaults.',
  verifiedPlatforms: [
    {
      platformName: 'GitHub Security',
      externalUsername: 'defilabs',
      proofUrl: 'https://github.com/defilabs',
      verifiedAt: Date.now() - 300 * 24 * 3600 * 1000,
    },
  ],
};

export const INITIAL_BOUNTIES: Bounty[] = [
  {
    id: 'bounty-defilabs-vault',
    orgDid: INITIAL_ORGANIZATION.did,
    orgName: INITIAL_ORGANIZATION.displayName,
    orgAvatar: INITIAL_ORGANIZATION.avatarUrl,
    title: 'DeFi Vault V4 Smart Contracts Security Audit',
    description: 'Find reentrancy, oracle manipulation, yield calculation precision loss, or unauthorized asset extraction bugs in Vault V4 contracts.',
    scope: [
      'https://github.com/defilabs/vault-v4/contracts/Vault.sol',
      'https://github.com/defilabs/vault-v4/contracts/StrategyManager.sol',
      'https://github.com/defilabs/vault-v4/contracts/OracleAdapter.sol',
    ],
    severityRewards: {
      critical: 50000,
      high: 20000,
      medium: 7500,
      low: 1500,
    },
    totalEscrowLocked: 79000,
    escrowStatus: 'DEPOSITED_LOCKED',
    escrowContractAddress: '0x3A5B8c72De49102c91823F45Aa78103c8191EF11',
    escrowTxHash: '0x9d4e12f8b91a01c345d9e87123456789abcdef0123456789abcdef0123456789a',
    createdAt: Date.now() - 45 * 24 * 3600 * 1000,
    deadline: Date.now() + 120 * 24 * 3600 * 1000,
    status: 'ACTIVE',
  },
  {
    id: 'bounty-vaultpay-bridge',
    orgDid: 'did:trust:0x99A05A3A3b2A69De6Dbf7f01ED13B2108B2c43f8',
    orgName: 'VaultPay Global',
    orgAvatar: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=250',
    title: 'Cross-Chain Message Relay Bridge Vulnerability Hunt',
    description: 'Incentivized bug bounty for uncovering cryptographic signature forgery, replay attacks, or relayer censorship bugs.',
    scope: [
      'https://github.com/vaultpay/bridge-core/Relayer.ts',
      'https://github.com/vaultpay/bridge-core/contracts/BridgeVerifier.sol',
    ],
    severityRewards: {
      critical: 35000,
      high: 15000,
      medium: 5000,
      low: 1000,
    },
    totalEscrowLocked: 56000,
    escrowStatus: 'DEPOSITED_LOCKED',
    escrowContractAddress: '0x7B9C1283Ef02193e41203A28d71210A88921BC22',
    escrowTxHash: '0x1c2b3a4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    createdAt: Date.now() - 30 * 24 * 3600 * 1000,
    deadline: Date.now() + 90 * 24 * 3600 * 1000,
    status: 'ACTIVE',
  },
];

const report1ContentHash = generateHash('Report-1-Vault-Reentrancy-Details');
const report1EvidenceHash = generateHash('Proof-Payload-PoC-0xReentrancyExploit');

export const INITIAL_REPORTS: VulnerabilityReport[] = [
  {
    id: 'rep-001-vault-reentrancy',
    bountyId: 'bounty-defilabs-vault',
    bountyTitle: 'DeFi Vault V4 Smart Contracts Security Audit',
    researcherDid: INITIAL_RESEARCHER.did,
    researcherHandle: INITIAL_RESEARCHER.handle,
    title: 'Flashloan-assisted Cross-Function Reentrancy in Vault.withdraw()',
    vulnerabilityType: 'Smart Contract / Reentrancy',
    severity: 'CRITICAL',
    description: 'A missing state update reentrancy guard allows an attacker to re-enter withdraw() during token transfer callbacks, draining strategy liquidity.',
    reproductionSteps: '1. Flashloan 5,000 ETH from Aave.\n2. Call deposit() in Vault V4.\n3. Trigger withdraw(), hooking fallback function to re-enter.\n4. Vault balance decreases without resetting totalShares.',
    impact: 'Complete drain of deposited liquidity funds ($4.2M TVL at risk).',
    status: 'REWARD_RELEASED',
    createdAt: Date.now() - 15 * 24 * 3600 * 1000,
    proof: {
      proofId: 'proof-rep-001',
      submissionId: 'rep-001-vault-reentrancy',
      researcherDid: INITIAL_RESEARCHER.did,
      evidenceHash: report1EvidenceHash,
      contentHash: report1ContentHash,
      signature: generateSignature(INITIAL_RESEARCHER.did, report1ContentHash),
      timestamp: Date.now() - 15 * 24 * 3600 * 1000,
      blockHash: '0x4f8e12a91b3c5d7e9f0a2b4c6d8e1f3a5b7c9d0e1f2a3b4c5d6e7f8a9b0c1d2e',
      blockNumber: 1048291,
      isCryptographicallyProven: true,
    },
  },
];

export const INITIAL_VERIFICATIONS: TechnicalVerification[] = [
  {
    id: 'ver-001',
    submissionId: 'rep-001-vault-reentrancy',
    verifierDid: INITIAL_ORGANIZATION.did,
    verifierName: INITIAL_ORGANIZATION.displayName,
    status: 'VERIFIED_VALID',
    assessedSeverity: 'CRITICAL',
    payoutAmount: 50000,
    verificationNotes: 'Vulnerability confirmed on mainnet fork test. State variable lock position updated in patch v4.0.2.',
    verifiedAt: Date.now() - 12 * 24 * 3600 * 1000,
    txHash: '0x882a1b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a',
  },
];

export const INITIAL_BLOCKCHAIN_EVENTS: BlockchainEvent[] = [
  {
    id: 'evt-001',
    blockNumber: 1048280,
    blockHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    eventType: 'BOUNTY_CREATED',
    timestamp: Date.now() - 45 * 24 * 3600 * 1000,
    actorDid: INITIAL_ORGANIZATION.did,
    actorName: INITIAL_ORGANIZATION.displayName,
    txHash: '0x9d4e12f8b91a01c345d9e87123456789abcdef0123456789abcdef0123456789a',
    details: 'Bounty "DeFi Vault V4" published on-chain.',
    payload: { bountyId: 'bounty-defilabs-vault', totalEscrow: 79000 },
  },
  {
    id: 'evt-002',
    blockNumber: 1048281,
    blockHash: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
    eventType: 'ESCROW_DEPOSITED',
    timestamp: Date.now() - 45 * 24 * 3600 * 1000,
    actorDid: INITIAL_ORGANIZATION.did,
    actorName: INITIAL_ORGANIZATION.displayName,
    txHash: '0x2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d',
    details: 'Deposited $79,000 USD into Smart Contract Escrow Address 0x3A5B...EF11.',
    payload: { escrowContract: '0x3A5B8c72De49102c91823F45Aa78103c8191EF11', amount: 79000 },
  },
  {
    id: 'evt-003',
    blockNumber: 1048291,
    blockHash: '0x4f8e12a91b3c5d7e9f0a2b4c6d8e1f3a5b7c9d0e1f2a3b4c5d6e7f8a9b0c1d2e',
    eventType: 'PROOF_ANCHORED',
    timestamp: Date.now() - 15 * 24 * 3600 * 1000,
    actorDid: INITIAL_RESEARCHER.did,
    actorName: INITIAL_RESEARCHER.displayName,
    txHash: '0x3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e',
    details: 'Cryptographic Proof-of-Discovery anchored for report "Flashloan-assisted Reentrancy".',
    payload: { proofId: 'proof-rep-001', evidenceHash: report1EvidenceHash },
  },
  {
    id: 'evt-004',
    blockNumber: 1048310,
    blockHash: '0x5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b',
    eventType: 'VERIFICATION_RECORDED',
    timestamp: Date.now() - 12 * 24 * 3600 * 1000,
    actorDid: INITIAL_ORGANIZATION.did,
    actorName: INITIAL_ORGANIZATION.displayName,
    txHash: '0x882a1b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a',
    details: 'Technical Verification verified validity as CRITICAL severity.',
    payload: { submissionId: 'rep-001-vault-reentrancy', status: 'VERIFIED_VALID' },
  },
  {
    id: 'evt-005',
    blockNumber: 1048312,
    blockHash: '0x6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c',
    eventType: 'ESCROW_RELEASED',
    timestamp: Date.now() - 12 * 24 * 3600 * 1000,
    actorDid: '0x0000000000000000000000000000000000000000',
    actorName: 'SMART CONTRACT ESCROW ENGINE',
    txHash: '0x992a1b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a',
    details: 'Smart Contract released $50,000 bounty from Escrow 0x3A5B...EF11 to Researcher Alex Rivers.',
    payload: { recipient: INITIAL_RESEARCHER.did, amount: 50000 },
  },
];

export const INITIAL_DISPUTE: Dispute = {
  id: 'disp-001',
  submissionId: 'rep-002-disputed-oracle',
  bountyId: 'bounty-vaultpay-bridge',
  researcherDid: INITIAL_RESEARCHER.did,
  orgDid: 'did:trust:0x99A05A3A3b2A69De6Dbf7f01ED13B2108B2c43f8',
  reason: 'Organization claims vulnerability is out of scope; Researcher provided PoC proving mainnet exploitability.',
  researcherEvidence: 'PoC script demonstrates transaction submission resulting in relay state corruption using public RPC.',
  orgStatement: 'Relay state parameter is designated experimental in documentation section 4.2.',
  status: 'OPEN',
  refereeVotes: [
    {
      refereeDid: 'did:trust:0xArbitrator1',
      refereeName: 'Security Guild Referee #1',
      vote: 'RESEARCHER',
      reason: 'Experimental tag was not listed as excluded in explicit bounty scope document.',
    },
  ],
  escrowFrozenAmount: 15000,
  createdAt: Date.now() - 3 * 24 * 3600 * 1000,
};

export const INITIAL_SYBIL_INDICATOR: SybilRiskIndicator = {
  researcherDid: INITIAL_RESEARCHER.did,
  riskScore: 5,
  duplicateIdentityRisk: 'LOW',
  submissionSpamRisk: 'LOW',
  accountAgeDays: 120,
  flaggedSignals: [],
};
