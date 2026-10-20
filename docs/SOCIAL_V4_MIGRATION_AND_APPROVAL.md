# HSF Social Communication v4.0: Migration and Approval Guide

**Existing stable system remains active until management approves promotion.**

## Acceptance checklist

1. Review `social_communication_plan_v4.0_candidate.html` and both candidate stream definitions.
2. Confirm the former 48-post pilot is retired from the active v4 ecosystem, without a heritage-map page or active numbered tracker.
3. Verify KDI 120 editorial ideas remain approved as topics only. Review the separate 120 PSC idea bank and record explicit management decision; no particular case or outcome is thereby verified.
4. Confirm ownership and authority for programme facts, MEAL, clinical/technical review, safeguarding, design and management sign-off.
5. Test a selection of FIELD, CASE, PROGRESS, CHALLENGE, ISSUE/RESPONSE, PSC and KDI content packages; record actual source and design approval.
6. Confirm public-safe repository classification; do not push completed sensitive field forms/consent sheets here.
7. Run `python scripts/validate_hub.py` and `python scripts/validate_social_v4.py`.
8. Perform browser visual QA of candidate page and idea bank on mobile/desktop, including navigation, search and accessibility.
9. Verify deployment protection remains operational in Netlify; no change was made to `netlify.toml`, redirects or PIN functions.
10. Record management approval, effective date and superseded reference before treating v4.0 as stable.

## On management approval

- Create new controlled Hub stable release, suggested **v1.6.0**, only after QA (this package is **v1.6.0 candidate**).
- Promote the reviewed v4.0 page to canonical `social_communication_plan.html` and freeze `social_communication_plan_v4.0.html`.
- Update README, MANIFEST, homepage social master-card and validation checks to new **approved** versions; synchronize brand cross-references carefully without rewriting Brand v2.3 history or identities.
- Formalize any required future **Brand v2.4 alignment addendum** separately if leadership approves genuine production governance changes.
- Update ERP/Hub interfaces only by separately approved architecture changes; no raw direct API flow to public media.
- Retain prior v3.3 document only as version-controlled historical policy; do not reintroduce its cycle tracker or post archive into active v4. Document transition date in the release record.

## Rollback

Before promotion, simply remove candidate links from homepage; stable policy and runtime files were never changed. After promotion, use a new authorized controlled rollback release referencing the historical v3.3 snapshot. Do not silently rewrite Git history.
