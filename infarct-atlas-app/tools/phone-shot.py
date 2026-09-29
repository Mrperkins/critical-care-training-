import asyncio,sys,json
from playwright.async_api import async_playwright
async def main(prefix,steps):
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        ctx=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,is_mobile=True,has_touch=True)
        pg=await ctx.new_page();errs=[]
        pg.on('pageerror',lambda e:errs.append('PAGE '+str(e)[:300]));pg.on('console',lambda m:errs.append(m.text[:200]) if m.type=='error' else None)
        await pg.route('**/fonts.g*/**',lambda r:r.abort())
        await pg.goto('file:///home/claude/mi3d/dist/index.html',wait_until='commit',timeout=120000);await pg.wait_for_timeout(9000)
        for i,st in enumerate(json.loads(steps)):
            if st.get('js'): await pg.evaluate(st['js'])
            if st.get('tap'): await pg.tap(st['tap'])
            await pg.wait_for_timeout(st.get('wait',5000))
            await pg.screenshot(path=f"{prefix}{i}.png",full_page=st.get('full',False),timeout=200000);print('shot',i,flush=True)
        print('ERRS',[e for e in errs if 'ERR_FAILED' not in e][:10]);await b.close()
asyncio.run(main(*sys.argv[1:]))
