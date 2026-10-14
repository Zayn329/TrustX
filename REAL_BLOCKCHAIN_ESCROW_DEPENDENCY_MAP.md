# Real Blockchain Network and Escrow — Current Dependency Map

This map describes the current code path for making the bounty funding, escrow state, contract events, and ledger display genuinely blockchain-backed.

It is a current-state dependency map only. It does not prescribe an implementation plan.

## Executive status

The project has one substantially real on-chain path:

```text
Wallet connection
  -> createEscrow(bountyId) transaction
  -> TrustBountyEscrow.sol
  -> receipt confirmation
  -> EscrowFunded event decoding
  -> Firestore/local bounty update
```

The following paths are not currently genuine contract-backed flows:

```text
verification result
  -> reputation update
  -> escrow release
  -> blockchain ledger event
```

Those currently use local React state, generated hashes, or unencoded zero-value transactions.

## End-to-end dependency graph

```text
                         External setup
       ┌──────────────────────────────────────────────────────┐
       │ MetaMask/wallet account                              │
       │ Sepolia test ETH                                     │
       │ RPC provider account + URL                           │
       │ Deployed contract address                            │
       └──────────────────────────────┬───────────────────────┘
                                      │
                                      ▼
┌───────────────────┐       ┌──────────────────────────────┐
│ WalletModal.tsx   │──────▶│ useEscrowContract.ts          │
│ connect wallet    │       │ EIP-1193 + viem                │
└───────────────────┘       └──────────────┬───────────────┘
                                           │
                              ┌────────────┴─────────────┐
                              │                          │
                              ▼                          ▼
                   ┌────────────────────┐     ┌──────────────────────┐
                   │ walletClient       │     │ publicClient          │
                   │ custom(provider)   │     │ http(RPC_URL)         │
                   └─────────┬──────────┘     └──────────┬───────────┘
                             │                           │
                             └─────────────┬─────────────┘
                                           ▼
                                ┌──────────────────────┐
                                │ Sepolia EVM network  │
                                └──────────┬───────────┘
                                           ▼
                                ┌──────────────────────┐
                                │ TrustBountyEscrow.sol │
                                └──────────┬───────────┘
                                           │ logs + state
                                           ▼
                     ┌─────────────────────────────────────────┐
                     │ receipt / event / contract read layer   │
                     └───────┬──────────────────────┬──────────┘
                             │                      │
                             ▼                      ▼
                    ┌────────────────┐     ┌────────────────────┐
                    │ TrustContext    │     │ useIndexedLedger   │
                    │ local state     │     │ GraphQL indexer    │
                    └───────┬────────┘     └──────────┬─────────┘
                            │                         │
                            └────────────┬────────────┘
                                         ▼
                              ┌────────────────────────┐
                              │ Explorer / Network UI  │
                              └────────────────────────┘
```

## External setup and environment dependencies

### Required for the current real escrow funding path

| Dependency | Where it enters | What it supplies |
|---|---|---|
| Browser wallet | `window.ethereum` in `useEscrowContract.ts` | Account, transaction approval, chain access |
| Wallet account | Wallet itself | Sender address and transaction signatures |
| Sepolia test ETH | Wallet balance | Gas and escrow value |
| RPC provider | `VITE_RPC_URL` | Public blockchain reads and receipt fallback |
| Chain ID | `VITE_CHAIN_ID` | Network validation and viem chain selection |
| Escrow address | `VITE_TRUST_BOUNTY_ESCROW_ADDRESS` | Target deployed `TrustBountyEscrow` contract |
| Contract deployment | External deployment action | Actual bytecode and storage on Sepolia |

### Declared but not required for the core escrow path

| Dependency | Environment variable | Current relevance |
|---|---|---|
| WalletConnect project | `VITE_WALLETCONNECT_PROJECT_ID` | Declared, but current code uses injected `window.ethereum`; no WalletConnect path is evident here |
| Subgraph provider | `VITE_SUBGRAPH_ENDPOINT` | Needed for indexed historical events, not for submitting escrow transactions |
| Etherscan API key | `ETHERSCAN_API_KEY` | Deployment verification convenience, not runtime escrow behavior |
| Deployer private key | `DEPLOYER_PRIVATE_KEY` | Contract deployment/CI only; must not be exposed to Vite frontend |
| Reputation address | `VITE_REPUTATION_REGISTRY_ADDRESS` | Declared, but not used by the real verification flow currently |
| Arbitration address | `VITE_DISPUTE_ARBITRATION_ADDRESS` | Used by a separate incomplete vote path |
| Chainlink address | `VITE_CHAINLINK_ORACLE_BRIDGE_ADDRESS` | Declared but corresponding contract is missing |

