#!/usr/bin/env python3
"""v1.10.0: reproducible 100-idea gap-screen/metadata checks; not a claim of semantic uniqueness certification."""
from pathlib import Path
import json,hashlib,re,collections,sys
R=Path(__file__).resolve().parents[1];issues=[]
check=lambda ok,msg:issues.append(msg) if not ok else None
load=lambda p:json.loads((R/p).read_text(encoding='utf-8'))
K=load('communication/research/kdi_260_ideas.json')['ideas']
P=load('communication/research/psc_240_ideas.json')['ideas']
review=load('communication/research/KDI_161-260_UNIQUENESS_REVIEW.json')
approvals=load('governance/EDITORIAL_APPROVAL_TRANSITION_v1.9.0.json')
new=K[160:];old=K[:160]+P[:140]
check(len(new)==100,'Expected exactly 100 new KDI research ideas')
check([x['id'] for x in new]==[f'KDI-{i:03}' for i in range(161,261)],'New KDI ID sequence altered')
check(collections.Counter(x['programme'] for x in new)=={'CAR':45,'E4BL':30,'A2PHC':25},'Project distribution mismatch')
check(len({x['title'].casefold().strip() for x in K+P})==500,'Exact title duplicate in 500 ideas')
check(all(x['approval_status']=='EDITORIAL_IDEA_PROPOSED' for x in new),'New proposed ideas incorrectly marked approved')
check(all(x['claim_verification_status']=='NOT_VERIFIED' and x['publication_status']=='NOT_APPROVED' for x in K),'KDI new idea facts or posts were approved')
check(all(x['fact_verification_status']=='NOT_VERIFIED' and x['publication_status']=='NOT_APPROVED' for x in P),'PSC ideas promoted to verified publication without evidence')
for x in new:
 check(all(isinstance(x.get(y),str) and x[y].strip() for y in ['series','title','research_question','possible_response','source_keys','source_names','technical_review','visual_format']),'Missing detailed concept brief '+x['id'])
 check(x.get('evidence_readiness')=='SOURCE_LEAD_ONLY','Source lead incorrectly verified: '+x['id'])
reviewrows=review.get('records',[])
check(len(reviewrows)==100 and [r.get('new_id') for r in reviewrows]==[x['id'] for x in new],'Originality review is not aligned with 100 new ideas')
oldids={x['id'] for x in old}
for i,x in enumerate(new):
 r=reviewrows[i]
 check(r['title']==x['title'],'Uniqueness audit title changed '+x['id'])
 check(set(r['closest_existing_ids']).issubset(oldids),'Unknown previous idea in review '+x['id'])
 check(bool(r['distinct_learning_objective']),'Distinct learning objective missing '+x['id'])
check(approvals['promoted_count']==46 and len(approvals['KDI']['idea_ids'])==26 and len(approvals['PSC']['idea_ids'])==20,'46 approvals audit incomplete')
check(all(x['approval_status']=='EDITORIAL_IDEA_APPROVED' for x in K[:160]),'Previous KDI idea approval missing')
check(all(x['idea_status']=='EDITORIAL_IDEA_APPROVED' for x in P[:140]),'Previous 140 PSC idea approval missing')
check(all(x['idea_status']=='EDITORIAL_IDEA_PROPOSED' for x in P[140:]),'New PSC concept statuses changed')
check(all('USER_DIRECTED_2026-10-30' in x.get('editorial_approval_record','') for x in K[134:160]+P[120:140]),'26+20 promotions missing provenance')
for path in ['governance/HSF_DIGITAL_SYSTEM_CONTRACT.json','netlify.toml','netlify/edge-functions/pin-gate.ts']:
 check((R/path).is_file(),'Protected infrastructure missing '+path)
if issues:
 print('NEW 100-KDI IDEAS QA FAILED',len(issues));[print(' -',i) for i in issues];sys.exit(1)
print('NEW KDI CONCEPTS PASS: 100 distinct-title, narrow-question proposals (45 CAR/30 E4BL/25 A2PHC); 46 prior idea approvals traced; no verified claims or approved posts; 100 overlap records present.')
