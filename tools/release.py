#!/usr/bin/env python3
"""Yayın damgası: sw.js içindeki önbellek adını ve PRECACHE listesini gerçek dosyalardan üretir.
Her yayından önce çalıştır:  python3 tools/release.py
Önbellek adı içerik özetinden türediği için, herhangi bir oyun dosyası değişince telefon yeni sürümü alır."""
import hashlib, os, re, json
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
files=['index.html','manifest.webmanifest']
for base in ('icons','src'):
    for d,_,fs in os.walk(base):
        for f in sorted(fs):
            if f.startswith('.'):continue
            files.append(os.path.join(d,f).replace(os.sep,'/'))
files=sorted(set(files),key=lambda p:(p.count('/'),p))
h=hashlib.sha256()
for p in files:
    h.update(p.encode());h.update(open(p,'rb').read())
ver=re.search(r"gk-shell-(v[0-9.]+)",open('sw.js',encoding='utf-8').read()).group(1)
cache=f"gk-shell-{ver}-{h.hexdigest()[:8]}"
sw=open('sw.js',encoding='utf-8').read()
sw=re.sub(r"const CACHE = '[^']+';",f"const CACHE = '{cache}';",sw,count=1)
lst=',\n'.join('  '+json.dumps('./'+p) for p in files)
sw=re.sub(r"const PRECACHE = \[.*?\];",lambda m:"const PRECACHE = [\n"+lst+",\n  THREE_URL\n];",sw,count=1,flags=re.S)
open('sw.js','w',encoding='utf-8').write(sw)
print('önbellek:',cache,'| dosya:',len(files)+1)
