#!/usr/bin/env python3
from pathlib import Path
from xml.etree import ElementTree as ET
import sys
root=Path(sys.argv[1]) if len(sys.argv)>1 else Path(__file__).resolve().parents[1]
files=list(root.rglob('*.svg')); bad=[]
for p in files:
    try: ET.parse(p)
    except Exception as e: bad.append((p,e))
print(f'SVG files: {len(files)} | valid: {len(files)-len(bad)} | invalid: {len(bad)}')
for p,e in bad[:20]: print('BAD',p,e)
raise SystemExit(1 if bad else 0)