## Layer-by-layer current dependencies

### A. Network configuration

```text
.env
  -> import.meta.env
  -> src/blockchain/config.ts
  -> CHAIN_ID / RPC_URL / TRUST_BOUNTY_ESCROW_ADDRESS
  -> blockchainConfig
```

Current behavior:

- The app throws during module initialization if chain ID, RPC URL, or escrow address is missing.
- The address is checked only for hexadecimal shape, not deployment validity.
- `isConfiguredChain()` compares the wallet chain ID with the configured chain ID.
- `viemClient.ts` explicitly maps `11155111` to Sepolia.
- Other chain IDs fall back to Sepolia with a warning, so configuration does not fully select arbitrary EVM networks.

### B. Wallet connection

```text
WalletModal.tsx
  -> useEscrowContract()
  -> window.ethereum.request('eth_requestAccounts')
  -> eth_chainId
  -> eth_getBalance
  -> WalletState
```

Current behavior:

- Account and chain changes are observed through `accountsChanged` and `chainChanged`.
- The wallet connection is real when an injected provider exists.
- No fake connected wallet state is used when no wallet exists.
- Connection does not itself guarantee that the configured escrow contract exists or has the expected bytecode.

### C. Escrow creation — currently the strongest real path

```text
TrustContext.fundEscrow(bountyId)
  -> validate wallet, chain, amount, currency
  -> USDC display amount converted to ETH
  -> Firestore bounty ID converted to numeric on-chain ID
  -> createEscrowOnChain(onChainBountyId, ethAmount)
  -> ABI encode createEscrow(uint256)
  -> walletClient.sendTransaction({ to, value, data })
  -> waitForTransactionReceipt
  -> decode EscrowFunded log
  -> persist escrow ID and tx hash in Firestore
  -> update local bounty state
```

Contract-side behavior:

```text
createEscrow(bountyId) payable
  -> require(msg.value > 0)
  -> increment escrowCounter
  -> store company, amount, bounty ID, Funded status
  -> emit EscrowFunded
```

What is genuinely connected:

- Contract address is configured through the environment.
- Function calldata is ABI encoded.
- ETH value is sent with the transaction.
- The receipt is awaited.
- `EscrowFunded` is decoded from receipt logs.
- The returned transaction hash and escrow ID are written to bounty data.

Important data dependency:

```text
Firestore bounty ID
  -> generateOnChainIdFromFirestoreId()
  -> numeric bountyId in the contract
```

The contract does not know the original Firestore document ID. The mapping must remain deterministic for the UI, Firestore, and chain records to refer to the same bounty.

### D. Escrow release — currently not connected correctly

Intended flow:

```text
approved verification
  -> releaseEscrow(escrowId, researcherAddress)
  -> TrustBountyEscrow.sol
  -> ETH transfer
  -> EscrowReleased event
  -> confirmed UI state
```

Current code flow:

```text
TrustContext.verifySubmission()
  -> local verification status update
  -> raw eth_sendTransaction to escrow address
  -> value: 0x0
  -> generated/accepted tx hash
  -> local escrow status = released
  -> local ReputationUpdated event
```

The current release path does not pass:

- The `releaseEscrow` function selector
- The escrow ID
- The researcher payable address
- A receipt check
- An `EscrowReleased` event decode

The Solidity function itself exists and transfers ETH, but the frontend does not currently call it through its ABI.

### E. Escrow contract state and authorization

The contract stores:

- `escrowCounter`
- Bounty ID
- Company address
- Researcher address
- Amount
- Status
- Creation timestamp

The contract currently permits:

- Anyone to create an escrow for a bounty ID
- Only the original company address to release its escrow
- Anyone to raise a dispute, provided the status is eligible

The contract has no connection to:

- A technical verifier
- `ReputationRegistry`
- `DisputeArbitration`
- An oracle callback

Therefore, the escrow contract is a standalone ETH vault with release authorization based on the company wallet, not an end-to-end trust protocol.

### F. Verification-to-escrow connection

