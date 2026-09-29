import asyncio,sys,json,os
from playwright.async_api import async_playwright
# usage: app-shot.py out_prefix W H steps_json
async def main(prefix,W,H,steps):
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        pg=await b.new_page(viewport={'width':int(W),'height':int(H)})
        errs=[];pg.on('console',lambda m:errs.append(m.type+': '+m.text[:300]) if m.type in('error','warning') else None);pg.on('pageerror',lambda e:errs.append('PAGE '+str(e)[:400]))
        await pg.route('**/fonts.googleapis.com/**',lambda r:r.abort());await pg.route('**/fonts.gstatic.com/**',lambda r:r.abort())
        await pg.goto('file:///home/claude/mi3d/dist/index.html',wait_until='commit',timeout=120000)
        await pg.wait_for_timeout(9000)
        for i,st in enumerate(json.loads(steps)):
            if st.get('js'): await pg.evaluate(st['js'])
            if st.get('click'): await pg.click(st['click'])
            await pg.wait_for_timeout(st.get('wait',6000))
            await pg.screenshot(path=f"{prefix}{i}.png",timeout=180000);print('shot',i,flush=True)
        print('ERRS',json.dumps(errs[:15],indent=0));await b.close()
asyncio.run(main(*sys.argv[1:]))
