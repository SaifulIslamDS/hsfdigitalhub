# HSF Digital Transformation Knowledge Hub v1.3.1

## Release focus
PIN visibility-toggle rendering fix.

## What changed
- Fixed a browser/UI case where both the open-eye and crossed-eye PIN visibility icons could appear at the same time.
- Reworked the visibility control to use one SVG container with explicit CSS state switching through `aria-pressed`.
- Added suppression for the legacy Microsoft password reveal control so it cannot compete with the HSF custom visibility button.
- Simplified the toggle JavaScript so it only changes the input type and accessibility state.

## What did not change
- PIN value handling or validation.
- Login endpoint, logout endpoint, signed session, session duration or rate limiting.
- Netlify environment-variable model.
- Fail-closed behavior.
- Login-card layout and design system.
- Six master documents, homepage, navigation or content.
- 24 Themes × 2 connected Issue–Resolution posts = 48 posts.
- ERP links or ERP Overview.

## Security note
This release changes only the presentation logic inside `netlify/edge-functions/pin-gate.ts`. No authentication rule, secret handling, session signing, login handler, logout handler, Netlify configuration, redirects or robots controls were changed.
