# HSF Digital Transformation Knowledge Hub | Release v1.7.1

**Date:** 26 October 2026  
**Status:** Source package prepared for HSF-controlled GitHub review and deployment  
**Social Communication Ecosystem:** v4.0 (unchanged policy)  
**Brand Identity & Design System:** v2.4 (unchanged visual policy)  
**Planning & Compiled by:** Saiful Islam

## Change purpose

Extend the unified Social Content Idea Library with **14 additional Knowledge, Data & Insight (KDI) editorial concepts** inspired by the user-provided *Road to Antalya COP31: People-Led Policy, Bangladesh Position @ COP31* civil-society booklet and its shared conversation context.

### Counts and provenance

- KDI: 120 original, unchanged records `KDI-001` to `KDI-120`, plus new `KDI-121` to `KDI-134` = **134**.
- PSC: original `PSC-001` to `PSC-120`, **unchanged**.
- Unified catalogue: **254** ideas across two streams, retaining `All / KDI / PSC` tabs, full-text search and programme/topic filters.
- The shared ChatGPT page exposes the user's COP31 prompt but not the original assistant's 14-item visual response. The new 14 titles and research angles are **editorial interpretations of the booklet's identifiable themes**, **not a verified verbatim transcript**.
- Source registry entry `S23` records this research provenance and reminds reviewers that the booklet is a civil-society position paper, not automatically the Government of Bangladesh's adopted COP31 policy or a UNFCCC negotiated decision.
- No statistical findings, numerical claims, outcome claims or publications were approved by this inclusion.

## Active files

- `communication/idea-library.html` (rebuilt with **254** static cards and shared filters).
- `communication/research/kdi_134_ideas.json` (canonical KDI data).
- `communication/research/HSF_Knowledge_Data_Insight_134_Idea_Bank_Editorial_Inventory.xlsx` (editable research register).
- `communication/research/psc_120_ideas.json` and its XLSX (unaltered).
- `communication/research/source_registry.json` (new research lead `S23`).
- Updated manifest and governance/public-asset registers, validators, cross-references and CHANGELOG.
- Prior 120 KDI JSON/XLSX are removed from the **active working tree** to prevent competing canonical sources. They remain recoverable from Git history and the prior v1.7.0 full package.

## Verification and approval boundary

The word *approved* applies only to acceptance into HSF's editorial **idea inventory**. Before any infographic or caption is published, the exact evidence must be retrieved, reported with survey/reporting period and page references, reviewed by appropriate programme/technical specialists, safeguarded, and approved for the exact public design.

## Local QA

```bash
python scripts/build_idea_library.py
python scripts/validate_idea_library.py
python scripts/validate_social_v4.py
python scripts/validate_hub.py
python brand-design-stack/07_Engine/validate_stack.py
```

Perform Chrome/Firefox mobile and desktop checks, tab/filter searches, safe links and Netlify access-gate regression before production deployment.

## GitHub release handling

The GitHub branch/tag `v1.7.0` is an existing published baseline. Do not force-move it. Commit this proposed update as the next controlled version **v1.7.1**, then create a *new* v1.7.1 tag only after review. This full ZIP is a source snapshot, not a commit or a published Netlify deploy. If replacing a local checkout, carry out deletions of superseded KDI names explicitly, preserve `.git` and inspect `git diff` before committing.
