import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import {WorldFog} from './fog-texture.js';
import {VisualLibrary} from './visuals.js';
import {MODEL_SHAPES,shapeTriangles,transformPoint} from './geometry.js';
import {battalionLayout} from '../sim/index.js';

const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
export const PALETTES = {
  catal: {ground:0x4a7740, light:0x93b25e, dry:0xb9a865, path:0x9c8a63, stone:0x8e9990, water:0x3f7f8c, sky:0x1c3036, leaf:0x3f7a45},
  havza: {ground:0x3c7155, light:0x86b488, dry:0x9fae7a, path:0x8f8a6c, stone:0x8b9f98, water:0x356a82, sky:0x192e36, leaf:0x2f6b52},
  teras: {ground:0x96693f, light:0xd0aa72, dry:0xdcc08a, path:0xbd9a6e, stone:0xae9272, water:0x5f7f78, sky:0x332d2a, leaf:0x7f8a4c},
  ayna: {ground:0x566c86, light:0xa9b6c2, dry:0xc5ccd2, path:0x8d93a0, stone:0x8a9da8, water:0x4a78a8, sky:0x252a3d, leaf:0x7d9fb2}
};
function random(seed) { let x = seed >>> 0; return () => { x = (Math.imul(1664525,x) + 1013904223) >>> 0; return x / 4294967296; }; }
const color = n => new THREE.Color(n);
// Smooth value noise for terrain colouring (cosmetic only).
function makeNoise(seed) {
  const r = random(seed), grid = new Float32Array(4096); for (let i=0;i<4096;i++) grid[i] = r();
  const at = (x,y) => grid[(x&63)+(y&63)*64];
  return (x,y) => { const xi=Math.floor(x),yi=Math.floor(y),fx=x-xi,fy=y-yi,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy); return (at(xi,yi)*(1-u)+at(xi+1,yi)*u)*(1-v)+(at(xi,yi+1)*(1-u)+at(xi+1,yi+1)*u)*v; };
}
function detailTexture() {
  const size=128,canvas=document.createElement('canvas');canvas.width=canvas.height=size;const c=canvas.getContext('2d'),r=random(4711);
  c.fillStyle='#e9e9e9';c.fillRect(0,0,size,size);
  for(let i=0;i<1500;i++){const v=r();c.fillStyle=v<.5?`rgba(0,0,0,${.05+r()*.13})`:`rgba(255,255,255,${.08+r()*.2})`;const w=1+r()*2.2;c.fillRect(r()*size,r()*size,w,w*(1+r()*1.6));}
  const t=new THREE.CanvasTexture(canvas);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;
}

