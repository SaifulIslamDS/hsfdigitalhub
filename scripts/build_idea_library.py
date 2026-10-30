#!/usr/bin/env python3
"""Build HSF's 300-idea library with conditional filters from public-safe editorial JSON.

254 earlier ideas retain editorial idea approval. New 46 are proposals only.
No source lead verifies a claim or authorizes a public post.
"""
from pathlib import Path
from html import escape
from collections import Counter
import json,re
R=Path(__file__).resolve().parents[1]
K=json.loads((R/'communication/research/kdi_160_ideas.json').read_text(encoding='utf-8'))['ideas']
P=json.loads((R/'communication/research/psc_140_ideas.json').read_text(encoding='utf-8'))['ideas']
assert len(K)==160 and len(P)==140 and len({x['id'] for x in K+P})==300
E=lambda x:escape(str(x),quote=True)
prog_name={'E4BL':'Education for Better Life','A2PHC':'Access to Primary Healthcare','CAR':'Climate Action & Resilience','CROSS':'Cross-cutting'}
# Editorial discovery tags, NOT source-verified fact tags. Auto-tagged older concepts are presentation metadata only.
TAGS={
 'Climate & resilience':r'climate|flood|heat|salini|adapt|disaster|storm|cyclone|weather|early.warn|resilien|drought|environment|pollut|aqi|air.quality|methane|waste|tree|coastal|ocean|energy.transition|carbon|COP31',
 'Education & learning':r'school|classroom|teacher|learner|student|literacy|read|numeracy|grade|learning|education|attendance|dropout|class.size|preschool|enrol|childhood|parent',
 'Health & care':r'health|clinic|doctor|medical|patient|clinical|dengue|disease|sanitation|wash|water|care|blood.pressure|referral|nutrition|screening|maternal|treatment',
 'Evidence & MEAL':r'meal|data|survey|statistics|indicator|report|metric|measurement|track|verification|evaluation|evidence|registry|baseline|research|outcome|impact|progress|learning',
 'Safeguarding & inclusion':r'child.protect|safeguard|consent|privacy|inclusive|inclusion|disabilit|equity|gender|rights|vulnerab|safe|risk',
 'Community & participation':r'community|community.voice|consultation|feedback|participat|engagement|local|household|family|parent|volunteer|partnership',
 'Preparedness & response':r'warning|preparedness|emergency|response|disaster|crisis|resilience|referral|prevention|issue|challenge|practical',
 'Transparency & governance':r'accountab|transparen|institution|govern|management|policy|audit|correction|public.communication|stakeholder|approval',
}
def tags_for(x,bank):
 explicit=x.get('topic_tags',[])
 text=' '.join(str(x.get(z,'')) for z in ['title','series','content_family','research_question','editorial_angle','programme'])
 tags=[]
 for tag,pattern in TAGS.items():
  if re.search(pattern,text,re.I):tags.append(tag)
 # Fold explicit topic tags into broad canonical facets as well.
 for tag in explicit:
  for label,pat in TAGS.items():
   if re.search(pat,tag,re.I) and label not in tags:tags.append(label)
 if x['programme']=='CAR' and 'Climate & resilience' not in tags:tags.append('Climate & resilience')
 if x['programme']=='E4BL' and 'Education & learning' not in tags:tags.append('Education & learning')
 if x['programme']=='A2PHC' and 'Health & care' not in tags:tags.append('Health & care')
 return tags or ['Evidence & MEAL']
def format_for(x):
 txt=(x.get('visual_format') or x.get('suggested_format') or '').lower()
 if 'reel' in txt or 'video' in txt or 'audio' in txt:return 'Video / audio'
 if 'chart' in txt or 'map' in txt or 'data' in txt or 'scorecard' in txt:return 'Data / map'
 if 'photo' in txt or 'album' in txt:return 'Photo / album'
 if 'checklist' in txt or 'guide' in txt or 'flow' in txt:return 'Guide / checklist'
 if 'carousel' in txt or 'graphic' in txt or 'card' in txt:return 'Carousel / card'
 return 'Story / explainer'
