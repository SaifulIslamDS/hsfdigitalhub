#!/usr/bin/env python3
"""HSF Design Studio Phase 1 controlled, repeatable overlay applicator.

This script deliberately works against the user's existing checked-out Git repository.
It does NOT download files, change policy masters, use AI, verify consent,
or publish/deploy assets. Run from repo root after placing patch files.
"""
from __future__ import annotations
import argparse
import datetime as dt
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys

EXPECTED_HEAD = "13ffe2312824b82fc0c43d817de7282726d5ffc4"
FROM_RELEASE = "v1.10.1"
TO_RELEASE = "v1.11.0"
ROOT = Path(__file__).resolve().parent.parent
STACK = ROOT / "brand-design-stack"
SOURCE = ROOT / "design-studio" / "source"
STUDIO = ROOT / "design-studio"
APP_DATE = "2026-10-31"


def require(condition, message):
    if not condition:
        raise RuntimeError(message)


def read(path):
    require(path.is_file(), f"Required repository file missing: {path.relative_to(ROOT)}")
    return path.read_text(encoding="utf-8")


def write_changed(path, content):
    old = path.read_text(encoding="utf-8") if path.exists() else None
    if old == content:
        return False
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8", newline="\n")
    print("  UPDATED", path.relative_to(ROOT))
    return True


def single_span(text, before, after):
    require(text.count(before) == 1, f"Source anchor missing/ambiguous: {before[:55]}")
    a = text.index(before)
    require(text.count(after, a + len(before)) >= 1, f"Closing anchor missing: {after[:55]}")
    b = text.index(after, a + len(before))
    return a, b


def replace_between(text, before, after, new, note):
    a, b = single_span(text, before, after)
    print("  SYNC", note)
    return text[:a] + new + "\n" + text[b:]


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def sha_normalized_text(path):
    """Hash governed text invariantly across CRLF and LF checkout styles."""
    return hashlib.sha256(path.read_bytes().replace(b'\r\n', b'\n')).hexdigest()


def load_stack():
    brandfile = STACK / "02_Tokens" / "brand-tokens.json"
    archfile = STACK / "04_Archetypes" / "archetypes.json"
    seqfile = STACK / "04_Archetypes" / "sequence-presets.json"
    platfile = STACK / "02_Tokens" / "platform-specs.json"
    files = [brandfile, archfile, seqfile, platfile]
    values = [json.loads(read(f)) for f in files]
    require(values[0]["version"] == "3.1.0", "Unexpected brand token version: do not patch blindly")
    require(len(values[1]) == 14, "Expected exactly fourteen canonical archetypes")
    require(values[3]["meta"]["version"] == "3.1.0", "Unexpected platform spec version")
    return files, values


def compile_palette(data):
    return ("/* PHASE1 GENERATED from brand-design-stack/02_Tokens/brand-tokens.json. "
            "Do not hand-edit colours in Studio. */\n"
            "const PALETTES=" + json.dumps(data["palettes"], ensure_ascii=False, separators=(",", ":")) + ";")


def compile_arch(data):
    # Brand Stack is authority for archetype identity, purpose, image share and classification.
    # These visual labels are implementation presentation, not independent policy.
    custom_names = {
        "editorial_photo_story": "Editorial Photo Story",
        "human_moment": "Human Moment", "field_story": "Field Story",
        "evidence_story": "Evidence Story", "quote_story": "Quote Story",
        "photo_essay": "Photo Essay", "before_during_after": "Before / During / After",
        "event_story": "Event Story", "institutional_memory": "Institutional Memory",
        "impact_journey": "Impact Journey", "report_insight": "Report Insight",
        "observance_story": "Observance Story", "practical_guide_photo": "Practical Guide Photo",
        "call_to_action_photo": "Call to Action Photo",
    }
    require(set(custom_names) == set(data), "Archetypes changed; review mapping deliberately")
    result = {}
    for key, spec in data.items():
        nums = re.fullmatch(r"(\d+)-(\d+)%", spec["image_share"])
        require(nums is not None, f"Invalid image share: {key}")
        use = spec["best_for"]
        streams = []
        if any(x in use for x in ("FIELD", "EVENT", "HSF", "MOMENT")):
            streams.append("HSF_IN_ACTION")
        if any(x in use for x in ("CORE", "LINKEDIN", "MEAL", "OBS")):
            streams.append("HSF_KNOWLEDGE_AWARENESS")
        require(streams, f"No stream mapping for archetype: {key}")
        result[key] = {"n": custom_names[key], "share": [int(nums[1]), int(nums[2])],
                       "for": streams, "p": spec["purpose"]}
    return ("/* PHASE1 GENERATED from brand-design-stack/04_Archetypes/archetypes.json. */\n"
            "const ARCH=" + json.dumps(result, ensure_ascii=False, separators=(",", ":")) + ";")


