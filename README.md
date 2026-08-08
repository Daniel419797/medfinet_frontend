# Medfinet Frontend

Medfinet is a pre-production child-health continuity platform. This repository contains the browser interfaces for caregivers, health workers, administrators, merchants and auditors.

The frontend communicates with the Medfinet backend API and uses Supabase for authentication. PostgreSQL behind the backend remains the system of record; the browser is not treated as an authoritative clinical database.

## Current implementation

The active application includes:

- Supabase email/password authentication and password recovery
- organization-aware, role-scoped navigation
- child identity registration and lookup
- immunization, growth, alert, allergy and appointment workflows
- caregiver dashboards, notifications, rewards and privacy requests
- climate-response worklists, deliveries and referrals
- NFC credential provisioning, public tap validation and authenticated scanner flows
- encrypted browser queues for a bounded set of offline operations
- administration for memberships, facilities, programmes, governance, localization, integrations, devices and audit evidence

Implementation in this repository does not by itself establish clinical approval, production readiness, hardware compatibility or live-provider availability.

## Validation still required

Before a real-world pilot or production launch, Medfinet still requires:

- physical NTAG215 card and reader testing
- measured NFC and low-bandwidth performance
- USSD/SMS provider sandbox and production validation
- guided field-worker usability testing for offline workflows
- named FHIR/DHIS2 partner interoperability testing
- accessibility, browser and mobile-device testing
- security review, recovery exercises and deployment monitoring
- qualified clinical and language review of configured content

## Technology

- React 18 and TypeScript
- Vite
- React Router
- Tailwind CSS
- Supabase Auth
- LocalForage and Web Crypto for encrypted offline queues
- Algorand tooling for supported wallet/evidence interfaces
- Vitest and Testing Library

## Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Set the public browser configuration:

```env
VITE_MEDFINET_API_URL=http://localhost:5000/api/v1
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

`VITE_MEDFINET_API_URL` is the API variable used by the application. Do not use `VITE_API_BASE_URL`.

Never place service-role keys, NFC provisioning secrets, private wallet keys or other server credentials in a Vite environment variable. Every `VITE_` value is available to browser code.

## Authentication model

Supabase owns browser session persistence and token refresh. Medfinet API requests obtain the current access token from the active Supabase session and attach it as a bearer token.

The application does not maintain a second custom copy of access or refresh tokens in separate local-storage keys. The selected organization ID is stored locally as a non-secret user preference.

## NFC and offline behaviour

The NFC application shell and static assets can be cached for later loading. Authoritative card verification and clinical record retrieval currently require connectivity to the Medfinet backend.

Selected field operations can be queued locally using AES-GCM encryption with a non-exportable browser key and submitted idempotently when connectivity returns. This protects stored queue contents against casual inspection, but it does not make a compromised browser or device trustworthy.

## Commands

```bash
npm install
npm run dev
npm run typecheck
npm run lint
npm test
npm run build
npm run check
```

`npm run check` runs type-checking, linting, tests and the production build. The same command runs in GitHub Actions for pull requests and pushes to `main`.

## Deployment

The repository currently reports successful Vercel deployment checks. Deployment configuration must provide the three required public environment variables listed above and must route SPA paths back to `index.html`.

A successful build or deployment does not constitute production or clinical sign-off.

## License

No open-source license is currently included. The repository should be treated as proprietary unless a license is added by the owner.
