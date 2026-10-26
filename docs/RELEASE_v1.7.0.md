# HSF Digital Transformation Knowledge Hub · Release v1.7.0

**Date:** 20 October 2026  
**Release scope:** Unified Social Content Idea Library (UI and navigation update)  
**Social communication policy:** v4.0, approved; unchanged  
**Brand identity:** v2.4, unchanged  
**Planning & Compiled by:** Saiful Islam

## Changes

- Established one canonical idea-browsing page: [`communication/idea-library.html`](../communication/idea-library.html).
- Combined navigation for 120 KDI and 120 PSC concepts with accessible **All (240) / KDI (120) / PSC (120)** tabs.
- Added unified full-text search, programme filtering, context-sensitive topic/content-family filter, counts and reset.
- Preserved immutable idea IDs (`KDI-001...120`, `PSC-001...120`) and original JSON/XLSX source inventories without editing their records.
- Kept existing bank page URLs as lightweight redirects to tabs; they no longer duplicate content.
- Updated index, Social Plan links, Brand Guide links, README, communication README, manifest, release metadata and CI checks.
- No new factual/statistical/publication approval: editorial approval is distinct from verification, technical review, safeguarding and publication approval.
- No changes to ERP records, MEAL definitions, security controls, brand tokens, access infrastructure or design stack.

## Reproducibility and QA

```bash
python scripts/build_idea_library.py
python scripts/validate_idea_library.py
python scripts/validate_social_v4.py
python scripts/validate_hub.py
```

The unified page is static and remains usable when opened offline, including its 240 cards (JavaScript only enhances filtering). Check Chrome/Edge/Firefox mobile and desktop layouts before deployment. The repository remains PIN-gated for controlled institutional review; this page is not a public social publishing application.

## Important existing Git tag discrepancy

At review time on 20 October 2026, the `v1.7.0` tag already existed on GitHub but the tag's `MANIFEST.json` still stated `v1.6.0`. This ZIP is a newly generated **v1.7.0 source package**; packaging does not automatically rewrite the existing remote tag or deploy the code. Preserve the historical tag until HSF decides on a controlled reconciliation. Do not forcibly move a published tag without documented owner approval.

## Deployment

Use [`INSTALL_FULL_REPOSITORY_v1.7.0.md`](INSTALL_FULL_REPOSITORY_v1.7.0.md) and preserve Git history. A production deploy requires an authorized Git merge and Netlify release, not just extraction of this ZIP.
