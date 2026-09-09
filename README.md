# 🛡️ Trust Engine — Trustless Bug Bounty Platform

> **Trustless Open-Source Infrastructure for Decentralized Vulnerability Management, Programmatic Smart Contract Escrows, and Portable W3C Researcher Reputation.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646cff.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-33_Tests_Passing-green.svg)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📌 Executive Summary

The **Trust Engine** is an open-source decentralized trust infrastructure designed to replace traditional, centralized bug bounty platforms (e.g., HackerOne, Bugcrowd). Traditional platforms suffer from intermediary dispute delays, non-transparent payout evaluations, siloed researcher reputation records, and vulnerable centralized proof storage.

**Trust Engine** solves these challenges by combining:
1. **Cryptographic Proof-of-Discovery (SHA-256)**: Instant timestamped evidence hashing and EIP-712 typed data signatures ensuring indisputable proof of prior discovery.
2. **Programmatic Smart Contract Escrows (`TrustBountyEscrow.sol`)**: Automated payout execution upon technical validation, eliminating payment withholdings.
3. **W3C Decentralized Identity (DIDs & VCs)**: Portable, cross-platform researcher reputation records using `did:trust` & `did:ethr` methods and JSON-LD Verifiable Credentials.
4. **Decentralized Arbitration Court (`DisputeArbitration.sol`)**: Staked juror consensus for contested vulnerability severity and payout disputes.

---

## 🏛️ Core Protocol Flow & Integrity Distinction

The platform enforces a strict separation between **Cryptographic Provenance** and **Technical Verification**:

