import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {build} from 'esbuild';
const original=await fs.readFile('index.html','utf8');
let html=original;
function once(from,to){if(!html.includes(from)||html.indexOf(from)!==html.lastIndexOf(from))throw Error('Source hook changed: '+from.slice(0,100));html=html.replace(from,to);}
function factory(name,edit){
 const match=html.match(new RegExp('^function '+name+'\\(', 'm'));if(!match)throw Error(name);const start=match.index;
 const open=html.indexOf('{',start);let depth=1,i=open+1,quote='',comment='';
 for(;i<html.length&&depth;i++){const c=html[i],n=html[i+1];if(comment){if(comment==='line'&&c==='\n')comment='';else if(comment==='block'&&c==='*'&&n==='/'){comment='';i++}continue}if(quote){if(c==='\\')i++;else if(c===quote)quote='';continue}if(c==='/'&&n==='/'){comment='line';i++;continue}if(c==='/'&&n==='*'){comment='block';i++;continue}if(c==='"'||c==="'"||c==='`'){quote=c;continue}if(c==='{')depth++;if(c==='}')depth--;}
 const body=html.slice(open+1,i-1);html=html.slice(0,open+1)+edit(body)+html.slice(i-1);
}
const record=(root,id,name,factory,owner='approach',asset=id)=>`reviewRecord(${root}, ${id}, ${JSON.stringify(name)}, '${factory}', '${owner}', ${asset});`;
const fixed=(root,id,name,factory,owner='approach',asset=id)=>record(root,JSON.stringify(id),name,factory,owner,JSON.stringify(asset));
const named=b=>b.replace(/g\.add\((\w+)\)/g,(_,v)=>`(${v}.name = ${v}.name || '${v}', g.add(${v}))`);
factory('buildShell',b=>b.replace('scene.add(m);',`scene.add(m); ${record('m',"'ridge-'+i",'Mountain ridge','buildShell','world')}`)+[
 fixed('sky','sky','Night sky','buildShell','world'),fixed('floor','court','Wet stone court','buildShell'),fixed('plat','podium','Hall podium','buildShell','sanctuary'),fixed('cope','coping','Podium coping','buildShell','sanctuary'),fixed('stair','flight','Forty-step approach','buildShell'),fixed('rail','cheeks','Stair side rails','buildShell'),"wallMat.name='buildShell.wallMat';floorMat.name='buildShell.floorMat';platMat.name='buildShell.platMat';"].join('\n'));
factory('buildTemple',b=>named(b)+fixed('g','sanmon','Sanmon hall','buildTemple','sanctuary')+fixed('spill','hall-spill','Hall light spill','buildTemple','sanctuary')+fixed('mist','hall-mist','Hall mist','buildTemple','world')+"[timber,post,gold,tileMat,paper,grid].forEach((m,i)=>m.name=['timber','post','gold','tileMat','paper','grid'][i]);");
factory('buildTorii',b=>named(b)+fixed('g','torii','Torii gate','buildTorii')+"lac.name='buildTorii.lac';gold.name='buildTorii.gold';cap.material.name='buildTorii.cap';");
factory('buildMoon',b=>b+fixed('disc','moon','Vermilion moon','buildMoon','world')+fixed('halo','moon-corona','Moon corona','buildMoon','world'));
factory('buildLantern',b=>named(b).replace('return g;',`${record('g',"'lantern-'+arguments[4]",'Stone lantern','buildLantern','approach',"'stone-lantern'")}stone.name='buildLantern.stone';dark.name='buildLantern.dark';paneMat.name='buildLantern.paneMat';return g;`));
factory('buildMaple',b=>b.replace('return g;',`${record('g',"'maple-'+arguments[4]",'Japanese maple','buildMaple','approach',"'maple-design-'+seed")}trunk.name='trunk';inst.name='leaf-canopy';leafMat.name='buildMaple.leafMat';reviewBakeMaple(inst);return g;`));
factory('buildRocks',b=>b.replace('scene.add(m);',`scene.add(m);${record('m',"'rock-placement-'+(i+1)",'Basalt garden rock','buildRocks')}`));
factory('buildForeground',b=>b.replace('WORLD.fg.push(m);',`WORLD.fg.push(m);reviewBakeForeground(m,L[7]);${record('m',"'foreground-'+L[0]",'Foreground layer','buildForeground')}`));
factory('buildWordmark',b=>b+fixed('group','wordmark','KAGE wordmark','buildWordmark'));
// IDs belong to authored call-site roles, never mutable placement coordinates.
const jobStart=html.indexOf('const JOBS = [');
let jobs=html.slice(jobStart),lanternCall=0,mapleCall=0;
const lanternRoles=["'court-east'","'court-west'","'stair-'+(i?'upper':'lower')+'-east'","'stair-'+(i?'upper':'lower')+'-west'"];
jobs=jobs.replace(/buildLantern\(([^;]+)\);/g,(_m,args)=>`buildLantern(${args}${lanternCall<2?',0':''},${lanternRoles[lanternCall++]});`);
jobs=jobs.replace(/buildMaple\(([^;]+)\);/g,(_m,args)=>`buildMaple(${args},'placement-${++mapleCall}');`);
if(lanternCall!==4||mapleCall!==5)throw Error('Authored placement call sites changed; update semantic role mapping.');
html=html.slice(0,jobStart)+jobs;
// The editor embeds capture at 1×1. Resolve only capture layout against a
// documented 1600×900 viewport so typography, moon and scroll weights are stable.
html=html.replace(/<style>([\s\S]*?)<\/style>/g,(_,css)=>'<style>'+css
 .replace(/(-?\d*\.?\d+)(svh|vh|vw)\b/g,(_m,n,unit)=>(Number(n)*(unit==='vw'?16:9))+'px')
 .replace(/@media\s*\(max-width:\s*(\d+)px\)/g,(_m,width)=>Number(width)>=1600?'@media all':'@media not all')
 +'\nhtml,body{width:1600px!important;min-width:1600px!important}html{height:900px!important}\n</style>');
