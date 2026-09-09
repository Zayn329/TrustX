export type Role = 'RESEARCHER' | 'ORGANIZATION' | 'VERIFIER' | 'ARBITRATOR';

export interface VerifiedPlatform {
  platformName: string;
  externalUsername: string;
  proofUrl: string;
  verifiedAt: number;
}

export interface Identity {
  did: string;
  handle: string;
  displayName: string;
  avatarUrl: string;
  role: Role;
  joinedTimestamp: number;
  publicKey: string;
  bio: string;
  verifiedPlatforms: VerifiedPlatform[];
}

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type EscrowStatus =
  | 'AWAITING_DEPOSIT'
  | 'DEPOSITED_LOCKED'
  | 'PARTIALLY_RELEASED'
  | 'RELEASED'
  | 'DISPUTED_FROZEN'
  | 'REFUNDED';

export interface Bounty {
  id: string;
  orgDid: string;
  orgName: string;
  orgAvatar: string;
  title: string;
  description: string;
  scope: string[];
  severityRewards: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  totalEscrowLocked: number;
  escrowStatus: EscrowStatus;
  escrowContractAddress: string;
  escrowTxHash: string;
  createdAt: number;
  deadline: number;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
}

export interface Proof {
  proofId: string;
  submissionId: string;
  researcherDid: string;
  evidenceHash: string;
  contentHash: string;
  signature: string;
  timestamp: number;
  blockHash: string;
  blockNumber: number;
  isCryptographicallyProven: boolean;
}

export type VerificationStatus =
  | 'SUBMITTED'
  | 'PROVEN'
  | 'IN_REVIEW'
  | 'VERIFIED_VALID'
  | 'VERIFIED_INVALID'
  | 'DISPUTED'
  | 'REWARD_RELEASED';

export interface VulnerabilityReport {
  id: string;
  bountyId: string;
  bountyTitle: string;
  researcherDid: string;
  researcherHandle: string;
  title: string;
  vulnerabilityType: string;
  severity: Severity;
  description: string;
  reproductionSteps: string;
  impact: string;
  proof: Proof;
  status: VerificationStatus;
  createdAt: number;
}

export interface TechnicalVerification {
  id: string;
  submissionId: string;
  verifierDid: string;
  verifierName: string;
  status: VerificationStatus;
  assessedSeverity: Severity;
  payoutAmount: number;
  verificationNotes: string;
  verifiedAt: number;
  txHash: string;
}

export interface TrustScoreBreakdown {
  overallScore: number; // 0 - 1000
  technicalContributions: number; // 0 - 300
  successfulVerifications: number; // 0 - 300
  bountyHistory: number; // 0 - 250
  projectTrust: number; // 0 - 150
  riskDeductions: number; // Penalty
}

export interface BlockchainEvent {
  id: string;
  blockNumber: number;
  blockHash: string;
  eventType:
    | 'BOUNTY_CREATED'
    | 'ESCROW_DEPOSITED'
    | 'SUBMISSION_REGISTERED'
    | 'PROOF_ANCHORED'
    | 'VERIFICATION_RECORDED'
    | 'REPUTATION_UPDATED'
    | 'ESCROW_RELEASED'
    | 'DISPUTE_RAISED';
  timestamp: number;
  actorDid: string;
  actorName: string;
  txHash: string;
  details: string;
  payload: Record<string, any>;
}

export interface Dispute {
  id: string;
  submissionId: string;
  bountyId: string;
  researcherDid: string;
  orgDid: string;
  reason: string;
  researcherEvidence: string;
  orgStatement: string;
  status: 'OPEN' | 'RESOLVED_RESEARCHER' | 'RESOLVED_ORG' | 'DISMISSED';
  refereeVotes: Array<{
    refereeDid: string;
    refereeName: string;
    vote: 'RESEARCHER' | 'ORG';
    reason: string;
  }>;
  escrowFrozenAmount: number;
  createdAt: number;
  resolvedAt?: number;
}

export interface SybilRiskIndicator {
  researcherDid: string;
  riskScore: number; // 0 - 100
  duplicateIdentityRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  submissionSpamRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  accountAgeDays: number;
  flaggedSignals: string[];
}

export interface TrustGraphNode {
  id: string;
  label: string;
  type: 'RESEARCHER' | 'ORGANIZATION' | 'BOUNTY' | 'PROOF' | 'REPUTATION_EVENT';
  trustScore?: number;
  details?: string;
}

export interface TrustGraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  type: 'SUBMITTED' | 'PROVED' | 'VERIFIED' | 'ESCROW_RELEASED' | 'ISSUED_BY';
}
