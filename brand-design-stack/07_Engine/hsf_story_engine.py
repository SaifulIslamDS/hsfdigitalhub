from __future__ import annotations
import os, json, math, base64, html
from pathlib import Path
from PIL import Image, ImageFont
import yaml
import cairosvg
from pypdf import PdfReader, PdfWriter

PALETTES = {
    'evergreen': {'name':'Evergreen','primary':'#008C44','deep':'#006B35','secondary':'#35A36C','accent':'#D9A62E','soft':'#EFF8F3','surface':'#FFFDE6','ink':'#223029','muted':'#65716B','light':'#FFFFFF'},
    'trust_blue': {'name':'Trust Blue','primary':'#1769AA','deep':'#0E3F66','secondary':'#4F9ED6','accent':'#1E8E89','soft':'#EEF6FB','surface':'#F7FBFE','ink':'#1E2D3D','muted':'#607386','light':'#FFFFFF'},
    'hope_gold': {'name':'Hope Gold','primary':'#D77A00','deep':'#8D4B00','secondary':'#F3B340','accent':'#3C74A8','soft':'#FFF7E6','surface':'#FFFBF2','ink':'#382B1B','muted':'#75654E','light':'#FFFFFF'},
    'care_red': {'name':'Care Red','primary':'#C83A43','deep':'#7C1F26','secondary':'#E46970','accent':'#D98A24','soft':'#FFF0F1','surface':'#FFF8F8','ink':'#382325','muted':'#775A5D','light':'#FFFFFF'},
    'dignity_violet': {'name':'Dignity Violet','primary':'#6F4A8E','deep':'#3F2B59','secondary':'#A678BC','accent':'#1D8A8A','soft':'#F6F0FA','surface':'#FCF9FD','ink':'#2C2632','muted':'#6E6674','light':'#FFFFFF'},
}

FORMATS = {
    'facebook': {
        'feed_4x5': (1080,1350), 'feed_square':(1080,1080), 'feed_landscape':(1200,630),
        'story_9x16':(1080,1920), 'reel_9x16':(1080,1920), 'page_cover':(1640,624), 'profile_safe':(1080,1080),
        'album_cover_4x5':(1080,1350)
    },
    'instagram': {
        'feed_4x5':(1080,1350), 'photo_3x4':(1080,1440), 'feed_square':(1080,1080),
        'story_9x16':(1080,1920), 'reel_9x16':(1080,1920), 'reel_cover':(1080,1920), 'profile_safe':(1080,1080)
    },
    'linkedin': {
        'feed_4x5':(1080,1350), 'feed_square':(1080,1080), 'feed_landscape':(1200,627),
        'vertical_video_9x16':(1080,1920), 'page_cover':(4200,700), 'page_logo':(400,400),
        'document_4x5':(1080,1350), 'slide_16x9':(1920,1080), 'one_pager_a4':(2480,3508), 'article_cover':(1200,627)
    }
}

PLATFORM_DENSITY = {'facebook':1.0,'instagram':0.83,'linkedin':1.15}

ARCHETYPES = [
    'editorial_photo_story','human_moment','field_story','evidence_story','quote_story','photo_essay',
    'before_during_after','event_story','institutional_memory','impact_journey','report_insight',
    'observance_story','practical_guide_photo','call_to_action_photo'
]

SEQUENCES = {
    'core_issue_resolution': [
        ('editorial_photo_story','Cover / issue hook'),('field_story','Issue in context'),('report_insight','Why it matters'),
        ('editorial_photo_story','HSF response'),('evidence_story','Evidence / result'),('human_moment','Human moment'),('call_to_action_photo','Action / source')
    ],
    'field_event_story': [
        ('editorial_photo_story','Story cover'),('field_story','Where and when'),('event_story','What happened'),('photo_essay','People and activity'),
        ('evidence_story','Evidence / result'),('human_moment','Human moment'),('report_insight','Why it matters'),('call_to_action_photo','Closing / source')
    ],
    'observance': [
        ('observance_story','Observance cover'),('editorial_photo_story','Why it matters to HSF'),('report_insight','Fact / issue'),
        ('field_story','HSF connection'),('practical_guide_photo','What people can do'),('call_to_action_photo','Source / closing')
    ],
    'foundation_memory': [
        ('institutional_memory','Anniversary cover'),('institutional_memory','Where we began'),('photo_essay','People behind the journey'),
        ('impact_journey','Milestones'),('field_story','Programmes and communities'),('report_insight','What we learned'),
        ('quote_story','Gratitude'),('call_to_action_photo','Future direction / source')
    ],
}

REEL_SEQUENCE = [
    ('editorial_photo_story','Opening'),('human_moment','Hero moment'),('field_story','Context'),('photo_essay','Activity'),
    ('evidence_story','Evidence'),('quote_story','Voice / quote'),('report_insight','Why it matters'),('call_to_action_photo','Action / source'),('editorial_photo_story','Cover / closing')
]

