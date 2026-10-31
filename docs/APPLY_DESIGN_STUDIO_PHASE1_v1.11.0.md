# Apply Phase 1 patch in local PowerShell / Git repository

**IMPORTANT:** This ZIP is a *root-relative source patch*, not a full repository. It includes an automated applicator, validators, architecture and release documentation. It does NOT contain the original 1.6 MB generated Studio HTML; the applicator regenerates that file from the existing local repository source, so source and compiled output stay consistent.

## Safest local procedure

Open PowerShell and navigate to your actual HSF repo directory; replace the example path before running.

```powershell
Set-Location 'C:\path\to\hsfdigitalhub'
git fetch origin
git switch main
git pull --ff-only origin main
git status --short
git rev-parse HEAD
```

The HEAD must be `13ffe2312824b82fc0c43d817de7282726d5ffc4`. The working tree must be clean. Python 3.10+ is required. Extract the patch ZIP into **this Git root** keeping its `scripts/`, `docs/` and `design-studio/phase1/` folder paths. Do not extract over an unrelated folder. The patch creates new files and does not contain a replacement `netlify.toml`, ERP or master guide.

```powershell
python scripts/studio_phase1.py apply
```

Alternatively, run `./apply-hsf-studio-phase1.ps1`. The Python command is the authoritative path.

The applicator regenerates and updates the needed existing tracked files, compiles `design-studio/index.html` and validates canonical brand/source alignment. It refuses to apply on an unknown or dirty repository HEAD unless separately audited.

## Verify code and data control before commit

```powershell
python scripts/studio_phase1.py check
python scripts/validate_design_studio.py
python scripts/validate_ssot_stability.py
python scripts/validate_hub.py
python scripts/validate_social_v4.py
python scripts/validate_idea_library.py
python scripts/validate_content_prompt_generator.py
python scripts/validate_new_kdi_ideas.py
python scripts/validate_new_psc_ideas.py
python scripts/validate_shared_header.py
git diff --check
git diff --stat
git status --short
```

After applying, you may remove the temporary transport guide `PATCH_README_HSF_STUDIO_PHASE1.txt` from the repository root (the detailed installation guide remains in `docs/`). Check **all** validations are green. Review changes with `git diff`, especially the controls, brand and manifest. The user is responsible for local browser, Illustrator and safeguarding acceptance testing before external publication.

## Commit, push and tag

```powershell
git switch -c feature/hsf-design-studio-phase1-v1.11.0
git add MANIFEST.json README.md CHANGELOG.md index.html `
  design-studio/index.html design-studio/README.md social_communication_plan.html `
  design-studio/source/src/e1_data.js `
  design-studio/source/src/e3_ui.js design-studio/source/src/e4_out.js `
  design-studio/source/STACK_ALIGNMENT_LOCK.json brand-design-stack/README.md `
  governance/SOCIAL_V4_STABLE_CONTROL.json governance/CONTROLLED_DOCUMENT_REGISTER.json `
  scripts/studio_phase1.py scripts/validate_design_studio_phase1.py `
  scripts/validate_design_studio.py scripts/validate_hub.py scripts/validate_social_v4.py `
  scripts/validate_shared_header.py `
  scripts/validate_ssot_stability.py scripts/validate_idea_library.py `
  scripts/validate_content_prompt_generator.py .github/workflows/hub-ci.yml `
  docs/DESIGN_STUDIO_PHASE1_ARCHITECTURE.md docs/DESIGN_STUDIO_PHASE1_QA_MATRIX.md `
  docs/APPLY_DESIGN_STUDIO_PHASE1_v1.11.0.md docs/RELEASE_v1.11.0.md `
  apply-hsf-studio-phase1.ps1

git commit -m "feat(design-studio): phase 1 canonical stack alignment and QA"
git push -u origin feature/hsf-design-studio-phase1-v1.11.0
```

Open a Pull Request from PowerShell:

```powershell
gh auth status
gh pr create --repo SaifulIslamDS/hsfdigitalhub --base main `
  --head feature/hsf-design-studio-phase1-v1.11.0 `
  --title "HSF Design Studio Phase 1 — v1.11.0" `
  --body "Stack alignment, review-state hardening, reproducible Studio build and Phase 1 QA. No new Social/Brand policy." 
```

Wait for GitHub Actions and authorized review to pass, then merge via GitHub UI or `gh pr merge --squash --delete-branch` (only once approved). The `main` merge must be the GitHub Actions green, approved code. Then:

```powershell
git switch main
git pull --ff-only origin main
git tag -a v1.11.0 -m "HSF Knowledge Hub v1.11.0 — Design Studio Phase 1"
git push origin v1.11.0
```

## Create GitHub release using direct GitHub CLI

```powershell
gh auth status
gh repo set-default SaifulIslamDS/hsfdigitalhub
gh release create v1.11.0 --repo SaifulIslamDS/hsfdigitalhub `
  --title "HSF Digital Knowledge Hub v1.11.0 — Design Studio Phase 1" `
  --notes-file docs/RELEASE_v1.11.0.md --verify-tag

gh release view v1.11.0 --repo SaifulIslamDS/hsfdigitalhub `
  --json tagName,name,isDraft,isPrerelease,publishedAt,url
```

**Update release notes later without changing the tag:**

```powershell
gh release edit v1.11.0 --repo SaifulIslamDS/hsfdigitalhub `
  --notes-file docs/RELEASE_v1.11.0.md
```

Update the committed release-note file first if you want repository history to match revised GitHub release text.

No command above automatically deploys Netlify or authorizes content publication.
