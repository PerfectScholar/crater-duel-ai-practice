import {writeFileSync,mkdirSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {synthesize,SAMPLE_RATE} from '../sound-synth.js';
const output=resolve(process.argv[2]??'sound-demo.wav');
const sequence=['item','fire','explosion','turn','tick','tick','pass','victory'];
const clips=sequence.map(synthesize),gap=Math.round(.22*SAMPLE_RATE),count=clips.reduce((n,c)=>n+c.length+gap,0),wav=Buffer.alloc(44+count*2);
wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(SAMPLE_RATE,24);wav.writeUInt32LE(SAMPLE_RATE*2,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(count*2,40);
let cursor=44;for(const clip of clips){for(const value of clip){wav.writeInt16LE(Math.round(value*32767*.6),cursor);cursor+=2;}cursor+=gap*2;}
mkdirSync(dirname(output),{recursive:true});writeFileSync(output,wav);console.log(output);