Current path in `TrustContext.tsx`:

```text
verifySubmission(reportId, isApproved, notes)
  -> immediately set Verification status
  -> if approved:
       generate or request dummy transaction hashes
       set local escrow status to released
       increase local trust score
       create local ReputationEvent
       create local BlockchainEvent
```

The current approved-verification path does not require:

- A real oracle result
- A real escrow ID lookup on-chain
- A successful release receipt
- A real reputation contract transaction
- A real `EscrowReleased` event

### G. Blockchain event production

Real contract events currently available from the escrow contract:

- `EscrowFunded`
- `EscrowReleased`
- `EscrowDisputed`

Current frontend event sources:

```text
Initial mock events
  -> INITIAL_BLOCKCHAIN_EVENTS

User verification/dispute actions
  -> generated tx hash + synthetic block number
  -> TrustContext.setBlockchainEvents()

Escrow funding
  -> real receipt data returned by createEscrowOnChain()
  -> bounty data updated
```

The funding result is returned from a real receipt, but it is not clearly normalized into the central `BlockchainEvent[]` stream in the same way as synthetic verification events.

### H. Historical event indexing

```text
useIndexedLedger.ts
  -> VITE_SUBGRAPH_ENDPOINT
  -> GraphQL query: blockchainEvents
  -> indexedEvents
  -> NetworkView / ledger UI
```

Current issues:

- The query asks for `blockchainEvents`.
- The declared subgraph schema defines different entities, including `Bounty`, `ProofAnchor`, and `EscrowRelease`.
- The query result shape is cast directly to `BlockchainEvent[]` without a normalization layer.
- On failure or empty result, the hook falls back to the local TrustContext event stream.
- The default endpoint is a placeholder-style URL and is not evidence of a deployed working subgraph.

Consequently, the ledger UI is not currently guaranteed to represent the canonical EVM event history.

## Current authority map

| Data or claim | Actual current authority | Desired blockchain-backed authority | Current status |
|---|---|---|---|
| Wallet identity | Injected wallet | Injected wallet | Real when connected |
| Network identity | Wallet chain ID plus configured ID | Same, with strict chain enforcement | Partial |
| Escrow funding | Sepolia receipt plus Firestore/local state | Escrow contract and `EscrowFunded` event | Mostly real |
| Escrow amount | Contract value at creation, copied into app state | Contract storage | Contract real; UI copy is secondary |
| Escrow status after funding | Local/Firestore status | Contract `escrows[id].status` | Hybrid |
| Verification status | React state | Authorized verifier/oracle record | Local |
| Escrow release | React state and dummy transaction path | `releaseEscrow` receipt and `EscrowReleased` | Incomplete |
| Reputation update | React state and generated tx hash | `ReputationRegistry` event/state | Local |
| Dispute event | React state and dummy transaction path | `EscrowDisputed` receipt | Incomplete |
| Ledger history | Mock/local events or mismatched subgraph query | EVM logs/indexer | Hybrid |
| Contract address | `.env` string | Verified deployed bytecode at address | Configured but unverified |

## External accounts, keys, and services by necessity

### Necessary for a real funding demonstration

1. A browser wallet account.
2. Sepolia testnet ETH.
3. An RPC provider URL and provider account/key, unless a wallet provider is sufficient for every read.
4. A deployed `TrustBountyEscrow` contract.
5. The deployed contract address in `.env`.

### Necessary for real historical ledger display

6. A deployed and populated subgraph or another indexing service.
7. An indexer endpoint in `.env`.

### Not necessary for the core escrow demonstration

- Pinata/IPFS
- Firebase
- WalletConnect
- Etherscan API
- Chainlink
- Reputation contract
- Arbitration contract

Those services support adjacent capabilities, but they are not required to prove that ETH was deposited into the escrow contract and that a real `EscrowFunded` event occurred.

## Bottom line

The current project already has a real funding transaction path, subject to external network setup and a valid deployment.

The real blockchain escrow system is not yet end-to-end because the downstream authority chain stops here:

```text
real funding
  -> local verification decision
  -> local release/reputation decision
  -> synthetic ledger event
```

The central dependency gap is therefore not merely “connect an RPC.” It is the missing canonical path from:

```text
verified report
  -> authorized contract call
  -> confirmed receipt
  -> decoded event
  -> indexed canonical ledger state
```
