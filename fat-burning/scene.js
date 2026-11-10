/* 燃脂全过程场景 */
(function(){
const {THREE,V,mat,ball,rod,tube,flow,curve,station,part,addLabel,sphereGeo}=J;
const FA=0xffe08a, GLY=0x9ad0ff, ADR=0xff6b6b, ALB=0x7fa8ff;
function membrane(g,W,D,y,col,op){ const m=new THREE.Mesh(new THREE.BoxGeometry(W,1.6,D),mat(col||0xe6d28a,{opacity:op||0.4,depthWrite:false})); m.position.y=y||0; g.add(m); return m; }
function faChain(g,n,col){ const c=new THREE.Group(); g.add(c); for(let i=0;i<n;i++) ball(c,V(i*0.55,(i%2?0.22:-0.22),0),0.28,col||0xaab2c0); return c; }
// ===== 1. hormone signal on adipocyte =====
(function(){
  const s=station('sig',V(0,0,0)), g=s.group;
  membrane(g,28,10,3);
  const recs=[]; [-6,0,6].forEach(x=>{ const r=new THREE.Group(); r.position.set(x,3,0); g.add(r); for(let k=0;k<7;k++){ const a=k/7*Math.PI*2; const h=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.22,2.4,8),mat(0x9a8ad6)); h.position.set(Math.cos(a)*0.6,0,Math.sin(a)*0.6); r.add(h);} recs.push(r); });
  const adr=[]; for(let i=0;i<6;i++) adr.push(ball(g,V(0,0,0),0.4,ADR,{emissive:0xff3333,emissiveIntensity:0.5}));
  const camp=new THREE.InstancedMesh(sphereGeo,mat(0x6ee7ff,{emissive:0x22bbdd,emissiveIntensity:0.6}),24); g.add(camp); const M=new THREE.Matrix4(), Q=new THREE.Quaternion(); const cp=[]; for(let i=0;i<24;i++) cp.push([Math.random()*16-8,Math.random()*6.28,Math.random()]);
  const pka=new THREE.Mesh(new THREE.IcosahedronGeometry(1.2,1),mat(0xff9f6b,{flatShading:true})); pka.position.set(0,-4,0); g.add(pka);
  const drop=ball(g,V(0,-11,0),4,0xffd166,{opacity:0.8});
  const insB=ball(g,V(11,7,0),0.6,0xffd166,{opacity:0.35});
  part(s,'adr',adr,[addLabel(s,g,V(-9,8,0),'肾上腺素 / 去甲肾上腺素','Adrenaline · noradrenaline','sm')]);
  part(s,'rec',recs,[addLabel(s,g,V(-10.5,4.8,0),'β-肾上腺素受体','β-adrenergic receptor','sm')]);
  part(s,'camp',camp,[addLabel(s,g,V(-8,-1.5,0),'cAMP 升高','second messenger','sm')]);
  part(s,'pka',pka,[addLabel(s,g,V(3.6,-4,0),'PKA → 激活脂解酶','Protein kinase A','sm')]);
  part(s,'drop',drop,[addLabel(s,g,V(0,-6.2,0),'脂滴（甘油三酯）','Lipid droplet','sm')]);
  part(s,'ins',insB,[addLabel(s,g,V(11,8.6,0),'前提：胰岛素低','Low insulin','sm tag')]);
  addLabel(s,g,V(12,1,0),'脂肪细胞膜','Adipocyte membrane','sm');
  s.updates.push(t=>{ adr.forEach((a,i)=>{ const u=((t*0.25+i/6)%1); const x=[-6,0,6][i%3]; a.position.set(x+(1-u)*2, 4.4+(1-u)*5,0); a.visible=u<0.97; });
    for(let i=0;i<24;i++){ const c=cp[i]; const u=((t*0.3+c[2])%1); M.compose(V(c[0]*(1-u*0.8),1.5-u*5,Math.sin(c[1])*2),Q,V(0.22,0.22,0.22)); camp.setMatrixAt(i,M);} camp.instanceMatrix.needsUpdate=true; pka.rotation.y=t; });
})();
// ===== 2. lipolysis TG -> glycerol + 3 FA =====
(function(){
  const s=station('lip',V(60,0,0)), g=s.group;
  const gl=new THREE.Group(); g.add(gl); [0,1,2].forEach(k=>ball(gl,V(-4,1.8-k*1.8,0),0.55,GLY));
  const chains=[0,1,2].map(k=>{ const c=faChain(g,16,0xaab2c0); c.userData.y=1.8-k*1.8; return c; });
  const enz=[['ATGL','',0xb07cff],['HSL','',0xff9f6b],['MGL','',0x7fd38a]].map(([n,e,c],k)=>{ const m=new THREE.Mesh(new THREE.IcosahedronGeometry(0.8,1),mat(c,{flatShading:true})); g.add(m); return m; });
  part(s,'gly',gl,[addLabel(s,g,V(-5.2,4,0),'甘油','Glycerol','sm')]);
  part(s,'fa',chains,[addLabel(s,g,V(4,4.2,0),'3 条脂肪酸','3 fatty acids','sm')]);
  part(s,'enz',enz,[addLabel(s,g,V(-4,-5.4,0),'依次切下：ATGL → HSL → MGL','Stepwise hydrolysis','sm tag')]);
  addLabel(s,g,V(0,7,0),'甘油三酯 → 甘油 + 3 游离脂肪酸','Triglyceride hydrolysis','tag');
  s.updates.push(t=>{ const c=(t%9)/9*3; chains.forEach((ch,k)=>{ const d=Math.min(1,Math.max(0,c-k)); ch.position.set(-3.3+d*5,ch.userData.y+d*(k-1)*1.2,d*2*(k-1)); });
    enz.forEach((e,k)=>{ const on=c>k&&c<k+1; e.position.set(-3,ch(k),1.2); e.scale.setScalar(on?1.2:0.7); e.rotation.y=t*2; });
    function ch(k){ return 1.8-k*1.8; }
    gl.position.x = c>2.9? (c-2.9)*-10 : 0; });
})();
// ===== 3. blood: albumin carries FFA, glycerol to liver =====
(function(){
  const s=station('blood',V(120,0,0)), g=s.group;
  const vessel=new THREE.Mesh(new THREE.CylinderGeometry(4,4,30,32,1,true),mat(0xff3344,{opacity:0.16,side:THREE.DoubleSide,depthWrite:false})); vessel.rotation.z=Math.PI/2; g.add(vessel);
  const alb=[]; for(let i=0;i<6;i++){ const a=new THREE.Group(); g.add(a); ball(a,V(0,0,0),1.1,ALB,{opacity:0.9}); for(let k=0;k<3;k++){ const f=faChain(a,6,FA); f.scale.setScalar(0.6); f.position.set(0.8,(k-1)*0.7,0.6); f.rotation.z=(k-1)*0.6; } a.userData.ph=i/6; a.userData.y=(i%3-1)*2; alb.push(a); }
  const rbc=[]; for(let i=0;i<5;i++){ const r=new THREE.Mesh(new THREE.TorusGeometry(0.7,0.4,10,20),mat(0xd22a3a)); g.add(r); r.userData.ph=i/5+0.1; rbc.push(r); }
  const gF=flow(g,curve([V(-12,0,2),V(0,2.5,2),V(12,-1,2)]),6,0.3,GLY,0.18);
  const liver=new THREE.Mesh(sphereGeo,mat(0x8b3a2b)); liver.scale.set(3.4,2,2); liver.position.set(13,-7,0); g.add(liver);
  part(s,'alb',alb,[addLabel(s,g,V(-6,5.4,0),'白蛋白搭载脂肪酸','FFA bound to albumin','sm')]);
  part(s,'gly',gF,[addLabel(s,g,V(4,5.2,0),'甘油 → 肝脏（糖异生）','Glycerol → liver','sm')]);
  part(s,'liver',liver,[addLabel(s,g,V(13,-10,0),'多余脂肪酸被肝脏摄取：酮体或重新打包','Liver: ketones / VLDL','sm')]);
  part(s,'rbc',rbc,[]);
  addLabel(s,g,V(-14,-5.5,0),'血液','Blood','tag');
  s.updates.push(t=>{ alb.forEach(a=>{ const u=((t*0.08+a.userData.ph)%1); a.position.set(-14+u*28,a.userData.y,Math.sin(u*9)*1.5); a.rotation.y=t*0.5; });
    rbc.forEach(r=>{ const u=((t*0.1+r.userData.ph)%1); r.position.set(-14+u*28,Math.sin(u*12)*2.4,-1.5); r.rotation.y=u*6; }); });
})();
// ===== 4. muscle uptake via CD36, IMTG =====
(function(){
  const s=station('up',V(0,0,-80)), g=s.group;
  membrane(g,28,10,4,0xff8fa0,0.35);
  const tr=[]; [-6,0,6].forEach(x=>{ const t=new THREE.Mesh(new THREE.CylinderGeometry(0.8,0.8,3,14,1,true),mat(0x43c06b,{side:THREE.DoubleSide})); t.position.set(x,4,0); g.add(t); tr.push(t); });
  const fl=[]; [-6,0,6].forEach(x=>fl.push(flow(g,curve([V(x-1,9,0),V(x,4,0),V(x+1,-1,0),V(x+2,-4,0)]),4,0.3,FA,0.22)));
  const im=[]; [[-9,-5],[-3,-6.5],[4,-5.5],[10,-6]].forEach(([x,y])=>im.push(ball(g,V(x,y,0.5),1.1,0xffd166,{opacity:0.9})));
  const mt=[]; [[-6,-6.5],[0,-5.5],[7,-6.8]].forEach(([x,y])=>{ const m=new THREE.Mesh(sphereGeo,mat(0xff8f6b)); m.scale.set(2,0.9,0.9); m.position.set(x,y,0); g.add(m); mt.push(m); });
  part(s,'tr',tr,[addLabel(s,g,V(0,1.4,3),'脂肪酸转运蛋白（CD36 等）','FA transporters','sm')]);
  part(s,'fl',fl,[addLabel(s,g,V(-10,9.5,0),'来自血液的脂肪酸','Plasma FFA','sm')]);
  part(s,'imtg',im,[addLabel(s,g,V(-9,-7.6,0),'肌内甘油三酯 IMTG','Intramuscular TG','sm')]);
  part(s,'mito',mt,[addLabel(s,g,V(7,-8.6,0),'线粒体','Mitochondria','sm')]);
  addLabel(s,g,V(-13,7,0),'血液','Blood','tag'); addLabel(s,g,V(-13,-2,0),'肌细胞内','Muscle cell','tag');
})();
// ===== 5. carnitine shuttle =====
(function(){
  const s=station('cpt',V(60,0,-80)), g=s.group;
  const om=membrane(g,26,9,4,0xff9f6b,0.35), imb=membrane(g,26,9,-3,0xff6f91,0.45);
  const cpt1=new THREE.Mesh(new THREE.TorusGeometry(1,0.35,10,30),mat(0xb07cff)); cpt1.rotation.x=Math.PI/2; cpt1.position.set(-2,4,0); g.add(cpt1);
  const cact=new THREE.Mesh(new THREE.CylinderGeometry(0.9,0.9,2.6,16,1,true),mat(0x43c06b,{side:THREE.DoubleSide})); cact.position.set(0,-3,0); g.add(cact);
  const cpt2=new THREE.Mesh(new THREE.TorusGeometry(1,0.35,10,30),mat(0xc792ff)); cpt2.rotation.x=Math.PI/2; cpt2.position.set(2,-4.8,0); g.add(cpt2);
  const path=curve([V(-10,8,0),V(-2,5.5,0),V(-1,4,0),V(-0.4,0.5,0),V(0,-3,0),V(2,-5.2,0),V(9,-8,0)]); tube(g,path.points,0.07,FA,0.3);
  const fa=faChain(g,8,FA); fa.scale.setScalar(0.7); const car=ball(g,V(0,0,0),0.45,0x6ee7ff,{emissive:0x22bbdd,emissiveIntensity:0.5}); const coa=ball(g,V(0,0,0),0.5,0xb07cff);
  const mal=ball(g,V(-5.5,6.5,0),0.5,0xff4d4d,{emissive:0xff2222,emissiveIntensity:0.4});
  part(s,'cpt1',[cpt1,om],[addLabel(s,g,V(-6,4,4),'CPT1（外膜）：脂酰CoA → 脂酰肉碱','CPT1','sm')]);
  part(s,'cact',cact,[addLabel(s,g,V(-5,-3,4),'转位酶 CACT（内膜）','Translocase','sm')]);
  part(s,'cpt2',[cpt2,imb],[addLabel(s,g,V(6,-5,4),'CPT2：换回脂酰CoA，肉碱回收','CPT2','sm')]);
  part(s,'mob',[fa,car,coa],[]);
  part(s,'mal',mal,[addLabel(s,g,V(-8.5,7.6,0),'丙二酸单酰CoA 抑制 CPT1（糖多时）','Malonyl-CoA ⊣ CPT1','sm tag')]);
  addLabel(s,g,V(-12,7,0),'细胞质','Cytosol','tag'); addLabel(s,g,V(-12,0.5,0),'膜间隙','IMS','sm'); addLabel(s,g,V(-12,-6.5,0),'线粒体基质','Matrix','tag');
  s.updates.push(t=>{ const u=(t*0.12)%1; const p=path.getPointAt(u); fa.position.copy(p).add(V(-2.2,0,0));
    const withCar=u>0.3&&u<0.68; car.visible=withCar; coa.visible=!withCar; car.position.copy(p).add(V(0.4,0,0)); coa.position.copy(p).add(V(0.4,0,0)); });
})();
// ===== 6. beta oxidation =====
(function(){
  const s=station('box',V(120,0,-80)), g=s.group;
  const chain=new THREE.Group(); g.add(chain); const C=[]; for(let j=0;j<16;j++) C.push(ball(chain,V(0,0,0),0.42,0xaab2c0));
  const coa=ball(g,V(7,0,0),0.75,0xb07cff);
  const fad=ball(g,V(0,0,0),0.32,0xc792ff,{emissive:0x9955ee,emissiveIntensity:0.6}), nad=ball(g,V(0,0,0),0.32,0x6ee7ff,{emissive:0x22bbdd,emissiveIntensity:0.6});
  const ac=[]; for(let k=0;k<8;k++) ac.push(ball(g,V(0,0,0),0.38,0xff9f6b,{emissive:0xff7733,emissiveIntensity:0.4}));
  const tca=new THREE.Mesh(new THREE.TorusGeometry(2.2,0.15,10,60),mat(0x7ad1ff,{opacity:0.6})); tca.position.set(12,-5,0); g.add(tca);
  part(s,'chain',chain,[addLabel(s,g,V(-2,2.2,0),'棕榈酰CoA（C16）','Palmitoyl-CoA','sm')]);
  part(s,'coa',coa,[addLabel(s,g,V(7,1.6,0),'CoA','','sm')]);
  part(s,'prod',[fad,nad],[addLabel(s,g,V(4,-4.2,0),'每轮：1 FADH₂ + 1 NADH','per round','sm tag')]);
  part(s,'acoa',ac.concat([tca]),[addLabel(s,g,V(12,-8.2,0),'乙酰CoA → 三羧酸循环','Acetyl-CoA → TCA','sm tag')]);
  addLabel(s,g,V(0,6,0),'β 氧化：每轮切下 2 个碳，共 7 轮 → 8 乙酰CoA','β-oxidation spiral','tag');
  s.updates.push(t=>{ const P=1.6, k=Math.floor(t/P)%8, f=(t/P)%1; const cut=k*2;
    for(let j=0;j<16;j++){ const keep=j<16-cut; C[j].visible=keep; if(keep) C[j].position.set(6.2-0.9*(16-cut-j),(j%2?0.32:-0.32),0); C[j].material.color.setHex(keep&&j>=16-cut-2?0xff9f6b:0xaab2c0); }
    ac.forEach((a,i)=>{ const born=i<(k===7?8:k); a.visible=born; if(born){ const ang=t*0.8+i*0.785; a.position.set(12+Math.cos(ang)*2.2,-5+Math.sin(ang)*2.2,0);} });
    const pv=k>=1&&k<=7; fad.visible=nad.visible=pv; if(pv){ fad.position.set(4+f*1.5,-1-f*2,0.6); nad.position.set(5+f*1.5,-1.2-f*2,-0.6);} tca.rotation.z=t*0.3; });
})();
// ===== 7. insulin brake =====
(function(){
  const s=station('brake',V(0,0,-160)), g=s.group;
  const cell=new THREE.Mesh(sphereGeo,mat(0xffe0a0,{opacity:0.22,depthWrite:false})); cell.scale.setScalar(6.5); g.add(cell);
  const drop=ball(g,V(0,0,0),5,0xffd166,{opacity:0.85});
  const out=flow(g,curve([V(4,1,0),V(8,2,0),V(14,3,0)]),6,0.3,FA,0.3);
  const ins=[]; for(let i=0;i<10;i++) ins.push(ball(g,V(0,0,0),0.42,0xffd166,{emissive:0xffaa00,emissiveIntensity:0.5}));
  const gauge=addLabel(s,g,V(0,8.5,0),'胰岛素','');
  part(s,'cell',[cell,drop],[addLabel(s,g,V(-8,-6,0),'脂肪细胞','Adipocyte','sm')]);
  part(s,'out',out,[addLabel(s,g,V(11,5,0),'脂肪酸释放','FFA release','sm tag')]);
  part(s,'ins',ins,[gauge]);
  s.updates.push(t=>{ const c=(t%10)/10; const high=c>0.5; ins.forEach((m,i)=>{ m.visible=high; const a=i/10*Math.PI*2+t*0.5; m.position.set(Math.cos(a)*8,Math.sin(a)*6,0); });
    out.visible=!high; gauge.element.querySelector('b').textContent=high?'进食后：胰岛素高 → 脂解被抑制':'空腹/运动：胰岛素低 → 脂解进行'; });
})();
})();
