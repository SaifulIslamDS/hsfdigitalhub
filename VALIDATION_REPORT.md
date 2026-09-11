# HSF Knowledge Hub — Alignment Validation Report

**Snapshot:** 11 September 2026  
**Stable content baseline:** Knowledge Hub v1.5.0 / Social v3.3 / Brand v2.3  
**Governance contract:** HSF Digital Institutional System Contract v1.0.0

## Result

**PASS — repository governance/version alignment checks.**

Validated locally:

- canonical stable versions in root manifest and live HTML;
- current programme/evidence/classification contract;
- Brand Design Stack metadata alignment to Social v3.3 / Brand v2.3;
- production-candidate status retained for Brand Stack v3.1.0;
- public asset register checksums for controlled XLSX/PDF assets;
- prohibited secret/private-key file-type guard;
- root packaging-residue check;
- lightweight local HTML reference scan;
- JSON parsing.

The HSF Digital System Contract file is byte-for-byte identical to the ERP mirror in the aligned repository package.

## Stable/candidate boundary

The supplied snapshot contained root metadata describing a proposed v1.6.0 / Social v4.0 repo-ready package, but the referenced `hsf_v160_release/` payload was not present. The metadata has been archived under `docs/archive/candidate-v1.6.0/` and is not treated as the live baseline.

## Known limitations / follow-up

- Runtime Tailwind CDN remains in the static HTML stack; this is documented technical debt. CSP is currently report-only to avoid breaking the existing runtime compiler, and should become enforced after CSS is localized/compiled.
- Brand Design Stack v3.1.0 still requires representative Adobe Illustrator 2022 QA before stable certification.
- GitHub branch protection, secret-scanning settings and repository license selection must be configured/approved outside the ZIP.
- This alignment does not promote Social Plan v4.0 or change the current stable social/brand policy versions.
