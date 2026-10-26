#!/usr/bin/env python3
"""Stable HSF v4 communication policy, two-bank editorial and public-asset validation."""
from __future__ import annotations
import hashlib,json,sys,re
from pathlib import Path
from collections import Counter
from html.parser import HTMLParser
R=Path(__file__).resolve().parents[1]
errors=[]
def test(p,msg):
 if not p:errors.append(msg)
def j(p):return json.loads((R/p).read_text(encoding='utf-8'))
def sha(p):return hashlib.sha256((R/p).read_bytes()).hexdigest()
def file(p):return (R/p).read_text(encoding='utf-8')
m=j('MANIFEST.json');c=j('governance/SOCIAL_V4_STABLE_CONTROL.json');ar=j('governance/PUBLIC_ASSET_REGISTER.json')
k=j('communication/research/kdi_134_ideas.json');p=j('communication/research/psc_120_ideas.json')
test(m.get('release')=='v1.7.1' and m.get('current_status')=='APPROVED_STABLE','stable manifest state incorrect')
test(m['current_stable_content_baseline']['social_communication_plan']=='v4.0','social stable version mismatch')
test(m['current_stable_content_baseline']['brand_identity_design_system']=='v2.4','brand alignment stable version mismatch')
test(c.get('status')=='APPROVED_STABLE' and c.get('version')=='4.0','social control not approved/stable')
test(c.get('planning_and_compiled_by')=='Saiful Islam','compiler attribution missing')
test(c.get('ideas_total')==254,'254 editorial ideas not declared')
for label,data,stem in [('KDI',k,'KDI'),('PSC',p,'PSC')]:
 ideas=data.get('ideas',[])
 required=134 if label=='KDI' else 120
 test(len(ideas)==required,label+f' must contain {required} ideas')
 test([x['id'] for x in ideas]==[f'{stem}-{i:03}' for i in range(1,required+1)],label+' IDs not stable')
 test(len({x['title'].casefold() for x in ideas})==required,label+' titles not unique')
 test(all(x.get('publication_status')=='NOT_APPROVED' for x in ideas),label+' ideas falsely marked published/approved')
 if label=='KDI':test(all(x.get('approval_status')=='EDITORIAL_IDEA_APPROVED' and x.get('claim_verification_status')=='NOT_VERIFIED' for x in ideas),'KDI source-verification boundary breached')
 else:
  test(data.get('status')=='EDITORIAL_INVENTORY_APPROVED_ONLY','PSC inventory not approved')
  test(all(x.get('idea_status')=='EDITORIAL_IDEA_APPROVED' and x.get('fact_verification_status')=='NOT_VERIFIED' for x in ideas),'PSC occurrence-verification boundary breached')
  actual=Counter(x['content_family'] for x in ideas)
  expected={'Field Activities & Moments':30,'Field Case Studies & Community Voices':25,'Progress, Results & Learning':20,'Challenges, Responses & Learning':20,'Issue → Practical Response':15,'Institutional, Observances & Engagement':10}
  test(actual==expected,'PSC idea family breakdown mismatch')
for item in ar.get('assets',[]):
 fp=R/item.get('path','')
 test(fp.is_file(),'missing public registered asset: '+item.get('path',''))
 if fp.is_file():test(sha(item['path'])==item['sha256'],'asset hash mismatch: '+item['path'])
 test(item.get('contains_personal_data') is False,'asset data classification not public-safe: '+item['path'])
for path,meta in c.get('sensitive_system_baseline_integrity',{}).items():
 test((R/path).exists(),'protected control file missing: '+path)
 if (R/path).exists():
  actual=sha(path)
  test(actual==meta.get('sha256',meta.get('reviewed_sha256')),'protected control file changed without controlled review: '+path)
for asset in c['banks']:
 test(asset.get('status')=='APPROVED_EDITORIAL_IDEAS_ONLY',f'Bank {asset["code"]} status wrong')
 test((R/asset['source']).is_file(),'workbook missing: '+asset['source'])
