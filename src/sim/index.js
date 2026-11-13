import {RULES,FACTIONS,MAPS,MISSIONS,MODES,DIFFICULTIES,factionById,mapById,getCatalog} from './data.js';
import {nextRandom,stableHash} from './rng.js';
import {fogTexture,fogCell} from './fog.js';
export {fogCell};
export {RULES,FACTIONS,MAPS,MISSIONS,MODES,DIFFICULTIES,getCatalog};
export const VERSION=1;
const clone=x=>JSON.parse(JSON.stringify(x));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const counters={infantry:'cavalry',cavalry:'ranged',ranged:'infantry'};
const defOf=(s,e)=>e.player<0?null:[...factionById(s.players[e.player].faction).units,...factionById(s.players[e.player].faction).heroes,...factionById(s.players[e.player].faction).buildings].find(d=>d.id===e.type);
const playerFaction=(s,p)=>factionById(s.players[p].faction);
const alive=e=>e.hp>0;
const entity=(s,id)=>s.entities.find(e=>e.id===id&&alive(e));
// Orders and rendering share stable, role-aware ranks. No RNG is consumed.
const rank={infantry:0,cavalry:1,special:2,hero:3,ranged:4,siege:5};
export function formationOrders(units,point,map){
 const sorted=[...units].sort((a,b)=>(rank[a.role]??2)-(rank[b.role]??2)||a.id-b.id);
 const center=units.reduce((p,e)=>({x:p.x+e.x/units.length,y:p.y+e.y/units.length}),{x:0,y:0});
 const facing=Math.atan2(point.y-center.y,point.x-center.x),forward={x:Math.cos(facing),y:Math.sin(facing)},right={x:-forward.y,y:forward.x};
 const columns=Math.min(4,Math.ceil(Math.sqrt(sorted.length))),rows=Math.ceil(sorted.length/columns),spacing=RULES.formationSpacing;
 return sorted.map((e,i)=>{const row=Math.floor(i/columns),count=Math.min(columns,sorted.length-row*columns),side=i%columns-(count-1)/2,depth=(rows-1)/2-row;
  return {id:e.id,x:clamp(point.x+right.x*side*spacing+forward.x*depth*spacing,6,map.width-6),y:clamp(point.y+right.y*side*spacing+forward.y*depth*spacing,6,map.height-6),facing,slot:i};
 });
}
export function separateUnits(state,map){
 const units=state.entities.filter(e=>e.hp>0&&['unit','hero','neutral'].includes(e.kind)).sort((a,b)=>a.id-b.id);
 // Rebuild buckets each pass, so a crowd crossing a cell edge is still resolved.
 for(let pass=0;pass<RULES.separationPasses;pass++){
  const cells=new Map();
  for(const e of units){const key=`${Math.floor(e.x/24)},${Math.floor(e.y/24)}`;if(!cells.has(key))cells.set(key,[]);cells.get(key).push(e);}
  for(const a of units)for(let x=Math.floor(a.x/24)-1;x<=Math.floor(a.x/24)+1;x++)for(let y=Math.floor(a.y/24)-1;y<=Math.floor(a.y/24)+1;y++)for(const b of cells.get(`${x},${y}`)||[]){
   if(b.id<=a.id)continue;
   const minimum=a.team===b.team?RULES.allySeparation:RULES.enemySeparation;let dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);if(d>=minimum)continue;
   if(d<1e-8){const angle=((a.id*73+b.id*151)%360)*Math.PI/180;dx=Math.cos(angle);dy=Math.sin(angle);d=0;}
   else{dx/=d;dy/=d;}
   const mobile=e=>!e.buffs?.some(b=>b.kind==='stun'&&b.until>state.time),ma=mobile(a)?1:0,mb=mobile(b)?1:0,total=ma+mb;if(!total)continue;
   const push=minimum-d;
   a.x=clamp(a.x-dx*push*ma/total,0,map.width);a.y=clamp(a.y-dy*push*ma/total,0,map.height);
   b.x=clamp(b.x+dx*push*mb/total,0,map.width);b.y=clamp(b.y+dy*push*mb/total,0,map.height);
  }
 }
}
export function battalionLayout(entity,definition){
 const count=entity.kind==='hero'?1:Math.max(1,Math.ceil((definition?.soldiers||1)*entity.hp/entity.maxHp));
 const heading=entity.facing??(entity.team===1?Math.PI:0),c=Math.cos(heading),s=Math.sin(heading),points=[];
 for(let i=0;i<count;i++){
  let forward,side;
  if(entity.role==='cavalry'){const row=Math.floor(i/2);forward=-row*2.6;side=(i%2?1:-1)*(1.3+row*.7);}
  else if(entity.role==='special'){const angle=i/count*Math.PI*2;forward=count===1?0:Math.cos(angle)*3;side=count===1?0:Math.sin(angle)*3;}
  else{const cols=entity.role==='siege'?2:3,row=Math.floor(i/cols),inRow=Math.min(cols,count-row*cols);forward=-row*2.2;side=(i%cols-(inRow-1)/2)*2.1+(entity.role==='ranged'&&row%2?0.6:0);}
  points.push({index:i,x:entity.x+c*forward-s*side,y:entity.y+s*forward+c*side,heading});
 }
 return points;
}

