import {fogTexture} from '../sim/fog.js';

// WebGL2/Three.js r160 allocate immutable texture storage. A new grid size must
// get a new texture, and every already-compiled material must see that replacement.
export class WorldFog {
  constructor(THREE) {
    this.THREE = THREE;
    this.uniform = {value:null};
    this.reset(1,1);
  }
  reset(cols,rows) {
    return this.update({cols,rows,visible:new Uint8Array(cols*rows),explored:new Uint8Array(cols*rows)});
  }
  update(visibility) {
    const frame = fogTexture(visibility), previous = this.uniform.value;
    if (!previous || previous.image.width !== frame.width || previous.image.height !== frame.height) {
      const T = this.THREE;
      const texture = new T.DataTexture(frame.data,frame.width,frame.height,T.RGBAFormat,T.UnsignedByteType);
      texture.unpackAlignment = 1;
      texture.flipY = false;
      texture.generateMipmaps = false;
      texture.minFilter = T.NearestFilter;
      texture.magFilter = T.NearestFilter;
      texture.colorSpace = T.NoColorSpace;
      this.uniform.value = texture;
      previous?.dispose();
    } else {
      previous.image.data.set(frame.data);
    }
    this.uniform.value.needsUpdate = true;
    return this.uniform.value;
  }
  dispose() {
    this.uniform.value?.dispose();
    this.uniform.value = null;
  }
}
