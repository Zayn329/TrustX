# plan.md — Implementation Plan

## Completed MVP Stages (Phases 1 - 3)

### Stage 1: Domain Models & Deterministic Mock Data Generator [Completed]
- **Purpose**: Define domain TypeScript interfaces and construct cross-referenced initial mock data.
- **Files**: `src/domain/types.ts`, `src/domain/mockData.ts`, `src/domain/cryptoUtils.ts`

### Stage 2: Central Application Store & Context [Completed]
- **Purpose**: Create `TrustContext` and provider with actions (`addSubmission`, `verifySubmission`, `raiseDispute`).
- **Files**: `src/store/TrustContext.tsx`

### Stage 3: Navigation Shell & Core Layout [Completed]
- **Purpose**: Build main header, navigation bar, and tab router.
- **Files**: `src/components/layout/Header.tsx`, `src/components/layout/Navbar.tsx`, `src/App.tsx`

### Stage 4: Trust Dashboard View [Completed]
- **Purpose**: Build Trust Dashboard showing trust score, verified contributions, success rates, and verification timeline.
- **Files**: `src/components/views/DashboardView.tsx`

### Stage 5: Bug Bounty Marketplace & Detail View [Completed]
- **Purpose**: Render bounty list with severity, escrow status, rewards, and detailed view with submission form modal.
- **Files**: `src/components/views/BountiesView.tsx`, `src/components/bounties/BountyCard.tsx`, `src/components/bounties/BountyDetailModal.tsx`, `src/components/bounties/SubmitVulnerabilityModal.tsx`

### Stage 6: Proof-of-Discovery & Verification Visualizer [Completed]
- **Purpose**: Display proof cards clearly distinguishing *Cryptographically Proven* vs. *Technically Verified*.
- **Files**: `src/components/ui/ProofCard.tsx`, `src/components/ui/VerificationTimeline.tsx`

### Stage 7: Trust Passport & Portable Reputation View [Completed]
- **Purpose**: Display researcher DID profile, score breakdown, and cross-platform portable reputation diagram.
- **Files**: `src/components/views/PassportView.tsx`, `src/components/passport/PortableReputationDiagram.tsx`, `src/components/passport/ScoreBreakdown.tsx`

### Stage 8: Contribution Explorer View [Completed]
- **Purpose**: Provide audit trail inspector (Identity → Contribution → Proof → Verification → Ledger → Reward).
- **Files**: `src/components/views/ExplorerView.tsx`

### Stage 9: Interactive Trust Graph View [Completed]
- **Purpose**: Visual node-link SVG graph connecting identities, contributions, proofs, bounties, and escrow contracts.
- **Files**: `src/components/views/GraphView.tsx`

### Stage 10: Network View (Ledger, Disputes, Fraud Risk) [Completed]
- **Purpose**: Simulated blockchain activity explorer, dispute resolution panel, and Sybil risk visualizer.
- **Files**: `src/components/views/NetworkView.tsx`, `src/components/network/NetworkComponents.tsx`

---

## Future Expansion Implementation Plans (Phases 4 - 8)

### Phase 4: Smart Contract & EVM Escrow Integration
- **Purpose**: Replace simulated smart contract escrows with real, audited EVM smart contracts deployed on Ethereum Sepolia / Base testnet and integrate Web3 wallet connection.
- **Key Components / Files**:
  - `contracts/TrustBountyEscrow.sol`: Solidity contract handling bounty deposits, timelocks, conditional payout execution, and dispute locks.
  - `contracts/ReputationRegistry.sol`: On-chain reputation registry mapping DIDs to verifiable score increments.
  - `src/blockchain/wagmiConfig.ts`: Web3 provider setup using Wagmi, Viem, and RainbowKit.
  - `src/blockchain/useEscrowContract.ts`: React hook interfacing with `TrustBountyEscrow.sol` via `writeContract` / `readContract`.
- **Verification Method**: Deploy smart contracts using Hardhat / Foundry, execute unit tests on local Hardhat node, and verify on-chain deposit/release transactions via Sepolia Etherscan.

### Phase 5: Decentralized Storage & Event Indexing
- **Purpose**: Anchor encrypted vulnerability proof payloads on IPFS / Arweave and stream real-time protocol transactions via a dedicated GraphQL indexer.
- **Key Components / Files**:
  - `src/services/ipfsService.ts`: Client/SDK wrapper using Pinata / Helia IPFS to upload encrypted PoC evidence and retrieve CID hashes.
  - `subgraph/schema.graphql` & `subgraph/src/mapping.ts`: The Graph / Envio indexer tracking `BountyCreated`, `ProofAnchored`, and `EscrowReleased` contract events.
  - `src/store/useIndexedLedger.ts`: Custom hook consuming indexer GraphQL queries to replace local mock event state.
- **Verification Method**: Pin test payload to IPFS, verify CID resolution, trigger smart contract event, and query GraphQL indexer endpoint for updated event logs.

### Phase 6: W3C Decentralized Identity (DID) & Verifiable Credentials (VC)
- **Purpose**: Transition local mock DIDs to production W3C DID specifications (`did:polygonid` / `did:ion`) and issue portable, cryptographically signed Verifiable Credentials.
- **Key Components / Files**:
  - `src/identity/didResolver.ts`: Integration with W3C DID resolvers for researcher key resolution.
  - `src/identity/vcManager.ts`: Issue and verify W3C JSON-LD Verifiable Credentials for verified bounties and trust scores.
  - `src/components/passport/CredentialQRModal.tsx`: Render QR code for mobile DID wallet scanning (e.g., Polygon ID Wallet).
- **Verification Method**: Generate Verifiable Credential payload, verify cryptographic proof signature using public key, and validate credential structure against W3C VC schema specs.

### Phase 7: Automated Verification Oracles
- **Purpose**: Integrate isolated sandboxed execution environments and oracle networks (e.g. Chainlink Functions) to execute automated static analysis and PoC reproduction test runners.
- **Key Components / Files**:
  - `oracle/sandboxRunner.ts`: Secure microservice executing submitted PoC scripts inside ephemeral Docker containers.
  - `oracle/ChainlinkOracleBridge.sol`: Contract receiving automated verification results from Chainlink oracle nodes.
  - `src/components/ui/OracleVerificationBadge.tsx`: Display automated test execution logs, pass/fail status, and coverage metrics.
- **Verification Method**: Submit PoC payload, trigger oracle request, verify isolated sandbox execution output, and confirm automated escrow payout upon passing test suite.

### Phase 8: Decentralized Governance & Arbitration Protocol
- **Purpose**: Build a decentralized dispute resolution protocol (e.g. Kleros-style jury mechanism) to handle contested vulnerability reports and release disputed escrow funds.
- **Key Components / Files**:
  - `contracts/DisputeArbitration.sol`: Smart contract managing juror staking, evidence submission windows, voting periods, and final ruling execution.
  - `src/components/network/ArbitrationCourtView.tsx`: UI for staked jurors to review disputed report evidence, inspect SHA-256 proof timestamps, and cast encrypted votes.
  - `src/store/useArbitrationStore.ts`: State management for open dispute cases, juror votes, and ruling execution timers.
- **Verification Method**: Create dispute, simulate multi-juror voting round, verify automated ruling execution, and confirm conditional escrow settlement based on juror consensus.
