#!/usr/bin/env python3
"""Validate unified HTML library, preserved source inventories, and old-page redirects."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
import json,hashlib,sys
R=Path(__file__).resolve().parents[1]
errors=[]
def check(ok,msg):
 if not ok: errors.append(msg)
def read(path):return (R/path).read_text(encoding='utf-8')
def load(path):return json.loads(read(path))
class Reader(HTMLParser):
 def __init__(self): super().__init__();self.cards=[];self.titles=[];self.intitle=False
 def handle_starttag(self,name,attrs):
  a=dict(attrs)
  if name=='article' and 'idea' in a.get('class','').split(): self.cards.append(a)
  if name=='h3':self.intitle=True
 def handle_data(self,t):
  if self.intitle:self.titles.append(t)
 def handle_endtag(self,t):
  if t=='h3':self.intitle=False
html=read('communication/idea-library.html')
model=Reader();model.feed(html)
K=load('communication/research/kdi_134_ideas.json')['ideas'];P=load('communication/research/psc_120_ideas.json')['ideas'];all_ideas=K+P
check(len(K)==134 and len(P)==120, 'Source inventories must remain 120 each')
check(len(model.cards)==len(all_ideas)==254, 'Combined HTML idea count must be exactly 254')
check([a.get('id') for a in model.cards]==[x['id'] for x in all_ideas],'Source record IDs/order differ from generated HTML')
for idx,(card,source) in enumerate(zip(model.cards,all_ideas)):
 bank='kdi' if idx<134 else 'psc'
 check(card.get('data-bank')==bank,f'{source["id"]} wrong bank')
 check(card.get('data-programme')==source['programme'],f'{source["id"]} programme mismatch')
 group=source['series'] if bank=='kdi' else source['content_family']
 check(card.get('data-group')==group,f'{source["id"]} topic/family mismatch')
 check(source['title'].lower() in card.get('data-search','').lower(),f'{source["id"]} absent from searchable text')
check(Counter(a.get('data-bank') for a in model.cards)=={'kdi':134,'psc':120}, 'Bad bank distribution')
check(Counter(a.get('data-programme') for a in model.cards)==Counter(a['programme'] for a in all_ideas), 'Programme counts differ')
for needle in ['id="tab-all"','id="tab-kdi"','id="tab-psc"','id="search"','id="programme"','id="group"','role="tabpanel"','aria-live="polite"','NOT VERIFIED','NOT APPROVED','Planning &amp; Compiled by: Saiful Islam']:
 check(needle in html,'Missing UI/audit token '+needle)
for old,bank in [('kdi','kdi'),('psc','psc')]:
 txt=read(f'communication/{old}-idea-bank.html')
 check('idea-library.html?bank='+bank in txt and '<meta http-equiv="refresh"' in txt,'Legacy link does not redirect '+bank)
 check('<article class="idea"' not in txt,'Legacy page still duplicates cards '+bank)
manifest=load('MANIFEST.json'); meta=manifest.get('editorial',{}).get('idea_library',{})
check(manifest.get('release')=='v1.7.1' and manifest['current_stable_content_baseline']['knowledge_hub']=='v1.7.1','Release version/manifest mismatch')
check(len({x['id'] for x in all_ideas})==254 and [x['id'] for x in K[-14:]]==[f'KDI-{i:03}' for i in range(121,135)], 'New KDI IDs are not sequential')
check(all(x['claim_verification_status']=='NOT_VERIFIED' and x['publication_status']=='NOT_APPROVED' for x in K[-14:]), 'New KDI candidates incorrectly marked publication-approved')
check(meta.get('canonical_page')=='communication/idea-library.html' and meta.get('total_ideas')==254, 'Canonical library metadata mismatch')
for path in ['index.html','README.md','communication/README.md','social_communication_plan.html']:
 check('idea-library.html' in read(path), path+' missing canonical library link')
for fn in ['communication/research/kdi_134_ideas.json','communication/research/psc_120_ideas.json']:
 check((R/fn).is_file(), 'Missing original JSON source: '+fn)
for fn in ['communication/research/HSF_Knowledge_Data_Insight_134_Idea_Bank_Editorial_Inventory.xlsx','communication/research/HSF_Programme_Stories_Communication_120_Idea_Bank_Approved_Editorial_Inventory.xlsx']:
 check((R/fn).is_file(), 'Missing original Excel source: '+fn)
for bad in ['fetch(', 'XMLHttpRequest(', 'https://cdn.tailwindcss.com']:
 check(bad not in html,'Library should not rely on external script or data network: '+bad)
if errors:
 print('UNIFIED IDEA LIBRARY VALIDATION FAILED:',len(errors));[print(' -',e) for e in errors];sys.exit(1)
print('UNIFIED IDEA LIBRARY VALIDATION PASS: 254 cards, source ID parity, safe static UI, canonical links, controlled redirects and approved-only boundaries')
