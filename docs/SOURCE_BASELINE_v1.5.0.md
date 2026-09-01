# Source Baseline — Knowledge Hub v1.5.0 Build

**Repository:** `SaifulIslamDS/hsfdigitalhub`  
**Branch inspected:** `main`  
**Source commit at build:** `515a0bccc50cc9808d7173764e48a3c36ecdc88a`  
**Build date:** 1 September 2026

The v1.5.0 stable release application was designed against this current repository state, which contained:

- Social Communication Plan v3.2 canonical master;
- Brand Identity & Social Design System v2.2 canonical master;
- v3.3 pilot HTML and pilot documentation;
- `social-overlay-register.xlsx`;
- Brand Design Stack v3.1.0 production candidate;
- the existing Netlify PIN-gate architecture.

The release tool validates expected source markers before promotion and refuses to proceed when the baseline structure cannot be recognized safely.

## Security boundary

The release does not modify:

- `netlify.toml`
- `_redirects`
- `netlify/edge-functions/pin-gate.ts`
- `netlify/edge-functions/pin-login.ts`
- `netlify/edge-functions/pin-logout.ts`

Checksums are captured before and after application and recorded in `docs/VALIDATION_v1.5.0.json`.
