import {
  Identity,
  Bounty,
  VulnerabilityReport,
  Proof,
  Verification,
  ReputationEvent,
  Escrow,
  BlockchainEvent,
  Dispute,
  SybilRiskSignal
} from './types';

export const INITIAL_IDENTITIES: Identity[] = [
  {
    id: 'did:trust:0x71c89a42e12b',
    handle: 'alex_cyber',
    name: 'Alex Rivera',
    role: 'researcher',
    trustScore: 94,
    verifiedContributionsCount: 18,
    successfulBountiesCount: 14,
    totalRewardsEarned: 84500,
    acceptanceRate: 95,
    reputationFactors: {
      technicalContributions: 35,
      bountyHistory: 29,
      verificationRate: 18,
      consistency: 12,
      riskSignals: 0
    },
    joinedAt: '2023-04-12T10:00:00Z'
  },
  {
    id: 'did:trust:0x39b10f8812c4',
    handle: 'sarah_sec',
    name: 'Sarah Chen',
    role: 'researcher',
    trustScore: 88,
    verifiedContributionsCount: 11,
    successfulBountiesCount: 9,
    totalRewardsEarned: 42000,
    acceptanceRate: 91,
    reputationFactors: {
      technicalContributions: 32,
      bountyHistory: 27,
      verificationRate: 17,
      consistency: 12,
      riskSignals: 0
    },
    joinedAt: '2023-08-19T14:30:00Z'
  },
  {
    id: 'did:trust:0xorg_nexus_pay',
    handle: 'nexus_financial',
    name: 'Nexus Financial Inc.',
    role: 'organization',
    trustScore: 98,
    verifiedContributionsCount: 42,
    successfulBountiesCount: 38,
    totalRewardsEarned: 0,
    acceptanceRate: 98,
    reputationFactors: {
      technicalContributions: 35,
      bountyHistory: 30,
      verificationRate: 20,
      consistency: 13,
      riskSignals: 0
    },
    joinedAt: '2022-11-01T09:00:00Z'
  },
  {
    id: 'did:trust:0xorg_cloud_vault',
    handle: 'cloudvault_io',
    name: 'CloudVault Infrastructure',
    role: 'organization',
    trustScore: 96,
    verifiedContributionsCount: 29,
    successfulBountiesCount: 25,
    totalRewardsEarned: 0,
    acceptanceRate: 96,
    reputationFactors: {
      technicalContributions: 34,
      bountyHistory: 29,
      verificationRate: 19,
      consistency: 14,
      riskSignals: 0
    },
    joinedAt: '2023-01-15T11:20:00Z'
  }
];

export const INITIAL_BOUNTIES: Bounty[] = [
  {
    id: 'bounty-101',
    title: 'Smart Contract Reentrancy & Flash Loan Arbitrage Mitigation',
    organizationId: 'did:trust:0xorg_nexus_pay',
    organizationName: 'Nexus Financial Inc.',
    organizationTrustScore: 98,
    severity: 'Critical',
    rewardAmount: 25000,
    rewardCurrency: 'USDC',
    scope: ['Vault.sol', 'EscrowBridge.sol', 'api.nexus.fin/v2/settle'],
    rules: [
      'Must provide PoC code reproducing contract state manipulation',
      'Do not perform public disclosure prior to fix verification',
      'Must anchor submission proof hash on Trust Engine ledger'
    ],
    deadline: '2025-06-30T23:59:59Z',
    verificationRequirements: [
      'Cryptographic SHA-256 evidence timestamping',
      'Independent technical review by Nexus Security Team',
      'Automated test suite passing verification'
    ],
    status: 'active',
    escrowId: 'escrow-101',
    description: 'Nexus Financial is seeking security disclosures regarding potential reentrancy, oracle manipulation, or state desynchronization within our core settlement bridge contracts.'
  },
  {
    id: 'bounty-102',
    title: 'Zero-Day Authentication Bypass in Cloud Vault Management Portal',
    organizationId: 'did:trust:0xorg_cloud_vault',
    organizationName: 'CloudVault Infrastructure',
    organizationTrustScore: 96,
    severity: 'High',
    rewardAmount: 12000,
    rewardCurrency: 'USDC',
    scope: ['*.cloudvault.io', 'auth.cloudvault.io/oauth2'],
    rules: [
      'No disruption to production tenant data',
      'Include HTTP request/response payloads in cryptographic evidence'
    ],
    deadline: '2025-08-15T23:59:59Z',
    verificationRequirements: [
      'Proof-of-discovery hash anchored on-chain',
      'Reproducible HTTP flow payload'
    ],
    status: 'active',
    escrowId: 'escrow-102',
    description: 'Identify flaws in OAuth2 implementation, JWT signature validation, or session management allowing unauthorized administrative access.'
  }
];

export const INITIAL_ESCROWS: Escrow[] = [
  {
    id: 'escrow-101',
    bountyId: 'bounty-101',
    amount: 25000,
    currency: 'USDC',
    status: 'locked',
    companyAddress: '0x8f23A90C...41bC',
    escrowContractAddress: '0xTrustEscrowVault_101',
    researcherAddress: '0x71c89a42e12b'
  },
  {
    id: 'escrow-102',
    bountyId: 'bounty-102',
    amount: 12000,
    currency: 'USDC',
    status: 'funded',
    companyAddress: '0x33A19eF1...889a',
    escrowContractAddress: '0xTrustEscrowVault_102'
  }
];

