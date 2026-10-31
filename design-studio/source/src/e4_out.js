/* ============ export: images ============ */
const webpOK=(()=>{const c=document.createElement("canvas");c.width=c.height=2;return c.toDataURL("image/webp").startsWith("data:image/webp")})();
const toBlob=(c,type,q)=>new Promise(r=>c.toBlob(r,type,q));
function chooseFmt(v,alpha){if(v==="auto")v=D.cat==="social"&&!alpha?"jpeg":"webp";if(v==="webp"&&!webpOK)v=alpha?"png":"jpeg";if(v==="jpeg"&&alpha)v=webpOK?"webp":"png";return v}
async function encodeCanvas(c,fmt,targetKB,quality){if(fmt==="png"){const b=await toBlob(c,"image/png");return{blob:b,ext:"png",fits:!targetKB||b.size<=targetKB*1024}}
  const type=fmt==="webp"?"image/webp":"image/jpeg",ext=fmt==="webp"?"webp":"jpg";if(!targetKB){const b=await toBlob(c,type,quality??.92);return{blob:b,ext,fits:true}}
  let last;for(const q of[.92,.86,.8,.74,.68,.62,.56,.5,.44,.38]){last=await toBlob(c,type,q);if(last.size<=targetKB*1024)return{blob:last,ext,fits:true}}return{blob:last,ext,fits:false}}
