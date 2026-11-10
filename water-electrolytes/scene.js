(function(J,K){
const {THREE,V,mat,ball,rod,tube,flow,curve,station,part,addLabel}=J;
const W=0x4fb3ff, NA=0xffc857, KC=0xb07cff, CL=0x7be08a, GL=0xff8f6b;
function sprinkle(G,n,cx,cy,cz,sx,sy,sz,color,r){ for(let i=0;i<n;i++) ball(G,V(cx+(Math.random()-0.5)*sx,cy+(Math.random()-0.5)*sy,cz+(Math.random()-0.5)*sz),r||0.16,color); return G; }
// 1. compartments
(function(){ const s=station('comp',V(0,0,0)), g=s.group;
  const box=(w,h,d,x,c,op)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(c,{opacity:op,depthWrite:false})); m.position.set(x,h/2-4,0); g.add(m); return m; };
  const icf=box(13,8,5,-5.5,0x4a86ff,0.35), isf=box(5,8,5,3,0x5fd3b0,0.35), pl=box(2,8,5,6.6,0xd94a4a,0.4);
  const wi=sprinkle(new THREE.Group(),70,-5.5,0,0,12,7,4,W,0.14); g.add(wi);
  const wi2=sprinkle(new THREE.Group(),26,3,0,0,4.4,7,4,W,0.14); g.add(wi2);
  const wi3=sprinkle(new THREE.Group(),10,6.6,0,0,1.6,7,4,W,0.14); g.add(wi3);
  const ki=sprinkle(new THREE.Group(),24,-5.5,0,0,12,7,4,KC,0.2); g.add(ki);
  const ne=sprinkle(new THREE.Group(),18,4,0,0,6.6,7,4,NA,0.2); g.add(ne);
  part(s,'icf',[icf,wi,ki],[addLabel(s,g,V(-5.5,5.4,0),'细胞内液 ≈ 65%','Intracellular fluid')]);
  part(s,'isf',[isf,wi2],[addLabel(s,g,V(2.6,5.4,0),'细胞间液','Interstitial','sm')]);
  part(s,'plasma',[pl,wi3],[addLabel(s,g,V(7.4,6.6,0),'血浆','Plasma','sm')]);
  part(s,'ions',[ne],[addLabel(s,g,V(5,-5.4,0),'细胞外液 ≈ 35%（钠多）','Extracellular fluid','sm tag'),addLabel(s,g,V(-5.5,-5.4,0),'细胞内钾多','K⁺ inside','sm tag')]);
  // glycogen-water
  const gly=new THREE.Group(); g.add(gly); for(let i=0;i<6;i++){ const b=ball(gly,V(13+(i%3)*1.3,1+Math.floor(i/3)*1.3,0),0.5,0xffd166); sprinkle(gly,8,b.position.x,b.position.y,0,1.4,1.4,1.4,W,0.1);} 
  part(s,'gly',gly,[addLabel(s,g,V(14.3,3.8,0),'肌糖原结合水','Glycogen + water','sm')]);
})();
// 2. balance
(function(){ const s=station('bal',V(60,0,0)), g=s.group;
  const res=new THREE.Mesh(new THREE.CylinderGeometry(3,3,6,32,1,true),mat(0x9ad6ff,{opacity:0.25,depthWrite:false,side:THREE.DoubleSide})); g.add(res);
  const lvl=new THREE.Mesh(new THREE.CylinderGeometry(2.9,2.9,4,32),mat(W,{opacity:0.6})); lvl.position.y=-1; g.add(lvl);
  const mk=(pts,c,n,sp,r)=>{ const cv=curve(pts); const t=tube(g,pts,0.12,c,0.25); return [t.mesh,flow(g,cv,n,r||0.24,c,sp)]; };
  const drink=mk([V(-13,7,0),V(-7,5,0),V(-2,1.5,0)],W,8,0.2), food=mk([V(-13,1,0),V(-7,0.6,0),V(-3,0,0)],0x8fd16a,5,0.15), met=mk([V(-13,-5,0),V(-7,-3.5,0),V(-3,-1.5,0)],0xffd166,3,0.1);
  const urine=mk([V(2,-2,0),V(7,-4,0),V(13,-6,0)],0xf2e36b,5,0.15), sweat=mk([V(2.5,1.5,0),V(7,4,0),V(13,7,0)],0x9ad6ff,9,0.25), breath=mk([V(3,0,0),V(8,0.6,0),V(13,1,0)],0xdddddd,4,0.12);
  part(s,'res',[res,lvl],[addLabel(s,g,V(0,4.4,0),'体内水平衡','Body water')]);
  part(s,'drink',drink,[addLabel(s,g,V(-13,8.3,0),'饮水与饮料（约 70%）','Drinks','sm')]);
  part(s,'food',food,[addLabel(s,g,V(-13,2.3,0),'食物中的水（约 30%）','Food water','sm')]);
  part(s,'met',met,[addLabel(s,g,V(-10.5,-6.8,0),'代谢水（3000 千卡 ≈ 0.3 升）','Metabolic water','sm')]);
  part(s,'urine',urine,[addLabel(s,g,V(13,-7.4,0),'尿液（至少 0.3–0.6 升/天）','Urine','sm')]);
  part(s,'sweat',sweat,[addLabel(s,g,V(13,8.4,0),'汗液（训练约 1.5 升/小时）','Sweat','sm')]);
  part(s,'breath',breath,[addLabel(s,g,V(13,2.4,0),'呼吸与皮肤蒸发','Breath & skin','sm')]);
  s.updates.push(t=>{ lvl.scale.y=0.9+0.1*Math.sin(t*0.8); });
})();
// 3. membrane & Na/K pump
(function(){ const s=station('memb',V(120,0,0)), g=s.group;
  const mem=new THREE.Group(); g.add(mem); for(let i=0;i<22;i++) for(let j=0;j<6;j++){ [0.9,-0.9].forEach(y=>ball(mem,V(-11+i*1.05,y,-3+j*1.1),0.42,0xf2c4a0)); }
  const pump=new THREE.Mesh(new THREE.CylinderGeometry(1.3,1.3,3.4,20),mat(0xb07cff)); g.add(pump);
  const ch=new THREE.Mesh(new THREE.CylinderGeometry(0.8,0.8,3,16),mat(0x4a86ff)); ch.position.set(6,0,0); g.add(ch);
  const naOut=sprinkle(new THREE.Group(),28,0,5,0,22,4,6,NA,0.26); g.add(naOut);
  const kIn=sprinkle(new THREE.Group(),24,0,-5,0,22,4,6,KC,0.26); g.add(kIn);
  const naP=flow(g,curve([V(-0.4,-4,0.6),V(-0.4,0,0.6),V(-0.4,4,0.6)]),3,0.28,NA,0.25);
  const kP=flow(g,curve([V(0.5,4,0.6),V(0.5,0,0.6),V(0.5,-4,0.6)]),2,0.28,KC,0.25);
  const kLeak=flow(g,curve([V(6,-4,0),V(6,0,0),V(6,4,0)]),3,0.24,KC,0.15);
  part(s,'pump',[pump,naP,kP],[addLabel(s,g,V(-3.6,2.6,1.5),'钠钾泵：3 Na⁺ 出、2 K⁺ 进 / 1 ATP','Na⁺/K⁺-ATPase','sm')]);
  part(s,'ions',[naOut,kIn],[addLabel(s,g,V(-9,7.6,0),'细胞外：Na⁺ 高','Outside: Na⁺','sm tag'),addLabel(s,g,V(-9,-7.6,0),'细胞内：K⁺ 高','Inside: K⁺','sm tag')]);
  part(s,'chan',[ch,kLeak],[addLabel(s,g,V(8.8,2.4,1),'钾通道 → 膜电位','K⁺ channel','sm')]);
  part(s,'mem',mem,[addLabel(s,g,V(11.5,-1.8,0),'细胞膜','Membrane','sm')]);
  s.updates.push(t=>{ pump.rotation.y=t*1.2; });
})();
// 4. intestinal absorption
(function(){ const s=station('cell',V(0,0,-80)), g=s.group;
  const C=K.cell(s,g);
  const sglt=K.pore(g,V(-4,4,0),0x4a86ff), aqp=K.pore(g,V(3.5,4,0),0x9ad6ff,1.2), nak=K.pore(g,V(-2,-4,0),0xb07cff), glut2=K.pore(g,V(3,-4,0),0xff9f6b);
  const naF=flow(g,curve([V(-4.6,8,0.9),V(-4.4,4,0.9),V(-3.2,0,0.9),V(-2.4,-3.2,0.9)]),6,0.24,NA,0.15);
  const glF=flow(g,curve([V(-3.4,8,-0.9),V(-3.6,4,-0.9),V(0,0,-0.9),V(3,-4,-0.9),V(3,-7.4,-0.9)]),6,0.24,GL,0.13);
  const naOut=flow(g,curve([V(-2,-3,0.9),V(-2,-4,0.9),V(-1.6,-7.4,0.9)]),4,0.22,NA,0.2);
  const wF=flow(g,curve([V(3.5,8,0),V(3.5,4,0),V(2,0,1.6),V(0.5,-4,1.6),V(0.4,-7.4,1.6)]),14,0.16,W,0.12);
  const wF2=flow(g,curve([V(-6.5,8,2),V(-6.8,4,2.2),V(-6.6,-4,2.2),V(-6.4,-7.4,2)]),10,0.16,W,0.12);
  part(s,'sglt',[sglt,naF,glF],[addLabel(s,g,V(-7.6,5.8,0),'SGLT1：Na⁺ + 葡萄糖同向转运','Na⁺-glucose co-transport','sm')]);
  part(s,'water',[aqp,wF,wF2],[addLabel(s,g,V(6.8,5.8,0),'水跟随溶质（渗透）','Water follows solutes','sm')]);
  part(s,'nak',[nak,naOut],[addLabel(s,g,V(-5.6,-5.6,0),'钠钾泵把 Na⁺ 泵入血液','Na⁺/K⁺ pump','sm')]);
  part(s,'glut2',glut2,[addLabel(s,g,V(6,-5.6,0),'GLUT2','Glucose exit','sm')]);
  part(s,'cellbody',[C.body,C.nuc,C.vessel.mesh],[]);
})();
// 5. tonicity
(function(){ const s=station('osm',V(60,0,-80)), g=s.group;
  const cfg=[['低渗','< 285',-10,0.5,1],['等渗','285–300',0,1,0],['高渗','> 300',10,1.8,-1]];
  cfg.forEach(([zh,en,x,dens,dir],i)=>{ const G=new THREE.Group(); g.add(G); G.position.x=x;
    const gut=new THREE.Mesh(new THREE.BoxGeometry(6,4,4),mat(0xf6b38c,{opacity:0.25,depthWrite:false})); gut.position.y=3; G.add(gut);
    const bl=new THREE.Mesh(new THREE.BoxGeometry(6,4,4),mat(0xd94a4a,{opacity:0.25,depthWrite:false})); bl.position.y=-3; G.add(bl);
    const wall=new THREE.Mesh(new THREE.BoxGeometry(6.2,0.3,4.2),mat(0xe6a07a)); G.add(wall);
    sprinkle(G,Math.round(14*dens),0,3,0,5,3,3,NA,0.22); sprinkle(G,14,0,-3,0,5,3,3,NA,0.22);
    const pts=dir>0?[V(0,3,1.8),V(0,0,1.8),V(0,-3,1.8)]:dir<0?[V(0,-3,1.8),V(0,0,1.8),V(0,3,1.8)]:[V(-1.5,3,1.8),V(-1.5,0,1.8),V(-1.5,-3,1.8)];
    const f=flow(G,curve(pts),dir===0?5:8,0.2,W,dir===0?0.2:0.3);
    const L=[addLabel(s,G,V(0,6.2,0),zh+'饮料',en+' mOsmol/L','sm')];
    part(s,['hypo','iso','hyper'][i],[gut,f],L);
  });
  addLabel(s,g,V(-15.5,3,0),'肠腔','Gut lumen','sm tag'); addLabel(s,g,V(-15.5,-3,0),'血液','Blood','sm tag');
})();
// 6. sweat timeline
(function(){ const s=station('sweat',V(120,0,-80)), g=s.group;
  const ph=[['0–90 分钟','血液变“浓”',1.25,1.0],['数小时','血钠中等偏低',0.9,1.0],['数小时 + 大量淡水','低钠血症（稀释）',0.55,1.5]];
  ph.forEach(([t,zh,na,w],i)=>{ const x=-9+i*9; const G=new THREE.Group(); g.add(G); G.position.x=x;
    const v=new THREE.Mesh(new THREE.CylinderGeometry(2.6,2.6,6,24,1,true),mat(0xd94a4a,{opacity:0.22,depthWrite:false,side:THREE.DoubleSide})); G.add(v);
    sprinkle(G,Math.round(16*na),0,0,0,4,5,4,NA,0.26); sprinkle(G,Math.round(18*w),0,0,0,4,5,4,W,0.16);
    part(s,'p'+i,[v],[addLabel(s,G,V(0,4.6,0),zh,t,'sm')]);
  });
  const sw=flow(g,curve([V(-9,3,2.8),V(-7,6,3.2),V(-4,8,3)]),8,0.18,W,0.3); part(s,'sw',sw,[addLabel(s,g,V(-3,8.6,3),'汗液低渗：失水快于失盐','Hypotonic sweat','sm')]);
  addLabel(s,g,V(0,-4.8,0),'黄 = Na⁺   蓝 = 水（示意）','yellow Na⁺ · blue water','sm tag');
})();
// 7. drinks
(function(){ const s=station('drink',V(0,0,-160)), g=s.group;
  const bottle=(x,c,name,en,key,bars)=>{ const G=new THREE.Group(); g.add(G); G.position.x=x;
    const b=new THREE.Mesh(new THREE.CylinderGeometry(1.4,1.6,6,24),mat(c,{opacity:0.5,depthWrite:false})); b.position.y=3; G.add(b);
    const neck=new THREE.Mesh(new THREE.CylinderGeometry(0.5,1.2,1.4,20),mat(c,{opacity:0.5})); neck.position.y=6.7; G.add(neck);
    bars.forEach(([v,col],j)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(0.7,v,0.7),mat(col)); m.position.set(-1.2+j*1.2,-1-v/2,0); m.position.y=-0.6-v/2+v; m.position.y=-4+v/2; G.add(m); });
    part(s,key,[b,neck],[addLabel(s,G,V(0,8.6,0),name,en,'sm')]); };
  bottle(-9,0x9ad6ff,'富钠矿泉水','Na⁺ 400–1100 mg/L','mineral',[[2.6,NA],[0.2,GL]]);
  bottle(0,0xffb36b,'果汁兑水 1:1–3:1','juice spritzer','spritzer',[[1.2,NA],[2.0,GL]]);
  bottle(9,0x7be08a,'运动饮料','Na⁺ ≥ 400 mg/L + 糖','sport',[[1.6,NA],[2.6,GL]]);
  addLabel(s,g,V(0,-5.4,0),'柱：钠 / 糖（示意）','bars: Na⁺ / sugar','sm tag');
})();
J.start();
})(JIG,KIT);
