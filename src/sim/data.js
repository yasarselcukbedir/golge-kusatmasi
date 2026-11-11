// Content is plain JSON-compatible data shared by the simulation and client.
export const RULES = Object.freeze({dt:0.5, formationSpacing:16, allySeparation:14, enemySeparation:8, separationPasses:3, startingGold:650, baseIncome:3, outpostIncome:2, captureSeconds:10, campGold:180, campXp:90, population:18, queueLimit:5, maxLevel:5, xpPerLevel:100, levelHp:0.12, levelDamage:0.12, counter:3.5, buildingResistance:0.22, siegeBonus:3.2, buildRadius:100, vision:95, grid:20, heroTime:24, maxEvents:256});
export const DIFFICULTIES = [
 {id:'kolay',name:'Kolay',income:0.65,production:1.35,decision:7,attackSize:7,retreat:0.2},
 {id:'normal',name:'Normal',income:1,production:1,decision:4,attackSize:6,retreat:0.28},
 {id:'zor',name:'Zor',income:1.65,production:0.7,decision:2,attackSize:5,retreat:0.36}
];
export const MODES = [1,2,3].flatMap(a=>[1,2,3].map(b=>`${a}v${b}`));
const unitBase = {
 infantry:{cost:130,hp:520,damage:30,range:7,speed:12,train:14,soldiers:8},
 ranged:{cost:130,hp:360,damage:27,range:43,speed:12,train:14,soldiers:8},
 cavalry:{cost:150,hp:500,damage:31,range:8,speed:21,train:17,soldiers:6},
 siege:{cost:240,hp:450,damage:43,range:57,speed:8,train:23,soldiers:3},
 special:{cost:190,hp:560,damage:32,range:23,speed:13,train:20,soldiers:5}
};
const buildingBase = [
 ['keep','keep',0,6500,0],['field','economy',100,850,12],['barracks','production',150,1200,16],
 ['range','production',150,1000,16],['stable','production',180,1200,18],['workshop','production',220,1100,20],
 ['forge','upgrade',170,1000,18],['tower','defense',180,1500,17]
];
const specs = [
 {id:'sedef',name:'Sedef Birliği',color:'#57b9dc',trait:'bastion',traitName:'Yuva Disiplini',description:'Dost yapıların çevresinde dayanıklı savunma ve dengeli taburlar.',prefix:'Sedef',units:['Kıyı Kargıcıları','İnci Yaycıları','Dalga Süvarileri','Gelgit Mancınığı','Kalkan Şarkıcıları'],heroes:['Seyra Köpükiz','Tavren Kıyıbek','İlven Denizkor'],abilities:[['Köpük Halkası','Siper Ezgisi'],['Dalgakıran','Ufuk Çağrısı'],['Tuz Merhemi','Akıntı Mührü']],kinds:[['damage','shield'],['stun','summon'],['heal','buff']],powers:['Kabuk Siperi','Sahil Bereketi','Derinlik Darbesi','Gelgit Çağrısı']},
 {id:'filiz',name:'Filiz Meclisi',color:'#78c765',trait:'renewal',traitName:'Canlı Doku',description:'Savaştan uzak taburlar kendini onarır; özel birlikler zehir salar.',prefix:'Filiz',units:['Kök Nöbetçileri','Çiy Atıcıları','Ceylan Akıncıları','Diken Fırlatacı','Sarmaşık Dokuyucuları'],heroes:['Neris Yaprakiz','Ovara Çiydil','Kelmor Kökusta'],abilities:[['Çiy Çemberi','Diken Örgüsü'],['Tohum Nöbeti','Kök Düğümü'],['Özsu Akışı','Yaprak Coşkusu']],kinds:[['heal','poison'],['summon','stun'],['shield','buff']],powers:['Yeşil Soluk','Tomurcuk Hasadı','Diken Sağanağı','Kök Yoldaşları']},
 {id:'koz',name:'Köz Ocakları',color:'#e79650',trait:'bulwark',traitName:'Yoğun Döküm',description:'Ağır ve yavaş taburlar; özel birlikler yapılara ek hasar verir.',prefix:'Köz',units:['Cüruf Bekçileri','Kıvılcım Atıcıları','Kor Tekerleri','Basınç Topu','Ocak Kırıcıları'],heroes:['Davra Kordamar','Beyren Tavusta','Ulsan Cürufiz'],abilities:[['Kor Patlaması','Tav Zırhı'],['Ocak Sarsımı','İşlik Çağrısı'],['Kül Merhemi','Çekiç Ritmi']],kinds:[['damage','shield'],['stun','summon'],['heal','buff']],powers:['Cüruf Kubbesi','Ocak Payı','Kızgın Yarık','Kor Muhafızları']},
 {id:'pus',name:'Pus Kervanları',color:'#b69adf',trait:'swarm',traitName:'Kalabalık Düzen',description:'Ucuz ve çabuk yetişen taburlar, daha geniş nüfus; zehirli uzmanlar.',prefix:'Pus',units:['Sis Bıçakları','Tül Nişancıları','Kum Kayacıları','Duman Havani','Gölge İğnecileri'],heroes:['Zevra Tüliz','Masren Yolses','Pirva Sisörgü'],abilities:[['Sis Zehri','Tül Siperi'],['Yol Çağrısı','Serap Darbesi'],['Gece Merhemi','Kervan İvmesi']],kinds:[['poison','shield'],['summon','damage'],['heal','buff']],powers:['Sis Örtüsü','Kervan Kazancı','Serap Kırılması','Tül Birliği']},
 {id:'yel',name:'Yel Sancağı',color:'#e5c962',trait:'charge',traitName:'İlk Atılım',description:'Hızlı süvarinin ilk darbesi güçlüdür; uzmanlar düşmanı yavaşlatır.',prefix:'Yel',units:['Mızrak Çemberi','Islık Yaycıları','Fırtına Binicileri','Rüzgâr Balistası','Savrul Bekçileri'],heroes:['Azyel Ufukiz','Tirsa Esintiyol','Veyran Sancakçı'],abilities:[['Bora Çarpması','Esinti Ritmi'],['Ufuk Birliği','Hava Kilidi'],['Yel Merhemi','Sancak Siperi']],kinds:[['damage','buff'],['summon','stun'],['heal','shield']],powers:['Bora Siperi','Ufuk Vergisi','Gök Yarılması','Esinti Akıncıları']},
 {id:'prizma',name:'Prizma Divanı',color:'#d77fbb',trait:'resonance',traitName:'Yankı Çekirdeği',description:'Yetenekler daha sık kullanılır; uzmanlar kalkan kıran darbeler vurur.',prefix:'Prizma',units:['Kristal Safları','Işın Örücüleri','Yansı Atlıları','Odak Merceği','Yankı Ustaları'],heroes:['Avelis Işıkiz','Ruvna Eksenbil','Solven Yankıses'],abilities:[['Eksen Patlaması','Yansı Siperi'],['Çınlama Kilidi','Kırınım Çağrısı'],['Işık Onarımı','Uyum Dalgası']],kinds:[['damage','shield'],['stun','summon'],['heal','buff']],powers:['Ayna Kubbesi','Kristal Payı','Odak Fırtınası','Yankı Kopyaları']}
];
const buildingNames=['Merkez','Hasatlığı','Saf Ocağı','Atış Meydanı','Binek Avlusu','Kuşatma İşliği','Gelişim Evi','Gözcü Kulesi'];
// Each row is a deliberately authored roster, not a faction-wide reskin multiplier.
const rosterStats = {
 sedef: [{},{},{},{},{}],
 filiz: [{hp:500,damage:29,speed:13},{hp:310,damage:25,range:55,speed:16,cost:145},{hp:450,speed:24,cost:160},{hp:400,range:60,speed:9},{hp:490,damage:27,range:32,speed:14}],
 koz: [{hp:624,speed:11.28},{hp:450,damage:29,range:35,speed:10},{hp:600,speed:19},{hp:650,damage:48,range:63,speed:6.7,cost:275},{hp:720,damage:36,range:16,speed:10}],
 pus: [{cost:120,hp:468,train:13.3,speed:13},{cost:120,hp:324,damage:24,range:39,speed:14,train:13.3},{cost:138,hp:450,damage:29,speed:23,train:16.15},{cost:221,hp:405,damage:40,range:53,train:21.85},{cost:175,hp:504,damage:29,speed:15,train:19}],
 yel: [{hp:500,damage:31,speed:14},{hp:340,damage:25,range:40,speed:15},{hp:540,damage:33,speed:25,cost:160},{hp:420,damage:41,range:59,speed:10},{hp:520,damage:30,range:19,speed:17}],
 prizma: [{hp:445,damage:32},{hp:300,damage:27,range:47,speed:11},{hp:450,damage:31,speed:20},{hp:375,damage:46,range:61,speed:7,cost:260},{hp:450,damage:32,range:30,speed:12}]
};
// [cost, hp, damage, attack range, speed], independently authored hero profiles.
const heroStats = [
 [[420,850,40,9,16],[470,1050,34,9,14],[480,760,30,39,16]],
 [[430,740,32,44,18],[450,810,35,12,19],[490,900,30,36,15]],
 [[450,1150,48,8,12],[480,1250,38,8,11],[500,1000,42,26,12]],
 [[380,680,34,27,20],[430,780,40,9,21],[470,740,31,40,18]],
 [[440,820,42,9,23],[460,880,38,36,20],[480,900,36,9,22]],
 [[430,710,42,47,15],[470,820,35,32,16],[510,780,37,43,14]]
];
const auraRows = [
 [['heal',0.005,52],['damage',1.08,48],['armor',0.94,50]],
 [['heal',0.008,52],['range',1.1,50,'ranged'],['speed',1.08,50]],
 [['armor',0.92,42],['damage',1.1,42],['range',1.1,48,'siege']],
 [['speed',1.1,45],['damage',1.08,45,'infantry'],['vision',1.12,50]],
 [['speed',1.12,65,'cavalry'],['damage',1.1,60,'cavalry'],['heal',0.005,50]],
 [['cooldown',0.9,48],['vision',1.15,52],['damage',1.08,50,'ranged']]
];
const auraNames = [['Kıyı Soluğu','Saf Uyumu','Kabuk Düzeni'],['Özsu Nefesi','Çiy Gözü','Kök Adımı'],['Ocak Çeperi','Tav Ritmi','İşlik Ufku'],['Kervan Yürüyüşü','Tül Cesareti','Sis Gözü'],['Binek Rüzgârı','Sancak Andı','Ufuk Soluğu'],['Eksen Uyumu','Kırınım Gözü','Yankı Odağı']];
const abilityKinds = [
 [['damage','shield'],['buff','summon'],['heal','stun']],
 [['heal','poison'],['summon','stun'],['shield','buff']],
 [['damage','shield'],['stun','buff'],['heal','damage']],
 [['poison','shield'],['summon','damage'],['heal','buff']],
 [['damage','buff'],['summon','stun'],['heal','shield']],
 [['damage','shield'],['stun','summon'],['heal','buff']]
];
// The four power slots remain API-compatible, but their secondary rules are faction-specific.
const powerRules = [
 [{repair:160,affectsBuildings:true,shieldMultiplier:0.6},{outpostGold:70,value:160},{push:22,value:200},{summonRoles:['infantry','ranged'],duration:14}],
 [{regen:14,shieldMultiplier:0.8,duration:14},{incomeMultiplier:1.2,duration:25,value:140},{poison:9,poisonDuration:7,value:160},{summonRoles:['special','special'],duration:10}],
 [{repair:300,buildingOnly:true,affectsBuildings:true,shieldMultiplier:0.65},{productionMultiplier:1.4,duration:22,value:140},{buildingMultiplier:1.5,value:210},{summonRoles:['siege'],duration:16,shieldMultiplier:0.7}],
 [{speedMultiplier:1.4,shieldMultiplier:0.85},{bounty:45,duration:25,value:140},{poison:12,poisonDuration:6,value:135},{summonRoles:['infantry','infantry','infantry'],hpFactor:0.7,duration:13}],
 [{role:'cavalry',speedMultiplier:1.4,damageMultiplier:1.25,shieldMultiplier:0.8},{raidGold:0.045,duration:25,value:140},{stun:2,value:180},{summonRoles:['cavalry','cavalry'],duration:9}],
 [{reflect:0.2,shieldMultiplier:0.85},{cooldownReduction:8,value:160},{dispel:true,value:220},{copyNearest:true,summonRoles:['special'],duration:14}]
];
function describePower(a){
 const roles={infantry:'piyade',ranged:'menzilli',cavalry:'süvari',siege:'kuşatma',special:'uzman'},parts=[];
 if(a.kind==='economy'){
  parts.push(`${a.value} öz`);if(a.outpostGold)parts.push(`karakol başına ${a.outpostGold} ek öz`);
  if(a.incomeMultiplier)parts.push(`${a.duration} saniye gelir ×${a.incomeMultiplier}`);
  if(a.productionMultiplier)parts.push(`${a.duration} saniye eğitim hızı ×${a.productionMultiplier}`);
  if(a.bounty)parts.push(`${a.duration} saniye öldürme başına ${a.bounty} öz`);
  if(a.raidGold)parts.push(`${a.duration} saniye verilen hasarın %${a.raidGold*100} kadarı öz`);
  if(a.cooldownReduction)parts.push(`kahraman yetenek beklemeleri ${a.cooldownReduction} saniye azalır`);
 }else if(a.kind==='shield'){
  if(a.buildingOnly)parts.push('yalnız dost binalar');if(a.role)parts.push(`yalnız ${roles[a.role]}`);
  parts.push(`${a.duration} saniye gelen hasar ×${a.shieldMultiplier}`);
  if(a.repair)parts.push(`dost yapılar ${a.repair} can onarılır`);
  if(a.regen)parts.push(`saniyede ${a.regen} can`);
  if(a.speedMultiplier)parts.push(`hız ×${a.speedMultiplier}`);
  if(a.damageMultiplier)parts.push(`hasar ×${a.damageMultiplier}`);
  if(a.reflect)parts.push(`alınan hasarın %${a.reflect*100} kadarı saldırana yansır`);
 }else if(a.kind==='damage'){
  if(a.dispel)parts.push('önce düşman koruma, teşvik, yenilenme ve yansıtması silinir');
  parts.push(`${a.value} alan hasarı; bina çarpanı ${a.buildingMultiplier??.4}`);
  if(a.push)parts.push(`savaşçıları ${a.push} birim iter`);
  if(a.poison)parts.push(`${a.poisonDuration} saniye saniyede ${a.poison} zehir`);
  if(a.stun)parts.push(`${a.stun} saniye sersemletme`);
 }else if(a.kind==='summon'){
  parts.push(a.copyNearest?'en yakın kalıcı dost taburun rolünde kopya; tabur yoksa uzman':a.summonRoles.map(r=>roles[r]).join(', '));
  parts.push(`${a.duration} saniye kalır`);if(a.hpFactor)parts.push(`can ×${a.hpFactor}`);if(a.shieldMultiplier)parts.push(`gelen hasar ×${a.shieldMultiplier}`);
 }
 return parts.join('; ')+'.';
}
export const FACTIONS = specs.map((s,index)=>{
 const units=Object.keys(unitBase).map((role,i)=>({id:`${s.id}_${role}`,name:s.units[i],role,...unitBase[role],...rosterStats[s.id][i],vision:role==='ranged'?110:95,production:role==='ranged'?'range':role==='cavalry'?'stable':role==='siege'?'workshop':'barracks',special:s.trait}));
 const heroes=s.heroes.map((name,i)=>{
  const [cost,hp,damage,range,speed]=heroStats[index][i],[stat,value,radius,role]=auraRows[index][i];
  return {id:`${s.id}_hero_${i}`,name,role:'hero',cost,hp,damage,range,speed,vision:115,train:RULES.heroTime,
   aura:{id:`${s.id}_aura_${i}`,name:auraNames[index][i],stat,value,radius,...(role?{role}:{})},
   abilities:s.abilities[i].map((name,j)=>{const kind=abilityKinds[index][i][j];return {id:`${s.id}_ability_${i}_${j}`,name,kind,unlock_level:j?3:1,cooldown:26+index+i*2,radius:42+index*2+i*3,range:82+index*3,value:kind==='damage'?(index===5?142+i*12:145+index*8+i*12):kind==='heal'?210+index*10:1,duration:7+i,damageMultiplier:1.3+index*.02,speedMultiplier:1.15+index*.02,shieldMultiplier:0.55+index*.025,poison:16+index,summonRoles:[i===1?'infantry':'ranged',i===1?'infantry':'ranged']};})};
 });
 const powers=s.powers.map((name,i)=>({id:`${s.id}_power_${i}`,name,kind:['shield','economy','damage','summon'][i],cost:[25,20,40,35][i]+(index%3)*2,cooldown:64+index*3+i*2,radius:54+index*2,value:i===2?230:i===1?220:1,duration:12,...powerRules[index][i]})).map(a=>({...a,description:describePower(a)}));
 const keepHp=[6500,6000,7600,5800,6200,6100][index];
 const buildings=buildingBase.map(([id,role,cost,hp,buildTime],i)=>({id:`${s.id}_${id}`,type:id,name:`${s.prefix} ${buildingNames[i]}`,role,cost,hp:id==='keep'?keepHp:hp+(index===2?200:0),buildTime:Math.max(0,buildTime+(index===3?-2:index===2?2:0)),income:id==='field'?2.5:0,damage:id==='tower'?[35,30,38,28,32,37][index]:id==='keep'?[24,22,26,21,23,27][index]:0,range:id==='tower'?[65,72,60,68,70,67][index]:id==='keep'?[58,62,55,60,60,65][index]:0}));
 const multipliers=[[1.2,1.22,1.25,1.12],[1.18,1.16,1.24,1.18],[1.24,1.25,1.2,1.08],[1.17,1.17,1.3,1.16],[1.2,1.18,1.22,1.22],[1.26,1.15,1.25,1.13]][index];
 const upgrades=[['edge','Keskinlik','damage'],['plate','Katman','hp'],['logistics','Akış','income'],['stride','Adım','speed']].map(([id,n,stat],i)=>({id:`${s.id}_${id}`,name:`${s.prefix} ${n}`,stat,multiplier:multipliers[i],cost:220,researchTime:30}));
 return {id:s.id,name:s.name,color:s.color,description:s.description,trait:s.trait,traitName:s.traitName,population:s.trait==='swarm'?20:18,units,heroes,powers,buildings,upgrades};
});
export const MAPS = [
 {id:'catal',name:'Çatal Ufuk',width:640,height:420,outposts:[{x:250,y:100},{x:320,y:210},{x:390,y:320}],camps:[{x:200,y:320},{x:440,y:100}],terrain:[{x:320,y:100,radius:35,speed:0.7},{x:320,y:320,radius:35,speed:0.7}]},
 {id:'havza',name:'Sessiz Havza',width:680,height:460,outposts:[{x:280,y:110},{x:340,y:230},{x:400,y:350}],camps:[{x:210,y:350},{x:470,y:110}],terrain:[{x:340,y:230,radius:48,speed:0.65}]},
 {id:'teras',name:'Bakır Teraslar',width:600,height:440,outposts:[{x:250,y:90},{x:300,y:220},{x:350,y:350}],camps:[{x:180,y:340},{x:420,y:100}],terrain:[{x:300,y:120,radius:45,speed:0.8},{x:300,y:320,radius:45,speed:0.8}]},
 {id:'ayna',name:'Ayna Geçidi',width:660,height:400,outposts:[{x:270,y:85},{x:330,y:200},{x:390,y:315}],camps:[{x:210,y:300},{x:450,y:100}],terrain:[]}
];
export const MISSIONS = [
 {id:'ilk-isik',name:'İlk Kıvılcım',objective:'destroy',briefing:'Sedef Birliği yeni kıyıda bir üs kuruyor. Hasatlık ve Saf Ocağı inşa et; düşman merkezini yık. Kendi merkezini kaybedersen sefer biter.',map:'catal',factions:['sedef','pus'],difficulty:'kolay',timeLimit:1800},
 {id:'uc-muhur',name:'Üç Mührün Nöbeti',objective:'hold',briefing:'Filiz Meclisi havzanın ikmal mühürlerini istiyor. En az iki karakolu kesintisiz 90 saniye elinde tut. Merkezini kaybetme; 900 saniyelik süren var.',map:'havza',factions:['filiz','koz'],difficulty:'normal',holdSeconds:90,timeLimit:900},
 {id:'son-kervan',name:'Son Kervanın Yolu',objective:'escort',briefing:'Yel Sancağı korumasındaki ikmal kızağını doğu çıkışına ulaştır. Kızak ancak yakınında dost savaşçı varsa ilerler. Kızak ya da merkez düşerse veya 900 saniye dolarsa görev başarısız olur.',map:'teras',factions:['yel','prizma'],difficulty:'normal',timeLimit:900}
];
export function getCatalog(){return JSON.parse(JSON.stringify({version:1,factions:FACTIONS,maps:MAPS,missions:MISSIONS,modes:MODES,difficulties:DIFFICULTIES,rules:RULES}));}
export const factionById=id=>FACTIONS.find(f=>f.id===id);
export const mapById=id=>MAPS.find(m=>m.id===id);
