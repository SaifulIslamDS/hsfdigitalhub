# Apply Note — Social Communication Plan v3.3 Draft/Pilot

**Date:** 1 September 2026  
**Baseline:** Social Communication Plan v3.2 inside HSF Digital Transformation Knowledge Hub v1.4.0  
**Status:** Pilot only — not a stable Knowledge Hub release

## Apply steps

From the Knowledge Hub project root:

```bash
python scripts/apply_social_plan_v3_3_pilot.py
```

The script:

1. validates that `social_communication_plan.html` is a v3.2 source;
2. checks that the locked P01–P48 content is present;
3. reads the source without overwriting it;
4. creates `social_communication_plan_v3.3-pilot.html`;
5. updates visible pilot version metadata;
6. inserts the September 2026 Daily Communication Operating Model;
7. changes the old 12–16 overlay planning range in the pilot copy to the new activity/relevance-led rule;
8. adds a 30-day review requirement;
9. verifies that the number of numbered P01–P48 headings did not change.

## Files intentionally untouched

- `social_communication_plan.html` — remains the stable v3.2 canonical source
- `brand_identity_master_guide.html`
- `brand_identity_master_guide_v2.2.html`
- `index.html`
- Netlify access-control files
- v1.4.0 release records

## Review

Open:

```text
social_communication_plan_v3.3-pilot.html
```

Check:

- v3.3 Draft/Pilot labeling is visible;
- all P01–P48 posts remain present and unchanged;
- the new Daily Communication Operating Model appears after the Special Communication Overlay;
- morning and 4 PM streams are correctly separated;
- the old 12–16 guidance has been replaced only in the pilot copy;
- Brand Guide references remain stable v2.2/v3.2 references, because the pilot has not superseded the stable baseline.

## Do not tag as v1.5.0 yet

Use the 30-day review before any stable release decision.
