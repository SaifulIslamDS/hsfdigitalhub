# HSF Digital Transformation Knowledge Hub — Netlify Deployment

Static, no-build demonstration/reference site.

Official public website: https://hsfbd.org/

## Master documents
- digital_transformation_framework.html
- website_content_editorial_guidelines.html
- social_communication_plan.html
- ERP_Overview.html
- brand_identity_master_guide.html

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

If variable scopes are available, the Functions scope should be included.

The site intentionally fails closed when these values are not configured.

Full setup and testing instructions are available in:

`SECURITY_PIN_GATE.md`
