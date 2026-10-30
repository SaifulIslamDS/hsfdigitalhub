/* rectangles have no stroke by default, so fills sit exactly on whole pixels (no half-pixel edge) */
if(window.fabric){fabric.Rect.prototype.strokeWidth=0}
/* ============ state & utils ============ */
const PROPS=["hsfId","hsfKey","hsfName","hsfRole","hsfStrokeRole","hsfGrad","hsfFont","hsfBind","hsfFit","hsfFlow","hsfSlot","hsfUser","hsfComp","hsfBorderOf","hsfMaskOf","hsfBrush",
  "hsfAnim","hsfDef","hsfLock","hsfIcon","hsfBg","hsfCluster","selectable","evented","lockMovementX","lockMovementY","lockRotation","lockScalingX","lockScalingY","hasControls","globalCompositeOperation","hsfEditPts"];
const D={name:"Design",cat:"social",platform:"facebook",fmt:"feed_4x5",w:1080,h:1350,palette:"evergreen",type:"stack",content:{},meta:{stream:"HSF_IN_ACTION",code:"",idea_id:"",family:"FIELD_MOMENT",series:"",project:"",evidence_status:"NOT_VERIFIED",public_claim_status:"NOT_APPROVED",technical_review:"PENDING",safeguarding_review:"PENDING",management_approval:"PENDING",consent:"Not checked",review:""},pages:[],cur:0,guides:[],budget:null};
const $=id=>document.getElementById(id);
let canvas,zoom=1,fitMode=true,loading=false,hist=[],hi=-1,logoURL=null,downloads=null,tool="select";
(async()=>{try{downloads=await window.claude?.use?.("downloads")}catch(e){downloads=null}})();
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v);return true}catch(e){return false}},del(k){try{localStorage.removeItem(k)}catch(e){}}};
logoURL=store.get("hsf-engine-logo");
const uid=()=>"o"+Math.random().toString(36).slice(2,9);
const clone=o=>JSON.parse(JSON.stringify(o));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function roleColor(v){if(!v)return"";if(v==="black")return"#000000";const p=PALETTES[D.palette];return p[v]||v}
function rgba(hex,a){const h=roleColor(hex);if(!/^#/.test(h))return h;const n=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));return`rgba(${n.join(",")},${a})`}
function fontFor(role){return(TYPESETS[D.type]||TYPESETS.stack)[role]||TYPESETS.stack.body}
function loadImg(url){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=url})}
function pageContent(p){p=p||D.pages[D.cur];return{...DEFAULT_CONTENT,...D.content,...(p?p.content:{})}}
function resolveBind(b,c){return String(b).replace(/\{(\w+)\}/g,(_,k)=>c[k]??"")}

/* ============ geometry: SVG path strings ============ */
const r2=n=>Math.round(n*100)/100;
function rectD(x,y,w,h,r){r=Math.max(0,Math.min(r||0,w/2,h/2));if(!r)return`M${r2(x)} ${r2(y)}H${r2(x+w)}V${r2(y+h)}H${r2(x)}Z`;
  return`M${r2(x+r)} ${r2(y)}H${r2(x+w-r)}A${r2(r)} ${r2(r)} 0 0 1 ${r2(x+w)} ${r2(y+r)}V${r2(y+h-r)}A${r2(r)} ${r2(r)} 0 0 1 ${r2(x+w-r)} ${r2(y+h)}H${r2(x+r)}A${r2(r)} ${r2(r)} 0 0 1 ${r2(x)} ${r2(y+h-r)}V${r2(y+r)}A${r2(r)} ${r2(r)} 0 0 1 ${r2(x+r)} ${r2(y)}Z`}
function ellipseD(x,y,w,h){const rx=w/2,ry=h/2,cx=x+rx,cy=y+ry;return`M${r2(cx-rx)} ${r2(cy)}A${r2(rx)} ${r2(ry)} 0 1 0 ${r2(cx+rx)} ${r2(cy)}A${r2(rx)} ${r2(ry)} 0 1 0 ${r2(cx-rx)} ${r2(cy)}Z`}
function archD(x,y,w,h){const R=Math.min(w/2,h);return`M${r2(x)} ${r2(y+h)}V${r2(y+R)}A${r2(w/2)} ${r2(R)} 0 0 1 ${r2(x+w)} ${r2(y+R)}V${r2(y+h)}Z`}
function quarterD(x,y,w,h,R,r){R=Math.min(R,w-r,h-r);return`M${r2(x)} ${r2(y+R)}A${r2(R)} ${r2(R)} 0 0 1 ${r2(x+R)} ${r2(y)}H${r2(x+w-r)}Q${r2(x+w)} ${r2(y)} ${r2(x+w)} ${r2(y+r)}V${r2(y+h-r)}Q${r2(x+w)} ${r2(y+h)} ${r2(x+w-r)} ${r2(y+h)}H${r2(x+r)}Q${r2(x)} ${r2(y+h)} ${r2(x)} ${r2(y+h-r)}Z`}
function polyD(pts,r){const n=pts.length;if(n<3)return"";let d="";for(let i=0;i<n;i++){const p=pts[(i-1+n)%n],c=pts[i],q=pts[(i+1)%n];
  if(!r){d+=(i?"L":"M")+r2(c[0])+" "+r2(c[1]);continue}
  const v1=[p[0]-c[0],p[1]-c[1]],v2=[q[0]-c[0],q[1]-c[1]];const l1=Math.hypot(...v1)||1,l2=Math.hypot(...v2)||1;const k1=Math.min(r,l1/2)/l1,k2=Math.min(r,l2/2)/l2;
  const a=[c[0]+v1[0]*k1,c[1]+v1[1]*k1],b=[c[0]+v2[0]*k2,c[1]+v2[1]*k2];d+=(i?"L":"M")+r2(a[0])+" "+r2(a[1])+"Q"+r2(c[0])+" "+r2(c[1])+" "+r2(b[0])+" "+r2(b[1])}return d+"Z"}
function regularPts(x,y,w,h,n,rot=-90,inner=0){const pts=[];const cx=x+w/2,cy=y+h/2;const N=inner?n*2:n;for(let i=0;i<N;i++){const a=(rot+i*360/N)*Math.PI/180;const k=inner&&i%2?inner:1;pts.push([cx+Math.cos(a)*w/2*k,cy+Math.sin(a)*h/2*k])}return pts}
function bboxPts(pts){const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);const x=Math.min(...xs),y=Math.min(...ys);return[x,y,Math.max(...xs)-x,Math.max(...ys)-y]}
function slotD(sl,inset=0){const[x0,y0,w0,h0]=sl.box;const x=x0+inset,y=y0+inset,w=Math.max(2,w0-2*inset),h=Math.max(2,h0-2*inset);
  switch(sl.shape){case"ellipse":return ellipseD(x,y,w,h);case"arch":return archD(x,y,w,h);
    case"quarter":return quarterD(x,y,w,h,(sl.R||.8)*Math.min(w,h),Math.max(0,(sl.r||22)-inset));
    case"poly":{let pts=sl.pts;if(inset){const[bx,by,bw,bh]=sl.box;const cx=bx+bw/2,cy=by+bh/2,kx=(bw-2*inset)/bw,ky=(bh-2*inset)/bh;pts=pts.map(p=>[cx+(p[0]-cx)*kx,cy+(p[1]-cy)*ky])}return polyD(pts,Math.max(0,(sl.r||0)-inset))}
    default:return rectD(x,y,w,h,Math.max(0,(sl.r||0)-inset))}}
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function brushURL(w,h,d,color,width,seed){const c=document.createElement("canvas");c.width=Math.max(2,Math.ceil(w));c.height=Math.max(2,Math.ceil(h));const ctx=c.getContext("2d");
  const path=new Path2D(d),r=rng(seed||7);ctx.strokeStyle=color;ctx.lineJoin="round";ctx.lineCap="round";ctx.lineWidth=width*.62;ctx.stroke(path);
  for(let i=0;i<9;i++){ctx.save();ctx.translate((r()-.5)*width*.55,(r()-.5)*width*.55);ctx.lineWidth=width*(.12+r()*.34);ctx.globalAlpha=.5+r()*.5;ctx.setLineDash([18+r()*110,3+r()*16]);ctx.lineDashOffset=r()*200;ctx.stroke(path);ctx.restore()}
  return c.toDataURL("image/png")}

