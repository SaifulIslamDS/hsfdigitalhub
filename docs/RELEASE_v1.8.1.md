# HSF Digital Knowledge Hub v1.8.1 — Per-Idea Professional AI Prompt Generator

**Release date:** 30 October 2026  
**Update type:** Continuous internal update, not a release candidate  
**Social Communication Ecosystem:** v4.0 Approved & Stable  
**Brand Identity & Design System:** v2.4  
**Planning & Compiled by:** Saiful Islam

## Summary

Introduces an accessible, client-side **Create AI content prompt** action on each of the 300 Social Content Idea Library cards. The popup creates a tailored, copy-and-paste-ready content-production brief for the selected KDI/PSC idea, with options for channel, language and format. Prompts support original captions, static graphics, educational carousels, Reels and age-appropriate teaching activities, while clearly requiring verified evidence and HSF safeguarding and publication approval.

## In scope

- One reusable modal, 300 trigger buttons and 300 controlled idea contexts.
- Choices: Facebook, Instagram, LinkedIn; Bangla, English or bilingual; complete creative package, recommended format, feed image, carousel, Reel and learning activity.
- Source and evidence placeholders, KDI research-led and PSC field-confirmation-specific directions, programme-specific privacy and technical controls, claim-to-source trace, accessibility, people-first social discovery and honest measurement.
- Clipboard copy with on-device fallback. No network request, login, automated publishing or AI API.
- Updated builder, current manifest/README, validation and change log.

## Unchanged

All 300 source idea records: 160 KDI (134 earlier editorial-approved + 26 proposed), 140 PSC (120 earlier editorial-approved + 20 proposed). 34 E4BL series mappings; approved Social policy v4.0; Brand v2.4; ERP and MEAL frameworks; Netlify security controls. No idea is inherently a factually verified or publication-approved post.

## QA & outstanding

Run `python scripts/build_idea_library.py`, `python scripts/validate_content_prompt_generator.py`, `python scripts/validate_idea_library.py`, `python scripts/validate_social_v4.py`, `python scripts/validate_hub.py`, and `python scripts/validate_shared_header.py`. Perform final deployed-browser clipboard and mobile checks. Originality, helpfulness and clear metadata can support discoverability but **cannot guarantee reach**.

## Simple Windows PowerShell upload

After copying the unzipped **full source** into your existing cloned repository root (preserving `.git`):

```powershell
git add -A
git commit -m "Add per-idea AI content prompt generator to HSF Knowledge Hub v1.8.1"
git push origin main
```

If HSF chooses to tag this milestone, first confirm `v1.8.1` does not exist; then:

```powershell
git tag -a v1.8.1 -m "HSF Digital Knowledge Hub v1.8.1 - AI content prompt creator"
git push origin v1.8.1
```

The repository contains no created or public-post-approved content in this update.