def card(bank,x):
  k=bank=='kdi';group=x['series'] if k else x['content_family']
  appr=x.get('approval_status' if k else 'idea_status','')
  proposed=appr=='EDITORIAL_IDEA_PROPOSED'
  status='proposed' if proposed else 'approved'
  tags=tags_for(x,bank)
  fmt=format_for(x)
  evidence='Source leads: verification pending' if k else 'Field occurrence/evidence required'
  bits=[x['id'],x['title'],prog_name[x['programme']],group,' '.join(tags)]
  if k:bits +=[x['research_question'],x['possible_response'],x.get('source_names',''),x.get('source_keys','')]
  else:bits += [x['editorial_angle'],x['minimum_evidence'],x['suggested_format'],x['review_risk']]
  search=E(' '.join(bits).lower())
  det=(f'<p><b>Evidence to investigate:</b> {E(x["research_question"])}</p><p><b>Practical response lens:</b> {E(x["possible_response"])}</p><p><b>Visual:</b> {E(x["visual_format"])}</p><p class="source"><b>Research leads:</b> {E(x["source_keys"])} <a href="research/source_registry.json">Source registry</a></p>' if k else f'<p><b>Story route:</b> {E(x["editorial_angle"])}</p><p><b>Evidence required:</b> {E(x["minimum_evidence"])}</p><p><b>Format:</b> {E(x["suggested_format"])}</p><p class="source"><b>Review:</b> {E(x["review_risk"])}</p>')
  state='Proposed editorial idea: management review pending' if proposed else 'Approved editorial idea (NOT publication-approved)'
  chips=''.join(f'<span class="chip">{E(t)}</span>' for t in tags)
  return f'''<article class="idea" id="{E(x['id'])}" data-bank="{bank}" data-programme="{E(x['programme'])}" data-group="{E(group)}" data-tags="{E('|'.join(tags))}" data-evidence="{E(evidence)}" data-format="{E(fmt)}" data-status="{status}" data-search="{search}">
 <div class="cardmeta"><strong>{E(x['id'])}</strong><span class="label">{'KDI' if k else 'PSC'}</span><span class="label secondary">{E(x['programme'])}</span><span class="label {'proposal' if proposed else 'approved'}">{'PROPOSED' if proposed else 'IDEA APPROVED'}</span></div>
 <div class="group-label">{E(group)}</div><h3><a href="#{E(x['id'])}">{E(x['title'])}</a></h3>{det}
 <div class="chips" aria-label="Editorial discovery tags">{chips}</div><div class="warning">{E(state)} · {E(evidence)} · Publication NOT approved</div>
 </article>'''
