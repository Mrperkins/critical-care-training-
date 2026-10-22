/** Production browser smoke test. Run after npm run build; serves local files only. */
import {chromium} from 'playwright';
import {createServer} from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const dir=path.resolve('qa-output/conferences');fs.mkdirSync(dir,{recursive:true});
const pub=path.resolve('dist/pub');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.mp3':'audio/mpeg','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.txt':'text/plain'};
const server=createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const base=pathname.startsWith('/imaging/')?path.resolve('..'):pub;
  const file=path.resolve(base,`.${pathname==='/'?'/index.html':pathname}`);
  if(!file.startsWith(base+path.sep)||!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404);res.end();return;}
  const data=fs.readFileSync(file);const range=/bytes=(\d+)-(\d*)/.exec(req.headers.range??'');
  res.setHeader('Content-Type',mime[path.extname(file)]??'application/octet-stream');res.setHeader('Accept-Ranges','bytes');
  if(range){const start=Number(range[1]),end=Math.min(data.length-1,range[2]?Number(range[2]):data.length-1);res.writeHead(206,{'Content-Range':`bytes ${start}-${end}/${data.length}`,'Content-Length':end-start+1});res.end(data.subarray(start,end+1));}
  else {res.writeHead(200,{'Content-Length':data.length});res.end(data);}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const url=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({headless:true});
const results=[];
try{
  for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844],['small-mobile',360,800]]){
    const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.addInitScript(()=>window.__NO_SW__=true);
    await page.goto(`${url}/?module=cases`);await page.locator('.conferences-hero h2').waitFor();await page.locator('.conference-card').first().waitFor();
    await page.screenshot({path:path.join(dir,`${name}-library.png`)});
    assert.equal(await page.locator('.conference-card').count(),32);
    await page.getByRole('combobox',{name:'Population',exact:true}).selectOption('Obstetric');assert.equal(await page.locator('.conference-card').count(),10);
    await page.getByRole('combobox',{name:'Population',exact:true}).selectOption('All');
    await page.getByRole('button',{name:'Open case conference'}).first().click();await page.locator('.conference-slide').waitFor();
    await page.screenshot({path:path.join(dir,`${name}-case.png`)});
    await page.getByRole('button',{name:'Next slide →',exact:true}).click();await page.getByRole('button',{name:'Next slide →',exact:true}).click();
    await page.screenshot({path:path.join(dir,`${name}-vitals.png`)});
    assert.equal(await page.locator('.conference-slide h3').textContent(),'Vital signs');
    const a=page.locator('audio');
    await a.waitFor({state:'visible'});
    const audioExists=true;
    if(audioExists){
      await a.evaluate(a=>{a.dataset.original='yes';});
      await page.getByRole('button',{name:'Listen',exact:true}).click();
      assert.equal(await a.getAttribute('data-original'),'yes');
      await a.evaluate(async a=>{await a.play();});
      await page.waitForFunction(()=>document.querySelector('audio').currentTime>0.2);
      await a.evaluate(a=>{a.currentTime=80;a.dispatchEvent(new Event('timeupdate'));});
      await page.getByRole('button',{name:'Watch slides',exact:true}).click();
      assert.equal(await a.getAttribute('data-original'),'yes');
      await a.evaluate(a=>a.pause());
    }
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);assert.equal(overflow,false,`${name}: horizontal overflow`);
    await page.getByRole('button',{name:'← Case library',exact:true}).click();
    await page.getByRole('button',{name:'Coverage & development',exact:true}).click();await page.getByRole('heading',{name:'Coverage is a visible checklist'}).waitFor();
    await page.screenshot({path:path.join(dir,`${name}-coverage.png`)});
    assert.equal(errors.length,0,JSON.stringify(errors));
    results.push({viewport:name,width,height,audio:audioExists?'Playback and mode preservation verified':'Not yet assembled',horizontalOverflow:overflow,errors});
    await page.close();
  }
  const linked=await browser.newPage();await linked.addInitScript(()=>window.__NO_SW__=true);await linked.goto(`${url}/?module=cases&case=eclampsia-postpartum`);await linked.locator('#conference-title').filter({hasText:'A seizure five days after delivery'}).waitFor();await linked.getByRole('button',{name:'Next slide →',exact:true}).click();await linked.getByText('Chapters & full transcript',{exact:true}).click();await linked.locator('nav[aria-label="Conference chapters"] button').last().click();await linked.getByRole('button',{name:'Continue to the lesson',exact:true}).click();await linked.locator('#fpc-title').waitFor();assert(await linked.locator('.case-primer').count()>0);await linked.close();
  fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