LINKEDIN_DOC_SEQUENCES = {
    'report_brief': [
        ('editorial_photo_story','Cover'),('report_insight','Executive insight'),('field_story','Context'),('evidence_story','Evidence'),
        ('human_moment','Human perspective'),('impact_journey','What changed'),('practical_guide_photo','Learning / recommendations'),('call_to_action_photo','Source / next step')
    ],
    'case_study': [
        ('editorial_photo_story','Case study cover'),('report_insight','Challenge'),('field_story','Response'),('event_story','Implementation'),
        ('evidence_story','Evidence'),('human_moment','Human story'),('report_insight','Learning'),('call_to_action_photo','Closing / source')
    ],
    'project_overview': [
        ('editorial_photo_story','Project overview'),('field_story','Where we work'),('report_insight','Why this work matters'),('photo_essay','What HSF does'),
        ('evidence_story','Results'),('human_moment','People'),('impact_journey','Path forward'),('call_to_action_photo','Contact / source')
    ]
}

# ---------- utility ----------
def esc(s): return html.escape(str(s), quote=True)

def font_path():
    for p in ['/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf']:
        if os.path.exists(p): return p
    return None
FONT_PATH = font_path()

def wrap_measure(text, max_width, font_size, max_lines=4, bold=False):
    text = str(text or '').strip()
    if not text: return [], font_size
    size = font_size
    lines=[]
    min_size=max(8, font_size*.62)
    while size >= min_size:
        try:
            f = ImageFont.truetype(FONT_PATH, int(size)) if FONT_PATH else ImageFont.load_default()
        except: f = ImageFont.load_default()
        words = text.split()
        lines=[]; cur=''
        for w in words:
            test = w if not cur else cur+' '+w
            bbox = f.getbbox(test)
            width = bbox[2]-bbox[0]
            if width <= max_width or not cur:
                cur=test
            else:
                lines.append(cur); cur=w
        if cur: lines.append(cur)
        if len(lines) <= max_lines:
            return lines, size
        size *= .92
    # final hard clamp
    return lines[:max_lines], size

def svg_text_block(x,y,w,text,font_size,color='#223029',weight='400',max_lines=4,line_height=1.18,anchor='start',family='Arial'):
    lines, fs = wrap_measure(text,w,font_size,max_lines,weight in ('600','700','bold'))
    if not lines: return ''
    tspans=[]
    dy=0
    for i,line in enumerate(lines):
        tspans.append(f'<tspan x="{x:.1f}" dy="{0 if i==0 else fs*line_height:.1f}">{esc(line)}</tspan>')
    return f'<text x="{x:.1f}" y="{y:.1f}" font-family="{family}" font-size="{fs:.1f}" font-weight="{weight}" fill="{color}" text-anchor="{anchor}">' + ''.join(tspans) + '</text>'

def placeholder_photo(x,y,w,h,label='DROP HSF PHOTO HERE',r=0):
    # active, not blank: image surface occupies full region and explains focal area
    return f'''<g data-role="IMAGE_PLACEHOLDER"><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="#DCE3DF"/>
    <path d="M{x} {y} L{x+w} {y+h} M{x+w} {y} L{x} {y+h}" stroke="#97A49D" stroke-width="2" opacity=".55"/>
    <circle cx="{x+w*.5}" cy="{y+h*.48}" r="{min(w,h)*.10}" fill="none" stroke="#FFFFFF" stroke-width="4" opacity=".7"/>
    <text x="{x+w/2}" y="{y+h*.70}" font-family="Arial" font-size="{max(18,min(w,h)*.035):.1f}" fill="#5F6B65" text-anchor="middle" font-weight="700">{esc(label)}</text></g>'''

def image_data_uri(path):
    p=Path(path)
    if not p.exists(): return None
    mime='image/png' if p.suffix.lower()=='.png' else 'image/jpeg'
    return f'data:{mime};base64,' + base64.b64encode(p.read_bytes()).decode('ascii')

def fitted_image_svg(path,x,y,w,h,focal=(.5,.5),clip_id='imgclip',r=0):
    if not path or not Path(path).exists():
        return placeholder_photo(x,y,w,h,r=r)
    try:
        iw,ih=Image.open(path).size
    except:
        return placeholder_photo(x,y,w,h,r=r)
    scale=max(w/iw,h/ih); sw=iw*scale; sh=ih*scale
    fx=max(0,min(1,float(focal[0]))); fy=max(0,min(1,float(focal[1])))
    ox=x + w/2 - fx*sw; oy=y + h/2 - fy*sh
    # clamp so region is covered
    ox=min(x,max(x+w-sw,ox)); oy=min(y,max(y+h-sh,oy))
    uri=image_data_uri(path)
    return f'''<defs><clipPath id="{clip_id}"><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}"/></clipPath></defs>
    <image data-role="PHOTO" href="{uri}" x="{ox:.2f}" y="{oy:.2f}" width="{sw:.2f}" height="{sh:.2f}" preserveAspectRatio="none" clip-path="url(#{clip_id})"/>'''

def logo_tile(x,y,size,pal):
    # square, intentionally sits on image surface; central authoritative logo remains separate
    inset=size*.13
    return f'''<g data-role="LOGO_COMPONENT_SLOT"><rect x="{x+4}" y="{y+6}" width="{size}" height="{size}" rx="{size*.12}" fill="#000000" opacity=".10"/>
    <rect x="{x}" y="{y}" width="{size}" height="{size}" rx="{size*.12}" fill="#FFFFFF" stroke="#D7DDD9" stroke-width="1.5"/>
    <rect x="{x+inset}" y="{y+inset}" width="{size-2*inset}" height="{size-2*inset}" rx="{size*.10}" fill="{pal['soft']}" stroke="{pal['primary']}" stroke-width="2" stroke-dasharray="7 5"/>
    <text x="{x+size/2}" y="{y+size*.50}" font-family="Arial" font-size="{size*.23}" fill="{pal['primary']}" font-weight="700" text-anchor="middle">HSF</text>
    <text x="{x+size/2}" y="{y+size*.70}" font-family="Arial" font-size="{size*.08}" fill="{pal['muted']}" font-weight="700" text-anchor="middle">LOGO SLOT</text></g>'''

