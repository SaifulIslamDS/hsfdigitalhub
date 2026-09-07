# HSF Knowledge Hub v1.6.0 — Repo-Ready Upgrade Package

This folder upgrades the current HSF Digital Transformation Knowledge Hub **v1.5.0** baseline to **v1.6.0 — Programme-Aligned Communication Cycle**.

## Apply

Copy `hsf_v160_release/` into the root of your local `hsfdigitalhub` repository and run:

**Windows:** `hsf_v160_release\APPLY_V1.6.0_STABLE.bat`

or:

```bash
python hsf_v160_release/apply_v1_6_0.py
```

The installer validates the current v3.3 Social Plan, preserves historical snapshots, installs the v4.0 tracker, patches the live plan/index/repository metadata, and performs post-apply validation.

**Important:** review `git diff` before commit. The package intentionally does not touch the Netlify security gate, ERP files or Brand Guide v2.3.
