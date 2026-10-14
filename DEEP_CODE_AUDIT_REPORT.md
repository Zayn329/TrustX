# Trust Engine — Comprehensive Deep White-Box Code Audit Report

**Audit Date:** October 14, 2025
**Auditor Profile:** Senior QA / White-Box Security Auditor & Code Reviewer
**Target Repository:** Trust Engine (`react-vite-tailwind-app`)
**Scope:** Complete Non-UI Protocol Subsystems, Smart Contracts, Cryptography, Web3 Integration, Identity & Credentials, Storage, Indexer, State Management, and UI-to-Code Integrity.

---

## Executive Summary

This deep white-box audit evaluates the implementation fidelity of the **Trust Engine** platform by auditing the actual source code files across all non-UI protocol layers, state management stores, smart contracts, and user-facing components.

The platform exhibits a dual-architecture design:
1. **Fully Functional Local Core & Client Cryptography:** Implements native Web Crypto API (`crypto.subtle`) for SHA-256 hashing and AES-256-GCM client payload encryption, W3C DID document formatting, W3C JSON-LD Verifiable Credential schema construction, and persistent Firestore data synchronisation.
2. **Deterministic & Simulated External Interfaces:** Integrates Web3 (`viem`, `window.ethereum`), IPFS Pinata pinning, W3C VC Verifiers, The Graph Indexers, and Foundry Oracle Sandboxes via timeout-backed fetch functions that gracefully fall back to local deterministic cache/state when external keys, RPC endpoints, or backend microservices are unconfigured or offline.

---

## 1. Feature-by-Feature Implementation Matrix

| Subsystem / Feature | Claimed Description | Actual Code Status | Implementation File(s) | Key Audit Findings |
| :--- | :--- | :--- | :--- | :--- |
| **SHA-256 Evidence Hashing** | Client-side hashing of vulnerability PoC payloads | **Completed (Real)** | `src/domain/cryptoUtils.ts` | Uses browser Web Crypto API (`window.crypto.subtle.digest('SHA-256')`). |
| **AES-256-GCM Payload Encryption** | Client-side payload encryption prior to IPFS storage | **Completed (Real)** | `src/services/ipfsService.ts` | Uses Web Crypto API (`subtle.importKey` & `subtle.encrypt`) with AES-GCM 12-byte IV. |
| **W3C DID Document Resolution** | Parse & resolve `did:trust`, `did:ethr`, `did:key`, `did:pkh` | **Completed (Real Structure / Hybrid)** | `src/identity/didResolver.ts` | Generates valid W3C `JsonWebKey2020` DID documents. Remote Universal Resolver HTTP fetch falls back to local resolution. |
| **W3C Verifiable Credentials** | Issue & verify JSON-LD credentials with JWS proofs | **Simulated JWS / Real Schema** | `src/identity/vcManager.ts` | Formats valid W3C VC JSON-LD schemas. JWS signatures are computed using `btoa(payloadHash)` Base64 string formatting rather than asymmetric key signatures (secp256k1/Ed25519). |
| **IPFS Storage & Pinning** | CIDv1 base32 pinning & retrieval | **Completed (Hybrid)** | `src/services/ipfsService.ts` | Pinata API pinning via HTTP POST with JWT header. Falls back to local `Map` cache and `bafybeig...` CID string formatting. |
| **Firebase / Firestore Persistence** | Bounties and reports database persistence | **Completed (Real)** | `src/services/firestoreService.ts`, `firebase.ts` | Full CRUD methods (`getDocs`, `addDoc`, `updateDoc`). Requires Firebase environment variables; fails gracefully when unconfigured. |
| **EIP-712 Typed Data Wallet Signing** | Wallet prompt for `ProofAnchor` signature | **Completed (Real / Fallback)** | `src/blockchain/useEscrowContract.ts` | Calls `window.ethereum.request({ method: 'eth_signTypedData_v4' })`. On rejection or missing wallet, falls back to deterministic ECDSA signature representation. |
| **Smart Contract Escrow Creation** | Deposit ETH into `TrustBountyEscrow.sol` | **Completed (Real)** | `contracts/TrustBountyEscrow.sol`, `useEscrowContract.ts` | Encodes `createEscrow(uint256)` via `viem`, submits transaction on Sepolia, and waits for receipt to decode `EscrowFunded` log. |
| **Smart Contract Escrow Release** | Programmatic payout release to researcher | **Simulated / Partial** | `contracts/TrustBountyEscrow.sol`, `useEscrowContract.ts` | Solidity contract contains `releaseEscrow()`. However, frontend `releaseEscrowOnChain` sends an unencoded `0x0` value transaction without function selector/args. |
| **Smart Contract Reputation Registry** | On-chain trust score tracking | **Completed (Contract) / Simulated (UI)** | `contracts/ReputationRegistry.sol`, `TrustContext.tsx` | Solidity contract `ReputationRegistry.sol` is fully written with `updateReputation()`. Frontend `TrustContext.tsx` updates scores in local React state. |
| **Decentralized Arbitration Court** | Kleros-style 3-vote juror court | **Completed (Contract) / Hybrid (UI)** | `contracts/DisputeArbitration.sol`, `useArbitrationStore.ts` | Solidity contract `DisputeArbitration.sol` compiles and tracks votes. Frontend `castJurorVote` updates React state synchronously and sends raw `0x1c8b3e8c` calldata background transactions. |
| **Chainlink Oracle Bridge Contract** | Contract bridge for oracle callbacks | **Missing** | *Claimed in README, non-existent in repo* | `ChainlinkOracleBridge.sol` is mentioned in `README.md` and `deploy.ts` mock output, but the file does not exist in `contracts/`. |
| **PoC Oracle Sandbox Runner** | AST & Docker sandbox evaluation engine | **Simulated / Hybrid** | `oracle/sandboxRunner.ts` | Remote HTTP timeout fetch falls back to local AST regex pattern matching (`reentrancy`, `overflow`, `access`) and synthetic log array generation. |
| **The Graph Subgraph Indexer** | Indexing on-chain ledger events | **Incompatible / Fallback** | `subgraph/schema.graphql`, `src/store/useIndexedLedger.ts` | GraphQL schema defines `Bounty`, `ProofAnchor`, `EscrowRelease` entities, but `useIndexedLedger.ts` queries `blockchainEvents`. On query failure, falls back to local React event stream. |

