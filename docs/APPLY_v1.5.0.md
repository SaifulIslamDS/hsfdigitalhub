# HSF Knowledge Hub v1.5.0 — Stable Release Package

This package upgrades the current `SaifulIslamDS/hsfdigitalhub` main baseline to:

**HSF Digital Transformation Knowledge Hub v1.5.0 — Integrated 48-Day Communication Operating System**

## Why this package uses an application step

The release preserves the exact existing 174KB Social Communication Plan with all P01–P48 detail. The application tool patches that existing master in place instead of replacing it with a shortened reconstruction.

## Apply on Windows

1. Extract this release package **into the repository root** (the folder that contains `social_communication_plan.html`).
2. Double-click:

`APPLY_V1.5.0_STABLE.bat`

or run:

```bash
python apply_v1_5_0_stable.py
```

3. The tool will:
   - preserve v3.2 and v2.2 snapshots;
   - promote Social Plan v3.3;
   - promote Brand Guide v2.3;
   - update the Knowledge Hub index;
   - add the release/documentation stack;
   - add the 48-day tracker and source references;
   - verify P01–P48;
   - verify security/gate files remain unchanged;
   - write `docs/VALIDATION_v1.5.0.json`;
   - create a complete repository ZIP under `dist/`.

4. Review the result.
5. Use `GIT_RELEASE_COMMANDS.md` to commit, push and tag.

## Expected complete ZIP after application

`dist/HSF_Digital_Transformation_Knowledge_Hub_v1.5.0_STABLE.zip`

## Stable version map

- Knowledge Hub: **v1.5.0**
- Social Communication Plan: **v3.3**
- Brand Identity & Social Design System: **v2.3**
- 48-Day Tracker: **v3.3**
- Brand Design Stack: **v3.1.0 production candidate** — not promoted by this release

## Important

Do not delete historical v3.2/v2.2 snapshots or pilot documentation. They form part of the controlled institutional record.
