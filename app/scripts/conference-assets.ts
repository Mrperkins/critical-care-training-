/** Plan neural narration, then assemble one uninterrupted MP3 per case with measured chapter times.
 * --plan <scratch-dir>; render jobs.json with scripts/narrate.py into <scratch-dir>/render;
 * --collect <scratch-dir>. Audio is intentionally separate from the existing lesson voice store.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { CONFERENCES } from '../src/cases/catalog';
import { conferenceAudioKey, conferenceAssetPaths } from '../src/cases/audioKey';
import { transcriptFor } from '../src/cases/buildConference';
import { NARRATOR } from '../src/audio/narrator';
import { jobHash } from './narration-common';
import type { ConferenceAudio } from '../src/cases/types';

const [mode, dir] = process.argv.slice(2);
if (!dir || !['--plan','--collect'].includes(mode)) throw new Error('Use --plan or --collect and a scratch directory');
fs.mkdirSync(dir,{recursive:true});
const clip = (c: string,s: string) => `conference.${c}.${s}`;
const destination = path.resolve('public/conferences');
if (mode === '--plan') {
  const jobs = CONFERENCES.flatMap(c => c.slides.map(s => ({id:clip(c.id,s.id),target:'vo',text:s.narration,hash:jobHash(s.narration)})));
  fs.writeFileSync(path.join(dir,'jobs.json'),JSON.stringify({narrator:NARRATOR,jobs},null,1));
  console.log(`${CONFERENCES.length} conferences, ${jobs.length} slides, ${jobs.reduce((n,j)=>n+j.text.length,0)} spoken characters`);
} else {
  // Collection may run after another source commit. Never bind old clips to a newer script.
  const plan=JSON.parse(fs.readFileSync(path.join(dir,'jobs.json'),'utf8'));
  if(JSON.stringify(plan.narrator)!==JSON.stringify(NARRATOR))throw new Error('Narrator changed since the render plan');
  const planned=new Map<string,string>(plan.jobs.map((j:{id:string;hash:string})=>[j.id,j.hash]));
  for(const c of CONFERENCES)for(const s of c.slides){
    if(planned.get(clip(c.id,s.id))!==jobHash(s.narration))throw new Error(`Script changed since render plan: ${c.id}/${s.id}`);
  }
  fs.mkdirSync(path.join(destination,'audio'),{recursive:true});
  fs.mkdirSync(path.join(destination,'transcripts'),{recursive:true});
  const padded=path.join(path.resolve(dir),'padded');
  fs.mkdirSync(padded,{recursive:true});
  const assets: Record<string,ConferenceAudio> = {};
  for (const c of CONFERENCES) {
    let t=0;
    const files = c.slides.map(s=>{
      const input=path.join(path.resolve(dir),'render','vo',`${clip(c.id,s.id)}.mp3`);
      if(!s.pauseAfterSeconds)return input;
      if(!Number.isFinite(s.pauseAfterSeconds)||s.pauseAfterSeconds<0||s.pauseAfterSeconds>15)throw new Error(`Invalid reflection pause: ${c.id}/${s.id}`);
      const output=path.join(padded,`${clip(c.id,s.id)}.mp3`);
      execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',input,'-af',`apad=pad_dur=${s.pauseAfterSeconds}`,'-c:a','libmp3lame','-b:a','128k',output]);
      return output;
    });
    const chapters=c.slides.map((s,i)=>{
      if(!fs.existsSync(files[i])) throw new Error(`Missing clip ${files[i]}`);
      const seconds=Number(execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',files[i]],{encoding:'utf8'}));
      if(!Number.isFinite(seconds)||seconds<=0) throw new Error(`Invalid duration ${files[i]}`);
      const start=t; t+=seconds; return {id:s.id,start,end:t};
    });
    const list=path.join(dir,`${c.id}.concat`);
    fs.writeFileSync(list,files.map(f=>`file '${f.replaceAll("'", "'\\''")}'`).join('\n'));
    const paths=conferenceAssetPaths(c), file=paths.audio;
    execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',list,'-c','copy',path.join(destination,file)]);
    const seconds=Number(execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',path.join(destination,file)],{encoding:'utf8'}));
    assets[c.id]={file,seconds,chapters,transcriptHash:conferenceAudioKey(c)};
    fs.writeFileSync(path.join(destination,paths.transcript),transcriptFor(c)+'\n');
  }
  fs.writeFileSync(path.join(destination,'manifest.json'),JSON.stringify({version:1,narrator:NARRATOR,assets},null,1));
  // These two folders are generated output. Retain exactly the newly assembled revision.
  const current = new Set(CONFERENCES.flatMap(c=>Object.values(conferenceAssetPaths(c))));
  for(const folder of ['audio','transcripts'])for(const name of fs.readdirSync(path.join(destination,folder))){
    const relative=`${folder}/${name}`;
    if(/\.(mp3|txt)$/.test(name)&&!current.has(relative))fs.unlinkSync(path.join(destination,relative));
  }
  console.log(`Assembled ${Object.keys(assets).length} continuous conferences, ${Math.round(Object.values(assets).reduce((n,a)=>n+a.seconds,0)/60)} minutes`);
}
