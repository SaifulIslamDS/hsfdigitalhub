/* ============ canvas ============ */
function canvasJSON(cv){const j=cv.toJSON(PROPS);delete j.clipPath;j.objects=j.objects.filter(o=>!o.hsfProxy);return j}
function prep(cv){if(cv===canvas&&window.fabric)pageClip();cv.getObjects().forEach(o=>{if(o.hsfSlot)slotControls(o);if(o.hsfEditPts)o.hsfEditPts=false;if(o.hsfLock)o.set({selectable:false,evented:false})})}
function setupCanvas(){
  fabric.Object.prototype.set({transparentCorners:false,cornerColor:"#008C44",cornerStrokeColor:"#ffffff",borderColor:"#008C44",cornerStyle:"circle",cornerSize:10,padding:1,borderScaleFactor:1.5});
  const origML=fabric.Text.prototype._measureLine;
  fabric.Text.prototype._measureLine=function(i){const r=origML.call(this,i);const line=this._textLines[i].join("");
    if(/[ঀ-৿]/.test(line)&&!this.charSpacing){const c=fabric.util.createCanvasElement().getContext("2d");c.font=this._getFontDeclaration();r.width=c.measureText(line).width}return r};
  canvas=new fabric.Canvas("c",{preserveObjectStacking:true,enableRetinaScaling:true,stopContextMenu:true,fireRightClick:false});
  canvas.on("selection:created",onSel);canvas.on("selection:updated",onSel);canvas.on("selection:cleared",e=>{if(editProxy&&!(e.deselected||[]).some(o=>o.hsfProxy)){}onSel()});
  ["object:added","object:removed"].forEach(ev=>canvas.on(ev,e=>{if(!loading&&!(e.target&&e.target.hsfProxy))changed()}));
  canvas.on("object:modified",onModified);
  canvas.on("text:changed",e=>{const o=e.target;if(!o)return;if(o.hsfBind){const m=/^\{(\w+)\}$/.exec(o.hsfBind);if(m){setField(m[1],o.text,true)}else o.hsfBind=null}
    if(o.hsfFit)o.hsfFit=null;reflow(canvas);changed()});
  canvas.on("mouse:dblclick",e=>{if(tool==="pen"){finishPen();return}let o=e.target;if(o&&o.hsfProxy&&editProxy)o=editProxy.o;if(o&&o.hsfSlot){if(o.hsfUser&&!o._crop)enterCrop(o);else if(o._crop)exitCrop(o);else pickPhotoFor(o)}else if(o&&o.hsfComp&&o.hsfComp.kind==="logo"&&!logoURL){showTab("brand");say("Upload the approved vector logo in Brand. It fills every logo tile.")}});
  canvas.on("mouse:down",onPenDown);canvas.on("mouse:move",onPenMove);
  canvas.on("object:moving",onLiveTransform);canvas.on("object:scaling",onLiveTransform);
  canvas.on("path:created",e=>{const p=e.path;p.set({hsfId:uid(),hsfStrokeRole:penRole,hsfName:"Freehand drawing",fill:""});changed()});
  window.addEventListener("resize",()=>{if(fitMode)fitZoom()});
  document.addEventListener("keydown",onKey);
}
function changed(){pushHist();scheduleSize();renderLayers();scheduleQA()}
function fitZoom(){const st=$("stage");if(!st.clientWidth)return;const aw=Math.max(120,st.clientWidth-2*PAD-24),ah=Math.max(120,st.clientHeight-2*PAD-24);zoom=Math.min(aw/D.w,ah/D.h,1);fitMode=true;applyZoom()}
const PAD=56;
function pageClip(){canvas.clipPath=new fabric.Rect({left:0,top:0,width:D.w,height:D.h,strokeWidth:0,absolutePositioned:true,fill:"#000"})}
function applyZoom(){const w=Math.round(D.w*zoom),h=Math.round(D.h*zoom);canvas.setDimensions({width:w+2*PAD,height:h+2*PAD});canvas.setViewportTransform([zoom,0,0,zoom,PAD,PAD]);pageClip();
  const pp=$("paper");pp.style.cssText=`left:${PAD}px;top:${PAD}px;width:${w}px;height:${h}px`;pp.classList.toggle("alpha",!!D.alpha);
  const gd=$("guides");gd.style.cssText=`left:${PAD}px;top:${PAD}px;width:${w}px;height:${h}px;inset:auto`;
  $("zoomlbl").textContent=Math.round(zoom*100)+"%";renderGuides();canvas.calcOffset();canvas.renderAll()}
function pageCanvas(mult){/* render the page at exact pixel size: D.w*zoom*mult × D.h*zoom*mult, no pasteboard, no edge bleed */
  const sc=Math.round(mult*zoom*1e6)/1e6,vt=canvas.viewportTransform.slice();canvas.viewportTransform=[1,0,0,1,0,0];
  try{const c=canvas.toCanvasElement(sc,{left:0,top:0,width:D.w,height:D.h});const W=Math.round(D.w*sc),H=Math.round(D.h*sc);if(c.width===W&&c.height===H)return c;
    const f=document.createElement("canvas");f.width=W;f.height=H;f.getContext("2d").drawImage(c,0,0,W,H);return f}
  finally{canvas.viewportTransform=vt;canvas.getObjects().forEach(o=>o.setCoords())}}
$("zfit").onclick=fitZoom;$("zin").onclick=()=>{zoom=Math.min(4,zoom*1.25);fitMode=false;applyZoom()};$("zout").onclick=()=>{zoom=Math.max(.05,zoom/1.25);fitMode=false;applyZoom()};
function renderGuides(){const g=$("guides");g.innerHTML="";if(!$("showguides").checked)return;(D.guides||[]).forEach(r=>{const d=document.createElement("div");d.className="guide"+(r.circle?" circle":"");
  d.style.left=(r.x/D.w*100)+"%";d.style.top=(r.y/D.h*100)+"%";d.style.width=(r.w/D.w*100)+"%";d.style.height=(r.h/D.h*100)+"%";const s=document.createElement("span");s.textContent=r.l;d.appendChild(s);g.appendChild(d)})}
$("showguides").addEventListener("change",renderGuides);
function isAlpha(){return!canvas.getObjects().some(o=>o.hsfBg)&&D.alpha}
function say(t,err){const m=$("savemsg");m.className="msg"+(err?" err":"");m.textContent=t}

/* ============ history ============ */
let histT=null;
function snapshot(){return JSON.stringify(canvasJSON(canvas))}
function pushHist(){clearTimeout(histT);histT=setTimeout(()=>{if(loading)return;const s=snapshot();if(hist[hi]===s)return;hist=hist.slice(0,hi+1);hist.push(s);if(hist.length>50)hist.shift();hi=hist.length-1;updUndo();autosave()},260)}
function resetHist(){hist=[snapshot()];hi=0;updUndo()}
function updUndo(){$("undo").disabled=hi<=0;$("redo").disabled=hi>=hist.length-1}
function restore(s){endEdit(false);loading=true;canvas.loadFromJSON(s,()=>{prep(canvas);loading=false;canvas.renderAll();renderLayers();onSel();scheduleSize();scheduleQA()})}
$("undo").onclick=()=>{if(hi>0){hi--;restore(hist[hi]);updUndo()}};
$("redo").onclick=()=>{if(hi<hist.length-1){hi++;restore(hist[hi]);updUndo()}};

/* ============ catalogue ============ */
const UIS={chan:"social",plat:"facebook",fmt:"feed_4x5",stream:"ALL",webcat:"home",active:null};
const thumbCache=new Map();let thumbCv=null,thumbChain=Promise.resolve();
function thumbFor(key,ref,content,maxPx=220){const ck=`${key}|${D.palette}|${D.type}|${logoURL?1:0}`;if(thumbCache.has(ck))return Promise.resolve(thumbCache.get(ck));
  thumbChain=thumbChain.then(async()=>{if(thumbCache.has(ck))return thumbCache.get(ck);if(!thumbCv)thumbCv=new fabric.StaticCanvas(document.createElement("canvas"),{enableRetinaScaling:false,renderOnAddRemove:false});
    const k=maxPx/Math.max(ref.w,ref.h);thumbCv.setDimensions({width:Math.round(ref.w*k),height:Math.round(ref.h*k)});thumbCv.setZoom(k);
    try{await buildInto(thumbCv,ref,content);thumbCv.renderAll();const u=thumbCv.toDataURL({format:"jpeg",quality:.72});thumbCache.set(ck,u);return u}catch(e){console.warn(e);return""}});return thumbChain}
