import {finishModel} from './geometry.js';
import {FACTION_ART,partBuilder} from './figures.js';

function sedef(b,type){
  const a=b.add;
  if(type==='keep'){
    a('round','metal',0,1,0,15,2,15,[0,0,0],'round-bastion-base');a('round','wood',0,8,0,10,14,10,[0,0,0],'drum-keep');a('dome','main',0,15,0,11,8,11,[0,0,0],'great-shell-dome');
    for(let i=0;i<3;i++){const t=i/3*Math.PI*2,x=Math.sin(t)*12,z=Math.cos(t)*12;a('round','metal',x,7,z,3.1,12,3.1,[0,0,0],'coastal-bastion');a('dome','main',x,13,z,3.6,4,3.6,[0,0,0],'bastion-cap');}
    a('bow','trim',0,3,0,16,16,1,[Math.PI/2,0,0],'crescent-wall');
  }else if(type==='tower'){
    a('round','wood',0,11,0,4,22,4,[0,0,0],'lighthouse-drum');a('dome','main',0,22,0,7,7,7,[0,0,0],'lighthouse-shell');a('torus','trim',0,21,0,7,7,1,[Math.PI/2,0,0],'round-parapet');
  }else{
    a('round','metal',0,1,0,10,2,10,[0,0,0],'circular-plinth');a('round','wood',0,5,0,7.5,8,7.5,[0,0,0],'curved-hall');a('dome','main',0,9,0,9,5.5,9,[0,0,0],'shell-roof');
    for(const x of [-4,0,4])a('bow','trim',x,10,0,2.3,5.5,1,[0,Math.PI/2,0],'shell-roof-rib');
  }
  const z=type==='keep'?10:type==='tower'?4:7.5;
  for(const x of [-2.8,2.8])a('round','metal',x,4,z,.65,7,.65,[0,0,0],'portal-column');a('bow','trim',0,6.8,z,2.8,2.8,.8,[0,0,0],'portal-arch');
}
function filiz(b,type){
  const a=b.add;
  if(type==='keep'){
    a('taper','wood',0,11,0,5,22,5,[0,0,0],'living-trunk');
    for(let i=0;i<5;i++){const t=i/5*Math.PI*2;a('leaf','wood',Math.sin(t)*6,5,Math.cos(t)*6,6,7,4,[0,t,-.45],'root-buttress');a('leaf','main',Math.sin(t)*5,23,Math.cos(t)*5,11,11,9,[Math.PI/2,t,0],'great-canopy');}
    a('leaf','trim',0,29,0,8,5,5,[0,0,0],'crown-leaf');
  }else if(type==='tower'){
    for(let i=0;i<3;i++){const t=i/3*Math.PI*2;a('taper','wood',Math.sin(t)*3,11,Math.cos(t)*3,.9,23,.9,[Math.cos(t)*.15,0,-Math.sin(t)*.15],'braided-lookout');}
    for(let i=0;i<4;i++){const t=i/4*Math.PI*2;a('leaf','main',Math.sin(t)*3,23,Math.cos(t)*3,8,7,6,[Math.PI/2,t,0],'lookout-petal');}
  }else{
    for(const x of [-6,6])for(const z of [-5,5])a('taper','wood',x,5.5,z,.7,11,.7,[z*.025,0,-x*.025],'living-post');
    for(let i=0;i<3;i++)a('leaf',i===1?'trim':'main',i*5-5,12,0,9,11,5,[Math.PI/2,.2*i,0],'woven-leaf-roof');
    a('box','wood',0,1,0,17,2,14,[0,0,0],'root-floor');
  }
  for(const side of [-1,1])a('leaf','trim',side*4,5,type==='keep'?4:6,3,4,3,[0,0,-side*.4],'leaf-door-frame');
}
function koz(b,type){
  const a=b.add;
  if(type==='keep'){
    a('box','metal',0,2,0,27,4,25,[0,0,0],'fortress-step');a('box','wood',0,7,0,22,8,20,[0,0,0],'armored-block');a('box','main',0,15,0,17,10,15,[0,0,0],'upper-foundry');
    for(const side of [-1,1]){a('box','metal',side*10,10,0,3,14,17,[0,0,0],'plate-buttress');a('box','metal',side*5.5,side<0?21:18,-5,3.5,side<0?27:21,3.5,[0,0,0],'asymmetric-stack');a('dome','glow',side*5.5,side<0?34.5:28.5,-5,2,2,2,[0,0,0],'hot-stack');}
  }else if(type==='tower'){
    a('box','metal',0,8,0,10,16,10,[0,0,0],'armored-turret');a('box','main',0,18,0,14,5,13,[0,0,0],'gun-deck');a('round','metal',0,19,7,1.4,10,1.4,[Math.PI/2,0,0],'defense-barrel');
  }else{
    a('box','metal',0,1,0,21,2,19,[0,0,0],'factory-slab');a('box','wood',0,5,0,18,8,16,[0,0,0],'factory-hall');a('box','main',0,10,0,20,2,18,[0,0,0],'flat-armored-roof');
    for(let i=0;i<3;i++)a('sail','metal',i*5-5,12,-1,3.6,4,9,[0,0,0],'sawtooth-vent');a('box','metal',7,12,-5,3,22,3,[0,0,0],'pressure-stack');
  }
  a('box','cloth',0,4.5,type==='keep'?10.1:8.1,6,7,.4,[0,0,0],'furnace-mouth');a('box','glow',0,3.5,type==='keep'?10.4:8.4,4,3,.3,[0,0,0],'furnace-fire');
}
function pus(b,type){
  const a=b.add;
  if(type==='keep'){
    for(const side of [-1,1])a('box','wood',side*12,1,0,1.2,1.5,27,[0,0,0],'keep-sledge-rail');
    a('box','wood',0,2,0,24,2,22,[0,0,0],'caravan-deck');
    a('roof','main',-4,12,-3,11,20,10,[0,.45,0],'great-tension-tent');a('roof','cloth',8,8,5,7,12,7,[0,.15,0],'side-tent');
    for(const x of [-11,11]){a('round','wood',x,13,-8,.45,26,.45,[0,0,0],'tension-mast');a('sail','trim',x+2,22,-8,4,5,.2,[0,0,0],'hanging-pennant');}
    a('sail','trim',0,15,6,15,8,.5,[.35,0,Math.PI/2],'connecting-awning');
  }else if(type==='tower'){
    for(let i=0;i<3;i++){const t=i/3*Math.PI*2;a('round','wood',Math.sin(t)*3,11,Math.cos(t)*3,.45,22,.45,[Math.cos(t)*.22,0,-Math.sin(t)*.22],'tripod-lookout');}
    a('box','wood',0,18,0,10,1.5,9,[0,0,0],'lookout-platform');a('roof','main',0,23,0,7,8,7,[0,.4,0],'lookout-awning');
  }else{
    for(const side of [-1,1])a('box','wood',side*9,1,0,.8,1,20,[0,0,0],'hall-skid');a('box','wood',0,2,0,18,1.5,17,[0,0,0],'trading-floor');
    a('roof','main',-3,8,-2,8,12,8,[0,.3,0],'offset-tent');a('sail','trim',5,8,5,8,8,.5,[.25,0,.5],'low-awning');a('round','wood',7,8,-5,.3,16,.3,[0,0,.1],'leaning-mast');
  }
  for(let i=0;i<3;i++)a('ball','glow',-3+i*3,7-i%2,type==='keep'?10:8,.7,1,.7,[0,0,0],'hanging-lantern');
}
function vane(b,y,z=0){
  for(let i=0;i<4;i++){const t=i/4*Math.PI*2;b.add('leaf','trim',Math.sin(t)*3,y+Math.cos(t)*3,z,3.4,5,1,[0,0,-t],'wind-vane-blade');}
  b.add('ball','metal',0,y,z,1,1,1,[0,0,0],'vane-hub');
}
function yel(b,type){
  const a=b.add;
  if(type==='keep'){
    for(let i=0;i<3;i++){const t=i/3*Math.PI*2;a('box','wood',Math.sin(t)*6.5,8,Math.cos(t)*6.5,1.5,17,1.5,[Math.cos(t)*.15,0,-Math.sin(t)*.15],'wind-keep-stilt');}
    a('round','metal',0,17,0,10,2,10,[0,0,0],'elevated-deck');a('taper','main',0,22,0,6,8,6,[0,0,0],'wind-nacelle');
    for(const side of [-1,1])a('sail','trim',side*9,23,0,8,15,.7,[0,side*.5,-side*.2],'great-wind-sail');a('round','metal',0,27,0,.5,14,.5,[0,0,0],'rotor-mast');vane(b,30,3);
  }else if(type==='tower'){
    for(const x of [-4,4])for(const z of [-3,3])a('box','wood',x,10,z,.7,20,.7,[0,0,-x*.025],'open-watch-stilt');a('box','metal',0,20,0,11,2,9,[0,0,0],'watch-deck');a('sail','main',0,25,0,11,9,.5,[0,Math.PI/2,0],'watch-sail');vane(b,27,3);
  }else{
    a('box','wood',0,3,0,18,2,16,[0,0,0],'raised-hall');
    for(const x of [-6,6])for(const z of [-5,5])a('box','metal',x,7,z,.65,12,.65,[0,0,-x*.09],'a-frame-post');
    for(const side of [-1,1])a('sail','main',side*4,12,0,8,12,1,[0,Math.PI/2,-side*.4],'hall-fin');a('round','metal',-7,13,-5,.25,24,.25,[0,0,0],'weather-pole');a('leaf','trim',-5,23,-5,4,1.5,1,[0,0,Math.PI/2],'weather-flag');
  }
}
function prizma(b,type){
  const a=b.add;
  if(type==='keep'){
    a('box','metal',0,1.5,0,24,3,24,[0,Math.PI/4,0],'mirror-dais');a('box','cloth',0,4,0,19,2,19,[0,Math.PI/4,0],'upper-dais');
    for(let i=0;i<3;i++){const t=i/3*Math.PI*2;a('crystal','main',Math.sin(t)*11,12,Math.cos(t)*11,2,12,2,[0,0,0],'triad-obelisk');}
    a('crystal','main',0,19,0,7.5,11,7.5,[0,.3,0],'levitating-heart');a('torus','trim',0,14,0,10,10,3,[Math.PI/2,0,0],'horizontal-focus-ring');a('torus','glow',0,21,0,8,8,2,[0,0,.25],'vertical-focus-ring');
  }else if(type==='tower'){
    a('round','metal',0,2,0,7,4,7,[0,0,0],'faceted-foot');a('crystal','main',0,15,0,4,12,4,[0,0,0],'watch-obelisk');a('torus','glow',0,20,0,7,7,2,[Math.PI/2,0,0],'watch-lens');a('crystal','trim',0,28,0,2.5,4,2.5,[0,0,0],'floating-watch-tip');
  }else{
    a('round','metal',0,1,0,10,2,10,[0,0,0],'focus-plinth');
    for(let i=0;i<3;i++){const t=i/3*Math.PI*2;a('crystal','main',Math.sin(t)*7,6,Math.cos(t)*7,1.3,6,1.3,[0,0,0],'focus-leg');}
    a('crystal','main',0,12,0,10,1.6,9,[0,.3,0],'floating-facet-roof');a('ball','glow',0,6,0,2.5,2.5,2.5,[0,0,0],'suspended-focus');a('torus','trim',0,8,0,5.5,5.5,1,[Math.PI/2,0,0],'hall-resonator');
  }
}
function garden(b,f){
  const a=b.add;
  if(f.id==='koz'){
    a('box','metal',0,1,0,20,2,17,[0,0,0],'ore-yard');for(let i=0;i<3;i++){a('box','wood',i*6-6,3,0,4,3,12,[0,0,0],'ore-trough');a('crystal','main',i*6-6,5,0,1.8,2.3,3,[0,0,0],'ore-load');}a('round','metal',7,8,-5,1,14,1,[0,0,0],'extractor-pipe');
  }else if(f.id==='prizma'){
    a('box','metal',0,1,0,20,2,18,[0,Math.PI/12,0],'growth-mirror');for(const x of [-6,0,6])for(const z of [-4,4])a('crystal','main',x,5,z,1.7,2.5,1.7,[0,.3,0],'floating-growth-crystal');
  }else{
    a(f.id==='sedef'?'round':'box','wood',0,.8,0,f.id==='sedef'?10:20,1.6,f.id==='sedef'?9:18,[0,0,0],'garden-base');
    for(let i=0;i<4;i++){
      if(f.id==='filiz')for(const z of [-4,2])a('leaf','main',i*4.5-6.5,3,z,2.8,3,2,[0,0,0],'leaf-crop');
      else a('box','main',i*4.5-6.5,2.3,0,2,1.5,13,[0,0,0],'harvest-row');
    }
    if(f.id==='sedef'){a('dome','main',6,3,-6,3.5,3,3.5,[0,0,0],'water-cistern');a('bow','metal',6,4,-6,2,2,1,[0,0,0],'cistern-arch');}
    if(f.id==='pus'){a('sail','trim',0,8,-4,17,8,.4,[.6,0,0],'shade-cloth');for(const x of [-8,8])a('round','wood',x,5,-4,.25,10,.25,[0,0,0],'garden-mast');}
    if(f.id==='yel'){a('round','metal',7,7,-5,.3,14,.3,[0,0,0],'wind-pump');for(let i=0;i<4;i++){const t=i/4*Math.PI*2;a('leaf','trim',7+Math.sin(t)*2,13+Math.cos(t)*2,-5,2.2,3,1,[0,0,-t],'pump-sail');}}
  }
}
function roleTools(b,type,f){
  const a=b.add;
  if(type==='barracks')for(const side of [-1,1])a(f.id==='prizma'?'crystal':f.id==='filiz'?'leaf':'box','metal',side*5.5,5,8.5,2.5,4,.4,[0,0,side*.1],'barracks-shield');
  if(type==='range'){a('torus','trim',6,6,9,2.3,2.3,.8,[0,0,0],'archery-target');a('round','wood',6,3,9,.3,6,.3,[0,0,0],'target-post');}
  if(type==='stable'){for(const x of [-8,-4,0,4,8])a('box','wood',x,3,9,.5,5,.5,[0,0,0],'stable-fence');a('box','metal',0,4,9,17,.5,.5,[0,0,0],'fence-rail');}
  if(type==='workshop'){
    if(f.id==='prizma')a('torus','glow',6,5,8,3,3,1,[0,0,0],'workshop-lens');
    else if(f.id==='koz')a('round','metal',5,5,8,1,7,1,[Math.PI/2,0,0],'workshop-barrel');
    else{for(const side of [-1,1])a('round','metal',side*4.5,3,9,2,1,2,[0,0,Math.PI/2],'workshop-wheel');a('box','wood',0,4,9,8,1,2,[0,0,0],'workshop-bench');}
  }
  if(type==='forge'){
    a(f.id==='prizma'?'crystal':f.id==='filiz'?'dome':'round','metal',-4,4,7,2.6,4,2.6,[0,0,0],'forge-hearth');a('crystal','glow',-4,6.7,7,1.5,2,1.5,[0,0,0],'forge-core');
    if(f.id==='koz'){a('box','metal',-6,15,-4,3,27,3,[0,0,0],'second-forge-stack');a('box','trim',5,5,9,4,2,2,[0,0,0],'anvil');}
  }
}
export function buildBuildingModel(f,definition){
  const b=partBuilder({...FACTION_ART[f.id],main:f.color}),type=definition.type;
  if(type==='field')garden(b,f);else({sedef,filiz,koz,pus,yel,prizma}[f.id])(b,type);
  if(!['keep','field','tower'].includes(type))roleTools(b,type,f);
  return finishModel(b.parts,{id:definition.id,name:definition.name,faction:f.id,kind:'building',type,label:FACTION_ART[f.id].name});
}
