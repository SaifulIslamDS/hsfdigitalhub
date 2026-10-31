# HSF Design Studio — Phase 1 Validation Matrix

**Source of truth:** generated validation results in the local checkout, not this static document. This matrix distinguishes what checks prove from what they do not prove.

| Check | How | Expected status when user runs patch | Scope |
|---|---|---|---|
| Baseline reference | Git HEAD SHA and manifest guard | PASS required before modification | Exact v1.10.1 source base |
| Five HSF palettes | Canonical token JSON ↔ compiled JS | PASS required | Token equality, not perceptual fidelity |
| Fourteen archetypes | Canonical registry ↔ compiled JS | PASS required | IDs, photo share, purpose |
| Five narrative stage sequences | Canonical registry ↔ compiled JS | PASS required | Stage labels and count; not full layout parity |
| Platform working dimensions | Canonical platform registry ↔ compiled JS | PASS required | Mapped formats only, not current-platform independent verification |
| Offline build integrity | `build.py` ↔ `design-studio/index.html` | PASS required | Byte-identical generated HTML |
| Saved-design JSON import | Source guard | PASS required | Reviewer metadata reset, not runtime penetration test |
| Logo upload claims | Source guard | PASS required | Tool never claims verification of source logo |
| SSOT, Social v4.0, idea library, Hub | Existing validators | PASS required | Static governance/source checks |
| Policy and Netlify baseline integrity | SHA lock / Git diff | PASS required | Files remain unchanged |
| Bangla editable text / line breaking | Human browser QA | **PENDING** | Type and caret in Bangla |
| 14 archetypes visual parity to Stack SVG | Pixel/screenshot comparison | **PENDING** | Design fidelity |
| Carousel PNG/PDF/SVG round-trip | Desktop browser QA | **PENDING** | Output correctness |
| Website responsive crop / Elementor handoff | Browser/WordPress QA | **PENDING** | Desktop/tablet/mobile |
| Accessibility and screen-reader | Manual/automated audit | **PENDING** | WCAG/inclusive operation |
| Adobe Illustrator 2022 | Real AI 2022 SVG import/editing | **PENDING** | Vector editability |
| Netlify protected deployment | Real deployed environment | **PENDING** | Routing/session/runtime |
| Exact output evidence, safeguarding, management | Protected institutional records | **PER DESIGN** | Not proven by code or a selected checkbox |

**Release caution:** A PASS from scripts does not mean this product is certified for design/publication production. Test real assets in a private QA worktree before using output for public HSF channels.