/* stack IMAGE_PLACEHOLDER: grey surface, X guide, focal ring, “DROP HSF PHOTO HERE” */
function placeholderEl(w,h,label){const k=Math.min(1,760/Math.max(w,h));const c=document.createElement("canvas");c.width=Math.max(2,Math.round(w*k));c.height=Math.max(2,Math.round(h*k));const x=c.getContext("2d");const W=c.width,H=c.height;
  x.fillStyle="#DCE3DF";x.fillRect(0,0,W,H);x.strokeStyle="rgba(151,164,157,.55)";x.lineWidth=Math.max(1,2*k);x.beginPath();x.moveTo(0,0);x.lineTo(W,H);x.moveTo(W,0);x.lineTo(0,H);x.stroke();
  x.strokeStyle="rgba(255,255,255,.75)";x.lineWidth=Math.max(1.5,4*k);x.beginPath();x.arc(W*.5,H*.48,Math.min(W,H)*.10,0,Math.PI*2);x.stroke();
  const fs=Math.max(9,Math.min(W,H)*.035*1.15);x.fillStyle="#5F6B65";x.font=`700 ${fs}px Arial, sans-serif`;x.textAlign="center";x.textBaseline="middle";
  x.fillText((label||"DROP HSF PHOTO HERE").toUpperCase(),W/2,H*.68);x.font=`400 ${fs*.72}px Arial, sans-serif`;x.fillText("Double-click to add a photo",W/2,H*.68+fs*1.3);return c}
function clipFrom(d){return new fabric.Path(d,{absolutePositioned:true,fill:"#000",strokeWidth:0,objectCaching:false})}
function placeInSlot(o){const sl=o.hsfSlot;const[bx,by,bw,bh]=sl.box;const iw=o.width,ih=o.height;const z=o.hsfUser?(sl.zoom||1):1;
  const s=Math.max(bw/iw,bh/ih)*z,sw=iw*s,sh=ih*s;const f=o.hsfUser?(sl.focal||[.5,.5]):[.5,.5];
  let ox=bx+bw/2-f[0]*sw,oy=by+bh/2-f[1]*sh;ox=Math.min(bx,Math.max(bx+bw-sw,ox));oy=Math.min(by,Math.max(by+bh-sh,oy));
  o.set({scaleX:s,scaleY:s,left:ox,top:oy,angle:0,flipX:false,flipY:false});o.setCoords()}
function slotControls(o){o.set({lockRotation:true,perPixelTargetFind:true,lockMovementX:false,lockMovementY:false,lockScalingX:false,lockScalingY:false});o.setControlsVisibility({mt:false,mb:false,ml:false,mr:false,mtr:false})}

/* ============ object factory ============ */
function textSpec(bind,x,yBase,w,size,o={}){return{t:"text",bind,x,y:yBase-size*.93,w,size,...o}}
async function mk(s,content){const c=content||pageContent();let o,extra=[];
  switch(s.t){
    case"bg":o=new fabric.Rect({left:0,top:0,width:s.w,height:s.h,hsfRole:s.role||"light",hsfBg:true,hsfName:"Background",lockMovementX:true,lockMovementY:true,hoverCursor:"default"});break;
    case"rect":o=new fabric.Rect({left:s.x,top:s.y,width:s.w,height:s.h,rx:s.rx||0,ry:s.rx||0,hsfRole:s.fill?null:(s.role||"primary"),fill:s.fill?roleColor(s.fill):undefined,opacity:s.opacity??1,hsfName:s.name||"Box",
      hsfStrokeRole:s.stroke||null,strokeWidth:s.sw||0,strokeDashArray:s.dash||null});break;
    case"path":o=new fabric.Path(s.d,{hsfRole:s.role||null,fill:s.role?undefined:(s.fill||""),hsfStrokeRole:s.stroke||null,strokeWidth:s.sw||0,opacity:s.opacity??1,hsfName:s.name||"Path",strokeLineCap:"round",strokeLineJoin:"round",strokeDashArray:s.dash||null});
      if(!s.role)o.set("fill",s.fill||"");break;
    case"ellipse":o=new fabric.Ellipse({left:s.x,top:s.y,rx:s.w/2,ry:s.h/2,hsfRole:s.ring?null:(s.role||"primary"),fill:s.ring?"rgba(0,0,0,0)":undefined,hsfStrokeRole:s.ring?(s.stroke||"primary"):(s.stroke||null),strokeWidth:s.sw||0,opacity:s.opacity??1,hsfName:s.name||(s.ring?"Ring":"Ellipse")});break;
    case"poly":o=new fabric.Polygon(s.pts.map(p=>({x:p[0],y:p[1]})),{hsfRole:s.role||"primary",opacity:s.opacity??1,hsfStrokeRole:s.stroke||null,strokeWidth:s.sw||0,hsfName:s.name||"Polygon",objectCaching:false});break;
    case"line":o=new fabric.Line([s.x1,s.y1,s.x2,s.y2],{hsfStrokeRole:s.role||"primary",strokeWidth:s.sw||4,strokeLineCap:"round",opacity:s.opacity??1,hsfName:s.name||"Line"});break;
    case"text":{const txt=s.bind?resolveBind(s.bind,c):(s.text||"");
      o=new fabric.Textbox(txt,{left:s.x,top:s.y,width:s.w,fontSize:s.size,fontFamily:fontFor(s.font||"body"),hsfFont:s.font||"body",fontWeight:s.weight||400,fontStyle:s.italic?"italic":"normal",
        textAlign:s.align||"left",lineHeight:s.lh||1.18,hsfRole:s.role||"ink",opacity:s.opacity??1,charSpacing:s.cs||0,hsfBind:s.bind||null,hsfFit:s.max?{max:s.max,base:s.size}:null,
        hsfFlow:s.flow||null,hsfName:s.name||null,splitByGrapheme:false});break}
    case"slot":{const sl={shape:s.shape||"rect",box:s.box.slice(),r:s.r||0,R:s.R,pts:s.pts?clone(s.pts):null,label:s.label||"DROP HSF PHOTO HERE",focal:s.focal||[.5,.5],zoom:1,border:s.border?clone(s.border):null,mask:!!s.mask};
      if(sl.shape==="poly"&&!sl.pts)sl.pts=regularPts(...sl.box,6);
      const el=placeholderEl(sl.box[2],sl.box[3],sl.label);o=new fabric.Image(el,{hsfSlot:sl,hsfUser:false,hsfName:s.name||("Photo frame"+(s.label&&s.label!=="DROP HSF PHOTO HERE"?" · "+s.label:""))});
      o.clipPath=clipFrom(slotD(sl));placeInSlot(o);slotControls(o);break}
    case"icon":o=await iconObj(s.name,s);break;
    case"logo":o=await buildLogo(s);break;
    case"pill":o=buildPill(s,c);break;
    case"motif":{const a=new fabric.Circle({left:0,top:0,radius:s.r,originX:"center",originY:"center",fill:"",strokeWidth:Math.max(2,s.r*.06)}),b=new fabric.Circle({left:0,top:0,radius:s.r*.62,originX:"center",originY:"center",fill:"",strokeWidth:Math.max(1,s.r*.02)});
      o=new fabric.Group([a,b],{left:s.cx,top:s.cy,originX:"center",originY:"center",opacity:s.opacity??.2,hsfStrokeRole:s.role||"primary",hsfName:"Motif circles"});break}
    case"grad":o=new fabric.Rect({left:s.x,top:s.y,width:s.w,height:s.h,hsfGrad:{c1:s.c1||"black",c2:s.c2||s.c1||"black",a1:s.a1??0,a2:s.a2??.76,angle:s.angle??180,mid:s.mid??.5},hsfName:s.name||"Gradient overlay"});break;
  }
  if(!o)return[];
  o.hsfId=uid();if(s.key)o.hsfKey=s.key;if(s.anim)o.hsfAnim=s.anim;if(s.cluster)o.hsfCluster=s.cluster;
  const def=clone(s);o.hsfDef=def;
  if(s.t==="slot"){extra=await slotDecor(o)}
  return[o,...extra];
}
async function slotDecor(o){const sl=o.hsfSlot,out=[];
  if(sl.border&&sl.border.style!=="none"){const b=await borderObj(o);if(b)out.push(b)}
  if(sl.mask){const im=await loadImg(MASK);const[x,y,w,h]=sl.box;out.push(new fabric.Image(im,{left:x,top:y,scaleX:w/im.width,scaleY:h/im.height,globalCompositeOperation:"destination-out",selectable:false,evented:false,hsfMaskOf:o.hsfId,hsfName:"Brush cut (frame)"}))}
  return out}
