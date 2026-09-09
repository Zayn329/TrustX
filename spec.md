# spec.md — Product Requirements Specification

## 1. Executive Overview
The **Trust Engine** is an open-source, blockchain-powered infrastructure enabling trustless cooperation between independent researchers and organizations. It is demonstrated through a **Trustless Bug Bounty Platform**.

### Core Flow
```
Identity → Contribution → Proof → Verification → Immutable Record → Portable Reputation → Escrow Reward
```

### Core Principle & Domain Distinction
- **Cryptographic Proof/Provenance**: SHA-256 evidence hashing, cryptographic signatures, timestamping, and blockchain state anchoring guarantee that a submission existed at a specific time and has not been tampered with.
- **Technical Vulnerability Verification**: Human or automated security evaluation checks whether the submitted proof represents a valid, in-scope vulnerability.
- *Rule*: Blockchain guarantees proof integrity and escrow execution; security verification determines technical validity.

---

## 2. Core Domain Model
All application screens derive their data from a single, deterministic, cross-referenced domain model:

1. **Identity**:
   - `id`: DID string (e.g., `did:trust:0x8f3...`)
   - `handle`: Researcher or Organization name
   - `role`: `'researcher' | 'organization' | 'verifier'`
   - `trustScore`: 0-100 score
   - `verifiedCount`: number
   - `reputation`: Breakdown object (Technical, Consistency, Verification Rate, Risk)
2. **Bounty**:
   - `id`: Unique identifier
   - `title`, `organizationId`, `severity`, `rewardAmount` (ETH/USDC)
   - `status`: `'active' | 'in_review' | 'resolved' | 'closed'`
   - `scope`: Covered assets and domains
   - `rules`: Bounty rules and submission guidelines
   - `escrowId`: Associated smart contract escrow
3. **VulnerabilityReport / Contribution**:
   - `id`: Report ID
   - `bountyId`, `researcherId`
   - `title`, `vulnerabilityType`, `severity`, `description`, `reproductionSteps`, `impact`, `evidence`
   - `timestamp`: ISO string
4. **Proof**:
   - `id`: Proof ID
   - `contributionId`
   - `contentHash`: SHA-256 string
   - `signature`: Cryptographic signature mock
   - `proofStatus`: `'generated' | 'anchored_on_chain'`
5. **Verification**:
   - `id`: Verification ID
   - `contributionId`, `verifierId`
   - `status`: `'pending' | 'valid' | 'invalid' | 'disputed'`
   - `notes`, `verifiedAt`: ISO string
6. **ReputationEvent**:
   - `id`: Event ID
   - `researcherId`, `delta`: number, `reason`: string, `timestamp`: ISO string, `txHash`: string
7. **Escrow**:
   - `id`: Smart contract escrow ID
   - `bountyId`, `amount`, `status`: `'funded' | 'locked' | 'released' | 'disputed'`
   - `companyAddress`, `escrowContractAddress`, `researcherAddress`
8. **BlockchainEvent**:
   - `id`: Transaction ID
   - `eventType`: `'BountyCreated' | 'EscrowDeposited' | 'SubmissionRegistered' | 'ProofAnchored' | 'VerificationRecorded' | 'ReputationUpdated' | 'EscrowReleased'`
   - `txHash`, `blockNumber`, `timestamp`, `actor`, `status`: `'confirmed' | 'pending'`
9. **Dispute**:
   - `id`: Dispute ID
   - `contributionId`, `disputedBy`, `reason`, `evidence`, `status`: `'open' | 'under_review' | 'resolved'`

---

## 3. Required User Interfaces & Features

### 3.1 Trust Dashboard
- **Purpose**: Answer *"Why should I trust this researcher or organization?"*
- **Key Metrics**: Trust score, verified contributions, successful bounties, rewards earned, acceptance rate, reputation growth trajectory.
- **Verification History**: Timeline of recently verified claims.

### 3.2 Bug Bounty Marketplace
- **Grid/List View**: Active bounties with organization name, severity badge, reward amount, scope, deadline, verification requirements, and organization trust score indicator.

### 3.3 Bounty Detail View
- **Details**: Full description, scope, rules, reward, escrow funding status, verification requirements, submission timeline, and active submissions count.

### 3.4 Vulnerability Submission Form
- **Form Fields**: Title, vulnerability type, severity (Low, Medium, High, Critical), description, reproduction steps, impact assessment, evidence payload/attachments.
- **Action**: Submitting automatically generates a SHA-256 proof record and registers a mock blockchain event.

### 3.5 Proof-of-Discovery Visualizer
- **Display**: Researcher DID, Submission ID, Timestamp, Content Hash (SHA-256), Signature, Proof Status.
- **Visual Callout**: Clear distinction between *Cryptographically Proven* (tamper-evident record) vs. *Technically Verified* (valid vulnerability).

### 3.6 Verification Lifecycle Timeline
- **Interactive Sequence**:
  `Discovered → Submitted → Proof Generated → Technical Verification → Validated → Reputation Updated → Escrow Released`

### 3.7 Escrow Visualization
- **Flow Diagram**:
  `Company → Bounty Deposit → Smart Contract Escrow → Technical Verification → Researcher Payout`
- **Conditional Status**: Clearly indicates funds locked in escrow contract until technical verification triggers release.

### 3.8 Trust Passport (Decentralized Identity Profile)
- **Identity Card**: DID string, verification status badge, aggregate metrics, bounty history, verified credentials.
- **Portable Reputation Diagram**: Visualizing reputation linked to the DID across multiple simulated platforms (`Platform A`, `Platform B`, `Platform C` → `Trust Engine` → `Portable Reputation`).

### 3.9 Trust Score Breakdown
- **Granular Factors**: Technical contributions (+35%), successful bounty history (+30%), verification success rate (+20%), contribution consistency (+15%), risk signals (0%).
- **Deterministic Calculation**: Fully backed by mock domain model data.

### 3.10 Contribution Explorer
- **End-to-End Audit Trail**: Identity → Contribution → Proof → Verification → Immutable Record → Reputation Event → Reward.

### 3.11 Interactive Trust Graph
- **Node-Link Diagram**: Visual representation connecting Identities, Contributions, Bounties, Proofs, Organizations, and Reputation Events using SVG/Canvas/D3-like component logic.

### 3.12 Dispute Resolution Interface
- **Dispute View**: Disputed submission details, claims from both researcher and company, evidence hashes, current review state, and conditional escrow status.

### 3.13 Blockchain Activity Explorer
- **Ledger View**: Live list of simulated blockchain events (Bounty Created, Escrow Deposited, Proof Anchored, Reputation Updated, Escrow Released) with block numbers, gas/tx hashes, and actor addresses.
- *Integrity Note*: Explicitly labeled as "Simulated Blockchain Ledger".

### 3.14 Sybil / Fraud Risk Analysis View
- **Risk Signals**: Duplicate submission detection, suspicious identity relationships, anomalous frequency, Sybil risk score indicator.
