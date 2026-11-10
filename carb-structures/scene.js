(function(J,M){
let SEED=7; const rnd=()=>{ SEED=(SEED*16807)%2147483647; return SEED/2147483647; };
const {THREE,V,mat,ball,rod,prism,tube,curve,station,part,addLabel}=J;
const D=window.MOL;
function anoLabel(s,g,m,zh,en){ const i=M.tagged(m,'ano')[0]; const h=M.halo(m.G,m.P[i],0xffd166); return {h,l:addLabel(s,g,M.wpos(m,i).add(V(0,-2.2,0)),zh,en,'sm')}; }
// 1 alpha vs beta glucose
(function(){ const s=station('ab',V(0,0,0)), g=s.group;
  const a=M.mol(g,D.aglc,V(-5.5,0,0),1.0), b=M.mol(g,D.bglc,V(5.5,0,0),1.0);
  const la=anoLabel(s,g,a,'C1 的 −OH 朝下（α）','α: OH axial, down'), lb=anoLabel(s,g,b,'C1 的 −OH 朝上（β）','β: OH equatorial, up');
  part(s,'a',[a.G],[addLabel(s,g,V(-5.5,3.6,0),'α-D-葡萄糖','α-D-glucopyranose')]); part(s,'b',[b.G],[addLabel(s,g,V(5.5,3.6,0),'β-D-葡萄糖','β-D-glucopyranose')]);
  part(s,'ano',[la.h,lb.h],[la.l,lb.l]);
  addLabel(s,g,V(0,-4.6,0),'灰 C · 红 O · 白 H','CPK colours','sm tag');
  s.updates.push(t=>{ a.G.rotation.y=0.35*Math.sin(t*0.4); b.G.rotation.y=0.35*Math.sin(t*0.4); });
})();
// 2 three monosaccharides
(function(){ const s=station('mono',V(60,0,0)), g=s.group;
  const m1=M.mol(g,D.bglc,V(-9,0,0),0.95), m2=M.mol(g,D.bfru,V(0,0,0),0.95), m3=M.mol(g,D.bgal,V(9,0,0),0.95);
  // galactose C4 halo: C4 = ring carbon two steps from C5... mark by index from map: atom order C6,C5,C4 => index 2
  const h4=M.halo(m3.G,m3.P[2],0x6ee7ff), h4g=M.halo(m1.G,m1.P[2],0x6ee7ff,0.5);
  part(s,'glc',[m1.G],[addLabel(s,g,V(-9,3.4,0),'葡萄糖（六元环）','Glucose','sm')]);
  part(s,'fru',[m2.G],[addLabel(s,g,V(0,3.4,0),'果糖（五元环，酮糖）','Fructose (furanose)','sm')]);
  part(s,'gal',[m3.G],[addLabel(s,g,V(9,3.4,0),'半乳糖','Galactose','sm')]);
  part(s,'c4',[h4,h4g],[addLabel(s,g,M.wpos(m3,2).add(V(0,-2.2,0)),'C4 构型与葡萄糖相反','C4 epimer','sm')]);
  s.updates.push(t=>{ [m1,m2,m3].forEach(m=>m.G.rotation.y=0.4*Math.sin(t*0.4)); });
  addLabel(s,g,V(0,-4.6,0),'分子式都是 C₆H₁₂O₆','same formula, different shape','sm tag');
})();
// 3 disaccharides
(function(){ const s=station('di',V(120,0,0)), g=s.group;
  const L=[['maltose','麦芽糖 = 葡萄糖 + 葡萄糖','α-1,4 glycosidic bond',-8],['lactose','乳糖 = 半乳糖 + 葡萄糖','β-1,4 glycosidic bond',0],['sucrose','蔗糖 = 葡萄糖 + 果糖','α1↔β2 glycosidic bond',8]];
  L.forEach(([k,zh,en,y])=>{ const m=M.mol(g,D[k],V(0,y,0),0.85); const o=M.tagged(m,'gly')[0]; const h=M.halo(m.G,m.P[o],0xffd166,0.55);
    part(s,k,[m.G],[addLabel(s,g,V(-11,y+0.4,0),zh,'','sm')]); part(s,k+'B',[h],[addLabel(s,g,V(8.5,y+0.4,0),'糖苷键（黄圈）',en,'sm tag')]);
    s.updates.push(t=>{ m.G.rotation.x=0.4*Math.sin(t*0.5+y); }); });
})();
// polysaccharide helpers: glucose unit = hexagon token
function unit(G,p,c){ return prism(G,p,0.55,6,0.3,c); }
// 4 starch: amylose helix + amylopectin tree
(function(){ const s=station('starch',V(0,0,-70)), g=s.group;
  const A=new THREE.Group(); g.add(A); for(let i=0;i<54;i++){ const a=i*2*Math.PI/6.5; unit(A,V(-9+i*0.24, 1.6*Math.cos(a), 1.6*Math.sin(a)),0xffd166); }
  A.position.y=4;
  const B=new THREE.Group(); g.add(B); const br=[];
  function chain(x,y,dx,dy,n,depth){ let p=V(x,y,0); for(let i=0;i<n;i++){ p=p.clone().add(V(dx,dy,0)); unit(B,p,0xffb36b); if(depth<3 && i>0 && i%5===0){ br.push(p.clone()); chain(p.x,p.y,dx*0.9,dy-0.9,8-depth*2,depth+1);} } }
  chain(-9,-3,0.95,0,19,1);
  const bp=new THREE.Group(); g.add(bp); br.forEach(p=>M.halo(bp,p,0xff6b6b,0.5));
  part(s,'amylose',A,[addLabel(s,g,V(-10,7,0),'直链淀粉：α-1,4 连成螺旋','Amylose helix','sm')]);
  part(s,'amylopectin',B,[addLabel(s,g,V(-10,-1.2,0),'支链淀粉：分支状','Amylopectin','sm')]);
  part(s,'branch',bp,[addLabel(s,g,V(8,-1.4,0),'分支点 = α-1,6 糖苷键','α-1,6 branch points','sm')]);
  addLabel(s,g,V(0,-9.2,0),'淀粉最多可含 10 万个葡萄糖残基','up to 100,000 glucose units','sm tag');
})();
// 5 glycogen
(function(){ const s=station('glyc',V(60,0,-70)), g=s.group; const G=new THREE.Group(); g.add(G); G.scale.setScalar(0.55);
  const core=ball(G,V(0,0,0),0.6,0xb07cff); const bps=new THREE.Group(); g.add(bps); bps.scale.setScalar(0.55);
  function grow(p,dir,depth){ let q=p.clone(); for(let i=1;i<=5;i++){ q=q.clone().add(dir.clone().multiplyScalar(0.85)); unit(G,q,0xff8fb3);
      if(depth<4 && (i===2||i===4)){ const nd=dir.clone().add(V(rnd()-0.5,rnd()-0.5,rnd()-0.5).multiplyScalar(1.4)).normalize(); M.halo(bps,q,0xff6b6b,0.42); grow(q,nd,depth+1);} } }
  for(let k=0;k<2;k++) grow(V(0,0,0),V(k?1:-1,0.2,0.1).normalize(),0);
  part(s,'gly',[G,core],[addLabel(s,g,V(0,7.6,0),'糖原：分支更密、更紧凑','Glycogen','sm'),addLabel(s,g,V(1.6,-0.8,0),'糖原蛋白核心','glycogenin','sm')]);
  part(s,'bp',bps,[addLabel(s,g,V(-8,-6,0),'更多 α-1,6 分支 = 更多可同时切下的末端','many branch ends','sm')]);
  s.updates.push(t=>{ G.rotation.y=t*0.15; bps.rotation.y=t*0.15; });
})();
// 6 cellulose
(function(){ const s=station('fiber',V(120,0,-70)), g=s.group; const C=new THREE.Group(); g.add(C); const H=new THREE.Group(); g.add(H);
  for(let r=0;r<4;r++) for(let i=0;i<16;i++){ const u=unit(C,V(-8+i*1.1,-2.4+r*1.6,0),0x8fd16a); u.rotation.z=(i%2)*Math.PI; u.position.z=(i%2)*0.15; }
  for(let r=0;r<3;r++) for(let i=0;i<16;i+=2){ const a=V(-8+i*1.1,-2.4+r*1.6+0.45,0), b=V(-8+i*1.1,-2.4+(r+1)*1.6-0.45,0); rod(H,a,b,0.05,0x6ee7ff,{opacity:0.7}); }
  part(s,'cell',C,[addLabel(s,g,V(-5,4.6,0),'纤维素：β-1,4 连成直链，单元交替翻转','Cellulose: β-1,4','sm')]);
  part(s,'hb',H,[addLabel(s,g,V(9.5,0,0),'链间氢键 → 紧密纤维','H-bonded sheets','sm')]);
  addLabel(s,g,V(0,-5.4,0),'人体没有切 β-1,4 键的酶 → 进入大肠','no human β-glucosidase for cellulose','sm tag');
})();
J.start();
})(JIG,MK);