async function borderObj(o){const sl=o.hsfSlot,b=sl.border;if(!b||b.style==="none")return null;const inset=b.inset??b.width/2;const d=slotD(sl,inset);const col=roleColor(b.color||"primary");let r;
  if(b.style==="brush"){const im=await loadImg(brushURL(D.w,D.h,d,col,b.width,b.seed||7));r=new fabric.Image(im,{left:0,top:0})}
  else r=new fabric.Path(d,{fill:"",stroke:col,strokeWidth:b.width,strokeDashArray:b.style==="dash"?[b.width*2.2,b.width*1.4]:null,strokeLineJoin:"round"});
  r.set({selectable:false,evented:false,hsfBorderOf:o.hsfId,hsfName:"Frame border",objectCaching:false});return r}
function iconObj(name,s){return new Promise(res=>{const svg=(ICONS[name]||ICONS.star).replace(/currentColor/g,"#000000");
  fabric.loadSVGFromString(svg,(objs,op)=>{const g=fabric.util.groupSVGElements(objs,op);const k=(s.size||96)/24;
    g.set({left:s.x,top:s.y,scaleX:k,scaleY:k,hsfIcon:name,hsfStrokeRole:s.role||"primary",hsfName:"Icon · "+name,opacity:s.opacity??1});res(g)})})}
/* LOGO_COMPONENT_SLOT: square tile that sits on the image surface */
async function buildLogo(s){const z=s.size,parts=[];const rad=z*(s.radius??.12),pad=z*(s.pad??.13);const tile=s.tile!==false,shadow=s.shadow!==false;
  if(tile&&shadow)parts.push(new fabric.Rect({left:4,top:6,width:z,height:z,rx:rad,ry:rad,fill:"rgba(0,0,0,.10)"}));
  if(tile)parts.push(new fabric.Rect({left:0,top:0,width:z,height:z,rx:rad,ry:rad,hsfRole:s.tileColor||"light",stroke:"#D7DDD9",strokeWidth:Math.max(1,z*.012)}));
  const ip=tile?pad:0,iz=z-2*ip;
  if(logoURL){const im=await loadImg(logoURL);const k=Math.min(iz/im.width,iz/im.height);parts.push(new fabric.Image(im,{left:ip+(iz-im.width*k)/2,top:ip+(iz-im.height*k)/2,scaleX:k,scaleY:k}))}
  else{parts.push(new fabric.Rect({left:ip,top:ip,width:iz,height:iz,rx:z*.10,ry:z*.10,hsfRole:"soft",hsfStrokeRole:"primary",strokeWidth:Math.max(1,z*.016),strokeDashArray:[z*.055,z*.04]}));
    parts.push(new fabric.Text("HSF",{left:z/2,top:z*.43,originX:"center",originY:"center",fontSize:z*.23,fontWeight:700,fontFamily:"Arial, sans-serif",hsfRole:"primary"}));
    parts.push(new fabric.Text("LOGO SLOT",{left:z/2,top:z*.66,originX:"center",originY:"center",fontSize:z*.08,fontWeight:700,fontFamily:"Arial, sans-serif",hsfRole:"muted"}))}
  const g=new fabric.Group(parts,{left:s.x,top:s.y,hsfComp:{kind:"logo",...clone(s),x:s.x,y:s.y,hasLogo:!!logoURL},hsfName:logoURL?"Logo tile":"Logo slot (placeholder)"});
  applyRolesTo(parts);return g}
function measureText(t,size,weight,family){const c=fabric.util.createCanvasElement().getContext("2d");c.font=`${weight||700} ${size}px ${family}`;return c.measureText(t).width}
function buildPill(s,c){const txt=s.bind?resolveBind(s.bind,c||pageContent()):(s.text||"Label");const h=s.h,fs=s.size||h*.34,fam=fontFor("head");
  const w=Math.max(s.minW||h*2.2,measureText(txt,fs,700,fam)+h*1.1);const left=s.anchor==="right"?s.x-w:s.anchor==="center"?s.x-w/2:s.x;
  const r=new fabric.Rect({left:0,top:0,width:w,height:h,rx:Math.min(h/2,s.radius??h/2),ry:Math.min(h/2,s.radius??h/2),hsfRole:s.role||"primary"});
  const t=new fabric.Text(txt,{left:w/2,top:h/2,originX:"center",originY:"center",fontSize:fs,fontWeight:700,fontFamily:fam,hsfFont:"head",hsfRole:s.textRole||"light"});
  applyRolesTo([r,t]);return new fabric.Group([r,t],{left,top:s.y,hsfComp:{kind:"pill",...clone(s)},hsfBind:s.bind||null,hsfName:s.name||(s.bind==="{cta}"?"CTA button":"Label pill")})}

/* ============ layouts: 14 archetypes (ported from hsf_story_engine.py) ============
   Changes vs. the Python masters, so layouts hold up when content changes:
   · type scales with min(width, height×1.3) so wide covers and slides stay legible
   · body copy flows below the headline instead of a fixed baseline (no overlap)
   · label pills size to their text
   · journey bands follow the rounded photo corners */
function U(w,h){return Math.min(w,h*(w/h>3?2.2:1.3))}
function pillH(w,h,minPx,f){return Math.max(Math.min(minPx,U(w,h)*.06),h*f)}
function footerSpecs(w,h){const u=U(w,h),m=w*.055,y=h-Math.max(30,u*.0667);return[
  {t:"rect",x:m,y:y-Math.max(16,u*.0315),w:w-2*m,h:Math.max(1.5,u*.0014),role:"secondary",opacity:.45,name:"Footer rule",cluster:"footer"},
  textSpec("{org}",m,y,w*.42,Math.max(13,u*.019),{weight:700,role:"primary",font:"head",name:"Footer · organisation",cluster:"footer"}),
  textSpec("{website}",w/2-w*.15,y,w*.30,Math.max(12,u*.017),{role:"ink",align:"center",name:"Footer · website",cluster:"footer"}),
  textSpec("{tagline}",w-m-w*.30,y,w*.30,Math.max(12,u*.016),{role:"muted",italic:true,align:"right",name:"Footer · tagline",cluster:"footer"})]}
