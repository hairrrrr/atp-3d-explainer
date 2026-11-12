(function(J,K){
const {THREE,V,mat,ball,rod,tube,flow,curve,station,part,addLabel}=J;
const AA=[0x4a86ff,0x43c06b,0xffc857,0xff6b6b,0xb07cff,0x5fd3b0,0xff9f6b];
// 1. folded protein & denaturation
(function(){ const s=station('prot',V(0,0,0)), g=s.group;
  const n=40, beads=[], folded=[], open=[];
  for(let i=0;i<n;i++){ const a=i*0.55, r=2.2+0.9*Math.sin(i*0.7); folded.push(V(Math.cos(a)*r-4, Math.sin(i*0.37)*2.2, Math.sin(a)*r)); open.push(V(-9+i*0.45, Math.sin(i*0.9)*0.6, 0)); }
  const G=new THREE.Group(); g.add(G);
  for(let i=0;i<n;i++) beads.push(ball(G,folded[i],0.34,AA[i%7]));
  const bonds=[]; for(let i=1;i<n;i++) bonds.push(rod(G,folded[i-1],folded[i],0.07,0xdddddd));
  const free=new THREE.Group(); g.add(free); for(let i=0;i<7;i++) ball(free,V(6+ (i%4)*1.1, 2.5-Math.floor(i/4)*1.2,0),0.4,AA[i]);
  part(s,'chain',G,[addLabel(s,g,V(-4,4.2,0),'蛋白质：氨基酸链折叠成三维结构','Folded protein','sm')]);
  part(s,'aa',free,[addLabel(s,g,V(7.6,4.2,0),'20 种氨基酸（含必需氨基酸）','Amino acids','sm')]);
  const tmp=V(0,0,0);
  s.updates.push(t=>{ const u=0.5-0.5*Math.cos(t*0.6); // fold <-> denature
    for(let i=0;i<n;i++){ tmp.lerpVectors(folded[i],open[i],u); beads[i].position.copy(tmp);} 
    for(let i=1;i<n;i++){ const a=beads[i-1].position,b=beads[i].position,d=b.clone().sub(a); bonds[i-1].position.copy(a).addScaledVector(d,0.5); bonds[i-1].scale.y=d.length()/folded[i].distanceTo(folded[i-1]); bonds[i-1].quaternion.setFromUnitVectors(V(0,1,0),d.normalize()); } });
  addLabel(s,g,V(-4,-4.4,0),'胃酸 / 加热 → 变性（结构展开）','Denaturation','sm tag');
})();
// 2/5. gut
(function(){ const s=station('gut',V(60,0,0)), g=s.group;
  const G=K.gut(s,g,{liver:true,pancreas:true});
  const food=flow(g,G.curve,24,0.28,0xff9f6b,0.03);
  const acid=new THREE.Group(); g.add(acid); for(let i=0;i<16;i++) ball(acid,V(3.4+(Math.random()-0.5)*3.6,2.8+(Math.random()-0.5)*2.2,1.7),0.12,0xff3b3b,{emissive:0xff0000,emissiveIntensity:0.4});
  const panT=tube(g,[V(1.6,0.9,1.6),V(3.6,0.4,1.2),V(5.2,0.6,0.6)],0.12,0xf2d08a,0.9); const pf=flow(g,panT.curve,4,0.15,0xf2d08a,0.4);
  const portal=tube(g,[V(1,-3,0.8),V(-1,-0.5,1.4),V(-2.2,2.6,1.5)],0.3,0x7d2f6b,0.75); const pof=flow(g,portal.curve,8,0.2,0x43c06b,0.3);
  part(s,'mouth',G.mouth,[G.L.mouth]); part(s,'stomach',[G.stomach,acid],[G.L.stomach,addLabel(s,g,V(7.8,1.2,0),'胃酸（HCl）+ 胃蛋白酶','HCl · pepsin','sm tag')]);
  part(s,'small',G.small.mesh,[G.L.small]); part(s,'large',G.large.mesh,[G.L.large]); part(s,'food',food,[]);
  part(s,'pancreas',[G.pancreas,panT.mesh,pf],[G.L.pancreas,addLabel(s,g,V(4.6,-1.2,2.2),'胰蛋白酶等','Trypsin etc.','sm')]);
  part(s,'liver',G.liver,[G.L.liver]); part(s,'portal',[portal.mesh,pof],[addLabel(s,g,V(-1.4,-1.8,2.6),'门静脉','Portal vein','sm')]);
})();
// 3. lumen cutting
(function(){ const s=station('lumen',V(120,0,0)), g=s.group;
  const wall=K.villi(s,g); wall.position.y=-6; wall.scale.set(1.1,0.7,0.6);
  const pieces=[]; const seg=[[0,8],[8,13],[13,16],[16,18],[18,19],[19,20]];
  const cols=[]; for(let i=0;i<20;i++) cols.push(AA[i%7]);
  const P=new THREE.Group(); g.add(P);
  seg.forEach(([a,b],k)=>{ const sg=new THREE.Group(); P.add(sg); for(let i=a;i<b;i++) ball(sg,V((i-a)*0.75,(i%2?0.2:-0.2),0),0.32,cols[i]); sg.userData={a,b,k}; pieces.push(sg); });
  const enz=new THREE.Group(); g.add(enz); [[-3,4],[1,4],[4,4]].forEach(([x,y],i)=>{ const e=new THREE.Mesh(new THREE.TorusGeometry(0.5,0.18,8,20,Math.PI*1.4),mat([0xf2d08a,0xffa23b,0xb07cff][i])); e.position.set(x,y,0.6); enz.add(e); });
  const bb=new THREE.Group(); g.add(bb); [-6,-2,2,6].forEach(x=>{ const e=new THREE.Mesh(new THREE.TorusGeometry(0.35,0.12,8,16,Math.PI*1.4),mat(0x5fd3b0)); e.position.set(x,-0.7,1.2); bb.add(e); });
  part(s,'peptides',P,[addLabel(s,g,V(-9,5.4,0),'多肽链','Polypeptide','sm')]);
  part(s,'panc',enz,[addLabel(s,g,V(1,6,0),'胰蛋白酶 / 糜蛋白酶 / 羧肽酶','Pancreatic proteases','sm')]);
  part(s,'brush',bb,[addLabel(s,g,V(7.5,-0.2,1.2),'刷状缘肽酶','Brush-border peptidases','sm')]);
  part(s,'villi',wall,[]);
  addLabel(s,g,V(8.5,4.2,0),'→ 二肽、三肽 + 游离氨基酸','di/tripeptides + AA','sm tag');
  s.updates.push(t=>{ const u=(t*0.18)%1; pieces.forEach(p=>{ const {a,k}=p.userData; const spread=Math.min(1,u*1.6)*k*1.1; p.position.set(-9+a*0.75+spread, 2.6-u*2.2-(k>2?u:0), 0); }); });
})();
// 4. enterocyte: PepT1 + AA transporters
(function(){ const s=station('cell',V(0,0,-80)), g=s.group;
  const C=K.cell(s,g);
  const pept=K.pore(g,V(-4,4,0),0x4a86ff), aat=K.pore(g,V(1.5,4,0),0x43c06b), bl=K.pore(g,V(-1,-4,0),0xff9f6b), whole=K.pore(g,V(5.5,4,0),0x888888,1.2);
  const dp=curve([V(-4.5,8,0.9),V(-4,4,0.9),V(-3.5,1.8,0.9)]); const dpf=flow(g,dp,5,0.26,0x4a86ff,0.18);
  const hp=curve([V(-3.4,8,-0.9),V(-3.8,4,-0.9),V(-3.6,2,-0.9)]); const hpf=flow(g,hp,5,0.16,0xff4040,0.2);
  const ap=curve([V(1.8,8,0.9),V(1.5,4,0.9),V(0.5,0,0.9),V(-1,-4,0.9),V(-0.8,-7.4,0.9)]); const apf=flow(g,ap,8,0.22,0x43c06b,0.12);
  const cyto=new THREE.Mesh(new THREE.TorusGeometry(0.6,0.2,8,20,Math.PI*1.4),mat(0x5fd3b0)); cyto.position.set(-3,0.8,0.8); g.add(cyto);
  const out=curve([V(-3,0.8,0.9),V(-1.6,-2,0.9),V(-1,-4,1.1),V(-1.2,-7.4,1.1)]); const of=flow(g,out,5,0.2,0x43c06b,0.12);
  part(s,'pept1',[pept,dpf,hpf],[addLabel(s,g,V(-7.2,5.8,0),'PepT1：二肽/三肽 + H⁺','Peptide transporter','sm')]);
  part(s,'aat',[aat,apf],[addLabel(s,g,V(2.6,6.4,0),'氨基酸转运蛋白（多与 Na⁺ 偶联）','AA transporters','sm')]);
  part(s,'hydro',[cyto,of],[addLabel(s,g,V(-6.8,1.6,2),'细胞内肽酶 → 氨基酸','Cytosolic peptidases','sm')]);
  part(s,'exit',bl,[addLabel(s,g,V(-4.2,-5.6,0),'氨基酸出细胞 → 门静脉','Basolateral exit','sm')]);
  part(s,'whole',whole,[addLabel(s,g,V(7.6,5.6,0),'少量完整蛋白','Trace intact protein','sm')]);
  part(s,'cellbody',[C.body,C.nuc,C.vessel.mesh],[]);
})();
// 5. amino acid pool
(function(){ const s=station('pool',V(60,0,-80)), g=s.group;
  const pool=ball(g,V(0,0,0),3.2,0x5fd3b0,{opacity:0.45,depthWrite:false});
  const inner=new THREE.Group(); g.add(inner); for(let i=0;i<40;i++) ball(inner,V((Math.random()-0.5)*4,(Math.random()-0.5)*4,(Math.random()-0.5)*4),0.2,AA[i%7]);
  const mk=(pts,c,n,sp)=>{ const tb=tube(g,pts,0.18,c,0.4); return [tb.mesh,flow(g,tb.curve,n,0.22,c,sp)]; };
  const diet=mk([V(-12,6,0),V(-6,4,0),V(-2.4,1.8,0)],0x43c06b,6,0.2);
  const brk=mk([V(-12,-6,0),V(-6,-4,0),V(-2.4,-1.8,0)],0xff9f6b,5,0.15);
  const syn=mk([V(2.4,1.8,0),V(6,4,0),V(12,6,0)],0x4a86ff,6,0.2);
  const oxi=mk([V(2.4,-1.8,0),V(6,-4,0),V(12,-6,0)],0xff6b6b,4,0.15);
  const musc=new THREE.Group(); g.add(musc); for(let i=0;i<3;i++){ const c=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.5,5,14),mat(0xd96464)); c.rotation.z=Math.PI/2; c.position.set(14.5,6+i*0.0,-1+i); musc.add(c);}
  part(s,'pool',[pool,inner],[addLabel(s,g,V(0,4.4,0),'氨基酸代谢库','Amino-acid pool')]);
  part(s,'diet',diet,[addLabel(s,g,V(-12,7.4,0),'膳食蛋白（消化率约 96%）','Dietary protein','sm')]);
  part(s,'brk',brk,[addLabel(s,g,V(-12,-7.4,0),'自体蛋白持续降解','Protein breakdown','sm')]);
  part(s,'syn',[...syn,musc],[addLabel(s,g,V(12,8,0),'合成自体蛋白（肌肉、白蛋白…）','Protein synthesis','sm')]);
  part(s,'oxi',oxi,[addLabel(s,g,V(12,-7.4,0),'氧化供能 / 尿素排氮','Oxidation · urea','sm')]);
  s.updates.push(t=>{ inner.rotation.y=t*0.3; inner.rotation.x=t*0.17; });
})();
// 6. biological value bars
(function(){ const s=station('bv',V(120,0,-80)), g=s.group;
  const data=[['土豆+全蛋',136,0xffd166],['乳清蛋白',104,0x6ee7ff],['全鸡蛋',100,0xffffff],['牛奶',91,0xbfe3ff],['大豆',84,0x9ad49a],['牛肉',80,0xff8a8a],['酪蛋白',77,0xc9a7f0],['土豆',71,0xd9b38c],['小麦粉',54,0xf2d08a],['芸豆',49,0x8fbf6a]];
  const bars=new THREE.Group(); g.add(bars); const L=[];
  data.forEach(([n,v,c],i)=>{ const h=v*0.08; const b=new THREE.Mesh(new THREE.BoxGeometry(1.3,h,1.3),mat(c)); b.position.set(-11+i*2.45,h/2,0); bars.add(b); L.push(addLabel(s,g,V(-11+i*2.45,h+0.9,0),n,String(v),'sm')); });
  const ref=new THREE.Mesh(new THREE.BoxGeometry(26,0.05,1.8),mat(0xffffff,{opacity:0.5})); ref.position.y=8; g.add(ref);
  const D=[addLabel(s,g,V(9,9.6,0),'基准：全鸡蛋 = 100','reference','sm tag'), addLabel(s,g,V(0,-1.6,0),'生物价（BV，书中表 11 部分数据）','Biological value','sm')];
  // 手机竖屏专用排版：同一组数据改成横向条形图，食物名在左侧一行一个，避免柱顶标签挤在一起
  const hb=new THREE.Group(); g.add(hb); const HL=[], X0=-6, K=0.11, Y0=16.4, DY=2.35;
  data.forEach(([n,v,c],i)=>{ const w=v*K, y=Y0-i*DY; const b=new THREE.Mesh(new THREE.BoxGeometry(w,1.3,1.3),mat(c)); b.position.set(X0+w/2,y,0); hb.add(b);
    HL.push(addLabel(s,g,V(X0-4.6,y,0),n+'　'+v,'','sm')); });
  const href=new THREE.Mesh(new THREE.BoxGeometry(0.06,DY*10+0.6,1.8),mat(0xffffff,{opacity:0.5})); href.position.set(X0+100*K,Y0-DY*4.5,0); hb.add(href);
  const HD=[addLabel(s,g,V(X0+100*K,Y0-DY*9-2.4,0),'基准：全鸡蛋 = 100','reference','sm tag'), addLabel(s,g,V(-2,Y0+2.7,0),'生物价（BV，书中表 11 部分数据）','Biological value','sm')];
  part(s,'bars',[bars,hb],L.concat(HL));
  const mq=window.matchMedia('(max-width:820px)');
  s.updates.push(()=>{ const nar=mq.matches; bars.visible=ref.visible=!nar; hb.visible=nar; L.concat(D).forEach(l=>l.visible=!nar); HL.concat(HD).forEach(l=>l.visible=nar); });
})();
// 7. whey vs casein kinetics
(function(){ const s=station('kin',V(0,0,-160)), g=s.group;
  const X=t=>-12+t*3, Y=v=>v*7;
  const whey=[], cas=[]; for(let i=0;i<=8;i+=0.25){ whey.push(V(X(i),Y(Math.exp(-Math.pow((i-1)/0.7,2))+0.05),0.8)); cas.push(V(X(i),Y(0.42*Math.exp(-Math.pow((i-3.2)/2.4,2))+0.05),-0.8)); }
  const w=tube(g,whey,0.18,0x6ee7ff,0.9), c=tube(g,cas,0.18,0xc9a7f0,0.9);
  const ax=new THREE.Mesh(new THREE.BoxGeometry(25,0.08,0.08),mat(0xffffff,{opacity:0.6})); ax.position.set(0,0,0); g.add(ax);
  const ay=new THREE.Mesh(new THREE.BoxGeometry(0.08,8,0.08),mat(0xffffff,{opacity:0.6})); ay.position.set(-12,4,0); g.add(ay);
  const dw=ball(g,V(0,0,0.8),0.35,0x6ee7ff,{emissive:0x6ee7ff,emissiveIntensity:0.6}), dc=ball(g,V(0,0,-0.8),0.35,0xc9a7f0,{emissive:0xc9a7f0,emissiveIntensity:0.6});
  [0,2,4,6,8].forEach(h=>addLabel(s,g,V(X(h),-0.9,0),h+' 小时','','sm'));
  part(s,'whey',[w.mesh,dw],[addLabel(s,g,V(X(1.2),Y(1.05)+0.8,0.8),'乳清蛋白：快、高峰','Whey (fast)','sm')]);
  part(s,'casein',[c.mesh,dc],[addLabel(s,g,V(X(4.6),Y(0.46)+0.9,-0.8),'酪蛋白：慢、持久','Casein (slow)','sm')]);
  addLabel(s,g,V(-13.5,8.6,0),'↑ 血液氨基酸（示意）','plasma amino acids','sm');
  s.updates.push(t=>{ const u=(t*0.12)%1; dw.position.copy(w.curve.getPointAt(u)); dc.position.copy(c.curve.getPointAt(u)); });
})();
J.start();
})(JIG,KIT);