function fmtObj(){return PLATFORMS[UIS.plat].formats.find(f=>f.id===UIS.fmt)}
function renderNav(){
  document.querySelectorAll("[data-chan]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.chan===UIS.chan));$("socialNav").hidden=UIS.chan!=="social";$("webNav").hidden=UIS.chan!=="web";
  const pn=$("platNav");pn.innerHTML="";Object.entries(PLATFORMS).forEach(([k,p])=>{const b=document.createElement("button");b.type="button";b.textContent=p.n;b.setAttribute("aria-pressed",k===UIS.plat);
    b.onclick=()=>{UIS.plat=k;if(!PLATFORMS[k].formats.some(f=>f.id===UIS.fmt))UIS.fmt="feed_4x5";renderNav();renderTplArea()};pn.appendChild(b)});
  const fn=$("fmtNav");fn.innerHTML="";PLATFORMS[UIS.plat].formats.forEach(f=>{const b=document.createElement("button");b.type="button";b.className="chip";b.textContent=f.n;b.setAttribute("aria-pressed",f.id===UIS.fmt);
    b.onclick=()=>{UIS.fmt=f.id;renderNav();renderTplArea()};fn.appendChild(b)});
  $("streamWrap").hidden=fmtObj().kind!=="arch";
  const sn=$("streamNav");sn.innerHTML="";Object.entries(STREAMS).forEach(([k,s])=>{const b=document.createElement("button");b.type="button";b.className="chip ghost";b.textContent=s.n;b.setAttribute("aria-pressed",k===UIS.stream);
    b.onclick=()=>{UIS.stream=k;if(k!=="ALL"){D.meta.stream=k;$("m_stream").value=k}renderNav();renderTplArea()};sn.appendChild(b)});
  const wn=$("webCatNav");wn.innerHTML="";Object.entries(WEB_CATS).forEach(([k,n])=>{const b=document.createElement("button");b.type="button";b.className="chip";b.textContent=n;b.setAttribute("aria-pressed",k===UIS.webcat);
    b.onclick=()=>{UIS.webcat=k;renderNav();renderTplArea()};wn.appendChild(b)})}
document.querySelectorAll("[data-chan]").forEach(b=>b.onclick=()=>{UIS.chan=b.dataset.chan;renderNav();renderTplArea()});
function thumbImg(el,key,ref,content){thumbFor(key,ref,content).then(u=>{if(u){el.innerHTML="";const i=new Image();i.src=u;i.alt="";el.appendChild(i)}})}
function renderTplArea(){const area=$("tplArea");area.innerHTML="";const note=$("tplNote");
  if(UIS.chan==="web"){note.textContent="Website images follow the PRD design system: Evergreen, PRD type scale, 1240 px content width and per-image size budgets. Add headings and buttons in Elementor where you can.";
    const list=document.createElement("div");list.className="tlist";WEB.filter(t=>t.cat===UIS.webcat).forEach(t=>{const ref={kind:"web",id:t.id,w:t.w,h:t.h};
      const b=row(t.n,`${t.w}×${t.h} · ${t.budget} KB budget${t.sub?" · "+t.sub:""}`);thumbImg(b.querySelector(".th"),"web:"+t.id,ref,{...DEFAULT_CONTENT,...t.content});
      b.onclick=()=>confirmLoad(b,()=>loadWeb(t));list.appendChild(b)});area.appendChild(list);return}
  const f=fmtObj();
  if(f.kind==="arch"){const st=STREAMS[UIS.stream];note.textContent=`${f.w}×${f.h} px · ★ = stack master for this format${st.note?" · "+st.note:""}`;
    const g=document.createElement("div");g.className="tgrid";const ids=ARCH_IDS.slice();if(st.rec.length){const ri=x=>{const i=st.rec.indexOf(x);return i<0?99:i};ids.sort((a,b)=>ri(a)-ri(b))}
    ids.forEach(a=>{const A=ARCH[a],isM=f.masters==="all"||(Array.isArray(f.masters)&&f.masters.includes(a)),rec=st.rec.includes(a);
      const b=document.createElement("button");b.type="button";b.className="tcard"+(rec?" rec":"");b.title=A.p;
      b.innerHTML=`<div class="th" style="aspect-ratio:${f.w}/${f.h}"></div><b>${A.n}</b><small>${A.share[0]}–${A.share[1]}% photo</small>${isM?'<span class="star">★</span>':""}${rec?'<span class="recb">Fits '+UIS.stream+'</span>':""}`;
      thumbImg(b.querySelector(".th"),`a:${a}:${f.w}x${f.h}`,{kind:"arch",arch:a,w:f.w,h:f.h},{...DEFAULT_CONTENT,headline:A.n});
      b.onclick=()=>confirmLoad(b,()=>loadArch(UIS.plat,f,a));g.appendChild(b)});area.appendChild(g);return}
  if(f.kind==="seq"){note.textContent=`${f.w}×${f.h} px per page. Each page uses the archetype the stack assigns to that stage; page headlines start as the stage names.`;
    const list=document.createElement("div");list.className="tlist";f.seqs.forEach(sid=>{const S=SEQUENCES[sid];
      const b=row(S.n,`${S.pages.length} pages · ${S.pages.map(p=>p[1]).join(" → ")}`);thumbImg(b.querySelector(".th"),`s:${sid}:${f.w}x${f.h}`,{kind:"arch",arch:S.pages[0][0],w:f.w,h:f.h},{...DEFAULT_CONTENT,headline:S.n,label:S.label});
      b.onclick=()=>confirmLoad(b,()=>loadSeq(UIS.plat,f,sid));list.appendChild(b)});area.appendChild(list);return}
  if(f.kind==="list"){note.textContent="Identity and one-off formats from the stack.";const list=document.createElement("div");list.className="tlist";
    f.items.forEach(it=>{const ref=it.custom?{kind:"custom",custom:it.custom,w:it.w,h:it.h}:{kind:"arch",arch:it.arch,w:it.w,h:it.h};
      const b=row(it.n+(it.master?" ★":""),it.sub);thumbImg(b.querySelector(".th"),`i:${it.id}`,ref,{...DEFAULT_CONTENT,...(it.content||{})});
      b.onclick=()=>confirmLoad(b,()=>loadIdentity(UIS.plat,it));list.appendChild(b)});area.appendChild(list)}}
function row(t,s){const b=document.createElement("button");b.type="button";b.className="trow";b.innerHTML=`<div class="th"></div><div><b></b><small></small></div>`;b.querySelector("b").textContent=t;b.querySelector("small").textContent=s;return b}
function hasWork(){savePage();return D.pages.some(p=>(p.json?.objects||[]).some(o=>o.hsfUser))||hi>3}
function confirmLoad(b,fn){if(hasWork()&&!b.dataset.ok){b.dataset.ok="1";b.classList.add("confirm");const old=b.querySelector("b").textContent;b.querySelector("b").textContent="Replace current design? Click again";
  setTimeout(()=>{delete b.dataset.ok;b.classList.remove("confirm");b.querySelector("b").textContent=old},3500);return}fn()}

/* ============ loading templates into pages ============ */
function storySeed(){return clone(D.story||{})}
async function loadPages(def){endEdit(false);D.name=def.name;D.cat=def.cat;D.platform=def.platform||"";D.fmt=def.fmt||"";D.w=def.w;D.h=def.h;D.guides=def.guides||[];D.budget=def.budget||null;D.alpha=!!def.alpha;D.a4=!!def.a4;
  if(!D.typeChosen){D.type=def.cat==="web"?"poppins":"stack";$("typeset").value=D.type}
  if(def.cat==="web"&&D.palette!=="evergreen"){D.palette="evergreen";renderPalBar();setTimeout(()=>say("Website images use the PRD Evergreen design system. You can still switch palette for a one-off."),50)}
  D.pages=[];say("Building "+def.pages.length+" page"+(def.pages.length>1?"s":"")+"…");
  for(let i=0;i<def.pages.length;i++){const p=def.pages[i];const content={...DEFAULT_CONTENT,...D.content,...p.content};
    await buildInto(canvas,p.ref,content);D.pages.push({json:canvasJSON(canvas),dur:3,trans:"fade",kb:true,content:clone(p.content||{}),defaultContent:clone(p.content||{}),ref:p.ref,stage:p.stage||"",thumb:null});D.cur=i;
    fitZoomQuiet();canvas.renderAll();D.pages[i].thumb=thumbOf()}
  $("xkb").value=D.budget||"";
  D.cur=0;loading=true;await new Promise(r=>canvas.loadFromJSON(D.pages[0].json,r));prep(canvas);loading=false;
  fitZoom();resetHist();renderPages();renderLayers();onSel();renderContentForm();scheduleSize();scheduleQA();updVideoLen();
  $("docname").textContent=D.name;$("docsize").textContent=`${D.w}×${D.h} px · ${D.pages.length} page${D.pages.length>1?"s":""}`;
  say(`Loaded ${D.name}. Double-click a photo frame to add a photo.`);autosave()}
function fitZoomQuiet(){zoom=Math.min(1,600/Math.max(D.w,D.h));applyZoom()}
function loadArch(plat,f,a){return loadPages({name:`${PLATFORMS[plat].n} ${f.n} · ${ARCH[a].n}`,cat:"social",platform:plat,fmt:f.id,w:f.w,h:f.h,guides:f.guides?STORY_GUIDES[f.guides](f.w,f.h):[],
  pages:[{ref:{kind:"arch",arch:a,w:f.w,h:f.h},content:storySeed(),stage:ARCH[a].n}]})}
function loadSeq(plat,f,sid){const S=SEQUENCES[sid];const seed=storySeed();return loadPages({name:`${PLATFORMS[plat].n} · ${S.n}`,cat:"social",platform:plat,fmt:f.id,w:f.w,h:f.h,guides:f.guides?STORY_GUIDES[f.guides](f.w,f.h):[],
  pages:S.pages.map(([a,stage],i)=>({ref:{kind:"arch",arch:a,w:f.w,h:f.h},stage,content:{label:S.label,...(S.keepFirst&&i===0?seed:{headline:stage})}}))})}
function loadIdentity(plat,it){const ref=it.custom?{kind:"custom",custom:it.custom,w:it.w,h:it.h}:{kind:"arch",arch:it.arch,w:it.w,h:it.h};
  return loadPages({name:`${PLATFORMS[plat].n} · ${it.n}`,cat:"social",platform:plat,fmt:it.id,w:it.w,h:it.h,a4:it.a4,guides:it.guides?STORY_GUIDES[it.guides](it.w,it.h):[],pages:[{ref,content:{...(it.content||{})},stage:it.n}]})}
function loadWeb(t){const ref={kind:"web",id:t.id,w:t.w,h:t.h};const pages=t.set?t.set.map(nm=>({ref:{...ref},content:{...(t.content||{}),headline:nm,label:nm==="Home"?"Human Safety Foundation":"Home  /  "+nm},stage:nm})):[{ref,content:{...(t.content||{})},stage:t.n}];
  return loadPages({name:`Website · ${t.n}`,cat:"web",fmt:t.id,w:t.w,h:t.h,budget:t.budget,alpha:t.alpha,guides:t.guides?STORY_GUIDES[t.guides](t.w,t.h):[],pages})}

/* ============ pages ============ */
function thumbOf(){try{return canvas.toDataURL({format:"jpeg",quality:.6,multiplier:Math.min(1,150/(D.w*zoom)),left:PAD,top:PAD,width:D.w*zoom,height:D.h*zoom})}catch(e){return null}}
function savePage(){const p=D.pages[D.cur];if(!p||!canvas)return;p.json=canvasJSON(canvas);p.thumb=thumbOf()}
function loadPage(i){savePage();endEdit(false);D.cur=i;loading=true;canvas.loadFromJSON(D.pages[i].json,async()=>{prep(canvas);await applyContent(canvas,pageContent());loading=false;canvas.renderAll();resetHist();renderPages();renderLayers();onSel();renderContentForm();scheduleSize();scheduleQA()})}
function renderPages(){const box=$("pages");box.innerHTML="";D.pages.forEach((p,i)=>{const b=document.createElement("button");b.type="button";b.className="pg";b.setAttribute("aria-pressed",i===D.cur);b.setAttribute("aria-label",`Page ${i+1} ${p.stage||""}`);
  b.innerHTML=`<div class="im">${p.thumb?`<img src="${p.thumb}" alt="">`:""}</div><span>${i+1}. ${(p.stage||"Page").replace(/</g,"&lt;")}</span>`;b.onclick=()=>{if(i!==D.cur)loadPage(i)};box.appendChild(b)});
  $("pgdel").disabled=D.pages.length<2;$("pgleft").disabled=D.cur===0;$("pgright").disabled=D.cur===D.pages.length-1;$("pagelbl").textContent=`Pages · ${D.pages.length} · each page is one slide in a carousel, PDF or video`;updVideoLen()}
$("pgadd").onclick=()=>{savePage();const p=D.pages[D.cur];D.pages.splice(D.cur+1,0,{...clone({...p,thumb:null}),thumb:p.thumb,stage:(p.stage||"Page")+" (copy)"});loadPage(D.cur+1)};
$("pgblank").onclick=async()=>{savePage();loading=true;canvas.clear();if(!D.alpha){const o=(await mk({t:"bg",w:D.w,h:D.h,role:"light"}))[0];canvas.add(o);await applyRolesTo([o])}loading=false;
  D.pages.splice(D.cur+1,0,{json:canvasJSON(canvas),dur:3,trans:"fade",kb:true,content:{},ref:null,stage:"Blank"});D.cur++;resetHist();savePage();renderPages();renderLayers();onSel()};
$("pgdel").onclick=()=>{if(D.pages.length<2)return;D.pages.splice(D.cur,1);D.cur=Math.max(0,D.cur-1);loading=true;canvas.loadFromJSON(D.pages[D.cur].json,()=>{prep(canvas);loading=false;canvas.renderAll();resetHist();renderPages();renderLayers();onSel();renderContentForm()})};
function movePage(d){savePage();const j=D.cur+d;if(j<0||j>=D.pages.length)return;[D.pages[D.cur],D.pages[j]]=[D.pages[j],D.pages[D.cur]];D.cur=j;renderPages()}
$("pgleft").onclick=()=>movePage(-1);$("pgright").onclick=()=>movePage(1);

/* ============ content panel ============ */
function boundKeys(){const keys=new Set();const scan=o=>{const b=o.hsfBind||(o.hsfComp&&o.hsfComp.bind);if(b)(b.match(/\{(\w+)\}/g)||[]).forEach(m=>keys.add(m.slice(1,-1)))};canvas.getObjects().forEach(scan);return keys}
function renderContentForm(){const box=$("contentFields");box.innerHTML="";const keys=boundKeys();const c=pageContent();const used=FIELDS.filter(f=>keys.has(f[0])),other=FIELDS.filter(f=>!keys.has(f[0]));
  const mkField=f=>{const[k,l,type,glob]=f;const d=document.createElement("div");d.className="field";const lab=document.createElement("label");lab.htmlFor="cf_"+k;lab.textContent=l+(glob?" · all pages":"");
    const i=document.createElement(type==="area"?"textarea":"input");if(type!=="area")i.type="text";i.id="cf_"+k;i.value=c[k]??"";i.oninput=()=>setField(k,i.value);d.append(lab,i);return d};
  if(!used.length)box.appendChild(Object.assign(document.createElement("p"),{className:"note",textContent:"No linked text on this page. Edit text directly on the canvas."}));
  used.forEach(f=>box.appendChild(mkField(f)));
  if(other.length){const det=document.createElement("details");det.innerHTML="<summary class='note' style='cursor:pointer'>Other story fields</summary>";const w=document.createElement("div");w.style.cssText="display:grid;gap:7px;margin-top:6px";other.forEach(f=>w.appendChild(mkField(f)));det.appendChild(w);box.appendChild(det)}
  $("c_alt").value=(D.pages[D.cur]?.content?.alt)||"";
  ["stream","code","project","idea_id","family","series","evidence_status","public_claim_status","technical_review","safeguarding_review","management_approval","consent","review"].forEach(k=>{const el=$("m_"+k);if(el)el.value=D.meta[k]||el.value})}
let fieldT=null;
function setField(k,v,fromCanvas){const p=D.pages[D.cur];if(GLOBAL_FIELDS.has(k)){D.content[k]=v;D.pages.forEach(pg=>{(pg.json?.objects||[]).forEach(o=>{})})}else{p.content=p.content||{};p.content[k]=v}
  D.story=D.story||{};if(!GLOBAL_FIELDS.has(k))D.story[k]=v;
  if(!fromCanvas){clearTimeout(fieldT);fieldT=setTimeout(async()=>{await applyContent(canvas,pageContent());canvas.requestRenderAll();changed()},120)}
  else{const el=$("cf_"+k);if(el&&document.activeElement!==el)el.value=v}}
$("c_alt").addEventListener("input",e=>{const p=D.pages[D.cur];p.content=p.content||{};p.content.alt=e.target.value;autosave()});
(function(){const s=$("m_stream");Object.entries(STREAMS).filter(([k])=>k!=="ALL").forEach(([k,v])=>{const o=document.createElement("option");o.value=k;o.textContent=v.n;s.appendChild(o)})})();
(function(){const s=$("m_family");Object.entries(CONTENT_FAMILIES).forEach(([id,label])=>{const o=document.createElement("option");o.value=id;o.textContent=label;s.appendChild(o)})})();
["stream","code","project","idea_id","family","series","evidence_status","public_claim_status","technical_review","safeguarding_review","management_approval","consent","review"].forEach(k=>$("m_"+k).addEventListener("input",e=>{D.meta[k]=e.target.value;scheduleQA();autosave()}));

/* ============ elements ============ */
const UU=()=>U(D.w,D.h);
async function addSpecs(specs,select=true){const out=[];for(const s of specs){const arr=await mk(s,pageContent());arr.forEach(o=>{canvas.add(o);out.push(o)})}
  await applyRolesTo(out);await applyContent(canvas,pageContent());if(select&&out[0]){const sel=out.filter(o=>o.selectable!==false);canvas.setActiveObject(sel.length>1?new fabric.ActiveSelection(sel,{canvas}):sel[0])}canvas.requestRenderAll();changed();return out}
function cxy(w,h){return[(D.w-w)/2,(D.h-h)/2]}
const ADD={
  sub:()=>{const w=D.w*.7,[x]=cxy(w,0);return addSpecs([{t:"text",text:"Subheading",x,y:D.h*.47,w,size:UU()*.036,weight:700,role:"primary",font:"head"}])},
  panel:()=>addSpecs([{t:"rect",x:0,y:D.h*.62,w:D.w,h:D.h*.38,role:"light",name:"Lower panel"}]),
  card:()=>{const w=D.w*.8,h=D.h*.22,[x,y]=cxy(w,h);return addSpecs([{t:"rect",x,y,w,h,rx:UU()*.025,role:"light",name:"Card"}]).then(a=>{a[0].set("shadow",new fabric.Shadow({color:"rgba(0,0,0,.14)",blur:UU()*.03,offsetY:UU()*.008}));canvas.requestRenderAll()})},
  h1:()=>{const w=D.w*.7,[x]=cxy(w,0);return addSpecs([{t:"text",text:"Headline",x,y:D.h*.4,w,size:UU()*.06,weight:700,font:"head"}])},
  body:()=>{const w=D.w*.7,[x]=cxy(w,0);return addSpecs([{t:"text",text:"Body text: keep it short, specific and evidence-aware.",x,y:D.h*.5,w,size:UU()*.026,lh:1.3}])},
  bn:()=>{const w=D.w*.7,[x]=cxy(w,0);return addSpecs([{t:"text",text:"এখানে বাংলা লেখা লিখুন",x,y:D.h*.45,w,size:UU()*.045,weight:700,font:"head",lh:1.35}]).then(a=>{a[0].set({fontFamily:"'Hind Siliguri', Poppins, sans-serif",hsfFont:null});canvas.requestRenderAll()})},
  quoteT:()=>{const w=D.w*.7,[x]=cxy(w,0);return addSpecs([{t:"text",text:"“A short quote, true to the speaker.”",x,y:D.h*.42,w,size:UU()*.045,font:"quote",italic:true,lh:1.25}])},
  stat:()=>{const w=D.w*.5,[x]=cxy(w,0);return addSpecs([{t:"text",bind:"{stat}",x,y:D.h*.38,w,size:UU()*.11,weight:700,role:"primary",font:"head",cluster:"stat"},{t:"text",bind:"{stat_label}",x,y:D.h*.38+UU()*.13,w,size:UU()*.026,weight:700,cluster:"stat"}])},
  steps:()=>{const u=UU(),x=D.w*.1,y0=D.h*.35,out=[];for(let i=1;i<=3;i++){const y=y0+(i-1)*u*.1;out.push({t:"ellipse",x,y,w:u*.054,h:u*.054,role:"primary",cluster:"steps"},{t:"text",text:String(i),x,y:y+u*.027-u*.017*.6,w:u*.054,size:u*.017,weight:700,role:"light",align:"center",font:"head",cluster:"steps"},{t:"text",bind:`{step${i}}`,x:x+u*.08,y:y+u*.01,w:D.w*.7,size:u*.021,weight:700,cluster:"steps"})}return addSpecs(out)},
  "f-rect":()=>{const w=UU()*.5,h=w*.75,[x,y]=cxy(w,h);return addSpecs([slotS(x,y,w,h)])},
  "f-round":()=>{const w=UU()*.5,h=w*.75,[x,y]=cxy(w,h);return addSpecs([slotS(x,y,w,h,{r:UU()*.025})])},
  "f-circle":()=>{const w=UU()*.5,[x,y]=cxy(w,w);return addSpecs([{t:"slot",shape:"ellipse",box:[x,y,w,w]}])},
  "f-arch":()=>{const w=UU()*.42,h=w*1.3,[x,y]=cxy(w,h);return addSpecs([{t:"slot",shape:"arch",box:[x,y,w,h]}])},
  "f-quarter":()=>{const w=UU()*.45,h=w*.95,[x,y]=cxy(w,h);return addSpecs([{t:"slot",shape:"quarter",box:[x,y,w,h],R:.8,r:UU()*.02}])},
  "f-hex":()=>{const w=UU()*.45,[x,y]=cxy(w,w);return addSpecs([{t:"slot",shape:"poly",box:[x,y,w,w],pts:regularPts(x,y,w,w,6,0),r:UU()*.012}])},
  photo:()=>pickPhotoFor(null),
  logo:()=>{const s=Math.min(D.w,D.h)*.105;return addSpecs([{t:"logo",x:D.w*.05,y:D.w*.05,size:s}])},
  pill:()=>{const h=pillH(D.w,D.h,48,.04);return addSpecs([{t:"pill",x:D.w*.95,y:D.w*.05,h,anchor:"right",bind:"{label}",role:"primary"}])},
  cta:()=>{const h=UU()*.06;return addSpecs([{t:"pill",x:D.w*.08,y:D.h*.8,h,anchor:"left",bind:"{cta}",role:"primary",size:UU()*.02,minW:D.w*.3}])},
  footer:()=>addSpecs(footerSpecs(D.w,D.h)),
  motif:()=>addSpecs([{t:"motif",cx:D.w*.85,cy:D.h*.12,r:Math.min(D.w,D.h)*.095,opacity:.2}]),
  ecosoc:()=>{const w=D.w*.8,u=UU(),[x]=cxy(w,0);return addSpecs([{t:"text",text:ECO1,x,y:D.h*.82,w,size:u*.022,role:"muted",cluster:"eco"},{t:"text",text:ECO2,x,y:D.h*.82+u*.032,w,size:u*.026,weight:700,font:"head",cluster:"eco"}])},
  projects:()=>{const w=D.w*.8,[x]=cxy(w,0);return addSpecs([{t:"text",text:PROJ.join("\n"),x,y:D.h*.4,w,size:UU()*.03,weight:700,lh:1.5,font:"head"}])},
  datebox:()=>{const u=UU(),db=u*.2,x=D.w*.9-db,y=D.w*.05;return addSpecs([{t:"rect",x,y,w:db,h:db*.56,rx:u*.018,role:"light",cluster:"date"},{t:"text",bind:"{date}",x:x+db*.06,y:y+db*.28-u*.018*.6,w:db*.88,size:u*.018,weight:700,role:"deep",align:"center",font:"head",cluster:"date"}])},
  "ov-bottom":()=>addSpecs([{t:"grad",x:0,y:D.h*.5,w:D.w,h:D.h*.5,c1:"black",a1:0,a2:.76,angle:180,name:"Bottom fade"}]),
  "ov-left":()=>addSpecs([{t:"grad",x:0,y:0,w:D.w*.7,h:D.h,c1:"deep",a1:.88,a2:0,angle:90,name:"Side fade"}]),
  "ov-band":()=>addSpecs([{t:"rect",x:0,y:D.h*.62,w:D.w,h:D.h*.2,role:"deep",opacity:.75,name:"Colour band"}]),
  "ov-full":()=>addSpecs([{t:"rect",x:0,y:0,w:D.w,h:D.h,role:"deep",opacity:.45,name:"Full tint"}]),
  rect:()=>{const w=UU()*.3,h=UU()*.2,[x,y]=cxy(w,h);return addSpecs([{t:"rect",x,y,w,h}])},
  ellipse:()=>{const w=UU()*.25,[x,y]=cxy(w,w);return addSpecs([{t:"ellipse",x,y,w,h:w}])},
  ring:()=>{const w=UU()*.25,[x,y]=cxy(w,w);return addSpecs([{t:"ellipse",x,y,w,h:w,ring:true,sw:UU()*.012}])},
  triangle:()=>{const w=UU()*.25,[x,y]=cxy(w,w);return addSpecs([{t:"poly",pts:regularPts(x,y,w,w,3),name:"Triangle"}])},
  star:()=>{const w=UU()*.25,[x,y]=cxy(w,w);return addSpecs([{t:"poly",pts:regularPts(x,y,w,w,5,-90,.45),name:"Star"}])},
  line:()=>{const w=UU()*.4,[x]=cxy(w,0);return addSpecs([{t:"line",x1:x,y1:D.h/2,x2:x+w,y2:D.h/2,sw:Math.max(2,UU()*.005)}])},
  arrow:()=>{const w=UU()*.3,[x]=cxy(w,0),y=D.h/2,k=UU()*.03;return addSpecs([{t:"path",d:`M${x} ${y}L${x+w} ${y}M${x+w-k} ${y-k}L${x+w} ${y}L${x+w-k} ${y+k}`,stroke:"accent",sw:Math.max(3,UU()*.006),name:"Arrow"}])}};
document.querySelectorAll("[data-add]").forEach(b=>b.onclick=()=>ADD[b.dataset.add]());
function buildIcons(){const box=$("iconlist");const q=($("iconq").value||"").toLowerCase();box.innerHTML="";Object.keys(ICONS).filter(n=>n.includes(q)).forEach(n=>{const b=document.createElement("button");b.type="button";b.title=n;b.setAttribute("aria-label","Add icon "+n);
  b.innerHTML=ICONS[n];b.onclick=()=>{const s=UU()*.1;addSpecs([{t:"icon",name:n,x:(D.w-s)/2,y:(D.h-s)/2,size:s}])};box.appendChild(b)})}
$("iconq").addEventListener("input",buildIcons);

/* ============ photos ============ */
let photoTarget=null;
function pickPhotoFor(o){photoTarget=o;$("photofile").click()}
async function fileToURL(file,max=2600){const url=URL.createObjectURL(file);const img=await loadImg(url);const k=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight));
  const c=document.createElement("canvas");c.width=Math.round(img.naturalWidth*k);c.height=Math.round(img.naturalHeight*k);c.getContext("2d").drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(url);
  return{url:c.toDataURL(/png|webp/.test(file.type)?"image/png":"image/jpeg",.9),w:img.naturalWidth,h:img.naturalHeight,name:file.name}}
