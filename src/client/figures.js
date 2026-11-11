import {finishModel} from './geometry.js';

export const FACTION_ART=Object.freeze({
  sedef:{name:'Kabuk ve kemer',main:0x57b9dc,cloth:0x204d67,metal:0xd9e8d8,trim:0xe8c77c,wood:0x74716a,skin:0xe9c3a2,glow:0xadefff},
  filiz:{name:'Yaprak ve kök',main:0x78c765,cloth:0x294c3d,metal:0xa1b69c,trim:0xdce6a0,wood:0x665a3b,skin:0xd9b998,glow:0xc4f28c},
  koz:{name:'Plaka ve basınç',main:0xe79650,cloth:0x542f26,metal:0x566672,trim:0xffd28a,wood:0x4f4140,skin:0xc49a7c,glow:0xffb34e},
  pus:{name:'Tül ve kızak',main:0xb69adf,cloth:0x493a64,metal:0xb8a8bf,trim:0xdacaa8,wood:0x79614d,skin:0xd2a884,glow:0xd4b6ff},
  yel:{name:'Kanat ve sancak',main:0xe5c962,cloth:0x394b5a,metal:0xc8d8d9,trim:0xfff1be,wood:0x766449,skin:0xd5af8c,glow:0xe7f6f0},
  prizma:{name:'Kırınım ve halka',main:0xd77fbb,cloth:0x393b63,metal:0xc0c4df,trim:0xf2dbec,wood:0x59617e,skin:0xdacdd8,glow:0xa9e9f5}
});
export const HERO_ART=Object.freeze({
  sedef_hero_0:{label:'Kabuk kalkanlı öncü',weapon:'trident',head:'shellFan',signature:'shellPauldron',width:1.28,height:1.05,cape:'short'},
  sedef_hero_1:{label:'Çift sancaklı kaptan',weapon:'sword',head:'crest',signature:'twinPennant',width:1.1,height:1.2,cape:'split'},
  sedef_hero_2:{label:'Dalga asalı koruyucu',weapon:'waveStaff',head:'halo',signature:'pearlMantle',width:.88,height:1.18,cape:'robe'},
  filiz_hero_0:{label:'Uzun yaylı iz sürücü',weapon:'longbow',head:'leafHood',signature:'leafQuiver',width:.85,height:1.17,cape:'leaf'},
  filiz_hero_1:{label:'Dallı taçlı kök önderi',weapon:'branchBlade',head:'antlers',signature:'rootMantle',width:1.02,height:1.24,cape:'split'},
  filiz_hero_2:{label:'Tohum fenerli şifacı',weapon:'seedStaff',head:'petals',signature:'seedLanterns',width:1.2,height:1.05,cape:'robe'},
  koz_hero_0:{label:'İki elli ağır çekiç ustası',weapon:'greatHammer',head:'visor',signature:'twinExhaust',width:1.5,height:.95,cape:'apron'},
  koz_hero_1:{label:'Plaka kalkanlı ocak muhafızı',weapon:'shieldMaul',head:'anvil',signature:'forgeStandard',width:1.62,height:1.04,cape:'short'},
  koz_hero_2:{label:'Basınç kollu menzilli usta',weapon:'cannon',head:'goggles',signature:'furnacePack',width:1.35,height:1.08,cape:'apron'},
  pus_hero_0:{label:'Çift iğneli çevik atıcı',weapon:'needles',head:'veil',signature:'ribbonTail',width:.83,height:1.04,cape:'split'},
  pus_hero_1:{label:'Kervan sancağı taşıyan kılıççı',weapon:'sabre',head:'turban',signature:'lanternStandard',width:1.05,height:1.19,cape:'short'},
  pus_hero_2:{label:'Küreli tül dokuyucu',weapon:'orbStaff',head:'crescent',signature:'veilScrolls',width:1.13,height:1.12,cape:'robe'},
  yel_hero_0:{label:'Atlı sancak mızrakçısı',weapon:'lance',head:'winged',signature:'riderPennant',width:.96,height:1.1,cape:'split',mounted:true},
  yel_hero_1:{label:'Arbaletli ufuk nişancısı',weapon:'crossbow',head:'goggles',signature:'windVane',width:.88,height:1.18,cape:'short'},
  yel_hero_2:{label:'Yel sancağının çift kılıçlısı',weapon:'twinSabres',head:'swept',signature:'windStandard',width:1.1,height:1.23,cape:'split'},
  prizma_hero_0:{label:'Üç eksenli küre yöneticisi',weapon:'orbit',head:'triHalo',signature:'orbitSpines',width:.9,height:1.16,cape:'facets',floating:true},
  prizma_hero_1:{label:'Çift çatallı yankı kurucusu',weapon:'tuningFork',head:'prismHood',signature:'resonanceBack',width:.84,height:1.32,cape:'split'},
  prizma_hero_2:{label:'Mercek asalı ışık onarıcısı',weapon:'lensStaff',head:'shardCrown',signature:'lensMantle',width:1.25,height:1.08,cape:'facets'}
});
export function partBuilder(palette){
  const parts=[];
  function add(shape,slot,x,y,z,sx,sy,sz,rotation=[0,0,0],tag='',detail=false){
    parts.push({shape,color:palette[slot]??slot,position:[x,y,z],scale:[sx,sy,sz],rotation,tag,detail});
  }
  return {parts,palette,add};
}
function headgear(b,kind,y,w=1){
  const a=b.add;
  if(kind==='shellFan'){
    a('dome','metal',0,y,0,1.25*w,.75,1.05);
    for(const side of [-1,0,1])a('leaf','main',side*.7*w,y+.7,-.15,.75,1.3,.8,[0,0,-side*.5],'shell-crest');
  }else if(kind==='leafHood'){
    a('leaf','main',0,y+.2,-.25,2.4,1.6,3,[.25,0,0],'leaf-hood');
  }else if(kind==='antlers'){
    for(const side of [-1,1]){a('round','wood',side*.9,y+.9,-.2,.15,2.2,.15,[0,0,-side*.45],'antler');a('leaf','trim',side*1.6,y+1.55,-.1,.75,.7,1,[0,0,-side*.6],'antler-leaf');}
  }else if(kind==='petals'){
    for(let i=0;i<5;i++){const t=i/5*Math.PI*2;a('leaf','main',Math.sin(t)*1.1,y+.25,Math.cos(t),1.4,1.35,2,[.45*Math.cos(t),t,.45*Math.sin(t)],'petal-collar');}
  }else if(['visor','anvil','goggles'].includes(kind)){
    a('box','metal',0,y,0,2.5*w,.9,2.1,[0,0,0],'flat-helmet');
    if(kind==='anvil')a('box','trim',0,y+.8,0,3.2,.6,1.3,[0,0,.1],'anvil-crest');
    else if(kind==='goggles')for(const side of [-1,1])a('torus','glow',side*.5,y,1.05,.42,.42,.7,[0,0,0],'goggle');
    else a('box','cloth',0,y-.1,1.05,1.8,.3,.2,[0,0,0],'visor-slot');
  }else if(['veil','turban','crescent'].includes(kind)){
    a('dome','main',0,y-.3,0,1.25*w,1.1,1.15);
    a('box','cloth',0,y-.4,1,1.7,.75,.3,[0,0,0],'face-wrap');
    if(kind==='turban')a('torus','trim',0,y+.15,0,1.2,1.2,1.1,[Math.PI/2,0,0],'wrapped-band');
    if(kind==='crescent')a('bow','trim',0,y+.8,-.25,2,1.5,1,[0,0,0],'crescent-brim');
  }else if(['winged','swept','crest'].includes(kind)){
    a('dome','metal',0,y-.3,0,1.1,.8,1.1);
    if(kind==='crest')a('sail','main',0,y+.6,0,.5,2.2,2.4,[0,0,0],'crest');
    else for(const side of [-1,1])a('leaf','trim',side*1.1,y+.6,-.5,1.7,1.5,1.3,[.2,-side*.4,-side*.65],'wing-helm');
  }else if(kind==='halo'||kind==='triHalo'){
    a('torus','trim',0,y+.4,-.7,kind==='halo'?1.8:2.3,kind==='halo'?1.8:2.3,1,[0,0,0],'halo');
    if(kind==='triHalo')for(const side of [-1,0,1])a('crystal','glow',side*1.6,y+1.5-Math.abs(side)*.5,-.7,.45,.8,.4,[0,0,0],'halo-shard');
  }else if(kind==='prismHood'){
    a('crystal','metal',0,y+.1,-.3,1.25,1.8,1.1,[0,0,0],'faceted-hood');
  }else if(kind==='shardCrown'){
    for(const side of [-1,0,1])a('crystal','trim',side*.85,y+.7-Math.abs(side)*.3,0,.45,1.2,.45,[0,0,-side*.3],'shard-crown');
  }
}
function cloak(b,kind,width,height,lift){
  const a=b.add;
  if(kind==='robe')a('taper','cloth',0,lift+2.3*height,-.25,1.75*width,4*height,1.4,[0,0,0],'robe');
  else if(kind==='leaf')for(const side of [-1,1])a('leaf','main',side*.7,lift+3.1*height,-1.1,1.8,2.9*height,1.4,[.2,side*.3,side*.35],'leaf-cloak');
  else if(kind==='facets')for(const side of [-1,1])a('crystal','cloth',side*1.4,lift+3.3*height,-.8,1.2,2.4*height,.45,[0,side*.3,side*.35],'facet-mantle');
  else if(kind==='apron')a('box','cloth',0,lift+2.6*height,1.1,2.1*width,3.1*height,.3,[0,0,0],'apron');
  else for(const side of kind==='split'?[-1,1]:[0])a('sail','cloth',side*.65*width,lift+3.1*height,-1,kind==='split'?1.7*width:3.2*width,(kind==='short'?2.8:4.4)*height,.3,[.12,0,side*.12],'cloth-tail');
}
function humanoid(b,f,{width=1,height=1,lift=0,cape=null,head=null}={}){
  const a=b.add;
  a(f.id==='koz'?'box':f.id==='prizma'?'crystal':'taper','main',0,lift+3.2*height,0,1.25*width,2.6*height,1.05,[0,0,0],'torso');
  for(const side of [-1,1])a('box','metal',side*.62*width,lift+height,0,.62,2*height,.75,[0,0,0],'leg');
  for(const side of [-1,1])a('box','main',side*1.35*width,lift+3.55*height,.3,.55,1.8*height,.65,[0,0,-side*.2],'arm');
  a('ball','skin',0,lift+5.15*height,.12,.88,.95,.85,[0,0,0],'head');
  const kinds={sedef:'shellFan',filiz:'leafHood',koz:'visor',pus:'veil',yel:'winged',prizma:'prismHood'};
  headgear(b,head||kinds[f.id],lift+5.95*height,width);
  if(cape)cloak(b,cape,width,height,lift);
  if(f.id==='sedef')for(const side of [-1,1])a('dome','metal',side*1.2*width,lift+4.1*height,0,.85,.65,1.1,[0,0,side*.45],'shell-shoulder');
  if(f.id==='filiz')a('leaf','trim',.5,lift+3.5*height,1,1.2,1.5,1,[0,0,-.5],'leaf-vest');
  if(f.id==='koz')for(const side of [-1,1])a('box','metal',side*1.15*width,lift+3.9*height,0,1.1,1.3,1.7,[0,0,side*.1],'armor-pauldron');
  if(f.id==='pus')a('sail','trim',0,lift+2.7*height,1.15,2.7,1.3,.15,[0,0,.4],'diagonal-sash');
  if(f.id==='yel')a('sail','trim',0,lift+2.2*height,-1.2,2.4,3.5,.15,[.1,0,0],'split-coat');
  if(f.id==='prizma')for(const side of [-1,1])a('crystal','trim',side*1.15*width,lift+4.1*height,0,.7,1.3,.6,[0,0,-side*.4],'shard-shoulder');
}
function weapon(b,kind,y){
  const a=b.add;
  const shaft=(x,z=0,h=6)=>a('round','wood',x,y,z,.15,h,.15,[0,0,0],'weapon-shaft');
  if(['spear','trident','lance'].includes(kind)){
    shaft(1.8,0,kind==='lance'?9:7);
    const points=kind==='trident'?[-.6,0,.6]:[0];for(const dx of points)a('leaf','metal',1.8+dx,y+(kind==='lance'?4.7:3.6),0,.55,1,.8,[0,0,0],'spear-tip');
    if(kind==='lance')a('sail','trim',2.6,y+2.8,0,1.7,2,.2,[0,0,0],'lance-pennant');
  }else if(['sword','sabre','branchBlade','twinSabres'].includes(kind)){
    for(const side of kind==='twinSabres'?[-1,1]:[1]){
      const x=side*1.8;shaft(x,0,1.3);a(kind==='branchBlade'?'leaf':'sail','metal',x+side*.25,y+1.5,0,kind==='branchBlade'?1.7:1,3.8,.25,[0,0,-side*(kind==='sabre'?.4:.15)],'blade');
    }
  }else if(['longbow','crossbow'].includes(kind)){
    a('bow','wood',0,y,1.7,kind==='longbow'?2.4:2.8,kind==='longbow'?3.1:1.3,1,[0,0,kind==='crossbow'?Math.PI/2:0],'bow');
    a('box','trim',0,y,1.7,.15,kind==='longbow'?6:4,.15,[0,0,kind==='crossbow'?Math.PI/2:0],'bow-string');
    if(kind==='crossbow')a('box','metal',0,y,1.4,.5,.7,4.2,[0,0,0],'crossbow-stock');
  }else if(['greatHammer','shieldMaul'].includes(kind)){
    shaft(1.8,0,kind==='greatHammer'?7:4);a('box','metal',1.8,y+(kind==='greatHammer'?3.3:1.7),0,kind==='greatHammer'?4.5:2.3,1.6,1.9,[0,0,0],'hammer-head');
    if(kind==='shieldMaul')a('box','main',-2.1,y-.2,.8,2.6,5,.65,[0,.15,0],'tower-shield');
  }else if(kind==='cannon'){
    a('round','metal',1.6,y,1.2,.9,4.8,.9,[Math.PI/2,0,0],'cannon-barrel');
    a('torus','trim',1.6,y,3.6,1.2,1.2,1,[0,0,0],'cannon-muzzle');
  }else if(kind==='needles'){
    for(const side of [-1,1]){a('bow','metal',side*2.2,y+.7,.7,1.3,1.3,1,[0,side*.4,side*.4],'throwing-disc');a('leaf','trim',side*1.9,y-.7,1.1,.5,1.7,.6,[0,0,side*.6],'throwing-needle');}
  }else if(['waveStaff','seedStaff','orbStaff','tuningFork','lensStaff'].includes(kind)){
    shaft(1.9,0,7);
    if(kind==='waveStaff'){a('bow','trim',1.9,y+3.5,0,1.6,1.6,1,[0,0,0],'wave-fork');a('ball','glow',1.9,y+3.4,0,.7,.7,.7,[0,0,0],'pearl');}
    if(kind==='seedStaff'){a('leaf','main',1.9,y+3.6,0,2.8,1.8,2.2,[0,0,0],'seed-cage');a('ball','glow',1.9,y+3.6,.2,.7,.8,.7,[0,0,0],'seed-light');}
    if(kind==='orbStaff'){a('torus','trim',1.9,y+3.6,0,1.3,1.3,1,[0,0,0],'orb-cage');a('ball','glow',1.9,y+3.6,0,.85,.85,.85,[0,0,0],'focus-orb');}
    if(kind==='tuningFork')for(const side of [-1,1]){a('round','metal',1.9+side*.8,y+3.5,0,.17,3.5,.17,[0,0,0],'fork-prong');a('crystal','glow',1.9+side*.8,y+5.2,0,.35,.6,.35,[0,0,0],'fork-tip');}
    if(kind==='lensStaff'){a('torus','metal',1.9,y+3.6,0,2.1,2.1,.8,[0,0,0],'focus-lens');a('crystal','glow',1.9,y+3.6,0,1.1,1.1,.4,[0,0,0],'lens-core');}
  }else if(kind==='orbit'){
    for(const side of [-1,1]){a('ball','glow',side*2.2,y+1.2,.8,.85,.85,.85,[0,0,0],'orbit-orb');a('torus','trim',side*2.2,y+1.2,.8,1.2,1.2,1,[Math.PI/2,0,side*.6],'orbit-ring');}
  }
}
function signature(b,kind,y){
  const a=b.add;
  if(kind==='shellPauldron'){a('dome','main',-2,y-.5,.4,2.1,1.3,1.8,[Math.PI/2,0,0],'great-shell');a('torus','trim',-2,y-.5,1.5,1.3,1.3,.6,[0,0,0],'shell-rim');}
  if(['twinPennant','forgeStandard','lanternStandard','windStandard'].includes(kind)){
    const xs=kind==='twinPennant'?[-1.7,1.7]:[-1.7];
    for(const x of xs){a('round','wood',x,y+1.3,-1.5,.18,8,.18,[0,0,0],'standard-pole');a('sail','main',x+.8,y+3.6,-1.5,2.5,3,.2,[0,0,0],'standard');}
    if(kind==='forgeStandard')a('box','metal',-1.7,y+5.4,-1.5,3,.6,1.4,[0,0,0],'standard-anvil');
    if(kind==='lanternStandard')for(let i=0;i<3;i++)a('ball','glow',-2+i*.7,y+1.7-i*.3,-1.4,.4,.7,.4,[0,0,0],'hanging-lantern');
    if(kind==='windStandard')a('leaf','trim',.9,y+4.5,-1.6,3,1.5,1,[0,0,Math.PI/2],'wind-streamer');
  }
  if(kind==='pearlMantle')for(const side of [-1,0,1])a('ball','glow',side*1.6,y+1.3-Math.abs(side)*.5,-1,.55,.55,.55,[0,0,0],'mantle-pearl');
  if(kind==='leafQuiver'){a('round','cloth',-.9,y-1.2,-1.3,.65,3,.65,[0,0,.2],'quiver');for(const side of [-1,0,1])a('leaf','trim',-.9+side*.4,y+.7,-1.2,.5,1.2,.5,[0,0,.2],'arrow-fletch');}
  if(kind==='rootMantle')for(const side of [-1,1])a('leaf','wood',side*1.7,y+.3,-1,1.6,3,1,[0,side*.2,-side*.35],'root-mantle');
  if(kind==='seedLanterns')for(const side of [-1,1])a('ball','glow',side*2,y-1,-.6,.65,1,.65,[0,0,0],'seed-lantern');
  if(kind==='twinExhaust')for(const side of [-1,1]){a('round','metal',side*.8,y+.2,-1.5,.45,5,.45,[0,0,side*.15],'exhaust');a('dome','glow',side*1.1,y+2.8,-1.5,.55,.9,.55,[0,0,0],'exhaust-glow');}
  if(kind==='furnacePack'){a('ball','metal',0,y-.7,-1.6,1.8,2,1.4,[0,0,0],'furnace-tank');a('torus','glow',0,y-.7,-2.8,1.2,1.2,1,[0,0,0],'furnace-coil');}
  if(kind==='ribbonTail')for(const side of [-1,1])a('sail','trim',side*1.1,y-1.5,-1.8,1,4.8,.16,[.4,0,side*.3],'long-ribbon');
  if(kind==='veilScrolls'){a('box','trim',-1.8,y-1,0,1.5,2,.35,[0,0,-.3],'scroll-book');a('sail','cloth',-1.6,y+.7,-.7,4.5,1.2,.15,[0,0,-.2],'veil-train');}
  if(kind==='riderPennant')a('sail','main',0,y+2,-2,1.8,4.6,.2,[.15,0,.3],'rider-pennant');
  if(kind==='windVane'){a('round','metal',0,y+1,-1.1,.15,5,.15,[0,0,0],'vane-pole');for(const side of [-1,1])a('leaf','trim',side*1.8,y+3,-1,2.6,1.3,.7,[0,0,Math.PI/2],'vane-wing');}
  if(kind==='orbitSpines')for(const side of [-1,0,1])a('crystal','main',side*1.55,y+.7-Math.abs(side),-1.3,.6,3.5-Math.abs(side),.6,[0,0,-side*.2],'orbit-spine');
  if(kind==='resonanceBack')for(const side of [-1,1]){a('round','metal',side*1.4,y+.5,-1.2,.2,5+side,.2,[0,0,-side*.1],'back-resonator');a('torus','glow',side*1.4,y+2.7+side*.5,-1.2,.8,.8,.5,[0,0,0],'resonator-ring');}
  if(kind==='lensMantle')for(const side of [-1,1]){a('crystal','metal',side*1.8,y,-1,1.1,2.5,.5,[0,0,-side*.45],'lens-mantle');a('crystal','glow',side*2.7,y+.6,-.5,.35,.65,.35,[0,0,0],'orbit-shard');}
}
function mount(b,f){
  const a=b.add;
  if(f.id==='koz'){
    a('box','metal',0,2,0,5,2,6,[0,0,0],'war-cart');
    for(const side of [-1,1])a('round','wood',side*2.8,1.4,0,1.8,.8,1.8,[0,0,Math.PI/2],'cart-wheel');
  }else if(f.id==='pus'){
    for(const side of [-1,1])a('box','wood',side*1.8,.7,0,.65,.6,8,[0,0,0],'glider-skid');
    a('box','metal',0,1.7,0,3.6,1.3,5,[0,0,0],'glider-deck');a('sail','main',0,4.6,-2.4,4,5,.25,[0,0,0],'glider-sail');
  }else{
    a(f.id==='prizma'?'crystal':'box',f.id==='prizma'?'main':'wood',0,2.9,0,2.5,2.6,5.5,[0,0,0],'mount-body');
    for(const side of [-1,1])for(const z of [-1.8,1.8])a(f.id==='prizma'?'crystal':'box','metal',side*.9,1.25,z,.55,2.5,.6,[0,0,0],'mount-leg');
    a('taper','wood',0,4,2.3,.9,2.8,.9,[.5,0,0],'mount-neck');a(f.id==='prizma'?'crystal':'ball','main',0,5.3,2.9,.8,1,.95,[0,0,0],'mount-head');
    if(f.id==='filiz')for(const side of [-1,1])a('leaf','trim',side*.65,6,3,1,1.4,.6,[0,0,-side*.3],'mount-antler');
    if(f.id==='sedef')a('dome','metal',0,3.7,0,1.6,1.2,2.5,[0,0,0],'shell-barding');
    if(f.id==='yel')a('sail','trim',0,3,-3,.7,3,.18,[.4,0,0],'mount-streamer');
  }
}
function siege(b,f){
  const a=b.add;
  if(f.id==='sedef'){
    a('taper','wood',0,2,0,4,2,7,[0,0,Math.PI],'boat-chassis');for(const side of [-1,1])a('bow','metal',side*3,4,-1,1.2,3.7,1,[0,Math.PI/2,0],'catapult-rib');a('round','wood',0,6,0,.4,9,.4,[.7,0,0],'throwing-arm');a('dome','main',0,9,2,2,1,2,[Math.PI,0,0],'sling-cup');
  }else if(f.id==='filiz'){
    for(const side of [-1,1])a('leaf','wood',side*2.8,4,0,2,6,3,[0,0,-side*.4],'living-spring');a('leaf','main',0,6,0,5,5,5,[.8,0,0],'seed-launcher');a('ball','glow',0,8,1,1.4,1.4,1.4,[0,0,0],'seed-shot');
  }else if(f.id==='koz'){
    a('box','metal',0,2.5,0,7,4,8,[0,0,0],'armored-chassis');a('round','metal',0,6,1,1.5,10,1.5,[Math.PI/2-.15,0,0],'siege-barrel');a('torus','trim',0,6.8,5.8,2,2,1,[0,0,0],'muzzle');
  }else if(f.id==='pus'){
    for(let i=0;i<3;i++){const t=i/3*Math.PI*2;a('box','wood',Math.sin(t)*2.7,2.5,Math.cos(t)*2.7,.65,5,.65,[Math.cos(t)*.5,0,-Math.sin(t)*.5],'mortar-tripod');}a('taper','metal',0,5,0,2.5,5,2.5,[.3,0,0],'mortar-pot');a('torus','trim',0,7.5,-.7,2,2,1,[Math.PI/2-.3,0,0],'mortar-mouth');
  }else if(f.id==='yel'){
    a('box','wood',0,2,0,5,3,9,[0,0,0],'ballista-stock');a('bow','metal',0,5,2,5.5,2.5,1,[0,Math.PI,0],'ballista-bow');a('box','trim',0,5,2,10,.15,.15,[0,0,0],'ballista-string');a('leaf','metal',0,5,5,.6,2,.5,[Math.PI/2,0,0],'ballista-bolt');
  }else{
    for(let i=0;i<3;i++){const t=i/3*Math.PI*2;a('crystal','main',Math.sin(t)*3.4,4,Math.cos(t)*3.4,1,5,1,[0,0,0],'lens-pylon');}a('torus','metal',0,6,0,3.4,3.4,1.6,[0,0,0],'siege-lens');a('crystal','glow',0,6,0,2.4,2.4,.7,[0,0,0],'siege-focus');
  }
  if(!['pus','prizma'].includes(f.id))for(const side of [-1,1])for(const z of [-2.4,2.4])a('round','metal',side*3.4,1.5,z,1.8,.8,1.8,[0,0,Math.PI/2],'siege-wheel');
}
export function buildHeroModel(f,definition){
  const design=HERO_ART[definition.id];if(!design)throw Error('Kahraman görünümü bulunamadı: '+definition.id);
  const ranged=definition.range>18,rangedWeapons=['longbow','waveStaff','seedStaff','cannon','needles','orbStaff','crossbow','orbit','tuningFork','lensStaff'];
  if(ranged!==rangedWeapons.includes(design.weapon))throw Error('Kahraman menzili ve donanımı uyuşmuyor: '+definition.id);
  const b=partBuilder({...FACTION_ART[f.id],main:f.color}),lift=design.mounted?4:design.floating ? .65 : 0;
  if(design.mounted)mount(b,f);
  humanoid(b,f,{width:design.width,height:design.height,lift,cape:design.cape,head:design.head});
  weapon(b,design.weapon,lift+3.8*design.height);signature(b,design.signature,lift+4.3*design.height);
  if(design.floating)b.add('torus','glow',0,.3,0,2,2,.6,[Math.PI/2,0,0],'hover-ring');
  for(const part of b.parts){part.position=part.position.map(n=>n*1.45);part.scale=part.scale.map(n=>n*1.45);}
  return finishModel(b.parts,{id:definition.id,name:definition.name,kind:'hero',faction:f.id,label:design.label,weapon:design.weapon,attackMode:ranged?'ranged':'melee',definitionRange:definition.range});
}
export function buildBattalionModel(f,definition){
  const b=partBuilder({...FACTION_ART[f.id],main:f.color}),role=definition.role;
  if(role==='siege')siege(b,f);
  else{
    const cavalry=role==='cavalry',lift=cavalry?3.7:0;
    if(cavalry)mount(b,f);
    humanoid(b,f,{width:f.id==='koz'?1.3:f.id==='filiz'?.8:1,height:f.id==='koz'?.95:1,lift,cape:f.id==='filiz'?'leaf':f.id==='yel'?'split':null});
    if(role==='ranged')weapon(b,f.id==='koz'?'crossbow':f.id==='prizma'?'orbit':'longbow',lift+3.5);
    else if(role==='special')weapon(b,{sedef:'waveStaff',filiz:'seedStaff',koz:'greatHammer',pus:'needles',yel:'twinSabres',prizma:'tuningFork'}[f.id],lift+3.5);
    else{
      weapon(b,{sedef:'trident',filiz:'branchBlade',koz:'shieldMaul',pus:'twinSabres',yel:'lance',prizma:'spear'}[f.id],lift+3.6);
      if(f.id==='sedef')b.add('dome','main',-1.9,lift+3,.8,1.7,.7,1.7,[Math.PI/2,0,0],'shell-shield');
      if(f.id==='filiz')b.add('leaf','main',-1.7,lift+3,.7,2.3,2.4,2,[0,0,-.2],'leaf-shield');
      if(f.id==='prizma')b.add('crystal','metal',-1.8,lift+3,.8,1.2,1.6,.35,[0,0,0],'shard-shield');
    }
  }
  return finishModel(b.parts,{id:definition.id,name:definition.name,kind:'unit',faction:f.id,role,label:FACTION_ART[f.id].name});
}
export function buildEscortModel(){
  const b=partBuilder(FACTION_ART.yel),a=b.add;
  a('box','wood',0,2.8,0,9,3.5,7,[0,0,0],'supply-deck');
  for(const side of [-1,1])a('box','metal',side*5,1,0,1,1,11,[0,0,0],'sledge-runner');
  a('sail','main',0,7,0,9,6,7,[0,0,0],'supply-canopy');a('box','trim',0,4.8,1,5,2,4,[0,0,0],'cargo');
  return finishModel(b.parts,{id:'escort',name:'İkmal kızağı',kind:'escort'});
}