export const INITIAL_REPORTS: VulnerabilityReport[] = [
  {
    id: 'rep-8801',
    bountyId: 'bounty-101',
    researcherId: 'did:trust:0x71c89a42e12b',
    title: 'Precision loss in liquidity pool calculation allows token drain',
    vulnerabilityType: 'Smart Contract Business Logic Flaw',
    severity: 'Critical',
    description: 'Under specific rounding conditions during flash loan settlement, integer division truncates precision, allowing repeated minor withdrawals without collateral lock.',
    reproductionSteps: '1. Call deposit(1000)\n2. Execute flashLoan with exact 1e18 delta\n3. Trigger settlement method before state update',
    impact: 'Potential drain of locked liquidity pool funds under high frequency execution.',
    evidence: 'Calculated SHA-256 string for code PoC: 0xa8f391c49e...',
    createdAt: '2025-02-10T11:15:00Z'
  }
];

export const INITIAL_PROOFS: Proof[] = [
  {
    id: 'proof-8801',
    contributionId: 'rep-8801',
    contentHash: '0xa8f391c49e8832a104b291c7784f1122aef902b54d6199321c882103410f11aa',
    signature: 'sig_42e12b_a8f391c4',
    timestamp: '2025-02-10T11:15:05Z',
    proofStatus: 'anchored_on_chain'
  }
];

export const INITIAL_VERIFICATIONS: Verification[] = [
  {
    id: 'ver-8801',
    contributionId: 'rep-8801',
    verifierId: 'did:trust:0xorg_nexus_pay',
    verifierName: 'Nexus Security Audit Team',
    status: 'valid',
    notes: 'Vulnerability verified on testnet deployment. Reentrancy guard patch deployed.',
    verifiedAt: '2025-02-11T09:40:00Z'
  }
];

export const INITIAL_REPUTATION_EVENTS: ReputationEvent[] = [
  {
    id: 'repevt-1',
    researcherId: 'did:trust:0x71c89a42e12b',
    delta: 5,
    reason: 'Verified Critical vulnerability submission (Bounty #101)',
    timestamp: '2025-02-11T09:40:00Z',
    txHash: '0x99182371abf31a293810248812c300841203002a71f01c29302194012'
  }
];

export const INITIAL_BLOCKCHAIN_EVENTS: BlockchainEvent[] = [
  {
    id: 'blk-1',
    eventType: 'BountyCreated',
    txHash: '0x1111a8f93...4021',
    blockNumber: 18402910,
    timestamp: '2025-02-01T08:00:00Z',
    actor: 'did:trust:0xorg_nexus_pay',
    status: 'confirmed',
    details: 'Bounty "Smart Contract Reentrancy" created with 25,000 USDC escrow.'
  },
  {
    id: 'blk-2',
    eventType: 'EscrowDeposited',
    txHash: '0x2222b9182...9921',
    blockNumber: 18402912,
    timestamp: '2025-02-01T08:02:00Z',
    actor: 'did:trust:0xorg_nexus_pay',
    status: 'confirmed',
    details: 'Smart Contract Escrow 0xTrustEscrowVault_101 funded with 25,000 USDC.'
  },
  {
    id: 'blk-3',
    eventType: 'SubmissionRegistered',
    txHash: '0x3333c1029...7710',
    blockNumber: 18419200,
    timestamp: '2025-02-10T11:15:00Z',
    actor: 'did:trust:0x71c89a42e12b',
    status: 'confirmed',
    details: 'Vulnerability report rep-8801 registered.'
  },
  {
    id: 'blk-4',
    eventType: 'ProofAnchored',
    txHash: '0x4444d9012...8831',
    blockNumber: 18419201,
    timestamp: '2025-02-10T11:15:05Z',
    actor: 'did:trust:0x71c89a42e12b',
    status: 'confirmed',
    details: 'Proof hash 0xa8f391c49e... anchored to block.'
  },
  {
    id: 'blk-5',
    eventType: 'VerificationRecorded',
    txHash: '0x5555e1029...1203',
    blockNumber: 18420100,
    timestamp: '2025-02-11T09:40:00Z',
    actor: 'did:trust:0xorg_nexus_pay',
    status: 'confirmed',
    details: 'Technical verification recorded: VALID.'
  },
  {
    id: 'blk-6',
    eventType: 'ReputationUpdated',
    txHash: '0x6666f3910...9901',
    blockNumber: 18420101,
    timestamp: '2025-02-11T09:40:00Z',
    actor: 'Trust Engine Protocol',
    status: 'confirmed',
    details: 'Researcher trust score increased (+5 points).'
  }
];

export const INITIAL_DISPUTES: Dispute[] = [
  {
    id: 'disp-01',
    contributionId: 'rep-8801',
    disputedBy: 'CloudVault Infrastructure',
    reason: 'Dispute over severity classification (High vs Medium)',
    evidence: 'Initial scope documentation stated staging endpoint reduced impact.',
    status: 'under_review',
    createdAt: '2025-02-12T14:00:00Z'
  }
];

export const INITIAL_SYBIL_RISK: SybilRiskSignal[] = [
  {
    id: 'syb-01',
    researcherId: 'did:trust:0x71c89a42e12b',
    riskScore: 4, // Very low risk
    signals: {
      duplicateSubmissions: false,
      suspiciousIdentityLink: false,
      anomalousFrequency: false,
      unusualIPOverlap: false
    },
    recommendation: 'Low risk profile. High verifiable contribution trail.'
  },
  {
    id: 'syb-02',
    researcherId: 'did:trust:0x39b10f8812c4',
    riskScore: 12, // Low risk
    signals: {
      duplicateSubmissions: false,
      suspiciousIdentityLink: false,
      anomalousFrequency: true,
      unusualIPOverlap: false
    },
    recommendation: 'Subsequent submissions within short interval. Verified identity.'
  }
];
