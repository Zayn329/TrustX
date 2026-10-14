# Off-Chain Verification / Oracle Dependency Map

This is a dependency and status map for real off-chain technical verification. It is not an implementation plan.

## Current status

The blockchain and escrow layer is now connected at the application boundary:

- Sepolia-capable contract tooling and configuration exist.
- Escrow funding and release are receipt-gated on-chain ETH transactions.
- Proof and reputation contracts can be updated through blockchain transactions.
- The frontend reads transaction receipts/events and keeps a local projection.
- Escrow release remains authorized by the company address in `TrustBountyEscrow`; blockchain state does not itself prove that a vulnerability is valid.

The oracle layer is not a live, independently verified service yet. The frontend has a fail-closed remote boundary only:

- `oracle/sandboxRunner.ts` sends reproduction steps to `POST {VITE_ORACLE_SERVICE_URL}/evaluate`.
- The response must contain an execution ID, pass/fail status, coverage, logs, category, and execution timestamp.
- There is no local keyword fallback, so an unavailable or malformed verifier leaves the submission unverified.
- No deployed endpoint, authenticated service handshake, isolated execution environment, durable job system, signed result, or live result evidence is present in this repository.
- `ORACLE_SHARED_SECRET` is listed in environment documentation, but the browser call does not use it. The frontend therefore does not currently establish an authenticated oracle trust boundary.

## Dependency flow

```text
Submission + reproduction steps
          |
          v
Frontend TrustContext.verifySubmission
          |
          v
Remote verifier: VITE_ORACLE_SERVICE_URL/evaluate
          |
          +--> isolated PoC/tool execution environment       [external; not present]
          +--> target fork, fixtures, and security tooling     [external; not present]
          +--> job lifecycle, timeout, retry, and persistence  [external; not present]
          +--> authenticated request and result integrity     [external; not present]
          |
          v
Structured verification result
          |
          +--> technical pass/fail gate in TrustContext
          +--> reputation transaction for an approved result
          +--> application projection of verification state
          |
          v
Company-authorized releaseEscrow transaction
          |
          v
TrustBountyEscrow on Sepolia
```

## What is connected versus what is missing

| Dependency | Current connection | Status |
|---|---|---|
| Submission evidence | Frontend passes reproduction steps to the verifier boundary | Connected in code; no live service confirmed |
| Oracle endpoint | `VITE_ORACLE_SERVICE_URL` selects `/evaluate` | Endpoint is a placeholder/configuration dependency |
| PoC execution | Expected behind the remote endpoint | Missing from this repository and not externally verified |
| Isolation | Expected for untrusted reproduction steps | No deployed container/runner evidence |
| Authentication | `ORACLE_SHARED_SECRET` is documented | Not wired into the browser request; trust boundary incomplete |
| Result integrity | Shape validation checks fields and status | No signature, attestation, or independently verifiable execution proof |
| Verification gate | Result status must match the approval decision | Connected; depends on trusting the remote result |
| Reputation update | Approved result can trigger the on-chain reputation call | Connected to the blockchain layer, subject to live contract configuration |
| Escrow payout | Company wallet submits `releaseEscrow`; receipt is required | Connected to escrow contract; payout is not oracle-authorized |
| Observability | UI can display returned execution details | No durable oracle job/status/attempt history |

## External prerequisites that determine real-oracle readiness

1. A deployed verifier service with a reachable URL and a defined evaluation contract.
2. A controlled execution runtime for untrusted PoCs, including target fixtures and resource/time limits.
3. A server-side authentication and secret boundary; secrets cannot be treated as safe browser configuration.
4. Durable handling for queued, running, timed-out, failed, and completed evaluations.
5. A trustworthy result channel, such as signed results or an independently verifiable attestation.
6. A clear authorization relationship between the verifier result, reputation update, and company-controlled escrow release.
7. Live environment evidence: endpoint health, a successful evaluation ID, deployed contract addresses, and Sepolia transaction receipts.

## Bottom line

Real blockchain and escrow make the settlement and reputation side externally observable, but they do not make technical verification real by themselves. The remaining gap is the complete off-chain trust chain: execution, isolation, authentication, durable result handling, and verifiable oracle output. Until those dependencies exist, the project can truthfully demonstrate real on-chain settlement infrastructure plus a fail-closed oracle integration boundary, but not a live production oracle.
