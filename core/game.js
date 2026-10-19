import {Terrain} from './terrain.js';
export const DT=1/120;
export class Game {
 constructor(){this.reset();}
 get projectile(){return this.projectiles[0]??null;}
 set projectile(value){this.projectiles=value?[value]:[];}
 reset(){this.terrain=new Terrain();this.players=[180,920].map((x,i)=>({id:i,x,y:this.terrain.surface(x)-15,r:14,hp:100,vy:0,grounded:false,angle:i?135:45,power:65}));for(const p of this.players)while(this.terrain.circle(p.x,p.y,p.r)&&p.y>p.r)p.y-=1;this.active=0;this.turn=1;this.phase='aim';this.wind=0;this.time=30;this.fuel=500;this.projectiles=[];this.shotQueue=[];this.salvoTime=0;this.item='normal';this.effects=[];this.events=[];this.settleTime=0;this.winner=null;this.charge=0;this.chargeElapsed=0;this.chargeDirection=1;this.notice='';this.noticeTime=0;}
 command(c){if(c.type==='restart'){this.reset();return true;}if(c.type==='release'){if(this.phase!=='charging')return false;this.players[this.active].power=this.charge;this.launch();return true;}if(c.type==='cancelCharge'){if(this.phase!=='charging')return false;this.failShot('蓄力中斷，換人');return true;}if(this.phase!=='aim')return false;const p=this.players[this.active];if(c.type==='item'){if(!['normal','burst','spread'].includes(c.item))return false;this.item=c.item;return true;}if(c.type==='elevation'){if(!Number.isFinite(c.delta))return false;p.angle=Math.max(5,Math.min(175,p.angle+c.delta*(p.id===1?-1:1)));return true;}if(c.type==='aim'){if(!Number.isFinite(c.angle)||!Number.isFinite(c.power))return false;p.angle=Math.max(5,Math.min(175,c.angle));p.power=Math.max(15,Math.min(100,c.power));return true;}if(c.type==='move'){if(!Number.isFinite(c.dx))return false;this.movePlayer(p,c.dx);return true;}if(c.type==='charge'){this.charge=0;this.chargeElapsed=0;this.chargeDirection=1;this.notice='';this.phase='charging';return true;}return false;}
 movePlayer(p,requested){
  const distance=Math.min(Math.abs(requested),this.fuel,2),n=Math.ceil(distance);if(!n)return;
  const dx=Math.sign(requested)*distance/n;
  for(let i=0;i<n;i++){
   const nx=p.x+dx;if(nx<p.r||nx>this.terrain.w-p.r)break;
   let rise=0;
   if(this.terrain.circle(nx,p.y,p.r)){
    // Follow small terrain steps only while supported; never climb walls in air.
    if(!this.terrain.circle(p.x,p.y+2,p.r))break;
    let found=false;
    for(let up=1;up<=3;up++){
     if(this.terrain.circle(p.x,p.y-up,p.r))break;
     if(!this.terrain.circle(nx,p.y-up,p.r)){rise=up;found=true;break;}
    }
    if(!found)break;
   }
   p.x=nx;p.y-=rise;if(rise)p.vy=0;this.fuel=Math.max(0,this.fuel-Math.abs(dx));
  }
 }

 launch(){
  const p=this.players[this.active];this.phase='flight';this.salvoTime=0;this.shotQueue=[];
  const offsets=this.item==='spread'?[-9,0,9]:[0];
  const shots=this.item==='burst'?3:1;
  for(let i=0;i<shots;i++)for(const offset of offsets)this.shotQueue.push({at:i*.55,x:p.x,y:p.y,angle:p.angle+offset,power:p.power});
  this.emitShots();
 }
 emitShots(){while(this.shotQueue.length&&this.shotQueue[0].at<=this.salvoTime+1e-9){const shot=this.shotQueue.shift(),a=shot.angle*Math.PI/180,speed=200+shot.power*5;this.projectiles.push({x:shot.x+Math.cos(a)*23,y:shot.y-Math.sin(a)*23,vx:Math.cos(a)*speed,vy:-Math.sin(a)*speed,age:0});this.events.push({type:'projectileFired',turn:this.turn,at:this.salvoTime,angle:shot.angle});}}

