/* 咖啡因与酒精 */
(function(){
const {THREE,V,mat,ball,rod,tube,flow,curve,station,part,addLabel}=J;
// 1. caffeine content cups (Table 4)
(function(){
  const s=station('cup',V(0,0,0)), g=s.group;
  const d=[['过滤咖啡','Filter',61,200],['速溶咖啡','Instant',53,144],['浓缩咖啡','Espresso',50,60],['红茶','Tea',12,75],['可乐','Cola',23,70],['功能饮料','Energy',80,80]];
  const S=0.045, bars=[];
  d.forEach(([zh,en,lo,hi],i)=>{ const x=-12.5+i*5;
    const lo3=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.0,1,24),mat(0x8a5a3a)); g.add(lo3);
    const hi3=new THREE.Mesh(new THREE.CylinderGeometry(1.25,1.25,1,24),mat(0xffb36b,{opacity:0.3,depthWrite:false})); g.add(hi3);
    bars.push([lo3,hi3,lo,hi,x]); addLabel(s,g,V(x,i%2?-3.4:-1.4,1.4),zh,en,'sm'); addLabel(s,g,V(x,hi*S+1,0),lo===hi?lo+' mg':lo+'–'+hi+' mg','','sm'); });
  const lim=rod(g,V(-15,300*S,0),V(15,300*S,0),0.06,0xff6b6b);
  part(s,'lim',lim,[addLabel(s,g,V(10,300*S+1.2,0),'每日上限 300 mg','Daily cap for athletes','sm')]);
  part(s,'bars',bars.map(b=>b[0]),[addLabel(s,g,V(-8,300*S+3,0),'深色：下限　浅色：上限（书中表 4）','Caffeine per serving','tag')]);
  s.updates.push(t=>{ const k=Math.min(1,(t%8)/2); bars.forEach(([a,b,lo,hi,x])=>{ a.scale.y=Math.max(0.02,lo*S*k); a.position.set(x,lo*S*k/2,0); b.scale.y=Math.max(0.02,hi*S*k); b.position.set(x,hi*S*k/2,0); }); });
})();
// 2. pharmacokinetics curve
(function(){
  const s=station('pk',V(60,0,0)), g=s.group;
  rod(g,V(-12,0,0),V(12,0,0),0.05,0xffffff,{opacity:0.5}); rod(g,V(-12,0,0),V(-12,9,0),0.05,0xffffff,{opacity:0.5});
  const X=h=>-12+h*2; [0,1,3,5,7,10,12].forEach(h=>addLabel(s,g,V(X(h),-1,0),h+' h','','sm'));
  const f=(h,T)=>{ const ka=3, ke=Math.LN2/T; return 8*(Math.exp(-ke*h)-Math.exp(-ka*h))/(1-Math.exp(-ka)); };
  const mk=(T,c,op)=>{ const p=[]; for(let h=0;h<=12;h+=0.1) p.push(V(X(h),Math.min(9,0.05+f(h,T)*0.9),0)); return tube(g,p,0.12,c,op); };
  const a=mk(3,0x7dffb0,0.9), b=mk(7,0xffb36b,0.9);
  part(s,'a',a.mesh,[addLabel(s,g,V(X(8),2.2,0),'半衰期 3 h（分解快）','t½ 3 h','sm')]);
  part(s,'b',b.mesh,[addLabel(s,g,V(X(10),6,0),'半衰期 7 h（分解慢）','t½ 7 h','sm')]);
  addLabel(s,g,V(X(1),9.6,0),'约 1 小时达到峰值','Peak ≈ 1 h','tag');
  const dot=ball(g,V(0,0,0),0.3,0xffffff,{emissive:0xffffff,emissiveIntensity:0.6});
  s.updates.push(t=>{ const h=(t*1.5)%12; dot.position.set(X(h),0.05+f(h,7)*0.9,0); });
})();
// 3. adenosine receptor
(function(){
  const s=station('aden',V(120,0,0)), g=s.group;
  const mem=new THREE.Mesh(new THREE.BoxGeometry(26,0.6,6),mat(0x6b7594,{opacity:0.6})); mem.position.y=-2; g.add(mem);
  const recs=[], ligs=[];
  for(let i=0;i<4;i++){ const x=-9+i*6; const r=new THREE.Mesh(new THREE.TorusGeometry(1.2,0.35,12,24,Math.PI),mat(0x6ec8ff)); r.rotation.z=Math.PI; r.position.set(x,-0.6,0); g.add(r); recs.push(r);
    const isC=i%2===1; const l=ball(g,V(x,6,0),0.9,isC?0xffb36b:0xb48cff,{emissive:isC?0xff8800:0x8844ff,emissiveIntensity:0.3}); ligs.push([l,x,isC]); }
  part(s,'rec',recs,[addLabel(s,g,V(-12,-4,0),'腺苷受体（神经细胞膜）','Adenosine receptor','sm')]);
  part(s,'ad',ligs.filter(l=>!l[2]).map(l=>l[0]),[addLabel(s,g,V(-9,8.2,0),'腺苷：积累 → 疲倦','Adenosine · tiredness','sm')]);
  part(s,'caf',ligs.filter(l=>l[2]).map(l=>l[0]),[addLabel(s,g,V(9,8.2,0),'咖啡因：占位但不激活 → 清醒','Caffeine · blocks','sm')]);
  const sig=[]; recs.forEach((r,i)=>{ if(i%2===0){ const m=ball(g,V(r.position.x,-4,0),0.4,0xb48cff,{emissive:0xb48cff,emissiveIntensity:0.8}); sig.push(m);} });
  s.updates.push(t=>{ const k=(t%5)/5; ligs.forEach(([l,x])=>{ const y=k<0.5? 6-k*2*5.2 : 0.8; l.position.set(x,y,0); }); sig.forEach(m=>{ m.visible=k>0.5; m.position.y=-3-((t*2)%2); }); });
})();
// kidney builder
function kidney(g,x){ const k=new THREE.Group(); k.position.x=x; g.add(k); const a=ball(k,V(0,0,0),1,0xb85a5a,{opacity:0.9}); a.scale.set(2.2,3.4,1.6); const h=ball(k,V(1.6,0,0.4),0.9,0x5a1f2a); return k; }
// 4. caffeine diuresis and habituation
(function(){
  const s=station('diu',V(0,0,-80)), g=s.group;
  const k1=kidney(g,-7), k2=kidney(g,7);
  const f1=flow(g,curve([V(-5.5,-1,0.5),V(-5,-4,0.5),V(-5,-8,0.5)]),12,0.3,0x6ec8ff,0.5), f2=flow(g,curve([V(8.5,-1,0.5),V(9,-4,0.5),V(9,-8,0.5)]),4,0.3,0x6ec8ff,0.25);
  part(s,'k1',[k1,f1],[addLabel(s,g,V(-7,5,0),'不习惯咖啡的人：利尿明显','Caffeine-naïve','sm')]);
  part(s,'k2',[k2,f2],[addLabel(s,g,V(7,5,0),'长期饮用者：身体建立新平衡','Habitual user','sm')]);
  addLabel(s,g,V(0,-10,0),'训练后补水不要用含咖啡因饮料','Rehydrate caffeine-free','tag');
})();
// 5. performance & lipolysis
(function(){
  const s=station('perf',V(60,0,-80)), g=s.group;
  const bar=new THREE.Group(); bar.position.set(-6,0,0); g.add(bar); rod(bar,V(-5,0,0),V(5,0,0),0.18,0xcfd6e6);
  [-4,4].forEach(x=>{ const p=new THREE.Mesh(new THREE.CylinderGeometry(1.8,1.8,0.6,24),mat(0x3a3f52)); p.rotation.z=Math.PI/2; p.position.x=x; bar.add(p); });
  part(s,'bar',bar,[addLabel(s,g,V(-6,-3.5,0),'3–13 mg/kg：力量、专注；5 mg/kg 卧推实验','Strength & focus','sm')]);
  const cell=ball(g,V(7,0,0),2.6,0xffe08a,{opacity:0.9});
  const out=flow(g,curve([V(9,1.5,0),V(12,3,0),V(13,0,0),V(12,-3,0),V(9,-1.5,0)]),10,0.25,0xffb36b,0.25);
  part(s,'fat',[cell,out],[addLabel(s,g,V(8,-4.5,0),'15–20 分钟可测到脂肪释放，但不一定被燃烧','Lipolysis ≠ oxidation','sm')]);
  s.updates.push(t=>{ bar.position.y=Math.abs(Math.sin(t*1.5))*3; });
})();
// 6. ethanol pathway
(function(){
  const s=station('etoh',V(120,0,-80)), g=s.group;
  const liver=ball(g,V(0,0,-4),1,0x7a2f2f,{opacity:0.35,depthWrite:false}); liver.scale.set(16,7,3);
  const mols=[[V(-11,0,0),0x6ec8ff,'乙醇','Ethanol'],[V(-3.5,0,0),0xff6b6b,'乙醛（有毒）','Acetaldehyde'],[V(4,0,0),0x7dffb0,'乙酸','Acetate'],[V(11,0,0),0xffd166,'乙酰辅酶 A → ATP','Acetyl-CoA']];
  const ms=mols.map(([p,c,zh,en],i)=>{ const m=ball(g,p,1.3,c,{emissive:c,emissiveIntensity:0.25}); part(s,'m'+i,m,[addLabel(s,g,p.clone().add(V(0,-2.6,0)),zh,en,'sm')]); return m; });
  [[-7.2,'ADH','乙醇脱氢酶'],[0.3,'ALDH','乙醛脱氢酶']].forEach(([x,en,zh],i)=>{ const r=new THREE.Mesh(new THREE.TorusGeometry(1,0.22,10,30),mat(0xb48cff,{emissive:0xb48cff,emissiveIntensity:0.4})); r.position.set(x,2.4,0); g.add(r); part(s,'e'+i,r,[addLabel(s,g,V(x,4.2,0),zh,en,'sm')]); s.updates.push(t=>r.rotation.y=t*2); });
  const cv=curve(mols.map(m=>m[0])); flow(g,cv,6,0.3,0xffffff,0.12);
  addLabel(s,g,V(0,6.5,0),'约 95% 在代谢中分解，约 5% 经呼吸排出','≈95% metabolised · ≈5% exhaled','tag');
  const br=flow(g,curve([V(-11,1.5,0),V(-12,5,0),V(-13,8,0)]),3,0.2,0x9fd8ff,0.3);
})();
// 7. alcohol: water and minerals
(function(){
  const s=station('min',V(0,0,-160)), g=s.group;
  const k=kidney(g,0);
  const ions=[['Mg²⁺',0x7dffb0],['Zn²⁺',0xb48cff],['K⁺',0xffd166]];
  ions.forEach(([n,c],i)=>{ const f=flow(g,curve([V(1.5,-1,0.5),V(2+i*2.5,-4,0.5),V(3+i*4,-8,0.5)]),6,0.3,c,0.3); part(s,'i'+i,f,[addLabel(s,g,V(3+i*4,-9,0.5),n,'','sm')]); });
  const w=flow(g,curve([V(-1.5,-1,0.5),V(-3,-4,0.5),V(-4,-8,0.5)]),12,0.3,0x6ec8ff,0.5);
  part(s,'w',[k,w],[addLabel(s,g,V(-4,-9,0.5),'水分排出加快','More urine','sm')]);
  addLabel(s,g,V(0,5,0),'酒精扰乱水盐平衡；长期饮酒还缺 B1、B6、叶酸','Water, minerals, vitamins','tag');
})();
// 8. cortisol after training ± alcohol
(function(){
  const s=station('horm',V(60,0,-160)), g=s.group;
  rod(g,V(-12,0,0),V(12,0,0),0.05,0xffffff,{opacity:0.5});
  const X=m=>-12+m/150*24; [0,30,60,90,120,150].forEach(m=>addLabel(s,g,V(X(m),-1,0),m+' min','','sm'));
  const a=m=>5*Math.exp(-Math.pow((m-30)/22,2)), b=m=> m<30? a(m) : 5+1.8*Math.sin(Math.min(1,(m-30)/80)*Math.PI*0.8)*Math.exp(-Math.max(0,m-120)/25);
  const pa=[], pb=[]; for(let m=0;m<=150;m+=2){ pa.push(V(X(m),0.1+a(m),0)); pb.push(V(X(m),0.1+b(m),0.2)); }
  const ta=tube(g,pa,0.12,0x6ec8ff,0.9), tb=tube(g,pb,0.12,0xff6b6b,0.9);
  part(s,'a',ta.mesh,[addLabel(s,g,V(X(70),2,0),'只训练：20–40 min 升高后回落','Training only','sm')]);
  part(s,'b',tb.mesh,[addLabel(s,g,V(X(100),8.4,0),'训练 + 大量饮酒：60–120 min 继续上升','Training + alcohol','sm')]);
  addLabel(s,g,V(-6,9.8,0),'训练后皮质醇（示意曲线）','Cortisol · schematic','tag');
})();

