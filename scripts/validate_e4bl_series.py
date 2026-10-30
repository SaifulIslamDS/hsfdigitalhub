#!/usr/bin/env python3
"""Validate HSF E4BL series mapping and its operational/publication safeguards."""
from pathlib import Path
import json,hashlib,sys
R=Path(__file__).resolve().parents[1]
errors=[]
def check(ok,msg):
 if not ok:errors.append(msg)
def load(p):return json.loads((R/p).read_text('utf-8'))
mapdoc=load('communication/editorial_series.json');K=load('communication/research/kdi_260_ideas.json')['ideas'];P=load('communication/research/psc_240_ideas.json')['ideas']
spec=[('inside-our-classroom','PSC',P),('learn-with-e4bl','KDI',K)]
check(mapdoc.get('status')=='ADOPTED_EDITORIAL_SERIES_NOT_PUBLICATION_APPROVAL','Approval boundary missing')
check(len(mapdoc['editorial_series'])==2,'Expected exactly two E4BL series')
seen=[]
for (code,bank,ideas),series in zip(spec,mapdoc['editorial_series']):
 check(series['id']==code and series['bank']==bank,'Series bank/id mismatch')
 ref={i['id']:i for i in ideas}
 for id in series['idea_ids']:
  check(id in ref,'Missing source idea '+id)
  if id in ref: check(ref[id]['programme']=='E4BL',id+' assigned outside E4BL')
  seen.append(id)
check(len(seen)==len(set(seen))==79,'Duplicate or unexpected series mapping count')
for p,digest in mapdoc['source_record_sha256'].items():
 check(hashlib.sha256((R/p).read_bytes()).hexdigest()==digest,'Source bank changed: '+p)
for p in ['social_communication_plan.html','communication/README.md','communication/idea-library.html']:
 s=(R/p).read_text('utf-8')
 check('Inside Our Classroom' in s and 'Learn with E4BL' in s,'Missing series reference: '+p)
ui=(R/'communication/idea-library.html').read_text('utf-8')
check('id="series"' in ui and 'data-series="inside-our-classroom"' in ui and 'data-series="learn-with-e4bl"' in ui,'Series selector/card facets missing')
check("exclude!=='series'" in ui and "'series'" in ui,'Series conditional filter missing')
check('data-series=""' in ui,'Untagged ideas must remain discoverable')
check(len(K)==260 and len(P)==240,'500 current ideas must be preserved')
check(all(x['publication_status']=='NOT_APPROVED' for x in K+P),'An idea falsely marked publication approved')
if errors:
 print('E4BL series QA FAILED:');[print(' -',x) for x in errors];sys.exit(1)
print('E4BL series PASS: 34 PSC + 45 KDI mapped, 500 current ideas and safety controls preserved.')
