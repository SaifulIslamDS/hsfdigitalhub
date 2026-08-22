# Application Compatibility Profile

The v3.0 masters use conservative SVG 1.1 constructs:
- paths/rectangles/circles/lines/text/groups;
- live Arial text;
- explicit fills/strokes;
- no external images;
- no embedded font files;
- no SVG filters;
- no `foreignObject`;
- no CSS variables inside production masters;
- no linked logo assets.

This profile is intended to open cleanly in Adobe Illustrator 2022 while remaining application-independent. Actual Illustrator 2022 rendering should still be spot-checked on the user's workstation before a production release is declared fully certified.
