# Apply HSF Digital Hub v1.3.0

This ZIP is a full replacement build based on v1.2.1.

## Recommended full-build application
1. Keep a backup of the currently deployed/repository v1.2.1 folder.
2. Extract `hsfdigitalhub-1.3.0.zip`.
3. Copy the contents of the extracted `hsfdigitalhub-1.3.0` folder into the repository root, replacing matching files.
4. Do not copy any local `.env` or secret values into Git. The build contains no real PIN or secret.
5. Review the changed HTML files, then commit and push.
6. Confirm the Netlify deployment succeeds and test PIN access, navigation, the six master documents and the ERP UI links.
7. Tag only after the deployed build is verified.

## Files intentionally changed
- `index.html`
- `social_communication_plan.html`
- `impact_meal_learning_framework.html`
- `brand_identity_master_guide.html`
- `website_content_editorial_guidelines.html`
- `digital_transformation_framework.html`
- `docs/RELEASE_v1.3.0.md`
- `docs/APPLY_v1.3.0.md`
- `docs/DEPLOY_TO_NETLIFY.md`

## Files intentionally unchanged
- `ERP_Overview.html`
- `netlify/edge-functions/pin-gate.ts`
- `netlify/edge-functions/pin-login.ts`
- `netlify/edge-functions/pin-logout.ts`
- `netlify.toml`
- `_redirects`
- `robots.txt`

See the release notes for the full change summary.
