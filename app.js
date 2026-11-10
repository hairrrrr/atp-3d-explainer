/* 场景层：程序化几何体 + 步骤切换。内容（文字/镜头/高亮）在 content/steps.js */
(function(){
'use strict';
const STEPS = window.STEPS;
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

// ===== 1. ATP molecule =====
(function(){
  const s=station('atp', V(0,0,0)), g=s.group;
  const blue=0x4a86ff, green=0x43c06b, orange=0xffa23b, red=0xff5a5a;
  const ad=new THREE.Group(); g.add(ad);
  prism(ad, V(-7.2,0.3,0), 1.25, 6, 0.55, blue, Math.PI/6);
  prism(ad, V(-5.25,0.3,0), 1.0, 5, 0.55, blue, -Math.PI/10);
  ball(ad, V(-8.1,2.0,0), 0.38, 0x8fb4ff); rod(ad, V(-7.7,1.3,0), V(-8.1,2.0,0), 0.12, 0xbbbbbb); // NH2
  const rib=new THREE.Group(); g.add(rib);
  prism(rib, V(-2.3,-0.6,0), 1.15, 5, 0.55, green);
  ball(rib, V(-2.9,-2.3,0), 0.32, 0xff7d7d); ball(rib, V(-1.4,-2.3,0), 0.32, 0xff7d7d); // 2'/3' OH
  rod(g, V(-4.3,0.2,0), V(-3.3,-0.2,0), 0.15, 0xcccccc);
  rod(g, V(-1.2,0.0,0), V(0.4,0.6,0), 0.15, 0xcccccc);
  function phos(x){ const q=new THREE.Group(); q.position.set(x,0.6,0);
    ball(q, V(0,0,0), 0.8, orange); ball(q, V(0,1.15,0), 0.38, red); ball(q, V(0,-1.15,0), 0.38, red); ball(q, V(0,0,1.1), 0.34, red); g.add(q); return q; }
  const pa=phos(1.3), pb=phos(3.6), pg=phos(5.9);
  rod(g, V(2.1,0.6,0), V(2.8,0.6,0), 0.15, 0xcccccc);
  const bg=rod(g, V(4.4,0.6,0), V(5.1,0.6,0), 0.15, 0xffe066, {emissive:0xffcc00, emissiveIntensity:0.6});
  const spark=ball(g, V(4.75,0.6,0), 0.5, 0xfff3a0, {emissive:0xffdd55, emissiveIntensity:1, opacity:0});
  part(s,'adenine',ad,[addLabel(s,g,V(-6.3,2.6,0),'腺嘌呤','Adenine')]);
  part(s,'ribose',rib,[addLabel(s,g,V(-2.3,-3.3,0),'核糖','Ribose')]);
  part(s,'pa',pa,[addLabel(s,g,V(1.3,-1.6,0),'α 磷酸','α-Phosphate','sm')]);
  part(s,'pb',pb,[addLabel(s,g,V(3.6,-1.6,0),'β 磷酸','β-Phosphate','sm')]);
  part(s,'pg',[pg,bg,spark],[addLabel(s,g,V(5.9,-1.6,0),'γ 磷酸','γ-Phosphate','sm')]);
  const rx=addLabel(s,g,V(6.4,3.2,0),'ATP → ADP + Pi','ΔG°′ ≈ −30.5 kJ/mol','tag');
  s.updates.push(t=>{ const c=(t%4)/4; // gamma phosphate leaves and comes back
    const d = c<0.35?0 : c<0.6? (c-0.35)/0.25 : c<0.85?1 : 1-(c-0.85)/0.15;
    pg.position.x=5.9+d*2.2; pg.position.y=0.6+d*0.8; bg.visible=d<0.05;
    spark.material.opacity = (c>0.33&&c<0.5)? Math.sin((c-0.33)/0.17*Math.PI):0; spark.scale.setScalar(0.4+ (c>0.33&&c<0.5?(c-0.33)*6:0));
    g.rotation.y=Math.sin(t*0.3)*0.25; });
})();

// ===== 2. Phosphocreatine =====
(function(){
  const s=station('pcr', V(60,0,0)), g=s.group;
  const cr=new THREE.Group(); g.add(cr); cr.position.set(-5,0,0);
  [[0,0,0],[0.9,0.6,0],[-0.9,0.6,0],[0,-1.0,0],[0.9,-1.6,0]].forEach((p,i)=>ball(cr,V(...p),i==0?0.6:0.45, i<3?0x7fa8ff:0xb8bcc8));
  const ck=new THREE.Mesh(new THREE.IcosahedronGeometry(1.8,1), mat(0xb07cff,{opacity:0.45, flatShading:true})); g.add(ck);
  const adp=new THREE.Group(); g.add(adp); adp.position.set(4.5,0,0);
  ball(adp,V(-1.4,0,0),0.7,0x4a86ff); ball(adp,V(-0.2,-0.3,0),0.6,0x43c06b); ball(adp,V(0.9,0.2,0),0.55,0xffa23b); ball(adp,V(2.0,0.2,0),0.55,0xffa23b);
  const P=ball(g,V(-4,1.5,0),0.6,0xffa23b,{emissive:0xff8800,emissiveIntensity:0.4});
  const path=curve([V(-4.1,1.5,0),V(-1.5,3.2,0.5),V(1.5,3.2,0.5),V(7.6,0.4,0)]);
  // storage bars
  const bars=new THREE.Group(); g.add(bars); bars.position.set(0,-4.2,0);
  const b1=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),mat(0xffd166)); b1.scale.set(1.2,1.0,1); b1.position.set(-1.2,0.5,0); bars.add(b1);
  const b2=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),mat(0x7fa8ff)); b2.scale.set(1.2,3.5,1); b2.position.set(1.2,1.75,0); bars.add(b2);
  bars.position.set(-8.5,-4.2,0);
  part(s,'pcr',cr,[addLabel(s,g,V(-5,-2.8,0),'磷酸肌酸 → 肌酸','PCr → Cr')]);
  part(s,'ck',ck,[addLabel(s,g,V(0,-2.4,0),'肌酸激酶','Creatine kinase (CK)')]);
  part(s,'adp',adp,[addLabel(s,g,V(4.8,-1.6,0),'ADP → ATP','')]);
  part(s,'pmove',P,[addLabel(s,g,V(0,4.3,0),'磷酸基团转移','Phosphate transfer','sm')]);
  part(s,'bars',bars,[addLabel(s,g,V(-10.2,-5,0),'ATP：1~2 秒','','sm'),addLabel(s,g,V(-7.8,-0.1,0),'PCr：约 4~5 千卡','','sm')]);
  s.updates.push(t=>{ const c=(t%3)/3; const u=Math.min(1,Math.max(0,(c-0.15)/0.6)); P.position.copy(path.getPointAt(u)); ck.rotation.y=t*0.4; ck.rotation.x=t*0.2;});
})();

