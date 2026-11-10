/* 胰岛素与 GLUT4 场景 */
(function(){
const {THREE,V,mat,ball,rod,tube,flow,curve,station,part,addLabel,sphereGeo}=J;
const GLU=0x9ad0ff, INS=0xffd166, G4=0x43c06b;
function membrane(g,W,D,y,col){ const m=new THREE.Mesh(new THREE.BoxGeometry(W,1.6,D),mat(col||0xe6d28a,{opacity:0.4,depthWrite:false})); m.position.y=y||0; g.add(m); return m; }
function insulin(g,pos){ const m=new THREE.Group(); m.position.copy(pos); g.add(m); ball(m,V(-0.35,0,0),0.4,INS,{emissive:0xffaa00,emissiveIntensity:0.4}); ball(m,V(0.35,0.1,0),0.33,0xffb547,{emissive:0xff8800,emissiveIntensity:0.4}); return m; }
// ===== 1. beta cell =====
(function(){
  const s=station('beta',V(0,0,0)), g=s.group;
  const cell=new THREE.Mesh(new THREE.SphereGeometry(8,48,24,0,Math.PI),mat(0xa4b8ff,{opacity:0.18,side:THREE.DoubleSide,depthWrite:false})); g.add(cell);
  const glut2=new THREE.Mesh(new THREE.CylinderGeometry(0.7,0.7,1.6,14,1,true),mat(0x58c4a8,{side:THREE.DoubleSide})); glut2.rotation.z=Math.PI/2; glut2.position.set(-8,2,0); g.add(glut2);
  const gIn=curve([V(-12,2,0),V(-8,2,0),V(-5,1,0),V(-3,0,0)]); const fG=flow(g,gIn,4,0.3,GLU,0.25);
  const mito=new THREE.Mesh(sphereGeo,mat(0xff8f6b)); mito.scale.set(1.8,0.9,0.9); mito.position.set(-2,-0.5,0); g.add(mito);
  const atp=flow(g,curve([V(-1,0,0),V(1.5,1.8,0),V(4,4,0),V(5.3,5.5,0)]),4,0.22,0xffa23b,0.3);
  const katp=new THREE.Mesh(new THREE.CylinderGeometry(0.6,0.6,1.6,14),mat(0xff6b6b)); katp.position.set(5.6,5.8,0); katp.rotation.z=-0.75; g.add(katp);
  const cach=new THREE.Mesh(new THREE.CylinderGeometry(0.6,0.6,1.6,14,1,true),mat(0x6ee7ff,{side:THREE.DoubleSide})); cach.position.set(7.6,-2.5,0); cach.rotation.z=Math.PI/2-0.3; g.add(cach);
  const ca=flow(g,curve([V(11,-3.5,0),V(7.6,-2.5,0),V(5,-1.8,0)]),4,0.2,0x6ee7ff,0.35);
  const gran=[]; for(let i=0;i<14;i++){ const m=ball(g,V(0,0,0),0.45,INS,{emissive:0xffaa00,emissiveIntensity:0.35}); m.userData.p=[Math.random(),Math.random()*1.4-0.7]; gran.push(m);} 
  part(s,'glut2',[glut2,fG],[addLabel(s,g,V(-8.5,4.4,0),'GLUT2：葡萄糖进入 β 细胞','Glucose sensing','sm')]);
  part(s,'mito',[mito,atp],[addLabel(s,g,V(-2,-2,0),'代谢 → ATP/ADP 比值升高','Metabolism → ATP↑','sm')]);
  part(s,'katp',katp,[addLabel(s,g,V(8.6,6.8,0),'K⁺(ATP) 通道关闭 → 膜去极化','K-ATP closes','sm')]);
  part(s,'ca',[cach,ca],[addLabel(s,g,V(10.5,-1.2,0),'Ca²⁺ 通道打开，Ca²⁺ 流入','Ca²⁺ influx','sm')]);
  part(s,'gran',gran,[addLabel(s,g,V(1,-6.5,0),'胰岛素颗粒胞吐入血','Insulin exocytosis','sm tag')]);
  addLabel(s,g,V(0,9,0),'胰岛 β 细胞','Pancreatic β-cell','tag');
  s.updates.push(t=>{ gran.forEach((m,i)=>{ const [ph,z]=m.userData.p; const u=((t*0.12+ph)%1); const a=-Math.PI/2-0.5+ph*1.0; const r=2+u*7.5; m.position.set(Math.cos(a)*r*0.9+2,Math.sin(a)*r*0.75,z); m.visible=r<8.8||u<0.98; }); });
})();
// ===== 2. receptor signalling =====
(function(){
  const s=station('rec',V(60,0,0)), g=s.group;
  membrane(g,26,10,0);
  const R=new THREE.Group(); g.add(R);
  [-0.9,0.9].forEach(x=>{ rod(R,V(x,-4,0),V(x,0.8,0),0.35,0x7b68c8); rod(R,V(x,0.8,0),V(x*2.4,4,0),0.45,0x9a8ad6); });
  const ins=insulin(g,V(0,7,0));
  const chain=[['IRS-1','IRS',V(2,-5.5,0),0x6ee7ff],['PI3K','',V(5,-6.5,0),0xc792ff],['Akt','PKB',V(8,-5.5,0),0xff9f6b],['AS160','TBC1D4',V(10.5,-3.5,0),0x7fd38a]];
  const nodes=chain.map(([z,e,p,c])=>{ const b=ball(g,p,0.75,c); return {b,l:addLabel(s,g,p.clone().add(V(0,-1.4,0)),z,e,'sm')}; });
  const sig=curve([V(0.9,-4,0)].concat(chain.map(c=>c[2]))); tube(g,sig.points,0.08,0xffffff,0.25); const fs=flow(g,sig,3,0.25,0xffffff,0.35);
  const P=[]; [-0.9,0.9].forEach(x=>P.push(ball(g,V(x*1.6,-3,0),0.28,0xffa23b,{emissive:0xff8800,emissiveIntensity:0.6})));
  part(s,'rec',R,[addLabel(s,g,V(-5,4.5,0),'胰岛素受体（酪氨酸激酶）','Insulin receptor')]);
  part(s,'ins',ins,[addLabel(s,g,V(2.5,7.5,0),'胰岛素','Insulin','sm')]);
  part(s,'p',P,[addLabel(s,g,V(-4,-3,0),'自身磷酸化','Autophosphorylation','sm')]);
  part(s,'chain',nodes.map(n=>n.b).concat([fs]),nodes.map(n=>n.l));
  addLabel(s,g,V(-11,3,0),'细胞外','Outside','tag'); addLabel(s,g,V(-11,-3,0),'肌细胞内','Cytosol','tag');
  s.updates.push(t=>{ const c=(t%4)/4; ins.position.y= c<0.4? 7-c/0.4*2.4 : 4.6; P.forEach(p=>p.visible=c>0.45); });
})();
// ===== 3. GLUT4 translocation (shared builder for insulin & contraction) =====
function glutStation(id,center,trigger){
  const s=station(id,center), g=s.group;
  membrane(g,28,10,4);
  const ves=[]; for(let i=0;i<7;i++){ const v=new THREE.Group(); g.add(v); const shell=new THREE.Mesh(sphereGeo,mat(0xbfe3ff,{opacity:0.35,depthWrite:false})); shell.scale.setScalar(0.9); v.add(shell);
    for(let k=0;k<3;k++){ const p=ball(v,V(Math.cos(k*2.1)*0.6,Math.sin(k*2.1)*0.6,0.3),0.22,G4); }
    v.userData.x=-10.5+i*3.5; v.userData.ph=i/7; ves.push(v); }
  const pores=[]; for(let i=0;i<7;i++){ const p=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.5,1.8,12,1,true),mat(G4,{side:THREE.DoubleSide,opacity:0})); p.position.set(-10.5+i*3.5,4,0); g.add(p); pores.push(p);} 
  const glu=new THREE.InstancedMesh(sphereGeo,mat(GLU,{emissive:GLU,emissiveIntensity:0.3}),21); g.add(glu); const M=new THREE.Matrix4(), Q=new THREE.Quaternion();
  addLabel(s,g,V(-13,7.5,0),'细胞外（血液/组织液）','Outside','tag'); addLabel(s,g,V(-13,-5,0),'肌细胞内','Cytosol','tag');
  part(s,'ves',ves,[addLabel(s,g,V(0,-4.2,0),'GLUT4 储存囊泡','GLUT4 storage vesicles','sm')]);
  part(s,'pores',pores,[addLabel(s,g,V(6,6.3,0),'膜上的 GLUT4 → 葡萄糖进入','GLUT4 at membrane','sm tag')]);
  part(s,'glu',glu,[]);
  s.updates.push(t=>{ const c=(t%7)/7; const u=Math.min(1,Math.max(0,(c-0.1)/0.45));
    ves.forEach((v,i)=>{ const d=Math.min(1,Math.max(0,u*1.4-i*0.06)); v.position.set(v.userData.x,-2.5+d*6.2,0); v.visible=d<0.98; pores[i].material.opacity=d>=0.98?0.95:0; });
    for(let k=0;k<21;k++){ const i=k%7, open=pores[i].material.opacity>0; const ph=((t*0.5+k*0.37)%1); const y=open? 8-ph*12 : 8-ph*2.2; M.compose(V(-10.5+i*3.5+(k%3-1)*0.3,y,0),Q,V(0.25,0.25,0.25)); glu.setMatrixAt(k,M);} glu.instanceMatrix.needsUpdate=true; });
  return s;
}
(function(){ const s=glutStation('glut4',V(120,0,0)); const g=s.group; const sig=ball(g,V(-13,-1,0),0.6,0x7fd38a,{emissive:0x55aa55,emissiveIntensity:0.5});
  part(s,'sig',sig,[addLabel(s,g,V(-13,-2.4,0),'Akt → AS160 信号','Insulin signal','sm')]); })();
