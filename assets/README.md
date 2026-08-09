# HSF Website Assets

Shared and document-specific images used by the static HTML site are stored in `assets/images/`.

The HTML pages reference these files with relative paths such as:

```html
<img src="assets/images/hsf-logo.png" alt="Human Safety Foundation logo">
```

Base64 image payloads have been removed from the HTML source so the pages are smaller, easier to edit, and browser caching can be used efficiently.
