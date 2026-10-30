# HSF Social Communication · 300-Idea Catalogue (v1.8.0 review candidate)

**Planning & Compiled by:** Saiful Islam · **Updated:** 30 October 2026

The underlying Social Communication **policy remains v4.0 Approved & Stable**. The expanded catalogue is a **candidate** pending review and browser QA. It contains **254 previously editorial-approved ideas plus 46 proposed**; zero individual posts have publication approval by appearing here.

- [One canonical unified Idea Library](idea-library.html): **All 300 / KDI 160 / PSC 140** tabs
- Conditional filters: free text, primary programme, topic/family, cross-cutting multi-select tags, evidence route, idea-review status, format and sorting. Dropdown options disable unsupported combinations; each selected filter intersects with other dimensions except multiple tags, which use OR logic.
- KDI: [160 concepts](idea-library.html?bank=kdi), source `research/kdi_160_ideas.json`, [Excel bank](research/HSF_Knowledge_Data_Insight_160_Idea_Bank_Editorial_Inventory.xlsx). New KDI-135–160 are proposed.
- PSC: [140 concepts](idea-library.html?bank=psc), source `research/psc_140_ideas.json`, [Excel bank](research/HSF_Programme_Stories_Communication_140_Idea_Bank_Editorial_Inventory.xlsx). New PSC-121–140 are proposed.
- [Source leads registry](research/source_registry.json), [blank public-safe evidence register](registers/content_evidence_register_TEMPLATE.csv), and [story intake safeguards](registers/case_study_intake_template.md).

Build: `python scripts/build_idea_library.py`. Validate: `python scripts/validate_idea_library.py`, `python scripts/validate_social_v4.py`, `python scripts/validate_hub.py`.

The former `kdi-idea-bank.html` and `psc-idea-bank.html` are compatibility redirects. The retired 48-post pilot remains outside active planning. No client-side filter accesses restricted ERP data.
