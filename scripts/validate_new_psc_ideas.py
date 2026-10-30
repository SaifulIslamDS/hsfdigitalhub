#!/usr/bin/env python3
"""v1.10.1 PSC 100-new-idea evidence and non-duplication checks; editorial review still required."""
from pathlib import Path
import json,hashlib,collections,sys
R=Path(__file__).resolve().parents[1]
errs=[]
def check(test,msg):
 if not test:errs.append(msg)
def read(p):return json.loads((R/p).read_text(encoding='utf-8'))
def hash_ideas(items):return hashlib.sha256(json.dumps(items,sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()
P=read('communication/research/psc_240_ideas.json')['ideas'];K=read('communication/research/kdi_260_ideas.json')['ideas'];N=P[140:]
review=read('communication/research/PSC_141-240_UNIQUENESS_REVIEW.json');base=read('governance/PSC_PRIOR_400_SOURCE_SNAPSHOT.json')
check(len(P)==240 and len(K)==260 and len(N)==100,'Expected 240 PSC + 260 KDI with 100 new PSC records')
check([x['id'] for x in N]==[f'PSC-{n:03}' for n in range(141,241)],'PSC 141..240 ID sequence changed')
check(collections.Counter(x['programme'] for x in N)=={'E4BL':30,'A2PHC':35,'CAR':25,'CROSS':10},'New PSC distribution changed')
check(hash_ideas(P[:140])==base['PSC-001..140'],'Original 140 PSC source records changed')

# Compare original v1.9.0 KDI content after reversing ONLY the authorized editorial status transition.
normalized_k=json.loads(json.dumps(K))
for x in normalized_k[160:]:
 x['approval_status']='EDITORIAL_IDEA_PROPOSED'
 x.pop('editorial_approval_record',None)
check(hash_ideas(normalized_k)==base['KDI-001..260'],'KDI content changed beyond authorized planning approval')
check(len({x['title'].strip().casefold() for x in K+P})==500,'Duplicate exact title in 500-bank inventory')
check(all(x['idea_status']=='EDITORIAL_IDEA_APPROVED' for x in P[:140]),'Existing PSC approval state changed')
check(all(x['idea_status']=='EDITORIAL_IDEA_APPROVED' for x in N),'User-reviewed PSC planning approvals missing')
check(all(x['publication_status']=='NOT_APPROVED' and x['fact_verification_status']=='NOT_VERIFIED' for x in P),'False fact/publication approval in PSC')
check(all(x.get('story_occurrence_status')=='NOT_CONFIRMED' and x.get('evidence_readiness')=='FIELD_OCCURRENCE_AND_EVIDENCE_REQUIRED' for x in N),'New PSC claims field occurrence without evidence')
required=['editorial_angle','minimum_evidence','review_risk','notes']
for x in N:
 check(all(isinstance(x.get(t),str) and len(x[t].strip())>35 for t in required) and len(x['suggested_format'])>6,'Insufficient evidence route/context '+x['id'])
 check(x.get('field_source_ref','')=='' and x.get('evidence_period','')=='' and x.get('editorial_owner','')=='','New proposal contains invented field record metadata '+x['id'])
 check(x['programme'] in {'E4BL','A2PHC','CAR','CROSS'},'Invalid programme code '+x['id'])
 check(x['content_family'] in {'Field Activities & Moments','Field Case Studies & Community Voices','Progress, Results & Learning','Challenges, Responses & Learning','Issue → Practical Response','Institutional, Observances & Engagement'},'Invalid PSC content family '+x['id'])
records=review.get('records',[]);check(len(records)==100 and [r['new_id'] for r in records]==[x['id'] for x in N],'Gap review does not match proposed ideas')
old_ids={x['id'] for x in K+P[:140]}
for x,row in zip(N,records):
 check(row.get('title')==x['title'] and set(row.get('closest_existing_ids',[])).issubset(old_ids),'Overlap review mismatch '+x['id'])
 check(row.get('review_decision')=='PROPOSED_DISTINCT_FIELD_ROUTE_SUBJECT_TO_EDITORIAL_REVIEW','Editorial originality caution missing '+x['id'])
check(read('MANIFEST.json')['editorial']['idea_library']['proposed_editorial_ideas']==0,'Proposed balance must be zero after user review')
check(len(read('communication/editorial_series.json')['editorial_series'][0]['idea_ids'])==34,'Expected 34 Inside Our Classroom optional mappings')
for p in ['netlify.toml','netlify/edge-functions/pin-gate.ts','governance/HSF_DIGITAL_SYSTEM_CONTRACT.json']:
 check((R/p).is_file(),'Protected file missing '+p)
if errs:
 print('PSC 100-IDEA REVIEW FAILED',len(errs));[print(' -',x) for x in errs];sys.exit(1)
print('PSC 100-IDEA REVIEW PASS: 30 E4BL, 35 A2PHC, 25 CAR, 10 CROSS; original 400 preserved; 100 planning-approved but unverified conditional story routes and original overlap reviews.')