$("photofile").addEventListener("change",async e=>{const file=e.target.files[0];e.target.value="";if(!file)return;let src;try{src=await fileToURL(file)}catch(err){say("That file couldn't be opened. Use a JPG, PNG or WebP photo.",true);return}
  addToLibrary(src);await placePhoto(photoTarget,src)});
async function placePhoto(t,src,at){const im=await loadImg(src.url);if(t&&t.hsfProxy&&editProxy)t=editProxy.o;
  if(t&&t.hsfSlot){if(editProxy){canvas.remove(editProxy.p);editProxy=null}const sl=clone(t.hsfSlot);sl.zoom=1;sl.focal=sl.focal||[.5,.5];sl.file=src.name;const n=new fabric.Image(im,{hsfSlot:sl,hsfName:t.hsfName,hsfUser:true,hsfAnim:t.hsfAnim,hsfId:t.hsfId,hsfKey:t.hsfKey,hsfDef:t.hsfDef,opacity:t.opacity});
    n.clipPath=clipFrom(slotD(sl));placeInSlot(n);slotControls(n);const idx=canvas.getObjects().indexOf(t);canvas.remove(t);canvas.insertAt(n,idx);canvas.setActiveObject(n);
    const need=Math.max(sl.box[2]/src.w,sl.box[3]/src.h);if(need>1.15)say(`This photo is enlarged ${need.toFixed(1)}× here and may look soft. Use a larger original if you can.`,true);else say("Photo placed. Double-click the frame to adjust the photo inside.")}
  else if(t&&t.free){const o=t.free,b=o.getBoundingRect(true,true);const n=new fabric.Image(im,{hsfUser:true,hsfName:o.hsfName||"Photo",hsfId:o.hsfId,hsfAnim:o.hsfAnim,opacity:o.opacity});const s=Math.max(b.width/im.width,b.height/im.height);
    n.set({scaleX:s,scaleY:s,left:b.left+(b.width-im.width*s)/2,top:b.top+(b.height-im.height*s)/2});const idx=canvas.getObjects().indexOf(o);canvas.remove(o);canvas.insertAt(n,idx);canvas.setActiveObject(n)}
  else{const n=new fabric.Image(im,{hsfUser:true,hsfName:"Photo",hsfId:uid()});const s=Math.min(D.w*.6/im.width,D.h*.6/im.height);const cx=at?at[0]:D.w/2,cy=at?at[1]:D.h/2;n.set({scaleX:s,scaleY:s,left:cx-im.width*s/2,top:cy-im.height*s/2});canvas.add(n);canvas.setActiveObject(n)}
  canvas.requestRenderAll();changed();onSel()}
function enterCrop(o){if(!o||!o.hsfSlot||!o.hsfUser)return;if(editProxy){canvas.remove(editProxy.p);editProxy=null}o._crop=true;canvas.setActiveObject(o);showHint("Adjusting the photo: drag to reposition, corner handles to zoom · double-click or Esc when done");canvas.requestRenderAll();renderProps()}
function exitCrop(o){o._crop=false;hideHint();canvas.discardActiveObject();canvas.setActiveObject(o);onSel()}
async function removePhoto(o){const sl=clone(o.hsfSlot);sl.zoom=1;const el=placeholderEl(sl.box[2],sl.box[3],sl.label);const n=new fabric.Image(el,{hsfSlot:sl,hsfUser:false,hsfName:o.hsfName,hsfId:o.hsfId,hsfKey:o.hsfKey,hsfDef:o.hsfDef,hsfAnim:o.hsfAnim});
  n.clipPath=clipFrom(slotD(sl));placeInSlot(n);slotControls(n);const idx=canvas.getObjects().indexOf(o);canvas.remove(o);canvas.insertAt(n,idx);canvas.setActiveObject(n);canvas.requestRenderAll();changed();onSel()}

/* ============ live transforms: photo focal, frame proxy, components ============ */
let editProxy=null;
function onLiveTransform(e){const o=e.target;if(!o)return;if(o.hsfProxy){applyProxy(o);return}}
function onModified(e){const o=e.target;if(!o)return;
  if(o.hsfProxy){applyProxy(o,true);return}
  if(o.hsfSlot&&o.hsfUser){const sl=o.hsfSlot,[bx,by,bw,bh]=sl.box;const base=Math.max(bw/o.width,bh/o.height);sl.zoom=clamp(o.scaleX/base,1,6);const sw=o.width*o.scaleX,sh=o.height*o.scaleY;
    sl.focal=[clamp((bx+bw/2-o.left)/sw,0,1),clamp((by+bh/2-o.top)/sh,0,1)];placeInSlot(o);canvas.requestRenderAll()}
  if(o.hsfComp&&(o.scaleX!==1||o.scaleY!==1)){rebuildComp(canvas,o).then(n=>{canvas.requestRenderAll();onSel()})}
  if(o.hsfFlow&&e.action==="drag")o.hsfFlow=null;
  if(o.type==="textbox"&&o.hsfFit&&(e.action==="scaleX"||e.action==="scale"))o.hsfFit=null;
  if(o.type==="activeSelection")o.getObjects().forEach(x=>{if(x.hsfFlow)x.hsfFlow=null});
  reflow(canvas);changed();onSelValues()}
function startFrameEdit(o,mode){endEdit(false);const sl=o.hsfSlot;let p;
  if(mode==="points"&&sl.shape==="poly"){p=new fabric.Polygon(sl.pts.map(q=>({x:q[0],y:q[1]})),{fill:"rgba(0,140,68,.06)",stroke:"#FF4800",strokeWidth:2,strokeUniform:true,strokeDashArray:[8,6],objectCaching:false,hsfProxy:true,hsfProxyOf:o.hsfId,hasBorders:false,cornerColor:"#FF4800",cornerSize:12});
    attachPointControls(p,()=>{const pts=absPts(p);sl.pts=pts;sl.box=bboxPts(pts);updateSlotGeometry(o);syncDecor(canvas,o).then(()=>canvas.requestRenderAll())})}
  else{const[x,y,w,h]=sl.box;p=new fabric.Rect({left:x,top:y,width:w,height:h,fill:"rgba(0,0,0,0)",stroke:"rgba(0,0,0,0)",strokeWidth:0,objectCaching:false,hsfProxy:true,hsfProxyOf:o.hsfId,lockRotation:true,hoverCursor:"move"});p.setControlsVisibility({mtr:false})}
  editProxy={p,o,mode};canvas.add(p);canvas.setActiveObject(p);if(mode==="points")showHint("Drag the orange points to reshape the frame · Esc or Done to finish");canvas.requestRenderAll();renderProps();renderAnim();renderLayers()}
function applyProxy(p,final){if(!editProxy||editProxy.p!==p)return;const o=editProxy.o,sl=o.hsfSlot;if(editProxy.mode==="points")return;
  const nb=[p.left,p.top,p.width*p.scaleX,p.height*p.scaleY];const ob=sl.box;
  if(sl.shape==="poly"&&sl.pts){sl.pts=sl.pts.map(q=>[nb[0]+(q[0]-ob[0])/ob[2]*nb[2],nb[1]+(q[1]-ob[1])/ob[3]*nb[3]])}
  sl.box=nb;updateSlotGeometry(o);if(final){p.set({width:nb[2],height:nb[3],scaleX:1,scaleY:1});p.setCoords();syncDecor(canvas,o).then(()=>{canvas.requestRenderAll();changed()})}else{const b=canvas.getObjects().find(x=>x.hsfBorderOf===o.hsfId);if(b)b.set("opacity",.35);canvas.requestRenderAll()}}
