# plan.md — Production Implementation Plan & Architecture Roadmap

## Executive Overview
The **Trust Engine** platform currently stands at **~60% to 65% completion**. All core domain logic, Web Crypto hashing, W3C DID document resolution, W3C Verifiable Credentials issuance and verification, IPFS base32 CIDv1 multihashing, Solidity smart contracts (`TrustBountyEscrow`, `ReputationRegistry`, `DisputeArbitration`), interactive SVG visualizers, and a 28-test Vitest suite are fully implemented and passing clean production TypeScript builds (`tsc && vite build`).

This document outlines the **Production Implementation Plan** required to take the protocol from its current hybrid state to a live mainnet production launch.

---

## Current Architecture & Feature Matrix

| Subsystem | Current Status | Implemented Files | Mainnet Production Transition Needed |
| :--- | :--- | :--- | :--- |
| **Frontend Platform & Router** | **90% Complete** | `src/App.tsx`, `src/components/views/*` | Production analytics, error boundaries, and CDN optimization. |
| **Domain Logic & Cryptography** | **85% Complete** | `src/domain/cryptoUtils.ts`, `src/domain/types.ts` | EIP-712 typed data hashing (`eth_signTypedData_v4`). |
| **W3C DID & Verifiable Credentials** | **80% Complete** | `src/identity/didResolver.ts`, `src/identity/vcManager.ts` | Polygon ID / ION Universal Resolver gateway. |
| **Decentralized Storage & Indexing** | **75% Complete** | `src/services/ipfsService.ts`, `subgraph/schema.graphql` | Pinata API pinning keys & live Graph Studio deployment. |
| **Smart Contracts & Web3** | **65% Complete** | `contracts/*`, `src/blockchain/*` | Testnet/Mainnet deployment scripts, ERC-20 support, audit. |
| **Oracle Sandbox Evaluation** | **65% Complete** | `oracle/sandboxRunner.ts`, `oracle/ChainlinkOracleBridge.sol` | Microservice container hosted on Fly.io / AWS ECS. |
| **Governance & Arbitration** | **60% Complete** | `contracts/DisputeArbitration.sol`, `src/store/useArbitrationStore.ts` | Staked juror court deployment & timelock triggers. |

---

## Production Implementation Roadmap (Phases 9 - 14)

### Phase 9: Persistent Decentralized Storage & Pinning Service (Pinata / Web3.Storage)
- **Goal**: Transition client-side in-memory IPFS storage cache to global persistent pinning services with IPNS record management.
- **Tasks**:
  1. Integrate Pinata SDK / `@pinata/sdk` in `src/services/ipfsService.ts`.
  2. Implement secure client API JWT generation or serverless proxy route to hide Pinata private API keys.
  3. Add payload encryption prior to IPFS pinning using AES-256-GCM with researcher/organization public keys.
- **Files to Modify**: `src/services/ipfsService.ts`, `src/components/bounties/SubmitVulnerabilityModal.tsx`.
- **Verification**: Submit proof payload, verify CID creation via Pinata Gateway (`https://gateway.pinata.cloud/ipfs/{cid}`), and fetch payload on an independent browser session.

### Phase 10: Live Subgraph Indexing on The Graph Studio
- **Goal**: Replace simulated indexed ledger state with live GraphQL queries streaming events from Ethereum Sepolia / Arbitrum.
- **Tasks**:
  1. Compile `subgraph/schema.graphql` and build event handlers (`subgraph/src/mapping.ts`).
  2. Deploy subgraph to **The Graph Studio** or Goldsky indexing infrastructure.
  3. Configure `@apollo/client` or `urql` client in `src/store/useIndexedLedger.ts` pointing to the production GraphQL endpoint.
- **Files to Modify**: `subgraph/subgraph.yaml`, `subgraph/src/mapping.ts`, `src/store/useIndexedLedger.ts`.
- **Verification**: Trigger contract transaction, confirm `ProofAnchored` event indexed within 2 blocks, and verify UI updates dynamically.

