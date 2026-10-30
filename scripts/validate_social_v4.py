#!/usr/bin/env python3
"""Validate approved Social policy v4.0 with current internal Knowledge Hub v1.9.0."""
from pathlib import Path
from html.parser import HTMLParser
from collections import Counter
import json,hashlib,sys
R=Path(__file__).resolve().parents[1];err=[]
def test(ok,msg):
 if not ok:err.append(msg)
def file(p):return (R/p).read_text(encoding='utf-8')
def j(p):return json.loads(file(p))
def sha(p):return hashlib.sha256((R/p).read_bytes()).hexdigest()
m=j('MANIFEST.json');control=j('governance/SOCIAL_V4_STABLE_CONTROL.json');assets=j('governance/PUBLIC_ASSET_REGISTER.json')
test(m['release']=='v1.9.0' and m['current_stable_content_baseline']['knowledge_hub']=='v1.9.0','current internal release incorrectly recorded')
test(m['current_stable_content_baseline']['social_communication_plan']=='v4.0','social-policy version changed')
test(m['current_stable_content_baseline']['brand_identity_design_system']=='v2.4','brand guide changed')
test(control['status']=='APPROVED_STABLE' and control['version']=='4.0','approved social v4.0 policy not preserved')
test(control['ideas_total']==400 and control['ideas_approved_for_editorial_planning']==300 and control['new_ideas_pending_approval']==100,'300/46 control counts wrong')
test(control.get('editorial_series_overlay')=='communication/editorial_series.json','series overlay missing from approved social control')
for a in assets.get('assets',[]):
 path=a['path'];test((R/path).is_file(),'registered public asset missing: '+path)
 if (R/path).is_file():test(sha(path)==a['sha256'],'public-asset checksum differs: '+path)
 test(a.get('contains_personal_data') is False,'public-asset safety boundary missing: '+path)
for path,data in control['sensitive_system_baseline_integrity'].items():
 test((R/path).is_file(),'protected path missing: '+path)
 if (R/path).is_file():test(sha(path)==data.get('sha256',data.get('reviewed_sha256')),'protected baseline modified: '+path)
social=file('social_communication_plan.html')
for val in ['v4.0','APPROVED','400','300','100','260','140','Saiful Islam','30 October 2026','Issue → Practical Response','Inside Our Classroom','Learn with E4BL','e4bl-series','socialMenuOpen','socialMenuBackdrop','socialTocList','socialTocSearch','aria-hidden','inert']:
 test(val in social,'missing current policy/nav token '+val)
for x in ['P01–P48','fixed 48-post','mandatory 48-post','Version 4.0 · CANDIDATE']:
 test(x not in social,'old pilot/candidate policy reference in active social page: '+x)
class LinkChecker(HTMLParser):
 def __init__(self):super().__init__();self.ids=set();self.links=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if a.get('id'):self.ids.add(a['id'])
  if a.get('name'):self.ids.add(a['name'])
  u=a.get('href') or a.get('src') or ''
  if u:self.links.append(u)
parsers={}
for path in list(R.glob('*.html'))+list((R/'communication').glob('*.html')):
 obj=LinkChecker();obj.feed(path.read_text(encoding='utf-8'));parsers[path]=obj
for path,obj in parsers.items():
 for link in obj.links:
  if link.startswith(('http:','https:','mailto:','tel:','data:','//','/','javascript:')):continue
  part,_,anchor=link.partition('#');part=part.split('?')[0];target=(path.parent/part) if part else path
  test(target.is_file(),f'Broken local link: {path.relative_to(R)} -> {link}')
  if target.suffix=='.html' and anchor and target.is_file():
   if target not in parsers:
    parsers[target]=LinkChecker();parsers[target].feed(target.read_text(encoding='utf-8'))
   test(anchor in parsers[target].ids,f'Broken local anchor: {path.relative_to(R)} -> {link}')
for old in ['social_communication_plan_v3.2.html','social_communication_plan_v3.3.html','social_communication_plan_v3.3-pilot.html','social_communication_plan_v4.0_candidate.html','brand_identity_master_guide_v2.2.html','brand_identity_master_guide_v2.3.html']:
 test(not (R/old).exists(),'historical duplicate returned: '+old)
test(m['current_stable_content_baseline']['brand_design_stack']['status']=='production_candidate','brand-production status must remain uncertified candidate')
if err:
 print('Social policy & repo sync FAILED:',len(err));[print(' -',x) for x in err];sys.exit(1)
print('Social v4.0 approved policy PASS: current internal release; 400 ideas, two E4BL series, protected controls, links and right drawer verified.')