function endEdit(reselect=true){if(editProxy){const{p,o}=editProxy;canvas.remove(p);editProxy=null;syncDecor(canvas,o).then(()=>{canvas.getObjects().forEach(x=>{if(x.hsfBorderOf===o.hsfId)x.set("opacity",1)});canvas.requestRenderAll()});if(reselect&&canvas.getObjects().includes(o))canvas.setActiveObject(o);hideHint();changed()}
  canvas&&canvas.getObjects().forEach(x=>{if(x.hsfEditPts){x.hsfEditPts=false;delete x.controls;x.hasBorders=true;x.setCoords()}})}
function showHint(t){const h=$("toolhint");h.textContent=t;h.hidden=false}function hideHint(){$("toolhint").hidden=true}
/* polygon point editing (fabric.js polygon-editing pattern) */
function sizeWithStroke(o){const s=new fabric.Point(o.strokeUniform?1/o.scaleX:1,o.strokeUniform?1/o.scaleY:1).multiply(o.strokeWidth);return new fabric.Point(o.width+s.x,o.height+s.y)}
function polyPos(dim,fm,o){const x=o.points[this.pointIndex].x-o.pathOffset.x,y=o.points[this.pointIndex].y-o.pathOffset.y;return fabric.util.transformPoint({x,y},fabric.util.multiplyTransformMatrices(o.canvas.viewportTransform,o.calcTransformMatrix()))}
function polyAct(ev,tr,x,y){const o=tr.target,ctl=o.controls[o.__corner],lp=o.toLocalPoint(new fabric.Point(x,y),"center","center"),bs=sizeWithStroke(o),sz=o._getTransformedDimensions(0,0);
  o.points[ctl.pointIndex]={x:lp.x*bs.x/sz.x+o.pathOffset.x,y:lp.y*bs.y/sz.y+o.pathOffset.y};return true}
function anchorWrap(ai,fn,after){return function(ev,tr,x,y){const o=tr.target,ap=fabric.util.transformPoint({x:o.points[ai].x-o.pathOffset.x,y:o.points[ai].y-o.pathOffset.y},o.calcTransformMatrix());
  const r=fn(ev,tr,x,y);o._setPositionDimensions({});const bs=sizeWithStroke(o),nx=(o.points[ai].x-o.pathOffset.x)/bs.x,ny=(o.points[ai].y-o.pathOffset.y)/bs.y;o.setPositionByOrigin(ap,nx+.5,ny+.5);if(after)after();return r}}
function attachPointControls(o,after){const last=o.points.length-1;o.controls=o.points.reduce((acc,pt,i)=>{acc["p"+i]=new fabric.Control({positionHandler:polyPos,actionHandler:anchorWrap(i>0?i-1:last,polyAct,after),actionName:"modifyPolygon",pointIndex:i});return acc},{});o.hasBorders=false}
function absPts(o){const m=o.calcTransformMatrix();return o.points.map(p=>{const q=fabric.util.transformPoint({x:p.x-o.pathOffset.x,y:p.y-o.pathOffset.y},m);return[q.x,q.y]})}
function toPolygon(o){let pts;if(o.type==="rect"){pts=Object.values(o.aCoords).slice(0,4);const c=o.aCoords;pts=[c.tl,c.tr,c.br,c.bl].map(p=>[p.x,p.y])}
  else if(o.type==="ellipse"||o.type==="circle"){const m=o.calcTransformMatrix(),rx=o.rx??o.radius,ry=o.ry??o.radius;pts=[];for(let i=0;i<24;i++){const a=i/24*Math.PI*2;const q=fabric.util.transformPoint({x:Math.cos(a)*rx,y:Math.sin(a)*ry},m);pts.push([q.x,q.y])}}
  else return null;const n=new fabric.Polygon(pts.map(p=>({x:p[0],y:p[1]})),{objectCaching:false});["hsfId","hsfKey","hsfName","hsfRole","hsfStrokeRole","hsfGrad","hsfAnim","hsfDef","opacity","fill","stroke","strokeWidth","strokeDashArray","shadow","globalCompositeOperation"].forEach(k=>{if(o[k]!==undefined)n[k]=o[k]});
  if(n.hsfGrad)n.set("fill",gradFor(n));const idx=canvas.getObjects().indexOf(o);canvas.remove(o);canvas.insertAt(n,idx);canvas.setActiveObject(n);return n}
function slotToPoints(o){const sl=o.hsfSlot,[x,y,w,h]=sl.box;let pts;
  if(sl.shape==="ellipse"){pts=[];for(let i=0;i<24;i++){const a=i/24*Math.PI*2;pts.push([x+w/2+Math.cos(a)*w/2,y+h/2+Math.sin(a)*h/2])}sl.r=0}
  else if(sl.shape==="arch"){pts=[[x,y+h]];for(let i=0;i<=12;i++){const a=Math.PI+i/12*Math.PI;pts.push([x+w/2+Math.cos(a)*w/2,y+Math.min(w/2,h)+Math.sin(a)*Math.min(w/2,h)])}pts.push([x+w,y+h]);sl.r=0}
  else if(sl.shape==="quarter"){const R=(sl.R||.8)*Math.min(w,h);pts=[];for(let i=0;i<=8;i++){const a=Math.PI+i/8*Math.PI/2;pts.push([x+R+Math.cos(a)*R,y+R+Math.sin(a)*R])}pts.push([x+w,y],[x+w,y+h],[x,y+h])}
  else pts=[[x,y],[x+w,y],[x+w,y+h],[x,y+h]];
  sl.shape="poly";sl.pts=pts;sl.box=bboxPts(pts);updateSlotGeometry(o);return o}

/* ============ pen & freehand ============ */
let penPts=null,penPreview=null,penRole="primary";
function setTool(t){tool=t;document.querySelectorAll("[data-tool]").forEach(b=>{if(b.closest(".seg"))b.setAttribute("aria-pressed",b.dataset.tool===t)});
  canvas.isDrawingMode=t==="draw";canvas.selection=t==="select";canvas.skipTargetFind=t==="pen";
  if(t==="draw"){const br=new fabric.PencilBrush(canvas);br.color=roleColor(penRole);br.width=Math.max(2,UU()*.006);canvas.freeDrawingBrush=br;showHint("Draw freely · press V or Select to stop")}
  else if(t==="pen"){canvas.discardActiveObject();showHint("Click to place points · double-click or Enter to finish · Esc to cancel")}else{cancelPen();hideHint()}canvas.requestRenderAll()}
document.querySelectorAll("[data-tool]").forEach(b=>b.onclick=()=>setTool(b.dataset.tool));
function onPenDown(e){if(tool!=="pen")return;const p=canvas.getPointer(e.e);penPts=penPts||[];penPts.push({x:p.x,y:p.y});drawPenPreview(p)}
function onPenMove(e){if(tool!=="pen"||!penPts)return;drawPenPreview(canvas.getPointer(e.e))}
function drawPenPreview(cur){if(penPreview)canvas.remove(penPreview);penPreview=new fabric.Polyline([...penPts,{x:cur.x,y:cur.y}],{fill:"",stroke:"#FF4800",strokeWidth:2/zoom,strokeDashArray:[6/zoom,4/zoom],selectable:false,evented:false,hsfProxy:true,objectCaching:false});canvas.add(penPreview);canvas.requestRenderAll()}
function cancelPen(){if(penPreview)canvas.remove(penPreview);penPreview=null;penPts=null;canvas&&canvas.requestRenderAll()}
async function finishPen(){if(!penPts)return;const pts=penPts.filter((p,i,a)=>i===0||Math.hypot(p.x-a[i-1].x,p.y-a[i-1].y)>2);cancelPen();
  if(pts.length>=3){const o=(await mk({t:"poly",pts:pts.map(p=>[p.x,p.y]),name:"Pen shape"}))[0];canvas.add(o);await applyRolesTo([o]);setTool("select");canvas.setActiveObject(o);changed();onSel()}
  else if(pts.length===2){const o=(await mk({t:"line",x1:pts[0].x,y1:pts[0].y,x2:pts[1].x,y2:pts[1].y,sw:Math.max(2,UU()*.004)}))[0];canvas.add(o);await applyRolesTo([o]);setTool("select");canvas.setActiveObject(o);changed();onSel()}
  else setTool("select")}

