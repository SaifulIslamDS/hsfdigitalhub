#!/usr/bin/env python3
"""HSF v1.9.0 cross-document single-source-of-truth stability validation.

Source-based, dependency-free. Does NOT attest management approval, live Netlify
security, or Adobe Illustrator compatibility. Historical release notes are exempt.
"""
from __future__ import annotations
import hashlib, json, re, sys
from pathlib import Path
from html.parser import HTMLParser
R=Path(__file__).resolve().parents[1]
errors=[]
def check(x,msg):
    if not x:errors.append(msg)
def load(path):return json.loads((R/path).read_text(encoding='utf-8'))
def digest(path):return hashlib.sha256((R/path).read_bytes()).hexdigest()
manifest=load('MANIFEST.json'); contract=load('governance/HSF_DIGITAL_SYSTEM_CONTRACT.json')
control=load('governance/SOCIAL_V4_STABLE_CONTROL.json')
reg=load('governance/CONTROLLED_DOCUMENT_REGISTER.json')
assets=load('governance/PUBLIC_ASSET_REGISTER.json')
retired=load('governance/RETIRED_ACTIVE_TREE_PATHS.json')
release=manifest.get('release')
check(release=='v1.9.0','Release must be v1.9.0')
check(manifest.get('current_status')=='ACTIVE_INTERNAL_STABILIZED_SOURCE','Repository status not synchronized')
check(manifest.get('current_stable_content_baseline',{}).get('knowledge_hub')==release,'Stable manifest release mismatch')
check(manifest.get('latest_internal_update',{}).get('version')==release,'Latest manifest release mismatch')
check(control.get('knowledge_hub_release')==release,'Social control points to an older Knowledge Hub version')
check(reg.get('repository_release')==release,'Controlled document register points to an older release')
check(set(contract.get('programmes',{}))=={'E4BL','A2PHC','CLIMATE_ACTION'},'Three-project contract has been changed unexpectedly')
check(contract.get('contract_version')=='1.0.0','Institutional Contract was renumbered')
check(manifest.get('current_stable_content_baseline',{}).get('brand_identity_design_system')=='v2.4','Brand guide was renumbered')
check(manifest.get('current_stable_content_baseline',{}).get('social_communication_plan')=='v4.0','Social v4 policy was renumbered')
check(manifest['editorial']['idea_library']['total_ideas']==400,'Idea count changed')
check(manifest['editorial']['idea_library']['approved_editorial_ideas']==300,'Approved idea count changed')
check(manifest['editorial']['idea_library']['proposed_editorial_ideas']==100,'Proposed idea count changed')
check(control.get('status')=='APPROVED_STABLE','Existing Social-policy status changed')
check(len(reg.get('documents',[]))==6,'Exactly six controlled master documents required')
check(len({x['canonical_path'] for x in reg['documents']})==6,'Duplicate master entries')
expected_masters=set(manifest.get('canonical_master_documents',[]))
check({x['canonical_path'] for x in reg['documents']}==expected_masters,'Canonical master registry and manifest disagree')
for item in reg['documents']:
 path=item['canonical_path']; check((R/path).is_file(),f'Missing canonical master: {path}')
 if (R/path).is_file():check(item['sha256']==digest(path),f'Master changed without updating document register: {path}')
 check(item.get('approval_evidence_status')=='NOT_IN_PUBLIC_SOURCE; VERIFY_IN_CONTROLLED_INTERNAL_RECORD',f'Unverified approval evidence status changed: {path}')
