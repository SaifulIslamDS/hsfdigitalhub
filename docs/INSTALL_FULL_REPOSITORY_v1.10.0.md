# Install HSF Knowledge Hub v1.10.0 in an existing local Git checkout

**Use only after extracting the complete ZIP into a separate folder.** Copy the **contents of `hsfdigitalhub-main`** to your existing repository root, preserving its `.git/`, local settings and credentials. The ZIP contains no `.git` history or secrets. Ideally start from clean `main` at v1.9.0 and back up any uncommitted work first.

## 1. Before copying (PowerShell in repo root)

```powershell
git status --short
git branch --show-current
git pull --ff-only origin main
```

Review changes and safely commit/stash unrelated work before proceeding. Copy the extracted **contents** of `hsfdigitalhub-main` to the same folder, not the parent wrapper.

## 2. Remove superseded tracked files

Copy/paste does not delete files from Git history or your working checkout. Run this explicitly **after copying**:

```powershell
git rm --ignore-unmatch -- communication/research/psc_140_ideas.json communication/research/HSF_Programme_Stories_Communication_140_Idea_Bank_Editorial_Inventory.xlsx
```

Preserve Git history; do not use destructive history rewriting.

## 3. Build, validate, inspect, commit, push

```powershell
python scripts/build_idea_library.py
python scripts/validate_new_psc_ideas.py
python scripts/validate_new_kdi_ideas.py
python scripts/validate_ssot_stability.py
python scripts/validate_idea_library.py
python scripts/validate_social_v4.py
python scripts/validate_content_prompt_generator.py
python scripts/validate_e4bl_series.py
python scripts/validate_design_studio.py
python scripts/validate_shared_header.py
python scripts/validate_hub.py
python brand-design-stack/07_Engine/validate_stack.py

git add -A
git diff --cached --check
git diff --cached --stat
# Examine changes and confirm there are NO sensitive files or unrelated modifications.
git commit -m "Expand HSF PSC idea library to 500 total ideas v1.10.0"
git push origin main
```

## 4. Tag and GitHub Release (GitHub CLI)

Only tag after GitHub Actions passes for the pushed commit and the tag does not already exist:

```powershell
git tag --list v1.10.0
git tag -a v1.10.0 -m "HSF Digital Knowledge Hub v1.10.0 - 500 Idea Library"
git push origin v1.10.0
# If no GitHub Release exists:
gh release create v1.10.0 --verify-tag --title "HSF Digital Knowledge Hub v1.10.0 - 500 Idea Library" --notes-file docs/RELEASE_v1.10.0.md
# If the release already exists, UPDATE its notes instead:
gh release edit v1.10.0 --notes-file docs/RELEASE_v1.10.0.md
gh release view v1.10.0 --web
```

Do not execute both create and edit unless editing an existing release is actually necessary. A GitHub tag and a GitHub Release page are separate objects.

The previous PSC-140 files remain accessible under the v1.9.0 tag. This is a public GitHub repository even if the hosted website is PIN-gated, so never commit raw HSF field records, patient or learner data, consent forms, personal images, keys or credentials.