const logoS=(x,y,size)=>({t:"logo",x,y,size,key:"logo"});
const pillS=(xr,y,h,bind="{label}",role="primary")=>({t:"pill",x:xr,y,h,anchor:"right",bind,role,key:"label"});
const slotS=(x,y,w,h,o={})=>({t:"slot",shape:"rect",box:[x,y,w,h],...o});
const flow=(after,gap)=>({after,gap});
const LAYOUT={
 editorial_photo_story(w,h){const u=U(w,h),ph=h/w>1.15?h*.64:h*.58,ls=Math.min(w,h)*.105,m=w*.052;return[
  {t:"bg",w,h,role:"light"},slotS(0,0,w,ph,{key:"photo1",name:"Hero photo"}),{t:"motif",cx:w*.88,cy:h*.09,r:Math.min(w,h)*.095,opacity:.18},
  logoS(m,h*.045,ls),pillS(w-m,h*.05,pillH(w,h,48,.042)),{t:"rect",x:0,y:ph,w,h:h-ph,role:"light",name:"Story panel"},
  textSpec("{headline}",m,ph+h*.075,w-2*m,u*.043,{weight:700,font:"head",max:3,key:"headline",name:"Headline"}),
  textSpec("{body}",m,ph+h*.105,w-2*m,u*.024,{max:4,lh:1.28,key:"body",name:"Body",flow:flow("headline",u*.016)}),...footerSpecs(w,h)]},
 human_moment(w,h){const u=U(w,h),ls=Math.min(w,h)*.095,m=w*.05,gy=h*.56;return[
  {t:"bg",w,h,role:"deep"},slotS(0,0,w,h,{key:"photo1",focal:[.5,.45],name:"Full-frame photo"}),{t:"grad",x:0,y:gy,w,h:h-gy,c1:"black",a1:0,a2:.76,angle:180,name:"Bottom shade"},
  logoS(m,m,ls),pillS(w-m,m,pillH(w,h,48,.04)),
  textSpec("{headline}",m,h*.76,w*.78,u*.050,{weight:700,font:"head",role:"light",max:3,key:"headline",name:"Headline"}),
  textSpec("{body}",m,h*.875,w*.82,u*.022,{role:"light",max:2,lh:1.25,key:"body",name:"Body",flow:flow("headline",u*.014)}),
  textSpec("{website}",w-m-w*.4,h-m,w*.4,Math.max(11,u*.018),{role:"light",align:"right",name:"Website"})]},
 field_story(w,h){const u=U(w,h),m=w*.05,ph=h*.69,ls=Math.min(w,h)*.10,bs=Math.min(w*.11,u*.11);return[
  {t:"bg",w,h,role:"soft"},slotS(0,0,w,ph,{key:"photo1",name:"Field photo"}),{t:"rect",x:0,y:ph*.72,w,h:ph*.28,role:"deep",opacity:.70,name:"Context band"},
  logoS(m,m,ls),pillS(w-m,m,pillH(w,h,46,.038)),
  textSpec("{location} · {date}",m,ph*.85,w-2*m,u*.022,{weight:700,role:"light",font:"head",max:1,key:"where",name:"Location · date"}),
  {t:"rect",x:0,y:ph,w,h:h-ph,role:"light",name:"Story panel"},
  textSpec("{headline}",m,ph+h*.07,w*.72,u*.040,{weight:700,font:"head",max:2,key:"headline",name:"Headline"}),
  textSpec("{body}",m,ph+h*.15,w-2*m,u*.022,{max:3,lh:1.26,key:"body",name:"Body",flow:flow("headline",u*.014)}),
  {t:"rect",x:w-m-bs,y:ph+h*.055,w:bs,h:bs,rx:u*.018,role:"soft",name:"Stream badge",cluster:"badge"},
  textSpec(null,w-m-bs,ph+h*.055+bs*.5+u*.017*.36,bs,u*.017,{text:"HSF",weight:700,role:"primary",align:"center",font:"head",name:"Stream badge text",cluster:"badge"}),...footerSpecs(w,h)]},
 evidence_story(w,h){const u=U(w,h),m=w*.05,ih=h*.75,cw=Math.min(w*.78,u*.9),ch=h*.25,cx=(w-cw)/2,cy=ih-ch*.45,ls=Math.min(w,h)*.09;return[
  {t:"bg",w,h,role:"light"},slotS(0,0,w,ih,{key:"photo1",name:"Photo"}),{t:"motif",cx:w*.88,cy:h*.08,r:Math.min(w,h)*.08,opacity:.18},
  logoS(m,m,ls),pillS(w-m,m,pillH(w,h,44,.036)),
  {t:"rect",x:cx+5,y:cy+8,w:cw,h:ch,rx:u*.025,role:"black",opacity:.12,name:"Card shadow",cluster:"card"},{t:"rect",x:cx,y:cy,w:cw,h:ch,rx:u*.025,role:"light",name:"Evidence card",cluster:"card"},
  textSpec("{stat}",cx+cw*.08,cy+ch*.47,cw*.84,u*.085,{weight:700,role:"primary",font:"head",max:1,key:"stat",name:"Figure",cluster:"card"}),
  textSpec("{stat_label}",cx+cw*.08,cy+ch*.68,cw*.78,u*.025,{weight:700,max:2,key:"stat_label",name:"Figure label",cluster:"card",flow:flow("stat",u*.006)}),
  textSpec("{headline}",m,h*.91,w*.74,u*.029,{weight:700,font:"head",max:2,key:"headline",name:"Headline"}),
  textSpec("{source}",w-m-w*.5,h-m*.65,w*.5,Math.max(11,u*.015),{role:"muted",align:"right",key:"source",name:"Source"})]},
 quote_story(w,h){const u=U(w,h),m=w*.05,ph=h*.62,ls=Math.min(w,h)*.09;return[
  {t:"bg",w,h,role:"soft"},slotS(0,0,w,ph,{key:"photo1",focal:[.5,.45],name:"Portrait photo"}),logoS(m,m,ls),pillS(w-m,m,pillH(w,h,44,.036)),
  {t:"rect",x:0,y:ph,w,h:h-ph,role:"light",name:"Quote panel"},
  textSpec(null,m,ph+h*.085,u*.1,u*.090,{text:"“",font:"quote",role:"secondary",opacity:.75,name:"Quote mark"}),
  textSpec("{quote}",m+u*.06,ph+h*.075,w*.82,u*.035,{weight:700,font:"head",max:4,lh:1.22,key:"quote",name:"Quote"}),
  textSpec("{project} · {website}",m+u*.06,h*.91,w*.8,Math.max(12,u*.017),{role:"muted",key:"attrib",name:"Attribution",flow:flow("quote",u*.03)})]},
 photo_essay(w,h){const u=U(w,h),m=w*.045,g=w*.012,ah=h*.70,lw=w*.60-g/2,rw=w-lw-g,ls=Math.min(w,h)*.085;return[
  {t:"bg",w,h,role:"light"},slotS(0,0,lw,ah,{key:"photo1",name:"Photo 1"}),slotS(lw+g,0,rw,ah*.49,{key:"photo2",name:"Photo 2"}),slotS(lw+g,ah*.49+g,rw,ah*.51-g,{key:"photo3",name:"Photo 3"}),
  logoS(m,m,ls),pillS(w-m,m,pillH(w,h,44,.034)),{t:"rect",x:0,y:ah,w,h:h-ah,role:"light",name:"Story panel"},
  textSpec("{headline}",m,ah+h*.065,w*.74,u*.038,{weight:700,font:"head",max:2,key:"headline",name:"Headline"}),
  textSpec("{body}",m,ah+h*.145,w-2*m,u*.021,{max:3,lh:1.25,key:"body",name:"Body",flow:flow("headline",u*.014)}),...footerSpecs(w,h)]},
 before_during_after(w,h){const u=U(w,h),m=w*.045,g=w*.014,top=h*.12,bot=h*.24,ch=h-top-bot,cw=(w-2*m-2*g)/3,out=[{t:"bg",w,h,role:"soft"}];
  ["BEFORE","DURING","AFTER"].forEach((L,i)=>{const x=m+i*(cw+g);out.push(slotS(x,top,cw,ch,{r:u*.015,key:"photo"+(i+1),name:"Photo · "+L.toLowerCase()}));
    out.push({t:"pill",x:x+u*.012,y:top+u*.012,h:u*.045,anchor:"left",text:L,role:"deep",size:u*.014,minW:cw*.48,name:"Stage label · "+L.toLowerCase()})});
  out.push(textSpec("{headline}",m,h*.075,w*.68,u*.038,{weight:700,font:"head",max:2,key:"headline",name:"Headline"}),pillS(w-m,h*.035,pillH(w,h,42,.032)),
    textSpec("{body}",m,h-bot+h*.05,w-2*m,u*.021,{max:3,lh:1.25,key:"body",name:"Body"}),...footerSpecs(w,h));return out},
 event_story(w,h){const u=U(w,h),m=w*.05,ph=h*.68,ls=Math.min(w,h)*.095;return[
  {t:"bg",w,h,role:"light"},slotS(0,0,w,ph,{key:"photo1",name:"Event photo"}),{t:"rect",x:0,y:ph*.64,w,h:ph*.36,role:"deep",opacity:.78,name:"Event band"},
  logoS(m,m,ls),pillS(w-m,m,pillH(w,h,44,.036)),
  textSpec("{headline}",m,ph*.78,w*.78,u*.045,{weight:700,font:"head",role:"light",max:3,key:"headline",name:"Headline"}),
  textSpec("{date} · {location}",m,ph*.92,w-2*m,u*.020,{weight:700,role:"light",max:1,key:"when",name:"Date · location",flow:flow("headline",u*.012)}),
  textSpec("{body}",m,ph+h*.075,w-2*m,u*.022,{max:3,lh:1.28,key:"body",name:"Body"}),...footerSpecs(w,h)]},
 institutional_memory(w,h){const u=U(w,h),m=w*.05,top=h*.10,ph=h*.59,g=w*.012,half=(w-g)/2,ls=Math.min(w,h)*.09,bt=u*.034;return[
  {t:"bg",w,h,role:"light"},slotS(0,top,half,ph,{key:"photo1",label:"THEN · ARCHIVE PHOTO",name:"Then photo"}),slotS(half+g,top,half,ph,{key:"photo2",label:"NOW · CURRENT PHOTO",name:"Now photo"}),
  logoS(m,h*.028,ls),pillS(w-m,h*.036,pillH(w,h,44,.034)),
  {t:"rect",x:w*.12,y:top+ph-bt/2,w:w*.76,h:bt,rx:bt/2,role:"primary",name:"Timeline bar",cluster:"timeline"},
  {t:"ellipse",x:w*.25-u*.012,y:top+ph-u*.012,w:u*.024,h:u*.024,role:"light",name:"Timeline dot",cluster:"timeline"},{t:"ellipse",x:w*.75-u*.012,y:top+ph-u*.012,w:u*.024,h:u*.024,role:"light",name:"Timeline dot",cluster:"timeline"},
  textSpec("{headline}",m,top+ph+h*.075,w*.75,u*.040,{weight:700,font:"head",max:2,key:"headline",name:"Headline"}),
  textSpec("{body}",m,top+ph+h*.15,w-2*m,u*.021,{max:3,lh:1.25,key:"body",name:"Body",flow:flow("headline",u*.014)}),...footerSpecs(w,h)]},
 impact_journey(w,h){const u=U(w,h),m=w*.05,top=h*.17,ch=h*.52,g=w*.018,cw=(w-2*m-2*g)/3,r=u*.018,bh=u*.065,out=[{t:"bg",w,h,role:"soft"},
  textSpec("{headline}",m,h*.08,w*.67,u*.040,{weight:700,font:"head",max:2,key:"headline",name:"Headline"}),pillS(w-m,h*.04,pillH(w,h,42,.032))];
  ["CONTEXT","HSF RESPONSE","RESULT"].forEach((L,i)=>{const x=m+i*(cw+g),y=top+ch-bh;out.push(slotS(x,top,cw,ch,{r,key:"photo"+(i+1),name:"Photo · "+L.toLowerCase()}));
    out.push({t:"path",d:`M${x} ${y}H${x+cw}V${y+bh-r}A${r} ${r} 0 0 1 ${x+cw-r} ${y+bh}H${x+r}A${r} ${r} 0 0 1 ${x} ${y+bh-r}Z`,role:"deep",opacity:.86,name:"Stage band · "+L.toLowerCase(),cluster:"j"+i});
    out.push(textSpec(null,x,y+bh/2+u*.014*.36,cw,u*.014,{text:L,weight:700,role:"light",align:"center",font:"head",name:"Stage · "+L.toLowerCase(),cluster:"j"+i}));
    if(i<2){const ax=x+cw+u*.005,bx=x+cw+g-u*.005,ay=top+ch/2,k=u*.012;out.push({t:"path",d:`M${ax} ${ay}L${bx} ${ay}M${bx-k} ${ay-k}L${bx} ${ay}L${bx-k} ${ay+k}`,stroke:"accent",sw:Math.max(2,u*.0046),name:"Arrow"})}});
  out.push(textSpec("{body}",m,h*.77,w-2*m,u*.021,{max:3,lh:1.25,key:"body",name:"Body"}),...footerSpecs(w,h));return out},
 report_insight(w,h){const u=U(w,h),m=w*.055,ph=h*.43,ls=Math.min(w,h)*.085;return[
  {t:"bg",w,h,role:"light"},slotS(0,0,w,ph,{key:"photo1",name:"Photo"}),logoS(m,m,ls),pillS(w-m,m,pillH(w,h,42,.034)),
  {t:"rect",x:m,y:ph-h*.045,w:Math.min(w*.37,u*.42),h:h*.09,rx:u*.018,role:"primary",name:"Figure box",cluster:"fig"},
  textSpec("{stat}",m+u*.025,ph+h*.012,Math.min(w*.37,u*.42)-u*.05,u*.044,{weight:700,role:"light",font:"head",max:1,key:"stat",name:"Figure",cluster:"fig"}),
  textSpec("{headline}",m,ph+h*.105,w*.78,u*.041,{weight:700,font:"head",max:3,key:"headline",name:"Headline"}),
  textSpec("{body}",m,ph+h*.235,w-2*m,u*.023,{max:5,lh:1.26,key:"body",name:"Body",flow:flow("headline",u*.016)}),
  {t:"rect",x:m,y:h*.78,w:w-2*m,h:h*.075,rx:u*.012,role:"soft",name:"Source band",cluster:"src"},
  textSpec("{source}",m+u*.022,h*.78+h*.0375+u*.017*.36,w-2*m-u*.044,u*.017,{weight:700,role:"deep",max:1,key:"source",name:"Source",cluster:"src"}),...footerSpecs(w,h)]},
 observance_story(w,h){const u=U(w,h),m=w*.05,ph=h*.70,ls=Math.min(w,h)*.09,db=u*.20;return[
  {t:"bg",w,h,role:"light"},slotS(0,0,w,ph,{key:"photo1",name:"Photo"}),{t:"rect",x:0,y:ph*.61,w,h:ph*.39,role:"deep",opacity:.72,name:"Observance band"},logoS(m,m,ls),
  {t:"rect",x:w-m-db,y:m,w:db,h:db*.56,rx:u*.018,role:"light",name:"Date box",cluster:"date"},
  textSpec("{date}",w-m-db+db*.06,m+db*.28+u*.018*.36,db*.88,u*.018,{weight:700,role:"deep",align:"center",font:"head",max:2,key:"date",name:"Date",cluster:"date"}),
  textSpec("{headline}",m,ph*.76,w*.82,u*.045,{weight:700,font:"head",role:"light",max:3,key:"headline",name:"Headline"}),
  textSpec("{body}",m,ph+h*.075,w-2*m,u*.022,{max:3,lh:1.25,key:"body",name:"Body"}),...footerSpecs(w,h)]},
 practical_guide_photo(w,h){const u=U(w,h),m=w*.05,ph=h*.48,ls=Math.min(w,h)*.085,top=ph+h*.17,g=h*.018,rh=h*.08,out=[
  {t:"bg",w,h,role:"light"},slotS(0,0,w,ph,{key:"photo1",name:"Photo"}),logoS(m,m,ls),pillS(w-m,m,pillH(w,h,42,.034)),
  textSpec("{headline}",m,ph+h*.075,w*.82,u*.040,{weight:700,font:"head",max:2,key:"headline",name:"Headline"})];
  for(let i=1;i<=3;i++){const y=top+(i-1)*(rh+g);out.push({t:"ellipse",x:m+u*.035-u*.027,y:y+rh/2-u*.027,w:u*.054,h:u*.054,role:"primary",name:"Step "+i+" dot",cluster:"s"+i},
    textSpec(null,m+u*.008,y+rh/2+u*.017*.36,u*.054,u*.017,{text:String(i),weight:700,role:"light",align:"center",font:"head",name:"Step "+i+" number",cluster:"s"+i}),
    textSpec(`{step${i}}`,m+u*.08,y+rh*.55,w*.78,u*.021,{weight:700,max:2,key:"step"+i,name:"Step "+i,cluster:"s"+i}))}
  return[...out,...footerSpecs(w,h)]},
 call_to_action_photo(w,h){const u=U(w,h),m=w*.05,ph=h*.62,ls=Math.min(w,h)*.09;return[
  {t:"bg",w,h,role:"soft"},slotS(0,0,w,ph,{key:"photo1",name:"Photo"}),logoS(m,m,ls),pillS(w-m,m,pillH(w,h,42,.034)),
  {t:"rect",x:m,y:ph-h*.045,w:w-2*m,h:h*.25,rx:u*.025,role:"light",name:"Action card",cluster:"card"},{t:"rect",x:m+u*.02,y:ph-h*.025,w:u*.012,h:h*.20,rx:u*.006,role:"primary",name:"Accent bar",cluster:"card"},
  textSpec("{headline}",m+u*.055,ph+h*.035,w*.78,u*.037,{weight:700,font:"head",max:2,key:"headline",name:"Headline",cluster:"card"}),
  textSpec("{body}",m+u*.055,ph+h*.112,w*.78,u*.021,{max:3,lh:1.24,key:"body",name:"Body",cluster:"card",flow:flow("headline",u*.012)}),
  {t:"pill",x:m+u*.055,y:ph+h*.185,h:h*.060,anchor:"left",bind:"{cta}",role:"primary",size:u*.018,minW:w*.34,key:"cta",name:"CTA button",cluster:"card"},...footerSpecs(w,h)]}};

