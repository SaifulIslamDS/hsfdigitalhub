# HSF Social Communication · 300-Idea Catalogue (v1.8.1 internal)

**Planning & Compiled by:** Saiful Islam · **Updated:** 30 October 2026

The underlying Social Communication **policy remains v4.0 Approved & Stable**. The catalogue is part of the **current internal version**; the 46 new ideas separately remain pending editorial review. It contains **254 previously editorial-approved ideas plus 46 proposed**; zero individual posts have publication approval by appearing here.

- [One canonical unified Idea Library](idea-library.html): **All 300 / KDI 160 / PSC 140** tabs
- Conditional filters: free text, primary programme, topic/family, cross-cutting multi-select tags, evidence route, idea-review status, format and sorting. Dropdown options disable unsupported combinations; each selected filter intersects with other dimensions except multiple tags, which use OR logic.
- KDI: [160 concepts](idea-library.html?bank=kdi), source `research/kdi_160_ideas.json`, [Excel bank](research/HSF_Knowledge_Data_Insight_160_Idea_Bank_Editorial_Inventory.xlsx). New KDI-135–160 are proposed.
- PSC: [140 concepts](idea-library.html?bank=psc), source `research/psc_140_ideas.json`, [Excel bank](research/HSF_Programme_Stories_Communication_140_Idea_Bank_Editorial_Inventory.xlsx). New PSC-121–140 are proposed.
- [Source leads registry](research/source_registry.json), [blank public-safe evidence register](registers/content_evidence_register_TEMPLATE.csv), and [story intake safeguards](registers/case_study_intake_template.md).

Build: `python scripts/build_idea_library.py`. Validate: `python scripts/validate_idea_library.py`, `python scripts/validate_social_v4.py`, `python scripts/validate_hub.py`.

The former `kdi-idea-bank.html` and `psc-idea-bank.html` are compatibility redirects. The retired 48-post pilot remains outside active planning. No client-side filter accesses restricted ERP data.

## Two E4BL editorial series (30 October 2026)

- **Inside Our Classroom**: verified actual class moments under HSF in Action / PSC. [Open filtered library](idea-library.html?bank=psc&series=inside-our-classroom).
- **Learn with E4BL**: teacher-reviewed age-appropriate learning tips under HSF Knowledge & Awareness / KDI. [Open filtered library](idea-library.html?bank=kdi&series=learn-with-e4bl).

The [editorial-series mapping](editorial_series.json) references existing idea IDs without changing KDI/PSC source records, approval status or the **300-idea total**. The [operating guide](../docs/E4BL_EDITORIAL_SERIES_OPERATING_GUIDE.md) distinguishes authentic classroom evidence from learning tips and enforces child safeguarding.

## Per-idea Content Production Prompt (v1.8.1)

All 300 idea cards contain a **Create AI content prompt** button. A local-only popup builds a copy-and-paste professional brief tailored to that idea's programme, source/evidence requirement, editorial series, status and suggested format. Editors can choose Facebook, Instagram, LinkedIn, Bangla/English and a complete package, feed post, carousel, short-form Reel or educational activity. An optional field accepts only public-safe evidence notes or source links; it is not stored or sent anywhere by the Knowledge Hub.

The popup generates **instructions for an external AI assistant**, not a published post, external search, image or video. All outputs must undergo primary-source verification, technical review, safeguarding and final management publication approval. The generator cannot guarantee visibility, shares, reach or search rankings. Implementation guide: [`docs/CONTENT_PROMPT_GENERATOR_v1.8.1.md`](../docs/CONTENT_PROMPT_GENERATOR_v1.8.1.md).

Check: `python scripts/validate_content_prompt_generator.py`.