def pill(x,y,w,h,text,pal,dark=False):
    fill=pal['deep'] if dark else pal['primary']
    return f'<g><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{h/2}" fill="{fill}"/><text x="{x+w/2}" y="{y+h*.64}" font-family="Arial" font-size="{h*.34}" font-weight="700" fill="#FFFFFF" text-anchor="middle">{esc(text)}</text></g>'

def motif_circles(cx,cy,r,pal,opacity=.2):
    return f'<g fill="none" stroke="{pal["primary"]}" opacity="{opacity}"><circle cx="{cx}" cy="{cy}" r="{r}" stroke-width="6"/><circle cx="{cx}" cy="{cy}" r="{r*.62}" stroke-width="2"/></g>'

def footer(w,h,pal,website='hsfbd.org',tagline='Always we are...'):
    y=h-72; m=w*.055
    return f'''<g data-role="FOOTER"><line x1="{m}" y1="{y-34}" x2="{w-m}" y2="{y-34}" stroke="{pal['secondary']}" stroke-width="1.5" opacity=".45"/>
    <text x="{m}" y="{y}" font-family="Arial" font-size="{max(17,w*.019):.1f}" font-weight="700" fill="{pal['primary']}">Human Safety Foundation</text>
    <text x="{w/2}" y="{y}" font-family="Arial" font-size="{max(15,w*.017):.1f}" fill="{pal['ink']}" text-anchor="middle">{esc(website)}</text>
    <text x="{w-m}" y="{y}" font-family="Arial" font-size="{max(15,w*.016):.1f}" font-style="italic" fill="{pal['muted']}" text-anchor="end">{esc(tagline)}</text></g>'''

def svg_header(w,h,title,meta):
    desc=esc(json.dumps(meta,ensure_ascii=False))
    return f'''<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="{w}" height="{h}" viewBox="0 0 {w} {h}" data-hsf-stack="3.1.0" data-title="{esc(title)}"><title>{esc(title)}</title><desc>{desc}</desc>'''

def svg_end(): return '</svg>'

def normalize_content(c):
    base={
        'headline':'Your human-centred story headline',
        'body':'Use a concise, evidence-aware narrative. Let the photograph carry emotion while copy provides context, purpose and meaning.',
        'label':'HSF · STORY', 'website':'hsfbd.org','tagline':'Always we are...','location':'Programme location','date':'Reporting date',
        'stat':'1,245','stat_label':'verified service interactions','quote':'A short authentic voice can make the story human without becoming exploitative.',
        'source':'Source: HSF verified programme record','cta':'Learn more about HSF','project':'Human Safety Foundation','steps':['Understand the context','See the response','Know the next step']
    }
    out=base.copy(); out.update(c or {})
    return out

# ---------- layouts ----------
def layout_editorial_photo_story(w,h,pal,c,images,focals,meta):
    photo_h=h*.64 if h/w>1.15 else h*.58
    top=0
    photo=fitted_image_svg(images[0] if images else None,0,0,w,photo_h,focals[0] if focals else (.5,.5),'img1')
    logo_size=min(w,h)*.105; m=w*.052
    label_w=min(w*.32,330); label_h=max(48,h*.042)
    panel_y=photo_h
    body_y=panel_y+h*.105
    return svg_header(w,h,'Editorial Photo Story',meta)+f'''<rect width="{w}" height="{h}" fill="#FFFFFF"/>{photo}
    {motif_circles(w*.88,h*.09,min(w,h)*.095,pal,.18)}{logo_tile(m,h*.045,logo_size,pal)}{pill(w-m-label_w,h*.05,label_w,label_h,c['label'],pal)}
    <rect x="0" y="{panel_y}" width="{w}" height="{h-panel_y}" fill="#FFFFFF"/>
    {svg_text_block(m,panel_y+h*.075,w-2*m,c['headline'],w*.043,pal['ink'],'700',3)}
    {svg_text_block(m,body_y,w-2*m,c['body'],w*.024,pal['ink'],'400',4,1.28)}
    {footer(w,h,pal,c['website'],c['tagline'])}{svg_end()}'''

def layout_human_moment(w,h,pal,c,images,focals,meta):
    img=fitted_image_svg(images[0] if images else None,0,0,w,h,focals[0] if focals else (.5,.45),'img1')
    logo_size=min(w,h)*.095; m=w*.05
    grad_y=h*.56
    return svg_header(w,h,'Human Moment',meta)+f'''<rect width="{w}" height="{h}" fill="{pal['deep']}"/>{img}
    <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".76"/></linearGradient></defs>
    <rect x="0" y="{grad_y}" width="{w}" height="{h-grad_y}" fill="url(#g1)"/>{logo_tile(m,m,logo_size,pal)}
    {pill(w-m-w*.28,m,w*.28,max(48,h*.04),c['label'],pal)}
    {svg_text_block(m,h*.76,w*.78,c['headline'],w*.050,'#FFFFFF','700',3)}
    {svg_text_block(m,h*.875,w*.82,c['body'],w*.022,'#FFFFFF','400',2,1.25)}
    <text x="{w-m}" y="{h-m}" font-family="Arial" font-size="{w*.018}" fill="#FFFFFF" text-anchor="end">{esc(c['website'])}</text>{svg_end()}'''