function hideProxies(v){canvas.getObjects().forEach(o=>{if(o.hsfProxy)o.visible=!v})}
function exportCanvas(scale){canvas.discardActiveObject();hideProxies(true);const sc=parseFloat(scale||$("xscale").value);const c=pageCanvas(sc/zoom);hideProxies(false);canvas.requestRenderAll();return c}
function slug(s){return String(s||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}
function fileBase(i){const p=D.pages[i??D.cur];const parts=["hsf",slug(D.meta.code)||slug(D.meta.stream),D.platform?slug(D.platform):"web",slug(D.fmt),p&&p.ref&&p.ref.arch?slug(p.ref.arch):(p&&p.ref&&p.ref.kind==="web"&&D.pages.length>1?slug(p.stage):""),new Date().toISOString().slice(0,10).replace(/-/g,"")].filter(Boolean);
  return parts.join("-")+(D.pages.length>1?"-p"+String((i??D.cur)+1).padStart(2,"0"):"")}
function designBase(){return fileBase(0).replace(/-p01$/,"")}
let sizeT=null,sizeSeq=0;
function scheduleSize(){clearTimeout(sizeT);const p=$("xsize");if(!p)return;p.className="pill idle";p.textContent="Size: checking…";updGate();
  sizeT=setTimeout(async()=>{const seq=++sizeSeq;if(!canvas||document.querySelector('[data-ipane="save"]').hidden)return;const fmt=chooseFmt($("xfmt").value,isAlpha());const kb=parseFloat($("xkb").value)||0;
    hideProxies(true);const c=pageCanvas(parseFloat($("xscale").value)/zoom);hideProxies(false);const r=await encodeCanvas(c,fmt,kb);if(seq!==sizeSeq)return;const k=Math.round(r.blob.size/1024);
    p.className="pill "+(r.fits?"ok":"bad");p.textContent=kb?(r.fits?`${k} KB · within ${kb} KB`:`${k} KB · over ${kb} KB`):`${k} KB`;$("xfmtnote").textContent=`${r.ext.toUpperCase()} · ${c.width}×${c.height}px`},700)}
["xfmt","xscale","xkb"].forEach(id=>$(id).addEventListener("input",scheduleSize));
function hasPhotos(){return canvas.getObjects().some(o=>o.hsfUser)||D.pages.some(p=>(p.json?.objects||[]).some(o=>o.hsfUser))}
function updGate(){const need=canvas&&hasPhotos();$("gatebox").hidden=!need;const ok=!need||$("gate").checked;["saveimg","saveall","savepdf","savesvg","recvid","precord"].forEach(id=>$(id).disabled=!ok);if(!ok)$("savemsg").textContent="Tick the photo check to save."}
$("gate").addEventListener("change",()=>{updGate();say("")});
async function offer(name,data,mime){
  if(downloads){try{await downloads.save({filename:name,data});return"saved"}catch(e){if(e&&e.code==="declined")return"declined";if(e&&e.code==="rate_limited")return"busy"}}
  const blob=data instanceof Blob?data:new Blob([data],{type:mime||"application/octet-stream"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
  if((mime||"").startsWith("image/")){$("fbimg").src=url;$("fallback").hidden=false}return"downloaded"}
function result(res,name,extra=""){if(res==="declined")say("Save cancelled.");else if(res==="busy")say("A save prompt is already open.",true);else say(`${res==="saved"?"Saved":"Downloading"} ${name}${extra}`)}
function staticFor(json,scale){return new Promise(res=>{const sc=new fabric.StaticCanvas(document.createElement("canvas"),{enableRetinaScaling:false,renderOnAddRemove:false});
  sc.setDimensions({width:Math.max(1,Math.round(D.w*scale)),height:Math.max(1,Math.round(D.h*scale))});sc.setZoom(scale);sc.loadFromJSON(json,()=>res(sc))})}
$("saveimg").onclick=async()=>{say("Preparing…");const fmt=chooseFmt($("xfmt").value,isAlpha());const kb=parseFloat($("xkb").value)||0;const r=await encodeCanvas(exportCanvas(),fmt,kb);
  const name=`${fileBase()}.${r.ext}`;result(await offer(name,r.blob,r.blob.type),name,` · ${Math.round(r.blob.size/1024)} KB${r.fits?"":" (over target)"}`)};
$("saveall").onclick=async()=>{savePage();const files=[];const fmt=chooseFmt($("xfmt").value,isAlpha());const kb=parseFloat($("xkb").value)||0;
  for(let i=0;i<D.pages.length;i++){say(`Preparing page ${i+1} of ${D.pages.length}…`);const sc=await staticFor(D.pages[i].json,parseFloat($("xscale").value));sc.renderAll();
    const r=await encodeCanvas(sc.lowerCanvasEl,fmt,kb);files.push({name:`${fileBase(i)}.${r.ext}`,data:new Uint8Array(await r.blob.arrayBuffer())});sc.dispose()}
  files.push({name:"content-record.txt",data:contentRecord()});const name=`${designBase()}-pages.zip`;result(await offer(name,makeZip(files),"application/zip"),name,` · ${files.length-1} images + content record`)};
$("savepdf").onclick=async()=>{if(!window.jspdf){say("The PDF library didn't load. Use the offline version or check your connection.",true);return}savePage();const{jsPDF}=window.jspdf;
  const a4=D.a4||(Math.abs(D.w/D.h-210/297)<.01);const ori=D.w>D.h?"l":"p";const doc=a4?new jsPDF({orientation:ori,unit:"mm",format:"a4",compress:true}):new jsPDF({orientation:ori,unit:"px",format:[D.w,D.h],hotfixes:["px_scaling"],compress:true});
  const pw=doc.internal.pageSize.getWidth(),ph=doc.internal.pageSize.getHeight();const scale=Math.min(1,2400/Math.max(D.w,D.h));
  for(let i=0;i<D.pages.length;i++){say(`Rendering PDF page ${i+1} of ${D.pages.length}…`);const sc=await staticFor(D.pages[i].json,scale);sc.renderAll();const url=sc.lowerCanvasEl.toDataURL("image/jpeg",.9);sc.dispose();
    if(i>0)doc.addPage(a4?"a4":[D.w,D.h],ori);doc.addImage(url,"JPEG",0,0,pw,ph,undefined,"FAST")}
  doc.setProperties({title:D.name,subject:`HSF · ${D.meta.stream} · Brand Design Stack v${STACK_VERSION}`,creator:"HSF Design Engine"});
  const buf=doc.output("arraybuffer");const name=`${designBase()}.pdf`;result(await offer(name,new Blob([buf],{type:"application/pdf"}),"application/pdf"),name,` · ${D.pages.length} page${D.pages.length>1?"s":""} · ${(buf.byteLength/1048576).toFixed(2)} MB`)};
$("savesvg").onclick=async()=>{canvas.discardActiveObject();hideProxies(true);let svg=canvas.toSVG({viewBox:{x:0,y:0,width:D.w,height:D.h},width:D.w,height:D.h});hideProxies(false);
  const p=D.pages[D.cur];const meta={platform:D.platform||"website",format:D.fmt,archetype:p&&p.ref&&p.ref.arch,palette:D.palette,communication_stream:D.meta.stream,content_id:D.meta.code,source_idea_id:D.meta.idea_id,editorial_family:D.meta.family,evidence_status:D.meta.evidence_status,public_claim_status:D.meta.public_claim_status,management_approval:D.meta.management_approval,public_use_verified_by_application:false,story_engine:`HSF Brand Design Stack v${STACK_VERSION}`,image_first:true};
  svg=svg.replace("<svg ",`<svg data-hsf-stack="${STACK_VERSION}" `).replace(/<desc>[^<]*<\/desc>/,`<title>${(D.name||"").replace(/[<&]/g,"")}</title><desc>${JSON.stringify(meta).replace(/&/g,"&amp;").replace(/</g,"&lt;")}</desc>`);
  const name=`${fileBase()}.svg`;result(await offer(name,svg,"image/svg+xml"),name,` · ${Math.round(svg.length/1024)} KB · fonts must be installed to edit in Illustrator`)};
function contentRecord(){savePage();const lines=[`HSF content record · HSF Design Engine · Brand Design Stack v${STACK_VERSION}`,""];const m=D.meta;
  const kv=(k,v)=>lines.push(`${k}: ${v??""}`);kv("Content ID",m.code||"UNREGISTERED_DRAFT");kv("Source Idea ID",m.idea_id||"Not linked");kv("Stream",STREAMS[m.stream]?.n||m.stream);kv("Editorial family",CONTENT_FAMILIES[m.family]||m.family);kv("E4BL series",E4BL_SERIES[m.series]||"None");kv("Project",m.project||"HSF (general)");kv("Evidence status",m.evidence_status||"NOT_VERIFIED");kv("Public claim status",m.public_claim_status||"NOT_APPROVED");kv("Technical review",m.technical_review||"PENDING");kv("Safeguarding review",m.safeguarding_review||"PENDING");kv("Management approval",m.management_approval||"PENDING");kv("Public-use label",m.management_approval==="APPROVED_PUBLIC"&&m.technical_review==="CLEARED"&&m.safeguarding_review==="CLEARED"&&m.evidence_status==="VERIFIED_PUBLIC"&&m.public_claim_status==="APPROVED_PUBLIC"?"EDITOR-DECLARED CLEARANCES, VERIFY AGAINST APPROVAL RECORD":"DRAFT - NOT FOR PUBLICATION");kv("Platform",D.platform||"Website");kv("Format",`${D.fmt} · ${D.w}×${D.h}`);
  kv("Palette",PALETTES[D.palette].name);kv("Typography",TYPESETS[D.type].name);kv("Consent / public use",m.consent);kv("Reviewed by",m.review);kv("Logo",logoURL?"Logo image uploaded (verify against official master)":"PLACEHOLDER · do not publish");kv("Exported",new Date().toISOString().slice(0,16).replace("T"," "));lines.push("");
  D.pages.forEach((p,i)=>{const c={...DEFAULT_CONTENT,...D.content,...p.content};const objs=p.json?.objects||[];const photos=objs.filter(o=>o.hsfSlot&&o.hsfUser).map(o=>o.hsfSlot.file||"photo");const empty=objs.filter(o=>o.hsfSlot&&!o.hsfUser).length;
    lines.push(`--- Page ${i+1}: ${p.stage||""}${p.ref&&p.ref.arch?" · "+ARCH[p.ref.arch].n:""}`);
    const keys=new Set();objs.forEach(o=>{const b=o.hsfBind||(o.hsfComp&&o.hsfComp.bind);if(b)(b.match(/\{(\w+)\}/g)||[]).forEach(x=>keys.add(x.slice(1,-1)))});
    FIELDS.forEach(([k,l])=>{if(keys.has(k))kv("  "+l,c[k])});kv("  Alt text",c.alt||"(missing)");kv("  Photos",photos.join("; ")||"none");if(empty)kv("  Empty photo frames",empty);
    if(p.ref&&p.ref.arch){kv("  Photo area",photoShare((p.json.objects||[]).map(o=>({hsfSlot:o.hsfSlot,visible:o.visible})),D.w,D.h)+"% (target "+ARCH[p.ref.arch].share.join("–")+"%)")}});
  return lines.join("\n")+"\n"}
$("saverec").onclick=async()=>{const name=`${designBase()}-record.txt`;result(await offer(name,contentRecord(),"text/plain"),name)};

/* ============ design files ============ */
function designData(){savePage();return{app:"HSF Design Engine",stack:STACK_VERSION,v:3,w:D.w,h:D.h,name:D.name,cat:D.cat,platform:D.platform,fmt:D.fmt,palette:D.palette,type:D.type,content:D.content,story:D.story,meta:D.meta,guides:D.guides,budget:D.budget,alpha:D.alpha,a4:D.a4,
  pages:D.pages.map(p=>({json:p.json,dur:p.dur,trans:p.trans,kb:p.kb,content:p.content,defaultContent:p.defaultContent,ref:p.ref,stage:p.stage}))}}
async function loadDesign(d){Object.assign(D,{w:d.w,h:d.h,name:d.name||"Design",cat:d.cat||"social",platform:d.platform||"",fmt:d.fmt||"",palette:d.palette||"evergreen",type:d.type||"stack",content:d.content||{},story:d.story||{},meta:{...D.meta,...(d.meta||{}),evidence_status:"NOT_VERIFIED",public_claim_status:"NOT_APPROVED",technical_review:"PENDING",safeguarding_review:"PENDING",management_approval:"PENDING",consent:"Not checked",review:""}/* PHASE1_IMPORT_REVIEW_RESET: imported metadata never grants publication permission */,guides:d.guides||[],budget:d.budget||null,alpha:!!d.alpha,a4:!!d.a4,typeChosen:true,palChosen:true});
  D.pages=d.pages.map(p=>({...p,thumb:null}));D.cur=0;renderPalBar();$("typeset").value=D.type;$("xkb").value=D.budget||"";fitZoomQuiet();
  for(let i=D.pages.length-1;i>=0;i--){loading=true;await new Promise(r=>canvas.loadFromJSON(D.pages[i].json,r));prep(canvas);loading=false;canvas.renderAll();D.pages[i].thumb=thumbOf()}
  fitZoom();resetHist();renderPages();renderLayers();onSel();renderContentForm();scheduleSize();scheduleQA();$("docname").textContent=D.name;$("docsize").textContent=`${D.w}×${D.h} px · ${D.pages.length} page${D.pages.length>1?"s":""}`}
$("savejson").onclick=async()=>{const s=JSON.stringify(designData());const name=`${designBase()}.json`;result(await offer(name,s,"application/json"),name,` · ${Math.round(s.length/1024)} KB`)};
$("openjson").addEventListener("change",e=>{const file=e.target.files[0];e.target.value="";if(!file)return;const rd=new FileReader();rd.onload=async()=>{try{const d=JSON.parse(rd.result);if(!d.pages)throw 0;await loadDesign(d);say("Design opened.")}catch(err){say("That file isn't an HSF Design Engine design.",true)}};rd.readAsText(file)});
let autoT=null;function autosave(){clearTimeout(autoT);autoT=setTimeout(()=>{try{store.set("hsf-engine-last",JSON.stringify(designData()))}catch(e){}},1500)}
$("restore").onclick=async()=>{try{await loadDesign(JSON.parse(store.get("hsf-engine-last")));$("restore").hidden=true;say("Last session restored.")}catch(e){say("Couldn't restore the last session.",true)}};

/* ============ animation engine ============ */
const ease=t=>1-Math.pow(1-clamp(t,0,1),3);
async function buildTimeline(scale){savePage();const pages=[];let start=0;
  for(const p of D.pages){const sc=await staticFor(p.json,scale);const objs=sc.getObjects().map(o=>({o,b:{left:o.left,top:o.top,scaleX:o.scaleX,scaleY:o.scaleY,opacity:o.opacity??1}}));pages.push({sc,objs,dur:p.dur,trans:p.trans,kb:p.kb,start});start+=p.dur}
  const tl={pages,total:start,w:Math.round(D.w*scale),h:Math.round(D.h*scale)};
  for(const pg of pages){renderPageAt(pg,pg.dur);const c=document.createElement("canvas");c.width=tl.w;c.height=tl.h;c.getContext("2d").drawImage(pg.sc.lowerCanvasEl,0,0);pg.end=c}return tl}
function renderPageAt(pg,t){
  for(const{o,b}of pg.objs){o.set(b);const a=o.hsfAnim;
    if(pg.kb&&o.hsfSlot&&o.hsfUser){const k=1+.07*Math.min(1,t/pg.dur);const c=o.getCenterPoint();o.set({scaleX:b.scaleX*k,scaleY:b.scaleY*k});o.setPositionByOrigin(c,"center","center")}
    if(a&&a.type&&a.type!=="none"){const e=ease((t-a.delay)/a.dur),m=Math.min(D.w,D.h)*.06;
      if(o.hsfSlot){o.set("opacity",b.opacity*e)}
      else switch(a.type){case"fade":o.set("opacity",b.opacity*e);break;case"rise":o.set({top:o.top+(1-e)*m,opacity:b.opacity*e});break;case"drop":o.set({top:o.top-(1-e)*m,opacity:b.opacity*e});break;
        case"fromRight":o.set({left:o.left+(1-e)*m*1.6,opacity:b.opacity*e});break;case"fromLeft":o.set({left:o.left-(1-e)*m*1.6,opacity:b.opacity*e});break;
        case"zoom":case"pop":{const raw=clamp((t-a.delay)/a.dur,0,1);const s=a.type==="zoom"?.8+.2*e:(raw<.7?.6+raw/.7*.5:1.1-(raw-.7)/.3*.1);const c=o.getCenterPoint();o.set({scaleX:o.scaleX*s,scaleY:o.scaleY*s,opacity:b.opacity*Math.min(1,raw*2)});o.setPositionByOrigin(c,"center","center");break}}}}
  pg.sc.renderAll();return pg.sc.lowerCanvasEl}
const TRANS=.6;
function drawFrame(tl,ctx,t){const W=tl.w,H=tl.h;let i=tl.pages.findIndex(p=>t>=p.start&&t<p.start+p.dur);if(i<0)i=tl.pages.length-1;const pg=tl.pages[i],lt=t-pg.start;
  ctx.globalAlpha=1;ctx.fillStyle="#000";ctx.fillRect(0,0,W,H);const cur=renderPageAt(pg,lt);
  if(i>0&&pg.trans!=="cut"&&lt<TRANS){const e=ease(lt/TRANS),prev=tl.pages[i-1].end;
    if(pg.trans==="fade"){ctx.drawImage(prev,0,0);ctx.globalAlpha=e;ctx.drawImage(cur,0,0)}else if(pg.trans==="slide"){ctx.drawImage(prev,-e*W,0);ctx.drawImage(cur,(1-e)*W,0)}
    else{ctx.drawImage(prev,0,0);ctx.globalAlpha=e;const s=1.08-.08*e;ctx.drawImage(cur,(W-W*s)/2,(H-H*s)/2,W*s,H*s)}ctx.globalAlpha=1}else ctx.drawImage(cur,0,0)}
function updVideoLen(){const t=D.pages.reduce((a,p)=>a+(+p.dur||0),0);$("vlen").textContent=`${D.pages.length} page${D.pages.length>1?"s":""} · ${t.toFixed(1)} s`}
let playing=null;
$("play").onclick=async()=>{canvas.discardActiveObject();endEdit(false);const scale=Math.min(1,900/D.w,620/D.h);$("pmsg").textContent="";const tl=await buildTimeline(scale);
  const pc=$("pcv");pc.width=tl.w;pc.height=tl.h;const ctx=pc.getContext("2d");$("player").hidden=false;$("ptitle").textContent=`Preview · ${tl.total.toFixed(1)} s · loops`;
  const t0=performance.now();playing={stop:false};const me=playing;(function loop(){if(me.stop){tl.pages.forEach(p=>p.sc.dispose());return}const t=((performance.now()-t0)/1000)%tl.total;drawFrame(tl,ctx,t);$("pbar").style.width=(t/tl.total*100)+"%";$("ptime").textContent=t.toFixed(1)+" s";requestAnimationFrame(loop)})()};
$("pclose").onclick=()=>{if(playing)playing.stop=true;$("player").hidden=true};
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("player").hidden)$("pclose").click()});
function videoTypes(){const T=[["webm","video/webm;codecs=vp9"],["webm","video/webm;codecs=vp8"],["webm","video/webm"],["mp4","video/mp4;codecs=avc1.42E01E"],["mp4","video/mp4"]];return typeof MediaRecorder==="undefined"?[]:T.filter(t=>MediaRecorder.isTypeSupported(t[1]))}
function buildVideoSel(){const v=$("vfmt");const ts=videoTypes();const seen=new Set();v.innerHTML="";ts.forEach(t=>{if(seen.has(t[0]))return;seen.add(t[0]);v.appendChild(el("option",{value:t[1],textContent:t[0]==="webm"?"WebM":"MP4"}))});
  if(!ts.length){v.innerHTML="<option>Not supported</option>";v.disabled=true;$("recvid").disabled=true;$("vlen").textContent="This browser can't record video. Use Chrome or Edge."}}
