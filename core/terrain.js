export class Terrain {
  constructor(w=1100,h=650,seed=42){this.w=w;this.h=h;this.seed=seed;this.mask=new Uint8Array(w*h);this.version=0;this.generate();}
  generate(){for(let x=0;x<this.w;x++){const top=Math.floor(385+40*Math.sin(x*.009)+18*Math.sin(x*.021));for(let y=top;y<this.h;y++)this.mask[y*this.w+x]=1;}this.version++;}
  solid(x,y){x=Math.floor(x);y=Math.floor(y);return x>=0&&x<this.w&&y>=0&&y<this.h&&this.mask[y*this.w+x]===1;}
  circle(x,y,r){for(let yy=Math.floor(y-r);yy<=Math.ceil(y+r);yy++)for(let xx=Math.floor(x-r);xx<=Math.ceil(x+r);xx++)if((xx-x)**2+(yy-y)**2<=r*r&&this.solid(xx,yy))return true;return false;}
  carve(x,y,r,ry=r){for(let yy=Math.max(0,Math.floor(y-ry));yy<=Math.min(this.h-1,Math.ceil(y+ry));yy++)for(let xx=Math.max(0,Math.floor(x-r));xx<=Math.min(this.w-1,Math.ceil(x+r));xx++)if(((xx-x)/r)**2+((yy-y)/ry)**2<=1)this.mask[yy*this.w+xx]=0;this.version++;}
  surface(x){for(let y=0;y<this.h;y++)if(this.solid(x,y))return y;return this.h;}
}