SEQ_BRIDGE = {
    "core_issue_resolution": "issue_practical_response",
    "field_event_story": "field_event_story",
    "observance": "observance",
    "foundation_memory": "foundation_memory",
    "reel_vertical_storyboard": "reel",
}


def sync_sequence_stages(text, canon):
    for canon_id, local_id in SEQ_BRIDGE.items():
        require(canon_id in canon, f"Missing canonical sequence: {canon_id}")
        # The source uses one entry per line. Keep archetype and page composition
        # choices as editor implementation detail, but get stage text from Stack.
        lines = text.splitlines(keepends=True)
        candidates = [i for i, line in enumerate(lines) if line.lstrip().startswith(local_id + ":{")]
        require(len(candidates) == 1, f"Sequence entry missing or duplicated: {local_id}")
        idx = candidates[0]
        line = lines[idx]
        matches = list(re.finditer(r'\["([a-z_]+)","([^"\\]*)"\]', line))
        stages = canon[canon_id]
        require(len(matches) == len(stages), f"Sequence page count mismatch: {local_id}")
        for match, title in reversed(list(zip(matches, stages))):
            value = '["' + match.group(1) + '",' + json.dumps(title, ensure_ascii=False) + ']'
            line = line[:match.start()] + value + line[match.end():]
        lines[idx] = line
        text = "".join(lines)
    return text


def sync_format_line(text, platform, fmt, size):
    # Format sizes are controlled by the Stack platform spec registry.
    start = text.index("  " + platform + ':{n:"' )
    following = re.search(r'\n  (facebook|instagram|linkedin):\{n:"', text[start+2:])
    end = start + 2 + following.start() if following else text.index("const STORY_GUIDES", start)
    chunk = text[start:end]
    pattern = re.compile(r'(\{id:"' + re.escape(fmt) + r'"[^\n]*?\bw:)\d+(,h:)\d+')
    require(len(pattern.findall(chunk)) == 1, f"Could not find one {platform}/{fmt} dimensions")
    chunk = pattern.sub(lambda m: m.group(1) + str(size[0]) + m.group(2) + str(size[1]), chunk, count=1)
    return text[:start] + chunk + text[end:]


def sync_platform_sizes(text, canon):
    lookup = {
        "facebook": {"feed_4x5": "feed_4x5", "feed_square": "feed_square",
                     "feed_landscape": "feed_landscape", "story_9x16": "story_reel",
                     "fb_cover": "page_cover", "fb_cover_projects": "page_cover"},
        "instagram": {"feed_4x5": "feed_4x5", "photo_3x4": "photo_3x4",
                      "feed_square": "square", "story_9x16": "story_reel"},
        "linkedin": {"li_cover": "page_cover", "li_logo": "page_logo",
                     "li_article": "url_preview"},
    }
    for platform, formats in lookup.items():
        for local_id, canon_id in formats.items():
            spec = canon[platform][canon_id]
            size = spec.get("size") or spec.get("working_canvas")
            require(size and len(size) == 2, f"Missing canonical size: {platform}/{canon_id}")
            text = sync_format_line(text, platform, local_id, size)
    # LinkedIn's onepager and slide deck are page-format-specific controlled working sizes.
    text = sync_format_line(text, "linkedin", "li_onepager", canon["linkedin"]["a4_working_page"])
    return text


