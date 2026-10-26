# Install the Full HSF Digital Knowledge Hub v1.7.0 Stable Repository

**Release:** v1.7.0 · Approved Social Communication v4.0 · Brand v2.4  
**Latest update:** 20 October 2026  
**Planning & Compiled by:** Saiful Islam

This ZIP is the **entire updated source tree**, not a patch. It includes one canonical copy of each of the six master HTML documents, 120 KDI ideas, 120 PSC ideas, governance references, assets, validation scripts and Netlify configuration.

## Preserve Git history and local credentials

The distribution intentionally **does not include `.git/` or `.env.local`**. Never publish `.env.local`, API keys, patient/learner records or any other secret to GitHub.

For an existing Windows Git checkout, the safest replacement procedure is:

1. **Back up your existing repository folder** and any local `.env.local` file stored separately.
2. Extract the new ZIP into a **new empty folder**. Do **not** extract it on top of the old folder; doing so would leave historical files in place.
3. If you want to keep the prior Git history, copy only the hidden **`.git` folder** from the old repository root into the new `hsfdigitalhub-main` root. Confirm that this is the exact same repository/branch before committing.
4. Open a terminal in the new folder, create a review branch, inspect the file deletions and additions, validate, and commit:

   ```powershell
   git switch -c social-v4-stable-2026-10-20
   git status --short
   python scripts/validate_hub.py
   python scripts/validate_social_v4.py
   python brand-design-stack/07_Engine/validate_stack.py
   git add -A
   git commit -m "docs: approve Social Communication v4 and align Knowledge Hub v1.6"
   git push -u origin social-v4-stable-2026-10-20
   ```

5. Open a **GitHub pull request** from the new branch into `main`. Review the deleted historical files, verify the exact version/date metadata, and test the Netlify deploy preview and access gate before merging.
6. After management approval of the release, merge the PR and deploy through the existing controlled Netlify process.

## Critical safeguards

- Previous historical HTML documents and old cycle trackers are intentionally absent. The Git commit history preserves their provenance; there is no need to keep active duplicate HTML masters.
- Do not make GitHub private merely to conceal accidentally committed personal records; prevent their inclusion in the first place.
- Only the **v4.0 editorial governance and idea inventories** are approved. Actual statistics, cases, patient/child photos and posts still need verification and final publication authorization.
- The Brand Design Stack is structurally validated but remains a **production candidate** pending Adobe Illustrator 2022 testing.
- This ZIP has not itself been pushed to GitHub or deployed.

## Canonical source filenames

- `social_communication_plan.html` → v4.0 approved/stable
- `brand_identity_master_guide.html` → v2.4 approved visual-identity alignment
- `index.html` → Knowledge Hub v1.7.0
- `MANIFEST.json` → current stable control record
- `docs/RELEASE_v1.7.0.md` → approved release details

## v1.7.0 unified idea library

The old `communication/kdi-idea-bank.html` and `communication/psc-idea-bank.html` are now compatibility redirects only. The one canonical UI is `communication/idea-library.html`. Retain `scripts/build_idea_library.py`, both JSON/XLSX inventory sources, and run `python scripts/validate_idea_library.py` before promoting any changes. The remote `v1.7.0` tag already exists but reflects an older manifest; see the new release notes for careful tag reconciliation.
