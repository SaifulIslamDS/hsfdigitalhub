# Git Commands — HSF Knowledge Hub v1.5.0 Stable

Run these commands from the repository root **after the v1.5.0 application/validation succeeds and you review `git status`**.

## 1. Review

```bash
git status
git diff --check
git diff --stat
```

## 2. Commit and push `main`

```bash
git add .
git commit -m "Release Knowledge Hub v1.5.0 integrated 48-day communication system"
git push origin main
```

## 3. Create the stable annotated tag

```bash
git tag -a v1.5.0 -m "HSF Digital Transformation Knowledge Hub v1.5.0 — Integrated 48-Day Communication Operating System"
git push origin v1.5.0
```

## 4. Verify the freeze

```bash
git status
git log -1 --oneline
git show --stat --oneline v1.5.0
git tag --list "v1.5.0"
```

## Optional pre-tag safety check

If you want to confirm the remote commit before tagging:

```bash
git fetch origin
git status -sb
git rev-parse HEAD
git rev-parse origin/main
```

The last two SHAs should match before creating the tag.