 failShot(message){this.projectile=null;this.shotQueue=[];this.phase='settling';this.settleTime=0;this.charge=0;this.notice=message;this.noticeTime=3;this.events.push({type:'shotFailed',playerId:this.active,turn:this.turn});}

 explode(x,y){this.terrain.carve(x,y,58);for(const p of this.players){const d=Math.hypot(p.x-x,p.y-y);if(d<94)p.hp=Math.max(0,p.hp-Math.round(62*(1-d/94)));}this.effects.push({x,y,age:0});this.events.push({type:'explosion',x,y});if(!this.projectiles.length&&!this.shotQueue.length){this.phase='settling';this.settleTime=0;}}
 step(dt=DT){this.noticeTime=Math.max(0,this.noticeTime-dt);if(this.noticeTime===0)this.notice='';for(const e of this.effects)e.age+=dt;this.effects=this.effects.filter(e=>e.age<.7);if(this.phase==='ended')return;
  for(const p of this.players){if(p.hp<=0)continue;p.vy=Math.min(p.vy+430*dt,550);const dy=p.vy*dt,n=Math.max(1,Math.ceil(Math.abs(dy)));p.grounded=false;for(let i=0;i<n;i++){if(this.terrain.circle(p.x,p.y+dy/n,p.r)){p.vy=0;p.grounded=true;break;}p.y+=dy/n;}if(p.y-p.r>this.terrain.h){p.hp=0;p.vy=0;}}
  if(this.phase==='flight'){
   this.salvoTime+=dt;this.emitShots();
   for(const b of [...this.projectiles]){
    b.age+=dt;b.vx+=this.wind*dt;b.vy+=430*dt;
    const dx=b.vx*dt,dy=b.vy*dt,n=Math.max(1,Math.ceil(Math.hypot(dx,dy)));
    for(let i=0;i<n;i++){
     b.x+=dx/n;b.y+=dy/n;
     const hit=this.players.some(p=>p.hp>0&&Math.hypot(p.x-b.x,p.y-b.y)<p.r+3);
     if(this.terrain.circle(b.x,b.y,3)||hit){this.projectiles=this.projectiles.filter(other=>other!==b);this.explode(b.x,b.y);break;}
     if(b.x< -100||b.x>1200||b.y>750||b.age>12){this.projectiles=this.projectiles.filter(other=>other!==b);break;}
    }
   }
   if(!this.projectiles.length&&!this.shotQueue.length&&this.phase==='flight'){this.phase='settling';this.settleTime=0;}
  }
  const living=this.players.filter(p=>p.hp>0);if(living.length<2&&!this.projectiles.length&&!this.shotQueue.length){this.phase='ended';this.winner=living[0]?.id??-1;this.projectile=null;return;}
  if(this.phase==='settling'){this.settleTime+=dt;if(this.settleTime>.3&&this.players.every(p=>p.grounded)){this.active=1-this.active;this.turn++;this.wind=Math.round(Math.sin(this.turn*7.13)*38);this.time=30;this.fuel=500;this.charge=0;this.item='normal';this.phase='aim';}}
  if(this.phase==='charging'){this.chargeElapsed+=dt;const progress=this.chargeElapsed/1.5;this.chargeDirection=progress<1?1:-1;this.charge=Math.max(0,Math.min(100,(progress<=1?progress:2-progress)*100));if(this.chargeElapsed>=3-1e-9)this.failShot('發射失敗：蓄力條已退回起點，換人');}
  if(this.phase==='aim'||this.phase==='charging'){this.time=Math.max(0,this.time-dt);if(this.time===0)this.failShot('回合時間到，換人');}
 }
}