/* ============ inspector helpers ============ */
function sel(){const a=canvas.getActiveObject();return a&&a.hsfProxy&&editProxy?editProxy.o:a}
function el(tag,props={},kids=[]){const e=document.createElement(tag);Object.assign(e,props);kids.forEach(k=>e.appendChild(typeof k==="string"?document.createTextNode(k):k));return e}
function field(label,ctl){const d=el("div",{className:"field"});d.appendChild(el("span",{className:"lbl",textContent:label}));d.appendChild(ctl);return d}
function num(val,on,{min=-99999,max=99999,step=1}={}){const i=el("input",{type:"number",value:Math.round(val*100)/100,min,max,step});i.oninput=()=>{const v=parseFloat(i.value);if(!isNaN(v))on(v)};i.onchange=()=>commit();return i}
function rng2(val,on,{min=0,max=100,step=1}={}){const i=el("input",{type:"range",min,max,step,value:val});i.oninput=()=>on(parseFloat(i.value));i.onchange=()=>commit();return i}
function pick(opts,val,on){const s=el("select");opts.forEach(([v,t])=>s.appendChild(el("option",{value:v,textContent:t})));s.value=val;s.onchange=()=>{on(s.value);commit()};return s}
function btn(t,on,cls="tb"){const b=el("button",{type:"button",className:cls,textContent:t});b.onclick=on;return b}
function chk(label,val,on){const l=el("label",{className:"chk"});const i=el("input",{type:"checkbox",checked:!!val});i.onchange=()=>{on(i.checked);commit()};l.append(i,el("span",{textContent:label}));return l}
function sect(title,kids,right){const s=el("div",{className:"sect"});const h=el("h4",{textContent:title});if(right)h.appendChild(right);s.appendChild(h);kids.forEach(k=>k&&s.appendChild(k));return s}
function g2(...k){const d=el("div",{className:"grid2"});k.forEach(x=>x&&d.appendChild(x));return d}
function g3(...k){const d=el("div",{className:"grid3"});k.forEach(x=>x&&d.appendChild(x));return d}
function commit(){canvas.requestRenderAll();changed()}
function swatchRow(current,onPick,{none=false}={}){const outer=el("div",{style:"display:grid;gap:4px"});const p=PALETTES[D.palette];
  const cap=t=>el("span",{className:"note",textContent:t,style:"font-size:10.5px"});const w1=el("div",{className:"swatches"});
  ROLES.forEach(r=>{const b=el("button",{type:"button",className:"sw",title:`${ROLE_NAMES[r]} · follows palette`});b.style.background=roleColor(r);b.setAttribute("aria-label",ROLE_NAMES[r]);b.setAttribute("aria-pressed",current===r);b.onclick=()=>{onPick(r);commit()};w1.appendChild(b)});
  const w2=el("div",{className:"swatches"});PRD.forEach(([n,h])=>{const b=el("button",{type:"button",className:"sw",title:`${n} ${h} · fixed`});b.style.background=h;b.setAttribute("aria-label",n);b.setAttribute("aria-pressed",current===h);b.onclick=()=>{onPick(h);commit()};w2.appendChild(b)});
  const ci=el("input",{type:"color",title:"Custom colour",value:/^#[0-9a-f]{6}$/i.test(roleColor(current)||"")?roleColor(current):"#008C44"});ci.setAttribute("aria-label","Custom colour");ci.oninput=()=>onPick(ci.value.toUpperCase());ci.onchange=()=>commit();w2.appendChild(ci);
  if(none)w2.appendChild(btn("None",()=>{onPick(null);commit()}));
  outer.append(cap(`${p.name} palette roles`),w1,cap("PRD website palette · fixed"),w2);return outer}
function setFill(o,v){o.hsfGrad=null;if(v&&ROLES.includes(v)){o.hsfRole=v;o.set("fill",roleColor(v))}else{o.hsfRole=null;o.set("fill",v||"")}}
function setStroke(o,v){if(v&&ROLES.includes(v)){o.hsfStrokeRole=v}else{o.hsfStrokeRole=null}const col=v?roleColor(v):"";
  if(o.type==="group")o.getObjects().forEach(k=>{k.set("stroke",col);if(o.hsfIcon&&k.fill&&k.fill!=="")k.set("fill",col)});else o.set("stroke",col)}
function onSel(){if(!canvas)return;const a=canvas.getActiveObject();
  if(editProxy&&a!==editProxy.p){const keep=editProxy;editProxy=null;canvas.remove(keep.p);syncDecor(canvas,keep.o).then(()=>{canvas.getObjects().forEach(x=>{if(x.hsfBorderOf===keep.o.hsfId)x.set("opacity",1)});canvas.requestRenderAll()});hideHint();changed()}
  canvas.getObjects().forEach(x=>{if(x._crop&&x!==a){x._crop=false;hideHint()}});
  if(a&&a.hsfSlot&&!a._crop&&tool==="select"&&!loading){startFrameEdit(a,"box");return}
  renderProps();renderAnim();renderLayers()}
let selT=null;function onSelValues(){clearTimeout(selT);selT=setTimeout(()=>{if(!document.activeElement||!$("props").contains(document.activeElement))renderProps()},120)}

/* ============ inspector: properties ============ */
function kindOf(o){if(!o)return"page";if(o.hsfProxy)return"proxy";if(o.type==="activeSelection")return"multi";if(o.hsfSlot)return"slot";if(o.hsfComp)return o.hsfComp.kind;if(o.hsfIcon)return"icon";
  if(o.type==="textbox"||o.type==="text")return"text";if(o.type==="image")return"image";if(o.type==="group")return"group";if(o.type==="line")return"line";if(o.hsfGrad)return"gradient";return"shape"}
const KIND_TITLES={page:"Page",proxy:"Editing frame",multi:"Several items",slot:"Photo frame",logo:"Logo tile",pill:"Label / button",icon:"Icon",text:"Text",image:"Photo",group:"Group",line:"Line",gradient:"Gradient overlay",shape:"Shape"};
function renderProps(){const box=$("props");box.innerHTML="";const o=sel();const k=kindOf(o);$("propsTitle").textContent=KIND_TITLES[k]+(o&&o.hsfName&&k!=="proxy"?" · "+o.hsfName:"");
  if(k==="page")return pagePanel(box);
  if(k==="proxy"){const t=editProxy&&editProxy.o;if(!t)return;$("propsTitle").textContent="Photo frame"+(t.hsfName?" · "+t.hsfName:"");
    if(editProxy.mode==="points"){box.append(el("p",{className:"note",textContent:"Drag the orange points to reshape the frame. The photo stays inside."}),btn("Done",()=>{endEdit(false);canvas.discardActiveObject();onSel()},"btn primary"));return}
    slotPanel(box,t);commonPanel(box,t);return}
  if(k==="multi")return multiPanel(box,o);
  const P={text:textPanel,slot:slotPanel,image:imagePanel,logo:logoPanel,pill:pillPanel,icon:iconPanel,gradient:gradPanel,line:linePanel,group:groupPanel,shape:shapePanel}[k];if(P)P(box,o);
  commonPanel(box,o)}
function pagePanel(box){const bg=canvas.getObjects().find(x=>x.hsfBg);const p=D.pages[D.cur];
  box.appendChild(el("p",{className:"note",textContent:`${p&&p.stage?p.stage+" · ":""}${D.w}×${D.h} px. Select any item to edit it. Double-click text to type on the canvas. Shortcuts: Delete, Ctrl+D duplicate, Ctrl+G group, arrows nudge (Shift = 10 px), V select, P pen, B draw.`}));
  if(bg)box.appendChild(sect("Background",[swatchRow(bg.hsfRole||bg.fill,v=>setFill(bg,v))]));else box.appendChild(el("p",{className:"note",textContent:"Transparent background: PNG and WebP keep it."}));
  if(p&&p.ref)box.appendChild(sect("Template",[el("p",{className:"note",textContent:p.ref.kind==="arch"?`${ARCH[p.ref.arch].n} · ${ARCH[p.ref.arch].p}`:"Website / HSF template"}),
    el("div",{className:"row"},[btn("Reset page layout",()=>doReset("layout")),btn("Reset to defaults",()=>doReset("page"),"tb danger")])]))}
function textPanel(box,o){
  const ta=el("textarea",{value:o.text});ta.setAttribute("aria-label","Text");ta.oninput=()=>{o.set("text",ta.value);if(o.hsfBind){const m=/^\{(\w+)\}$/.exec(o.hsfBind);if(m)setField(m[1],ta.value,true);else o.hsfBind=null}fitText(o);reflow(canvas);canvas.requestRenderAll()};ta.onchange=commit;
  const kids=[ta];if(o.hsfBind)kids.push(el("p",{className:"note",textContent:`Linked to story content ${o.hsfBind}. Edits update the Content tab.`}));
  box.appendChild(sect("Text",kids));
  const fam=o.hsfFont?"role:"+o.hsfFont:o.fontFamily;const fopts=[["role:head","Brand headline font"],["role:body","Brand body font"],["role:quote","Brand quote font"],...FONT_CHOICES];
  box.appendChild(sect("Typography",[g2(field("Font",pick(fopts,fopts.some(f=>f[0]===fam)?fam:"role:body",v=>{if(v.startsWith("role:")){o.hsfFont=v.slice(5);o.set("fontFamily",fontFor(o.hsfFont))}else{o.hsfFont=null;o.set("fontFamily",v)}o.initDimensions();fitText(o);reflow(canvas)})),
      field("Weight",pick([["400","Regular"],["600","Semibold"],["700","Bold"]],String(o.fontWeight),v=>{o.set("fontWeight",+v);o.initDimensions()})),
      field("Size",num(o.fontSize,v=>{o.set("fontSize",v);if(o.hsfFit)o.hsfFit.base=v;reflow(canvas);canvas.requestRenderAll()},{min:4,max:1200})),
      field("Line height",num(o.lineHeight,v=>{o.set("lineHeight",v);reflow(canvas);canvas.requestRenderAll()},{min:.6,max:3,step:.02})),
      field("Letter spacing",num(o.charSpacing,v=>{o.set("charSpacing",v);canvas.requestRenderAll()},{min:-200,max:1000,step:10})),
      field("Align",pick([["left","Left"],["center","Centre"],["right","Right"],["justify","Justify"]],o.textAlign,v=>o.set("textAlign",v))),
      field("Style",pick([["normal","Upright"],["italic","Italic"]],o.fontStyle,v=>{o.set("fontStyle",v);o.initDimensions()})),
      field("Box width",num(o.width,v=>{o.set("width",v);reflow(canvas);canvas.requestRenderAll()},{min:10,max:9000}))),
    g2(field("Max lines (auto-shrink, 0 = off)",num(o.hsfFit?o.hsfFit.max:0,v=>{o.hsfFit=v>0?{max:v,base:o.hsfFit?o.hsfFit.base:o.fontSize}:null;fitText(o);reflow(canvas);canvas.requestRenderAll()},{min:0,max:20})),
      o.hsfFlow!==undefined&&o.hsfDef&&o.hsfDef.flow?field("Position",pick([["flow","Stay below "+o.hsfDef.flow.after],["free","Free position"]],o.hsfFlow?"flow":"free",v=>{o.hsfFlow=v==="flow"?clone(o.hsfDef.flow):null;reflow(canvas)})):null),
    /[ঀ-৿]/.test(o.text)?el("p",{className:"note",textContent:"Bangla: use Hind Siliguri and keep letter spacing at 0 so letters join correctly. Type Bangla in the box above."}):null]));
  box.appendChild(sect("Text colour",[swatchRow(o.hsfRole||o.fill,v=>setFill(o,v))]));
  box.appendChild(sect("Highlight & outline",[field("Highlight behind text",swatchRow(o.textBackgroundColor||null,v=>o.set("textBackgroundColor",v?roleColor(v):""),{none:true})),
    g2(field("Outline colour",pick([["","None"],...ROLES.map(r=>[r,ROLE_NAMES[r]])],o.hsfStrokeRole||"",v=>{setStroke(o,v||null);o.set({paintFirst:"stroke",strokeWidth:v?(o.strokeWidth||Math.max(1,o.fontSize*.06)):0})})),
      field("Outline width",num(o.strokeWidth||0,v=>{o.set("strokeWidth",v);canvas.requestRenderAll()},{min:0,max:60,step:.5})))]))}
function slotPanel(box,o){const sl=o.hsfSlot;
  const ph=[el("div",{className:"row"},[btn(o.hsfUser?"Replace photo":"Add photo",()=>pickPhotoFor(o),"tb primary"),o.hsfUser?btn("Remove photo",()=>removePhoto(o)):null].filter(Boolean))];
  if(o.hsfUser){ph.push(g2(field("Zoom",rng2(sl.zoom||1,v=>{sl.zoom=v;placeInSlot(o);canvas.requestRenderAll()},{min:1,max:4,step:.01})),field("Focal X ↔",rng2(sl.focal[0],v=>{sl.focal[0]=v;placeInSlot(o);canvas.requestRenderAll()},{min:0,max:1,step:.01})),
      field("Focal Y ↕",rng2(sl.focal[1],v=>{sl.focal[1]=v;placeInSlot(o);canvas.requestRenderAll()},{min:0,max:1,step:.01})),field("",btn("Centre photo",()=>{sl.focal=[.5,.5];sl.zoom=1;placeInSlot(o);commit();renderProps()}))));
    ph.push(filterControls(o));ph.push(el("p",{className:"note",textContent:"Drag the photo to set its focal point (the stack keeps faces in view on every crop). Corner handles zoom."+(sl.file?" File: "+sl.file:"")}))}
  else ph.push(field("Placeholder label",(()=>{const i=el("input",{type:"text",value:sl.label});i.onchange=()=>{sl.label=i.value;updateSlotGeometry(o);commit()};return i})()));
  box.appendChild(sect("Photo",ph));
  const shapes=[["rect","Rectangle"],["ellipse","Circle / ellipse"],["arch","Arch"],["quarter","Quarter round"],["poly","Custom points"]];
  const geo=[g2(field("Shape",pick(shapes,sl.shape,v=>{if(v==="poly"){slotToPoints(o)}else{sl.shape=v;if(v==="quarter"&&!sl.R)sl.R=.8;updateSlotGeometry(o)}syncDecor(canvas,o).then(commit);renderProps()})),
      sl.shape==="rect"||sl.shape==="quarter"||sl.shape==="poly"?field("Corner radius",num(sl.r||0,v=>{sl.r=Math.max(0,v);updateSlotGeometry(o);syncDecor(canvas,o).then(()=>canvas.requestRenderAll())},{min:0,max:2000})):null,
      sl.shape==="quarter"?field("Curve size %",num(Math.round((sl.R||.8)*100),v=>{sl.R=clamp(v/100,.1,1);updateSlotGeometry(o);syncDecor(canvas,o).then(()=>canvas.requestRenderAll())},{min:10,max:100})):null),
    g2(field("X",num(sl.box[0],v=>moveSlot(o,[v,sl.box[1],sl.box[2],sl.box[3]]))),field("Y",num(sl.box[1],v=>moveSlot(o,[sl.box[0],v,sl.box[2],sl.box[3]]))),
      field("Width",num(sl.box[2],v=>moveSlot(o,[sl.box[0],sl.box[1],Math.max(4,v),sl.box[3]]),{min:4})),field("Height",num(sl.box[3],v=>moveSlot(o,[sl.box[0],sl.box[1],sl.box[2],Math.max(4,v)]),{min:4}))),
    el("p",{className:"note",textContent:"Drag the frame to move it; drag any handle to resize it freely. Double-click to adjust the photo inside."}),el("div",{className:"row"},[o.hsfUser?btn("Adjust photo inside",()=>enterCrop(o),"tb primary"):null,sl.shape==="poly"?btn("Edit points",()=>startFrameEdit(o,"points")):btn("Convert to points",()=>{slotToPoints(o);syncDecor(canvas,o).then(()=>{commit();startFrameEdit(o,"points")})})].filter(Boolean))];
  box.appendChild(sect("Frame shape",geo));
  const b=sl.border||{style:"none",color:"primary",width:Math.round(UU()*.012),inset:0};
  const setB=patch=>{sl.border={...b,...patch};syncDecor(canvas,o).then(()=>{canvas.requestRenderAll();changed()})};
  box.appendChild(sect("Frame border",[g2(field("Style",pick([["none","None"],["solid","Solid"],["dash","Dashed"],["brush","Brush stroke"]],b.style,v=>{setB({style:v});renderProps()})),
      field("Width",num(b.width,v=>setB({width:Math.max(1,v)}),{min:1,max:400})),field("Inset (− = outside)",num(b.inset??0,v=>setB({inset:v}),{min:-400,max:400})),
      b.style==="brush"?field("Brush variation",num(b.seed||7,v=>setB({seed:Math.round(v)}),{min:1,max:999})):null),
    b.style!=="none"?swatchRow(b.color,v=>setB({color:v||"primary"})):null,
    sl.shape==="ellipse"?chk("Brush-cut gaps (website circle style)",sl.mask,v=>{sl.mask=v;syncDecor(canvas,o).then(commit)}):null]))}
function moveSlot(o,nb){const sl=o.hsfSlot,ob=sl.box;if(editProxy&&editProxy.o===o&&editProxy.mode==="box"){editProxy.p.set({left:nb[0],top:nb[1],width:nb[2],height:nb[3],scaleX:1,scaleY:1});editProxy.p.setCoords()}if(sl.shape==="poly"&&sl.pts)sl.pts=sl.pts.map(q=>[nb[0]+(q[0]-ob[0])/ob[2]*nb[2],nb[1]+(q[1]-ob[1])/ob[3]*nb[3]]);sl.box=nb;updateSlotGeometry(o);syncDecor(canvas,o).then(()=>canvas.requestRenderAll())}
function filterControls(o){const F=fabric.Image.filters;const get=(T,k,d)=>{const f=(o.filters||[]).find(x=>x&&x.type===T);return f?f[k]:d};
  const setF=(T,k,v,Ctor)=>{o.filters=(o.filters||[]).filter(x=>x&&x.type!==T);if(v!==0)o.filters.push(new Ctor({[k]:v}));o.applyFilters();canvas.requestRenderAll()};
  return el("details",{},[el("summary",{className:"note",textContent:"Light adjustments (no retouching of people)",style:"cursor:pointer"}),
    g3(field("Brightness",rng2(get("Brightness","brightness",0),v=>setF("Brightness","brightness",v,F.Brightness),{min:-.4,max:.4,step:.01})),
      field("Contrast",rng2(get("Contrast","contrast",0),v=>setF("Contrast","contrast",v,F.Contrast),{min:-.4,max:.4,step:.01})),
      field("Saturation",rng2(get("Saturation","saturation",0),v=>setF("Saturation","saturation",v,F.Saturation),{min:-1,max:.5,step:.01})))])}
function imagePanel(box,o){box.appendChild(sect("Photo",[el("div",{className:"row"},[btn("Replace",()=>{photoTarget={free:o};$("photofile").click()},"tb primary"),btn("Put into a frame",()=>imageToSlot(o)),btn("Flip ↔",()=>{o.set("flipX",!o.flipX);commit()})]),filterControls(o)]))}
async function imageToSlot(o){const b=o.getBoundingRect(true,true);const sl={shape:"rect",box:[b.left,b.top,b.width,b.height],r:0,label:"PHOTO",focal:[.5,.5],zoom:1,border:null};
  o.set({angle:0});o.hsfSlot=sl;o.clipPath=clipFrom(slotD(sl));placeInSlot(o);slotControls(o);canvas.requestRenderAll();changed();onSel()}
function logoPanel(box,o){const c=o.hsfComp;const upd=patch=>rebuildComp(canvas,o,patch).then(n=>{canvas.setActiveObject(n);commit();renderProps()});
  box.appendChild(sect("Logo component",[el("p",{className:"note",textContent:logoURL?"Shows the uploaded official logo. Don't stretch, recolour or redraw it.":"Placeholder (DO NOT PUBLISH). Upload the approved vector logo in Brand; every tile updates."}),
    g2(chk("White tile",c.tile!==false,v=>upd({tile:v})),chk("Soft shadow",c.shadow!==false,v=>upd({shadow:v})),
      field("Size",num(c.size*(o.scaleX||1),v=>upd({size:Math.max(10,v)}),{min:10})),field("Corner %",num(Math.round((c.radius??.12)*100),v=>upd({radius:clamp(v/100,0,.5)}),{min:0,max:50})),
      field("Padding %",num(Math.round((c.pad??.13)*100),v=>upd({pad:clamp(v/100,0,.4)}),{min:0,max:40}))),
    c.tile!==false?field("Tile colour",swatchRow(c.tileColor||"light",v=>upd({tileColor:v||"light"}))):null,
    el("div",{className:"row"},[logoURL?null:btn("Upload logo",()=>{showTab("brand");$("logofile").click()},"tb primary")].filter(Boolean))]))}
function pillPanel(box,o){const c=o.hsfComp;const upd=patch=>rebuildComp(canvas,o,patch).then(n=>{canvas.setActiveObject(n);commit();renderProps()});
  const m=c.bind&&/^\{(\w+)\}$/.exec(c.bind);const i=el("input",{type:"text",value:c.bind?resolveBind(c.bind,pageContent()):c.text});
  i.oninput=()=>{if(m){setField(m[1],i.value,true);upd({})}else upd({text:i.value,bind:null})};
  box.appendChild(sect("Label",[i,m?el("p",{className:"note",textContent:`Linked to story content {${m[1]}}.`}):null,
    g2(field("Height",num(c.h*(o.scaleY||1),v=>upd({h:Math.max(8,v),size:Math.max(6,v*.34)}),{min:8})),field("Text size",num(c.size||c.h*.34,v=>upd({size:Math.max(6,v)}),{min:6})),
      field("Corner radius",num(c.radius??c.h/2,v=>upd({radius:Math.max(0,v)}),{min:0})),field("Min width",num(c.minW||0,v=>upd({minW:Math.max(0,v)}),{min:0})),
      field("Grows from",pick([["left","Left"],["center","Centre"],["right","Right"]],c.anchor||"left",v=>upd({anchor:v})))),
    field("Fill",swatchRow(c.role||"primary",v=>upd({role:v||"primary"}))),field("Text colour",swatchRow(c.textRole||"light",v=>upd({textRole:v||"light"}))),
    btn("Expand to editable shapes",()=>{const it=o.toActiveSelection();canvas.discardActiveObject();canvas.requestRenderAll();commit()})]))}
function iconPanel(box,o){box.appendChild(sect("Icon colour",[swatchRow(o.hsfStrokeRole,v=>setStroke(o,v||"primary"))]))}
function gradPanel(box,o){const g=o.hsfGrad;const set=patch=>{Object.assign(g,patch);o.set("fill",gradFor(o));canvas.requestRenderAll()};
  box.appendChild(sect("Gradient",[field("Start colour",swatchRow(g.c1,v=>set({c1:v||"black"}))),field("End colour",swatchRow(g.c2,v=>set({c2:v||"black"}))),
    g2(field("Start opacity",rng2(g.a1,v=>set({a1:v}),{min:0,max:1,step:.01})),field("End opacity",rng2(g.a2,v=>set({a2:v}),{min:0,max:1,step:.01})),
      field("Angle (180 = top→bottom)",num(g.angle,v=>set({angle:v}),{min:-360,max:360})),field("Midpoint",rng2(g.mid??.5,v=>set({mid:v}),{min:.05,max:.95,step:.01}))),
    el("div",{className:"row"},[btn("Solid fill",()=>{setFill(o,g.c1);commit();renderProps()})])]))}
function linePanel(box,o){box.appendChild(sect("Line",[swatchRow(o.hsfStrokeRole||o.stroke,v=>setStroke(o,v)),g2(field("Width",num(o.strokeWidth,v=>{o.set("strokeWidth",v);canvas.requestRenderAll()},{min:.5,max:200,step:.5})),
  field("Style",pick([["solid","Solid"],["dash","Dashed"],["dot","Dotted"]],o.strokeDashArray?(o.strokeDashArray[0]<=o.strokeWidth?"dot":"dash"):"solid",v=>o.set("strokeDashArray",v==="solid"?null:v==="dash"?[o.strokeWidth*3,o.strokeWidth*2]:[0.1,o.strokeWidth*2]))),
  field("Ends",pick([["butt","Flat"],["round","Round"]],o.strokeLineCap||"round",v=>o.set("strokeLineCap",v))))]))}
function groupPanel(box,o){box.appendChild(sect("Group",[el("div",{className:"row"},[btn("Ungroup",()=>{o.toActiveSelection();canvas.requestRenderAll();commit();onSel()})])]))}
function shapePanel(box,o){const isRing=!o.hsfRole&&o.hsfStrokeRole&&(!o.fill||o.fill==="rgba(0,0,0,0)"||o.fill==="");
  const mode=o.hsfGrad?"grad":(o.fill&&o.fill!==""&&o.fill!=="rgba(0,0,0,0)")||o.hsfRole?"solid":"none";
  box.appendChild(sect("Fill",[field("Type",pick([["none","None"],["solid","Solid"],["grad","Gradient"]],mode,v=>{if(v==="none"){o.hsfRole=null;o.hsfGrad=null;o.set("fill","rgba(0,0,0,0)")}else if(v==="solid"){setFill(o,o.hsfGrad?o.hsfGrad.c1:(o.hsfRole||"primary"))}
      else{o.hsfGrad={c1:o.hsfRole||"primary",c2:o.hsfRole||"primary",a1:1,a2:0,angle:180,mid:.5};o.hsfRole=null;o.set("fill",gradFor(o))}renderProps()})),
    mode==="solid"?swatchRow(o.hsfRole||o.fill,v=>setFill(o,v)):null,mode==="grad"?el("p",{className:"note",textContent:"Gradient: edit it below."}):null]));
  if(mode==="grad")gradPanel(box,o);
  box.appendChild(sect(isRing?"Ring":"Outline",[swatchRow(o.hsfStrokeRole||o.stroke,v=>{setStroke(o,v);if(v&&!o.strokeWidth)o.set("strokeWidth",Math.max(2,UU()*.006))},{none:true}),
    g2(field("Width",num(o.strokeWidth||0,v=>{o.set("strokeWidth",v);canvas.requestRenderAll()},{min:0,max:400,step:.5})),
      field("Style",pick([["solid","Solid"],["dash","Dashed"],["dot","Dotted"]],o.strokeDashArray?(o.strokeDashArray[0]<1?"dot":"dash"):"solid",v=>o.set({strokeDashArray:v==="solid"?null:v==="dash"?[Math.max(4,o.strokeWidth*3),Math.max(3,o.strokeWidth*2)]:[0.1,Math.max(3,o.strokeWidth*2)],strokeLineCap:v==="dot"?"round":o.strokeLineCap}))),
      o.type==="rect"?field("Corner radius",num(o.rx||0,v=>{o.set({rx:v,ry:v});canvas.requestRenderAll()},{min:0,max:5000})):null)]));
  if(o.type==="rect")box.appendChild(sect("Panel",[el("div",{className:"row"},[btn("Fit to page",()=>{o.set({left:0,top:0,width:D.w,height:D.h,scaleX:1,scaleY:1,angle:0});o.setCoords();commit()}),btn("Full width",()=>{o.set({left:0,width:D.w/(o.scaleX||1)});o.setCoords();commit()})]),chk("Lock position (resize only)",!!o.lockMovementX,v=>o.set({lockMovementX:v,lockMovementY:v}))]));
  const pts=[];if(o.type==="polygon"||o.type==="polyline")pts.push(btn(o.hsfEditPts?"Finish editing points":"Edit points",()=>{if(o.hsfEditPts){o.hsfEditPts=false;delete o.controls;o.hasBorders=true}else{o.hsfEditPts=true;attachPointControls(o,()=>canvas.requestRenderAll())}o.setCoords();canvas.requestRenderAll();renderProps()},"tb primary"));
  if(["rect","ellipse","circle"].includes(o.type))pts.push(btn("Convert to points",()=>{const n=toPolygon(o);if(n){n.hsfEditPts=true;attachPointControls(n,()=>canvas.requestRenderAll());canvas.requestRenderAll();changed();onSel()}}));
  if(pts.length)box.appendChild(sect("Vector points",[el("div",{className:"row"},pts),el("p",{className:"note",textContent:"Drag the round handles to move each anchor point."})]))}
function multiPanel(box,o){const items=o.getObjects();const al=(k)=>{const b=o.getBoundingRect(true,true);items.forEach(x=>{const r=x.getBoundingRect(true,true);let dx=0,dy=0;
    if(k==="l")dx=b.left-r.left;if(k==="c")dx=b.left+b.width/2-(r.left+r.width/2);if(k==="r")dx=b.left+b.width-(r.left+r.width);if(k==="t")dy=b.top-r.top;if(k==="m")dy=b.top+b.height/2-(r.top+r.height/2);if(k==="b")dy=b.top+b.height-(r.top+r.height);
    x.set({left:x.left+dx/(o.scaleX||1),top:x.top+dy/(o.scaleY||1)});x.setCoords()});o.addWithUpdate&&o.addWithUpdate();commit()};
  const dist=ax=>{const s=items.slice().sort((a,b)=>ax==="x"?a.getBoundingRect(true,true).left-b.getBoundingRect(true,true).left:a.getBoundingRect(true,true).top-b.getBoundingRect(true,true).top);if(s.length<3)return;
    const rs=s.map(x=>x.getBoundingRect(true,true));const first=rs[0],last=rs[rs.length-1];const total=ax==="x"?(last.left+last.width-first.left):(last.top+last.height-first.top);const sum=rs.reduce((a,r)=>a+(ax==="x"?r.width:r.height),0);const gap=(total-sum)/(s.length-1);
    let pos=ax==="x"?first.left:first.top;s.forEach((x,i)=>{const r=rs[i];const d=pos-(ax==="x"?r.left:r.top);x.set(ax==="x"?{left:x.left+d}:{top:x.top+d});x.setCoords();pos+=(ax==="x"?r.width:r.height)+gap});o.addWithUpdate&&o.addWithUpdate();commit()};
  box.appendChild(sect(`${items.length} items`,[field("Align to each other",el("div",{className:"row"},[["⇤","l"],["↔","c"],["⇥","r"],["⤒","t"],["↕","m"],["⤓","b"]].map(([t,k])=>{const b=btn(t,()=>al(k));b.setAttribute("aria-label","Align "+k);return b}))),
    field("Distribute",el("div",{className:"row"},[btn("Horizontally",()=>dist("x")),btn("Vertically",()=>dist("y"))])),
    el("div",{className:"row"},[btn("Group",()=>{const g=o.toGroup();g.hsfId=uid();g.hsfName="Group";canvas.requestRenderAll();commit();onSel()},"tb primary"),btn("Duplicate",dup),btn("Delete",del,"tb danger")])]))}
function commonPanel(box,o){
  const b=o.getBoundingRect(true,true);const posKids=[g2(field("X",num(b.left,v=>{o.set("left",o.left+(v-o.getBoundingRect(true,true).left));o.setCoords();canvas.requestRenderAll()})),field("Y",num(b.top,v=>{o.set("top",o.top+(v-o.getBoundingRect(true,true).top));o.setCoords();canvas.requestRenderAll()})))];
  if(!o.hsfSlot&&!o.hsfComp&&o.type!=="textbox"){posKids.push(g2(field("Width",num(o.getScaledWidth(),v=>{const r=v/o.getScaledWidth();o.set("scaleX",o.scaleX*r);if(lockRatio)o.set("scaleY",o.scaleY*r);o.setCoords();canvas.requestRenderAll()},{min:1})),
    field("Height",num(o.getScaledHeight(),v=>{const r=v/o.getScaledHeight();o.set("scaleY",o.scaleY*r);if(lockRatio)o.set("scaleX",o.scaleX*r);o.setCoords();canvas.requestRenderAll()},{min:1})),
    field("Rotation °",num(o.angle||0,v=>{o.rotate(v);o.setCoords();canvas.requestRenderAll()},{min:-360,max:360})),field("",chk("Keep proportions",lockRatio,v=>{lockRatio=v}))))}
  else if(!o.hsfSlot)posKids.push(g2(field("Rotation °",num(o.angle||0,v=>{o.rotate(v);o.setCoords();canvas.requestRenderAll()},{min:-360,max:360}))));
  posKids.push(field("Align to page",el("div",{className:"row"},[["⇤","left"],["↔","centerH"],["⇥","right"],["⤒","top"],["↕","centerV"],["⤓","bottom"]].map(([t,k])=>{const x=btn(t,()=>alignObj(o,k));x.setAttribute("aria-label","Align "+k);return x}))));
  if(o.hsfSlot)posKids.splice(0,posKids.length-1);box.appendChild(sect(o.hsfSlot?"Align":"Position",posKids));
  const sh=o.shadow;box.appendChild(sect("Appearance",[g2(field("Opacity",rng2(Math.round((o.opacity??1)*100),v=>{o.set("opacity",v/100);canvas.requestRenderAll()})),
      field("Blend",pick([["source-over","Normal"],["multiply","Multiply"],["screen","Screen"],["overlay","Overlay"],["darken","Darken"],["lighten","Lighten"],["soft-light","Soft light"],["luminosity","Luminosity"]],o.globalCompositeOperation&&o.globalCompositeOperation!=="destination-out"?o.globalCompositeOperation:"source-over",v=>o.set("globalCompositeOperation",v)))),
    chk("Shadow",!!sh,v=>{o.set("shadow",v?new fabric.Shadow({color:"rgba(0,0,0,.35)",blur:Math.round(UU()*.02),offsetX:0,offsetY:Math.round(UU()*.008)}):null);renderProps()}),
    sh?g3(field("Blur",num(sh.blur,v=>{sh.blur=v;o.dirty=true;canvas.requestRenderAll()},{min:0,max:300})),field("Offset Y",num(sh.offsetY,v=>{sh.offsetY=v;o.dirty=true;canvas.requestRenderAll()},{min:-300,max:300})),
      field("Strength",rng2(parseFloat((/,\s*([\d.]+)\)$/.exec(sh.color)||[0,.35])[1]),v=>{sh.color=`rgba(0,0,0,${v})`;o.dirty=true;canvas.requestRenderAll()},{min:0,max:1,step:.01}))):null]));
  const nm=el("input",{type:"text",value:o.hsfName||""});nm.onchange=()=>{o.hsfName=nm.value;renderLayers();commit()};
  const cl=o.hsfCluster?btn("Select whole block",()=>{const m=canvas.getObjects().filter(x=>x.hsfCluster===o.hsfCluster&&x.selectable!==false);if(m.length>1){canvas.setActiveObject(new fabric.ActiveSelection(m,{canvas}));canvas.requestRenderAll();onSel()}}):null;
  box.appendChild(sect("Arrange",[el("div",{className:"row"},[btn("To front",()=>arrange("front")),btn("Forward",()=>arrange("up")),btn("Back",()=>arrange("down")),btn("To back",()=>arrange("back"))]),
    el("div",{className:"row"},[cl,btn("Duplicate",dup),btn(o.hsfLock?"Unlock":"Lock",()=>{setLock(o,!o.hsfLock);commit();onSel()}),btn("Hide",()=>{setVis(o,false);commit()}),btn("Delete",del,"tb danger")].filter(Boolean)),
    field("Layer name",nm),o.hsfDef?el("div",{className:"row"},[btn("Reset to template default",()=>resetElement(o),"tb"),o.hsfSlot&&o.hsfUser?btn("Reset frame, keep photo",()=>resetElement(o,true)):null].filter(Boolean)):null]))}
let lockRatio=true;
function alignObj(o,k){const b=o.getBoundingRect(true,true);const dx={left:-b.left,centerH:(D.w-b.width)/2-b.left,right:D.w-b.width-b.left}[k]||0,dy={top:-b.top,centerV:(D.h-b.height)/2-b.top,bottom:D.h-b.height-b.top}[k]||0;
  if(o.hsfSlot){const sl=o.hsfSlot;moveSlot(o,[sl.box[0]+dx,sl.box[1]+dy,sl.box[2],sl.box[3]])}else{o.set({left:o.left+dx,top:o.top+dy});o.setCoords()}if(o.hsfFlow)o.hsfFlow=null;commit()}
function dup(){const o=sel();if(!o)return;o.clone(c=>{const fix=x=>{x.hsfId=uid();x.hsfKey=null;if(x.hsfSlot){x.hsfSlot=clone(x.hsfSlot);x.hsfSlot.box[0]+=20;x.hsfSlot.box[1]+=20;if(x.hsfSlot.pts)x.hsfSlot.pts=x.hsfSlot.pts.map(p=>[p[0]+20,p[1]+20]);x.clipPath=clipFrom(slotD(x.hsfSlot));placeInSlot(x);slotControls(x)}};
  c.set({left:c.left+20,top:c.top+20});if(c.type==="activeSelection"){c.canvas=canvas;c.forEachObject(x=>{fix(x);canvas.add(x)});c.setCoords()}else{fix(c);if(c.hsfSlot){}canvas.add(c)}
  if(c.hsfSlot)syncDecor(canvas,c);canvas.setActiveObject(c);commit()},PROPS)}
function del(){const o=sel();if(!o||o.hsfBg)return;if(editProxy){canvas.remove(editProxy.p);editProxy=null;hideHint()}const rm=x=>{if(x.hsfBg)return;canvas.getObjects().filter(y=>y.hsfBorderOf===x.hsfId||y.hsfMaskOf===x.hsfId).forEach(y=>canvas.remove(y));canvas.remove(x)};
  if(o.type==="activeSelection")o.getObjects().forEach(rm);else rm(o);canvas.discardActiveObject();commit();onSel()}
function onKey(e){if($("mode-design").hidden||!$("player").hidden)return;const tag=(e.target.tagName||"").toLowerCase();if(["input","textarea","select"].includes(tag))return;const o=sel();if(o&&o.isEditing)return;
  const mod=e.ctrlKey||e.metaKey,k=e.key.toLowerCase();
  if(k==="escape"){if(tool==="pen"&&penPts){cancelPen();return}const cr=canvas.getObjects().find(x=>x._crop);if(cr){exitCrop(cr);return}if(editProxy){endEdit(false);canvas.discardActiveObject();onSel();return}if(tool!=="select"){setTool("select");return}canvas.discardActiveObject();canvas.requestRenderAll();onSel();return}
  if(k==="enter"&&tool==="pen"){finishPen();return}
  if(mod&&k==="z"){e.preventDefault();e.shiftKey?$("redo").click():$("undo").click();return}
  if(mod&&k==="y"){e.preventDefault();$("redo").click();return}
  if(mod&&k==="d"){e.preventDefault();dup();return}
  if(mod&&k==="g"&&o){e.preventDefault();if(o.type==="activeSelection"){const g=o.toGroup();g.hsfId=uid();g.hsfName="Group"}else if(o.type==="group"&&!o.hsfComp&&!o.hsfIcon)o.toActiveSelection();commit();onSel();return}
  if(!mod&&k==="v")return setTool("select");if(!mod&&k==="p")return setTool("pen");if(!mod&&k==="b")return setTool("draw");
  if(!o)return;if(k==="delete"||k==="backspace"){e.preventDefault();del();return}
  const st=e.shiftKey?10:1;const mv={arrowleft:[-st,0],arrowright:[st,0],arrowup:[0,-st],arrowdown:[0,st]}[k];
  if(mv){e.preventDefault();if(o.hsfSlot&&!o._crop){const sl=o.hsfSlot;moveSlot(o,[sl.box[0]+mv[0],sl.box[1]+mv[1],sl.box[2],sl.box[3]])}else{o.set({left:o.left+mv[0],top:o.top+mv[1]});o.setCoords();if(o.hsfFlow)o.hsfFlow=null}canvas.requestRenderAll();changed()}}

/* layers: see e6_layers.js */

/* ============ animation settings ============ */
const ANIMS=[["none","None"],["fade","Fade in"],["rise","Rise up"],["drop","Drop down"],["fromRight","Slide from right"],["fromLeft","Slide from left"],["zoom","Zoom in"],["pop","Pop"]];
function renderAnim(){const box=$("anim");box.innerHTML="";const o=sel();const p=D.pages[D.cur];if(!p)return;
  if(o&&o.type!=="activeSelection"&&!o.hsfProxy){const a=o.hsfAnim||{type:"none",delay:0,dur:.6};
    box.append(g3(field("Entrance",pick(ANIMS,a.type,v=>{o.hsfAnim={...a,type:v};renderAnim()})),field("Delay (s)",num(a.delay,v=>{o.hsfAnim={...(o.hsfAnim||a),delay:v}},{min:0,max:60,step:.1})),field("Length (s)",num(a.dur,v=>{o.hsfAnim={...(o.hsfAnim||a),dur:v}},{min:.1,max:20,step:.1}))),
      el("p",{className:"note",textContent:o.hsfSlot?"Photos in frames fade in; with slow zoom on, they drift gently inside the frame.":"Animations appear in the preview and video only. Saved images show the finished page."}))}
  else{box.append(g3(field("Page length (s)",num(p.dur,v=>{p.dur=v;updVideoLen()},{min:.5,max:120,step:.5})),field("Transition in",pick([["cut","Cut"],["fade","Fade"],["slide","Slide"],["zoom","Zoom"]],p.trans,v=>{p.trans=v})),field("Slow photo zoom",pick([["1","On"],["0","Off"]],p.kb?"1":"0",v=>{p.kb=v==="1"}))),
      el("div",{className:"row"},[btn("Auto-animate this page",()=>autoAnimate(false),"tb primary"),btn("Auto-animate all pages",()=>autoAnimate(true)),btn("Clear",()=>{canvas.getObjects().forEach(x=>delete x.hsfAnim);commit();say("Animations cleared on this page.")})]),
      el("p",{className:"note",textContent:"Reel storyboards and carousels become a video: each page is one scene. Auto-animate fades photos in, then brings text, labels and the logo in from top to bottom."}))}}
function animateObjs(objs,p){const photos=objs.filter(o=>o.hsfSlot||(o.type==="image"&&!o.hsfComp));photos.forEach(o=>o.hsfAnim={type:"fade",delay:0,dur:.8});
  const rest=objs.filter(o=>!photos.includes(o)&&!o.hsfBg&&!o.hsfBorderOf&&!o.hsfMaskOf&&o.visible!==false&&!(o.type==="rect"&&o.width*o.scaleX>D.w*.9&&!o.hsfCluster)&&!o.hsfGrad)
    .sort((a,b)=>a.getBoundingRect(true).top-b.getBoundingRect(true).top);
  rest.forEach((o,i)=>o.hsfAnim={type:o.hsfIcon?"pop":o.hsfComp&&o.hsfComp.kind==="logo"?"fade":"rise",delay:+(.3+i*.12).toFixed(2),dur:.6});
  const last=rest.length?(.3+(rest.length-1)*.12+.6):1;if(p.dur<last+1.2)p.dur=Math.ceil((last+1.2)*2)/2}
async function autoAnimate(all){if(!all){animateObjs(canvas.getObjects(),D.pages[D.cur]);commit();renderAnim();updVideoLen();say(`Animated this page · ${D.pages[D.cur].dur}s. Press Preview.`);return}
  savePage();const cur=D.cur;for(let i=0;i<D.pages.length;i++){const sc=await staticFor(D.pages[i].json,.2);animateObjs(sc.getObjects(),D.pages[i]);D.pages[i].json=canvasJSON(sc);sc.dispose()}
  loading=true;canvas.loadFromJSON(D.pages[cur].json,()=>{prep(canvas);loading=false;canvas.renderAll();resetHist();renderAnim();updVideoLen();say(`Animated ${D.pages.length} pages. Press Preview.`)})}

/* ============ brand check ============ */
let qaT=null;function scheduleQA(){clearTimeout(qaT);qaT=setTimeout(renderQA,250)}
function photoShare(objs,w,h){let a=0;objs.forEach(o=>{if(!o.hsfSlot||o.visible===false)return;const[x,y,bw,bh]=o.hsfSlot.box;const ix=Math.max(0,Math.min(w,x+bw)-Math.max(0,x)),iy=Math.max(0,Math.min(h,y+bh)-Math.max(0,y));a+=ix*iy*(o.hsfSlot.shape==="ellipse"?.785:1)});return Math.min(100,Math.round(a/(w*h)*100))}
function renderQA(){if(!canvas)return;const box=$("qa");box.innerHTML="";const objs=canvas.getObjects();const p=D.pages[D.cur];const items=[];
  const add=(lvl,t)=>items.push([lvl,t]);
  if(p&&p.ref&&p.ref.kind==="arch"){const A=ARCH[p.ref.arch],s=photoShare(objs,D.w,D.h);const ok=s>=A.share[0]-3&&s<=A.share[1]+5;add(ok?"ok":"warn",`Photo area ${s}% · ${A.n} target ${A.share[0]}–${A.share[1]}%`)}
  const slots=objs.filter(o=>o.hsfSlot),empty=slots.filter(o=>!o.hsfUser).length;if(slots.length)add(empty?"bad":"ok",empty?`${empty} of ${slots.length} photo frame${slots.length>1?"s":""} still empty`:`All ${slots.length} photo frame${slots.length>1?"s":""} filled`);
  const logos=objs.filter(o=>o.hsfComp&&o.hsfComp.kind==="logo");if(logos.length)add(logoURL?"ok":"bad",logoURL?"Logo loaded (verify against official HSF master)":"Logo slot shows the placeholder · DO NOT PUBLISH until the approved logo is uploaded");
  const c=pageContent();const def=[];objs.forEach(o=>{const b=o.hsfBind||(o.hsfComp&&o.hsfComp.bind);if(!b)return;(b.match(/\{(\w+)\}/g)||[]).forEach(m=>{const k=m.slice(1,-1);const v=c[k]||"";if((v===DEFAULT_CONTENT[k]&&!["website","tagline","org","project","label","cta"].includes(k))||/\[.*\]/.test(v))def.push(k)})});
  objs.forEach(o=>{if(o.type==="textbox"&&!o.hsfBind&&/\[[^\]]+\]/.test(o.text))def.push(o.hsfName||"text")});
  const uniq=[...new Set(def)];if(uniq.length)add("warn",`Placeholder text: ${uniq.slice(0,6).join(", ")}${uniq.length>6?"…":""}`);else add("ok","No placeholder text left");
  if(objs.some(o=>/\{stat\}/.test(o.hsfBind||"")))add("warn","Figure: use only an approved number, with its period, scope and source");
  const k=1080/Math.min(D.w,D.h*1.25);const small=objs.filter(o=>(o.type==="textbox")&&o.visible!==false&&o.fontSize*(o.scaleY||1)*k<15).length;if(D.cat==="social")add(small?"warn":"ok",small?`${small} text item${small>1?"s":""} may be too small to read on a phone`:"Text readable on a phone");
  const cs=D.meta.consent;if(slots.some(o=>o.hsfUser))add(cs==="Cleared"||cs==="No identifiable people"?"ok":"bad",`Consent: ${cs}${cs==="Cleared"||cs==="No identifiable people"?"":" · set it in Content before publishing"}`);
  if(!(p&&p.content&&p.content.alt)&&D.cat)add("warn","Alt text not written for this page (Content tab)");
  if(D.meta.code && !/^HSF-COM-\d{4}-\d{4}$/.test(D.meta.code))add("bad","Content ID must use HSF-COM-YYYY-NNNN; missing ID means an unregistered draft");
  if(!D.meta.code)add("warn","No controlled content ID: current artwork is an unregistered draft");
  const allText=objs.filter(o=>typeof o.text==="string").map(o=>o.text).join("\n")+"\n"+Object.values(c).filter(v=>typeof v==="string").join("\n");
  if(/[—]|--/.test(allText))add("warn","Social copy punctuation: remove em dashes and double hyphens before publishing");
  if(D.meta.evidence_status!=="VERIFIED_PUBLIC" || D.meta.public_claim_status!=="APPROVED_PUBLIC")add("warn","Evidence and public-claim clearance incomplete: DRAFT / NOT FOR PUBLICATION");
  if(D.meta.technical_review!=="CLEARED" || D.meta.safeguarding_review!=="CLEARED" || D.meta.management_approval!=="APPROVED_PUBLIC")add("bad","Institutional review incomplete: DRAFT / NOT FOR PUBLICATION (editor state is not proof of approval)");
  const nBad=items.filter(i=>i[0]!=="ok").length;$("qabadge").hidden=!nBad;$("qabadge").textContent=nBad;
  items.forEach(([l,t])=>{const d=el("div",{className:l});d.append(el("i",{textContent:l==="ok"?"✓":l==="warn"?"!":"×"}),el("span",{textContent:t}));box.appendChild(d)})}