// ===== 3. Glycolysis =====
(function(){
  const s=station('gly', V(120,0,0)), g=s.group;
  // glucose ring of 6 carbons
  const glu=new THREE.Group(); g.add(glu); glu.position.set(-11,0,0);
  for(let i=0;i<6;i++){ const a=i/6*Math.PI*2; ball(glu,V(Math.cos(a)*1.1,Math.sin(a)*1.1,0),0.38,0x9ad0ff); }
  prism(glu,V(0,0,0),1.1,6,0.15,0x9ad0ff); 
  const hexPts=[V(-11,0,0),V(-8,0,0),V(-5.5,0,0),V(-3,0,0),V(-1,0,0)];
  const hex=new THREE.Group(); g.add(hex);
  [V(-8,0,0),V(-5.5,0,0),V(-3,0,0)].forEach((p,i)=>ball(hex,p,0.6,i==2?0x6fb3ff:0x5c9df0));
  const xs=[1.5,4,6.5,9,11.5], tracks=new THREE.Group(); g.add(tracks);
  const pyrG=new THREE.Group(); g.add(pyrG);
  const curves=[];
  [2.3,-2.3].forEach(y=>{ xs.forEach(x=>ball(tracks,V(x,y,0),0.45,0x58c4a8));
    ball(pyrG,V(14,y,0),0.6,0xffc857);
    const pts=hexPts.concat([V(0.3,y*0.8,0)], xs.map(x=>V(x,y,0)), [V(14,y,0)]);
    curves.push(tube(g,pts,0.12,0x8fb4ff,0.25).curve); });
  curves.forEach(c=>part(s,'tracks',flow(g,c,7,0.22,0xbfe3ff,0.12)));
  // lactate
  const lac=new THREE.Group(); g.add(lac);
  const lcs=[2.3,-2.3].map(y=>{ ball(lac,V(14,y*2.4,0),0.55,0xff6b6b); return tube(g,[V(14,y,0),V(14.4,y*1.7,0),V(14,y*2.4,0)],0.1,0xff6b6b,0.35).curve; });
  lcs.forEach(c=>part(s,'lactate',flow(g,c,3,0.18,0xff8a8a,0.25)));
  const toM=tube(g,[V(14.6,0,0),V(16.5,0,0),V(18.5,0,0)],0.14,0xffc857,0.4);
  // markers
  const atpin=new THREE.Group(), atpout=new THREE.Group(), nadh=new THREE.Group(); g.add(atpin,atpout,nadh);
  [-9.5,-4.25].forEach(x=>{ ball(atpin,V(x,1.3,0),0.32,0xff7a59,{emissive:0xff5533,emissiveIntensity:0.4}); });
  [2.3,-2.3].forEach(y=>{ const sy=y>0?1.1:-1.1;
    ball(nadh,V(2.75,y+sy,0),0.3,0x6ee7ff,{emissive:0x22bbdd,emissiveIntensity:0.5});
    ball(atpout,V(5.25,y+sy,0),0.32,0xffd166,{emissive:0xffaa00,emissiveIntensity:0.5});
    ball(atpout,V(12.75,y+sy,0),0.32,0xffd166,{emissive:0xffaa00,emissiveIntensity:0.5}); });
  part(s,'glucose',glu,[addLabel(s,g,V(-11,-2,0),'葡萄糖 (6C)','Glucose')]);
  part(s,'hexose',hex,[addLabel(s,g,V(-3,-1.5,0),'果糖-1,6-二磷酸','Fructose-1,6-bisP','sm')]);
  part(s,'tracks',[tracks].concat(curves.length?[]:[]),[addLabel(s,g,V(1.5,4,0),'甘油醛-3-磷酸 ×2','G3P (3C)','sm')]);
  part(s,'atpin',atpin,[addLabel(s,g,V(-6.9,2.6,0),'投入 −2 ATP','ATP invested','sm tag')]);
  part(s,'atpout',atpout,[addLabel(s,g,V(9,5.0,0),'产出 +4 ATP（每条 2）','ATP produced','sm tag')]);
  part(s,'nadh',nadh,[addLabel(s,g,V(2.75,-4.6,0),'2 NADH','','sm tag')]);
  part(s,'pyr',[pyrG,toM.mesh],[addLabel(s,g,V(16.2,1.0,0),'2 丙酮酸 → 线粒体','2 Pyruvate (3C)','sm')]);
  part(s,'lactate',lac,[addLabel(s,g,V(16.3,-5.6,0),'乳酸（缺氧/高强度）','Lactate · LDH','sm')]);
  addLabel(s,g,V(-11,5,0),'细胞质','Cytosol','tag');
  s.updates.push(t=>{ glu.rotation.z=t*0.4; });
})();