def patch_once(text, old, new, where):
    require(text.count(old) == 1, f"Expected precisely one source marker for {where}")
    return text.replace(old, new)


def update_studio_sources(values):
    tokens, archetypes, sequences, platforms = values
    e1path = SOURCE / "src" / "e1_data.js"
    e1 = read(e1path)
    e1 = replace_between(e1, "const PALETTES=", "const ROLES=", compile_palette(tokens), "Studio palette -> canonical Stack")
    e1 = replace_between(e1, "const ARCH=", "const ARCH_IDS=", compile_arch(archetypes), "Studio archetypes -> canonical Stack")
    e1 = sync_sequence_stages(e1, sequences)
    e1 = sync_platform_sizes(e1, platforms)
    write_changed(e1path, e1)

    # Accurate visual checks: upload is not proof that it is the approved logo.
    e3path = SOURCE / "src" / "e3_ui.js"
    e3 = read(e3path)
    e3 = e3.replace('"Official logo in the logo tile"', '"Logo loaded (verify against official HSF master)"')
    require('"Logo loaded (verify against official HSF master)"' in e3, "Logo QA source marker missing")
    write_changed(e3path, e3)

    # Saved design JSON can contain forged approval declarations. Import resets all
    # publication-facing review fields without destroying the content or canvases.
    e4path = SOURCE / "src" / "e4_out.js"
    e4 = read(e4path)
    if 'PHASE1_IMPORT_REVIEW_RESET' not in e4:
        old = 'meta:{...D.meta,...(d.meta||{})}'
        new = ('meta:{...D.meta,...(d.meta||{}),'
               'evidence_status:"NOT_VERIFIED",public_claim_status:"NOT_APPROVED",'
               'technical_review:"PENDING",safeguarding_review:"PENDING",'
               'management_approval:"PENDING",consent:"Not checked",review:""}'
               '/* PHASE1_IMPORT_REVIEW_RESET: imported metadata never grants publication permission */')
        e4 = patch_once(e4, old, new, "saved-design approval reset")
    e4 = e4.replace('"Official logo uploaded"', '"Logo image uploaded (verify against official master)"')
    write_changed(e4path, e4)


