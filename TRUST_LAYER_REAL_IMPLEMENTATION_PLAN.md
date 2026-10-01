# Implementation Plan: Real Trust Layer Protocols (Remix Deployment & Wallet Signing) & Dynamic Trust Graphs

## 📌 Executive Overview

The **Trust Engine** currently provides a production-grade frontend UI with deterministic mock fallbacks for immediate academic and demonstration use.

Given that smart contracts (`TrustBountyEscrow.sol`, `ReputationRegistry.sol`, `DisputeArbitration.sol`) are compiled and deployed via **Remix IDE** (to Sepolia testnet, Arbitrum, or a local EVM network), this document defines the **Production Implementation Plan** for connecting the Remix-deployed contracts, real EIP-712 wallet signing (`eth_signTypedData_v4`), persistent IPFS storage, live Subgraph event indexing, and **dynamic, event-driven Trust Graph visualizers**.

---

## 🎯 Architecture Transformation Goals

```
  REMIX DEPLOYMENT & FRONTEND WALLET SIGNING FLOW
┌───────────────────────────────────┐               ┌─────────────────────────────────────┐
│ 1. Remix IDE                      │               │ 2. Frontend .env Configuration      │
│ Compile contracts/ (*.sol)        │ ────────────► │ VITE_TRUST_BOUNTY_ESCROW_ADDRESS    │
│ Deploy via Injected Provider      │               │ VITE_REPUTATION_REGISTRY_ADDRESS    │
└───────────────────────────────────┘               └──────────────────┬──────────────────┘
                                                                       │
                                                                       ▼
┌───────────────────────────────────┐               ┌─────────────────────────────────────┐
│ 4. Dynamic Trust Graph            │               │ 3. EIP-712 Wallet Signature & Web3  │
│ Live SVG Node/Edge Rendering      │ ◄──────────── │ eth_signTypedData_v4 (ProofAnchor)  │
│ Real Transaction Hash Inspection  │               │ Contract Execution via window.eth   │
└───────────────────────────────────┘               └─────────────────────────────────────┘
```

---

## 🚀 Phase-by-Phase Implementation Plan

### Phase 1: Remix Contract Binding & EIP-712 Wallet Signature Anchoring
* **Goal**: Bind the frontend to contract addresses deployed via Remix IDE and trigger EIP-712 wallet signing prompts (`eth_signTypedData_v4`) upon vulnerability proof creation.
* **Target Files**:
  - `contracts/TrustBountyEscrow.sol` (Deployed via Remix IDE)
  - `contracts/ReputationRegistry.sol` (Deployed via Remix IDE)
  - `src/blockchain/useEscrowContract.ts`
  - `.env` & `src/store/TrustContext.tsx`
* **Implementation Steps**:
  1. **Remix IDE Deployment & Address Binding**:
     - Compile Solidity 0.8.20 contracts in Remix IDE.
     - Deploy using "Injected Provider - MetaMask" to Sepolia / Arbitrum.
     - Copy deployed contract checksum addresses into `.env`:
       ```env
       VITE_TRUST_BOUNTY_ESCROW_ADDRESS=0xYourRemixEscrowContractAddress
       VITE_REPUTATION_REGISTRY_ADDRESS=0xYourRemixReputationContractAddress
       VITE_DISPUTE_ARBITRATION_ADDRESS=0xYourRemixDisputeContractAddress
       ```
  2. **EIP-712 Typed Data Wallet Signing Prompt**:
     Implement structured EIP-712 signature generation in `useEscrowContract.ts` / `cryptoUtils.ts`:
     ```typescript
     const domain = {
       name: 'TrustEngineProtocol',
       version: '1.0.0',
       chainId: Number(import.meta.env.VITE_CHAIN_ID || 11155111),
       verifyingContract: import.meta.env.VITE_TRUST_BOUNTY_ESCROW_ADDRESS
     };
     const types = {
       ProofAnchor: [
         { name: 'reportId', type: 'string' },
         { name: 'contentHash', type: 'bytes32' },
         { name: 'researcherId', type: 'string' },
         { name: 'timestamp', type: 'uint256' }
       ]
     };
     const signature = await window.ethereum.request({
       method: 'eth_signTypedData_v4',
       params: [userAccount, JSON.stringify({ domain, types, primaryType: 'ProofAnchor', message })]
     });
     ```
  3. **Direct Contract Transaction Dispatch**:
     When the user releases escrow or submits a claim, call the Remix-deployed `TrustBountyEscrow.sol` methods (`releaseBounty`, `createBounty`, `lockForDispute`) via `window.ethereum` or Ethers.js provider.
* **Verification**: Connect wallet in browser, submit report, confirm Remix contract address target and EIP-712 wallet popup in MetaMask, verify transaction hash on Sepolia Etherscan.

---

### Phase 2: Dynamic Live Trust Graph Engine (`GraphView.tsx`)
* **Goal**: Upgrade `GraphView.tsx` from a static 5-node hardcoded array into a **real-time, reactive SVG visualizer** that dynamically generates graph nodes and edges from live Remix contract event hashes and wallet submissions.
* **Target Files**:
  - `src/components/views/GraphView.tsx`
  - `src/store/TrustContext.tsx`
  - `src/store/useIndexedLedger.ts`
