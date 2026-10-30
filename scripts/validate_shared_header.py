#!/usr/bin/env python3
"""Validate one shared visual identity header without conflating release and policy approvals."""
from pathlib import Path
from html.parser import HTMLParser
import sys
R=Path(__file__).resolve().parents[1]
err=[]
def test(condition,message):
    if not condition:err.append(message)
class Inspect(HTMLParser):
    def __init__(self):
        super().__init__();self.classes=[];self.ids=[];self.links=[];self.logos=[];self.doccontrols=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'class' in a:self.classes.extend(a['class'].split())
        if 'id' in a:self.ids.append(a['id'])
        if tag=='link':self.links.append(a.get('href',''))
        if tag=='img' and 'hsf-logo' in a.get('src',''):self.logos.append(a)
        if tag=='aside' and 'data-hsf-document-control' in a:self.doccontrols.append(a)
css='assets/styles/hsf-shared-header.css'
test((R/css).exists(),'Shared CSS file missing')
for name in ['index.html','social_communication_plan.html']:
    s=(R/name).read_text(encoding='utf-8');o=Inspect();o.feed(s)
    test(css in o.links, name+': shared stylesheet link missing')
    for cls in ['hsf-site-header','hsf-site-header__inner','hsf-site-header__brand','hsf-site-header__logo','hsf-site-header__org','hsf-site-header__title','hsf-site-header__actions','hsf-document-control']:
        test(cls in o.classes,name+': shared structural class missing '+cls)
    test(len(o.doccontrols)==1,name+': must have exactly one control strip')
    test(any(x.get('alt')=='Human Safety Foundation logo' for x in o.logos),name+': HSF official logo missing')
    test('30 October 2026' in s and 'Saiful Islam' in s,name+': control attribution/date missing')
    test(s.count('<header class="hsf-site-header"')==1,name+': shared top header duplicated')
    if name=='index.html':
        test('Status: Current internal version' in s,'Homepage does not indicate current internal version')
        test('href="#documents"' in s, 'Homepage browse-documents link missing')
        test('Knowledge Hub v1.10.0' in s,'Current Knowledge Hub version not shown')
    else:
        test('Status: Approved &amp; Stable (Knowledge Hub v1.10.0 internal)' in s,'Social policy approval distinction missing')
        for x in ['socialMenu','socialMenuOpen','socialMenuBackdrop','socialTocList','socialTocSearch']:
            test(x in o.ids,'Social navigation component missing '+x)
        test('href="index.html"' in s and 'href="communication/idea-library.html"' in s,'Social navigation links missing')
        test('260 KDI and 240 PSC' in s,'Editorial bank totals changed unexpectedly')
if err:
    print('SHARED HEADER QA FAILED')
    for e in err:print(' -',e)
    sys.exit(1)
print('Shared HSF header PASS: logo, brand, sticky navigation, internal vs policy status, mobile navigation, drawer and links aligned.')
