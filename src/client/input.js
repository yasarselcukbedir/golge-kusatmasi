export class Controls {
  constructor(canvas, battlefield, hooks) {
    this.canvas=canvas;this.field=battlefield;this.hooks=hooks;this.pointers=new Map();this.keys=new Set();this.pointer=null;this.mode='smart';this.gesture=false;this.lastTap=0;
    canvas.addEventListener('contextmenu',e=>e.preventDefault());
    canvas.addEventListener('pointerdown',e=>this.down(e));
    canvas.addEventListener('pointermove',e=>this.move(e));
    canvas.addEventListener('pointerup',e=>this.up(e));
    canvas.addEventListener('pointercancel',e=>this.cancel(e));
    canvas.addEventListener('lostpointercapture',e=>{if(this.pointers.has(e.pointerId))this.cancel(e);});
    canvas.addEventListener('pointerleave',()=>{if(!this.pointers.size)this.pointer=null;});
    canvas.addEventListener('wheel',e=>{if(!hooks.active())return;e.preventDefault();battlefield.zoom(Math.max(-.22,Math.min(.22,e.deltaY*.001)));},{passive:false});
    window.addEventListener('keydown',e=>this.keydown(e));
    window.addEventListener('keyup',e=>this.keys.delete(e.code));
    window.addEventListener('blur',()=>this.reset());
    this.box=document.getElementById('selection-box');
  }
  setMode(mode) {this.mode=mode;this.reset();}
  reset() {this.pointers.clear();this.keys.clear();this.box.hidden=true;this.pointer=null;this.gesture=false;}
  down(e) {
    this.hooks.unlock();
    if(!this.hooks.active())return;
    e.preventDefault();this.canvas.setPointerCapture(e.pointerId);
    if(!this.pointers.size)this.gesture=false;
    const target=this.field.pick(e.clientX,e.clientY,true);
    let action='smart';
    if(e.button===2)action='order';
    else if(this.hooks.targeting())action='target';
    else if(e.button===1||e.button===0&&this.keys.has('Space')||this.mode==='pan')action='pan';
    else if(this.mode==='box')action='box';
    else if(e.pointerType==='touch'&&target&&this.hooks.selected().includes(target.id))action='dragOrder';
    this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,button:e.button,touch:e.pointerType==='touch',action,moved:false,shift:e.shiftKey});
    if(this.pointers.size===2){this.gesture=true;this.box.hidden=true;}
  }
  move(e) {
    this.pointer={x:e.clientX,y:e.clientY,touch:e.pointerType==='touch'};
    if(!this.hooks.active())return;
    this.hooks.hover(this.field.worldPoint(e.clientX,e.clientY));
    const p=this.pointers.get(e.pointerId);if(!p)return;
    const dx=e.clientX-p.x,dy=e.clientY-p.y;
    if(this.pointers.size===2){
      const other=[...this.pointers.entries()].find(([id])=>id!==e.pointerId)?.[1];
      if(other){const old=Math.hypot(p.x-other.x,p.y-other.y),now=Math.hypot(e.clientX-other.x,e.clientY-other.y);if(old>6&&now>6)this.field.zoom(Math.log(old/now));this.field.panPixels(dx*.5,dy*.5);}
      p.x=e.clientX;p.y=e.clientY;return;
    }
    p.x=e.clientX;p.y=e.clientY;
    if(Math.hypot(p.x-p.startX,p.y-p.startY)>8)p.moved=true;
    if(!p.moved)return;
    if(p.action==='pan'||p.touch&&p.action==='smart'&&this.mode!=='box'&&!this.hooks.targeting())this.field.panPixels(dx,dy);
    else if(p.action==='box'||!p.touch&&p.action==='smart'&&!this.hooks.targeting()){
      const r=this.rectangle(p);Object.assign(this.box.style,{left:r.left+'px',top:r.top+'px',width:r.right-r.left+'px',height:r.bottom-r.top+'px'});this.box.hidden=false;
    }
  }
  rectangle(p){return {left:Math.min(p.startX,p.x),right:Math.max(p.startX,p.x),top:Math.min(p.startY,p.y),bottom:Math.max(p.startY,p.y)};}
  up(e) {
    const p=this.pointers.get(e.pointerId);if(!p)return;
    this.pointers.delete(e.pointerId);this.box.hidden=true;
    if(this.gesture)return;
    if(!this.hooks.active())return;
    const point=this.field.worldPoint(e.clientX,e.clientY),hit=this.field.pick(e.clientX,e.clientY);
    if(p.action==='pan')return;
    if(p.moved&&(p.action==='box'||!p.touch&&p.action==='smart'&&!this.hooks.targeting()))this.hooks.select(this.field.box(this.rectangle(p)),p.shift);
    else if(p.action==='order'||p.moved&&p.action==='dragOrder')this.hooks.order(point,hit);
    else if(!p.moved||this.hooks.targeting()){
      const now=performance.now(),double=now-this.lastTap<320&&this.lastEntity===hit?.id;
      this.hooks.click(point,hit,p.shift,p.touch,double);this.lastTap=now;this.lastEntity=hit?.id;
    }
  }
  cancel(e) {this.pointers.delete(e.pointerId);this.box.hidden=true;this.gesture=true;}
  keydown(e) {
    if(e.target.closest('input,select,textarea')||e.metaKey)return;
    if(e.code==='Escape'){e.preventDefault();if(!e.repeat)this.hooks.escape();return;}
    if(!this.hooks.match())return;
    if(e.code==='KeyP'){e.preventDefault();if(!e.repeat)this.hooks.pause();return;}
    if(!this.hooks.active())return;
    if(e.ctrlKey&&e.code==='KeyA'){e.preventDefault();this.hooks.all();return;}
    if(e.code.startsWith('Digit')){e.preventDefault();if(!e.repeat)this.hooks.digit(Number(e.code.slice(-1)),e.ctrlKey);return;}
    if(e.ctrlKey)return;
    if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowLeft','ArrowDown','ArrowRight','Space'].includes(e.code)){e.preventDefault();this.keys.add(e.code);return;}
    if(!e.repeat){
      const actions={KeyB:'build',KeyH:'heroes',KeyF:'powers',KeyU:'selection',KeyT:'all',KeyR:'retreat',KeyG:'attack',KeyM:'move',KeyY:'rally',Home:'home',KeyQ:'ability0',KeyE:'ability1',KeyZ:'power0',KeyX:'power1',KeyC:'power2',KeyV:'power3'};
      if(actions[e.code]){e.preventDefault();this.hooks.action(actions[e.code]);}
    }
  }
  update(dt) {
    if(!this.hooks.active())return;
    let x=0,y=0;
    if(this.keys.has('KeyW')||this.keys.has('ArrowUp'))y--;
    if(this.keys.has('KeyS')||this.keys.has('ArrowDown'))y++;
    if(this.keys.has('KeyA')||this.keys.has('ArrowLeft'))x--;
    if(this.keys.has('KeyD')||this.keys.has('ArrowRight'))x++;
    if(this.pointer&&!this.pointer.touch&&!this.pointers.size&&!this.hooks.targeting()&&innerWidth>800){
      if(this.pointer.x<12)x--;if(this.pointer.x>innerWidth-12)x++;
      if(this.pointer.y<8)y--;if(this.pointer.y>innerHeight-8)y++;
    }
    if(x||y)this.field.pan(x*dt*this.field.distance*.75,y*dt*this.field.distance*.75);
  }
}
