#!/usr/bin/env python3
from pathlib import Path
import argparse
from hsf_story_engine import generate_campaign

def main():
    ap=argparse.ArgumentParser(description="HSF Image-First Storytelling SVG Generator v3.1.0")
    ap.add_argument("config",help="Campaign YAML")
    ap.add_argument("--out",default="generated",help="Output directory")
    args=ap.parse_args()
    files=generate_campaign(Path(args.config),Path(args.out))
    print(f"Generated {len(files)} files in {args.out}")
if __name__=="__main__": main()
