import {drainEvents,getState,getVisibility,fogCell} from '../sim/index.js';

const feedbackTypes=new Set(['attack','death','ability','power','level','capture','camp','upgrade','construction','produced','order','gameover']);
const fields=['tick','type','id','target','source','player','faction','role','kind','x','y','sourceX','sourceY','level','ability','power','outpost','camp','upgrade','command','winner_team','reason'];
const positioned=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y);
function pointVisible(visibility,point){
  if(!visibility||!positioned(point))return false;
  const width=visibility.worldWidth??visibility.cols*visibility.cellSize,height=visibility.worldHeight??visibility.rows*visibility.cellSize;
  if(point.x<0||point.y<0||point.x>width||point.y>height)return false;
  return !!visibility.visible[fogCell(visibility,point.x,point.y).index];
}

// W1's team event filter looks up living actors, so it loses witnessed deaths.
// Consume the raw API batch exactly once and apply presentation visibility at
// the event position. No rules or sealed simulation files are changed here.
export class FeedbackFeed {
  constructor(view,visibility,player=0){
    this.player=player;this.team=view.players.find(p=>p.id===player)?.team??0;
    this.remember(view,visibility);
  }
  remember(view,visibility){
    this.previous={tick:view.tick,entities:new Map(view.entities.map(e=>[e.id,e])),visibility};
  }
  drain(match,view=getState(match,this.team),visibility=getVisibility(match,this.team)){
    const batch=drainEvents(match),events=[];
    if(batch.length){
      // This private snapshot supplies ownership for level events and actors
      // that died this step. Only whitelisted, visible event fields leave here.
      const full=getState(match),entities=new Map(full.entities.map(e=>[e.id,e])),players=new Map(full.players.map(p=>[p.id,p]));
      const visibleIds=new Set(view.entities.map(e=>e.id));
      for(const raw of batch){
        if(!feedbackTypes.has(raw.type))continue;
        const actor=entities.get(raw.id)||this.previous.entities.get(raw.id);
        const player=raw.player??actor?.player,owner=players.get(player),team=owner?.team??actor?.team??-1;
        const point=positioned(raw)?raw:actor||view.outposts.find(p=>p.id===raw.outpost)||view.camps.find(p=>p.id===raw.camp);
        const event=Object.fromEntries(fields.filter(key=>raw[key]!==undefined).map(key=>[key,raw[key]]));
        if(player!==undefined)event.player=player;
        event.team=team;event.faction=raw.faction??owner?.faction??null;
        if(actor){event.kind=raw.kind??actor.kind;event.role=raw.role??actor.role;event.entityType=actor.type;}
        if(positioned(point)){event.x=point.x;event.y=point.y;}
        let allowed=raw.type==='gameover'||team===this.team;
        if(!allowed&&!['order','upgrade'].includes(raw.type)){
          allowed=pointVisible(visibility,event);
          // Living actor ids are the sim's exact visibility query, which also
          // covers points on the boundary of the coarser fog texture cells.
          if(!allowed&&['level','construction','produced'].includes(raw.type))allowed=visibleIds.has(raw.id);
          if(!allowed&&raw.type==='death'){
            const recent=Number.isInteger(raw.tick)&&Number.isInteger(this.previous.tick)&&raw.tick>=this.previous.tick&&raw.tick-this.previous.tick<=1&&view.tick-raw.tick<=1;
            const seen=this.previous.entities.get(raw.id);
            allowed=recent&&(pointVisible(this.previous.visibility,event)||positioned(seen)&&Math.hypot(seen.x-event.x,seen.y-event.y)<.001);
          }
        }
        if(allowed)events.push(event);
      }
    }
    this.remember(view,visibility);
    return events;
  }
}

export function personalNotices(events,player=0){
  const levels=new Map(),messages=[];
  for(const e of events)if(e.type==='level'&&e.player===player&&Number.isInteger(e.id)&&Number.isInteger(e.level)&&e.level>1){
    if(!levels.has(e.id)||levels.get(e.id).level<=e.level)levels.set(e.id,e);
  }
  for(const e of events){
    if(e.player!==player)continue;
    if(e.type==='level'&&levels.get(e.id)===e)messages.push(`Birliğin ${e.level}. seviyeye ulaştı.`);
    if(e.type==='capture')messages.push('Karakol ele geçirildi · gelir artıyor.');
    if(e.type==='camp')messages.push('Kamp temizlendi · akçe ve deneyim kazanıldı.');
    if(e.type==='upgrade')messages.push('Araştırma tamamlandı.');
  }
  return messages;
}
