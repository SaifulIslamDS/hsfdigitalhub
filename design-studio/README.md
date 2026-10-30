# HSF Design Studio | Internal Visual Production Tool

**Knowledge Hub version:** v1.8.3 · **Updated:** 30 October 2026  
**Planning & Compiled by:** Saiful Islam

**Open app:** [Design Studio](index.html) (self-contained offline-capable HTML). To use without internet, download `index.html` with your browser's Save As function and open in desktop Chrome/Edge; photo data and designs remain on the current device. This is not the ERP and stores no central record. **Approved public-use visuals still require independent HSF review.**

## Development source

`source/src/` (six ordered JS modules and HTML shell), `source/assets/`, `source/vendor/`, and `source/build.py` are the maintained source. Regenerate the browser artifact rather than editing built HTML directly:

```bash
cd design-studio/source
python build.py
```

The generated `source/dist/HSF_Design_Studio_offline.html` must match deployed `design-studio/index.html` after a release build. `source/dist/hsf-design-studio-online.html` uses external CDNs; the Hub deploys the **offline build only**, with libraries embedded and no required external CDN access.

The official source of brand rules remains `../brand_identity_master_guide.html` and colour tokens are controlled by `../brand-design-stack/02_Tokens/brand-tokens.json`. Design Studio is a **production tool**, not a seventh master document, nor proof of Brand Stack Illustrator certification.

## Social v4.0 integration

The studio now includes 2 streams, 7 editorial families, 2 E4BL series labels, optional `KDI-###` / `PSC-###` origin IDs, and the controlled `HSF-COM-YYYY-NNNN` content ID convention. The `Issue → Practical Response` multi-slide option is optional, not a 48-post cycle. The current idea bank is the [300-idea Communication Hub](../communication/idea-library.html). From any card, use **Download Design Brief (.json)** to get a *public-safe editorial concept file*, then import it in Design Studio → **Content**. The import does not retrieve ERP, evidence, consent records or approved claims and **always resets approval fields to pending**.

## Safeguarding and privacy

- Never commit real learner/patient photos, private case notes, consent records, sensitive HR/finance data, passwords, or actual unpublished design files to the public GitHub source repository.
- Do not assume a URL protected by a Netlify PIN protects GitHub source files; the repository is public.
- The studio's photo-consent checkbox is **self-attestation** only. The exported content record reports editor-selected states; it cannot verify original consent or management approval.
- Select **Clear saved design, photos and logo from this browser** before sharing a device. On public/shared computers, avoid working with any identifiable HSF participant photo at all. Browser localStorage may retain images or overflow; cleanup is best-effort and is not forensic deletion.
- No automatic internet connection is needed for the deployed offline build. No direct data transmission from the idea library to the studio; users deliberately download and import a JSON file.
- A management-cleared output is a decision about the **exact final visual** and its source evidence, not a property of its originating idea. The editor warns of missing review/evidence and exports a public-safe record; it is NOT an automated approval gate.

## Known limitations / testing obligations

SVG brush masking may not match raster output; Bangla direct text editing has cursor-offset limitations; video recording takes real time; large photos can exceed browser localStorage quota. Illustrator 2022 import of generated SVG files and full cross-browser export QA are outstanding. Current automated checks do not certify photo consent or visual design correctness. Do not publish until HSF's technical, safeguarding, brand and management checks are complete.

## Third-party components

Fabric.js v5.3.0, jsPDF v2.5.1, Lucide icons and embedded typefaces are included in the *original user-supplied studio source*. Before redistributed deployment, retain upstream licence notices; verify third-party attribution and rights in [Third-party notices](THIRD_PARTY_NOTICES.md). Do not distribute extracted font files separately.
