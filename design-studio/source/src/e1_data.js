"use strict";
/* =====================================================================
   HSF Design Engine · data aligned with HSF Brand Design Stack v3.1.0
   (02_Tokens/brand-tokens.json, platform-specs.json, 04_Archetypes,
   07_Engine/hsf_story_engine.py) and HSF Website PRD v1.0 §15.
   ===================================================================== */
const STACK_VERSION="3.1.0";
/* PHASE1 GENERATED from brand-design-stack/02_Tokens/brand-tokens.json. Do not hand-edit colours in Studio. */
const PALETTES={"evergreen":{"name":"Evergreen","primary":"#008C44","deep":"#006B35","secondary":"#35A36C","accent":"#D9A62E","soft":"#EFF8F3","surface":"#FFFDE6","ink":"#223029","muted":"#65716B","light":"#FFFFFF"},"trust_blue":{"name":"Trust Blue","primary":"#1769AA","deep":"#0E3F66","secondary":"#4F9ED6","accent":"#1E8E89","soft":"#EEF6FB","surface":"#F7FBFE","ink":"#1E2D3D","muted":"#607386","light":"#FFFFFF"},"hope_gold":{"name":"Hope Gold","primary":"#D77A00","deep":"#8D4B00","secondary":"#F3B340","accent":"#3C74A8","soft":"#FFF7E6","surface":"#FFFBF2","ink":"#382B1B","muted":"#75654E","light":"#FFFFFF"},"care_red":{"name":"Care Red","primary":"#C83A43","deep":"#7C1F26","secondary":"#E46970","accent":"#D98A24","soft":"#FFF0F1","surface":"#FFF8F8","ink":"#382325","muted":"#775A5D","light":"#FFFFFF"},"dignity_violet":{"name":"Dignity Violet","primary":"#6F4A8E","deep":"#3F2B59","secondary":"#A678BC","accent":"#1D8A8A","soft":"#F6F0FA","surface":"#FCF9FD","ink":"#2C2632","muted":"#6E6674","light":"#FFFFFF"}};
const ROLES=["primary","deep","secondary","accent","soft","surface","ink","muted","light","black"];
const ROLE_NAMES={primary:"Primary",deep:"Deep",secondary:"Secondary",accent:"Accent",soft:"Soft",surface:"Surface",ink:"Ink",muted:"Muted",light:"Light (white)",black:"Black"};
const PRD=[["HSF Evergreen","#008C44"],["Evergreen Deep","#006B35"],["Evergreen Secondary","#35A36C"],["Evergreen Soft","#EFF8F3"],["Main Ink","#223029"],["Muted Text","#65716B"],["Gold Accent","#D9A62E"],["Trust Blue","#1769AA"],["Hope Gold","#D77A00"],["Care Red","#C83A43"],["Dignity Violet","#6F4A8E"],["White","#FFFFFF"]];
const HOPE="#D77A00";
const FB=", 'Hind Siliguri', sans-serif";
const TYPESETS={
  stack:{name:"Stack default · Arial",head:"Arial, 'Liberation Sans', Helvetica"+FB,body:"Arial, 'Liberation Sans', Helvetica"+FB,quote:"Georgia, 'Playfair Display', serif"},
  poppins:{name:"Poppins (website)",head:"Poppins"+FB,body:"Poppins"+FB,quote:"Georgia, 'Playfair Display', serif"},
  editorial:{name:"Playfair + Poppins",head:"'Playfair Display', Georgia"+FB,body:"Poppins"+FB,quote:"'Playfair Display', Georgia, serif"},
  bangla:{name:"Hind Siliguri (Bangla first)",head:"'Hind Siliguri', Poppins, sans-serif",body:"'Hind Siliguri', Poppins, sans-serif",quote:"Georgia, 'Playfair Display', serif"}};
const FONT_CHOICES=[["Arial, 'Liberation Sans', Helvetica"+FB,"Arial (stack)"],["Poppins"+FB,"Poppins"],["'Playfair Display', Georgia"+FB,"Playfair Display"],["'Hind Siliguri', Poppins, sans-serif","Hind Siliguri · বাংলা"],["Georgia, 'Playfair Display', serif","Georgia"]];

