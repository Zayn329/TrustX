# Architecture & Design Document (design.md)

## 1. System Architecture

The Trust Engine MVP is designed as a modular TypeScript/React application with pure domain services and a unified reactive state store.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        React Application Shell                          │
│        (Navigation Header, Live Demo Flow Control, View Router)        │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│                           View Layer                                   │
│  [Trust Dashboard] [Marketplace] [Submission Flow] [Proof Viewer]      │
│  [Verification Timeline] [Escrow Flow] [Identity Profile] [Reputation] │
│  [Score Breakdown] [Explorer] [Trust Graph] [Dispute Center]           │
│  [Ledger Explorer] [Sybil/Risk View]                                  │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│                   Reactive Store (Global State)                         │
│  • Bounties & Escrow States     • Submissions & Proof Records          │
│  • Researcher Identities         • Verification Audits                  │
│  • Blockchain Ledger Blocks      • Reputation & Trust Scores            │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│                       Pure Domain Services                             │
│  • SHA-256 Crypto Engine        • Deterministic Trust Calculator        │
│  • Escrow State Machine          • Sybil Risk Assessment Engine        │
│  • Trust Graph Generator         • Portable Passport Serialization      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Domain Models

### Identity
```typescript
export interface Identity {
  did: string; // e.g. "did:trust:0x71C...9B1"
  handle: string; // e.g. "alex_sec"
  displayName: string;
  avatarUrl: string;
  role: 'RESEARCHER' | 'ORGANIZATION' | 'VERIFIER' | 'ARBITRATOR';
  joinedTimestamp: number;
  publicKey: string;
  bio: string;
  verifiedPlatforms: Array<{
    platformName: string;
    externalUsername: string;
    proofUrl: string;
    verifiedAt: number;
  }>;
}
```

### Bounty & Escrow
```typescript
export type EscrowStatus = 'AWAITING_DEPOSIT' | 'DEPOSITED_LOCKED' | 'PARTIALLY_RELEASED' | 'RELEASED' | 'DISPUTED_FROZEN' | 'REFUNDED';

export interface Bounty {
  id: string;
  orgDid: string;
  orgName: string;
  title: string;
  description: string;
  scope: string[];
  severityRewards: {
    critical: number; // e.g. $15,000
    high: number;     // e.g. $7,500
    medium: number;   // e.g. $2,500
    low: number;      // e.g. $500
  };
  totalEscrowLocked: number;
  escrowStatus: EscrowStatus;
  escrowContractAddress: string;
  escrowTxHash: string;
  createdAt: number;
  deadline: number;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
}
```

### Vulnerability Report & Proof
```typescript
export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface Proof {
  proofId: string;
  submissionId: string;
  researcherDid: string;
  evidenceHash: string; // SHA-256 of reproduction steps & payload
  contentHash: string;  // SHA-256 of report metadata
  signature: string;    // Cryptographic signature simulation
  timestamp: number;
  blockHash: string;
  blockNumber: number;
  isCryptographicallyProven: boolean;
}

export interface VulnerabilityReport {
  id: string;
  bountyId: string;
  researcherDid: string;
  title: string;
  vulnerabilityType: string;
  severity: Severity;
  description: string;
  reproductionSteps: string;
  impact: string;
  proof: Proof;
  createdAt: number;
}
```

### Technical Verification & Escrow Payout
```typescript
export type VerificationStatus = 'PENDING' | 'IN_REVIEW' | 'VERIFIED_VALID' | 'VERIFIED_INVALID' | 'DISPUTED';

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
```

### Reputation & Trust Score Engine
```typescript
export interface TrustScoreBreakdown {
  overallScore: number; // 0 - 1000 scale
  technicalContributions: number; // Max 300
  successfulVerifications: number; // Max 300
  bountyHistory: number; // Max 250
  projectTrust: number; // Max 150
  riskDeductions: number; // Deducted penalty points
}
```

---

## 3. Trust Deterministic Scoring Algorithm

The Trust Score $T \in [0, 1000]$ is computed deterministically:

$$T = \min\left(1000, \max\left(0, S_{\text{tech}} + S_{\text{verif}} + S_{\text{bounty}} + S_{\text{project}} - R_{\text{risk}}\right)\right)$$

- $S_{\text{tech}} = \min(300, \text{Valid Submissions} \times 30 + \text{Critical Vulnerabilities} \times 50)$
- $S_{\text{verif}} = \min(300, \text{Acceptance Rate \%} \times 3.0)$
- $S_{\text{bounty}} = \min(250, \text{Total Reward Dollars} / 200)$
- $S_{\text{project}} = \min(150, \text{Unique Organizations Audited} \times 30)$
- $R_{\text{risk}} = \text{Sybil Risk Score} \times 2.5 + \text{Invalid/Spam Submissions} \times 40$

---

## 4. Testing Strategy
- Unit tests for SHA-256 calculation, trust scoring formulas, and escrow status transition rules.
- Store state mutation tests (submitting report updates proof, block ledger, timeline state, and trust graph).
- End-to-end user flow verification.
