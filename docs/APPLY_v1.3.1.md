# Apply HSF Digital Hub v1.3.1

This is a small UI bug-fix release based on v1.3.0.

## Recommended patch application
1. Back up or commit the current v1.3.0 repository state.
2. Extract `hsfdigitalhub-v1.3.0-to-v1.3.1-patch.zip`.
3. Copy the extracted files into the repository root and replace matching files.
4. Review the diff. Only the PIN gate presentation logic and v1.3.1 release/application notes should be new or modified.
5. Commit and push.
6. Confirm Netlify deploys successfully.
7. Test the access screen before tagging v1.3.1.

## Functional check
- Exactly one visibility icon should appear beside the PIN field.
- Clicking it should reveal the PIN and switch to the crossed-eye state.
- Clicking it again should hide the PIN and restore the open-eye state.
- PIN login, incorrect-PIN handling, rate limiting and logout should behave exactly as before.

## Files intentionally changed or added
- `netlify/edge-functions/pin-gate.ts`
- `docs/RELEASE_v1.3.1.md`
- `docs/APPLY_v1.3.1.md`

## Files intentionally unchanged
- `netlify/edge-functions/pin-login.ts`
- `netlify/edge-functions/pin-logout.ts`
- `netlify.toml`
- `_redirects`
- `robots.txt`
- all six master-document HTML files
- `index.html`
- `ERP_Overview.html`
