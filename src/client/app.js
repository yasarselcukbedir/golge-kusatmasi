import {createMatch,step,issueCommand,getState,getVisibility,drainEvents,serialize,restore,getCatalog,getCombatStats,getAuraModifiers,getBattalionLayout} from '../sim/index.js';
import {Battlefield} from './render.js';
import {Interface} from './ui.js';
import {Controls} from './input.js';
import {Soundscape} from './soundscape.js';
import {FeedbackFeed,personalNotices} from './feedback.js';
import * as storage from './storage.js';
import {normalizeSetup,setupConfig,armyIds,cleanSelection,definition,buildPreview} from './model.js';

class Game {
  constructor() {
    this.catalog=getCatalog();this.settings=storage.loadSettings();this.setup=normalizeSetup(this.catalog,storage.read('setup'));
    this.progress=storage.getProgress(this.catalog.missions.map(m=>m.id));this.saved=storage.loadMatch();this.match=null;this.view=null;this.selected=[];this.groups={};this.tab='selection';this.targeting=null;this.hoverPoint=null;this.page='main';this.tutorialStep=null;this.endShown=false;this.lastSave=performance.now();this.lastFrame=performance.now();this.storageWarned=false;this.fatal=false;
    this.audio=new Soundscape(this.settings,{catalog:this.catalog});this.field=new Battlefield(document.getElementById('battlefield'),this.catalog,this.settings.quality);this.ui=new Interface(this);
    this.input=new Controls(this.field.canvas,this.field,{
      unlock:()=>this.audio.unlock(),active:()=>this.active(),match:()=>!!this.match,selected:()=>this.selected,targeting:()=>!!this.targeting,
      hover:point=>{this.hoverPoint=point;this.updateTarget();},click:(...args)=>this.click(...args),order:(...args)=>this.order(...args),select:(...args)=>this.select(...args),escape:()=>this.escape(),pause:()=>this.togglePause(),all:()=>this.action('all'),digit:(...args)=>this.digit(...args),action:(name)=>this.action(name)
    });
    window.addEventListener('pointerdown',()=>this.audio.unlock(),{passive:true});window.addEventListener('keydown',()=>this.audio.unlock(),{passive:true});
    window.addEventListener('resize',()=>{this.field.resize();this.updateTarget();});
    window.addEventListener('orientationchange',()=>{this.input.reset();setTimeout(()=>this.field.resize(),200);});
    document.addEventListener('visibilitychange',()=>{if(document.hidden){if(this.match&&!this.view.ended)this.pause('Sekme gizlendiği için savaş durdu.');this.autosave();this.audio.pause(true);}else if(!this.match)this.audio.pause(false);this.lastFrame=performance.now();});
    window.addEventListener('pagehide',()=>{this.autosave();this.audio.pause(true);});
    this.field.canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();this.fail('Çizim bağlantısı kesildi. Son otomatik kaydın korunuyor. Sayfayı yenileyerek devam edebilirsin.');});
    window.addEventListener('error',()=>{if(this.match)this.fail('Beklenmeyen bir hata nedeniyle savaş durduruldu. Sayfayı yenileyip son otomatik kayıttan devam edebilirsin.');});
    this.preview();this.ui.menu();requestAnimationFrame(now=>this.frame(now));
  }
  active() {return !!this.match&&!this.view.paused&&!this.view.ended&&this.ui.screen.hidden&&this.ui.modal.hidden&&!this.fatal;}
  seed() {if(window.crypto?.getRandomValues){return crypto.getRandomValues(new Uint32Array(1))[0];}return Date.now()%2147483647;}
  preview() {
    const match=createMatch({seed:42,ai:[false,false],factions:['sedef','pus']});
    for(const [building,x,y] of [['field',40,248],['barracks',100,165],['tower',118,225]])issueCommand(match,{player:0,type:'build',building,x,y});
    step(match,40);const keep=getState(match).players[0].keepId;issueCommand(match,{player:0,type:'recruitHero',hero:'sedef_hero_0',building:keep});
    const b=getState(match).entities.find(e=>e.type==='sedef_barracks');if(b)issueCommand(match,{player:0,type:'produce',unit:'sedef_special',building:b.id});
    step(match,30);const view=getState(match,0),map=this.catalog.maps.find(m=>m.id===view.config.map);
    this.field.setMap(map);this.field.setView(view,getVisibility(match,0),[],this.figureLayouts(match,view));this.field.focus(112,220);this.field.distance=innerWidth<600?230:255;this.field.updateCamera();
  }
  openMenu(page) {this.page=page;this.targeting=null;this.input.reset();this.field.setTarget(null);this.ui.menu(page);}
  startMatch(config) {
    try {
      this.match=createMatch(config);this.startConfig=structuredClone(config);this.selected=[];this.groups={};this.tab='selection';this.targeting=null;this.tutorialStep=null;this.endShown=false;this.fatal=false;
      this.configureMatch();this.field.focus(this.view.players[0].home.x+25,this.view.players[0].home.y);this.audio.pause(false);this.audio.unlock();this.autosave();
      if(this.settings.tutorial&&!storage.read('tutorialSeen',false)){storage.write('tutorialSeen',true);issueCommand(this.match,{type:'pause',paused:true});this.refresh();this.ui.tutorialOffer();this.audio.pause(true);}
    }catch(error){this.match=null;this.openMenu('main');this.ui.toast('Karşılaşma başlatılamadı. Lütfen kurulumunu yeniden seç.','error');console.error(error);}
  }
  configureMatch() {
    this.audio.resetWorld();
    this.view=getState(this.match,0);this.map=this.catalog.maps.find(m=>m.id===this.view.config.map);this.faction=this.catalog.factions.find(f=>f.id===this.view.players[0].faction);this.audio.setFaction(this.faction.id);this.field.setMap(this.map);this.input.reset();this.ui.mountHUD();this.refresh();this.feedback=new FeedbackFeed(this.view,this.fog);this.lastFrame=performance.now();this.lastSave=performance.now();this.queryElapsed=0;
  }
  continueMatch() {
    const save=storage.loadMatch();if(!save){this.ui.toast('Devam edilecek kayıt bulunamadı.','error');return;}
    try {
      this.match=restore(save.sim);this.startConfig=save.client?.config||getState(this.match).config;this.selected=[];this.groups={};this.targeting=null;this.tab='selection';this.endShown=false;this.fatal=false;
      this.tutorialStep=Number.isInteger(save.client?.tutorialStep)&&save.client.tutorialStep>=0&&save.client.tutorialStep<6?save.client.tutorialStep:null;
      issueCommand(this.match,{type:'pause',paused:true});drainEvents(this.match);this.configureMatch();
      this.selected=cleanSelection(this.view,Array.isArray(save.client?.selection)?save.client.selection:[]);
      for(let n=1;n<=9;n++)if(Array.isArray(save.client?.groups?.[n]))this.groups[n]=cleanSelection(this.view,save.client.groups[n]);
      this.field.restoreCamera(save.client?.camera);this.refresh();this.audio.pause(true);
      if(this.view.ended)this.finish();else this.ui.pause('Kayıt geri yüklendi. Hazır olduğunda savaşa devam et.');
    }catch(error){this.match=null;storage.remove('autosave');this.saved=null;this.openMenu('main');this.ui.toast('Kayıt okunamadı. Yeni bir çarpışma başlatabilirsin.','error');console.error(error);}
  }
  combatStats(id){return getCombatStats(this.match,id);}
  auraModifiers(id){return getAuraModifiers(this.match,id);}
  figureLayouts(match,view) {
    // Query only entities already admitted by the team snapshot. Omitting the
    // optional team argument avoids recomputing the entire visibility per unit.
    return new Map(view.entities.filter(e=>['unit','hero','neutral'].includes(e.kind)).map(e=>[e.id,getBattalionLayout(match,e.id)]));
  }
  audioListener(){return {x:this.field.target.x,y:this.field.target.y,facing:0,radius:420};}
  refresh() {
    if(!this.match)return;
    this.view=getState(this.match,0);this.fog=getVisibility(this.match,0);this.selected=cleanSelection(this.view,this.selected);
    for(const key of Object.keys(this.groups))this.groups[key]=cleanSelection(this.view,this.groups[key]);
    this.field.setView(this.view,this.fog,this.selected,this.figureLayouts(this.match,this.view));this.ui.update();this.updateTarget();
  }
  command(command,quiet=false) {
    if(!this.match||this.view.paused||this.view.ended)return {ok:false};
    const result=issueCommand(this.match,{player:0,...command});
    if(!result.ok){if(!quiet){this.ui.toast(result.reason,'error');this.audio.play('error');this.audio.vibrate([20,35,20]);}return result;}
    if(!['move','attack','retreat','guard','build'].includes(command.type))this.audio.play('order');this.refresh();this.advanceTutorial(command);return result;
  }
  select(ids,append=false) {
    this.selected=cleanSelection(this.view,append?[...this.selected,...ids]:ids);
    const units=this.selected.filter(id=>{const e=this.view.entities.find(e=>e.id===id);return ['unit','hero'].includes(e.kind);});
    if(units.length&&this.selected.length>1)this.selected=units;
    this.tab='selection';this.targeting=null;this.field.setTarget(null);this.audio.play('select');this.refresh();
  }
  click(point,hit,shift,touch,double) {
    if(this.targeting){this.applyTarget(point,hit,shift);return;}
    if(hit?.player===0){
      if(double&&['unit','hero'].includes(hit.kind))this.select(this.view.entities.filter(e=>e.player===0&&e.type===hit.type).map(e=>e.id),shift);
      else if(shift&&this.selected.includes(hit.id))this.select(this.selected.filter(id=>id!==hit.id));
      else this.select([hit.id],shift);
    }else if(touch&&this.selected.length){this.order(point,hit);}
    else this.select([]);
  }
  order(point,hit) {
    if(this.targeting){this.cancelTarget();return;}
    if(!point)return;
    const units=this.selected.filter(id=>{const e=this.view.entities.find(e=>e.id===id);return ['unit','hero'].includes(e?.kind);});
    if(units.length){const enemy=hit&&hit.team!==0;const result=this.command({type:enemy?'attack':'move',ids:units,...point,...(enemy?{target:hit.id}:{})});if(result.ok)this.field.effect('order',point.x,point.y,enemy?0xffa48a:0xb8e8b9);}
    else if(this.selected.length===1&&this.view.entities.find(e=>e.id===this.selected[0])?.kind==='building'){const result=this.command({type:'setRally',building:this.selected[0],...point});if(result.ok){this.field.effect('order',point.x,point.y);this.ui.toast('Toplanma noktası belirlendi.');}}
    else this.ui.toast('Önce kendi birliğini veya üretim binanı seç.');
  }
  setTarget(target) {
    if(!this.active())return;
    this.targeting=target;this.hoverPoint=this.field.worldPoint(innerWidth/2,innerHeight*.4);this.updateTarget();this.ui.update();
  }
  updateTarget() {
    if(!this.targeting||!this.match){this.field.setTarget(null);return;}
    const target=this.targeting,point=this.hoverPoint;let valid=true,origin=null;
    if(target.kind==='build'){origin=this.view.players[0].home;valid=buildPreview(this.view,point,this.catalog.rules.buildRadius);}
    else if(target.kind==='ability'){const hero=this.view.entities.find(e=>e.id===target.hero);origin=hero;if(!hero){this.cancelTarget();return;}valid=!!point&&Math.hypot(point.x-hero.x,point.y-hero.y)<=target.range;}
    if(point&&['power','ability'].includes(target.kind)){const i=Math.floor(point.y/this.fog.cellSize)*this.fog.cols+Math.floor(point.x/this.fog.cellSize);valid=valid&&!!this.fog.visible[i];}
    this.field.setTarget(target,point,valid,origin);
  }
  applyTarget(point,hit,shift) {
    if(!point)return;const target=this.targeting;let command;
    if(target.kind==='build')command={type:'build',building:target.id,...point};
    else if(target.kind==='ability')command={type:'ability',hero:target.hero,ability:target.id,...point};
    else if(target.kind==='power')command={type:'power',power:target.id,...point};
    else if(target.kind==='rally')command={type:'setRally',building:target.building,...point};
    else {const units=this.selected.filter(id=>{const e=this.view.entities.find(e=>e.id===id);return ['unit','hero'].includes(e?.kind);});command={type:target.kind,ids:units,...point,...(target.kind==='attack'&&hit&&hit.team!==0?{target:hit.id}:{})};}
    const result=this.command(command);
    if(result.ok){this.field.effect('order',point.x,point.y);if(target.kind==='build'){this.ui.toast('İnşaat başladı.');if(!shift){this.selected=[result.id];this.tab='selection';}}
      if(target.kind==='rally')this.ui.toast('Toplanma noktası belirlendi.');
      if(!shift||target.kind!=='build')this.cancelTarget();this.refresh();this.audio.vibrate();
    }
  }
  cancelTarget(){this.targeting=null;this.field.setTarget(null);this.ui.update();}
  group(n,assign=false) {
    if(!this.match||n<1||n>9)return;
    if(assign){this.groups[n]=cleanSelection(this.view,this.selected);this.ui.toast(`${n}. gruba ${this.groups[n].length} birlik atandı.`);this.audio.vibrate();this.ui.update();}
    else {const ids=cleanSelection(this.view,this.groups[n]||[]);if(ids.length){this.select(ids);const e=this.view.entities.find(e=>e.id===ids[0]);this.field.focus(e.x,e.y);}else this.ui.toast(`${n}. grup boş. Seçip grup düğmesini basılı tut.`);}
  }
  digit(n,assign) {if(assign){this.group(n,true);return;}if(this.tab==='build'&&n>=1&&n<=7){this.action('build',this.faction.buildings.filter(b=>b.type!=='keep')[n-1].id);}else this.group(n);}
  ability(id,ability) {
    const hero=this.view.entities.find(e=>e.id===Number(id)&&e.player===0),d=hero&&definition(this.catalog,this.view,hero),a=d?.abilities.find(a=>a.id===ability);
    if(!a)return;
    if(hero.level<a.unlock_level||this.view.time<(hero.abilityReady[a.id]||0)){this.ui.toast('Yetenek henüz hazır değil.','error');return;}
    this.setTarget({kind:'ability',hero:hero.id,id:a.id,label:a.name,radius:a.radius,range:a.range});this.field.focus(hero.x,hero.y);
  }
  action(name,value='',event=null) {
    this.audio.unlock();
    if(['selection','build','heroes','powers'].includes(name)&&!value){this.action('tab',name);return;}
    if(name==='menu'){if(this.match&&!this.view.paused)this.pause();this.openMenu(value);return;}
    if(name==='back'){if(this.match){this.ui.screen.hidden=true;this.ui.hud.hidden=false;this.ui.pause();}else this.openMenu('main');return;}
    if(name==='start'){storage.write('setup',this.setup);this.startMatch(setupConfig(this.setup,this.seed()));return;}
    if(name==='mission'){
      const i=this.catalog.missions.findIndex(m=>m.id===value);if(i<0||i>0&&!this.progress.includes(this.catalog.missions[i-1].id))return;
      this.startMatch({mission:value,seed:this.seed(),ai:[false,true]});return;
    }
    if(name==='continue'){this.continueMatch();return;}
    if(name==='pause'){this.togglePause();return;}
    if(name==='resume'){this.resume();return;}
    if(name==='exit'){this.exit();return;}
    if(name==='endMenu'||name==='endCampaign'){this.exit(false);if(name==='endCampaign')this.openMenu('campaign');return;}
    if(name==='rematch'){this.startMatch(this.startConfig);return;}
    if(name==='install'){this.install();return;}
    if(name==='reload'){location.reload();return;}
    if(name==='resetTutorial'){storage.write('tutorialSeen',false);this.ui.toast('Rehber bir sonraki yeni maçta açılacak.');return;}
    if(name==='tutorialStart'){this.tutorialStep=0;this.resume();this.ui.update();return;}
    if(name==='tutorialSkip'){this.tutorialStep=null;this.resume();return;}
    if(name==='tutorialNext'){this.tutorialStep=this.tutorialStep>=5?null:this.tutorialStep+1;this.ui.update();return;}
    if(name==='tutorialClose'){this.tutorialStep=null;this.ui.update();return;}
    if(!this.active())return;
    if(name==='tab'){this.tab=value;this.cancelTarget();this.ui.lastCards='';this.ui.update();return;}
    if(name==='inspectPower'){const power=this.faction.powers.find(p=>p.id===value);if(power){this.pause();this.ui.powerInfo(power);}return;}
    if(name==='cancel'){this.cancelTarget();return;}
    if(name==='all'){this.select(armyIds(this.view));return;}
    if(name==='inputMode'){this.input.setMode(this.input.mode===value?'smart':value);this.cancelTarget();this.ui.update();return;}
    if(name==='home'){const home=this.view.players[0].home;this.field.focus(home.x,home.y);return;}
    if(name==='zoom'){this.field.zoom(value==='in'?-.14:.14);return;}
    if(name==='focusEntity'){const e=this.view.entities.find(e=>e.id===Number(value));if(e?.player===0){this.select([e.id]);this.field.focus(e.x,e.y);}return;}
    if(name==='retreat'){const ids=this.selected.filter(id=>armyIds(this.view).includes(id));if(!ids.length){this.ui.toast('Geri çekilecek birlikleri seç.');return;}if(this.command({type:'retreat',ids}).ok)this.ui.toast('Birlikler merkeze çekiliyor.');return;}
    if(name==='move'||name==='attack'){if(!this.selected.some(id=>armyIds(this.view).includes(id))){this.ui.toast('Önce bir tabur veya kahraman seç.');return;}this.setTarget({kind:name,label:name==='move'?'Yürü':'Saldırarak ilerle',radius:7});return;}
    if(name==='rally'){const e=this.view.entities.find(e=>e.id===this.selected[0]);if(this.selected.length!==1||e?.kind!=='building'){this.ui.toast('Önce bir üretim binası veya merkez seç.');return;}this.setTarget({kind:'rally',building:e.id,label:'Toplanma noktası',radius:5});return;}
    if(name==='build'){const b=this.faction.buildings.find(b=>b.id===value);if(b){this.setTarget({kind:'build',id:b.id,label:b.name,range:this.catalog.rules.buildRadius});this.field.focus(this.view.players[0].home.x+25,this.view.players[0].home.y);}return;}
    if(name==='produce'){const [building,unit]=value.split(':');if(this.command({type:'produce',building:Number(building),unit}).ok)this.ui.toast('Tabur üretim kuyruğuna eklendi.');return;}
    if(name==='recruitHero'){if(this.command({type:'recruitHero',hero:value}).ok)this.ui.toast('Kahraman çağrısı kuyruğa alındı.');return;}
    if(name==='research'){if(this.command({type:'research',upgrade:value}).ok)this.ui.toast('Araştırma başladı.');return;}
    if(name==='ability'){this.ability(...value.split(':'));return;}
    if(name==='ability0'||name==='ability1'){const h=this.selected.map(id=>this.view.entities.find(e=>e.id===id)).find(e=>e.kind==='hero');if(h){const d=definition(this.catalog,this.view,h);this.ability(h.id,d.abilities[Number(name.slice(-1))].id);}else this.ui.toast('Önce bir kahraman seç.');return;}
    if(/^power[0-3]$/.test(name)){this.action('power',this.faction.powers[Number(name.slice(-1))].id);return;}
    if(name==='power'){const a=this.faction.powers.find(a=>a.id===value);if(!a)return;if(a.kind==='economy'){if(this.command({type:'power',power:a.id}).ok)this.ui.toast('Öz desteği alındı.');}else this.setTarget({kind:'power',id:a.id,label:a.name,radius:a.radius});return;}
    if(event)event.preventDefault();
  }
  changeSetup(key,value) {
    if(key.startsWith('slot'))this.setup.slots[Number(key.slice(4))]=value;else this.setup[key]=['own','enemy'].includes(key)?Number(value):value;
    this.setup=normalizeSetup(this.catalog,this.setup);storage.write('setup',this.setup);this.ui.menu('setup');
  }
  changeSetting(key,value,render=true) {
    if(['sfx','music'].includes(key))value=Number(value);
    if(!(key in this.settings))return;
    this.settings[key]=value;storage.write('settings',this.settings);this.audio.setSettings(this.settings);
    if(key==='quality')this.field.setQuality(value);
    if(key==='tutorial'&&!value)this.tutorialStep=null;
    if(render&&this.page==='settings')this.ui.menu('settings');
  }
  togglePause(){if(!this.match||this.view.ended)return;if(this.view.paused)this.resume();else this.pause();}
  pause(reason='') {
    if(!this.match||this.view.ended)return;issueCommand(this.match,{type:'pause',paused:true});this.targeting=null;this.input.reset();this.field.setTarget(null);this.refresh();this.ui.screen.hidden=true;this.ui.hud.hidden=false;this.ui.pause(reason);this.audio.pause(true);this.autosave();
  }
  resume() {if(!this.match||this.view.ended||this.fatal)return;issueCommand(this.match,{type:'pause',paused:false});this.ui.screen.hidden=true;this.ui.modal.hidden=true;this.ui.hud.hidden=false;this.lastFrame=performance.now();this.audio.pause(false);this.audio.unlock();this.refresh();}
  escape() {if(this.targeting){this.cancelTarget();return;}if(!this.ui.screen.hidden&&this.page!=='main'){this.action('back');return;}this.togglePause();}
  autosave() {
    if(!this.match||this.view?.ended)return;
    const success=storage.saveMatch(serialize(this.match),{config:this.startConfig,camera:this.field.saveCamera(),selection:this.selected,groups:this.groups,tutorialStep:this.tutorialStep});
    if(!success&&!this.storageWarned){this.storageWarned=true;this.ui.toast('Tarayıcı kayıt alanını açamadı. Bu oturumda otomatik kayıt kullanılamıyor.','error');}
    this.saved=storage.loadMatch();this.lastSave=performance.now();
  }
  exit(save=true) {
    if(save)this.autosave();this.match=null;this.view=null;this.feedback=null;this.selected=[];this.groups={};this.targeting=null;this.input.reset();this.tutorialStep=null;this.audio.resetWorld();this.audio.pause(false);this.audio.unlock();this.saved=storage.loadMatch();this.preview();this.openMenu('main');
  }
  advanceTutorial(command=null) {
    if(this.tutorialStep===null)return;
    const v=this.view,owned=v.entities.filter(e=>e.player===0);
    const field=owned.some(e=>e.type===this.faction.id+'_field'),barracks=owned.some(e=>e.type===this.faction.id+'_barracks');
    if(this.tutorialStep===0&&field||this.tutorialStep===1&&barracks||this.tutorialStep===2&&armyIds(v).length>=2||this.tutorialStep===3&&['move','attack'].includes(command?.type)||this.tutorialStep===4&&owned.some(e=>e.kind==='hero')){this.tutorialStep++;this.ui.update();}
  }
  finish() {
    if(this.endShown)return;this.endShown=true;this.targeting=null;this.field.setTarget(null);this.input.reset();
    const full=getState(this.match);
    if(full.mission?.status==='won'&&!this.progress.includes(full.mission.id)){this.progress.push(full.mission.id);if(!storage.write('progress',this.progress))this.ui.toast('Sefer ilerlemesi tarayıcıya kaydedilemedi.','error');}
    storage.remove('autosave');this.saved=null;this.audio.play(full.winner_team===0?'victory':'defeat');this.audio.vibrate(full.winner_team===0?[40,60,80]:80);this.ui.end(full);
  }
  async install() {
    const prompt=window.__gkInstallPrompt;
    if(prompt){window.__gkInstallPrompt=null;try{await prompt.prompt();await prompt.userChoice;}catch{this.ui.toast('Tarayıcı menüsünden uygulamayı yüklemeyi dene.');}}
    else this.ui.toast(/iPad|iPhone|iPod/.test(navigator.userAgent)?'Safari’de Paylaş → Ana Ekrana Ekle yolunu kullan.':'Adres çubuğundaki yükleme simgesini veya tarayıcı menüsündeki “Uygulamayı yükle” seçeneğini kullan. Kurulum için güvenli bağlantı gerekir.');
  }
  fail(message) {
    if(this.fatal)return;this.autosave();if(this.match)issueCommand(this.match,{type:'pause',paused:true});this.audio.pause(true);this.fatal=true;
    this.ui.dialog('Savaş güvenle durduruldu',`<p>${message}</p>`, '<button class="primary" data-action="reload">Sayfayı yenile</button>');
  }
  frame(now) {
    const dt=Math.min(.1,Math.max(0,(now-this.lastFrame)/1000));this.lastFrame=now;
    if(!document.hidden&&!this.fatal){try{
      if(this.active()){
        this.input.update(dt);step(this.match,dt);this.queryElapsed=(this.queryElapsed||0)+dt;
        // Refresh snapshots four times per second; drawing interpolates between snapshots.
        if(this.queryElapsed>=.25){this.queryElapsed%=.25;this.refresh();const events=this.feedback.drain(this.match,this.view,this.fog);this.field.handleEvents(events);this.audio.handleEvents(events,this.view,this.audioListener());
          for(const message of personalNotices(events))this.ui.toast(message);
          this.advanceTutorial();if(this.view.ended)this.finish();
        }
      }
      this.field.draw(dt,now/1000);this.audio.update(dt,this.match?this.view:null,this.audioListener());
      if(this.match&&!this.ui.hud.hidden&&now-(this.lastMap||0)>150){const minimap=document.getElementById('minimap');if(minimap)this.field.minimap(minimap);this.lastMap=now;}
      if(this.match&&!this.view.ended&&now-this.lastSave>=15000)this.autosave();
    }catch(error){console.error(error);this.fail('Beklenmeyen bir hata nedeniyle savaş durdu. Son otomatik kayıttan devam etmek için sayfayı yenile.');}}
    requestAnimationFrame(t=>this.frame(t));
  }
}
export function start(){const game=new Game();if(new URLSearchParams(location.search).has('debug'))window.__gkGame=game;return game;}