/* HSF cover pack v3 (approved earlier): three Project photos + ECOSOC line */
const PROJ=["Education for Better Life (E4BL)","Access to Primary Healthcare (A2PHC)","Climate Action & Resilience"];
const ECO1="Organization in special consultative status with the",ECO2="UN Economic and Social Council (ECOSOC) since 2026";
const CUSTOM={
 fbcover_projects(w,h){const out=[{t:"bg",w,h,role:"deep"},{t:"motif",cx:1540,cy:60,r:240,opacity:.35},logoS(285,52,124),
  {t:"text",bind:"{org} (HSF)",x:430,y:62,w:900,size:46,weight:700,role:"light",font:"head",name:"Title"},
  {t:"text",text:"Working together for healthier, better-educated and more resilient communities",x:430,y:124,w:900,size:21,italic:true,role:"soft",font:"quote",name:"Line"}];
  [0,1,2].forEach(i=>{const x=285+i*362;out.push(slotS(x,206,338,206,{r:18,label:["E4BL PHOTO","A2PHC PHOTO","CLIMATE PHOTO"][i],key:"photo"+(i+1)}),
    {t:"text",text:PROJ[i],x,y:422,w:338,size:17,weight:700,role:"light",align:"center",font:"head",name:"Project name"})});
  out.push({t:"text",text:ECO1,x:285,y:494,w:1080,size:17,role:"soft",name:"ECOSOC line 1",cluster:"eco"},{t:"text",text:ECO2,x:285,y:518,w:1080,size:20,weight:700,role:"light",font:"head",name:"ECOSOC line 2",cluster:"eco"},
    {t:"text",bind:"www.{website}   ·   facebook.com/HumanSafetyFoundation",x:285,y:566,w:1080,size:16,role:"soft",name:"Links"});return out}};

