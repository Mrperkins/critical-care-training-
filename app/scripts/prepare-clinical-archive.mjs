/** Fetch original openly licensed MRI images before the publishable site build.
 * Each source is pinned to a Wikimedia Commons SHA-1 plus byte count.
 * Never silently ship an unverified replacement image or a third-party thumbnail.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const assets=JSON.parse(fs.readFileSync(path.join(ROOT,'clinical-archive.json'),'utf8'));
const out=path.join(ROOT,'public/imaging/curated');
fs.mkdirSync(out,{recursive:true});
const timeout=Number(process.env.CLINICAL_MEDIA_TIMEOUT_MS||'25000');
const sleep=(ms)=>new Promise(resolve=>setTimeout(resolve,ms));
const spacing=Number(process.env.CLINICAL_MEDIA_SPACING_MS||'6000');
let nextRequestAt=0;
async function throttle(){
  const now=Date.now();
  if(now<nextRequestAt)await sleep(nextRequestAt-now);
  nextRequestAt=Date.now()+spacing;
}
function valid(file,bytes) {
  if(file.endsWith('.png'))return bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  if(file.endsWith('.jpg'))return bytes[0]===255&&bytes[1]===216&&bytes[bytes.length-2]===255&&bytes[bytes.length-1]===217;
  return false;
}
async function fetchPinned(rec) {
  const output=path.join(out,rec.name);
  if(fs.existsSync(output)){
    const bytes=fs.readFileSync(output);
    if(bytes.length===rec.bytes&&createHash('sha1').update(bytes).digest('hex')===rec.sha1) return {id:rec.id,bytes:bytes.length,cached:true};
    fs.rmSync(output,{force:true});
  }
  if(!/^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/[a-z0-9]+\/[a-z0-9]+\//i.test(rec.url)) throw new Error('Untrusted MRI host: '+rec.id);
  for(let attempt=1;attempt<=6;attempt++){
    try{
      await throttle(); // Commons rate limits bursts from shared runner IPs.
      const controller=new AbortController();
      const timer=setTimeout(()=>controller.abort(),timeout);
      let response;
      try{response=await fetch(rec.url,{signal:controller.signal,headers:{'User-Agent':'CriticalCareTraining-OpenClinicalMedia/1.0 (educational reuse; pinned archive)'}});}
      finally{clearTimeout(timer);}
      if(response.status===429||response.status===503){
        const retry=response.headers.get('retry-after');
        const seconds=retry&&/^\d+$/.test(retry)?Number(retry):0;
        const delay=Math.max(15000*Math.pow(2,Math.min(3,attempt-1)),Math.min(120000,seconds*1000));
        console.warn('Rate limit for',rec.id,response.status,'attempt',attempt,'pause',Math.ceil(delay/1000),'seconds');
        if(attempt===6)throw new Error('HTTP '+response.status+' after 6 attempts');
        await sleep(delay);
        continue;
      }
      if(!response.ok)throw new Error('HTTP '+response.status);
      const kind=response.headers.get('content-type')||'';
      if(!/^image\/(png|jpeg)/i.test(kind))throw new Error('Not an image: '+kind);
      const bytes=Buffer.from(await response.arrayBuffer());
      if(bytes.length!==rec.bytes)throw new Error('Unexpected source byte count: '+bytes.length);
      const sha=createHash('sha1').update(bytes).digest('hex');
      if(sha!==rec.sha1)throw new Error('SHA-1 mismatch ('+sha+'): refuse modified original');
      if(!valid(rec.name,bytes))throw new Error('Invalid image magic bytes');
      const tmp=output+'.part';
      fs.writeFileSync(tmp,bytes);fs.renameSync(tmp,output);
      return {id:rec.id,bytes:bytes.length,cached:false};
    }catch(e){
      if(attempt===6)throw new Error(rec.id+': '+String(e));
      const delay=2500*attempt;
      console.warn('Failed fetch',rec.id,'attempt',attempt,String(e),'pause',delay,'ms');
      await sleep(delay);
    }
  }}
const stats=[];
for(const item of assets) {
  const row=await fetchPinned(item);
  stats.push(row);
  console.log('verified clinical MRI',row.id,row.bytes,'bytes',row.cached?'cached':'downloaded');
}
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify({verified:true,source:'Wikimedia Commons pinned MRI originals',license:'CC BY 4.0',items:assets.map(a=>({id:a.id,file:a.name,sha1:a.sha1,bytes:a.bytes,license:a.license,sourcePage:a.sourcePage}))},null,2));
console.log('clinical MRI archive ready:',stats.length,'originals',stats.reduce((s,x)=>s+x.bytes,0),'bytes');