// ===== 4. glycogen synthesis =====
(function(){
  const s=station('glyc',V(0,0,-80)), g=s.group;
  const glu=ball(g,V(-12,0,0),0.6,GLU); const g6p=ball(g,V(-7,0,0),0.6,0x5c9df0); const hk=new THREE.Mesh(new THREE.IcosahedronGeometry(0.9,1),mat(0xb07cff,{flatShading:true})); hk.position.set(-9.5,1.6,0); g.add(hk);
  const gs=new THREE.Mesh(new THREE.IcosahedronGeometry(1.1,1),mat(0xff9f6b,{flatShading:true})); gs.position.set(-3.5,1.8,0); g.add(gs);
  const c=curve([V(-12,0,0),V(-7,0,0),V(-3,0,0),V(1,0,0)]); tube(g,c.points,0.08,GLU,0.3); const f=flow(g,c,4,0.25,GLU,0.25);
  // branching tree
  const tree=new THREE.Group(); tree.position.set(6,0,0); tree.scale.setScalar(0.55); g.add(tree); const nodes=[];
  function br(p,dir,depth){ if(depth>3) return; let q=p.clone(); for(let k=0;k<4;k++){ q=q.clone().add(dir.clone().multiplyScalar(0.75)); const b=ball(tree,q,0.26,0xffd166,{emissive:0xffaa00,emissiveIntensity:0.25}); b.userData.d=depth+k*0.2; nodes.push(b);} 
    const a=0.9; br(q,dir.clone().applyAxisAngle(V(0,0,1),a).applyAxisAngle(V(0,1,0),0.7),depth+1); br(q,dir.clone().applyAxisAngle(V(0,0,1),-a).applyAxisAngle(V(0,1,0),-0.7),depth+1); }
  const core=ball(tree,V(0,0,0),0.5,0xff7a59); [0,1,2,3,4,5].forEach(k=>br(V(0,0,0),V(Math.cos(k*1.05),Math.sin(k*1.05),(k%2?0.4:-0.4)).normalize(),2));
  part(s,'hk',[glu,g6p,hk,f],[addLabel(s,g,V(-9.5,-1.8,0),'葡萄糖 → 6-磷酸葡萄糖（己糖激酶）','Hexokinase · G6P','sm')]);
  part(s,'gs',gs,[addLabel(s,g,V(-3.5,3.6,0),'糖原合酶（胰岛素激活）','Glycogen synthase','sm')]);
  part(s,'tree',[tree],[addLabel(s,g,V(6,5.2,0),'糖原颗粒：分支的葡萄糖链','Glycogen granule')]);
  s.updates.push(t=>{ const lv=((t*0.5)%6); nodes.forEach(n=>n.visible=n.userData.d<lv+2); tree.rotation.y=t*0.25; hk.rotation.y=t; gs.rotation.y=-t; });
})();
// ===== 5. contraction-induced =====
(function(){ const s=glutStation('contr',V(60,0,-80)); const g=s.group;
  const fib=new THREE.Group(); fib.position.set(0,-7.5,0); g.add(fib); const bars=[];
  for(let r=-1;r<=1;r++){ const a=rod(fib,V(-6,r*0.8,0),V(6,r*0.8,0),0.25,0xd14b5a); bars.push(a); }
  const ca=ball(g,V(-13,-1,0),0.6,0x6ee7ff,{emissive:0x22bbdd,emissiveIntensity:0.6}); const ampk=ball(g,V(-13,-3,0),0.6,0xc792ff,{emissive:0x9955ee,emissiveIntensity:0.5});
  part(s,'fib',fib,[addLabel(s,g,V(8,-7.5,0),'肌肉收缩','Contraction','sm')]);
  part(s,'sig',[ca,ampk],[addLabel(s,g,V(-13,0.6,0),'Ca²⁺、AMPK 等信号','Insulin-independent','sm'),addLabel(s,g,V(-13,-4.4,0),'不经过胰岛素受体','No insulin needed','sm tag')]);
  s.updates.push(t=>{ const k=1-0.15*(0.5+0.5*Math.sin(t*4)); fib.scale.x=k; }); })();
