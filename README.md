# Human Safety Foundation | Digital Transformation Knowledge Hub

**Current stable Knowledge Hub:** v1.7.1 · **Social Communication Ecosystem:** v4.0 · **Brand Identity &amp; Design System:** v2.4 (visual identity unchanged)  
**Status:** Management Approved / Stable · **Effective and last updated:** 26 October 2026  
**Planning & Compiled by:** Saiful Islam

The HSF Knowledge Hub is the controlled institutional governance and knowledge reference for E4BL, A2PHC and Climate Action & Resilience, alongside ERP planning, MEAL, website, branding, policy and evidence governance. It is **not the operational ERP**.

## Six current canonical master documents (one copy each)

| Master document | Canonical file | Status |
|---|---|---|
| Institutional Digital Transformation | [digital_transformation_framework.html](digital_transformation_framework.html) | Stable; reviewed 26 October 2026 |
| Social Communication Ecosystem v4.0 | [social_communication_plan.html](social_communication_plan.html) | Approved, stable |
| Brand Identity & Design System v2.4 | [brand_identity_master_guide.html](brand_identity_master_guide.html) | Stable; same visual identity |
| ERP High-Level Overview | [ERP_Overview.html](ERP_Overview.html) | Stable reference; operational code elsewhere |
| Impact, MEAL & Learning Framework | [impact_meal_learning_framework.html](impact_meal_learning_framework.html) | Stable reference |
| Website Content & Editorial Guidelines | [website_content_editorial_guidelines.html](website_content_editorial_guidelines.html) | Stable reference |

## Social v4.0, two open-ended streams

- **HSF in Action**: field activity, moments, case studies, human experiences, progress/success, challenges/responses and institutional storytelling.
- **HSF Knowledge & Awareness**: source-led statistics, insights, researched topics, awareness and optional Issue → Practical Response.

**Unified 254-idea library:** [Open the one-page catalogue](communication/idea-library.html), featuring All / KDI / PSC tabs with a unified search, programme and topic/family filtering. The original [134 KDI](communication/idea-library.html?bank=kdi) and [120 PSC](communication/idea-library.html?bank=psc) views are available within the same page. Neither bank provides publication approval. Each is an initial expandable editorial inventory. The earlier fixed-post pilot, tracker and duplicated historical policy HTML are **not included** in this stable distribution. Git preserves historical version traceability.

## Publication integrity

Programme evidence and confidential ERP data remain segregated. Approved Information Layer permits only verified, technically reviewed, safeguarded and management-approved public claims and media. An idea, source URL or testimonial proposal cannot be published as a fact. Do not place learner or patient records, consents, sensitive case studies, HR, finances, credentials or other confidential files in this publicly accessible repository.

## Brand stack certification

`brand-design-stack/` v3.1.0 retains its **production-candidate** status pending representative Adobe Illustrator 2022 compatibility checks. This is not a change to the approved HSF brand identity. Policy alignment is now Social v4.0 / Brand v2.4.

## Local validation

```bash
python scripts/validate_hub.py
python scripts/validate_social_v4.py
python brand-design-stack/07_Engine/validate_stack.py
```

## Release & deployment

See [Release v1.7.1](docs/RELEASE_v1.7.1.md), [Change log](CHANGELOG.md) and [Netlify Deployment Guide](docs/DEPLOY_TO_NETLIFY.md). This repository package does not itself deploy to GitHub or Netlify. Never upload `.env.local`, credential material, a local `.git` directory or confidential ERP records.

## Full-repository replacement and Git history

Use [the safe full-repository installation guide](docs/INSTALL_FULL_REPOSITORY_v1.7.1.md) when migrating an existing checkout. Extract to a **new** directory rather than overwriting the old tree, or obsolete historical files will remain. The ZIP does not contain `.git/` or `.env.local`.
