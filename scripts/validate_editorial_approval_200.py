#!/usr/bin/env python3
"""Audit 200 user-reviewed editorial approvals, unchanged substantive content, zero fact/publication approvals."""
from pathlib import Path
import json,hashlib,copy,collections,sys
R=Path(__file__).resolve().parents[1];err=[]
def j(p):return json.loads((R/p).read_text(encoding='utf-8'))
def h(items):return hashlib.sha256(json.dumps(items,sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()
def check(cond,msg):
 if not cond:err.append(msg)
k=j('communication/research/kdi_260_ideas.json')['ideas']
p=j('communication/research/psc_240_ideas.json')['ideas']
t=j('governance/EDITORIAL_APPROVAL_TRANSITION_v1.10.1.json')
m=j('MANIFEST.json');c=j('governance/SOCIAL_V4_STABLE_CONTROL.json')
check(len(k)==260 and len(p)==240,'Canonical 260 KDI / 240 PSC records missing')
check(t.get('promoted_count')==200 and t.get('approval_scope')=='EDITORIAL_IDEA_APPROVAL_FOR_PLANNING_ONLY','Approval scope/count incorrect')
check(len(t.get('batch',{}).get('KDI',{}).get('idea_ids',[]))==100 and len(t.get('batch',{}).get('PSC',{}).get('idea_ids',[]))==100,'Approval batches incomplete')
for name,rows,status in [('KDI',k,'approval_status'),('PSC',p,'idea_status')]:
 first=160 if name=='KDI' else 140
 original=copy.deepcopy(rows[first:])
 check(all(x[status]=='EDITORIAL_IDEA_APPROVED' for x in rows),'Not all '+name+' concepts are planning approved')
 check(all(x['publication_status']=='NOT_APPROVED' for x in rows),'Public post status was promoted in '+name)
 verify='claim_verification_status' if name=='KDI' else 'fact_verification_status'
 check(all(x[verify]=='NOT_VERIFIED' for x in rows),'Facts were falsely verified in '+name)
 check(h(original)==t['batch'][name]['new_idea_records_sha256'],'Current 100 '+name+' changed after approval register')
 for r in original:
  check(r.pop('editorial_approval_record',None)=='governance/EDITORIAL_APPROVAL_TRANSITION_v1.10.1.json','Missing approval provenance for '+r['id'])
  r[status]='EDITORIAL_IDEA_PROPOSED'
 check(h(original)==t['batch'][name]['original_idea_records_sha256'],'Non-approval content changed in '+name+' source records')
 check([x['id'] for x in rows[first:]]==t['batch'][name]['idea_ids'],'ID list differs from transition register '+name)
check(all(x['evidence_readiness']=='SOURCE_LEAD_ONLY' for x in k[160:]),'New KDI sources incorrectly verified')
check(all(x['story_occurrence_status']=='NOT_CONFIRMED' and x['evidence_readiness']=='FIELD_OCCURRENCE_AND_EVIDENCE_REQUIRED' and x.get('field_source_ref','')=='' for x in p[140:]),'New PSC occurrence/data falsely confirmed')
check(t.get('public_claims_approved') is False and t.get('publication_approved') is False and t.get('field_events_verified') is False,'Approval boundary weakened')
check(m['editorial']['idea_library']['total_ideas']==500 and m['editorial']['idea_library']['approved_editorial_ideas']==500 and m['editorial']['idea_library']['proposed_editorial_ideas']==0,'Manifest totals not 500/500/0')
check(c['ideas_approved_for_editorial_planning']==500 and c['new_ideas_pending_approval']==0,'Social control not synchronized')
check(j('governance/EDITORIAL_APPROVAL_TRANSITION_v1.9.0.json')['promoted_count']==46,'Original 46 approval history missing')
if err:
 print('EDITORIAL APPROVAL 200 VALIDATION FAILED: '+str(len(err)))
 for e in err: print(' -',e)
 sys.exit(1)
print('200-IDEA APPROVAL PASS: KDI 100 + PSC 100; 500 editorial-approved; zero fact, occurrence and publication approvals; exact historical source fingerprints verified.')
