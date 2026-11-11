// Original A-minor theme, 76 BPM, composed for this game. All sound is synthesized.
export const SCORE = Object.freeze({bpm:76,beatsPerBar:4,
 chords:[[57,60,64,71],[55,59,62,69],[53,57,60,67],[52,59,62,68],[57,60,64,72],[50,57,60,65],[53,60,64,69],[52,56,59,64]],
 bass:[33,31,29,28,33,26,29,28],
 melody:[69,null,72,76,74,null,71,67,69,72,null,74,76,79,76,null,77,76,72,null,74,71,67,64,69,null,72,71,67,null,64,69]
});
export const FACTION_VOICES=Object.freeze({
 sedef:{wave:'triangle',ring:1850,body:145,cry:[185,265],formants:[600,1450,2550],detune:3,hoof:'paired',color:950},
 filiz:{wave:'sine',ring:4100,body:190,cry:[235,345],formants:[750,2000,3100],detune:2,hoof:'light',color:1350},
 koz:{wave:'square',ring:880,body:88,cry:[100,145],formants:[440,900,1700],detune:7,hoof:'wheel',color:620},
 pus:{wave:'sawtooth',ring:2600,body:112,cry:[155,115],formants:[650,1250,2300],detune:12,hoof:'scurry',color:780},
 yel:{wave:'triangle',ring:2150,body:165,cry:[210,295],formants:[700,1600,2600],detune:4,hoof:'gallop',color:1150},
 prizma:{wave:'sine',ring:5200,body:260,cry:[270,395],formants:[900,2200,3300],detune:9,hoof:'glass',color:1650}
});
export const midiHz=n=>440*2**((n-69)/12);
export function composeBeat(beat,faction='sedef',battle=0){
 const profile=FACTION_VOICES[faction]||FACTION_VOICES.sedef,seconds=60/SCORE.bpm,voices=[],bar=Math.floor(beat/4)%SCORE.chords.length;
 if(beat%4===0){
  for(const note of SCORE.chords[bar])for(const sign of [-1,1])voices.push({tag:'pad',wave:'sawtooth',frequency:midiHz(note),detune:sign*(4+profile.detune*.3),duration:seconds*4.35,attack:.48,release:.8,gain:.0055,filter:'lowpass',cutoff:profile.color,send:.06});
  voices.push({tag:'bass',wave:'sine',frequency:midiHz(SCORE.bass[bar]),duration:seconds*3.7,attack:.1,release:.45,gain:.045,filter:'lowpass',cutoff:340});
 }
 const note=SCORE.melody[beat%SCORE.melody.length];
 if(note!==null)voices.push({tag:'melody',wave:profile.wave==='square'?'triangle':profile.wave,frequency:midiHz(note),duration:seconds*1.75,attack:.06,release:.65,gain:.028,filter:'lowpass',cutoff:2300,send:.32});
 if(battle>.05&&beat%2===0)for(const [offset,gain] of [[0,.07],[.19,.044]])voices.push({tag:'heartbeat',wave:'sine',frequency:58,endFrequency:32,duration:.29,offset,gain:gain*battle,attack:.009,release:.24});
 if(battle>.35&&beat%4===2)voices.push({tag:'brush',noise:true,duration:.16,gain:.02*battle,filter:'bandpass',cutoff:1100,q:.6,attack:.005,release:.14});
 return voices;
}
// Used by the offline preview/test tool; same score, envelopes and timbres as the runtime.
export function renderScore({seconds=18,sampleRate=22050,faction='sedef',battle=.65}={}){
 const samples=new Float32Array(Math.ceil(seconds*sampleRate)),beatSeconds=60/SCORE.bpm;let rng=0x75ab31;
 const random=()=>{rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return (rng>>>0)/4294967296*2-1;};
 for(let beat=0;beat*beatSeconds<seconds;beat++)for(const v of composeBeat(beat,faction,battle)){
  const start=beat*beatSeconds+(v.offset||0),frequency=v.frequency? v.frequency*2**((v.detune||0)/1200):0;let phase=0,low=0,previousLow=0;
  const cutoff=Math.min(sampleRate*.4,v.cutoff||sampleRate*.4),alpha=1-Math.exp(-2*Math.PI*cutoff/sampleRate);
  for(let i=Math.floor(start*sampleRate);i<Math.min(samples.length,Math.ceil((start+v.duration)*sampleRate));i++){
   const t=i/sampleRate-start;if(t<0)continue;const progress=t/v.duration,f=v.endFrequency?frequency*(v.endFrequency/frequency)**progress:frequency;phase+=f/sampleRate;
   let wave=v.noise?random():v.wave==='sawtooth'?2*(phase%1)-1:v.wave==='square'?Math.sin(phase*2*Math.PI)>=0?1:-1:v.wave==='triangle'?2/Math.PI*Math.asin(Math.sin(phase*2*Math.PI)):Math.sin(phase*2*Math.PI);
   low+=alpha*(wave-low);if(v.filter==='lowpass')wave=low;else if(v.filter==='bandpass'){const high=wave-low;previousLow+=.25*(high-previousLow);wave=previousLow;}
   const envelope=Math.min(1,t/(v.attack||.01))*Math.min(1,(v.duration-t)/(v.release||.06)),value=wave*v.gain*envelope;
   samples[i]+=value;
   if(v.send){const echo=i+Math.floor(.337*sampleRate),tail=i+Math.floor(.674*sampleRate);if(echo<samples.length)samples[echo]+=value*v.send*.38;if(tail<samples.length)samples[tail]+=value*v.send*.1;}
  }
 }
 for(let i=0;i<samples.length;i++)samples[i]=Math.tanh(samples[i]*1.35)*.8;
 return samples;
}

