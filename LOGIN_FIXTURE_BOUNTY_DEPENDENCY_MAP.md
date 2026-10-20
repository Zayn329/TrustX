# Login Fixture Bounty Dependency Map

## Goal

Allow a human to create a bounty through the normal UI and explicitly choose the pinned login target, so later report verification routes to the real login oracle instead of the settlement fixture.

## Dependency chain

```text
Create Bounty form
  -> selected target ID
  -> Bounty.oracleTargetId
  -> Firestore bounties document
  -> loaded Bounty record
  -> Report.bountyId
  -> verifySubmission()
  -> runSandboxEvaluation({ targetId })
  -> oracle/server.cjs target allowlist
  -> oracle/worker.cjs
  -> login_fixture.py
  -> signed target-aware result
  -> Explorer technical result
```

## Current state before this change

| Area | Current behavior | Dependency gap |
|---|---|---|
| Domain model | `Bounty.oracleTargetId` already exists | No user-facing way to set it |
| Firestore | Reads and writes `oracleTargetId` | Works only when the field is supplied |
| Create Bounty form | Creates normal bounty fields | Does not expose target selection |
| Report submission | Associates a report with a selected bounty | Cannot select an oracle target independently |
| Verification | Reads `report.bountyId` then uses `bounty.oracleTargetId` | Missing target falls back to settlement target |
| Login fixture | Implemented and allowlisted | Needs a bounty created with its target ID |
| Local mock data | Contains `bounty-102` and `rep-8802` | Firestore loading replaces these mocks |

## Implementation dependencies

1. Add a target selector to the Create Bounty form.
2. Store the selected target in the form state and submit it with the bounty.
3. Keep the target ID allowlisted rather than accepting arbitrary URLs or code.
4. Preserve an explicit “no target/manual” option for ordinary bounties.
5. Show the selected target on bounty details so the human can confirm it.
6. Keep report creation unchanged: the report inherits the target through its bounty.
7. Keep verification unchanged: it routes through the persisted bounty target.

## External dependencies

- Firestore must be configured and writable for a human-created bounty to persist.
- The oracle server must be running when oracle mode is enabled.
- Python must be available to the oracle worker for the login target.
- No new wallet, blockchain contract, RPC account, or AI account is required for target selection.

## Safety boundaries

- The selector may expose only pinned targets:
  - `trustx-settlement-v1`
  - `trustx-login-sqli-v1`
  - `trustx-login-sqli-fixed-v1`
- It must not accept arbitrary URLs, shell commands, uploaded code, or free-form target IDs.
- Escrow creation and release remain separate from target selection and oracle verification.

## Manual acceptance path

```text
Create Bounty
  -> choose TrustX Login SQLi Fixture
  -> save to Firestore
  -> open the new bounty
  -> submit a report with the allowlisted login reproduction
  -> open Explorer
  -> run oracle verification
  -> confirm target ID and runtime/AST evidence
```
