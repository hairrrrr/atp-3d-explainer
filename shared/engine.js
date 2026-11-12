/* 场景层：程序化几何体 + 步骤切换。内容（文字/镜头/高亮）在 content/steps.js */
(function(){
'use strict';
const wrap = document.getElementById('canvas-wrap');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500);
const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true, preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
wrap.appendChild(renderer.domElement);
const labelRenderer = new THREE.CSS2DRenderer();
labelRenderer.domElement.style.position='absolute';
labelRenderer.domElement.style.inset='0';
labelRenderer.domElement.style.pointerEvents='none';
wrap.appendChild(labelRenderer.domElement);
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.dampingFactor = 0.08;
controls.minDistance = 4; controls.maxDistance = 60;

scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x202040, 0.85));
const dl = new THREE.DirectionalLight(0xffffff, 0.9); dl.position.set(10, 20, 15); scene.add(dl);
const dl2 = new THREE.DirectionalLight(0x88aaff, 0.35); dl2.position.set(-15, -5, -10); scene.add(dl2);

const V = (x,y,z)=>new THREE.Vector3(x,y,z);
const sphereGeo = new THREE.SphereGeometry(1, 24, 16);

// ---------- helpers ----------
function mat(color, o){ o=o||{}; return new THREE.MeshStandardMaterial(Object.assign({color, roughness:0.45, metalness:0.05, transparent:true, opacity:1}, o)); }
function ball(parent, pos, r, color, o){ const m=new THREE.Mesh(sphereGeo, mat(color,o)); m.scale.setScalar(r); m.position.copy(pos); parent.add(m); return m; }
function rod(parent, a, b, r, color, o){
  const d=new THREE.Vector3().subVectors(b,a), len=d.length();
  const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,len,12), mat(color,o));
  m.position.copy(a).addScaledVector(d,0.5);
  m.quaternion.setFromUnitVectors(V(0,1,0), d.normalize()); parent.add(m); return m;
}
function prism(parent, pos, r, sides, h, color, rotZ){
  const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,sides), mat(color));
  m.rotation.x=Math.PI/2; if(rotZ) m.rotation.y=rotZ; m.position.copy(pos); parent.add(m); return m;
}
function tube(parent, pts, r, color, opacity){
  const c=new THREE.CatmullRomCurve3(pts);
  const m=new THREE.Mesh(new THREE.TubeGeometry(c, 120, r, 8, false), mat(color,{opacity:opacity==null?0.35:opacity, depthWrite:false}));
  parent.add(m); return {mesh:m, curve:c};
}
function label(parent, pos, zh, en, cls){
  const d=document.createElement('div'); d.className='lbl '+(cls||'');
  d.innerHTML='<b>'+zh+'</b>'+(en?'<span>'+en+'</span>':'');
  const o=new THREE.CSS2DObject(d); o.position.copy(pos); parent.add(o); return o;
}
// particles flowing along a curve
function flow(parent, curve, n, r, color, speed, o){
  const im=new THREE.InstancedMesh(sphereGeo, mat(color, Object.assign({emissive:color, emissiveIntensity:0.5}, o||{})), n);
  parent.add(im); const M=new THREE.Matrix4(), S=V(r,r,r), Q=new THREE.Quaternion();
  im.userData.update=(t)=>{ for(let i=0;i<n;i++){ const u=((t*speed+i/n)%1+1)%1; M.compose(curve.getPointAt(u),Q,S); im.setMatrixAt(i,M);} im.instanceMatrix.needsUpdate=true; };
  im.userData.update(0); return im;
}
function curve(pts){ return new THREE.CatmullRomCurve3(pts); }

// ---------- stations ----------
const STATIONS = {};
function station(id, center){
  const g=new THREE.Group(); g.position.copy(center); scene.add(g);
  const s={id, group:g, center, parts:{}, labels:[], updates:[]};
  STATIONS[id]=s; return s;
}
function part(s, key, objs, lbls){
  const p=s.parts[key]||(s.parts[key]={mats:[], labels:[]});
  [].concat(objs||[]).forEach(o=>o.traverse(c=>{ if(c.material){ p.mats.push({m:c.material, op:c.material.opacity, em:c.material.emissive?c.material.emissive.clone():null, ei:c.material.emissiveIntensity}); } }));
  [].concat(lbls||[]).forEach(l=>{ p.labels.push(l); s.labels.push(l); });
  return p;
}
function addLabel(s, parent, pos, zh, en, cls){ const l=label(parent,pos,zh,en,cls); s.labels.push(l); return l; }