```
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │ 1. CRYPTOGRAPHIC PROOF & PROVENANCE                                                     │
 │    - Immediate SHA-256 evidence payload hashing.                                      │
 │    - EIP-712 typed data wallet signature (eth_signTypedData_v4).                         │
 │    - Client-side AES-256-GCM payload encryption before IPFS CIDv1 base32 pinning.       │
 │    - Guarantees indisputable timestamped evidence that cannot be altered or backdated. │
 └───────────────────────────────────────────────────┬────────────────────────────────────┘
                                                     │
                                                     ▼
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │ 2. TECHNICAL VULNERABILITY VERIFICATION & ORACLE EVALUATION                           │
 │    - AI/ML static pattern recognition & automated PoC execution sandbox.              │
 │    - Security reviewer impact validation against defined scope.                       │
 │    - Smart contract triggers programmatic escrow release upon valid confirmation.       │
 │    - On-chain reputation registry updates researcher DID trust score.                 │
 └────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🤖 AI / ML Engineering & Intelligence Pipeline

The **Trust Engine** integrates targeted AI engineering and machine learning algorithms across three core subsystems:

### 1. Automated PoC Vulnerability Triage & Static Code Analysis
- **Static Pattern Recognition**: The sandbox engine (`oracle/sandboxRunner.ts`) analyzes submitted reproduction payloads using natural language processing and AST pattern matching to automatically classify vulnerability categories:
  - **Reentrancy Vulnerabilities** (`withdraw`, `state drain`, `reentrant`)
  - **Precision Loss / Math Underflows** (`liquidity pool`, `rounding error`, `token drain`)
  - **Arithmetic Vulnerabilities** (`overflow`, `underflow`)
  - **Access Control Flaws** (`permission bypass`, `unauthorized owner`)
- **Dynamic Coverage Metrics**: Computes real-time execution coverage percentages (`coveragePercentage`) based on assertion complexity and payload length.

### 2. Sybil & Coordination Fraud Detection Engine
- **Multi-Signal Risk Scoring**: Evaluates real-time network activity (`SybilRiskSignal`) to flag coordinated exploit submissions, duplicate report spam, and Sybil identity clusters:
  - **Identical Proof Payload Hash Matches**: Flags duplicate submissions across distinct DIDs.
  - **Submission Velocity & IP/DID Clustering**: Identifies automated bot submission bursts.
  - **Confidence Scoring**: Assigns deterministic risk levels (`LOW`, `MEDIUM`, `HIGH`) with confidence percentages to protect protocol escrows.

### 3. Multi-Factor Reputation Scoring Algorithm
- **Weighted ML Score Computation**: Computes researcher trust scores ($0 - 100$) dynamically using a multi-factor weighting model:
  $$ \text{Trust Score} = w_1 \cdot \text{Acceptance Rate} + w_2 \cdot \text{Impact Weights} + w_3 \cdot \text{Dispute Win Ratio} - w_4 \cdot \text{Recency Decay} $$
  - **Factors Evaluated**: Critical vulnerability bounty count, verified acceptance rate ($95\%$), dispute win history, and time-decay recency metrics.

---

## 🎨 Key Application Views & Architecture

The application provides 6 primary interactive views managed via React 18, Tailwind CSS, and global state (`TrustContext`):

| View Tab | Path / Component | Core Capabilities |
| :--- | :--- | :--- |
| **Dashboard** | `DashboardView.tsx` | Trust score metrics, total bounty rewards earned, escrow locks, core protocol flow callouts, and recent proof-anchored submissions table. |
| **Bounty Marketplace** | `BountiesView.tsx` | Active bounty grid, severity filters (Critical, High, Medium, Low), search, `BountyDetailModal`, and `SubmitVulnerabilityModal` generating SHA-256 proof anchors. |
| **Trust Passport** | `PassportView.tsx` | Decentralized Identity profile (`Alex Rivera`), `PortableReputationDiagram`, factor score breakdown, on-chain event log, and `CredentialQRModal` for exporting W3C Verifiable Credentials. |
| **Contribution Explorer** | `ExplorerView.tsx` | End-to-end lineage trail inspector (Identity → Contribution → SHA-256 Proof → Verification → Ledger Anchor → Escrow Reward) with `OracleVerificationBadge`. |
| **Trust Graph** | `GraphView.tsx` | Interactive SVG node-link reputation network visualizer linking identities, bounties, escrows, reports, and cryptographic proofs with node property inspector. |
| **Network & Ledger** | `NetworkView.tsx` | Simulated/live on-chain ledger event explorer (`LedgerExplorer`), Kleros-style juror arbitration court (`ArbitrationCourtView`), and Sybil risk analysis panel. |

---

## 📜 Smart Contracts & Web3 Protocol Layer

The protocol includes 4 production-grade Solidity smart contracts (`contracts/`):

```
contracts/
├── TrustBountyEscrow.sol     # Conditional timelocked bounty deposit & programmatic release contract
├── ReputationRegistry.sol    # On-chain portable DID reputation score registry with owner access control
├── DisputeArbitration.sol    # Staked juror arbitration court with single-vote enforcement & quorum resolution
└── ChainlinkOracleBridge.sol # Automated PoC test verification callback bridge contract
```

### Web3 & EIP-712 Wallet Integration
- **Provider Auto-Detection**: `src/blockchain/useEscrowContract.ts` auto-detects injected EIP-1193 providers (`window.ethereum`) with RPC fallback for seamless demo execution.
- **EIP-712 Typed Data Signing**: Prompts researchers to sign structured `ProofAnchor` payloads (`eth_signTypedData_v4`) ensuring non-repudiable cryptographic proof of discovery.

---

## 📦 Decentralized Storage & GraphQL Indexing

- **IPFS CIDv1 Multihashing**: `src/services/ipfsService.ts` calculates real base32 CIDv1 multihashes (`bafybeig...`), encrypts payloads using client-side AES-256-GCM, supports Pinata API pinning JWTs, and provides multi-gateway fallback resolution across `ipfs.io`, `cloudflare-ipfs.com`, and `dweb.link`.
- **The Graph Indexer**: `subgraph/schema.graphql` defines event indexing entities (`BountyCreated`, `ProofAnchored`, `EscrowReleased`), queried dynamically via `useIndexedLedger.ts`.

---

## 🧪 Testing & Quality Assurance

The repository includes a 100% passing Vitest test suite with **33 tests across 10 test suites**:

```bash
npm test
```

### Test Coverage Highlights:
- `cryptoUtils.test.ts`: Web Crypto SHA-256 hashing, random tx hashes, 65-byte ECDSA signatures, EIP-712 proof hashing.
- `didResolver.test.ts`: W3C DID string parsing, validation, and JWK document resolution.
- `vcManager.test.ts`: W3C Verifiable Credential issuance, JWS signatures, and verification logic.
- `ipfsService.test.ts`: Base32 CIDv1 calculation, AES-256-GCM payload encryption, gateway fallbacks.
- `useEscrowContract.test.ts`: Wallet connection, EIP-712 signing, on-chain escrow release.
- `useIndexedLedger.test.ts`: GraphQL subgraph querying with fallback.
- `sandboxRunner.test.ts`: Automated PoC triage, category detection, coverage calculation.
- `deployScript.test.ts`: Hardhat / Ethers contract deployment simulation.
- `UIViewsIntegration.test.tsx`: App navigation and UI view rendering integration tests.

---

## 🚀 Quickstart & Installation

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-org/trust-engine.git
cd trust-engine
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Run Test Suite
```bash
npm test
```

### 4. Build for Production
```bash
npm run build
```
Generates production bundle in `dist/` verified with `tsc && vite build`.

---

## 🛠️ Project Structure

```
.
├── contracts/                  # Solidity Smart Contracts
│   ├── TrustBountyEscrow.sol
│   ├── ReputationRegistry.sol
│   ├── DisputeArbitration.sol
│   └── ChainlinkOracleBridge.sol
├── oracle/                     # PoC Sandbox Verification Runner & Oracle Bridge
│   ├── sandboxRunner.ts
│   └── ChainlinkOracleBridge.sol
├── scripts/                    # Deployment Scripts
│   └── deploy.ts
├── subgraph/                   # The Graph Indexer Schema
│   └── schema.graphql
├── src/
│   ├── blockchain/             # Web3 Wallet Config & Escrow Contract Hooks
│   │   ├── useEscrowContract.ts
│   │   └── wagmiConfig.ts
│   ├── components/             # React View & UI Components
│   │   ├── bounties/
│   │   ├── layout/
│   │   ├── network/
│   │   ├── passport/
│   │   ├── ui/
│   │   └── views/
│   ├── domain/                 # Core Domain Types, Mock Data, & Cryptography
│   │   ├── cryptoUtils.ts
│   │   ├── mockData.ts
│   │   └── types.ts
│   ├── identity/               # W3C DID Resolver & Verifiable Credentials Manager
│   │   ├── didResolver.ts
│   │   └── vcManager.ts
│   ├── services/               # IPFS Decentralized Storage & Encryption Service
│   │   └── ipfsService.ts
│   ├── store/                  # Central React Context & Arbitration State Stores
│   │   ├── TrustContext.tsx
│   │   ├── useArbitrationStore.ts
│   │   └── useIndexedLedger.ts
│   ├── App.tsx
│   └── main.tsx
├── README.md                   # Project Documentation
└── package.json
```

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for details.
