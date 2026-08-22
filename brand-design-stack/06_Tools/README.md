# Tools

`validate_stack.py` checks portable SVG constraints and required logo/metadata structure.

`recolor_svg.py` creates a working copy in another HSF brand expression using `data-token` attributes. Example:

```bash
python recolor_svg.py ../04_Templates/instagram/01_Feed_4x5/01_Programme_Story.svg ../02_Design_Tokens/HSF_Design_Tokens_v3.0.json "Hope Gold" -o E4BL_Programme_Story.svg
```
