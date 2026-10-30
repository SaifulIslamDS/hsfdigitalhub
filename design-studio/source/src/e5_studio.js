/* ============ photo library (Canva-style uploads) ============ */
const LIB=[];
function addToLibrary(src){if(LIB.some(x=>x.url===src.url))return;LIB.push(src);renderLib()}
function renderLib(){const box=$("lib");box.innerHTML="";$("libempty").hidden=LIB.length>0;
  LIB.forEach((s,i)=>{const b=el("button",{type:"button",title:`${s.name} · ${s.w}×${s.h}`,draggable:true});b.setAttribute("aria-label","Use photo "+s.name);
    b.append(el("img",{src:s.thumb||s.url,alt:""}),el("span",{textContent:s.name}));
    b.onclick=()=>{const t=sel();placePhoto(t&&t.hsfSlot?t:null,s)};
    b.ondragstart=e=>{e.dataTransfer.setData("text/hsf-lib",String(i));e.dataTransfer.effectAllowed="copy"};box.appendChild(b)})}
async function thumbOfURL(url){const im=await loadImg(url);const k=Math.min(1,220/Math.max(im.width,im.height));const c=document.createElement("canvas");c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext("2d").drawImage(im,0,0,c.width,c.height);return c.toDataURL("image/jpeg",.7)}
const _addLib=addToLibrary;
$("libfiles").addEventListener("change",async e=>{const files=[...e.target.files];e.target.value="";let n=0;for(const f of files){try{const s=await fileToURL(f);s.thumb=await thumbOfURL(s.url);addToLibrary(s);n++}catch(err){}}
  say(n?`${n} photo${n>1?"s":""} added to Photos. Click one to fill the selected frame, or drag it onto a frame.`:"Those files couldn't be opened.",!n)});
/* drop photos (library or files) onto frames */
const scratchCtx=document.createElement("canvas").getContext("2d");
function slotAt(x,y){const objs=canvas.getObjects();for(let i=objs.length-1;i>=0;i--){const o=objs[i];if(!o.hsfSlot||o.visible===false)continue;if(scratchCtx.isPointInPath(new Path2D(slotD(o.hsfSlot)),x,y))return o}return null}
function stagePoint(e){const r=canvas.upperCanvasEl.getBoundingClientRect();return[(e.clientX-r.left-PAD)/zoom,(e.clientY-r.top-PAD)/zoom]}
const stageEl=$("stage");
stageEl.addEventListener("dragover",e=>{if(![...e.dataTransfer.types].some(t=>t==="Files"||t==="text/hsf-lib"))return;e.preventDefault();e.dataTransfer.dropEffect="copy";$("cwrap").classList.add("drop")});
stageEl.addEventListener("dragleave",e=>{if(e.target===stageEl)$("cwrap").classList.remove("drop")});
stageEl.addEventListener("drop",async e=>{e.preventDefault();$("cwrap").classList.remove("drop");const[x,y]=stagePoint(e);const target=slotAt(x,y);
  const li=e.dataTransfer.getData("text/hsf-lib");let src=null;
  if(li!==""){src=LIB[+li]}else if(e.dataTransfer.files.length){const files=[...e.dataTransfer.files].filter(f=>f.type.startsWith("image/"));for(let i=0;i<files.length;i++){try{const s=await fileToURL(files[i]);s.thumb=await thumbOfURL(s.url);addToLibrary(s);if(i===0)src=s}catch(err){}}}
  if(!src){say("Drop a JPG, PNG or WebP photo.",true);return}
  await placePhoto(target,src,[x,y])});

/* ============ collapsible panels ============ */
function setIcon(btn,name){if(!btn)return;const s=btn.querySelector("svg");if(s)s.remove();btn.insertAdjacentHTML("afterbegin",UI_ICONS[name]||"")}
function setFly(open){const f=$("fly");f.classList.toggle("collapsed",!open);setIcon($("flytoggle"),open?"panel-left-close":"panel-left-open");$("flytoggle").lastChild.textContent=open?"Hide":"Show";
  $("flytoggle").setAttribute("aria-label",open?"Collapse library panel":"Expand library panel");if(!open)document.querySelectorAll(".side [data-tab]").forEach(b=>b.setAttribute("aria-pressed","false"));
  else if(![...document.querySelectorAll(".side [data-tab]")].some(b=>b.getAttribute("aria-pressed")==="true")){const p=[...document.querySelectorAll("[data-pane]")].find(x=>!x.hidden);const t=p?p.dataset.pane:"tpl";document.querySelector(`.side [data-tab="${t}"]`).setAttribute("aria-pressed","true")}
  store.set("hsf-ui-fly",open?"1":"0")}
