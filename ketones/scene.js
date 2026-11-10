/* 酮体与高脂低碳饮食 */
(function(){
const {THREE,V,mat,ball,rod,tube,flow,curve,station,part,addLabel}=J;
// 1. insulin switch at fat cell
(function(){
  const s=station('ins',V(0,0,0)), g=s.group;
  const cell=ball(g,V(0,0,0),3.4,0xffe08a,{opacity:0.9});
  const inF=flow(g,curve([V(-12,3,0),V(-7,2,0),V(-3.4,0.6,0)]),10,0.3,0xffb36b,0.3);
  const outF=flow(g,curve([V(3.4,-0.6,0),V(7,-2,0),V(12,-3,0)]),10,0.3,0x7dffb0,0.3);
  const lpl=new THREE.Mesh(new THREE.TorusGeometry(0.9,0.22,10,30),mat(0xff6b6b,{emissive:0xff3333,emissiveIntensity:0.4})); lpl.position.set(-6,2.2,0); g.add(lpl);
  const hsl=new THREE.Mesh(new THREE.TorusGeometry(0.9,0.22,10,30),mat(0x6ec8ff,{emissive:0x3399ff,emissiveIntensity:0.4})); hsl.position.set(6,-2.2,0); g.add(hsl);
  part(s,'lpl',[lpl,inF],[addLabel(s,g,V(-8,4.2,0),'胰岛素激活脂蛋白脂肪酶 → 脂肪入库','Insulin ↑ LPL · storage','sm')]);
  part(s,'hsl',[hsl,outF],[addLabel(s,g,V(7,-4.8,0),'胰岛素抑制甘油三酯水解酶 → 释放受阻','Insulin ↓ HSL · release','sm')]);
  addLabel(s,g,V(0,9,0),'低碳派的理论：压低胰岛素 → 脂肪多放少存','Low-carb rationale','tag');
  s.updates.push(t=>{ const k=0.5+0.5*Math.sin(t*0.7); inF.count=Math.max(1,Math.round(10*k)); outF.count=Math.max(1,Math.round(10*(1-k))); lpl.scale.setScalar(0.6+0.6*k); hsl.scale.setScalar(0.6+0.6*(1-k)); });
})();
// 2. glycogen depletion & gluconeogenesis
(function(){
  const s=station('gng',V(60,0,0)), g=s.group;
  const liver=ball(g,V(-6,0,0),1,0x8a3a3a,{opacity:0.85}); liver.scale.set(5,3,2.5);
  const gl=[]; for(let i=0;i<14;i++) gl.push(ball(g,V(-8.5+(i%7)*0.8,-0.6+Math.floor(i/7)*1.2,2.4),0.35,0xffd166,{emissive:0xffaa00,emissiveIntensity:0.3}));
  part(s,'gly',gl,[addLabel(s,g,V(-6,-4.2,0),'糖原几天内基本耗尽','Glycogen depleted in days','sm')]);
  const aa=flow(g,curve([V(-14,-6,0),V(-11,-4,0),V(-8,-1.5,1)]),8,0.25,0xb48cff,0.25);
  part(s,'aa',aa,[addLabel(s,g,V(-14,-7.5,0),'起初几天大量消耗蛋白质（氨基酸）','Amino acids','sm')]);
  const tgt=[[V(7,5,0),0xf2a5c0,'神经细胞','Neurons'],[V(9,0,0),0xff6b6b,'红细胞','Red cells'],[V(7,-5,0),0x9fd8ff,'眼睛晶状体','Lens']];
  tgt.forEach(([p,c,zh,en],i)=>{ const b=ball(g,p,1.4,c,{opacity:0.9}); const f=flow(g,curve([V(-1,0,0),V(3,p.y*0.6,0),p.clone().add(V(-1.4,0,0))]),6,0.22,0xffffff,0.3); part(s,'t'+i,[b,f],[addLabel(s,g,p.clone().add(V(0,-2.2,0)),zh,en,'sm')]); });
  addLabel(s,g,V(1,8.5,0),'糖异生（肝、肾）：血糖保持在健康范围','Gluconeogenesis','tag');
  s.updates.push(t=>{ const k=Math.floor((t*2)%16); gl.forEach((b,i)=>b.visible=i>=k); });
})();
// 3. ketogenesis
(function(){
  const s=station('keto',V(120,0,0)), g=s.group;
  const liver=ball(g,V(-8,0,0),1,0x8a3a3a,{opacity:0.5,depthWrite:false}); liver.scale.set(5,4,3);
  const fa=flow(g,curve([V(-16,4,0),V(-12,2,0),V(-9,0.8,0)]),10,0.25,0xffe08a,0.3);
  part(s,'fa',fa,[addLabel(s,g,V(-16,5.8,0),'大量脂肪酸涌入肝脏','Fatty acids flood in','sm')]);
  const ac=ball(g,V(-9,0,1.5),0.9,0xffd166,{emissive:0xffaa00,emissiveIntensity:0.4});
  const aca=ball(g,V(-6,1.5,1.5),0.8,0xff9f6b,{emissive:0xff6600,emissiveIntensity:0.4});
  const bhb=ball(g,V(-6,-1.5,1.5),0.8,0x7dffb0,{emissive:0x33ff99,emissiveIntensity:0.4});
  rod(g,V(-9,0,1.5),V(-6,1.5,1.5),0.08,0xffffff,{opacity:0.6}); rod(g,V(-6,1.5,1.5),V(-6,-1.5,1.5),0.08,0xffffff,{opacity:0.6});
  part(s,'ac',ac,[addLabel(s,g,V(-10.5,-1.8,1.5),'乙酰辅酶 A（“脂肪碎片”）','Acetyl-CoA','sm')]);
  part(s,'kb',[aca,bhb],[addLabel(s,g,V(-4.2,3.4,1.5),'乙酰乙酸','Acetoacetate','sm'),addLabel(s,g,V(-4.2,-3.4,1.5),'β-羟丁酸','β-hydroxybutyrate','sm')]);
  const dest=[[V(8,6,0),0xd9686f,'肌肉','Muscle'],[V(10,1,0),0xf2a5c0,'大脑（适应数周后部分利用）','Brain'],[V(8,-4,0),0xffe08a,'尿液排出','Urine'],[V(4,-8,0),0x9fd8ff,'呼吸（丙酮，特殊口气）','Breath · acetone']];
  dest.forEach(([p,c,zh,en],i)=>{ const b=ball(g,p,1.3,c,{opacity:0.9}); const f=flow(g,curve([V(-5,0,1.5),V(1,p.y*0.5,1),p.clone().add(V(-1.3,0,0))]),i<2?8:4,0.22,i===3?0x9fd8ff:0x7dffb0,0.3); part(s,'d'+i,[b,f],[addLabel(s,g,p.clone().add(V(0,-2,0)),zh,en,'sm')]); });
  addLabel(s,g,V(-2,9,0),'生酮作用：肝脏的代谢旁路','Ketogenesis','tag');
})();
// 4. hormone study bars
(function(){
  const s=station('horm',V(0,0,-80)), g=s.group;
  rod(g,V(-13,0,0),V(13,0,0),0.06,0xffffff,{opacity:0.6});
  const d=[['皮质醇','Cortisol',0],['IGF-1','IGF-1',0],['T3','T3',0],['睾酮','Testosterone',0],['T4','T4 ↑',2],['胰岛素','Insulin −30%',-3]];
  const bars=[]; d.forEach(([zh,en,v],i)=>{ const x=-10.5+i*4.2; const c=v>0?0x7dffb0:v<0?0xff6b6b:0x8fa3c8; const b=new THREE.Mesh(new THREE.BoxGeometry(2.4,1,2.4),mat(c)); g.add(b); bars.push([b,v,x]); addLabel(s,g,V(x,v<0?1.6:-1.6,1.3),zh,en,'sm'); });
  part(s,'bars',bars.map(b=>b[0]),[addLabel(s,g,V(-6,6,0),'6 周极低碳（碳水 50% → 8%），不运动的男性','6-week study, sedentary men','sm')]);
  const fat=ball(g,V(9,6.5,0),1.4,0xffe08a), lbm=ball(g,V(12,6.5,0),1.1,0xd9686f);
  part(s,'res',[fat,lbm],[addLabel(s,g,V(10.5,9,0),'体脂 −3.4 kg　去脂体重 +1.1 kg','Fat −3.4 kg · LBM +1.1 kg','sm')]);
  addLabel(s,g,V(0,-5,0),'灰：没有变化（示意高度）','Grey = unchanged','tag');
  s.updates.push(t=>{ const k=Math.min(1,(t%7)/2); bars.forEach(([b,v,x])=>{ const h=Math.max(0.15,Math.abs(v)*k); b.scale.y=h; b.position.set(x,(v<0?-1:1)*h/2,0); }); fat.scale.setScalar(1.4-0.5*k); lbm.scale.setScalar(1.1+0.3*k); });
})();
// 5. 2-year comparison
(function(){
  const s=station('cmp',V(60,0,-80)), g=s.group;
  rod(g,V(-11,0,0),V(11,0,0),0.06,0xffffff,{opacity:0.6});
  const d=[['低碳','Low-carb',5.5,78,-7,0xff9f6b],['地中海式','Mediterranean',4.6,85,0,0x7dffb0],['低脂','Low-fat',3.3,90,7,0x6ec8ff]];
  const bars=[]; d.forEach(([zh,en,kg,st,x,c])=>{ const b=new THREE.Mesh(new THREE.BoxGeometry(3,1,3),mat(c)); g.add(b); bars.push([b,kg,x]);
    addLabel(s,g,V(x,-1.4,1.6),zh,en,'sm'); addLabel(s,g,V(x,-kg*1.4-1.2,1.6),(zh==='地中海式'?'略少于低碳':'−'+kg+' kg')+'　坚持 '+st+'%','','sm'); });
  part(s,'bars',bars.map(b=>b[0]),[addLabel(s,g,V(0,4,0),'两年实验的减重（向下为减少）','2-year trial · weight change','tag')]);
  s.updates.push(t=>{ const k=Math.min(1,(t%7)/2); bars.forEach(([b,v,x])=>{ const h=Math.max(0.02,v*1.4*k); b.scale.y=h; b.position.set(x,-h/2,0); }); });
})();
// 6. side effects
(function(){
  const s=station('side',V(120,0,-80)), g=s.group;
  const drop=new THREE.Mesh(new THREE.SphereGeometry(1,24,16),mat(0x6ec8ff,{opacity:0.85})); drop.scale.set(2.2,2.8,2.2); drop.position.set(-9,1,0); g.add(drop);
  const tip=new THREE.Mesh(new THREE.ConeGeometry(1.55,2.4,24),mat(0x6ec8ff,{opacity:0.85})); tip.position.set(-9,4.3,0); g.add(tip);
  part(s,'w',[drop,tip],[addLabel(s,g,V(-9,-3.6,0),'第一周最多失水 3 kg','Up to 3 kg water, week 1','sm')]);
  const ions=[['Na⁺',0xffd166],['K⁺',0xb48cff],['Mg²⁺',0x7dffb0]]; const fl=[];
  ions.forEach(([n,c],i)=>{ const f=flow(g,curve([V(-2,4-i*3,0),V(1,4-i*3,0),V(4,3.5-i*3,0)]),6,0.3,c,0.35); fl.push(f); addLabel(s,g,V(-3,4-i*3,0),n,'','sm'); });
  part(s,'ion',fl,[addLabel(s,g,V(1,6.5,0),'矿物质剧烈波动，钠大量排出','Electrolyte losses','sm')]);
  const bar=new THREE.Group(); bar.position.set(10,0,0); g.add(bar); rod(bar,V(-3,0,0),V(3,0,0),0.15,0xcfd6e6);
  [-2.5,2.5].forEach(x=>{ const p=new THREE.Mesh(new THREE.CylinderGeometry(1.3,1.3,0.5,24),mat(0x3a3f52)); p.rotation.z=Math.PI/2; p.position.x=x; bar.add(p); });
  part(s,'bar',bar,[addLabel(s,g,V(10,-3.6,0),'大容量训练：成绩下降 >20%','High-volume work suffers','sm')]);
  s.updates.push(t=>{ bar.position.y=Math.abs(Math.sin(t*0.9))*2.2; drop.scale.y=2.8-0.6*((t%4)/4); });
})();
// 7. summary scale
(function(){
  const s=station('sum',V(0,0,-160)), g=s.group;
  rod(g,V(0,-5,0),V(0,2,0),0.2,0xaab4d0); const beam=new THREE.Group(); beam.position.y=2; g.add(beam); rod(beam,V(-8,0,0),V(8,0,0),0.16,0xdde3f5);
  const a=new THREE.Mesh(new THREE.BoxGeometry(4.5,3,3),mat(0xff9f6b)); a.position.set(-7,-2,0); beam.add(a);
  const b=new THREE.Mesh(new THREE.BoxGeometry(2.6,1.4,2.2),mat(0x8fa3c8)); b.position.set(7,-1.2,0); beam.add(b);
  part(s,'a',a,[addLabel(s,g,V(-7,-4.5,0),'热量平衡','Energy balance','sm')]);
  part(s,'b',b,[addLabel(s,g,V(7,-3.2,0),'碳水与脂肪的比例','Carb : fat ratio','sm')]);
  addLabel(s,g,V(0,6,0),'所有研究：热量平衡比宏量比例更重要','Calories outweigh ratios','tag');
  s.updates.push(t=>{ beam.rotation.z=0.12+0.03*Math.sin(t); a.rotation.z=-beam.rotation.z; b.rotation.z=-beam.rotation.z; });
})();

window.onStep=function(i,st){ const ex=document.getElementById('extra'); if(st.chart!=='carb'){ ex.innerHTML=''; return; }
  window.KC=window.KC||{g:60};
  ex.innerHTML=`<div class="chart"><label id="cL"></label><input type="range" id="cg" min="0" max="350" step="5" value="${KC.g}"><div class="readout"></div></div>`;
  const ro=()=>{ const x=KC.g; let z;
    if(x<=70) z='阿特金斯 / 生酮区（研究中 20–70 g）：糖原耗尽，开始产生酮体';
    else if(x<100) z='很低碳：书中没有单独定义，酮体可能少量产生';
    else if(x<=150) z='书中的“低碳饮食”（100–150 g）：不产生酮体，但脂肪分解加快；书中认为减脂的碳水上限在 120–150 g';
    else if(x<=300) z='书中推荐的增肌范围（150–300 g，配合充足蛋白质）';
    else z='高于书中讨论的范围';
    document.getElementById('cL').textContent='每日碳水化合物：'+x+' g';
    ex.querySelector('.readout').innerHTML=`<b>${z}</b>`; };
  document.getElementById('cg').addEventListener('input',e=>{KC.g=+e.target.value; ro();}); ro(); };
})();
