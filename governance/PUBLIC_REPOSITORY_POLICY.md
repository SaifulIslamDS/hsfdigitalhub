# HSF Public Repository Policy

**Effective:** 11 September 2026  
**Applies to:** `SaifulIslamDS/hsfdigitalhub` and `SaifulIslamDS/HSF_ERP`

HSF currently chooses to keep both repositories public. Every committed file must therefore be safe for public disclosure.

## Core rule

**A public GitHub repository is public even when a deployed website uses a PIN, signed cookie, no-index header or other preview protection.** Deployment access controls do not make repository source confidential.

## Allowed content

- Source code with no embedded secrets or restricted records.
- Architecture and system-design documentation safe for public disclosure.
- Policies, frameworks, standards and approved public institutional documents.
- Synthetic demonstration records.
- Properly anonymized examples that cannot reasonably identify a person.
- Approved public statistics and communication assets.
- Public brand assets and public-safe templates.

## Prohibited content

Do not commit:

- passwords, API keys, tokens or production secrets;
- private keys or credential exports;
- real patient-level or clinical records;
- real learner registers or safeguarding records;
- staff personal files or payroll exports;
- restricted bank/payment data;
- donor/sponsor personal data;
- confidential procurement or finance records;
- contact lists or identifying details of vulnerable people unless explicitly approved for public release;
- raw operational database dumps, exports or backups.

## Synthetic data

Synthetic UI/demo data must be clearly distinguishable from real HSF operational records and must not reuse identifiable real patient, learner, staff, donor or financial details.

## Binary/public assets

Operational-looking spreadsheets, PDFs and similar binary files may be committed only when the owner confirms that they are public-safe. The Knowledge Hub records controlled public data-like assets in `PUBLIC_ASSET_REGISTER.json`.

## Incident response

If restricted information is committed publicly:

1. Treat the information as exposed; deleting the current file alone is not enough.
2. Revoke/rotate any exposed credential immediately.
3. Notify the responsible HSF management/technical owner.
4. Remove the active material and assess Git history, caches and forks as applicable.
5. Document the incident and corrective action.

Automated checks supplement human review; they do not replace classification responsibility.
