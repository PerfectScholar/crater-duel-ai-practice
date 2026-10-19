import {synthesize,SOUND_NAMES,SAMPLE_RATE} from './sound-synth.js';
export class BattleAudio{
 constructor(){this.volume=.45;this.muted=false;this.sources=new Set();this.events=null;this.cursor=0;this.items=new Set();this.turn=1;this.phase='aim';this.second=30;}
 unlock(){
  try{
   if(!this.ctx){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;this.ctx=new Audio();this.master=this.ctx.createGain();this.master.gain.value=this.muted?0:this.volume;
    const compressor=this.ctx.createDynamicsCompressor();compressor.threshold.value=-12;compressor.ratio.value=8;this.master.connect(compressor);compressor.connect(this.ctx.destination);
    this.buffers={};for(const name of SOUND_NAMES){const data=synthesize(name),buffer=this.ctx.createBuffer(1,data.length,SAMPLE_RATE);buffer.copyToChannel(data,0);this.buffers[name]=buffer;}
   }
   if(this.ctx.state==='suspended')this.ctx.resume().catch(()=>{});
  }catch{this.ctx=null;}
 }
 setVolume(value){this.volume=Math.max(0,Math.min(1,value));this.applyVolume();}
 setMuted(value){this.muted=value;this.applyVolume();if(value)this.stopCharge();}
 applyVolume(){if(this.ctx)this.master.gain.setTargetAtTime(this.muted?0:this.volume,this.ctx.currentTime,.025);}
 play(name,x=550,strength=1){
  if(!this.ctx||this.ctx.state!=='running'||this.muted||!this.volume)return;
  const source=this.ctx.createBufferSource(),gain=this.ctx.createGain(),pan=this.ctx.createStereoPanner();source.buffer=this.buffers[name];gain.gain.value=strength;pan.pan.value=Math.max(-.75,Math.min(.75,(x-550)/700));source.connect(gain);gain.connect(pan);pan.connect(this.master);this.sources.add(source);source.onended=()=>{this.sources.delete(source);source.disconnect();gain.disconnect();pan.disconnect();};source.start();
 }
 startCharge(){
  if(!this.ctx||this.ctx.state!=='running'||this.muted||!this.volume||this.charge)return;
  const tone=this.ctx.createOscillator(),gain=this.ctx.createGain(),filter=this.ctx.createBiquadFilter();tone.type='sawtooth';filter.type='lowpass';filter.frequency.value=700;gain.gain.setValueAtTime(0,this.ctx.currentTime);gain.gain.linearRampToValueAtTime(.045,this.ctx.currentTime+.06);tone.connect(filter);filter.connect(gain);gain.connect(this.master);tone.start();this.charge={tone,gain,filter};
 }
 stopCharge(){if(!this.charge)return;const {tone,gain,filter}=this.charge;this.charge=null;gain.gain.cancelScheduledValues(this.ctx.currentTime);gain.gain.setTargetAtTime(0,this.ctx.currentTime,.015);tone.stop(this.ctx.currentTime+.08);tone.onended=()=>{tone.disconnect();gain.disconnect();filter.disconnect();};}
 pause(){this.stopCharge();for(const source of this.sources)source.stop();this.sources.clear();if(this.ctx)this.ctx.suspend().catch(()=>{});}
 sync(g){
  if(this.events!==g.events){this.stopCharge();for(const source of this.sources)source.stop();this.events=g.events;this.cursor=0;this.items=new Set();this.turn=g.turn;this.phase='aim';this.second=Math.ceil(g.time);}
  const played=new Set();for(;this.cursor<g.events.length;this.cursor++){const event=g.events[this.cursor],name=({projectileFired:'fire',explosion:'explosion',shotFailed:g.notice.startsWith('PASS')?'pass':'fail'})[event.type];if(name&&!played.has(name)){this.play(name,event.x??g.players[g.active].x);played.add(name);}}
  for(const item of g.items)if(!this.items.has(item))this.play('item',g.players[g.active].x,.7);this.items=new Set(g.items);
  if(g.turn!==this.turn)this.play('turn',550,.7);
  if(g.phase==='ended'&&this.phase!=='ended')this.play('victory');
  const second=Math.ceil(g.time);if(['aim','charging'].includes(g.phase)&&second<=10&&second>0&&second!==this.second)this.play('tick',550,second<=3?1:.65);
  if(g.phase==='charging'){this.startCharge();if(this.charge){const power=g.charge/100;this.charge.tone.frequency.setTargetAtTime(55+power*190,this.ctx.currentTime,.025);this.charge.filter.frequency.setTargetAtTime(350+power*1100,this.ctx.currentTime,.025);}}else this.stopCharge();
  this.turn=g.turn;this.phase=g.phase;this.second=second;
 }
}
