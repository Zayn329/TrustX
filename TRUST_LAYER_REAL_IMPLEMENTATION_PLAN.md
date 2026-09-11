# Implementation Plan: Real Trust Layer Protocols & Dynamic Trust Graphs

## 📌 Executive Overview

The **Trust Engine** currently provides a production-grade frontend UI with deterministic mock fallbacks for immediate academic and demonstration use. This document defines the **Production Implementation Plan** for replacing deterministic/mock mechanisms with live on-chain protocols, real cryptographic signing, persistent IPFS storage, live Subgraph indexing, and **dynamic, event-driven Trust Graph visualizers**.

---

## 🎯 Architecture Transformation Goals

```
  DETERMINISTIC / UI MOCK STATE                  REAL PRODUCTION PROTOCOL
┌─────────────────────────────────┐           ┌─────────────────────────────────┐
│ React useState / mockData.ts    │           │ EVM Sepolia / Arbitrum Contracts│
│ Simulated Tx Hashes             │ ────────► │ EIP-712 Wallet Signatures       │
│ Hardcoded Graph Node List       │           │ Live Graph Studio Indexer Stream│
│ Client AST Mock Sandbox         │           │ Dynamic Event-Driven SVG Graphs │
└─────────────────────────────────┘           └─────────────────────────────────┘
```

---

## 🚀 Phase-by-Phase Implementation Plan

### Phase 1: Real On-Chain Smart Contracts & EIP-712 Signature Anchoring
* **Goal**: Enable real wallet execution (`eth_signTypedData_v4`) and smart contract state transitions on EVM networks (Sepolia, Arbitrum).
* **Target Files**:
  - `contracts/TrustBountyEscrow.sol`
  - `contracts/ReputationRegistry.sol`
  - `src/blockchain/useEscrowContract.ts`
  - `src/blockchain/wagmiConfig.ts`
* **Implementation Steps**:
  1. **EIP-712 Typed Struct Definition**:
     ```typescript
     const domain = { name: 'TrustEngine', version: '1', chainId, verifyingContract: ESCROW_ADDRESS };
     const types = {
       ProofAnchor: [
         { name: 'reportId', type: 'string' },
         { name: 'contentHash', type: 'bytes32' },
         { name: 'timestamp', type: 'uint256' }
       ]
     };
     ```
  2. **Smart Contract Deployment & ABI Binding**: Update `scripts/deploy.ts` to deploy `TrustBountyEscrow.sol` and `ReputationRegistry.sol` with ERC-20 (USDC) support.
  3. **Wagmi / Viem Provider Connection**: Wire `useEscrowContract.ts` to execute `contract.write.createBounty()`, `contract.write.releaseBounty()`, and `contract.write.anchorProof()`.
* **Verification**: Connect WalletConnect/MetaMask on Sepolia, submit vulnerability, confirm EIP-712 prompt, and verify transaction on Etherscan.

---

### Phase 2: Dynamic Live Trust Graph Engine (`GraphView.tsx`)
* **Goal**: Transform `GraphView.tsx` from a static 5-node hardcoded array into a **real-time, reactive SVG visualizer** that dynamically generates graph nodes and edges from live indexed ledger events.
* **Target Files**:
  - `src/components/views/GraphView.tsx`
  - `src/store/TrustContext.tsx`
  - `src/store/useIndexedLedger.ts`
* **Implementation Steps**:
  1. **Dynamic Node Generator**:
     Read `identities`, `bounties`, `reports`, `proofs`, `escrows`, and `blockchainEvents` from state. Construct nodes dynamically:
     ```typescript
     const dynamicNodes: Node[] = [
       ...identities.map((id, idx) => ({ id: id.id, label: id.handle, type: 'identity', x: 100, y: 100 + idx * 80 })),
       ...bounties.map((b, idx) => ({ id: b.id, label: b.title, type: 'bounty', x: 300, y: 100 + idx * 80 })),
       ...reports.map((r, idx) => ({ id: r.id, label: r.title, type: 'contribution', x: 500, y: 100 + idx * 80 })),
       ...proofs.map((p, idx) => ({ id: p.id, label: `Proof ${p.contentHash.slice(0, 8)}`, type: 'proof', x: 700, y: 100 + idx * 80 }))
     ];
     ```
  2. **Automated Force-Directed Layout Algorithm**: Implement lightweight layout coordinates calculation for smooth positioning regardless of node count.
  3. **Real-Time Edge Calculation**: Link identities $\rightarrow$ submissions $\rightarrow$ proofs $\rightarrow$ escrows $\rightarrow$ payouts based on actual foreign key relationships in `TrustContext`.
  4. **Live Transaction Pulse**: Add SVG animation keyframes (`stroke-dashoffset`) on edges whenever a new on-chain transaction event arrives.
* **Verification**: Submit a new vulnerability report; confirm a new `Report` node and `Proof` node spawn in real-time on the Trust Graph SVG canvas with connected edges.

---

