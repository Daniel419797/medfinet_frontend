# Security Policy

## Supported versions

Security fixes are developed for the latest code on `main`. Previews, forks, old commits and third-party deployments may not receive coordinated fixes.

## Reporting a vulnerability

Do **not** open a public issue for a suspected vulnerability.

Use GitHub's private **Report a vulnerability** option when it is available for this repository. Otherwise email **danieladedayooluwole@gmail.com** with the subject `Medfinet frontend security report`.

Include, where possible:

- affected page, component and commit or deployment;
- clear reproduction steps using synthetic data;
- expected and observed behaviour;
- realistic impact and required attacker access;
- browser/device information;
- a minimal proof of concept that does not expose real users or production secrets.

Please do not access, modify, download or disclose data that does not belong to you. Do not perform denial-of-service testing against public deployments.

## Security boundaries

Reports are especially relevant when they affect:

- authentication or session handling;
- role and organization isolation;
- exposure of child or caregiver information;
- offline queue encryption and local storage;
- NFC validation and provisioning interfaces;
- wallet connection, network selection or transaction signing;
- unsafe rendering, injection or cross-site request behaviour;
- accidental inclusion of server credentials in browser bundles.

## Response process

The maintainers will acknowledge a complete report as soon as reasonably possible, investigate it privately, coordinate a fix and credit the reporter when requested and appropriate. Timelines depend on severity, reproducibility and maintainer availability.

This project currently operates without a paid bug-bounty programme. Good-faith research that follows this policy is welcome.

## Security invariants

Contributions must preserve these properties:

- authorization is enforced by the backend and never trusted solely to hidden frontend controls;
- one organization must not be able to read or mutate another organization's data;
- real clinical records and secrets must never be committed or used in tests;
- every `VITE_` value is treated as public;
- signing requests must clearly identify the selected blockchain network and require explicit wallet approval;
- security and privacy failures should fail closed and remain visible to the user.
