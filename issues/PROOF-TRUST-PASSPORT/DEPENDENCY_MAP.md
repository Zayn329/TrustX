# Stage 2 — Proof & Trust Passport: Dependency Map

## Executive Overview
Stage 2 connects vulnerability submissions and oracle verification results from Stage 1 into a verifiable **Proof & Trust Passport** experience. This document details the exact repository paths, data lineage, dependency matrices, existing blockers, and demo risk mitigations for the Stage 2 workflow.

---

## 1. User Journey Mapping

| Step | User Action | Screen / Component | Invoked Function / API | State / Data Updated |
| :--- | :--- | :--- | :--- | :--- |
| **1. Submission** | Submit vulnerability PoC | `SubmitVulnerabilityModal.tsx` | `submitVulnerability()` in `TrustContext.tsx` | New `Report` created with SHA-256 `evidenceHash`, persisted to `localStorage` |
| **2. Verification** | Trigger oracle verification | `ExplorerView.tsx` / `BountyDetailModal.tsx` | `verifySubmission()` in `TrustContext.tsx` | Call `http://localhost:8787/api/verify`, produce `Verification` with Ed25519 signature & logs |
| **3. Proof Inspection** | Click "Inspect Proof / Evidence Hash" | `ExplorerView.tsx` or `PassportView.tsx` | `EvidenceModal.tsx` / `ProofDetailModal.tsx` | Renders evidence hash, payload recalculation, oracle signature, and anchoring status |
| **4. Researcher Passport** | Click researcher identity / navigate to Passport | `PassportView.tsx` | `vcManager.ts` / `TrustContext.tsx` | Loads researcher profile, DIDs, verified credentials (VCs), contribution history, and score factors |
| **5. Trust Score Audit** | Inspect trust score breakdown | `ScoreBreakdown.tsx` in `PassportView.tsx` | `calculateTrustScore()` in `TrustContext.tsx` | Renders base score, verified submission bonuses (+3 per valid report), and penalty deductions |

---

## 2. Architecture & Data Lineage

### Data Flow Pipeline
```
[ Vulnerability Payload ]
       │
       ▼ (SHA-256 Web Crypto API)
[ Evidence Hash (0x...) ]
       │
       ▼ (Oracle Server / Worker Execution)
[ Verification Result ] ──► (Ed25519 Cryptographic Signature)
       │
       ▼ (TrustContext Consolidation)
[ Proof Record / Audit Trail ] ──► Persisted in LocalStorage / Firestore
       │
       ▼ (VC Manager / Reputation Registry)
[ Researcher DID / Identity ] ──► Trust Score Update (+3 Rep) ──► Trust Passport View
```

### Verified Relationships & Enforcements
1. **Submission → Evidence Hash**: Formed in `submitVulnerability()` using SHA-256 over title, description, target contract, and PoC call array.
2. **Evidence Hash → Verification Result**: Sent to `oracle/server.cjs` port 8787. Returns `status` (`valid`/`invalid`), `logs`, `coverage`, and `proofSignature`.
3. **Verification Result → Proof Record**: Stored in `verifications` state array in `TrustContext`. Joined with `reports` by `reportId`.
4. **Proof Record → Researcher Identity**: Joined by `researcherDid` / `researcherAddress` (`did:trust:0x71c89a42e12b`).
5. **Researcher Identity → Trust Score**: Evaluated in `calculateTrustScore()` in `TrustContext.tsx`. Scores increase only for unique verified contributions with `status === 'valid'`.

---

## 3. Dependency Matrix

| File Path | Responsibility | Key Dependencies / Consumers | Current State | Data Source | Required Stage 2 Changes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `src/store/TrustContext.tsx` | Central state & business logic | `vcManager.ts`, `oracle/sandboxRunner.ts` | Working | LocalStorage & Oracle API | Ensure proof records, evidence hashes, and trust score updates are coupled seamlessly |
| `src/identity/vcManager.ts` | W3C Verifiable Credential management | `TrustContext.tsx`, `PassportView.tsx` | Working | Local / Crypto API | Support inspection of issue/verification timestamps and proof signatures |
| `src/components/views/PassportView.tsx` | Researcher Trust Passport view | `vcManager.ts`, `ScoreBreakdown.tsx` | Partial | `TrustContext` | Add direct contribution links, evidence hash modal triggers, and proof verification status |
| `src/components/views/ExplorerView.tsx` | Audit Explorer & Evidence Center | `TrustContext.tsx`, `ProofDetailModal.tsx` | Working | `TrustContext` | Enhance evidence hash inspection modal and live recalculation verifier |
| `src/components/passport/ScoreBreakdown.tsx` | Trust score explanation UI | `PassportView.tsx` | Working | Score calculation | Clarify local vs on-chain score, verified submission impact (+3), and deduplication |
| `oracle/server.cjs` | Oracle verification server | Node `crypto` / `worker.cjs` | Working | Port 8787 HTTP | Serves signed Ed25519 verification payloads and evidence hash receipts |

---

## 4. Existing Blockers & Demo Risks

| Defect / Risk | Root Cause | User-Visible Consequence | Fix Strategy |
| :--- | :--- | :--- | :--- |
| **Unclear Evidence Verification** | Evidence hash displayed as static string without dynamic payload re-hashing UI | Evaluator cannot test whether modifying evidence changes the hash | Add interactive "Verify Hash Against Payload" utility in Evidence/Proof Modal |
| **Proof Anchoring Confusion** | Off-chain Ed25519 oracle signature vs on-chain Sepolia contract status not explicit | Evaluator may mistake simulated/off-chain proof for on-chain block transaction | Display clear badge: "Off-Chain Signed (Ed25519)" or "On-Chain Anchored (Sepolia)" |
| **Passport Navigation Disconnect** | Clicking a contribution in Audit Explorer doesn't directly open its Proof Record modal | Non-intuitive user flow during faculty demo | Add direct "Inspect Proof & Evidence Hash" action on both Explorer and Passport screens |

---

## 5. Scope Breakdown

### Must Fix (P0 / P1 for Stage 2 Demo)
1. **Interactive Evidence Hash Inspector**: Interactive modal allowing faculty to inspect raw payload JSON, calculate SHA-256 hash in real time, and verify integrity.
2. **Proof Record Verification Drawer/Modal**: Detailed view of proof ID, bounty context, oracle signature, execution logs, and anchoring state.
3. **Passport Direct Traceability**: Connect researcher's contribution list in `PassportView` directly to evidence hashes and proof records.
4. **Trust Score Transparency**: Explicit breakdown of how valid submissions increase the score (+3) while unverified or failed submissions do not.

### Explicitly Deferred
1. Live Sepolia gas re-submission or re-deployment if local network node is unavailable.
2. Production-grade decentralized identity registry standard updates (DID:Peer/DID:ION).
