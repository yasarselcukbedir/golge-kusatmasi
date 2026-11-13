import {buildHeroModel,buildBattalionModel,buildEscortModel} from './figures.js';
import {buildBuildingModel} from './architecture.js';

// Cosmetic geometry is cached by catalog id. No simulation values are changed.
export class VisualLibrary {
  constructor(catalog){this.catalog=catalog;this.cache=new Map();}
  batchCapacities(){
    if(this.capacities)return this.capacities;
    const largest={},count=model=>model.parts.reduce((sum,p)=>(sum[p.shape]=(sum[p.shape]||0)+1,sum),{});
    // Reserve for six full armies, all hero models and simultaneous summon
    // casts. Per-shape storage is allocated once, then only live slots upload.
    for(const f of this.catalog.factions){
      const perUnit={};
      for(const u of f.units){const figures=u.role==='siege'?1:Math.min(u.soldiers,8);for(const [shape,n] of Object.entries(count(this.get(f.id,u.id))))perUnit[shape]=Math.max(perUnit[shape]||0,n*figures);}
      const summons=[...f.powers,...f.heroes.flatMap(h=>h.abilities)].filter(a=>a.kind==='summon').reduce((n,a)=>n+(a.summonRoles?.length||1),0);
      const totals=Object.fromEntries(Object.entries(perUnit).map(([shape,n])=>[shape,n*(f.population+summons)]));
      for(const h of f.heroes)for(const [shape,n] of Object.entries(count(this.get(f.id,h.id,'hero'))))totals[shape]=(totals[shape]||0)+n;
      for(const [shape,n] of Object.entries(totals))largest[shape]=Math.max(largest[shape]||0,n*6);
    }
    const neutralFigures=Math.max(...this.catalog.maps.map(m=>m.camps.length))*2*4;
    for(const [shape,n] of Object.entries(count(this.get(null,'camp_guard','neutral'))))largest[shape]=(largest[shape]||0)+n*neutralFigures;
    for(const [shape,n] of Object.entries(count(this.get(null,'escort','escort'))))largest[shape]=(largest[shape]||0)+n;
    this.capacities=Object.fromEntries(Object.entries(largest).map(([shape,n])=>[shape,2**Math.ceil(Math.log2(Math.max(512,n)))]));
    return this.capacities;
  }
  get(factionId,id,kind='unit'){
    const key=kind+':'+id;if(this.cache.has(key))return this.cache.get(key);
    let model;
    if(kind==='escort')model=buildEscortModel();
    else{
      const f=this.catalog.factions.find(f=>f.id===factionId);
      if(!f){const neutral={...this.catalog.factions.find(f=>f.id==='germiyan'),color:'#b9a17d'};model=buildBattalionModel(neutral,{id:'neutral',name:'Kamp nöbetçisi',role:'infantry'});}
      else if(kind==='hero')model=buildHeroModel(f,f.heroes.find(h=>h.id===id));
      else if(kind==='building')model=buildBuildingModel(f,f.buildings.find(b=>b.id===id));
      else model=buildBattalionModel(f,f.units.find(u=>u.id===id));
    }
    this.cache.set(key,model);return model;
  }
}
