#!/usr/bin/env python3
"""Recolour an HSF v3 SVG using data-token attributes. Standard-library only."""
import argparse, json
from xml.etree import ElementTree as ET
from pathlib import Path

parser=argparse.ArgumentParser(); parser.add_argument('svg'); parser.add_argument('tokens_json'); parser.add_argument('expression'); parser.add_argument('-o','--output',required=True); a=parser.parse_args()
tokens=json.loads(Path(a.tokens_json).read_text(encoding='utf-8'))['brand_expressions'][a.expression]
tree=ET.parse(a.svg); root=tree.getroot()
for el in root.iter():
    tok=el.attrib.get('data-token')
    if tok and tok.startswith('color.'):
        key=tok.split('.',1)[1]
        if key in tokens:
            if 'fill' in el.attrib and el.attrib['fill'] != 'none': el.set('fill',tokens[key])
            if 'stroke' in el.attrib and el.attrib['stroke'] != 'none': el.set('stroke',tokens[key])
tree.write(a.output,encoding='utf-8',xml_declaration=True)
