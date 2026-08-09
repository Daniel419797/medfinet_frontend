# Medfinet frontend-to-backend coverage

This matrix is the source-of-truth checklist for the production frontend. A row is complete only when the screen is reachable by the stated role, uses the canonical `/api/v1` service, exposes every supported user action, and has loading, empty, error, retry, success, and authorization behavior appropriate to the workflow.

Legacy demonstration files that are not imported by `src/main.tsx`, `src/App.tsx`, or `src/NfcApp.tsx` are not production routes and must not be used as evidence of implemented behavior.

## Public and authentication

| Surface                 | Route                                 | Backend contract                         | Actions                                                                   |
| ----------------------- | ------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------- |
| Product entry           | `/`                                   | None                                     | Sign in, create account, capability navigation                            |
| Sign in                 | `/login`                              | Supabase Auth, `GET /me/organizations`   | Password sign-in, recovery link, role-aware redirect                      |
| Registration            | `/register`                           | Supabase Auth                            | Identity registration and email-confirmation state; no self-assigned role |
| Password recovery/reset | `/forgot-password`, `/reset-password` | Supabase Auth                            | Recovery email and secure password replacement                            |
| Organization onboarding | `/onboarding`                         | `POST /organizations`                    | Owner organization creation and seeded operational templates              |
| NFC public tap          | `/nfc/tap/:publicId`                  | `POST /public/nfc/taps/:publicId/verify` | Privacy-safe recognition only; no child or clinical disclosure            |

## Caregiver

| Surface                          | Route                      | Backend contract                                                                 | Actions                                                                                 |
| -------------------------------- | -------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Household dashboard              | `/dashboard`               | `GET /children`, `/appointments`, `/facilities`, `/notifications`                | View linked children, facilities, messages; confirm or request another appointment date |
| Child profiles                   | `/profiles`                | `GET /children`                                                                  | Browse linked children and open the minimum-necessary record                            |
| Vaccination history              | `/vaccination-history/:id` | `GET /children/:id/clinical-timeline`                                            | View consent-controlled timeline for a linked child                                     |
| Rewards wallet                   | `/rewards`                 | `GET /me/reward-account`, `/merchants`, `POST /reward-accounts/:id/reservations` | View balance/activity and generate a 5-30 minute merchant-bound redemption code         |
| Privacy rights                   | `/privacy`                 | `GET /me/caregiver`, `GET/POST /governance/data-subject-requests`                | Submit and track self/authorized-child privacy requests                                 |
| Inbox                            | `/notifications`           | `GET /notifications`, `POST /notifications/:id/read`                             | Read messages and mark individual messages read                                         |
| Account and delivery preferences | `/account` (`/profile` redirects) | `GET/PUT /notification-preferences`                                        | View identity/role/scope; configure category/channel/language/timezone/quiet hours      |

Caregiver child, appointment, timeline, reward-account, and privacy queries are filtered by the authenticated caregiver subject on the server. Navigation hiding is not the security boundary.

## Health and response workers

| Surface                | Route                                                      | Backend contract                                   | Actions                                                                                                 |
| ---------------------- | ---------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Worker overview        | `/health-worker/dashboard`                                 | Child, appointment, worklist, notification queries | Operational counts and live workflow links                                                              |
| Clinical operations    | `/health-worker/clinical`                                  | Child search and all clinical lifecycle endpoints  | Immunization, growth, alerts, allergies, appointments, amendments and status transitions                |
| NFC scanner            | `/health-worker/nfc`, `/nfc/scanner`                       | NFC challenge/resolve endpoints                    | Web NFC/manual development read, registered-device attestation, online resolution and bounded encrypted offline snapshots |
| NFC child workflows    | `/health-worker/nfc/children/:id/*`, `/nfc/children/:id/*` | Clinical, vaccination, emergency endpoints         | Minimum-necessary record, vaccination recording and emergency workflow                                  |
| Climate response       | `/health-worker/climate`                                   | Worklist, delivery and referral endpoints          | Serve entries, create referrals and progress response work                                              |
| Encrypted offline sync | `/health-worker/offline`, `/nfc/offline`                   | Device and sync-batch endpoints                    | Select the local approved device, encrypt local queue, automatically submit idempotently on reconnect, inspect conflicts/status |

## Organization administration