### Phase 11: Production Web3 Provider (RainbowKit / AppKit) & EIP-712 Signing
- **Goal**: Upgrade `useEscrowContract.ts` to full RainbowKit / Wagmi v2 modal supporting MetaMask, Coinbase, Rainbow, and WalletConnect v2.
- **Tasks**:
  1. Install `@rainbow-me/rainbowkit`, `wagmi`, `viem`, `@tanstack/react-query`.
  2. Configure WalletConnect Project ID in `src/blockchain/wagmiConfig.ts`.
  3. Implement EIP-712 Domain Separator and typed data struct signing for vulnerability proof anchoring (`eth_signTypedData_v4`).
- **Files to Modify**: `src/blockchain/wagmiConfig.ts`, `src/blockchain/useEscrowContract.ts`, `src/components/blockchain/WalletModal.tsx`.
- **Verification**: Connect RainbowKit wallet on Sepolia testnet, trigger proof anchoring signature prompt, and confirm signature verification on-chain.

### Phase 12: Production Cloud Oracle Microservice & Chainlink Functions
- **Goal**: Move the JS/Regex static analyzer and Docker/Foundry runner from browser client to an isolated, sandboxed cloud microservice.
- **Tasks**:
  1. Package `oracle/sandboxRunner.ts` into an isolated Node.js microservice running inside an ephemeral gVisor/Docker container on Fly.io or AWS ECS.
  2. Connect `oracle/ChainlinkOracleBridge.sol` to **Chainlink Functions** or custom oracle node.
  3. Add HMAC signature authorization between oracle worker and smart contracts.
- **Files to Modify**: `oracle/sandboxRunner.ts`, `oracle/ChainlinkOracleBridge.sol`, `src/components/ui/OracleVerificationBadge.tsx`.
- **Verification**: Post proof payload, verify Chainlink oracle request emitted, execute sandbox container test, and verify automated contract payout trigger.

### Phase 13: Hardhat / Foundry Deployment Scripts & Multi-Sig Governance
- **Goal**: Automated contract compilation, deployment, verification, and ownership transfer to Gnosis Safe multi-sig.
- **Tasks**:
  1. Create Hardhat / Foundry deployment scripts (`scripts/deploy.ts`).
  2. Add ERC-20 token transfer mechanics (USDC / USDT / DAI) alongside native ETH in `TrustBountyEscrow.sol`.
  3. Verify contracts on Etherscan / Arbiscan via API keys.
  4. Transfer ownership of `ReputationRegistry.sol` and `TrustBountyEscrow.sol` to a Gnosis Safe multi-sig wallet.
- **Files to Modify**: `contracts/TrustBountyEscrow.sol`, `contracts/ReputationRegistry.sol`, `scripts/deploy.ts`.
- **Verification**: Run `npx hardhat run scripts/deploy.ts --network sepolia`, confirm Etherscan green checkmark verification, and test multi-sig transaction execution.

### Phase 14: Security Audits, Monitoring, & Production Infrastructure
- **Goal**: Ensure mainnet resilience, smart contract security, and operational monitoring.
- **Tasks**:
  1. Undergo formal third-party smart contract security audit (OpenZeppelin / Trail of Bits).
  2. Set up Tenderly or OpenZeppelin Defender alert triggers for large escrow releases or dispute lock events.
  3. Deploy web application frontend to Vercel / Cloudflare Pages with custom domain and CSP security headers.
- **Verification**: Execute automated Slither / Mythril static analysis, simulate emergency pause/unpause on Defender, and verify 100% uptime on production URL.

---

## ⚠️ Risk & Backward Compatibility Preservation Matrix

1. **EVM BigInt vs JS Number Coercion**:
   - *Strategy*: All smart contract numeric returns (`bigint`) must pass through `src/domain/cryptoUtils.ts` formatting functions before entering React UI components.
2. **Web3 RPC Network Outages**:
   - *Strategy*: Retain fallback RPC endpoints (Alchemy / Infura / Public RPC) and fallback simulation state in `useEscrowContract.ts` so the frontend application remains 100% functional even during testnet RPC degradation.
3. **W3C VC Verification Backward Compatibility**:
   - *Strategy*: `verifyCredential()` supports both synchronous fallback credentials and asynchronous JWS-signed credentials.
