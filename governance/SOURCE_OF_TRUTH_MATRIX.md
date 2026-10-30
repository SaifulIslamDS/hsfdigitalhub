# HSF Source of Truth Matrix

**Document review:** Stable reference · **Last updated:** 30 October 2026 · **Planning & Compiled by:** Saiful Islam

**Status:** Controlled governance reference  
**Effective:** 11 September 2026  
**Digital System Contract:** v1.0.0

This matrix defines which HSF source is authoritative for each information type. It prevents a draft, presentation, spreadsheet, UI mock-up or historical release note from silently becoming institutional truth.

| Information type | Authoritative source | Supporting layer | Public-use rule |
|---|---|---|---|
| Organization policies, frameworks and standards | Current management-approved Knowledge Hub controlled document | Management approval record | Publish only approved public versions |
| Programme identity, purpose and approved status | Management-approved programme governance in the Knowledge Hub | ERP programme master mirrors approved status | Do not infer active status from an ERP screen/module |
| ERP architecture and implementation status | HSF ERP repository canonical technical documents and code | ADRs, release notes, CI | Public technical description only when safe |
| Operational programme records | Protected ERP/database or approved operational dataset | Programme team | Never publish raw sensitive records |
| E4BL learner records | ERP education domain / approved E4BL operational dataset | Programme + MEAL verification | Aggregate/approved statistics only |
| A2PHC patient/clinical records | ERP health domain / approved A2PHC operational dataset | Programme + MEAL verification | Aggregate/anonymized/approved reporting only |
| Finance, payroll, procurement and HR transactions | Protected ERP operational system | Authorized workflow | No direct public exposure |
| Indicator definitions | Knowledge Hub MEAL framework / approved indicator registry | ERP/reporting implementation | Definition remains version-controlled |
| Reporting-period indicator values | Verified ERP/reporting dataset or approved verified dataset | MEAL verification | Requires management approval before public use |
| Calculated/estimated/inferred values | Documented analysis with source and methodology | MEAL review | Evidence state must remain explicit |
| Public statistics | Approved Information Layer | Management approval + MEAL evidence | Publication state must be `APPROVED_PUBLIC` |
| Brand rules | Current approved Brand Identity & Design System | Production asset stack | Public-facing design should conform |
| Social visual production tool | `design-studio/source/` and generated `design-studio/index.html` | Approved Brand Identity Guide and Brand Stack remain authoritative | Draft creation does not establish public-use approval |
| Social communication operating model | Current stable Social Communication Plan | Tracker and communication registers | Candidate plans are not canonical until promoted |
| Website/social/report copy | Approved public communication output | Approved Information Layer | Must not bypass verification/approval |

## Project-name and scope resolution

The **Digital System Contract v1.0.0** controls the three active programme codes; `governance/PROGRAMME_REGISTRY.md` controls how those codes are displayed to readers. Use **Climate Action & Resilience** for the full public Project name and **Climate Action** as the canonical internal contract name or shortened display label. Women and girls' empowerment remains cross-cutting and does not create a fourth current Project. The ERP's optional future modules are blueprints, not evidence of institutional programme activation. 

## Conflict rule

When sources disagree, use the source appropriate to the information type above. In general:

1. Current management-approved controlled HSF document or verified operational source.
2. HSF Digital System Contract and this Source of Truth Matrix for institutional definitions.
3. Current canonical ERP implementation documentation for technical implementation facts.
4. Historical/archived material only for historical context.
5. External research only as external evidence; it does not replace HSF operational evidence.

Unresolved conflicts are flagged and escalated. They are not reconciled by assumption.

## Volatile information

Changing figures such as beneficiary counts, enrolment, camp coverage, staff counts and service totals require a reporting period and source. Architecture documents should describe the model and source location rather than freeze a changing number as a permanent fact.

## Social Communication Ecosystem v4.0 (approved 20 October 2026)

`social_communication_plan.html` is the sole **approved and stable** canonical communication framework. It supersedes the fixed pilot, with two public streams and seven reusable content families. The unified library contains 260 KDI and 240 PSC ideas. All 500 editorial concepts are approved for planning only, including the 46 promoted in v1.9.0 and the additional 200 promoted in v1.10.1 following explicit user review. All 100 KDI research additions remain unverified source leads, and all 100 PSC conditional story additions remain unconfirmed field occurrences. Neither category implies verified facts or publication approval. No statistical source, event, field case, clinical assertion, testimonial, beneficiary image, artwork or final caption becomes verified or approved for public release merely because an idea is listed. A named reviewer and management approval of the exact public-safe output is required under `APPROVED_INFORMATION_STANDARD.md`.

**E4BL editorial subseries (30 October 2026):** `communication/editorial_series.json` is a secondary, curated discovery mapping for **Inside Our Classroom** (PSC) and **Learn with E4BL** (KDI). Its labels are not source-of-truth for an event, learning result, curriculum claim, consent or publication approval. The 300 source idea records remain unchanged; review exact content in the controlled operational flow.

Brand Identity & Design System v2.4 retains the same visual identity and aligns production to open-ended Social v4.0. Historical versions are available in Git history, not competing active copies. The HSF Digital System Contract v1.0.0, ERP, MEAL and confidential-data segregation remain intact.
