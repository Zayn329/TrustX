# Off-Chain Verification Oracle Implementation Plan

This plan covers the missing real technical-verification service behind the existing TrustX frontend boundary. It does not change the blockchain or escrow contracts and does not attempt to turn blockchain state into proof that a vulnerability is valid.

## 1. Target result

The demo should be able to submit a reproducible vulnerability report, execute its reproduction evidence in a controlled remote verifier, receive an authenticated result, and use that result as the technical input to the existing verification, reputation, and escrow workflow.

The trust relationship should be:

```text
Frontend -> verification API -> isolated verifier worker
                         <- authenticated verification result
                                     |
                                     v
                         existing frontend decision gate
                                     |
                    approved -> reputation transaction
                    company  -> escrow release transaction
```

The oracle proves only that the submitted reproduction was executed and what the execution produced. It does not independently prove ownership, intent, scope, or payout entitlement.

## 2. Existing code boundary to preserve

The current frontend already expects:

- `oracle/sandboxRunner.ts` to call `POST {VITE_ORACLE_SERVICE_URL}/evaluate`.
- A result containing `executionId`, `status`, `coveragePercentage`, `logs`, `vulnerabilityCategory`, and `executedAt`.
- `TrustContext.verifySubmission` to reject a manual decision that disagrees with the verifier status.
- An approved result to feed the existing on-chain reputation update.
- Escrow release to remain a separate company-wallet transaction through `TrustBountyEscrow.releaseEscrow`.

The implementation should fill the remote service behind this boundary first, then make the frontend call it through a server-side trust boundary. It should not reintroduce a local keyword fallback.

## 3. Implementation sequence

### Phase A — Define the verification contract

Create one versioned request/response contract shared by the frontend and verifier service.

Request should include:

- report or submission identifier;
- reproduction steps or an evidence reference;
- target/bounty identifier and scope metadata;
- proof hash or content identifier when available;
- an idempotency key.

Response should retain the fields the frontend already consumes and add only what is needed to establish provenance:

- `verificationId` / `executionId`;
- `status`: `passed`, `failed`, or an explicit non-final state if asynchronous execution is used;
- normalized logs and category;
- execution timestamp;
- verifier version;
- request/evidence hash;
- signature or equivalent result-attestation data.

Acceptance condition: the same request produces a schema-valid response that the frontend can validate without interpreting free-form text.

### Phase B — Add the remote verifier service

Create a small service separate from the Vite browser bundle. It should expose the existing `/evaluate` operation and own the secret material.

Responsibilities:

- authenticate callers at the API boundary;
- validate request size and required fields;
- create or resume an idempotent verification job;
- invoke the isolated worker;
- normalize the worker output into the shared response contract;
- return a stable result for the execution ID.

For the current demo, a synchronous request with a bounded timeout is acceptable if the worker finishes quickly. If execution exceeds the timeout, return a clear non-success result rather than making the frontend guess.

Acceptance condition: a deployed endpoint can accept one known demo reproduction and return a real execution ID plus a result derived from the worker, not from mock data or string matching.

### Phase C — Implement the isolated execution worker

Run untrusted reproduction steps in a disposable, restricted environment. The worker should have only the target fixtures and tools required by the demo.

Minimum worker boundary:

- no access to the verifier host filesystem;
- no access to deployment private keys or browser secrets;
- bounded CPU, memory, execution time, and output size;
- deterministic target fixture/version;
- explicit exit status and captured logs;
- cleanup after each execution.

The worker should produce an execution record containing the input hash, fixture/version, command result, logs, coverage measurement if supported, and tool version. Coverage must be a measured value or be reported as unavailable; it should not be inferred from reproduction text length.

Acceptance condition: the same approved demo reproduction passes in the worker, an altered reproduction fails or is rejected, and both outcomes are distinguishable by execution ID.

### Phase D — Establish result authenticity

The frontend currently validates only response shape. Add a server-side signing key to the verifier service and publish the corresponding verification key through application configuration or a fixed service key identifier.

The signed payload should bind together:

- execution ID;
- request/evidence hash;
- result status;
- verifier version;
- execution timestamp;
- fixture or target version.

Verification should happen before `TrustContext.verifySubmission` accepts the result. A valid signature authenticates the verifier’s result; it does not make the result infallible.

Acceptance condition: a changed status, execution ID, or evidence hash fails verification, and a result from an unknown key is rejected.

### Phase E — Move authentication out of the browser

Do not expose `ORACLE_SHARED_SECRET` through a `VITE_` variable or send a long-lived secret from the browser.

Use one of these focused demo-compatible arrangements:

1. A small server-side proxy owned by the TrustX application that authenticates the user/session and calls the verifier with the private service credential; or
2. A short-lived request token issued by a server-side endpoint and accepted once by the verifier.

The browser should call a TrustX-owned endpoint, while the verifier trusts only the server-side caller. Keep the existing `VITE_ORACLE_SERVICE_URL` only if it points to a public API that does not require a private browser secret.

Acceptance condition: browser bundles and network requests contain no reusable oracle shared secret, while unauthorized requests are rejected.

### Phase F — Connect the result to the current application flow

Update the frontend integration only after the service contract and authenticity checks exist:

- submit the report ID/evidence hash rather than relying only on raw reproduction text;
- display `queued`, `running`, `passed`, `failed`, and `unavailable` distinctly if asynchronous execution is used;
- persist the verification ID, result hash, verifier version, and timestamp with the verification record;
- allow reputation update only after a verified `passed` result;
- keep escrow release as a separate company-authorized transaction;
- include the verification ID in the UI and event/journal projection for demo traceability.

The UI must never display a failed, unavailable, unsigned, or mismatched result as technically verified.

Acceptance condition: one end-to-end demo can show submission, real worker execution, authenticated result, reputation receipt, and a separate escrow release receipt.

### Phase G — Deploy and demonstrate

External setup required before the integration is real:

- a hosting location for the verification API;
- a worker runtime capable of isolation;
- a domain or reachable HTTPS URL;
- server-side authentication/signing secrets;
- a known demo target fixture and verifier version;
- `VITE_ORACLE_SERVICE_URL` pointing at the deployed API;
- live Sepolia contract addresses and RPC configuration already required by the blockchain branch.

The demonstration evidence should include:

- verifier endpoint response and execution ID;
- worker logs or a summarized execution record;
- signature verification result;
- frontend verification state;
- reputation transaction hash, when approved;
- escrow funding/release transaction hashes, separately.

## 4. Dependency order and blockers

```text
Shared schema
    -> verifier API
        -> isolated worker
            -> authenticated and signed result
                -> frontend integration
                    -> reputation and escrow demonstration
```

The principal blockers are external, not frontend coding tasks:

- no deployed verifier service currently exists;
- no isolated worker environment currently exists;
- no server-side authentication/signing boundary currently exists;
- no live endpoint and successful execution evidence currently exists.

Blockchain deployment is not a prerequisite for testing the oracle itself, but live Sepolia addresses and a funded company wallet are prerequisites for demonstrating the complete verification-to-reputation-to-escrow flow.

## 5. Scope boundary

This plan intentionally excludes:

- changing escrow authorization rules;
- adding a Chainlink callback or automatic on-chain payout;
- building a general-purpose malware laboratory;
- adding a subgraph or database solely for the oracle demo;
- broad observability, multi-region deployment, or enterprise reliability work.

The success criterion is a real, isolated, authenticated, verifiable off-chain evaluation connected to the existing application flow.