window.onStep=function(i,st){ const ex=document.getElementById('extra');
  if(st.chart==='caf'){ window.CF=window.CF||{kg:80,n:[2,0,0,1,0,0]};
    const d=[['过滤式咖啡 0.2 L',61,200],['速溶咖啡 0.2 L',53,144],['意式浓缩 0.05 L',50,60],['红茶 0.2 L',12,75],['可乐 0.2 L',23,70],['功能饮料 0.25 L',80,80]];
    ex.innerHTML=`<div class="chart"><label>今天喝了多少（书中表 4 的范围）：</label>${d.map(([n],j)=>`<div style="display:flex;align-items:center;gap:8px;margin:3px 0"><span style="flex:1">${n}</span><input type="number" min="0" max="10" value="${CF.n[j]}" data-j="${j}" style="width:52px;background:#111830;color:#e9eefc;border:1px solid #ffffff33;border-radius:4px;padding:2px 4px"></div>`).join('')}<label id="kgL">体重：${CF.kg} kg</label><input type="range" id="kg" min="45" max="120" value="${CF.kg}"><div class="readout"></div></div>`;
    const ro=()=>{ let lo=0,hi=0; d.forEach(([n,a,b],j)=>{ lo+=a*CF.n[j]; hi+=b*CF.n[j]; }); const over=hi>300?(lo>300?'超过 300 mg 上限':'可能超过 300 mg 上限'):'在 300 mg 以内';
      document.getElementById('kgL').textContent='体重：'+CF.kg+' kg';
      ex.querySelector('.readout').innerHTML=`今日咖啡因 ≈ <b>${lo}–${hi} mg</b> → ${over}<br>相当于 ${(lo/CF.kg).toFixed(1)}–${(hi/CF.kg).toFixed(1)} mg/kg（书中提升成绩的剂量 3–13 mg/kg；卧推实验 5 mg/kg = ${5*CF.kg} mg）`; };
    ex.querySelectorAll('input[type=number]').forEach(e=>e.addEventListener('input',()=>{ CF.n[+e.dataset.j]=Math.max(0,+e.value||0); ro(); }));
    document.getElementById('kg').addEventListener('input',e=>{ CF.kg=+e.target.value; ro(); }); ro(); return; }
  if(st.chart==='pk'){ window.PK=window.PK||{T:5,mg:100};
    ex.innerHTML=`<div class="chart"><label id="tL"></label><input type="range" id="T" min="3" max="7" step="0.5" value="${PK.T}"><label id="mL"></label><input type="range" id="mg" min="50" max="400" step="10" value="${PK.mg}"><div class="readout"></div></div>`;
    const ro=()=>{ const T=PK.T, m=PK.mg; const at=h=>Math.round(m*Math.pow(0.5,(h-1)/T)); document.getElementById('tL').textContent='半衰期：'+T+' 小时（书中 3–7 h，因人而异）'; document.getElementById('mL').textContent='摄入咖啡因：'+m+' mg';
      ex.querySelector('.readout').innerHTML=`1 h 峰值后体内残留（简化估算）：<br>下午 3 点喝 → 晚上 11 点约剩 <b>${at(8)} mg</b>；4 h 后约 ${at(4)} mg；12 h 后约 ${at(12)} mg`; };
    document.getElementById('T').addEventListener('input',e=>{PK.T=+e.target.value; ro();}); document.getElementById('mg').addEventListener('input',e=>{PK.mg=+e.target.value; ro();}); ro(); return; }
  ex.innerHTML=''; };
})();
