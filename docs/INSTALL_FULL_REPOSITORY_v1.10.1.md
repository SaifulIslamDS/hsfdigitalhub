# Install v1.10.1 in a local HSF Knowledge Hub Git checkout (PowerShell)

The full ZIP includes one repository root folder (`hsfdigitalhub-main/`). Its 500 idea records and six canonical masters are retained. Do not copy the wrapper folder *into* your existing repository: copy the **contents**. The ZIP excludes `.git`, secrets, sensitive records, and runtime credentials.

## 1. Start from current clean v1.10.0 main

```powershell
git status --short
git branch --show-current
git pull --ff-only origin main
```

Review and commit/stash existing changes before copying. Preserve `.git`, `.env`, local credentials, and deployment settings. Paste the extracted `hsfdigitalhub-main` **contents** into the current repo root.

## 2. Run source build and validation

```powershell
python scripts/build_idea_library.py
python scripts/validate_editorial_approval_200.py
python scripts/validate_idea_library.py
python scripts/validate_new_kdi_ideas.py
python scripts/validate_new_psc_ideas.py
python scripts/validate_e4bl_series.py
python scripts/validate_content_prompt_generator.py
python scripts/validate_social_v4.py
python scripts/validate_hub.py
python scripts/validate_shared_header.py
python scripts/validate_design_studio.py
python scripts/validate_ssot_stability.py
python brand-design-stack/07_Engine/validate_stack.py
```

## 3. Stage, review, commit and push

```powershell
git add -A
git diff --cached --check
git diff --cached --stat
git status --short
# Review staged changes for unwanted confidential assets or unrelated edits.
git commit -m "Approve 200 reviewed editorial ideas for planning v1.10.1"
git push origin main
```

**No historical file deletion is required by this patch** if your local checkout was already cleaned for v1.10.0. Do not rewrite or delete Git history.

## 4. Create annotated tag after successful GitHub Actions

```powershell
git tag --list v1.10.1
git tag -a v1.10.1 -m "HSF Digital Knowledge Hub v1.10.1 - 500 Editorial Ideas Approved"
git push origin v1.10.1
```

Only create the tag if it does not already exist and `main`'s CI passes.

## 5. GitHub CLI release notes — create OR edit

```powershell
# If the GitHub release does not exist:
gh release create v1.10.1 --verify-tag --title "HSF Digital Knowledge Hub v1.10.1 - Editorial Approval Update" --notes-file docs/RELEASE_v1.10.1.md
# If the release already exists, update it:
gh release edit v1.10.1 --notes-file docs/RELEASE_v1.10.1.md
# Verify the release:
gh release view v1.10.1 --web
```

Use **create or edit**, not both unnecessarily. Publishing the GitHub software release is not the same as authorizing a social media post.
