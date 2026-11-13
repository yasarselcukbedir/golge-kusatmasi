import {finishModel} from './geometry.js';

// Anadolu beylikleri: her beyliğin kendi rengi, başlığı ve donanımı vardır.
// Ortak dil: kaftan, şalvar, kuşak, çizme, yuvarlak kalkan, eğri kılıç, yay ve tuğ.
export const FACTION_ART=Object.freeze({
  osman:{name:'Ak börk ve al sancak',main:0xd9483b,cloth:0x3b2f2b,metal:0xc9ced4,trim:0xf2e6c6,wood:0x6b4a2e,skin:0xe0b58f,glow:0xffe2a0,fur:0x4a3a2c,boot:0x2e2622,horse:0x6b4a2e,hair:0x2a211c,head:'bork',shield:true},
  aydin:{name:'Sarık ve deniz mavisi',main:0x4fb3d9,cloth:0x1f3f55,metal:0xbfd0d6,trim:0xf2e6c4,wood:0x70553a,skin:0xdcae88,glow:0xbfeaff,fur:0x3f3a36,boot:0x2a2622,horse:0x8a7256,hair:0x2a211c,head:'sarik',shield:true},
  candar:{name:'Demir tolga ve bakır',main:0xe79650,cloth:0x4a2d22,metal:0x77838d,trim:0xffd28a,wood:0x5a4334,skin:0xd2a67f,glow:0xffb34e,fur:0x3a2e28,boot:0x241e1c,horse:0x4a3a30,hair:0x2a211c,head:'migfer',shield:true,armor:true},
  germiyan:{name:'Kalpak ve keçe',main:0xa78bdc,cloth:0x3d3355,metal:0xb9adc4,trim:0xe6d6a8,wood:0x79614d,skin:0xd9ad86,glow:0xd4b6ff,fur:0x4a3b2f,boot:0x2c2530,horse:0x9a8468,hair:0x2a211c,head:'kalpak',shield:false},
  dulkadir:{name:'Tuğlu tolga ve bozkır atı',main:0xe5c962,cloth:0x4a3c2a,metal:0xcfd6d0,trim:0xfff1be,wood:0x766449,skin:0xd5af8c,glow:0xfff0b0,fur:0x5a4632,boot:0x2e2820,horse:0x3f3028,hair:0x2a211c,head:'tuglu',shield:true},
  karaman:{name:'Külah ve yeşil kaftan',main:0x4fae7a,cloth:0x24453a,metal:0xc0c8c2,trim:0xf2e3c0,wood:0x5f5340,skin:0xdcb48e,glow:0xbff0d0,fur:0x3f372e,boot:0x262a26,horse:0xc8bca6,hair:0x2a211c,head:'kulah',shield:true}
});
export const HERO_ART=Object.freeze({
  osman_hero_0:{label:'Atlı gazi, kılıç ve kalkan',weapon:'kilic',head:'kavuk',shield:true,mounted:true,signature:'tug',width:1.12,height:1.1,cape:'long'},
  osman_hero_1:{label:'Gürzlü, tuğlu tolgalı bey',weapon:'gurz',head:'tuglu',shield:true,armor:true,signature:'sancak',width:1.25,height:1.1,cape:'short'},
  osman_hero_2:{label:'Yaylı hükümdar',weapon:'yay',head:'kavuk',signature:'tug',width:1,height:1.18,cape:'long'},
  aydin_hero_0:{label:'Yaylı deniz gazisi',weapon:'yay',head:'sarik',signature:'sancak',width:1,height:1.14,cape:'short'},
  aydin_hero_1:{label:'Kılıçlı kurucu bey',weapon:'kilic',head:'migfer',shield:true,armor:true,signature:'tug',width:1.18,height:1.1,cape:'short'},
  aydin_hero_2:{label:'Ciritli bey',weapon:'cirit',head:'kavuk',signature:'tug',width:1.02,height:1.16,cape:'long'},
  candar_hero_0:{label:'Gürzlü zırhlı bey',weapon:'gurz',head:'migfer',shield:true,armor:true,signature:'tug',width:1.4,height:1.02,cape:'short'},
  candar_hero_1:{label:'Atlı baltalı paşa',weapon:'balta',head:'tuglu',armor:true,mounted:true,signature:'sancak',width:1.3,height:1.05,cape:'short'},
  candar_hero_2:{label:'Zemberekli kale beyi',weapon:'zemberek',head:'kavuk',armor:true,signature:'tug',width:1.2,height:1.1,cape:'long'},
  germiyan_hero_0:{label:'Yaylı Türkmen beyi',weapon:'yay',head:'kalpak',signature:'tug',width:1,height:1.1,cape:'short'},
  germiyan_hero_1:{label:'Atlı kılıçlı bey',weapon:'kilic',head:'kalpak',shield:true,mounted:true,signature:'sancak',width:1.1,height:1.12,cape:'long'},
  germiyan_hero_2:{label:'Ciritli bey',weapon:'cirit',head:'kavuk',signature:'tug',width:1.05,height:1.14,cape:'long'},
  dulkadir_hero_0:{label:'Atlı kargılı bozkır beyi',weapon:'kargi',head:'tuglu',shield:true,mounted:true,signature:'tug',width:1.05,height:1.1,cape:'short'},
  dulkadir_hero_1:{label:'Atlı okçu bey',weapon:'yay',head:'kalpak',mounted:true,signature:'sancak',width:.98,height:1.1,cape:'short'},
  dulkadir_hero_2:{label:'Kılıç ve kalkanlı bey',weapon:'kilic',head:'migfer',shield:true,armor:true,signature:'tug',width:1.2,height:1.16,cape:'long'},
  karaman_hero_0:{label:'Fermanlı, asalı bey',weapon:'asa',head:'kavuk',signature:'tug',width:1.02,height:1.2,cape:'long'},
  karaman_hero_1:{label:'Yaylı dağ beyi',weapon:'yay',head:'migfer',armor:true,signature:'sancak',width:1.08,height:1.14,cape:'short'},
  karaman_hero_2:{label:'Ciritli, külahlı bey',weapon:'cirit',head:'kulah',signature:'tug',width:1,height:1.18,cape:'long'}
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
  if(kind==='bork'){            // ak börk: keçe başlık, arkaya sarkan yatırma
    a('round','main',0,y-.22,0,1,.32,1,[0,0,0],'bork-band');
    a('taper','trim',0,y+.55,0,.92,1.5,.92,[0,0,0],'bork');
    a('sail','trim',0,y+.35,-.85,1.25,1.7,.22,[.35,0,0],'bork-yatirma',true);
  }else if(kind==='sarik'){     // sarık
    a('torus','trim',0,y-.05,0,.92,.92,1.7,[Math.PI/2,0,0],'sarik');
    a('dome','main',0,y+.05,0,.72,.85,.72,[0,0,0],'sarik-tepe');
  }else if(kind==='migfer'||kind==='tuglu'){   // sivri tolga, zırh etek
    a('cone','metal',0,y+.45,0,1.02,1.7,1.02,[0,0,0],'tolga');
    a('round','metal',0,y+1.45,0,.1,.7,.1,[0,0,0],'tolga-sivri',true);
    a('box','metal',0,y-.7,-.5,1.75,1,.4,[0,0,0],'zirh-etek',true);
    if(kind==='tuglu')a('leaf','main',0,y+2.2,-.35,.55,1.5,1,[.5,0,0],'tolga-tugu');
  }else if(kind==='kalpak'){    // kürk kalpak
    a('round','fur',0,y+.1,0,1.1,.95,1.1,[0,0,0],'kalpak');
    a('dome','main',0,y+.55,0,.86,.7,.86,[0,0,0],'kalpak-tepe');
  }else if(kind==='kulah'){     // uzun keçe külah
    a('cone','trim',0,y+.85,0,.86,2.5,.86,[0,0,0],'kulah');
    a('torus','main',0,y-.15,0,.9,.9,1.2,[Math.PI/2,0,0],'kulah-sarigi');
  }else if(kind==='kavuk'){     // bey kavuğu ve sorguç
    a('torus','trim',0,y,0,1.12,1.12,2,[Math.PI/2,0,0],'kavuk');
    a('dome','main',0,y+.15,0,.85,1.15,.85,[0,0,0],'kavuk-tepe');
    a('leaf','glow',0,y+1.55,.75,.4,1.5,.3,[.15,0,0],'sorguc');
  }
}
function cloak(b,kind,width,height,lift){
  const a=b.add;
  if(kind==='long')a('sail','cloth',0,lift+2.7*height,-1.05,2.9*width,4.6*height,.3,[.12,0,0],'kaftan-etegi');
  else if(kind==='short')a('sail','cloth',0,lift+3.2*height,-1,2.6*width,2.9*height,.3,[.12,0,0],'pelerin');
}
function humanoid(b,f,{width=1,height=1,lift=0,cape=null,head=null,armor=false}={}){
  const a=b.add,art=FACTION_ART[f.id];
  for(const side of [-1,1])a('box','boot',side*.55*width,lift+.6*height,.1,.62,1.2*height,.95,[0,0,0],'cizme');
  for(const side of [-1,1])a('ball','cloth',side*.56*width,lift+1.65*height,0,.74,.95*height,.8,[0,0,0],'salvar');
  a('taper','main',0,lift+3.15*height,0,1.3*width,2.9*height,1.02,[0,0,0],'kaftan');
  a('round','trim',0,lift+2.45*height,0,1.2*width,.34,1,[0,0,0],'kusak');
  a('box','trim',0,lift+3.5*height,.72,.34,2*height,.2,[0,0,0],'kaftan-onu',true);
  if(armor||art.armor){
    a('box','metal',0,lift+3.7*height,.5,1.75*width,1.55*height,.5,[0,0,0],'cebe');
    for(const side of [-1,1])a('dome','metal',side*1.2*width,lift+4.2*height,0,.72,.5,.8,[0,0,side*.4],'omuzluk');
  }
  for(const side of [-1,1])a('box','main',side*1.32*width,lift+3.55*height,.25,.5,1.8*height,.62,[0,0,-side*.2],'kol');
  a('ball','skin',0,lift+5.1*height,.1,.86,.93,.84,[0,0,0],'bas');
  a('box','hair',0,lift+4.92*height,.86,.72,.17,.14,[0,0,0],'biyik',true);
  headgear(b,head||art.head,lift+5.92*height,width);
  if(cape)cloak(b,cape,width,height,lift);
}
function shield(b,y,width=1){
  b.add('dome','main',-1.78*width,y,.95,1.5,.55,1.5,[Math.PI/2,0,0],'kalkan');
  b.add('ball','metal',-1.78*width,y,1.5,.36,.36,.36,[0,0,0],'kalkan-gobegi');
  b.add('torus','trim',-1.78*width,y,1,1.42,1.42,.6,[0,0,0],'kalkan-kenari',true);
}
function quiver(b,y){
  b.add('round','cloth',-.85,y-.2,-1.15,.5,2.7,.5,[0,0,.25],'sadak');
  for(const dx of [-.25,.05,.35])b.add('leaf','trim',-1.15+dx,y+1.45,-1.15,.34,.9,.3,[0,0,.25],'ok-tuyu',true);
}
function weapon(b,kind,y){
  const a=b.add;
  const shaft=(x,z=0,h=6)=>a('round','wood',x,y,z,.15,h,.15,[0,0,0],'sap');
  if(kind==='kilic'){
    a('round','wood',1.8,y-.5,.15,.17,1.1,.17,[0,0,0],'kabza');
    a('box','trim',1.8,y+.05,.15,.9,.2,.4,[0,0,0],'balcak',true);
    a('sail','metal',1.95,y+1.9,.15,.85,3.7,.2,[0,0,-.28],'egri-kilic');
  }else if(kind==='kargi'){
    shaft(1.8,0,8.4);a('leaf','metal',1.8,y+4.5,0,.55,1.2,.7,[0,0,0],'temren');
    a('cone','main',1.8,y+3.35,0,.42,1,.42,[Math.PI,0,0],'kargi-tugu');
  }else if(kind==='yay'){
    a('bow','wood',-1.35,y,1.35,2.2,1,1.2,[0,Math.PI/2,Math.PI/2],'yay');
    a('box','trim',-1.35,y,1.35,.1,4.3,.1,[0,0,0],'kiris',true);
    a('round','wood',-1.35,y,2.2,.2,.9,.2,[0,0,0],'yay-kabzasi',true);
    quiver(b,y);
  }else if(kind==='gurz'){
    shaft(1.8,0,4.6);a('ball','metal',1.8,y+2.6,0,.9,.9,.9,[0,0,0],'gurz');
    for(let i=0;i<4;i++){const t=i/4*Math.PI*2;a('crystal','metal',1.8+Math.sin(t)*.75,y+2.6,Math.cos(t)*.75,.3,.5,.3,[0,0,0],'gurz-dilimi',true);}
  }else if(kind==='balta'){
    shaft(1.8,0,6.4);a('sail','metal',2.5,y+2.5,0,1.5,1.7,.3,[0,0,-Math.PI/2],'balta');
    a('leaf','metal',1.8,y+3.6,0,.4,.9,.5,[0,0,0],'balta-ucu',true);
  }else if(kind==='cirit'){
    for(const dx of [0,.45]){a('round','wood',1.7+dx,y+.4,.2+dx,.1,5.6,.1,[.25,0,0],'cirit');a('leaf','metal',1.7+dx,y+3.1,.9+dx,.34,.9,.4,[.25,0,0],'cirit-ucu',true);}
  }else if(kind==='asa'){
    shaft(1.9,0,7.6);a('bow','trim',1.9,y+4.1,0,.95,.95,1,[0,0,Math.PI/2],'alem');a('ball','glow',1.9,y+3.7,0,.42,.42,.42,[0,0,0],'alem-topu');
    a('round','trim',-1.6,y+.2,.9,.35,1.7,.35,[0,0,Math.PI/2],'ferman',true);
  }else if(kind==='zemberek'){
    a('bow','wood',0,y,1.9,1.7,.9,1.2,[Math.PI/2,0,0],'zemberek-yayi');
    a('box','metal',0,y,1.6,.5,.6,3.6,[0,0,0],'zemberek-govdesi');a('box','trim',0,y,1.9,3.4,.12,.12,[0,0,0],'kiris',true);
  }else if(kind==='kement'){
    a('torus','trim',1.9,y+1.2,.3,1.1,1.1,.7,[.3,0,.2],'kement');
    a('sail','metal',-1.9,y+1.4,.15,.8,3.2,.2,[0,0,.28],'kisa-kilic',true);
  }else if(kind==='hancer'){
    for(const side of [-1,1])a('leaf','metal',side*1.8,y+.6,.6,.4,1.7,.5,[.4,0,side*.3],'hancer');
  }
}
function signature(b,kind,y){
  const a=b.add;
  if(kind==='tug'){             // tuğ: at kılı püskül ve alem
    a('round','wood',-1.9,y+1.4,-1.5,.17,8.4,.17,[0,0,0],'tug-sirigi');
    a('ball','trim',-1.9,y+5.7,-1.5,.45,.45,.45,[0,0,0],'tug-topu');
    a('cone','main',-1.9,y+4.6,-1.5,.6,1.7,.6,[Math.PI,0,0],'tug-kili');
    a('bow','trim',-1.9,y+6.2,-1.5,.6,.6,1,[0,0,Math.PI/2],'tug-alemi',true);
  }else if(kind==='sancak'){
    a('round','wood',-1.9,y+1.4,-1.5,.17,8.4,.17,[0,0,0],'sancak-sirigi');
    a('sail','main',-.8,y+4.2,-1.5,2.6,2.8,.2,[0,0,0],'sancak');
    a('ball','trim',-1.9,y+5.7,-1.5,.4,.4,.4,[0,0,0],'sancak-alemi',true);
  }
}
function mount(b,f,barded=false){
  const a=b.add;
  a('box','horse',0,2.95,0,2.3,2.5,5.6,[0,0,0],'at-govdesi');
  for(const side of [-1,1])for(const z of [-1.9,1.9])a('box','horse',side*.85,1.2,z,.5,2.5,.58,[0,0,0],'at-bacagi');
  a('taper','horse',0,4.3,2.5,.85,3,.9,[.55,0,0],'at-boynu');
  a('box','horse',0,5.6,3.35,.8,1,1.9,[.35,0,0],'at-basi');
  for(const side of [-1,1])a('cone','horse',side*.3,6.35,3,.16,.5,.16,[0,0,0],'at-kulagi',true);
  a('box','hair',0,5.2,1.9,.3,1.6,1.3,[.55,0,0],'yele',true);
  a('sail','hair',0,3.1,-3.2,.5,2.4,.4,[.5,0,0],'kuyruk');
  a('box','main',0,4.25,-.2,2.5,.5,2.6,[0,0,0],'eyer-ortusu');
  a('box','trim',0,4.55,-.2,1.5,.35,1.7,[0,0,0],'eyer',true);
  if(barded||FACTION_ART[f.id].armor){a('box','metal',0,3.4,1.2,2.5,1.9,2.4,[0,0,0],'at-zirhi');a('box','metal',0,5.75,3.6,.9,.7,1.3,[.35,0,0],'alinlik',true);}
}
function siege(b,f){
  const a=b.add;
  if(f.id==='candar'){          // şahi top
    a('box','wood',0,1.9,-.4,3.4,1.4,7,[0,0,0],'top-kundagi');
    a('round','trim',0,3.7,.8,1.15,8,1.15,[Math.PI/2-.14,0,0],'top-namlusu');
    a('torus','metal',0,4.25,4.6,1.45,1.45,1,[0,0,0],'top-agzi');
    for(const z of [-1,1.6])a('torus','metal',0,3.5+z*.14,z,1.3,1.3,.8,[0,0,0],'top-cemberi',true);
  }else if(f.id==='germiyan'){  // arabalı zemberek
    a('box','wood',0,2,0,4.2,1.6,8,[0,0,0],'araba');
    a('bow','wood',0,4.4,2.4,4.8,2.2,1.4,[Math.PI/2,0,0],'zemberek-yayi');
    a('box','trim',0,4.4,2.4,9.2,.14,.14,[0,0,0],'kiris',true);a('box','wood',0,4,0,.8,.8,7,[0,0,0],'ok-yatagi');
    a('leaf','metal',0,4.6,4.4,.6,2,.5,[Math.PI/2,0,0],'ok');
  }else{                        // mancınık
    a('box','wood',0,1,0,5,1,8.5,[0,0,0],'mancinik-tabani');
    for(const side of [-1,1]){a('box','wood',side*2.1,5,0,.55,8.6,.55,[.22,0,0],'direk');a('box','wood',side*2.1,5,0,.55,8.6,.55,[-.22,0,0],'capraz-direk',true);}
    a('round','metal',0,8.6,0,.3,5,.3,[0,0,Math.PI/2],'mil');
    a('round','wood',0,9.4,-1.4,.34,12,.34,[-.95,0,0],'mancinik-kolu');
    a('box','metal',0,6.4,2.5,2.2,2.4,2.2,[0,0,0],'agirlik');
    a('ball','wood',0,12.6,-6,.9,.9,.9,[0,0,0],'gulle');
    if(f.id==='aydin')a('sail','main',0,6,-3.4,3.4,3.2,.2,[0,0,0],'flama',true);
  }
  for(const side of [-1,1])for(const z of [-2.5,2.5])a('round','wood',side*2.9,1.5,z,1.7,.7,1.7,[0,0,Math.PI/2],'teker');
}
const UNIT_WEAPONS={
  infantry:{osman:'kilic',aydin:'kilic',candar:'kargi',germiyan:'kargi',dulkadir:'kargi',karaman:'kilic'},
  ranged:{osman:'yay',aydin:'yay',candar:'zemberek',germiyan:'yay',dulkadir:'yay',karaman:'yay'},
  cavalry:{osman:'kilic',aydin:'kargi',candar:'gurz',germiyan:'kilic',dulkadir:'kargi',karaman:'kargi'},
  special:{osman:'asa',aydin:'cirit',candar:'balta',germiyan:'hancer',dulkadir:'kement',karaman:'asa'}
};
export function buildHeroModel(f,definition){
  const design=HERO_ART[definition.id];if(!design)throw Error('Kahraman görünümü bulunamadı: '+definition.id);
  const ranged=definition.range>18,rangedWeapons=['yay','cirit','asa','zemberek'];
  if(ranged!==rangedWeapons.includes(design.weapon))throw Error('Kahraman menzili ve donanımı uyuşmuyor: '+definition.id);
  const b=partBuilder({...FACTION_ART[f.id],main:f.color}),lift=design.mounted?4:0;
  if(design.mounted)mount(b,f,!!design.armor);
  humanoid(b,f,{width:design.width,height:design.height,lift,cape:design.cape,head:design.head,armor:!!design.armor});
  if(design.shield)shield(b,lift+3.1*design.height,design.width);
  weapon(b,design.weapon,lift+3.8*design.height);signature(b,design.signature,lift+4.3*design.height);
  for(const part of b.parts){part.position=part.position.map(n=>n*1.45);part.scale=part.scale.map(n=>n*1.45);}
  return finishModel(b.parts,{id:definition.id,name:definition.name,kind:'hero',faction:f.id,label:design.label,weapon:design.weapon,attackMode:ranged?'ranged':'melee',definitionRange:definition.range});
}
export function buildBattalionModel(f,definition){
  const art=FACTION_ART[f.id]||FACTION_ART.germiyan,b=partBuilder({...art,main:f.color}),role=definition.role,id=FACTION_ART[f.id]?f.id:'germiyan',faction={...f,id};
  if(role==='siege')siege(b,faction);
  else{
    const cavalry=role==='cavalry',lift=cavalry?3.9:0,special=role==='special';
    if(cavalry)mount(b,faction);
    humanoid(b,faction,{width:id==='candar'?1.18:1,height:1,lift,cape:special?'long':null,head:special?(id==='osman'||id==='karaman'?'kulah':id==='aydin'?'sarik':art.head):null,armor:cavalry&&id!=='germiyan'});
    weapon(b,UNIT_WEAPONS[role]?.[id]||'kilic',lift+3.6);
    if((role==='infantry'||cavalry)&&art.shield)shield(b,lift+3.05);
  }
  return finishModel(b.parts,{id:definition.id,name:definition.name,kind:'unit',faction:f.id,role,label:art.name});
}
export function buildEscortModel(){
  const b=partBuilder(FACTION_ART.dulkadir),a=b.add;
  a('box','wood',0,3,0,7,1.2,10,[0,0,0],'kervan-arabasi');
  for(const side of [-1,1])for(const z of [-3,3])a('round','wood',side*4,2,z,2.2,.7,2.2,[0,0,Math.PI/2],'teker');
  a('dome','trim',0,3.6,-.5,3.6,5,5,[0,0,0],'araba-tentesi');
  a('box','main',0,4.4,3.6,4.4,2.2,2.4,[0,0,0],'denkler');a('box','wood',0,6,4.6,3,1.4,1.6,[0,0,0],'sandik',true);
  return finishModel(b.parts,{id:'escort',name:'Kervan arabası',kind:'escort'});
}
