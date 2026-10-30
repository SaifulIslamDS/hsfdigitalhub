# HSF Social Communication · 500-Idea Catalogue (v1.10.1 internal)

**Planning & Compiled by:** Saiful Islam · **Updated:** 30 October 2026

The underlying Social Communication **policy remains v4.0 Approved & Stable**. The catalogue is part of the **current internal version**; all 500 KDI and PSC ideas are editorial-approved for planning only after review. It contains **500 editorial-approved ideas plus 0 proposed**; zero individual posts have publication approval by appearing here.

- [One canonical unified Idea Library](idea-library.html): **All 500 / KDI 260 / PSC 240** tabs
- Conditional filters: free text, primary programme, topic/family, cross-cutting multi-select tags, evidence route, idea-review status, format and sorting. Dropdowns hide zero-result combinations; each selected filter intersects with other dimensions except multiple tags, which use OR logic.
- KDI: [260 concepts](idea-library.html?bank=kdi), source `research/kdi_260_ideas.json`, [Excel bank](research/HSF_Knowledge_Data_Insight_260_Idea_Bank_Editorial_Inventory.xlsx). KDI-135–160 and KDI-161–260 are now editorial-approved for planning. New source-led claims remain unverified.
- PSC: [240 concepts](idea-library.html?bank=psc), source `research/psc_240_ideas.json`, [Excel bank](research/HSF_Programme_Stories_Communication_240_Idea_Bank_Editorial_Inventory.xlsx). PSC-121–140 and PSC-141–240 are editorial-approved for planning; all PSC-141–240 still require documented field occurrence; no individual PSC story is verified.
- [Source leads registry](research/source_registry.json), [blank public-safe evidence register](registers/content_evidence_register_TEMPLATE.csv), and [story intake safeguards](registers/case_study_intake_template.md).

Build: `python scripts/build_idea_library.py`. Validate: `python scripts/validate_idea_library.py`, `python scripts/validate_social_v4.py`, `python scripts/validate_hub.py`.

The former `kdi-idea-bank.html` and `psc-idea-bank.html` are compatibility redirects. The retired 48-post pilot remains outside active planning. No client-side filter accesses restricted ERP data.

## Two E4BL editorial series (30 October 2026)

- **Inside Our Classroom**: conditional ideas for actual, dated, verified class moments under HSF in Action / PSC. [Open filtered library](idea-library.html?bank=psc&series=inside-our-classroom).
- **Learn with E4BL**: teacher-reviewed age-appropriate learning tips under HSF Knowledge & Awareness / KDI. [Open filtered library](idea-library.html?bank=kdi&series=learn-with-e4bl).

The [editorial-series mapping](editorial_series.json) adds discovery labels to the current KDI/PSC source records without creating additional IDs or changing the **500-idea total**. The [operating guide](../docs/E4BL_EDITORIAL_SERIES_OPERATING_GUIDE.md) distinguishes authentic classroom evidence from learning tips and enforces child safeguarding.

## Per-idea Content Production Prompt (introduced v1.8.1; current Hub v1.10.1)

All 500 idea cards contain a **Create AI content prompt** button. A local-only popup builds a copy-and-paste professional brief tailored to that idea's programme, source/evidence requirement, editorial series, status and suggested format. Editors can choose Facebook, Instagram, LinkedIn, Bangla/English and a complete package, feed post, carousel, short-form Reel or educational activity. An optional field accepts only public-safe evidence notes or source links; it is not stored or sent anywhere by the Knowledge Hub.

The popup generates **instructions for an external AI assistant**, not a published post, external search, image or video. All outputs must undergo primary-source verification, technical review, safeguarding and final management publication approval. The generator cannot guarantee visibility, shares, reach or search rankings. Implementation guide: [`docs/CONTENT_PROMPT_GENERATOR_v1.8.1.md`](../docs/CONTENT_PROMPT_GENERATOR_v1.8.1.md).

Check: `python scripts/validate_content_prompt_generator.py`.

## Design Studio production bridge (introduced v1.8.2; current Hub v1.10.1)

Each of the 500 idea cards now provides **Download design brief**, a public-safe JSON export alongside its professional AI content prompt. The file contains an idea ID, bank, programme, editorial series, proposed angle and suggested visual format, but **no verified claim, internal ERP record, participant photo or publication approval**. Use [HSF Design Studio](../design-studio/index.html) → Content → Import public-safe Communication Hub design brief, then continue working in the brand-aligned offline editor. A successful import never clears evidence, safeguarding or management review. See [Design Studio operating guidance](../design-studio/README.md).

## Latest editorial approval trace

100 KDI ideas (KDI-161..260) and 100 PSC ideas (PSC-141..240) were reviewed and approved for editorial planning by explicit user instruction on 30 October 2026. See [200-idea approval transition](../governance/EDITORIAL_APPROVAL_TRANSITION_v1.10.1.json). Original concepts, research sources and PSC field-occurrence requirements remain unverified. This is **not final post approval**.
