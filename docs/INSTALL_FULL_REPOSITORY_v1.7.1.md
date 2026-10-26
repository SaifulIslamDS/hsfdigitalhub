# Install HSF Digital Knowledge Hub v1.7.1 (Complete Source)

**Date:** 26 October 2026  
**Planning & Compiled by:** Saiful Islam

This distribution is a **full repository working tree**, not a patch or an automatic Netlify deployment. GitHub's existing `v1.7.0` tag should remain unchanged.

## Controlled Git workflow

1. Clone or update the existing `SaifulIslamDS/hsfdigitalhub` Git repository using your own authorized account. Preserve its `.git` directory and back up any local uncommitted changes.
2. Create a feature branch, for example `feature/hsf-kdi-cop31-14`.
3. Extract the new ZIP into a **separate folder**.
4. Copy the ZIP's `hsfdigitalhub-main/` *contents* into the checkout, reviewing additions, modifications and **removal of the old `kdi_120_ideas.json`/120-idea Excel workbook**. Do not merely unpack on top without handling deletions. If using `rsync --delete`, exclude `.git/` and examine a dry run first; never delete your repository metadata.
5. Verify `git status` / `git diff` and inspect the 14 new idea records and source note.
6. Run the required validation commands below.
7. Commit and push your feature branch, create a pull request and obtain HSF review before merging. Afterwards tag the reviewed commit as `v1.7.1` only if HSF release authority approves.
8. Verify Netlify preview and actual deployment, including existing PIN/session controls, normal browser/mobile browsing and the unified 254-card library filters.

```bash
python scripts/build_idea_library.py
python scripts/validate_idea_library.py
python scripts/validate_social_v4.py
python scripts/validate_hub.py
python brand-design-stack/07_Engine/validate_stack.py
```

## Change boundaries

- Stable social policy remains **v4.0**; Brand Guide remains **v2.4**.
- Updated editorial catalogue has **254 ideas** (KDI 134, PSC 120).
- No patient/learner, staff, finance, ERP or safeguarding records are introduced.
- No modifications to `netlify.toml`, `_redirects` or edge-function auth files.
- The original shared assistant UI text was not available publicly; treat the 14 additions as thematic editorial adaptations, not quoted exact prior output.
