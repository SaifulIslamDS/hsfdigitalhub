# HSF Social Content Idea Library: Implementation Specification

**Knowledge Hub:** v1.7.0 (source package, 20 October 2026)  
**Social Communication Ecosystem:** v4.0, approved  
**Planning & Compiled by:** Saiful Islam

## 1. Single canonical location

`communication/idea-library.html` combines presentation of 120 KDI and 120 PSC editorial concepts in a single static HTML page, without combining, reordering or rewriting their JSON/XLSX source records.

## 2. Interaction

- Accessible navigation tabs: **All (240)**, **Knowledge, Data & Insight (120)**, **Programme Stories & Communication (120)**.
- One shared full-text search across idea ID, title, content concept, source/response/evidence fields.
- One common programme selector: E4BL, A2PHC, CAR, CROSS or all.
- Context-sensitive topic/family selector: 12 KDI research series and six PSC content families; automatically disallow irrelevant selections when the tab changes.
- Live result counts, reset, keyboard arrow-navigation of tabs, labelled inputs and responsive card grid.
- Shareable query links such as `idea-library.html?bank=kdi` and `?bank=psc`; each card has a stable anchor, e.g., `#KDI-001`.
- Search and filtering are local browser functions only; there is no external API or external JavaScript dependency.

## 3. Evidence and privacy

The UI displays **approved ideas**, not verified events, medical facts, research statistics or publications. No confidential operational records, consent images, identifiable patients/learners, clinical advice or live ERP integrations are included. The KDI source references are research leads and require page/table-level verification before quotation.

## 4. Deterministic maintenance

The two unchanged source inventories are:

- `communication/research/kdi_120_ideas.json`
- `communication/research/psc_120_ideas.json`

Their editable XLSX bank files remain in the same `communication/research/` folder. Rebuild the canonical HTML after an authorized idea-bank revision:

```bash
python scripts/build_idea_library.py
python scripts/validate_idea_library.py
python scripts/validate_social_v4.py
python scripts/validate_hub.py
python brand-design-stack/07_Engine/validate_stack.py
```

The two old URLs (`kdi-idea-bank.html`, `psc-idea-bank.html`) are **small compatibility redirect pages**, not parallel content masters.

## 5. QA status

Source integrity and static HTML/JavaScript syntax tests passed. Interactive rendering in headless Chromium could not be executed in this sandbox: browser navigation was blocked by administrative policy for both file and local HTTP URLs. Before deploying, open the canonical HTML in Chrome/Edge/Firefox on desktop and mobile, test tab switching, combined filters, clearing filters, keyboard navigation, deep links and old-page redirects. Confirm the PIN gate still requires authentication before accessing internal pages.

## 6. v1.7.0 Git tag caveat

The remote `v1.7.0` GitHub tag was confirmed to exist on 20 October 2026 but points to a repository manifest that still calls itself v1.6.0. This complete v1.7.0 source ZIP **has not been pushed or deployed**. Do not silently change or move a published tag. Reconcile under an explicit GitHub release-management decision and approve the release after live QA.
