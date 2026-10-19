// Surface-only visual fitting, local to the player's feet; does not use the
// topmost surface of the column, which can be unrelated after carving caves.
export const GROUND_CONFIG={maxTiltDegrees:25,sampleSpan:24,searchRadius:36,maxOffset:8,allowedPenetration:3,contactTolerance:12,tiltDeadzoneDegrees:4,offsetDeadzone:3};
export function nearbySurface(terrain,x,y,radius=GROUND_CONFIG.searchRadius){
 let best=null,distance=Infinity;for(let yy=Math.max(0,Math.floor(y-radius));yy<=Math.min(terrain.h-1,Math.ceil(y+radius));yy++){
  if(terrain.solid(x,yy)&&!terrain.solid(x,yy-1)&&Math.abs(yy-y)<distance){best=yy;distance=Math.abs(yy-y);}
 }
 return best;
}
export function fitGround(terrain,p,facing,config=GROUND_CONFIG){
 // Collision grounded can alternate on adjacent fixed steps. Use actual nearby
 // foot support for visual alignment instead of snapping upright for one frame.
 const footSurface=nearbySurface(terrain,p.x,p.y+p.r,config.searchRadius);
 if(!p.grounded&&(footSurface===null||Math.abs(footSurface-p.y-p.r)>config.contactTolerance))return {tilt:0,offset:0};
 const samples=[];for(const fraction of [-1,-.5,0,.5,1]){const x=Math.max(0,Math.min(terrain.w-1,p.x+fraction*config.sampleSpan)),y=nearbySurface(terrain,x,p.y+p.r,config.searchRadius);if(y!==null)samples.push({x,y});}
 let tilt=0;if(samples.length>=2){const mx=samples.reduce((n,s)=>n+s.x,0)/samples.length,my=samples.reduce((n,s)=>n+s.y,0)/samples.length;let numerator=0,denominator=0;for(const s of samples){numerator+=(s.x-mx)*(s.y-my);denominator+=(s.x-mx)**2;}if(denominator>0)tilt=Math.atan(numerator/denominator);}
 const limit=config.maxTiltDegrees*Math.PI/180;tilt=Math.max(-limit,Math.min(limit,tilt));
 const corrections=[];for(const localX of [-44,-22,0,18]){const x=p.x+Math.cos(tilt)*localX*facing,y=p.y+p.r+Math.sin(tilt)*localX*facing;const surface=nearbySurface(terrain,x,y,config.searchRadius);if(surface!==null)corrections.push(surface-y+config.allowedPenetration);}
 const offset=corrections.length?Math.max(-config.maxOffset,Math.min(config.maxOffset,Math.min(...corrections))):0;
 return {tilt,offset};
}

// A deadzone suppresses subpixel terrain noise without position interpolation,
// horizontal velocity or a delayed follow-through after releasing movement.
export function stableGround(previous,target,config=GROUND_CONFIG){
 if(!previous)return target;
 return {tilt:Math.abs(target.tilt-previous.tilt)<config.tiltDeadzoneDegrees*Math.PI/180?previous.tilt:target.tilt,
 offset:Math.abs(target.offset-previous.offset)<config.offsetDeadzone?previous.offset:target.offset};
}