/* ============ reset ============ */
async function resetElement(o,keepPhoto){if(!o||!o.hsfDef)return;if(editProxy){canvas.remove(editProxy.p);editProxy=null}const s=clone(o.hsfDef);const arr=await mk(s,pageContent());const n=arr[0];n.hsfId=o.hsfId;
  if(keepPhoto&&o.hsfSlot&&o.hsfUser){const sl=clone(n.hsfSlot);sl.focal=o.hsfSlot.focal;sl.zoom=o.hsfSlot.zoom;sl.file=o.hsfSlot.file;o.hsfSlot=sl;o.clipPath=clipFrom(slotD(sl));placeInSlot(o);await syncDecor(canvas,o);commit();onSel();return}
  canvas.getObjects().filter(y=>y.hsfBorderOf===o.hsfId||y.hsfMaskOf===o.hsfId).forEach(y=>canvas.remove(y));const idx=canvas.getObjects().indexOf(o);canvas.remove(o);canvas.insertAt(n,idx);
  if(n.hsfSlot)await syncDecor(canvas,n);await applyRolesTo([n]);await applyContent(canvas,pageContent());canvas.setActiveObject(n);commit();onSel();say("Item reset to its template default.")}
async function rebuildPage(i,keep){const p=D.pages[i];if(!p.ref){say("This page wasn't made from a template.",true);return}
  const old=i===D.cur?canvasJSON(canvas):p.json;const photos={};(old.objects||[]).forEach(o=>{if(o.hsfSlot&&o.hsfUser&&o.hsfKey)photos[o.hsfKey]=o});
  if(!keep)p.content={...(p.defaultContent||{})};
  const content={...DEFAULT_CONTENT,...D.content,...p.content};await buildInto(canvas,p.ref,content);
  if(keep){for(const o of canvas.getObjects().filter(x=>x.hsfSlot&&photos[x.hsfKey])){const src=photos[o.hsfKey];const im=await loadImg(src.src);const sl=clone(o.hsfSlot);sl.focal=src.hsfSlot.focal;sl.zoom=src.hsfSlot.zoom;sl.file=src.hsfSlot.file;
      const n=new fabric.Image(im,{hsfSlot:sl,hsfUser:true,hsfName:o.hsfName,hsfId:o.hsfId,hsfKey:o.hsfKey,hsfDef:o.hsfDef,filters:[]});n.clipPath=clipFrom(slotD(sl));placeInSlot(n);slotControls(n);const idx=canvas.getObjects().indexOf(o);canvas.remove(o);canvas.insertAt(n,idx)}}
  p.json=canvasJSON(canvas)}