function setInsp(open){const i=$("insp");i.classList.toggle("collapsed",!open);setIcon($("insptoggle"),open?"panel-right-close":"panel-right-open");$("insptoggle").setAttribute("aria-label",open?"Collapse inspector":"Expand inspector");store.set("hsf-ui-insp",open?"1":"0")}
$("flytoggle").onclick=()=>setFly($("fly").classList.contains("collapsed"));
$("flyclose").onclick=()=>setFly(false);
$("insptoggle").onclick=()=>setInsp($("insp").classList.contains("collapsed"));
$("pagetoggle").onclick=()=>{const pb=$("pagebar");pb.classList.toggle("collapsed");$("pagetoggle").setAttribute("aria-expanded",String(!pb.classList.contains("collapsed")));store.set("hsf-ui-pages",pb.classList.contains("collapsed")?"0":"1")};
new ResizeObserver(()=>{if(canvas&&fitMode)fitZoom()}).observe($("stage"));
const _doReset=doReset;doReset=async function(kind){if(kind==="panels"){$("resetpop").hidden=true;setFly(true);setInsp(true);$("pagebar").classList.remove("collapsed");fitZoom();say("Panels reopened.");return}return _doReset(kind)};
document.querySelectorAll("[data-reset]").forEach(b=>b.onclick=()=>doReset(b.dataset.reset));

/* ============ app colours follow HSF palettes ============ */
(function(){const s=$("uitheme");s.appendChild(el("option",{value:"follow",textContent:"Match design palette"}));Object.entries(PALETTES).forEach(([k,p])=>s.appendChild(el("option",{value:k,textContent:p.name})));
  s.value=store.get("hsf-ui-theme")||"follow";s.onchange=()=>{store.set("hsf-ui-theme",s.value);applyUITheme()}})();
const darkMQ=window.matchMedia?matchMedia("(prefers-color-scheme: dark)"):null;
function isDark(){const t=document.documentElement.dataset.theme;return t?t==="dark":!!(darkMQ&&darkMQ.matches)}
function applyUITheme(){const k=$("uitheme").value==="follow"?D.palette:$("uitheme").value;const p=PALETTES[k]||PALETTES.evergreen;const r=document.documentElement.style;
  r.setProperty("--brand",p.primary);r.setProperty("--brand-deep",p.deep);r.setProperty("--brand-2",p.secondary);r.setProperty("--brand-soft",isDark()?rgba(p.primary,.22):p.soft);
  if(window.fabric){fabric.Object.prototype.set({cornerColor:p.primary,borderColor:p.primary});if(canvas){canvas.getObjects().forEach(o=>o.set({cornerColor:p.primary,borderColor:p.primary}));canvas.requestRenderAll()}}}
if(darkMQ&&darkMQ.addEventListener)darkMQ.addEventListener("change",applyUITheme);
new MutationObserver(applyUITheme).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});
const _setPalette=setPalette;setPalette=async function(k){await _setPalette(k);applyUITheme()};

/* ============ boot ============ */
(async function boot(){
  document.querySelectorAll("[data-icon]").forEach(b=>{const s=UI_ICONS[b.dataset.icon];if(s)b.insertAdjacentHTML("afterbegin",s)});
  try{await Promise.all(["400 20px Poppins","600 20px Poppins","700 20px Poppins","italic 400 20px Poppins","400 20px 'Playfair Display'","italic 400 20px 'Playfair Display'","700 20px 'Playfair Display'","400 20px 'Hind Siliguri'","600 20px 'Hind Siliguri'","700 20px 'Hind Siliguri'"].map(f=>document.fonts.load(f,"Aa অআ")))}catch(e){}
  if(typeof fabric==="undefined"){$("savemsg").textContent="The editor library didn't load. Check your connection, or use the offline version.";return}
  setupCanvas();renderPalBar();$("typeset").value=D.type;buildSizes();buildIcons();renderLogoPrev();buildVideoSel();renderNav();renderLib();applyUITheme();
  if(store.get("hsf-ui-fly")==="0")setFly(false);if(store.get("hsf-ui-insp")==="0")setInsp(false);if(store.get("hsf-ui-pages")==="0")$("pagebar").classList.add("collapsed");
  await loadArch("facebook",PLATFORMS.facebook.formats[0],"editorial_photo_story");renderTplArea();
  if(store.get("hsf-engine-last"))$("restore").hidden=false;
})();
