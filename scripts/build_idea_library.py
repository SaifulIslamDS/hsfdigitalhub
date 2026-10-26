#!/usr/bin/env python3
"""Build the canonical, offline-friendly 254-idea library from approved KDI and PSC JSON inventories.

No sensitive ERP data is used. This script does not approve factual claims or publication.
"""
from pathlib import Path
from collections import Counter
from html import escape as h
import json

R=Path(__file__).resolve().parents[1]
K=json.loads((R/'communication/research/kdi_134_ideas.json').read_text(encoding='utf-8'))['ideas']
P=json.loads((R/'communication/research/psc_120_ideas.json').read_text(encoding='utf-8'))['ideas']
assert len(K)==134 and len(P)==120
assert len({x['id'] for x in K+P})==254

E=lambda x:h(str(x),quote=True)
PROGRAMS={'E4BL':'Education for Better Life','A2PHC':'Access to Primary Healthcare','CAR':'Climate Action & Resilience','CROSS':'Cross-cutting'}

cards=[]
for bank,ideas in [('kdi',K),('psc',P)]:
 for x in ideas:
  group=x['series'] if bank=='kdi' else x['content_family']
  stream='HSF Knowledge & Awareness' if bank=='kdi' else x['stream']
  fields=[x['id'],x['programme'],PROGRAMS[x['programme']],group,stream,x['title']]
  if bank=='kdi': fields += [x['research_question'],x['possible_response'],x['source_keys'],x['source_names'],x['visual_format']]
  else: fields += [x['editorial_angle'],x['minimum_evidence'],x['suggested_format'],x['review_risk']]
  searchable=' '.join(fields).lower()
  if bank=='kdi':
   details=''.join([
    f'<p><strong>Evidence to investigate:</strong> {E(x["research_question"])}</p>',
    f'<p><strong>Potential response:</strong> {E(x["possible_response"])}</p>',
    f'<p><strong>Suggested visual:</strong> {E(x["visual_format"])}</p>',
    f'<p class="sources"><strong>Research leads:</strong> {E(x["source_keys"])} · <a href="research/source_registry.json">Source registry</a></p>',
    (f'<p class="sources"><strong>Context:</strong> {E(x["source_context"])}</p>' if x.get('source_context') else ''),
   ])
   warning='IDEA APPROVED · EVIDENCE NOT VERIFIED · PUBLICATION NOT APPROVED'
  else:
   details=''.join([
    f'<p><strong>Story angle:</strong> {E(x["editorial_angle"])}</p>',
    f'<p><strong>Evidence required:</strong> {E(x["minimum_evidence"])}</p>',
    f'<p><strong>Suggested format:</strong> {E(x["suggested_format"])}</p>',
    f'<p class="sources"><strong>Review requirement:</strong> {E(x["review_risk"])}</p>',
   ])
   warning='IDEA APPROVED · EVENT/OUTCOME NOT VERIFIED · PUBLICATION NOT APPROVED'
  cards.append(f'''<article class="idea" id="{E(x['id'])}" data-bank="{bank}" data-programme="{E(x['programme'])}" data-group="{E(group)}" data-stream="{E(stream)}" data-search="{E(searchable)}">
    <div class="cardmeta"><span class="id">{E(x['id'])}</span><span class="type {'kdi' if bank=='kdi' else 'psc'}">{'Knowledge & Insight' if bank=='kdi' else 'Programme Stories'}</span><span class="programme">{E(x['programme'])}</span></div>
    <div class="group">{E(group)}</div>
    <h3><a href="#{E(x['id'])}" aria-label="Link to idea {E(x['id'])}">{E(x['title'])}</a></h3>
    {details}<div class="warning">{warning}</div>
  </article>''')

groups={'kdi':sorted({x['series'] for x in K}),'psc':sorted({x['content_family'] for x in P})}
option_groups=''.join(f'<optgroup label="{E(label)}">'+''.join(f'<option value="{E(bank)}:{E(g)}" data-bank="{bank}">{E(g)}</option>' for g in vals)+'</optgroup>' for bank,label,vals in [('kdi','Knowledge topics (KDI)',groups['kdi']),('psc','Story content families (PSC)',groups['psc'])])

