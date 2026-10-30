# HSF Digital Knowledge Hub v1.8.0 — Review Candidate

**Package date:** 30 October 2026  
**Planning & Compiled by:** Saiful Islam  
**Repository:** `SaifulIslamDS/hsfdigitalhub`  
**Status:** COMPLETE SOURCE PACKAGE — NOT MANAGEMENT-PROMOTED / NOT DEPLOYED  
**Last approved Knowledge Hub baseline:** v1.7.1  
**Approved Social Communication policy:** v4.0 (unchanged)  
**Approved Brand Identity & Design System:** v2.4 (unchanged identity)  

## Candidate revision 3: aligned institutional page headers (30 October 2026)

- Standardized the institutional control strip and top header across `index.html` and `social_communication_plan.html` using one new `assets/styles/hsf-shared-header.css` file.
- Both now show the HSF logo, name, document title, equivalent sticky white navigation, matching spacing, typography and responsive behavior. Social retains its right-side Contents drawer and 300-idea catalogue links.
- The homepage no longer misleadingly displays `Approved & Stable` for the v1.8.0 Knowledge Hub candidate. Social Communication v4.0 continues to state `Approved & Stable` **for the policy**, not the 46 pending proposals.
- Social hero styling now follows the homepage's pale-green/light design language with consistent green/outline CTAs, without changing the approved content.
- Corrected an existing unmatched `});` in the homepage toast-helper script, previously causing a JavaScript parse error; no change to its intended behavior.
- No changes to the 300 ideas, bank JSON, Excel inventories, snapshot hashes, data permissions, Netlify PIN gate or master document content.
- Use a new `v1.8.0-rc.3` tag after review; do not move existing `rc.1` or `rc.2` tags. Production visual/device and access-gate QA remains required.

## Candidate revision 2: conditional-facet and homepage cleanup (30 October 2026)

- **Zero-result choices are not displayed** in primary-programme, topic/family, evidence-route, review-status and format dropdowns, nor the multi-select tags menu. Counts reflect the other current constraints.
- Invalid prior facet selections clear automatically when constraints change; compatible selections are retained, including when switching KDI/PSC.
- Removed the redundant Social v4.0 promotional banner in the homepage that still claimed 254 total ideas. Social v4 master card and normal links remain available.
- No changes to the 300 editorial source ideas, approval classifications, institutional frameworks, access controls or brand assets.
- The GitHub tag `v1.8.0-rc.1` already exists; do **not** force-update it. Use `v1.8.0-rc.2` for this refined candidate after committing.
- Validated with repository checks and headless Chromium in-memory interaction tests; live deployment browser and Netlify-PIN QA remain outstanding.

## Scope

One canonical static `communication/idea-library.html` now displays **300 editorial concepts**: KDI **160** and PSC **140**. Existing KDI-001–134 and PSC-001–120 are preserved exactly and retain their previously approved editorial-idea status. The 46 new entries are **KDI-135–160 (26)** and **PSC-121–140 (20)**, explicitly **proposed for management review**. None of the 300 entries proves an event/statistic, constitutes clinical guidance ready for use, or is approved for public posting.

Programme primary counts are: E4BL **83**, A2PHC **96**, Climate Action & Resilience **81**, Cross-cutting **40**. Primary programme does not restrict topic-tag discovery: climate-health, education continuity and safeguarding may span programmes.

### Advanced conditional filter UI

- All / KDI / PSC tabs.
- Full-text search across title, series, narrative/evidence, candidate research-source descriptors and tags.
- Primary-programme selector with conditional availability.
- Combined topic / story-family selector, with options and counts conditional on other filters.
- Multi-select cross-cutting discovery tags with live facet counts (OR within selected tags; AND across other facets).
- Evidence route, editorial idea approval status (earlier approved vs proposed), media/visual family, and sorting.
- Result counts, active filter labels, accessible empty state, reset, keyboard tab selection, URL filter serialization and ID anchor links.
- All cards remain static HTML and accessible without JavaScript (filter controls require JavaScript).

### Right-side off-canvas Social v4.0 Contents menu

`social_communication_plan.html` has a responsive right-hand Contents drawer matching the other institutional master documents' pattern, with searchable 14-section links, active section highlighting, backdrop, focus handling, Escape-key dismissal and body scroll lock. The redundant inline Contents list is removed. The policy itself remains approved v4.0.

### Data and document control

- New source JSON: `communication/research/kdi_160_ideas.json` and `psc_140_ideas.json`.
- New editable source workbooks: `communication/research/HSF_Knowledge_Data_Insight_160_Idea_Bank_Editorial_Inventory.xlsx` and `communication/research/HSF_Programme_Stories_Communication_140_Idea_Bank_Editorial_Inventory.xlsx`.
- Older named files are removed from active distribution; prior source remains recoverable via the previous Git release.
- `governance/IDEA_LIBRARY_v1.8.0_SOURCE_SNAPSHOTS.json` guards exact canonical JSON of the 254 prior entries with SHA-256.
- Governance asset register SHA-256 checksums updated for the new public-safe XLSX workbooks.
- HSF public/private digital boundary, approved-information standard, ERPs, MEAL definitions, Netlify access controls and Brand Design Stack candidate status are preserved.
- Approved policy v4.0 and management-reviewed public content approvals remain separate from the v1.8.0 candidate feature release.

## Verification

Run from the repository root:

```bash
python scripts/build_idea_library.py
python scripts/validate_idea_library.py
python scripts/validate_social_v4.py
python scripts/validate_hub.py
python scripts/validate_shared_header.py
python brand-design-stack/07_Engine/validate_stack.py
```

The automated content-bank, source-digest, security-baseline and internal-navigation checks passed. A headless Chromium **in-memory HTML interaction test** passed eight main scenarios (tab counts, proposed filters, CAR KDI, reset and drawer open/close). **Live HTTP navigation was blocked by the execution environment**, so Netlify/production cross-origin navigation, browser back/forward, mobile touch/scroll/keyboard and final visual review require deployment-preview QA before release promotion. No protected site was deployed or pushed to GitHub.

## Approval and release gates

1. Editorial team and HSF management review the 46 proposed ideas, title/angle usefulness and programme priorities; decide whether to approve as editorial **ideas** only.
2. Confirm original external-source provenance, recent editions, relevant table/period, and valid proposed response guidance before drafting actual KDI posts. No factual claims are pre-verified.
3. PSC case studies require real event evidence, explicit consent/safeguarding checks, anonymisation and technical review before a story can be written.
4. Perform Netlify preview browser QA at desktop and mobile widths, conditional facet behavior, backward compatibility and PIN sign-in/sign-out.
5. Validate Git diff against last approved `v1.7.1`, preserve all historical tags, and obtain authorization before moving main or creating final `v1.8.0` tag.

**No production tag, GitHub release or publication is claimed by this candidate.**
