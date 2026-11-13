export const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
export const timeText = seconds => `${Math.floor(Math.max(0,seconds)/60).toString().padStart(2,'0')}:${Math.floor(Math.max(0,seconds)%60).toString().padStart(2,'0')}`;
export const ROLE_NAMES = {infantry:'Piyade',ranged:'Menzilli',cavalry:'Süvari',siege:'Kuşatma',special:'Uzman',hero:'Kahraman',neutral:'Kamp nöbetçisi',escort:'Kervan arabası'};
export const GLYPHS = {keep:'⌂',field:'▤',ranch:'⌘',barracks:'⚑',range:'➶',stable:'♞',workshop:'⚒',forge:'◇',tower:'♜',infantry:'⚑',ranged:'➶',cavalry:'♞',siege:'⚒',special:'✧',hero:'✦',shield:'◈',economy:'✺',damage:'✹',summon:'⚑',heal:'✚',poison:'❋',stun:'⌁',buff:'✧'};
export const EFFECT_NAMES = {shield:'Alan koruması',economy:'Akçe desteği',damage:'Alan hasarı',summon:'Geçici tabur çağrısı',heal:'Alan iyileştirmesi',poison:'Süreli zehir',stun:'Sersemletme',buff:'Savaş teşviki'};
export function population(view,player=0) {return view.entities.filter(e=>e.player===player&&['unit','hero'].includes(e.kind)&&!e.expiresAt&&e.hp>0).length+view.entities.filter(e=>e.player===player&&e.hp>0).reduce((n,e)=>n+e.queue.length,0);}
export function cleanSelection(view,ids) {return [...new Set(ids)].filter(id=>view.entities.some(e=>e.id===id&&e.player===0&&e.hp>0));}
export function armyIds(view) {return view.entities.filter(e=>e.player===0&&e.hp>0&&['unit','hero'].includes(e.kind)).map(e=>e.id);}
export function definition(catalog,view,e) {if(!e)return null;const f=catalog.factions.find(f=>f.id===view.players[e.player]?.faction);return f?[...f.buildings,...f.units,...f.heroes].find(d=>d.id===e.type):null;}
export function buildPreview(view,point,radius) {const home=view.players[0].home;return !!point&&Math.hypot(home.x-point.x,home.y-point.y)<=radius&&!view.entities.some(e=>e.kind==='building'&&e.hp>0&&Math.hypot(e.x-point.x,e.y-point.y)<16);}
export function normalizeSetup(catalog,saved={}) {
  const validFaction=id=>catalog.factions.some(f=>f.id===id),validSize=n=>[1,2,3].includes(Number(n));
  return {own:validSize(saved?.own)?Number(saved.own):1,enemy:validSize(saved?.enemy)?Number(saved.enemy):1,map:catalog.maps.some(m=>m.id===saved?.map)?saved.map:'catal',difficulty:catalog.difficulties.some(d=>d.id===saved?.difficulty)?saved.difficulty:'normal',slots:Array.from({length:6},(_,i)=>validFaction(saved?.slots?.[i])?saved.slots[i]:catalog.factions[i].id)};
}
export function setupConfig(setup,seed) {const factions=[...setup.slots.slice(0,setup.own),...setup.slots.slice(3,3+setup.enemy)];return {seed,map:setup.map,mode:`${setup.own}v${setup.enemy}`,difficulty:setup.difficulty,factions,ai:factions.map((_,i)=>i!==0)};}

const numberText = n => Number(n.toFixed(1)).toLocaleString('tr-TR');
export function auraEffectText(stat,value) {
  if(stat==='heal')return `Saniyede azami canın %${numberText(value*100)} kadarı iyileşir`;
  const labels={damage:'Hasar',speed:'Hız',range:'Menzil',vision:'Görüş',armor:'Gelen hasar',cooldown:'Yetenek beklemesi'};
  const change=(value-1)*100;
  return `${labels[stat]||'Etki'} ${change<0?'−':'+'}%${numberText(Math.abs(change))}`;
}
export function auraDescription(aura) {
  if(!aura)return '';
  return `${aura.name}: ${auraEffectText(aura.stat,aura.value)} · ${aura.radius} birim · ${aura.role?ROLE_NAMES[aura.role]:'Dost savaşçılar'}`;
}
export function activeAuraText(modifiers) {
  return Object.entries(modifiers||{}).filter(([stat,value])=>value!==(stat==='heal'?0:1)).map(([stat,value])=>auraEffectText(stat,value)).join(' / ')||'Yakında etkin liderlik yok.';
}
