# HSF Digital Knowledge Hub: Audit & v4 Candidate Impact Report

**Audit / preparation date:** 2026-10-20  
**Repository:** `SaifulIslamDS/hsfdigitalhub`  
**Source:** uploaded `hsfdigitalhub-main(2).zip`, 480 ZIP entries; comparison of five key GitHub main-branch source blob SHA-1 hashes (README, MANIFEST, canonical social, canonical brand, validator) showed an exact match at audit.  
**GitHub head observed:** `4205c12118a8511b6f3a9e293184ba35612679a9`, 12 September 2026.  
**Pre-update validation:** PASS: `python scripts/validate_hub.py`.

## Current baseline findings

- Current stable governance is **Hub v1.5.0 / Social v3.3 / Brand v2.3**, not the historical v1.4 baseline.
- Brand Design Stack **v3.1.0** is an explicitly uncertified production candidate, particularly for Illustrator 2022.
- Repository is **PUBLIC**; PIN/noindex on the deployed Knowledge Hub does not restrict GitHub source visibility. Never add identifiable personal, clinical, payroll or safeguarding records.
- Current canonical social page specifies compulsory 48-day post cycle; this is the principal v4 conflict.
- Institutional contract, Approved Information Standard and MEAL/public-publication boundaries are already strong and should be protected.
- An older v1.6 / Social v4 packaging proposal is archived as **incomplete historical metadata only**; it was not a working canonical implementation.
- Known unrelated technical debt: runtime Tailwind CDN and report-only CSP; maintain as separate security hardening project rather than causing a risky untested v4 authentication change.

## Scope of implemented solution

- Independent Social v4.0 candidate HTML, not a deceptive rename of v3.3.
- 120 editable topic inventory copied exactly and indexed via a read-only JSON catalog/search page; all research findings marked NOT VERIFIED and NOT APPROVED.
- Original candidate had a heritage map, now **removed from the active v4 ecosystem** after the user retired the pilot. Historical stable policy documents remain unchanged.
- Seven production families, four mandatory field storytelling capabilities, cross-cutting taxonomy and two recognizable editorial streams.
- Content approval and public-safe register schemas with separate evidence/publication statuses.
- Brand mapping document referencing, not overwriting, v2.3; retained v3.1.0 production-candidate status.
- Controlled candidate manifest, document-control note, migration checklist, index navigation and CI validation.

## Risk and disposition

| Area | Risk / observation | Treatment |
|---|---|---|
| Claim authenticity | Idea approval mistaken for a verified finding | Explicit idea-only and public publication gates, no numerical findings entered |
| 48-post institutional history | Old P01–P48 could be overwritten | Stable source frozen, checksum validation; no active legacy map |
| Child/patient image privacy | Field cases can identify vulnerable people | Blank-only public templates, safeguarding escalation, no populated cases in repo |
| Brand version drift | Current brand guide describes v3.3 dual streams | Brand v2.3 retained unchanged; v4 production mapping separate |
| CI contract drift | Existing validator locks v1.5.0/v3.3 | Extend CI with v4 candidate test; don't falsify stable release |
| Public source distribution | ZIP/public repo gives access to every file | Research metadata only; no personal records in new files |
| Old v1.6 metadata | May be confused with v4 candidate | Retain in archive; new full payload with distinct candidate status |
| Security hardening | Runtime Tailwind CDN / report-only CSP persists | Record technical debt; no security changes in editorial upgrade |

## Limits of assessment

This is a structural/content audit of the uploaded code, with key-file parity checks against live GitHub. It is **not** a full browser, deployment, security penetration, live source URL, clinical research or Illustrator compatibility certification. The candidate is not asserted as deployed. No GitHub push or merge is represented by this ZIP deliverable.

### Second idea bank revision (20 October 2026)
The v4 candidate now includes a separate **PSC 120-idea draft bank** in addition to approved KDI 120 research ideas. The P01–P48 legacy archive map and active cycle tracker were retired from the v4 ecosystem. The historical Social v3.3 source remains unmodified pending v4 approval.
