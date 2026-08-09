# Contributing to Medfinet Frontend

Thank you for helping improve Medfinet. Contributions from developers, designers, health-technology practitioners, accessibility reviewers, translators and documentation writers are welcome.

## Project status and safety

Medfinet is pre-production software. It is not a medical device, clinical decision system or substitute for qualified medical judgement. Do not use real patient records, identifiable child data, production credentials or private wallet keys in development, tests, screenshots, issues or pull requests.

## Before opening a change

- Search existing issues and pull requests.
- Open an issue first for large features, schema/API changes, security-sensitive work, clinical workflows or user-facing claims.
- Use public, synthetic or de-identified test data only.
- Report vulnerabilities privately according to [SECURITY.md](./SECURITY.md).

## Local setup

Use a currently supported Node.js LTS release.

```bash
git clone https://github.com/Daniel419797/medfinet_frontend.git
cd medfinet_frontend
npm ci
cp .env.example .env
npm run dev
```

Only public browser configuration belongs in `.env`. Never add service-role keys, database credentials, NFC provisioning secrets, private wallet material or other server secrets to a `VITE_` variable.

## Development workflow

1. Fork the repository and create a focused branch from `main`.
2. Keep changes small and avoid unrelated refactors.
3. Add or update tests for behaviour changes.
4. Preserve accessibility, responsive layouts and role-based authorization boundaries.
5. Update documentation when configuration, user flows or limitations change.
6. Run the project checks before submitting:

```bash
npm run check
```

## Pull requests

A pull request should explain:

- the problem and why the change is needed;
- the implementation and affected surfaces;
- security, privacy, accessibility and clinical-safety considerations;
- tests performed and any validation that remains;
- screenshots for visual changes, using synthetic data only.

Maintainers may ask for a smaller scope, additional tests, evidence for public claims or review from domain specialists.

## Contribution licence

By intentionally submitting a contribution for inclusion in this project, you agree that it is provided under the Apache License 2.0 and confirm that you have the right to submit it. Do not contribute code, designs, data or assets whose licence is incompatible or unclear.

## Community standards

Participation is governed by [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md). Project decisions follow [GOVERNANCE.md](./GOVERNANCE.md).