---

## 2. Non-UI Protocol Subsystems Deep Audit

### A. Smart Contracts (`contracts/`)
- **`TrustBountyEscrow.sol`**:
  - *Status:* **Completed**
  - *Implementation:* Contains `createEscrow(uint256 bountyId)`, `releaseEscrow(uint256 escrowId, address payable researcher)`, and `raiseDispute(uint256 escrowId)`.
  - *Observations:* Emits `EscrowFunded`, `EscrowReleased`, and `EscrowDisputed` events correctly.
- **`ReputationRegistry.sol`**:
  - *Status:* **Completed**
  - *Implementation:* Contains `updateReputation(string calldata did, uint256 increment)` with `onlyOwner` access control modifier and `getReputation()`.
- **`DisputeArbitration.sol`**:
  - *Status:* **Completed**
  - *Implementation:* Implements `castVote(uint256 disputeId, Ruling vote)`. Tracks votes per juror (`hasVoted[disputeId][msg.sender]`) and auto-resolves when quorum of 3 votes is reached.
- **`ChainlinkOracleBridge.sol`**:
  - *Status:* **Missing**
  - *Observation:* Documented in `README.md` and mocked in `scripts/deploy.ts`, but no Solidity source file exists in `contracts/`.

### B. Blockchain & Web3 Integration (`src/blockchain/`)
- **`config.ts`**:
  - Requires `VITE_CHAIN_ID`, `VITE_RPC_URL`, and `VITE_TRUST_BOUNTY_ESCROW_ADDRESS`. Fails with explicit runtime errors if unconfigured.
- **`useEscrowContract.ts`**:
  - **`createEscrowOnChain`**: Real `viem` implementation. Encodes `createEscrow(uint256)` function call data, submits transaction via `walletClient`, waits for `waitForTransactionReceipt`, and parses `EscrowFunded` event logs.
  - **`signTypedDataProof`**: Sends real EIP-712 `eth_signTypedData_v4` request to `window.ethereum`. On user decline/rejection, falls back to deterministic ECDSA signature representation.
  - **`releaseEscrowOnChain` & `castJurorVoteOnChain`**: Sends raw `0x0` value `eth_sendTransaction` requests to target contract addresses without ABI-encoded function selectors or arguments.

### C. Identity & Cryptography Subsystems (`src/identity/`, `src/domain/`)
- **`cryptoUtils.ts`**:
  - Real Web Crypto API SHA-256 implementation using `window.crypto.subtle.digest('SHA-256')`.
  - Real Web Crypto random values for transaction hash generation (`window.crypto.getRandomValues`).
