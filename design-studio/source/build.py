"""Build HSF Design Studio. Run from this folder:  python3 build.py
Outputs dist/hsf-design-studio-online.html (libraries from CDN) and dist/HSF_Design_Studio_offline.html (everything inlined)."""
import os
H=os.path.dirname(os.path.abspath(__file__));P=lambda *a:os.path.join(H,*a);R=lambda *a:open(P(*a),encoding='utf-8').read()
sh=R('src','shell4.html')
eng='\n'.join(R('src',f) for f in ['e1_data.js','e2_core.js','e3_ui.js','e4_out.js','e5_studio.js','e6_layers.js'])
sh=sh.replace('__FONTCSS__',R('assets','fonts.css')).replace('__ICONS__',R('assets','icons.js')).replace('__MASK__',R('assets','mask.b64')).replace('__UIICONS__',R('src','uiicons.js')).replace('__ENGINE__',eng)
online=sh.replace('__LIBS__','<script src="https://cdn.jsdelivr.net/npm/fabric@5.3.0/dist/fabric.min.js"></script>\n<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>')
online='<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">\n'+online.replace('<div class="app">','</head><body>\n<div class="app">',1)+'\n</body></html>\n'
online=online.replace('<style>','<style>body{margin:0}',1)
os.makedirs(P('dist'),exist_ok=True);open(P('dist','hsf-design-studio-online.html'),'w',encoding='utf-8').write(online)
fab=R('vendor','fabric.min.js').replace('</script','<\\/script');pdf=R('vendor','jspdf.umd.min.js').replace('</script','<\\/script')
off=sh.replace('__LIBS__','<script>/* Fabric.js 5.3.0 · MIT */\n'+fab+'\n</script>\n<script>/* jsPDF 2.5.1 · MIT */\n'+pdf+'\n</script>')
off='<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">\n'+off.replace('<div class="app">','</head><body>\n<div class="app">',1)+'\n</body></html>\n'
off=off.replace('<style>','<style>body{margin:0}',1)
open(P('dist','HSF_Design_Studio_offline.html'),'w',encoding='utf-8').write(off)
print('built',len(online)//1024,'KB online,',len(off)//1024,'KB offline')
