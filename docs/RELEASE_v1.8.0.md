# HSF Digital Knowledge Hub v1.8.0 | Internal Release

**Last updated / release date:** 30 October 2026  
**Planning & Compiled by:** Saiful Islam  
**Release method:** Continuous internal update, no routine release-candidate process  
**Social Communication policy:** v4.0, approved and unchanged  
**Brand Identity & Design System:** v2.4, unchanged

## What's new

- Two reusable E4BL editorial subseries now appear in the Social Communication master document, the off-canvas Contents navigation and the unified idea catalogue.
- **Inside Our Classroom**: authentic field lessons under HSF in Action / PSC, with 19 mapped existing ideas.
- **Learn with E4BL**: reviewed practical learning tips under HSF Knowledge & Awareness / KDI, with 15 mapped existing ideas.
- Added one **E4BL editorial series** dropdown, with conditional positive-count options, shared filters, query-parameter links and visible series badges on mapped cards.
- Added `communication/editorial_series.json` as a controlled, public-safe overlay. The two original JSON banks and Excel inventories remain **byte-for-byte unchanged**.
- Added child-safe operating instructions, a classroom-example classification, and a **blank** publication-series register template. No operational student/parent/consent records are included.
- Converted active Knowledge Hub package/status text from the older review-candidate convention to **v1.8.0 current internal version**, separating software updates from publication approval.
- Retained current total **300 ideas: 160 KDI / 140 PSC**, with **254 editorial-approved idea records and 46 proposed**. No ideas are publication-approved solely by inclusion.

## Verification and outstanding checks

Validate locally before Git push:

```bash
python scripts/build_idea_library.py
python scripts/validate_idea_library.py
python scripts/validate_e4bl_series.py
python scripts/validate_social_v4.py
python scripts/validate_hub.py
python scripts/validate_shared_header.py
python brand-design-stack/07_Engine/validate_stack.py
```

Static, cross-document and data-integrity checks are performed locally. Live Netlify site and mobile-device QA must be confirmed after deployment; do not treat local validation as production certification.

## Standard publication gate

Real events require actual field records and child-protection clearance; learning tips require educational accuracy checks. Management must approve exact captions, graphics and publication assets. This **does not depend on whether GitHub source is a release candidate**. The production site PIN gate does not make the public GitHub repository confidential.

## Git commands (existing cloned repository root)

```powershell
git add -A
git commit -m "Add E4BL classroom and learning tips editorial series to Knowledge Hub v1.8.0"
git push origin main
```

If HSF chooses to mark an internal version milestone and `v1.8.0` does not already exist:

```powershell
git tag -a v1.8.0 -m "HSF Digital Knowledge Hub v1.8.0 | E4BL editorial series | 30 Oct 2026"
git push origin v1.8.0
```

Preserve existing `v1.8.0-rc.1`, `rc.2` and `rc.3` tags as historical Git references; do not force-push tags.