def layout_field_story(w,h,pal,c,images,focals,meta):
    m=w*.05; photo_h=h*.69; logo_size=min(w,h)*.10
    img=fitted_image_svg(images[0] if images else None,0,0,w,photo_h,focals[0] if focals else (.5,.5),'img1')
    return svg_header(w,h,'Field Story',meta)+f'''<rect width="{w}" height="{h}" fill="{pal['soft']}"/>{img}
    <rect x="0" y="{photo_h*.72}" width="{w}" height="{photo_h*.28}" fill="{pal['deep']}" opacity=".70"/>
    {logo_tile(m,m,logo_size,pal)}{pill(w-m-w*.27,m,w*.27,max(46,h*.038),c['label'],pal)}
    <text x="{m}" y="{photo_h*.85}" font-family="Arial" font-size="{w*.022}" font-weight="700" fill="#FFF">{esc(c['location'])} · {esc(c['date'])}</text>
    <rect x="0" y="{photo_h}" width="{w}" height="{h-photo_h}" fill="#FFFFFF"/>
    {svg_text_block(m,photo_h+h*.070,w*.72,c['headline'],w*.040,pal['ink'],'700',2)}
    {svg_text_block(m,photo_h+h*.150,w-2*m,c['body'],w*.022,pal['ink'],'400',3,1.26)}
    <rect x="{w*.84}" y="{photo_h+h*.055}" width="{w*.11}" height="{w*.11}" rx="{w*.018}" fill="{pal['soft']}"/><text x="{w*.895}" y="{photo_h+h*.118}" text-anchor="middle" font-family="Arial" font-weight="700" font-size="{w*.017}" fill="{pal['primary']}">FIELD</text>
    {footer(w,h,pal,c['website'],c['tagline'])}{svg_end()}'''

def layout_evidence_story(w,h,pal,c,images,focals,meta):
    m=w*.05; img_h=h*.75; img=fitted_image_svg(images[0] if images else None,0,0,w,img_h,focals[0] if focals else (.5,.5),'img1')
    card_w=w*.78; card_h=h*.25; cx=(w-card_w)/2; cy=img_h-card_h*.45
    logo_size=min(w,h)*.09
    return svg_header(w,h,'Evidence Story',meta)+f'''<rect width="{w}" height="{h}" fill="#FFFFFF"/>{img}{motif_circles(w*.88,h*.08,min(w,h)*.08,pal,.18)}
    {logo_tile(m,m,logo_size,pal)}{pill(w-m-w*.25,m,w*.25,max(44,h*.036),c['label'],pal)}
    <rect x="{cx+5}" y="{cy+8}" width="{card_w}" height="{card_h}" rx="{w*.025}" fill="#000" opacity=".12"/><rect x="{cx}" y="{cy}" width="{card_w}" height="{card_h}" rx="{w*.025}" fill="#FFFFFF"/>
    <text x="{cx+card_w*.08}" y="{cy+card_h*.47}" font-family="Arial" font-size="{w*.085}" font-weight="700" fill="{pal['primary']}">{esc(c['stat'])}</text>
    {svg_text_block(cx+card_w*.08,cy+card_h*.68,card_w*.78,c['stat_label'],w*.025,pal['ink'],'700',2)}
    {svg_text_block(m,h*.91,w*.74,c['headline'],w*.029,pal['ink'],'700',2)}
    <text x="{w-m}" y="{h-m*.65}" font-family="Arial" font-size="{w*.015}" fill="{pal['muted']}" text-anchor="end">{esc(c['source'])}</text>{svg_end()}'''

def layout_quote_story(w,h,pal,c,images,focals,meta):
    m=w*.05; ph=h*.62; img=fitted_image_svg(images[0] if images else None,0,0,w,ph,focals[0] if focals else (.5,.45),'img1')
    logo_size=min(w,h)*.09
    return svg_header(w,h,'Quote Story',meta)+f'''<rect width="{w}" height="{h}" fill="{pal['soft']}"/>{img}{logo_tile(m,m,logo_size,pal)}{pill(w-m-w*.26,m,w*.26,max(44,h*.036),c['label'],pal)}
    <rect x="0" y="{ph}" width="{w}" height="{h-ph}" fill="#FFFFFF"/><text x="{m}" y="{ph+h*.085}" font-family="Georgia" font-size="{w*.090}" fill="{pal['secondary']}" opacity=".75">“</text>
    {svg_text_block(m+w*.06,ph+h*.075,w*.82,c['quote'],w*.035,pal['ink'],'700',4,1.22)}
    <text x="{m+w*.06}" y="{h*.91}" font-family="Arial" font-size="{w*.017}" fill="{pal['muted']}">{esc(c['project'])} · {esc(c['website'])}</text>{svg_end()}'''

