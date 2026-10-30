/* ============ toast (status visible anywhere) ============ */
let toastT=null;
function toast(t,err){let b=$("toast");if(!b){b=el("div",{id:"toast",className:"toast"});b.setAttribute("role","status");b.setAttribute("aria-live","polite");document.body.appendChild(b)}
  if(!t){b.hidden=true;return}b.className="toast"+(err?" err":"");b.textContent=t;b.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>b.hidden=true,err?5200:3400)}
const _say=say;say=function(t,err){_say(t,err);const savePane=document.querySelector('[data-ipane="save"]');const visible=savePane&&!savePane.hidden&&!$("insp").classList.contains("collapsed");if(t&&!visible&&!/^Preparing|^Rendering/.test(t))toast(t,err)};

/* ============ quick download: JPG · PNG · WebP, web-optimised ============ */
function gateOK(){return!hasPhotos()||$("gate").checked}
function autoBudget(c,fmt){/* web budget: template budget (website) or ~0.22 KB per 1,000 px for JPG, WebP ~25% smaller */
  const sc=parseFloat($("dlscale").value)||1;let kb=D.budget?Math.round(D.budget*Math.max(1,sc)):Math.round(c.width*c.height/1000*.22);if(!D.budget&&fmt==="webp")kb=Math.round(kb*.75);return Math.max(40,Math.min(kb,1500))}
function flattenWhite(c){const f=document.createElement("canvas");f.width=c.width;f.height=c.height;const x=f.getContext("2d");x.fillStyle="#FFFFFF";x.fillRect(0,0,f.width,f.height);x.drawImage(c,0,0);return f}
let qsBusy=false;
async function quickSave(kind){if(!canvas||qsBusy)return;if(!gateOK()){openDl(true);toast("Tick the photo check before downloading.",true);return}
  qsBusy=true;try{endEdit(false);let fmt=kind;let note="";if(fmt==="webp"&&!webpOK){fmt="jpeg";note=" (this browser can't make WebP, so JPG was used)"}
    const sc=parseFloat($("dlscale").value)||1;let c=exportCanvas(sc);if(fmt==="jpeg"&&isAlpha()){c=flattenWhite(c);note+=" · transparent areas filled white"}
    const web=$("dlopt").value==="web";const kb=fmt==="png"||!web?0:autoBudget(c,fmt);toast("Preparing "+(fmt==="jpeg"?"JPG":fmt.toUpperCase())+"…");
    const r=await encodeCanvas(c,fmt,kb,web?undefined:.95);const name=`${fileBase()}.${r.ext}`;const size=Math.round(r.blob.size/1024);
    if(fmt==="png"&&size>600&&!isAlpha())note+=" · PNG is lossless; JPG or WebP will be much smaller for photos";
    const res=await offer(name,r.blob,r.blob.type);
    if(res==="declined")toast("Download cancelled.");else if(res==="busy")toast("A save prompt is already open.",true);
    else toast(`${res==="saved"?"Saved":"Downloading"} ${name} · ${c.width}×${c.height}px · ${size} KB${kb?(r.fits?` (within ${kb} KB)`:` (over ${kb} KB target)`):""}${note}`)}
  catch(e){toast("Couldn't make that file: "+(e&&e.message||e),true)}finally{qsBusy=false}}
document.querySelectorAll(".dl [data-q]").forEach(b=>b.onclick=()=>{closeDl();quickSave(b.dataset.q)});
function openDl(flagGate){const p=$("dlpop");p.hidden=false;$("dlmore").setAttribute("aria-expanded","true");const need=canvas&&hasPhotos();$("dlgatebox").hidden=!need;$("dlgate").checked=$("gate").checked;
  $("dlgatebox").classList.toggle("flag",!!flagGate);$("dlinfo").textContent=`${D.w}×${D.h}px · ${D.pages.length} page${D.pages.length>1?"s":""}${D.budget?` · ${D.budget} KB web budget`:""}`}
