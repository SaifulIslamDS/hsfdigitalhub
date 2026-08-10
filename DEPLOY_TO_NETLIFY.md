# HSF Demonstration Knowledge Hub — Netlify Deployment

This is a static, no-build demonstration/reference site.

Official public website:
https://hsfbd.org/

## Search protection
This package intentionally includes:
- noindex/nofollow meta tags on all HTML pages
- Netlify X-Robots-Tag headers
- robots.txt with Disallow: /
- no sitemap.xml

Do not submit this demonstration site for public search indexing.

## Netlify
- Build command: none
- Publish directory: .
- index.html is at the root
- netlify.toml and _redirects are included

A demo subdomain under hsfbd.org can be assigned later without changing the official public website.
