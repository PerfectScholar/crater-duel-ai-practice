import test from 'node:test';import assert from 'node:assert/strict';
import {Game,DT} from '../core/game.js';import {CharacterAnimator,ANIMATION_CONFIG,CHARACTER_SKINS} from '../character-animation.js';import {fitGround,GROUND_CONFIG,nearbySurface,stableGround} from '../character-ground.js';
test('both generated sheets have sixteen valid whole-character frames',()=>{for(const skin of CHARACTER_SKINS){assert.equal(skin.atlas.frames.length,16);for(const frame of skin.atlas.frames){assert.equal(frame.source.length,4);assert.ok(frame.width>0&&frame.height>0);assert.equal(frame.y+frame.height,14);}}});
test('holding movement loops all eight crawl frames independently of ground and displacement',()=>{
 const g=new Game(),a=new CharacterAnimator(),p=g.players[0];a.update(g,0);const frames=[];
 for(let i=0;i<16;i++){p.grounded=i%2===0;a.update(g,i===0?0:1/12,{move:1});frames.push(a.pose(p).frame);}
 assert.deepEqual(frames,[0,1,2,3,4,5,6,7,0,1,2,3,4,5,6,7]);
 const x=p.x;a.update(g,0,{move:0});assert.equal(a.pose(p).frame,8);assert.equal(p.x,x);
 a.update(g,0,{move:-1});assert.equal(a.pose(p).frame,0);
 g.phase='charging';a.update(g,0,{move:1});assert.equal(a.states.get(p.id).moving,false);
});
test('movement has no acceleration or coasting after input stops',()=>{
 const g=new Game();for(let i=0;i<120;i++)g.step();const p=g.players[0],x=p.x;
 g.command({type:'move',dx:.75});assert.ok(Math.abs(p.x-x-.75)<1e-9);const stoppedX=p.x;
 for(let i=0;i<60;i++)g.step();assert.equal(p.x,stoppedX);
});
test('ground alignment has no delayed displacement after release',()=>{
 const g=new Game(),a=new CharacterAnimator(),p=g.players[0];p.grounded=true;a.update(g,DT,{move:1});const expected=fitGround(g.terrain,p,1);a.update(g,0,{move:0});assert.equal(a.pose(p).groundOffset,expected.offset);assert.equal(a.pose(p).tilt,expected.tilt);
});
test('charging prepares lift, firing recoils and explicitly recovers through return-to-prone frames',()=>{
 const g=new Game(),a=new CharacterAnimator(),p=g.players[0];a.update(g,DT);g.command({type:'charge'});a.update(g,.08);assert.equal(a.pose(p).frame,9);a.update(g,.2);assert.equal(a.pose(p).frame,10);
 g.charge=40;g.command({type:'release'});a.update(g,0);assert.equal(a.pose(p).frame,11);a.update(g,.13);assert.equal(a.pose(p).frame,12);a.update(g,.13);assert.equal(a.pose(p).frame,13);a.update(g,.13);assert.equal(a.pose(p).frame,14);a.update(g,.13);assert.equal(a.pose(p).frame,15);a.update(g,.13);assert.equal(a.pose(p).frame,8);
});
const slopeTerrain=slope=>({w:400,h:400,solid:(x,y)=>y>=200+slope*(Math.floor(x)-200)});
test('terrain visual tilt follows slope, clamps steep grades, handles facing and air',()=>{
 const p={x:200,y:186,r:14,grounded:true};for(const slope of [-2,-.2,0,.2,2]){for(const facing of [-1,1]){const pose=fitGround(slopeTerrain(slope),p,facing);assert.ok(Math.abs(pose.tilt)<=GROUND_CONFIG.maxTiltDegrees*Math.PI/180+1e-9);if(slope!==0)assert.equal(Math.sign(pose.tilt),Math.sign(slope));assert.ok(Math.abs(pose.offset)<=GROUND_CONFIG.maxOffset);}}
 assert.deepEqual(fitGround(slopeTerrain(.2),{...p,y:100,grounded:false},1),{tilt:0,offset:0});assert.equal(nearbySurface({h:400,solid:()=>false},200,200),null);
});
test('surface probing finds nearby floor below an unrelated higher ledge',()=>{
 const terrain={w:400,h:400,solid:(x,y)=>(y>=50&&y<70)||y>=200};assert.equal(nearbySurface(terrain,200,200),200);
});

test('fuel exhausted blocks crawl immediately even when a movement key stays held',()=>{
 const g=new Game(),a=new CharacterAnimator(),p=g.players[0];a.update(g,.2,{move:1});assert.ok(a.pose(p).frame<8);g.fuel=0;a.update(g,0,{move:1});assert.equal(a.pose(p).frame,8);assert.equal(a.states.get(p.id).moving,false);a.update(g,1,{move:-1});assert.equal(a.pose(p).frame,8);
 g.fuel=500;a.update(g,0,{move:1});assert.equal(a.pose(p).frame,0);
});
test('visual ground pose ignores one-frame grounded flicker near floor',()=>{
 const terrain=slopeTerrain(.3),p={x:200,y:186,r:14,grounded:true};const supported=fitGround(terrain,p,1);p.grounded=false;assert.deepEqual(fitGround(terrain,p,1),supported);
});
test('deadzone rejects tiny terrain noise but applies larger changes immediately',()=>{
 const previous={tilt:.2,offset:2};assert.deepEqual(stableGround(previous,{tilt:.21,offset:2.5}),previous);assert.deepEqual(stableGround(previous,{tilt:.3,offset:6}),{tilt:.3,offset:6});
});

test('comfort deadzones hold moderately uneven ground and tolerate brief foot gaps',()=>{
 const previous={tilt:.2,offset:2};assert.deepEqual(stableGround(previous,{tilt:.25,offset:4}),previous);
 const terrain=slopeTerrain(.3),p={x:200,y:176,r:14,grounded:false};assert.notEqual(fitGround(terrain,p,1).tilt,0);
});
