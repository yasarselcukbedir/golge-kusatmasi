import {AudioSystem} from './audio.js';

const level=value=>Math.max(0,Math.min(1,Number(value)||0));
const worldEvents=new Set(['attack','construction','produced','death','ability','power','level','capture','camp','upgrade','order']);

// UI/lifecycle adapter. The sealed synthesis engine stays unchanged in audio.js.
export class Soundscape extends AudioSystem {
  constructor(preferences,options={}) {
    super({...options,bindGesture:false,autoSchedule:false,volume:.65,sfx:level(preferences.sfx)>0,music:level(preferences.music)>0});
    this.preferences=preferences;this.catalog=options.catalog;this.lifecyclePaused=false;
    this._applySettings();
  }
  _applySettings() {
    super._applySettings();
    if(!this.ctx||!this.master)return;
    const preferences=this.preferences||{sfx:1,music:1},at=this.ctx.currentTime;
    this.sfx.gain.setTargetAtTime(this.paused||this.settings.sfx===false?0:.8*level(preferences.sfx),at,.03);
    this.music.gain.setTargetAtTime(this.paused||this.settings.music===false?0:.48*level(preferences.music),at,.07);
  }
  setSettings(preferences) {
    this.preferences=preferences;
    this.configure({sfx:level(preferences.sfx)>0,music:level(preferences.music)>0});
  }
  setPaused(value) {
    // The sim snapshot is supplied each frame; automate buses only on a change.
    return this.paused===!!value?this:super.setPaused(value);
  }
  unlock() {
    if(this.lifecyclePaused)return Promise.resolve(false);
    return super.unlock().catch(()=>false);
  }
  pause(value) {
    this.lifecyclePaused=!!value;this.setPaused(value);
    if(value){
      this.silentElement?.pause();
      if(this.ctx?.state==='running')this.ctx.suspend?.().catch(()=>{});
    }else if(this.ctx?.state==='suspended')this.ctx.resume().catch(()=>{});
  }
  play(event,state=null) {
    if(this.lifecyclePaused)return false;
    let e=typeof event==='string'?{type:event}:event;if(!e)return false;
    // The result screen plays one local cue; upgrade/error feedback remains
    // available alongside the richer positional world sounds.
    if(e.type==='victory'||e.type==='defeat')e={...e,type:'gameover',winner_team:e.type==='victory'?0:1};
    if(e.type==='upgrade')e={...e,type:'level'};
    if(e.type==='error'){
      if(!this.ctx||this.closed||this.paused||this.settings.sfx===false||!this._gap('error',.15))return false;
      return !!this._voice({frequency:145,endFrequency:82,wave:'triangle',duration:.18,gain:.07,filter:'lowpass',cutoff:800});
    }
    const unit=state?.entities?.find(u=>u.id===e.id),player=state?.players?.find(p=>p.id===(e.player??unit?.player));
    const faction=e.faction||player?.faction||this.faction;
    const point=unit||state?.outposts?.find(p=>p.id===e.outpost)||state?.camps?.find(p=>p.id===e.camp);
    e={...e,faction,...(!Number.isFinite(e.x)&&point?{x:point.x,y:point.y}:{})};
    if(e.type==='attack'&&unit?.kind==='hero'){
      const definition=this.catalog?.factions.find(f=>f.id===faction)?.heroes.find(h=>h.id===unit.type);
      if(definition?.range>18)e.role='ranged';
    }
    return super.play(e,state||{});
  }
  handleEvents(events,state,listener) {
    this.setListener(listener);
    for(const event of events)if(worldEvents.has(event.type))this.play(event,state);
  }
  update(dt,state=null,listener=null) {
    if(listener)this.setListener(listener);
    if(this.lifecyclePaused)return;
    super.update(dt,state,listener);
  }
  resetWorld() {
    this.previousPositions.clear();this.hooves.clear();this.last.clear();this.battleUntil=0;
    // Ids are reused in a new match. Stop old effects before changing factions.
    for(const voice of [...this.voices])if(voice.bus==='sfx')this._stopVoice(voice);
  }
  vibrate(pattern=18) {
    if(this.preferences.vibration&&globalThis.navigator?.vibrate)navigator.vibrate(pattern);
  }
}
