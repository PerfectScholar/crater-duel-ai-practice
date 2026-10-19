import {ANIMATION_CONFIG,CHARACTER_SKINS,CharacterAnimator} from './character-animation.js';
export class CharacterRenderer{
 constructor(skins=CHARACTER_SKINS){this.skins=skins;this.animator=new CharacterAnimator();this.images=new Map();for(const skin of skins){for(const part of [skin.whole,...(skin.atlas?[skin.atlas]:[]),...Object.values(skin.layers??{})])if(part&&!this.images.has(part.src)){const image=new Image();image.src=new URL('./assets/'+part.src,import.meta.url).href;this.images.set(part.src,image);}}}
 drawPart(c,part){if(!part)return false;const image=this.images.get(part.src);if(!image?.complete||!image.naturalWidth)return false;if(part.source)c.drawImage(image,...part.source,part.x,part.y,part.width,part.height);else c.drawImage(image,part.x,part.y,part.width,part.height);return true;}
 draw(c,g,p){
  const skin=this.skins[p.id],pose=this.animator.pose(p),height=ANIMATION_CONFIG.marker.height;
  c.save();c.translate(p.x,p.y);
  if(g.active===p.id&&['aim','charging'].includes(g.phase)){
   c.fillStyle='#f7d69a';c.beginPath();c.moveTo(-6,-height);c.lineTo(6,-height);c.lineTo(0,-height+10);c.fill();
   c.setLineDash([3,7]);c.strokeStyle='#f7d69a88';c.beginPath();c.moveTo(0,0);const a=p.angle*Math.PI/180;c.lineTo(Math.cos(a)*85,-Math.sin(a)*85);c.stroke();c.setLineDash([]);
  }
  c.globalAlpha=pose.alpha;c.translate(pose.shakeX,pose.shakeY);c.translate(0,p.r+pose.groundOffset);c.rotate(pose.tilt);c.translate(0,-p.r);c.scale(pose.facing,1);c.imageSmoothingEnabled=false;
  if(skin.mode==='layered'&&skin.layers?.head&&skin.layers?.body&&skin.layers?.weapon){
   this.drawPart(c,skin.layers.body);
   c.save();c.translate(0,pose.bob);this.drawPart(c,skin.layers.head);c.restore();
   c.save();const pivot=skin.layers.weapon.pivot??[0,-2];c.translate(...pivot);c.rotate(pose.aim-pose.tilt*pose.facing);c.translate(-pose.recoil,0);this.drawPart(c,skin.layers.weapon);c.restore();
  }else{
   // Whole-image fallback: no fake independently rotating head or barrel.
   c.translate(-Math.cos(pose.aim)*pose.recoil*ANIMATION_CONFIG.fire.wholeRecoil,pose.bob-Math.sin(pose.aim)*pose.recoil*ANIMATION_CONFIG.fire.wholeRecoil);
   const action=skin.mode==='sprites'&&skin.atlas?{src:skin.atlas.src,...skin.atlas.frames[pose.frame]}:null;
   if(!(action&&this.drawPart(c,action))&&!this.drawPart(c,skin.whole)){c.fillStyle=p.id?'#87dfc2':'#ff9988';c.beginPath();c.arc(0,0,14,0,Math.PI*2);c.fill();}
  }
  c.restore();
 }
}
