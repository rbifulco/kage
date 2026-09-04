import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import vm from 'node:vm';
import {normalizeSpatialReviewDiscovery} from '@alterno-dev/spatial-review';
const baseline='4399487d2fb42bce39c7b032fbbb50d230bf4f0b';
test('ordinary page and original public assets exactly preserve clean source',()=>{
 const tracked=execFileSync('git',['ls-tree','-r','--name-only',baseline],{encoding:'utf8'}).trim().split('\n');
 for(const file of tracked.filter(f=>f!=='.gitignore'))assert.deepEqual(fs.readFileSync(file),execFileSync('git',['show',`${baseline}:${file}`]),file);
});
test('shipped and generated inline scripts parse',()=>{
 for(const file of ['index.html','spatial-review.html']){
  for(const m of fs.readFileSync(file,'utf8').matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))new vm.Script(m[1],{filename:file});
 }
});
test('static discovery resolves within existing project path',()=>{
 const value=normalizeSpatialReviewDiscovery(JSON.parse(fs.readFileSync('.well-known/spatial-review.json','utf8')),'https://rbifulco.github.io/kage/.well-known/spatial-review.json');
 assert.equal(value.websiteUrl,'https://rbifulco.github.io/kage/');
 assert.equal(new URL(value.liveCapture).pathname,'/kage/spatial-review.html');
 assert.equal(value.capabilities,undefined); // No new public authorization-policy advertisement.
});
test('ordinary route carries no review work; capture uses compatible shared Three',()=>{
 assert(!fs.readFileSync('index.html','utf8').includes('review/capture.js'));
 const capture=fs.readFileSync('spatial-review.html','utf8');
 assert(capture.includes('review/capture.js'));
 assert(capture.indexOf('window.__kageCapture.install')>capture.lastIndexOf('function start()'));
 assert(!capture.slice(capture.lastIndexOf('function start()')).includes('queue();'));
 assert(!capture.includes('initPost(); buildCards(); buildCardCloth();'));
 const lock=JSON.parse(fs.readFileSync('package-lock.json','utf8'));
 assert.equal(lock.packages['node_modules/@alterno-dev/spatial-review'].version,'0.7.0');
 assert.equal(lock.packages['node_modules/three'].version,'0.160.1');
 assert(lock.packages['node_modules/@alterno-dev/spatial-review'].resolved.startsWith('https://registry.npmjs.org/'));
});
test('navigation conversion preserves authoritative Catmull–Rom camera and aim spans',async()=>{
 globalThis.window={};const {navigation}=await import('../src/capture.js');
 const THREE=await import('three');
 const legacy={console};vm.runInNewContext(fs.readFileSync('secret-pathways-assets/three.min.js','utf8'),legacy);
 assert.equal(legacy.THREE.REVISION,'149');
 const original=fs.readFileSync('index.html','utf8');
 const CAM=vm.runInNewContext(original.match(/const CAM = (\[[\s\S]*?\n\]);/)[1]);
 const nav=navigation(CAM,[0,100,250,350,500,600]);
 for(const slot of ['p','t']){
  const rail=new legacy.THREE.CatmullRomCurve3(CAM.map(x=>new legacy.THREE.Vector3(...x[slot])),false,'catmullrom',.42);
  nav.segments.forEach((segment,i)=>{
   const points=(slot==='p'?segment.camera:segment.aim.curve).points;
   const curve=new THREE.CubicBezierCurve3(...points.map(x=>new THREE.Vector3(...x.position)));
   for(const u of [0,.2,.5,.8,1])assert(curve.getPoint(u).distanceTo(rail.getPoint((i+u)/5))<1e-10);
   assert.equal(points[1].editable,false);assert.equal(points[2].editable,false);
   assert.equal(points[0].stopId,nav.stops[i].id);assert.equal(points[3].stopId,nav.stops[i+1].id);
  });
 }
 assert.deepEqual(navigation(CAM,[0,100,250,350,500,600]),nav);
 const replacement=structuredClone(CAM);replacement[1].p[0]+=1;
 const updated=navigation(replacement,[0,100,250,350,500,600]);
 assert.equal(updated.stops[1].id,nav.stops[1].id);assert.equal(updated.stops[1].camera[0],CAM[1].p[0]+1);
});