/* ============ website templates · PRD §9, §11, §15 ============ */
const HERO_LINE="Working Together for Healthier, Better-Educated and More Resilient Communities";
const DUO_S=[10,10,455,440],DUO_LPTS=[[481,135],[988,135],[988,950],[285,950],[285,466],[481,466]];
const HDR_PAGES=["Home","Programs","Events","Blogs","News & Stories","About HSF","Contact"];
/* thin contour lines hugging the left edge (from the approved header sample) */
function contourD(w,h,n){const k=h/600,parts=[];for(let i=0;i<n;i++){const pts=[];for(let y=-10;y<=h+10;y+=10){const t=y/h;
    const x=(6+i*(2.2+6.8*t)+26*Math.sin(Math.PI*2*(t*.78+.08))+58*t+i*i*.05)*k;pts.push((pts.length?"L":"M")+x.toFixed(1)+" "+y.toFixed(1))}parts.push(pts.join(" "))}return parts.join(" ")}
function hdrFade(w,h,title){const solid=Math.round(w*.27),fadeTo=Math.round(w*.64);const out=[
  slotS(0,0,w,h,{key:"photo1",focal:[.74,.42],name:"Header photo",label:"HEADER PHOTO · SUBJECT ON THE RIGHT"}),
  {t:"rect",x:0,y:0,w:solid+2,h,role:"deep",name:"Dark panel"},
  {t:"grad",x:solid,y:0,w:fadeTo-solid,h,c1:"deep",a1:1,a2:0,angle:90,mid:.42,name:"Side fade"},
  {t:"grad",x:0,y:0,w:fadeTo,h,c1:"black",a1:.72,a2:0,angle:90,mid:.62,name:"Shade (depth)"},
  {t:"path",d:contourD(w,h,16),stroke:"secondary",sw:Math.max(1,1.2*h/600),opacity:.55,name:"Contour lines"}];
  if(title)out.push({t:"text",bind:"{headline}",x:Math.round(w*.177),y:Math.round(h*.38),w:Math.round(w*.42),size:Math.round(h*.1),weight:700,role:"light",font:"head",lh:1.1,max:2,key:"headline",name:"Page title"},
    {t:"text",bind:"{label}",x:Math.round(w*.177),y:Math.round(h*.56),w:Math.round(w*.42),size:Math.round(h*.037),role:"soft",key:"crumb",name:"Breadcrumb",flow:flow("headline",Math.round(h*.03))});
  return out}
/* Programs header: same dark-fade system, illustrated (no people) */
const PROG_AREAS=[["book-open","Education"],["stethoscope","Primary Healthcare"],["sprout","Climate Action"]];
function dotsD(x0,y0,x1,y1,step,r){const p=[];for(let y=y0;y<=y1;y+=step)for(let x=x0;x<=x1;x+=step)p.push(`M${x-r} ${y} a${r} ${r} 0 1 0 ${2*r} 0 a${r} ${r} 0 1 0 ${-2*r} 0`);return p.join(" ")}
function hillPts(w,h,x0,base,amp,ph){const pts=[[0,h]];for(let x=0;x<=w+24;x+=24){const t=Math.min(1,x/w),e=Math.min(1,Math.max(0,(x-x0*.4)/(w*.35)));pts.push([Math.min(x,w),Math.round(h-(h-base+amp*Math.sin(Math.PI*(t*1.3+ph))+t*amp*.6)*e)])}pts.push([w,h]);return pts}
function hdrIllus(w,h,title){const k=h/600,X=f=>Math.round(w*f),Y=v=>Math.round(v*k);const solid=X(.22),fadeTo=X(.56);const out=[
  {t:"bg",w,h,role:"primary"},
  {t:"ellipse",x:X(.70),y:Y(-140),w:Y(660),h:Y(660),role:"accent",opacity:.16,name:"Sun glow"},
  {t:"ellipse",x:X(.75),y:Y(-170),w:Y(470),h:Y(470),ring:true,stroke:"accent",sw:Math.max(2,Y(3)),opacity:.3,name:"Sun ring"},
  {t:"path",d:dotsD(X(.56),Y(36),X(.985),Y(300),Y(30),Math.max(1.5,Y(2.4))),role:"light",opacity:.16,name:"Dot pattern"},
  {t:"poly",pts:hillPts(w,h,X(.42),Y(470),Y(70),.15),role:"secondary",opacity:.55,name:"Back hill"},
  {t:"poly",pts:hillPts(w,h,X(.5),Y(540),Y(48),.55),role:"deep",opacity:.6,name:"Front hill"}];
  const cs=[[.635,320],[.775,236],[.915,320]].map(([fx,y])=>[X(fx),Y(y)]),r=Y(86);
  out.push({t:"path",d:"M"+cs.map(c=>c.join(" ")).join(" L"),stroke:"accent",sw:Math.max(2,Y(4)),dash:[Y(4),Y(14)],name:"Connecting path"});
  cs.forEach(([cx,cy],i)=>{const[ic,lb]=PROG_AREAS[i];out.push(
    {t:"ellipse",x:cx-r-Y(16),y:cy-r-Y(16),w:2*r+Y(32),h:2*r+Y(32),role:"light",opacity:.16,name:lb+" · halo"},
    {t:"ellipse",x:cx-r,y:cy-r,w:2*r,h:2*r,role:"light",name:lb+" · circle"},
    {t:"icon",name:ic,x:cx-Y(41),y:cy-Y(41),size:Y(82),role:"primary"},
    {t:"text",text:lb,x:cx-Y(120),y:cy+r+Y(14),w:Y(240),size:Y(22),weight:600,role:"light",align:"center",name:lb+" · label"})});
  out.push({t:"rect",x:0,y:0,w:solid+2,h,role:"deep",name:"Dark panel"},
    {t:"grad",x:solid,y:0,w:fadeTo-solid,h,c1:"deep",a1:1,a2:0,angle:90,mid:.38,name:"Side fade"},
    {t:"grad",x:0,y:0,w:X(.6),h,c1:"black",a1:.72,a2:0,angle:90,mid:.5,name:"Shade (depth)"},
    {t:"path",d:contourD(w,h,16),stroke:"secondary",sw:Math.max(1,1.2*k),opacity:.55,name:"Contour lines"});
  if(title)out.push({t:"text",bind:"{headline}",x:X(.177),y:Y(228),w:X(.3),size:Y(60),weight:700,role:"light",font:"head",lh:1.1,max:2,key:"headline",name:"Page title"},
    {t:"text",bind:"{label}",x:X(.177),y:Y(336),w:X(.3),size:Y(22),role:"soft",key:"crumb",name:"Breadcrumb",flow:flow("headline",Y(18))});
  return out}
