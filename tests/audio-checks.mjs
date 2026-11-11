import assert from 'node:assert/strict';
import {AudioSystem,FACTION_VOICES,spatialMix,silentWave} from '../src/client/audio.js';
import {composeBeat,renderScore} from '../src/client/score.js';
class Param{
 constructor(value=0){this.value=value;this.events=[];}
 setValueAtTime(v,t){this.value=v;this.events.push(['set',v,t]);}
 linearRampToValueAtTime(v,t){this.value=v;this.events.push(['linear',v,t]);}
 exponentialRampToValueAtTime(v,t){this.value=v;this.events.push(['exponential',v,t]);}
 setTargetAtTime(v,t,d){this.value=v;this.events.push(['target',v,t,d]);}
}
class Node{
 constructor(kind,context){this.kind=kind;this.context=context;this.connections=[];this.frequency=new Param();this.detune=new Param();this.gain=new Param(1);this.Q=new Param();this.pan=new Param();this.delayTime=new Param();for(const p of ['threshold','knee','ratio','attack','release'])this[p]=new Param();}
 connect(node){this.connections.push(node);return node;}
 disconnect(){this.disconnected=true;}
 start(at=0,offset=0){this.startAt=at;this.offset=offset;this.context.started.push(this);}
 stop(at=0){this.stopAt=at;}
}
class Context{
 constructor(state='running'){this.currentTime=0;this.sampleRate=8000;this.state=state;this.nodes=[];this.started=[];this.destination=this.node('destination');}
 node(kind){const n=new Node(kind,this);this.nodes.push(n);return n;}
 createGain(){return this.node('gain');}createOscillator(){return this.node('oscillator');}createBiquadFilter(){return this.node('filter');}createBufferSource(){return this.node('bufferSource');}createStereoPanner(){return this.node('panner');}createDynamicsCompressor(){return this.node('compressor');}createDelay(){return this.node('delay');}
 createBuffer(channels,length,sampleRate){const data=Array.from({length:channels},()=>new Float32Array(length));return {sampleRate,length,getChannelData:i=>data[i]};}
 resume(){this.state='running';this.resumed=true;return Promise.resolve();}close(){this.state='closed';return Promise.resolve();}
}
function setup(settings={}){const context=new Context();return {context,audio:new AudioSystem({context,bindGesture:false,autoSchedule:false,...settings})};}
export async function audioChecks(test){
 test('audio: music uses written chords, bass, melody and detuned pads',()=>{const voices=composeBeat(0,'sedef',0);assert.equal(voices.filter(v=>v.tag==='pad').length,8);assert.ok(voices.some(v=>v.tag==='bass'));assert.ok(voices.some(v=>v.tag==='melody'));assert.ok(voices.some(v=>v.detune<0)&&voices.some(v=>v.detune>0));assert.ok(voices.filter(v=>v.tag==='pad').every(v=>v.filter==='lowpass'));});
 test('audio: battle adds paired heartbeat without replacing the score',()=>{const calm=composeBeat(0,'sedef',0),battle=composeBeat(0,'sedef',.8);assert.equal(battle.filter(v=>v.tag==='heartbeat').length,2);assert.ok(battle.length>calm.length);assert.ok(battle.find(v=>v.tag==='heartbeat').endFrequency<58);});
 test('audio: music graph has a filtered, bounded echo feedback loop',()=>{const {audio}=setup();assert.equal(audio.echo.kind,'delay');assert.ok(audio.echo.delayTime.value>0);assert.ok(audio.feedback.gain.value>0&&audio.feedback.gain.value<.5);assert.equal(audio.echoFilter.type,'lowpass');assert.ok(audio.echo.connections.includes(audio.echoFilter));assert.ok(audio.feedback.connections.includes(audio.echo));});
 test('audio: faction combat profiles have six different voice signatures',()=>{assert.equal(Object.keys(FACTION_VOICES).length,6);assert.equal(new Set(Object.values(FACTION_VOICES).map(p=>JSON.stringify(p))).size,6);for(const faction of Object.keys(FACTION_VOICES)){const {audio,context}=setup();assert.equal(audio.play({type:'attack',faction,role:'infantry',x:0,y:0}),true);assert.ok(context.nodes.some(n=>n.kind==='filter'&&n.type==='bandpass'&&n.frequency.value===FACTION_VOICES[faction].ring));assert.ok(audio.stats.noises>0&&audio.stats.tones>0);}});
 test('audio: construction includes noise and several timed impacts',()=>{const {audio,context}=setup();audio.play({type:'construction',faction:'koz',x:10,y:10});const sources=context.started.filter(n=>n.kind==='bufferSource');assert.equal(sources.length,3);assert.ok(new Set(sources.map(n=>n.startAt)).size>=3);assert.ok(context.nodes.some(n=>n.kind==='filter'&&n.type==='bandpass'));});
 test('audio: ranged and siege attacks have distinct envelopes and spectra',()=>{const ranged=setup(),siege=setup();ranged.audio.play({type:'attack',role:'ranged',faction:'filiz'});siege.audio.play({type:'attack',role:'siege',faction:'koz'});assert.ok(siege.context.started.some(n=>n.kind==='oscillator'&&n.frequency.events.some(e=>e[1]===28)));assert.ok(ranged.context.nodes.some(n=>n.kind==='filter'&&n.frequency.value>5000));});
 test('audio: faction cries use layered formant filters',()=>{const {audio,context}=setup();audio.play({type:'ability',role:'hero',faction:'yel'});assert.equal(audio.stats.cries,1);for(const f of FACTION_VOICES.yel.formants)assert.ok(context.nodes.some(n=>n.kind==='filter'&&n.type==='bandpass'&&n.frequency.value===f));});
 test('audio: moving cavalry schedules hoofbeats with a faction gait',()=>{const {audio}=setup({music:false}),state={players:[{id:0,faction:'koz'}],entities:[{id:7,hp:1,role:'cavalry',player:0,x:10,y:10}]};audio.update(.1,state);state.entities[0].x=20;audio.update(.1,state);assert.equal(audio.stats.hooves,1);assert.ok(audio.stats.noises>=2);});
 test('audio: spatial attenuation falls with distance and culls far events',()=>{assert.equal(spatialMix({x:0,y:0},{x:0,y:0}).gain,1);assert.ok(spatialMix({x:200,y:0},{x:0,y:0}).gain<spatialMix({x:20,y:0},{x:0,y:0}).gain);assert.equal(spatialMix({x:500,y:0},{x:0,y:0}).gain,0);const {audio,context}=setup();audio.setListener({x:0,y:0});assert.equal(audio.play({type:'attack',x:500,y:0}),false);assert.equal(context.started.length,0);});
 test('audio: stereo panning follows screen direction',()=>{assert.ok(spatialMix({x:-80,y:0},{x:0,y:0}).pan<0);assert.ok(spatialMix({x:80,y:0},{x:0,y:0}).pan>0);const {audio,context}=setup();audio.setListener({x:0,y:0});audio.play({type:'attack',x:80,y:0});assert.ok(context.nodes.some(n=>n.kind==='panner'&&n.pan.value>0));});
 test('audio: every simulation event category has an audible cue',()=>{for(const type of ['construction','produced','level','capture','camp','gameover','death','ability','power','order','tap']){const {audio,context}=setup();assert.equal(audio.play({type,faction:'sedef',x:0,y:0}),true,type);assert.ok(context.started.length>0,type);}});
 test('audio: a burst is rate limited and has a strict voice budget',()=>{const {audio}=setup({maxVoices:12});for(let i=0;i<150;i++)audio.play({type:'power',faction:Object.keys(FACTION_VOICES)[i%6],role:'hero'});assert.ok(audio.voices.size<=12);assert.ok(audio.stats.dropped>0);});
 test('audio: sound/music toggles and master mute control their own buses',()=>{const {audio}=setup();audio.setSfx(false);assert.equal(audio.play('tap'),false);assert.equal(audio.sfx.gain.value,0);audio.setMusic(false);audio.update();assert.equal(audio.music.gain.value,0);assert.equal(audio.stats.musicBeats,0);audio.setMuted(true);assert.equal(audio.master.gain.value,0);audio.setMuted(false);audio.setVolume(.3);assert.equal(audio.master.gain.value,.3);});
 test('audio: pause stops new effects and new scheduled beats',()=>{const {audio}=setup();audio.setPaused(true);audio.update();assert.equal(audio.play('tap'),false);assert.equal(audio.stats.musicBeats,0);assert.equal(audio.music.gain.value,0);audio.setPaused(false);audio.update();assert.ok(audio.stats.musicBeats>0);});
 test('audio: resume after a long gap schedules current music without a catch-up burst',()=>{const {audio,context}=setup();audio.update();context.currentTime=500;audio.update();assert.ok(audio.stats.musicBeats<=2);assert.ok([...audio.voices].every(v=>v.end>context.currentTime));});
 test('audio: explicit music stop remains stopped until restarted',()=>{const {audio,context}=setup();audio.update();const beat=audio.stats.musicBeats;audio.stopMusic();context.currentTime=5;audio.update();assert.equal(audio.stats.musicBeats,beat);audio.startMusic();assert.ok(audio.stats.musicBeats>beat);});
 test('audio: the mobile unlock stream is a valid local PCM wave',()=>{const data=Buffer.from(silentWave().split(',')[1],'base64');assert.equal(data.toString('ascii',0,4),'RIFF');assert.equal(data.toString('ascii',8,12),'WAVE');assert.equal(data.readUInt32LE(40),256);assert.equal(data.length,44+256);assert.ok(data.subarray(44).every(n=>n===0));});
 const mockAudio={setAttribute(name,value){this[name]=value;},play(){this.played=true;return Promise.resolve();},pause(){this.paused=true;},removeAttribute(name){delete this[name];}},context=new Context('suspended');
 const engine=new AudioSystem({context,document:{createElement:()=>mockAudio},autoSchedule:false,bindGesture:false});const unlocked=await engine.unlock();
 test('audio: gesture unlock resumes the context and plays an inline silent media element',()=>{assert.equal(unlocked,true);assert.equal(context.resumed,true);assert.equal(mockAudio.played,true);assert.equal(mockAudio.loop,true);assert.equal(mockAudio.playsinline,'');assert.ok(mockAudio.src.startsWith('data:audio/wav;base64,'));});
 await engine.dispose();
 test('audio: disposal stops playback and releases the graph',()=>{assert.equal(context.state,'closed');assert.equal(mockAudio.paused,true);assert.equal(engine.voices.size,0);assert.equal(engine.timer,null);assert.equal(engine.play('tap'),false);});
 test('audio: the composed preview contains finite non-silent bounded PCM',()=>{const pcm=renderScore({seconds:5,sampleRate:8000});assert.equal(pcm.length,40000);assert.ok(pcm.every(Number.isFinite));const peak=Math.max(...pcm.map(Math.abs)),rms=Math.sqrt(pcm.reduce((n,x)=>n+x*x,0)/pcm.length);assert.ok(peak>.01&&peak<1);assert.ok(rms>.005);});
 test('audio: faction music colors change actual PCM output',()=>{const a=renderScore({seconds:1,sampleRate:4000,faction:'filiz'}),b=renderScore({seconds:1,sampleRate:4000,faction:'koz'});assert.ok(a.some((x,i)=>Math.abs(x-b[i])>.001));});
}
