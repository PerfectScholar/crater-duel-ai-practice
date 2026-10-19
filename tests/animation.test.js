import test from 'node:test';import assert from 'node:assert/strict';
import {Game,DT} from '../core/game.js';import {CharacterAnimator,ANIMATION_CONFIG,CHARACTER_SKINS} from '../character-animation.js';
test('sprite mode retains full-image fallback and aim flips without changing player',()=>{
 assert.ok(CHARACTER_SKINS.every(s=>s.mode==='sprites'&&s.whole&&s.layers===null));const g=new Game(),a=new CharacterAnimator();a.update(g,DT);const before=JSON.stringify(g.players);assert.equal(a.pose(g.players[0]).facing,1);assert.equal(a.pose(g.players[1]).facing,-1);assert.ok(Math.abs(a.pose(g.players[0]).aim+Math.PI/4)<1e-9);assert.ok(Math.abs(a.pose(g.players[1]).aim+Math.PI/4)<1e-9);assert.equal(JSON.stringify(g.players),before);
 g.command({type:'aim',angle:150,power:50});a.update(g,DT);assert.equal(a.pose(g.players[0]).facing,-1);g.command({type:'aim',angle:30,power:50});a.update(g,DT);assert.equal(a.pose(g.players[0]).facing,1);
});
test('fire recoil is triggered once per salvo and recovers; hurt blinks then recovers',()=>{
 const g=new Game(),a=new CharacterAnimator();a.update(g,DT);g.command({type:'item',item:'spread'});g.command({type:'charge'});g.charge=50;g.command({type:'release'});a.update(g,DT);assert.equal(a.pose(g.players[0]).recoil,ANIMATION_CONFIG.fire.recoil);a.update(g,.3);assert.equal(a.pose(g.players[0]).recoil,0);
 g.explode(g.players[0].x,g.players[0].y+20);a.update(g,DT);assert.ok(a.pose(g.players[0]).alpha<1);a.update(g,.6);assert.equal(a.pose(g.players[0]).alpha,1);assert.equal(a.pose(g.players[0]).shakeX,0);
 g.command({type:'restart'});a.update(g,DT);assert.equal(a.pose(g.players[0]).recoil,0);assert.equal(a.pose(g.players[0]).alpha,1);
});
test('animation leaves full physical simulation, projectiles and terrain unchanged',()=>{
 const a=new CharacterAnimator(),visual=new Game(),reference=new Game();
 for(const g of [visual,reference]){g.command({type:'item',item:'burst'});g.command({type:'charge'});g.charge=40;g.command({type:'release'});}
 for(let i=0;i<600;i++){visual.step(DT);a.update(visual,DT);for(const p of visual.players)a.pose(p);reference.step(DT);}
 assert.deepEqual(visual.players,reference.players);assert.deepEqual(visual.projectiles,reference.projectiles);assert.deepEqual(visual.events,reference.events);assert.deepEqual(visual.terrain.mask,reference.terrain.mask);assert.equal(visual.turn,reference.turn);
});
