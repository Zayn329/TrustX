# Off-Chain Oracle Risk-Mitigation Plan

This plan reduces the risks identified in `OFFCHAIN_ORACLE_IMPLEMENTATION_PLAN.md`. It is limited to the minimum controls needed for a credible demo of real off-chain verification. It does not implement the controls.

## Priority order

### Priority 1 — Prevent unsafe proof execution

Risk: submitted reproduction steps may execute malicious commands or access secrets.

Mitigation:

- Accept a structured reproduction format or a narrowly defined command set instead of arbitrary shell input.
- Run each evaluation in a disposable worker environment with no deployment keys, browser secrets, host filesystem access, or privileged container access.
- Restrict network access to the declared target fixture, cap CPU/memory/time/output, and terminate child processes on timeout.
- Use a pinned target fixture and toolchain version for the demo.
- Delete the worker environment and temporary evidence after the result is recorded.

Done when: a known valid reproduction passes, a malformed or disallowed command is rejected, and the worker cannot access a test secret placed outside its allowed fixture.

### Priority 2 — Put authentication and secrets on the server side

Risk: a browser-exposed shared secret can be copied and used to submit fake evaluations.

Mitigation:

- Add a small TrustX server endpoint or gateway between the browser and verifier.
- Keep the verifier credential and signing key only in server-side environment variables.
- Authenticate the browser request using the application’s existing user/session identity.
- Authenticate gateway-to-verifier traffic with a short-lived token or server-held secret.
- Remove any long-lived oracle secret from `VITE_*` variables and browser requests.

Done when: the browser bundle contains no reusable oracle credential and direct unauthenticated calls to the verifier are rejected.

### Priority 3 — Bind every result to exact evidence

Risk: a valid result could be replayed for another report or altered in transit.

Mitigation:

- Compute a canonical hash over the report ID, reproduction/evidence hash, target fixture version, and request ID.
- Include that hash in the result payload and signed message.
- Require a unique execution ID and idempotency key for each request.
- Reject results whose report ID, evidence hash, target version, or execution ID does not match the current submission.
- Store the verifier version and timestamp with the verification record.

Done when: changing any bound field causes verification to fail and repeating the same idempotency key does not create a second authoritative result.

### Priority 4 — Make result authenticity verifiable

Risk: response-shape validation does not establish who produced the result or whether it was altered.

Mitigation:

- Sign the canonical result on the verifier side.
- Pin the verifier public key or trusted key identifier in the server-side integration.
- Verify the signature before the application accepts `passed`.
- Keep a simple key identifier and rotation/revocation mechanism so a compromised key can be rejected.
- Record the signed result or its content hash for demo inspection.

Done when: a changed status, evidence hash, execution ID, or timestamp fails signature verification, and an unknown/revoked key is rejected.

### Priority 5 — Fix status and timeout semantics

Risk: the current frontend accepts only `passed`/`failed`, while a real service may be queued, running, timed out, or unavailable.

Mitigation:

- Define one explicit status contract: `queued`, `running`, `passed`, `failed`, `rejected`, `timed_out`, and `unavailable`.
- Treat only a signed `passed` result as technically verified.
- Treat every other status as non-approval and prevent reputation updates.
- Give each job a deadline and return the same status for repeated reads of the same execution ID.
- Do not automatically retry a timed-out job under a new ID without recording the relationship between attempts.

Done when: the UI clearly distinguishes successful verification from unavailable or incomplete execution and no non-final status can trigger reputation or payout flow.

### Priority 6 — Separate oracle evidence from human and escrow decisions

Risk: a presentation may imply that the oracle itself authorizes payout or proves the entire vulnerability claim.

Mitigation:

- Keep the oracle result limited to technical execution evidence.
- Keep scope, ownership, duplicate-report, and severity decisions explicit in the application workflow.
- Keep `TrustBountyEscrow.releaseEscrow` company-authorized and receipt-gated.
- Display separate states for technical verification, reputation update, escrow funding, and escrow release.
- In the demo, show separate transaction hashes and explain that blockchain confirms state transitions, not vulnerability validity.

Done when: an oracle `passed` result cannot directly submit an escrow release transaction and the UI does not describe it as automatic payout authorization.

### Priority 7 — Protect sensitive submission data

Risk: reproduction steps may contain credentials, private URLs, or confidential exploit details.

Mitigation:

- Reject obvious secret-bearing fields and limit accepted evidence to the demo target.
- Avoid logging raw reproduction steps in API, worker, or browser logs.
- Store only the evidence hash and the minimum result data needed for the demo.
- Use HTTPS between browser, gateway, and verifier.
- Make the demo fixture synthetic and avoid real customer systems.

Done when: logs and displayed results do not expose the submitted secret-test values, and the demo can be run entirely against synthetic targets.

### Priority 8 — Make external-service failure explicit

Risk: the demo depends on a remote verifier that may be unavailable or misconfigured.

Mitigation:

- Add a verifier health/preflight check before starting the demo.
- Show `unavailable` or `misconfigured` rather than a simulated verification state.
- Keep the existing fail-closed behavior: no local keyword fallback and no reputation update on verifier failure.
- Record the endpoint, verifier version, execution ID, and response status in the demo evidence.

Done when: an unreachable verifier leaves the submission unverified and the operator can distinguish configuration failure from a failed reproduction.

## Minimal validation sequence

1. Submit the known demo reproduction and confirm an isolated execution ID.
2. Confirm the signed result matches the exact evidence hash.
3. Alter the result or evidence hash and confirm rejection.
4. Submit an invalid or disallowed reproduction and confirm it cannot escape the worker boundary.
5. Simulate timeout/unavailability and confirm no reputation update occurs.
6. Confirm a successful oracle result still requires the existing separate company-authorized escrow release transaction.

## Deliberately deferred hardening

The demo does not need multi-region failover, complex queue infrastructure, automated key rotation, a general-purpose malware analysis platform, or automatic on-chain oracle callbacks. Those can remain outside scope unless the system moves beyond the presentation/demo target.
