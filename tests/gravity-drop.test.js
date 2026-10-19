import test from 'node:test';import assert from 'node:assert/strict';import {Game,DT} from '../core/game.js';
const activate=g=>g.command({type:'activateFlightItem',item:'gravity'});
const fire=(g,power=50)=>{g.command({type:'charge'});g.charge=power;g.command({type:'release'});};
test('gravity drop preserves instantaneous speed and position and only changes direction',()=>{
 const g=new Game();g.command({type:'item',item:'gravity'});fire(g);const b=g.projectile;Object.assign(b,{x:500,y:100,vx:-300,vy:-400});assert.equal(activate(g),true);assert.equal(b.x,500);assert.equal(b.y,100);assert.equal(b.vx,0);assert.equal(b.vy,500);assert.equal(Math.hypot(b.vx,b.vy),500);assert.equal(b.lockedX,500);assert.equal(b.horizontalLocked,true);assert.equal(g.effects.at(-1).type,'gravityDrop');
});
test('locked projectile ignores wind and retains normal gravity acceleration',()=>{
 const g=new Game();g.command({type:'item',item:'gravity'});fire(g);const b=g.projectile;Object.assign(b,{x:500,y:80,vx:300,vy:-400});g.wind=500;activate(g);
 for(let i=0;i<20;i++){g.wind=i%2?1000:-1000;g.step();assert.equal(b.x,500);assert.equal(b.vx,0);}assert.ok(Math.abs(b.vy-(500+430*DT*20))<1e-9);
});
test('effect is restricted to selected item, live projectiles, flight and one activation per launch',()=>{
 const g=new Game();assert.equal(activate(g),false);g.command({type:'item',item:'gravity'});assert.equal(activate(g),false);g.command({type:'charge'});assert.equal(activate(g),false);g.charge=40;g.command({type:'release'});assert.equal(activate(g),true);assert.equal(activate(g),false);g.command({type:'restart'});assert.equal(g.usedFlightItems.size,0);fire(g);assert.equal(activate(g),false);
});
test('spread and burst keep their counts and only already airborne shells are converted',()=>{
 const g=new Game();for(const item of ['combo','burst','spread','gravity'])g.command({type:'item',item});fire(g);assert.equal(g.projectiles.length,3);assert.equal(g.shotQueue.length,9);const queue=structuredClone(g.shotQueue);activate(g);assert.ok(g.projectiles.every(b=>b.horizontalLocked&&b.vx===0&&b.vy>0));assert.deepEqual(g.shotQueue,queue);
 g.salvoTime=.55;g.emitShots();assert.equal(g.projectiles.length,6);assert.equal(g.projectiles.filter(b=>b.horizontalLocked).length,3);assert.ok(g.projectiles.slice(3).every(b=>!b.horizontalLocked&&b.vx!==0));assert.equal(activate(g),false);
});
test('gap between burst shells cannot waste activation and later live shell can trigger',()=>{
 const g=new Game();g.command({type:'item',item:'burst'});g.command({type:'item',item:'gravity'});fire(g);g.projectiles=[];assert.equal(activate(g),false);assert.equal(g.usedFlightItems.size,0);g.salvoTime=.55;g.emitShots();assert.equal(activate(g),true);
});
test('drop impact retains identical explosion damage and carved terrain',()=>{
 const drop=new Game(),normal=new Game();for(const g of [drop,normal]){g.terrain.mask.fill(0);g.terrain.mask.fill(1,400*g.terrain.w);g.terrain.version++;for(const p of g.players){p.y=386;p.vy=0;}g.players[1].x=600;g.command({type:'item',item:'gravity'});fire(g);Object.assign(g.projectile,{x:600,y:350,vx:g===drop?300:0,vy:g===drop?-400:500});}
 activate(drop);for(let i=0;i<30&&!drop.events.some(e=>e.type==='explosion');i++){drop.step();normal.step();}
 assert.ok(drop.events.some(e=>e.type==='explosion'));assert.ok(drop.players[1].hp<500);assert.deepEqual(drop.players,normal.players);assert.deepEqual(drop.terrain.mask,normal.terrain.mask);assert.deepEqual(drop.events.filter(e=>e.type==='explosion'),normal.events.filter(e=>e.type==='explosion'));
});
