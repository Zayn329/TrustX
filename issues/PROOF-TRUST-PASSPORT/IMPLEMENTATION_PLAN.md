# Stage 2 — Proof & Trust Passport: Implementation Plan

## Executive Summary
This implementation plan outlines the exact changes required to deliver the Stage 2 **Proof & Trust Passport** experience in TrustX. The goal is to provide faculty and evaluators with complete, verifiable visibility into evidence hashes, oracle proof signatures, researcher identities, and reputation score mechanics.

---

## Task Breakdown

### Priority 0 (P0) — Record Coupling & Proof Inspector
- **Task 0.1: Build `ProofDetailModal.tsx` Component**
  - **Problem**: Evaluators need a dedicated interface to inspect evidence SHA-256 hashes, verify payload integrity, inspect Ed25519 oracle signatures, and view execution logs.
  - **Files to Modify/Create**: `src/components/passport/ProofDetailModal.tsx` (New), `src/components/views/ExplorerView.tsx`.
  - **Implementation**: Create modal displaying Report ID, Bounty Title, Researcher DID/Wallet, SHA-256 Evidence Hash, Oracle Signature, Execution Logs, and Anchoring Status (Off-Chain Ed25519 / On-Chain Sepolia). Add an "Interactive Hash Re-calculator" button that runs `crypto.subtle.digest('SHA-256')` over the current report payload to visually verify hash match.
  - **Acceptance Criteria**: Evaluator can click "Inspect Proof" on any submission to view full metadata and verify evidence hash integrity.

### Priority 1 (P1) — Trust Passport Enhancements & Identity Linking
- **Task 1.1: Enhance `PassportView.tsx` and Contribution Linking**
  - **Problem**: `PassportView.tsx` shows researcher reputation, but needs direct traceability from verified contributions back to proof records and evidence hashes.
  - **Files to Modify**: `src/components/views/PassportView.tsx`, `src/components/passport/ScoreBreakdown.tsx`.
  - **Implementation**: Update `PassportView` contribution items to include an "Inspect Proof & Evidence Hash" action button that opens `ProofDetailModal`. Ensure credential badges accurately display W3C Verifiable Credential properties and issuance timestamps.
  - **Acceptance Criteria**: Clicking a contribution in PassportView immediately opens the Proof Detail Modal with complete evidence and verification details.

- **Task 1.2: Clarify Trust Score Mechanics & Deduplication**
  - **Problem**: Evaluators must understand why the trust score is at its given value and confirm that unverified submissions or repeated verifications do not double-count reputation points.
  - **Files to Modify**: `src/components/passport/ScoreBreakdown.tsx`, `src/store/TrustContext.tsx`.
  - **Implementation**: Display explicit breakdown formula: `Base Trust Score (90) + Valid Verified Submissions (+3 each) - Deductions`. Highlight that unverified or invalid submissions add 0 points.
  - **Acceptance Criteria**: Evaluator can read clear score breakdown explanation matching actual `calculateTrustScore()` logic.

### Priority 2 (P2) — E2E Demo Validation & Test Suite
- **Task 2.1: Unit & Integration Testing**
  - **Problem**: Regression test suite must verify evidence hash re-calculation, proof signature display, and reputation calculation logic.
  - **Files to Create/Modify**: `src/__tests__/stage2_passport_proof.test.tsx`.
  - **Implementation**: Add Vitest tests for hash recalculation matching `generateEvidenceHash`, score calculation logic with valid vs invalid submissions, and proof modal rendering.
  - **Acceptance Criteria**: All unit tests pass cleanly (`npm test`).

- **Task 2.2: Automated Playwright Browser E2E Verification**
  - **Problem**: Need visual and functional confirmation of the complete Stage 2 user journey in a real browser.
  - **Implementation**: Run end-to-end browser script testing submission -> oracle verification -> proof detail modal opening -> evidence hash recalculation -> passport score update verification.
  - **Acceptance Criteria**: Full end-to-end flow executes in Playwright with clean screenshots generated.

---

## Order of Execution
1. Create `src/components/passport/ProofDetailModal.tsx`.
2. Connect `ProofDetailModal` in `ExplorerView.tsx` and `PassportView.tsx`.
3. Update `ScoreBreakdown.tsx` with clear formula explanations and local vs on-chain labels.
4. Add Vitest suite `src/__tests__/stage2_passport_proof.test.tsx`.
5. Execute `npm test` and `npm run build`.
6. Perform Playwright browser verification and generate implementation report.