* **Implementation Steps**:
  1. **Dynamic Node Generator**:
     Read `identities`, `bounties`, `reports`, `proofs`, `escrows`, and `blockchainEvents` directly from state. Construct nodes dynamically:
     ```typescript
     const dynamicNodes: Node[] = [
       ...identities.map((id, idx) => ({ id: id.id, label: id.handle, type: 'identity', x: 120, y: 100 + idx * 90, details: `DID: ${id.id}` })),
       ...bounties.map((b, idx) => ({ id: b.id, label: b.title, type: 'bounty', x: 300, y: 100 + idx * 90, details: `Reward: $${b.rewardAmount} USDC` })),
       ...reports.map((r, idx) => ({ id: r.id, label: r.title, type: 'contribution', x: 480, y: 100 + idx * 90, details: `Severity: ${r.severity}` })),
       ...proofs.map((p, idx) => ({ id: p.id, label: `Proof ${p.contentHash.slice(0, 8)}...`, type: 'proof', x: 660, y: 100 + idx * 90, details: `Content Hash: ${p.contentHash}` }))
     ];
     ```
  2. **Automated Layout & Edge Generation**: Dynamically link nodes (Researcher DID $\rightarrow$ Submission $\rightarrow$ Proof Hash $\rightarrow$ Remix Escrow Contract Address $\rightarrow$ Release Transaction Hash).
  3. **Live Transaction Pulse**: Render glowing SVG dashed stroke pulse animations when real wallet transaction events are confirmed against Remix contracts.
* **Verification**: Execute a bounty payout with connected wallet; inspect `GraphView.tsx` to see new `Proof` and `Escrow` nodes spawn automatically with real transaction hashes.

---

### Phase 3: Persistent Decentralized Storage & Pinata JWT Integration
* **Goal**: Store encrypted vulnerability evidence on IPFS pinned persistently via Pinata JWT.
* **Target Files**:
  - `src/services/ipfsService.ts`
  - `src/components/bounties/SubmitVulnerabilityModal.tsx`
* **Implementation Steps**:
  1. Wire `VITE_PINATA_JWT` in `ipfsService.ts` to pin encrypted vulnerability payload JSON directly to IPFS base32 CIDv1 multihashing.
  2. Encrypt sensitive reproduction steps with Web Crypto AES-256-GCM before dispatching to IPFS gateway.
* **Verification**: Upload payload, receive base32 CID `bafybeig...`, fetch raw encrypted payload directly from `https://gateway.pinata.cloud/ipfs/{cid}`.

---

### Phase 4: Live Event Indexing with The Graph Studio
* **Goal**: Stream Remix contract events directly into application state using GraphQL queries.
* **Target Files**:
  - `subgraph/schema.graphql`
  - `subgraph/src/mapping.ts`
  - `src/store/useIndexedLedger.ts`
* **Implementation Steps**:
  1. Deploy subgraph pointing to the Remix-deployed contract addresses on Sepolia.
  2. Query GraphQL entities (`proofAnchoreds`, `escrowReleaseds`) in `useIndexedLedger.ts` and sync with `TrustContext`.
* **Verification**: Trigger contract transaction on Sepolia; verify event appears in `useIndexedLedger` within 2 block confirmations.

---

### Phase 5: W3C Decentralized Identity (DIDs) & Verifiable Credentials
* **Goal**: Issue portable JSON-LD Verifiable Credentials signed with secp256k1 JWS signatures importable into mobile wallets.
* **Target Files**:
  - `src/identity/didResolver.ts`
  - `src/identity/vcManager.ts`
  - `src/components/passport/CredentialQRModal.tsx`
* **Implementation Steps**:
  1. Construct secp256k1 JWS proofs over W3C Verifiable Credentials using `vcManager.ts`.
  2. Generate standardized W3C VC deep links (`openid-vc://`) inside `CredentialQRModal.tsx` for QR code scanning.
* **Verification**: Open Trust Passport view, click "Export W3C Credential", scan QR code with DID wallet, verify credential signature.

---

### Phase 6: Cloud Oracle Sandbox Microservice & Chainlink Functions
* **Goal**: Move automated static vulnerability analysis from browser client to an isolated, sandboxed execution environment.
* **Target Files**:
  - `oracle/sandboxRunner.ts`
  - `contracts/ChainlinkOracleBridge.sol` (Deployed via Remix IDE)
  - `src/components/ui/OracleVerificationBadge.tsx`
* **Implementation Steps**:
  1. Host `oracle/sandboxRunner.ts` inside a gVisor sandboxed container on Fly.io or AWS ECS.
  2. Connect `ChainlinkOracleBridge.sol` callback handlers to trigger automated escrow payout when test execution passes.
* **Verification**: Submit proof script, verify Chainlink oracle request emitted, sandbox container runs AST tests, and smart contract escrow releases funds automatically.

---

## 📊 Summary of Remix Deployment & Real Protocol Architecture

| Subsystem Component | Remix Deployment & Live Web3 Provider Integration |
| :--- | :--- |
| **Smart Contract Deployment** | Contracts compiled in Remix IDE and deployed to Sepolia/Arbitrum via Injected Provider |
| **Contract Address Binding** | Addresses configured in `.env` (`VITE_TRUST_BOUNTY_ESCROW_ADDRESS`, etc.) |
| **Wallet Signature Engine** | Real EIP-712 typed data signing (`eth_signTypedData_v4`) via MetaMask / window.ethereum |
| **Trust Graph Visualizer** | Dynamic SVG node graph auto-generated from live Remix contract transactions & events |
| **IPFS Proof Storage** | Client AES-256-GCM encryption + Pinata JWT IPFS base32 CIDv1 multihash pinning |
| **Event Stream Indexer** | GraphQL queries via The Graph Studio endpoint streaming Remix contract logs |
| **Oracle Verification** | Sandboxed gVisor container + Chainlink Functions callback bridge |

---

## 🎯 Verification Matrix & Execution Commands

```bash
# 1. Run Vitest QA Suite (33 passing tests)
npm test

# 2. Verify Production Build (tsc && vite build)
npm run build

# 3. Test Contract Deployment Script / Remix ABI Binding
npx hardhat run scripts/deploy.ts --network sepolia
```
