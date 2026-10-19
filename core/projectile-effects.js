// Mid-flight effects are separate from launch/volley modifiers so future items
// can contribute their own activation behavior without changing existing shots.
export const FLIGHT_EFFECTS={
 gravityDrop:{apply(projectile){
  const speed=Math.hypot(projectile.vx,projectile.vy);
  projectile.vx=0;projectile.vy=speed;
  projectile.horizontalLocked=true;projectile.lockedX=projectile.x;
 }}
};
