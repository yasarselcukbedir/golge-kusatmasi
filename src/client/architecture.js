import {finishModel} from './geometry.js';
import {FACTION_ART,partBuilder} from './figures.js';

// Anadolu beylik mimarisi: kesme taş surlar, kubbeler, Selçuklu külahları ve Türkmen otağları.
const STONE=0xc6b99f,DARK=0x8b7e69,SHADE=0x33291f,HAY=0xdcba5a,WOOL=0xf1eadb,EARTH=0x7c5d3c,CROP=0x8cab4c,FELT=0xe9e0ca,PLASTER=0xeadfc6,WATER=0x6fb5c6,PASTURE=0x94a458,COAL=0x2b2622;
const STYLE={osman:'kubbe',aydin:'kubbe',candar:'kulah',karaman:'kulah',germiyan:'otag',dulkadir:'otag'};
const UP=[0,0,0],FLAT=[Math.PI/2,0,0];

function merlons(b,y,w,d,zc=0,step=3){
  for(let x=-w/2;x<=w/2+.01;x+=step)for(const s of [-1,1])b.add('box',STONE,x,y,zc+s*d/2,1.5,1.5,1.2,UP,'mazgal',true);
  for(let z=-d/2+step;z<d/2-.01;z+=step)for(const s of [-1,1])b.add('box',STONE,s*w/2,y,zc+z,1.2,1.5,1.5,UP,'mazgal',true);
}
function cap(b,style,x,y,z,r){
  const a=b.add;
  if(style==='kubbe'){
    a('dome','main',x,y,z,r,r*.85,r,UP,'kubbe');a('round','trim',x,y+r*.85+.6,z,.16,1.5,.16,UP,'alem',true);a('ball','trim',x,y+r*.85+1.3,z,.42,.42,.42,UP,'alem-topu',true);
  }else if(style==='kulah'){
    a('cone','main',x,y+r*.95,z,r*1.1,r*1.9,r*1.1,UP,'kulah');a('ball','trim',x,y+r*1.95,z,.42,.42,.42,UP,'alem-topu',true);
  }else{
    a('dome','main',x,y,z,r*1.12,r*.6,r*1.12,UP,'otag-tepesi');a('ball','trim',x,y+r*.66,z,.45,.45,.45,UP,'otag-topu',true);
  }
}
function tower(b,style,x,z,r,h){
  b.add('round',STONE,x,h/2,z,r,h,r,UP,'burc');b.add('round',DARK,x,h+.35,z,r*1.16,.9,r*1.16,UP,'burc-kusagi',true);cap(b,style,x,h+.8,z,r*1.06);
}
function gate(b,z,w=5,h=6){
  b.add('box',SHADE,0,h/2,z,w,h,.7,UP,'kapi');b.add('bow','trim',0,h-.2,z+.3,w/2+.3,w*.42,1.6,UP,'kapi-kemeri');
  for(const s of [-1,1])b.add('box',DARK,s*(w/2+.6),h/2,z+.15,1.1,h,1,UP,'kapi-sovesi',true);
}
function banner(b,x,y,z,size=1){
  b.add('round','wood',x,y+4*size,z,.22,8*size,.22,UP,'sancak-diregi');b.add('sail','main',x+1.7*size,y+6.5*size,z,3.2*size,2.6*size,.2,UP,'sancak');b.add('ball','trim',x,y+8.2*size,z,.42,.42,.42,UP,'alem',true);
}
function tug(b,x,y,z){
  b.add('round','wood',x,y+3.5,z,.2,7,.2,UP,'tug-sirigi');b.add('ball','trim',x,y+7.2,z,.5,.5,.5,UP,'tug-topu');b.add('cone','main',x,y+6,z,.7,1.9,.7,[Math.PI,0,0],'tug-kili');
}
function yurt(b,x,z,r,h=4){
  const a=b.add;
  a('round',FELT,x,h/2,z,r,h,r,UP,'cadir-govdesi');a('torus','main',x,h*.6,z,r*1.01,r*1.01,1.7,FLAT,'cadir-kolani',true);
  a('dome','main',x,h,z,r*1.08,r*.62,r*1.08,UP,'cadir-tepesi');a('round','trim',x,h+r*.62,z,r*.2,.5,r*.2,UP,'tunduk',true);
  a('box',SHADE,x,h*.42,z+r*.97,r*.5,h*.8,.5,UP,'cadir-kapisi',true);
}
function hall(b,style,w,d,h,zc=0){
  const a=b.add,s=Math.min(w,d);
  if(style==='otag'){
    a('box',EARTH,0,.3,zc,w,.6,d,UP,'zemin');yurt(b,-w*.12,zc-d*.06,s*.4,h*.72);yurt(b,w*.31,zc+d*.2,s*.22,h*.5);
    return;
  }
  a('box',DARK,0,.6,zc,w+1.5,1.2,d+1.5,UP,'temel');a('box',style==='kubbe'?STONE:PLASTER,0,h/2+1,zc,w,h,d,UP,'govde');
  a('box','wood',0,h+1.25,zc,w+1.2,.6,d+1.2,UP,'sacak',true);
  if(style==='kubbe'){a('round',STONE,0,h+2.1,zc,s*.37,1.4,s*.37,UP,'kasnak');cap(b,'kubbe',0,h+2.8,zc,s*.39);}
  else{const r=Math.max(w,d)*.74;a('roof','main',0,h+1.5+h*.38,zc,r,h*.76,r,[0,Math.PI/4,0],'kirma-cati');a('ball','trim',0,h+1.6+h*.76,zc,.42,.42,.42,UP,'alem-topu',true);}
  gate(b,zc+d/2+.1,w*.24,h*.66);
  for(const side of [-1,1])a('box',SHADE,side*w*.33,h*.62+1,zc+d/2+.05,1.3,1.9,.3,UP,'pencere',true);
}
function fence(b,w,d,zc=0,gap=5){
  const a=b.add;
  for(let x=-w/2;x<=w/2+.01;x+=w/6){a('box','wood',x,1.3,zc-d/2,.45,2.6,.45,UP,'cit-kazigi',true);if(Math.abs(x)>gap/2)a('box','wood',x,1.3,zc+d/2,.45,2.6,.45,UP,'cit-kazigi',true);}
  for(let z=-d/2+d/4;z<d/2-.01;z+=d/4)for(const s of [-1,1])a('box','wood',s*w/2,1.3,zc+z,.45,2.6,.45,UP,'cit-kazigi',true);
  for(const y of [1,2.1]){
    a('box','wood',0,y,zc-d/2,w,.28,.28,UP,'cit');for(const s of [-1,1]){a('box','wood',s*w/2,y,zc,.28,.28,d,UP,'cit');a('box','wood',s*(w/4+gap/4),y,zc+d/2,w/2-gap/2,.28,.28,UP,'cit');}
  }
}
function sheep(b,x,z,turn=0){
  const a=b.add,c=Math.cos(turn),s=Math.sin(turn);
  a('ball',WOOL,x,1.5,z,1.15,1,1.6,[0,turn,0],'koyun');a('ball',SHADE,x+s*1.55,1.9,z+c*1.55,.5,.55,.6,[0,turn,0],'koyun-basi');
  for(const side of [-1,1])for(const f of [-1,1])a('box',SHADE,x+c*side*.55+s*f*.8,.5,z-s*side*.55+c*f*.8,.26,1,.26,UP,'koyun-bacagi',true);
}
function ox(b,x,z,turn=0){
  const a=b.add,c=Math.cos(turn),s=Math.sin(turn);
  a('box','horse',x,2.1,z,1.7,1.7,3.4,[0,turn,0],'sigir');a('box','horse',x+s*2.2,2.6,z+c*2.2,1.1,1.1,1.3,[0,turn,0],'sigir-basi');
  for(const side of [-1,1]){a('cone','trim',x+s*2.3+c*side*.6,3.4,z+c*2.3-s*side*.6,.16,.8,.16,[0,0,-side*.5],'boynuz',true);for(const f of [-1,1])a('box','horse',x+c*side*.6+s*f*1.2,.65,z-s*side*.6+c*f*1.2,.4,1.3,.4,UP,'sigir-bacagi',true);}
}
function horse(b,x,z){
  const a=b.add;
  a('box','horse',x,2.9,z,1.8,2,4.4,UP,'tavla-ati');a('taper','horse',x,4.2,z+2,.7,2.4,.75,[.55,0,0],'at-boynu');a('box','horse',x,5.3,z+2.7,.7,.85,1.6,[.35,0,0],'at-basi');
  for(const side of [-1,1])for(const f of [-1.5,1.5])a('box','horse',x+side*.6,1,z+f,.4,2,.45,UP,'at-bacagi',true);
  a('box','main',x,4,z-.2,2,.35,2,UP,'cul',true);
}
function hut(b,style,x,z,scale=1){
  const a=b.add;
  if(style==='otag'){yurt(b,x,z,3.2*scale,3.4*scale);return;}
  a('box',style==='kubbe'?STONE:PLASTER,x,2.4*scale,z,6.4*scale,4.8*scale,5.2*scale,UP,'kulube');
  a('roof','main',x,4.8*scale+1.5*scale,z,5.2*scale,3*scale,5.2*scale,[0,Math.PI/4,0],'kulube-catisi');
  a('box',SHADE,x,1.6*scale,z+2.65*scale,1.5*scale,3.2*scale,.3,UP,'kulube-kapisi',true);
}
function keep(b,style){
  const a=b.add,w=24,d=22,h=7.5;
  a('box',DARK,0,.6,0,w+2.5,1.2,d+2.5,UP,'hisar-temeli');
  for(const s of [-1,1]){a('box',STONE,0,h/2,s*d/2,w,h,2.2,UP,'sur');a('box',STONE,s*w/2,h/2,0,2.2,h,d,UP,'sur');}
  merlons(b,h+.7,w,d);
  for(const sx of [-1,1])for(const sz of [-1,1])tower(b,style,sx*w/2,sz*d/2,3.1,h+4.5);
  gate(b,d/2+1.2,5.6,5.6);
  if(style==='otag'){
    yurt(b,0,-1.5,7.4,7);a('dome','trim',0,7+7.4*.62,-1.5,2.2,1.4,2.2,UP,'otag-tepeligi');
    for(const s of [-1,1])tug(b,s*5.4,1,6.4);banner(b,0,10.6,-1.5,1.15);
  }else{
    const top=h+8;
    a('box',style==='kubbe'?STONE:PLASTER,0,top/2,-1.5,12.5,top,11.5,UP,'ic-kale');a('box',DARK,0,top+.3,-1.5,13.6,.8,12.6,UP,'ic-kale-kusagi',true);
    merlons(b,top+1.2,12.5,11.5,-1.5,3.1);
    for(const s of [-1,1])a('box',SHADE,s*3.4,top-3.2,4.3,1.4,2.4,.3,UP,'mazgal-penceresi',true);
    if(style==='kubbe'){a('round',STONE,0,top+1.4,-1.5,4.7,2,4.7,UP,'kasnak');cap(b,'kubbe',0,top+2.4,-1.5,4.9);banner(b,5,top+.4,-5,1.1);}
    else{a('round',PLASTER,0,top+2.4,-1.5,4.2,4,4.2,UP,'kumbet');cap(b,'kulah',0,top+4.4,-1.5,4.3);banner(b,5,top+.4,-5,1.1);}
  }
}
function watch(b,style){
  const a=b.add;
  if(style==='otag'){
    for(const x of [-3.4,3.4])for(const z of [-3.4,3.4])a('box','wood',x,8,z,.7,16,.7,[z*.012,0,-x*.012],'kule-diregi');
    for(const y of [5,10])for(const s of [-1,1]){a('box','wood',0,y,s*3.3,7,.4,.4,UP,'kule-kusagi',true);a('box','wood',s*3.3,y,0,.4,.4,7,UP,'kule-kusagi',true);}
    a('box','wood',0,16.3,0,9.4,.8,9.4,UP,'kule-sahanligi');
    for(const s of [-1,1]){a('box','wood',0,17.6,s*4.5,9.4,1.6,.35,UP,'korkuluk');a('box','wood',s*4.5,17.6,0,.35,1.6,9.4,UP,'korkuluk');}
    for(const x of [-4.2,4.2])for(const z of [-4.2,4.2])a('box','wood',x,19,z,.4,4.6,.4,UP,'cati-diregi',true);
    a('roof','main',0,23,0,7.4,3.6,7.4,[0,Math.PI/4,0],'kule-catisi');a('box','wood',2.2,8,4.2,1.6,16,.3,[-.12,0,0],'merdiven',true);tug(b,0,24.4,0);
  }else{
    a('round',DARK,0,1,0,5,2,5,UP,'kule-temeli');a('round',STONE,0,9.5,0,3.7,17,3.7,UP,'kule-govdesi');
    a('round',DARK,0,18.3,0,4.8,1.2,4.8,UP,'kule-serefesi');
    for(let i=0;i<8;i++){const t=i/8*Math.PI*2;a('box',STONE,Math.sin(t)*4.4,19.6,Math.cos(t)*4.4,1.5,1.5,1.2,[0,t,0],'mazgal',true);}
    a('round',STONE,0,20.4,0,2.9,3,2.9,UP,'kule-kosku');cap(b,style,0,21.9,0,3.2);
    a('box',SHADE,0,3.2,3.6,1.9,4.2,.5,UP,'kule-kapisi');for(const y of [9,14])a('box',SHADE,0,y,3.6,.8,1.8,.4,UP,'mazgal-penceresi',true);
    banner(b,3.4,17.5,-2.4,.7);
  }
}
function farm(b,style){
  const a=b.add;
  a('box',EARTH,0,.4,0,21,.8,18,UP,'tarla');
  for(let i=0;i<5;i++)a('box',i%2?CROP:HAY,-7.6+i*3.1,1.5,2.2,2.1,1.5,12.4,UP,'ekin-sirasi');
  for(let i=0;i<5;i+=2)for(const z of [-2,2,6])a('cone',HAY,-7.6+i*3.1,2.9,z,.7,1.6,.7,UP,'basak-demeti',true);
  hut(b,style,-5.6,-6.6,.92);
  a('dome',HAY,5.2,.8,-6.4,2.5,3,2.5,UP,'saman-yigini');a('dome',HAY,8.4,.8,-4.2,1.6,2,1.6,UP,'saman-yigini',true);
  a('round','wood',9,2.4,5.4,.18,4.8,.18,UP,'korkuluk-diregi',true);a('box','main',9,3.8,5.4,2.6,1.2,.4,UP,'korkuluk',true);a('ball',HAY,9,5,5.4,.55,.55,.55,UP,'korkuluk-basi',true);
  for(let x=-10;x<=10.01;x+=4)a('box','wood',x,1.1,8.8,.4,2.2,.4,UP,'cit-kazigi',true);a('box','wood',0,1.7,8.8,20.5,.28,.28,UP,'cit');
  a('round','wood',1.6,1.6,-6.6,1.5,.5,1.5,[0,0,Math.PI/2],'kagni-tekeri',true);a('box','wood',1.6,2.2,-4.8,2.6,.5,3.4,UP,'kagni',true);
}
function ranch(b,style){
  const a=b.add;
  a('box',PASTURE,0,.4,0,21,.8,18,UP,'otlak');fence(b,19.5,16.5,0,5);
  hut(b,style,-5.4,-4.6,.82);
  sheep(b,3,-3,.6);sheep(b,6.4,.6,-.9);sheep(b,1.2,2.6,2.2);sheep(b,5.6,4.8,.2);sheep(b,-3.4,4.2,-2.2);ox(b,-6.4,2,1.2);
  a('box','wood',5.4,1.1,-6.4,5,.9,1.5,UP,'yalak');a('box',WATER,5.4,1.6,-6.4,4.4,.2,1,UP,'yalak-suyu',true);
  a('dome',HAY,-1,.8,-6.2,1.7,2,1.7,UP,'ot-yigini',true);
  a('round','wood',8.6,3.4,6.8,.2,6.8,.2,UP,'agil-diregi',true);a('sail','main',9.7,5.6,6.8,2.2,1.8,.2,UP,'agil-flamasi',true);
}
function roleTools(b,type,style,front){
  const a=b.add;
  if(type==='barracks'){
    for(const side of [-1,1]){a('dome','main',side*5.6,5,front+.3,1.7,.6,1.7,FLAT,'duvar-kalkani');a('ball','metal',side*5.6,5,front+.9,.4,.4,.4,UP,'kalkan-gobegi',true);}
    for(let i=0;i<3;i++){a('round','wood',7.6+i*.8,3.4,front+2.4,.14,6.6,.14,[-.2,0,(i-1)*.12],'kargi');a('leaf','metal',7.6+i*.8+(1-i)*.4,6.9,front+1.75,.4,1,.5,[-.2,0,0],'temren',true);}
    a('round','wood',-7.6,2.2,front+3,.25,4.4,.25,UP,'talim-kazigi');a('box',HAY,-7.6,3.4,front+3,2.4,1.4,1,UP,'talim-mankeni');a('ball',HAY,-7.6,4.8,front+3,.6,.6,.6,UP,'manken-basi',true);
    banner(b,-9,0,front-3,.95);
  }else if(type==='range'){
    for(const x of [-5.5,0,5.5]){a('round',HAY,x,3,front+5,1.9,.6,1.9,FLAT,'nisan-puta');a('round','main',x,3,front+5.35,1.05,.2,1.05,FLAT,'nisan-halkasi');a('round','trim',x,3,front+5.5,.4,.2,.4,FLAT,'nisan-gobegi',true);for(const s of [-1,1])a('box','wood',x+s*1.2,1.4,front+4.6,.3,2.8,.3,[.25,0,0],'puta-ayagi',true);}
    a('round',STONE,8.6,2.4,front+1,.8,4.8,.8,UP,'nisan-tasi');a('dome',STONE,8.6,4.8,front+1,.8,.7,.8,UP,'nisan-tasi-basi',true);
    a('box','wood',-8.4,1.6,front+1,2.4,.5,1.2,UP,'yay-sehpasi');for(const dx of [-.6,.6])a('bow','wood',-8.4+dx,2.9,front+1,1.5,.8,1,[0,Math.PI/2,Math.PI/2],'asili-yay',true);
  }else if(type==='stable'){
    fence(b,19,7,front+4,6);horse(b,-4.6,front+3.6);horse(b,4.8,front+4.4);
    a('dome',HAY,8,.6,front+1,1.7,1.9,1.7,UP,'ot-yigini');a('box','wood',-8,1.1,front+1.2,3.4,.9,1.3,UP,'yemlik');a('box',WATER,-8,1.6,front+1.2,2.9,.2,.9,UP,'yalak-suyu',true);
  }else if(type==='workshop'){
    for(const side of [-1,1])a('round','wood',side*6.6,2.1,front+2,2.1,.6,2.1,[0,0,Math.PI/2],'teker');
    a('box','wood',0,1.2,front+3,9,.9,3,UP,'tezgah');a('round','wood',0,4.2,front+3,.32,9,.32,[-1,0,0],'mancinik-kolu');a('ball',STONE,0,1.9,front+6.4,.9,.9,.9,UP,'gulle');
    for(let i=0;i<3;i++)a('round','wood',-8.2,1+i*.75,front+4.4,.4,6,.4,[Math.PI/2,0,0],'kereste',true);
    for(const dx of [0,1.6])a('ball',STONE,7.6+dx,1.3,front+5,.75,.75,.75,UP,'gulle',true);
  }else if(type==='forge'){
    a('box',STONE,-6.2,7,-3.6,3.4,14,3.4,UP,'ocak-bacasi');a('box',DARK,-6.2,14.2,-3.6,4.2,.9,4.2,UP,'baca-sapkasi',true);a('ball','glow',-6.2,15,-3.6,1.1,1,1.1,UP,'baca-koru');
    a('box',STONE,-6,2,front+2.2,4.4,4,3.4,UP,'demirci-ocagi');a('box',COAL,-6,2.3,front+3.95,2.8,2,.3,UP,'ocak-agzi');a('box','glow',-6,1.8,front+4.1,2.2,1,.25,UP,'kor');
    a('box','wood',2.4,.9,front+3.4,1.6,1.8,1.6,UP,'ors-kutugu');a('box','metal',2.4,2.2,front+3.4,2.8,.8,1.2,UP,'ors');a('cone','metal',4.2,2.2,front+3.4,.5,1.2,.5,[0,0,-Math.PI/2],'ors-burnu',true);
    a('round','wood',6.6,1.1,front+2.6,1.3,2.2,1.3,UP,'su-ficisi');a('round',WATER,6.6,2.25,front+2.6,1.1,.15,1.1,UP,'su',true);
    for(const dx of [-.5,.3,1.1])a('sail','metal',7.8+dx,3,front+.5,.5,3.2,.15,[0,0,-.15],'kilic-taslagi',true);
  }
}
const HALLS={barracks:[18,14,7,-1.5],range:[13,8,5.6,-5],stable:[19,8.5,5.4,-4.6],workshop:[16,12,7.6,-2.5],forge:[15,12,6.8,-2]};
export function buildBuildingModel(f,definition){
  const art=FACTION_ART[f.id]||FACTION_ART.osman,style=STYLE[f.id]||'kubbe',b=partBuilder({...art,main:f.color}),type=definition.type;
  if(type==='keep')keep(b,style);
  else if(type==='tower')watch(b,style);
  else if(type==='field')farm(b,style);
  else if(type==='ranch')ranch(b,style);
  else{const [w,d,h,zc]=HALLS[type]||HALLS.barracks;hall(b,style,w,d,h,zc);roleTools(b,type,style,zc+d/2);}
  return finishModel(b.parts,{id:definition.id,name:definition.name,faction:f.id,kind:'building',type,label:art.name});
}
