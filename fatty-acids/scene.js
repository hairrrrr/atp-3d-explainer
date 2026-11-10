(function(J,M){
const {THREE,V,mat,ball,rod,station,part,addLabel}=J; const D=window.MOL;
function heavyIdx(d,n){ let c=-1; for(let i=0;i<d.a.length;i++){ if(d.a[i][0]!=='H'){ c++; if(c===n) return i; } } return -1; }
function cooh(d){ return d.a.findIndex(a=>a[0]==='O'); }
function dbHalos(m,c){ const G=new THREE.Group(); m.G.add(G); M.tagged(m,'db').forEach(i=>M.halo(G,m.P[i],c||0xffd166,0.55)); return G; }
// 1 saturated stearic
(function(){ const s=station('sat',V(0,0,0)), g=s.group; const m=M.mol(g,D.stearic,V(0,0,0),0.95);
  const o=cooh(D.stearic); const hc=M.halo(m.G,m.P[o],0xff6b6b,0.9); const hm=M.halo(m.G,m.P[0],0x6ee7ff,0.8);
  part(s,'chain',[m.G],[addLabel(s,g,V(0,3.2,0),'硬脂酸 C18:0（饱和）','Stearic acid','sm')]);
  part(s,'cooh',[hc],[addLabel(s,g,M.wpos(m,o).add(V(0,-2.2,0)),'羧基 −COOH','Carboxyl head','sm')]);
  part(s,'ch3',[hm],[addLabel(s,g,M.wpos(m,0).add(V(0,-2.2,0)),'甲基端 −CH₃','Methyl end','sm')]);
  addLabel(s,g,V(0,-3.8,0),'灰 C · 白 H · 红 O','CPK colours','sm tag');
})();
// 2 chain length
(function(){ const s=station('len',V(60,0,0)), g=s.group;
  const a=M.mol(g,D.c4,V(-8.5,4,0),0.95), b=M.mol(g,D.c8,V(-6.3,0,0),0.95), c=M.mol(g,D.stearic,V(0,-4,0),0.95);
  part(s,'short',[a.G],[addLabel(s,g,V(-8.5,6.6,0),'短链（< 6 个碳）：丁酸 C4','Short-chain','sm')]);
  part(s,'mct',[b.G],[addLabel(s,g,V(-6.3,1.2,0),'中链（MCT）：辛酸 C8','Medium-chain','sm')]);
  part(s,'long',[c.G],[addLabel(s,g,V(0,-6.2,0),'长链：硬脂酸 C18','Long-chain','sm')]);
})();
// 3 sat / cis / trans
(function(){ const s=station('ct',V(120,0,0)), g=s.group;
  const a=M.mol(g,D.stearic,V(0,5,0),0.9), b=M.mol(g,D.oleic,V(0,0,0),0.9), c=M.mol(g,D.elaidic,V(0,-5,0),0.9);
  const hb=dbHalos(b), hc=dbHalos(c,0xff6b6b);
  part(s,'s',[a.G],[addLabel(s,g,V(-13,5,0),'饱和：硬脂酸','C18:0','sm')]);
  part(s,'cis',[b.G,hb],[addLabel(s,g,V(-13,0,0),'顺式单不饱和：油酸','C18:1 cis-9','sm'),addLabel(s,g,M.wpos(b,M.tagged(b,'db')[0]).add(V(0,2.3,0)),'顺式双键 → 链弯折','cis kink','sm tag')]);
  part(s,'trans',[c.G,hc],[addLabel(s,g,V(-13,-5,0),'反式：反油酸','C18:1 trans-9','sm'),addLabel(s,g,M.wpos(c,M.tagged(c,'db')[0]).add(V(0,-2.2,0)),'反式双键 → 链几乎是直的','trans: straight','sm tag')]);
})();
// 4 omega numbering
(function(){ const s=station('omega',V(0,0,-70)), g=s.group;
  const a=M.mol(g,D.ala,V(0,5.5,0),0.85), b=M.mol(g,D.la,V(0,-5,0),0.85);
  const ha=dbHalos(a,0x6ee7ff), hb=dbHalos(b,0xffb36b);
  const nums=new THREE.Group(); g.add(nums); const L=[];
  [[a,D.ala,[[1,V(-1.8,0.4,0)],[3,V(0.9,2.0,0)]]],[b,D.la,[[1,V(0,1.3,0)],[6,V(0,1.3,0)]]]].forEach(([m,d,ks])=>{ ks.forEach(([k,o])=>{ const i=heavyIdx(d,k-1); L.push(addLabel(s,g,M.wpos(m,i).add(o),'ω'+k,'','sm')); }); });
  part(s,'ala',[a.G,ha],[addLabel(s,g,V(11,9,0),'α-亚麻酸（ALA）：第一个双键在 ω3','ω-3, C18:3','sm')]);
  part(s,'la',[b.G,hb],[addLabel(s,g,V(11,-0.6,0),'亚油酸（LA）：第一个双键在 ω6','ω-6, C18:2','sm')]);
  part(s,'num',[],L);
  addLabel(s,g,V(-11,-10,0),'从甲基端（ω1）开始数','count from the methyl end','sm tag');
})();
// 5 packing
(function(){ const s=station('pack',V(60,0,-70)), g=s.group; const A=new THREE.Group(), B=new THREE.Group(); g.add(A); g.add(B);
  for(let i=0;i<5;i++) M.mol(A,D.stearic,V(0,4+i*0.55,i*0.9-1.8),0.55);
  for(let i=0;i<5;i++){ const m=M.mol(B,D.oleic,V(0,-5+i*0.9,i*1.1-2.2),0.55); m.G.rotation.x=i*1.1; }
  part(s,'tight',A,[addLabel(s,g,V(-3,8.6,0),'饱和脂肪酸：直链排得紧密 → 室温固态','packs tightly: solid','sm')]);
  part(s,'loose',B,[addLabel(s,g,V(1.5,-8.2,0),'顺式不饱和：弯折排不紧 → 室温液态','kinks: liquid oil','sm')]);
})();
// 6 triglyceride assembly
(function(){ const s=station('tg',V(120,0,-70)), g=s.group;
  const gl=M.mol(g,D.glycerol,V(-9,0,0),1.1); gl.G.rotation.z=Math.PI/2;
  const fa=[[D.stearic,3.4],[D.oleic,0],[D.ala,-3.4]].map(([d,y])=>{ const m=M.mol(g,d,V(3,y,0),0.6); const o=d.a.findIndex(a=>a[0]==='O'); m.G.rotation.y=d.a[o][1]>0?Math.PI:0; m.G.add(new THREE.Object3D()); const off=V(Math.abs(d.a[o][1])*0.6,0,0); m.off=off; return {m,y}; });
  const W=new THREE.Group(); g.add(W); const ws=[];
  [3.4,0,-3.4].forEach(y=>{ const w=new THREE.Group(); W.add(w); ball(w,V(0,0,0),0.34,0xff3030); ball(w,V(0.5,0.4,0),0.2,0xf4f4f4); ball(w,V(-0.5,0.4,0),0.2,0xf4f4f4); w.userData.y=y; ws.push(w); });
  part(s,'gly',[gl.G],[addLabel(s,g,V(-9,4.8,0),'甘油（丙三醇）','Glycerol','sm')]);
  part(s,'fas',fa.map(f=>f.m.G),[addLabel(s,g,V(7,5.6,0),'3 条脂肪酸（可各不相同）','3 fatty acids','sm')]);
  part(s,'water',[W],[addLabel(s,g,V(-4,-6.6,0),'每形成 1 个酯键释放 1 分子水','ester bond + H₂O','sm tag')]);
  s.updates.push(t=>{ const u=0.5-0.5*Math.cos(t*0.7); fa.forEach(f=>{ f.m.G.position.x=-7.4+f.m.off.x+ (1-u)*3.5; });
    ws.forEach(w=>{ w.position.set(-5.5-u*1.5, w.userData.y-u*1.8, 1.5); w.visible=u>0.6; }); });
})();
J.start();
})(JIG,MK);