async function doReset(kind){$("resetpop").hidden=true;$("resetbtn").setAttribute("aria-expanded","false");endEdit(false);
  if(kind==="element"){const o=sel();if(!o){say("Select an item first.",true);return}if(!o.hsfDef){say("This item wasn't part of the template, so it has no default.",true);return}return resetElement(o)}
  if(kind==="layout"||kind==="page"){await rebuildPage(D.cur,kind==="layout");loading=true;await new Promise(r=>canvas.loadFromJSON(D.pages[D.cur].json,r));prep(canvas);loading=false;canvas.renderAll();changed();renderContentForm();onSel();say(kind==="layout"?"Page layout rebuilt; your text and photos were kept.":"Page reset to template defaults.");return}
  if(kind==="pages"){savePage();const cur=D.cur;for(let i=0;i<D.pages.length;i++){if(D.pages[i].ref){D.cur=i;loading=true;await new Promise(r=>canvas.loadFromJSON(D.pages[i].json,r));loading=false;await rebuildPage(i,true);D.pages[i].thumb=thumbOf()}}
    D.cur=cur;loading=true;await new Promise(r=>canvas.loadFromJSON(D.pages[cur].json,r));prep(canvas);loading=false;fitZoom();resetHist();renderPages();onSel();say("Every page rebuilt; text and photos kept.");return}
  if(kind==="colours"){const walk=o=>{const d=o.hsfDef;if(d){if(d.t==="text"||d.t==="rect"||d.t==="bg"||(d.t==="ellipse"&&!d.ring)||d.t==="poly")o.hsfRole=d.role||(d.t==="text"?"ink":d.t==="bg"?"light":"primary");if(d.stroke||d.ring)o.hsfStrokeRole=d.stroke||"primary";if(d.t==="grad")o.hsfGrad={...o.hsfGrad,c1:d.c1||"black",c2:d.c2||d.c1||"black"};if(d.t==="icon")o.hsfStrokeRole=d.role||"primary"}};
    canvas.getObjects().forEach(walk);for(const o of canvas.getObjects().filter(x=>x.hsfComp)){const d=o.hsfDef;if(d)await rebuildComp(canvas,o,{role:d.role,textRole:d.textRole,tileColor:d.tileColor})}
    for(const o of canvas.getObjects().filter(x=>x.hsfSlot&&x.hsfDef&&x.hsfDef.border)){o.hsfSlot.border={...o.hsfSlot.border,color:o.hsfDef.border.color};await syncDecor(canvas,o)}
    await applyRolesTo(canvas.getObjects());commit();onSel();say("Colours returned to the palette roles.");return}
  if(kind==="type"){canvas.getObjects().forEach(o=>{const d=o.hsfDef;if(!d||d.t!=="text")return;o.set({fontSize:d.size,fontWeight:d.weight||400,fontStyle:d.italic?"italic":"normal",lineHeight:d.lh||1.18,textAlign:d.align||"left",charSpacing:d.cs||0,width:d.w,textBackgroundColor:"",strokeWidth:0});
    o.hsfFont=d.font||"body";o.hsfFit=d.max?{max:d.max,base:d.size}:null;o.hsfFlow=d.flow?clone(d.flow):null});await applyRolesTo(canvas.getObjects());await applyContent(canvas,pageContent());commit();onSel();say("Text styles reset; wording kept.");return}
  if(kind==="export"){$("xfmt").value="auto";$("xscale").value="1";$("xkb").value=D.budget||"";$("vfps").value="30";$("vq").value="5000000";$("vsize").value="1";scheduleSize();say("Save settings reset.");return}
  if(kind==="all"){const b=$("resetpop").querySelector('[data-reset="all"]');if(!b.dataset.ok){b.dataset.ok="1";$("resetpop").hidden=false;b.classList.add("confirm");b.firstChild.textContent="Click again to clear everything";setTimeout(()=>{delete b.dataset.ok;b.classList.remove("confirm");b.firstChild.textContent="Start over"},3500);return}
    store.del("hsf-engine-last");D.content={};D.story={};D.meta={stream:"HSF_IN_ACTION",code:"",idea_id:"",family:"FIELD_MOMENT",series:"",project:"",evidence_status:"NOT_VERIFIED",public_claim_status:"NOT_APPROVED",technical_review:"PENDING",safeguarding_review:"PENDING",management_approval:"PENDING",consent:"Not checked",review:""};D.typeChosen=false;D.palChosen=false;D.palette="evergreen";renderPalBar();
    await loadArch("facebook",PLATFORMS.facebook.formats[0],"editorial_photo_story");UIS.plat="facebook";UIS.fmt="feed_4x5";renderNav();renderTplArea();say("Started over with a fresh design.")}}
