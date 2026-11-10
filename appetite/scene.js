/* 食欲、饱腹感与能量密度 */
(function(){
const {THREE,V,mat,ball,rod,tube,flow,curve,station,part,addLabel}=J;
// 1. genes vs environment balance
(function(){
  const s=station('genes',V(0,0,0)), g=s.group;
  rod(g,V(0,-6,0),V(0,3,0),0.25,0xaab4d0); const base=new THREE.Mesh(new THREE.CylinderGeometry(2.5,3,0.6,24),mat(0x6b7594)); base.position.y=-6; g.add(base);
  const beam=new THREE.Group(); beam.position.y=3; g.add(beam);
  rod(beam,V(-8,0,0),V(8,0,0),0.18,0xdde3f5);
  const mk=(x,c)=>{ const p=new THREE.Group(); p.position.set(x,0,0); beam.add(p); rod(p,V(0,0,0),V(0,-3,0),0.05,0xffffff,{opacity:0.6}); const pan=new THREE.Mesh(new THREE.CylinderGeometry(2.4,1.8,0.5,24),mat(c)); pan.position.y=-3.2; p.add(pan); return p; };
  const pg=mk(-8,0xb48cff), pe=mk(8,0x6ec8ff);
  for(let i=0;i<5;i++) ball(pg,V(-1+i*0.5,-2.4,(i%2)*0.6-0.3),0.5,0xd9b8ff);
  const food=[]; for(let i=0;i<6;i++) food.push(ball(pe,V(-1.2+i*0.5,-2.4,(i%2)*0.6-0.3),0.45,0xffb36b));
  part(s,'g',pg,[addLabel(s,g,V(-8,-4.6,0),'体质（基因）：不可改变','Genes · fixed','sm')]);
  part(s,'e',pe,[addLabel(s,g,V(8,-4.6,0),'环境：食物供应、活动量，可以改变','Environment · modifiable','sm')]);
  addLabel(s,g,V(0,7,0),'体脂 = 基因 × 环境','Genes need an obesogenic environment','tag');
  s.updates.push(t=>{ const a=0.12*Math.sin(t*0.8); beam.rotation.z=a; pg.rotation.z=-a; pe.rotation.z=-a; food.forEach((f,i)=>f.visible=(Math.sin(t*0.8)>-0.6+i*0.25)); });
})();
// 2. leptin loop
(function(){
  const s=station('leptin',V(60,0,0)), g=s.group;
  const cell=ball(g,V(-7,-3,0),3,0xffe08a,{opacity:0.9}); const nuc=ball(g,V(-8.6,-2,1.8),0.6,0xb08a3a);
  const brain=ball(g,V(6,5,0),3.2,0xf2a5c0,{opacity:0.85}); brain.scale.set(3.6,2.8,3);
  const hyp=ball(g,V(6,3,1.8),0.8,0xff5f8f,{emissive:0xff3366,emissiveIntensity:0.5});
  const c=curve([V(-5,0,0),V(-2,4,1),V(2,5.5,1),V(5,3.5,1.6)]); tube(g,c.points,0.35,0xffffff,0.12);
  const lep=flow(g,c,14,0.28,0x7dffb0,0.25);
  const gauge=new THREE.Group(); gauge.position.set(6,-4,0); g.add(gauge);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(2.2,0.15,8,48,Math.PI),mat(0xffffff,{opacity:0.5})); gauge.add(ring);
  const needle=rod(gauge,V(0,0,0),V(0,2,0),0.09,0xff6b6b); const nd=new THREE.Group(); gauge.add(nd); gauge.remove(needle); nd.add(needle);
  rod(g,V(6,1.6,1.6),V(6,-1.6,0.5),0.08,0xff5f8f,{opacity:0.6});
  part(s,'cell',[cell,nuc],[addLabel(s,g,V(-7,-7,0),'脂肪细胞：变小 → 瘦素分泌减少','Shrinking fat cell → less leptin','sm')]);
  part(s,'lep',lep,[addLabel(s,g,V(-2,6.4,1),'瘦素（血液）','Leptin','sm')]);
  part(s,'brain',[brain,hyp],[addLabel(s,g,V(6,9.6,0),'大脑调控中心（下丘脑）','Brain · hypothalamus','sm')]);
  part(s,'gauge',nd,[addLabel(s,g,V(6,-6.5,0),'食欲','Appetite','sm')]);
  s.updates.push(t=>{ const k=0.5+0.5*Math.sin(t*0.6); cell.scale.setScalar(1.8+1.4*k); lep.count=Math.max(2,Math.round(14*k)); nd.rotation.z=(k-0.5)*2.4; });
})();
// 3. multiple signals
(function(){
  const s=station('sig',V(120,0,0)), g=s.group;
  const brain=ball(g,V(0,6,0),3,0xf2a5c0,{opacity:0.8}); brain.scale.set(3.4,2.6,2.8);
  const hyp=ball(g,V(0,4.2,1.6),0.8,0xff5f8f,{emissive:0xff3366,emissiveIntensity:0.6});
  const src=[['fat',V(-9,-4,0),0xffe08a,0x7dffb0,'脂肪组织 → 瘦素','Adipose · leptin (in book)'],['pan',V(0,-6,1),0xffb36b,0x6ec8ff,'胰腺 → 胰岛素','Pancreas · insulin (in book)'],['sto',V(9,-4,0),0xd9686f,0xffd166,'胃 → 胃饥饿素（补充）','Stomach · ghrelin (added)']];
  src.forEach(([k,p,c,fc,zh,en])=>{ const o=ball(g,p,2,c,{opacity:0.9}); if(k==='sto') o.scale.set(2.6,1.8,1.8);
    const cv=curve([p.clone().add(V(0,2,0)),V(p.x*0.5,1.5,1.5),V(0,3.6,1.6)]); const f=flow(g,cv,8,0.25,fc,0.3);
    part(s,k,[o,f],[addLabel(s,g,p.clone().add(V(0,-3,0)),zh,en,'sm')]); });
  part(s,'hyp',[brain,hyp],[addLabel(s,g,V(0,10,0),'100 多种基因、众多信号分子共同调控','Many redundant signals','tag')]);
  s.updates.push(t=>{ hyp.material.emissiveIntensity=0.4+0.3*Math.sin(t*3); });
})();
// 4. exercise and appetite – buffet experiment (qualitative)
(function(){
  const s=station('ex',V(0,0,-80)), g=s.group;
  rod(g,V(-11,0,0),V(11,0,0),0.06,0xffffff,{opacity:0.6});
  const d=[['吃早餐','Breakfast',3,-8,0x8fa3c8],['不吃早餐','Skipped',6,-4,0xff9f6b],['不运动','Rest',3.6,4,0x8fa3c8],['运动','Exercised',3.8,8,0x6ec8ff]];
  const bars=[]; d.forEach(([zh,en,h,x,c])=>{ const b=new THREE.Mesh(new THREE.BoxGeometry(2.6,1,2.6),mat(c)); g.add(b); bars.push([b,h]); b.position.x=x; addLabel(s,g,V(x,-1.4,1.4),zh,en,'sm'); });
  part(s,'bars',bars.map(b=>b[0]),[addLabel(s,g,V(-6,9,0),'实验 1：饥饿 → 自助餐吃得多得多','Fasting → eat more','sm'),addLabel(s,g,V(6,9,0),'实验 2：运动造成的亏空 → 并未多吃','Exercise deficit → no extra intake','sm')]);
  addLabel(s,g,V(0,-5.2,0),'自助餐摄入量（示意）','Buffet intake · schematic','tag');
  s.updates.push(t=>{ const k=Math.min(1,(t%8)/2.5); bars.forEach(([b,h])=>{ b.scale.y=Math.max(0.02,h*k); b.position.y=h*k/2; }); });
})();
// 5. energy density: same stomach volume
(function(){
  const s=station('ed',V(60,0,-80)), g=s.group;
  const mk=(x,c,n,zh,en,k)=>{ const st=new THREE.Group(); st.position.x=x; g.add(st);
    const sto=new THREE.Mesh(new THREE.SphereGeometry(1,32,20),mat(0xd9686f,{opacity:0.25,depthWrite:false})); sto.scale.set(3.6,4.2,3); sto.position.y=1; st.add(sto);
    const items=[]; for(let i=0;i<n;i++){ const it=ball(st,V((Math.random()-0.5)*4,-2+Math.random()*6,(Math.random()-0.5)*3),0.75,c); items.push(it);} 
    part(s,k,[...items],[addLabel(s,g,V(x,-5,0),zh,en,'sm')]); return items; };
  const ap=mk(-7,0xd9b27a,18,'8 片无黄油面包 ≈ 1136 kcal','8 slices plain','a');
  const ch=mk(7,0xffd166,18,'8 片涂黄油面包 ≈ 1712 kcal','8 slices buttered','b');
  addLabel(s,g,V(0,8.5,0),'同样“装满胃”的量，热量差约 580 kcal','Same volume, different energy','tag');
  s.updates.push(t=>{ [...ap,...ch].forEach((b,i)=>{ b.position.y+=Math.sin(t*2+i)*0.003; }); });
})();
// 6. emotion chain
(function(){
  const s=station('emo',V(120,0,-80)), g=s.group;
  const nodes=[[V(-10,-3,0),0xffd166,'碳水化合物','Carbohydrate'],[V(-4,1,0),0x6ec8ff,'胰岛素','Insulin'],[V(2,-1,0),0xb48cff,'血清素前体进入大脑','Tryptophan → brain'],[V(8,3,0),0xff7fb0,'血清素：放松、愉悦','Serotonin']];
  const ms=nodes.map(([p,c,zh,en],i)=>{ const b=ball(g,p,1.3,c,{emissive:c,emissiveIntensity:0.3}); part(s,'n'+i,b,[addLabel(s,g,p.clone().add(V(0,-2.4,0)),zh,en,'sm')]); return b; });
  const cv=curve(nodes.map(n=>n[0])); tube(g,cv.points,0.12,0xffffff,0.25); flow(g,cv,10,0.22,0xffffff,0.15);
  addLabel(s,g,V(-1,7,0),'书中的解释链：吃甜食 → 情绪变好','Book’s carb–serotonin chain','tag');
  s.updates.push(t=>{ ms.forEach((b,i)=>b.material.emissiveIntensity=0.25+0.3*Math.max(0,Math.sin(t*2-i))); });
})();
// 7. strategies: 14-day calendar + waist ring
(function(){
  const s=station('plan',V(0,0,-160)), g=s.group;
  const tiles=[]; for(let i=0;i<14;i++){ const x=-11+(i%7)*2.4, y=2.5-Math.floor(i/7)*2.6; const c=(i===6||i===13)?0xffb36b:0x3a4a78; const tl=new THREE.Mesh(new THREE.BoxGeometry(2,2,0.4),mat(c)); tl.position.set(x,y,0); g.add(tl); tiles.push(tl);} 
  part(s,'cal',tiles,[addLabel(s,g,V(-3.8,5.6,0),'7 或 14 天为一周期：计划好的“欺骗餐”','Planned flexibility','sm')]);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(2.5,0.18,10,48),mat(0x7dffb0,{emissive:0x33ff99,emissiveIntensity:0.4})); ring.rotation.x=Math.PI/2; ring.position.set(12,0,0); g.add(ring);
  const body=new THREE.Mesh(new THREE.CylinderGeometry(2.2,2.2,7,32),mat(0x9a7a7a,{opacity:0.8})); body.position.set(12,0,0); g.add(body);
  part(s,'waist',[ring,body],[addLabel(s,g,V(12,-5,0),'可实现又有吸引力：4 周腰围 −5 cm','Realistic goal','sm')]);
  s.updates.push(t=>{ const k=(t%6)/6; const r=1-0.15*k; body.scale.set(r,1,r); ring.scale.set(r,r,1); tiles.forEach((tl,i)=>tl.position.z=(Math.floor(t*2)%14===i)?0.6:0); });
})();

