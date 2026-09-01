# HSF Digital Transformation Knowledge Hub

**Current stable release:** v1.5.0 — Integrated 48-Day Communication Operating System  
**Release date:** 1 September 2026

## Purpose

The HSF Digital Transformation Knowledge Hub is the controlled institutional reference layer for Human Safety Foundation (HSF). It connects programme governance, ERP planning, MEAL, website/editorial governance, communication, brand standards and institutional learning.

> **The Knowledge Hub is not the HSF ERP.**

## Three-layer digital architecture

1. **Operational ERP** — sensitive learner, patient, HR, payroll, finance, procurement and programme records.
2. **Knowledge Hub** — policies, frameworks, standards, ERP documentation, MEAL, communication and brand governance.
3. **Public Platform** — approved website content, reports, public statistics, stories and social communication.

Preferred flow:

**ERP → Verification / MEAL → Approved Information → Reports / Website / Social Media**

Raw sensitive operational records must never flow directly into public systems.

## Current controlled documents

| System | Current version | Role |
|---|---:|---|
| Knowledge Hub | **v1.5.0** | Stable institutional baseline |
| Social Communication Plan | **v3.3** | HSF in Action + HSF Knowledge & Awareness |
| Brand Identity & Social Design System | **v2.3** | Dual-stream visual governance |
| 48-Day Communication Tracker | **v3.3** | Operational publication/tracking record |
| Brand Design Stack | **v3.1.0** | Production candidate; Illustrator 2022 validation pending |
| ERP Overview | High-level | Management/UI and architecture reference; not proof of production ERP readiness |

## Social operating model

### Morning — HSF in Action
Around 9:00–10:00 AM. FIELD / MOMENT / EVENT / OBS / HSF when meaningful and verified.

### Afternoon — HSF Knowledge & Awareness
Around 4:00–5:00 PM. One locked P01–P48 post per day.

**Issue today → Resolution tomorrow**  
**24 themes × 2 days = 48-day core cycle**

## Main files

- `digital_transformation_framework.html`
- `website_content_editorial_guidelines.html`
- `social_communication_plan.html`
- `ERP_Overview.html`
- `brand_identity_master_guide.html`
- `impact_meal_learning_framework.html`
- `communication/registers/HSF_Social_Communication_48-Day_Cycle_v3.3_Tracker.xlsx`
- `docs/RELEASE_v1.5.0.md`

## Version-control rule

Canonical live documents use the unversioned filenames. Stable snapshots use versioned filenames. Historical stable snapshots must not be silently rewritten.

## Security boundary

The Knowledge Hub's shared PIN is for controlled institutional/reference access. It is not appropriate authentication for sensitive ERP, patient, student, HR, payroll or finance records.

## Release workflow

1. Update controlled documents.
2. Preserve prior stable snapshots.
3. Validate content/evidence/version consistency.
4. Confirm gate/security files were not unintentionally changed.
5. Commit to `main`.
6. Create an annotated stable release tag.
7. Retain release note and change log.

See `docs/RELEASE_v1.5.0.md` for the current release detail.
