/** Independent Chromium QA of the built application. Produces reviewable WebGL screenshots. */
const { chromium, firefox, webkit } = require('@playwright/test');
const engine=process.env.QA_BROWSER || 'chromium';
const browserType={chromium,firefox,webkit}[engine];
if(!browserType) throw new Error('Unknown QA_BROWSER '+engine);
const { mkdirSync, writeFileSync } = require('node:fs');
const assert = require('node:assert/strict');
const out = 'browser-qa';
mkdirSync(out, { recursive: true });
(async () => {
  const browser = await browserType.launch(engine==='chromium'?{args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']}:{headless:process.env.QA_HEADED!=='1'});
  const results=[];
  try {
    for (const [width,height] of [[1440,1000],[1024,900],[390,844],[320,740]]) {
      const page = await browser.newPage({ viewport:{width,height}, deviceScaleFactor:1, hasTouch:width<=1024 });
      const errors=[]; page.on('pageerror',e=>errors.push(e.message));
      try {
        await page.goto('http://127.0.0.1:8765/?module=vent&mode=sim');
        await page.locator('.equipment-workbench').waitFor();
        await page.getByLabel('Patient scenario').selectOption('ards');
        if(width<=1024) await page.getByRole('button',{name:'Patient',exact:true}).click();
        await page.locator('.equipment-patient-3d canvas').waitFor({timeout:30000});
        await page.locator('.equipment-patient-3d').scrollIntoViewIfNeeded();
        await page.getByRole('button',{name:'Focus lungs',exact:true}).click();
        await page.waitForTimeout(1800); // camera's damped transition, not an assertion delay
        await page.screenshot({path:`${out}/${width}-lungs.png`});
        await page.getByRole('button',{name:'Inspect airway anatomy',exact:true}).click();
        await page.waitForTimeout(1800);
        const frames=await page.evaluate(()=>new Promise(resolve=>{let count=0;const start=performance.now();const sample=()=>{count++;if(performance.now()-start<2000)requestAnimationFrame(sample);else resolve({fps:+(count*1000/(performance.now()-start)).toFixed(1)});};requestAnimationFrame(sample);}));
        await page.screenshot({path:`${out}/${width}-airway.png`});
        await page.getByRole('button',{name:'Hide airway anatomy',exact:true}).click();
        await page.getByRole('button',{name:'Whole bedside',exact:true}).click();
        await page.waitForTimeout(1800);
        await page.screenshot({path:`${out}/${width}-bedside.png`});
        await page.getByRole('button',{name:'Disconnect 3D circuit',exact:true}).click();
        assert.equal(await page.evaluate(()=>window.__vent.circuitFault),'disconnect');
        await page.getByRole('button',{name:'Reconnect 3D circuit',exact:true}).click();
        assert.equal(await page.evaluate(()=>window.__vent.circuitFault),'none');
        await page.getByLabel('Patient scenario').selectOption('leak');
        await page.getByRole('button',{name:'Disconnect 3D circuit',exact:true}).click();
        assert.equal(await page.evaluate(()=>window.__vent.circuitFault),'both');
        await page.getByRole('button',{name:'Reconnect 3D circuit',exact:true}).click();
        assert.equal(await page.evaluate(()=>window.__vent.circuitFault),'cuffLeak');
        await page.getByLabel('Patient scenario').selectOption('ards');
        await page.getByRole('button',{name:'Inspect ventilator',exact:true}).click();
        await page.waitForTimeout(1800);
        await page.screenshot({path:`${out}/${width}-equipment.png`});
        await page.getByRole('button',{name:'Operate ventilator controls',exact:true}).click();
        await page.locator('.equipment-console').scrollIntoViewIfNeeded();
        const before=await page.evaluate(()=>window.__vent.m.s.vt);
        await page.getByRole('button',{name:'Increase Tidal volume',exact:true}).click();
        assert.equal(await page.evaluate(()=>window.__vent.m.s.vt),before);
        await page.getByRole('button',{name:'Confirm settings',exact:true}).click();
        assert.ok(Math.abs(await page.evaluate(()=>window.__vent.m.s.vt)-before-.01)<1e-6);
        await page.screenshot({path:`${out}/${width}-console.png`});
        if(width<=1024) await page.getByRole('button',{name:'Feedback',exact:true}).click();
        await page.getByLabel('Your clinical reasoning').fill('Compare ventilation with pressure and perfusion after this change.');
        await page.getByRole('button',{name:'Record reassessment',exact:true}).waitFor();
        await page.waitForFunction(()=>!document.querySelector('.equipment-reassessment .primary').disabled, undefined, {timeout:30000});
        await page.getByRole('button',{name:'Record reassessment',exact:true}).click();
        assert.ok(await page.getByText('Scenario debrief · 1 observations').isVisible());
        await page.locator('.equipment-reassessment').scrollIntoViewIfNeeded();
        await page.screenshot({path:`${out}/${width}-debrief.png`,fullPage:true});
        const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
        assert.equal(overflow,false,`horizontal page overflow at ${width}`);
        assert.deepEqual(errors,[],`runtime errors at ${width}`);
        results.push({engine,width,height,passed:true,frameScheduling:frames});
      } catch(e) {
        await page.screenshot({path:`${out}/${width}-failure.png`});
        results.push({engine,width,height,passed:false,error:String(e),runtimeErrors:errors});
      }
      await page.close();
    }
  } finally { await browser.close(); writeFileSync(`${out}/results.json`,JSON.stringify(results,null,2)); }
  console.log(JSON.stringify(results,null,2));
  if(results.some(r=>!r.passed)) process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