window.onStep=function(i,st){ const ex=document.getElementById('extra'); if(st.chart!=='ed'){ ex.innerHTML=''; return; }
  const foods=[['苹果',54],['蔬菜、沙拉（约）',40],['低脂鱼/瘦肉（约）',95],['黑麦或小麦面包',238],['咸饼干条/玉米片（约）',335],['坚果全脂牛奶巧克力',550]];
  ex.innerHTML=`<div class="chart"><label>如果一天吃 1.4 kg 都是这一种食物：</label><select id="fd" style="width:100%;padding:6px;border-radius:6px;background:#111830;color:#e9eefc;border:1px solid #ffffff33">${foods.map(([n,v],j)=>`<option value="${j}">${n} · ${v} kcal/100 g</option>`).join('')}</select>
  <label id="wL">每日食物重量：1.4 kg</label><input type="range" id="wt" min="1.4" max="1.7" step="0.05" value="1.4"><div class="readout"></div></div>`;
  const ro=()=>{ const [n,v]=foods[+document.getElementById('fd').value]; const w=+document.getElementById('wt').value; const kc=Math.round(v*w*10);
    const cls=v>=225?'大能量密度（≥225）':v<125?'低能量密度（<125，书中推荐）':'中等';
    document.getElementById('wL').textContent='每日食物重量：'+w.toFixed(2)+' kg（德国人平均 1.4–1.7 kg）';
    ex.querySelector('.readout').innerHTML=`${n}：${v} kcal/100 g → <b>${cls}</b><br>${w.toFixed(2)} kg × ${v} kcal/100 g ≈ <b>${kc} kcal</b>`; };
  document.getElementById('fd').addEventListener('change',ro); document.getElementById('wt').addEventListener('input',ro); ro(); };
})();
