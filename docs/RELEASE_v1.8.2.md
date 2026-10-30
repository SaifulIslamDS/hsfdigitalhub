# HSF Digital Knowledge Hub v1.8.2 — Internal Design Studio Integration

**Updated:** 30 October 2026  
**Status:** Active internal source update; no release candidate  
**Planning & Compiled by:** Saiful Islam

## Summary

Integrates the rebuilt **HSF Design Studio** as an internal tool at `design-studio/index.html` and maintains its source at `design-studio/source/`. This does not create a seventh canonical master; the Brand Identity & Design System v2.4, Brand Design Stack v3.1.0 and Social Communication Ecosystem v4.0 remain authority sources.

## Changes

- Source-based offline build (18 website templates in rebuilt source, 14 social archetypes), now connected to Hub homepage.
- Updated two editorial streams, seven Social v4.0 families, optional Issue → Practical Response and E4BL series.
- Controlled `HSF-COM-YYYY-NNNN` ID, originating KDI/PSC idea ID, evidence, public-claim, technical, safeguarding and management status fields. Unverified/undocumented drafts remain **NOT FOR PUBLICATION**. Editor-selected clearance is not independent verification.
- 300 idea cards now support downloading a versioned **public-safe design brief JSON**, imported from the Studio Content panel without a network call. Source idea datasets and review statuses remain unchanged.
- Added practical session cleanup control and explicit warnings on local browser storage, photo-consent self-attestation, public-repo visibility and outstanding export QA.
- Validation + docs for source/build synchronization, policy, palette tokens and public-safe JSON bridge. Original Netlify PIN edge-functions remain unchanged.

## Important limitations

Site gate protects deployment routes, **not the public GitHub source**. Never commit learner/patient photos, consent records, secrets or operational data. Imported briefs are not verified content or final publication approval. Complete Illustrator 2022 compatibility, SVG mask fidelity, direct Bangla editing accuracy, all video/export formats and live deployment tests remain outstanding.

## Windows PowerShell update after copying extracted full repo into the existing Git checkout

```powershell
git add -A
git commit -m "Integrate HSF Design Studio into Knowledge Hub v1.8.2"
git push origin main
```

Tagging is optional under HSF's continuous internal update convention; check for an existing `v1.8.2` tag before creating it.