const WEB_CATS={home:"Homepage",inner:"Inner pages",cards:"Content images",share:"Sharing"};
const WEB=[
 {id:"hero",cat:"home",n:"Hero · desktop",w:1920,h:1080,budget:200,guides:"web",content:{headline:HERO_LINE,body:"[Short supporting line]"},sub:"16:9 · photo + side fade + heading",
  b:(w,h)=>[slotS(0,0,w,h,{key:"photo1",focal:[.62,.45],name:"Hero photo"}),{t:"grad",x:0,y:0,w:1300,h,c1:"deep",a1:.88,a2:0,angle:90,name:"Side fade"},
   {t:"text",bind:"{headline}",x:340,y:320,w:880,size:62,weight:700,role:"light",font:"head",lh:1.12,key:"headline",name:"Heading (or build in Elementor)"},
   {t:"text",bind:"{body}",x:340,y:640,w:820,size:26,role:"soft",key:"body",name:"Support line",flow:flow("headline",28)}]},
 {id:"herom",cat:"home",n:"Hero · mobile",w:828,h:1035,budget:90,content:{headline:HERO_LINE},sub:"4:5 phone version",
  b:(w,h)=>[slotS(0,0,w,h,{key:"photo1",name:"Hero photo"}),{t:"grad",x:0,y:380,w,h:h-380,c1:"deep",a1:0,a2:.92,angle:180,name:"Bottom fade"},
   {t:"text",bind:"{headline}",x:48,y:640,w:732,size:42,weight:700,role:"light",font:"head",lh:1.12,key:"headline",name:"Heading"}]},
 {id:"cring",cat:"home",n:"Mission · solid ring",w:740,h:740,budget:100,alpha:true,sub:"Circle frame, transparent corners",
  b:()=>[{t:"slot",shape:"ellipse",box:[0,0,740,740],border:{style:"solid",color:"primary",width:20,inset:10},key:"photo1",name:"Circle photo"}]},
 {id:"cbrush",cat:"home",n:"Mission · brush cut",w:712,h:712,budget:100,alpha:true,sub:"White ring with brush-cut gaps",
  b:()=>[{t:"slot",shape:"ellipse",box:[0,0,712,712],border:{style:"solid",color:"light",width:14,inset:7},mask:true,key:"photo1",name:"Circle photo"}]},
 {id:"caccent",cat:"home",n:"Mission · accent ring",w:740,h:740,budget:100,alpha:true,sub:"Hope Gold ring",
  b:()=>[{t:"slot",shape:"ellipse",box:[0,0,740,740],border:{style:"solid",color:HOPE,width:20,inset:10},key:"photo1",name:"Circle photo"}]},
 {id:"duo",cat:"home",n:"About · duo frame",w:1000,h:963,budget:150,alpha:true,sub:"Quarter tile + brush-edged tile + ring",
  b:()=>[{t:"ellipse",x:231-70,y:519-70,w:140,h:140,ring:true,stroke:HOPE,sw:36,name:"Ring accent"},
   {t:"slot",shape:"quarter",box:DUO_S,R:.8,r:22,border:{style:"brush",color:HOPE,width:10,inset:0,seed:7},key:"photo1",label:"SMALL PHOTO",name:"Small photo"},
   {t:"slot",shape:"poly",pts:DUO_LPTS,box:bboxPts(DUO_LPTS),r:26,border:{style:"brush",color:HOPE,width:11,inset:0,seed:19},key:"photo2",label:"LARGE PHOTO",name:"Large photo"}]},
 {id:"banner",cat:"inner",n:"Page title banner",w:1920,h:450,budget:120,guides:"web",content:{headline:"[Page title]",label:"Home  /  [Page]"},sub:"Programs, Events, News & Stories, About, Contact…",
  b:(w,h)=>[slotS(0,0,w,h,{key:"photo1",name:"Banner photo"}),{t:"rect",x:0,y:0,w,h,role:"deep",opacity:.6,name:"Tint overlay"},
   {t:"text",bind:"{headline}",x:340,y:150,w:1240,size:60,weight:700,role:"light",font:"head",key:"headline",name:"Page title"},
   {t:"text",bind:"{label}",x:340,y:250,w:1240,size:22,role:"soft",key:"crumb",name:"Breadcrumb",flow:flow("headline",18)}]},
 {id:"hdrfade",cat:"inner",n:"Page header · dark fade",w:1920,h:600,budget:120,guides:"web",sub:"Background only · title added in Elementor · photo subject on the right",b:(w,h)=>hdrFade(w,h,false)},
 {id:"hdrset",cat:"inner",n:"Page header set · 7 menu pages",w:1920,h:600,budget:120,guides:"web",set:HDR_PAGES,sub:"Same dark-fade design, one page per menu item · download all as ZIP",b:(w,h)=>hdrFade(w,h,false)},
 {id:"hdrtitle",cat:"inner",n:"Page header set · with titles",w:1920,h:600,budget:120,guides:"web",set:HDR_PAGES,sub:"Title + breadcrumb in the image, for pages without an Elementor heading",b:(w,h)=>hdrFade(w,h,true)},
 {id:"hdrprog",cat:"inner",n:"Programs header · illustrated",w:1920,h:600,budget:120,guides:"web",content:{headline:"Programs",label:"Home  /  Programs"},sub:"No photo · three Project areas as icons · background only (title in Elementor)",b:(w,h)=>hdrIllus(w,h,false)},
 {id:"projhead",cat:"inner",n:"Project page header",w:1920,h:640,budget:150,guides:"web",content:{label:"E4BL · Since 2009",headline:"Education for Better Life",body:"[One-line description of the Project]"},sub:"Single Project template hero",
  b:(w,h)=>[slotS(0,0,w,h,{key:"photo1",name:"Project photo"}),{t:"grad",x:0,y:0,w:1400,h,c1:"deep",a1:.9,a2:0,angle:90,name:"Side fade"},
   {t:"pill",x:340,y:180,h:48,anchor:"left",bind:"{label}",role:"primary",key:"label",name:"Project pill"},
   {t:"text",bind:"{headline}",x:340,y:250,w:900,size:56,weight:700,role:"light",font:"head",key:"headline",name:"Project name"},
   {t:"text",bind:"{body}",x:340,y:330,w:820,size:24,role:"soft",key:"body",name:"Intro",flow:flow("headline",20)}]},
 {id:"card",cat:"cards",n:"Card photo 4:3",w:800,h:600,budget:70,sub:"Loop Grid cards: Our Works, Projects, Stories",b:(w,h)=>[slotS(0,0,w,h,{key:"photo1"})]},
 {id:"story32",cat:"cards",n:"Story hero 3:2",w:1200,h:800,budget:100,sub:"Story detail page",b:(w,h)=>[slotS(0,0,w,h,{key:"photo1"})]},
 {id:"news",cat:"cards",n:"News / Event 16:9",w:1200,h:675,budget:100,sub:"Featured image for posts and events",b:(w,h)=>[slotS(0,0,w,h,{key:"photo1"})]},
 {id:"portrait",cat:"cards",n:"Portrait 1:1",w:600,h:600,budget:50,sub:"Governance & Leadership",b:(w,h)=>[slotS(0,0,w,h,{key:"photo1",label:"PORTRAIT"})]},
 {id:"report",cat:"cards",n:"Report cover A4",w:600,h:849,budget:60,sub:"Use the real document cover",b:(w,h)=>[slotS(0,0,w,h,{key:"photo1",label:"REPORT COVER"})]},
 {id:"og",cat:"share",n:"Link preview (Open Graph)",w:1200,h:630,budget:150,content:{headline:"[Page or post title]"},sub:"Shown when hsfbd.org links are shared",
  b:(w,h)=>[{t:"bg",w,h,role:"light"},slotS(0,0,660,h,{key:"photo1"}),{t:"rect",x:660,y:0,w:540,h,role:"soft",name:"Panel"},logoS(708,52,104),
   {t:"text",bind:"{headline}",x:708,y:200,w:450,size:46,weight:700,font:"head",lh:1.15,max:4,key:"headline",name:"Title"},
   {t:"text",bind:"{website}",x:708,y:548,w:450,size:24,weight:700,role:"primary",name:"Website"}]}];

