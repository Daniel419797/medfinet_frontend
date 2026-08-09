# Open-source Release Checklist

Use this checklist before publishing the first tagged Medfinet Frontend release and for material public releases afterward.

## Legal and repository health

- [ ] `LICENSE`, `NOTICE`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md` and `GOVERNANCE.md` are present and current.
- [ ] All bundled code, fonts, images, icons and sample data have compatible licences and required attribution.
- [ ] Repository description, topics and project links are current.
- [ ] Branch protection and required checks are enabled for `main`.
- [ ] GitHub private vulnerability reporting is enabled where available.

## Privacy and security

- [ ] Git history and the current tree have been scanned for secrets, credentials and private keys.
- [ ] No real child, caregiver, facility or partner data is present in source, tests, screenshots or examples.
- [ ] Browser configuration contains public values only.
- [ ] Dependency audit results have been reviewed and high/critical findings resolved or explicitly documented.
- [ ] Authentication, role boundaries, organization isolation, offline storage and wallet flows have received focused review.

## Quality

- [ ] `npm ci` succeeds from a clean checkout.
- [ ] `npm run check` passes.
- [ ] The production build deploys successfully.
- [ ] Public routes work without authentication and protected routes fail safely.
- [ ] Accessibility, responsive layout and supported browsers have been checked.
- [ ] TestNet wallet connection and signing flows have been validated without real funds.

## Documentation and claims

- [ ] Setup instructions work from a clean environment.
- [ ] All required environment variables are documented in `.env.example` and the README.
- [ ] Known limitations and unvalidated integrations are stated clearly.
- [ ] No clinical, regulatory, interoperability, security or performance claim exceeds available evidence.
- [ ] Release notes distinguish implemented features from pilot or production readiness.

## Release

- [ ] Version and changelog are updated.
- [ ] The release commit is reviewed and signed/tagged according to maintainer policy.
- [ ] A GitHub release is created with migration notes, limitations and verification commands.
- [ ] Deployment monitoring and rollback steps are ready.
