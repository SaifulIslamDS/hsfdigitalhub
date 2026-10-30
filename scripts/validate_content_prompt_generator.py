#!/usr/bin/env python3
"""Validate all 300 per-idea, offline, evidence-gated content prompt controls."""
from pathlib import Path
from html.parser import HTMLParser
import json,sys
R=Path(__file__).resolve().parents[1]
issues=[]
def require(test,msg):
 if not test:issues.append(msg)
class HTMLScan(HTMLParser):
 def __init__(self):super().__init__();self.buttons=[];self.ids=[];self.modal=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs);self.ids.append(a.get('id',''))
  if tag=='button' and 'idea-prompt-trigger' in a.get('class',''):self.buttons.append(a)
  if tag=='dialog':self.modal.append(a)
ht=(R/'communication/idea-library.html').read_text(encoding='utf-8');s=HTMLScan();s.feed(ht)
K=json.loads((R/'communication/research/kdi_160_ideas.json').read_text())['ideas'];P=json.loads((R/'communication/research/psc_140_ideas.json').read_text())['ideas']
idea_ids=[x['id'] for x in K+P]
require(len(idea_ids)==len(set(idea_ids))==300,'Source idea count/ID mismatch')
require(len(s.buttons)==300,'Exactly one prompt button required on each of 300 idea cards')
require([b.get('data-prompt-id') for b in s.buttons]==idea_ids,'Per-card trigger IDs do not match source idea IDs')
require(all(b.get('type')=='button' and b.get('aria-label') for b in s.buttons),'Trigger buttons lack accessible labels or type')
require(len(s.modal)==1 and s.modal[0].get('id')=='hsf-prompt-dialog','Exactly one native accessible modal required')
for id in ['hsf-prompt-dialog-title','hsf-prompt-platform','hsf-prompt-format','hsf-prompt-language','hsf-prompt-evidence','hsf-prompt-output','hsf-prompt-copy','hsf-prompt-close','hsf-idea-prompt-context','hsf-prompt-status']:
 require(id in s.ids,'Missing prompt UI element '+id)
require('aria-labelledby="hsf-prompt-dialog-title"' in ht,'Modal accessible name missing')
require('assets/content-prompt-generator.css' in ht and 'assets/content-prompt-generator.js' in ht,'Local prompt generator assets not referenced')
for path in ['communication/assets/content-prompt-generator.css','communication/assets/content-prompt-generator.js']:
 require((R/path).is_file(),'Missing local asset '+path)
start='<script type="application/json" id="hsf-idea-prompt-context">';end='</script>'
require(ht.count(start)==1,'Expected exactly one inline JSON context data element')
if start in ht:
 serialized=ht.split(start,1)[1].split(end,1)[0]
 try:ctx=json.loads(serialized)
 except json.JSONDecodeError as e:ctx=[];issues.append('Prompt context invalid JSON: '+str(e))
 require(isinstance(ctx,list) and len(ctx)==300,'Expected 300 distinct prompt contexts')
 if len(ctx)==300:
  require([x['id'] for x in ctx]==idea_ids,'Context idea IDs mismatch')
  for i,x in enumerate(ctx):
   require(x['title']==(K+P)[i]['title'],'Prompt title mismatch '+x['id'])
   require(x['bank']==('KDI' if i<160 else 'PSC'),'Bank mismatch '+x['id'])
   require(x['programme']==(K+P)[i]['programme'],'Programme mismatch '+x['id'])
   require(x['status']==('proposed' if i in list(range(134,160))+list(range(160+120,300)) else 'approved'),'Idea approval state mismatch '+x['id'])
  require(all(x.get('focus') and x.get('response') and x.get('suggestedFormat') for x in ctx),'Context missing idea-specific content')
 require('<script' not in serialized and '</script' not in serialized.lower(),'Unsafe HTML/script markup found in context data')
script=(R/'communication/assets/content-prompt-generator.js').read_text(encoding='utf-8')
for phrase in ['navigator.clipboard','document.execCommand','[FIELD EVIDENCE REQUIRED]','[SOURCE REQUIRED]','[VERIFY BEFORE PUBLICATION]','Bangla','formatInstructions','showModal','claim-to-source','do not generate fabricated']:
 require(phrase.lower() in script.lower(),'Missing required prompt/governance capability: '+phrase)
require('Facebook' in ht and 'LinkedIn' in ht,'Target channel options missing from modal')
require('fetch(' not in script and 'localStorage' not in script and 'sessionStorage' not in script,'Prompt builder must not access remote services or local storage')
manifest=json.loads((R/'MANIFEST.json').read_text(encoding='utf-8'))
require(manifest['release']=='v1.8.1','Current release must be v1.8.1')
require(manifest['editorial']['idea_library']['content_prompt_generator']['button_per_idea'],'Manifest feature flag missing')
if issues:
 print('CONTENT PROMPT GENERATOR VALIDATION FAILED:')
 for issue in issues:print(' -',issue)
 sys.exit(1)
print('CONTENT PROMPT GENERATOR PASS: 300 idea-specific buttons + 300 safe contexts; one offline modal, governed format options and copying.')
