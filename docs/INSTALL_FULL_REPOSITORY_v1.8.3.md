# HSF v1.8.3 — Full-repository installation and tracked historical-file removal

**Planning & Compiled by:** Saiful Islam  
**Date:** 30 October 2026

This is the **entire current repository**, not a patch. Its ZIP does not include `.git/` or local `.env` settings.

## When you paste the unzipped folder into your existing Git checkout

A paste/overwrite operation **does not remove obsolete files already tracked by Git**. Run the commands below from the existing repository root, after copying the new files. `git rm` removes the six outdated bank sources from the active repository while **retaining their contents in Git history**.

```powershell
# Run these commands in the existing hsfdigitalhub repository root

git status

git rm --ignore-unmatch -- communication/research/kdi_120_ideas.json communication/research/kdi_134_ideas.json communication/research/psc_120_ideas.json
git rm --ignore-unmatch -- communication/research/HSF_Knowledge_Data_Insight_120_Idea_Bank_Approved_Editorial_Inventory.xlsx communication/research/HSF_Knowledge_Data_Insight_134_Idea_Bank_Editorial_Inventory.xlsx communication/research/HSF_Programme_Stories_Communication_120_Idea_Bank_Approved_Editorial_Inventory.xlsx

# Historical RC-specific guides have moved into docs/archive/ (old versions retained in Git history)
git rm --ignore-unmatch -- docs/RELEASE_v1.8.0_CANDIDATE.md docs/INSTALL_FULL_REPOSITORY_v1.8.0_CANDIDATE.md

python scripts/build_idea_library.py
python scripts/validate_ssot_stability.py
python scripts/validate_hub.py
python scripts/validate_social_v4.py
python scripts/validate_e4bl_series.py
python scripts/validate_shared_header.py
python scripts/validate_idea_library.py
python scripts/validate_content_prompt_generator.py
python scripts/validate_design_studio.py
python brand-design-stack/07_Engine/validate_stack.py

git add -A
git diff --cached --check
git diff --cached --stat
git commit -m "Stabilize HSF Knowledge Hub v1.8.3 institutional SSOT and validation"
git push origin main
```

If `git rm` reports an unexpected path or another developer changed the same files, inspect `git status` and reconcile before proceeding. No force push, destructive history rewrite or `git clean -fdx` is necessary.

## Optional Git tag

```powershell
git tag --list v1.8.3
git tag -a v1.8.3 -m "HSF Digital Knowledge Hub v1.8.3 - Institutional SSOT stable source"
git push origin v1.8.3
```

Only create the tag if `git tag --list` returns nothing. If the repository is not on `main`, switch to it and pull before pasting, rather than trying to merge unrelated changes blindly.

## Archive and public safety

The obsolete source files are recoverable through prior Git commits/tags; deleting them from the current branch **does not erase them from public GitHub history**. If any removed file contains actual restricted information, a separate incident-response and Git-history cleanup assessment would be required. This release assumes the previous editorial inventory files are public-safe and does not claim otherwise without review.
