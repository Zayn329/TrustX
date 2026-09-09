export type IdentityRole = 'researcher' | 'organization' | 'verifier';

export interface ScoreBreakdownFactors {
  technicalContributions: number; // e.g. +35%
  bountyHistory: number;          // e.g. +30%
  verificationRate: number;       // e.g. +20%
  consistency: number;            // e.g. +15%
  riskSignals: number;            // e.g. 0%
}

export interface Identity {
  id: string; // DID format: did:trust:0x...
  handle: string;
  name: string;
  role: IdentityRole;
  trustScore: number; // 0 - 100
  verifiedContributionsCount: number;
  successfulBountiesCount: number;
  totalRewardsEarned: number; // in USD or ETH equivalent
  acceptanceRate: number; // percentage e.g. 96
  reputationFactors: ScoreBreakdownFactors;
  avatarUrl?: string;
  joinedAt: string;
}

export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Bounty {
  id: string;
  title: string;
  organizationId: string;
  organizationName: string;
  organizationTrustScore: number;
  severity: SeverityLevel;
  rewardAmount: number; // USD
  rewardCurrency: string;
  scope: string[];
  rules: string[];
  deadline: string;
  verificationRequirements: string[];
  status: 'active' | 'in_review' | 'resolved' | 'closed';
  escrowId: string;
  description: string;
}

export interface VulnerabilityReport {
  id: string;
  bountyId: string;
  researcherId: string;
  title: string;
  vulnerabilityType: string;
  severity: SeverityLevel;
  description: string;
  reproductionSteps: string;
  impact: string;
  evidence: string;
  createdAt: string;
}

export type ProofStatus = 'generated' | 'anchored_on_chain';

export interface Proof {
  id: string;
  contributionId: string;
  contentHash: string; // SHA-256
  signature: string;
  timestamp: string;
  proofStatus: ProofStatus;
}

export type VerificationStatus = 'pending' | 'valid' | 'invalid' | 'disputed';

export interface Verification {
  id: string;
  contributionId: string;
  verifierId: string;
  verifierName: string;
  status: VerificationStatus;
  notes: string;
  verifiedAt?: string;
}

export interface ReputationEvent {
  id: string;
  researcherId: string;
  delta: number;
  reason: string;
  timestamp: string;
  txHash: string;
}

export type EscrowStatus = 'funded' | 'locked' | 'released' | 'disputed';

export interface Escrow {
  id: string;
  bountyId: string;
  amount: number;
  currency: string;
  status: EscrowStatus;
  companyAddress: string;
  escrowContractAddress: string;
  researcherAddress?: string;
}

export type BlockchainEventType =
  | 'BountyCreated'
  | 'EscrowDeposited'
  | 'SubmissionRegistered'
  | 'ProofAnchored'
  | 'VerificationRecorded'
  | 'ReputationUpdated'
  | 'EscrowReleased'
  | 'DisputeRaised';

export interface BlockchainEvent {
  id: string;
  eventType: BlockchainEventType;
  txHash: string;
  blockNumber: number;
  timestamp: string;
  actor: string;
  status: 'confirmed' | 'pending';
  details: string;
}

export interface Dispute {
  id: string;
  contributionId: string;
  disputedBy: string;
  reason: string;
  evidence: string;
  status: 'open' | 'under_review' | 'resolved';
  createdAt: string;
}

export interface SybilRiskSignal {
  id: string;
  researcherId: string;
  riskScore: number; // 0 - 100
  signals: {
    duplicateSubmissions: boolean;
    suspiciousIdentityLink: boolean;
    anomalousFrequency: boolean;
    unusualIPOverlap: boolean;
  };
  recommendation: string;
}
