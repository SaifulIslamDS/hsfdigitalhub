#!/usr/bin/env python3
"""Checks controlled Social v4.0 candidate with two independent 120-idea banks."""
from __future__ import annotations
import hashlib,json,sys
from pathlib import Path
from collections import Counter
from html.parser import HTMLParser
R=Path(__file__).resolve().parents[1]
errors=[]
def check(ok,msg):
 if not ok: errors.append(msg)
def readjson(path):return json.loads((R/path).read_text(encoding='utf-8'))
def digest(path):return hashlib.sha256((R/path).read_bytes()).hexdigest()
ctrl=readjson('governance/SOCIAL_V4_CANDIDATE_CONTROL.json')
manifest=readjson('MANIFEST.json');assets=readjson('governance/PUBLIC_ASSET_REGISTER.json')
kdi=readjson('communication/research/kdi_120_ideas.json')
psc=readjson('communication/research/psc_120_ideas.json')
check(ctrl.get('status')=='CANDIDATE_NOT_STABLE','v4 candidate control state wrong')
check(manifest.get('candidate_release',{}).get('candidate_social_plan')=='v4.0','v4 manifest incorrect')
check(manifest.get('current_stable_content_baseline',{}).get('social_communication_plan')=='v3.3','v3.3 stable unexpectedly promoted')
check(ctrl.get('topics_count')==240,'must have 240 ideas total')
for name,bank,stem in [('KDI',kdi,'KDI'),('PSC',psc,'PSC')]:
 data=bank.get('ideas',[])
 check(len(data)==120,f'{name} has wrong count')
 check([r['id'] for r in data]==[f'{stem}-{i:03}' for i in range(1,121)],f'{name} has incorrect IDs')
 check(len({r.get('title','').lower() for r in data})==120,f'{name} titles have duplicates')
 if name=='KDI':
  for i in data:check((i.get('approval_status'),i.get('claim_verification_status'),i.get('publication_status'))==('EDITORIAL_IDEA_APPROVED','NOT_VERIFIED','NOT_APPROVED'),f'KDI item approval boundary {i.get("id")}')
 if name=='PSC':
  fam=Counter(x['content_family'] for x in data)
  expected={'Field Activities & Moments':30,'Field Case Studies & Community Voices':25,'Progress, Results & Learning':20,'Challenges, Responses & Learning':20,'Issue → Practical Response':15,'Institutional, Observances & Engagement':10}
  check(dict(fam)==expected,f'PSC family count mismatch {fam}')
  for i in data:check((i.get('idea_status'),i.get('fact_verification_status'),i.get('publication_status'))==('PROPOSED_FOR_MANAGEMENT_REVIEW','NOT_VERIFIED','NOT_APPROVED'),f'PSC idea is falsely approved {i["id"]}')
  check(sum(x['content_family']=='Issue → Practical Response' for x in data)==15,'Issue/practical-response method is absent')
# Stable files may not be edited while candidate is reviewed.
for path,expect in ctrl.get('immutable_stable_baseline_sha256',{}).items():
 check((R/path).exists() and digest(path)==expect,f'stable file altered or missing: {path}')
for f,sha in [(ctrl['workbook_path'],ctrl['workbook_sha256']),(ctrl['psc_workbook_path'],ctrl['psc_workbook_sha256'])]:
 check((R/f).exists() and digest(f)==sha,f'editorial workbook checksum mismatch: {f}')
 check(any(x.get('path')==f and x.get('sha256')==sha and x.get('contains_personal_data') is False for x in assets['assets']),f'workbook not registered as public-safe: {f}')
# No active publication schedule or 24-theme archive in v4.
for f in ['communication/research/issue_resolution_legacy_map.json','communication/registers/HSF_Social_Communication_48_Core_Post_Cycle_Tracker_v3.3.xlsx']:
 check(not (R/f).exists(),f'old pilot archive/tracker is active: {f}')
page=(R/'social_communication_plan_v4.0_candidate.html').read_text(encoding='utf-8')
for term in ['HSF in Action','HSF Knowledge','Field case study','Progress/success','Challenge and response','Issue → Practical Response','240','APPROVED_PUBLIC','CANDIDATE']:
 check(term in page,f'missing v4 framework: {term}')
check('id="legacy"' not in page,'old 48-post archive section still visible')
check('#theme-' not in page,'old 24 theme references are still in current v4 page')
for f,needle,count in [('communication/kdi-idea-bank.html','class="idea"',120),('communication/psc-idea-bank.html','class="idea"',120)]:
 check((R/f).exists(),f'catalogue page missing {f}')
 if (R/f).exists():check((R/f).read_text().count(needle)==count,f'{f} has incorrect number of cards')
class LinkChecker(HTMLParser):
 def __init__(self):super().__init__();self.local=[]
 def handle_starttag(self,tag,attrs):
  if tag not in ('a','script','img','link'):return
  a=dict(attrs);url=a.get('href') or a.get('src') or ''
  if url and not url.startswith(('https:','http:','mailto:','tel:','#','data:','javascript:','//','/')):self.local.append(url)
for f in ['social_communication_plan_v4.0_candidate.html','communication/kdi-idea-bank.html','communication/psc-idea-bank.html','index.html']:
 parser=LinkChecker();parser.feed((R/f).read_text(encoding='utf-8'))
 for l in parser.local:
  target=(R/f).parent/l.split('#',1)[0].split('?',1)[0]
  check(target.exists(),f'broken local link: {f}: {l}')
if errors:
 print('Social v4.0 candidate two-bank validation: FAIL')
 for e in errors:print(' -',e)
 sys.exit(1)
print('Social v4.0 candidate two-bank validation: PASS | 120 KDI approved research ideas + 120 PSC draft stories | old 48-post archive/tracker not active | stable governance unchanged')
