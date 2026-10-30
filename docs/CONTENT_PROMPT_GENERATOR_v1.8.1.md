# HSF Social Content Idea Library · AI Prompt Generation Guide

**Knowledge Hub:** v1.8.1 · **Social policy:** v4.0 Approved & Stable  
**Updated:** 30 October 2026  
**Planning & Compiled by:** Saiful Islam

## Purpose and UI

Every one of the **300 editorial idea cards** has **Create AI content prompt**. Clicking opens a focusable modal that automatically loads the selected idea's ID/title, programme, editorial family, E4BL series where assigned, research question or field angle, evidence or source leads, suggested visual format and idea approval classification. The editor chooses a target platform, language and output format. The popup assembles a professional, copy-and-paste-ready creative and research brief without external API calls, browser storage or automated posting.

Available modes: complete production package (caption, visual, carousel and Reel), recommended format, single feed post + visual, carousel, Reel/short video and educational learning activity. Bangla is the default. Facebook is the default platform. All options use the **same 300-source idea data** without changing the KDI/PSC JSON, Excel inventories or approval statuses.

## Workflow

1. Filter to an appropriate idea in `communication/idea-library.html`.
2. Select **Create AI content prompt** on the idea card.
3. Choose platform, language and output format; optionally paste **public-safe** source URLs or approved non-sensitive notes. Never enter names, identifiable child/patient data, restricted operational records or credentials.
4. Click **Copy professional prompt**, paste into an external research/content-generation assistant, and request source verification where available. The user is responsible for deciding if and where any content is shared with that external service.
5. Verify actual primary source data and field occurrence; obtain necessary technical, safeguarding and management approval; only then publish through approved HSF channels.
6. Record the final published asset in approved institutional registers, separate from idea IDs.

## What the generator does not do

- It **does not** perform external search, research verification, image/video generation, scheduling or publishing.
- It **does not** automatically approve an idea, factual claim, field activity, media or post.
- It **does not** guarantee SEO performance, reach, ranking, or virality. It recommends people-first discoverability measures such as natural search phrases, relevant descriptive captions, alt text and restrained hashtags.
- It **does not** access or store ERP records or privately uploaded documents. No external network or local persistence is used by the page's new code.
- It **does not** create fabricated real-looking imagery of HSF children, patients or beneficiaries. Use illustrative graphics or properly approved authentic media.

## Governance

KDI ideas are research leads requiring the original document, date/page/table, geographic scope and claim verification. PSC stories need documented actual events, consent, photographer/video permissions and safeguarding review. E4BL and A2PHC introduce child- and patient-specific restrictions. Educational tips and medical advice require subject-specialist checks. Social Communication policy v4.0, Brand Identity v2.4, Approved Information Standard and the publication gate remain fully applicable.

## Technical architecture

- Builder: `scripts/build_idea_library.py`
- Context: 300 records serialized from current public-safe KDI/PSC source JSON into inline non-executable `application/json`. The JSON is HTML-escaped to avoid script-breakout. No remote fetch.
- JS: `communication/assets/content-prompt-generator.js`
- CSS: `communication/assets/content-prompt-generator.css`
- Validation: `scripts/validate_content_prompt_generator.py`, plus existing `scripts/validate_idea_library.py`, `validate_social_v4.py`, `validate_hub.py` and `validate_e4bl_series.py`.
- Browser access: HTML `<dialog>` with accessible title/description and standard Escape/close focus management; clipboard API on secure origins, then a local legacy copy fallback.

The new feature is an **editorial production aid** only and is compatible with HSF's continuous internal repository-update convention.