async function record(){if(playing)playing.stop=true;const type=$("vfmt").value;if(!type||$("vfmt").disabled)return;const fps=+$("vfps").value,bps=+$("vq").value,scale=+$("vsize").value;
  const m=t=>{$("pmsg").textContent=t;say(t)};m("Preparing pages…");endEdit(false);const tl=await buildTimeline(scale);
  const out=document.createElement("canvas");out.width=tl.w%2?tl.w+1:tl.w;out.height=tl.h%2?tl.h+1:tl.h;const ctx=out.getContext("2d");
  const pc=$("pcv");pc.width=out.width;pc.height=out.height;const pctx=pc.getContext("2d");$("player").hidden=false;$("ptitle").textContent="Recording… keep this tab open and visible";
  drawFrame(tl,ctx,0);const stream=out.captureStream(fps);const rec=new MediaRecorder(stream,{mimeType:type,videoBitsPerSecond:bps});const chunks=[];rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
  const done=new Promise(r=>rec.onstop=r);rec.start(250);const t0=performance.now();
  await new Promise(res=>{(function tick(){const t=(performance.now()-t0)/1000;if(t>=tl.total){drawFrame(tl,ctx,tl.total-.001);pctx.drawImage(out,0,0);setTimeout(()=>{rec.stop();res()},200);return}
    drawFrame(tl,ctx,t);pctx.drawImage(out,0,0);$("pbar").style.width=(t/tl.total*100)+"%";$("ptime").textContent=`${t.toFixed(1)} / ${tl.total.toFixed(1)} s`;setTimeout(tick,1000/fps)})()});
  await done;tl.pages.forEach(p=>p.sc.dispose());const ext=type.includes("mp4")?"mp4":"webm";const blob=new Blob(chunks,{type:type.split(";")[0]});
  const name=`${designBase()}.${ext}`;$("ptitle").textContent="Recording finished";m(`Video ready · ${(blob.size/1048576).toFixed(2)} MB`);
  result(await offer(name,blob,blob.type),name,` · ${(blob.size/1048576).toFixed(2)} MB · ${tl.total.toFixed(1)} s`);$("pmsg").textContent=$("savemsg").textContent}
