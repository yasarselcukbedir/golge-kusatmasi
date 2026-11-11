#!/usr/bin/env node
import {writeFileSync,mkdirSync} from 'node:fs';
import {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {renderScore,SCORE} from '../src/client/score.js';
const sampleRate=22050,seconds=18,pcm=renderScore({seconds,sampleRate,faction:'sedef',battle:.75});
const data=Buffer.alloc(44+pcm.length*2);data.write('RIFF');data.writeUInt32LE(data.length-8,4);data.write('WAVE',8);data.write('fmt ',12);data.writeUInt32LE(16,16);data.writeUInt16LE(1,20);data.writeUInt16LE(1,22);data.writeUInt32LE(sampleRate,24);data.writeUInt32LE(sampleRate*2,28);data.writeUInt16LE(2,32);data.writeUInt16LE(16,34);data.write('data',36);data.writeUInt32LE(pcm.length*2,40);
let peak=0,square=0;for(let i=0;i<pcm.length;i++){peak=Math.max(peak,Math.abs(pcm[i]));square+=pcm[i]*pcm[i];data.writeInt16LE(Math.round(Math.max(-1,Math.min(1,pcm[i]))*32767),44+i*2);}
const output=fileURLToPath(new URL('../../docs/audio-preview.wav',import.meta.url));mkdirSync(dirname(output),{recursive:true});writeFileSync(output,data);
const report={original_procedural_score:true,bpm:SCORE.bpm,seconds,sample_rate:sampleRate,channels:1,peak,rms:Math.sqrt(square/pcm.length),clipped_samples:pcm.filter(n=>Math.abs(n)>=1).length,features:['detuned_chord_pads','melody','bass','lowpass_filters','echo','battle_heartbeat'],generated_by:'node deliverable/game/tools/render-audio-preview.mjs'};writeFileSync(new URL('../../docs/audio-preview-report.json',import.meta.url),JSON.stringify(report,null,2)+'\n');process.stdout.write(JSON.stringify(report)+'\n');