def layout_photo_essay(w,h,pal,c,images,focals,meta):
    m=w*.045; gap=w*.012; top=h*.04; logo_size=min(w,h)*.085
    # 3-image mosaic using available images or duplicate
    ims=(images or [None]); foc=(focals or [(0.5,0.5)])
    def ip(i): return ims[i%len(ims)]
    def fp(i): return foc[i%len(foc)]
    area_h=h*.70; left_w=w*.60-gap/2; right_w=w-left_w-gap
    s=''
    s+=fitted_image_svg(ip(0),0,0,left_w,area_h,fp(0),'img1')
    s+=fitted_image_svg(ip(1),left_w+gap,0,right_w,area_h*.49,fp(1),'img2')
    s+=fitted_image_svg(ip(2),left_w+gap,area_h*.49+gap,right_w,area_h*.51-gap,fp(2),'img3')
    return svg_header(w,h,'Photo Essay',meta)+f'''<rect width="{w}" height="{h}" fill="#FFFFFF"/>{s}{logo_tile(m,m,logo_size,pal)}{pill(w-m-w*.27,m,w*.27,max(44,h*.034),c['label'],pal)}
    <rect x="0" y="{area_h}" width="{w}" height="{h-area_h}" fill="#FFFFFF"/>{svg_text_block(m,area_h+h*.065,w*.74,c['headline'],w*.038,pal['ink'],'700',2)}
    {svg_text_block(m,area_h+h*.145,w-2*m,c['body'],w*.021,pal['ink'],'400',3,1.25)}{footer(w,h,pal,c['website'],c['tagline'])}{svg_end()}'''

def layout_before_during_after(w,h,pal,c,images,focals,meta):
    m=w*.045; gap=w*.014; top=h*.12; bottom=h*.24; card_h=h-top-bottom; card_w=(w-2*m-2*gap)/3
    ims=(images or [None]); foc=(focals or [(0.5,0.5)])
    labels=['BEFORE','DURING','AFTER']
    parts=[]
    for i in range(3):
        x=m+i*(card_w+gap); parts.append(fitted_image_svg(ims[i%len(ims)],x,top,card_w,card_h,foc[i%len(foc)],f'img{i+1}',r=w*.015))
        parts.append(f'<rect x="{x+w*.012}" y="{top+w*.012}" width="{card_w*.48}" height="{w*.045}" rx="{w*.022}" fill="{pal["deep"]}"/><text x="{x+w*.012+card_w*.24}" y="{top+w*.042}" text-anchor="middle" font-family="Arial" font-size="{w*.014}" font-weight="700" fill="#FFF">{labels[i]}</text>')
    return svg_header(w,h,'Before During After',meta)+f'''<rect width="{w}" height="{h}" fill="{pal['soft']}"/>{''.join(parts)}
    {svg_text_block(m,h*.075,w*.68,c['headline'],w*.038,pal['ink'],'700',2)}{pill(w-m-w*.24,h*.035,w*.24,max(42,h*.032),c['label'],pal)}
    {svg_text_block(m,h-bottom+h*.050,w-2*m,c['body'],w*.021,pal['ink'],'400',3,1.25)}{footer(w,h,pal,c['website'],c['tagline'])}{svg_end()}'''

def layout_event_story(w,h,pal,c,images,focals,meta):
    m=w*.05; ph=h*.68; img=fitted_image_svg(images[0] if images else None,0,0,w,ph,focals[0] if focals else (.5,.5),'img1')
    logo_size=min(w,h)*.095
    return svg_header(w,h,'Event Story',meta)+f'''<rect width="{w}" height="{h}" fill="#FFF"/>{img}<rect x="0" y="{ph*.64}" width="{w}" height="{ph*.36}" fill="{pal['deep']}" opacity=".78"/>
    {logo_tile(m,m,logo_size,pal)}{pill(w-m-w*.28,m,w*.28,max(44,h*.036),c['label'],pal)}
    {svg_text_block(m,ph*.78,w*.78,c['headline'],w*.045,'#FFF','700',3)}
    <text x="{m}" y="{ph*.92}" font-family="Arial" font-size="{w*.020}" font-weight="700" fill="#FFF">{esc(c['date'])} · {esc(c['location'])}</text>
    {svg_text_block(m,ph+h*.075,w-2*m,c['body'],w*.022,pal['ink'],'400',3,1.28)}{footer(w,h,pal,c['website'],c['tagline'])}{svg_end()}'''

def layout_institutional_memory(w,h,pal,c,images,focals,meta):
    m=w*.05; top=h*.10; ph=h*.59; gap=w*.012; half=(w-gap)/2
    ims=(images or [None]); foc=(focals or [(0.5,0.5)])
    a=fitted_image_svg(ims[0],0,top,half,ph,foc[0],'img1')
    b=fitted_image_svg(ims[min(1,len(ims)-1)],half+gap,top,half,ph,foc[min(1,len(foc)-1)],'img2')
    logo_size=min(w,h)*.09
    return svg_header(w,h,'Institutional Memory',meta)+f'''<rect width="{w}" height="{h}" fill="#FFF"/>{a}{b}{logo_tile(m,h*.028,logo_size,pal)}{pill(w-m-w*.30,h*.036,w*.30,max(44,h*.034),c['label'],pal)}
    <rect x="{w*.12}" y="{top+ph-w*.017}" width="{w*.76}" height="{w*.034}" rx="{w*.017}" fill="{pal['primary']}"/><circle cx="{w*.25}" cy="{top+ph}" r="{w*.012}" fill="#FFF"/><circle cx="{w*.75}" cy="{top+ph}" r="{w*.012}" fill="#FFF"/>
    {svg_text_block(m,top+ph+h*.075,w*.75,c['headline'],w*.040,pal['ink'],'700',2)}{svg_text_block(m,top+ph+h*.150,w-2*m,c['body'],w*.021,pal['ink'],'400',3,1.25)}
    {footer(w,h,pal,c['website'],c['tagline'])}{svg_end()}'''

