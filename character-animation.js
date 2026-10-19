import {ACTION_ATLASES} from './character-sprites.js';
import {fitGround,stableGround} from './character-ground.js';
// Visual settings only: never used for physics, collisions or projectile spawn.
export const ANIMATION_CONFIG={
 crawl:{framesPerSecond:12},
 shot:{prepareDuration:.24,recoverDuration:.6},
 idle:{amplitude:.35,frequency:.9},
 fire:{duration:.22,recoil:5,bodyShake:1.4,frequency:32,wholeRecoil:.55},
 hurt:{duration:.55,shake:2.6,frequency:35,blinkInterval:.065,blinkAlpha:.25},
 marker:{height:66},
};
// Whole-character action frames, with original PNG and true layer interfaces retained.
export const CHARACTER_SKINS=[
 {mode:'sprites',whole:{src:'characters-full.png',source:[1080,145,910,555],width:78,height:48,x:-55,y:-34},atlas:ACTION_ATLASES.girl,layers:null},
 {mode:'sprites',whole:{src:'characters-full.png',source:[70,145,880,555],width:78,height:49,x:-55,y:-35},atlas:ACTION_ATLASES.boy,layers:null},
];
export class CharacterAnimator{
 constructor(config=ANIMATION_CONFIG){this.config=config;this.events=null;this.cursor=0;this.time=0;this.states=new Map();}
 update(g,dt,input={move:0}){
  if(this.events!==g.events){this.events=g.events;this.cursor=0;this.time=0;this.states=new Map(g.players.map(p=>[p.id,{hp:p.hp,fireAge:Infinity,hurtAge:Infinity,facing:p.angle>90?-1:1,crawlTime:0,moving:false,tilt:0,offset:0,prepareAge:0,charging:false}]));}
  this.time+=dt;
  for(const p of g.players){const s=this.states.get(p.id);s.fireAge+=dt;s.hurtAge+=dt;if(p.hp<s.hp)s.hurtAge=0;s.hp=p.hp;if(p.angle<90)s.facing=1;else if(p.angle>90)s.facing=-1;
   s.moving=g.active===p.id&&g.phase==='aim'&&p.hp>0&&g.fuel>0&&input.move!==0;s.crawlTime=s.moving?s.crawlTime+dt:0;
   s.charging=g.active===p.id&&g.phase==='charging';s.prepareAge=s.charging?s.prepareAge+dt:0;
   const ground=stableGround(s.groundPose,fitGround(g.terrain,p,s.facing));s.groundPose=ground;s.tilt=ground.tilt;s.offset=ground.offset;}
  for(;this.cursor<g.events.length;this.cursor++){const e=g.events[this.cursor];if(e.type==='projectileFired'){const s=this.states.get(e.playerId??g.active);if(s)s.fireAge=0;}}
 }
 pose(p){
  const cfg=this.config,s=this.states.get(p.id)??{fireAge:Infinity,hurtAge:Infinity,facing:p.angle>90?-1:1};
  const firing=s.fireAge<cfg.fire.duration,hurting=s.hurtAge<cfg.hurt.duration;
  const fireWeight=firing?Math.pow(1-s.fireAge/cfg.fire.duration,2):0,hurtWeight=hurting?1-s.hurtAge/cfg.hurt.duration:0;
  let frame=8;
  if(s.fireAge<cfg.shot.recoverDuration)frame=11+Math.min(4,Math.floor(s.fireAge/(cfg.shot.recoverDuration/5)));
  else if(s.charging)frame=8+Math.min(2,Math.floor(s.prepareAge/(cfg.shot.prepareDuration/3)));
  else if(s.moving)frame=Math.floor(s.crawlTime*cfg.crawl.framesPerSecond+1e-9)%8;
  return {frame,tilt:s.tilt??0,groundOffset:s.offset??0,facing:s.facing,aim:-(s.facing===1?p.angle:180-p.angle)*Math.PI/180,
   bob:s.moving?0:Math.sin(this.time*cfg.idle.frequency*Math.PI*2+p.id)*cfg.idle.amplitude,
   recoil:cfg.fire.recoil*fireWeight,
   shakeX:(firing?Math.sin(s.fireAge*cfg.fire.frequency*Math.PI*2)*cfg.fire.bodyShake*fireWeight:0)+(hurting?Math.sin(s.hurtAge*cfg.hurt.frequency*Math.PI*2)*cfg.hurt.shake*hurtWeight:0),
   shakeY:hurting?Math.cos(s.hurtAge*cfg.hurt.frequency*Math.PI*2)*cfg.hurt.shake*.4*hurtWeight:0,
   alpha:hurting&&Math.floor(s.hurtAge/cfg.hurt.blinkInterval)%2===0?cfg.hurt.blinkAlpha:1};
 }
}
