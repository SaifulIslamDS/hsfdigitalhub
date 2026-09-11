# HSF External Alignment Baseline

**Baseline date:** 11 September 2026  
**Purpose:** Practical external alignment for HSF digital governance and software development.  
**Claim rule:** HSF may state that these are alignment baselines. This file does **not** establish certification.

## Application security

### OWASP Application Security Verification Standard (ASVS) 5.0.0
Use ASVS 5.0.0 as the web-application technical security verification baseline for HSF ERP.

Official: https://owasp.org/www-project-application-security-verification-standard/

### OWASP Top 10:2025
Use OWASP Top 10:2025 as the developer/risk-awareness baseline. It complements but does not replace detailed ASVS verification.

Official: https://top10.owasp.org/2025/

## Organizational cybersecurity

### NIST Cybersecurity Framework (CSF) 2.0
Use CSF 2.0 to organize HSF cybersecurity risk outcomes across Govern, Identify, Protect, Detect, Respond and Recover.

Official: https://www.nist.gov/cyberframework

## Secure software development

### NIST SP 800-218 — Secure Software Development Framework (SSDF) 1.1
Use SSDF 1.1 as the secure software-development lifecycle baseline. Later final revisions should be adopted only through controlled review.

Official: https://csrc.nist.gov/pubs/sp/800/218/final

## Accessibility

### WCAG 2.2 Level AA
Target WCAG 2.2 AA for the Knowledge Hub and ERP web interfaces.

Official: https://www.w3.org/TR/WCAG22/

## Versioning and commits

### Semantic Versioning 2.0.0
Use MAJOR.MINOR.PATCH semantics for software/public interfaces where versioning applies. Do not silently rewrite a published stable release.

Official: https://semver.org/

### Conventional Commits 1.0.0
Preferred format: `type(optional-scope): concise description`.

Recommended types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `security`.

Official: https://www.conventionalcommits.org/en/v1.0.0/

## Current exceptions / technical debt

Alignment is not the same as full conformance. Known technical-debt items must remain visible rather than being hidden behind a compliance claim. Examples currently include the Knowledge Hub's runtime Tailwind CDN dependency and the ERP's incomplete production authentication/RBAC/persistence implementation.

Review this baseline at least annually and when a referenced standard publishes a material final revision relevant to HSF.