function closeDl(){$("dlpop").hidden=true;$("dlmore").setAttribute("aria-expanded","false")}
$("dlmore").onclick=e=>{e.stopPropagation();$("dlpop").hidden?openDl():closeDl()};
$("dlpop").addEventListener("click",e=>e.stopPropagation());
document.addEventListener("click",e=>{if(!e.target.closest(".dl"))closeDl()});
$("dlgate").addEventListener("change",()=>{$("gate").checked=$("dlgate").checked;$("gate").dispatchEvent(new Event("change"));$("dlgatebox").classList.remove("flag")});
$("dlpop").querySelectorAll("[data-run]").forEach(b=>b.onclick=()=>{const t=$(b.dataset.run);if(t.disabled){toast(gateOK()?"That option isn't available in this browser.":"Tick the photo check before downloading.",true);return}closeDl();t.click()});
try{const v=store.get("hsf-dl");if(v){const o=JSON.parse(v);if(o.opt)$("dlopt").value=o.opt;if(o.sc)$("dlscale").value=o.sc}}catch(e){}
["dlopt","dlscale"].forEach(id=>$(id).addEventListener("change",()=>store.set("hsf-dl",JSON.stringify({opt:$("dlopt").value,sc:$("dlscale").value}))));

/* ============ layer units: a photo frame travels with its border and brush-cut ============ */
const isDecor=o=>!!(o&&(o.hsfBorderOf||o.hsfMaskOf));
function decorOf(o){return o&&o.hsfId?canvas.getObjects().filter(y=>y.hsfBorderOf===o.hsfId||y.hsfMaskOf===o.hsfId):[]}
function unitsList(){const objs=canvas.getObjects().filter(o=>!o.hsfProxy);const seen=new Set(),units=[];
  objs.forEach(o=>{if(seen.has(o))return;if(isDecor(o)&&objs.some(p=>p.hsfId&&(p.hsfId===o.hsfBorderOf||p.hsfId===o.hsfMaskOf)))return;const u=[o,...(isDecor(o)?[]:decorOf(o))];u.forEach(x=>seen.add(x));units.push(u)});
  objs.forEach(o=>{if(!seen.has(o)){seen.add(o);units.push([o])}});return units}
function applyUnits(units){const prox=canvas.getObjects().filter(o=>o.hsfProxy);canvas._objects=[...units.flat(),...prox];canvas.renderAll();changed()}
function selObjs(){const a=sel();if(!a)return[];if(a.type==="activeSelection")return a.getObjects().map(x=>x.hsfProxy&&editProxy?editProxy.o:x);return[a]}
function arrange(how,list){list=(list||selObjs()).filter(Boolean);if(!list.length){toast("Select something to arrange.");return}
  const units=unitsList();const isSel=u=>list.includes(u[0]);if(!units.some(isSel))return;const isBg=u=>!!u[0].hsfBg;
  if(how==="front"){const s=units.filter(isSel),r=units.filter(u=>!isSel(u));applyUnits([...r,...s])}
  else if(how==="back"){const s=units.filter(isSel),r=units.filter(u=>!isSel(u));const nb=r.findIndex(u=>!isBg(u));const at=s.some(isBg)||nb<0?0:nb;r.splice(at,0,...s);applyUnits(r)}
  else if(how==="up"){for(let i=units.length-2;i>=0;i--){if(isSel(units[i])&&!isSel(units[i+1])){[units[i],units[i+1]]=[units[i+1],units[i]]}}applyUnits(units)}
  else if(how==="down"){for(let i=1;i<units.length;i++){if(isSel(units[i])&&!isSel(units[i-1])&&(!isBg(units[i-1])||isBg(units[i]))){[units[i],units[i-1]]=[units[i-1],units[i]]}}applyUnits(units)}
  if(editProxy)canvas.bringToFront(editProxy.p);canvas.requestRenderAll()}
