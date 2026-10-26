# HSF Unified Idea Library: COP31 Editorial Addition

**Updated:** 26 October 2026  
**Planning & Compiled by:** Saiful Islam

## Data contract

The canonical UI is `communication/idea-library.html`. It is generated from `communication/research/kdi_134_ideas.json` and `communication/research/psc_120_ideas.json`. All 254 cards are static and visible without a network call. JavaScript supplies search, tabs, programme and topic/family filters; disabling JavaScript leaves readable cards. Deep-link IDs are stable and unique.

All new records are `KDI-121` to `KDI-134`, in the series corresponding to the original booklet topics. Each new record includes the evidence research question, a response lens, suggested visual, candidate source key `S23`, and a provenance qualifier. They are programme-appropriate editorial **research questions**, not approved public statistics or claims.

The shared chat link is provenance for the user's research context. The assistant-rendered 14-item UI was not readable from the public share. The titles represent a careful new editorial adaptation of themes in the original booklet; they should not be quoted as an exact prior assistant response. Do not describe the civil-society booklet as an adopted government negotiating mandate.

## Editorial review before publication

1. Obtain the relevant page of the primary booklet and the publication date/version.
2. Retrieve official government and UNFCCC sources for negotiated-policy/current-status claims.
3. Obtain published statistical source tables for any numerical post; audit denominators, survey date, geography, and projections.
4. Technical review for climate, public health, child education, WASH, gender and other domain-specific subjects.
5. Safeguarding and approval of exact artwork and caption.

## Regression acceptance criteria

- KDI ids remain `KDI-001` through `KDI-134` without gaps; all original 120 records byte-equivalent by canonical JSON field values.
- PSC 120 original records remain unchanged.
- All view: 254, KDI view: 134, PSC view: 120; search/filter and deep links work.
- Source registry includes `S23` and KDI workbook totals match the JSON inventory.
- No confidential programmatic/person-level ERP records or unapproved public claims introduced.
- No branding, MEAL data model, Netlify edge auth or security contract changes.
