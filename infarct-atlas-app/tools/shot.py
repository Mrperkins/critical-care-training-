import asyncio,sys,urllib.parse,json
from playwright.async_api import async_playwright
async def main(f,views,out,hide='',d='0.3',pal=''):
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']);pg=await b.new_page(viewport={'width':1400,'height':900})
        errs=[];pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None);pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.goto('http://127.0.0.1:8811/tools/view.html?'+urllib.parse.urlencode({'f':f,'v':views,'hide':hide,'d':d,'pal':pal}));await pg.wait_for_function('document.title=="done"',timeout=240000)
        await pg.screenshot(path=out);print(await pg.evaluate('JSON.stringify(window.leg||[])'));print('ctr',await pg.evaluate('JSON.stringify(window.ctr)'),errs[:3]);await b.close()
asyncio.run(main(*sys.argv[1:]))