def layout_impact_journey(w,h,pal,c,images,focals,meta):
    m=w*.05; top=h*.17; card_h=h*.52; gap=w*.018; card_w=(w-2*m-2*gap)/3
    ims=(images or [None]); foc=(focals or [(0.5,0.5)]); labels=['CONTEXT','HSF RESPONSE','RESULT']
    parts=[]
    for i in range(3):
        x=m+i*(card_w+gap); parts.append(fitted_image_svg(ims[i%len(ims)],x,top,card_w,card_h,foc[i%len(foc)],f'img{i+1}',r=w*.018))
        parts.append(f'<rect x="{x}" y="{top+card_h-w*.065}" width="{card_w}" height="{w*.065}" fill="{pal["deep"]}" opacity=".86"/><text x="{x+card_w/2}" y="{top+card_h-w*.023}" text-anchor="middle" font-family="Arial" font-size="{w*.014}" font-weight="700" fill="#FFF">{labels[i]}</text>')
        if i<2: parts.append(f'<path d="M{x+card_w+w*.005} {top+card_h/2} L{x+card_w+gap-w*.005} {top+card_h/2}" stroke="{pal["accent"]}" stroke-width="5"/><path d="M{x+card_w+gap-w*.012} {top+card_h/2-w*.012} L{x+card_w+gap-w*.002} {top+card_h/2} L{x+card_w+gap-w*.012} {top+card_h/2+w*.012}" fill="none" stroke="{pal["accent"]}" stroke-width="5"/>')
    return svg_header(w,h,'Impact Journey',meta)+f'''<rect width="{w}" height="{h}" fill="{pal['soft']}"/>{svg_text_block(m,h*.08,w*.67,c['headline'],w*.040,pal['ink'],'700',2)}{pill(w-m-w*.25,h*.04,w*.25,max(42,h*.032),c['label'],pal)}{''.join(parts)}
    {svg_text_block(m,h*.77,w-2*m,c['body'],w*.021,pal['ink'],'400',3,1.25)}{footer(w,h,pal,c['website'],c['tagline'])}{svg_end()}'''

def layout_report_insight(w,h,pal,c,images,focals,meta):
    m=w*.055; ph=h*.43; img=fitted_image_svg(images[0] if images else None,0,0,w,ph,focals[0] if focals else (.5,.5),'img1')
    logo_size=min(w,h)*.085
    return svg_header(w,h,'Report Insight',meta)+f'''<rect width="{w}" height="{h}" fill="#FFF"/>{img}{logo_tile(m,m,logo_size,pal)}{pill(w-m-w*.26,m,w*.26,max(42,h*.034),c['label'],pal)}
    <rect x="{m}" y="{ph-h*.045}" width="{w*.37}" height="{h*.09}" rx="{w*.018}" fill="{pal['primary']}"/><text x="{m+w*.025}" y="{ph+h*.012}" font-family="Arial" font-size="{w*.044}" font-weight="700" fill="#FFF">{esc(c['stat'])}</text>
    {svg_text_block(m,ph+h*.105,w*.78,c['headline'],w*.041,pal['ink'],'700',3)}
    {svg_text_block(m,ph+h*.235,w-2*m,c['body'],w*.023,pal['ink'],'400',5,1.26)}
    <rect x="{m}" y="{h*.78}" width="{w-2*m}" height="{h*.075}" rx="{w*.012}" fill="{pal['soft']}"/><text x="{m+w*.022}" y="{h*.827}" font-family="Arial" font-size="{w*.017}" fill="{pal['deep']}" font-weight="700">{esc(c['source'])}</text>{footer(w,h,pal,c['website'],c['tagline'])}{svg_end()}'''

def layout_observance_story(w,h,pal,c,images,focals,meta):
    m=w*.05; ph=h*.70; img=fitted_image_svg(images[0] if images else None,0,0,w,ph,focals[0] if focals else (.5,.5),'img1')
    logo_size=min(w,h)*.09; date_box=w*.20
    return svg_header(w,h,'Observance Story',meta)+f'''<rect width="{w}" height="{h}" fill="#FFF"/>{img}<rect x="0" y="{ph*.61}" width="{w}" height="{ph*.39}" fill="{pal['deep']}" opacity=".72"/>{logo_tile(m,m,logo_size,pal)}
    <rect x="{w-m-date_box}" y="{m}" width="{date_box}" height="{date_box*.56}" rx="{w*.018}" fill="#FFF"/><text x="{w-m-date_box/2}" y="{m+date_box*.34}" text-anchor="middle" font-family="Arial" font-size="{w*.018}" font-weight="700" fill="{pal['deep']}">{esc(c['date'])}</text>
    {svg_text_block(m,ph*.76,w*.82,c['headline'],w*.045,'#FFF','700',3)}
    {svg_text_block(m,ph+h*.075,w-2*m,c['body'],w*.022,pal['ink'],'400',3,1.25)}{footer(w,h,pal,c['website'],c['tagline'])}{svg_end()}'''

