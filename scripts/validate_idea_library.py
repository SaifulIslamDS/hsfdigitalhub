#!/usr/bin/env python3
"""Check 300-idea candidate library: provenance, approval boundaries, accessible facets, old links and controlled workbook paths."""
from pathlib import Path
from html.parser import HTMLParser
from collections import Counter
import hashlib,json,re,sys,zipfile
R=Path(__file__).resolve().parents[1]; errors=[]
def test(ok,msg):
 if not ok:errors.append(msg)
def load(p):return json.loads((R/p).read_text(encoding='utf-8'))
class Scan(HTMLParser):
 def __init__(self):super().__init__();self.cards=[];self.ids=set()
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if a.get('id'):self.ids.add(a['id'])
  if tag=='article' and 'idea' in a.get('class','').split():self.cards.append(a)
K=load('communication/research/kdi_160_ideas.json')['ideas'];P=load('communication/research/psc_140_ideas.json')['ideas'];all_=K+P
ht=(R/'communication/idea-library.html').read_text();scan=Scan();scan.feed(ht)
test(len(K)==160 and len(P)==140,'KDI/PSC counts must be 160/140')
test(len(all_)==300 and len({i['id'] for i in all_})==300,'300 unique IDs required')
test(len(scan.cards)==300,'300 rendered cards required')
test([x.get('id') for x in scan.cards]==[i['id'] for i in all_],'Rendered order/source identity mismatch')
for idx,(card,idea) in enumerate(zip(scan.cards,all_)):
 b='kdi' if idx<160 else 'psc'
 test(card.get('data-bank')==b and card.get('data-programme')==idea['programme'],idea['id']+' bad bank/programme')
 group=idea['series'] if b=='kdi' else idea['content_family']
 test(card.get('data-group')==group,idea['id']+' group mismatch')
 test(bool(card.get('data-tags')) and bool(card.get('data-search')),idea['id']+' facet/search metadata missing')
 status=idea['approval_status' if b=='kdi' else 'idea_status']
 test(card.get('data-status')==('proposed' if status=='EDITORIAL_IDEA_PROPOSED' else 'approved'),idea['id']+' approval facet error')
series=load('communication/editorial_series.json')
test(series.get('status')=='ADOPTED_EDITORIAL_SERIES_NOT_PUBLICATION_APPROVAL','Series approval boundary missing')
entries=series.get('editorial_series',[])
test([x.get('id') for x in entries]==['inside-our-classroom','learn-with-e4bl'],'Series names or order inconsistent')
map_={idea_id:x for x in entries for idea_id in x.get('idea_ids',[])}
test(len(map_)==series.get('total_mapped_ideas')==34,'Series mapped idea count/duplicates mismatch')
for x in K+P:
 mapped=map_.get(x['id'])
 test(bool(mapped)==bool(scan.cards[[y['id'] for y in K+P].index(x['id'])].get('data-series')),x['id']+' series attribute missing')
 if mapped:
  test(x['programme']=='E4BL','Non-E4BL idea assigned to E4BL editorial series: '+x['id'])
  test(mapped['bank']==('KDI' if x['id'].startswith('KDI-') else 'PSC'),'Series-bank mapping mismatch: '+x['id'])
  test(scan.cards[[y['id'] for y in K+P].index(x['id'])].get('data-series')==mapped['id'],x['id']+' series facet mismatch')
test('Inside Our Classroom' in ht and 'Learn with E4BL' in ht,'Series discovery labels missing')
test([x['id'] for x in K]==[f'KDI-{i:03}' for i in range(1,161)],'KDI IDs not sequential')
test([x['id'] for x in P]==[f'PSC-{i:03}' for i in range(1,141)],'PSC IDs not sequential')
test(len({x['title'].casefold() for x in all_})==300,'Duplicate editorial titles')
test(Counter(x['programme'] for x in all_)=={'A2PHC':96,'E4BL':83,'CAR':81,'CROSS':40},'Programme breakdown changed')
for bank,ideas,n in [('KDI',K,134),('PSC',P,120)]:
 approved='approval_status' if bank=='KDI' else 'idea_status';verify='claim_verification_status' if bank=='KDI' else 'fact_verification_status'
 test(all(x[approved]=='EDITORIAL_IDEA_APPROVED' for x in ideas[:n]),bank+' original editorial approval missing')
 test(all(x[approved]=='EDITORIAL_IDEA_PROPOSED' for x in ideas[n:]),bank+' new ideas falsely approved')
 test(all(x[verify]=='NOT_VERIFIED' and x['publication_status']=='NOT_APPROVED' for x in ideas),bank+' false publication/evidence approval')
# Exact snapshots of approved first 134/120 records from distributed v1.7.1, if available, are frozen in this release validator's SHA-256 checks.
def snapshot(items):return hashlib.sha256(json.dumps(items,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
expected=json.loads((R/'governance/IDEA_LIBRARY_v1.8.0_SOURCE_SNAPSHOTS.json').read_text())
test(snapshot(K[:134])==expected['KDI-001..134']['sha256'],'Earlier 134 KDI records mutated')
test(snapshot(P[:120])==expected['PSC-001..120']['sha256'],'Earlier 120 PSC records mutated')
for id in ['tab-all','tab-kdi','tab-psc','search','programme','series','group','tag-picker','tag-options','evidence','status','format','sort','reset','count','empty']:
 test(id in scan.ids,'Missing interactive control: '+id)
for key in ['function match(c,exclude',"match(c,'tags')",'opt.disabled','input.disabled','history.replaceState','aria-live','role="tabpanel"','aria-selected','No matching ideas']:
 test(key in ht,'Expected conditional filtering/accessibility logic missing: '+key)
for old,b in [('kdi','kdi'),('psc','psc')]:
 s=(R/f'communication/{old}-idea-bank.html').read_text()
 test('idea-library.html?bank='+b in s and '<meta http-equiv="refresh"' in s,'Legacy route broken: '+old)
for name in ['HSF_Knowledge_Data_Insight_160_Idea_Bank_Editorial_Inventory.xlsx','HSF_Programme_Stories_Communication_140_Idea_Bank_Editorial_Inventory.xlsx']:
 fn=R/'communication/research'/name;test(fn.is_file(),name+' missing');
 if fn.is_file():
  with zipfile.ZipFile(fn) as w:test(w.testzip() is None,name+' ZIP/Excel integrity failed')
m=load('MANIFEST.json');lib=m['editorial']['idea_library'];test(m['release']=='v1.8.0' and lib['total_ideas']==300 and lib['proposed_editorial_ideas']==46,'Manifest release/internal count mismatch')
test('46' in (R/'social_communication_plan.html').read_text(),'Social v4 control does not distinguish 46 proposed ideas')
# R2 interface regression: do not expose zero-count choices and do not repeat the Social promo on the homepage.
test('if(count===0)continue' in ht and 'label.hidden=count===0' in ht,'Zero-result filter choices must be removed/hidden')
home=(R/'index.html').read_text(encoding='utf-8')
test('id="social-v4-approved"' not in home and 'Explore all 254 content ideas' not in home,'Obsolete social promotion banner still on homepage')
test('href="social_communication_plan.html"' in home,'Canonical Social master is missing from homepage navigation')
if errors:
 print('300-idea internal library validation FAILED:',len(errors))
 for e in errors:print(' -',e)
 sys.exit(1)
print('300-idea library PASS: 160 KDI + 140 PSC; 254 previous records protected, 46 proposals; editorial-series conditional facet present.')
