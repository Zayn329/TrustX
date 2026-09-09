# task.md — Actionable Tasks

## Phase 1 - 3: Core MVP Setup & Implementation [Completed]
- [x] Phase 1: Initialize minimal React + TypeScript + Vite + Tailwind CSS + Lucide setup.
- [x] Phase 2: Inspect repository and generate exploration report.
- [x] Phase 2: Create `AGENTS.md`.
- [x] Phase 2: Create `spec.md`.
- [x] Phase 2: Create `design.md`.
- [x] Phase 2: Create `plan.md`.
- [x] Phase 2: Create `task.md`.
- [x] Phase 3 Stage 1: Implement `src/domain/types.ts` and `src/domain/mockData.ts`.
- [x] Phase 3 Stage 2: Implement `src/store/TrustContext.tsx`.
- [x] Phase 3 Stage 3: Implement App Navigation Header and View Routing.
- [x] Phase 3 Stage 4: Implement Trust Dashboard View.
- [x] Phase 3 Stage 5: Implement Bug Bounty Marketplace and Submission Form.
- [x] Phase 3 Stage 6: Implement Proof-of-Discovery and Verification Visualizers.
- [x] Phase 3 Stage 7: Implement Trust Passport and Portable Reputation View.
- [x] Phase 3 Stage 8: Implement Contribution Explorer View.
- [x] Phase 3 Stage 9: Implement Interactive SVG Trust Graph.
- [x] Phase 3 Stage 10: Implement Network View (Ledger, Disputes, Sybil Risk).
- [x] Phase 3 Stage 11: Verification & Polish.

## Phase 4: Smart Contract & EVM Escrow Integration
- [ ] Implement Solidity escrow smart contract (`contracts/TrustBountyEscrow.sol`).
- [ ] Implement on-chain reputation registry (`contracts/ReputationRegistry.sol`).
- [ ] Configure Wagmi / Viem / RainbowKit Web3 provider connection (`src/blockchain/wagmiConfig.ts`).
- [ ] Integrate Web3 write/read hooks to trigger on-chain deposits and releases (`src/blockchain/useEscrowContract.ts`).

## Phase 5: Decentralized Storage & Event Indexing
- [ ] Implement IPFS / Helia evidence payload pinning service (`src/services/ipfsService.ts`).
- [ ] Build GraphQL indexer schema and mapping (`subgraph/schema.graphql`).
- [ ] Connect frontend live event stream to indexer endpoint (`src/store/useIndexedLedger.ts`).

## Phase 6: W3C Decentralized Identity (DID) & Verifiable Credentials
- [ ] Integrate W3C DID resolver (`src/identity/didResolver.ts`).
- [ ] Implement W3C Verifiable Credential issuer and validator (`src/identity/vcManager.ts`).
- [ ] Build credential QR code modal for mobile wallet import (`src/components/passport/CredentialQRModal.tsx`).

## Phase 7: Automated Verification Oracles
- [ ] Build isolated Docker sandbox test runner microservice (`oracle/sandboxRunner.ts`).
- [ ] Implement Chainlink Functions oracle bridge contract (`oracle/ChainlinkOracleBridge.sol`).
- [ ] Add automated oracle verification logs & badge component (`src/components/ui/OracleVerificationBadge.tsx`).

## Phase 8: Decentralized Governance & Arbitration Protocol
- [ ] Implement Kleros-style dispute arbitration contract (`contracts/DisputeArbitration.sol`).
- [ ] Build arbitration court view for staked jurors (`src/components/network/ArbitrationCourtView.tsx`).
- [ ] Integrate dispute voting state management (`src/store/useArbitrationStore.ts`).
