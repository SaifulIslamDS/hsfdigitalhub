# HSF Field Data Gateway & Offline-First Architecture

**Document review:** Stable reference · **Last updated:** 20 October 2026 · **Planning & Compiled by:** Saiful Islam

**Status:** Management Review Draft  
**Date:** 12 September 2026  
**Owner:** Human Safety Foundation (HSF)  
**Applies to:** HSF ERP architecture and related institutional governance  
**Current Knowledge Hub baseline:** v1.6.0 (communication governance only; ERP proposal otherwise unchanged)  
**Current Digital Institutional System Contract:** v1.0.0  
**Classification:** Public-safe architecture/governance document; no operational records

## 1. Purpose

HSF requires a field-facing data collection gateway that connects programme delivery directly with the Operational ERP while remaining usable in low-connectivity and offline environments.

The Field Data Gateway is not a separate public system and not an independent programme database. It is a controlled entry layer of the HSF ERP.

The intended institutional flow is:

**Field Reality â†’ Offline-First Field Data Gateway â†’ Operational ERP â†’ Verification / Finance / MEAL â†’ Management Decision â†’ Approved Information â†’ Reporting / Public Communication**

Raw or sensitive operational records must remain inside protected operational systems.

## 2. Why offline-first is required

HSF programme delivery may take place in schools, health camps, community locations and other field settings where connectivity is intermittent or unavailable.

Field users should therefore be able to:

- open assigned work while connected;
- capture required records while offline;
- save records safely on the authorized device;
- review incomplete records before submission;
- synchronize records when connectivity returns;
- see clear synchronization and error states;
- avoid duplicate data entry at field and central-office levels.

Offline capability must not weaken authorization, privacy, data-quality or audit requirements.

## 3. Initial Field Data Gateway scope

### A2PHC

The gateway should support authorized capture of:

- patient registration and visit creation;
- consultation/service records;
- approved measurements and clinical fields;
- prescription/advice where applicable;
- referral and follow-up;
- camp summary information;
- field logistics and approved expense evidence.

Patient-level information is sensitive and must use minimum-necessary access.

### E4BL

The gateway should support authorized capture of:

- learner registration and enrolment;
- attendance;
- assessment/examination data;
- progression and Grade V completion;
- material distribution;
- student-support and follow-up records;
- classroom or centre activity records.

Learner information is sensitive and should be restricted by role, project and location.

### Field finance

Authorized field and central-office users should be able to submit:

- approved requisition-linked expenses;
- bills and vouchers;
- IOU/advance adjustment evidence;
- payee/vendor information where permitted;
- amount and payment method;
- supporting bill/receipt/document images;
- project, location/cost centre, fund/donor and approved account head.

A field submission is not automatically an accounting posting. Finance verification and the approved workflow remain required.

### Programme activity and evidence

The same gateway architecture may support:

- activity implementation records;
- participant/reach data;
- location and date;
- evidence and supporting documents;
- verification status;
- approved indicator linkage.

## 4. Required offline and synchronization states

The UI and implementation should clearly distinguish:

**Local Draft â†’ Ready to Sync â†’ Syncing â†’ Synced / Submitted â†’ Pending Verification â†’ Verified**

Exception states should include:

- Sync Conflict
- Returned
- Failed
- Attachment Pending

Structured records and larger attachments may synchronize independently.

## 5. Evidence boundary

Technical synchronization must never be confused with evidence verification.

A record can be:

- captured offline;
- synchronized successfully;
- stored in the ERP;

and still remain an unverified operational record.

HSF evidence discipline remains:

**Operational Record â†’ Validation / Cleaning â†’ Verification â†’ Indicator â†’ Analysis â†’ Learning â†’ Management Approval â†’ Reporting / Public Communication**

Where applicable, HSF evidence states remain distinct:

**RAW â†’ CLEANED â†’ VERIFIED / CALCULATED / ESTIMATED / INFERRED**

## 6. Authorization and accountability

Every synchronized record should retain, where technically appropriate:

- user identity;
- role;
- project;
- authorized location;
- creation timestamp;
- local/device record identifier;
- synchronization timestamp;
- workflow status;
- verification/approval history;
- amendment/audit history.

Users must only receive the minimum data necessary for their role.

Examples:

- a Teacher should not automatically access another centre's learner records;
- an A2PHC Doctor should not receive unrestricted finance or payroll information;
- Finance should be able to review camp-linked expenditure without unrestricted clinical detail;
- a submitter should not approve their own controlled financial transaction where separation of duties applies.

## 7. Finance and account-head architecture

The Chart of Accounts should separate the nature of expenditure from analytical dimensions.

Preferred structure:

**Account Head + Account Group + Project + Location / Cost Centre + Fund / Donor + Activity / Budget Line + Payment Method**

HSF's approved FY2025â€“26 payment dataset should be used to derive and standardize the initial real account-head master.

Raw payment transactions should not be committed to HSF's public GitHub repositories. Only an approved, public-safe account-head master or sanitized architecture reference should be stored in the Knowledge Hub/ERP source repositories.

## 8. Privacy and safeguarding

Offline storage creates additional privacy responsibilities.

Production implementation should include appropriate controls for:

- encryption of sensitive local data;
- authenticated user sessions;
- device/session expiry;
- remote or administrative session revocation where feasible;
- minimum offline data retention;
- controlled attachment storage;
- secure synchronization;
- conflict handling;
- audit logging;
- safe deletion of synchronized local sensitive data according to approved retention rules.

Patient, learner, HR, payroll, safeguarding and restricted finance records must never be exposed through the Public Platform.

## 9. Relationship with the Knowledge Hub

The Knowledge Hub defines the institutional rules that the ERP should implement.

Future approved policies may include:

- HR Policy;
- Finance Policy;
- Procurement Policy;
- MEAL Policy;
- Safeguarding / Child Protection Policy;
- Data Protection & Privacy Policy;
- Delegation of Authority;
- Programme SOPs;
- ICT / Information Security Policy;
- Document Control Standard.

Approved policy requirements should flow into ERP configuration, permissions, workflows, controls and audit rules.

**Approved Policy â†’ ERP Rule / Configuration â†’ Workflow / Permission â†’ Operational Record â†’ Verification / Approval â†’ Audit / Reporting**

## 10. Governance status

This document records the architecture agreed for management review on 12 September 2026.

It does **not** by itself:

- change the stable Knowledge Hub version;
- promote the Digital Institutional System Contract from v1.0.0;
- declare the offline gateway functionally implemented;
- approve unresolved clinical, finance, safeguarding or retention rules.

After management approval, the architectural requirement should be incorporated through controlled versioning into the canonical HSF digital-governance baseline and mirrored by the ERP repository.

## 11. Recommended implementation sequence

1. Approve Field Data Gateway as an HSF ERP architectural requirement.
2. Confirm data protection, retention, device and synchronization controls.
3. Use A2PHC as the first functional offline-first vertical slice.
4. Extend the same gateway foundation to E4BL.
5. Introduce field finance submission and evidence capture.
6. Standardize the Chart of Accounts from approved FY2025â€“26 payment data.
7. Implement server-enforced RBAC, project/location authorization and audit trails.
8. Connect verified operational data to MEAL and Approved Information workflows.
9. Promote the governance baseline only after management approval and documented review.

---

**Core principle:** HSF ERP should begin where programme delivery actually happens â€” in the school, health camp, community and field office â€” while preserving authorization, verification, financial control, privacy and institutional accountability.