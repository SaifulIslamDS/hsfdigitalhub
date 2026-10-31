# HSF Design Studio — Phase 1 Architecture & Alignment

**Change package:** v1.11.0 · **Date:** 31 October 2026 (Asia/Dhaka)  
**Baseline:** `SaifulIslamDS/hsfdigitalhub` `main` @ `13ffe2312824b82fc0c43d817de7282726d5ffc4`  
**Status:** controlled engineering patch; production release and management approval separate.

## 1. Authority is not duplicated

| Concern | Authority | Studio implementation |
| --- | --- | --- |
| Two streams, seven families, editorial gates | `social_communication_plan.html` (v4.0) | UI selectors / editorial metadata only |
| Official visual identity and logo policy | `brand_identity_master_guide.html` (v2.4) | Master logo slot / palette & typography controls |
| Visual components, archetypes, formats | `brand-design-stack/` (v3.1.0) | Build-time generated Studio constants |
| Website editorial/SEO and safeguarding | `website_content_editorial_guidelines.html` | Asset templates, compression, Elementor handoff |
| Approved information / protection rules | Governance/MEAL contract and controlled approval records | Warnings and metadata; **no approval automation** |

## 2. Deterministic source alignment

Run `python scripts/studio_phase1.py apply` at repository root. The script:

1. Validates the baseline Git HEAD and expected policy versions; refuses unrelated local changes.
2. Reads **canonical** `brand-tokens.json`, `archetypes.json`, `sequence-presets.json` and `platform-specs.json`.
3. Regenerates source declarations `PALETTES` and `ARCH` and synchronizes five core narrative sequence stage labels and supported platform working sizes into `design-studio/source/src/e1_data.js`.
4. Preserves Studio-specific website templates and the four LinkedIn knowledge-document sequence presets as implementation-specific features. Their dimensions and page compositions require separate visual QA.
5. Updates misleading logo verification labels and resets review/consent/approval metadata on saved-design JSON import.
6. Regenerates `design-studio/index.html` via the existing deterministic offline build.
7. Records a content-hash lock in `design-studio/source/STACK_ALIGNMENT_LOCK.json`.
8. Synchronizes release metadata and version checks; it updates only current software-release labels in the Social v4.0 HTML master (and the controlled checksum), without altering Social policy; it leaves Brand, MEAL, ERP and website master content and Netlify security code unchanged.

**Important:** This is *build-time* SSOT: the offline HTML contains generated static declarations. The browser itself does not fetch policy files or connect to the ERP. Do not edit the compiled HTML manually; change source/registries, rebuild, validate and review.

The Stage/Sequence **archetype selection** mapping remains Studio implementation code; the stage names are canonical Stack values. A later phase could unify all layout geometry into a shared intermediate layout representation and compare SVG/Canvas pixel fidelity.

## 3. Media and information boundary

- The full GitHub repository remains PUBLIC. Even if the Netlify site is PIN-gated, do not place participant images, patient/learner records, consent files, secret keys or unpublished confidential materials in this repo.
- Offline/local browser saves are not institutional private storage and can persist after the app closes.
- Content idea import and saved-design import **never** establish public approval. Editor-checked consent is an assertion, not a signed consent record.
- When a saved design `.json` is opened, prior status values are reset to `NOT_VERIFIED` / `NOT_APPROVED` / `PENDING` and consent to `Not checked`.
- Even after selecting `APPROVED_PUBLIC` in the editor, the app does **not** verify external management decisions. Every exact final output needs authorized separate review.
- The logo upload cannot authenticate whether the vector file is the approved HSF master. QA warns accordingly.

## 4. Website design boundary

The Studio prepares HSF website photos, banners, social link cards and design assets. Elementor/WordPress remains the live website publishing system. Text that must be searchable, translated, responsive or accessible should normally be **HTML**, not baked into a hero image. This phase does not introduce a full page builder or publish to WordPress.

## 5. Release, validation and residual limitations

Run:

```powershell
python scripts/studio_phase1.py check
python scripts/validate_design_studio.py
python scripts/validate_ssot_stability.py
python scripts/validate_hub.py
python scripts/validate_social_v4.py
python scripts/validate_idea_library.py
python scripts/validate_content_prompt_generator.py
git diff --check
```

The source validator only checks code, metadata, source equivalence and declared output safety. It does **not** validate rendering, uploaded media rights, real consent, font licensing, Bangla editing accuracy, colour contrast, WCAG conformance, mobile screenshot crops, Adobe Illustrator 2022 SVG editability, MP4 availability, or live deployment.

## 6. Next phase boundaries

**Phase 2 (not included):** canvas layout parity testing against the Python SVG engine; shared component scene graph; multi-platform campaign adaptation, asset library revisions, richer responsive website section composition, export batch job diagnostics.

**Phase 3 (not included):** staff authentication, protected media storage, authenticated approval workflow, exact-output signatures and publishing integrations. These require a separate secured operational service, not the public Knowledge Hub or PIN-only authentication.
