/**
 * Browser acceptance criteria for the Unified Cardiac Atlas (Issue #39).
 * Captures ACTUAL running 3D canvases. Fails if mobile mounts two GPU scenes,
 * or the desktop split view is not two real side-by-side rendered canvases.
 */
import { chromium, expect } from '@playwright/test';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
const out=path.resolve('qa-cardiac-atlas');
await fs.mkdir(out,{recursive:true});
const server=spawn('python3',['-m','http.server','8899','--bind','127.0.0.1','--directory',path.resolve('dist/pub')],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let browser;
try{
  await sleep(1000);
  browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-webgl']});
  for(const d of [{name:'desktop',width:1440,height:900},{name:'mobile',width:390,height:844}]){
    const cx=await browser.newContext({viewport:{width:d.width,height:d.height},deviceScaleFactor:1});
    const page=await cx.newPage();
    const issues=[];
    page.on('pageerror',e=>issues.push(e.message));
    page.on('console',msg=>{if(msg.type()==='error'&&/Shader Error|WebGLProgram|VALIDATE_STATUS/i.test(msg.text())) issues.push(msg.text());});
    await page.goto('http://127.0.0.1:8899/?module=heart',{waitUntil:'domcontentloaded',timeout:30000});
    const panel=page.getByRole('region',{name:'Unified 3D cardiac atlas'});
    await expect(panel).toBeAttached({timeout:30000});
    if(d.name==='mobile'){
      // Lessons visible by default while WebGL is unmounted.
      await expect(page.locator('.heart-scene-pane canvas')).toHaveCount(0);
      await panel.getByRole('button',{name:'3D split view'}).click();
      await page.getByRole('button',{name:'Scene',exact:true}).first().click();
      await expect(page.getByRole('img',{name:'Interactive intact 3D cardiac anatomy'})).toBeVisible({timeout:35000});
      if(await page.locator('.heart-scene-pane canvas').count()!==1)throw Error('Mobile split must mount exactly one 3D canvas');
      await page.screenshot({path:path.join(out,'atlas-mobile-whole.png'),fullPage:false,timeout:45000});
      await page.getByRole('button',{name:'Lessons',exact:true}).first().click();
      await panel.getByRole('button',{name:'Conduction',exact:true}).click();
      await page.getByRole('button',{name:'Scene',exact:true}).first().click();
      await expect(page.getByRole('img',{name:'Interactive 3D cutaway heart and electrical conduction'})).toBeVisible({timeout:35000});
      if(await page.locator('.heart-scene-pane canvas').count()!==1)throw Error('Mobile conduction mode must mount exactly one 3D canvas');
      await page.screenshot({path:path.join(out,'atlas-mobile-conduction.png'),fullPage:false,timeout:45000});
    }else{
      await expect(panel).toBeVisible();
      await panel.getByRole('button',{name:'Whole heart'}).click();
      await expect(page.getByRole('img',{name:'Interactive intact 3D cardiac anatomy'})).toBeVisible({timeout:30000});
      await page.waitForTimeout(1500);
      await page.screenshot({path:path.join(out,'atlas-desktop-whole.png'),fullPage:false,timeout:45000});
      await panel.getByRole('button',{name:'3D split view'}).click();
      const views=page.locator('.heart-atlas-views.is-dual .heart-atlas-viewport');
      await expect(views).toHaveCount(2);
      const canvases=views.locator('canvas');
      await expect(canvases).toHaveCount(2,{timeout:30000});
      const rects=await Promise.all([views.nth(0).boundingBox(),views.nth(1).boundingBox()]);
      if(!rects[0]||!rects[1]||rects[1].x<rects[0].x+rects[0].width-3)throw Error('Split view is not two side-by-side real 3D panes');
      await page.waitForTimeout(2300);
      await page.screenshot({path:path.join(out,'atlas-desktop-split.png'),fullPage:false,timeout:45000});
      await panel.locator('summary').filter({hasText:'Verified anatomy layers'}).click();
      await panel.getByRole('checkbox',{name:/Pericardial sac/}).check();
      await expect(panel.getByLabel('Pericardial sac opacity')).toBeVisible();
      await page.screenshot({path:path.join(out,'atlas-desktop-pericardial-surface.png'),fullPage:false,timeout:45000});
      // MI Locator must preserve functionality and identify the actual source.
      await panel.getByRole('button',{name:/Explore MI Locator/}).click();
      await expect(page.locator('main[aria-label="Coronaries and ECG"]')).toBeVisible({timeout:35000});
      await page.locator('.mi-canonical-status').waitFor({state:'visible',timeout:110000});
      const status=await page.locator('.mi-canonical-status').innerText();
      console.log('MI canonical registration:',status);
      await page.screenshot({path:path.join(out,'atlas-desktop-mi-locator.png'),fullPage:false,timeout:45000});
      if(!status.includes('Shared high-detail 3D heart'))throw Error('MI Locator did not validate canonical mesh registration: '+status);
    }
    if(issues.length)throw Error(d.name+' WebGL/browser errors: '+issues.join('; '));
    await cx.close();
  }
}finally{await browser?.close();server.kill('SIGTERM');}