function setVis(o,v){o.set("visible",v);decorOf(o).forEach(y=>y.set("visible",v));if(!v&&selObjs().includes(o)){canvas.discardActiveObject();onSel()}}
function setLock(o,v){o.hsfLock=v;o.set({selectable:!v,evented:!v});if(v&&selObjs().includes(o)){canvas.discardActiveObject();onSel()}}
function selectList(list){list=list.filter(o=>o&&o.selectable!==false&&o.visible!==false);if(!list.length){canvas.discardActiveObject()}else if(list.length===1)canvas.setActiveObject(list[0]);else canvas.setActiveObject(new fabric.ActiveSelection(list,{canvas}));canvas.requestRenderAll();onSel()}
function groupSel(){const o=sel();if(o&&o.type==="activeSelection"){if(o.getObjects().some(x=>x.hsfSlot)){toast("Photo frames can't be grouped. Select several and move them together instead.",true);return}const g=o.toGroup();g.hsfId=uid();g.hsfName="Group";commit();onSel()}else toast("Select two or more items to group (Shift-click).")}
function ungroupSel(){const o=sel();if(o&&o.type==="group"&&!o.hsfIcon){if(o.hsfComp)o.hsfComp=null;o.toActiveSelection();canvas.requestRenderAll();commit();onSel()}else toast("Select a group to ungroup.")}
function deleteObj(o){if(!o||o.hsfBg)return;if(selObjs().includes(o)){del();return}decorOf(o).forEach(y=>canvas.remove(y));canvas.remove(o);commit()}

/* ============ clipboard + duplicate ============ */
let CLIP=null,pasteN=0;
function cloneInto(src,off){return new Promise(res=>src.clone(c=>{const fix=x=>{x.hsfId=uid();x.hsfKey=null;if(x.hsfSlot){x.hsfSlot=clone(x.hsfSlot);x.hsfSlot.box[0]+=off;x.hsfSlot.box[1]+=off;if(x.hsfSlot.pts)x.hsfSlot.pts=x.hsfSlot.pts.map(p=>[p[0]+off,p[1]+off]);x.clipPath=clipFrom(slotD(x.hsfSlot));placeInSlot(x);slotControls(x)}};
  const added=[];c.set({left:c.left+off,top:c.top+off});if(c.type==="activeSelection"){c.canvas=canvas;c.forEachObject(x=>{fix(x);canvas.add(x);added.push(x)});c.setCoords()}else{fix(c);canvas.add(c);added.push(c)}
  Promise.all(added.filter(x=>x.hsfSlot).map(x=>syncDecor(canvas,x))).then(()=>{if(c.type==="activeSelection"){canvas.setActiveObject(c)}else canvas.setActiveObject(c);commit();onSel();res(c)})},PROPS))}
dup=function(){const o=sel();if(!o||o.hsfBg)return;cloneInto(o,20)};
function copySel(){const o=sel();if(!o){return false}if(o.hsfBg){toast("The page background can't be copied.");return false}o.clone(c=>{CLIP=c;pasteN=0},PROPS);toast("Copied. Paste with Ctrl+V.");return true}
function cutSel(){if(copySel()){del();toast("Cut. Paste with Ctrl+V.")}}
function pasteClip(){if(!CLIP){toast("Nothing copied yet.");return}pasteN++;cloneInto(CLIP,20*pasteN)}
function selectAll(){endEdit(false);selectList(canvas.getObjects().filter(o=>!o.hsfProxy&&!o.hsfBg&&!isDecor(o)))}

/* ============ layers panel (Canva-style) ============ */
function typeLabel(o){if(o.hsfBg)return"Background";if(o.hsfSlot)return o.hsfUser?"Photo frame":"Empty frame";if(o.type==="textbox")return"Text";if(o.hsfComp)return({logo:"Logo",pill:"Label",footer:"Footer"})[o.hsfComp.kind]||"Component";if(o.hsfIcon)return"Icon";if(o.type==="image")return"Image";if(o.type==="group")return"Group";if(o.type==="path")return"Drawing";if(o.hsfBorderOf)return"Frame border";if(o.hsfMaskOf)return"Brush cut";return"Shape"}
function layerName(o){if(o.hsfName)return o.hsfName;if(o.type==="textbox")return(o.text||"").replace(/\s+/g," ").slice(0,28)||"Text";return typeLabel(o)}
function thumbOf(o){try{if(o.type==="textbox")return null;let src=null;
    if(o.hsfSlot||o.type==="image"){const im=o.getElement&&o.getElement();if(!im)return null;const c=document.createElement("canvas");const k=Math.min(68/(im.naturalWidth||im.width),52/(im.naturalHeight||im.height));c.width=Math.max(1,Math.round((im.naturalWidth||im.width)*k));c.height=Math.max(1,Math.round((im.naturalHeight||im.height)*k));c.getContext("2d").drawImage(im,0,0,c.width,c.height);src=c}
    else{const w=o.getScaledWidth()||1,h=o.getScaledHeight()||1;const k=Math.min(68/w,52/h,1);const v=o.visible;o.visible=true;src=o.toCanvasElement({multiplier:k,enableRetinaScaling:false});o.visible=v}
    return src?src.toDataURL("image/png"):null}catch(e){return null}}
