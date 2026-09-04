import {chromium} from 'playwright';
import fs from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1,reducedMotion:'reduce'});
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text().slice(0,400))});
try{
 await page.goto('http://127.0.0.1:4311/spatial-review.html?shot=0&q=high&adapt=0&dpr=1',{waitUntil:'load'});
 await page.waitForFunction(()=>window.__kageReview?.ready,{timeout:90000});
 const result=await page.evaluate(async()=>{
  const r=__kageReview.registry,t=performance.now(),index=r.toReviewIndex('review',false,true,true,true),catalogMs=performance.now()-t;
  const a=performance.now(),asset=r.toAsset('kage-torii','review'),assetMs=performance.now()-a;
  const texture=asset.materials.flatMap(m=>m.maps||[])[0];
  const resource=texture?await r.readTextureResource(texture.resourceId,16*1024*1024):null;
  const bitmap=resource?await createImageBitmap(new Blob([resource.bytes],{type:resource.contentType})):null;const decoded=bitmap?{width:bitmap.width,height:bitmap.height}:null;bitmap?.close();
 const alphaIsolation=__kageReview.records.filter(x=>x.actorId.startsWith('kage-foreground-')).every(x=>x.root.material.map.source!==x.root.material.alphaMap.source);
 const scene=r.toScene(true,true);
 const profiles={};for(const id of ['kage-sanmon','kage-maple-design-71','kage-foreground-grassNear']){const start=performance.now(),a=r.toAsset(id,'review');profiles[id]={ms:performance.now()-start,bytes:JSON.stringify(a).length,geometries:a.geometries.length,maps:a.materials.flatMap(m=>m.maps||[]).map(m=>m.slot)};}
  return {readyMs:performance.now(),setupMs:__kageReview.setupMs,jobTimings:__kageCapture.jobTimings,anchors:__kage.anchors(),buildId:__kageReview.buildId,catalogMs,assetMs,index,scene,asset,profiles,decoded,alphaIsolation,resource:resource?{...resource,bytes:resource.bytes?.byteLength}:null,texture,roots:__kageReview.records.map(x=>({id:x.actorId,sourceRef:x.sourceRef,children:x.root.children.length})),camera:__kage.camera.position.toArray()};
 });
 await fs.writeFile('.evidence/capture.json',JSON.stringify({...result,errors},null,2));
 console.log(JSON.stringify({readyMs:result.readyMs,setupMs:result.setupMs,catalogMs:result.catalogMs,assetMs:result.assetMs,decoded:result.decoded,alphaIsolation:result.alphaIsolation,jobTimings:result.jobTimings,profiles:result.profiles,actors:result.scene.actors.length,assemblies:result.scene.assemblies?.length,assetGeometry:result.asset.geometries.length,assetMaterials:result.asset.materials.length,resource:result.resource,errors}));
}finally{await browser.close();}