def update_docs_and_release():
    brandreadme = STACK / "README.md"
    s = read(brandreadme)
    s = s.replace("Social Communication Ecosystem v4.0 + Brand Identity & Design System v2.3.",
                  "Social Communication Ecosystem v4.0 + Brand Identity & Design System v2.4.")
    require("Social Communication Ecosystem v4.0 + Brand Identity & Design System v2.4." in s,
            "Could not sync Stack README policy metadata")
    write_changed(brandreadme, s)

    studio_readme = STUDIO / "README.md"
    s = read(studio_readme)
    s = s.replace("**Knowledge Hub version:** v1.9.0 · **Updated:** 30 October 2026",
                  "**Knowledge Hub version:** v1.11.0 (Phase 1 source patch) · **Updated:** 31 October 2026")
    s = s.replace("[400-idea Communication Hub]", "[500-idea Communication Hub]")
    require("500-idea Communication Hub" in s, "Studio README idea-library count not synchronized")
    appendix = """

## Phase 1 — Architecture, alignment and production readiness

Source: `../docs/DESIGN_STUDIO_PHASE1_ARCHITECTURE.md`.
`python scripts/studio_phase1.py check` confirms compiled Studio palette,
archetypes, sequence labels and platform dimensions follow canonical Stack files.
Use `python design-studio/source/build.py` after approved source modifications;
never edit the generated offline HTML alone.

**Publication control:** Loading a saved `.json` design resets editor-declared evidence,
consent, technical, safeguarding and management review fields to pending. An uploaded
logo is not independently authenticated by the editor. Any exported `APPROVED_PUBLIC`
status is an editor declaration, not authorization; consult HSF's protected approval
records before publishing. Full browser, Bangla text and Illustrator 2022 checks remain
required for production certification.
"""
    if "## Phase 1 — Architecture, alignment and production readiness" not in s:
        s = s.rstrip() + "\n" + appendix
    write_changed(studio_readme, s)

    manifestfile = ROOT / "MANIFEST.json"
    manifest = json.loads(read(manifestfile))
    require(manifest["release"] in (FROM_RELEASE, TO_RELEASE), "Unexpected Knowledge Hub release. Stop and review differences.")
    require(manifest["current_stable_content_baseline"]["social_communication_plan"] == "v4.0", "Social policy drift")
    require(manifest["current_stable_content_baseline"]["brand_identity_design_system"] == "v2.4", "Brand policy drift")
    manifest["release"] = TO_RELEASE
    manifest["release_date"] = APP_DATE
    manifest["last_updated"] = APP_DATE
    manifest["current_stable_content_baseline"]["knowledge_hub"] = TO_RELEASE
    manifest["current_stable_content_baseline"]["release_date"] = APP_DATE
    manifest["design_studio"]["version"] = "1.1.0-hsf-phase1"
    manifest["design_studio"]["alignment_lock"] = "design-studio/source/STACK_ALIGNMENT_LOCK.json"
    manifest["design_studio"]["source_build_generated"] = True
    manifest["design_studio"]["approval_security"] = "IMPORTED_EDITOR_METADATA_RESETS_TO_PENDING; APPROVAL_RECORDS_EXTERNAL"
    phase_validator = "python scripts/validate_design_studio_phase1.py"
    if phase_validator not in manifest["validation"]:
        manifest["validation"].append(phase_validator)
    manifest["latest_internal_update"] = {
        "version": TO_RELEASE,
        "date": APP_DATE,
        "summary": "Design Studio Phase 1: Stack-aligned generated palette/archetypes/sequence labels/platform sizes, imported approval-state reset, source-generated offline build and QA bridge. Documentation synchronized. Social v4.0 and Brand v2.4 unchanged.",
        "software_review_state": "LOCAL_SOURCE_BUILD_VALIDATION_REQUIRED; LIVE_DEPLOYMENT_AND_BROWSER_ILLUSTRATOR_QA_PENDING",
        "policy_change": False,
    }
    write_changed(manifestfile, json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")

    changelog = ROOT / "CHANGELOG.md"
    s = read(changelog)
    item = """## v1.11.0 — 2026-10-31 — Design Studio Phase 1

- Build-time synchronization to Brand Design Stack v3.1.0 canonical tokens, 14 archetypes, five story-sequence stage lists and platform sizes.
- Safer saved-design import: editor-declared publication and consent review reset to pending; uploaded-logo language corrected.
- Added Studio alignment lock file, dedicated validation suite, Phase 1 architecture/QA documents and release/application notes.
- Refreshed stale README references; Social Communication v4.0 and Brand Identity v2.4 policy unchanged.
- No change to Netlify PIN gateway, ERP data model, live deployment or actual publication approvals.
- Source and automated checks are distinct from pending visual, browser, Illustrator 2022, live deployment and user acceptance QA.

"""
    if "## v1.11.0 — 2026-10-31" not in s:
        write_changed(changelog, item + s)



def update_release_references_and_validators():
    # Metadata-only release synchronization. Master policy content remains unchanged.
    for filename, field in [
        ("governance/SOCIAL_V4_STABLE_CONTROL.json", "knowledge_hub_release"),
        ("governance/CONTROLLED_DOCUMENT_REGISTER.json", "repository_release"),
    ]:
        path = ROOT / filename
        obj = json.loads(read(path))
        require(obj.get(field) in (FROM_RELEASE, TO_RELEASE), f"Unexpected release in {filename}")
        obj[field] = TO_RELEASE
        if "last_updated" in obj:obj["last_updated"] = APP_DATE
        # Source-declared policy status, document registration and checksum evidence unchanged.
        write_changed(path, json.dumps(obj, ensure_ascii=False, indent=2) + "\n")

    # Social v4.0 controlled master: update only its four technical Knowledge Hub
    # release-reference labels. Do not alter any policy rule, approval, idea status,
    # date-of-policy, programme definition or content family.
    socialfile = ROOT / "social_communication_plan.html"
    social_text = read(socialfile)
    require(social_text.count("v1.10.1") in (0, 4), "Social master changed: expected four exact former software-release references")
    if social_text.count("v1.10.1") == 4:
        write_changed(socialfile, social_text.replace("v1.10.1", "v1.11.0"))
    registerfile = ROOT / "governance/CONTROLLED_DOCUMENT_REGISTER.json"
    register = json.loads(read(registerfile))
    matched = [it for it in register["documents"] if it["canonical_path"] == "social_communication_plan.html"]
    require(len(matched) == 1, "Controlled Social master register entry not unique")
    matched[0]["sha256"] = sha(socialfile)
    matched[0]["note"] = ("v1.11.0: Knowledge Hub release-reference labels synchronized only; Social v4.0 editorial "
                           "policy and all 500 planning-only idea approval boundaries unchanged.")
    write_changed(registerfile, json.dumps(register, ensure_ascii=False, indent=2) + "\n")

    indexfile = ROOT / "index.html"
    ix = read(indexfile)
    require("Knowledge Hub v1.10.1" in ix or "Knowledge Hub v1.11.0" in ix,
            "Current release label not found in homepage")
    ix = ix.replace("Knowledge Hub v1.10.1", "Knowledge Hub v1.11.0")
    ix = ix.replace("Current internal version · 30 October 2026", "Current internal version · 31 October 2026")
    write_changed(indexfile, ix)

    root_readme = ROOT / "README.md"
    s=read(root_readme)
    s = s.replace("**Current internal version:** v1.10.1", "**Current internal version:** v1.11.0")
    s = s.replace("Knowledge Hub v1.10.1 is the current internal source", "Knowledge Hub v1.11.0 is the current internal source")
    s = s.replace("This v1.10.1 internal source includes", "The v1.10.1 baseline includes")
    s = s.replace("See [Current internal release v1.10.1](docs/RELEASE_v1.10.1.md)",
                  "See [Current internal release v1.11.0](docs/RELEASE_v1.11.0.md)")
    # Preserve v1.10.1 historical installation references for migration history.
    s = s.replace("Use [the current release guide](docs/RELEASE_v1.10.1.md)",
                  "Use [the current release guide](docs/RELEASE_v1.11.0.md)")
    note = ("\n\n**Design Studio Phase 1:** [Architecture](docs/DESIGN_STUDIO_PHASE1_ARCHITECTURE.md) · "
            "[Patch/application guide](docs/APPLY_DESIGN_STUDIO_PHASE1_v1.11.0.md) · "
            "[QA matrix](docs/DESIGN_STUDIO_PHASE1_QA_MATRIX.md). "
            "Design Studio is not a publication approval authority.\n")
    if "**Design Studio Phase 1:**" not in s:s += note
    write_changed(root_readme,s)

    # These validators historically froze the previous active release number.
    # Change ONLY release assertions, preserving the policy/evidence/safeguarding checks.
    validators = {
        "scripts/validate_design_studio.py": [
            ("meta['release']=='v1.10.1'", "meta['release']=='v1.11.0'"),
            ("Knowledge Hub release must be v1.10.1", "Knowledge Hub release must be v1.11.0"),
            ("verify(k+':{' in srcdata", "verify('\"'+k+'\":{' in srcdata"),
            ("verify(role+':\"'+v+'\"' in srcdata", "verify('\"'+role+'\":\"'+v+'\"' in srcdata"),
        ],
        "scripts/validate_hub.py": [
            ('stable["knowledge_hub"] != "v1.10.1"', 'stable["knowledge_hub"] != "v1.11.0"'),
            ("identify v1.10.1 as the current internal version", "identify v1.11.0 as the current internal version"),
            ('"Knowledge Hub v1.10.1" not in index', '"Knowledge Hub v1.11.0" not in index'),
            ("current Knowledge Hub v1.10.1 version", "current Knowledge Hub v1.11.0 version"),
        ],
        "scripts/validate_social_v4.py": [
            ("m['release']=='v1.10.1' and m['current_stable_content_baseline']['knowledge_hub']=='v1.10.1'",
             "m['release']=='v1.11.0' and m['current_stable_content_baseline']['knowledge_hub']=='v1.11.0'"),
        ],
        "scripts/validate_idea_library.py": [
            ("m['release']=='v1.10.1'", "m['release']=='v1.11.0'"),
        ],
        "scripts/validate_content_prompt_generator.py": [
            ("manifest['release']=='v1.10.1'", "manifest['release']=='v1.11.0'"),
            ("Current release must be v1.10.1", "Current release must be v1.11.0"),
        ],
        "scripts/validate_shared_header.py": [
            ("test('30 October 2026' in s and 'Saiful Islam' in s,", "test(('31 October 2026' if name=='index.html' else '30 October 2026') in s and 'Saiful Islam' in s,"),
            ("'Knowledge Hub v1.10.1' in s", "'Knowledge Hub v1.11.0' in s"),
            ("'Status: Approved &amp; Stable (Knowledge Hub v1.10.1 internal)' in s", "'Status: Approved &amp; Stable (Knowledge Hub v1.11.0 internal)' in s"),
        ],
        "scripts/validate_ssot_stability.py": [
            ("HSF v1.10.1 cross-document", "HSF v1.11.0 cross-document"),
            ("release=='v1.10.1'", "release=='v1.11.0'"),
            ("Release must be v1.10.1", "Release must be v1.11.0"),
            # A Social policy page / Idea Library may describe the previous software
            # release without changing their policies. Do not require a Hub release
            # marker in every controlled master for a pure Studio-engineering release.
            ("for path in ['index.html','social_communication_plan.html','communication/idea-library.html']:",
             "for path in ['index.html','social_communication_plan.html']:"),
            ("print('HSF v1.10.1 SSOT stability PASS", "print('HSF v1.11.0 SSOT stability PASS"),
        ],
    }
    workflow_path = ROOT / ".github/workflows/hub-ci.yml"
    workflow = read(workflow_path)
    ci_anchor = "      - name: Validate internal HSF Design Studio integration\n        run: python scripts/validate_design_studio.py\n"
    new_ci = (ci_anchor + "\n      - name: Validate HSF Design Studio Phase 1 canonical alignment\n"
              "        run: python scripts/validate_design_studio_phase1.py\n")
    if "Validate HSF Design Studio Phase 1 canonical alignment" not in workflow:
        require(workflow.count(ci_anchor) == 1, "GitHub CI marker changed; review workflow")
        write_changed(workflow_path, workflow.replace(ci_anchor, new_ci))

    for rel, replacements in validators.items():
        path = ROOT / rel
        content = read(path)
        for before, after in replacements:
            require(content.count(before) == 1, f"Cannot safely update {rel}: expected one {before}")
            content = content.replace(before, after)
        write_changed(path, content)

def write_lock(files, values):
    lockpath = SOURCE / "STACK_ALIGNMENT_LOCK.json"
    content = {
        "schema": "hsf-design-studio-stack-lock/v1",
        "knowledge_hub_release": TO_RELEASE,
        "design_studio_version": "1.1.0-hsf-phase1",
        "brand_stack_version": "3.1.0",
        "policy_references": {"social": "v4.0", "brand": "v2.4"},
        "canonical_sources": {str(p.relative_to(ROOT)).replace("\\", "/"): sha(p) for p in files},
        "studio_source_checksum_sha256": sha(SOURCE / "src" / "e1_data.js"),
        "protected_governance_sha256": {str((ROOT / p).relative_to(ROOT)).replace("\\", "/"): sha_normalized_text(ROOT / p) for p in [
            "governance/HSF_DIGITAL_SYSTEM_CONTRACT.json", "brand_identity_master_guide.html",
            "ERP_Overview.html", "impact_meal_learning_framework.html",
            "website_content_editorial_guidelines.html", "netlify.toml", "_redirects",
            "netlify/edge-functions/pin-gate.ts", "netlify/edge-functions/pin-login.ts",
            "netlify/edge-functions/pin-logout.ts",
        ]},
        "archetype_count": len(values[1]),
        "canonical_sequence_count": len(values[2]),
        "assertion": "Build-time deterministic alignment only; no claim of Illustrator, accessibility or publication certification",
    }
    write_changed(lockpath, json.dumps(content, ensure_ascii=False, indent=2) + "\n")


def rebuild():
    print("  BUILD design-studio/source/build.py")
    subprocess.run([sys.executable, str(SOURCE / "build.py")], cwd=SOURCE, check=True)
    offline = SOURCE / "dist" / "HSF_Design_Studio_offline.html"
    require(offline.is_file(), "Offline Studio build missing")
    target = STUDIO / "index.html"
    if target.read_bytes() != offline.read_bytes():
        target.write_bytes(offline.read_bytes())
        print("  UPDATED design-studio/index.html (generated offline build)")


def check_head():
    require((ROOT / ".git").exists(), "Run inside the local Git repo root; .git is missing")
    p = subprocess.run(["git", "rev-parse", "HEAD"], cwd=ROOT, capture_output=True, text=True)
    require(p.returncode == 0, "Could not determine git HEAD")
    require(p.stdout.strip() == EXPECTED_HEAD,
            f"Expected baseline {EXPECTED_HEAD[:12]}, found {p.stdout.strip()[:12]}; inspect/update patch first")
    st = subprocess.run(["git", "status", "--porcelain", "--untracked-files=normal"], cwd=ROOT, capture_output=True, text=True)
    require(st.returncode == 0, "Could not check Git working tree")
    # Patch overlay is untracked, that's expected; all other unrelated local edits must be protected.
    unexpected = []
    for line in st.stdout.splitlines():
        rel = line[3:].replace("\\", "/")
        if not (rel.startswith("scripts/studio_phase1.py") or rel.startswith("scripts/validate_design_studio_phase1.py")
                or rel.startswith("docs/DESIGN_STUDIO_PHASE1_") or rel.startswith("docs/RELEASE_v1.11.0")
                or rel.startswith("docs/APPLY_DESIGN_STUDIO_PHASE1_") or rel.startswith("apply-hsf-studio-phase1.ps1")
                or rel.startswith("PATCH_README_") or rel.startswith("design-studio/phase1/")):
            unexpected.append(line)
    require(not unexpected, "Working tree has unrelated changes; commit/stash first:\n" + "\n".join(unexpected))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("operation", choices=["apply", "check"])
    parser.add_argument("--skip-baseline-git-check", action="store_true", help="Only for a separately audited worktree; not recommended")
    args = parser.parse_args()
    require((ROOT / "MANIFEST.json").exists(), "Put the Phase 1 ZIP contents directly in the repository root")
    files, values = load_stack()
    if args.operation == "apply":
        if not args.skip_baseline_git_check:
            check_head()
        print("HSF Design Studio Phase 1 — controlled application")
        update_studio_sources(values)
        update_docs_and_release()
        update_release_references_and_validators()
        write_lock(files, values)
        rebuild()
    subprocess.run([sys.executable, str(ROOT / "scripts" / "validate_design_studio_phase1.py")],
                   cwd=ROOT, check=True)
    print("Phase 1", args.operation, "completed. Release remains local until you commit/push/tag/deploy.")


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, KeyError, RuntimeError, subprocess.CalledProcessError) as err:
        print("PHASE1 FAILED:", err, file=sys.stderr)
        sys.exit(1)