function ib(icon,label,fn,cls){const b=el("button",{type:"button",className:"ib"+(cls?" "+cls:"")});b.innerHTML=UI_ICONS[icon]||"";b.title=label;b.setAttribute("aria-label",label);b.onclick=e=>{e.stopPropagation();fn(e)};b.ondblclick=e=>e.stopPropagation();return b}
let layT=null,dragUnit=null;
function renderLayers(){updLayTools();const pane=document.querySelector('[data-ipane="layers"]');if(!pane||pane.hidden||!canvas)return;clearTimeout(layT);layT=setTimeout(drawLayers,60)}
function drawLayers(){const box=$("layers");if(!box||!canvas)return;const focus=document.activeElement&&box.contains(document.activeElement)&&document.activeElement.dataset.lid;box.innerHTML="";const act=selObjs();const units=unitsList();
  units.slice().reverse().forEach(u=>{const o=u[0];box.appendChild(layerRow(o,act,false));u.slice(1).forEach(c=>box.appendChild(layerRow(c,act,true)))});
  if(!units.length)box.appendChild(el("p",{className:"note",textContent:"This page is empty."}));
  if(focus){const f=box.querySelector(`[data-lid="${focus}"]`);if(f)f.focus()}updLayTools()}
function layerRow(o,act,child){const on=act.includes(o);const d=el("div",{className:"layer"+(child?" child":"")+(o.visible===false?" hid":""),tabIndex:0});d.dataset.lid=o.hsfId||"";d.setAttribute("role","option");d.setAttribute("aria-selected",String(on));
  const th=el("div",{className:"lth"});const t=o.type==="textbox"?null:thumbOf(o);if(t)th.appendChild(el("img",{src:t,alt:""}));else{th.textContent=o.type==="textbox"?"T":"·";if(o.type==="textbox"){th.style.color=typeof o.fill==="string"?o.fill:"";th.style.background="var(--sunk)"}}
  const nm=el("div",{className:"lnm"});nm.append(document.createTextNode(layerName(o)),el("small",{textContent:typeLabel(o)+(o.hsfLock?" · locked":"")}));
  const eye=ib(o.visible===false?"eye-off":"eye",o.visible===false?"Show layer":"Hide layer",()=>{setVis(o,o.visible===false);commit()},o.visible===false?"":"");
  if(child){d.append(th,nm,eye)}
  else{const grip=el("span",{className:"grip"});grip.innerHTML=UI_ICONS["grip-vertical"]||"⋮";grip.title="Drag to reorder";
    const lk=ib(o.hsfLock?"lock":"lock-open",o.hsfLock?"Unlock layer":"Lock layer",()=>{setLock(o,!o.hsfLock);commit()},o.hsfLock?"on":"");
    const rm=o.hsfBg?el("span"):ib("trash-2","Delete layer",()=>deleteObj(o),"danger");d.append(grip,th,nm,eye,lk,rm);
    d.draggable=true;d.ondragstart=e=>{dragUnit=o;d.classList.add("dragging");e.dataTransfer.effectAllowed="move";try{e.dataTransfer.setData("text/hsf-layer",o.hsfId||"x")}catch(_){}};
    d.ondragend=()=>{dragUnit=null;d.classList.remove("dragging");document.querySelectorAll(".layer.dropt,.layer.dropb").forEach(x=>x.classList.remove("dropt","dropb"))};
    d.ondragover=e=>{if(!dragUnit||dragUnit===o)return;e.preventDefault();const r=d.getBoundingClientRect();const top=e.clientY<r.top+r.height/2;d.classList.toggle("dropt",top);d.classList.toggle("dropb",!top)};
    d.ondragleave=()=>d.classList.remove("dropt","dropb");
    d.ondrop=e=>{e.preventDefault();const top=d.classList.contains("dropt");d.classList.remove("dropt","dropb");if(!dragUnit||dragUnit===o)return;
      const units=unitsList();const from=units.findIndex(u=>u[0]===dragUnit);if(from<0)return;const mv=units.splice(from,1)[0];const ti=units.findIndex(u=>u[0]===o);units.splice(top?ti+1:ti,0,mv);applyUnits(units);dragUnit=null}}
  const pick=e=>{if(o.selectable===false||child){toast(o.hsfLock?"This layer is locked. Click its lock icon to unlock.":child?"This is part of the photo frame above. Select the frame to edit it.":"This layer can't be selected.");return}
    if(o.visible===false){toast("Show the layer first (eye icon).");return}
    if(e&&(e.shiftKey||e.ctrlKey||e.metaKey)){const cur=selObjs();selectList(cur.includes(o)?cur.filter(x=>x!==o):[...cur,o])}else{endEdit(false);selectList([o])}};
  d.onclick=pick;d.onkeydown=e=>{if(e.target!==d)return;if(e.key==="Enter"||e.key===" "){e.preventDefault();pick(e)}else if(e.key==="Delete"&&!child){e.preventDefault();e.stopPropagation();deleteObj(o)}
    else if((e.key==="ArrowUp"||e.key==="ArrowDown")&&e.altKey&&!child){e.preventDefault();arrange(e.key==="ArrowUp"?"up":"down",[o])}
    else if(e.key==="ArrowUp"||e.key==="ArrowDown"){e.preventDefault();const s=e.key==="ArrowUp"?d.previousElementSibling:d.nextElementSibling;if(s&&s.focus)s.focus()}};
  if(!child)nm.ondblclick=e=>{e.stopPropagation();const inp=el("input",{type:"text",value:o.hsfName||layerName(o),className:"ren"});inp.setAttribute("aria-label","Layer name");nm.replaceWith(inp);inp.focus();inp.select();
    const done=ok=>{if(ok){o.hsfName=inp.value.trim()||null;commit();if(selObjs().includes(o))renderProps()}else drawLayers()};inp.onkeydown=e=>{e.stopPropagation();if(e.key==="Enter")done(true);if(e.key==="Escape")done(false)};inp.onblur=()=>done(true);inp.onclick=e=>e.stopPropagation()};
  return d}
