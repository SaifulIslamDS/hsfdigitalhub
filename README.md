# HSF Digital Transformation Knowledge Hub

The **Human Safety Foundation (HSF) Digital Transformation Knowledge Hub** is HSF's controlled institutional knowledge layer for policies, frameworks, standards, MEAL, communication governance, brand governance, ERP documentation and approved institutional references.

## Current stable content baseline

- **Knowledge Hub release:** `v1.5.0` — 1 September 2026
- **Social Communication Plan:** `v3.3` — stable
- **Brand Identity & Design System:** `v2.3` — current
- **Brand Design Stack:** `v3.1.0` — production candidate; metadata aligned to Social v3.3 / Brand v2.3, with Adobe Illustrator 2022 production QA still required
- **HSF Digital Institutional System Contract:** `v1.0.0` — governance alignment baseline effective 11 September 2026

The repository previously contained root packaging metadata for a proposed `v1.6.0 / Social v4.0` upgrade, but the corresponding payload was not present in the uploaded repository snapshot. That packaging metadata is preserved under `docs/archive/candidate-v1.6.0/` for historical traceability and is **not** treated as the canonical live baseline.

## HSF digital architecture

HSF maintains three separate but connected layers:

1. **Operational ERP** — protected operational system of record for programme, finance, procurement, inventory, HR, payroll and sensitive records.
2. **Knowledge Hub** — policies, standards, frameworks, SOPs, ERP documentation, MEAL, communication and brand governance.
3. **Public Platform** — approved website content, reports, public statistics, stories and social communication.

Preferred information flow:

`ERP / Operational Dataset → Verification & MEAL → Approved Information → Reports / Website / Social Media`

Raw operational records must never be exposed directly to public systems.

## Canonical governance files

- `governance/HSF_DIGITAL_SYSTEM_CONTRACT.json`
- `governance/PROGRAMME_REGISTRY.md`
- `governance/SOURCE_OF_TRUTH_MATRIX.md`
- `governance/APPROVED_INFORMATION_STANDARD.md`
- `governance/PUBLIC_REPOSITORY_POLICY.md`
- `governance/EXTERNAL_STANDARDS.md`
- `governance/GITHUB_SETTINGS_CHECKLIST.md`
- `governance/PUBLIC_ASSET_REGISTER.json`
- `governance/DOCUMENT_CONTROL_STANDARD.md`

The HSF ERP repository mirrors the same contract version and must not independently redefine institutional concepts.

## Evidence discipline

HSF distinguishes:

`RAW → CLEANED → VERIFIED / CALCULATED / ESTIMATED / INFERRED`

These evidence states remain distinct from workflow approval. Calculated, estimated or inferred information must never be silently presented as verified operational evidence.

## Public repository rule

This repository is intentionally public. **Anything committed here must be treated as publicly accessible**, regardless of any PIN/no-index protection used by a deployed preview site.

Do not commit passwords, secrets, private keys, patient records, learner registers, safeguarding cases, payroll/HR personal data, restricted finance/banking data, donor personal data or other restricted operational exports.

## Validation

Run:

```bash
python scripts/validate_hub.py
```

GitHub Actions runs the same governance/version validation on pushes and pull requests to `main`.

## Release discipline

Published stable releases and historical snapshots are not silently rewritten. Material work after the current stable content baseline is recorded under `CHANGELOG.md` until a controlled release is approved.
