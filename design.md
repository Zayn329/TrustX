# design.md — Application Architecture & Design System

## 1. System Architecture

The MVP is structured as a client-side React single-page application with a central, reactive domain store and zero external backend/blockchain dependencies.

```
┌────────────────────────────────────────────────────────────────────────┐
│                          React Application                             │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                     Navigation Header & View Shell               │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                   │                                    │
│  ┌────────────────────────────────┴─────────────────────────────────┐  │
│  │                            Views Router                          │  │
│  │  - Trust Dashboard         - Passport / Identity                 │  │
│  │  - Bounty Marketplace      - Contribution Explorer               │  │
│  │  - Bounty Detail & Submit  - Interactive Trust Graph             │  │
│  │  - Proof & Verification    - Network (Ledger, Disputes, Risk)    │  │
│  └────────────────────────────────┬─────────────────────────────────┘  │
│                                   │                                    │
│  ┌────────────────────────────────▼─────────────────────────────────┐  │
│  │                 Central Domain State (React Context)            │  │
│  │  - Identities    - Bounties        - Contributions / Submissions   │  │
│  │  - Proofs        - Verifications   - Escrow Contracts            │  │
│  │  - Disputes      - Risk Signals    - Blockchain Ledger Events    │  │
│  └────────────────────────────────┬─────────────────────────────────┘  │
│                                   │                                    │
│  ┌────────────────────────────────▼─────────────────────────────────┐  │
│  │             Deterministic Mock Domain Generator & Logic          │  │
│  │  - SHA-256 Mock Hasher             - Score Calculator            │  │
│  │  - Initial Cross-Linked Datasets   - Ledger Simulator            │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Navigation Architecture
Rather than 15 disconnected pages, views are organized into 6 coherent core navigation sections:

1. **Dashboard** (`/dashboard`): Aggregate trust score, recent verifications, activity overview.
2. **Bounties** (`/bounties`): Marketplace grid and detailed bounty view with submission modal.
3. **Passport** (`/passport`): Researcher identity, portable reputation, trust score breakdown.
4. **Explorer** (`/explorer`): End-to-end contribution visualizer & audit trail.
5. **Trust Graph** (`/graph`): Interactive SVG visualizer linking identities, bounties, proofs, and verifications.
6. **Network** (`/network`): Blockchain activity ledger, dispute resolution, sybil/fraud risk metrics.

---

## 3. Visual Design Direction

### Aesthetic Guidelines
- **Palette**: Slate/Zinc dark & light theme (Slate 900 background accents, Slate 800 cards, Emerald 500 for cryptographically verified / success items, Amber 500 for pending/escrow locked, Indigo 600 for primary action buttons, Red 500 for risk signals).
- **Typography**: Clean sans-serif (Inter / System font stack) with monospaced font for hashes, signatures, transaction IDs, and DIDs (`font-mono`).
- **Cards & Visual Containers**: Crisp border definition (`border border-slate-700/50`), subtle rounded corners (`rounded-xl`), high-contrast hierarchy.
- **Badges & Statuses**: Distinct status chips for *Cryptographically Proven* vs. *Technically Verified*.

---

## 4. State Management Strategy
- A custom React Context (`TrustEngineContext`) provides state and mutating functions across the app:
  - `addSubmission(submissionData)`: Hashes payload, creates `Contribution`, creates `Proof`, triggers mock `BlockchainEvent`, updates `Escrow` status.
  - `verifySubmission(submissionId, isValid)`: Updates `Verification` status, calculates new `TrustScore`, records `ReputationEvent`, unlocks `Escrow`.
  - `raiseDispute(submissionId, reason)`: Creates `Dispute`, locks `Escrow`, records ledger transaction.