$("recvid").onclick=record;$("precord").onclick=record;

/* ============ ZIP / ICO ============ */
const CRC=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
function crc32(u){let c=0xFFFFFFFF;for(let i=0;i<u.length;i++)c=CRC[(c^u[i])&255]^(c>>>8);return(c^0xFFFFFFFF)>>>0}
function makeZip(files){const enc=new TextEncoder();const parts=[],cent=[];let off=0;const d=new Date();const dt=((d.getFullYear()-1980)<<9)|((d.getMonth()+1)<<5)|d.getDate(),tm=(d.getHours()<<11)|(d.getMinutes()<<5)|(d.getSeconds()>>1);
  for(const f of files){const nm=enc.encode(f.name),data=typeof f.data==="string"?enc.encode(f.data):f.data,crc=crc32(data),sz=data.length;
    const h=new DataView(new ArrayBuffer(30));h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(6,0x0800,true);h.setUint16(10,tm,true);h.setUint16(12,dt,true);h.setUint32(14,crc,true);h.setUint32(18,sz,true);h.setUint32(22,sz,true);h.setUint16(26,nm.length,true);
    parts.push(h,nm,data);const c=new DataView(new ArrayBuffer(46));c.setUint32(0,0x02014b50,true);c.setUint16(4,20,true);c.setUint16(6,20,true);c.setUint16(8,0x0800,true);c.setUint16(12,tm,true);c.setUint16(14,dt,true);
    c.setUint32(16,crc,true);c.setUint32(20,sz,true);c.setUint32(24,sz,true);c.setUint16(28,nm.length,true);c.setUint32(42,off,true);cent.push(c,nm);off+=30+nm.length+sz}
  const cd=cent.reduce((a,p)=>a+(p.byteLength??p.length),0);const e=new DataView(new ArrayBuffer(22));e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,cd,true);e.setUint32(16,off,true);
  return new Blob([...parts,...cent,e],{type:"application/zip"})}
