import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import {WorldFog} from './fog-texture.js';
import {VisualLibrary} from './visuals.js';
import {MODEL_SHAPES,shapeTriangles,transformPoint} from './geometry.js';
import {battalionLayout} from '../sim/index.js';

const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
export const PALETTES = {
  catal: {ground:0x687951, light:0xa2a678, stone:0x8e9990, water:0x466f79, sky:0x1c3036},
  havza: {ground:0x4e7462, light:0x8ca688, stone:0x8b9f98, water:0x385c70, sky:0x192e36},
  teras: {ground:0x94704b, light:0xc5a876, stone:0xae9272, water:0x686b58, sky:0x332d2a},
  ayna: {ground:0x667283, light:0xb1b3b0, stone:0x8a9da8, water:0x536c8c, sky:0x252a3d}
};
function random(seed) { let x = seed >>> 0; return () => { x = (Math.imul(1664525,x) + 1013904223) >>> 0; return x / 4294967296; }; }
const color = n => new THREE.Color(n);

export class Battlefield {
  constructor(canvas, catalog, quality) {
    this.canvas = canvas; this.catalog = catalog; this.quality = quality;
    this.renderer = new THREE.WebGLRenderer({canvas, antialias:quality !== 'dusuk', alpha:false, powerPreference:'high-performance'});
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = 1.25;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(43,1,0.5,1800);
    this.target = {x:90,y:210}; this.distance = 210;
    this.raycaster = new THREE.Raycaster(); this.plane = new THREE.Plane(new THREE.Vector3(0,1,0),0);
    this.vector = new THREE.Vector3(); this.matrix = new THREE.Matrix4(); this.dummy = new THREE.Object3D();
    this.visuals = new VisualLibrary(catalog); this.preparedModels = new WeakMap(); this.buildingGeometry = new Map();
    this.figureRotation = new THREE.Quaternion(); this.partRotation = new THREE.Quaternion(); this.up = new THREE.Vector3(0,1,0);
    this.tints = new Map(); this.geometry = new Map(); this.materials = new Map(); this.batches = new Map(); this.buildings = new Map(); this.positions = new Map();
    this.effects = []; this.effectPool = []; this.lastKnown = new Map(); this.lastTime = 0; this.view = null; this.selected = new Set();
    this.worldFog = new WorldFog(THREE);
    this.fogSize = new THREE.Vector2(640,420);
    this.scene.add(new THREE.HemisphereLight(0xc8e0e0,0x4c5136,2.3));
    this.sun = new THREE.DirectionalLight(0xffdfae,3.4); this.sun.position.set(-80,260,100); this.scene.add(this.sun);
    this.sun.shadow.mapSize.set(1024,1024); this.sun.shadow.camera.left = -310; this.sun.shadow.camera.right = 310;
    this.sun.shadow.camera.top = 260; this.sun.shadow.camera.bottom = -260; this.sun.shadow.camera.near = 10; this.sun.shadow.camera.far = 650;
    this.sun.shadow.normalBias = 1.2; this.sun.shadow.bias = -0.0001;
    this.sun.target.position.set(220,0,210); this.scene.add(this.sun.target);
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.environment = new THREE.Group(); this.scene.add(this.environment);
    this.entityLayer = new THREE.Group(); this.scene.add(this.entityLayer);
    this.effectLayer = new THREE.Group(); this.scene.add(this.effectLayer);
    this.makeBatches();
    this.ghost = new THREE.Group();
    this.ghostRing = new THREE.Mesh(this.geo('ring'),new THREE.MeshBasicMaterial({color:0x8fe3bc,transparent:true,opacity:0.8,depthWrite:false,side:THREE.DoubleSide}));
    this.ghost.add(this.ghostRing);
    this.ghostBox = new THREE.Mesh(this.geo('box'),new THREE.MeshBasicMaterial({color:0x8fe3bc,wireframe:true,transparent:true,opacity:0.6}));
    this.ghostBox.position.y = 7; this.ghostBox.scale.set(14,14,14); this.ghost.add(this.ghostBox);
    this.rangeRing = new THREE.Mesh(this.geo('thinRing'),new THREE.MeshBasicMaterial({color:0xffdb85,transparent:true,opacity:0.4,depthWrite:false,side:THREE.DoubleSide}));
    this.scene.add(this.ghost,this.rangeRing); this.ghost.visible = false; this.rangeRing.visible = false;
    this.setQuality(quality); this.resize();
  }
  geo(name) {
    if (this.geometry.has(name)) return this.geometry.get(name);
    let g;
    if (name.startsWith('model_')) {g = new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(shapeTriangles(name.slice(6)),3));g.computeVertexNormals();}
    else if (name === 'box') g = new THREE.BoxGeometry(1,1,1);
    else if (name === 'ball') g = new THREE.IcosahedronGeometry(1,0);
    else if (name === 'crystal') g = new THREE.OctahedronGeometry(1,0);
    else if (name === 'cone') g = new THREE.ConeGeometry(1,1,6);
    else if (name === 'round') g = new THREE.CylinderGeometry(1,1,1,10);
    else if (name === 'taper') g = new THREE.CylinderGeometry(0.65,1,1,6);
    else if (name === 'roof') g = new THREE.ConeGeometry(1,1,4);
    else if (name === 'bow') g = new THREE.TorusGeometry(1,0.13,3,8,Math.PI);
    else if (name === 'torus') g = new THREE.TorusGeometry(1,0.12,4,10);
    else if (name === 'bar') g = new THREE.PlaneGeometry(1,1);
    else if (name === 'ring' || name === 'thinRing') { g = new THREE.RingGeometry(name === 'ring'?0.85:0.98,1,40); g.rotateX(-Math.PI/2); }
    else throw Error('Bilinmeyen çizim şekli');
    this.geometry.set(name,g); return g;
  }
  fogMaterial(key, hex, options = {}) {
    if (this.materials.has(key)) return this.materials.get(key);
    const m = new THREE.MeshStandardMaterial({color:hex,roughness:0.85,flatShading:true,...options});
    m.onBeforeCompile = shader => {
      shader.uniforms.uFog = this.worldFog.uniform; shader.uniforms.uFogSize = {value:this.fogSize};
      shader.vertexShader = 'varying vec2 vFogWorld;\n' + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace('#include <worldpos_vertex>', `#include <worldpos_vertex>
        vec4 fogPosition = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          fogPosition = instanceMatrix * fogPosition;
        #endif
        vFogWorld = (modelMatrix * fogPosition).xz;`);
      shader.fragmentShader = 'uniform sampler2D uFog; uniform vec2 uFogSize; varying vec2 vFogWorld;\n' + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace('#include <dithering_fragment>', `#include <dithering_fragment>
        vec2 fogUV = clamp(vec2(vFogWorld.x / uFogSize.x, vFogWorld.y / uFogSize.y), 0.0, 1.0);
        gl_FragColor.rgb *= max(0.035, 1.0 - texture2D(uFog, fogUV).a);`);
    };
    m.customProgramCacheKey = () => 'gk-fog-rgba-v2'; this.materials.set(key,m); return m;
  }
  mesh(parent, shape, material, x,y,z,sx,sy,sz,ry = 0) {
    const mesh = new THREE.Mesh(this.geo(shape),material); mesh.position.set(x,y,z); mesh.scale.set(sx,sy,sz); mesh.rotation.y = ry;
    mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
  }
  makeBatches() {
    const defs = {gear:'box',crystal:'crystal',pole:'round',ring:'ring',aura:'thinRing',healthBack:'bar',health:'bar'};
    const capacities=this.visuals.batchCapacities();
    for(const shape of MODEL_SHAPES)defs['part_'+shape]='model_'+shape;
    for (const [name,shape] of Object.entries(defs)) {
      const basic = ['ring','aura','health','healthBack'].includes(name);
      const material = basic ? new THREE.MeshBasicMaterial({color:0xffffff,transparent:['ring','aura'].includes(name),opacity:name==='aura'?0.25:name==='ring'?0.85:1,depthWrite:false,side:THREE.DoubleSide}) : this.fogMaterial('batch-'+name,0xffffff);
      const capacity=name.startsWith('part_')?(capacities[name.slice(5)]||512):2200;
      const mesh = new THREE.InstancedMesh(this.geo(shape),material,capacity);
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); mesh.count = 0; mesh.frustumCulled = false;
      mesh.castShadow = !basic; mesh.receiveShadow = !basic; if (basic) mesh.renderOrder = 5;
      this.entityLayer.add(mesh); this.batches.set(name,{mesh,count:0,capacity});
    }
  }
  instance(name, x,y,z,sx,sy,sz,tint, rotation = null) {
    const batch = this.batches.get(name); if (!batch || batch.count >= batch.capacity) return;
    this.dummy.position.set(x,y,z); this.dummy.scale.set(sx,sy,sz);
    if (rotation?.isQuaternion) this.dummy.quaternion.copy(rotation);
    else this.dummy.rotation.set(rotation?.x||0,rotation?.y||0,rotation?.z||0);
    this.dummy.updateMatrix();
    if(!this.tints.has(tint))this.tints.set(tint,color(tint));
    batch.mesh.setMatrixAt(batch.count,this.dummy.matrix); batch.mesh.setColorAt(batch.count,this.tints.get(tint)); batch.count++;
  }
  setQuality(quality) {
    this.quality = quality; this.renderer.setPixelRatio(Math.min(devicePixelRatio||1,quality==='yuksek'?1.7:quality==='orta'?1.25:1));
    this.renderer.shadowMap.enabled = quality === 'yuksek'; this.sun.castShadow = quality === 'yuksek';
    if (this.map) this.makeEnvironment(); this.resize();
  }
  height(x,z) { return Math.sin(x*0.022)*0.65 + Math.cos(z*0.029)*0.5 + Math.sin((x+z)*0.014)*0.5; }
  setMap(map) {
    this.map = map; this.palette = PALETTES[map.id]; this.fogSize.set(map.width,map.height);
    this.scene.background = color(this.palette.sky); this.scene.fog = new THREE.FogExp2(this.palette.sky,0.0011);
    this.worldFog.reset(Math.ceil(map.width/this.catalog.rules.grid),Math.ceil(map.height/this.catalog.rules.grid));
    for (const record of this.buildings.values()) this.entityLayer.remove(record.group);
    this.buildings.clear(); this.positions.clear(); this.lastKnown.clear(); this.clearEffects(); this.makeEnvironment();
    this.target = {x:90,y:map.height/2}; this.distance = innerWidth < 600 ? 255 : 210; this.updateCamera();
  }
  clearEnvironment() {
    for (const item of [...this.environment.children]) {
      this.environment.remove(item);
      if (item.userData.ownedGeometry) item.geometry.dispose();
      if (item.isInstancedMesh) item.dispose();
    }
  }
  makeEnvironment() {
    this.clearEnvironment(); const map = this.map, pal = this.palette, rng = random(9183 + map.width);
    const w=map.width,h=map.height,cols=48,rows=34,vertices=[],colors=[],indices=[];
    const dark=color(pal.ground), light=color(pal.light), scratch=new THREE.Color();
    for (let j=0;j<=rows;j++) for (let i=0;i<=cols;i++) {
      const x=w*i/cols,z=h*j/rows; vertices.push(x,this.height(x,z)-0.3,z);
      let mix = 0.14 + rng()*0.28;
      if (Math.abs(z - h/2 - Math.sin(x*.014)*13) < 12) mix += .28;
      scratch.copy(dark).lerp(light,mix);
      for (const area of map.terrain) if (Math.hypot(x-area.x,z-area.y)<area.radius) scratch.lerp(color(pal.water),0.67);
      colors.push(scratch.r,scratch.g,scratch.b);
    }
    for (let j=0;j<rows;j++) for (let i=0;i<cols;i++) { const a=j*(cols+1)+i,b=a+cols+1;indices.push(a,b,a+1,b,b+1,a+1); }
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3)); geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3)); geometry.setIndex(indices); geometry.computeVertexNormals();
    const ground = new THREE.Mesh(geometry,this.fogMaterial('ground',0xffffff,{vertexColors:true})); ground.receiveShadow=true; ground.userData.ownedGeometry = true; this.environment.add(ground);
    const cliff = this.fogMaterial('cliff',0x394a40);
    this.mesh(this.environment,'box',cliff,w/2,-7,h/2,w,13,h);
    const count=this.quality==='dusuk'?90:this.quality==='orta'?200:320;
    const trunks=new THREE.InstancedMesh(this.geo('taper'),this.fogMaterial('trunks',0x6a6350),count);
    const trees=new THREE.InstancedMesh(this.geo(map.id==='ayna'?'crystal':'cone'),this.fogMaterial('leaves-'+map.id,map.id==='teras'?0x79794c:map.id==='ayna'?0x7d929d:0x3d6651),count);
    const rocks=new THREE.InstancedMesh(this.geo('ball'),this.fogMaterial('rocks-'+map.id,pal.stone),count);
    const temp=new THREE.Object3D(); let n=0;
    for (let i=0;i<count*4 && n<count;i++) {
      const x=rng()*w,z=rng()*h;
      if (x>30&&x<155 || x>w-155&&x<w-30 || Math.abs(z-h/2)<28 || map.outposts.some(o=>Math.hypot(x-o.x,z-o.y)<38) || map.camps.some(o=>Math.hypot(x-o.x,z-o.y)<32)) continue;
      const s=3+rng()*4,y=this.height(x,z);
      temp.position.set(x,y+3,z); temp.scale.set(.8,6,.8); temp.rotation.set(0,rng()*6,0); temp.updateMatrix(); trunks.setMatrixAt(n,temp.matrix);
      temp.position.y=y+6+s; temp.scale.set(s,s*2,s); temp.updateMatrix(); trees.setMatrixAt(n,temp.matrix);
      const tint = color(map.id==='teras'?0x7f8053:map.id==='ayna'?0x82949f:0x3f6b55).multiplyScalar(.85+rng()*.35); trees.setColorAt(n,tint);
      temp.position.set(clamp(x+10,0,w),y+1.3,clamp(z+7,0,h)); temp.scale.set(2+rng()*3,1.5+rng()*2,2+rng()*3); temp.rotation.set(rng(),rng()*6,rng()); temp.updateMatrix(); rocks.setMatrixAt(n,temp.matrix); n++;
    }
    for (const mesh of [trunks,trees,rocks]) { mesh.count=n; mesh.castShadow=true; mesh.receiveShadow=true; this.environment.add(mesh); }
    const postMat=this.fogMaterial('postStone',0xc2b793), metal=this.fogMaterial('metal',0x776c50);
    for (const post of map.outposts) {
      const y=this.height(post.x,post.y);
      this.mesh(this.environment,'round',postMat,post.x,y+1,post.y,11,2,11);
      this.mesh(this.environment,'taper',postMat,post.x,y+6,post.y,3,10,3);
      this.mesh(this.environment,'crystal',metal,post.x,y+13,post.y,3,5,3);
    }
    for (const camp of map.camps) {
      const y=this.height(camp.x,camp.y);
      this.mesh(this.environment,'roof',this.fogMaterial('camp',0xa77b51),camp.x-10,y+4,camp.y+9,10,9,10,.4);
      this.mesh(this.environment,'round',metal,camp.x+9,y+1,camp.y+7,4,2,4);
    }
  }
  setView(view, fog, selection, layouts=null) {
    this.view = view; this.selected = new Set(selection);
    this.layouts=layouts;
    for(const e of view.entities)this.lastKnown.set(e.id,{...e,seenAt:view.time});
    for(const [id,e] of this.lastKnown)if(view.time-e.seenAt>12)this.lastKnown.delete(id);
    this.worldFog.update(fog); this.fog=fog;
    const seen = new Set();
    for (const e of view.entities) if (e.kind==='building') {
      seen.add(e.id);
      if (!this.buildings.has(e.id)) this.buildings.set(e.id,this.createBuilding(e));
    }
    for (const [id,record] of this.buildings) if (!seen.has(id)) {this.entityLayer.remove(record.group);this.buildings.delete(id);}
    const ids = new Set(view.entities.map(e=>e.id));
    for (const id of this.positions.keys()) if (!ids.has(id)) this.positions.delete(id);
  }
  modelFor(e) {
    const faction=e.player>=0?this.view.players[e.player].faction:null;
    return this.visuals.get(faction,e.type,e.player<0?'neutral':e.kind);
  }
  preparedModel(model) {
    let prepared=this.preparedModels.get(model);
    if(!prepared){prepared=model.parts.map(part=>({...part,quaternion:new THREE.Quaternion().setFromEuler(new THREE.Euler(...part.rotation))}));this.preparedModels.set(model,prepared);}
    return prepared;
  }
  mergedBuilding(model) {
    if(this.buildingGeometry.has(model.id))return this.buildingGeometry.get(model.id);
    const vertices=[],colors=[];
    for(const part of model.parts){
      const triangles=shapeTriangles(part.shape);
      if(!this.tints.has(part.color))this.tints.set(part.color,color(part.color));
      const c=this.tints.get(part.color);
      for(let i=0;i<triangles.length;i+=3){vertices.push(...transformPoint([triangles[i],triangles[i+1],triangles[i+2]],part));colors.push(c.r,c.g,c.b);}
    }
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.computeVertexNormals();
    this.buildingGeometry.set(model.id,geometry);return geometry;
  }
  createBuilding(e) {
    const f=this.catalog.factions.find(f=>f.id===this.view.players[e.player].faction),definition=f.buildings.find(b=>b.id===e.type),model=this.modelFor(e);
    const group=new THREE.Group();group.position.set(e.x,this.height(e.x,e.y),e.y);group.userData.visualId=model.id;this.entityLayer.add(group);
    const building=new THREE.Mesh(this.mergedBuilding(model),this.fogMaterial('architecture',0xffffff,{vertexColors:true}));
    building.castShadow=true;building.receiveShadow=true;group.add(building);
    const scaffold=new THREE.Mesh(this.geo('box'),this.materials.get('scaffold')||new THREE.MeshBasicMaterial({color:0xf4d88b,wireframe:true,transparent:true,opacity:.4}));
    this.materials.set('scaffold',scaffold.material);
    const [min,max]=[model.bounds.min,model.bounds.max];
    scaffold.scale.set(max[0]-min[0]+2,max[1]+1,max[2]-min[2]+2);scaffold.position.set((max[0]+min[0])/2,max[1]/2,(max[2]+min[2])/2);group.add(scaffold);
    return {group,scaffold,type:definition.type,definition};
  }
  updateCamera() {
    if (!this.map) return;
    this.target.x=clamp(this.target.x,0,this.map.width);this.target.y=clamp(this.target.y,0,this.map.height);
    this.distance=clamp(this.distance,105,440);
    this.camera.position.set(this.target.x,this.distance*.88,this.target.y+this.distance*.76);
    this.camera.lookAt(this.target.x,0,this.target.y);this.camera.updateMatrixWorld();
  }
  pan(dx,dy) {this.target.x+=dx;this.target.y+=dy;this.updateCamera();}
  panPixels(dx,dy) {const scale=this.distance/Math.max(250,this.canvas.clientHeight)*.85;this.pan(-dx*scale,-dy*scale*1.45);}
  zoom(delta) {this.distance*=Math.exp(delta);this.updateCamera();}
  focus(x,y) {this.target={x,y};this.updateCamera();}
  saveCamera() {return {x:this.target.x,y:this.target.y,distance:this.distance};}
  restoreCamera(c) {if(c && [c.x,c.y,c.distance].every(Number.isFinite)){this.target={x:c.x,y:c.y};this.distance=c.distance;this.updateCamera();}}
  resize() {const w=this.canvas.clientWidth||innerWidth,h=this.canvas.clientHeight||innerHeight;this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.updateCamera();}
  worldPoint(clientX,clientY) {
    const r=this.canvas.getBoundingClientRect();this.raycaster.setFromCamera(new THREE.Vector2((clientX-r.left)/r.width*2-1,-(clientY-r.top)/r.height*2+1),this.camera);
    const p=this.raycaster.ray.intersectPlane(this.plane,new THREE.Vector3());
    return p && this.map ? {x:clamp(p.x,0,this.map.width),y:clamp(p.z,0,this.map.height)} : null;
  }
  project(x,y,height=4) {const r=this.canvas.getBoundingClientRect();const p=new THREE.Vector3(x,this.height(x,y)+height,y).project(this.camera);return {x:r.left+(p.x*.5+.5)*r.width,y:r.top+(-p.y*.5+.5)*r.height,z:p.z};}
  pick(x,y,ownOnly=false) {
    if(!this.view)return null;let chosen=null,best=Infinity;
    for (const e of this.view.entities) {
      if (ownOnly&&e.player!==0) continue;
      const p=this.project(e.x,e.y,e.kind==='building'?11:e.kind==='hero'?this.modelFor(e).bounds.max[1]*.45:4),radius=e.kind==='building'?Math.max(20,5200/this.distance):Math.max(17,3200/this.distance),d=Math.hypot(p.x-x,p.y-y);
      if(p.z<1&&d<radius&&d/radius<best){best=d/radius;chosen=e;}
    }
    return chosen;
  }
  box(rect) {return this.view?.entities.filter(e=>e.player===0&&['unit','hero'].includes(e.kind)).filter(e=>{const p=this.project(e.x,e.y);return p.z<1&&p.x>=rect.left&&p.x<=rect.right&&p.y>=rect.top&&p.y<=rect.bottom;}).map(e=>e.id)||[];}
  setTarget(mode,point,valid=true,origin=null) {
    if (!mode || !point) {this.ghost.visible=false;this.rangeRing.visible=false;return;}
    this.ghost.visible=true;this.ghost.position.set(point.x,this.height(point.x,point.y)+.8,point.y);
    const tint=valid?0xa6efbf:0xff776a;this.ghostRing.material.color.setHex(tint);this.ghostBox.material.color.setHex(tint);
    const radius=mode.kind==='build'?12:mode.radius||9;this.ghostRing.scale.setScalar(radius);this.ghostBox.visible=mode.kind==='build';
    this.rangeRing.visible=!!origin;
    if(origin){this.rangeRing.position.set(origin.x,this.height(origin.x,origin.y)+.6,origin.y);this.rangeRing.scale.setScalar(mode.range||100);}
  }
  effect(type,x,y,tint=0xf3d290) {
    if(this.effects.length>=48||!Number.isFinite(x)||!Number.isFinite(y))return;
    let mesh=this.effectPool.pop();
    if(!mesh){mesh=new THREE.Mesh(this.geo('ring'),new THREE.MeshBasicMaterial({transparent:true,opacity:1,depthWrite:false,side:THREE.DoubleSide}));this.effectLayer.add(mesh);}
    mesh.visible=true;mesh.material.color.setHex(tint);mesh.position.set(x,this.height(x,y)+1.4,y);
    this.effects.push({mesh,age:0,duration:type==='power'?1.6:type==='death'?.8:.65,max:type==='power'?58:type==='ability'?43:type==='order'?10:6});
  }
  handleEvents(events) {
    for(const event of events){
      const e=this.view.entities.find(e=>e.id===event.id)||this.lastKnown.get(event.id),target=this.view.entities.find(e=>e.id===event.target)||this.lastKnown.get(event.target);
      const p=Number.isFinite(event.x)?event:target||e||this.view.outposts.find(p=>p.id===event.outpost)||this.view.camps.find(p=>p.id===event.camp);
      if (p&&['attack','death','ability','power','level','capture'].includes(event.type)) this.effect(event.type,p.x,p.y,event.type==='attack'?0xffe2a2:event.type==='death'?0xff8063:event.type==='level'?0xffe599:0x90e3d3);
    }
  }
  clearEffects() {for(const e of this.effects){e.mesh.visible=false;this.effectPool.push(e.mesh);}this.effects=[];}
  soldier(e,pos,index,time) {
    const faction=e.player>=0?this.catalog.factions.find(f=>f.id===this.view.players[e.player].faction):null;
    const definition=(e.kind==='hero'?faction?.heroes:faction?.units)?.find(u=>u.id===e.type),model=this.modelFor(e),parts=this.preparedModel(model);
    const moving=Math.hypot(pos.x-e.x,pos.y-e.y)>.8||e.order&&['move','retreat','attack'].includes(e.order.type)&&Math.hypot(e.x-e.order.x,e.y-e.order.y)>4;
    const slots=e.kind==='escort'?[{x:e.x,y:e.y,heading:e.facing??0}]:(this.layouts?.get(e.id)||battalionLayout(e,definition));
    const total=Math.min(slots.length,e.kind==='hero'||e.kind==='escort'||e.role==='siege'?1:this.quality==='dusuk'?3:this.quality==='orta'?5:8);
    if(!total)return;
    // Sim headings face +X; the models face local +Z. Only local rank spacing
    // is enlarged to fit the authored models; the battalion center is untouched.
    const rotation=Math.PI/2-slots[0].heading,c=Math.cos(rotation),s=Math.sin(rotation),spread=e.role==='cavalry'?1.5:e.role==='special'?1.3:1.8;
    this.figureRotation.setFromAxisAngle(this.up,rotation);
    for(let i=0;i<total;i++){
      const slot=slots[i],x=pos.x+(slot.x-e.x)*spread,z=pos.y+(slot.y-e.y)*spread,y=this.height(x,z)+(moving?Math.sin(time*10+i)*.18:0);
      for(const part of parts){
        if(part.detail&&this.quality==='dusuk')continue;
        const [px,py,pz]=part.position;
        this.partRotation.copy(this.figureRotation).multiply(part.quaternion);
        this.instance('part_'+part.shape,x+px*c+pz*s,y+py,z-px*s+pz*c,...part.scale,part.color,this.partRotation);
      }
    }
  }
  draw(dt,time) {
    if(!this.map)return;
    this.updateCamera();for(const batch of this.batches.values())batch.count=0;
    const smooth=1-Math.exp(-dt*8);
    if(this.view)for(const e of this.view.entities){
      let p=this.positions.get(e.id);if(!p){p={x:e.x,y:e.y};this.positions.set(e.id,p);}p.x+=(e.x-p.x)*smooth;p.y+=(e.y-p.y)*smooth;
      if(e.kind==='building'){
        const b=this.buildings.get(e.id);if(b){const progress=b.definition.buildTime?clamp(1-(e.readyAt-this.view.time)/b.definition.buildTime,0,1):1;b.group.scale.y=.18+.82*progress;b.scaffold.visible=progress<1;}
      }else this.soldier(e,p,e.id,time);
      const selected=this.selected.has(e.id),hero=e.kind==='hero',building=e.kind==='building';
      if(selected&&hero){
        const f=this.catalog.factions.find(f=>f.id===this.view.players[e.player].faction),a=f.heroes.find(h=>h.id===e.type)?.aura;
        if(a)this.instance('aura',p.x,this.height(p.x,p.y)+.45,p.y,a.radius,1,a.radius,f.color);
      }
      if(selected&&building&&e.rally){
        const r=e.rally,y=this.height(r.x,r.y);
        this.instance('pole',r.x,y+5,r.y,.3,10,.3,0xe7ce91);
        this.instance('gear',r.x+2,y+8,r.y,4,3,.4,0xe7ce91);
        this.instance('ring',r.x,y+.4,r.y,4,1,4,0xe7ce91);
      }
      if(selected||hero||e.player===0&&e.kind!=='building')this.instance('ring',p.x,this.height(p.x,p.y)+.3,p.y,building?16:hero?7:8,1,building?16:hero?7:8,selected?0xb7f8e0:hero?0xf6cd62:0x6cb7b5);
      if(selected||e.hp<e.maxHp*.98||hero||building&&e.readyAt>this.view.time){
        const y=this.height(p.x,p.y)+this.modelFor(e).bounds.max[1]+2,width=building?21:13;
        const q=this.camera.quaternion;this.instance('healthBack',p.x,y,p.y,width+1,1.9,1,0x19272a,q);
        const ratio=clamp(e.hp/e.maxHp,0,1);const right=new THREE.Vector3(1,0,0).applyQuaternion(q).multiplyScalar((width*ratio-width)/2);
        this.instance('health',p.x+right.x,y+right.y+.01,p.y+right.z,width*ratio,1.1,1,e.team===0?0x95deb2:e.team===1?0xf28a72:0xe0bc7d,q);
      }
    }
    if(this.view)for(const post of this.view.outposts){if(post.owner!=null||post.progress>0){const owner=this.view.players[post.owner],tint=owner?this.catalog.factions.find(f=>f.id===owner.faction).color:0xe9d6a1;this.instance('crystal',post.x,this.height(post.x,post.y)+14,post.y,3,5+Math.sin(time*2),3,tint,{y:time*.5});if(post.progress>0)this.instance('ring',post.x,1,post.y,14+post.progress,1,14+post.progress,0xf3d697);}}
    for(const batch of this.batches.values()){batch.mesh.count=batch.count;if(batch.count){batch.mesh.instanceMatrix.needsUpdate=true;if(batch.mesh.instanceColor)batch.mesh.instanceColor.needsUpdate=true;}}
    for(let i=this.effects.length-1;i>=0;i--){const e=this.effects[i];e.age+=dt;const k=e.age/e.duration;if(k>=1){e.mesh.visible=false;this.effectPool.push(e.mesh);this.effects.splice(i,1);}else{e.mesh.scale.setScalar(1+e.max*k);e.mesh.material.opacity=(1-k)*.8;}}
    this.renderer.render(this.scene,this.camera);
  }
  minimap(canvas) {
    if(!this.view||!this.fog)return;const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height,fog=this.fog,map=this.map;
    const cellW=w/fog.cols,cellH=h/fog.rows;
    ctx.fillStyle='#071116';ctx.fillRect(0,0,w,h);
    const base='#'+color(this.palette.ground).getHexString();
    for(let y=0;y<fog.rows;y++)for(let x=0;x<fog.cols;x++){const i=y*fog.cols+x;if(!fog.explored[i])continue;ctx.globalAlpha=fog.visible[i]?1:.35;ctx.fillStyle=base;ctx.fillRect(x*cellW,y*cellH,cellW+1,cellH+1);}
    ctx.globalAlpha=1;
    const visible=(p,explored=false)=>{const i=clamp(Math.floor(p.y/fog.cellSize),0,fog.rows-1)*fog.cols+clamp(Math.floor(p.x/fog.cellSize),0,fog.cols-1);return explored?fog.explored[i]:fog.visible[i];};
    for(const p of this.view.outposts)if(visible(p,true)){ctx.strokeStyle=p.owner!=null?(this.view.players[p.owner].team===0?'#8ce0c8':'#ee8b76'):'#d8c48c';ctx.lineWidth=1.5;ctx.strokeRect(p.x/map.width*w-3,p.y/map.height*h-3,6,6);}
    for(const p of this.view.camps)if(visible(p)&&!p.cleared){ctx.fillStyle='#e4af6b';ctx.beginPath();ctx.arc(p.x/map.width*w,p.y/map.height*h,3,0,Math.PI*2);ctx.fill();}
    for(const e of this.view.entities){ctx.fillStyle=e.player===0?'#d0f6dd':e.team===0?'#65bddd':e.team===1?'#f38670':'#e0ac68';const x=e.x/map.width*w,y=e.y/map.height*h,s=e.kind==='building'?3:e.kind==='hero'?3:1.8;ctx.fillRect(x-s,y-s,s*2,s*2);}
    const r=this.canvas.getBoundingClientRect(),corners=[[r.left,r.top],[r.right,r.top],[r.right,r.bottom],[r.left,r.bottom]].map(p=>this.worldPoint(...p));
    ctx.strokeStyle='#fbebc2';ctx.lineWidth=1;ctx.beginPath();corners.forEach((p,i)=>{if(p)ctx[i?'lineTo':'moveTo'](p.x/map.width*w,p.y/map.height*h);});ctx.closePath();ctx.stroke();
  }
}
