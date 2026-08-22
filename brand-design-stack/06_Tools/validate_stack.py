#!/usr/bin/env python3
"""Validate HSF v3 SVG production masters."""
from pathlib import Path
from xml.etree import ElementTree as ET
import re, sys
root=Path(__file__).resolve().parents[1]
files=list((root/'04_Templates').rglob('*.svg'))
errors=[]
for p in files:
    try: tree=ET.parse(p)
    except Exception as e: errors.append(f'{p}: XML parse error {e}'); continue
    raw=p.read_text(encoding='utf-8')
    for bad in ['<foreignObject','filter=','data:image/','@font-face','http://www.w3.org/1999/xlink']:
        if bad in raw: errors.append(f'{p}: prohibited construct {bad}')
    if 'LOGO_COMPONENT_SLOT' not in raw: errors.append(f'{p}: missing LOGO_COMPONENT_SLOT')
    if '<metadata>' not in raw: errors.append(f'{p}: missing metadata')
print(f'Templates checked: {len(files)}')
if errors:
    print('FAILED'); print('\n'.join(errors)); sys.exit(1)
print('PASS')
