/* 能量消耗的组成 */
(function(){
const {THREE,V,mat,ball,rod,tube,flow,curve,station,part,addLabel,sphereGeo}=J;
// ===== 1. TDEE ring =====
(function(){
  const s=station('pie',V(0,0,0)), g=s.group;
  const seg=[[0.62,0xff9f6b,'基础代谢','Basal metabolism ~60–70%'],[0.28,0x6ec8ff,'活动代谢（日常 + 运动）','Activity ~20–30%+'],[0.10,0xffd166,'食物热效应','Thermic effect ~10%']];
  let a0=0; const ms=[];
  seg.forEach(([f,c,zh,en],i)=>{ const geo=new THREE.CylinderGeometry(7,7,2,64,1,false,a0*Math.PI*2,f*Math.PI*2); const m=new THREE.Mesh(geo,mat(c)); g.add(m); ms.push(m);
    const am=(a0+f/2)*Math.PI*2; part(s,'s'+i,m,[addLabel(s,g,V(Math.sin(am)*9.5,2.2,Math.cos(am)*9.5),zh,en,'sm')]); m.userData.am=am; a0+=f; });
  addLabel(s,g,V(0,5.5,0),'每日总能量消耗','Total daily energy expenditure','tag');
  s.updates.push(t=>{ g.rotation.y=t*0.15; ms.forEach((m,i)=>{ const k=0.25+0.25*Math.sin(t*1.2+i*2); m.position.set(Math.sin(m.userData.am)*k,0,Math.cos(m.userData.am)*k); }); });
})();
// ===== 2. muscle furnace =====
(function(){
  const s=station('bmr',V(60,0,0)), g=s.group;
  const mus=new THREE.Group(); mus.position.set(-6,0,0); g.add(mus);
  for(let i=0;i<9;i++){ const a=i/9*Math.PI*2; const c=new THREE.Mesh(new THREE.CylinderGeometry(0.9,0.9,8,16),mat(0xd9686f,{emissive:0xff3311,emissiveIntensity:0.2})); c.position.set(Math.cos(a)*1.8,0,Math.sin(a)*1.8); mus.add(c);} 
  const fat=ball(g,V(6,0,0),3.2,0xffe08a,{opacity:0.85});
  const fl1=flow(g,curve([V(-6,4.5,0),V(-6,7,0),V(-5,10,0)]),8,0.3,0xff7733,0.4), fl2=flow(g,curve([V(6,3.5,0),V(6,5.5,0),V(6.5,8,0)]),2,0.25,0xff7733,0.15);
  part(s,'mus',[mus,fl1],[addLabel(s,g,V(-6,-5.5,0),'肌肉：24 小时都在耗能','Muscle · active tissue','sm')]);
  part(s,'fat',[fat,fl2],[addLabel(s,g,V(6,-4.5,0),'脂肪组织：耗能少得多','Adipose · low cost','sm')]);
  addLabel(s,g,V(0,11,0),'静息能耗（示意）','Resting energy use','tag');
  s.updates.push(t=>{ mus.children.forEach((c,i)=>c.material.emissiveIntensity=0.2+0.15*Math.sin(t*3+i)); });
})();
// ===== 3. 10-week study bars =====
(function(){
  const s=station('study',V(120,0,0)), g=s.group;
  const data=[['力量训练组','Strength',2.3,-0.8,-8],['耐力训练组','Endurance',-0.6,-2.0,0],['组合训练组','Combined',3.2,null,8]];
  rod(g,V(-12,0,0),V(12,0,0),0.06,0xffffff,{opacity:0.6});
  const bars=[];
  data.forEach(([zh,en,m,f,x])=>{ const b=new THREE.Mesh(new THREE.BoxGeometry(2,1,2),mat(0xd9686f)); g.add(b); bars.push([b,m,x-1.3]);
    if(f!=null){ const c=new THREE.Mesh(new THREE.BoxGeometry(2,1,2),mat(0xffd166)); g.add(c); bars.push([c,f,x+1.3]); addLabel(s,g,V(x+1.3,f*2-1,1.2),'体脂 '+f+' kg','','sm'); }
    addLabel(s,g,V(x-1.3,m*2+(m>0?1:-1),1.2),'肌肉 '+(m>0?'+':'')+m+' kg','','sm'); addLabel(s,g,V(x,-6.6,0),zh,en,'sm'); });
  part(s,'bars',bars.map(b=>b[0]),[addLabel(s,g,V(-12,8,0),'红：肌肉变化　黄：体脂变化（书中给出的数值）','10-week study','sm')]);
  s.updates.push(t=>{ const k=Math.min(1,(t%7)/2.5); bars.forEach(([b,v,x])=>{ const h=Math.max(0.02,Math.abs(v)*2*k); b.scale.y=h; b.position.set(x,(v>0?1:-1)*h/2,0); }); });
})();
// ===== 4. afterburn timeline =====
(function(){
  const s=station('epoc',V(0,0,-80)), g=s.group;
  const X=h=>-12+Math.sqrt(h/48)*24; rod(g,V(-12,0,0),V(12.5,0,0),0.05,0xffffff,{opacity:0.5});
  [0,2,6,12,24,48].forEach(h=>addLabel(s,g,V(X(h),-1,0),h+' h','','sm'));
  const f=h=> h<0?0 : 6*Math.exp(-h/0.9)+1.6*Math.exp(-h/16);
  const pts=[]; for(let h=0;h<=48;h+=0.25) pts.push(V(X(h),0.1+f(h),0)); const ln=tube(g,pts,0.13,0xff9f6b,0.95);
  const p1=[]; for(let h=0;h<=6;h+=0.25) p1.push(V(X(h),0.1+6*Math.exp(-h/0.9),0.3)); const l1=tube(g,p1,0.08,0xff6b6b,0.8);
  const dot=ball(g,V(0,0,0),0.35,0xffffff,{emissive:0xffffff,emissiveIntensity:0.6});
  part(s,'all',[ln.mesh,dot],[addLabel(s,g,V(X(30),3.0,0),'第二阶段：较弱，24–48 h','Phase 2','sm tag')]);
  part(s,'p1',l1.mesh,[addLabel(s,g,V(X(9),5.6,0),'第一阶段：剧烈，约 2 h','Phase 1','sm tag')]);
  addLabel(s,g,V(-6,9.5,0),'额外能耗（示意，平方根时间轴）','EPOC','sm');
  s.updates.push(t=>{ const h=(t*4)%48; dot.position.set(X(h),0.1+f(h),0); });
})();
// ===== 5. TEF bars + water =====
(function(){
  const s=station('tef',V(60,0,-80)), g=s.group;
  const d=[['蛋白质','Protein',25,0x7fd38a,-7],['碳水','Carbohydrate',8,0x6ec8ff,-2.5],['脂肪','Fat',2,0xffd166,2]];
  const bars=[]; d.forEach(([zh,en,v,c,x])=>{ const b=new THREE.Mesh(new THREE.BoxGeometry(2.6,1,2.6),mat(c)); g.add(b); bars.push([b,v,x]); addLabel(s,g,V(x,-1.2,0),zh,en,'sm'); addLabel(s,g,V(x,v*0.3+1,0),'≈'+v+'%','','sm tag'); });
  const glass=new THREE.Mesh(new THREE.CylinderGeometry(1.6,1.3,4,24,1,true),mat(0xffffff,{opacity:0.25,side:THREE.DoubleSide,depthWrite:false})); glass.position.set(8,2,0); g.add(glass);
  const water=new THREE.Mesh(new THREE.CylinderGeometry(1.5,1.25,3.2,24),mat(0x6ec8ff,{opacity:0.7})); water.position.set(8,1.6,0); g.add(water);
  part(s,'bars',bars.map(b=>b[0]),[addLabel(s,g,V(-3,10,0),'各营养素的食物热效应（占其热量的比例，常用值）','Thermic effect by macronutrient','sm')]);
  part(s,'water',[glass,water],[addLabel(s,g,V(8,-1.2,0),'500 ml 凉水','Water-induced thermogenesis','sm')]);
  s.updates.push(t=>{ const k=Math.min(1,(t%6)/2); bars.forEach(([b,v,x])=>{ const h=Math.max(0.02,v*0.3*k); b.scale.y=h; b.position.set(x,h/2,0); }); });
})();
// ===== 6. calculator scene: stacked tower =====
(function(){
  const s=station('calc',V(120,0,-80)), g=s.group;
  const base=new THREE.Mesh(new THREE.BoxGeometry(4,1,4),mat(0xff9f6b)); g.add(base);
  const act=new THREE.Mesh(new THREE.BoxGeometry(4,1,4),mat(0x6ec8ff)); g.add(act);
  const lb=addLabel(s,g,V(4.5,2,0),'基础代谢','—','sm'), la=addLabel(s,g,V(4.5,6,0),'活动部分','—','sm'), lt=addLabel(s,g,V(0,12,0),'每日需求','—','tag');
  part(s,'tower',[base,act],[lb,la,lt]);
  window.EE={lbm:85,k:2.0};
  s.updates.push(()=>{ const bmr=22*EE.lbm+500, tot=bmr*EE.k, sc=1/600; base.scale.y=bmr*sc; base.position.y=bmr*sc/2; act.scale.y=(tot-bmr)*sc; act.position.y=bmr*sc+(tot-bmr)*sc/2;
    lb.position.y=bmr*sc/2; la.position.y=bmr*sc+(tot-bmr)*sc/2; lt.position.y=tot*sc+1.2;
    lb.element.querySelector('span').textContent=Math.round(bmr)+' kcal'; la.element.querySelector('span').textContent=Math.round(tot-bmr)+' kcal'; lt.element.querySelector('span').textContent=Math.round(tot)+' kcal / 天'; });
})();
// ===== 7. measuring tape rings =====
(function(){
  const s=station('check',V(0,0,-160)), g=s.group;
  const parts=[['上臂围','Upper arm',-7,1.2,0x7fd38a],['大腿围','Thigh',0,2,0x7fd38a],['腰围','Waist',7,3,0xff8a8a]];
  const rings=[]; parts.forEach(([zh,en,x,r,c])=>{ const cyl=new THREE.Mesh(new THREE.CylinderGeometry(r,r,5,32),mat(0xd9a58a,{opacity:0.6})); cyl.position.set(x,0,0); g.add(cyl);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(r+0.15,0.12,8,48),mat(c,{emissive:c,emissiveIntensity:0.5})); ring.rotation.x=Math.PI/2; ring.position.set(x,0,0); g.add(ring); rings.push([ring,cyl,r,zh]); addLabel(s,g,V(x,-4,0),zh,en,'sm'); });
  part(s,'rings',rings.map(r=>r[0]),[addLabel(s,g,V(-3.5,5.5,0),'手臂、大腿 +1–2 cm，腰围只 +6 mm → 方向正确','Tape-measure check','sm tag')]);
  s.updates.push(t=>{ const k=(Math.sin(t*0.8)+1)/2; rings.forEach(([ring,cyl,r,zh])=>{ const dr= zh=='腰围'?0.06*k : 0.25*k; ring.scale.set((r+0.15+dr)/(r+0.15),(r+0.15+dr)/(r+0.15),1); cyl.scale.set((r+dr)/r,1,(r+dr)/r); }); });
})();
// ===== calculator panel =====
window.onStep=function(i,st){ const ex=document.getElementById('extra'); if(st.chart!=='calc'){ ex.innerHTML=''; return; }
  const opts=[[1.45,'1.4–1.5 · 完全坐着工作，几乎不运动'],[1.65,'1.6–1.7 · 大多坐着，偶尔走动，最多群众性运动'],[1.8,'1.8–1.9 · 主要站着/步行，或追求成绩的运动者'],[2.0,'2.0–2.4 · 重体力劳动者、运动员']];
  ex.innerHTML=`<div class="chart"><label id="lL">去脂体重：${EE.lbm} kg</label><input type="range" id="lbm" min="35" max="110" value="${EE.lbm}">
  <label>活动系数（书中表 16）</label><select id="kf" style="width:100%;padding:6px;border-radius:6px;background:#111830;color:#e9eefc;border:1px solid #ffffff33">${opts.map(([v,t])=>`<option value="${v}" ${v==EE.k?'selected':''}>${t}</option>`).join('')}</select>
  <label id="kL">微调系数：${EE.k.toFixed(2)}</label><input type="range" id="kr" min="1.4" max="2.4" step="0.05" value="${EE.k}"><div class="readout"></div></div>`;
  const ro=()=>{ const b=22*EE.lbm+500; ex.querySelector('.readout').innerHTML=`基础代谢 = 22 × ${EE.lbm} + 500 = <b>${Math.round(b)} kcal</b><br>每日需求 = ${Math.round(b)} × ${EE.k.toFixed(2)} ≈ <b>${Math.round(b*EE.k)} kcal</b><br>增肌：+约 500 kcal/天 → ${Math.round(b*EE.k+500)}；减脂：−500 kcal/天 → ${Math.round(b*EE.k-500)}`;
    document.getElementById('lL').textContent='去脂体重：'+EE.lbm+' kg'; document.getElementById('kL').textContent='微调系数：'+EE.k.toFixed(2); document.getElementById('kr').value=EE.k; };
  document.getElementById('lbm').addEventListener('input',e=>{EE.lbm=+e.target.value; ro();});
  document.getElementById('kf').addEventListener('change',e=>{EE.k=+e.target.value; ro();});
  document.getElementById('kr').addEventListener('input',e=>{EE.k=+e.target.value; ro();}); ro(); };
})();
