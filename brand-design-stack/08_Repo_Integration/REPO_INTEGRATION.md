# Repository Integration

Place the whole folder `brand-design-stack/` (or this versioned directory renamed to that path) at the repository root.

Recommended Git policy:
- keep SVG/JSON/MD/TSV sources in Git;
- do not commit generated exports unless they are approved examples/reference artefacts;
- tag stable production stack versions;
- preserve `asset-index.tsv` and `manifest.json` with each release.

The Knowledge Hub v1.4.0 HTML documents do not need to be changed merely to store this production stack. A future Knowledge Hub release can link to the stack after acceptance.