| Surface                | Route                          | Backend contract                                                              | Actions                                                                                                            |
| ---------------------- | ------------------------------ | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Operational overview   | `/admin/dashboard`             | Bounded operational queries                                                   | Cross-module live counts and navigation                                                                            |
| Team and scopes        | `/admin/users`                 | Membership and resource-scope endpoints                                       | Add/update roles, status, global/scoped facilities/programmes                                                      |
| Organization lifecycle | `/admin/organization`          | `PATCH /organization/status`                                                  | Owner-only MFA-gated suspend/restore with reason                                                                   |
| Caregivers             | `/admin/caregivers`            | Caregiver create/list/link endpoints                                          | Create caregiver portal identity and link to children with authority flags                                         |
| Identity integrity     | `/admin/identity-integrity`    | Amendments and identifiers                                                    | Request/review corrections; create, verify and revoke identifiers                                                  |
| Facilities/programmes  | `/admin/resources`             | Facility and programme endpoints                                              | Create, edit, archive and restore operational resources                                                            |
| Clinical records       | `/admin/clinical`              | Clinical lifecycle endpoints                                                  | Authorized clinical operations                                                                                     |
| Vaccine schedules      | `/admin/schedules`             | Vaccine schedule rule endpoints                                               | Draft and maker-checker activate versioned schedules                                                               |
| Analytics              | `/admin/analytics`             | Analytics policy/run/latest endpoints                                         | Configure disclosure, queue aggregate generation, view suppression-aware results                                   |
| FHIR/DHIS2             | `/admin/api`                   | Integration connections, mappings, jobs, imports and reconciliation endpoints | Full managed connection lifecycle, review/apply imports, jobs, cancellations and persisted reconciliation evidence |
| USSD                   | `/admin/ussd`                  | USSD access, directory, consent and queue endpoints                           | Configure verified access, publish facility directory, create consent request, review all ten workflow queues      |
| NFC provisioning       | `/admin/nfc`, `/nfc/provision` | NFC binding lifecycle endpoints                                               | Create, prepare, activate, cancel, revoke and replace NTAG215 bindings; view lifecycle/summary                     |
| Trusted devices        | `/admin/devices`               | Device endpoints                                                              | View, revoke and approve NFC provisioning capability                                                               |
| Safety/consent         | `/admin/safety`                | Consent, emergency access and credential endpoints                            | Consent grants/withdrawals, emergency review, credential revocation                                                |
| Climate administration | `/admin/climate`               | Climate events, areas and worklists                                           | Event lifecycle, generation, authorization, delivery/referral oversight                                            |
| Rewards/merchants      | `/admin/rewards`               | Reward campaign, merchant, redemption and settlement endpoints                | Campaign lifecycle, grants, merchant approval/membership, reversals and settlements                                |
| Notifications          | `/admin/notifications`         | Template endpoints                                                            | Draft and maker-checker activate channel/locale templates                                                          |
| Governance             | `/admin/governance`            | Audit, retention, legal-hold and subject-request endpoints                    | Full controlled governance lifecycle with reasons and MFA gates                                                    |
| Blockchain evidence    | `/admin/blockchain`            | Anchor and health endpoints                                                   | Inspect receipts and verify deterministic integrity                                                                |
| Localization           | `/admin/localization`          | Localization catalog endpoints                                                | Draft and maker-checker activate English/Hausa/Yoruba/Igbo content                                                 |

## Specialist roles

| Role     | Route       | Backend contract                                                  | Actions                                                                                                             |
| -------- | ----------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Merchant | `/merchant` | `GET /me/merchants`, redemption and merchant-settlement endpoints | Role-scoped merchant selection, one-time redemption and settlement creation/history                                 |
| Auditor  | `/audit`    | Read-only analytics, integration and governance endpoints         | Inspect audit events, aggregate metrics, connections/jobs/reconciliation, retention and holds; no mutation controls |

## Verification gates

- `npm run lint`
- `npx tsc -b --pretty false`
- `npm test`
- `npm run build`
- Backend `npm run check` and `npm test`
- Fresh and legacy PostgreSQL migration verification
- Authenticated browser smoke tests for every role and high-risk modal
- Responsive checks at 390 px, tablet, and desktop widths
- Keyboard, focus, label, dialog, contrast, and reduced-motion checks
- Deployment health checks for frontend `/`, backend `/health`, and backend `/ready`

Browser and deployment checks are independent gates. A successful TypeScript or production build does not prove rendered interaction, provider configuration, database state, or a live deployment.

## Dependency security status

The production import graph reaches 84 source files and six direct runtime packages: Supabase, localforage, Lucide React, React, React DOM, and React Router DOM. Legacy wallet, Stripe, mapping, QR, and demo-only packages remain development dependencies and are not installed by `npm ci --omit=dev`.

As of 2 August 2026, the latest published `react-router-dom` is 7.18.2. `npm audit --omit=dev` reports the RSC-only advisory `GHSA-qwww-vcr4-c8h2` and recommends 8.3.0, but that version is not published (npm returns `E404`). Medfinet uses declarative browser routing and exposes no React Router RSC actions, so the affected server-action path is absent. This exception must be removed as soon as a patched release is published; lint, TypeScript, tests, and the production build must be rerun after that upgrade.
