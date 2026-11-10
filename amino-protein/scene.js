(function(J,M){
const {THREE,V,mat,ball,rod,tube,curve,station,part,addLabel}=J; const D=window.MOL;
const mirror=d=>({a:d.a.map(a=>[a[0],-a[1],a[2],a[3]]),b:d.b,t:d.t});
function find(d,el,pred){ return d.a.findIndex((a,i)=>a[0]===el && pred(i)); }
function nbrs(d,i){ return d.b.filter(b=>b[0]===i||b[1]===i).map(b=>b[0]===i?b[1]:b[0]); }
function alpha(d){ return d.a.findIndex((a,i)=>a[0]==='C' && nbrs(d,i).some(j=>d.a[j][0]==='N') && nbrs(d,i).some(j=>d.a[j][0]==='C' && nbrs(d,j).filter(k=>d.a[k][0]==='O').length===2)); }
// 1 general structure + L/D
(function(){ const s=station('gen',V(0,0,0)), g=s.group;
  const L=M.mol(g,D.lala,V(-5,0,0),1.3), R=M.mol(g,mirror(D.lala),V(5,0,0),1.3);
  const d=D.lala, ca=alpha(d), n=find(d,'N',()=>true), co=nbrs(d,ca).find(j=>d.a[j][0]==='C' && nbrs(d,j).filter(k=>d.a[k][0]==='O').length===2), cb=nbrs(d,ca).find(j=>d.a[j][0]==='C' && j!==co);
  const H=new THREE.Group(); L.G.add(H); M.halo(H,L.P[ca],0xffd166,0.6); const hn=M.halo(L.G,L.P[n],0x4a86ff,0.6), hc=M.halo(L.G,L.P[co],0xff6b6b,0.75), hr=M.halo(L.G,L.P[cb],0x5fd3b0,0.7);
  part(s,'ca',[H],[addLabel(s,g,M.wpos(L,ca).add(V(0,2.4,0)),'α-碳','α-carbon','sm')]);
  part(s,'nh2',[hn],[addLabel(s,g,M.wpos(L,n).add(V(-1.6,1.4,0)),'氨基 −NH₂','amino group','sm')]);
  part(s,'cooh',[hc],[addLabel(s,g,M.wpos(L,co).add(V(-1.6,-1.8,0)),'羧基 −COOH','carboxyl','sm')]);
  part(s,'r',[hr],[addLabel(s,g,M.wpos(L,cb).add(V(0,-1.9,0)),'侧链 R（这里是 −CH₃）','side chain R','sm')]);
  part(s,'L',[L.G],[addLabel(s,g,V(-5,4.6,0),'L-丙氨酸','L-alanine')]);
  part(s,'D',[R.G],[addLabel(s,g,V(5,4.6,0),'D-丙氨酸（镜像）','D-alanine (mirror)')]);
  addLabel(s,g,V(0,-5,0),'镜面','mirror plane','sm tag');
  const mp=new THREE.Mesh(new THREE.PlaneGeometry(0.05,8),mat(0x6ee7ff,{opacity:0.5})); g.add(mp);
})();
// 2 essential vs non-essential tokens
(function(){ const s=station('ess',V(60,0,0)), g=s.group;
  const E=['组氨酸 His','异亮氨酸 Ile','亮氨酸 Leu','赖氨酸 Lys','甲硫氨酸 Met','苯丙氨酸 Phe','苏氨酸 Thr','色氨酸 Trp','缬氨酸 Val'];
  const N=['丙氨酸 Ala','精氨酸 Arg','天冬酰胺 Asn','天冬氨酸 Asp','半胱氨酸 Cys','谷氨酸 Glu','谷氨酰胺 Gln','甘氨酸 Gly','脯氨酸 Pro','丝氨酸 Ser','酪氨酸 Tyr'];
  const A=new THREE.Group(), B=new THREE.Group(), C=new THREE.Group(); g.add(A); g.add(B); g.add(C); const LA=[], LB=[], LC=[];
  E.forEach((n,i)=>{ const p=V(-9+(i%3)*3.2, 4-Math.floor(i/3)*2.6,0); const bcaa=/Ile|Leu|Val/.test(n); ball(bcaa?C:A,p,0.7,bcaa?0xffd166:0xff8f6b); (bcaa?LC:LA).push(addLabel(s,g,p.clone().add(V(0,-1.1,0)),n.split(' ')[0],n.split(' ')[1],'sm')); });
  N.forEach((n,i)=>{ const p=V(2.5+(i%4)*2.8, 4-Math.floor(i/4)*2.6,0); ball(B,p,0.6,0x6ea8ff); LB.push(addLabel(s,g,p.clone().add(V(0,-1.1,0)),n.split(' ')[0],n.split(' ')[1],'sm')); });
  part(s,'e',A,LA.concat([addLabel(s,g,V(-6,6.6,0),'9 种必需氨基酸','Essential (9)')]));
  part(s,'bcaa',C,LC);
  part(s,'n',B,LB.concat([addLabel(s,g,V(6.7,6.6,0),'非必需 / 条件必需','Non-essential')]));
})();
// 3 BCAAs
(function(){ const s=station('bcaa',V(120,0,0)), g=s.group;
  [['leu','L-亮氨酸','Leucine',-8.5],['ile','L-异亮氨酸','Isoleucine',0],['val','L-缬氨酸','Valine',8.5]].forEach(([k,zh,en,x])=>{
    const d=D[k], m=M.mol(g,d,V(x,0,0),0.9), ca=alpha(d); const sideC=d.a.map((a,i)=>i).filter(i=>d.a[i][0]==='C' && i!==ca && !(nbrs(d,i).filter(j=>d.a[j][0]==='O').length===2));
    const h=new THREE.Group(); m.G.add(h); sideC.forEach(i=>M.halo(h,m.P[i],0x5fd3b0,0.5));
    part(s,k,[m.G],[addLabel(s,g,V(x,4.4,0),zh,en,'sm')]); part(s,k+'R',[h],[]); });
  addLabel(s,g,V(0,-4.8,0),'绿圈 = 分支的碳侧链（“支链”）','branched hydrocarbon side chains','sm tag');
})();
// 4 peptide bond
(function(){ const s=station('pep',V(0,0,-70)), g=s.group; const d=D.alagly, m=M.mol(g,d,V(0,0,0),1.4);
  const n=d.a.findIndex((a,i)=>a[0]==='N' && nbrs(d,i).filter(j=>d.a[j][0]==='C').length===2); const c=nbrs(d,n).find(j=>nbrs(d,j).some(k=>d.a[k][0]==='O'));
  const h=new THREE.Group(); m.G.add(h); M.halo(h,m.P[n],0xffd166,0.6); M.halo(h,m.P[c],0xffd166,0.6);
  const w=new THREE.Group(); g.add(w); ball(w,V(0,0,0),0.45,0xff3030); ball(w,V(0.6,0.5,0),0.27,0xf4f4f4); ball(w,V(-0.6,0.5,0),0.27,0xf4f4f4);
  part(s,'mol',[m.G],[addLabel(s,g,V(-6,4.4,0),'二肽：丙氨酸–甘氨酸','Ala–Gly dipeptide','sm')]);
  part(s,'bond',[h],[addLabel(s,g,M.wpos(m,n).add(V(0,2.2,0)),'肽键 −CO−NH−','peptide bond','sm')]);
  part(s,'water',[w],[addLabel(s,g,V(5,-3.4,0),'脱去 1 分子水','− H₂O','sm tag')]);
  s.updates.push(t=>{ const u=(t*0.25)%1; w.position.set(M.wpos(m,n).x+u*5, M.wpos(m,n).y-1-u*2.5, 1.5); });
})();
// 5 structure levels
(function(){ const s=station('lev',V(60,0,-70)), g=s.group; const col=[0xff8f6b,0xffd166,0x5fd3b0,0x6ea8ff,0xb07cff,0xff6b9a];
  const P1=new THREE.Group(); g.add(P1); for(let i=0;i<10;i++) ball(P1,V(-13+i*0.9,5,0),0.38,col[i%6]);
  const hel=[]; for(let i=0;i<=60;i++){ const a=i*0.5; hel.push(V(-2.5+i*0.09,5+Math.cos(a)*0.9,Math.sin(a)*0.9)); } const H=tube(g,hel,0.22,0xff6b9a,1);
  const SH=new THREE.Group(); g.add(SH); for(let k=0;k<3;k++){ const ar=new THREE.Mesh(new THREE.BoxGeometry(4,0.15,0.8),mat(0xffd166)); ar.position.set(7,4.2+k*0.9,0); SH.add(ar); const tip=new THREE.Mesh(new THREE.ConeGeometry(0.6,1,3),mat(0xffd166)); tip.rotation.z=(k%2? Math.PI/2:-Math.PI/2); tip.position.set(k%2?4.6:9.4,4.2+k*0.9,0); SH.add(tip); }
  const fold=[]; for(let i=0;i<=90;i++){ const a=i*0.21; fold.push(V(2.2*Math.sin(a)*Math.cos(a*0.37), 2.2*Math.cos(a*1.3), 2.2*Math.sin(a*0.7))); } const TG=new THREE.Group(); g.add(TG); TG.position.set(-6,-3.5,0); const T=tube(TG,fold,0.22,0x5fd3b0,1);
  const Q=new THREE.Group(); g.add(Q); [[0,0],[2.6,0],[0,2.6],[2.6,2.6]].forEach(([x,y],i)=>{ const pts=[]; for(let k=0;k<=60;k++){ const a=k*0.3; pts.push(V(x+1.0*Math.sin(a)*Math.cos(a*0.4), y+1.0*Math.cos(a*1.2), 1.0*Math.sin(a*0.6))); } tube(Q,pts,0.16,[0xff8f6b,0x6ea8ff,0xff8f6b,0x6ea8ff][i],1); }); Q.position.set(5.8,-3.5,0); Q.children.forEach(c=>c.position.add(V(-1.3,-1.3,0)));
  part(s,'p1',P1,[addLabel(s,g,V(-9,6.6,0),'一级：氨基酸顺序','Primary','sm')]);
  part(s,'p2',[H.mesh,SH],[addLabel(s,g,V(2.5,7.2,0),'二级：α-螺旋 与 β-折叠','Secondary','sm')]);
  part(s,'p3',[T.mesh],[addLabel(s,g,V(-6,-0.2,0),'三级：整条链折叠成三维形状','Tertiary','sm')]);
  part(s,'p4',Q,[addLabel(s,g,V(5.8,-0.2,0),'四级：多条链组装（如血红蛋白 4 条）','Quaternary','sm')]);
  s.updates.push(t=>{ T.mesh.rotation.y=t*0.3; Q.rotation.y=t*0.25; H.mesh.rotation.x=0; });
})();
// 6 leucine -> mTORC1 -> ribosome
(function(){ const s=station('mtor',V(120,0,-70)), g=s.group;
  const leu=M.mol(g,D.leu,V(-10,3,0),0.8);
  const ins=ball(g,V(-10,-3,0),0.9,0x6ee7ff); const mt=ball(g,V(-2,0,0),1.6,0xb07cff,{emissive:0xb07cff,emissiveIntensity:0.3});
  const rib=new THREE.Group(); g.add(rib); ball(rib,V(6,0.6,0),1.4,0x8a6fc8); ball(rib,V(6,-1.2,0),1.0,0x6e57a8);
  const chain=new THREE.Group(); g.add(chain); const beads=[]; for(let i=0;i<14;i++) beads.push(ball(chain,V(7.4+i*0.55,0.4+Math.sin(i*0.8)*0.4,0),0.25,[0xff8f6b,0xffd166,0x5fd3b0,0x6ea8ff][i%4]));
  const a1=tube(g,[V(-8.4,2.4,0),V(-5,1.2,0),V(-3.4,0.5,0)],0.08,0xffd166,0.9).mesh, a2=tube(g,[V(-8.8,-2.4,0),V(-5,-1.2,0),V(-3.4,-0.5,0)],0.08,0x6ee7ff,0.9).mesh, a3=tube(g,[V(-0.4,0,0),V(2.5,0.3,0),V(4.5,0.5,0)],0.08,0xb07cff,0.9).mesh;
  part(s,'leu',[leu.G,a1],[addLabel(s,g,V(-10,5.4,0),'L-亮氨酸（必需氨基酸）','Leucine signal','sm')]);
  part(s,'ins',[ins,a2],[addLabel(s,g,V(-10,-4.8,0),'胰岛素 / 训练刺激','Insulin · exercise','sm')]);
  part(s,'mtor',[mt,a3],[addLabel(s,g,V(-2,2.6,0),'mTORC1（教材补充）','mTORC1 switch','sm')]);
  part(s,'rib',[rib,chain],[addLabel(s,g,V(8,3,0),'核糖体：合成肌蛋白','Ribosome · MPS','sm'),addLabel(s,g,V(10,-1.8,0),'每连 1 个氨基酸约耗 4 ATP','~4 ATP per bond','sm tag')]);
  s.updates.push(t=>{ const n=Math.floor((t*2)%14); beads.forEach((b,i)=>b.visible=i<=n); mt.scale.setScalar(1.6*(1+0.06*Math.sin(t*3))); });
})();
J.start();
})(JIG,MK);