function makeIco(pngs){const n=pngs.length;const head=new DataView(new ArrayBuffer(6+16*n));head.setUint16(2,1,true);head.setUint16(4,n,true);let off=6+16*n;
  pngs.forEach((p,i)=>{const o=6+16*i;head.setUint8(o,p.size>=256?0:p.size);head.setUint8(o+1,p.size>=256?0:p.size);head.setUint16(o+4,1,true);head.setUint16(o+6,32,true);head.setUint32(o+8,p.data.length,true);head.setUint32(o+12,off,true);off+=p.data.length});
  return new Blob([head,...pngs.map(p=>p.data)],{type:"image/x-icon"})}

/* ============ optimise ============ */
let OF=[];
$("oq").oninput=()=>$("oqv").textContent=$("oq").value;
$("ofiles").addEventListener("change",async e=>{const files=[...e.target.files];e.target.value="";if(!files.length)return;OF=files;await runOpt()});
$("orun").onclick=runOpt;
$("oreset").onclick=()=>{$("omax").value="1920";$("ocrop").value="0";$("ofmt").value="webp";$("okb").value="150";$("oq").value="80";$("oqv").textContent="80";$("omsg").textContent="Settings reset."};
async function runOpt(){const body=$("obody");body.innerHTML="";const max=+$("omax").value,crop=+$("ocrop").value,fmt=$("ofmt").value,kb=+$("okb").value||0,q=+$("oq").value/100;let tb=0,ta=0;OF.results=[];
  for(let i=0;i<OF.length;i++){const file=OF[i];$("omsg").textContent=`Processing ${i+1} of ${OF.length}…`;let img;try{img=await loadImg(URL.createObjectURL(file))}catch(err){continue}
    let sx=0,sy=0,sw=img.naturalWidth,sh=img.naturalHeight;if(crop){const r=sw/sh;if(r>crop){const nw=sh*crop;sx=(sw-nw)/2;sw=nw}else{const nh=sw/crop;sy=(sh-nh)/2;sh=nh}}
    const k=max?Math.min(1,max/Math.max(sw,sh)):1;const c=document.createElement("canvas");c.width=Math.round(sw*k);c.height=Math.round(sh*k);const x=c.getContext("2d");x.imageSmoothingQuality="high";
    if(fmt==="jpeg"){x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height)}x.drawImage(img,sx,sy,sw,sh,0,0,c.width,c.height);
    const f2=fmt==="webp"&&!webpOK?"jpeg":fmt;const r=await encodeCanvas(c,f2,f2==="png"?0:kb,q);const name=file.name.replace(/\.[^.]+$/,"").replace(/[^\w-]+/g,"-").toLowerCase()+"."+r.ext;
    OF.results.push({name,blob:r.blob});tb+=file.size;ta+=r.blob.size;const saved=Math.round((1-r.blob.size/file.size)*100);const url=URL.createObjectURL(r.blob);
    const tr=document.createElement("tr");tr.innerHTML=`<td><img src="${url}" alt=""></td><td>${name}</td><td>${img.naturalWidth}×${img.naturalHeight}<br>${Math.round(file.size/1024)} KB</td><td>${c.width}×${c.height}<br>${Math.round(r.blob.size/1024)} KB${r.fits?"":" ⚠"}</td><td>${saved>0?saved+"%":"–"}</td>`;
    const td=document.createElement("td");td.appendChild(btn("Save",async()=>{const res=await offer(name,r.blob,r.blob.type);$("omsg").textContent=res==="declined"?"Save cancelled.":`Saved ${name}`}));tr.appendChild(td);body.appendChild(tr)}
  $("omsg").textContent=OF.results.length?`${OF.results.length} image${OF.results.length>1?"s":""}: ${(tb/1048576).toFixed(1)} MB → ${(ta/1048576).toFixed(2)} MB (${Math.round((1-ta/tb)*100)}% smaller). Camera and GPS data removed.`:"No images could be opened.";
  $("orun").disabled=false;$("ozip").disabled=!OF.results.length}
