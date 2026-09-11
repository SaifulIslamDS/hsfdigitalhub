# Contributing to the HSF Knowledge Hub

## Before changing content

1. Identify whether the file is a current controlled record, candidate, historical snapshot or generated asset.
2. Do not silently rewrite a stable historical release.
3. Preserve explicit evidence states (`VERIFIED`, `CALCULATED`, `ESTIMATED`, `INFERRED`, etc.).
4. Do not introduce beneficiary/staff/donor personal records or secrets.
5. If a change affects institutional vocabulary, update the HSF Digital System Contract only through controlled governance review and mirror the change in HSF ERP.

## Commit style

Prefer Conventional Commit-style messages, for example:

- `docs(meal): clarify indicator verification rule`
- `docs(brand): align production candidate metadata`
- `fix(hub): correct canonical version status`
- `security(repo): strengthen public asset validation`

## Validation

Run:

```bash
python scripts/validate_hub.py
```

A change should not be called stable/released until repository validation passes and the relevant management/content approval is complete.