const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
export function spatialMix(position,listener){
 if(!position||!listener)return {gain:1,pan:0};
 const dx=position.x-(listener.x||0),dy=(position.y??position.z??0)-(listener.y??listener.z??0),d=Math.hypot(dx,dy),radius=listener.radius||420;
 const gain=d>=radius?0:clamp((1-(d/radius)**2)/(1+(d/145)**2));
 const facing=listener.facing||0,pan=clamp((dx*Math.cos(facing)+dy*Math.sin(facing))/180,-.9,.9);
 return {gain,pan};
}
export function silentWave(){
 const count=128,buffer=new ArrayBuffer(44+count*2),view=new DataView(buffer),put=(offset,text)=>{for(let i=0;i<text.length;i++)view.setUint8(offset+i,text.charCodeAt(i));};
 put(0,'RIFF');view.setUint32(4,36+count*2,true);put(8,'WAVE');put(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,22050,true);view.setUint32(28,44100,true);view.setUint16(32,2,true);view.setUint16(34,16,true);put(36,'data');view.setUint32(40,count*2,true);
 let bytes='';for(const byte of new Uint8Array(buffer))bytes+=String.fromCharCode(byte);return 'data:audio/wav;base64,'+globalThis.btoa(bytes);
}
export class AudioSystem{
 constructor(options={}){
  this.settings={volume:.65,sfx:true,music:true,...options.settings,...options};
  this.ctx=options.context||null;this.listener=null;this.faction='sedef';this.voices=new Set();this.last=new Map();this.hooves=new Map();this.previousPositions=new Map();this.battleUntil=0;this.beat=0;this.nextBeat=0;this.paused=false;this.closed=false;this.unlocked=false;this.timer=null;this.musicRunning=true;this.rng=0x82b5a3;
  this.maxVoices=options.maxVoices||72;this.autoSchedule=options.autoSchedule!==false;this.stats={tones:0,noises:0,cries:0,hooves:0,musicBeats:0,dropped:0};
  if(this.ctx)this._graph();if(options.bindGesture!==false)this.bindUnlock(options.document||globalThis.document);
 }
 _graph(){
  if(this.master||!this.ctx)return;const c=this.ctx;
  this.master=c.createGain();this.sfx=c.createGain();this.music=c.createGain();this.musicBus=this.music;
  this.compressor=c.createDynamicsCompressor();this.compressor.threshold.value=-18;this.compressor.knee.value=18;this.compressor.ratio.value=4;this.compressor.attack.value=.008;this.compressor.release.value=.24;
  this.sfx.connect(this.compressor);this.music.connect(this.compressor);this.compressor.connect(this.master);this.master.connect(c.destination);
  this.echo=c.createDelay(1);this.echo.delayTime.value=.337;this.feedback=c.createGain();this.feedback.gain.value=.23;this.echoFilter=c.createBiquadFilter();this.echoFilter.type='lowpass';this.echoFilter.frequency.value=1900;
  this.echo.connect(this.echoFilter);this.echoFilter.connect(this.feedback);this.feedback.connect(this.echo);this.echoFilter.connect(this.music);
  this._noiseBuffer=c.createBuffer(1,c.sampleRate*2,c.sampleRate);const data=this._noiseBuffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=this._random()*2-1;
  this._applySettings();
 }
 _random(){let x=this.rng;x^=x<<13;x^=x>>>17;x^=x<<5;this.rng=x>>>0;return this.rng/4294967296;}
 _applySettings(){if(!this.ctx||!this.master)return;const at=this.ctx.currentTime,volume=clamp(Number(this.settings.volume??this.settings.masterVolume??.65));
  this.master.gain.setTargetAtTime(this.settings.muted?0:volume,at,.03);this.sfx.gain.setTargetAtTime(this.settings.sfx===false?0:.8,at,.03);this.music.gain.setTargetAtTime(this.settings.music===false||this.paused?0:.48,at,.07);
 }
 configure(settings={}){if('music' in settings)this.musicRunning=!!settings.music;this.settings={...this.settings,...settings};this._applySettings();return this;}
 setSettings(settings){return this.configure(settings);}
 setVolume(value){return this.configure({volume:value});}
 setMuted(value){return this.configure({muted:!!value});}
 setMusic(value){return this.configure({music:!!value});}
 setSfx(value){return this.configure({sfx:!!value});}
 setListener(position){this.listener=position?{...position}:null;return this;}
 setFaction(id){if(FACTION_VOICES[id])this.faction=id;return this;}
 setPaused(value){const resumed=this.paused&&!value;this.paused=!!value;if(resumed&&this.ctx)this.nextBeat=this.ctx.currentTime+.06;this._applySettings();return this;}
 bindUnlock(target){if(!target?.addEventListener||this._gestureTarget)return this;this._gestureTarget=target;this._gesture=()=>{this.unlock();};for(const type of ['pointerdown','touchend','keydown'])target.addEventListener(type,this._gesture,{passive:true});return this;}
 _unbind(){if(this._gestureTarget)for(const type of ['pointerdown','touchend','keydown'])this._gestureTarget.removeEventListener(type,this._gesture);this._gestureTarget=null;}
 async unlock(){
  if(this.closed)return false;
  if(!this.ctx){const Context=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Context)return false;this.ctx=new Context();}
  this._graph();const jobs=[];
  // Both play() and resume() run synchronously inside the initiating gesture.
  if(this.ctx.state==='suspended')jobs.push(Promise.resolve(this.ctx.resume()).catch(()=>{}));
  const dom=this.settings.document||globalThis.document;
  if(dom?.createElement&&!this.silentElement){const a=dom.createElement('audio');a.setAttribute('playsinline','');a.setAttribute('webkit-playsinline','');a.loop=true;a.volume=.01;a.preload='auto';a.src=silentWave();this.silentElement=a;}
  if(this.silentElement)jobs.push(Promise.resolve(this.silentElement.play()).catch(()=>{}));
  const source=this.ctx.createBufferSource();source.buffer=this.ctx.createBuffer(1,1,this.ctx.sampleRate);source.connect(this.master);source.start();source.onended=()=>source.disconnect();
  await Promise.all(jobs);this.unlocked=this.ctx.state==='running';if(this.unlocked){this._unbind();this.startMusic();}return this.unlocked;
 }
 startMusic(){if(!this.ctx||this.closed)return;this.musicRunning=true;this.nextBeat=Math.max(this.nextBeat,this.ctx.currentTime+.06);if(this.autoSchedule&&!this.timer)this.timer=globalThis.setInterval(()=>this._schedule(),100);this._schedule();}
 stopMusic(){this.musicRunning=false;if(this.timer)globalThis.clearInterval(this.timer);this.timer=null;for(const v of [...this.voices])if(v.bus==='music')this._stopVoice(v);this.nextBeat=0;}
 _stopVoice(v){try{v.source.stop();}catch{}for(const node of v.nodes)try{node.disconnect();}catch{}this.voices.delete(v);}
 _prune(){if(!this.ctx)return;for(const v of [...this.voices])if(v.end<=this.ctx.currentTime)this._stopVoice(v);}
 _voice(v,position=null,bus='sfx',at=this.ctx?.currentTime||0){
  if(!this.ctx||this.closed)return null;this._prune();if(this.voices.size>=this.maxVoices){this.stats.dropped++;return null;}
  const c=this.ctx,now=Math.max(c.currentTime,at),mix=bus==='music'?{gain:1,pan:0}:spatialMix(position,this.listener);if(mix.gain<.008)return null;
  const source=v.noise?c.createBufferSource():c.createOscillator(),nodes=[source],gain=c.createGain(),duration=Math.max(.015,v.duration||.15),peak=Math.max(.00001,(v.gain??.08)*mix.gain);
  if(v.noise){source.buffer=this._noiseBuffer;this.stats.noises++;}
  else{source.type=v.wave||'sine';source.frequency.setValueAtTime(Math.max(15,v.frequency||220),now);source.detune.value=v.detune||0;if(v.endFrequency)source.frequency.exponentialRampToValueAtTime(Math.max(15,v.endFrequency),now+duration);this.stats.tones++;}
  let output=source;
  const filters=v.formants?v.formants.map(f=>({type:'bandpass',frequency:f,q:4})):v.filter?[{type:v.filter,frequency:v.cutoff||1800,q:v.q||.7}]:[];
  if(v.formants){const sum=c.createGain();sum.gain.value=.4;nodes.push(sum);for(const f of filters){const node=c.createBiquadFilter();node.type=f.type;node.frequency.value=f.frequency;node.Q.value=f.q;source.connect(node);node.connect(sum);nodes.push(node);}output=sum;}
  else for(const f of filters){const node=c.createBiquadFilter();node.type=f.type;node.frequency.value=f.frequency;node.Q.value=f.q;output.connect(node);output=node;nodes.push(node);}
  gain.gain.setValueAtTime(.00001,now);gain.gain.linearRampToValueAtTime(peak,now+Math.min(duration*.3,v.attack||.008));gain.gain.setValueAtTime(peak,now+Math.max(duration*.3,duration-(v.release||duration*.7)));gain.gain.exponentialRampToValueAtTime(.00001,now+duration);
  output.connect(gain);nodes.push(gain);let spatial=gain;
  if(bus!=='music'&&c.createStereoPanner){const pan=c.createStereoPanner();pan.pan.value=mix.pan;gain.connect(pan);spatial=pan;nodes.push(pan);}
  spatial.connect(bus==='music'?this.music:this.sfx);
  if(v.send){const send=c.createGain();send.gain.value=v.send;spatial.connect(send);send.connect(this.echo);nodes.push(send);}
  const voice={source,nodes,end:now+duration+.02,bus};this.voices.add(voice);source.onended=()=>{for(const n of nodes)try{n.disconnect();}catch{}this.voices.delete(voice);};source.start(now,v.noise?this._random()*.8:0);source.stop(voice.end);return voice;
 }
 tone(frequency,duration=.15,wave='sine',gain=.08,endFrequency,delay=0){return this._voice({frequency,duration,wave,gain,endFrequency},null,'sfx',(this.ctx?.currentTime||0)+delay);}
 noise(duration=.12,gain=.1,cutoff=1800,q=.8,position,delay=0){return this._voice({noise:true,duration,gain,filter:'bandpass',cutoff,q},position,'sfx',(this.ctx?.currentTime||0)+delay);}
 _gap(key,seconds){const t=this.ctx.currentTime;if(t-(this.last.get(key)??-100)<seconds)return false;this.last.set(key,t);return true;}
 _cry(profile,position){if(!this._gap('cry',2.8))return;this.stats.cries++;for(const [ratio,gain] of [[1,.065],[1.5,.025]])this._voice({frequency:profile.cry[0]*ratio,endFrequency:profile.cry[1]*ratio,wave:'sawtooth',duration:.42,gain,formants:profile.formants,send:.12},position);this.noise(.26,.018,profile.formants[1],.8,position);}
 hoof(entity){
  if(!this.ctx||this.paused||this.settings.sfx===false||!this._gap('hoof:'+entity.id,.32))return;
  const p=FACTION_VOICES[entity.faction]||FACTION_VOICES.sedef,position={x:entity.x,y:entity.y},at=this.ctx.currentTime;this.stats.hooves++;
  if(p.hoof==='wheel'){this.noise(.23,.055,230,.6,position);this.noise(.045,.04,1100,2,position,.11);}
  else if(p.hoof==='scurry')for(let i=0;i<4;i++)this.noise(.025,.035,2600,3,position,i*.045);
  else if(p.hoof==='glass')for(const d of [0,.12])this._voice({frequency:520,endFrequency:290,wave:'sine',duration:.06,gain:.025},position,'sfx',at+d);
  else for(const [delay,level] of [[0,1],[.11,.8],[.23,.5]]){this._voice({frequency:p.hoof==='light'?140:96,endFrequency:49,wave:'sine',duration:.065,gain:.07*level},position,'sfx',at+delay);this.noise(.035,.035*level,480,.8,position,delay);}
 }
 play(event,context={}){
  if(!this.ctx||this.closed||this.paused||this.settings.sfx===false)return false;
  if(Array.isArray(event)){let played=false;for(const e of event)played=this.play(e,context)||played;return played;}
  const e=typeof event==='string'?{type:event,...(typeof context==='object'?context:{volume:context})}:event;if(!e)return false;
  const state=context?.state||context?.entities&&context,unit=state?.entities?.find(u=>u.id===e.id),player=state?.players?.find(p=>p.id===(e.player??unit?.player));
  const faction=e.faction||player?.faction||this.faction,profile=FACTION_VOICES[faction]||FACTION_VOICES.sedef,role=e.role||unit?.role||'infantry';
  const position=Number.isFinite(e.sourceX??e.x)?{x:e.sourceX??e.x,y:e.sourceY??e.y}:unit?{x:unit.x,y:unit.y}:null;
  if(spatialMix(position,this.listener).gain<.008)return false;
  const type=({build:'construction',ready:'produced',levelup:'level',die:'death',boom:'siege',select:'tap'})[e.type]||e.type;
  if(!this._gap(type+':'+faction+':'+role,type==='attack'?.075:type==='tap'?.04:.12))return false;
  const sound=v=>this._voice({...v,gain:(v.gain||.06)*(e.volume??1)},position);
  if(type==='attack'){
   this.battleUntil=this.ctx.currentTime+4;
   if(role==='ranged'){this.noise(.11,.075,profile.ring+1500,2.8,position);sound({frequency:230,endFrequency:115,wave:'triangle',duration:.085,gain:.035});}
   else if(role==='siege'){this.noise(.48,.15,230,.55,position);sound({frequency:72,endFrequency:28,wave:'sine',duration:.55,gain:.12});this.noise(.17,.06,profile.ring,1.3,position,.07);}
   else{this.noise(.075,.12,profile.ring,1.8,position);sound({frequency:profile.body,endFrequency:profile.body*.65,wave:profile.wave,duration:.13,gain:.045,filter:'bandpass',cutoff:profile.ring,q:1.3});}
   if(role==='cavalry')this.hoof({id:e.id||faction,faction,...position});if(role==='hero'||this._random()<.08)this._cry(profile,position);
  }else if(type==='construction'){for(const d of [0,.1,.23])this.noise(.08,.08,720+d*1900,1.3,position,d);sound({frequency:160,endFrequency:90,wave:'triangle',duration:.24,gain:.035});}
  else if(type==='death'||type==='siege'){this.noise(.34,.08,500,.6,position);sound({frequency:profile.body,endFrequency:42,wave:profile.wave,duration:.33,gain:.045});}
  else if(type==='ability'||type==='power'){this._cry(profile,position);for(const [i,ratio] of [1,1.25,1.5].entries())this._voice({frequency:profile.body*ratio*2,endFrequency:profile.body*ratio*2.7,wave:profile.wave,duration:.52,gain:.035,send:.2},position,'sfx',this.ctx.currentTime+i*.07);this.noise(.4,.065,profile.ring,.8,position);}
  else if(['level','capture','camp','produced','gameover'].includes(type)){const sequence=type==='gameover'&&e.winner_team===1?[330,294,220]:[330,440,550,660];sequence.forEach((frequency,i)=>this._voice({frequency,wave:'triangle',duration:.3,gain:.04,send:.12},position,'sfx',this.ctx.currentTime+i*.09));}
  else if(type==='order'){this.noise(.07,.035,1600,1.2,position);sound({frequency:320,endFrequency:430,wave:'triangle',duration:.08,gain:.024});}
  else if(type==='tap')sound({frequency:510,endFrequency:360,wave:'sine',duration:.045,gain:.03});
  else return false;
  return true;
 }
 handleEvents(events,state,listener){if(listener)this.setListener(listener);for(const e of events||[])this.play(e,state);}
 _schedule(){
  if(!this.ctx||this.closed||this.paused||!this.musicRunning||this.settings.music===false||this.ctx.state==='suspended')return;this._prune();
  if(this.nextBeat<this.ctx.currentTime-.1)this.nextBeat=this.ctx.currentTime+.04;
  while(this.nextBeat<this.ctx.currentTime+.24){const battle=this.ctx.currentTime<this.battleUntil?.8:0;for(const v of composeBeat(this.beat,this.faction,battle))this._voice(v,null,'music',this.nextBeat+(v.offset||0));this.nextBeat+=60/SCORE.bpm;this.beat++;this.stats.musicBeats++;}
 }
 update(dt=0,state=null,listener=null){
  if(typeof state==='boolean'){if(state&&this.ctx)this.battleUntil=this.ctx.currentTime+3;state=null;}
  if(dt&&typeof dt==='object'){listener=state;state=dt;}
  if(listener)this.setListener(listener);if(state){this.setPaused(!!state.paused);const own=state.players?.find(p=>p.id===0);if(own)this.setFaction(own.faction);
   for(const e of state.entities||[])if(e.hp>0&&e.role==='cavalry'){const previous=this.previousPositions.get(e.id);if(previous&&Math.hypot(e.x-previous.x,e.y-previous.y)>.2){const faction=state.players?.find(p=>p.id===e.player)?.faction;this.hoof({...e,faction});}this.previousPositions.set(e.id,{x:e.x,y:e.y});}
   const ids=new Set((state.entities||[]).map(e=>e.id));for(const id of this.previousPositions.keys())if(!ids.has(id))this.previousPositions.delete(id);
  }
  this._schedule();
 }
 async dispose(){if(this.closed)return;this.closed=true;this._unbind();this.stopMusic();for(const v of [...this.voices])this._stopVoice(v);if(this.silentElement){this.silentElement.pause();this.silentElement.removeAttribute('src');this.silentElement=null;}for(const n of [this.echo,this.feedback,this.echoFilter,this.sfx,this.music,this.compressor,this.master])try{n?.disconnect();}catch{}if(this.ctx?.close)await this.ctx.close();}
 init(){return this.unlock();}
 resume(){return this.unlock();}
 close(){return this.dispose();}
}
export {AudioSystem as AudioEngine,AudioSystem as GameAudio,AudioSystem as AudioManager};
export const createAudio=options=>new AudioSystem(options);
export default AudioSystem;
