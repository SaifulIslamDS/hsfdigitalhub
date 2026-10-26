# HSF Social Communication Ecosystem v4.0 · Approved & Stable

**Effective / last updated:** 26 October 2026  
**Planning & Compiled by:** Saiful Islam

Two public editorial streams: **HSF in Action** and **HSF Knowledge & Awareness**. Seven reusable families; no mandatory publishing cadence, maximum idea count or fixed sequence.

- **[Unified Social Content Idea Library, 254 ideas](idea-library.html)**: All / KDI / PSC tabs, unified programme, topic/family and full-text filtering.
- [KDI tab: 134 research ideas](idea-library.html?bank=kdi) (KDI-001…KDI-134)
- [PSC tab: 120 programme story ideas](idea-library.html?bank=psc) (PSC-001…PSC-120)
- [Public-safe content evidence register](registers/content_evidence_register_TEMPLATE.csv) and [schema](registers/content_evidence_register_schema.json)
- [Safeguarded case-story intake guidance](registers/case_study_intake_template.md)

Both banks are approved as **ideas only**. KDI references are research leads; PSC scenarios are conditional prompts, not already observed events. Individual claims, figures, photos, testimonials, graphics and final posts must be verified and authorized. The retired fixed-post pilot remains only in version-control history; Issue → Practical Response survives as an optional editorial method.

[View the canonical Social v4.0 framework](../social_communication_plan.html). Never commit operationally sensitive material to this public repository.

## Library implementation (Knowledge Hub v1.7.1)

The single static page `idea-library.html` is **generated** from the two unchanged JSON inventories using `python scripts/build_idea_library.py`. The former KDI and PSC HTML paths are navigation/redirect compatibility stubs, not duplicate document copies. No external runtime JavaScript, network connection or sensitive ERP information is needed to browse the 254 static ideas.