- **`didResolver.ts`**:
  - Parses `did:trust`, `did:ethr`, `did:key`, and `did:pkh`. Constructs standard W3C DID documents containing `JsonWebKey2020` verification methods.
  - `resolveDidAsync` includes a 1200ms timeout HTTP fetch against `VITE_DID_RESOLVER_URL`, falling back to local DID resolution.
- **`vcManager.ts`**:
  - Constructs W3C JSON-LD Verifiable Credential schema (`https://www.w3.org/2018/credentials/v1`).
  - Cryptographic proof generation constructs JWS strings using `btoa(payloadHash)` Base64 strings rather than real asymmetric private key signing (secp256k1/Ed25519).

### D. Services, Storage, & Indexing (`src/services/`, `oracle/`, `subgraph/`)
- **`ipfsService.ts`**:
  - Real client-side AES-256-GCM encryption using `window.crypto.subtle.encrypt`.
  - Real Pinata IPFS pinning via `https://api.pinata.cloud/pinning/pinJSONToIPFS` HTTP POST with JWT header. Falls back to local `Map` cache and `bafybeig...` CID string formatting on timeout or missing key.
- **`firestoreService.ts` & `firebase.ts`**:
  - Real Firebase Firestore CRUD implementation for bounties and vulnerability reports.
  - Requires Firebase environment variables; skips initialization gracefully when missing.
- **`oracle/sandboxRunner.ts`**:
  - `runSandboxEvaluation` includes a 1200ms HTTP fetch against `VITE_ORACLE_SERVICE_URL`. On timeout or missing URL, falls back to local AST keyword analysis (`reentrancy`, `overflow`, `access`) and dynamic coverage computation.
- **`subgraph/schema.graphql` & `useIndexedLedger.ts`**:
  - Mismatch between `schema.graphql` (defines `Bounty`, `ProofAnchor`, `EscrowRelease`) and GraphQL query in `useIndexedLedger.ts` (queries `blockchainEvents`). On network/query failure, falls back to local React event stream.

---

## 3. Discrepancies & Unintended Elements (User Perspective)

1. **Documentation vs Code Discrepancies:**
   - **`README.md` Claims:** Claims `ChainlinkOracleBridge.sol` exists in `contracts/`.
     *Fact:* The contract file does not exist.
   - **`README.md` Test Suite Numbers:** Claims 33 tests across 10 test files pass.
     *Fact:* Actual test suite contains 39 tests across 11 test files (`firestoreService.test.ts` was added).
   - **`deploy.ts` Output:** Logs `ChainlinkOracleBridge deployed at: 0x4444...` despite no contract code existing.

2. **UI Claims vs Underlying Implementation Discrepancies:**
   - **Bounty Detail Modal:** Displays contract address in mock format `0xTrustEscrowVault_101` rather than standard 40-character EVM address format (`0x...`).
   - **`verifySubmission` & `raiseDispute` in `TrustContext.tsx`:** If a user clicks verify or dispute without a wallet or declines a transaction, the app generates a fallback transaction hash (`generateRealTxHash()`) and updates local React state to reflect that funds were released or reputation was updated.
   - **`castJurorVote` in `useArbitrationStore.ts`:** Updates the juror vote count and resolution state synchronously in React state, while sending an unencoded `0x1c8b3e8c...` background transaction to Ethereum.

---

## 4. Test Suite Execution & Verification Summary

- **Build Verification (`npm run build`):**
  - Command: `tsc && vite build`
  - Result: **SUCCESS** (bundle built in `dist/`).
- **Test Suite Execution (`npm test`):**
  - Engine: Vitest 5.0.0 with jsdom environment.
  - Result: **11 passed / 11 files (39 passed / 39 tests)** when `.env` is initialized.
- **Test Files Audited:**
  1. `src/domain/__tests__/cryptoUtils.test.ts` (5 passed)
  2. `src/identity/__tests__/vcManager.test.ts` (3 passed)
  3. `src/identity/__tests__/didResolver.test.ts` (3 passed)
  4. `src/services/__tests__/ipfsService.test.ts` (4 passed)
  5. `src/services/__tests__/firestoreService.test.ts` (6 passed)
  6. `src/__tests__/sandboxRunner.test.ts` (3 passed)
  7. `src/store/__tests__/useArbitrationStore.test.ts` (2 passed)
  8. `src/store/__tests__/useIndexedLedger.test.ts` (2 passed)
  9. `src/blockchain/__tests__/useEscrowContract.test.ts` (4 passed)
  10. `src/__tests__/UIViewsIntegration.test.tsx` (6 passed)
  11. `src/__tests__/deployScript.test.ts` (1 passed)
