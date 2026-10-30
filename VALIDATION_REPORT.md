# HSF Knowledge Hub v1.9.0 — Automated Validation Scope

The build-time checks cover 400 structured editorial records, their per-card prompt contexts, public-safe design briefs, series mappings, governance version values, document and binary integrity. They **do not** establish publication approval, independent verification of climate or medical claims, live Netlify access controls, illustration export parity or illustrator compatibility. Consult GitHub Actions for current CI result after push.

# HSF Knowledge Hub v1.7.0 · Validation Report

**Release status:** Approved & Stable · **Validated / last updated:** 20 October 2026  
**Planning & Compiled by:** Saiful Islam

## Automated validation

| Check | Result |
|---|---|
| `python scripts/validate_hub.py` | PASS |
| `python scripts/validate_social_v4.py` | PASS |
| `python scripts/validate_idea_library.py` | PASS: 240 cards, unchanged IDs/source inventory, accessible tab metadata and redirects |
| `python brand-design-stack/07_Engine/validate_stack.py` | PASS (242/242 SVG files) |
| Unified source-generated HTML / KDI-PSC tabs and shared filtering logic | PASS structural; browser-level interactive QA pending |
| KDI bank inventory / IDs | PASS (120/120 ideas) |
| PSC bank inventory / IDs / editorial family distribution | PASS (120/120 ideas) |
| Public asset register / checksums | PASS (4 assets) |
| Removed historical master copies / active fixed-post tracker | PASS |
| Homepage and content catalogue local-link resolution | PASS |
| Cross-document case-study anchors and retired-pilot synchronization | PASS |
| ERP, MEAL and Netlify gate baseline preservation | PASS by release integrity checks |

## Conditions not yet certified

- Live Netlify deployment and end-to-end PIN/session behavior in production.
- Visual responsiveness and cross-browser/device screenshots.
- Adobe Illustrator 2022 review of representative production SVGs.
- Any individual statistical findings, beneficiary narratives, clinical advice, image permissions or public captions.

This is a stable **governance/documentation** release. Approval of idea banks does not approve publication of claims.

## 30 October 2026 · v1.8.2 internal integration addendum

HSF Design Studio source and rebuilds were integrated with the current Social Communication v4.0 taxonomy, Design Stack v3.1.0 tokens and governance metadata. The six master documents remain controlled. Additional check: `python scripts/validate_design_studio.py`; full deployed-browser testing, real SVG/MP4 export, native offline compatibility, Illustrator 2022 checks and verification of individual-publication approvals remain outstanding. No private ERP or participant material was intentionally added to the public source.
