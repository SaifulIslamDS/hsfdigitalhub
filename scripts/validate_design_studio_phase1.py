#!/usr/bin/env python3
"""Phase 1: deterministic alignment, review-state, source-build and governance checks.

Source checks do not attest live deployment, safeguarding approval, licensed fonts,
accessibility or Illustrator/real-browser visual rendering.
"""
from __future__ import annotations
import hashlib
import json
from pathlib import Path
import re
import sys

R = Path(__file__).resolve().parents[1]
E1 = R / 'design-studio/source/src/e1_data.js'
E3 = R / 'design-studio/source/src/e3_ui.js'
E4 = R / 'design-studio/source/src/e4_out.js'
errors=[]

def check(cond, msg):
    if not cond:errors.append(msg)

def load(relative):
    return json.loads((R/relative).read_text(encoding='utf-8'))

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def js_json(text, const):
    m=re.search(r'\bconst\s+'+re.escape(const)+r'\s*=\s*',text)
    if not m:raise ValueError('JS variable absent: '+const)
    return json.JSONDecoder().raw_decode(text[m.end():])[0]

def get_seq(line_text, sid):
    ls=[s.strip() for s in line_text.splitlines() if s.strip().startswith(sid+':{')]
    if len(ls)!=1:raise ValueError('Expected one sequence: '+sid)
    return re.findall(r'\["[a-z_]+","([^"\\]*)"\]',ls[0])

def get_fmt(text, plat, sid):
    a=text.index('  '+plat+':{n:"')
    match=re.search(r'\n  (?:facebook|instagram|linkedin):\{n:"',text[a+2:])
    b=a+2+match.start() if match else text.index('const STORY_GUIDES',a)
    body=text[a:b]
    found=re.findall(r'\{id:"'+re.escape(sid)+r'"[^\n]*?\bw:(\d+),h:(\d+)',body)
    if len(found)!=1:raise ValueError('Expected one '+plat+'/'+sid)
    return [int(z) for z in found[0]]

try:
    manifest=load('MANIFEST.json')
    check(manifest['release']=='v1.11.0','Repository manifest release should be v1.11.0')
    check(manifest['current_stable_content_baseline']['social_communication_plan']=='v4.0','Social v4 policy changed')
    check(manifest['current_stable_content_baseline']['brand_identity_design_system']=='v2.4','Brand v2.4 policy changed')
    check(manifest['current_stable_content_baseline']['brand_design_stack']['version']=='v3.1.0','Stack version changed unexpectedly')
    check(manifest['editorial']['idea_library']['total_ideas']==500,'500-idea baseline changed')
    check(manifest['design_studio']['approval_security'].startswith('IMPORTED_EDITOR_METADATA_RESETS_TO_PENDING'),'Review-state boundary not recorded')
    lock=load('design-studio/source/STACK_ALIGNMENT_LOCK.json')
    for path,digest in lock['canonical_sources'].items():
        check(sha(R/path)==digest,'Canonical source changed after lock: '+path)
    for path,digest in lock.get('protected_governance_sha256',{}).items():
        check(sha(R/path)==digest,'Protected governance/security baseline changed: '+path)
    check(lock['studio_source_checksum_sha256']==sha(E1),'Compiled Studio data changed without regenerating lock')
    source=E1.read_text(encoding='utf-8')
    brand=load('brand-design-stack/02_Tokens/brand-tokens.json')
    canonical_arch=load('brand-design-stack/04_Archetypes/archetypes.json')
    seqs=load('brand-design-stack/04_Archetypes/sequence-presets.json')
    formats=load('brand-design-stack/02_Tokens/platform-specs.json')
    check(js_json(source,'PALETTES')==brand['palettes'],'Palette JSON drift from canonical Stack')
    arch=js_json(source,'ARCH')
    check(set(arch)==set(canonical_arch),'Archetype inventory drift')
    for key,c in canonical_arch.items():
        nums=[int(x) for x in c['image_share'].replace('%','').split('-')]
        check(arch[key]['share']==nums,'Archetype image share drift: '+key)
        check(arch[key]['p']==c['purpose'],'Archetype purpose drift: '+key)
    aliases={'core_issue_resolution':'issue_practical_response','field_event_story':'field_event_story','observance':'observance','foundation_memory':'foundation_memory','reel_vertical_storyboard':'reel'}
    for canonical,local in aliases.items():
        check(get_seq(source,local)==seqs[canonical],'Sequence stage drift: '+local)
    size_maps={
        'facebook':{'feed_4x5':'feed_4x5','feed_square':'feed_square','feed_landscape':'feed_landscape','story_9x16':'story_reel','fb_cover':'page_cover','fb_cover_projects':'page_cover'},
        'instagram':{'feed_4x5':'feed_4x5','photo_3x4':'photo_3x4','feed_square':'square','story_9x16':'story_reel'},
        'linkedin':{'li_cover':'page_cover','li_logo':'page_logo','li_article':'url_preview'},
    }
    for platform,local_map in size_maps.items():
        for local,canonical in local_map.items():
            f=formats[platform][canonical]
            check(get_fmt(source,platform,local)==(f.get('size') or f.get('working_canvas')),
                  'Format drift: '+platform+'/'+local)
    check(get_fmt(source,'linkedin','li_onepager')==formats['linkedin']['a4_working_page'],
          'LinkedIn A4 dimensions drift')
    ui=E3.read_text(encoding='utf-8')
    out=E4.read_text(encoding='utf-8')
    check('Logo loaded (verify against official HSF master)' in ui,'Logo QA incorrectly claims official verification')
    check('PHASE1_IMPORT_REVIEW_RESET' in out,'Saved JSON imports retain unsound approval state')
    for t in ['evidence_status:"NOT_VERIFIED"','public_claim_status:"NOT_APPROVED"','technical_review:"PENDING"',
              'safeguarding_review:"PENDING"','management_approval:"PENDING"','consent:"Not checked"']:
        check(t in out,'Saved-design import must reset '+t)
    check('public_use_verified_by_application:false' in out,'SVG output must not claim verified approval')
    offline=R/'design-studio/source/dist/HSF_Design_Studio_offline.html'
    deployed=R/'design-studio/index.html'
    # Source/dist is ignored by Git and usually absent in GitHub Actions.
    # The existing validate_design_studio.py always reproduces the build in a
    # temp directory and compares it byte-for-byte with the deployed HTML.
    check(deployed.is_file(),'Deployed Studio HTML missing')
    if offline.exists() and deployed.exists():
        check(sha(offline)==sha(deployed),'Deployed Studio not byte-identical with built offline artifact')
    check('Social Communication Ecosystem v4.0 + Brand Identity & Design System v2.4.' in
          (R/'brand-design-stack/README.md').read_text(encoding='utf-8'), 'Brand Stack README policy drift')
except (ValueError,KeyError,OSError,IndexError) as err:
    errors.append('Validator error: '+str(err))

if errors:
    print('HSF Design Studio Phase 1: FAIL ('+str(len(errors))+')')
    for e in errors:print(' - '+e)
    sys.exit(1)
print('HSF Design Studio Phase 1: PASS — canonical Stack, output metadata, privacy/review state and offline build alignment.')
print('NOTE: Browser, Illustrator 2022, live Netlify, rendering, consent and authorized publishing QA are NOT certified.')
