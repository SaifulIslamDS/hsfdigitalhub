# HSF v1.8.0 Candidate — Full Source Installation and Git Review

Planning & Compiled by: **Saiful Islam** · 30 October 2026

1. Download the complete `HSF_Digital_Knowledge_Hub_v1.8.0_CANDIDATE_FULL_300_Ideas_2026-10-30.zip` and extract it into a fresh folder. It is a **full source tree**, not a patch. The package deliberately excludes `.git`, `.env.local` and credential materials.
2. Preserve the original repository clone (with its `.git` folder) and do not overlay the archive without removing outdated files; the superseded `kdi_134_ideas.json`, `psc_120_ideas.json` and older two editorial workbooks must be removed in the working tree.
3. Back up local changes, then `git switch -c feature/idea-library-v1.8.0-review` from the latest approved release branch. Copy the new source into the checkout, preserving `.git` and `.env.local`.
4. Run validations listed in `docs/RELEASE_v1.8.0_CANDIDATE.md`; open `communication/idea-library.html` and `social_communication_plan.html` through your normal preview server.
5. Check `git status --short`, `git diff --check` and `git diff --stat`. Ensure no secrets, identifiable learner/patient records or case consent files are staged.
6. `git add -A` then `git commit -m "feat(communication): propose 300-idea conditional library and right contents drawer"` and `git push -u origin feature/idea-library-v1.8.0-review`.
7. Open a PR against main. Obtain approval and complete preview QA before merging. **Do not create or re-point an approved stable `v1.8.0` tag while 46 ideas are still pending management review.**
8. Once reviewed/merged and verified: `git switch main && git pull --ff-only origin main`; create a final annotated tag as a separate authorized release step; publish its release note with `gh release create`.

**Institutional boundary:** Social policy v4.0 remains approved. Only the new v1.8.0 editorial/library release is a management candidate; the 46 ideas are not yet editorial-approved, and no post is publication-approved by this change.


## Candidate UI refinement, 30 October 2026 (rc.2)

The R2 full ZIP includes all 300 ideas and every master document. Replace the existing project-root source files as a complete update, keeping the `.git` folder and local secrets. GitHub has a prior `v1.8.0-rc.1` tag. Do not overwrite it. After validating and committing this refinement, use an annotated `v1.8.0-rc.2` tag instead:

```powershell
git status
git add -A
git diff --cached --check
git commit -m "fix(communication): hide zero-result filters and remove homepage promo"
git push origin main
git tag -a v1.8.0-rc.2 -m "HSF Digital Knowledge Hub v1.8.0 candidate refinement 2"
git push origin v1.8.0-rc.2
```

Review all changed files before committing. Candidate status and the 46 proposed editorial ideas remain unchanged.