$("resetbtn").onclick=()=>{const p=$("resetpop");p.hidden=!p.hidden;$("resetbtn").setAttribute("aria-expanded",String(!p.hidden))};
document.querySelectorAll("[data-reset]").forEach(b=>b.onclick=()=>doReset(b.dataset.reset));
document.addEventListener("click",e=>{if(!e.target.closest(".menu")){$("resetpop").hidden=true;$("resetbtn").setAttribute("aria-expanded","false")}});

/* ============ palette, type, brand pane ============ */
function renderPalBar(){const bar=$("palbar");bar.querySelectorAll("button").forEach(b=>b.remove());Object.entries(PALETTES).forEach(([k,p])=>{const b=el("button",{type:"button",title:p.name});b.setAttribute("aria-label",p.name);b.style.background=p.primary;b.setAttribute("aria-pressed",k===D.palette);
  b.onclick=()=>setPalette(k);bar.appendChild(b)});renderPalGrid()}
async function setPalette(k){D.palette=k;D.palChosen=true;renderPalBar();await applyRolesTo(canvas.getObjects());for(const o of canvas.getObjects().filter(x=>x.hsfSlot&&x.hsfSlot.border))await syncDecor(canvas,o);canvas.requestRenderAll();changed();onSel();renderFavicon();renderTplArea()}
function renderPalGrid(){const g=$("palgrid");if(!g)return;g.innerHTML="";Object.entries(PALETTES).forEach(([k,p])=>{const b=el("button",{type:"button",className:"palrow"});b.setAttribute("aria-pressed",k===D.palette);
  b.innerHTML=`<b>${p.name}</b><span class="cells">${["primary","deep","secondary","accent","soft","surface","ink","muted","light"].map(r=>`<i title="${r} ${p[r]}" style="background:${p[r]}"></i>`).join("")}</span>`;b.onclick=()=>setPalette(k);g.appendChild(b)});
  const pg=$("prdgrid");pg.innerHTML="";const r=el("div",{className:"swatches"});PRD.forEach(([n,h])=>{const b=el("button",{type:"button",className:"sw",title:`${n} ${h} · click to copy`});b.style.cssText=`background:${h};width:26px;height:26px`;
    b.onclick=async()=>{try{await navigator.clipboard.writeText(h);say("Copied "+h)}catch(e){say(n+": "+h)}};r.appendChild(b)});pg.appendChild(r);pg.appendChild(el("p",{className:"note",textContent:"Card radius ~16 px · buttons ≥48 px · body 16–18 px · content width ~1240 px."}))}
(function(){const s=$("typeset");Object.entries(TYPESETS).forEach(([k,t])=>s.appendChild(el("option",{value:k,textContent:t.name})));s.onchange=async()=>{D.type=s.value;D.typeChosen=true;await applyRolesTo(canvas.getObjects());await applyContent(canvas,pageContent());
  for(const o of canvas.getObjects().filter(x=>x.hsfComp&&x.hsfComp.kind==="pill"))await rebuildComp(canvas,o);canvas.requestRenderAll();changed();renderTplArea()}})();
function renderLogoPrev(){const p=$("logoprev");if(logoURL){p.innerHTML="";const i=el("img",{src:logoURL,alt:"Uploaded logo"});i.style.cssText="max-width:140px;max-height:90px;background:#fff;border-radius:8px;padding:6px;border:1px solid var(--line)";p.appendChild(i)}}
$("logofile").addEventListener("change",async e=>{const file=e.target.files[0];e.target.value="";if(!file)return;const rd=new FileReader();rd.onload=async()=>{logoURL=rd.result;if(!store.set("hsf-engine-logo",logoURL))say("Logo loaded for this session; the browser couldn't keep it for next time.");
  renderLogoPrev();thumbCache.clear();await refreshComps(canvas,pageContent());canvas.requestRenderAll();changed();renderTplArea();say("Logo placed in every logo tile.")};rd.readAsDataURL(file)});
$("logoclear").onclick=async()=>{logoURL=null;store.del("hsf-engine-logo");$("logoprev").textContent="Logo removed. Templates show the LOGO SLOT placeholder.";thumbCache.clear();await refreshComps(canvas,pageContent());canvas.requestRenderAll();changed();renderTplArea()};

/* ============ shell ============ */
const TAB_TITLES={tpl:"Templates",photos:"Photos",add:"Elements",text:"Text",content:"Story content",brand:"Brand"};
function showTab(t){document.querySelectorAll("[data-tab]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.tab===t));document.querySelectorAll("[data-pane]").forEach(p=>p.hidden=p.dataset.pane!==t);$("flytitle").textContent=TAB_TITLES[t]||"";setFly(true);if(t==="content")renderContentForm()}
document.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{if(b.getAttribute("aria-pressed")==="true"&&!$("fly").classList.contains("collapsed")){setFly(false);return}showTab(b.dataset.tab)});
document.querySelectorAll("[data-itab]").forEach(b=>b.onclick=()=>{setInsp(true);document.querySelectorAll("[data-itab]").forEach(x=>x.setAttribute("aria-pressed",x===b));document.querySelectorAll("[data-ipane]").forEach(p=>p.hidden=p.dataset.ipane!==b.dataset.itab);if(b.dataset.itab==="save")scheduleSize()});
document.querySelectorAll("[data-mode]").forEach(b=>b.onclick=()=>{document.querySelectorAll("[data-mode]").forEach(x=>x.setAttribute("aria-pressed",x===b));["design","optimise","favicon"].forEach(m=>$("mode-"+m).hidden=m!==b.dataset.mode);
  if(b.dataset.mode==="design")fitZoom();if(b.dataset.mode==="favicon"){renderFavSw();renderFavicon()}});
$("sizebtn").onclick=()=>{$("sizepanel").hidden=!$("sizepanel").hidden;$("cw").value=D.w;$("ch").value=D.h};
function buildSizes(){const s=$("sizesel");const opts=[["","Preset sizes…"]];Object.values(PLATFORMS).forEach(P=>P.formats.forEach(f=>{if(f.w)opts.push([`${f.w}x${f.h}`,`${P.n} · ${f.n} · ${f.w}×${f.h}`]);(f.items||[]).forEach(it=>opts.push([`${it.w}x${it.h}`,`${P.n} · ${it.n} · ${it.w}×${it.h}`]))}));
  WEB.forEach(t=>opts.push([`${t.w}x${t.h}`,`Website · ${t.n} · ${t.w}×${t.h}`]));opts.push(["1280x720","YouTube thumbnail · 1280×720"],["1240x1754","A4 poster 150 dpi · 1240×1754"]);
  s.innerHTML="";opts.forEach(([v,t])=>s.appendChild(el("option",{value:v,textContent:t})));s.onchange=()=>{if(!s.value)return;const[w,h]=s.value.split("x").map(Number);$("cw").value=w;$("ch").value=h}}
$("applysize").onclick=async()=>{const w=Math.round(+$("cw").value),h=Math.round(+$("ch").value);if(!(w>=16&&h>=16&&w<=8000&&h<=8000)){say("Use a size between 16 and 8000 px.",true);return}
  const sx=w/D.w,sy=h/D.h,scale=$("scalecontent").checked;savePage();const cur=D.cur;
  for(let i=0;i<D.pages.length;i++){const sc=await staticFor(D.pages[i].json,.1);sc.getObjects().forEach(o=>{if(o.hsfBg){o.set({width:w,height:h,left:0,top:0});return}if(!scale)return;
      const k=Math.min(sx,sy);if(o.hsfSlot){const sl=o.hsfSlot;sl.box=[sl.box[0]*sx,sl.box[1]*sy,sl.box[2]*sx,sl.box[3]*sy];if(sl.pts)sl.pts=sl.pts.map(p=>[p[0]*sx,p[1]*sy]);sl.r=(sl.r||0)*k;o.clipPath=clipFrom(slotD(sl));placeInSlot(o);return}
      if(o.hsfBorderOf||o.hsfMaskOf)return;const c=o.getCenterPoint();o.set({scaleX:o.scaleX*k,scaleY:o.scaleY*k});o.setPositionByOrigin(new fabric.Point(c.x*sx,c.y*sy),"center","center");if(o.hsfFit)o.hsfFit.base*=k;if(o.hsfFlow)o.hsfFlow.gap*=k});
    D.pages[i].json=canvasJSON(sc);if(D.pages[i].ref)D.pages[i].ref={...D.pages[i].ref,w,h};sc.dispose()}
  D.w=w;D.h=h;D.guides=[];loading=true;await new Promise(r=>canvas.loadFromJSON(D.pages[cur].json,r));prep(canvas);await regenDecor(canvas);loading=false;fitZoom();resetHist();renderPages();scheduleSize();scheduleQA();
  $("docsize").textContent=`${D.w}×${D.h} px · ${D.pages.length} page${D.pages.length>1?"s":""}`;say(`Canvas is now ${w}×${h}.`)};
$("rebuildsize").onclick=async()=>{const w=Math.round(+$("cw").value),h=Math.round(+$("ch").value);if(!(w>=16&&h>=16)){say("Enter a size first.",true);return}D.w=w;D.h=h;D.guides=[];
  D.pages.forEach(p=>{if(p.ref)p.ref={...p.ref,w,h}});await doReset("pages");$("docsize").textContent=`${D.w}×${D.h} px · ${D.pages.length} page${D.pages.length>1?"s":""}`};
