import * as THREE from 'three';
import {SceneAssetRegistry, attachSceneAssetRegistryBridge, createSpatialReviewEditorAuthorization} from '@alterno-dev/spatial-review';
window.THREE=THREE;
const records=[];
const sourceNotes=[];
function reviewRecord(root,id,name,factory,owner,assetId=id){
 const appearanceOnly=['buildMoon','buildForeground','buildWordmark'].includes(factory)||['sky','hall-spill','hall-mist'].includes(id)||id.startsWith('ridge-');
 root.name=root.name||name;
 if(appearanceOnly)name+=' · Asset appearance';
 records.push({root,visible:!appearanceOnly,order:id==='torii'?0:id==='sanmon'?1:appearanceOnly?1000+records.length:10+records.length,actorId:`kage-${id}`,assetId:`kage-${assetId}`,name: name+(id.startsWith('lantern-')||id.startsWith('maple-')||id.startsWith('rock-')||id.startsWith('foreground-')||id.startsWith('ridge-')?' · '+id:''),sourceRef:`index.html#${factory}`,category:factory==='buildMaple'||factory==='buildRocks'?'Garden':factory==='buildForeground'||factory==='buildWordmark'?'Foreground':owner==='world'?'World context':'Architecture',parentAssemblyId:owner==='world'?undefined:`kage-${owner}`});
}
function reviewBakeMaple(inst){
 const m=new THREE.Matrix4(),offset=new THREE.Matrix4();
 for(let i=0;i<inst.count;i++){
  inst.getMatrixAt(i,m);const e=m.elements,ph=e[12]*1.7+e[14]*1.3+e[13]*.7;
  offset.makeTranslation(Math.sin(ph)*.055,0,Math.cos(ph*1.3)*.045);
  inst.setMatrixAt(i,m.multiply(offset));
 }
 inst.instanceMatrix.needsUpdate=true;inst.material.onBeforeCompile=()=>{};
}
function reviewBakeForeground(mesh,sway){
 const geo=mesh.geometry.clone(),p=geo.attributes.position,uv=geo.attributes.uv;
 for(let i=0;i<p.count;i++){const h=uv.getY(i),ph=p.getX(i)*.3;p.setXYZ(i,p.getX(i)+Math.sin(ph)*sway*h*h,p.getY(i)+Math.cos(ph*1.7)*sway*.35*h*h,p.getZ(i));}
 geo.computeVertexNormals();mesh.geometry.dispose();mesh.geometry=geo;mesh.material.onBeforeCompile=()=>{};
 const source=mesh.material.map.image,c=document.createElement('canvas');c.width=source.width;c.height=source.height;
 const ctx=c.getContext('2d');ctx.drawImage(source,0,0);const im=ctx.getImageData(0,0,c.width,c.height);
 const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
 for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)im.data[(y*c.width+x)*4+3]*=smooth(0,.11,x/(c.width-1))*(1-smooth(.89,1,x/(c.width-1)))*smooth(0,.07,1-y/(c.height-1));
 ctx.putImageData(im,0,0);mesh.material.map.image=c;mesh.material.map.needsUpdate=true;
}
const point=(v)=>v.toArray();
export function navigation(CAM,anchors){
 const keys=['hero','sanmon','gardens','craft','afterlight','footer'];
 const names=['Arrival','The Sanmon','Secret gardens','Craft','Afterlight','Farewell'];
 const stops=CAM.map((c,i)=>({id:keys[i],name:names[i],camera:c.p,target:c.t,fov:c.fov,sourceRef:`index.html#CAM[${i}]`}));
 // A uniform Catmull–Rom span is exactly a cubic Bézier with these tangents.
 // Derived handles stay read-only. Only canonical knots map to editable CAM inputs.
 const curve=(i,slot)=>{
  const p=CAM.map(c=>new THREE.Vector3(...c[slot])),a=p[i],b=p[i+1];
  const previous=p[i-1]||a.clone().multiplyScalar(2).sub(b),next=p[i+2]||b.clone().multiplyScalar(2).sub(a);
  const out=a.clone().add(b.clone().sub(previous).multiplyScalar(.42/3));
  const incoming=b.clone().sub(next.clone().sub(a).multiplyScalar(.42/3));
  return {kind:'cubic-bezier',points:[
   {id:`${keys[i]}-${slot}`,role:'stop',stopId:keys[i],position:point(a),sourceRef:`index.html#CAM[${i}].${slot}`},
   {id:`${keys[i]}-${slot}-derived-out`,role:'control-out',position:point(out),editable:false,sourceRef:'index.html#buildRig'},
   {id:`${keys[i+1]}-${slot}-derived-in`,role:'control-in',position:point(incoming),editable:false,sourceRef:'index.html#buildRig'},
   {id:`${keys[i+1]}-${slot}`,role:'stop',stopId:keys[i+1],position:point(b),sourceRef:`index.html#CAM[${i+1}].${slot}`}
  ]};
 };
 return {id:'kage-night-walk',name:'Kyoto temple · six chapter walk',sourceRef:'index.html#CAM',stops,segments:stops.slice(0,-1).map((s,i)=>({id:`${keys[i]}--${keys[i+1]}`,fromStopId:s.id,toStopId:keys[i+1],weight:Math.max(1,anchors[i+1]-anchors[i]),lensStart:0,camera:curve(i,'p'),aim:{kind:'curve',curve:curve(i,'t')},sourceRef:'index.html#buildRig'}))};
}
async function install(runtime){
 const started=performance.now();
 const registry=new SceneAssetRegistry(__BUILD_ID__);
 for(const [id,name,sourceRef] of [['approach','Mountain approach','index.html#buildShell'],['sanctuary','Sanmon sanctuary','index.html#buildTemple']])registry.registerAssembly({assemblyId:`kage-${id}`,name,sourceRef,localTransform:{position:[0,0,0],rotation:[0,0,0],scale:[1,1,1]}});
 const materials=new Set(),textures=new Set(),alphaMaps=new Map();
 // Shader-only simulation is outside the explicit roots. Supported source textures
 // stay canvas-backed and become live texture resources on representation request.
 for(const entry of records){
  entry.root.traverse(o=>{for(const m of (Array.isArray(o.material)?o.material:o.material?[o.material]:[])){
   if((m.transparent||m.alphaTest>0)&&m.map?.image){
    let alpha=alphaMaps.get(m.map);
    if(!alpha){const source=m.map.image,mask=document.createElement('canvas');mask.width=source.width;mask.height=source.height;
     const ctx=mask.getContext('2d');ctx.drawImage(source,0,0);ctx.globalCompositeOperation='source-in';ctx.fillStyle='white';ctx.fillRect(0,0,mask.width,mask.height);
     const opaque=document.createElement('canvas');opaque.width=mask.width;opaque.height=mask.height;const out=opaque.getContext('2d');out.fillStyle='black';out.fillRect(0,0,opaque.width,opaque.height);out.drawImage(mask,0,0);
     alpha=m.map.clone();alpha.source=new THREE.Source(opaque);alpha.colorSpace=THREE.NoColorSpace;alpha.name='Source alpha coverage';alpha.needsUpdate=true;alphaMaps.set(m.map,alpha);
    }m.alphaMap=alpha;
   }
   materials.add(m);if(!m.name)m.name=`${entry.sourceRef.split('#')[1]}.${o.name||o.type}`;
   for(const value of Object.values(m))if(value?.isTexture){textures.add(value);for(const key of ['sourceRef','requestUrl']){const s=value.userData?.[key];if(s&&(/(?:token|signature|credential|session|key)=/i.test(s)||/https?:\/\/[^/]*@/.test(s)))throw Error('Unsafe texture reference');}}
  }});
  registry.register(entry);
 }
 registry.registerNavigationSequence(navigation(runtime.CAM,runtime.anchors));
 const authorization=createSpatialReviewEditorAuthorization({allowOfficialEditor:true,allowedOrigins:[],allowLoopbackPeers:['localhost','127.0.0.1','[::1]'].includes(location.hostname)});
 const detach=attachSceneAssetRegistryBridge(registry,{authorization,maxGeometryBytes:64*1024*1024,maxConcurrentAssetRequests:1,maxInFlightBytes:64*1024*1024,maxQueuedAssetRequests:24});
 const dispose=()=>{
  detach();runtime.scene.traverse(o=>{o.geometry?.dispose();for(const m of (Array.isArray(o.material)?o.material:o.material?[o.material]:[])){
   materials.add(m);for(const value of Object.values(m))if(value?.isTexture)textures.add(value);
   for(const uniform of Object.values(m.uniforms||{}))if(uniform.value?.isTexture)textures.add(uniform.value);
  }});
  for(const m of materials)m.dispose();for(const t of textures)t.dispose();runtime.renderer.dispose();runtime.renderer.forceContextLoss();
  if(window.__kageReview){window.__kageReview.ready=false;window.__kageReview.disposed=true;}
 };
 addEventListener('pagehide',dispose,{once:true});
 window.__kageReview={registry,records,buildId:__BUILD_ID__,ready:true,setupMs:performance.now()-started,dispose,sourceNotes};
}
window.__kageCapture={reviewRecord,reviewBakeMaple,reviewBakeForeground,install};