html=f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow,noarchive"><meta name="theme-color" content="#008C44">
<meta name="description" content="HSF unified Social Communication Idea Library with 134 Knowledge & Insight and 120 Programme Stories editorial ideas; ideas are not verified publication claims.">
<title>HSF Social Content Idea Library | 254 Editorial Ideas</title>
<style>
:root{{--green:#008C44;--deep:#163F2A;--blue:#1769AA;--ink:#273b33;--muted:#53665e;--line:#d4e5dc;--pale:#EFF8F3;--page:#f8fbf9}}
*{{box-sizing:border-box}}html{{scroll-behavior:smooth}}body{{margin:0;font:16px/1.55 Arial,'Noto Sans Bengali',sans-serif;background:var(--page);color:var(--ink)}}
button,input,select{{font:inherit}}a{{color:#1769AA}}a:focus-visible,button:focus-visible,input:focus-visible,select:focus-visible{{outline:3px solid #e0a226;outline-offset:3px}}
.wrap{{max-width:1220px;margin:auto;padding:0 22px}}header{{background:var(--deep);color:white;padding:18px 0}}.top{{display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap}}.brand{{font-weight:800;font-size:17px}}nav{{display:flex;gap:16px;flex-wrap:wrap}}nav a{{color:white;text-decoration:none;font-weight:600;font-size:14px}}nav a:hover{{text-decoration:underline}}
.hero{{padding:44px 0 24px}}.eyebrow{{letter-spacing:.13em;text-transform:uppercase;color:#006b35;font-size:12px;font-weight:800}}h1{{font-size:clamp(27px,4vw,41px);line-height:1.16;color:var(--deep);margin:9px 0 16px}}p{{margin:8px 0 14px}}.lead{{max-width:950px;color:#3e594c;font-size:17px}}.notice{{background:#fff7e8;border:1px solid #e9d19e;border-radius:13px;padding:13px 17px;font-size:14px;margin:18px 0}}
.stats{{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:22px 0}}.stat{{border:1px solid var(--line);background:#fff;border-radius:15px;padding:17px 20px}}.stat strong{{display:block;font-size:27px;color:var(--deep)}}.stat span{{font-size:13px;color:#4a6154}}
.library{{background:#fff;border:1px solid var(--line);border-radius:18px;padding:21px;box-shadow:0 14px 35px rgba(20,80,42,.045);margin-bottom:34px}}.tabs{{display:flex;flex-wrap:wrap;gap:8px;border-bottom:1px solid var(--line);padding-bottom:13px}}.tab{{border:1px solid #c3dace;background:#f4faf6;color:var(--deep);border-radius:999px;padding:10px 17px;font-weight:700;cursor:pointer}}.tab[aria-selected=true]{{background:var(--green);color:white;border-color:var(--green)}}.tab span{{font-weight:400;opacity:.9}}.filters{{margin:20px 0 14px;display:grid;grid-template-columns:minmax(220px,2.2fr) repeat(2,minmax(150px,1fr)) auto;gap:12px;align-items:end}}.field label{{display:block;font-size:13px;font-weight:700;margin:0 0 6px;color:#355644}}.field input,.field select{{width:100%;border:1px solid #accab9;border-radius:10px;padding:11px 12px;background:white;min-height:46px;color:var(--ink)}}.reset{{border:1px solid #accab9;background:white;border-radius:10px;padding:11px 14px;cursor:pointer;min-height:46px;color:var(--deep);font-weight:700}}.resultbar{{margin:8px 0 19px;display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap;font-size:14px;color:var(--muted)}}.resultbar strong{{color:var(--deep)}}.ideas{{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}}.idea{{border:1px solid var(--line);border-radius:14px;padding:18px;background:#fcfffd;scroll-margin-top:24px;overflow-wrap:anywhere}}.idea:target{{box-shadow:0 0 0 3px #81bb9b}}.idea[hidden]{{display:none}}.cardmeta{{display:flex;flex-wrap:wrap;gap:7px;align-items:center;font-size:12px}}.id{{font-weight:800;color:var(--deep)}}.type,.programme{{padding:2px 9px;border-radius:999px;background:#eaf4ee;color:#14513a;font-weight:700}}.type.psc{{background:#eef1fb;color:#273f75}}.programme{{background:#f1f4f5;color:#4a5c58}}.group{{font-size:13px;font-weight:700;color:#53665e;margin-top:12px}}.idea h3{{line-height:1.3;font-size:19px;margin:5px 0 13px}}.idea h3 a{{text-decoration:none;color:var(--deep)}}.idea h3 a:hover{{text-decoration:underline}}.idea p{{font-size:14px;margin:7px 0}}.idea .sources{{color:#475e51}}.warning{{border-top:1px solid var(--line);padding-top:10px;margin-top:12px;color:#7d5311;font-size:11px;letter-spacing:.015em;font-weight:700}}.empty{{border:1px dashed #a8c9b4;border-radius:14px;padding:24px;text-align:center;color:var(--muted)}}.empty[hidden]{{display:none}}.resources{{margin:25px 0 35px;display:flex;gap:12px;flex-wrap:wrap}}.resources a{{display:inline-block;border:1px solid #add0bb;padding:11px 14px;background:white;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none}}.resources a:hover{{text-decoration:underline}}footer{{background:#eaf4ee;padding:24px 0;font-size:13px;color:#466150}}
@media(max-width:890px){{.filters{{grid-template-columns:1fr 1fr}}.searchfield{{grid-column:1/-1}}.ideas{{grid-template-columns:1fr}}}}@media(max-width:560px){{.filters,.stats{{grid-template-columns:1fr}}.searchfield{{grid-column:auto}}.tab{{flex:1 1 100%;text-align:left}}.library{{padding:15px}}}}
@media(prefers-reduced-motion:reduce){{html{{scroll-behavior:auto}}}}
</style></head>
<body><header><div class="wrap top"><div class="brand">Human Safety Foundation · Digital Knowledge Hub</div><nav aria-label="Knowledge Hub navigation"><a href="../index.html">Hub Home</a><a href="../social_communication_plan.html">Social v4.0 Framework</a><a href="../brand_identity_master_guide.html">Brand Guide</a></nav></div></header>
<main><section class="hero wrap"><div class="eyebrow">Approved editorial inventory · Knowledge Hub v1.7.1</div><h1>HSF Social Content Idea Library</h1><p class="lead">One expandable catalogue combining <strong>Knowledge, Data &amp; Insight (KDI)</strong> and <strong>Programme Stories &amp; Communication (PSC)</strong>. Explore all ideas together or focus on one content bank. Both inventories remain separate approved source datasets.</p>
<div class="notice" role="note"><strong>Publication boundary:</strong> Approval of an editorial idea does not verify the underlying statistic, event, outcome or testimony. Every final public claim, image, story and graphic requires documented evidence, safeguarding review and explicit publication approval.</div>
<div class="stats"><div class="stat"><strong>254</strong><span>Ideas in unified catalogue</span></div><div class="stat"><strong>134</strong><span>KDI research and insight concepts</span></div><div class="stat"><strong>120</strong><span>PSC field and storytelling concepts</span></div></div></section>
<section class="wrap" aria-label="Unified idea catalogue"><div class="library">
<div class="tabs" role="tablist" aria-label="Editorial idea bank" id="bank-tabs">
<button class="tab" id="tab-all" role="tab" type="button" aria-controls="idea-panel" aria-selected="true" data-tab="all" tabindex="0">All ideas <span>(254)</span></button>
<button class="tab" id="tab-kdi" role="tab" type="button" aria-controls="idea-panel" aria-selected="false" data-tab="kdi" tabindex="-1">Knowledge &amp; Insight <span>(134)</span></button>
<button class="tab" id="tab-psc" role="tab" type="button" aria-controls="idea-panel" aria-selected="false" data-tab="psc" tabindex="-1">Programme Stories <span>(120)</span></button>
</div><div id="idea-panel" role="tabpanel" aria-labelledby="tab-all" tabindex="0">
<form class="filters" id="idea-filters" role="search" onsubmit="return false">
<div class="field searchfield"><label for="search">Search all idea fields</label><input id="search" type="search" autocomplete="off" placeholder="Search idea ID, title, health, attendance, case studies…"></div>
<div class="field"><label for="programme">Programme</label><select id="programme"><option value="">All programmes</option><option value="E4BL">Education for Better Life</option><option value="A2PHC">Primary Healthcare</option><option value="CAR">Climate Action &amp; Resilience</option><option value="CROSS">Cross-cutting</option></select></div>
<div class="field"><label for="group">Topic / content family</label><select id="group"><option value="">All topics and families</option>{option_groups}</select></div>
<button class="reset" type="reset" id="reset">Clear filters</button></form>
<div class="resultbar"><strong id="count" role="status" aria-live="polite">Showing 254 of 254 ideas</strong><span id="context">All approved editorial concepts · not publication-ready claims</span></div>
<div class="ideas" id="ideas">{''.join(cards)}</div><div class="empty" id="empty" hidden><strong>No matching ideas.</strong><p>Change your search or filters, or choose All ideas.</p></div>
</div></div></section>
<section class="wrap" aria-label="Approved source records"><h2>Source inventories and evidence governance</h2><p>The displayed cards are generated from the original two controlled JSON data inventories. The editable Excel banks remain independently governed. The KDI inventory adds 14 COP31 research topics; original KDI-001 to KDI-120 and all PSC records are preserved. Research sources are leads to verify, not citations supporting a specific claim until individually checked.</p>
<div class="resources"><a href="research/HSF_Knowledge_Data_Insight_134_Idea_Bank_Editorial_Inventory.xlsx">KDI editorial Excel bank</a><a href="research/HSF_Programme_Stories_Communication_120_Idea_Bank_Approved_Editorial_Inventory.xlsx">PSC approved Excel bank</a><a href="research/source_registry.json">KDI source registry</a><a href="registers/content_evidence_register_TEMPLATE.csv">Evidence register template</a><a href="../governance/APPROVED_INFORMATION_STANDARD.md">Approved Information Standard</a></div></section></main>
<footer><div class="wrap">HSF Digital Knowledge Hub · Social Communication Ecosystem v4.0 · Knowledge Hub v1.7.1 · Last updated: 26 October 2026 · Planning &amp; Compiled by: Saiful Islam · No confidential operational data stored.</div></footer>
<script>
(function(){{
'use strict';
const tabs=[...document.querySelectorAll('[role="tab"][data-tab]')], cards=[...document.querySelectorAll('#ideas .idea')];
const search=document.getElementById('search'),programme=document.getElementById('programme'),group=document.getElementById('group'), count=document.getElementById('count'), empty=document.getElementById('empty'), panel=document.getElementById('idea-panel');
let active='all';
function tabFromUrl(){{const p=new URLSearchParams(location.search).get('bank');return p==='kdi'||p==='psc'?p:'all';}}
function synchronizeUrl(){{try{{const u=new URL(location.href);if(active==='all')u.searchParams.delete('bank');else u.searchParams.set('bank',active);history.replaceState(null,'',u.pathname+u.search+u.hash)}}catch(e){{/* Browsers may restrict local file URLs; filtering still works. */}}}}
function updateGroupOptions(){{for(const o of group.options){{if(!o.value)continue;const bank=o.dataset.bank;o.hidden=active!=='all'&&bank!==active;o.disabled=o.hidden;}}if(group.selectedOptions[0]?.disabled)group.value='';}}
function normalize(t){{return (t||'').toLocaleLowerCase().trim();}}
function apply(){{const q=normalize(search.value),p=programme.value,g=group.value;let shown=0;for(const c of cards){{const ok=(active==='all'||c.dataset.bank===active)&&(!p||c.dataset.programme===p)&&(!g||c.dataset.bank+':'+c.dataset.group===g)&&(!q||normalize(c.dataset.search).includes(q));c.hidden=!ok;if(ok)shown++;}}const base=active==='all'?254:(active==='kdi'?134:120);count.textContent='Showing '+shown+' of '+base+' ideas';empty.hidden=shown>0;}}
function selectTab(value,focus=false){{active=value;tabs.forEach(t=>{{const selected=t.dataset.tab===active;t.setAttribute('aria-selected',String(selected));t.tabIndex=selected?0:-1; if(selected&&focus)t.focus();}});panel.setAttribute('aria-labelledby','tab-'+active);updateGroupOptions();synchronizeUrl();apply();}}
tabs.forEach((t,i)=>{{t.addEventListener('click',()=>selectTab(t.dataset.tab));t.addEventListener('keydown',e=>{{if(!['ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;e.preventDefault();const n=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;selectTab(tabs[n].dataset.tab,true);}});}});
[search,programme,group].forEach(x=>{{x.addEventListener('input',apply);x.addEventListener('change',apply);}});
document.getElementById('idea-filters').addEventListener('reset',()=>{{setTimeout(()=>{{updateGroupOptions();apply();}},0);}});
const target=location.hash.slice(1).toUpperCase();const targetCard=cards.find(c=>c.id===target);const fromHash=targetCard?.dataset.bank;selectTab(tabFromUrl()==='all'&&fromHash?fromHash:tabFromUrl());
if(targetCard){{const anchor=targetCard;setTimeout(()=>anchor.scrollIntoView({{block:'start'}}),0);}}
}})();
</script><noscript><div class="wrap notice">JavaScript is disabled. All 254 ideas remain visible below; tab controls and filters require JavaScript.</div></noscript>
</body></html>'''

out=R/'communication/idea-library.html';out.write_text(html,encoding='utf-8')
print(f'WROTE {out} with {len(cards)} unique idea cards; size {out.stat().st_size}')