function updLayTools(){const t=document.querySelector(".laytools");if(!t||!canvas)return;const a=sel();const n=selObjs().length;t.querySelectorAll("[data-lay]").forEach(b=>{const k=b.dataset.lay;
  b.disabled=!n||(k==="group"&&!(a&&a.type==="activeSelection"))||(k==="ungroup"&&!(a&&a.type==="group"&&!a.hsfIcon))||(k==="del"&&a&&a.hsfBg)})}
document.querySelectorAll(".laytools [data-lay]").forEach(b=>b.onclick=()=>{const k=b.dataset.lay;if(k==="dup")dup();else if(k==="group")groupSel();else if(k==="ungroup")ungroupSel();else if(k==="del")del();else arrange(k)});
document.querySelectorAll('[data-itab="layers"]').forEach(b=>b.addEventListener("click",()=>setTimeout(drawLayers,0)));

/* ============ right-click menu ============ */
function closeCM(){const m=$("cmenu");if(m)m.remove()}
function cmItem(icon,label,kbd,fn,dis){const b=el("button",{type:"button",disabled:!!dis});b.setAttribute("role","menuitem");b.innerHTML=(UI_ICONS[icon]||"<span style='width:15px'></span>");b.append(document.createTextNode(label));if(kbd)b.append(el("kbd",{textContent:kbd}));b.onclick=()=>{closeCM();fn()};return b}
function openCM(x,y){closeCM();const m=el("div",{id:"cmenu",className:"cmenu"});m.setAttribute("role","menu");const o=sel();const hr=()=>el("hr");
  if(o){const single=o.type!=="activeSelection";
    m.append(cmItem("copy","Copy","Ctrl+C",copySel,o.hsfBg),cmItem("clipboard-paste","Paste","Ctrl+V",pasteClip,!CLIP),cmItem("copy","Duplicate","Ctrl+D",dup,o.hsfBg),cmItem("scissors","Cut","Ctrl+X",cutSel,o.hsfBg),cmItem("trash-2","Delete","Del",del,o.hsfBg),hr(),
      cmItem("chevrons-up","Bring to front","Ctrl+Shift+]",()=>arrange("front")),cmItem("chevron-up","Bring forward","Ctrl+]",()=>arrange("up")),cmItem("chevron-down","Send backward","Ctrl+[",()=>arrange("down")),cmItem("chevrons-down","Send to back","Ctrl+Shift+[",()=>arrange("back")),hr());
    if(!single)m.append(cmItem("group","Group","Ctrl+G",groupSel));if(single&&o.type==="group"&&!o.hsfIcon)m.append(cmItem("ungroup","Ungroup","Ctrl+Shift+G",ungroupSel));
    if(single&&o.hsfSlot){m.append(cmItem("image-plus",o.hsfUser?"Replace photo…":"Add photo…","",()=>pickPhotoFor(o)));if(o.hsfUser)m.append(cmItem("crop","Adjust photo in frame","Double-click",()=>enterCrop(o)))}
    m.append(cmItem("maximize","Centre on page","",()=>selObjs().length===1?(alignObj(o,"centerH"),alignObj(o,"centerV")):null,!single),
      cmItem("lock","Lock","Ctrl+Shift+L",()=>{selObjs().forEach(x=>setLock(x,true));commit()},o.hsfBg&&single),cmItem("eye-off","Hide","Ctrl+Shift+H",()=>{selObjs().forEach(x=>setVis(x,false));commit()}),hr(),
      cmItem("layers","Show layers","",()=>document.querySelector('[data-itab="layers"]').click()))}
  else m.append(cmItem("clipboard-paste","Paste","Ctrl+V",pasteClip,!CLIP),cmItem("mouse-pointer-2","Select all","Ctrl+A",selectAll),cmItem("layers","Show layers","",()=>document.querySelector('[data-itab="layers"]').click()),hr(),
    cmItem("image-down","Download JPG","",()=>quickSave("jpeg")),cmItem("image-down","Download PNG","",()=>quickSave("png")),cmItem("image-down","Download WebP","",()=>quickSave("webp")));
  document.body.appendChild(m);const r=m.getBoundingClientRect();m.style.left=Math.max(4,Math.min(x,innerWidth-r.width-6))+"px";m.style.top=Math.max(4,Math.min(y,innerHeight-r.height-6))+"px";const f=m.querySelector("button:not(:disabled)");if(f)f.focus();
  m.onkeydown=e=>{const bs=[...m.querySelectorAll("button:not(:disabled)")];const i=bs.indexOf(document.activeElement);if(e.key==="Escape"){e.preventDefault();e.stopPropagation();closeCM()}else if(e.key==="ArrowDown"){e.preventDefault();bs[(i+1)%bs.length].focus()}else if(e.key==="ArrowUp"){e.preventDefault();bs[(i-1+bs.length)%bs.length].focus()}}}