// ===== Mitochondrion (shared builder) =====
function capsulePts(R,L,n){ const p=[]; for(let i=0;i<=n;i++){const a=i/n*Math.PI/2; p.push(new THREE.Vector2(R*Math.sin(a), -L-R*Math.cos(a)));}
  for(let i=0;i<=n;i++){const a=Math.PI/2+i/n*Math.PI/2; p.push(new THREE.Vector2(R*Math.sin(a), L-R*Math.cos(a)));} return p; }
(function(){
  const s=station('mito', V(0,0,-120)), g=s.group;
  const m=new THREE.Group(); m.rotation.z=-Math.PI/2; g.add(m);
  const outer=new THREE.Mesh(new THREE.LatheGeometry(capsulePts(5,6,16),48,Math.PI/2,Math.PI), mat(0xff9f6b,{side:THREE.DoubleSide,opacity:0.55,depthWrite:false}));
  const inner=new THREE.Mesh(new THREE.LatheGeometry(capsulePts(4.3,5.6,16),48,Math.PI/2,Math.PI), mat(0xff6f91,{side:THREE.DoubleSide,opacity:0.92}));
  m.add(outer); m.add(inner);
  // rims on cut plane
  const rimO=new THREE.Mesh(new THREE.TorusGeometry(1,0.08,8,64),mat(0xffc29b)); 
  const cr=new THREE.Group(); m.add(cr);
  for(let i=-4;i<=4;i++){ const sgn=i%2===0?1:-1;
    const b=new THREE.Mesh(new THREE.BoxGeometry(4.6,0.38,2.3), mat(0xff86a6,{opacity:0.95}));
    b.position.set(sgn*2.0, i*1.3, -1.15); cr.add(b);
    const cap=new THREE.Mesh(new THREE.CylinderGeometry(0.19,0.19,2.3,12), mat(0xff86a6)); cap.rotation.x=Math.PI/2; cap.position.set(sgn*2.0 - sgn*2.3, i*1.3, -1.15); cr.add(cap);}
  // matrix granules
  const pg=new THREE.BufferGeometry(), arr=[];
  for(let i=0;i<700;i++){ const y=(Math.random()*2-1)*6, a=Math.PI/2+Math.random()*Math.PI, r=Math.sqrt(Math.random())*3.8; arr.push(Math.sin(a)*r, y, Math.cos(a)*r*0.9);}
  pg.setAttribute('position', new THREE.Float32BufferAttribute(arr,3));
  const pts=new THREE.Points(pg,new THREE.PointsMaterial({color:0xffe1a8,size:0.09,transparent:true,opacity:0.9}));
  m.add(pts);
  const dna=new THREE.Mesh(new THREE.TorusGeometry(0.6,0.07,8,40),mat(0x9df0ff,{emissive:0x55ccee,emissiveIntensity:0.4})); dna.position.set(0.8,-3.3,-0.8); m.add(dna);
  part(s,'outer',outer,[addLabel(s,g,V(-4,5.6,-1),'外膜','Outer membrane')]);
  part(s,'inner',inner,[addLabel(s,g,V(9.2,-2.6,-1),'内膜','Inner membrane')]);
  part(s,'cristae',cr,[addLabel(s,g,V(2.6,2.2,-0.3),'嵴','Cristae')]);
  part(s,'matrix',[pts,dna],[addLabel(s,g,V(-2.0,-0.6,0),'基质','Matrix'),addLabel(s,g,V(-3.3,-2.0,-0.8),'线粒体 DNA','mtDNA','sm')]);
  part(s,'ims',[],[addLabel(s,g,V(-9.8,1.9,-1),'膜间隙','Intermembrane space','sm')]);
  s.updates.push(t=>{ g.rotation.y=Math.sin(t*0.25)*0.18; });
})();

