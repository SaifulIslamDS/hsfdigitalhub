# Security Policy — HSF Knowledge Hub

## Public repository

This repository is intentionally public. Do not use GitHub visibility or the deployed preview PIN as a confidentiality control.

If you discover a committed secret, restricted operational record, patient/learner personal data or another serious disclosure, treat it as exposed and notify the HSF repository owner/management through an appropriate private organizational channel. Do not post sensitive reproduction details in a public issue.

## Scope

The Knowledge Hub contains public-safe governance, documentation and communication/brand assets. It must not contain the protected operational records that belong in HSF ERP or other authorized operational systems.

## Current hardening note

Some static HTML pages use the Tailwind CDN at runtime. This remains documented technical debt. The repository does not claim full OWASP ASVS conformance. A future hardening release should compile/localize required CSS, then tighten Content Security Policy without `unsafe-inline`/runtime CDN dependencies where practical.

See:

- `governance/PUBLIC_REPOSITORY_POLICY.md`
- `governance/EXTERNAL_STANDARDS.md`