### Phase 3: Persistent IPFS Storage & Pinata JWT Integration
* **Goal**: Replace local client IPFS caching with persistent decentralized pinning via Pinata / Web3.Storage.
* **Target Files**:
  - `src/services/ipfsService.ts`
  - `src/components/bounties/SubmitVulnerabilityModal.tsx`
* **Implementation Steps**:
  1. **Pinata SDK Integration**: Wire `VITE_PINATA_JWT` in `ipfsService.ts` to pin encrypted vulnerability payload JSON directly to IPFS base32 CIDv1 multihashes.
  2. **Client AES-256-GCM Payload Encryption**: Encrypt sensitive reproduction steps using researcher Web Crypto keys before dispatching to IPFS gateway.
  3. **IPNS Name Resolution**: Maintain IPNS records pointing to updated reputation credentials.
* **Verification**: Upload payload, receive CID `bafybeig...`, fetch raw encrypted payload directly from `https://gateway.pinata.cloud/ipfs/{cid}`.

---

### Phase 4: Live Event Indexing with The Graph Studio
* **Goal**: Stream on-chain contract events directly into application state using GraphQL queries.
* **Target Files**:
  - `subgraph/schema.graphql`
  - `subgraph/src/mapping.ts`
  - `src/store/useIndexedLedger.ts`
* **Implementation Steps**:
  1. **Compile & Deploy Subgraph**:
     ```bash
     cd subgraph && graph codegen && graph build
     graph deploy --studio trust-engine
     ```
  2. **GraphQL Client Hook**: Connect `@apollo/client` inside `useIndexedLedger.ts` to query entities:
     ```graphql
     query GetLedgerEvents {
       proofAnchoreds(first: 20, orderBy: blockTimestamp, orderDirection: desc) {
         id
         contributionId
         contentHash
         txHash
         blockNumber
       }
     }
     ```
  3. **Live Subscription Stream**: Use GraphQL WebSocket subscriptions (`subscription { proofAnchoreds { id contentHash } }`) to update UI state in real-time.
* **Verification**: Trigger contract transaction on Sepolia; verify event appears in `useIndexedLedger` within 2 block confirmations.

---

### Phase 5: W3C Decentralized Identity (DIDs) & Verifiable Credentials
* **Goal**: Issue portable JSON-LD Verifiable Credentials signed with secp256k1 JWS signatures importable into mobile wallets.
* **Target Files**:
  - `src/identity/didResolver.ts`
  - `src/identity/vcManager.ts`
  - `src/components/passport/CredentialQRModal.tsx`
* **Implementation Steps**:
  1. **JWK Proof Construction**: Construct secp256k1 JWS proofs over W3C Verifiable Credentials using `vcManager.ts`.
  2. **QR Code Wallet Import**: Generate standardized W3C VC deep links (`openid-vc://`) inside `CredentialQRModal.tsx` for one-click import into MetaMask Swaps / Polygon ID Wallet.
* **Verification**: Open Trust Passport view, click "Export W3C Credential", scan QR code with DID wallet, verify valid credential signature.

---

### Phase 6: Cloud Oracle Sandbox Microservice & Chainlink Functions
* **Goal**: Move automated static vulnerability analysis from browser client to an isolated, sandboxed execution environment.
* **Target Files**:
  - `oracle/sandboxRunner.ts`
  - `contracts/ChainlinkOracleBridge.sol`
  - `src/components/ui/OracleVerificationBadge.tsx`
* **Implementation Steps**:
  1. **Docker Worker Deployment**: Host `oracle/sandboxRunner.ts` inside a gVisor sandboxed container on Fly.io or AWS ECS.
  2. **Chainlink Functions Integration**: Connect `ChainlinkOracleBridge.sol` callback handlers to trigger automated escrow payout when test execution passes.
* **Verification**: Submit proof script, verify Chainlink oracle request emitted, sandbox container runs AST tests, and smart contract escrow releases funds automatically.

---

## 📊 Summary of Real vs. Deterministic Architecture

| Feature | Deterministic Demo (Current) | Production Implementation (Planned) |
| :--- | :--- | :--- |
| **Wallet Signing** | Simulated ECDSA signature generator | Real EIP-712 typed data signature (`eth_signTypedData_v4`) |
| **Smart Contracts** | Simulated state changes in React Context | Solidity contracts deployed on Sepolia/Arbitrum |
| **Trust Graph Visualizer** | Hardcoded 5-node array | Dynamic auto-layout SVG graph generated from live events |
| **IPFS Storage** | Local base32 CID string generator | Pinata IPFS Gateway JWT pinning & client AES-256-GCM |
| **Ledger Indexer** | React state event array | Live GraphQL queries via The Graph Studio endpoint |
| **Oracle Sandbox** | In-browser regex static analysis | Containerized gVisor sandbox + Chainlink Functions bridge |

---

## 🎯 Verification Matrix & Execution Commands

```bash
# 1. Run Vitest QA Suite (33 passing tests)
npm test

# 2. Verify Production Build (tsc && vite build)
npm run build

# 3. Test Contract Deployment Script
npx hardhat run scripts/deploy.ts --network sepolia
```
