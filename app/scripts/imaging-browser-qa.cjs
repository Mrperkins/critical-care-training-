/** Browser end-to-end rehearsal of the actual Imaging Academy UX and source media.
 * Run after npm run build with http://127.0.0.1:8765 serving app/dist and
 * app/dist/imaging/real linked to the repo's verified clinical media.
 */
const { chromium, firefox, webkit } = require('@playwright/test');
const { mkdirSync, writeFileSync } = require('node:fs');
const assert=require('node:assert/strict');
const engine=process.env.QA_BROWSER || 'chromium';
const type={chromium,firefox,webkit}[engine];
if(!type)throw new Error('Unknown browser '+engine);
const OUT='browser-qa/imaging';mkdirSync(OUT,{recursive:true});
(async()=>{
  const browser=await type.launch(engine==='chromium'?{args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']}:{headless:process.env.QA_HEADED!=='1'});
  const rows=[];
  try{
    for(const width of [1280,390]){
      const height=width===390?844:900;
      const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1,hasTouch:width===390});
      const errors=[];page.on('pageerror',e=>errors.push(e.message));
      try {
        await page.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded',timeout:45000});
        await page.getByRole('navigation',{name:'Primary'}).getByRole('button',{name:'Imaging',exact:true}).click({timeout:30000});
        await page.getByRole('heading',{name:'Imaging academy',exact:true}).waitFor({timeout:30000});
        await page.getByRole('button',{name:/eFAST: probe windows and trauma decisions/i}).click();
        await page.getByRole('button',{name:'Start or resume lessons'}).click();
        await page.getByRole('heading',{name:'Map the eFAST windows onto the patient'}).waitFor();
        const media=page.locator('.img-correlation-frame');
        await media.locator('video').waitFor({timeout:30000});
        const video=media.locator('video');
        const src=await video.locator('source[type="video/mp4"]').getAttribute('src');
        assert.ok(src&&src.includes('fast-ruq-positive.mp4'),'real RUQ video should be selected, not generated motion');
        const fetchMedia=await page.request.get('http://127.0.0.1:8765/imaging/real/fast-ruq-positive.jpg');
        assert.equal(fetchMedia.status(),200,'the genuine RUQ poster must be served');
        await page.getByRole('button',{name:'Still',exact:true}).click();
        await media.locator('img').waitFor();
        await page.getByRole('button',{name:'Motion',exact:true}).click();
        await video.waitFor({timeout:15000});
        await page.locator('.imc-model-viewport').waitFor({timeout:30000});
        const model=page.locator('.imc-model-viewport canvas');
        await model.or(page.getByText('3D reference anatomy unavailable.')).first().waitFor({timeout:35000});
        assert.equal(await page.getByText('Spinal epidural abscess',{exact:false}).count(),0,'wrong reference anatomy on eFAST');
        await page.screenshot({path:`${OUT}/${engine}-${width}-eFAST.png`,fullPage:false});
        await page.locator('.img-check-answers button').first().click();
        await page.getByText('Correct — chapter recorded').waitFor();
        await page.getByRole('button',{name:'Next chapter'}).click();
        await page.getByRole('heading',{name:'Fluid patterns and false negatives'}).waitFor();
        const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
        assert.equal(overflow,false,'horizontal overflow at '+width);
        assert.deepEqual(errors,[],'uncaught errors at '+width);
        rows.push({engine,width,passed:true});
      }catch(e){
        await page.screenshot({path:`${OUT}/${engine}-${width}-failure.png`}).catch(()=>{});
        rows.push({engine,width,passed:false,error:String(e),runtimeErrors:errors});
      }finally{await page.close();}
    }
  }finally{await browser.close();writeFileSync(`${OUT}/results-${engine}.json`,JSON.stringify(rows,null,2));}
  console.log(JSON.stringify(rows,null,2));
  if(rows.some(x=>!x.passed))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
