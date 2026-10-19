// Original procedural sound design. No external samples or libraries.
export const SAMPLE_RATE=44100;
const lengths={fire:.65,explosion:1.7,item:.42,tick:.12,turn:.5,pass:.32,fail:.4,victory:1.6};
export function synthesize(name){
 const duration=lengths[name];if(!duration)throw new Error('Unknown sound: '+name);
 const data=new Float32Array(Math.ceil(duration*SAMPLE_RATE));let low=0,seed=54321,phase=0;
 for(let i=0;i<data.length;i++){
  const t=i/SAMPLE_RATE;seed=(Math.imul(seed,1664525)+1013904223)>>>0;const noise=seed/2147483648-1;low+=.065*(noise-low);
  const attack=Math.min(1,t/.003);let sample=0;
  if(name==='fire'){
   phase+=2*Math.PI*(42+110*Math.exp(-t*32))/SAMPLE_RATE;
   sample=.8*Math.sin(phase)*Math.exp(-t*12)+noise*.7*Math.exp(-t*65)+low*1.7*Math.exp(-t*7);
  }else if(name==='explosion'){
   phase+=2*Math.PI*(28+75*Math.exp(-t*15))/SAMPLE_RATE;
   sample=.6*Math.sin(phase)*Math.exp(-t*4.8)+low*3.1*Math.exp(-t*2.8)+noise*.6*Math.exp(-t*28);
   sample+=noise*.12*Math.exp(-t*3)*Math.max(0,Math.sin(t*47));
  }else if(name==='item'){
   phase+=2*Math.PI*(180+700*t)/SAMPLE_RATE;
   sample=(Math.sin(phase)*.38+Math.sin(phase*1.5)*.13)*Math.exp(-t*7)+noise*.14*Math.exp(-t*30);
  }else if(name==='tick')sample=Math.sin(2*Math.PI*620*t)*.35*Math.exp(-t*35)+noise*.12*Math.exp(-t*70);
  else if(name==='turn')sample=(Math.sin(2*Math.PI*(t<.18?130:195)*t)*.4+low*.4)*Math.exp(-t*5);
  else if(name==='pass'){phase+=2*Math.PI*(300-650*t)/SAMPLE_RATE;sample=Math.sin(phase)*.4*Math.exp(-t*10)+low*.6*Math.exp(-t*8);}
  else if(name==='fail')sample=Math.sin(2*Math.PI*75*t)*.4*Math.exp(-t*9)+noise*.1*Math.exp(-t*20);
  else {const notes=[130.81,164.81,196,261.63],note=notes[Math.min(3,Math.floor(t/.24))];sample=(Math.sin(2*Math.PI*note*t)*.3+Math.sin(2*Math.PI*note*2*t)*.1)*Math.exp(-t*1.8);}
  data[i]=Math.tanh(sample*1.3)*attack*Math.min(1,(duration-t)/.03)*.78;
 }
 return data;
}
export const SOUND_NAMES=Object.keys(lengths);