export class Battlefield {
  constructor(canvas, catalog, quality) {
    this.canvas = canvas; this.catalog = catalog; this.quality = quality;
    this.renderer = new THREE.WebGLRenderer({canvas, antialias:quality !== 'dusuk', alpha:false, powerPreference:'high-performance'});
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = 1.12;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(43,1,0.5,1800);
    this.target = {x:90,y:210}; this.distance = 210;
    this.raycaster = new THREE.Raycaster(); this.plane = new THREE.Plane(new THREE.Vector3(0,1,0),0);
    this.vector = new THREE.Vector3(); this.matrix = new THREE.Matrix4(); this.dummy = new THREE.Object3D();
    this.visuals = new VisualLibrary(catalog); this.preparedModels = new WeakMap(); this.buildingGeometry = new Map();
    this.figureRotation = new THREE.Quaternion(); this.partRotation = new THREE.Quaternion(); this.up = new THREE.Vector3(0,1,0);
    this.tints = new Map(); this.geometry = new Map(); this.materials = new Map(); this.batches = new Map(); this.buildings = new Map(); this.positions = new Map();
    this.effects = []; this.effectPool = []; this.lastKnown = new Map(); this.lastTime = 0; this.view = null; this.selected = new Set();
    // Battle presentation state. Purely cosmetic: nothing here feeds back into the simulation.
    this.clock = 0; this.frameDt = 0; this.combat = new Map(); this.figures = new Map(); this.projectiles = []; this.particles = []; this.fallen = []; this.pending = [];
    this.shake = 0; this.fxColor = new THREE.Color(); this.fxQuat = new THREE.Quaternion(); this.fxDir = new THREE.Vector3(); this.axisX = new THREE.Vector3(1,0,0); this.axisZ = new THREE.Vector3(0,0,1); this.leanQ = new THREE.Quaternion(); this.factionHex = new Map();
    this.worldFog = new WorldFog(THREE);
    this.fogSize = new THREE.Vector2(640,420);
    this.scene.add(new THREE.HemisphereLight(0xd6e8ff,0x4f5a3a,1.5));
    this.sun = new THREE.DirectionalLight(0xffe2b0,3.9); this.sun.position.set(-80,260,100); this.scene.add(this.sun);
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
    else if (name === 'disc') { g = new THREE.CircleGeometry(1,20); g.rotateX(-Math.PI/2); }
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
        float fogA = texture2D(uFog, fogUV).a;
        float fogSeen = smoothstep(0.0, 1.0, clamp(fogA / 0.57, 0.0, 1.0));
        float fogDark = smoothstep(0.0, 1.0, clamp((fogA - 0.57) / 0.39, 0.0, 1.0));
        vec3 fogBase = gl_FragColor.rgb;
        float fogLum = dot(fogBase, vec3(0.299, 0.587, 0.114));
        vec3 fogRemembered = mix(vec3(fogLum), fogBase, 0.6) * 0.52 + vec3(0.012, 0.022, 0.03);
        vec3 fogUnknown = vec3(0.022, 0.036, 0.046) + fogBase * 0.07;
        gl_FragColor.rgb = mix(mix(fogBase, fogRemembered, fogSeen), fogUnknown, fogDark);`);
    };
    m.customProgramCacheKey = () => 'gk-fog-rgba-v3'; this.materials.set(key,m); return m;
  }
  mesh(parent, shape, material, x,y,z,sx,sy,sz,ry = 0) {
    const mesh = new THREE.Mesh(this.geo(shape),material); mesh.position.set(x,y,z); mesh.scale.set(sx,sy,sz); mesh.rotation.y = ry;
    mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
  }
  makeBatches() {
    const defs = {shadow:'disc',gear:'box',crystal:'crystal',pole:'round',ring:'ring',aura:'thinRing',healthBack:'bar',health:'bar'};
    const capacities=this.visuals.batchCapacities();
    for(const shape of MODEL_SHAPES)defs['part_'+shape]='model_'+shape;
    for (const [name,shape] of Object.entries(defs)) {
      const basic = ['shadow','ring','aura','health','healthBack'].includes(name);
      const material = basic ? new THREE.MeshBasicMaterial({color:0xffffff,transparent:['shadow','ring','aura'].includes(name),opacity:name==='shadow'?0.3:name==='aura'?0.25:name==='ring'?0.85:1,depthWrite:false,side:THREE.DoubleSide}) : this.fogMaterial('batch-'+name,0xffffff);
      const capacity=name.startsWith('part_')?(capacities[name.slice(5)]||512):2200;
      const mesh = new THREE.InstancedMesh(this.geo(shape),material,capacity);
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); mesh.count = 0; mesh.frustumCulled = false;
      mesh.castShadow = !basic; mesh.receiveShadow = !basic; if (basic) mesh.renderOrder = name === 'shadow' ? 2 : 5;
      this.entityLayer.add(mesh); this.batches.set(name,{mesh,count:0,capacity});
    }
    const additive = () => new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
    const fx = {fx_spark:['box',additive(),1400],fx_glow:['ball',additive(),260],fx_pillar:['round',additive(),64],fx_disc:['disc',additive(),160],
      fx_dust:['ball',new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.3,depthWrite:false}),420],
      fx_arrow:['round',this.fogMaterial('fx-solid',0xffffff),420],fx_chunk:['box',this.fogMaterial('fx-solid',0xffffff),260]};
    for (const [name,[shape,material,capacity]] of Object.entries(fx)) {
      const mesh = new THREE.InstancedMesh(this.geo(shape),material,capacity);
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); mesh.setColorAt(0,color(0xffffff)); mesh.count = 0; mesh.frustumCulled = false;
      mesh.renderOrder = name === 'fx_arrow' || name === 'fx_chunk' ? 0 : 6;
      this.entityLayer.add(mesh); this.batches.set(name,{mesh,count:0,capacity});
    }
  }
  // Like instance(), but writes an arbitrary brightness so additive effects can fade per instance.
  fx(name, x,y,z,sx,sy,sz,hex,intensity = 1,rotation = null) {
    const batch = this.batches.get(name); if (!batch || batch.count >= batch.capacity) return;
    this.dummy.position.set(x,y,z); this.dummy.scale.set(sx,sy,sz);
    if (rotation?.isQuaternion) this.dummy.quaternion.copy(rotation);
    else this.dummy.rotation.set(rotation?.x||0,rotation?.y||0,rotation?.z||0);
    this.dummy.updateMatrix(); this.fxColor.setHex(hex).multiplyScalar(intensity);
    batch.mesh.setMatrixAt(batch.count,this.dummy.matrix); batch.mesh.setColorAt(batch.count,this.fxColor); batch.count++;
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
    this.target = {x:90,y:map.height/2}; this.distance = innerWidth < 600 ? 225 : 210; this.updateCamera();
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
    const w=map.width,h=map.height,cols=96,rows=64,vertices=[],colors=[],uvs=[],indices=[];
    const dark=color(pal.ground), light=color(pal.light), dry=color(pal.dry), path=color(pal.path), water=color(pal.water), shore=color(pal.dry).lerp(color(0xffffff),.12), scratch=new THREE.Color();
    const noise=makeNoise(771+map.width), noise2=makeNoise(1933+map.height);
    const smooth=t=>t*t*(3-2*t);
    for (let j=0;j<=rows;j++) for (let i=0;i<=cols;i++) {
      const x=w*i/cols,z=h*j/rows; vertices.push(x,this.height(x,z)-0.3,z); uvs.push(x/34,z/34);
      const tone=noise(x/70,z/70)*.55+noise(x/27,z/27)*.3+noise(x/10,z/10)*.15;
      scratch.copy(dark).lerp(light,smooth(clamp(tone*1.25-.1,0,1)));
      const patch=noise2(x/55,z/55); if (patch>.6) scratch.lerp(dry,Math.min(.75,(patch-.6)*2.4));
      // Worn earth: the central lane, both home sides, outposts and camps.
      const lane=Math.abs(z-h/2-Math.sin(x*.014)*13); if (lane<17) scratch.lerp(path,.78*smooth(1-lane/17));
      const home=Math.min(Math.abs(x-65),Math.abs(x-(w-65))); if (home<75) scratch.lerp(path,.38*smooth(1-home/75));
      for (const spot of map.outposts) { const d=Math.hypot(x-spot.x,z-spot.y); if (d<30) scratch.lerp(path,.7*smooth(1-d/30)); }
      for (const spot of map.camps) { const d=Math.hypot(x-spot.x,z-spot.y); if (d<26) scratch.lerp(path,.6*smooth(1-d/26)); }
      for (const area of map.terrain) { const d=Math.hypot(x-area.x,z-area.y); if (d<area.radius) scratch.lerp(water,.82); else if (d<area.radius+9) scratch.lerp(shore,.55*(1-(d-area.radius)/9)); }
      const edge=Math.min(x,z,w-x,h-z); if (edge<22) scratch.multiplyScalar(.72+.28*edge/22);
      scratch.multiplyScalar(.96+rng()*.08);
      colors.push(scratch.r,scratch.g,scratch.b);
    }
    for (let j=0;j<rows;j++) for (let i=0;i<cols;i++) { const a=j*(cols+1)+i,b=a+cols+1;indices.push(a,b,a+1,b,b+1,a+1); }
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3)); geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3)); geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2)); geometry.setIndex(indices); geometry.computeVertexNormals();
    this.detail ??= detailTexture();
    const ground = new THREE.Mesh(geometry,this.fogMaterial('ground-detail',0xffffff,{vertexColors:true,map:this.detail,flatShading:false,roughness:.95})); ground.receiveShadow=true; ground.userData.ownedGeometry = true; this.environment.add(ground);
    const cliff = this.fogMaterial('cliff',0x394a40);
    this.mesh(this.environment,'box',cliff,w/2,-7,h/2,w,13,h);
    const skirt = this.mesh(this.environment,'box',this.fogMaterial('skirt-'+map.id,color(pal.ground).multiplyScalar(.3).getHex()),w/2,-14,h/2,w+2400,2,h+2400); skirt.castShadow=false;
    // Ponds / marsh over the slow areas.
    const pond = this.fogMaterial('pond-'+map.id,color(pal.water).lerp(color(0xffffff),.12).getHex(),{roughness:.25,metalness:.1,transparent:true,opacity:.8,flatShading:false});
    for (const area of map.terrain) { const m=new THREE.Mesh(this.geo('disc'),pond); m.position.set(area.x,this.height(area.x,area.y)+.35,area.y); m.scale.set(area.radius*.93,1,area.radius*.93); this.environment.add(m); }
    const count=this.quality==='dusuk'?90:this.quality==='orta'?200:320;
    const leaf=color(pal.leaf);
    const trunks=new THREE.InstancedMesh(this.geo('taper'),this.fogMaterial('trunks2',0x6b4f35),count);
    const trees=new THREE.InstancedMesh(this.geo(map.id==='ayna'?'crystal':'cone'),this.fogMaterial('leaves2-'+map.id,0xffffff),count);
    const crowns=new THREE.InstancedMesh(this.geo(map.id==='ayna'?'crystal':'cone'),this.fogMaterial('leaves2-'+map.id,0xffffff),count);
    const rocks=new THREE.InstancedMesh(this.geo('ball'),this.fogMaterial('rocks-'+map.id,pal.stone),count);
    const blobs=new THREE.InstancedMesh(this.geo('disc'),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.26,depthWrite:false}),count);
    const temp=new THREE.Object3D(); let n=0;
    for (let i=0;i<count*4 && n<count;i++) {
      const x=rng()*w,z=rng()*h;
      if (x>30&&x<155 || x>w-155&&x<w-30 || Math.abs(z-h/2)<28 || map.outposts.some(o=>Math.hypot(x-o.x,z-o.y)<38) || map.camps.some(o=>Math.hypot(x-o.x,z-o.y)<32) || map.terrain.some(o=>Math.hypot(x-o.x,z-o.y)<o.radius+4)) continue;
      const s=3+rng()*4,y=this.height(x,z);
      temp.position.set(x,y+3,z); temp.scale.set(.8,6,.8); temp.rotation.set(0,rng()*6,0); temp.updateMatrix(); trunks.setMatrixAt(n,temp.matrix);
      temp.position.y=y+5.5+s; temp.scale.set(s*1.08,s*1.7,s*1.08); temp.updateMatrix(); trees.setMatrixAt(n,temp.matrix);
      temp.position.y=y+7.6+s*1.75; temp.scale.set(s*.72,s*1.35,s*.72); temp.updateMatrix(); crowns.setMatrixAt(n,temp.matrix);
      const shade=.8+rng()*.45,tint=leaf.clone().multiplyScalar(shade); trees.setColorAt(n,tint); crowns.setColorAt(n,tint.clone().multiplyScalar(1.18));
      temp.position.set(x+1.5,y+.25,z+1.2); temp.scale.set(s*1.25,1,s*1.1); temp.rotation.set(0,0,0); temp.updateMatrix(); blobs.setMatrixAt(n,temp.matrix);
      temp.position.set(clamp(x+10,0,w),y+1.3,clamp(z+7,0,h)); temp.scale.set(2+rng()*3,1.5+rng()*2,2+rng()*3); temp.rotation.set(rng(),rng()*6,rng()); temp.updateMatrix(); rocks.setMatrixAt(n,temp.matrix); n++;
    }
    blobs.count=n; blobs.renderOrder=1; this.environment.add(blobs);
    for (const mesh of [trunks,trees,crowns,rocks]) { mesh.count=n; mesh.castShadow=true; mesh.receiveShadow=true; this.environment.add(mesh); }
    // Low bushes and grass tufts add texture to open ground.
    const tuftCount=this.quality==='dusuk'?120:this.quality==='orta'?320:520;
    const tufts=new THREE.InstancedMesh(this.geo('cone'),this.fogMaterial('tufts-'+map.id,0xffffff),tuftCount); let t=0;
    for (let i=0;i<tuftCount*3 && t<tuftCount;i++) {
      const x=rng()*w,z=rng()*h;
      if (Math.abs(z-h/2-Math.sin(x*.014)*13)<14 || map.terrain.some(o=>Math.hypot(x-o.x,z-o.y)<o.radius+2) || map.outposts.some(o=>Math.hypot(x-o.x,z-o.y)<16)) continue;
      const s=.9+rng()*1.5; temp.position.set(x,this.height(x,z)+s*.7,z); temp.scale.set(s*1.3,s*1.5,s*1.3); temp.rotation.set(0,rng()*6,0); temp.updateMatrix(); tufts.setMatrixAt(t,temp.matrix);
      tufts.setColorAt(t,leaf.clone().lerp(light,.35+rng()*.4).multiplyScalar(.9+rng()*.3)); t++;
    }
    tufts.count=t; tufts.receiveShadow=true; this.environment.add(tufts);
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
      if (e.kind==='building') {
        // Buildings are picked by their whole on-screen silhouette (base to roof, full width),
        // so a tap anywhere on the model selects it instead of sending the army there.
        const bounds=this.modelFor(e).bounds.max,half=Math.max(bounds[0],bounds[2]),top=bounds[1];
        const base=this.project(e.x,e.y,0),roof=this.project(e.x,e.y,top),side=this.project(e.x+half,e.y,top*.5),mid=this.project(e.x,e.y,top*.5);
        if(base.z>=1)continue;
        const pad=10,rx=Math.max(18,Math.abs(side.x-mid.x)+pad),y0=Math.min(roof.y,base.y)-pad,y1=Math.max(roof.y,base.y)+rx*.45+pad;
        if(x<mid.x-rx||x>mid.x+rx||y<y0||y>y1)continue;
        // Units standing in front keep priority: a building only wins when no unit is under the finger.
        const score=1+Math.hypot((x-mid.x)/rx,(y-(y0+y1)/2)/((y1-y0)/2));
        if(score<best){best=score;chosen=e;}
        continue;
      }
      const p=this.project(e.x,e.y,e.kind==='hero'?this.modelFor(e).bounds.max[1]*.45:4),radius=Math.max(17,3200/this.distance),d=Math.hypot(p.x-x,p.y-y);
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
  effect(type,x,y,tint=0xf3d290,max=null) {
    if(this.effects.length>=48||!Number.isFinite(x)||!Number.isFinite(y))return;
    let mesh=this.effectPool.pop();
    if(!mesh){mesh=new THREE.Mesh(this.geo('ring'),new THREE.MeshBasicMaterial({transparent:true,opacity:1,depthWrite:false,side:THREE.DoubleSide}));this.effectLayer.add(mesh);}
    mesh.visible=true;mesh.material.color.setHex(tint);mesh.position.set(x,this.height(x,y)+1.4,y);
    this.effects.push({mesh,age:0,duration:type==='power'?1.6:type==='death'?.8:.65,max:max??(type==='power'?58:type==='ability'?43:type==='order'?10:6)});
  }
  // ---- battle presentation -------------------------------------------------
  fxScale(){return this.quality==='dusuk'?.5:this.quality==='orta'?.8:1;}
  hexOf(factionId,fallback=0xf3d290){
    if(!factionId)return fallback;
    if(!this.factionHex.has(factionId)){const f=this.catalog.factions.find(f=>f.id===factionId);this.factionHex.set(factionId,f?color(f.color).getHex():fallback);}
    return this.factionHex.get(factionId);
  }
  particle(kind,x,y,z,vx,vy,vz,life,size,hex,gravity=0,extra=0){
    if(this.particles.length>=900)return;
    this.particles.push({kind,x,y,z,vx,vy,vz,age:0,life,size,hex,gravity,extra,spin:Math.random()*6});
  }
  burst(x,y,z,count,speed,hex,size=1,life=.35,lift=.6){
    const n=Math.max(1,Math.round(count*this.fxScale()));
    for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,v=speed*(.45+Math.random()*.75);this.particle('spark',x,y,z,Math.cos(a)*v,speed*lift*(.3+Math.random()),Math.sin(a)*v,life*(.6+Math.random()*.7),size,hex,26);}
  }
  dust(x,z,count,spread=3,hex=0xb9a888,size=2.4){
    const n=Math.max(1,Math.round(count*this.fxScale())),y=this.height(x,z)+.8;
    for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,d=Math.random()*spread;this.particle('dust',x+Math.cos(a)*d,y,z+Math.sin(a)*d,Math.cos(a)*2.5,1.6+Math.random()*2,Math.sin(a)*2.5,.7+Math.random()*.6,size*(.7+Math.random()*.7),hex);}
  }
  chunks(x,z,count,hex,speed=22){
    const n=Math.max(2,Math.round(count*this.fxScale())),y=this.height(x,z)+2;
    for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,v=speed*(.3+Math.random()*.7);this.particle('chunk',x,y,z,Math.cos(a)*v,14+Math.random()*16,Math.sin(a)*v,.9+Math.random()*.5,.8+Math.random()*1.1,hex,46);}
  }
  pillar(x,z,hex,radius,height,life=.8){this.particle('pillar',x,this.height(x,z),z,0,0,0,life,radius,hex,0,height);}
  flash(x,z,hex,size,life=.22,y=3){this.particle('glow',x,this.height(x,z)+y,z,0,0,0,life,size,hex);}
  later(delay,fn){if(this.pending.length<200)this.pending.push({at:this.clock+delay,fn});}
  shoot(kind,x0,z0,x1,z1,hex,delay,onHit){
    if(this.projectiles.length>=160)return;
    const d=Math.hypot(x1-x0,z1-z0),siege=kind==='stone';
    this.projectiles.push({kind,x0,z0,y0:this.height(x0,z0)+(siege?7:5),x1,z1,y1:this.height(x1,z1)+(siege?1:3),age:-delay,duration:clamp(d/(siege?62:105),.28,siege?1.25:.75),arc:d*(siege?.32:.14),hex,onHit,trail:0});
  }
  impact(kind,x,z,hex){
    const y=this.height(x,z);
    if(kind==='stone'){
      this.flash(x,z,0xffb45a,9,.35,4);this.flash(x,z,0xfff0c0,5,.18,4);this.burst(x,y+2,z,16,34,0xffc27a,1.1,.5,.9);
      this.chunks(x,z,9,0x6b5d4c);this.dust(x,z,9,6,0x9c8c72,3.4);this.effect('death',x,z,0xffc890,17);this.shake=Math.max(this.shake,.9);
    }else if(kind==='arrow'){this.burst(x,y+4,z,4,16,0xf6e6c2,1.1,.24,.6);this.dust(x,z,1,1.5,0xb9a888,1.6);}
    else if(kind==='bolt'){this.flash(x,z,hex,6.5,.28,5);this.burst(x,y+4,z,11,28,hex,1.4,.4,.8);this.effect('death',x,z,hex,8);}
    else{this.flash(x,z,0xfff1cf,kind==='hero'?6:3.8,.14,5);this.burst(x,y+5,z,kind==='hero'?12:7,kind==='hero'?30:22,0xffe2a2,kind==='hero'?1.6:1.25,.28,.9);if(kind==='hero')this.effect('death',x,z,0xffe2a2,10);}
  }
  onAttack(event,attacker,target){
    const tx=event.x,tz=event.y,sx=event.sourceX??attacker?.x,sz=event.sourceY??attacker?.y,delay=Math.random()*.2;
    if(!Number.isFinite(tx)||!Number.isFinite(tz))return;
    const known=Number.isFinite(sx)&&Number.isFinite(sz),d=known?Math.hypot(tx-sx,tz-sz):0,role=event.role,hero=event.kind==='hero';
    const tint=this.hexOf(event.faction,0xe9dcc0);
    const mark=(id,key,at)=>{if(id==null)return;let c=this.combat.get(id);if(!c){c={attackAt:-9,hitAt:-9};this.combat.set(id,c);}c[key]=at;};
    mark(event.id,'attackAt',this.clock+delay);
    const ranged=known&&(role==='ranged'||role==='siege'||d>16);
    if(!ranged){
      const k=known?.72:1,cx=known?sx+(tx-sx)*k:tx,cz=known?sz+(tz-sz)*k:tz;
      this.later(delay+.13,()=>{this.impact(hero?'hero':'melee',cx+(Math.random()-.5)*3,cz+(Math.random()-.5)*3,tint);mark(event.target,'hitAt',this.clock);if(role==='cavalry')this.dust(cx,cz,2,2);});
      return;
    }
    if(role==='siege'){
      this.flash(sx,sz,0xffd9a0,3,.15,6);this.dust(sx,sz,2,2);
      this.shoot('stone',sx,sz,tx+(Math.random()-.5)*5,tz+(Math.random()-.5)*5,0x5d5346,delay,(x,z)=>{this.impact('stone',x,z,tint);mark(event.target,'hitAt',this.clock);});
      return;
    }
    const magic=hero||role==='special',figure=this.figures.get(event.id),shots=magic?1:Math.max(2,Math.round(5*this.fxScale()));
    for(let i=0;i<shots;i++){
      const from=figure&&figure.n?figure.pts[i%figure.n]:null,fx=from?from.x:sx+(Math.random()-.5)*5,fz=from?from.z:sz+(Math.random()-.5)*5;
      this.shoot(magic?'bolt':'arrow',fx,fz,tx+(Math.random()-.5)*6,tz+(Math.random()-.5)*6,magic?tint:0xd9c9a3,delay+i*.045,(x,z)=>{this.impact(magic?'bolt':'arrow',x,z,tint);if(i===0)mark(event.target,'hitAt',this.clock);});
    }
  }
  dropFigure(parts,x,z,rotation,delay=0){
    if(this.fallen.length>=70)this.fallen.shift();
    this.fallen.push({parts,x,z,rotation,age:-delay,side:Math.random()<.5?-1:1,twist:(Math.random()-.5)*.9});
  }
  onDeath(event){
    const x=event.x,z=event.y;if(!Number.isFinite(x)||!Number.isFinite(z))return;
    const tint=this.hexOf(event.faction,0xb9a17d),figure=this.figures.get(event.id);
    if(figure){for(let i=0;i<figure.n;i++)this.dropFigure(figure.parts,figure.pts[i].x,figure.pts[i].z,figure.rotation,Math.random()*.3);this.figures.delete(event.id);}
    this.combat.delete(event.id);
    if(event.kind==='building'){
      this.flash(x,z,0xffb45a,15,.5,8);this.flash(x,z,0xfff0c0,8,.25,8);this.chunks(x,z,18,0x6f6456,30);this.chunks(x,z,6,tint,24);
      this.dust(x,z,16,13,0x8f8068,4.6);this.burst(x,this.height(x,z)+6,z,24,40,0xffc27a,1.3,.7,1);this.effect('death',x,z,0xffb070,30);this.shake=Math.max(this.shake,1.5);
    }else if(event.kind==='hero'){
      this.pillar(x,z,tint,3.2,46,1.1);this.flash(x,z,tint,8,.5,5);this.burst(x,this.height(x,z)+5,z,20,26,tint,1,.8,1.2);this.dust(x,z,6,4);this.effect('death',x,z,tint,24);this.shake=Math.max(this.shake,.7);
    }else{this.dust(x,z,7,6,0xb9a888,3);this.burst(x,this.height(x,z)+4,z,9,20,tint,1.2,.5,1);this.effect('death',x,z,0xff8063,12);}
  }
  handleEvents(events) {
    for(const event of events){
      const e=this.view.entities.find(e=>e.id===event.id)||this.lastKnown.get(event.id),target=this.view.entities.find(e=>e.id===event.target)||this.lastKnown.get(event.target);
      if(event.type==='attack'){this.onAttack(event,e,target);continue;}
      if(event.type==='death'){this.onDeath(event);continue;}
      const p=Number.isFinite(event.x)?event:target||e||this.view.outposts.find(p=>p.id===event.outpost)||this.view.camps.find(p=>p.id===event.camp);
      if(!p||!['ability','power','level','capture','camp'].includes(event.type))continue;
      const x=p.x,z=p.y,y=this.height(x,z),tint=this.hexOf(event.faction,0x90e3d3);
      if(event.type==='ability'){
        this.pillar(x,z,tint,3.4,38,.75);this.flash(x,z,tint,7,.3,4);this.burst(x,y+3,z,16,30,tint,1,.55,.8);this.effect('ability',x,z,tint);this.later(.14,()=>this.effect('ability',x,z,0xffffff,26));
      }else if(event.type==='power'){
        this.pillar(x,z,tint,8,70,1.2);this.pillar(x,z,0xffffff,3,70,.5);this.flash(x,z,tint,16,.5,6);this.particle('disc',x,y+.9,z,0,0,0,2.2,30,tint);
        this.burst(x,y+4,z,30,46,tint,1.3,.8,1);this.dust(x,z,10,14,0x9c8c72,4);this.effect('power',x,z,tint);this.later(.22,()=>this.effect('power',x,z,0xffffff,40));this.shake=Math.max(this.shake,1.2);
      }else if(event.type==='level'){
        this.pillar(x,z,0xffd36a,1.8,30,.9);this.effect('level',x,z,0xffe599,13);
        const n=Math.round(12*this.fxScale());for(let i=0;i<n;i++){const a=i/n*Math.PI*2;this.particle('spark',x+Math.cos(a)*3,y+1,z+Math.sin(a)*3,Math.cos(a)*5,20+Math.random()*10,Math.sin(a)*5,.9,.8,0xffe08a,14);}
      }else{
        this.pillar(x,z,tint,2.4,34,1);this.effect('capture',x,z,tint,22);this.burst(x,y+10,z,14,16,tint,.9,.8,1.2);
      }
    }
  }
  clearEffects() {
    for(const e of this.effects){e.mesh.visible=false;this.effectPool.push(e.mesh);}this.effects=[];
    this.projectiles=[];this.particles=[];this.fallen=[];this.pending=[];this.combat.clear();this.figures.clear();this.shake=0;
  }
  // Draw one prepared figure, optionally leaning about its own X axis (lunges, falling bodies).
  figure(parts,x,y,z,rotation,lean,tint,intensity,scale=1) {
    const c=Math.cos(rotation),s=Math.sin(rotation),lc=Math.cos(lean),ls=Math.sin(lean);
    this.figureRotation.setFromAxisAngle(this.up,rotation);
    if(lean){this.leanQ.setFromAxisAngle(this.axisX,lean);this.figureRotation.multiply(this.leanQ);}
    for(const part of parts){
      if(part.detail&&this.quality==='dusuk')continue;
      let [px,py,pz]=part.position;
      if(lean){const ny=py*lc-pz*ls,nz=py*ls+pz*lc;py=ny;pz=nz;}
      px*=scale;py*=scale;pz*=scale;
      this.partRotation.copy(this.figureRotation).multiply(part.quaternion);
      if(tint===null&&intensity===1)this.instance('part_'+part.shape,x+px*c+pz*s,y+py,z-px*s+pz*c,part.scale[0]*scale,part.scale[1]*scale,part.scale[2]*scale,part.color,this.partRotation);
      else this.fx('part_'+part.shape,x+px*c+pz*s,y+py,z-px*s+pz*c,part.scale[0]*scale,part.scale[1]*scale,part.scale[2]*scale,tint??part.color,intensity,this.partRotation);
    }
  }
  soldier(e,pos,index,time) {
    const faction=e.player>=0?this.catalog.factions.find(f=>f.id===this.view.players[e.player].faction):null;
    const definition=(e.kind==='hero'?faction?.heroes:faction?.units)?.find(u=>u.id===e.type),model=this.modelFor(e),parts=this.preparedModel(model);
    const moving=Math.hypot(pos.x-e.x,pos.y-e.y)>.8||e.order&&['move','retreat','attack'].includes(e.order.type)&&Math.hypot(e.x-e.order.x,e.y-e.order.y)>4;
    const slots=e.kind==='escort'?[{x:e.x,y:e.y,heading:e.facing??0}]:(this.layouts?.get(e.id)||battalionLayout(e,definition));
    const total=Math.min(slots.length,e.kind==='hero'||e.kind==='escort'||e.role==='siege'?1:this.quality==='dusuk'?3:this.quality==='orta'?5:8);
    if(!total)return;
    // Sim headings face +X; the models face local +Z. Only local rank spacing
    // is enlarged to fit the authored models; the battalion center is untouched.
    const heading=slots[0].heading,rotation=Math.PI/2-heading,spread=e.role==='cavalry'?1.5:e.role==='special'?1.3:1.8;
    const fx=Math.cos(heading),fz=Math.sin(heading),state=this.combat.get(e.id);
    const sinceAttack=state?this.clock-state.attackAt:99,sinceHit=state?this.clock-state.hitAt:99,fighting=sinceAttack<1.7;
    const reach=e.role==='cavalry'?4.6:e.role==='ranged'?-1:e.role==='siege'?-2:e.kind==='hero'?3.8:3;
    const hurt=sinceHit>=0&&sinceHit<.16,recoil=hurt?(1-sinceHit/.16)*1.6:0;
    let record=this.figures.get(e.id);
    if(!record){record={n:0,pts:[],parts,rotation};this.figures.set(e.id,record);}
    // Soldiers lost since the last frame fall where they stood instead of vanishing.
    if(record.n>total&&e.kind!=='hero')for(let i=total;i<record.n;i++)this.dropFigure(record.parts,record.pts[i].x,record.pts[i].z,record.rotation,Math.random()*.12);
    record.parts=parts;record.rotation=rotation;record.seen=this.clock;
    if(moving&&(e.role==='cavalry'||e.role==='siege')&&Math.random()<this.frameDt*5)this.dust(pos.x-fx*3,pos.y-fz*3,1,2,0xb9a888,1.8);
    for(let i=0;i<total;i++){
      const slot=slots[i],local=sinceAttack-i*.04,striking=local>0&&local<.36,swing=striking?Math.sin(Math.PI*local/.36):0;
      const push=swing*reach-recoil;
      const x=pos.x+(slot.x-e.x)*spread+fx*push,z=pos.y+(slot.y-e.y)*spread+fz*push;
      const hop=moving?Math.sin(time*10+i)*.18:fighting?Math.abs(Math.sin(time*8+i*1.7))*.14:0,y=this.height(x,z)+hop;
      const lean=reach>0?swing*.32-recoil*.16:-swing*.12-recoil*.16;
      if(this.quality!=='yuksek'){const r=e.role==='siege'?4.2:e.role==='cavalry'?2.7:e.kind==='hero'?2.8:1.8;this.instance('shadow',x+.6,this.height(x,z)+.22,z+.5,r,1,r*.8,0x000000);}
      this.figure(parts,x,y,z,rotation,lean,hurt?0xfff3df:null,hurt?1.25:1);
      let pt=record.pts[i];if(!pt){pt={x,z};record.pts[i]=pt;}else{pt.x=x;pt.z=z;}
    }
    record.n=total;
  }
  drawBattle(dt) {
    // Fallen soldiers: tip over, lie for a moment, then sink into the ground.
    for(let i=this.fallen.length-1;i>=0;i--){
      const f=this.fallen[i];f.age+=dt;
      if(f.age>1.7){this.fallen.splice(i,1);continue;}
      const t=Math.max(0,f.age),tip=Math.min(1,t/.34),sink=t>1.05?(t-1.05)/.65:0;
      this.figure(f.parts,f.x,this.height(f.x,f.z)-sink*2.6+Math.sin(tip*Math.PI)*.5,f.z,f.rotation+f.twist*tip,-f.side*tip*tip*1.45,null,.62-sink*.3,1-sink*.25);
    }
    // Arrows, bolts and siege stones travel on arcs and leave their own impact.
    for(let i=this.projectiles.length-1;i>=0;i--){
      const p=this.projectiles[i];p.age+=dt;if(p.age<0)continue;
      const k=p.age/p.duration;
      if(k>=1){this.projectiles.splice(i,1);p.onHit?.(p.x1,p.z1);continue;}
      const x=p.x0+(p.x1-p.x0)*k,z=p.z0+(p.z1-p.z0)*k,y=p.y0+(p.y1-p.y0)*k+Math.sin(Math.PI*k)*p.arc;
      this.fxDir.set(p.x1-p.x0,(p.y1-p.y0)+Math.cos(Math.PI*k)*Math.PI*p.arc,p.z1-p.z0).normalize();
      this.fxQuat.setFromUnitVectors(this.up,this.fxDir);
      if(p.kind==='arrow')this.fx('fx_arrow',x,y,z,.16,4.6,.16,p.hex,1,this.fxQuat);
      else if(p.kind==='bolt'){this.fx('fx_glow',x,y,z,2.2,2.2,2.2,p.hex,1);this.fx('fx_glow',x,y,z,1.1,1.1,1.1,0xffffff,1);p.trail+=dt;if(p.trail>.03){p.trail=0;this.particle('spark',x,y,z,(Math.random()-.5)*4,(Math.random()-.5)*4,(Math.random()-.5)*4,.25,.6,p.hex,0);}}
      else{this.fx('fx_chunk',x,y,z,2.4,2.4,2.4,p.hex,1,{x:p.age*7,y:p.age*5,z:0});p.trail+=dt;if(p.trail>.05){p.trail=0;this.particle('dust',x,y,z,0,.5,0,.5,1.5,0x8f8068);}}
    }
    for(let i=this.particles.length-1;i>=0;i--){
      const p=this.particles[i];p.age+=dt;const k=p.age/p.life;
      if(k>=1){this.particles.splice(i,1);continue;}
      p.vy-=p.gravity*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;
      if(p.kind==='spark'){
        const speed=Math.hypot(p.vx,p.vy,p.vz)||1;this.fxDir.set(p.vx/speed,p.vy/speed,p.vz/speed);this.fxQuat.setFromUnitVectors(this.axisZ,this.fxDir);
        this.fx('fx_spark',p.x,p.y,p.z,p.size*.28,p.size*.28,p.size*(1.2+speed*.07),p.hex,1-k,this.fxQuat);
      }else if(p.kind==='dust'){
        const ground=this.height(p.x,p.z)+.4;if(p.y<ground)p.y=ground;p.vx*=1-dt*2.5;p.vz*=1-dt*2.5;p.vy*=1-dt*1.5;
        const size=p.size*(.5+k*1.5)*(k>.6?(1-k)/.4:1);this.fx('fx_dust',p.x,p.y,p.z,size,size*.7,size,p.hex,1);
      }else if(p.kind==='chunk'){
        const ground=this.height(p.x,p.z)+.4;if(p.y<ground){p.y=ground;p.vy=Math.abs(p.vy)*.3;p.vx*=.5;p.vz*=.5;}
        this.fx('fx_chunk',p.x,p.y,p.z,p.size,p.size,p.size,p.hex,1,{x:p.spin+p.age*8,y:p.spin+p.age*6,z:0});
      }else if(p.kind==='glow'){const size=p.size*(.45+k*.9);this.fx('fx_glow',p.x,p.y,p.z,size,size,size,p.hex,(1-k)*(1-k));}
      else if(p.kind==='pillar'){const radius=p.size*(1-k*.55),height=p.extra*(.55+.45*Math.min(1,k*5));this.fx('fx_pillar',p.x,p.y+height/2,p.z,radius,height,radius,p.hex,(1-k)*.75);}
      else if(p.kind==='disc'){const size=p.size*(.6+.4*Math.min(1,k*6));this.fx('fx_disc',p.x,p.y,p.z,size,1,size,p.hex,(1-k)*.45);}
    }
    // Forget presentation records of units that left sight a while ago.
    if(this.figures.size>40)for(const [id,record] of this.figures)if(this.clock-record.seen>4){this.figures.delete(id);this.combat.delete(id);}
  }
  draw(dt,time) {
    if(!this.map)return;
    this.clock+=dt;this.frameDt=dt;
    this.updateCamera();
    if(this.shake>.02&&this.quality!=='dusuk'){const a=this.shake*1.3;this.camera.position.x+=(Math.random()-.5)*a;this.camera.position.y+=(Math.random()-.5)*a;this.camera.position.z+=(Math.random()-.5)*a;this.shake*=Math.exp(-dt*7);}else this.shake=0;
    for(const batch of this.batches.values())batch.count=0;
    for(let i=this.pending.length-1;i>=0;i--)if(this.pending[i].at<=this.clock){const job=this.pending[i];this.pending.splice(i,1);job.fn();}
    const smooth=1-Math.exp(-dt*8);
    if(this.view)for(const e of this.view.entities){
      let p=this.positions.get(e.id);if(!p){p={x:e.x,y:e.y};this.positions.set(e.id,p);}p.x+=(e.x-p.x)*smooth;p.y+=(e.y-p.y)*smooth;
      if(e.kind==='building'){
        const b=this.buildings.get(e.id);if(b){const progress=b.definition.buildTime?clamp(1-(e.readyAt-this.view.time)/b.definition.buildTime,0,1):1;b.group.scale.y=.18+.82*progress;b.scaffold.visible=progress<1;}
        if(this.quality!=='yuksek'){const bounds=this.modelFor(e).bounds.max,r=Math.max(bounds[0],bounds[2])*.98;this.instance('shadow',p.x+2,this.height(p.x,p.y)+.2,p.y+1.6,r,1,r*.86,0x000000);}
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
      // Every battalion carries a team-coloured base ring so friend and foe read at a glance.
      if(selected||!building){const own=e.player===0,size=building?16:hero?7.5:own?8:6.6;
        const tint=selected?0xb7f8e0:own?(hero?0xf6cd62:0x6cb7b5):e.team===0?0x7fb2e8:e.team===1?0xe8735c:0xd9c08a;
        this.instance('ring',p.x,this.height(p.x,p.y)+.3,p.y,size,1,size,tint);}
      if(selected||e.hp<e.maxHp*.98||hero||building&&e.readyAt>this.view.time){
        const y=this.height(p.x,p.y)+this.modelFor(e).bounds.max[1]+2,width=building?21:13;
        const q=this.camera.quaternion;this.instance('healthBack',p.x,y,p.y,width+1,1.9,1,0x19272a,q);
        const ratio=clamp(e.hp/e.maxHp,0,1);const right=new THREE.Vector3(1,0,0).applyQuaternion(q).multiplyScalar((width*ratio-width)/2);
        this.instance('health',p.x+right.x,y+right.y+.01,p.y+right.z,width*ratio,1.1,1,e.team===0?0x95deb2:e.team===1?0xf28a72:0xe0bc7d,q);
      }
    }
    if(this.view)for(const post of this.view.outposts){if(post.owner!=null||post.progress>0){const owner=this.view.players[post.owner],tint=owner?this.catalog.factions.find(f=>f.id===owner.faction).color:0xe9d6a1;this.instance('crystal',post.x,this.height(post.x,post.y)+14,post.y,3,5+Math.sin(time*2),3,tint,{y:time*.5});if(post.progress>0)this.instance('ring',post.x,1,post.y,14+post.progress,1,14+post.progress,0xf3d697);}}
    this.drawBattle(dt);
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
