import { chromium } from 'playwright';
import fs from 'node:fs/promises';
const tag=process.argv[2]||'baseline';
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--disable-dev-shm-usage']});
const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1,reducedMotion:'reduce'});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await fs.mkdir('.evidence',{recursive:true});
try{
 await page.goto('http://127.0.0.1:4311/?shot=0&q=high&adapt=0&dpr=1',{waitUntil:'load'});
 await page.waitForFunction(()=>window.__kage?.scene && document.querySelector('#pre').classList.contains('done'),{timeout:90000});
 await page.waitForTimeout(1500);
 const initial=await page.evaluate(()=>({readyMs:performance.now(),fallback:__kage.fallback||false,three:THREE.REVISION,meshes:(()=>{let n=0;__kage.scene.traverse(o=>{if(o.isMesh)n++});return n})(),camera:__kage.camera.position.toArray(),width:document.documentElement.scrollWidth,viewport:innerWidth,requests:performance.getEntriesByType('resource').map(x=>x.name)}));
 await page.screenshot({path:`.evidence/${tag}-hero.png`});
 const t=Date.now();await page.locator('a.nav-link[href="#gate"]').click();await page.waitForTimeout(1500);
 const interaction=await page.evaluate(()=>({scroll:scrollY,camera:__kage.camera.position.toArray(),active:[...document.querySelectorAll('.nav-link.on')].map(x=>x.getAttribute('href'))}));
 interaction.wallMs=Date.now()-t;await page.screenshot({path:`.evidence/${tag}-gate.png`});
 await fs.writeFile(`.evidence/${tag}.json`,JSON.stringify({initial,interaction,errors},null,2));console.log(JSON.stringify({initial,interaction,errors}));
}finally{await browser.close();}