def layout_practical_guide_photo(w,h,pal,c,images,focals,meta):
    m=w*.05; ph=h*.48; img=fitted_image_svg(images[0] if images else None,0,0,w,ph,focals[0] if focals else (.5,.5),'img1')
    logo_size=min(w,h)*.085; steps=c.get('steps') or ['Step one','Step two','Step three']; top=ph+h*.17; gap=h*.018; row_h=h*.08
    rows=[]
    for i,s in enumerate(steps[:3],1):
        y=top+(i-1)*(row_h+gap); rows.append(f'<circle cx="{m+w*.035}" cy="{y+row_h/2}" r="{w*.027}" fill="{pal["primary"]}"/><text x="{m+w*.035}" y="{y+row_h*.61}" text-anchor="middle" font-family="Arial" font-size="{w*.017}" font-weight="700" fill="#FFF">{i}</text>{svg_text_block(m+w*.08,y+row_h*.55,w*.78,s,w*.021,pal["ink"],"700",2)}')
    return svg_header(w,h,'Practical Guide Photo',meta)+f'''<rect width="{w}" height="{h}" fill="#FFF"/>{img}{logo_tile(m,m,logo_size,pal)}{pill(w-m-w*.28,m,w*.28,max(42,h*.034),c['label'],pal)}
    {svg_text_block(m,ph+h*.075,w*.82,c['headline'],w*.040,pal['ink'],'700',2)}{''.join(rows)}{footer(w,h,pal,c['website'],c['tagline'])}{svg_end()}'''

def layout_call_to_action_photo(w,h,pal,c,images,focals,meta):
    m=w*.05; ph=h*.62; img=fitted_image_svg(images[0] if images else None,0,0,w,ph,focals[0] if focals else (.5,.5),'img1')
    logo_size=min(w,h)*.09
    return svg_header(w,h,'Call to Action Photo',meta)+f'''<rect width="{w}" height="{h}" fill="{pal['soft']}"/>{img}{logo_tile(m,m,logo_size,pal)}{pill(w-m-w*.26,m,w*.26,max(42,h*.034),c['label'],pal)}
    <rect x="{m}" y="{ph-h*.045}" width="{w-2*m}" height="{h*.25}" rx="{w*.025}" fill="#FFF"/><rect x="{m+w*.02}" y="{ph-h*.025}" width="{w*.012}" height="{h*.20}" rx="{w*.006}" fill="{pal['primary']}"/>
    {svg_text_block(m+w*.055,ph+h*.035,w*.78,c['headline'],w*.037,pal['ink'],'700',2)}{svg_text_block(m+w*.055,ph+h*.112,w*.78,c['body'],w*.021,pal['ink'],'400',3,1.24)}
    <rect x="{m+w*.055}" y="{ph+h*.185}" width="{w*.34}" height="{h*.060}" rx="{h*.030}" fill="{pal['primary']}"/><text x="{m+w*.225}" y="{ph+h*.224}" text-anchor="middle" font-family="Arial" font-size="{w*.018}" font-weight="700" fill="#FFF">{esc(c['cta'])}</text>
    {footer(w,h,pal,c['website'],c['tagline'])}{svg_end()}'''

LAYOUTS = {
    'editorial_photo_story':layout_editorial_photo_story,'human_moment':layout_human_moment,'field_story':layout_field_story,
    'evidence_story':layout_evidence_story,'quote_story':layout_quote_story,'photo_essay':layout_photo_essay,
    'before_during_after':layout_before_during_after,'event_story':layout_event_story,'institutional_memory':layout_institutional_memory,
    'impact_journey':layout_impact_journey,'report_insight':layout_report_insight,'observance_story':layout_observance_story,
    'practical_guide_photo':layout_practical_guide_photo,'call_to_action_photo':layout_call_to_action_photo
}

# ---------- renderer ----------
def render_svg(platform,fmt,archetype,content=None,images=None,focals=None,palette='evergreen',title_override=None):
    w,h=FORMATS[platform][fmt]; pal=PALETTES[palette]; c=normalize_content(content)
    # platform-adaptive density: shorten visually by controlling generator defaults; metadata captures density
    meta={'platform':platform,'format':fmt,'archetype':archetype,'palette':palette,'communication_stream':c.get('communication_stream','CORE/OVERLAY'),'story_engine':'HSF Brand Design Stack v3.1.0','image_first':True,'platform_density':PLATFORM_DENSITY[platform]}
    return LAYOUTS[archetype](w,h,pal,c,images or [],focals or [],meta)

def write_svg(path,*args,**kwargs):
    path=Path(path); path.parent.mkdir(parents=True,exist_ok=True); path.write_text(render_svg(*args,**kwargs),encoding='utf-8')

def png_from_svg(svg_path,png_path,width=None):
    cairosvg.svg2png(url=str(svg_path),write_to=str(png_path),output_width=width)

def pdf_from_svgs(svg_paths,out_pdf):
    tmp=[]
    for i,p in enumerate(svg_paths):
        q=Path(out_pdf).with_suffix(f'.page{i+1}.pdf')
        cairosvg.svg2pdf(url=str(p),write_to=str(q)); tmp.append(q)
    writer=PdfWriter()
    for q in tmp:
        r=PdfReader(str(q)); [writer.add_page(pg) for pg in r.pages]
    with open(out_pdf,'wb') as f: writer.write(f)
    for q in tmp: q.unlink(missing_ok=True)



