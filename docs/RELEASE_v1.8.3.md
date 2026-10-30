# HSF Digital Knowledge Hub v1.8.3 — Institutional Alignment & Stabilization

**Release date:** 30 October 2026  
**Repository:** `SaifulIslamDS/hsfdigitalhub`  
**Classification:** Active internal, stabilized source release (not a release candidate)  
**Planning & Compiled by:** Saiful Islam

## Purpose

Reconcile controlled documents, the Programme Registry, the Social v4.0 policy control, the current KDI/PSC source inventory and automated validation while preserving the six canonical masters and existing design/security architecture.

## Changes

1. Aligned public references to **three currently approved Projects**: Education for Better Life (E4BL), Access to Primary Healthcare (A2PHC) and Climate Action & Resilience. Women and girls' empowerment is cross-cutting; the ERP Women Empowerment blueprint is optional and not an active fourth Project.
2. Kept the Digital Institutional System Contract **v1.0.0** and internal `CLIMATE_ACTION` canonical name **Climate Action**; documented **Climate Action & Resilience** as the public-facing full label in the existing Programme Registry, without changing the contract.
3. Updated the four relevant master documents to correct misleading current-Project examples while preserving the ERP future/optional scope and MEAL methods. Existing review date in unchanged masters is not automatically rewritten.
4. Synchronized Knowledge Hub release values to **v1.8.3**, including the Social v4.0 stable-control cross-reference; retained Social policy **v4.0** and Brand Identity **v2.4** without re-approving them.
5. Added `governance/CONTROLLED_DOCUMENT_REGISTER.json`, containing six master file checksums, source-declared status, role, and an explicit warning that independent management approval records are **not present in this public repository**. This register does **not** fabricate approval signatures or approval decisions.
6. Added `governance/RETIRED_ACTIVE_TREE_PATHS.json` listing six obsolete KDI/PSC research files to remove from `main`. They are absent from the supplied source ZIP but still require `git rm` when copying it over an existing checkout.
7. Added `scripts/validate_ssot_stability.py` to enforce source-of-truth and asset completeness rules. CI also runs Brand Design Stack's 242-SVG validator.
8. Archived historical RC-specific guides under `docs/archive/`. Prior Git history and normal historical release notes remain intact.

## Explicitly unchanged boundaries

- **300 ideas:** 160 KDI (134 editorial-approved, 26 proposed), 140 PSC (120 editorial-approved, 20 proposed). None is automatically an approved public post.
- **Two Social streams, seven editorial families, two E4BL editorial series**, editorial prompt generator and design-brief bridge.
- **Brand Stack v3.1.0** remains a production candidate pending Illustrator compatibility; Design Studio remains a drafting tool with incomplete export/browser QA.
- **ERP and MEAL operational records, Netlify security code and institutional Digital Contract** are not migrated or promoted.
- The repository is **public** even though the hosted site is PIN-gated; no restricted records belong here.

## Validation / remaining QA

Run:

```powershell
python scripts/build_idea_library.py
python scripts/validate_hub.py
python scripts/validate_social_v4.py
python scripts/validate_e4bl_series.py
python scripts/validate_shared_header.py
python scripts/validate_idea_library.py
python scripts/validate_content_prompt_generator.py
python scripts/validate_design_studio.py
python scripts/validate_ssot_stability.py
python brand-design-stack/07_Engine/validate_stack.py
```

**Not independently certified:** live Netlify security/session and commit-to-deploy testing; accessibility; complete Design Studio export/Illustrator compatibility; signed management approval records; forensic repository history scanning. These remain separate management/technical checks and are **not represented as passed** by the source release.

## Version handling

Continuous internal update. No routine RC required. The v1.8.3 tag is **optional**. If created, verify it does not already exist. Do not rewrite historical Git tags.