$("stage").addEventListener("contextmenu",e=>{if(!canvas)return;e.preventDefault();let t=canvas.findTarget(e,false);if(t&&t.hsfProxy&&editProxy)t=editProxy.o;
  const cur=selObjs();if(t&&!cur.includes(t)&&t.selectable!==false){endEdit(false);selectList([t])}else if(!t&&cur.length&&!(editProxy&&canvas.getActiveObject()===editProxy.p)){}
  openCM(e.clientX,e.clientY)},true);
document.addEventListener("mousedown",e=>{const m=$("cmenu");if(m&&!m.contains(e.target))closeCM()});
window.addEventListener("blur",closeCM);window.addEventListener("resize",closeCM);

/* ============ keyboard: clipboard, arrange, lock, hide ============ */
document.addEventListener("keydown",e=>{if($("mode-design").hidden||!$("player").hidden||!canvas)return;const tag=(e.target.tagName||"").toLowerCase();if(["input","textarea","select"].includes(tag)||e.target.isContentEditable)return;
  const o=sel();if(o&&o.isEditing)return;const mod=e.ctrlKey||e.metaKey,k=e.key.toLowerCase();if(!mod)return;
  if(k==="s"){e.preventDefault();openDl();return}
  if(k==="c"&&!e.shiftKey){if(o){e.preventDefault();copySel()}return}
  if(k==="x"){if(o){e.preventDefault();cutSel()}return}
  if(k==="v"&&!e.shiftKey){if(CLIP){e.preventDefault();pasteClip()}return}
  if(k==="a"){e.preventDefault();selectAll();return}
  if(e.code==="BracketRight"){e.preventDefault();arrange(e.shiftKey?"front":"up");return}
  if(e.code==="BracketLeft"){e.preventDefault();arrange(e.shiftKey?"back":"down");return}
  if(e.shiftKey&&k==="g"){e.preventDefault();e.stopImmediatePropagation();ungroupSel();return}
  if(e.shiftKey&&k==="l"&&o){e.preventDefault();const v=!o.hsfLock;selObjs().forEach(x=>setLock(x,v));commit();return}
  if(e.shiftKey&&k==="h"&&o){e.preventDefault();selObjs().forEach(x=>setVis(x,false));commit();return}},true);

