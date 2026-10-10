import { chromium, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
const out = path.resolve('qa-organ-flow');
await fs.mkdir(out,{recursive:true});
const server=spawn('python3',['-m','http.server','8887','--bind','127.0.0.1','--directory',path.resolve('dist/pub')],{stdio:'ignore'});
const sleep=(n)=>new Promise(r=>setTimeout(r,n));
let browser;
try {
  await sleep(1000);
  browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-webgl']});
  for(const device of [{name:'desktop',width:1440,height:900},{name:'phone',width:390,height:844}]){
    const context=await browser.newContext({viewport:{width:device.width,height:device.height},deviceScaleFactor:1});
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('console',msg => { if(msg.type()==='error' && /Shader Error|WebGLProgram|VALIDATE_STATUS/i.test(msg.text())) errors.push(msg.text()); });
    for(const module of ['heart','vent']){
      await page.goto('http://127.0.0.1:8887/?module='+module+'&mode=explore',{waitUntil:'domcontentloaded',timeout:30000});
      if(device.name==='phone'){
        const scene=page.getByRole('button',{name:'Scene',exact:true}).first();
        if(await scene.count()) await scene.click();
      }
      const canvas=page.locator('.scene-pane canvas').first();
      await expect(canvas).toBeVisible({timeout:30000});
      if(module==='heart'){
        await expect(page.getByLabel('Blood flow')).toBeAttached({timeout:30000});
        await page.waitForFunction(() => !!window.__heartFlowScene?.getObjectByName('bulk-blood-svc'),null,{timeout:30000});
        const active = await page.evaluate(() => {
          const mesh=window.__heartFlowScene?.getObjectByName('bulk-blood-svc');
          return !!mesh && mesh.material.depthTest===false && mesh.material.uniforms.uActivity.value>0;
        });
        if(!active) throw new Error('Cardiac bulk blood column is not visible or not driven by physiology');
        if(device.name==='desktop'){
          await page.getByLabel('Blood flow').selectOption('particles');
          await page.getByLabel('Blood flow').selectOption('both');
          await page.getByLabel('Blood flow').selectOption('volume');
        }
      } else {
        // LungScene registers its R3F scene for diagnostics; verify the new
        // fluid column actually exists in the rendered 3D scene.
        await page.waitForFunction(() => {
          const scene=window.__three?.scene;
          return !!scene?.getObjectByName('bulk-air-through-ett-and-trachea');
        },null,{timeout:30000});
      }
      await page.waitForTimeout(1500);
      await page.screenshot({path:path.join(out,module+'-bulk-flow-'+device.name+'.png'),fullPage:true,timeout:25000});
      if(errors.length) throw new Error(module+' '+device.name+': '+errors.join('; '));
    }
    await context.close();
  }
}finally{await browser?.close();server.kill('SIGTERM');}