// ===== TCA cycle =====
(function(){
  const s=station('tca', V(60,0,-120)), g=s.group;
  const R=5;
  const ring=new THREE.Mesh(new THREE.TorusGeometry(R,0.16,12,96), mat(0x7ad1ff,{opacity:0.5})); g.add(ring);
  const names=[['柠檬酸','Citrate (6C)'],['异柠檬酸','Isocitrate'],['α-酮戊二酸','α-Ketoglutarate (5C)'],['琥珀酰CoA','Succinyl-CoA (4C)'],['琥珀酸','Succinate'],['延胡索酸','Fumarate'],['苹果酸','Malate'],['草酰乙酸','Oxaloacetate (4C)']];
  const ang=i=>Math.PI/2 - (i+0.5)/8*Math.PI*2;
  const nodes=new THREE.Group(); g.add(nodes); const nl=[];
  names.forEach((n,i)=>{ const a=ang(i), p=V(Math.cos(a)*R,Math.sin(a)*R,0); ball(nodes,p,0.55,0x5fd3b0);
    nl.push(addLabel(s,g,V(Math.cos(a)*(R-2.0),Math.sin(a)*(R-1.6),0),n[0],n[1],'sm')); });
  // products between nodes i -> i+1
  const prods=[[1,'NADH + CO₂',0x6ee7ff],[2,'NADH + CO₂',0x6ee7ff],[3,'GTP (≈ATP)',0xffd166],[4,'FADH₂',0xc792ff],[6,'NADH',0x6ee7ff]];
  const pr=new THREE.Group(); g.add(pr); const pl=[]; const emit=[];
  prods.forEach(([i,txt,col])=>{ const a=Math.PI/2-(i+1)/8*Math.PI*2, p=V(Math.cos(a)*(R+1.4),Math.sin(a)*(R+1.4),0);
    const b=ball(pr,p,0.32,col,{emissive:col,emissiveIntensity:0.6}); emit.push({b,a,base:p.clone()});
    pl.push(addLabel(s,g,V(Math.cos(a)*(R+3.0),Math.sin(a)*(R+2.6),0),txt,'','sm tag')); });
  const token=ball(g,V(0,R,0),0.42,0xffffff,{emissive:0xffffff,emissiveIntensity:0.5});
  // entry: pyruvate -> PDH -> acetyl-CoA
  const pyr=ball(g,V(-12,7.5,0),0.6,0xffc857); 
  const pdh=new THREE.Mesh(new THREE.IcosahedronGeometry(1.1,1),mat(0xb07cff,{opacity:0.55,flatShading:true})); pdh.position.set(-8.5,7.5,0); g.add(pdh);
  const acoa=ball(g,V(-4.5,7.2,0),0.55,0xff9f6b);
  const ent=tube(g,[V(-12,7.5,0),V(-8.5,7.5,0),V(-4.5,7.2,0),V(-1.5,5.6,0),V(Math.cos(ang(0))*R,Math.sin(ang(0))*R,0)],0.1,0xffc857,0.35);
  const ef=flow(g,ent.curve,5,0.2,0xffd98a,0.2);
  const co2=ball(g,V(-8.5,9.6,0),0.28,0xcccccc);
  part(s,'pyr2',[pyr,ef],[addLabel(s,g,V(-12,9,0),'丙酮酸','Pyruvate','sm')]);
  part(s,'pdh',[pdh,co2],[addLabel(s,g,V(-8.5,5.6,0),'PDH 复合体','+NADH +CO₂','sm')]);
  part(s,'acoa',[acoa,ent.mesh],[addLabel(s,g,V(-4.6,8.8,0),'乙酰CoA (2C)','Acetyl-CoA','sm')]);
  part(s,'ring',[ring,token],[addLabel(s,g,V(0,0,0),'三羧酸循环','TCA / Krebs cycle')]);
  part(s,'nodes',nodes,nl);
  part(s,'products',pr,pl);
  addLabel(s,g,V(9.5,8,0),'线粒体基质','Matrix','tag');
  s.updates.push(t=>{ const a=Math.PI/2 - (t*0.12%1)*Math.PI*2; token.position.set(Math.cos(a)*R,Math.sin(a)*R,0);
    emit.forEach((e,k)=>{ const ph=((t*0.12 + (k*0.13))%1); const d=1+0.25*Math.sin(ph*Math.PI*2); e.b.position.copy(e.base).multiplyScalar(d);});
    pdh.rotation.y=t*0.5; });
})();