// ===== 6. adipocyte =====
(function(){
  const s=station('fat',V(120,0,-80)), g=s.group;
  const cell=new THREE.Mesh(sphereGeo,mat(0xffe0a0,{opacity:0.25,depthWrite:false})); cell.scale.setScalar(8); g.add(cell);
  const drop=ball(g,V(0.5,0,0),6.3,0xffd166,{opacity:0.85});
  const nuc=ball(g,V(-6.6,2.8,1),1.1,0x7f6bd6);
  const inF=flow(g,curve([V(-14,-4,0),V(-7.5,-3,0),V(-4,-1.5,0)]),4,0.3,GLU,0.25);
  const ffa=flow(g,curve([V(14,-6,0),V(8,-4,0),V(5,-2,0)]),5,0.25,0xfff0b0,0.25);
  const hsl=new THREE.Mesh(new THREE.IcosahedronGeometry(1,1),mat(0x888888,{flatShading:true,opacity:0.6})); hsl.position.set(6.8,3.6,0); g.add(hsl);
  const x=new THREE.Group(); x.position.set(6.8,3.6,1.3); g.add(x); rod(x,V(-0.9,-0.9,0),V(0.9,0.9,0),0.12,0xff4d4d); rod(x,V(-0.9,0.9,0),V(0.9,-0.9,0),0.12,0xff4d4d);
  part(s,'drop',[cell,drop,nuc],[addLabel(s,g,V(0,9,0),'脂肪细胞：一个大脂滴（甘油三酯）','Adipocyte')]);
  part(s,'gin',inF,[addLabel(s,g,V(-11,-5.5,0),'GLUT4 摄入葡萄糖 → 合成甘油骨架','Glucose in','sm')]);
  part(s,'ffa',ffa,[addLabel(s,g,V(11,-7,0),'LPL 从血脂释放脂肪酸 → 存入','Fatty acids in (LPL)','sm')]);
  part(s,'hsl',[hsl,x],[addLabel(s,g,V(9.5,5.5,0),'胰岛素抑制脂解（HSL 等）','Lipolysis blocked','sm tag')]);
  s.updates.push(t=>{ drop.scale.setScalar(6.3+0.15*Math.sin(t*0.6)); });
})();
// ===== 7. insulin sensitivity timeline =====
(function(){
  const s=station('sens',V(0,0,-160)), g=s.group;
  const X=h=>-13+h/168*26; rod(g,V(-13,0,0),V(13.5,0,0),0.05,0xffffff,{opacity:0.5});
  for(let d=0;d<=7;d++) addLabel(s,g,V(X(d*24),-1,0),'第'+d+'天','','sm');
  function line(train,col,y0){ const pts=[]; for(let h=0;h<=168;h+=2){ let v=0; train.forEach(tr=>{ const dt=h-tr; if(dt>=0) v+= dt<24?1:Math.max(0,1-(dt-24)/48); }); pts.push(V(X(h),y0+Math.min(1.3,v)*4,0)); } return tube(g,pts,0.13,col,0.95); }
  const a=line([0,48,96,144],0x5ff0b5,0.2), b=line([0,120],0xff8a8a,0.2);
  const marks=[]; [0,48,96,144].forEach(h=>marks.push(ball(g,V(X(h),0,0.6),0.35,0x5ff0b5,{emissive:0x33aa77,emissiveIntensity:0.5})));
  [0,120].forEach(h=>marks.push(ball(g,V(X(h),0,-0.6),0.35,0xff8a8a,{emissive:0xaa3333,emissiveIntensity:0.5})));
  part(s,'a',[a.mesh],[addLabel(s,g,V(X(60),6.6,0),'每 2 天练一次：敏感性一直保持在高位','every ≤3 days','sm tag')]);
  part(s,'b',[b.mesh],[addLabel(s,g,V(X(84),2.2,0),'间隔 5 天：中间回落','5-day gap','sm')]);
  part(s,'m',marks,[]);
  addLabel(s,g,V(-14.5,5,0),'↑ 肌肉胰岛素敏感性（示意）','','sm');
})();
})();