window.J={THREE, scene, camera, renderer, controls, V, mat, ball, rod, prism, tube, label, flow, curve, station, part, addLabel, STATIONS, sphereGeo};
window.J.start=function(){
const STEPS=window.STEPS;
// ---------- step logic ----------
let cur=-1, tween=null, activeStation=null;
const $=id=>document.getElementById(id);
const dots=$('dots');
STEPS.forEach((st,i)=>{ const b=document.createElement('button'); b.className='dot'; b.title=(i+1)+'. '+st.title; b.onclick=()=>go(i); dots.appendChild(b); });
function setStationVisible(id){
  Object.values(STATIONS).forEach(s=>{ const on = s.id===id; s.group.visible=on; s.labels.forEach(l=>l.visible=on); });
}
function applyHighlight(s, hl){
  Object.entries(s.parts).forEach(([k,p])=>{
    const on = !hl.length || hl.includes(k), strong = hl.length && hl.includes(k);
    p.mats.forEach(o=>{ o.m.opacity = on? o.op : o.op*0.18; if(o.em){ if(strong){ o.m.emissive.copy(o.m.color).multiplyScalar(0.25); o.m.emissiveIntensity=Math.max(o.ei,1);} else { o.m.emissive.copy(o.em); o.m.emissiveIntensity=o.ei; } } });
    p.labels.forEach(l=>{ l.element.classList.toggle('dim', !on); l.element.classList.toggle('hl', !!strong); });
  });
}
function camTarget(st){ const s=STATIONS[st.station]; const look=s.center.clone().add(V(...st.look)); const a=camera.aspect||1; const k=a<1.4? Math.min(1.8,1.4/Math.max(a,0.5)) : 1; const off=V(...st.cam).sub(V(...st.look)).multiplyScalar(k); return { pos:look.clone().add(off), look }; }
function go(i, instant){
  i=Math.max(0,Math.min(STEPS.length-1,i)); if(i===cur && !instant) return; cur=i;
  const st=STEPS[i], s=STATIONS[st.station];
  setStationVisible(st.station); applyHighlight(s, st.hl||[]);
  const tg=camTarget(st);
  if(instant){ camera.position.copy(tg.pos); controls.target.copy(tg.look); tween=null; }
  else tween={t0:performance.now(), dur:1300, p0:camera.position.clone(), l0:controls.target.clone(), p1:tg.pos, l1:tg.look, far: camera.position.distanceTo(tg.pos)>40};
  if(tween && tween.far){ // jump between stations: start near the new station
    const dir=tg.pos.clone().sub(tg.look).normalize(); tween.p0=tg.pos.clone().addScaledVector(dir,14).add(V(0,4,0)); tween.l0=tg.look.clone(); }
  $('stepno').textContent='第 '+(i+1)+' / '+STEPS.length+' 步';
  $('title').textContent=st.title; $('en').textContent=st.en;
  $('body').innerHTML=st.body; $('fit').textContent=st.fit||''; const fl=$('flag'); if(fl){ fl.innerHTML=st.flag||''; fl.style.display=st.flag?'block':'none'; } if(window.onStep) window.onStep(i,st);
  const fig=$('figure'); fig.innerHTML='';
  if(st.figure){ if(st.figure.svg){ fig.innerHTML=document.getElementById(st.figure.svg).innerHTML; }
    else { const im=document.createElement('img'); im.src=st.figure.src; im.alt=st.title; fig.appendChild(im); }
    const cap=document.createElement('figcaption'); cap.textContent=st.figure.caption; fig.appendChild(cap); }
  if(st.source){ const sc=document.createElement('div'); sc.className='src'; sc.textContent=st.source; fig.appendChild(sc); }
  $('panel').scrollTop=0;
  [...dots.children].forEach((d,k)=>d.classList.toggle('on',k===i));
  $('prev').disabled=i===0; $('next').disabled=i===STEPS.length-1;
  history.replaceState(null,'','#step='+(i+1));
}
$('prev').onclick=()=>go(cur-1); $('next').onclick=()=>go(cur+1);
$('reset-cam').onclick=()=>{ const c=cur; cur=-1; go(c); };
window.addEventListener('keydown',e=>{ if(e.key==='ArrowRight') go(cur+1); if(e.key==='ArrowLeft') go(cur-1); });
window.goStep=(n)=>go(n-1,true);

function resize(){ const w=wrap.clientWidth, h=wrap.clientHeight; renderer.setSize(w,h); labelRenderer.setSize(w,h); camera.aspect=w/h;
  camera.fov = w/h<0.9? 60:45; camera.updateProjectionMatrix(); }
let lastNarrow=null; window.addEventListener('resize',()=>{ resize(); const n=camera.aspect<1.4; if(lastNarrow!==null&&n!==lastNarrow&&cur>=0){ const c=cur; cur=-1; go(c,true);} lastNarrow=n; }); resize(); lastNarrow=camera.aspect<1.4;
const ease=x=>x<0.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
const clock=new THREE.Clock();
// 标签防裁切/防重叠：每帧在 CSS2D 定位之后，把当前站点的可见标签夹回舞台内，并按优先级（高亮 > 普通 > 淡化）
// 逐个放到离原锚点最近、且不与已放标签重叠的位置。不出界、不重叠的标签位置与原来完全一致。
const _lv=new THREE.Vector3(); let _fitKey='', _fitOut=null; const _fitOff=[];
for(let dy=-240;dy<=240;dy+=3) for(let dx=-300;dx<=300;dx+=4) _fitOff.push([dx,dy,dx*dx*1.6+dy*dy]);
_fitOff.sort((a,b)=>a[2]-b[2]);
function fitLabels(s){
  const W=wrap.clientWidth, H=wrap.clientHeight; if(!W||!H) return;
  const m=W<600?3:6, gap=3, L=[];
  [...new Set(s.labels)].forEach((o,idx)=>{ const e=o.element; if(!o.visible||e.style.display==='none') return; // part() 与 addLabel() 会重复登记同一标签，先去重
    const w=e.offsetWidth, h=e.offsetHeight; if(!w) return;
    _lv.setFromMatrixPosition(o.matrixWorld).project(camera);
    L.push({e,idx,ax:(_lv.x*0.5+0.5)*W,ay:(-_lv.y*0.5+0.5)*H,w,h,p:e.classList.contains('hl')?0:e.classList.contains('dim')?2:1}); });
  const key=W+'x'+H+'|'+L.map(l=>l.idx+':'+l.ax.toFixed(1)+','+l.ay.toFixed(1)+','+l.w+','+l.h+','+l.p).join(';');
  if(key!==_fitKey){ _fitKey=key;
    const placed=[], rb=document.getElementById('reset-cam'); // 复位按钮也当作障碍物，标签不压在按钮上
    if(rb&&rb.offsetWidth){ const wr=wrap.getBoundingClientRect(), r=rb.getBoundingClientRect(); placed.push({x:r.left-wr.left+r.width/2,y:r.top-wr.top+r.height/2,w:r.width,h:r.height}); }
    const hit=(x,y,l)=>placed.some(q=>Math.abs(x-q.x)<(l.w+q.w)/2+gap && Math.abs(y-q.y)<(l.h+q.h)/2+gap);
    const cx=(l,x)=>Math.min(Math.max(x,l.w/2+m),Math.max(l.w/2+m,W-l.w/2-m)), cy=(l,y)=>Math.min(Math.max(y,l.h/2+m),Math.max(l.h/2+m,H-l.h/2-m));
    L.slice().sort((a,b)=>a.p-b.p||a.idx-b.idx).forEach(l=>{
      const bx=cx(l,l.ax), by=cy(l,l.ay); let X=bx, Y=by;
      if(hit(bx,by,l)){ for(const [dx,dy] of _fitOff){ const x=cx(l,bx+dx), y=cy(l,by+dy); if((x!==bx+dx)||(y!==by+dy)) continue; if(!hit(x,y,l)){ X=x; Y=y; break; } } }
      l.x=X; l.y=Y; placed.push(l); });
    _fitOut=L; }
  else L.forEach((l,i)=>{ l.x=_fitOut[i].x; l.y=_fitOut[i].y; });
  L.forEach(l=>{ if(Math.abs(l.x-l.ax)>0.3||Math.abs(l.y-l.ay)>0.3) l.e.style.transform='translate(-50%,-50%) translate('+l.x.toFixed(1)+'px,'+l.y.toFixed(1)+'px)'; });
}
function loop(){
  requestAnimationFrame(loop);
  const t=clock.getElapsedTime();
  if(tween){ const u=Math.min(1,(performance.now()-tween.t0)/tween.dur), e=ease(u);
    camera.position.lerpVectors(tween.p0,tween.p1,e); controls.target.lerpVectors(tween.l0,tween.l1,e); if(u>=1) tween=null; }
  controls.update();
  const s=STATIONS[STEPS[cur].station];
  s.updates.forEach(f=>f(t)); s.group.traverse(o=>{ if(o.userData.update) o.userData.update(t); });
  renderer.render(scene,camera); labelRenderer.render(scene,camera); fitLabels(s);
}
const m=location.hash.match(/step=(\d+)/); go(m?parseInt(m[1])-1:0, true);
loop();
};
})();