def _resolve_images(config_path, cfg):
    images=[]; focals=[]
    for item in cfg.get('images') or []:
        if isinstance(item,str): item={'path':item}
        p=Path(item.get('path',''))
        if not p.is_absolute(): p=(Path(config_path).parent/p).resolve()
        images.append(str(p) if p.exists() else None)
        foc=item.get('focal',[0.5,0.5]); focals.append((float(foc[0]),float(foc[1])))
    return images,focals

def generate_campaign(config_path:Path,out_dir:Path):
    cfg=yaml.safe_load(Path(config_path).read_text(encoding='utf-8')) or {}
    out_dir=Path(out_dir); out_dir.mkdir(parents=True,exist_ok=True)
    palette=cfg.get('palette','evergreen'); story=cfg.get('story_mode','editorial_photo_story')
    images,focals=_resolve_images(config_path,cfg)
    content={k:v for k,v in cfg.items() if k not in {'images','outputs','sequences','linkedin_documents','linkedin_slide_deck','story_mode','palette'}}
    content['communication_stream']=cfg.get('communication_stream','CORE/OVERLAY')
    render_png=bool(cfg.get('render_png',True)); png_width=int(cfg.get('preview_png_width',1080))
    generated=[]
    for platform,formats in (cfg.get('outputs') or {}).items():
        for fmt in formats:
            svg=out_dir/platform/f'{fmt}_{story}.svg'; write_svg(svg,platform,fmt,story,content,images,focals,palette)
            generated.append(str(svg))
            if render_png:
                png=svg.with_suffix('.png'); png_from_svg(svg,png,width=min(png_width,FORMATS[platform][fmt][0])); generated.append(str(png))
    # Optional carousel sequences
    for seq_req in cfg.get('sequences') or []:
        if isinstance(seq_req,str): seq_req={'type':seq_req}
        seq_name=seq_req.get('type','field_event_story'); seq=SEQUENCES[seq_name]
        platforms=seq_req.get('platforms',['facebook','instagram','linkedin'])
        for platform in platforms:
            fmt='document_4x5' if platform=='linkedin' else 'feed_4x5'
            pages=[]
            for i,(a,label) in enumerate(seq,1):
                cc=content.copy(); cc['headline']=seq_req.get('headlines',{}).get(str(i), label); cc['label']=seq_req.get('label',seq_name.replace('_',' ').upper())
                svg=out_dir/platform/'sequences'/seq_name/f'{i:02d}_{a}.svg'; write_svg(svg,platform,fmt,a,cc,images,focals,palette); pages.append(svg); generated.append(str(svg))
                if render_png:
                    png=svg.with_suffix('.png'); png_from_svg(svg,png,width=min(png_width,FORMATS[platform][fmt][0])); generated.append(str(png))
            if platform=='linkedin' and seq_req.get('export_pdf',True):
                pdf=out_dir/platform/'sequences'/seq_name/f'{seq_name}.pdf'; pdf.parent.mkdir(parents=True,exist_ok=True); pdf_from_svgs(pages,pdf); generated.append(str(pdf))
    # LinkedIn document/PDF products
    for name in cfg.get('linkedin_documents') or []:
        seq=LINKEDIN_DOC_SEQUENCES[name]; pages=[]
        for i,(a,label) in enumerate(seq,1):
            cc=content.copy(); cc['headline']=label if i>1 else content.get('headline',label); cc['label']=f'LINKEDIN · {name.replace("_"," ").upper()}'
            svg=out_dir/'linkedin'/'documents'/name/f'{i:02d}_{a}.svg'; write_svg(svg,'linkedin','document_4x5',a,cc,images,focals,palette); pages.append(svg); generated.append(str(svg))
        pdf=out_dir/'linkedin'/'documents'/name/f'{name}.pdf'; pdf_from_svgs(pages,pdf); generated.append(str(pdf))
    # LinkedIn 16:9 story deck
    if cfg.get('linkedin_slide_deck'):
        slide_plan=[('editorial_photo_story','Cover'),('report_insight','Executive insight'),('field_story','Context'),('evidence_story','Key evidence'),('photo_essay','Programme in action'),('human_moment','Human perspective'),('impact_journey','What changed'),('report_insight','Learning'),('practical_guide_photo','Recommendations'),('call_to_action_photo','Closing / source')]
        pages=[]
        for i,(a,label) in enumerate(slide_plan,1):
            cc=content.copy(); cc['headline']=label if i>1 else content.get('headline',label); cc['label']='LINKEDIN · SLIDE STORY'
            svg=out_dir/'linkedin'/'slide_deck'/f'{i:02d}_{a}.svg'; write_svg(svg,'linkedin','slide_16x9',a,cc,images,focals,palette); pages.append(svg); generated.append(str(svg))
        pdf=out_dir/'linkedin'/'slide_deck'/'slide_story.pdf'; pdf_from_svgs(pages,pdf); generated.append(str(pdf))
    (out_dir/'generation_manifest.json').write_text(json.dumps({'config':str(config_path),'generated':generated},indent=2),encoding='utf-8')
    return generated
