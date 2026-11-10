/* 肌酸专题场景 */
(function(){
const {THREE,V,mat,ball,rod,prism,tube,flow,curve,station,part,addLabel,sphereGeo}=J;
const ORANGE=0xffa23b, BLUE=0x7fa8ff, CK=0xb07cff;
function crMol(g,pos,col){ const m=new THREE.Group(); m.position.copy(pos); g.add(m);
  [[0,0,0],[0.8,0.55,0],[-0.8,0.55,0],[0,-0.9,0],[0.8,-1.4,0]].forEach((p,i)=>ball(m,V(...p),i==0?0.5:0.36,i<3?(col||BLUE):0xb8bcc8)); return m; }
// ===== 1. CK reaction =====
(function(){
  const s=station('ck',V(0,0,0)), g=s.group;
  const cr=crMol(g,V(-5,0,0));
  const ck=new THREE.Mesh(new THREE.IcosahedronGeometry(1.8,1),mat(CK,{opacity:0.45,flatShading:true})); g.add(ck);
  const adp=new THREE.Group(); g.add(adp); adp.position.set(4.5,0,0);
  ball(adp,V(-1.4,0,0),0.7,0x4a86ff); ball(adp,V(-0.2,-0.3,0),0.6,0x43c06b); ball(adp,V(0.9,0.2,0),0.55,ORANGE); ball(adp,V(2.0,0.2,0),0.55,ORANGE);
  const P=ball(g,V(-4,1.5,0),0.6,ORANGE,{emissive:0xff8800,emissiveIntensity:0.4});
  const path=curve([V(-4.1,1.5,0),V(-1.5,3.2,0.5),V(1.5,3.2,0.5),V(7.6,0.4,0)]);
  const H=ball(g,V(3,-2.5,0),0.3,0xff4d4d,{emissive:0xff2222,emissiveIntensity:0.5});
  part(s,'pcr',[cr,P],[addLabel(s,g,V(-5,-2.8,0),'磷酸肌酸 → 肌酸','PCr → Cr')]);
  part(s,'ckenz',ck,[addLabel(s,g,V(0,-2.4,0),'肌酸激酶','Creatine kinase (CK)')]);
  part(s,'adp',adp,[addLabel(s,g,V(4.8,-1.6,0),'ADP → ATP','')]);
  part(s,'h',H,[addLabel(s,g,V(3,-3.6,0),'消耗 H⁺（缓冲酸）','H⁺ consumed','sm')]);
  addLabel(s,g,V(0,5.2,0),'PCr + ADP + H⁺ ⇌ ATP + Cr','one step · no O₂','tag');
  s.updates.push(t=>{ const c=(t%3)/3, u=Math.min(1,Math.max(0,(c-0.15)/0.6)); P.position.copy(path.getPointAt(u)); ck.rotation.y=t*0.4; ck.rotation.x=t*0.2;
    H.position.set(3-u*2.5,-2.5+u*1.8,0); H.visible=u<0.98; g.rotation.y=Math.sin(t*0.3)*0.2; });
})();
// ===== 2. CK shuttle =====
(function(){
  const s=station('shuttle',V(60,0,0)), g=s.group;
  const mito=new THREE.Mesh(new THREE.CapsuleGeometry?new THREE.SphereGeometry(1,32,16):sphereGeo, mat(0xff8f6b,{opacity:0.8})); mito.scale.set(5,2.6,2.6); mito.position.set(-10,0,0); g.add(mito);
  const cr2=new THREE.Group(); g.add(cr2); for(let i=-2;i<=2;i++){ const b=new THREE.Mesh(new THREE.BoxGeometry(0.25,3.2,2.8),mat(0xffc0cb,{opacity:0.9})); b.position.set(-10+i*1.2,0,0); cr2.add(b);} 
  const mick=new THREE.Mesh(new THREE.IcosahedronGeometry(0.9,1),mat(CK,{flatShading:true})); mick.position.set(-4.6,0.4,0); g.add(mick);
  // myofibril: thick & thin filaments
  const myo=new THREE.Group(); myo.position.set(10,0,0); g.add(myo);
  for(let r=-1;r<=1;r++) for(let q=-1;q<=1;q+=2){ rod(myo,V(-3.5,r*1.2,q*0.6),V(3.5,r*1.2,q*0.6),0.28,0xd14b5a); }
  for(let r=-1.5;r<=1.5;r+=1) [-1,1].forEach(sd=>rod(myo,V(sd*5.5,r*1.2,0),V(sd*1.2,r*1.2,0),0.1,0x86c5ff));
  [-5.5,5.5].forEach(x=>rod(myo,V(x,-2.6,0),V(x,2.6,0),0.18,0xe9eefc));
  const mmck=new THREE.Mesh(new THREE.IcosahedronGeometry(0.9,1),mat(CK,{flatShading:true})); mmck.position.set(4.2,3.2,0); g.add(mmck);
  const cTop=curve([V(-4.6,0.9,0),V(-1,3.5,0),V(2.5,3.6,0),V(4.2,3.2,0)]), cBot=curve([V(4.2,2.6,0),V(2,-3.5,0),V(-2,-3.5,0),V(-4.6,-0.2,0)]);
  tube(g,cTop.points,0.08,ORANGE,0.3); tube(g,cBot.points,0.08,BLUE,0.3);
  const fP=flow(g,cTop,6,0.3,ORANGE,0.25), fC=flow(g,cBot,6,0.28,BLUE,0.25);
  part(s,'mito',[mito,cr2],[addLabel(s,g,V(-10,3.4,0),'线粒体（ATP 产地）','Mitochondrion')]);
  part(s,'mick',mick,[addLabel(s,g,V(-4.6,-1.4,0),'线粒体 CK','Mi-CK','sm')]);
  part(s,'myo',myo,[addLabel(s,g,V(10,-3.4,0),'肌原纤维（ATP 用户）','Myofibril · myosin ATPase')]);
  part(s,'mmck',mmck,[addLabel(s,g,V(5.6,4.4,0),'肌原纤维 CK','MM-CK','sm')]);
  part(s,'pflow',fP,[addLabel(s,g,V(0,4.7,0),'PCr 送能量过去','PCr →','sm tag')]);
  part(s,'cflow',fC,[addLabel(s,g,V(0,-4.6,0),'Cr 回来再充电','← Cr','sm tag')]);
  s.updates.push(t=>{ mick.rotation.y=t; mmck.rotation.y=-t; myo.children.forEach((c,i)=>{}); });
})();
// ===== 3. depletion & recovery gauge =====
(function(){
  const s=station('gauge',V(120,0,0)), g=s.group;
  const shell=new THREE.Mesh(new THREE.CylinderGeometry(2.2,2.2,10,32,1,true),mat(0xffffff,{opacity:0.15,side:THREE.DoubleSide,depthWrite:false})); shell.position.set(-6,0,0); g.add(shell);
  const fill=new THREE.Mesh(new THREE.CylinderGeometry(2,2,1,32),mat(ORANGE,{emissive:0xff8800,emissiveIntensity:0.3})); fill.position.set(-6,0,0); g.add(fill);
  const lbl=addLabel(s,g,V(-6,6.2,0),'PCr 储量','100%');
  // timeline curve in 3D (ribbon)
  const pts=[]; for(let i=0;i<=120;i++){ const x=i/120*14; const tt=x/14*400; // seconds 0..400
    const lvl= tt<10? 1-0.75*tt/10 : 0.25+0.75*(1-Math.exp(-(tt-10)/45)); pts.push(V(1+x, -5+lvl*10, 0)); }
  const ln=tube(g,pts,0.12,0x6ee7ff,0.9);
  const axis=rod(g,V(1,-5,0),V(15.5,-5,0),0.05,0xffffff,{opacity:0.5}); rod(g,V(1,-5,0),V(1,5.5,0),0.05,0xffffff,{opacity:0.5});
  const dot=ball(g,V(1,5,0),0.35,0xffffff,{emissive:0xffffff,emissiveIntensity:0.6});
  addLabel(s,g,V(1.5,-6.2,0),'0 s','','sm'); addLabel(s,g,V(1+14*10/400,-6.9,0),'~10 s 全力','','sm');
  addLabel(s,g,V(1+14*30/400,-6.2,0),'30 s','','sm'); addLabel(s,g,V(1+14*180/400,-6.2,0),'3 min','','sm'); addLabel(s,g,V(15,-6.2,0),'~7 min','','sm');
  part(s,'tank',[shell,fill],[lbl]);
  part(s,'curve',[ln.mesh,dot],[addLabel(s,g,V(9,6.5,0),'全力消耗 → 休息恢复（示意）','Depletion & recovery','sm tag')]);
  s.updates.push(t=>{ const tt=(t*40)%400; const lvl= tt<10? 1-0.75*tt/10 : 0.25+0.75*(1-Math.exp(-(tt-10)/45));
    fill.scale.y=Math.max(0.05,lvl*9.6); fill.position.y=-4.8+lvl*4.8; dot.position.copy(pts[Math.round(tt/400*120)]);
    lbl.element.querySelector('span').textContent=Math.round(lvl*100)+'%'+(tt<10?' · 消耗中':' · 恢复中'); });
})();
// ===== 4. synthesis organs =====
(function(){
  const s=station('synth',V(0,0,-80)), g=s.group;
  const kid=new THREE.Mesh(sphereGeo,mat(0xc0504d)); kid.scale.set(1.6,2.4,1.2); kid.position.set(-11,0,0); g.add(kid);
  const liv=new THREE.Mesh(sphereGeo,mat(0x8b3a2b)); liv.scale.set(4,2.3,2); liv.position.set(-1,3,0); g.add(liv);
  const mus=new THREE.Group(); mus.position.set(10,0,0); g.add(mus);
  for(let i=0;i<7;i++){ const a=i/7*Math.PI*2; const c=new THREE.Mesh(new THREE.CylinderGeometry(0.7,0.7,7,16),mat(0xd9686f)); c.rotation.z=Math.PI/2; c.position.set(0,Math.cos(a)*1.3,Math.sin(a)*1.3); mus.add(c);} 
  const blood=tube(g,[V(-14,-5,0),V(-6,-5.5,0),V(2,-5.5,0),V(14,-5,0)],0.5,0xff3344,0.25);
  const c1=curve([V(-11,-1.5,0.5),V(-9,-4.5,0.5),V(-4,-4.8,0.5),V(-2,0.8,0.5)]); tube(g,c1.points,0.07,0x9ad0ff,0.4); const f1=flow(g,c1,4,0.25,0x9ad0ff,0.25);
  const c2=curve([V(0.5,0.8,0.5),V(3,-4.6,0.5),V(7,-4.6,0.5),V(9,-1.6,0.5)]); tube(g,c2.points,0.07,BLUE,0.4); const f2=flow(g,c2,4,0.28,BLUE,0.25);
  const c3=curve([V(11,-1.8,-0.5),V(11,-6.5,-0.5),V(4,-8,-0.5),V(-11,-8.5,-0.5),V(-11,-2.5,-0.5)]); tube(g,c3.points,0.06,0xcccccc,0.3); const f3=flow(g,c3,5,0.2,0xdddddd,0.15);
  const food=ball(g,V(-1,9,0),0.6,0xffd166); const fc=curve([V(-1,8.4,0),V(4,7,0),V(8,3,0),V(9.5,1.8,0)]); tube(g,fc.points,0.06,0xffd166,0.35); const f4=flow(g,fc,3,0.22,0xffd166,0.2);
  part(s,'kidney',[kid,f1],[addLabel(s,g,V(-11,3.3,0),'肾脏：精氨酸 + 甘氨酸 → 胍基乙酸','Kidney · AGAT → GAA','sm')]);
  part(s,'liver',[liv,f2],[addLabel(s,g,V(-1,6,0),'肝脏：胍基乙酸 + 甲基（来自甲硫氨酸/SAM）→ 肌酸','Liver · GAMT','sm')]);
  part(s,'muscle',mus,[addLabel(s,g,V(10,3,0),'骨骼肌：储存约 95% 的肌酸','Skeletal muscle','sm')]);
  part(s,'out',f3,[addLabel(s,g,V(-3,-9.6,0),'每天约 2 g 以肌酸酐经肾排出','Creatinine → urine','sm tag')]);
  part(s,'food',[food,f4],[addLabel(s,g,V(-4.5,9.5,0),'食物（肉、鱼）约 1 g/天','Diet','sm tag')]);
  addLabel(s,g,V(2,-4,1),'血液','Blood','sm');
})();
// ===== 5. uptake via CrT =====
(function(){
  const s=station('crt',V(60,0,-80)), g=s.group;
  const memb=new THREE.Mesh(new THREE.BoxGeometry(30,2.4,10),mat(0xe6d28a,{opacity:0.45,depthWrite:false})); g.add(memb);
  const trs=[];[-8,0,8].forEach(x=>{ const t=new THREE.Mesh(new THREE.CylinderGeometry(1,1,3.4,16,1,true),mat(0x43c06b,{side:THREE.DoubleSide})); t.position.set(x,0,0); g.add(t); trs.push(t); });
  const flows=[]; [-8,0,8].forEach(x=>{ const c=curve([V(x-0.3,6,0),V(x,1.5,0),V(x,-1.5,0),V(x+0.5,-6,0)]); flows.push(flow(g,c,4,0.38,BLUE,0.18)); const na=curve([V(x+0.6,6,0.6),V(x+0.5,0,0.6),V(x+0.9,-6,0.6)]); flows.push(flow(g,na,5,0.18,0xffe066,0.22,{})); });
  const ir=new THREE.Mesh(new THREE.TorusKnotGeometry(0.8,0.25,40,8),mat(0xff6f91)); ir.position.set(-13,1.5,0); g.add(ir);
  addLabel(s,g,V(-13,7,0),'血液（细胞外）','Blood / ECF','tag'); addLabel(s,g,V(-13,-7,0),'肌细胞内','Muscle cytosol','tag');
  part(s,'crt',trs,[addLabel(s,g,V(0,-3.2,3),'肌酸转运体 CrT（SLC6A8）','Na⁺/Cl⁻-coupled','sm')]);
  part(s,'crflow',flows,[addLabel(s,g,V(4,5.2,0),'肌酸 + 2Na⁺ + Cl⁻ 一同进入','Creatine + Na⁺','sm tag')]);
  part(s,'ins',ir,[addLabel(s,g,V(-13,3.5,0),'胰岛素信号：提高摄取','Insulin ↑ uptake','sm')]);
  s.updates.push(t=>{ ir.rotation.y=t*0.6; });
})();
// ===== 6. loading vs maintenance bars =====
(function(){
  const s=station('load',V(120,0,-80)), g=s.group;
  const days=[0,2,4,6,10,14,21,28]; const X=d=>-12+d*0.85;
  const L=d=>Math.min(1,1-Math.exp(-d/1.8)), M=d=>1-Math.exp(-d/10);
  const bl=[],bm=[];
  days.forEach(d=>{ const a=new THREE.Mesh(new THREE.BoxGeometry(0.7,1,0.7),mat(ORANGE)); a.position.set(X(d)-0.4,0,0); g.add(a); bl.push([a,d]);
    const b=new THREE.Mesh(new THREE.BoxGeometry(0.7,1,0.7),mat(0x6ee7ff)); b.position.set(X(d)+0.4,0,0); g.add(b); bm.push([b,d]);
    addLabel(s,g,V(X(d),-1.2,0),d+' 天','','sm'); });
  rod(g,V(-13,0,0),V(13.5,0,0),0.05,0xffffff,{opacity:0.5});
  const cap=rod(g,V(-13,8,0),V(13.5,8,0),0.06,0xff6b6b,{opacity:0.8});
  part(s,'loadb',bl.map(x=>x[0]),[addLabel(s,g,V(-9,9.6,0),'冲击法：20–30 g/天 × 5–7 天','Loading','sm tag')]);
  part(s,'mainb',bm.map(x=>x[0]),[addLabel(s,g,V(6,9.6,0),'小剂量：3 g/天，约 28 天也能充满','3 g/day','sm tag')]);
  part(s,'cap',cap,[addLabel(s,g,V(13,8.8,0),'上限：肌肉约 120–160 g','Ceiling','sm')]);
  addLabel(s,g,V(-14.5,5,0),'↑ 肌肉肌酸增幅（相对，示意）','','sm');
  s.updates.push(t=>{ const k=Math.min(1,(t%8)/5); bl.forEach(([m,d])=>{ const h=0.1+7.9*L(d)*k; m.scale.y=h; m.position.y=h/2; }); bm.forEach(([m,d])=>{ const h=0.1+7.9*M(d)*k; m.scale.y=h; m.position.y=h/2; }); });
})();
// ===== 7. water & glycogen =====
(function(){
  const s=station('water',V(0,0,-160)), g=s.group;
  const cell=new THREE.Mesh(new THREE.CylinderGeometry(3,3,14,32),mat(0xd9686f,{opacity:0.55,depthWrite:false})); cell.rotation.z=Math.PI/2; g.add(cell);
  const gly=new THREE.InstancedMesh(sphereGeo,mat(0xffd166,{emissive:0xffaa00,emissiveIntensity:0.3}),40); g.add(gly); const M4=new THREE.Matrix4(), Q=new THREE.Quaternion(); const gp=[];
  for(let i=0;i<40;i++) gp.push(V((Math.random()*2-1)*6,(Math.random()*2-1)*2,(Math.random()*2-1)*2));
  const wat=new THREE.InstancedMesh(sphereGeo,mat(0x6ec8ff,{opacity:0.8}),60); g.add(wat); const wp=[]; for(let i=0;i<60;i++) wp.push([Math.random()*14-7,Math.random()*6.28,Math.random()]);
  part(s,'cell',cell,[addLabel(s,g,V(0,4.6,0),'肌纤维体积增大（细胞内水）','Cell volumizing')]);
  part(s,'gly',gly,[addLabel(s,g,V(-5,-4.6,0),'糖原 +23% 以上（书）','Glycogen · ~3 g water / g','sm')]);
  part(s,'wat',wat,[addLabel(s,g,V(8.5,3,0),'水被肌酸与糖原带入','Water in','sm tag')]);
  s.updates.push(t=>{ const sw=1+0.08*Math.sin(t*0.8); cell.scale.set(sw,1,sw);
    for(let i=0;i<40;i++){ M4.compose(gp[i],Q,V(0.32,0.32,0.32)); gly.setMatrixAt(i,M4);} gly.instanceMatrix.needsUpdate=true;
    for(let i=0;i<60;i++){ const w=wp[i]; const u=((t*0.15+w[2])%1); const r=6-u*4.5; M4.compose(V(w[0],Math.cos(w[1])*r,Math.sin(w[1])*r),Q,V(0.18,0.18,0.18)); wat.setMatrixAt(i,M4);} wat.instanceMatrix.needsUpdate=true; });
})();
// ===== 8. responders =====
(function(){
  const s=station('resp',V(60,0,-160)), g=s.group;
  const cols=[[-8,0.62,0.95,'素食/低基线','Low baseline'],[0,0.78,0.95,'普通杂食','Typical'],[8,0.9,0.96,'高基线（无反应者）','High baseline']];
  const bars=[];
  cols.forEach(([x,b,a,zh,en])=>{ const base=new THREE.Mesh(new THREE.CylinderGeometry(1.4,1.4,1,24),mat(0x7fa8ff)); base.scale.y=b*8; base.position.set(x,b*4,0); g.add(base);
    const add=new THREE.Mesh(new THREE.CylinderGeometry(1.45,1.45,1,24),mat(ORANGE,{opacity:0.85,emissive:0xff8800,emissiveIntensity:0.3})); g.add(add); bars.push([add,x,b,a]);
    addLabel(s,g,V(x,-1.4,0),zh,en,'sm'); });
  rod(g,V(-11,8,0),V(11,8,0),0.06,0xff6b6b,{opacity:0.8}); addLabel(s,g,V(12.5,8,0),'储存上限','Ceiling','sm');
  part(s,'base',[],[addLabel(s,g,V(-12,3,0),'蓝：补充前','Before','sm')]);
  part(s,'add',bars.map(b=>b[0]),[addLabel(s,g,V(-12,1.6,0),'橙：补充后增量','Gain','sm tag')]);
  s.updates.push(t=>{ const k=Math.min(1,(t%6)/3); bars.forEach(([m,x,b,a])=>{ const h=Math.max(0.01,(a-b)*8*k); m.scale.y=h; m.position.set(x,b*8+h/2,0); }); });
})();
})();