// ===== Inner membrane: ETC + ATP synthase =====
(function(){
  const s=station('mem', V(120,0,-120)), g=s.group;
  const W=44, D=12;
  // bilayer heads (instanced)
  const nx=55, nz=15, heads=new THREE.InstancedMesh(sphereGeo, mat(0xe6d28a), nx*nz*2), M=new THREE.Matrix4(), Q=new THREE.Quaternion(), Sc=V(0.36,0.36,0.36);
  let k=0; for(let l=0;l<2;l++) for(let i=0;i<nx;i++) for(let j=0;j<nz;j++){ M.compose(V(-W/2+i*W/nx+ (j%2)*0.3, l?1.6:-1.6, -D/2+j*D/nz),Q,Sc); heads.setMatrixAt(k++,M);} g.add(heads);
  const core=new THREE.Mesh(new THREE.BoxGeometry(W,2.8,D), mat(0xb89b4a,{opacity:0.35,depthWrite:false})); g.add(core);
  addLabel(s,g,V(-20,5.5,4),'膜间隙（H⁺ 多）','Intermembrane space','tag');
  addLabel(s,g,V(-20,-6,4),'基质（H⁺ 少）','Matrix','tag');
  addLabel(s,g,V(-23,0,5),'线粒体内膜','Inner membrane','sm');
  // complexes: x positions
  const cI=new THREE.Group(); g.add(cI);
  const m1=new THREE.Mesh(new THREE.BoxGeometry(5.5,3.6,3.2),mat(0x6a8dff)); m1.position.set(-15,0,0); cI.add(m1);
  const a1=new THREE.Mesh(new THREE.BoxGeometry(2.2,4.6,2.6),mat(0x6a8dff)); a1.position.set(-13.2,-3.8,0); cI.add(a1);
  const cII=new THREE.Mesh(new THREE.BoxGeometry(2.4,3.0,2.4),mat(0x7fd38a)); cII.position.set(-8.5,-1.6,0); g.add(cII);
  const cIII=new THREE.Mesh(new THREE.BoxGeometry(4,5.4,3.2),mat(0xff9f6b)); cIII.position.set(-2.5,0.2,0); g.add(cIII);
  const cIV=new THREE.Mesh(new THREE.BoxGeometry(3.6,4.8,3.2),mat(0xe2708a)); cIV.position.set(4,0.3,0); g.add(cIV);
  const Qb=ball(g,V(-6,0,1.8),0.45,0xffe066,{emissive:0xffcc00,emissiveIntensity:0.5});
  const cyt=ball(g,V(0.8,3.4,1.2),0.5,0xff4d4d,{emissive:0xff2222,emissiveIntensity:0.4});
  // electron path
  const ePts=[V(-12.5,-6.5,1.8),V(-13.2,-3.8,1.8),V(-14,0,1.8),V(-10,0,1.9),V(-6,0,1.9),V(-3.5,0,1.9),V(-2.5,2.6,1.8),V(0.8,3.4,1.8),V(3.5,2.8,1.8),V(4.2,-0.8,1.8),V(4.6,-4.2,1.8)];
  const eC=curve(ePts); const eTube=tube(g,ePts,0.07,0x6ee7ff,0.5); const ef=flow(g,eC,14,0.17,0x9ff3ff,0.15);
  const e2=curve([V(-8.5,-3.6,1.6),V(-8.3,-1,1.9),V(-6,0,1.9)]); const ef2=flow(g,e2,3,0.15,0xd7a8ff,0.3);
  const nadhB=ball(g,V(-12.5,-7,1.8),0.4,0x6ee7ff,{emissive:0x22bbdd,emissiveIntensity:0.5});
  const fadB=ball(g,V(-8.5,-4.2,1.6),0.36,0xc792ff,{emissive:0x9955ee,emissiveIntensity:0.5});
  const o2=ball(g,V(4.6,-5.0,1.8),0.45,0x9fd8ff);
  // proton pumping flows (up)
  const pumps=[]; [[-15.5,4],[-2.5,4],[4,2]].forEach(([x,n])=>{ const c=curve([V(x,-3.2,-0.6),V(x+0.3,0,-0.6),V(x,3.4,-0.6),V(x-0.8,6,-0.6)]); pumps.push(flow(g,c,n,0.22,0xff4040,0.35)); });
  // IMS proton cloud
  const cloudN=90, cloud=new THREE.InstancedMesh(sphereGeo, mat(0xff4040,{emissive:0xff2020,emissiveIntensity:0.4,opacity:0.85}), cloudN); g.add(cloud);
  const cloudP=[]; for(let i=0;i<cloudN;i++) cloudP.push([ -20+Math.random()*40, 3.2+Math.random()*3.8, -5+Math.random()*10, Math.random()*6.28]);
  // ATP synthase at x=14
  const syn=new THREE.Group(); syn.position.set(14,0,0); g.add(syn);
  const rotor=new THREE.Group(); syn.add(rotor);
  for(let i=0;i<8;i++){ const a=i/8*Math.PI*2; const c=new THREE.Mesh(new THREE.CylinderGeometry(0.42,0.42,3.6,14),mat(i==0?0x9fc4ff:0x5b8def)); c.position.set(Math.cos(a)*1.45,0,Math.sin(a)*1.45); rotor.add(c);}
  const gam=new THREE.Mesh(new THREE.CylinderGeometry(0.35,0.35,6.4,14),mat(0xb8bec8)); gam.position.y=-4.0; rotor.add(gam);
  const ecc=new THREE.Mesh(new THREE.BoxGeometry(1.2,0.6,0.5),mat(0xb8bec8)); ecc.position.set(0.5,-6.5,0); rotor.add(ecc);
  const f1=new THREE.Group(); f1.position.y=-8.2; syn.add(f1);
  for(let i=0;i<6;i++){ const a=i/6*Math.PI*2; const b=new THREE.Mesh(sphereGeo, mat(i%2?0x9ad49a:0xc9a7f0)); b.scale.set(1.25,1.9,1.25); b.position.set(Math.cos(a)*1.55,0,Math.sin(a)*1.55); f1.add(b);}
  const asub=new THREE.Mesh(new THREE.BoxGeometry(1.4,3.8,2.2),mat(0x9a8ad6)); asub.position.set(2.7,0,0); syn.add(asub);
  const stator=new THREE.Group(); syn.add(stator);
  rod(stator,V(3.1,-1.8,0),V(3.2,-8.2,0),0.22,0x7b68c8); rod(stator,V(3.2,-8.2,0),V(1.6,-10.4,0),0.22,0x7b68c8);
  ball(stator,V(0.8,-10.6,0),0.6,0x7b68c8);
  // H+ back-flow at a/c interface
  const hb=curve([V(16.4,6,0.2),V(16.3,3,0.3),V(16.2,1.0,0.6),V(16.0,-1.0,0.6),V(16.2,-2.6,0.3),V(17.0,-4.5,0)]);
  const hflow=flow(g,hb,6,0.22,0xff4040,0.3);
  // ATP release
  const atps=new THREE.InstancedMesh(sphereGeo, mat(0xffd166,{emissive:0xffaa00,emissiveIntensity:0.6}), 6); g.add(atps);
  part(s,'c1',[cI,nadhB],[addLabel(s,g,V(-15,-8.2,0),'复合体 I','NADH 脱氢酶 · 泵 4H⁺','sm')]);
  part(s,'c2',[cII,fadB,ef2],[addLabel(s,g,V(-8.5,-6,0),'复合体 II','FADH₂ · 不泵 H⁺','sm')]);
  part(s,'c3',cIII,[addLabel(s,g,V(-2.5,-4.0,0),'复合体 III','泵 4H⁺','sm')]);
  part(s,'c4',cIV,[addLabel(s,g,V(4,-2.8,3.5),'复合体 IV','泵 2H⁺','sm')]);
  part(s,'q',Qb,[addLabel(s,g,V(-6,1.2,2.5),'辅酶 Q','CoQ','sm')]);
  part(s,'cytc',cyt,[addLabel(s,g,V(0.8,4.6,1.2),'细胞色素 c','Cyt c','sm')]);
  part(s,'o2',o2,[addLabel(s,g,V(7.2,-5.4,1.8),'½O₂ + 2H⁺ → H₂O','','sm tag')]);
  part(s,'electrons',[eTube.mesh,ef],[]);
  part(s,'hpump',pumps.concat([cloud]),[addLabel(s,g,V(-9,7.2,0),'H⁺ 被泵到膜间隙','Proton pumping','sm tag')]);
  part(s,'cring',rotor.children.slice(0,8),[addLabel(s,g,V(11,2.8,2),'F₀ 转子（c₈ 环）','c-ring rotor','sm')]);
  part(s,'gamma',[gam,ecc],[addLabel(s,g,V(11.6,-4.6,2),'中央柄 γ','Central stalk','sm')]);
  part(s,'f1',f1,[addLabel(s,g,V(10,-8.4,2.5),'F₁ 头部 α₃β₃','Catalytic head','sm')]);
  part(s,'asub',asub,[addLabel(s,g,V(18.8,1.0,1),'a 亚基','H⁺ 通道','sm')]);
  part(s,'stator',stator,[addLabel(s,g,V(19.0,-6.6,0),'周边柄（定子）','Stator (b)','sm')]);
  part(s,'hback',hflow,[addLabel(s,g,V(19.2,4.6,0),'H⁺ 顺梯度回流','','sm tag')]);
  part(s,'atpout2',atps,[addLabel(s,g,V(17.6,-11.4,0),'ADP + Pi → ATP','','sm tag')]);
  const Mx=new THREE.Matrix4(), Sx=V(0.3,0.3,0.3);
  s.updates.push((t)=>{
    rotor.rotation.y = -t*1.6;
    Qb.position.x=-6+Math.sin(t*1.2)*2.2; cyt.position.x=0.8+Math.sin(t*1.1)*1.6;
    for(let i=0;i<cloudN;i++){ const p=cloudP[i]; Mx.compose(V(p[0]+Math.sin(t*0.7+p[3])*0.5, p[1]+Math.cos(t*0.9+p[3])*0.3, p[2]),Q,V(0.18,0.18,0.18)); cloud.setMatrixAt(i,Mx);} cloud.instanceMatrix.needsUpdate=true;
    for(let i=0;i<6;i++){ const u=((t*0.3+i/6)%1); const a=i/6*Math.PI*2 + t*0.2; Mx.compose(V(14+Math.cos(a)*(2.6+u*4), -8.4-u*2.5, Math.sin(a)*(2.6+u*4)),Q,Sx.clone().multiplyScalar(1-u*0.6)); atps.setMatrixAt(i,Mx);} atps.instanceMatrix.needsUpdate=true;
  });
})();

