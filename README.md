> **Editorial boundary (30 October 2026):** Knowledge Hub v1.9.0 is the current internal source. The catalogue retains 300 editorial-approved ideas plus 100 proposed; no idea implies public-post approval.

# Human Safety Foundation | Digital Transformation Knowledge Hub

**Current internal version:** v1.9.0 · **Social Communication Ecosystem:** v4.0 · **Brand Identity & Design System:** v2.4  
**Package status:** Active internal source · **Last updated:** 30 October 2026  
**Planning & Compiled by:** Saiful Islam

This v1.9.0 internal source includes an [SSOT stabilization checklist](docs/RELEASE_v1.9.0.md), [controlled-document metadata register](governance/CONTROLLED_DOCUMENT_REGISTER.json) and [retired-file deletion manifest](governance/RETIRED_ACTIVE_TREE_PATHS.json). Approval evidence for master documents must be verified in HSF-controlled institutional records; repository metadata alone does not prove approval.

The HSF Knowledge Hub is the controlled institutional governance and knowledge reference for E4BL, A2PHC and Climate Action & Resilience, alongside ERP planning, MEAL, website, branding, policy and evidence governance. It is **not the operational ERP**.

The homepage and Social Communication master now share one logo/title navigation component in `assets/styles/hsf-shared-header.css` (shared header integrated); each retains its document-specific links and the Social page retains its off-canvas Contents menu.

## Six current canonical master documents (one copy each)

| Master document | Canonical file | Status |
|---|---|---|
| Institutional Digital Transformation | [digital_transformation_framework.html](digital_transformation_framework.html) | Stable reference; scope wording aligned 30 October 2026 |
| Social Communication Ecosystem v4.0 | [social_communication_plan.html](social_communication_plan.html) | Approved, stable |
| Brand Identity & Design System v2.4 | [brand_identity_master_guide.html](brand_identity_master_guide.html) | Stable; same visual identity |
| ERP High-Level Overview | [ERP_Overview.html](ERP_Overview.html) | Stable reference; operational code elsewhere |
| Impact, MEAL & Learning Framework | [impact_meal_learning_framework.html](impact_meal_learning_framework.html) | Stable reference |
| Website Content & Editorial Guidelines | [website_content_editorial_guidelines.html](website_content_editorial_guidelines.html) | Stable reference |

## Social v4.0, two open-ended streams

- **HSF in Action**: field activity, moments, case studies, human experiences, progress/success, challenges/responses and institutional storytelling.
- **HSF Knowledge & Awareness**: source-led statistics, insights, researched topics, awareness and optional Issue → Practical Response.

**Unified 400-idea library:** [Open the one-page catalogue](communication/idea-library.html), featuring All / KDI / PSC tabs with a unified search, programme and topic/family filtering. The current [260 KDI](communication/idea-library.html?bank=kdi) and [140 PSC](communication/idea-library.html?bank=psc) views are available within the same page. Neither bank provides publication approval. **Each card now offers a local Create AI content prompt popup for content-production briefs (not posts); evidence verification and final publication approval remain mandatory.** Two additional E4BL editorial series, **Inside Our Classroom** and **Learn with E4BL**, are mapped through `communication/editorial_series.json` and searchable with the series filter while maintaining the current 400 source ideas. Each is an initial expandable editorial inventory. The earlier fixed-post pilot, tracker and duplicated historical policy HTML are **not included** in this stable distribution. Git preserves historical version traceability.

## HSF Design Studio: controlled internal production tool

[Launch the offline-capable design tool](design-studio/index.html) · [Developer source and operating safeguards](design-studio/README.md). It is included **inside the Hub**, but is not a seventh institutional master or the operational ERP. The Brand Identity Master Guide and Brand Design Stack remain authoritative for design standards. The Studio inherits the two Social v4.0 streams, seven editorial content families and E4BL series labels. It can import a *public-safe, unverified* design brief downloaded from an idea card; final artworks still need evidence, technical, safeguarding and management approval. No automatic publishing, no ERP connection, and no private data in the public GitHub source.

## Publication integrity

Programme evidence and confidential ERP data remain segregated. Approved Information Layer permits only verified, technically reviewed, safeguarded and management-approved public claims and media. An idea, source URL or testimonial proposal cannot be published as a fact. Do not place learner or patient records, consents, sensitive case studies, HR, finances, credentials or other confidential files in this publicly accessible repository.

## Brand stack certification

`brand-design-stack/` v3.1.0 retains its **production-candidate** status pending representative Adobe Illustrator 2022 compatibility checks. This is not a change to the approved HSF brand identity. Policy alignment is now Social v4.0 / Brand v2.4.

## Local validation

```bash
python scripts/validate_design_studio.py
python scripts/validate_ssot_stability.py
python scripts/validate_content_prompt_generator.py
python scripts/validate_shared_header.py
python scripts/validate_hub.py
python scripts/validate_social_v4.py
python scripts/validate_idea_library.py
python scripts/validate_e4bl_series.py
python brand-design-stack/07_Engine/validate_stack.py
```

## Release & deployment

See [Current internal release v1.9.0](docs/RELEASE_v1.9.0.md) and historical [Release v1.7.1](docs/RELEASE_v1.7.1.md), [Change log](CHANGELOG.md) and [Netlify Deployment Guide](docs/DEPLOY_TO_NETLIFY.md). This repository package does not itself deploy to GitHub or Netlify. Never upload `.env.local`, credential material, a local `.git` directory or confidential ERP records.

## Full-repository replacement and Git history

Use [the current release guide](docs/RELEASE_v1.9.0.md) and [the v1.9.0 safe installation/deletion guide](docs/INSTALL_FULL_REPOSITORY_v1.9.0.md) when migrating an existing checkout. Extract to a **new** directory rather than overwriting the old tree, or obsolete historical files will remain. The ZIP does not contain `.git/` or `.env.local`.
