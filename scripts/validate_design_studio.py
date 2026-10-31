#!/usr/bin/env python3
"""HSF design studio source/build/policy bridge checks; no external dependencies or live requests."""
from pathlib import Path
import json, hashlib, subprocess, tempfile, shutil, re, sys
ROOT=Path(__file__).resolve().parents[1];S=ROOT/'design-studio';errors=[]
def verify(ok,msg):
    if not ok:errors.append(msg)
def text(p):return (ROOT/p).read_text(encoding='utf-8')
try:
    meta=json.loads(text('MANIFEST.json'))
    verify(meta['release']=='v1.11.0','Knowledge Hub release must be v1.11.0')
    verify(meta['design_studio']['entry_page']=='design-studio/index.html','Design Studio entry path missing')
    compiled=(S/'index.html').read_bytes()
    verify(b'fabric.min.js' not in compiled[:2500], 'No unexpected unexpanded dependency in HTML head')
    verify(b'HSF Design Studio' in compiled, 'Missing HSF Design Studio document title')
    verify(b'HSF_IN_ACTION' in compiled and b'HSF_KNOWLEDGE_AWARENESS' in compiled,'Current Social v4.0 streams absent')
    verify(b'CORE P01' not in compiled and b'P07-I' not in compiled, 'Retired fixed-post model still in deployed Studio')
    verify(b'Inside Our Classroom' in compiled and b'Learn with E4BL' in compiled,'E4BL series absent')
    verify(b'hsf-public-design-brief/v1' in compiled,'Public-safe import schema missing')
    verify(b'DRAFT - NOT FOR PUBLICATION' in compiled,'Draft status missing from export record')
    verify(b'HSF-COM-' in compiled, 'Controlled content ID missing')
    verify(b'Clear saved design, photos and logo' in compiled,'Private session cleanup control missing')
    verify('javascript:' not in text('communication/assets/design-brief-export.js'),'Untrusted JS URL in brief code')
    for path in ['design-studio/README.md','design-studio/THIRD_PARTY_NOTICES.md','communication/assets/design-brief-export.js','communication/assets/design-brief-export.css']:
        verify((ROOT/path).is_file(),path+' missing')
    # Source rebuild must be byte-identical to committed offline HTML, without touching the committed artifact.
    with tempfile.TemporaryDirectory() as temp:
        d=Path(temp)/'src'
        shutil.copytree(S/'source',d)
        subprocess.run([sys.executable,str(d/'build.py')],cwd=d,check=True,stdout=subprocess.DEVNULL)
        verify((d/'dist/HSF_Design_Studio_offline.html').read_bytes()==compiled,'Source does not reproduce deployed offline page exactly')
        # 14 visual archetypes and website templates in controlled source
        e1=(d/'src/e1_data.js').read_text()
        e2=(d/'src/e2_core.js').read_text()
        verify('const ARCH={' in e1,'Archetype definitions absent')
        verify('const WEB=[' in e2,'Website template catalogue absent')
    # Check exact brand tokens, not palette advertising text.
    brand=json.loads(text('brand-design-stack/02_Tokens/brand-tokens.json'))['palettes']
    srcdata=text('design-studio/source/src/e1_data.js')
    for k,p in brand.items():
        verify('"'+k+'":{' in srcdata,'Studio missing brand palette '+k)
        for role,v in p.items():
            if isinstance(v,str) and v.startswith('#'):
                verify('"'+role+'":"'+v+'"' in srcdata,'Studio role/hex missing '+k+'/'+role)
    library=text('communication/idea-library.html')
    verify('assets/design-brief-export.js' in library and 'assets/design-brief-export.css' in library,'Design brief assets not included in library')
    verify('design-studio/index.html' in text('index.html'),'Hub homepage Studio entry absent')
    verify('design-studio/index.html' in text('social_communication_plan.html'),'Social master Studio link absent')
    js=text('communication/assets/design-brief-export.js')
    for phrase in ['hsf-public-design-brief/v1','publication_approved:false','factual_claims_verified:false','new Blob','URL.createObjectURL','data-brief-id']:
        verify(phrase in js,'Brief exporter missing '+phrase)
    verify('fetch(' not in js and 'localStorage' not in js and 'sessionStorage' not in js,'Brief export must remain local and stateless')
    verify(len(re.findall('class="idea" id="(?:KDI|PSC)-[0-9]{3}"',library))==500,'500 idea cards must remain in library')
    for name in ['netlify/edge-functions/pin-gate.ts','governance/HSF_DIGITAL_SYSTEM_CONTRACT.json']:
        verify((ROOT/name).is_file(),name+' missing')
except Exception as ex:errors.append('Validator exception: '+repr(ex))
if errors:
    print('HSF Design Studio integration FAILED')
    for issue in errors:print(' -',issue)
    sys.exit(1)
print('HSF Design Studio integration PASS: source build, brand, governance, 500-idea bridge, navigation and privacy boundary checks.')
