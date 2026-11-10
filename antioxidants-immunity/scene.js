/* 抗氧化剂与免疫 */
(function(){
const {THREE,V,mat,ball,rod,tube,flow,curve,station,part,addLabel}=J;
function axes(g,w){ rod(g,V(-w,0,0),V(w,0,0),0.05,0xffffff,{opacity:0.5}); rod(g,V(-w,0,0),V(-w,9,0),0.05,0xffffff,{opacity:0.5}); }
// 1. dose-response
(function(){
  const s=station('dose',V(0,0,0)), g=s.group; axes(g,12);
  const f=x=> x<-4? 1+6*(x+12)/8 : x<5? 7 : 7-(x-5)*0.9;
  const p=[]; for(let x=-12;x<=12;x+=0.2) p.push(V(x,f(x),0)); const t=tube(g,p,0.14,0x7dffb0,0.9);
  part(s,'c',t.mesh,[addLabel(s,g,V(-9,3.2,0),'缺乏 → 补充有效','Deficient','sm'),addLabel(s,g,V(0.5,8.2,0),'已充足：再多也不提升成绩','Adequate · plateau','sm'),addLabel(s,g,V(10,4.6,0),'药理剂量：可能有害','Mega-dose · risk','sm')]);
  addLabel(s,g,V(0,-1.6,0),'摄入量 →（示意）','Intake','tag');
  const dot=ball(g,V(0,0,0),0.35,0xffffff,{emissive:0xffffff,emissiveIntensity:0.6});
  s.updates.push(t=>{ const x=-12+((t*3)%24); dot.position.set(x,f(x),0); });
})();
// 2. J-curve and open window
(function(){
  const s=station('win',V(60,0,0)), g=s.group; axes(g,12);
  const f=x=>1.2+(x<-4?0.052:0.03)*(x+4)*(x+4);
  const p=[]; for(let x=-12;x<=12;x+=0.2) p.push(V(x,Math.max(0.3,f(x)),0)); const t=tube(g,p,0.14,0xff9f6b,0.9);
  part(s,'j',t.mesh,[addLabel(s,g,V(-11,5.6,0),'久坐','Sedentary','sm'),addLabel(s,g,V(-4,-0.3,1),'适度运动：感染最少','Moderate · lowest','sm'),addLabel(s,g,V(9.5,9.2,0),'大运动量 + 少吃：感染增多','Heavy load · more infections','sm')]);
  addLabel(s,g,V(0,-1.8,0),'运动量 →（上呼吸道感染风险，示意）','Training load','tag');
})();
// 3. carbs to immune cells
(function(){
  const s=station('carb',V(120,0,0)), g=s.group;
  const cells=[]; for(let i=0;i<5;i++){ const a=i/5*Math.PI*2; cells.push(ball(g,V(Math.cos(a)*5,Math.sin(a)*4,0),1.3,0xe9eefc,{opacity:0.9})); }
  part(s,'cells',cells,[addLabel(s,g,V(0,-6.6,0),'被炎症激活的免疫细胞需要大量糖分','Activated immune cells use glucose','sm')]);
  const fl=cells.map((c,i)=>flow(g,curve([V(-14,7,0),V(-6,5-i,1),c.position.clone()]),5,0.22,0xffd166,0.25));
  part(s,'glu',fl,[addLabel(s,g,V(-13,8.6,0),'训练前后 / 训练中每小时 30–60 g 快碳','Carbs 30–60 g/h','sm')]);
  const cort=ball(g,V(9,6,0),1.6,0xff6b6b,{opacity:0.6,depthWrite:false});
  part(s,'cort',cort,[addLabel(s,g,V(10,8.6,0),'压力激素过度升高','Stress hormones','sm')]);
  s.updates.push(t=>{ cort.scale.setScalar(1.2+0.5*(0.5+0.5*Math.sin(t))); cells.forEach((c,i)=>c.material.emissive&&c.material.emissive.setHex(0x223355)); });
})();
// 4. micronutrient tiles
(function(){
  const s=station('micro',V(0,0,-80)), g=s.group;
  const items=[['A',0xffb36b],['E',0xffb36b],['C',0xffb36b],['B6',0xffb36b],['B12',0xffb36b],['Zn',0x7dffb0],['Cu',0x7dffb0],['Fe',0x7dffb0],['Se',0x7dffb0],['ω-3',0x6ec8ff]];
  const ts=[]; items.forEach(([n,c],i)=>{ const x=-10+(i%5)*5, y=2.5-Math.floor(i/5)*5; const tl=new THREE.Mesh(new THREE.BoxGeometry(3.6,3.6,0.6),mat(c,{opacity:0.85})); tl.position.set(x,y,0); g.add(tl); ts.push(tl); addLabel(s,g,V(x,y,0.6),n,'',''); });
  part(s,'v',ts.slice(0,5),[addLabel(s,g,V(-14,7,0),'维生素（橙）','Vitamins','sm')]);
  part(s,'m',ts.slice(5,9),[addLabel(s,g,V(0,7,0),'矿物质（绿）','Minerals','sm')]);
  addLabel(s,g,V(0,-6,0),'免疫必需，但不缺乏时补充无益','Needed — extra helps only if deficient','tag');
  s.updates.push(t=>{ ts.forEach((tl,i)=>tl.rotation.y=0.3*Math.sin(t+i*0.6)); });
})();
// 5. ZMA studies
(function(){
  const s=station('zma',V(60,0,-80)), g=s.group; rod(g,V(-10,0,0),V(10,0,0),0.06,0xffffff,{opacity:0.6});
  const d=[['2000 年：半职业足球员','2000 study',5,-6,0xff9f6b],['新研究 1：资深运动者 8 周','Newer RCT 1',0.2,0,0x8fa3c8],['新研究 2：资深运动者 8 周','Newer RCT 2',0.2,6,0x8fa3c8]];
  const bars=[]; d.forEach(([zh,en,h,x,c])=>{ const b=new THREE.Mesh(new THREE.BoxGeometry(3,1,3),mat(c)); g.add(b); bars.push([b,h,x]); addLabel(s,g,V(x,-1.5,1.6),zh,en,'sm'); });
  part(s,'bars',bars.map(b=>b[0]),[addLabel(s,g,V(0,8,0),'ZMA 对睾酮的影响（示意高度）','ZMA and testosterone','tag')]);
  s.updates.push(t=>{ const k=Math.min(1,(t%7)/2); bars.forEach(([b,h,x])=>{ const y=Math.max(0.1,h*k); b.scale.y=y; b.position.set(x,y/2,0); }); });
})();
// 6. radical / antioxidant balance
(function(){
  const s=station('aox',V(120,0,-80)), g=s.group;
  rod(g,V(0,-5,0),V(0,2,0),0.2,0xaab4d0); const beam=new THREE.Group(); beam.position.y=2; g.add(beam); rod(beam,V(-8,0,0),V(8,0,0),0.16,0xdde3f5);
  const L=new THREE.Group(); L.position.x=-7; beam.add(L); const R=new THREE.Group(); R.position.x=7; beam.add(R);
  const rad=[]; for(let i=0;i<6;i++){ const m=new THREE.Mesh(new THREE.IcosahedronGeometry(0.55,0),mat(0xff5f5f,{emissive:0xff2222,emissiveIntensity:0.5})); m.position.set(-1.5+(i%3)*1.5,-1.4-Math.floor(i/3)*1.2,0); L.add(m); rad.push(m); }
  const ao=[]; for(let i=0;i<6;i++) ao.push(ball(R,V(-1.5+(i%3)*1.5,-1.4-Math.floor(i/3)*1.2,0),0.55,0x7dffb0,{emissive:0x33ff99,emissiveIntensity:0.3}));
  part(s,'rad',rad,[addLabel(s,g,V(-7,-4.6,0),'自由基：损伤蛋白、细胞膜、DNA，也杀病原体、触发适应','Free radicals','sm')]);
  part(s,'ao',ao,[addLabel(s,g,V(7,-4.6,0),'抗氧化：酶系统 + 营养素（维生素 E、C 等）','Antioxidant defence','sm')]);
  addLabel(s,g,V(0,6.4,0),'太多太少都不好：双刃剑','A delicate balance','tag');
  s.updates.push(t=>{ beam.rotation.z=0.1*Math.sin(t*0.7); L.rotation.z=-beam.rotation.z; R.rotation.z=-beam.rotation.z; rad.forEach((m,i)=>{ m.rotation.x=t*2+i; m.rotation.y=t*1.5; }); });
})();
// 7. DOMS & adaptation
(function(){
  const s=station('doms',V(0,0,-160)), g=s.group;
  const fibers=[]; for(let i=0;i<5;i++){ const c=new THREE.Mesh(new THREE.CylinderGeometry(0.8,0.8,16,16),mat(0xd9686f)); c.rotation.z=Math.PI/2; c.position.set(-3,-3+i*1.7,0); g.add(c); fibers.push(c); }
  const tears=[]; for(let i=0;i<4;i++){ const m=new THREE.Mesh(new THREE.IcosahedronGeometry(0.45,0),mat(0xff5f5f,{emissive:0xff2222,emissiveIntensity:0.6})); m.position.set(-8+i*3.5,-2.2+i*1.5,1); g.add(m); tears.push(m); }
  part(s,'f',fibers,[addLabel(s,g,V(-3,-5.6,0),'离心训练后的细微损伤 → 炎症、酸痛（第 2–3 天）','Micro-damage → DOMS','sm')]);
  part(s,'r',tears,[addLabel(s,g,V(-8,6.6,0),'自由基：信号 → 适应','Radicals as signals','sm')]);
  const arrow=rod(g,V(6,0,0),V(10,0,0),0.25,0x7dffb0); const head=new THREE.Mesh(new THREE.ConeGeometry(0.7,1.4,16),mat(0x7dffb0)); head.rotation.z=-Math.PI/2; head.position.set(10.6,0,0); g.add(head);
  const pill=new THREE.Mesh(new THREE.CapsuleGeometry?new THREE.CapsuleGeometry(0.6,1.4,6,12):new THREE.CylinderGeometry(0.6,0.6,2.4,12),mat(0xffd166)); pill.rotation.z=Math.PI/2; pill.position.set(8,1.6,0.5); g.add(pill);
  part(s,'blk',[pill,arrow,head],[addLabel(s,g,V(9,4.2,0),'大剂量维生素 C + E 抑制训练带来的适应','High-dose C + E blunt adaptation','sm')]);
  s.updates.push(t=>{ tears.forEach((m,i)=>{ m.rotation.y=t*2+i; m.material.emissiveIntensity=0.3+0.4*Math.max(0,Math.sin(t*2+i)); }); pill.position.y=1.6+0.4*Math.sin(t*2); });
})();
})();
