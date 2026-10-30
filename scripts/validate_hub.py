#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ERRORS: list[str] = []
WARNINGS: list[str] = []


def error(message: str) -> None:
    ERRORS.append(message)


def warning(message: str) -> None:
    WARNINGS.append(message)


def load_json(relative: str):
    path = ROOT / relative
    if not path.is_file():
        error(f"Missing required JSON: {relative}")
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:
        error(f"Invalid JSON {relative}: {exc}")
        return {}


manifest = load_json("MANIFEST.json")
contract = load_json("governance/HSF_DIGITAL_SYSTEM_CONTRACT.json")
asset_register = load_json("governance/PUBLIC_ASSET_REGISTER.json")
brand_manifest = load_json("brand-design-stack/manifest.json")

required_files = [
    "README.md",
    "CHANGELOG.md",
    "index.html",
    "social_communication_plan.html",
    "brand_identity_master_guide.html",
    "impact_meal_learning_framework.html",
    "governance/SOURCE_OF_TRUTH_MATRIX.md",
    "governance/PROGRAMME_REGISTRY.md",
    "governance/DOCUMENT_CONTROL_STANDARD.md",
    "governance/APPROVED_INFORMATION_STANDARD.md",
    "governance/PUBLIC_REPOSITORY_POLICY.md",
    "governance/EXTERNAL_STANDARDS.md",
    "SECURITY.md",
]
for relative in required_files:
    if not (ROOT / relative).is_file():
        error(f"Missing required file: {relative}")

# Canonical stable-state checks.
try:
    stable = manifest["current_stable_content_baseline"]
    if stable["knowledge_hub"] != "v1.8.0":
        error("Manifest current stable Knowledge Hub must identify v1.8.0 as the current internal version.")
    if stable["social_communication_plan"] != "v4.0":
        error("Manifest stable Social Communication Plan must be v4.0.")
    if stable["brand_identity_design_system"] != "v2.4":
        error("Manifest current Brand Identity system must be v2.4.")
except Exception:
    error("Manifest stable-baseline structure is incomplete.")

if contract.get("contract_version") != "1.0.0":
    error("Digital System Contract version must be 1.0.0 for this alignment baseline.")
if set(contract.get("programmes", {})) != {"E4BL", "A2PHC", "CLIMATE_ACTION"}:
    error("Canonical current programme codes must be E4BL, A2PHC and CLIMATE_ACTION.")
if set(contract.get("evidence_states", {})) != {"RAW", "CLEANED", "VERIFIED", "CALCULATED", "ESTIMATED", "INFERRED"}:
    error("Evidence-state set is inconsistent with the Digital System Contract.")
if set(contract.get("data_classification", {})) != {"PUBLIC", "INTERNAL", "CONFIDENTIAL", "RESTRICTED"}:
    error("Data-classification set is inconsistent with the Digital System Contract.")

social = (ROOT / "social_communication_plan.html").read_text(encoding="utf-8", errors="ignore") if (ROOT / "social_communication_plan.html").exists() else ""
brand = (ROOT / "brand_identity_master_guide.html").read_text(encoding="utf-8", errors="ignore") if (ROOT / "brand_identity_master_guide.html").exists() else ""
index = (ROOT / "index.html").read_text(encoding="utf-8", errors="ignore") if (ROOT / "index.html").exists() else ""

if "v4.0" not in social:
    error("Canonical social_communication_plan.html does not identify v4.0.")
if "v2.4" not in brand:
    error("Canonical brand_identity_master_guide.html does not identify v2.4.")
if "Knowledge Hub v1.8.0" not in index:
    error("index.html does not identify the current Knowledge Hub v1.8.0 version.")

# Brand stack policy alignment is metadata-only; stable certification remains pending.
policy = brand_manifest.get("policy_alignment", {})
if "v4.0" not in str(policy.get("social_communication_plan", "")):
    error("Brand Design Stack metadata is not aligned to Social v4.0.")
if "v2.4" not in str(policy.get("brand_identity_system", "")):
    error("Brand Design Stack metadata is not aligned to Brand v2.4.")
if "production candidate" not in str(brand_manifest.get("status", "")).lower():
    error("Brand Design Stack must remain explicitly marked production candidate until Illustrator 2022 QA is documented.")

# Public asset integrity.
for item in asset_register.get("assets", []):
    relative = item.get("path", "")
    path = ROOT / relative
    if not path.is_file():
        error(f"Registered public asset missing: {relative}")
        continue
    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    if digest != item.get("sha256"):
        error(f"Registered public asset checksum changed without register update: {relative}")
    if item.get("contains_personal_data") is not False:
        error(f"Public asset register must explicitly record contains_personal_data=false: {relative}")

# Reject obvious credential/private-key artifacts in this intentionally public repository.
blocked_names = {".env", ".env.local", ".env.production", "id_rsa", "id_ed25519"}
blocked_suffixes = {".pem", ".key", ".p12", ".pfx", ".dump", ".sql"}
for path in ROOT.rglob("*"):
    if not path.is_file() or ".git" in path.parts:
        continue
    if path.name in blocked_names or path.suffix.lower() in blocked_suffixes:
        error(f"Prohibited sensitive file type/name in public repository: {path.relative_to(ROOT)}")

# Detect packaging residue at root that would confuse current status.
if (ROOT / "README_PASTE_IN_REPO_ROOT.md").exists():
    error("Obsolete root paste-package README should remain archived, not canonical.")

# Lightweight local-link existence checks for href/src references that look like files.
html_files = list(ROOT.glob("*.html"))
for html_path in html_files:
    text = html_path.read_text(encoding="utf-8", errors="ignore")
    for target in re.findall(r'(?:href|src)=["\']([^"\']+)["\']', text, flags=re.I):
        if target.startswith(("http://", "https://", "mailto:", "tel:", "#", "data:", "javascript:")):
            continue
        clean = target.split("#", 1)[0].split("?", 1)[0]
        if not clean or clean.startswith("/"):
            continue
        if not (html_path.parent / clean).exists():
            warning(f"Local reference not found from {html_path.name}: {target}")

if WARNINGS:
    print("Warnings:")
    for item in sorted(set(WARNINGS)):
        print(f"- {item}")

if ERRORS:
    print("Validation FAILED:")
    for item in ERRORS:
        print(f"- {item}")
    sys.exit(1)

print("HSF Knowledge Hub alignment validation: PASS")
print(f"Validated contract v{contract.get('contract_version')} and {len(asset_register.get('assets', []))} controlled public assets.")