/* story content model = normalize_content() in hsf_story_engine.py; evidence fields use brackets so nothing reads as a real figure */
const DEFAULT_CONTENT={headline:"Your human-centred story headline",body:"Use a concise, evidence-aware narrative. Let the photograph carry emotion while copy provides context, purpose and meaning.",
  label:"HSF · STORY",website:"hsfbd.org",tagline:"Always we are...",location:"Project location",date:"Reporting date",stat:"[Figure]",stat_label:"[What the figure counts · period]",
  quote:"A short authentic voice can make the story human without becoming exploitative.",source:"Source: [HSF verified record · period]",cta:"Learn more about HSF",
  project:"Human Safety Foundation",org:"Human Safety Foundation",step1:"Understand the context",step2:"See the response",step3:"Know the next step"};
const FIELDS=[["headline","Headline","area"],["body","Body","area"],["label","Label pill","text"],["location","Location","text"],["date","Date","text"],
  ["stat","Figure (approved only)","text"],["stat_label","What the figure counts","text"],["source","Source line","text"],["quote","Quote (real words only)","area"],
  ["step1","Step 1","text"],["step2","Step 2","text"],["step3","Step 3","text"],["cta","Call to action","text"],
  ["project","Project / attribution","text",true],["website","Website","text",true],["tagline","Tagline","text",true],["org","Organisation","text",true]];
const GLOBAL_FIELDS=new Set(FIELDS.filter(f=>f[3]).map(f=>f[0]));

/* PHASE1 GENERATED from brand-design-stack/04_Archetypes/archetypes.json. */
const ARCH={"editorial_photo_story":{"n":"Editorial Photo Story","share":[60,70],"for":["HSF_IN_ACTION","HSF_KNOWLEDGE_AWARENESS"],"p":"Hero image + editorial story panel"},"human_moment":{"n":"Human Moment","share":[85,100],"for":["HSF_IN_ACTION"],"p":"Near-full-frame authentic moment"},"field_story":{"n":"Field Story","share":[65,75],"for":["HSF_IN_ACTION"],"p":"Field image + location/date/context"},"evidence_story":{"n":"Evidence Story","share":[65,80],"for":["HSF_IN_ACTION","HSF_KNOWLEDGE_AWARENESS"],"p":"Human image + verified number"},"quote_story":{"n":"Quote Story","share":[55,70],"for":["HSF_IN_ACTION"],"p":"Photo + authentic voice"},"photo_essay":{"n":"Photo Essay","share":[65,80],"for":["HSF_IN_ACTION"],"p":"Multi-image visual narrative"},"before_during_after":{"n":"Before / During / After","share":[60,75],"for":["HSF_IN_ACTION"],"p":"Three-stage documentation"},"event_story":{"n":"Event Story","share":[60,75],"for":["HSF_IN_ACTION"],"p":"Event image + participation/context"},"institutional_memory":{"n":"Institutional Memory","share":[55,70],"for":["HSF_IN_ACTION"],"p":"Then/now, archive/current, anniversaries"},"impact_journey":{"n":"Impact Journey","share":[55,70],"for":["HSF_IN_ACTION","HSF_KNOWLEDGE_AWARENESS"],"p":"Context -> response -> result"},"report_insight":{"n":"Report Insight","share":[35,50],"for":["HSF_KNOWLEDGE_AWARENESS"],"p":"Image + evidence + learning"},"observance_story":{"n":"Observance Story","share":[60,75],"for":["HSF_KNOWLEDGE_AWARENESS"],"p":"Observance + HSF relevance"},"practical_guide_photo":{"n":"Practical Guide Photo","share":[40,55],"for":["HSF_KNOWLEDGE_AWARENESS"],"p":"Image + concise action steps"},"call_to_action_photo":{"n":"Call to Action Photo","share":[55,70],"for":["HSF_IN_ACTION","HSF_KNOWLEDGE_AWARENESS"],"p":"Human image + next step"}};
const ARCH_IDS=Object.keys(ARCH);
/* STORYTELLING_SYSTEM.md · Social Plan mapping (first = recommended) */
/* Social Communication Ecosystem v4.0. Streams are editorial; archetypes remain visual layouts. */
const STREAMS={
 ALL:{n:"All editorial streams",rec:[]},
 HSF_IN_ACTION:{n:"HSF in Action",rec:["field_story","human_moment","photo_essay","event_story","editorial_photo_story","quote_story","before_during_after","impact_journey"],note:"Use authentic and documented field experience; participation does not establish outcomes."},
 HSF_KNOWLEDGE_AWARENESS:{n:"HSF Knowledge & Awareness",rec:["report_insight","evidence_story","practical_guide_photo","editorial_photo_story","observance_story","call_to_action_photo"],note:"Verify every external claim and distinguish evidence from advice."}
};
const CONTENT_FAMILIES={
 FIELD_MOMENT:"Field Activities & Moments",CASE_STUDY:"Field Case Studies & Community Voices",PROGRESS_SUCCESS:"Progress, Results & Learning",CHALLENGE_RESPONSE:"Challenges, Responses & Learning",ISSUE_RESOLUTION:"Issue → Practical Response",KNOWLEDGE_DATA_INSIGHT:"Knowledge, Data & Insight",INSTITUTIONAL_ENGAGEMENT:"Institutional, Observances & Engagement"};