cards='\n'.join(card(b,x) for b,items in [('kdi',K),('psc',P)] for x in items)
html='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow,noarchive"><meta name="theme-color" content="#008C44">
<title>HSF Social Content Idea Library | 300 Ideas</title>
<meta name="description" content="300 HSF editorial concepts: 254 existing and 46 proposal-stage ideas. Not verified claims or approved publications.">
<style>
:root{--green:#008C44;--deep:#163F2A;--ink:#263e32;--muted:#546c60;--pale:#EFF8F3;--line:#c9dfd0;--blue:#1769AA;--page:#f7faf8}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--page);color:var(--ink);font:16px/1.56 Arial,'Noto Sans Bengali',sans-serif}a{color:var(--blue)}button,select,input{font:inherit}button{cursor:pointer}
button:focus-visible,a:focus-visible,input:focus-visible,select:focus-visible,summary:focus-visible{outline:3px solid #F0A81A;outline-offset:3px}body .wrap{max-width:1220px;margin:auto;padding:0 22px}
header{background:var(--deep);color:#fff}header .top{padding:17px 0;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}header a{color:#fff;text-decoration:none;margin-left:14px}header a:hover{text-decoration:underline}
.eyebrow{color:#006b35;text-transform:uppercase;letter-spacing:.09em;font-size:12px;font-weight:800}.hero{padding:35px 0 18px}.hero h1{font-size:clamp(27px,4vw,42px);color:var(--deep);line-height:1.18;margin:10px 0}.hero p{max-width:950px;color:#496354}.notice{border:1px solid #ebd49a;background:#fff9eb;border-radius:12px;padding:13px 17px;font-size:14px}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:13px;margin:22px 0 29px}.stat{background:#fff;border:1px solid var(--line);padding:20px;border-radius:16px}.stat strong{display:block;font-size:32px;color:var(--deep)}.stat small{color:var(--muted)}
.library{border:1px solid var(--line);padding:22px;background:#fff;border-radius:20px;box-shadow:0 13px 30px rgba(10,60,40,.05);margin:12px 0 28px}.tabs{display:flex;flex-wrap:wrap;gap:9px;border-bottom:1px solid var(--line);padding-bottom:18px}.tab{border:1px solid #bdd9c9;padding:12px 18px;background:var(--pale);color:var(--deep);border-radius:999px;font-weight:bold}.tab[aria-selected=true]{background:var(--green);border-color:var(--green);color:#fff}
.filters{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-top:23px;align-items:start}.field{min-width:0}.field.search{grid-column:span 2}.field label,.field .field-title{font-size:13px;color:#30523b;font-weight:800;display:block;margin-bottom:6px}.field input,.field select{display:block;min-height:45px;width:100%;background:#fff;border:1px solid #aacdb6;border-radius:10px;padding:10px;color:var(--ink)}
.multi{position:relative}.multi details{border:1px solid #aacdb6;border-radius:10px;background:#fff;min-height:45px}.multi summary{padding:10px 12px;cursor:pointer;list-style:revert;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.options{padding:5px 10px 10px;max-height:224px;overflow:auto;border-top:1px solid var(--line)}.option{display:flex;gap:8px;align-items:center;padding:4px 3px;font-size:13px}.option[hidden]{display:none}.option input{width:auto;min-height:auto}.option small{color:#627468;margin-left:auto}.option.disabled{opacity:.48}
.filter-actions{display:flex;gap:10px;justify-content:space-between;align-items:center;flex-wrap:wrap;margin:18px 0}.filter-actions .reset{background:#fff;border:1px solid #aacdb6;color:var(--deep);border-radius:9px;padding:10px 14px;font-weight:bold}.active-filters{display:flex;gap:7px;flex-wrap:wrap}.active-filters span{font-size:12px;border-radius:20px;background:#e5f3ea;color:#195237;padding:5px 10px}.resultbar{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;font-size:14px;color:var(--muted);margin-bottom:18px}.resultbar strong{color:var(--deep)}
.ideas{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.idea{border:1px solid var(--line);border-radius:15px;padding:19px;background:#fcfffd;overflow-wrap:anywhere;scroll-margin-top:22px}.idea:target{box-shadow:0 0 0 3px #92ceaa}.idea[hidden]{display:none}.cardmeta{display:flex;align-items:center;flex-wrap:wrap;gap:8px;font-size:12px}.label{background:#e9f3ed;color:#145536;border-radius:20px;padding:2px 9px;font-weight:700}.label.secondary{background:#edf1f1;color:#385c51}.label.proposal{background:#fff2d9;color:#7c4c05}.label.approved{background:#e3f1eb;color:#23633d}.group-label{margin:10px 0 4px;color:#567264;font-size:13px;font-weight:bold}.idea h3{font-size:19px;line-height:1.35;margin:4px 0 13px}.idea h3 a{color:var(--deep);text-decoration:none}.idea h3 a:hover{text-decoration:underline}.idea p{font-size:14px;margin:8px 0}.source{color:#536d60}.chips{display:flex;flex-wrap:wrap;gap:5px;margin:13px 0}.chip{background:#eaf5ee;border-radius:20px;padding:3px 8px;font-size:11px;color:#285d40}.warning{border-top:1px solid var(--line);padding-top:11px;font-size:11px;color:#775522;font-weight:700}
.empty{border:1px dashed #8fbaa2;padding:22px;text-align:center;border-radius:14px}.empty[hidden]{display:none}.resources{padding:12px 0 40px}.links{display:flex;flex-wrap:wrap;gap:9px}.links a{border:1px solid #aecdbb;border-radius:9px;background:#fff;padding:9px 12px;text-decoration:none;font-size:14px;font-weight:bold}footer{background:#eaf4ee;padding:22px 0;color:#405e4c;font-size:12px}
@media(max-width:900px){.filters{grid-template-columns:repeat(2,minmax(0,1fr))}.ideas{grid-template-columns:1fr}}@media(max-width:560px){.filters,.stats{grid-template-columns:1fr}.field.search{grid-column:span 1}.library{padding:15px}.tab{width:100%;text-align:left}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
</style></head><body>
<header><div class="wrap top"><strong>Human Safety Foundation · Digital Knowledge Hub</strong><nav aria-label="Hub navigation"><a href="../index.html">Hub Home</a><a href="../social_communication_plan.html">Social v4.0 Framework</a><a href="../brand_identity_master_guide.html">Brand Guide</a></nav></div></header>
<main><section class="hero wrap"><div class="eyebrow">Controlled editorial library · Knowledge Hub v1.8.0 proposal</div><h1>HSF Social Content Idea Library</h1><p>One conditional, searchable catalogue covering <b>Knowledge, Data &amp; Insight</b> and <b>Programme Stories &amp; Communication</b>. The 254 earlier editorial ideas are preserved. The 46 additions are clearly marked as proposals requiring institutional review.</p>
<div class="notice"><b>Publication gate:</b> Editorial approval is never approval of a claim, event, case study, image or public post. Validate original evidence, apply technical and safeguarding reviews, and obtain management approval for each exact publication.</div>
<div class="stats"><div class="stat"><strong>300</strong><small>All editorial concepts</small></div><div class="stat"><strong>160</strong><small>KDI ideas (26 new proposed)</small></div><div class="stat"><strong>140</strong><small>PSC ideas (20 new proposed)</small></div></div></section>
<section class="wrap" aria-label="Unified idea catalogue"><div class="library">
<div role="tablist" class="tabs" aria-label="Idea banks"><button class="tab" type="button" id="tab-all" data-bank="all" role="tab" aria-controls="idea-panel" aria-selected="true">All ideas (300)</button><button class="tab" type="button" id="tab-kdi" data-bank="kdi" role="tab" aria-controls="idea-panel" aria-selected="false">Knowledge &amp; Insight (160)</button><button class="tab" type="button" id="tab-psc" data-bank="psc" role="tab" aria-controls="idea-panel" aria-selected="false">Programme Stories (140)</button></div>
<div id="idea-panel" role="tabpanel" aria-labelledby="tab-all"><form id="idea-filters" class="filters" role="search" onsubmit="return false">
<div class="field search"><label for="search">Search all idea fields</label><input type="search" id="search" placeholder="Title, idea ID, subject, evidence, keywords" autocomplete="off"></div>
<div class="field"><label for="programme">Primary programme</label><select id="programme"><option value="">All programmes</option><option value="E4BL">Education for Better Life</option><option value="A2PHC">Primary Healthcare</option><option value="CAR">Climate Action &amp; Resilience</option><option value="CROSS">Cross-cutting</option></select></div>
<div class="field"><label for="group">Topic / content family</label><select id="group"><option value="">All topics &amp; families</option></select></div>
<div class="field multi"><span class="field-title">Cross-cutting tags (select multiple)</span><details id="tag-picker"><summary id="tag-summary">All tags</summary><div class="options" id="tag-options" role="group" aria-label="Cross-cutting topic tags"></div></details></div>
<div class="field"><label for="evidence">Evidence route</label><select id="evidence"><option value="">All evidence routes</option><option value="Source leads: verification pending">Research source leads</option><option value="Field occurrence/evidence required">Field occurrence required</option></select></div>
<div class="field"><label for="status">Idea review status</label><select id="status"><option value="">All idea statuses</option><option value="approved">Editorial idea approved</option><option value="proposed">Proposed for review</option></select></div>
<div class="field"><label for="format">Visual / media family</label><select id="format"><option value="">All formats</option></select></div>
<div class="field"><label for="sort">Sort ideas</label><select id="sort"><option value="id">Idea ID (ascending)</option><option value="new">Newest additions first</option><option value="title">Title A–Z</option><option value="programme">Programme</option></select></div></form>
<div class="filter-actions"><div class="active-filters" id="active-filters" aria-label="Active filters"></div><button class="reset" id="reset" type="button">Clear all filters</button></div>
<div class="resultbar"><strong id="count" aria-live="polite" role="status">Showing 300 of 300 ideas</strong><span id="context">254 earlier ideas · 46 proposals · zero publication-ready claims</span></div>
<div class="ideas" id="ideas">''' +cards+'''</div><div id="empty" class="empty" hidden><strong>No matching ideas.</strong><p>Broaden the filters or clear one of your selected tags.</p></div>
</div></div></section>
<section class="wrap resources" aria-label="Governance and source bank downloads"><h2>Controlled source inventories</h2><p>These are editorial research/story opportunities. No external statistic, service activity or case outcome is verified by this catalogue. Discovery tags on older records are suggested editorial topics for filtering, not independently verified factual classifications.</p>
<div class="links"><a href="research/HSF_Knowledge_Data_Insight_160_Idea_Bank_Editorial_Inventory.xlsx">KDI 160 workbook</a><a href="research/HSF_Programme_Stories_Communication_140_Idea_Bank_Editorial_Inventory.xlsx">PSC 140 workbook</a><a href="research/source_registry.json">Research source registry</a><a href="registers/content_evidence_register_TEMPLATE.csv">Evidence register template</a><a href="../governance/APPROVED_INFORMATION_STANDARD.md">Approved Information Standard</a></div></section></main>
<footer><div class="wrap">HSF Knowledge Hub v1.8.0 candidate · Social Communication Ecosystem v4.0 approved policy · 30 October 2026 · Planning &amp; Compiled by: Saiful Islam</div></footer>
<script>
(function(){'use strict';
const cards=Array.from(document.querySelectorAll('#ideas .idea'));
const els=Object.fromEntries(['search','programme','group','evidence','status','format','sort','reset','count','empty','active-filters','tag-options','tag-summary','tag-picker','idea-panel'].map(id=>[id,document.getElementById(id)]));
const tabs=Array.from(document.querySelectorAll('[role="tab"][data-bank]'));
const allTags=[...new Set(cards.flatMap(x=>x.dataset.tags.split('|')))].sort((a,b)=>a.localeCompare(b));
const tagState=new Set(); let currentBank='all';
for(const tag of allTags){const label=document.createElement('label');label.className='option';const inp=document.createElement('input');inp.type='checkbox';inp.value=tag;inp.addEventListener('change',()=>{if(inp.checked)tagState.add(tag);else tagState.delete(tag);render()});const name=document.createElement('span');name.textContent=tag;const n=document.createElement('small');n.className='facet-count';label.append(inp,name,n);els['tag-options'].append(label)}
const tags=Array.from(els['tag-options'].querySelectorAll('label'));
function val(id){return els[id].value}
function match(c,exclude=''){
 if(exclude!=='bank'&&currentBank!=='all'&&c.dataset.bank!==currentBank)return false;
 if(exclude!=='search'&&val('search').trim()&&!c.dataset.search.includes(val('search').trim().toLowerCase()))return false;
 if(exclude!=='programme'&&val('programme')&&c.dataset.programme!==val('programme'))return false;
 if(exclude!=='group'&&val('group')&&c.dataset.bank+':'+c.dataset.group!==val('group'))return false;
 if(exclude!=='evidence'&&val('evidence')&&c.dataset.evidence!==val('evidence'))return false;
 if(exclude!=='status'&&val('status')&&c.dataset.status!==val('status'))return false;
 if(exclude!=='format'&&val('format')&&c.dataset.format!==val('format'))return false;
 if(exclude!=='tags'&&tagState.size&&![...tagState].some(t=>c.dataset.tags.split('|').includes(t)))return false;
 return true;
}
// Facet counts exclude the facet itself, so available choices truly follow the other active constraints.
function refreshFacet(id,key,fn){const select=els[id];const selected=val(id);const values=[...new Set(cards.map(c=>fn(c)))].sort((a,b)=>a.localeCompare(b));const byValue=new Map(values.map(v=>[v,0]));for(const c of cards)if(match(c,key))byValue.set(fn(c),(byValue.get(fn(c))||0)+1);
 const base=select.options[0];select.replaceChildren(base);for(const v of values){const opt=document.createElement('option');opt.value=v;opt.textContent=v.replace(/^(kdi|psc):/,'')+' ('+(byValue.get(v)||0)+')';opt.disabled=!byValue.get(v)&&v!==selected;select.append(opt)}select.value=selected;}
function facetTags(){tags.forEach(label=>{const input=label.querySelector('input');const tag=input.value;const n=cards.filter(c=>match(c,'tags')&&c.dataset.tags.split('|').includes(tag)).length;label.querySelector('.facet-count').textContent=String(n);label.classList.toggle('disabled',n===0&&!input.checked);input.disabled=n===0&&!input.checked;});els['tag-summary'].textContent=tagState.size?tagState.size+' tag(s) selected':'All tags';}
function params(){const p=new URLSearchParams();if(currentBank!=='all')p.set('bank',currentBank);for(const id of ['search','programme','group','evidence','status','format','sort'])if(val(id)&&!(id==='sort'&&val(id)==='id'))p.set(id,val(id));if(tagState.size)p.set('tags',[...tagState].join('|'));return p;}
function render(){refreshFacet('group','group',c=>c.dataset.bank+':'+c.dataset.group);refreshFacet('format','format',c=>c.dataset.format);const counts={programme:new Map(),evidence:new Map(),status:new Map()};for(const id of ['programme','evidence','status']){const el=els[id];for(const opt of [...el.options].slice(1)){const n=cards.filter(c=>match(c,id)&&c.dataset[id]===opt.value).length;opt.disabled=!n&&el.value!==opt.value;}}
 facetTags();const matched=cards.filter(c=>match(c));const total=matched.length;const sorted=[...matched];const sort=val('sort');if(sort==='title')sorted.sort((a,b)=>a.querySelector('h3').textContent.localeCompare(b.querySelector('h3').textContent));else if(sort==='programme')sorted.sort((a,b)=>a.dataset.programme.localeCompare(b.dataset.programme)||a.id.localeCompare(b.id));else if(sort==='new')sorted.sort((a,b)=>(b.dataset.status==='proposed'?1:0)-(a.dataset.status==='proposed'?1:0)||a.id.localeCompare(b.id));else sorted.sort((a,b)=>a.id.localeCompare(b.id));
 const target=els['idea-panel'].querySelector('#ideas');for(const c of cards)c.hidden=!matched.includes(c);for(const c of sorted)target.append(c);
 els.count.textContent='Showing '+total+' of '+(currentBank==='all'?300:currentBank==='kdi'?160:140)+' ideas';els.empty.hidden=total!==0;els['active-filters'].replaceChildren();const terms=[currentBank==='all'?'':'Bank: '+currentBank.toUpperCase(),...['programme','group','evidence','status','format'].map(x=>val(x)?x+': '+val(x).replace(/^(kdi|psc):/,''):''),...tagState].filter(Boolean);for(const label of terms){const e=document.createElement('span');e.textContent=label;els['active-filters'].append(e)}
 const panel=els['idea-panel'];panel.setAttribute('aria-labelledby','tab-'+currentBank);tabs.forEach(t=>{const active=t.dataset.bank===currentBank;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1});
 const q=params().toString();const hash=location.hash;if(['http:','https:'].includes(location.protocol))try{history.replaceState(null,'',location.pathname+(q?'?'+q:'')+hash)}catch(_e){};
}
function chooseBank(b,focus=false){currentBank=b;render();if(focus)tabs.find(t=>t.dataset.bank===b).focus();}
tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>chooseBank(tab.dataset.bank));tab.addEventListener('keydown',e=>{if(!['ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;e.preventDefault();const j=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;chooseBank(tabs[j].dataset.bank,true)})});
for(const id of ['search','programme','group','evidence','status','format','sort'])for(const ev of ['input','change'])els[id].addEventListener(ev,render);
els['reset'].addEventListener('click',()=>{for(const id of ['search','programme','group','evidence','status','format'])els[id].value='';els.sort.value='id';tagState.clear();for(const l of tags)l.querySelector('input').checked=false;chooseBank('all');});
const q=new URLSearchParams(location.search);const hash=location.hash.substring(1).toUpperCase();const linked=cards.find(c=>c.id===hash);for(const id of ['search','programme','group','evidence','status','format','sort']){if(q.has(id))els[id].value=q.get(id)}for(const tag of (q.get('tags')||'').split('|')){if(allTags.includes(tag)){tagState.add(tag);tags.find(l=>l.querySelector('input').value===tag).querySelector('input').checked=true;}}currentBank=['kdi','psc'].includes(q.get('bank'))?q.get('bank'):linked?linked.dataset.bank:'all';render();if(linked){linked.hidden=false;linked.scrollIntoView({block:'start'})}
})();
</script><noscript><div class="wrap notice">All 300 cards are available without JavaScript. Live conditional filters require JavaScript.</div></noscript>
</body></html>'''
out=R/'communication/idea-library.html';out.write_text(html,encoding='utf-8')
print('Built',len(K)+len(P),'cards',out.stat().st_size,'bytes')