$("ozip").onclick=async()=>{const files=[];for(const r of OF.results)files.push({name:r.name,data:new Uint8Array(await r.blob.arrayBuffer())});const res=await offer("hsf-optimised-images.zip",makeZip(files),"application/zip");$("omsg").textContent=res==="declined"?"Save cancelled.":"Saved hsf-optimised-images.zip"};

/* ============ favicon ============ */
let favSrc=null,favBg="primary";
function renderFavSw(){const box=$("fsw");box.innerHTML="";box.appendChild(swatchRow(favBg,v=>{favBg=v||"primary";renderFavSw();renderFavicon()}))}
function favDraw(size){const c=document.createElement("canvas");c.width=c.height=size;const x=c.getContext("2d");const shape=$("fshape").value,pad=+$("fpad").value/100,zm=+$("fzoom").value/100;
  if(shape!=="none"){x.fillStyle=roleColor(favBg);x.beginPath();if(shape==="circle")x.arc(size/2,size/2,size/2,0,Math.PI*2);else if(shape==="rounded"){const r=size*.22;x.roundRect?x.roundRect(0,0,size,size,r):x.rect(0,0,size,size)}else x.rect(0,0,size,size);x.fill()}
  if(favSrc){const inner=size*(1-pad*2);const iw=favSrc.width||favSrc.naturalWidth,ih=favSrc.height||favSrc.naturalHeight;const s=Math.min(inner/iw,inner/ih)*zm;x.save();if(shape==="circle"){x.beginPath();x.arc(size/2,size/2,size/2,0,Math.PI*2);x.clip()}
    x.imageSmoothingQuality="high";x.drawImage(favSrc,(size-iw*s)/2,(size-ih*s)/2,iw*s,ih*s);x.restore()}return c}
