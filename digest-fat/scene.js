(function(J,K){
const {THREE,V,mat,ball,rod,tube,flow,curve,station,part,addLabel}=J;
const FA=0xffd166, GLY=0x5fd3b0, BILE=0x7fbf5a, LIP=0xb07cff;
function fachain(p,start,n,dir,color){ const G=new THREE.Group(); p.add(G); let prev=null; for(let i=0;i<n;i++){ const q=V(start.x+dir*i*0.7, start.y+(i%2?0.28:-0.28), start.z); const b=ball(G,q,0.3,color||0x9aa4b8); if(prev) rod(G,prev,q,0.08,0xcccccc); prev=q;} ball(G,V(start.x-dir*0.55,start.y,start.z),0.36,0xff6b6b); return G; }
// 1. triglyceride
(function(){ const s=station('tg',V(0,0,0)), g=s.group;
  const gl=new THREE.Group(); g.add(gl); [2.2,0,-2.2].forEach(y=>ball(gl,V(-6,y,0),0.6,GLY)); rod(gl,V(-6,2.2,0),V(-6,-2.2,0),0.15,0xcccccc);
  const c1=fachain(g,V(-4.6,2.2,0),16,1,0x9aa4b8), c2=fachain(g,V(-4.6,0,0),18,1,0xb8c0d0), c3=fachain(g,V(-4.6,-2.2,0),8,1,0xffb36b);
  part(s,'glycerol',gl,[addLabel(s,g,V(-7.8,3.6,0),'甘油（载体）','Glycerol','sm')]);
  part(s,'lcfa',[c1,c2],[addLabel(s,g,V(7.4,3.4,0),'长链脂肪酸','Long-chain FA','sm')]);
  part(s,'mcfa',c3,[addLabel(s,g,V(1.8,-3.8,0),'中链脂肪酸（MCT，6~12 个碳）','Medium-chain FA','sm')]);
  addLabel(s,g,V(0,6,0),'甘油三酯 = 1 甘油 + 3 脂肪酸','Triglyceride · 9.3 kcal/g','tag');
  s.updates.push(t=>{ g.rotation.y=Math.sin(t*0.4)*0.3; });
})();
// 2/5. gut
(function(){ const s=station('gut',V(60,0,0)), g=s.group;
  const G=K.gut(s,g,{liver:true,pancreas:true,gall:true});
  const food=flow(g,G.curve,22,0.3,FA,0.03);
  const drops=new THREE.Group(); g.add(drops); for(let i=0;i<14;i++) ball(drops,V(3.4+(Math.random()-0.5)*3,2.8+(Math.random()-0.5)*2,1.7),0.22+Math.random()*0.2,FA,{emissive:0xffaa00,emissiveIntensity:0.3});
  const bileT=tube(g,[V(-1.2,2.2,2.4),V(0.2,1.0,1.8),V(4.8,0.6,0.6)],0.15,BILE,0.8); const bf=flow(g,bileT.curve,5,0.16,BILE,0.3);
  const lymph=tube(g,[V(2,-4,1),V(1,-1,2.6),V(0.2,4,2.4),V(-0.4,8,1.2),V(-2.2,9,0.5)],0.22,0xeeeeff,0.6); const lf=flow(g,lymph.curve,7,0.3,0xfff7d6,0.12);
  const portal=tube(g,[V(1,-3,0.8),V(-1,-0.5,1.4),V(-2.2,2.6,1.5)],0.3,0x7d2f6b,0.75); const pf=flow(g,portal.curve,8,0.2,0xffb36b,0.3);
  part(s,'mouth',G.mouth,[G.L.mouth]); part(s,'stomach',[G.stomach,drops],[G.L.stomach,addLabel(s,g,V(7.6,1.2,0),'胃：大块脂肪 → 细小乳滴，排空变慢','','sm tag')]);
  part(s,'small',G.small.mesh,[G.L.small]); part(s,'large',G.large.mesh,[G.L.large]); part(s,'food',food,[]);
  part(s,'gall',[G.gall,bileT.mesh,bf],[G.L.gall,addLabel(s,g,V(-3.6,-0.2,3),'胆汁','Bile','sm')]);
  part(s,'pancreas',G.pancreas,[G.L.pancreas]);
  part(s,'liver',G.liver,[G.L.liver]);
  part(s,'lymph',[lymph.mesh,lf],[addLabel(s,g,V(1.6,8.6,1.2),'淋巴管 → 锁骨下静脉','Lymph (chylomicrons)','sm')]);
  part(s,'portal',[portal.mesh,pf],[addLabel(s,g,V(-1.4,-1.8,2.6),'门静脉（MCT/短链）','Portal vein','sm')]);
})();
// 3/7. lumen: emulsification + lipase + micelles
(function(){ const s=station('lumen',V(120,0,0)), g=s.group;
  const big=ball(g,V(-9,1,0),2.6,FA,{opacity:0.9});
  const small=new THREE.Group(); g.add(small); const sm=[];
  for(let i=0;i<9;i++){ const d=new THREE.Group(); d.position.set(-3+ (i%3)*1.8, 3-Math.floor(i/3)*1.8, 0); ball(d,V(0,0,0),0.65,FA); for(let k=0;k<10;k++){ const a=k/10*Math.PI*2; ball(d,V(Math.cos(a)*0.75,Math.sin(a)*0.75,0.2),0.14,BILE);} small.add(d); sm.push(d);}
  const lip=new THREE.Group(); g.add(lip); const lp=[]; for(let i=0;i<3;i++){ const e=new THREE.Mesh(new THREE.TorusGeometry(0.45,0.16,8,20,Math.PI*1.4),mat(LIP)); e.position.set(-3+i*1.8,4.3,0.4); lip.add(e); lp.push(e);}
  const prod=new THREE.Group(); g.add(prod); for(let i=0;i<5;i++){ ball(prod,V(3.5+i*0.9,1.5+(i%2)*0.6,0),0.26,0x9aa4b8); } ball(prod,V(5.3,0,0),0.35,GLY);
  const mic=new THREE.Group(); g.add(mic); const mc=[]; for(let i=0;i<4;i++){ const m=new THREE.Group(); m.position.set(9+ (i%2)*1.6, 2-Math.floor(i/2)*1.8,0); for(let k=0;k<12;k++){const a=k/12*Math.PI*2; ball(m,V(Math.cos(a)*0.5,Math.sin(a)*0.5,0),0.13,k%3?BILE:0x9aa4b8);} mic.add(m); mc.push(m);}
  const wall=new THREE.Mesh(new THREE.BoxGeometry(30,1,8),mat(0xe88f8f)); wall.position.y=-4; g.add(wall);
  const block=new THREE.Mesh(new THREE.BoxGeometry(0.3,3,0.3),mat(0xff3b3b,{emissive:0xff0000,emissiveIntensity:0.5})); block.position.set(0.6,4.3,0.6); block.rotation.z=0.7; g.add(block);
  part(s,'big',big,[addLabel(s,g,V(-9,4.4,0),'大脂滴','Fat globule','sm')]);
  part(s,'emul',small,[addLabel(s,g,V(-1.2,6,0),'胆汁盐包裹 → 乳化成小乳滴','Emulsification','sm')]);
  part(s,'lipase',lip,[addLabel(s,g,V(-1.2,-1.6,0),'胰脂肪酶：从甘油上剪下脂肪酸','Pancreatic lipase','sm')]);
  part(s,'products',prod,[addLabel(s,g,V(5.2,3.2,0),'游离脂肪酸 + 单酰甘油','FFA + monoglyceride','sm')]);
  part(s,'micelle',mic,[addLabel(s,g,V(10,4,0),'微胶粒 → 送到肠壁','Micelles','sm')]);
  part(s,'orlistat',block,[addLabel(s,g,V(1.6,7.6,0),'奥利司他：抑制脂肪酶','Orlistat','sm tag')]);
  part(s,'wall',wall,[addLabel(s,g,V(-12,-3,4.5),'小肠壁','Intestinal wall','sm')]);
  s.updates.push(t=>{ sm.forEach((d,i)=>d.position.z=Math.sin(t+i)*0.4); lp.forEach((e,i)=>e.rotation.z=t*2+i); mc.forEach((m,i)=>{ m.position.y=(i<2?2:0.2)-((t*0.3+i*0.25)%1)*3.5; }); big.scale.setScalar(2.6+0.1*Math.sin(t*2)); });
})();
// 4. enterocyte packaging -> chylomicron -> lacteal
(function(){ const s=station('cell',V(0,0,-80)), g=s.group;
  const C=K.cell(s,g);
  const er=new THREE.Mesh(new THREE.TorusKnotGeometry(1.4,0.25,80,8,2,3),mat(0x6fa8ff,{opacity:0.8})); er.position.set(-2,0.5,0); g.add(er);
  const go=new THREE.Group(); g.add(go); for(let i=0;i<4;i++){ const c=new THREE.Mesh(new THREE.TorusGeometry(1.2-i*0.12,0.12,8,30,Math.PI),mat(0xffa3c4)); c.position.set(2.5,1-i*0.4,0); go.add(c);}
  const inP=curve([V(-6,8,0),V(-6,4.4,0),V(-3.5,1.5,0)]); const fin=flow(g,inP,6,0.22,0x9aa4b8,0.25);
  const chyP=curve([V(2.5,-0.2,0.5),V(1,-2.5,0.8),V(0,-4,0.8),V(-1,-7.2,0.8)]); const chy=flow(g,chyP,3,0.6,0xfff1c4,0.15,{opacity:0.9});
  const lacteal=tube(g,[V(-10,-7.5,1.5),V(0,-7.6,1.5),V(10,-7.5,1.5)],0.9,0xeeeeff,0.5);
  const mctP=curve([V(5,8,0),V(5,4.4,0),V(6,0,0),V(6.5,-4,0),V(7,-7.3,-1)]); const mct=flow(g,mctP,5,0.22,0xffb36b,0.3);
  part(s,'fain',fin,[addLabel(s,g,V(-8.6,6.2,0),'脂肪酸 + 单酰甘油进入','FA uptake','sm')]);
  part(s,'er',er,[addLabel(s,g,V(-3.6,2.8,2),'重新合成甘油三酯','Re-esterification','sm')]);
  part(s,'golgi',go,[addLabel(s,g,V(3.6,2.9,2),'加上胆固醇、磷脂、蛋白质','Packaging','sm')]);
  part(s,'chylo',chy,[addLabel(s,g,V(3.4,-5.4,2),'乳糜微粒','Chylomicron','sm tag')]);
  part(s,'lacteal',lacteal.mesh,[addLabel(s,g,V(-6,-9.4,2),'毛细淋巴管','Lacteal','sm')]);
  part(s,'mct',mct,[addLabel(s,g,V(8.8,1.5,0),'MCT 直接进血液','MCT → portal blood','sm tag')]);
  part(s,'cellbody',[C.body,C.nuc,C.vessel.mesh],[]);
  s.updates.push(t=>{ er.rotation.z=t*0.3; });
})();
// 6. fate: chylomicron -> adipose / muscle
(function(){ const s=station('fate',V(60,0,-80)), g=s.group;
  const vessel=tube(g,[V(-14,0,0),V(-4,0.5,0),V(4,0,0),V(14,0.5,0)],1.3,0xd94a4a,0.35);
  const chy=flow(g,vessel.curve,4,0.8,0xfff1c4,0.08,{opacity:0.95});
  const fat=new THREE.Group(); g.add(fat); for(let i=0;i<5;i++) ball(fat,V(-6+i*1.9,-4.5+(i%2)*0.6,0),1.0,0xffe08a,{opacity:0.9});
  const mus=new THREE.Group(); g.add(mus); for(let i=0;i<4;i++){ const c=new THREE.Mesh(new THREE.CylinderGeometry(0.7,0.7,9,16),mat(0xd96464)); c.rotation.z=Math.PI/2; c.position.set(6,4.5+i*0.0,-1.5+i*1.0); mus.add(c);}
  const fa1=flow(g,curve([V(-3,-0.5,0.5),V(-2.5,-2.2,0.5),V(-2,-4,0.5)]),4,0.18,0x9aa4b8,0.4), fa2=flow(g,curve([V(5,1,0.5),V(5.4,2.6,0.5),V(6,4.3,0.5)]),4,0.18,0x9aa4b8,0.4);
  part(s,'blood',[vessel.mesh,chy],[addLabel(s,g,V(-11,2.6,0),'血液中的乳糜微粒','Chylomicrons in blood','sm')]);
  part(s,'adipose',[fat,fa1],[addLabel(s,g,V(-2,-6.6,0),'脂肪细胞：储存','Adipocytes','sm')]);
  part(s,'muscle',[mus,fa2],[addLabel(s,g,V(9,6.8,0),'肌肉：燃烧','Muscle','sm')]);
  addLabel(s,g,V(11,-3,0),'脂蛋白脂肪酶释放脂肪酸','LPL (textbook)','sm tag');
})();
J.start();
})(JIG,KIT);