page=file('social_communication_plan.html')
for needle in ['APPROVED','v4.0','HSF in Action','HSF Knowledge','Issue → Practical Response','254','Case Study','Saiful Islam','26 October 2026']:
 test(needle.lower() in page.lower(),'Social v4 master missing '+needle)
for old in ['P01–P48','fixed 48-post','mandatory 48-post','Version 4.0 · CANDIDATE']:
 test(old not in page,'legacy fixed cycle or candidate status in approved social master: '+old)
for old in ['social_communication_plan_v3.2.html','social_communication_plan_v3.3.html','social_communication_plan_v3.3-pilot.html','social_communication_plan_v4.0_candidate.html','brand_identity_master_guide_v2.2.html','brand_identity_master_guide_v2.3.html']:
 test(not (R/old).exists(),'historical duplicate active: '+old)
for base in ['social_communication_plan.html','brand_identity_master_guide.html','index.html','ERP_Overview.html','impact_meal_learning_framework.html','digital_transformation_framework.html','website_content_editorial_guidelines.html']:
 test('Planning &amp; Compiled by: Saiful Islam' in file(base) or 'Planning & Compiled by: Saiful Islam' in file(base),'document review credit absent: '+base)
 test(('26 October 2026' if base in ['index.html','social_communication_plan.html'] else '20 October 2026') in file(base),'current updated date absent: '+base)
for f in ['communication/kdi-idea-bank.html','communication/psc-idea-bank.html']:
 test('idea-library.html?bank=' in file(f) and 'class="idea"' not in file(f), f+' must be a lightweight link redirect only')
test(file('communication/idea-library.html').count('class="idea"')==254, 'unified catalogue must display 254 idea records')
class LocalHTML(HTMLParser):
 def __init__(self):super().__init__();self.paths=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs);url=a.get('href') or a.get('src') or ''
  if url and not url.startswith(('https://','http://','mailto:','tel:','#','data:','javascript:','//','/')):
   self.paths.append(url)
for f in list(R.glob('*.html'))+list((R/'communication').glob('*.html')):
 ck=LocalHTML();ck.feed(file(f))
 for href in ck.paths:
  local=href.split('#')[0].split('?')[0]
  if local:test((f.parent/local).exists(),f'broken internal link: {f.relative_to(R)} => {href}')

# Synchronization guard: historical pilot text must not survive in active master documents.
dtf=file('digital_transformation_framework.html')
test('24-theme, 48-post' not in dtf and '3+1 rhythm' not in dtf,
     'digital transformation framework still mandates the retired fixed-post pilot')
test('production stable' not in page,'uncertified design production stack falsely represented as stable')
# Verify links to in-page anchors too (not merely that target HTML exists).
from urllib.parse import unquote
class AnchorHTML(HTMLParser):
 def __init__(self):
  super().__init__();self.ids=set();self.links=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if a.get('id'):self.ids.add(a['id'])
  if a.get('name'):self.ids.add(a['name'])
  h=a.get('href','')
  if '#' in h and not h.startswith(('http:','https:','mailto:','tel:','javascript:','data:')):
   self.links.append(h)
anchor_cache={}
for f in list(R.glob('*.html'))+list((R/'communication').glob('*.html')):
 source=AnchorHTML();source.feed(file(str(f.relative_to(R))))
 for link in source.links:
  path,fragment=link.split('#',1)
  if not fragment:continue
  target=(f.parent/path) if path else f
  if not target.exists() or target.suffix.lower()!='.html':continue
  if target not in anchor_cache:
   parsed=AnchorHTML();parsed.feed(target.read_text(encoding='utf-8'));anchor_cache[target]=parsed.ids
  test(unquote(fragment) in anchor_cache[target], f'broken cross-document anchor: {f.relative_to(R)} -> {link}')

if errors:
 print('Social v4.0 stable validation FAIL:',len(errors),'errors')
 for e in errors:print(' -',e)
 sys.exit(1)
print('Social v4.0 APPROVED stable validation PASS: 254 approved editorial ideas, 0 approved individual claims; legacy duplicates removed; all public-safe assets and links valid.')