const E4BL_SERIES={"inside-our-classroom":"Inside Our Classroom","learn-with-e4bl":"Learn with E4BL"};
const DESIGN_APPROVAL_STATES=["DRAFT_NOT_APPROVED","TECHNICAL_REVIEW_PENDING","SAFEGUARDING_REVIEW_PENDING","MANAGEMENT_REVIEW_PENDING","APPROVED_PUBLIC"];
const SIX=["call_to_action_photo","editorial_photo_story","evidence_story","human_moment","observance_story","quote_story"];
const SEQUENCES={
  issue_practical_response:{n:"Issue → Practical Response · Optional",label:"ISSUE PRACTICAL RESPONSE",pages:[["editorial_photo_story","Cover/Issue Hook"],["field_story","Issue Context"],["report_insight","Why It Matters"],["editorial_photo_story","HSF Response"],["evidence_story","Evidence/Result"],["human_moment","Human Moment"],["call_to_action_photo","Action/Source"]]},
  field_event_story:{n:"Field / event story",label:"FIELD EVENT STORY",pages:[["editorial_photo_story","Story Cover"],["field_story","Where/When"],["event_story","What Happened"],["photo_essay","People/Activity"],["evidence_story","Evidence/Result"],["human_moment","Human Moment"],["report_insight","Why It Matters"],["call_to_action_photo","Closing/Source"]]},
  observance:{n:"Observance",label:"OBSERVANCE",pages:[["observance_story","Observance Cover"],["editorial_photo_story","Why It Matters to HSF"],["report_insight","Fact/Issue"],["field_story","HSF Connection"],["practical_guide_photo","What People Can Do"],["call_to_action_photo","Source/Closing"]]},
  foundation_memory:{n:"Foundation memory",label:"FOUNDATION MEMORY",pages:[["institutional_memory","Anniversary Cover"],["institutional_memory","Where We Began"],["photo_essay","People Behind Journey"],["impact_journey","Milestones"],["field_story","Programmes/Communities"],["report_insight","What We Learned"],["quote_story","Gratitude"],["call_to_action_photo","Future/Source"]]},
  reel:{n:"Reel / vertical-video storyboard",label:"REEL STORYBOARD",pages:[["editorial_photo_story","Opening"],["human_moment","Hero Moment"],["field_story","Context"],["photo_essay","Activity"],["evidence_story","Evidence"],["quote_story","Voice/Quote"],["report_insight","Why It Matters"],["call_to_action_photo","Action/Source"],["editorial_photo_story","Cover/Closing"]]},
  report_brief:{n:"Report brief",label:"LINKEDIN · REPORT BRIEF",keepFirst:true,pages:[["editorial_photo_story","Cover"],["report_insight","Executive insight"],["field_story","Context"],["evidence_story","Evidence"],["human_moment","Human perspective"],["impact_journey","What changed"],["practical_guide_photo","Learning / recommendations"],["call_to_action_photo","Source / next step"]]},
  case_study:{n:"Case study",label:"LINKEDIN · CASE STUDY",keepFirst:true,pages:[["editorial_photo_story","Case study cover"],["report_insight","Challenge"],["field_story","Response"],["event_story","Implementation"],["evidence_story","Evidence"],["human_moment","Human story"],["report_insight","Learning"],["call_to_action_photo","Closing / source"]]},
  project_overview:{n:"Project overview",label:"LINKEDIN · PROJECT OVERVIEW",keepFirst:true,pages:[["editorial_photo_story","Project overview"],["field_story","Where we work"],["report_insight","Why this work matters"],["photo_essay","What HSF does"],["evidence_story","Results"],["human_moment","People"],["impact_journey","Path forward"],["call_to_action_photo","Contact / source"]]},
  slide_story:{n:"Slide story 16:9",label:"LINKEDIN · SLIDE STORY",keepFirst:true,pages:[["editorial_photo_story","Cover"],["report_insight","Executive insight"],["field_story","Context"],["evidence_story","Key evidence"],["photo_essay","Project in action"],["human_moment","Human perspective"],["impact_journey","What changed"],["report_insight","Learning"],["practical_guide_photo","Recommendations"],["call_to_action_photo","Closing / source"]]}};
