# HSF Digital Transformation Knowledge Hub — Netlify Deployment

**Document review:** Stable reference · **Last updated:** 20 October 2026 · **Planning & Compiled by:** Saiful Islam

Static, no-build demonstration/reference site.

Official public website: https://hsfbd.org/

## Master documents
- digital_transformation_framework.html
- website_content_editorial_guidelines.html
- social_communication_plan.html
- ERP_Overview.html
- brand_identity_master_guide.html
- impact_meal_learning_framework.html

UI redesign references are stored in `assets/mockups/`.

## Search protection
This demonstration package intentionally keeps noindex/nofollow protection, a Netlify X-Robots-Tag header, and `robots.txt` with `Disallow: /`. Do not submit this demonstration site for public search indexing.

## Netlify
- Build command: none
- Publish directory: `.`
- `index.html` is at the ZIP root
- `netlify.toml` and `_redirects` are included


## Protected-access requirement

This version includes a site-wide 6-digit PIN gate using Netlify Edge Functions.

Before the protected site can be used, these Netlify Environment variables are required:

- `HSF_ACCESS_PIN` — exactly six numeric digits
- `HSF_ACCESS_SECRET` — a separate random value of at least 32 characters

The inactivity window is controlled by:

- `HSF_IDLE_TIMEOUT_MINUTES` — whole minutes from 1 to 720; recommended value `30`; defaults to 30 when omitted

If variable scopes are available, the Functions scope should be included.

The site intentionally fails closed when these values are not configured.

Full setup and testing instructions are available in:

`SECURITY_PIN_GATE.md`

## Design Studio internal tool · v1.8.2

The Knowledge Hub now publishes `design-studio/index.html` as a **self-contained, offline-capable authoring tool** and `design-studio/source/` for source-controlled maintenance. The existing Netlify Edge PIN gate is configured with a catch-all path; verify an unauthenticated request to `/design-studio/index.html` is blocked in the deployed environment, and a signed-in staff session can load it. A deployment PIN does **not** hide files in the public GitHub repository. Never commit identifiable HSF learner/patient photographs, consent files, unpublished confidential content, passwords or private assets. Staff must review the exact exported artifact before public use.
