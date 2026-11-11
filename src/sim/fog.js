// Renderer-neutral RGBA avoids the row padding of one-channel textures.
export function fogTexture(visibility){
 const {cols,rows,visible,explored}=visibility,data=new Uint8Array(cols*rows*4);
 for(let i=0;i<cols*rows;i++){const offset=i*4;data[offset]=16;data[offset+1]=24;data[offset+2]=32;data[offset+3]=visible[i]?0:explored[i]?145:245;}
 return {data,width:cols,height:rows,format:'rgba',unpackAlignment:1,flipY:false,worldWidth:visibility.worldWidth,worldHeight:visibility.worldHeight};
}
export function fogCell(visibility,x,y){const {cellSize,cols,rows}=visibility;const col=Math.max(0,Math.min(cols-1,Math.floor(x/cellSize))),row=Math.max(0,Math.min(rows-1,Math.floor(y/cellSize)));return {col,row,index:row*cols+col,u:(col+.5)/cols,v:(row+.5)/rows};}
