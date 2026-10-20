# HSF Approved Information Standard

**Document review:** Stable reference · **Last updated:** 20 October 2026 · **Planning & Compiled by:** Saiful Islam

**Status:** Institutional baseline  
**Effective:** 11 September 2026

## Purpose

The Approved Information Layer is the controlled bridge between HSF operational systems and public reporting/communication.

Preferred flow:

`ERP / Operational Dataset → Verification & MEAL → Indicator → Analysis & Learning → Management Approval → Approved Information → Report / Website / Social Media`

Raw operational records must not flow directly into public systems.

## Minimum record

An approved information record should contain, at minimum:

- `indicator_code`
- `programme_code`
- `reporting_period`
- `value`
- `unit`
- `evidence_source`
- `evidence_status` (`RAW`, `CLEANED`, `VERIFIED`, `CALCULATED`, `ESTIMATED`, `INFERRED` as applicable)
- `verification_status` and verifier/verification date when relevant
- `approval_status` and approval authority/date
- `data_classification`
- `publication_state`
- `valid_from`
- `supersedes` or supersession reference when replacing an earlier public value

## Evidence rule

`CALCULATED`, `ESTIMATED` and `INFERRED` values may be useful and may be approved for reporting when methodology is transparent, but they must never be silently relabeled as `VERIFIED` operational records.

Communication/field registers may retain practical source descriptors such as “observed/documented” for workflow purposes. Before information enters the Approved Information Layer, those descriptors must be mapped to the canonical evidence-state model without overstating verification.

## Publication rule

A value may be used publicly only when:

1. the evidence source is identifiable;
2. evidence status is explicit;
3. required verification is complete;
4. management approval is recorded;
5. classification permits publication; and
6. publication state is `APPROVED_PUBLIC`.

## Sensitive programmes

For E4BL and A2PHC, public outputs should normally use aggregate/anonymized information. Learner/patient identifiers and sensitive background details remain inside protected operational systems.

## Supersession

When a verified figure changes because of correction, new reporting-period data or improved evidence, the new approved record should point to the prior value rather than silently overwrite institutional history.
