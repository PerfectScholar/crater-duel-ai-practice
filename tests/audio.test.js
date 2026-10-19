import test from 'node:test';import assert from 'node:assert/strict';
import {synthesize,SOUND_NAMES,SAMPLE_RATE} from '../sound-synth.js';
import {BattleAudio} from '../audio.js';import {Game} from '../core/game.js';
test('all sound waveforms are finite, bounded and fade to silence',()=>{
 for(const name of SOUND_NAMES){const data=synthesize(name);assert.ok(data.length>=SAMPLE_RATE*.1);let energy=0;for(const value of data){assert.ok(Number.isFinite(value)&&Math.abs(value)<=.78);energy+=value*value;}assert.ok(energy/data.length>.0001);assert.ok(Math.abs(data.at(-1))<.001);}
});
test('audio consumes events once, groups simultaneous shells and resets on restart',()=>{
 const g=new Game(),audio=new BattleAudio(),played=[];audio.play=(name)=>played.push(name);audio.sync(g);
 g.command({type:'item',item:'spread'});audio.sync(g);audio.sync(g);assert.deepEqual(played,['item']);
 g.command({type:'charge'});g.charge=50;g.command({type:'release'});audio.sync(g);audio.sync(g);assert.equal(played.filter(x=>x==='fire').length,1);
 g.command({type:'restart'});audio.sync(g);assert.equal(played.length,2);g.command({type:'pass'});audio.sync(g);assert.equal(played.at(-1),'pass');
});
test('warning sounds only once per remaining second while aiming',()=>{
 const g=new Game(),audio=new BattleAudio(),played=[];audio.play=name=>played.push(name);audio.sync(g);g.time=9.9;audio.sync(g);audio.sync(g);g.time=8.9;audio.sync(g);assert.deepEqual(played,['tick','tick']);g.phase='flight';g.time=7.9;audio.sync(g);assert.equal(played.length,2);
});
