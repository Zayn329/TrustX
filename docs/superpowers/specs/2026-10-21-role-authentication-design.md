# TrustX Role Authentication Design

## Goal

Replace the unauthenticated, perspective-toggle demo shell with Firebase-backed sign-in and two protected workspaces: Company and Bug Reporter. Registration is explicitly out of scope; accounts and privileged company roles are provisioned outside the browser.

## Existing-State Findings

- Firebase is initialized only for Firestore; Firebase Authentication is not used.
- No deployable Firestore rules currently exist.
- `TrustContext` loads all reports and falls back to local mock data, so neither data visibility nor mutations are authoritative today.
- The current bounties screen exposes a client-side Company/Researcher perspective switch, and report/evidence actions are reachable from general views.
- The oracle produces signed verification evidence. An oracle result is evidence and must not be treated as an automatic acceptance or payout.

## Scope

### Included

- Email/password sign-in, password reset, session restoration/loading, role-aware logout, error handling, and accessible password visibility controls.
- A role selector on the sign-in page which routes the user only after the authenticated token's server-issued role agrees with the selected experience.
- Firebase custom claims (`company` or `researcher`) as the authorization source of truth, plus a private user profile document created by a trusted Admin/Functions process.
- Firestore rules and Functions source/configuration for server-only role/profile provisioning and authorized report review actions.
- Role-specific navigation, dashboards, program/report lists, settings/profile views, and protected view routing.
- Ownership-aware Firestore reads/writes for bounties and reports, with company/report identifiers duplicated where required for safe queries.
- Display of the existing signed oracle evidence on the authorized report detail view.

### Excluded

- Self-service sign-up, role-changing, or company onboarding in the browser.
- Changing the existing cryptographic proof, oracle signing algorithm, or blockchain contract protocol.
- Treating an oracle pass as a vulnerability acceptance, automated reward release, or a security guarantee.

## Security Architecture

Firebase Authentication provides the session. A trusted Firebase Admin/Functions process sets custom claims and creates `users/{uid}` profiles. The client reads claims with a forced token refresh after sign-in and never writes its own role. The sign-in role choice is an experience expectation only: a mismatch produces an error and signs the user out rather than changing access.

Company accounts must be provisioned through an Admin/Functions workflow before use. The role-provisioning function is not exposed as a public browser registration route. Researcher accounts are likewise pre-provisioned in this sign-in-only release.

Firestore rules enforce claim checks and ownership independently of UI routing:

- `users/{uid}`: each user can read only their own profile; ordinary clients cannot write role or ownership fields.
- `bounties/{bountyId}`: authenticated users can read active programs; only the company claim holder whose UID matches immutable `companyId` can create or update its program.
- `reports/{reportId}`: a researcher can create a report only with `researcherId == request.auth.uid` and a `companyId` derived from the referenced bounty; a report is readable only by that researcher or its company. The rules preserve immutable owner and program identifiers.
- `verifications/{reportId}` and evidence records: readable only by the report researcher or owning company; ordinary clients cannot forge/update outcomes.

The report schema gains `companyId`, `status` (`submitted`, `needs_info`, `accepted`, `rejected`), company response fields, and an oracle-evidence reference. Bounty ownership uses `companyId` rather than a display-name ID. Existing visual labels may retain "organization" naming where they are public presentation fields.

## Server Operations

A Firebase Functions module contains trusted operations:

- `provisionUser` is Admin-only/operational tooling that assigns a role claim and profile; it is not called from the sign-in page.
- `reviewReport` validates the caller's `company` claim, confirms the report's `companyId` equals the caller UID, and then records accept/reject/request-information state plus the company response.
- `runReportVerification` performs the same ownership checks before invoking the existing oracle gateway and persists the signed response as evidence. Its result records the oracle execution outcome without changing the company acceptance decision or triggering escrow release.

The existing oracle endpoint retains its signed response format. The browser no longer gets a general-purpose verification action for arbitrary reports; authorized server code invokes the gateway. Gateway secrets stay in server configuration and are never exposed through Vite variables.

## Client Architecture

`AuthProvider` subscribes to Firebase auth state, resolves verified custom claims and the caller's profile, exposes a loading/authenticated/error state, and invokes Firebase logout. `RequireRole` prevents rendering a workspace until a token with an allowed role is present.

`App` renders the sign-in page while unauthenticated and mounts the existing Trust provider only after authentication. Hash navigation is retained but its allowed tabs are role-specific; an invalid or forbidden hash redirects to that role's overview. Direct hash edits therefore cannot render an unauthorized data view.

The new navigation models are:

- Company: Overview, Programs, Submissions, Verification evidence, Company settings.
- Bug Reporter: Overview, Discover programs, My submissions, Researcher settings/passport.

Reusable bounty, report, proof, and oracle components are retained where they do not expose the wrong role's data. The current perspective toggle is removed. The company dashboard lists only bounties and reports owned by the current company; the researcher dashboard lists all active programs and only that user's reports. Detail components receive authorization-scoped data rather than global report lists.

## User Experience

The sign-in page uses the established dark TrustX palette, typography, borders, and compact controls. It presents Company and Bug Reporter choices with clear descriptions, email/password inputs, show/hide password, inline validation, busy states, a non-enumerating reset-password confirmation, and helpful mismatch/permission errors. It has no sign-up affordance.

Company pages emphasize program status, incoming submissions, pending actions, verification evidence, and escrow status. Researcher pages emphasize program discovery, scoped report submission, report status/company feedback, signed verification evidence, and earned rewards. All report details state that oracle evidence is technical verification evidence rather than a guarantee or automatic payout.

## Testing and Verification

- Unit tests cover claim/profile resolution, role mismatch handling, protected tab routing, sign-out, reset validation, and role-specific UI actions.
- Firestore emulator rules tests cover ownership, cross-researcher report denial, cross-company program/report denial, immutable ownership fields, and verification write denial from clients.
- Existing oracle tests continue to validate signatures; new server-operation tests validate ownership before oracle invocation and preserve the separation of evidence, acceptance, and escrow.
- Production verification runs TypeScript/Vite build and the relevant Vitest suite. Functions/rules deployment configuration is validated locally where emulator credentials are available.

## Operational Requirements

Before users can sign in, an operator must enable Firebase Email/Password Authentication, deploy the rules and Functions, and provision users with the intended custom claim and profile. The UI must fail closed with a configuration/permission error if Firebase Auth is unavailable or a token has no supported role; it must never fall back to mock authentication or local role storage.
