# plan.md — Implementation Plan

## Progressive Implementation Stages

### Stage 1: Domain Models & Deterministic Mock Data Generator
- **Purpose**: Define domain TypeScript interfaces and construct cross-referenced initial mock data.
- **Files**: `src/domain/types.ts`, `src/domain/mockData.ts`, `src/domain/cryptoUtils.ts`
- **Verification**: `npm run build` succeeds and types validate cleanly.

### Stage 2: Central Application Store & Context
- **Purpose**: Create `TrustContext` and provider with actions (`addSubmission`, `verifySubmission`, `raiseDispute`).
- **Files**: `src/store/TrustContext.tsx`
- **Verification**: App context compiles cleanly and exports global provider.

### Stage 3: Navigation Shell & Core Layout
- **Purpose**: Build main header, navigation bar, and tab router.
- **Files**: `src/components/layout/Header.tsx`, `src/components/layout/Navbar.tsx`, `src/App.tsx`
- **Verification**: Header and navigation switch active view state seamlessly.

### Stage 4: Trust Dashboard View
- **Purpose**: Build Trust Dashboard showing trust score, verified contributions, success rates, and verification timeline.
- **Files**: `src/components/views/DashboardView.tsx`, `src/components/ui/TrustScoreCard.tsx`
- **Verification**: Renders metrics and recent verifications from mock store.

### Stage 5: Bug Bounty Marketplace & Detail View
- **Purpose**: Render bounty list with severity, escrow status, rewards, and detailed view with submission form modal.
- **Files**: `src/components/views/BountiesView.tsx`, `src/components/bounties/BountyCard.tsx`, `src/components/bounties/BountyDetailModal.tsx`, `src/components/bounties/SubmitVulnerabilityModal.tsx`
- **Verification**: User can browse bounties and submit new vulnerability reports.

### Stage 6: Proof-of-Discovery & Verification Timeline
- **Purpose**: Display proof cards clearly distinguishing *Cryptographically Proven* vs. *Technically Verified*.
- **Files**: `src/components/ui/ProofCard.tsx`, `src/components/ui/VerificationTimeline.tsx`
- **Verification**: Proof cards display SHA-256 hash and verification timeline accurately.

### Stage 7: Trust Passport & Portable Reputation View
- **Purpose**: Display researcher DID profile, score breakdown, and cross-platform portable reputation diagram.
- **Files**: `src/components/views/PassportView.tsx`, `src/components/passport/PortableReputationDiagram.tsx`, `src/components/passport/ScoreBreakdown.tsx`
- **Verification**: Renders trust passport with DID, reputation growth history, and factor breakdown.

### Stage 8: Contribution Explorer View
- **Purpose**: Provide audit trail inspector (Identity → Contribution → Proof → Verification → Ledger → Reward).
- **Files**: `src/components/views/ExplorerView.tsx`
- **Verification**: Selecting a contribution inspects the full end-to-end chain.

### Stage 9: Interactive Trust Graph View
- **Purpose**: Visual node-link SVG graph connecting identities, contributions, proofs, bounties, and escrow contracts.
- **Files**: `src/components/views/GraphView.tsx`
- **Verification**: Nodes and edges render interactively based on store entities.

### Stage 10: Network View (Ledger, Disputes, Fraud Risk)
- **Purpose**: Simulated blockchain activity explorer, dispute resolution panel, and Sybil risk visualizer.
- **Files**: `src/components/views/NetworkView.tsx`, `src/components/network/LedgerExplorer.tsx`, `src/components/network/DisputePanel.tsx`, `src/components/network/RiskAnalysis.tsx`
- **Verification**: Shows simulated blockchain transactions, open disputes, and deterministic fraud risk indicators.

### Stage 11: Pre-commit Verification & Polish
- **Purpose**: Ensure proper testing, verification, review, and reflection are done. Run build check `npm run build`.
- **Files**: All codebase files.
- **Verification**: Clean build with zero TypeScript or build errors.

### Stage 12: Final Submission
- **Purpose**: Finalize submission after all verifications pass.
- **Files**: Repository state.
- **Verification**: `submit` tool called successfully.