function emit(s,type,data={}){s.events.push({tick:s.tick,type,...data});if(s.events.length>RULES.maxEvents)s.events.shift();}
function spawn(s,p,type,x,y,extra={}){
 const f=p>=0?playerFaction(s,p):null,d=f?[...f.units,...f.heroes,...f.buildings].find(d=>d.id===type):null;
 if(p>=0&&!d)throw Error('Bilinmeyen içerik');
 const kind=extra.kind||(f.buildings.includes(d)?'building':f.heroes.includes(d)?'hero':'unit');
 let hp=d?.hp||320;if(p>=0&&s.players[p].upgrades.some(id=>f.upgrades.find(u=>u.id===id)?.stat==='hp')&&kind!=='building')hp*=f.upgrades.find(u=>u.stat==='hp').multiplier;
 const e={id:s.nextId++,player:p,team:p<0?-1:s.players[p].team,type,kind,role:d?.role||'neutral',x,y,hp,maxHp:hp,level:1,xp:0,facing:p>=0&&s.players[p].team===1?Math.PI:0,cooldown:nextRandom(s),lastHit:-100,order:null,buffs:[],abilityReady:{},readyAt:s.time,queue:[],rally:null,...extra};
 s.entities.push(e);emit(s,'spawn',{id:e.id,player:p,kind,role:e.role,faction:f?.id??null,x:e.x,y:e.y});return e;
}
function normalize(config){
 const mission=config.mission?MISSIONS.find(m=>m.id===config.mission):null;if(config.mission&&!mission)throw Error('Geçersiz görev');
 const mode=config.mode||'1v1';if(!MODES.includes(mode))throw Error('Geçersiz kip');
 const sizes=mode.split('v').map(Number),count=sizes[0]+sizes[1];
 if(mission&&mode!=='1v1')throw Error('Görev yalnızca 1v1');
 const factions=config.factions||mission?.factions||Array.from({length:count},(_,i)=>FACTIONS[i%6].id);
 if(!Array.isArray(factions)||factions.length!==count||factions.some(id=>!factionById(id)))throw Error('Geçersiz taraflar');
 const map=config.map||mission?.map||MAPS[0].id;if(!mapById(map))throw Error('Geçersiz harita');
 let difficulty=config.difficulty||mission?.difficulty||'normal';if(typeof difficulty==='string')difficulty=difficulty.split(',');
 if(!Array.isArray(difficulty)||![1,2].includes(difficulty.length)||difficulty.some(d=>!DIFFICULTIES.some(x=>x.id===d)))throw Error('Geçersiz zorluk');
 if(difficulty.length===1)difficulty=[difficulty[0],difficulty[0]];
 const seed=config.seed??1;if(!Number.isSafeInteger(seed))throw Error('Tohum tamsayı olmalı');
 const ai=config.ai??Array(count).fill(true);if(!Array.isArray(ai)||ai.length!==count||ai.some(x=>typeof x!=='boolean'))throw Error('Geçersiz yapay zekâ seçimi');
 return {seed,map,mode,factions:[...factions],difficulty,ai:[...ai],mission:mission?.id||null};
}
export function createMatch(config={}){
 const c=normalize(config),map=mapById(c.map),sizes=c.mode.split('v').map(Number);
 const s={version:VERSION,config:c,seed:c.seed,rng:(c.seed>>>0)||0x9e3779b9,tick:0,time:0,accumulator:0,paused:false,nextId:1,entities:[],players:[],outposts:map.outposts.map((o,i)=>({...o,id:`outpost_${i}`,owner:null,capturePlayer:null,progress:0})),camps:map.camps.map((o,i)=>({...o,id:`camp_${i}`,cleared:false,rewarded:false,guards:[]})),fog:[[],[]],events:[],winner_team:null,ended:false,mission:c.mission?{id:c.mission,hold:0,status:'active',reason:null}:null};
 for(let i=0;i<c.factions.length;i++){
  const team=i<sizes[0]?0:1,slot=team?i-sizes[0]:i,n=sizes[team],f=factionById(c.factions[i]);
  s.players.push({id:i,team,faction:f.id,ai:c.ai[i],difficulty:c.difficulty[team],gold:RULES.startingGold+Math.floor(nextRandom(s)*100),power:10,upgrades:[],research:null,boosts:[],powerReady:{},home:{x:team?map.width-65:65,y:map.height*(slot+1)/(n+1)},aiState:{next:2+nextRandom(s)*2,phase:'expand',wave:0},stats:{income:0,spent:0,kills:0,lost:0,buildings:0,produced:0,damage:0,abilities:0,powers:0,outposts:0}});
  const p=s.players[i],keep=spawn(s,i,f.buildings[0].id,p.home.x,p.home.y);p.keepId=keep.id;
  const u=spawn(s,i,f.units[0].id,p.home.x+(team?-20:20),p.home.y-15);u.order={type:'guard',x:u.x,y:u.y};
 }
 for(const camp of s.camps)for(let j=0;j<2;j++){const u=spawn(s,-1,'camp_guard',camp.x+j*12-6,camp.y,{kind:'neutral',role:'infantry',camp:camp.id});camp.guards.push(u.id);}
 if(c.mission==='son-kervan'){
  const e=spawn(s,0,playerFaction(s,0).units[4].id,110,map.height/2,{kind:'escort',role:'escort',hp:1800,maxHp:1800});s.mission.escortId=e.id;s.mission.exit={x:map.width-35,y:map.height/2};
 }
 updateFog(s);return new Match(s);
}
export class Match{
 constructor(state){this.state=state;}
 step(seconds=RULES.dt){return step(this,seconds);}
 command(command){return issueCommand(this,command);}
 query(team){return getState(this,team);}
 visibility(team){return getVisibility(this,team);}
 drainEvents(){return drainEvents(this);}
 serialize(){return serialize(this);}
 get ended(){return this.state.ended;}
}
function ready(s,e){return e.readyAt<=s.time;}
function population(s,p){return s.entities.filter(e=>e.player===p&&alive(e)&&['unit','hero'].includes(e.kind)&&!e.expiresAt).length+s.entities.filter(e=>e.player===p&&alive(e)).reduce((n,e)=>n+e.queue.length,0);}
function spend(p,n){if(p.gold+1e-8<n)return false;p.gold-=n;p.stats.spent+=n;return true;}
export function getAuraModifiers(match,id){
 const s=match.state,e=typeof id==='object'?id:entity(s,id),out={damage:1,speed:1,range:1,vision:1,armor:1,cooldown:1,heal:0};
 if(!e||!['unit','hero'].includes(e.kind))return out;
 for(const h of s.entities){if(h.id===e.id||h.kind!=='hero'||!alive(h)||h.team!==e.team)continue;const a=defOf(s,h)?.aura;
  if(!a||distance(h,e)>a.radius||a.role&&a.role!==e.role)continue;
  out[a.stat]=['armor','cooldown'].includes(a.stat)?Math.min(out[a.stat],a.value):Math.max(out[a.stat],a.value);
 }return out;
}
function visionRadius(s,e){return (defOf(s,e)?.vision||RULES.vision)*getAuraModifiers({state:s},e).vision;}
function visiblePoint(s,team,point){return s.entities.some(e=>alive(e)&&e.team===team&&distance(e,point)<=visionRadius(s,e));}
function fail(reason){return {ok:false,reason};}
export function issueCommand(match,c){
 const s=match.state;if(!c||typeof c!=='object')return fail('Komut nesnesi gerekli');
 if(c.type==='pause'){s.paused=c.paused??!s.paused;return {ok:true};}
 if(s.ended)return fail('Karşılaşma bitti');
 const p=s.players[c.player];if(!p)return fail('Oyuncu bulunamadı');
 if(!entity(s,p.keepId))return fail('Merkez yıkıldı');
 const f=playerFaction(s,p.id),own=id=>{const e=entity(s,id);return e?.player===p.id?e:null;},map=mapById(s.config.map);
 const point=()=>Number.isFinite(c.x)&&Number.isFinite(c.y)&&c.x>=0&&c.x<=map.width&&c.y>=0&&c.y<=map.height;
 if(['move','attack','retreat','guard'].includes(c.type)){
  const ids=c.ids||(c.id!=null?[c.id]:[]),units=ids.map(own);if(new Set(ids).size!==ids.length||!units.length||units.some(e=>!e||!['unit','hero'].includes(e.kind)))return fail('Geçersiz birlik seçimi');
  const t=c.target!=null?entity(s,c.target):null;
  if(c.type==='attack'&&c.target!=null&&(!t||t.team===p.team||!visiblePoint(s,p.team,t)))return fail('Hedef görünmüyor');
  if(c.type!=='retreat'&&!t&&!point())return fail('Geçersiz konum');
  const destination=c.type==='retreat'?p.home:{x:t?.x??c.x,y:t?.y??c.y};
  const slots=formationOrders(units,destination,map);
  for(const e of units){const slot=slots.find(q=>q.id===e.id);e.order={type:c.type,x:slot.x,y:slot.y,target:t?.id??null,formationSlot:slot.slot};}
  const lead=units.find(e=>e.id===slots[0].id);if(!p.ai)emit(s,'order',{player:p.id,faction:f.id,role:lead.role,x:lead.x,y:lead.y,command:c.type});
  return {ok:true};
 }
 if(c.type==='build'){
  const d=f.buildings.find(d=>d.id===c.building||d.type===c.building);if(!d||d.type==='keep'||!point())return fail('Geçersiz yapı');
  if(distance(p.home,c)>RULES.buildRadius||s.entities.some(e=>alive(e)&&e.kind==='building'&&distance(e,c)<16))return fail('Yapı alanı uygun değil');
  if(!spend(p,d.cost))return fail('Yeterli akçe yok');
  const e=spawn(s,p.id,d.id,c.x,c.y,{readyAt:s.time+d.buildTime});p.stats.buildings++;emit(s,'construction',{id:e.id});return {ok:true,id:e.id};
 }
 if(c.type==='setRally'||c.type==='set_rally'){
  const e=own(c.building??c.id);if(!e||e.kind!=='building'||!point())return fail('Geçersiz toplanma noktası');e.rally={x:c.x,y:c.y};return {ok:true};
 }
 if(c.type==='produce'||c.type==='recruitHero'||c.type==='recruit_hero'){
  const hero=c.type!=='produce',d=(hero?f.heroes:f.units).find(d=>d.id===(hero?c.hero:c.unit));
  const b=own(c.building??(hero?p.keepId:null));if(!d||!b||b.kind!=='building'||!ready(s,b))return fail('Üretim binası hazır değil');
  const bd=defOf(s,b);if(hero?bd.type!=='keep':bd.type!==d.production)return fail('Yanlış üretim binası');
  if(b.queue.length>=RULES.queueLimit||population(s,p.id)>=f.population)return fail('Kapasite dolu');
  if(hero&&s.entities.some(e=>e.player===p.id&&(e.type===d.id&&alive(e)||e.queue.some(q=>q.type===d.id))))return fail('Kahraman zaten mevcut');
  if(!spend(p,d.cost))return fail('Yeterli akçe yok');const diff=DIFFICULTIES.find(d=>d.id===p.difficulty);
  const duration=d.train*(p.ai?diff.production:1);b.queue.push({type:d.id,hero,remaining:duration,duration});emit(s,'queued',{id:b.id,unit:d.id});return {ok:true};
 }
 if(c.type==='research'||c.type==='researchUpgrade'||c.type==='research_upgrade'){
  const d=f.upgrades.find(d=>d.id===c.upgrade);if(!d||p.research||p.upgrades.includes(d.id))return fail('Gelişim seçilemez');
  const b=s.entities.find(e=>e.player===p.id&&alive(e)&&defOf(s,e)?.type==='forge'&&ready(s,e));if(!b)return fail('Gelişim Evi gerekli');
  if(!spend(p,d.cost))return fail('Yeterli akçe yok');p.research={id:d.id,remaining:d.researchTime,building:b.id};return {ok:true};
 }
 if(c.type==='ability'||c.type==='useAbility'||c.type==='use_ability'){
  const h=own(c.hero??c.id),d=h&&f.heroes.find(d=>d.id===h.type),a=d?.abilities.find(a=>a.id===c.ability);
  if(!a||h.kind!=='hero'||h.level<a.unlock_level||s.time<(h.abilityReady[a.id]||0))return fail('Yetenek kilitli veya bekliyor');
  const q={x:c.x??h.x,y:c.y??h.y};if(!Number.isFinite(q.x)||!Number.isFinite(q.y)||distance(h,q)>a.range||!visiblePoint(s,p.team,q))return fail('Yetenek menzili dışında');
  effect(s,p,h,a,q);h.abilityReady[a.id]=s.time+a.cooldown*(f.trait==='resonance'?.72:1)*getAuraModifiers(match,h).cooldown;p.stats.abilities++;emit(s,'ability',{id:h.id,ability:a.id,...q});return {ok:true};
 }
 if(c.type==='power'||c.type==='castPower'||c.type==='cast_power'){
  const a=f.powers.find(a=>a.id===c.power);if(!a||p.power<a.cost||s.time<(p.powerReady[a.id]||0))return fail('Güç hazır değil');
  const q={x:c.x??p.home.x,y:c.y??p.home.y};if(!Number.isFinite(q.x)||!Number.isFinite(q.y)||!visiblePoint(s,p.team,q))return fail('Bölge görünmüyor');
  p.power-=a.cost;p.powerReady[a.id]=s.time+a.cooldown;effect(s,p,null,a,q);p.stats.powers++;emit(s,'power',{player:p.id,power:a.id,...q});return {ok:true};
 }
 return fail('Bilinmeyen komut');
}
function effect(s,p,source,a,point){
 const map=mapById(s.config.map);
 if(a.kind==='economy'){
  const gold=a.value+(a.outpostGold||0)*s.outposts.filter(o=>o.owner===p.id).length;p.gold+=gold;p.stats.income+=gold;
  p.boosts??=[];for(const [kind,value] of [['income',a.incomeMultiplier],['production',a.productionMultiplier],['bounty',a.bounty],['raid',a.raidGold]])if(value)p.boosts.push({kind,value,until:s.time+a.duration});
  if(a.cooldownReduction)for(const h of s.entities)if(h.player===p.id&&h.kind==='hero'&&alive(h))for(const key of Object.keys(h.abilityReady))h.abilityReady[key]=Math.max(s.time,h.abilityReady[key]-a.cooldownReduction);
  return;
 }
 if(a.kind==='summon'){
  let roles=a.summonRoles||['infantry','infantry'];const f=playerFaction(s,p.id);
  if(a.copyNearest){const nearest=s.entities.filter(e=>e.player===p.id&&e.kind==='unit'&&alive(e)&&!e.expiresAt).sort((x,y)=>distance(x,point)-distance(y,point)||x.id-y.id)[0];if(nearest)roles=[nearest.role];}
  roles.forEach((role,i)=>{const d=f.units.find(u=>u.role===role),u=spawn(s,p.id,d.id,point.x+i*8,point.y,{expiresAt:s.time+a.duration});u.hp*=a.hpFactor||1;u.maxHp*=a.hpFactor||1;if(a.shieldMultiplier)u.buffs.push({kind:'shield',value:a.shieldMultiplier,until:u.expiresAt});u.order={type:'attack',x:point.x+(p.team?-40:40),y:point.y};});return;
 }
 for(const e of s.entities){if(!alive(e)||distance(e,point)>a.radius)continue;const friendly=e.team===p.team;
  if(a.kind==='heal'&&friendly)e.hp=Math.min(e.maxHp,e.hp+a.value);
  const eligible=friendly&&(!a.role||e.role===a.role)&&(!a.buildingOnly||e.kind==='building');
  if(['shield','buff'].includes(a.kind)&&eligible){
   if(a.repair&&e.kind==='building')e.hp=Math.min(e.maxHp,e.hp+a.repair);
   if(e.kind!=='building'||a.affectsBuildings){
    if(a.kind==='shield')e.buffs.push({kind:'shield',until:s.time+a.duration,value:a.shieldMultiplier??.55});
    if(a.kind==='buff'||a.speedMultiplier||a.damageMultiplier)e.buffs.push({kind:'buff',until:s.time+a.duration,value:a.damageMultiplier??(a.kind==='buff'?1.4:1),speedMultiplier:a.speedMultiplier??(a.kind==='buff'?1.2:1)});
    if(a.regen)e.buffs.push({kind:'regen',until:s.time+a.duration,value:a.regen});
    if(a.reflect)e.buffs.push({kind:'reflect',until:s.time+a.duration,value:a.reflect});
   }
  }
  if(a.kind==='damage'&&!friendly){
   if(a.dispel)e.buffs=e.buffs.filter(b=>!['buff','shield','reflect','regen'].includes(b.kind));
   hit(s,e,a.value*(e.kind==='building'?(a.buildingMultiplier??.4):1),source,p.id);
   if(a.push&&e.kind!=='building'){const dx=e.x-point.x,dy=e.y-point.y,d=Math.hypot(dx,dy)||1;e.x=clamp(e.x+(dx/d||1)*a.push,0,map.width);e.y=clamp(e.y+dy/d*a.push,0,map.height);}
   if(a.poison&&e.kind!=='building')e.buffs.push({kind:'poison',until:s.time+a.poisonDuration,value:a.poison,source:source?.id,player:p.id});
   if(a.stun&&e.kind!=='building')e.buffs.push({kind:'stun',until:s.time+a.stun,value:0});
  }
  if(['poison','stun'].includes(a.kind)&&!friendly&&e.kind!=='building')e.buffs.push({kind:a.kind,until:s.time+a.duration,value:a.kind==='poison'?(a.poison||18):0,source:source?.id,player:p.id});
 }
}
function gainXp(s,e,n){if(!e||e.kind==='building'||e.kind==='neutral'||e.kind==='escort'||e.expiresAt||!alive(e))return;e.xp+=n;
 while(e.level<RULES.maxLevel&&e.xp>=e.level*RULES.xpPerLevel){const old=e.maxHp;e.level++;e.maxHp=old*(1+RULES.levelHp*(e.level-1))/(1+RULES.levelHp*(e.level-2));e.hp=Math.min(e.maxHp,e.hp+(e.maxHp-old)+e.maxHp*.1);emit(s,'level',{id:e.id,level:e.level});}
}
function hit(s,t,n,src,credit=src?.player,reflected=false){
 if(!alive(t))return;
 n*=t.buffs.filter(b=>b.kind==='shield'&&b.until>s.time).reduce((value,b)=>Math.min(value,b.value),1);
 n*=getAuraModifiers({state:s},t).armor;
 if(t.player>=0&&playerFaction(s,t.player).trait==='bastion'&&t.kind!=='building'&&s.entities.some(e=>e.player===t.player&&e.kind==='building'&&alive(e)&&distance(e,t)<65))n*=.86;
 n=Math.max(0,n);const dealt=Math.min(t.hp,n);t.hp-=n;t.lastHit=s.time;
 if(credit>=0){const p=s.players[credit];p.stats.damage+=dealt;p.power=Math.min(100,p.power+dealt/100);const raid=(p.boosts||[]).find(b=>b.kind==='raid'&&b.until>s.time);if(raid){p.gold+=dealt*raid.value;p.stats.income+=dealt*raid.value;}gainXp(s,src,dealt/12);}
 const reflect=t.buffs.find(b=>b.kind==='reflect'&&b.until>s.time);if(!reflected&&reflect&&src&&alive(src)&&src.team!==t.team)hit(s,src,dealt*reflect.value,t,t.player,true);
 if(t.hp<=0){t.hp=0;emit(s,'death',{id:t.id,player:t.player,source:src?.id??null,faction:t.player<0?null:playerFaction(s,t.player).id,role:t.role,x:t.x,y:t.y});if(t.player>=0)s.players[t.player].stats.lost++;if(credit>=0){s.players[credit].stats.kills++;const bounty=(s.players[credit].boosts||[]).find(b=>b.kind==='bounty'&&b.until>s.time);if(bounty){s.players[credit].gold+=bounty.value;s.players[credit].stats.income+=bounty.value;}gainXp(s,src,t.kind==='hero'?85:t.kind==='building'?60:40);}}
}
export function getCombatStats(match,id){const s=match.state,e=typeof id==='object'?id:entity(s,id);if(!e)return null;const d=defOf(s,e),p=s.players[e.player],f=p?playerFaction(s,p.id):null;let damage=d?.damage??22,speed=d?.speed??10;const aura=getAuraModifiers(match,e);damage*=aura.damage;speed*=aura.speed;
 if(e.kind!=='building')damage*=1+RULES.levelDamage*(e.level-1);
 if(p)for(const u of f.upgrades)if(p.upgrades.includes(u.id)){if(u.stat==='damage'&&e.kind!=='building')damage*=u.multiplier;if(u.stat==='speed')speed*=u.multiplier;}
 for(const b of e.buffs)if(b.until>s.time&&b.kind==='buff'){damage*=b.value;speed*=b.speedMultiplier??1.2;break;}
 if(f?.trait==='charge'&&e.role==='cavalry'&&s.time-(e.lastAttack??-100)>5)damage*=1.6;
 return {damage,speed,range:(d?.range??8)*aura.range,maxHp:e.maxHp,vision:visionRadius(s,e)};
}
export function damageAgainst(match,a,b){const s=match.state,u=typeof a==='object'?a:entity(s,a),t=typeof b==='object'?b:entity(s,b);if(!u||!t)return 0;let n=getCombatStats(match,u).damage;
 if(counters[u.role]===t.role)n*=RULES.counter;
 if(t.kind==='building')n*=u.role==='siege'?RULES.siegeBonus:u.role==='special'&&u.player>=0&&playerFaction(s,u.player).trait==='bulwark'?1.4:RULES.buildingResistance;
 if(t.kind==='unit'||t.kind==='hero')if(u.role==='siege')n*=.55;
 return n;
}
function updateEconomy(s){for(const p of s.players){if(!entity(s,p.keepId))continue;
 let rate=RULES.baseIncome+s.entities.filter(e=>e.player===p.id&&e.kind==='building'&&alive(e)&&ready(s,e)).reduce((n,e)=>n+(defOf(s,e)?.income||0),0)+s.outposts.filter(o=>o.owner===p.id).length*RULES.outpostIncome;
 for(const u of playerFaction(s,p.id).upgrades)if(p.upgrades.includes(u.id)&&u.stat==='income')rate*=u.multiplier;
 p.boosts=(p.boosts||[]).filter(b=>b.until>s.time);for(const b of p.boosts)if(b.kind==='income')rate*=b.value;
 if(p.ai)rate*=DIFFICULTIES.find(d=>d.id===p.difficulty).income;const n=rate*RULES.dt;p.gold+=n;p.stats.income+=n;p.power=Math.min(100,p.power+RULES.dt*.09);
 if(p.research){const b=entity(s,p.research.building);if(!b){p.research=null;continue;}p.research.remaining-=RULES.dt;if(p.research.remaining<=0){const u=playerFaction(s,p.id).upgrades.find(u=>u.id===p.research.id);p.upgrades.push(u.id);p.research=null;if(u.stat==='hp')for(const e of s.entities)if(e.player===p.id&&alive(e)&&e.kind!=='building'){e.maxHp*=u.multiplier;e.hp*=u.multiplier;}emit(s,'upgrade',{player:p.id,upgrade:u.id});}}
 }
 for(const b of s.entities){if(b.kind!=='building'||!alive(b)||!ready(s,b)||!b.queue.length)continue;
 const production=(s.players[b.player].boosts||[]).find(x=>x.kind==='production'&&x.until>s.time)?.value||1;b.queue[0].remaining-=RULES.dt*production;if(b.queue[0].remaining>0)continue;const q=b.queue.shift(),u=spawn(s,b.player,q.type,b.x+(b.team?-13:13),b.y+10,{kind:q.hero?'hero':'unit'});s.players[b.player].stats.produced++;if(b.rally)u.order={type:'attack',...b.rally};emit(s,'produced',{id:u.id,building:b.id});
 }
}
function move(s,e,q,speed){const d=distance(e,q);if(d<.01)return;for(const t of mapById(s.config.map).terrain)if(distance(e,t)<t.radius)speed*=t.speed;const travel=Math.min(d,speed*RULES.dt);e.facing=Math.atan2(q.y-e.y,q.x-e.x);e.x+=(q.x-e.x)/d*travel;e.y+=(q.y-e.y)/d*travel;}
function makeGrid(s){const bins=new Map();for(const e of s.entities)if(alive(e)){const k=`${Math.floor(e.x/80)},${Math.floor(e.y/80)}`;if(!bins.has(k))bins.set(k,[]);bins.get(k).push(e);}return bins;}
function nearby(grid,e,r){const out=[];for(let x=Math.floor((e.x-r)/80);x<=Math.floor((e.x+r)/80);x++)for(let y=Math.floor((e.y-r)/80);y<=Math.floor((e.y+r)/80);y++){const a=grid.get(`${x},${y}`);if(a)out.push(...a);}return out;}
function fight(s,match){const grid=makeGrid(s);
 for(const e of s.entities){if(!alive(e))continue;
  e.buffs=e.buffs.filter(b=>b.until>s.time);
  for(const b of e.buffs)if(b.kind==='poison')hit(s,e,b.value*RULES.dt,entity(s,b.source),b.player);
  if(!alive(e))continue;if(e.expiresAt&&e.expiresAt<=s.time){e.hp=0;emit(s,'expire',{id:e.id});continue;}
  for(const b of e.buffs)if(b.kind==='regen')e.hp=Math.min(e.maxHp,e.hp+b.value*RULES.dt);
  if(e.kind==='escort')continue;
  if(e.buffs.some(b=>b.kind==='stun'))continue;
  if(!ready(s,e))continue;
  const stats=getCombatStats(match,e);e.cooldown-=RULES.dt;
  if(e.player>=0&&e.kind!=='building'){
   const p=s.players[e.player];e.hp=Math.min(e.maxHp,e.hp+e.maxHp*getAuraModifiers(match,e).heal*RULES.dt);if(distance(e,p.home)<65&&s.time-e.lastHit>5)e.hp=Math.min(e.maxHp,e.hp+e.maxHp*.02*RULES.dt);
   if(playerFaction(s,e.player).trait==='renewal'&&s.time-e.lastHit>8)e.hp=Math.min(e.maxHp,e.hp+e.maxHp*.006*RULES.dt);
  }
  if(e.order?.type==='retreat'||e.order?.type==='move'){move(s,e,e.order,stats.speed);if(distance(e,e.order)<2){e.order={type:'guard',x:e.x,y:e.y};}continue;}
  const hostile=t=>t.team!==e.team&&alive(t)&&(e.team!==-1||t.team!==-1);
  const radius=e.kind==='building'?stats.range:e.kind==='neutral'?55:75;
  let target=null,best=Infinity;
  const explicit=e.order?.target&&entity(s,e.order.target);
  if(explicit&&hostile(explicit)&&distance(e,explicit)<=radius)target=explicit;
  if(!target)for(const t of nearby(grid,e,radius)){if(!hostile(t))continue;const d=distance(e,t);if(d>radius)continue;if(e.kind==='neutral'){const camp=s.camps.find(c=>c.id===e.camp);if(distance(t,camp)>70)continue;}
   const score=d+(t.kind==='building'&&e.role!=='siege'?20:0);if(score<best){best=score;target=t;}
  }
  if(target){const dist=distance(e,target);if(dist<=stats.range+(target.kind==='building'?10:3)){
    if(e.cooldown<=0){e.facing=Math.atan2(target.y-e.y,target.x-e.x);hit(s,target,damageAgainst(match,e,target),e);e.cooldown=1.5;e.lastAttack=s.time;
     if(e.role==='special'&&e.player>=0){const tr=playerFaction(s,e.player).trait;if(['renewal','swarm'].includes(tr)&&target.kind!=='building')target.buffs.push({kind:'poison',until:s.time+4,value:6,source:e.id,player:e.player});if(tr==='charge'&&target.kind!=='building')target.buffs.push({kind:'stun',until:s.time+1,value:0});if(tr==='resonance'&&target.buffs.some(b=>b.kind==='shield'))target.buffs=target.buffs.filter(b=>b.kind!=='shield');if(tr==='bastion')e.buffs.push({kind:'shield',until:s.time+2,value:.55});}
     emit(s,'attack',{id:e.id,target:target.id,player:e.player,faction:e.player<0?null:playerFaction(s,e.player).id,role:e.role,x:target.x,y:target.y,sourceX:e.x,sourceY:e.y});
    }
   }else if(e.kind!=='building')move(s,e,target,stats.speed);
  }else if(e.kind==='neutral'){const c=s.camps.find(c=>c.id===e.camp);move(s,e,c,stats.speed);}
  else if(e.kind!=='building'&&e.order){move(s,e,e.order,stats.speed);}
 }
}
function updateObjectives(s){
 for(const o of s.outposts){const near=s.entities.filter(e=>alive(e)&&['unit','hero'].includes(e.kind)&&distance(e,o)<35&&!e.expiresAt);const teams=[...new Set(near.map(e=>e.team))];
  if(teams.length!==1){o.capturePlayer=null;o.progress=0;continue;}const p=near.reduce((a,e)=>e.player<a?e.player:a,Infinity);
  if(o.owner!=null&&s.players[o.owner].team===teams[0]){o.progress=0;continue;}
  if(o.capturePlayer!==p){o.capturePlayer=p;o.progress=0;}o.progress+=RULES.dt;
  if(o.progress>=RULES.captureSeconds){o.owner=p;o.progress=0;s.players[p].stats.outposts++;emit(s,'capture',{outpost:o.id,player:p});}
 }
 for(const camp of s.camps)if(!camp.cleared&&camp.guards.every(id=>!entity(s,id))){camp.cleared=true;let best=null,bd=95;for(const e of s.entities)if(alive(e)&&e.player>=0&&distance(e,camp)<bd){best=e;bd=distance(e,camp);}if(best){const p=s.players[best.player];p.gold+=RULES.campGold;p.stats.income+=RULES.campGold;gainXp(s,best,RULES.campXp);camp.rewarded=true;emit(s,'camp',{camp:camp.id,player:p.id});}}
}
function end(s,winner,reason){if(s.ended)return;s.ended=true;s.winner_team=winner;if(s.mission){s.mission.status=winner===0?'won':'lost';s.mission.reason=reason;}emit(s,'gameover',{winner_team:winner,reason});}
function victory(s){const living=[0,1].map(team=>s.players.some(p=>p.team===team&&entity(s,p.keepId)));
 if(!living[0])return end(s,1,'merkez');
 if(!s.mission){if(!living[1])end(s,0,'merkez');return;}
 const m=MISSIONS.find(m=>m.id===s.mission.id);
 if(m.objective==='destroy'&&!living[1])return end(s,0,'yıkım');
 if(m.objective==='hold'){
  const count=s.outposts.filter(o=>o.owner!=null&&s.players[o.owner].team===0).length;s.mission.hold=count>=2?s.mission.hold+RULES.dt:0;
  if(s.mission.hold>=m.holdSeconds)return end(s,0,'mühürler');
 }
 if(m.objective==='escort'){
  const e=entity(s,s.mission.escortId);if(!e)return end(s,1,'kızak');
  const guards=s.entities.some(u=>u.team===0&&alive(u)&&['unit','hero'].includes(u.kind)&&distance(e,u)<70);
  if(guards)move(s,e,s.mission.exit,4);if(distance(e,s.mission.exit)<10)return end(s,0,'çıkış');
 }
 if(s.time>=m.timeLimit)end(s,1,'süre');
}
function updateFog(s){const m=mapById(s.config.map),cols=Math.ceil(m.width/RULES.grid),rows=Math.ceil(m.height/RULES.grid);
 for(let team=0;team<2;team++){const explored=s.fog[team];if(!explored.length)s.fog[team]=Array(cols*rows).fill(0);
  for(const e of s.entities)if(alive(e)&&e.team===team){const r=visionRadius(s,e);
   for(let y=Math.max(0,Math.floor((e.y-r)/RULES.grid));y<=Math.min(rows-1,Math.floor((e.y+r)/RULES.grid));y++)for(let x=Math.max(0,Math.floor((e.x-r)/RULES.grid));x<=Math.min(cols-1,Math.floor((e.x+r)/RULES.grid));x++)if(Math.hypot(x*RULES.grid+10-e.x,y*RULES.grid+10-e.y)<=r)s.fog[team][y*cols+x]=1;
  }
 }
}
function aiTurn(match,p){const s=match.state;if(s.time<p.aiState.next||!entity(s,p.keepId))return;
 const diff=DIFFICULTIES.find(d=>d.id===p.difficulty);p.aiState.next=s.time+diff.decision;
 const f=playerFaction(s,p.id),owned=s.entities.filter(e=>e.player===p.id&&alive(e)),buildings=owned.filter(e=>e.kind==='building'),army=owned.filter(e=>['unit','hero'].includes(e.kind)&&!e.expiresAt);
 const cmd=c=>issueCommand(match,{player:p.id,...c});
 const count=t=>buildings.filter(e=>defOf(s,e).type===t).length;
 let wanted=!count('field')?'field':!count('ranch')?'ranch':!count('barracks')?'barracks':!count('range')?'range':!count('stable')?'stable':!count('workshop')?'workshop':!count('forge')?'forge':!count('tower')?'tower':count('field')<2?'field':count('ranch')<2?'ranch':null;
 if(wanted){const angle=buildings.length*2.3999632297,r=40+Math.floor(buildings.length/6)*28;let pos={x:p.home.x+Math.cos(angle)*r,y:p.home.y+Math.sin(angle)*r};
  const map=mapById(s.config.map);pos.x=clamp(pos.x,18,map.width-18);pos.y=clamp(pos.y,18,map.height-18);cmd({type:'build',building:wanted,...pos});
 }
 let savingHero=false;
 const queuedHeroes=buildings.flatMap(b=>b.queue).filter(q=>q.hero).length;
 if(s.time>145&&army.filter(e=>e.kind==='hero').length+queuedHeroes<(s.time>300?2:1)){
  const h=f.heroes.find(h=>!owned.some(e=>e.type===h.id)&&!buildings.some(b=>b.queue.some(q=>q.type===h.id)));
  if(h){const r=cmd({type:'recruitHero',hero:h.id});savingHero=!r.ok;}
 }
 if(!savingHero&&count('forge')&&!p.research){const up=f.upgrades.find(u=>!p.upgrades.includes(u.id));if(up&&s.time>125)cmd({type:'research',upgrade:up.id});}
 const threats=s.entities.filter(e=>e.team>=0&&e.team!==p.team&&alive(e)&&distance(e,p.home)<130);
 const enemies=s.entities.filter(e=>e.team>=0&&e.team!==p.team&&alive(e)&&e.kind!=='building'&&visiblePoint(s,p.team,e));
 const roleCount={infantry:0,ranged:0,cavalry:0};for(const e of enemies)if(e.role in roleCount)roleCount[e.role]++;
 const most=Object.keys(roleCount).sort((a,b)=>roleCount[b]-roleCount[a])[0],counterRole=Object.keys(counters).find(k=>counters[k]===most);
 const needSiege=army.filter(e=>e.role==='siege').length<Math.max(2,Math.floor(army.length/4));
 const priority=b=>{const type=defOf(s,b).type;if(needSiege&&type==='workshop')return 0;return f.units.some(u=>u.production===type&&u.role===counterRole)?1:2;};
 for(const b of [...buildings].sort((a,b)=>priority(a)-priority(b)||a.id-b.id)){if(!ready(s,b)||b.queue.length)continue;const type=defOf(s,b).type;
  if(savingHero)continue;
  let options=f.units.filter(u=>u.production===type);if(!options.length)continue;
  if(type==='barracks')options=[options[(p.aiState.wave++%5===0)?1:0]];
  const u=options[0];if(u.role==='siege'&&!needSiege)continue;
  if(s.time>180&&needSiege&&u.role!=='siege'&&p.gold<f.units.find(u=>u.role==='siege').cost+20)continue;
  if(u.role!=='siege'&&army.length>7&&u.role!==counterRole&&nextRandom(s)<.4)continue;
  cmd({type:'produce',building:b.id,unit:u.id});
 }
 const keepTargets=s.players.filter(q=>q.team!==p.team).map(q=>entity(s,q.keepId)).filter(Boolean).sort((a,b)=>distance(a,p.home)-distance(b,p.home));
 const keep=keepTargets[0];if(!keep)return;
 const post=s.outposts.filter(o=>o.owner==null||s.players[o.owner].team!==p.team).sort((a,b)=>distance(a,p.home)-distance(b,p.home))[0];
 const scout=army.find(e=>e.kind==='unit'&&e.role!=='siege'&&e.hp>e.maxHp*.6);
 const camp=s.camps.find(c=>!c.cleared&&distance(c,p.home)<distance(keep,p.home));
 const attack=army.length>=diff.attackSize||s.time>(diff.attackAt??210);
 p.aiState.phase=threats.length?'defend':attack?'attack':'expand';
 for(const e of army){
  if(e.hp<e.maxHp*diff.retreat){cmd({type:'retreat',ids:[e.id]});continue;}
  if(e.order?.type==='retreat'&&e.hp<e.maxHp*.8)continue;
  if(e===scout&&post&&!threats.length&&s.time<400){cmd({type:'move',ids:[e.id],x:post.x,y:post.y});continue;}
  const target=threats[0];if(target){cmd({type:'attack',ids:[e.id],x:target.x,y:target.y});continue;}
  if(attack)cmd({type:'attack',ids:[e.id],x:keep.x,y:keep.y});
  else if(camp&&army.length>=3)cmd({type:'attack',ids:[e.id],x:camp.x,y:camp.y});
  else if(post)cmd({type:'attack',ids:[e.id],x:post.x+(p.team?35:-35),y:post.y});
 }
 for(const h of army.filter(e=>e.kind==='hero')){
  const hd=f.heroes.find(d=>d.id===h.type),enemy=enemies.find(e=>distance(h,e)<75);
  for(const a of hd.abilities){const friends=army.filter(e=>distance(h,e)<a.radius),needHeal=friends.some(e=>e.hp<e.maxHp*.85);
   if(a.kind==='heal'?!needHeal:!enemy&&a.kind!=='summon')continue;
   const pos=['damage','poison','stun'].includes(a.kind)&&enemy?enemy:h;cmd({type:'ability',hero:h.id,ability:a.id,x:pos.x,y:pos.y});
  }
 }
 for(const a of f.powers){
  if(a.kind==='economy'){cmd({type:'power',power:a.id});continue;}
  const front=a.buildingOnly?buildings.find(e=>e.hp<e.maxHp*.85):army.find(e=>(!a.role||e.role===a.role)&&enemies.some(t=>distance(e,t)<50));
  if(front)cmd({type:'power',power:a.id,x:front.x,y:front.y});
 }

}
export function step(match,seconds=RULES.dt){
 if(!Number.isFinite(seconds)||seconds<0||seconds>86400)throw Error('Geçersiz zaman adımı');const s=match.state;if(s.paused||s.ended)return match;
 s.accumulator+=seconds;
 while(s.accumulator+1e-9>=RULES.dt&&!s.ended){s.accumulator-=RULES.dt;if(Math.abs(s.accumulator)<1e-9)s.accumulator=0;s.tick++;s.time=s.tick*RULES.dt;
  for(const p of s.players)if(p.ai)aiTurn(match,p);
  updateEconomy(s);fight(s,match);separateUnits(s,mapById(s.config.map));updateObjectives(s);victory(s);if(s.tick%4===0)updateFog(s);
  if(s.tick%40===0)s.entities=s.entities.filter(e=>alive(e)||s.time-e.lastHit<10||s.camps.some(c=>c.guards.includes(e.id)));
 }
 if(s.ended)s.accumulator=0;
 return match;
}
export function getVisibility(match,team){if(team!==0&&team!==1)throw Error('Geçersiz takım');const s=match.state,m=mapById(s.config.map),cols=Math.ceil(m.width/RULES.grid),rows=Math.ceil(m.height/RULES.grid),visible=Array(cols*rows).fill(0);
 for(const e of s.entities)if(alive(e)&&e.team===team){const r=visionRadius(s,e);
  for(let y=Math.max(0,Math.floor((e.y-r)/20));y<=Math.min(rows-1,Math.floor((e.y+r)/20));y++)for(let x=Math.max(0,Math.floor((e.x-r)/20));x<=Math.min(cols-1,Math.floor((e.x+r)/20));x++)if(Math.hypot(x*20+10-e.x,y*20+10-e.y)<=r)visible[y*cols+x]=1;
 }
 return {team,cellSize:RULES.grid,cols,rows,worldWidth:m.width,worldHeight:m.height,unpackAlignment:1,visible,explored:s.fog[team].map((n,i)=>visible[i]||n),entityIds:s.entities.filter(e=>alive(e)&&(e.team===team||visiblePoint(s,team,e))).map(e=>e.id)};
}
export function getState(match,team){const s=match.state;if(team===undefined)return clone(s);const v=getVisibility(match,team),out=clone(s);out.entities=out.entities.filter(e=>v.entityIds.includes(e.id)).map(e=>{if(e.team!==team){e.queue=[];e.order=null;e.abilityReady={};e.rally=null;}return e;});
 out.players=out.players.map(p=>p.team===team?p:{id:p.id,team:p.team,faction:p.faction,keepId:p.keepId});out.rng=null;out.events=[];out.config={map:s.config.map,mode:s.config.mode,mission:s.config.mission};out.fog=[team===0?v.explored:[],team===1?v.explored:[]];out.camps=out.camps.map(c=>({id:c.id,x:c.x,y:c.y,...(visiblePoint(s,team,c)?{cleared:c.cleared}:{})}));out.outposts=out.outposts.map(o=>visiblePoint(s,team,o)?o:{id:o.id,x:o.x,y:o.y});return out;
}
export const queryState=getState;
export const queryVisibility=getVisibility;
export function drainEvents(match,team){const s=match.state;const events=s.events;s.events=[];if(team===undefined)return clone(events);return clone(events.filter(e=>{const source=entity(s,e.id)||entity(s,e.target);return e.type==='gameover'||e.player!=null&&s.players[e.player]?.team===team||source&&visiblePoint(s,team,source);}));}
export function serialize(match){return JSON.stringify(match.state);}
export function restore(json){let s=typeof json==='string'?JSON.parse(json):clone(json);if(!s||s.version!==VERSION||!Number.isSafeInteger(s.tick)||!Array.isArray(s.entities)||!Array.isArray(s.players))throw Error('Geçersiz kayıt sürümü veya gövdesi');normalize(s.config);if(!Number.isFinite(s.rng)||!Number.isFinite(s.time)||s.entities.some(e=>!Number.isFinite(e.hp)||!Number.isFinite(e.x)||!Number.isFinite(e.y)))throw Error('Bozuk kayıt');return new Match(s);}
export function hashState(match){const s={...match.state,events:[]};return stableHash(s);}
export function runDuel({faction,a,b,seed=1,maxSeconds=600}){
 const f=factionById(faction);if(!f||!f.units.some(u=>u.id===a)||!f.units.some(u=>u.id===b)||!Number.isSafeInteger(seed))throw Error('Geçersiz düello');
 const match=createMatch({seed,factions:[faction,faction],ai:[false,false]}),s=match.state;s.entities=[];s.events=[];const x=spawn(s,0,a,295,210),y=spawn(s,1,b,325,210);x.order={type:'attack',x:y.x,y:y.y};y.order={type:'attack',x:x.x,y:x.y};
 while(alive(x)&&alive(y)&&s.time<maxSeconds){s.time+=RULES.dt;s.tick++;fight(s,match);}return {winner:alive(x)&&!alive(y)?'a':alive(y)&&!alive(x)?'b':null,duration_s:s.time};
}
export function createSkirmish(config={}){return createMatch({...config,mission:null});}
export function createMission(mission,config={}){return createMatch({...config,mission});}
export function isVisible(match,team,id){return getVisibility(match,team).entityIds.includes(id);}

export function getFogTexture(match,team){return fogTexture(getVisibility(match,team));}

export function getBattalionLayout(match,id,team){const s=match.state,e=entity(s,id);if(!e||!['unit','hero','neutral'].includes(e.kind)||team!==undefined&&!getVisibility(match,team).entityIds.includes(id))return [];return battalionLayout(e,defOf(s,e));}