once('const vpW = () => document.documentElement.clientWidth  || innerWidth;','const vpW = () => 1600;');
once('const vpH = () => document.documentElement.clientHeight || innerHeight;','const vpH = () => 900;');
once('<script src="secret-pathways-assets/three.min.js"></script>','<script src="review/capture.js"></script>');

// Capture alone gets deterministic random/time and no ordinary-page event machinery.
once("'use strict';", "'use strict';\nMath.random = mulberry32(20260904);\nconst {reviewRecord,reviewBakeMaple,reviewBakeForeground} = window.__kageCapture;");
factory('boot',b=>b.replace('wireReveals(); wireForegroundStages(); wireNav(); wireHeroExit(); wireFocus(); wireCursor();','').replace('const j = JOBS[i];','const j = JOBS[i], jobStart = performance.now();').replace('i++;',"(window.__kageCapture.jobTimings ||= []).push({name:j[0],ms:performance.now()-jobStart});i++;"));
once('initPost(); buildCards(); buildCardCloth();', '/* Capture does not allocate presentation-only post/card resources. */');
factory('start',()=>`
 resize(); RIG.intro=1; RIG.smooth=RIG.prog=0; WORD.reveal=1.2; clock=0; fadeIn=1;
 applyCamera(); updateWorld(0); scene.updateMatrixWorld(true);
 document.body.classList.remove('is-locked');preEl.classList.add('done');
 window.__kage = {RIG,WORLD,WORD,CAM,renderer,scene,camera,anchors:()=>anchors};
 window.__kageCapture.install({scene,camera,CAM,curveP,curveT,anchors:anchors.slice(),renderer});
`);
const inputs=[original,await fs.readFile('src/capture.js','utf8'),await fs.readFile('scripts/build.mjs','utf8'),await fs.readFile('package-lock.json','utf8')];
const revision=createHash('sha256').update(inputs.join('\n')).digest('hex').slice(0,20);
await fs.mkdir('review',{recursive:true});
await build({entryPoints:['src/capture.js'],outfile:'review/capture.js',bundle:true,format:'iife',minify:true,define:{__BUILD_ID__:JSON.stringify('kage-'+revision)}});
await fs.writeFile('spatial-review.html',html);
await fs.writeFile('.well-known/spatial-review.json',JSON.stringify({schema:'spatial-review-discovery/v1',version:1,websiteUrl:'../',name:'Kage — Kyoto night walk',liveCapture:'../spatial-review.html?shot=0&q=high&adapt=0&dpr=1'},null,2)+'\n');
console.log('Built capture '+revision+'; ordinary index unchanged: '+createHash('sha256').update(original).digest('hex'));
