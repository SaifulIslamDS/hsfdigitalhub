# HSF v1.9.0 — Safe full-repository installation and push (PowerShell)

Extract `HSF_Digital_Knowledge_Hub_v1.9.0_FULL_400_Ideas_2026-10-30.zip` to a **separate folder**. Copy the **contents of `hsfdigitalhub-main`** into the root of your existing local Git checkout. Preserve `.git`, local credentials and untracked local files. Do not overwrite or copy another `.git` directory.

**IMPORTANT:** Pasting updated files does **not** remove older tracked files. In PowerShell, inside the Git repository root:

```powershell
git status --short
git rm --ignore-unmatch -- communication/research/kdi_160_ideas.json communication/research/HSF_Knowledge_Data_Insight_160_Idea_Bank_Editorial_Inventory.xlsx
python scripts/build_idea_library.py
python scripts/validate_ssot_stability.py
python scripts/validate_new_kdi_ideas.py
python scripts/validate_idea_library.py
python scripts/validate_content_prompt_generator.py
python scripts/validate_social_v4.py
python scripts/validate_design_studio.py
python brand-design-stack/07_Engine/validate_stack.py

git add -A
git diff --cached --check
git diff --cached --stat
# Review staged changes to make sure local files/credentials are not included.
git commit -m "Expand HSF Knowledge Hub v1.9.0 to 400 editorial ideas"
git push origin main
```

**Optional milestone tag** (only once, after successful push):

```powershell
git tag --list v1.9.0
git tag -a v1.9.0 -m "HSF Digital Knowledge Hub v1.9.0 - 400 Idea Library"
git push origin v1.9.0
```

**Optional GitHub release** if `gh` is installed: `gh release create v1.9.0 --verify-tag --title "HSF Knowledge Hub v1.9.0" --notes-file docs/RELEASE_v1.9.0.md`.

The two deleted files remain available in earlier Git commits and prior tags. The original six superseded archives were removed in v1.8.3; do not reintroduce them. The repository is public even when the Netlify site is PIN-gated; never add personal photographs or records, ERP data, approval forms or credentials.