const ID_CONTENT={headline:"Human Safety Foundation",body:"Working together for healthier, better-educated and more resilient communities.",label:"HSF · IDENTITY"};
const PLATFORMS={
  facebook:{n:"Facebook",formats:[
    {id:"feed_4x5",n:"Feed 4:5",w:1080,h:1350,kind:"arch",masters:"all"},
    {id:"feed_square",n:"Square",w:1080,h:1080,kind:"arch"},
    {id:"feed_landscape",n:"Link 1.91:1",w:1200,h:630,kind:"arch"},
    {id:"story_9x16",n:"Story / Reel",w:1080,h:1920,kind:"arch",masters:SIX,guides:"story"},
    {id:"carousels",n:"Carousels",w:1080,h:1350,kind:"seq",seqs:["issue_practical_response","field_event_story","observance","foundation_memory"]},
    {id:"storyboard",n:"Reel storyboard",w:1080,h:1920,kind:"seq",seqs:["reel"],guides:"story"},
    {id:"identity",n:"Identity",kind:"list",items:[
      {id:"fb_cover",n:"Page cover",sub:"Editorial Photo Story · 1640×624 · stack master",arch:"editorial_photo_story",w:1640,h:624,guides:"fbcover",content:ID_CONTENT,master:true},
      {id:"fb_cover_projects",n:"Page cover · Projects & ECOSOC",sub:"HSF cover pack v3 layout · 1640×624",custom:"fbcover_projects",w:1640,h:624,guides:"fbcover"},
      {id:"fb_profile",n:"Profile picture (safe)",sub:"Human Moment · 1080×1080 · stack master",arch:"human_moment",w:1080,h:1080,guides:"circle",content:{headline:"",body:"",label:"HSF"},master:true},
      {id:"fb_album",n:"Album cover 4:5",sub:"Editorial Photo Story · 1080×1350",arch:"editorial_photo_story",w:1080,h:1350,content:{label:"HSF · ALBUM"}}]}]},
  instagram:{n:"Instagram",formats:[
    {id:"feed_4x5",n:"Feed 4:5",w:1080,h:1350,kind:"arch",masters:"all"},
    {id:"photo_3x4",n:"Photo 3:4",w:1080,h:1440,kind:"arch",masters:["editorial_photo_story","event_story","field_story","human_moment","institutional_memory","photo_essay","quote_story"]},
    {id:"feed_square",n:"Square",w:1080,h:1080,kind:"arch"},
    {id:"story_9x16",n:"Story / Reel",w:1080,h:1920,kind:"arch",masters:SIX,guides:"story"},
    {id:"carousels",n:"Carousels",w:1080,h:1350,kind:"seq",seqs:["issue_practical_response","field_event_story","observance","foundation_memory"]},
    {id:"storyboard",n:"Reel storyboard",w:1080,h:1920,kind:"seq",seqs:["reel"],guides:"story"},
    {id:"identity",n:"Identity",kind:"list",items:[
      {id:"ig_profile",n:"Profile picture (safe)",sub:"Human Moment · 1080×1080 · stack master",arch:"human_moment",w:1080,h:1080,guides:"circle",content:{headline:"",body:"",label:"HSF"},master:true},
      {id:"ig_reelcover",n:"Reel cover",sub:"Editorial Photo Story · 1080×1920 · stack master",arch:"editorial_photo_story",w:1080,h:1920,guides:"story",content:{label:"HSF · REEL"},master:true}]}]},
  linkedin:{n:"LinkedIn",formats:[
    {id:"feed_4x5",n:"Feed 4:5",w:1080,h:1350,kind:"arch",masters:"all"},
    {id:"feed_square",n:"Square",w:1080,h:1080,kind:"arch"},
    {id:"feed_landscape",n:"Link 1.91:1",w:1200,h:627,kind:"arch"},
    {id:"vertical_video_9x16",n:"Vertical video",w:1080,h:1920,kind:"arch",guides:"story"},
    {id:"carousels",n:"Document carousels",w:1080,h:1350,kind:"seq",seqs:["issue_practical_response","field_event_story","observance","foundation_memory"]},
    {id:"documents",n:"Knowledge documents",w:1080,h:1350,kind:"seq",seqs:["report_brief","case_study","project_overview"]},
    {id:"slides",n:"Slide deck 16:9",w:1920,h:1080,kind:"seq",seqs:["slide_story"]},
    {id:"storyboard",n:"Video storyboard",w:1080,h:1920,kind:"seq",seqs:["reel"],guides:"story"},
    {id:"identity",n:"Identity & one-offs",kind:"list",items:[
      {id:"li_cover",n:"Page cover",sub:"Editorial Photo Story · 4200×700 · stack master",arch:"editorial_photo_story",w:4200,h:700,guides:"licover",content:ID_CONTENT,master:true},
      {id:"li_logo",n:"Page logo",sub:"Human Moment · 400×400 · stack master",arch:"human_moment",w:400,h:400,content:{headline:"",body:"",label:"HSF"},master:true},
      {id:"li_article",n:"Article / newsletter cover",sub:"Editorial Photo Story · 1200×627 · stack master",arch:"editorial_photo_story",w:1200,h:627,content:{label:"HSF · ARTICLE"},master:true},
      {id:"li_onepager",n:"Project fact sheet A4",sub:"Report Insight · 2480×3508 (A4, 300 dpi) · stack master",arch:"report_insight",w:2480,h:3508,content:{label:"PROJECT FACT SHEET"},master:true,a4:true},
      {id:"li_reportcard",n:"Impact report card",sub:"Evidence Story · 1080×1350 · stack master",arch:"evidence_story",w:1080,h:1350,content:{label:"IMPACT REPORT CARD"},master:true}]}]}};
const STORY_GUIDES={
  story:(w,h)=>[{x:0,y:250,w,h:h-500,l:"Keep text inside · approx. app-button zones above and below"}],
  fbcover:(w,h)=>[{x:(w-1110)/2,y:0,w:1110,h,l:"Visible on phones · keep people and text inside"}],
  circle:(w,h)=>[{x:0,y:0,w,h,l:"Shown as a circle",circle:true}],
  licover:(w,h)=>[{x:w*.2,y:0,w:w*.6,h,l:"Crop varies by device · keep key content central (approx.)"}],
  web:(w,h)=>[{x:(w-1240)/2,y:0,w:1240,h,l:"1240 px content width (PRD §15.1)"}]};