function favAt(size){const big=favDraw(512);if(size===512)return big;let cur=big;while(cur.width/2>=size){const h=document.createElement("canvas");h.width=h.height=cur.width/2;const hx=h.getContext("2d");hx.imageSmoothingQuality="high";hx.drawImage(cur,0,0,h.width,h.height);cur=h}
  const c=document.createElement("canvas");c.width=c.height=size;const cx=c.getContext("2d");cx.imageSmoothingQuality="high";cx.drawImage(cur,0,0,size,size);return c}
function renderFavicon(){const box=$("favs");if(!box)return;box.innerHTML="";[16,32,48,180,512].forEach(s=>{const fig=document.createElement("figure");const c=favAt(s);const shown=Math.min(s,160);c.style.width=shown+"px";c.style.height=shown+"px";
  fig.append(c,el("figcaption",{textContent:`${s}×${s}${s===512?" · WordPress":s===180?" · Apple":""}`}));box.appendChild(fig)});
  const t=$("ftab").getContext("2d");t.clearRect(0,0,16,16);t.drawImage(favAt(32),0,0,16,16);$("fsave512").disabled=$("fsavezip").disabled=!favSrc;if(!favSrc)$("fmsg").textContent="Choose an image, or use the brand logo."}
["fshape","fpad","fzoom"].forEach(id=>$(id).addEventListener("input",()=>{$("fpadv").textContent=$("fpad").value;$("fzoomv").textContent=$("fzoom").value;renderFavicon()}));
$("freset").onclick=()=>{$("fshape").value="rounded";$("fpad").value=12;$("fzoom").value=100;$("fpadv").textContent="12";$("fzoomv").textContent="100";favBg="primary";renderFavSw();renderFavicon()};
$("ffile").addEventListener("change",async e=>{const file=e.target.files[0];e.target.value="";if(!file)return;try{favSrc=await loadImg(URL.createObjectURL(file));$("fmsg").textContent="";renderFavicon()}catch(err){$("fmsg").textContent="That file couldn't be opened."}});
$("fuselogo").onclick=async()=>{if(!logoURL){$("fmsg").textContent="Upload the logo in Design → Brand first.";return}favSrc=await loadImg(logoURL);$("fmsg").textContent="";renderFavicon()};
$("fusepage").onclick=()=>{hideProxies(true);favSrc=pageCanvas(Math.min(1,1024/Math.max(D.w,D.h))/zoom);hideProxies(false);$("fmsg").textContent="";renderFavicon()};
const pngBytes=async c=>new Uint8Array(await(await toBlob(c,"image/png")).arrayBuffer());
$("fsave512").onclick=async()=>{const b=await toBlob(favAt(512),"image/png");const res=await offer("hsf-site-icon-512.png",b,"image/png");$("fmsg").textContent=res==="declined"?"Save cancelled.":"Saved hsf-site-icon-512.png"};
$("fsavezip").onclick=async()=>{const ico=makeIco(await Promise.all([16,32,48].map(async s=>({size:s,data:await pngBytes(favAt(s))}))));
  const manifest=JSON.stringify({name:"Human Safety Foundation",short_name:"HSF",icons:[{src:"/android-chrome-192x192.png",sizes:"192x192",type:"image/png"},{src:"/android-chrome-512x512.png",sizes:"512x512",type:"image/png"}],theme_color:roleColor("primary"),background_color:"#FFFFFF",display:"browser"},null,2);
  const readme=`HSF favicon pack\n\nWordPress (easiest): Appearance > Customize > Site Identity > Site Icon, upload site-icon-512.png.\nElementor: Site Settings > Site Identity > Site Favicon, same file.\n\nManual install only if not using the Site Icon setting: upload all files to the site root and add to <head>:\n<link rel="icon" href="/favicon.ico" sizes="any">\n<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">\n<link rel="apple-touch-icon" href="/apple-touch-icon.png">\n<link rel="manifest" href="/site.webmanifest">\n`;
  const files=[{name:"favicon.ico",data:new Uint8Array(await ico.arrayBuffer())},{name:"favicon-16x16.png",data:await pngBytes(favAt(16))},{name:"favicon-32x32.png",data:await pngBytes(favAt(32))},
    {name:"apple-touch-icon.png",data:await pngBytes(favAt(180))},{name:"android-chrome-192x192.png",data:await pngBytes(favAt(192))},{name:"android-chrome-512x512.png",data:await pngBytes(favAt(512))},
    {name:"site-icon-512.png",data:await pngBytes(favAt(512))},{name:"site.webmanifest",data:manifest},{name:"README.txt",data:readme}];
  const res=await offer("hsf-favicon-pack.zip",makeZip(files),"application/zip");$("fmsg").textContent=res==="declined"?"Save cancelled.":"Saved hsf-favicon-pack.zip"};