// ===== Fat beta-oxidation =====
(function(){
  const s=station('fat', V(0,0,-240)), g=s.group;
  const drop=ball(g,V(-13,3,0),1.8,0xffe08a,{opacity:0.85});
  const memb=new THREE.Mesh(new THREE.BoxGeometry(0.9,14,6),mat(0xff6f91,{opacity:0.35,depthWrite:false})); memb.position.set(-9.5,0,0); g.add(memb);
  const cpt=new THREE.Mesh(new THREE.TorusGeometry(0.9,0.3,10,30),mat(0xb07cff)); cpt.rotation.y=Math.PI/2; cpt.position.set(-9.5,1,0); g.add(cpt);
  const inflow=tube(g,[V(-12,2,0),V(-10.5,1.2,0),V(-9.5,1,0),V(-8.3,0.6,0)],0.1,0xffe08a,0.4); const inf=flow(g,inflow.curve,4,0.18,0xffe08a,0.25);
  const chain=new THREE.Group(); g.add(chain); const C=[];
  for(let j=0;j<16;j++){ C.push(ball(chain,V(0,0,0),0.42,j>=14?0xff9f6b:0xaab2c0)); }
  const coa=ball(g,V(7,0,0),0.75,0xb07cff);
  const pops=new THREE.Group(); g.add(pops); const fad=ball(pops,V(0,0,0),0.32,0xc792ff,{emissive:0x9955ee,emissiveIntensity:0.6}); const nad=ball(pops,V(0,0,0),0.32,0x6ee7ff,{emissive:0x22bbdd,emissiveIntensity:0.6});
  const tca=tube(g,[V(7.5,-1,0),V(9.5,-3,0),V(12,-4,0)],0.1,0xff9f6b,0.35);
  part(s,'droplet',[drop,inf,inflow.mesh],[addLabel(s,g,V(-13,5.5,0),'脂肪（甘油三酯）→ 脂肪酸','Triglyceride → fatty acid','sm')]);
  part(s,'cpt',[cpt,memb],[addLabel(s,g,V(-9.5,-4,0),'肉碱穿梭 CPT1','Carnitine shuttle','sm')]);
  part(s,'chain',chain,[addLabel(s,g,V(-1,2.2,0),'脂酰CoA（棕榈酸 C16）','Fatty acyl-CoA','sm')]);
  part(s,'coa',coa,[addLabel(s,g,V(7,1.6,0),'CoA','','sm')]);
  part(s,'acoa2',tca.mesh,[addLabel(s,g,V(12.8,-5.4,0),'乙酰CoA → 三羧酸循环','Acetyl-CoA → TCA','sm tag')]);
  part(s,'bprod',pops,[addLabel(s,g,V(4,-4.2,0),'每轮：FADH₂ + NADH','per cycle','sm tag')]);
  addLabel(s,g,V(-13,-6,0),'细胞质','Cytosol','tag'); addLabel(s,g,V(1,-7,0),'线粒体基质','Matrix','tag');
  const P=1.8;
  s.updates.push(t=>{
    const k=Math.floor(t/P)%10, f=(t/P)%1;
    const removed = (k<=7? 2*Math.min(k,7):16) ; const prev = Math.max(0,(k<=7?2*(k-1):16)); 
    const cut = k===0?0:(k>=8?16:removed);
    const shift = (k===0?0: (prev + Math.min(1,f/0.4)*(cut-prev)))*0.9;
    for(let j=0;j<16;j++){ const base=7-0.9*(16-j); const released = j>=16-cut;
      if(!released){ C[j].visible=true; C[j].position.set(base+shift, (j%2?0.32:-0.32), 0); C[j].material.color.setHex(j>=16-cut-2?0xff9f6b:0xaab2c0); }
      else { const pairStart = 16 - 2*Math.floor((15-j)/2) ; const pidx=Math.floor((15-j)/2)+1; // cycle index when released
        if(k>=8){ C[j].visible=false; continue; }
        if(pidx===k){ const u=Math.min(1,f*1.3); C[j].visible=u<1; C[j].position.set(6.1+(j%2?0:-0.9)+u*6, -u*4+(j%2?0.32:-0.32), 0); C[j].scale.setScalar(0.42*(1-u*0.5)); }
        else C[j].visible=false; }
      if(!released) C[j].scale.setScalar(0.42);
    }
    const pv = k>=1&&k<=7; fad.visible=nad.visible=pv; if(pv){ fad.position.set(4+f*1.5,-1-f*2,0.6); nad.position.set(5+f*1.5,-1.2-f*2,-0.6);} 
  });
})();

