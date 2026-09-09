# 🛡️ Trust Engine — Trustless Open-Source Bug Bounty Platform

> **A Decentralized Protocol for Immutable Vulnerability Provenance, Programmatic Smart Contract Escrows, Portable W3C Researcher Reputation, and AI-Powered Fraud Detection.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646cff.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-33_Tests_Passing-green.svg)](https://vitest.dev/)
[![W3C VC](https://img.shields.io/badge/W3C-Verifiable_Credentials-purple.svg)](https://www.w3.org/TR/vc-data-model/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-black.svg)](https://soliditylang.org/)
[![IPFS](https://img.shields.io/badge/IPFS-CIDv1_Base32-cyan.svg)](https://ipfs.tech/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📋 Table of Contents
1. [Problem Statement & Value Proposition](#-problem-statement--value-proposition)
2. [Complete Technical Stack](#-complete-technical-stack)
3. [System Architecture & Data Flow](#-system-architecture--data-flow)
4. [Core Protocol Integrity Model](#-core-protocol-integrity-model)
5. [Feature Deep-Dive & Technical Capabilities](#-feature-deep-dive--technical-capabilities)
6. [AI / ML Engineering & Intelligence Pipeline](#-ai--ml-engineering--intelligence-pipeline)
7. [Smart Contracts Architecture & Specifications](#-smart-contracts-architecture--specifications)
8. [W3C Decentralized Identity (DIDs) & Verifiable Credentials](#-w3c-decentralized-identity-dids--verifiable-credentials)
9. [Decentralized Storage & Indexing Engine](#-decentralized-storage--indexing-engine)
10. [Local Development Setup](#-local-development-setup)
11. [Production Deployment Guide](#-production-deployment-guide)
12. [Environment Variables Reference (`.env.example`)](#-environment-variables-reference-envexample)
13. [Testing & Quality Assurance Suite](#-testing--quality-assurance-suite)
14. [Repository Directory Structure](#-repository-directory-structure)

---

## 🎯 Problem Statement & Value Proposition

### The Problem
Traditional vulnerability management platforms (HackerOne, Bugcrowd) rely on centralized intermediaries that control funds, evaluation, and researcher data:
* **Intermediary Dispute Delays**: Payouts can be stalled for months due to unilateral triaging decisions.
* **Payment Withholding & Front-Running**: Organizations can reject reports, modify code silently, and withhold agreed-upon bounty rewards without proof-of-prior-discovery.
* **Siloed Reputation**: Security researchers lose all hard-earned reputation if they switch platforms or if a centralized provider suspends their profile.
* **Centralized Proof Storage**: Submitted exploit payloads are stored in centralized databases prone to data leaks and backdating.

### The Solution: Trust Engine
**Trust Engine** provides an open-source, trustless protocol for security bounties:
* **Immutable Provenance**: Immediate SHA-256 evidence hashing and EIP-712 wallet signatures (`eth_signTypedData_v4`) establish indisputable proof of discovery.
* **Programmatic Escrows**: Smart contract escrows (`TrustBountyEscrow.sol`) hold locked funds on-chain, automatically releasing rewards upon technical verification.
* **Portable W3C Identity**: Researchers own their credentials via W3C DIDs (`did:trust`, `did:ethr`) and JSON-LD Verifiable Credentials signed cryptographically with JWS signatures.
* **Decentralized Arbitration**: Contested vulnerabilities are resolved by a Kleros-style court of staked jurors (`DisputeArbitration.sol`).

---

## 🛠️ Complete Technical Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend UI** | React 18.3, TypeScript 5.7, Vite 6.1, Tailwind CSS 3.4, Lucide React Icons |
| **State Management** | React Context (`TrustContext.tsx`), Custom React Hooks (`useEscrowContract`, `useIndexedLedger`, `useArbitrationStore`) |
| **Cryptography** | Web Crypto API (SHA-256, AES-256-GCM), EIP-712 Typed Data Hashing |
| **Decentralized Identity** | W3C Decentralized Identifiers (DIDs), W3C JSON-LD Verifiable Credentials, JWS Signatures, QR Code Generator |
| **Smart Contracts** | Solidity 0.8.20, Hardhat, Ethers.js, Sepolia Testnet Configuration |
| **Web3 Wallet Provider** | Window EIP-1193 Injected Providers (MetaMask, Coinbase Wallet), Wagmi / Viem Config, RPC Fallbacks |
| **Decentralized Storage** | IPFS Base32 CIDv1 Multihashes, Pinata JWT API, Client AES-256-GCM Encryption, Multi-Gateway Failover |
| **Blockchain Indexing** | The Graph Studio GraphQL Schema (`schema.graphql`), Client Fetching Hook |
| **AI / ML & Analysis** | AST Static Code Pattern Recognition, Sybil Clustering Algorithms, Multi-Factor Reputation Scorer |
| **Testing & Tooling** | Vitest 3.0, React Testing Library, JSDOM, Playwright Frontend Verification |

---

## 🏗️ System Architecture & Data Flow

```
                                  ┌──────────────────────────────────────────┐
                                  │      Security Researcher / Client       │
                                  └────────────────────┬─────────────────────┘
                                                       │
                                      Submits Vulnerability Report
                                                       │
                                                       ▼
 ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
 │                                              CLIENT FRONTEND                                             │
 │  - SHA-256 Payload Hash Generation (cryptoUtils.ts)                                                       │
 │  - Client-Side AES-256-GCM Encryption & Base32 CIDv1 IPFS Pinning (ipfsService.ts)                       │
 │  - EIP-712 Typed Data Wallet Signature Prompt (useEscrowContract.ts)                                    │
 └──────────────────────┬──────────────────────────────┬──────────────────────────────────┬─────────────────┘
                        │                              │                                  │
         Anchors Proof  │               Query Events   │                 Issues Credential│
                        ▼                              ▼                                  ▼
┌───────────────────────────────┐  ┌───────────────────────────────┐  ┌─────────────────────────────────────┐
│    EVM SMART CONTRACTS        │  │     GRAPHQL SUBGRAPH INDEXER  │  │   W3C DID & VC RESOLVER ENGINE      │
│ - TrustBountyEscrow.sol       │  │ - The Graph Studio Endpoint   │  │ - didResolver.ts (JWK Documents)    │
│ - ReputationRegistry.sol      │  │ - schema.graphql              │  │ - vcManager.ts (JWS Proofs & QR)    │
│ - DisputeArbitration.sol      │  │ - useIndexedLedger.ts         │  └─────────────────────────────────────┘
│ - ChainlinkOracleBridge.sol   │  └───────────────────────────────┘
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────────────────────┐
│     AI / ML ORACLE SANDBOX ENGINE             │
│ - Pattern Recognition (Reentrancy, Math)      │
│ - Static AST Reproduction Evaluation          │
│ - Sybil Fraud Risk Clustering                 │
└───────────────────────────────────────────────┘
```

---

## ⚖️ Core Protocol Integrity Model

The protocol distinguishes between **Cryptographic Provenance** and **Technical Verification**:

1. **Cryptographic Proof & Provenance (Immediate)**:
   - When a researcher submits a vulnerability, a SHA-256 hash of the reproduction payload is generated instantly in the browser.
   - The researcher signs an EIP-712 typed data message (`ProofAnchor`) with their Ethereum wallet.
   - The encrypted payload is pinned to IPFS, returning a CIDv1 multihash (`bafybeig...`).
   - *Result*: Timestamped, indisputable proof of discovery anchored on-chain that prevents front-running.

2. **Technical Vulnerability Verification (Post-Submission)**:
   - Security reviewers and AI/ML static analyzers execute the reproduction steps in an isolated Foundry/Docker sandbox container (`oracle/sandboxRunner.ts`).
   - Once verified, the company triggers the smart contract escrow release (`releaseBounty()`).
   - The contract updates the on-chain `ReputationRegistry.sol` and issues a W3C Verifiable Credential.

---

## 🔍 Feature Deep-Dive & Technical Capabilities

### 1. Trust Dashboard View (`DashboardView.tsx`)
* **Live Protocol Metrics**: Displays researcher trust score, verified contribution counts ($18$ verified, $95\%$ acceptance rate), total bounty rewards earned ($\$84,500$ USDC/ETH), and locked escrow totals ($\$25,000$).
* **Protocol Core Distinction**: Highlights the architectural difference between Cryptographic Proof and Technical Verification.
* **Proof-Anchored Submissions Table**: Real-time list of submitted vulnerabilities displaying severity badges, SHA-256 proof snippet, oracle verification status, and escrow state.

### 2. Bug Bounty Marketplace (`BountiesView.tsx` & Modals)
* **Bounty Grid & Search**: Interactive filtering by severity (`Critical`, `High`, `Medium`, `Low`) and real-time text search.
* **Bounty Detail Modal (`BountyDetailModal.tsx`)**: Inspects scope, reward tiers, escrow contract address, and previous submissions.
* **Vulnerability Submission Modal (`SubmitVulnerabilityModal.tsx`)**: Accepts title, impact description, and reproduction steps. Generates SHA-256 proof hash, encrypts payload via AES-256-GCM, pins to IPFS, and executes EIP-712 wallet signature.

### 3. Trust Passport & Reputation View (`PassportView.tsx`)
* **Researcher DID Profile**: Displays researcher DID (`did:trust:0x71c8...`), verified badge, trust score ($94/100$), and total rewards earned.
* **Portable Reputation Diagram (`PortableReputationDiagram.tsx`)**: Visualizes multi-platform reputation portability across GitHub, EVM chains, and security platforms.
* **Score Factor Breakdown (`ScoreBreakdown.tsx`)**: Visual progress bars showing weight factors (Critical bounties, acceptance rate, dispute win ratio, recency decay).
* **W3C Credential Export (`CredentialQRModal.tsx`)**: Renders JSON-LD Verifiable Credential structure with JWS signature and downloadable QR code for mobile DID wallets.

### 4. Contribution Explorer (`ExplorerView.tsx`)
* **Audit Trail Inspector**: End-to-end lineage visualization:
  $$\text{Identity (DID)} \longrightarrow \text{Contribution} \longrightarrow \text{SHA-256 Proof} \longrightarrow \text{Technical Verification} \longrightarrow \text{Ledger Anchor} \longrightarrow \text{Escrow Payout}$$
* **Oracle Execution Badge (`OracleVerificationBadge.tsx`)**: Displays execution logs from the isolated Foundry/Docker sandbox runner, coverage percentage ($94.2\%$), and pass/fail status.
* **Proof Card (`ProofCard.tsx`)**: Displays cryptographic proof comparison (Client SHA-256 hash vs On-chain anchored hash).

### 5. Interactive SVG Trust Graph (`GraphView.tsx`)
* **Dynamic Node-Link Graph**: SVG-based visual graph rendering nodes for Identities (Green), Bounties (Indigo), Escrows (Amber), Reports (Sky), and SHA-256 Proofs (Purple).
* **Interactive Node Inspector**: Clicking any graph node displays its properties, cryptographic hashes, and linked contract addresses in a detail panel.

### 6. Network & Ledger Monitor (`NetworkView.tsx`)
* **Ledger Explorer (`LedgerExplorer`)**: Filterable stream of simulated/live on-chain smart contract events (`BountyCreated`, `ProofAnchored`, `EscrowReleased`).
* **Arbitration Court (`ArbitrationCourtView.tsx`)**: Decentralized juror voting panel where staked jurors review disputed evidence, cast votes, and resolve payout escrow locks upon 3-vote quorum.
* **Sybil Risk Analysis (`RiskAnalysis`)**: AI/ML fraud signal panel displaying confidence scores and risk levels for duplicate exploit payloads and bot submission clusters.

---

## 🤖 AI / ML Engineering & Intelligence Pipeline

The platform incorporates three distinct AI/ML and AI engineering pipelines:

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                            AI / ML INTELLIGENCE PIPELINE                                 │
├───────────────────────────────┬───────────────────────────────┬──────────────────────────┤
│ 1. POC TRIAGE & STATIC ANALYSIS│ 2. SYBIL FRAUD DETECTION      │ 3. REPUTATION SCORER     │
│ - Natural Language Classification│ - Similarity Match Matrix   │ - Multi-Factor Weighted  │
│ - AST Pattern Recognition     │ - DID Velocity Clustering     │   Scoring Algorithm      │
│ - Dynamic Coverage Evaluation │ - Anomaly Confidence Scoring  │ - Time-Decay Recency     │
└───────────────────────────────┴───────────────────────────────┴──────────────────────────┘
```

1. **Automated PoC Triage Engine (`oracle/sandboxRunner.ts`)**:
   - Parses reproduction steps using pattern recognition to detect reentrancy, precision loss, arithmetic overflow, and permission bypass vectors.
   - Calculates dynamic code coverage percentages based on test script length and assertion complexity.

2. **Sybil & Fraud Detection Engine (`NetworkComponents.tsx`)**:
   - Analyzes cross-account payload similarity and DID submission velocity.
   - Identifies duplicate exploit payloads submitted across multiple identities, outputting confidence scores ($89\% - 94\%$) and risk levels (`HIGH`, `MEDIUM`, `LOW`).

3. **Multi-Factor Reputation ML Scorer (`ScoreBreakdown.tsx`)**:
   - Computes weighted trust scores using multi-variable algorithms:
     $$\text{Trust Score} = 0.35(\text{Critical Bounties}) + 0.30(\text{Acceptance Rate}) + 0.20(\text{Dispute Ratio}) - 0.15(\text{Decay})$$

---

## 📜 Smart Contracts Architecture & Specifications

The protocol consists of 4 Solidity 0.8.20 contracts (`contracts/`):

### 1. `TrustBountyEscrow.sol`
* **Purpose**: Manages conditional bounty deposits, timelocks, and payouts.
* **Functions**:
  - `createBounty(string bountyId)`: Deposits ETH/ERC-20 funds into escrow.
  - `releaseBounty(string bountyId, address researcher)`: Releases locked funds to researcher upon verified report.
  - `lockForDispute(string bountyId)`: Locks escrow funds when a report is disputed.

### 2. `ReputationRegistry.sol`
* **Purpose**: On-chain registry mapping researcher DIDs to trust scores.
* **Security**: Enforces `onlyOwner` access control modifier so only authorized protocol contracts update scores.
* **Functions**:
  - `updateReputation(string did, uint256 increment)`: Increments on-chain score up to 100.
  - `getReputation(string did)`: Returns current score and verified submission count.

### 3. `DisputeArbitration.sol`
* **Purpose**: Decentralized Kleros-style juror court for contested reports.
* **Security**: Enforces strict single-vote checks per juror address (`hasVoted[disputeId][msg.sender]`).
* **Functions**:
  - `castVote(uint256 disputeId, Ruling vote)`: Records juror vote and triggers auto-resolution upon 3-vote quorum (`ResearcherWins` vs `CompanyWins`).

### 4. `ChainlinkOracleBridge.sol`
* **Purpose**: Callback bridge receiving automated test execution results from Chainlink oracle nodes.

---

## 🆔 W3C Decentralized Identity (DIDs) & Verifiable Credentials

### W3C DID Document Resolver (`src/identity/didResolver.ts`)
Parses `did:trust`, `did:ethr`, `did:key`, and `did:pkh` methods into W3C compliant `W3cDidDocument` structures containing secp256k1 Elliptic Curve JSON Web Keys (`JsonWebKey2020`), `authentication`, and `assertionMethod` references.

### W3C Verifiable Credentials Engine (`src/identity/vcManager.ts`)
Issues JSON-LD Verifiable Credentials conforming to W3C specifications:
* **Context**: `https://www.w3.org/2018/credentials/v1`
* **Types**: `VerifiableCredential`, `TrustScoreCredential`
* **Proof**: Signed JWS signature computed over the credential subject payload.
* **Verification**: `verifyCredential(vc)` validates context, issuer DID format, subject ID, and cryptographic JWS signature structure.

---

## 📦 Decentralized Storage & Indexing Engine

### IPFS Pinning & Encryption (`src/services/ipfsService.ts`)
* **CIDv1 Base32 Multihashing**: Generates RFC-compliant IPFS base32 CID strings (`bafybeig...`).
* **AES-256-GCM Payload Encryption**: Encrypts sensitive PoC reproduction scripts in browser Web Crypto before pinning.
* **Pinata API Integration**: Supports JWT bearer authentication headers for production IPFS pinning.
* **Multi-Gateway Failover**: Automatically resolves CIDs across `ipfs.io`, `cloudflare-ipfs.com`, and `dweb.link`.

### The Graph Indexer (`subgraph/schema.graphql` & `useIndexedLedger.ts`)
Defines GraphQL entities (`BountyCreated`, `ProofAnchored`, `EscrowReleased`) and provides `querySubgraphEvents()` to query The Graph Studio endpoints with local fallback.

---

## 💻 Local Development Setup

### 1. Prerequisites
* **Node.js**: `v18.0.0` or higher
* **npm**: `v9.0.0` or higher

### 2. Clone Repository & Install Dependencies
```bash
git clone https://github.com/your-org/trust-engine.git
cd trust-engine
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Execute Vitest Test Suite
```bash
npm test
```

### 6. Build Production Artifacts
```bash
npm run build
```

---

## 🚀 Production Deployment Guide

To deploy **Trust Engine** to a live Ethereum testnet/mainnet environment, execute the following 4 steps:

### Step 1: Deploy Smart Contracts (Sepolia / Arbitrum)
1. Populate `DEPLOYER_PRIVATE_KEY` and `ETHERSCAN_API_KEY` in `.env`.
2. Run deployment script:
   ```bash
   npx hardhat run scripts/deploy.ts --network sepolia
   ```
3. Copy deployed contract addresses into `.env` (`VITE_TRUST_BOUNTY_ESCROW_ADDRESS`, etc.).

### Step 2: Deploy The Graph Subgraph
1. Authenticate with The Graph Studio CLI:
   ```bash
   graph auth --studio <YOUR_AUTH_TOKEN>
   ```
2. Deploy schema:
   ```bash
   cd subgraph
   graph codegen && graph build
   graph deploy --studio trust-engine
   ```
3. Copy the production query URL to `VITE_SUBGRAPH_ENDPOINT` in `.env`.

### Step 3: Configure Pinata IPFS Storage
1. Generate an API JWT Key in [Pinata](https://app.pinata.cloud).
2. Set `VITE_PINATA_JWT` in `.env`.

### Step 4: Host Oracle Sandbox Worker
1. Deploy `oracle/sandboxRunner.ts` inside an isolated container on **Fly.io**, **AWS ECS**, or **Render**.
2. Set `VITE_ORACLE_SERVICE_URL` in `.env`.

---

## 🔑 Environment Variables Reference (`.env.example`)

```env
# 1. WEB3 NETWORK & PROVIDER CONFIGURATION
VITE_CHAIN_ID=11155111
VITE_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here

# 2. DEPLOYED SMART CONTRACT ADDRESSES
VITE_TRUST_BOUNTY_ESCROW_ADDRESS=0x1111111111111111111111111111111111111111
VITE_REPUTATION_REGISTRY_ADDRESS=0x2222222222222222222222222222222222222222
VITE_DISPUTE_ARBITRATION_ADDRESS=0x3333333333333333333333333333333333333333
VITE_CHAINLINK_ORACLE_BRIDGE_ADDRESS=0x4444444444444444444444444444444444444444

# 3. DECENTRALIZED STORAGE & IPFS PINNING (PINATA)
VITE_PINATA_JWT=your_pinata_jwt_bearer_token_here
VITE_PINATA_GATEWAY_URL=https://gateway.pinata.cloud/ipfs/

# 4. SUBGRAPH INDEXER (THE GRAPH STUDIO)
VITE_SUBGRAPH_ENDPOINT=https://api.studio.thegraph.com/query/your_studio_id/trust-engine/v1.0.0

# 5. AUTOMATED POC ORACLE SANDBOX MICROSERVICE
VITE_ORACLE_SERVICE_URL=https://oracle-sandbox.trustengine.io
ORACLE_SHARED_SECRET=your_secure_oracle_hmac_secret_here

# 6. CONTRACT DEPLOYMENT & CI KEYS (SERVER / CI ONLY)
DEPLOYER_PRIVATE_KEY=0x0000000000000000000000000000000000000000000000000000000000000000
ETHERSCAN_API_KEY=your_etherscan_api_key_for_verification
```

---

## 🧪 Testing & Quality Assurance Suite

The test suite contains **33 Vitest tests across 10 test files**:

```
✓ src/__tests__/sandboxRunner.test.ts (3 tests)
✓ src/blockchain/__tests__/useEscrowContract.test.ts (4 tests)
✓ src/__tests__/UIViewsIntegration.test.tsx (6 tests)
✓ src/services/__tests__/ipfsService.test.ts (4 tests)
✓ src/store/__tests__/useIndexedLedger.test.ts (2 tests)
✓ src/store/__tests__/useArbitrationStore.test.ts (2 tests)
✓ src/domain/__tests__/cryptoUtils.test.ts (5 tests)
✓ src/identity/__tests__/vcManager.test.ts (3 tests)
✓ src/identity/__tests__/didResolver.test.ts (3 tests)
✓ src/__tests__/deployScript.test.ts (1 test)

Test Files  10 passed (10)
     Tests  33 passed (33)
```

Run test suite:
```bash
npm test
```

---

## 📁 Repository Directory Structure

```
.
├── contracts/                  # Solidity 0.8.20 Smart Contracts
│   ├── TrustBountyEscrow.sol
│   ├── ReputationRegistry.sol
│   ├── DisputeArbitration.sol
│   └── ChainlinkOracleBridge.sol
├── oracle/                     # PoC Sandbox Verification Microservice
│   └── sandboxRunner.ts
├── scripts/                    # Deployment Scripts
│   └── deploy.ts
├── subgraph/                   # The Graph Studio Indexer Schema
│   └── schema.graphql
├── src/
│   ├── blockchain/             # Web3 Provider Hooks & Wallet Configuration
│   │   ├── useEscrowContract.ts
│   │   └── wagmiConfig.ts
│   ├── components/             # React Views & UI Components
│   │   ├── blockchain/
│   │   ├── bounties/
│   │   ├── layout/
│   │   ├── network/
│   │   ├── passport/
│   │   ├── ui/
│   │   └── views/
│   ├── domain/                 # Core Domain Types, Cryptography, & Mock Data
│   │   ├── cryptoUtils.ts
│   │   ├── mockData.ts
│   │   └── types.ts
│   ├── identity/               # W3C DID Resolver & VC Engine
│   │   ├── didResolver.ts
│   │   └── vcManager.ts
│   ├── services/               # IPFS Storage & Encryption Service
│   │   └── ipfsService.ts
│   ├── store/                  # Central React Context & State Stores
│   │   ├── TrustContext.tsx
│   │   ├── useArbitrationStore.ts
│   │   └── useIndexedLedger.ts
│   ├── App.tsx
│   └── main.tsx
├── .env.example                # Production Environment Variables Template
├── README.md                   # Complete Platform Documentation
└── package.json
```

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.
