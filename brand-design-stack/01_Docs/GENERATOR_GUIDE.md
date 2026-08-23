# Python SVG Generator Guide

The stack is designed as **human-designed archetypes + machine-generated variants**. The engine should never invent a visual system from scratch.

## Content config
A campaign YAML describes story facts, images, focal points, palette and required outputs.

```yaml
campaign_id: HSF-01
story_mode: editorial_photo_story
palette: evergreen
headline: 17 Years. One Mission.
body: Seventeen years of purpose...
label: HSF · Foundation Day
images:
  - path: photo.jpg
    focal: [0.5, 0.42]
outputs:
  facebook: [feed_4x5, story_9x16]
  instagram: [feed_4x5, photo_3x4, story_9x16]
  linkedin: [feed_4x5, article_cover]
```

## Focal point
`[0.0,0.0]` is top-left; `[1.0,1.0]` is bottom-right. Use the focal point to keep faces/critical action visible after crop.

## Adaptive copy
The generator reduces type size and reflows lines when copy becomes longer. Editorially, shorten the copy before shrinking text too far.

## Logo
Masters contain a square `LOGO_COMPONENT_SLOT`. The approved vector logo remains central and authoritative.

## Export
SVG is the master. PNG/PDF are publishing derivatives. Keep the SVG in the repository.
