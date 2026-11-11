// Original low-poly geometry, shared by the WebGL client and offline model previews.
export const MODEL_SHAPES=Object.freeze(['box','ball','crystal','cone','round','taper','roof','bow','torus','dome','leaf','sail']);
const cache=new Map();
function triangle(out,a,b,c,center=[0,0,0]){
  const u=b.map((n,i)=>n-a[i]),v=c.map((n,i)=>n-a[i]);
  const normal=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
  if(Math.hypot(...normal)<1e-9)return;
  const mid=a.map((n,i)=>(n+b[i]+c[i])/3-center[i]);
  if(normal.reduce((n,x,i)=>n+x*mid[i],0)<0)[b,c]=[c,b];
  out.push(...a,...b,...c);
}
function cylinder(out,segments,top=1,bottom=1){
  for(let i=0;i<segments;i++){
    const a=i/segments*Math.PI*2,b=(i+1)/segments*Math.PI*2;
    const t=[Math.sin(a)*top,.5,Math.cos(a)*top],u=[Math.sin(b)*top,.5,Math.cos(b)*top];
    const v=[Math.sin(a)*bottom,-.5,Math.cos(a)*bottom],w=[Math.sin(b)*bottom,-.5,Math.cos(b)*bottom];
    triangle(out,t,v,w);triangle(out,t,w,u);triangle(out,[0,.5,0],t,u);triangle(out,[0,-.5,0],w,v);
  }
}
export function shapeTriangles(shape){
  if(cache.has(shape))return cache.get(shape);
  const out=[];
  if(shape==='box'||shape==='sail'){
    const vertices=shape==='box'?[[-.5,-.5,-.5],[.5,-.5,-.5],[.5,.5,-.5],[-.5,.5,-.5],[-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5]]:[[-.5,-.5,-.5],[.5,-.5,-.5],[-.2,.5,-.5],[-.5,-.5,.5],[.5,-.5,.5],[-.2,.5,.5]];
    const faces=shape==='box'?[[0,3,2,1],[4,5,6,7],[0,4,7,3],[1,2,6,5],[3,7,6,2],[0,1,5,4]]:[[0,2,1],[3,4,5],[0,1,4,3],[1,2,5,4],[2,0,3,5]];
    for(const face of faces)for(let i=1;i<face.length-1;i++)triangle(out,vertices[face[0]],vertices[face[i]],vertices[face[i+1]]);
  }else if(['round','taper','cone','roof'].includes(shape)){
    cylinder(out,shape==='round'?10:shape==='roof'?4:6,shape==='cone'||shape==='roof'?0:shape==='taper'?.65:1,1);
  }else if(shape==='crystal'||shape==='leaf'){
    const v=shape==='crystal'?[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]]:[[.5,0,0],[-.5,0,0],[0,.8,0],[0,-.8,0],[0,0,.14],[0,0,-.14]];
    for(const face of [[2,0,4],[2,4,1],[2,1,5],[2,5,0],[3,4,0],[3,1,4],[3,5,1],[3,0,5]])triangle(out,...face.map(i=>v[i]));
  }else if(shape==='ball'){
    const t=(1+Math.sqrt(5))/2;
    const vertices=[[-1,t,0],[1,t,0],[-1,-t,0],[1,-t,0],[0,-1,t],[0,1,t],[0,-1,-t],[0,1,-t],[t,0,-1],[t,0,1],[-t,0,-1],[-t,0,1]].map(v=>v.map(x=>x/Math.hypot(...v)));
    const faces=[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]];
    for(const face of faces)triangle(out,...face.map(i=>vertices[i]));
  }else if(shape==='dome'){
    const point=(row,col)=>{const v=row/3*Math.PI/2,u=col/10*Math.PI*2;return [Math.sin(v)*Math.sin(u),Math.cos(v),Math.sin(v)*Math.cos(u)];};
    for(let row=0;row<3;row++)for(let col=0;col<10;col++){
      const a=point(row,col),b=point(row+1,col),c=point(row+1,col+1),d=point(row,col+1);
      triangle(out,a,b,c,[0,.25,0]);triangle(out,a,c,d,[0,.25,0]);
    }
    for(let col=0;col<10;col++)triangle(out,[0,0,0],point(3,col+1),point(3,col),[0,.25,0]);
  }else if(shape==='bow'||shape==='torus'){
    const end=shape==='bow'?Math.PI:Math.PI*2,segments=shape==='bow'?8:12,tube=5;
    const point=(i,j)=>{const u=i/segments*end,v=j/tube*Math.PI*2;return [(1+.13*Math.cos(v))*Math.cos(u),(1+.13*Math.cos(v))*Math.sin(u),.13*Math.sin(v)];};
    const tri=(a,b,c)=>{const x=(a[0]+b[0]+c[0])/3,y=(a[1]+b[1]+c[1])/3,u=Math.atan2(y,x);triangle(out,a,b,c,[Math.cos(u),Math.sin(u),0]);};
    for(let i=0;i<segments;i++)for(let j=0;j<tube;j++){const a=point(i,j),b=point(i+1,j),c=point(i+1,j+1),d=point(i,j+1);tri(a,b,c);tri(a,c,d);}
  }else throw Error('Bilinmeyen model geometrisi: '+shape);
  const result=new Float32Array(out);cache.set(shape,result);return result;
}
export function transformPoint(point,part){
  let [x,y,z]=point.map((v,i)=>v*part.scale[i]);
  const [rx,ry,rz]=part.rotation,cz=Math.cos(rz),sz=Math.sin(rz),cy=Math.cos(ry),sy=Math.sin(ry),cx=Math.cos(rx),sx=Math.sin(rx);
  // Three.js Euler XYZ means R_x * R_y * R_z on column vectors.
  [x,y]=[x*cz-y*sz,x*sz+y*cz];[x,z]=[x*cy+z*sy,-x*sy+z*cy];[y,z]=[y*cx-z*sx,y*sx+z*cx];
  return [x+part.position[0],y+part.position[1],z+part.position[2]];
}
export function finishModel(parts,meta={}){
  const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
  for(const part of parts){const geometry=shapeTriangles(part.shape);for(let i=0;i<geometry.length;i+=3){const p=transformPoint([geometry[i],geometry[i+1],geometry[i+2]],part);for(let axis=0;axis<3;axis++){min[axis]=Math.min(min[axis],p[axis]);max[axis]=Math.max(max[axis],p[axis]);}}}
  return {parts,bounds:{min,max},...meta};
}