/* small screens: the library panel overlays the canvas, so start it closed */
(function(){if(window.matchMedia&&matchMedia("(max-width:1180px)").matches){const prev=store.get("hsf-ui-fly");setFly(false);if(prev===null||prev===undefined)store.set("hsf-ui-fly","")}})();

/* Public-safe editorial brief bridge. No ERP/MEAL/child/patient data, no network calls. */
(function(){
  const f=$("m_brief");
  if(f)f.addEventListener("change",async function(){
    const file=f.files&&f.files[0];if(!file)return;
    try{
      if(file.size>30000)throw Error("Design brief exceeds 30 KB. Import only a Communication Hub brief, not participant files.");
      const data=JSON.parse(await file.text());
      if(data.schema!=="hsf-public-design-brief/v1" || !/^(KDI|PSC)-\d{3}$/.test(data.idea_id||""))throw Error("Not a recognized public-safe HSF content-idea brief.");
      if(data.publication_approved!==false || !["KDI","PSC"].includes(data.bank))throw Error("Publication status is invalid.");
      D.meta.idea_id=data.idea_id;
      D.meta.stream=data.bank==="KDI"?"HSF_KNOWLEDGE_AWARENESS":"HSF_IN_ACTION";
      D.meta.family=data.bank==="KDI"?"KNOWLEDGE_DATA_INSIGHT":"FIELD_MOMENT";
      D.meta.project={E4BL:"E4BL",A2PHC:"A2PHC",CAR:"Climate Action & Resilience",CROSS:""}[data.programme]||"";
      D.meta.series=(data.editorial_series||"");
      D.meta.evidence_status="NOT_VERIFIED";D.meta.public_claim_status="NOT_APPROVED";
      D.meta.technical_review="PENDING";D.meta.safeguarding_review="PENDING";D.meta.management_approval="PENDING";
      // Do not copy research propositions as approved statements; headline is editorial draft only.
      const title=String(data.title||"").slice(0,180);
      if(title){setField("headline",title,false)}
      D.content.label="HSF · DRAFT";
      renderContentForm();renderNav();scheduleQA();autosave();
      say("Loaded "+data.idea_id+" as a DRAFT. Verify evidence, consent and all approvals before use.");
    }catch(e){say("Brief import failed: "+e.message,true)}
    finally{f.value=""}
  });
  const clear=$("hsf-clear-private-data");
  if(clear)clear.addEventListener("click",()=>{
    if(!confirm("Delete this browser's saved HSF Design Studio draft, logo and photo library? Export needed designs first."))return;
    const names=["hsf-engine-last","hsf-engine-logo","hsf-engine-photos","hsf-ui-fly","hsf-ui-insp","hsf-ui-pages","hsf-ui-theme"];
    names.forEach(k=>store.del(k));
    // Additional Studio-only browser keys (avoid touching other sites' stored data).
    try{for(let i=localStorage.length-1;i>=0;i--){const key=localStorage.key(i);if(key && (key.startsWith("hsf-engine-")||key.startsWith("hsf-studio-")))localStorage.removeItem(key)}}catch(e){}
    say("Studio browser data cleared. Reload to start a new session.");
    location.reload();
  });
})();