// ===== Summary: ATP donors (after the book's Table 13) =====
(function(){
  const s=station('sum', V(60,0,-240)), g=s.group;
  const TMAX=10800, X=t=>-13+26*Math.log10(t)/Math.log10(TMAX);
  const axis=new THREE.Mesh(new THREE.BoxGeometry(27,0.12,0.12),mat(0xffffff,{opacity:0.6})); g.add(axis);
  [[1,'1 秒'],[10,'10 秒'],[30,'30 秒'],[180,'3 分'],[3600,'60 分'],[10800,'3 小时']].forEach(([t,l])=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(0.08,0.6,0.08),mat(0xffffff)); m.position.set(X(t),0,0); g.add(m); addLabel(s,g,V(X(t),-0.9,0),l,'','sm'); });
  addLabel(s,g,V(0,-2.2,0),'运动持续时间（对数刻度）','Duration','sm');
  addLabel(s,g,V(-15.5,9.5,0),'↑ 每分钟最大产能','kcal/min（书中表 13）','sm');
  function band(t0,t1,h,z,color){ const x0=X(t0), x1=X(t1); const sh=new THREE.Shape();
    sh.moveTo(x0,0); sh.bezierCurveTo(x0+0.5,h, x0+0.5,h, x0+1.2,h); sh.lineTo(x1-1.6,h); sh.bezierCurveTo(x1-0.7,h, x1-0.3,h*0.2, x1,0); sh.lineTo(x0,0);
    const m=new THREE.Mesh(new THREE.ExtrudeGeometry(sh,{depth:1.0,bevelEnabled:true,bevelSize:0.1,bevelThickness:0.1,bevelSegments:2}),mat(color,{opacity:0.82})); m.position.z=z; g.add(m); return m; }
  const k=0.16; // 58, 54(36~54), 18, 9 kcal/min
  const b1=band(1,30,58*k,2.4,0xff5a5a), b2=band(3,180,45*k,0.8,0xffa23b), b3=band(150,5400,18*k,-0.8,0x4a9dff), b4=band(1200,10800,9*k,-2.4,0xf2d14b);
  part(s,'phos',b1,[addLabel(s,g,V(X(4),58*k+0.9,2.9),'磷酸肌酸','≈58 kcal/min · ≤30 s')]);
  part(s,'glyc',b2,[addLabel(s,g,V(X(40),45*k+0.9,1.3),'葡萄糖无氧燃烧','36–54 kcal/min · ≤3 min')]);
  part(s,'oxid',b3,[addLabel(s,g,V(X(900),18*k+0.9,-0.3),'葡萄糖有氧燃烧','≈18 kcal/min · 3–90 min')]);
  part(s,'fat',b4,[addLabel(s,g,V(X(7000),9*k+2.4,-1.9),'脂肪燃烧','≈9 kcal/min · 60 min 后为主')]);
  const cursor=new THREE.Mesh(new THREE.BoxGeometry(0.12,11,6),mat(0xffffff,{opacity:0.16,depthWrite:false})); cursor.position.y=5.5; g.add(cursor);
  const crossover=new THREE.Mesh(new THREE.BoxGeometry(0.06,8,0.06),mat(0x6ee7ff)); crossover.position.set(X(75),4,2.9); g.add(crossover);
  addLabel(s,g,V(X(75),-3.4,2.9),'~75 秒：有氧≈无氧（Gastin 2001）','modern estimate','sm tag');
  addLabel(s,g,V(9,10,0),'各途径之间自然过渡，不能孤立看待','','sm tag');
  s.updates.push(t=>{ const u=(t*0.07)%1; cursor.position.x=-13+26*u; });
})();

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
function camTarget(st){ const s=STATIONS[st.station]; return { pos:s.center.clone().add(V(...st.cam)), look:s.center.clone().add(V(...st.look)) }; }
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
  $('body').innerHTML=st.body; $('fit').textContent=st.fit||'';
  const fig=$('figure'); fig.innerHTML='';
  if(st.figure){ if(st.figure.svg){ fig.innerHTML=document.getElementById(st.figure.svg).innerHTML; }
    else { const im=document.createElement('img'); im.src=st.figure.src; im.alt=st.title; fig.appendChild(im); }
    const cap=document.createElement('figcaption'); cap.textContent=st.figure.caption; fig.appendChild(cap); }
  $('flag').textContent=st.flag||''; $('source').textContent=st.source||'';
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
window.addEventListener('resize',resize); resize();
const ease=x=>x<0.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
const clock=new THREE.Clock();
function loop(){
  requestAnimationFrame(loop);
  const t=clock.getElapsedTime();
  if(tween){ const u=Math.min(1,(performance.now()-tween.t0)/tween.dur), e=ease(u);
    camera.position.lerpVectors(tween.p0,tween.p1,e); controls.target.lerpVectors(tween.l0,tween.l1,e); if(u>=1) tween=null; }
  controls.update();
  const s=STATIONS[STEPS[cur].station];
  s.updates.forEach(f=>f(t)); s.group.traverse(o=>{ if(o.userData.update) o.userData.update(t); });
  renderer.render(scene,camera); labelRenderer.render(scene,camera);
}
const m=location.hash.match(/step=(\d+)/); go(m?parseInt(m[1])-1:0, true);
loop();
})();
