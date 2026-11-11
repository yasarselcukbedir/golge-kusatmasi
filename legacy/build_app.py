#!/usr/bin/env python3
"""Build the installable PWA from golge-kusatmasi.html into app/ (index.html, manifest, service worker, icons)."""
import re, zlib, struct, math, os, hashlib
SRC='golge-kusatmasi.html'; OUT='docs'
src=open(SRC,encoding='utf-8').read()
ver=hashlib.md5(src.encode('utf-8')).hexdigest()[:8]

# ---- icons (pure-python PNG): dark disc, gold ring, white keep silhouette
def png(size):
    px=bytearray()
    cx=cy=size/2; R=size*0.47
    for y in range(size):
        row=bytearray([0])
        for x in range(size):
            dx,dy=x-cx,y-cy; d=math.hypot(dx,dy)
            if d>R: r,g,b,a=0,0,0,0
            else:
                r,g,b,a=0x1e,0x19,0x13,255
                if d>R*0.90: r,g,b=0xd9,0xa4,0x41           # gold ring
                # keep: tower body + top + flag
                bx=abs(dx)/size; by=(y-cy)/size
                if bx<0.16 and -0.06<by<0.30: r,g,b=0xe9,0xdc,0xc3
                if bx<0.10 and -0.20<by<=-0.06: r,g,b=0xe9,0xdc,0xc3
                if bx<0.025 and -0.36<by<=-0.20: r,g,b=0xd9,0xa4,0x41
                if 0.025<=dx/size<0.14 and -0.36<by<-0.27: r,g,b=0x4d,0x9b,0xe6
                # crenellations
                if bx<0.16 and -0.10<by<-0.06 and int(bx*size/(size*0.045))%2==1: r,g,b=0x1e,0x19,0x13
            row+=bytes((r,g,b,a))
        px+=row
    def chunk(t,d): return struct.pack('>I',len(d))+t+d+struct.pack('>I',zlib.crc32(t+d)&0xffffffff)
    return b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',size,size,8,6,0,0,0))+chunk(b'IDAT',zlib.compress(bytes(px),9))+chunk(b'IEND',b'')
for s in (192,512):
    open(f'{OUT}/icons/icon-{s}.png','wb').write(png(s))
open(f'{OUT}/icons/apple-touch-icon.png','wb').write(png(180))

# ---- index.html: full document around the artifact page
head='''<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no">
<meta name="theme-color" content="#1e1913">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Gölge Kuşatması">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<link rel="icon" href="icons/icon-192.png">
<style>html{height:100%;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px);box-sizing:border-box;background:#15120d}body{height:100%;margin:0;overscroll-behavior:none}</style>
</head>
<body>
'''
tail='''
<script>
if('serviceWorker' in navigator){
  let reloaded=false;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(reloaded)return;reloaded=true;if(performance.now()<15000)location.reload();else{const b=document.createElement('button');b.textContent='Yeni sürüm hazır · dokun, yenile';b.style.cssText='position:fixed;left:50%%;top:12px;transform:translateX(-50%%);z-index:99;background:#3a2c12;color:#d9a441;border:1px solid #d9a441;border-radius:10px;padding:8px 14px;font:600 13px -apple-system,sans-serif';b.onclick=()=>location.reload();document.body.appendChild(b);}});
  window.addEventListener('load',()=>{navigator.serviceWorker.register('sw.js?v=%s').then(r=>{r.update().catch(()=>{});}).catch(()=>{});});
}
</script>
</body>
</html>
''' % ver
body=src.replace('<meta name="claude:viewport-fit-sides" content="cover">\n','')
open(f'{OUT}/index.html','w',encoding='utf-8').write(head+body+tail)

open(f'{OUT}/manifest.webmanifest','w',encoding='utf-8').write('''{
  "name": "Gölge Kuşatması",
  "short_name": "Kuşatma",
  "description": "Orta Dünya esinli, telefonda tek başparmakla oynanan 3B gerçek zamanlı strateji.",
  "start_url": "./index.html",
  "scope": "./",
  "display": "fullscreen",
  "orientation": "portrait",
  "background_color": "#15120d",
  "theme_color": "#1e1913",
  "lang": "tr",
  "icons": [
    {"src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable"},
    {"src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable"}
  ]
}
''')
open(f'{OUT}/sw.js','w',encoding='utf-8').write('''const CACHE='gk-%s';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.allSettled(ASSETS.map(a=>c.add(new Request(a,{mode:a.startsWith('http')?'cors':'same-origin'})).catch(()=>{})))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const u=e.request.url;
  if(e.request.method!=='GET')return;
  const isPage=e.request.mode==='navigate'||u.endsWith('/index.html')||u.endsWith('/golge-kusatmasi/');
  if(isPage){
    e.respondWith(Promise.race([fetch(e.request).then(res=>{if(res&&res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put('./index.html',cp));}return res;}),new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),3500))]).catch(()=>caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request).then(res=>{
    if(res&&(res.ok||res.type==='opaque')&&(u.includes('fonts.g')||u.includes('cdnjs')||u.startsWith(self.location.origin))){const cp=res.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));}
    return res;}).catch(()=>caches.match('./index.html'))));
});
''' % ver)
print('built app/ version',ver)
