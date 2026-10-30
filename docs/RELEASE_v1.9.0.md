# HSF Digital Knowledge Hub v1.9.0 — 400-Idea Knowledge Library Expansion

**Date:** 30 October 2026  
**Status:** Internal source release, automated checks required before Git push  
**Planning & Compiled by:** Saiful Islam

## Changes

1. Promoted the previous 46 proposals (KDI-135..160; PSC-121..140) to **editorial-planning-approved**, recording the original proposal statuses and user instruction in `governance/EDITORIAL_APPROVAL_TRANSITION_v1.9.0.json`. This does not verify sources or approve any post.
2. Added 100 new **proposed** KDI research questions as `KDI-161..260` (CAR 45, E4BL 30, A2PHC 25). Each includes a narrow research question, response lens, source leads, review requirements and suggested format.
3. Added `communication/research/KDI_161-260_UNIQUENESS_REVIEW.json` and its explanatory scope note. Nearest existing topics are recorded for transparent editorial review; exact uniqueness across all future interpretations cannot be guaranteed.
4. Maintained 140 PSC records and all original 254 pre-existing editorial approvals, unchanged as records. New totals: **400 ideas = 300 editorial-approved for planning + 100 proposed; 260 KDI + 140 PSC.**
5. Regenerated the one-page idea library from controlled JSON with **400 cards, 400 professional AI prompt triggers and 400 public-safe design briefs**. Conditional filters, deep links and existing two-stream/seven-family architecture remain.
6. Expanded the optional **Learn with E4BL** series mapping by 30 KDI learning ideas; total series mappings now 64 (19 PSC + 45 KDI). No new top-level stream/family.
7. Updated matching editable Excel inventories, Social v4.0 inventory references, homepage, README, manifest, public asset register, document register, source-of-truth matrix, controlled Social record and release/validation scripts.
8. Added archival paths for the old KDI-160 JSON and workbook. **These two tracked files must be removed from an existing Git checkout after copying the new ZIP.**

## Explicitly unchanged

- Social Communication policy v4.0 (approved framework), Brand Identity & Design System v2.4, Brand Design Stack v3.1.0 production-candidate status and Digital System Contract v1.0.0.
- Public repository remains public, no restricted ERP, learner, patient, HR, consent or donor records.
- Netlify PIN edge functions, redirect rules and security configuration preserved byte-for-byte.
- Every editorial idea, new or old, requires factual and safeguarding verification and HSF management approval of its exact publication output.

## Validations

```bash
python scripts/build_idea_library.py
python scripts/validate_hub.py
python scripts/validate_new_kdi_ideas.py
python scripts/validate_social_v4.py
python scripts/validate_idea_library.py
python scripts/validate_content_prompt_generator.py
python scripts/validate_e4bl_series.py
python scripts/validate_design_studio.py
python scripts/validate_shared_header.py
python scripts/validate_ssot_stability.py
python brand-design-stack/07_Engine/validate_stack.py
```

Source validation does not certify the live Netlify deployment, actual photo consent, published source claims, every export format or Illustrator compatibility.

**Install and update:** `docs/INSTALL_FULL_REPOSITORY_v1.9.0.md`.