/* ============ apply roles / type / content ============ */
function gradFor(o){const g=o.hsfGrad;const a=(g.angle??180)*Math.PI/180,dx=Math.sin(a),dy=-Math.cos(a);const w=o.width,h=o.height,L=(Math.abs(w*dx)+Math.abs(h*dy))/2,cx=w/2,cy=h/2;
  const mid=clamp(g.mid??.5,.05,.95);return new fabric.Gradient({type:"linear",gradientUnits:"pixels",coords:{x1:cx-dx*L,y1:cy-dy*L,x2:cx+dx*L,y2:cy+dy*L},
    colorStops:[{offset:0,color:rgba(g.c1,g.a1)},{offset:mid,color:rgba(g.c1===g.c2?g.c1:g.c2,(g.a1+g.a2)/2)},{offset:1,color:rgba(g.c2,g.a2)}]})}
function applyRolesTo(objs){const jobs=[];
  (objs||[]).forEach(o=>{if(!o)return;
    if(o.type==="group"||o.type==="activeSelection"){const kids=o.getObjects();
      if(o.hsfStrokeRole)kids.forEach(k=>{k.set("stroke",roleColor(o.hsfStrokeRole));if(o.hsfIcon&&k.fill&&k.fill!=="none"&&k.fill!=="")k.set("fill",roleColor(o.hsfStrokeRole))});
      jobs.push(applyRolesTo(kids))}
    if(o.hsfRole)o.set("fill",roleColor(o.hsfRole));
    if(o.hsfStrokeRole&&o.type!=="group")o.set("stroke",roleColor(o.hsfStrokeRole));
    if(o.hsfGrad)o.set("fill",gradFor(o));
    if(o.hsfFont&&(o.type==="textbox"||o.type==="text"))o.set("fontFamily",fontFor(o.hsfFont))});
  return Promise.all(jobs)}
function byKey(cv,k){return cv.getObjects().find(o=>o.hsfKey===k&&o.visible!==false)}
function fitText(o){if(!o||!o.hsfFit||o.type!=="textbox")return;const{max,base}=o.hsfFit;let s=base;o.set("fontSize",s);o.initDimensions();
  let n=0;while(o._textLines.length>max&&s>base*.62&&n<12){s*=.92;o.set("fontSize",s);o.initDimensions();n++}}
function reflow(cv){cv.getObjects().forEach(o=>{if(!o.hsfFlow)return;const t=byKey(cv,o.hsfFlow.after);if(!t)return;o.set("top",t.top+t.getScaledHeight()+o.hsfFlow.gap);o.setCoords()})}
async function refreshComps(cv,content){const jobs=[];cv.getObjects().forEach((o,idx)=>{if(!o.hsfComp)return;const k=o.hsfComp.kind;
  if(k==="pill"){const txt=o.hsfComp.bind?resolveBind(o.hsfComp.bind,content):o.hsfComp.text;const cur=o.getObjects()[1];if(cur&&cur.text===txt&&cur.fontFamily===fontFor("head"))return;jobs.push(rebuildComp(cv,o))}
  if(k==="logo"&&o.hsfComp.hasLogo!==!!logoURL)jobs.push(rebuildComp(cv,o))});await Promise.all(jobs)}
async function rebuildComp(cv,o,patch){const c=o.hsfComp;const sp={...clone(c),...(patch||{})};let n;
  if(c.kind==="pill"){const b=o.getBoundingRect(true,true);const sc=o.scaleY||1;sp.h=c.h*sc;sp.size=(c.size||c.h*.34)*sc;sp.y=o.top;
    sp.x=c.anchor==="right"?o.left+o.width*o.scaleX:c.anchor==="center"?o.left+o.width*o.scaleX/2:o.left;Object.assign(sp,patch||{});
    n=buildPill(sp,pageContentFor(cv));sp.t="pill"}
  else if(c.kind==="logo"){sp.size=c.size*(o.scaleX||1);sp.x=o.left;sp.y=o.top;Object.assign(sp,patch||{});n=await buildLogo(sp);n.hsfComp.hasLogo=!!logoURL}
  if(!n)return;["hsfId","hsfKey","hsfDef","hsfAnim","hsfCluster","opacity","hsfLock","selectable","evented","visible"].forEach(k=>{if(o[k]!==undefined)n[k]=o[k]});
  if(o.hsfName&&!/^Logo/.test(o.hsfName))n.hsfName=o.hsfName;
  const idx=cv.getObjects().indexOf(o);const wasActive=cv.getActiveObject&&cv.getActiveObject()===o;cv.remove(o);cv.insertAt(n,idx);if(wasActive)cv.setActiveObject(n);return n}
function pageContentFor(cv){return cv===canvas?pageContent():(cv.__content||pageContent())}
async function applyContent(cv,content){cv.getObjects().forEach(o=>{if(o.hsfBind&&o.type==="textbox"){const t=resolveBind(o.hsfBind,content);if(o.text!==t)o.set("text",t)}fitText(o)});
  await refreshComps(cv,content);reflow(cv)}
async function postBuild(cv,content){cv.__content=content;await applyRolesTo(cv.getObjects());await applyContent(cv,content);await regenDecor(cv);cv.requestRenderAll&&cv.requestRenderAll()}
async function regenDecor(cv){const slots=cv.getObjects().filter(o=>o.hsfSlot);for(const s of slots){await syncDecor(cv,s)}}
async function syncDecor(cv,o){const sl=o.hsfSlot;const objs=cv.getObjects();
  const oldB=objs.find(x=>x.hsfBorderOf===o.hsfId),oldM=objs.find(x=>x.hsfMaskOf===o.hsfId);
  if(oldB){const nb=await borderObj(o);const i=cv.getObjects().indexOf(oldB);cv.remove(oldB);if(nb)cv.insertAt(nb,i)}
  else if(sl.border&&sl.border.style!=="none"){const nb=await borderObj(o);if(nb)cv.insertAt(nb,cv.getObjects().indexOf(o)+1)}
  if(oldM){const[x,y,w,h]=sl.box;if(sl.mask)oldM.set({left:x,top:y,scaleX:w/oldM.width,scaleY:h/oldM.height});else cv.remove(oldM)}
  else if(sl.mask){const im=await loadImg(MASK);const[x,y,w,h]=sl.box;const m=new fabric.Image(im,{left:x,top:y,scaleX:w/im.width,scaleY:h/im.height,globalCompositeOperation:"destination-out",selectable:false,evented:false,hsfMaskOf:o.hsfId,hsfName:"Brush cut (frame)"});
    const bo=cv.getObjects().find(x=>x.hsfBorderOf===o.hsfId);cv.insertAt(m,cv.getObjects().indexOf(bo||o)+1)}}
function updateSlotGeometry(o){const sl=o.hsfSlot;o.clipPath=clipFrom(slotD(sl));
  if(!o.hsfUser){const el=placeholderEl(sl.box[2],sl.box[3],sl.label);o.setElement(el);o.set({width:el.width,height:el.height})}placeInSlot(o);o.dirty=true}

/* ============ template building ============ */
function tplSpecs(ref){
  if(ref.kind==="arch")return LAYOUT[ref.arch](ref.w,ref.h);
  if(ref.kind==="custom")return CUSTOM[ref.custom](ref.w,ref.h);
  if(ref.kind==="web"){const t=WEB.find(x=>x.id===ref.id);return t.b(ref.w,ref.h)}
  return[]}
async function buildInto(cv,ref,content){const main=cv===canvas;if(main)loading=true;cv.clear();const specs=tplSpecs(ref);
  for(const s of specs){const arr=await mk(s,content);arr.forEach(o=>cv.add(o))}
  await postBuild(cv,content);if(main)loading=false}