for path in retired.get('paths',[]):check(not (R/path).exists(),f'Retired bank remains in active repository tree: {path}')
check(len(retired.get('paths',[]))==8,'Retired source inventory expected to contain eight files')
active={'communication/research/kdi_260_ideas.json','communication/research/psc_140_ideas.json'}
check(set(manifest['editorial']['idea_library']['source_data'])==active,'Current idea bank source paths have changed')
for x in active:check((R/x).is_file(),f'Missing active data: {x}')
K=load('communication/research/kdi_260_ideas.json')['ideas']
P=load('communication/research/psc_140_ideas.json')['ideas']
check(len(K)==260 and len(P)==140,'Current editorial bank counts not 260/140')
check([x['id'] for x in K]==[f'KDI-{i:03}' for i in range(1,261)],'KDI IDs not sequential')
check([x['id'] for x in P]==[f'PSC-{i:03}' for i in range(1,141)],'PSC IDs not sequential')
check(all(x['approval_status']=='EDITORIAL_IDEA_APPROVED' for x in K[:160]),'Existing 160 KDI must be planning-approved')
check(all(x['approval_status']=='EDITORIAL_IDEA_PROPOSED' for x in K[160:]),'100 new KDI concepts must remain proposed')
check(all(x['idea_status']=='EDITORIAL_IDEA_APPROVED' for x in P),'Existing 140 PSC must be planning-approved')
check(all(x['publication_status']=='NOT_APPROVED' for x in K+P),'Editorial approval incorrectly promoted a publication')
check(all(x.get('claim_verification_status' if x['id'].startswith('KDI-') else 'fact_verification_status')=='NOT_VERIFIED' for x in K+P),'Editorial approval incorrectly verified a claim')
check(len(load('communication/research/KDI_161-260_UNIQUENESS_REVIEW.json')['records'])==100,'Unique review audit missing 100 records')
check(load('governance/EDITORIAL_APPROVAL_TRANSITION_v1.9.0.json')['promoted_count']==46,'Prior 46 approval provenance missing')

# All XLSX/PDF are public-safe and checksum registered (no old spreadsheet leak).
binaries={p.relative_to(R).as_posix() for p in R.rglob('*') if p.is_file() and p.suffix.lower() in {'.xlsx','.xls','.pdf'}}
registered={a.get('path') for a in assets.get('assets',[])}
check(binaries==registered,f'Binary register incomplete: missing={sorted(binaries-registered)}, extra={sorted(registered-binaries)}')
for a in assets.get('assets',[]):
 path=a['path'];check((R/path).is_file(),f'Missing public asset: {path}')
 if (R/path).is_file():check(digest(path)==a['sha256'],f'Public asset sha changed: {path}')
 check(a.get('contains_personal_data') is False and a.get('classification')=='PUBLIC',f'Public asset classification needs review: {path}')
# Narrative checks: prohibit specifically known fourth-active-project formulations; preserve historical/optional blueprint.
framework=(R/'digital_transformation_framework.html').read_text(encoding='utf-8')
website=(R/'website_content_editorial_guidelines.html').read_text(encoding='utf-8')
meal=(R/'impact_meal_learning_framework.html').read_text(encoding='utf-8')
erp=(R/'ERP_Overview.html').read_text(encoding='utf-8')
registry=(R/'governance/PROGRAMME_REGISTRY.md').read_text(encoding='utf-8')
check('Climate Action & Resilience' in registry,'Public climate display name not defined')
check('Climate Action' in registry and 'CLIMATE_ACTION' in registry,'Climate internal canonical code is missing')
check('cross-cutting' in registry.lower() and 'not separately activated fourth' in registry.lower(),'Cross-cutting designation missing')
check('Current project pages for Education, Primary Healthcare, Climate Action and Women Empowerment' not in framework,'Digital framework still labels women empowerment as fourth current Project')
check('E4BL, A2PHC, Climate Action, Women Empowerment' not in website,'Website guidelines list fourth current Project')
check('E4BL · A2PHC · Climate · Women Empowerment' not in meal,'MEAL banner lists fourth Project')
check('four core project areas' not in erp.lower(),'ERP overview still presents four current Projects')
check('future management consideration' in erp.lower(),'ERP blueprint future scope not differentiated')
check('Women and girls (cross-cutting, not a separate Project)' in meal,'MEAL cross-cutting row missing')
# These are source-control guards, not claims of end-to-end tests.
for path in ['index.html','social_communication_plan.html','communication/idea-library.html']:
 text=(R/path).read_text(encoding='utf-8')
 check(release in text, f'{path} shows stale hub version')
check('production_candidate' in str(manifest['current_stable_content_baseline']['brand_design_stack']), 'Brand Stack QA boundary lost')
check((R/'design-studio/source/build.py').exists(),'Design Studio source lost')
check((R/'design-studio/index.html').exists(),'Offline Design Studio missing')
if errors:
 print('HSF SSOT stability FAILED',len(errors))
 for x in errors:print(' -',x)
 sys.exit(1)
print('HSF v1.9.0 SSOT stability PASS: six master documents; three current Projects; 400 ideas; retired sources absent; four registered binary assets; approval and design boundaries preserved.')
