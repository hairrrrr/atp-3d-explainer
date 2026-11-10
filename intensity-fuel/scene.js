/* 运动强度与燃料比例：3D 肌纤维 + 2D 交互图 */
(function(){
const {THREE,V,mat,ball,rod,tube,flow,curve,station,part,addLabel,sphereGeo}=J;
// ---- fuel model (approx. from Romijn et al. 1993, endurance-trained, fasted) ----
const PTS=[[0.10,[0.80,0.04,0.12,0.04]],[0.25,[0.78,0.06,0.10,0.06]],[0.45,[0.48,0.20,0.10,0.22]],[0.65,[0.27,0.23,0.10,0.40]],[0.85,[0.13,0.12,0.14,0.61]],[1.0,[0.05,0.05,0.15,0.75]]];
function mix(I){ I=Math.max(0.1,Math.min(1,I)); for(let k=0;k<PTS.length-1;k++){ const [a,A]=PTS[k],[b,B]=PTS[k+1]; if(I<=b){ const u=(I-a)/(b-a); return A.map((x,j)=>x+(B[j]-x)*u);} } return PTS[PTS.length-1][1]; }
function withDur(m,min){ // longer duration: glycogen share falls, plasma FFA rises (book Fig.18 trend)
  const d=Math.min(min,180)/180*0.45*m[3]; return [m[0]+d*0.8,m[1]+d*0.2,m[2],m[3]-d]; }
const FUEL={I:0.1,dur:0,mix,withDur}; window.FUEL=FUEL;
// ===== station 1: muscle fiber =====
(function(){
  const s=station('fiber',V(0,0,0)), g=s.group;
  const fib=new THREE.Mesh(new THREE.CylinderGeometry(4,4,26,40,1,true),mat(0xd9686f,{opacity:0.22,side:THREE.DoubleSide,depthWrite:false})); fib.rotation.z=Math.PI/2; g.add(fib);
  const myo=new THREE.Group(); g.add(myo); for(let k=0;k<6;k++){ const a=k/6*Math.PI*2; rod(myo,V(-12,Math.cos(a)*2,Math.sin(a)*2),V(12,Math.cos(a)*2,Math.sin(a)*2),0.35,0xb83a4a,{opacity:0.7}); }
  const mitos=[]; [[-8,3.2],[-2,-3.2],[4,3.2],[9,-3.0]].forEach(([x,y],i)=>{ const m=new THREE.Mesh(sphereGeo,mat(0xff8f6b)); m.scale.set(1.8,0.8,0.8); m.position.set(x,y,i%2?1:-1); g.add(m); mitos.push(m); });
  const lip=[]; [[-6,3.4],[1,-3.4],[6,3.3],[-10,-3]].forEach(([x,y])=>lip.push(ball(g,V(x,y,0.8),0.7,0xffd166,{opacity:0.95})));
  const glyN=60, gly=new THREE.InstancedMesh(sphereGeo,mat(0x9ad0ff,{emissive:0x4488cc,emissiveIntensity:0.3}),glyN); g.add(gly); const gp=[]; for(let i=0;i<glyN;i++) gp.push(V(Math.random()*22-11,(Math.random()*2-1)*2.6,(Math.random()*2-1)*2.6));
  const vessel=tube(g,[V(-13,6.5,0),V(0,6.8,0),V(13,6.5,0)],0.8,0xff3344,0.35);
  // particle streams to mitochondria: fat (yellow) & carb (blue)
  const NF=30, fp=new THREE.InstancedMesh(sphereGeo,mat(0xffe08a,{emissive:0xffcc55,emissiveIntensity:0.6}),NF), cp=new THREE.InstancedMesh(sphereGeo,mat(0x6ec8ff,{emissive:0x3399ff,emissiveIntensity:0.6}),NF); g.add(fp,cp);
  const M=new THREE.Matrix4(), Q=new THREE.Quaternion(); const seeds=[]; for(let i=0;i<NF;i++) seeds.push([Math.random(),Math.floor(Math.random()*4),Math.random()]);
  const meter=addLabel(s,g,V(0,9.5,0),'强度','—','tag');
  part(s,'mito',mitos,[addLabel(s,g,V(-8,5,-1),'线粒体','Mitochondria','sm')]);
  part(s,'lip',lip,[addLabel(s,g,V(1,-5.3,0.8),'肌内脂滴 IMTG','IMTG','sm')]);
  part(s,'gly',gly,[addLabel(s,g,V(-11,-5,0),'肌糖原颗粒','Glycogen','sm')]);
  part(s,'vessel',vessel.mesh,[addLabel(s,g,V(11,8.2,0),'毛细血管：血脂肪酸 + 血糖','Capillary','sm')]);
  part(s,'streams',[fp,cp],[addLabel(s,g,V(-13,-7,0),'黄：脂肪 → 线粒体　蓝：糖 → 燃烧','Fuel streams','sm')]);
  s.updates.push(t=>{ const m=withDur(mix(FUEL.I),FUEL.dur), fat=m[0]+m[1], rate=0.4+FUEL.I*2.2;
    const nFat=Math.round(NF*Math.min(1,fat*rate/1.4)), nCarb=Math.round(NF*Math.min(1,(1-fat)*rate/1.4));
    for(let i=0;i<NF;i++){ const [ph,mi,z]=seeds[i]; const tg=mitos[mi].position; const u=((t*(0.25+FUEL.I*0.6)+ph)%1);
      const src= i%2? V(tg.x+3,6.5,0) : lip[mi].position; const p=src.clone().lerp(tg,u); M.compose(i<nFat?p:V(0,-99,0),Q,V(0.22,0.22,0.22)); fp.setMatrixAt(i,M);
      const src2= i%3? gp[i] : V(tg.x-3,6.5,0); const p2=src2.clone().lerp(tg,u); M.compose(i<nCarb?p2:V(0,-99,0),Q,V(0.22,0.22,0.22)); cp.setMatrixAt(i,M); }
    fp.instanceMatrix.needsUpdate=true; cp.instanceMatrix.needsUpdate=true;
    const keep=Math.round(glyN*(1-Math.min(0.7,FUEL.dur/180*0.7*m[3]*1.5)));
    for(let i=0;i<glyN;i++){ M.compose(i<keep?gp[i]:V(0,-99,0),Q,V(0.28,0.28,0.28)); gly.setMatrixAt(i,M);} gly.instanceMatrix.needsUpdate=true;
    myo.scale.x=1-0.04*FUEL.I*(0.5+0.5*Math.sin(t*(2+FUEL.I*8)));
    meter.element.querySelector('b').textContent='强度 '+Math.round(FUEL.I*100)+'% VO₂max'+(FUEL.dur?' · 第 '+FUEL.dur+' 分钟':'');
    meter.element.querySelector('span').textContent='脂肪 '+Math.round(fat*100)+'% · 糖 '+Math.round((1-fat)*100)+'%'; });
})();
// ===== station 2: stacked 3D bars =====
(function(){
  const s=station('bars',V(60,0,0)), g=s.group;
  const cols=[0x3fd19a,0xffd166,0xff6b6b,0x6ec8ff], names=[['血浆脂肪酸','Plasma FFA'],['肌内脂肪','IMTG'],['血糖','Blood glucose'],['肌糖原','Muscle glycogen']];
  const E={0.25:1.0,0.65:2.6,0.85:3.6}; const segs=[];
  [[0.25,-8],[0.65,0],[0.85,8]].forEach(([I,x])=>{ const m=mix(I); let y=0; m.forEach((f,j)=>{ const h=f*E[I]*3; const b=new THREE.Mesh(new THREE.BoxGeometry(3,1,3),mat(cols[j])); b.scale.y=Math.max(0.01,h); b.position.set(x,y+h/2,0); g.add(b); segs.push({b,j}); y+=h; });
    addLabel(s,g,V(x,-1.3,0),Math.round(I*100)+'% VO₂max',I==0.25?'低强度':I==0.65?'中等强度':'高强度','sm'); addLabel(s,g,V(x,y+1,0),'≈'+E[I]+'×','总能耗','sm tag'); });
  [0,1,2,3].forEach(j=>part(s,'s'+j,segs.filter(q=>q.j==j).map(q=>q.b),[addLabel(s,g,V(14,1.5+j*2.2,0),'<i style="font-style:normal;color:#'+cols[j].toString(16).padStart(6,'0')+'">■</i> '+names[j][0],names[j][1],'sm')]));
  addLabel(s,g,V(-13,9,0),'柱高 = 每分钟能量消耗（相对）','','sm');
})();
// ---------- 2D charts in panel ----------
const col={ffa:'#3fd19a',imtg:'#ffd166',glu:'#ff6b6b',gly:'#6ec8ff'};
function svgEl(w,h,inner){ return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" font-family="Noto Sans CJK SC,sans-serif">${inner}</svg>`; }
function mixChart(I,dur){ // fat% & carb% vs intensity, plus marker
  const W=360,H=200,X=i=>40+(i-0.1)/0.9*300,Y=f=>170-f*150; let fat='',carb='';
  for(let i=0.1;i<=1.0001;i+=0.02){ const m=withDur(mix(i),dur); fat+=(fat?'L':'M')+X(i).toFixed(1)+','+Y(m[0]+m[1]).toFixed(1); carb+=(carb?'L':'M')+X(i).toFixed(1)+','+Y(m[2]+m[3]).toFixed(1); }
  let cx=null; for(let i=0.1;i<1;i+=0.005){ const m=withDur(mix(i),dur); if(m[0]+m[1]<=0.5){ cx=i; break; } }
  const m=withDur(mix(I),dur);
  let g=`<rect width="${W}" height="${H}" fill="none"/>`+[0,0.5,1].map(f=>`<line x1="40" x2="340" y1="${Y(f)}" y2="${Y(f)}" stroke="#ffffff22"/><text x="34" y="${Y(f)+4}" fill="#9fb0d8" font-size="10" text-anchor="end">${f*100}%</text>`).join('')+
   [0.25,0.5,0.75,1].map(i=>`<text x="${X(i)}" y="186" fill="#9fb0d8" font-size="10" text-anchor="middle">${i*100}%</text>`).join('')+
   `<text x="190" y="198" fill="#9fb0d8" font-size="10" text-anchor="middle">强度（% VO₂max）</text>`+
   `<path d="${fat}" fill="none" stroke="#ffd166" stroke-width="3"/><path d="${carb}" fill="none" stroke="#6ec8ff" stroke-width="3"/>`+
   (cx?`<line x1="${X(cx)}" x2="${X(cx)}" y1="20" y2="170" stroke="#ff8a8a" stroke-dasharray="4 3"/><text x="${X(cx)+4}" y="30" fill="#ff8a8a" font-size="11">交叉点 ≈${Math.round(cx*100)}%</text>`:'')+
   `<line x1="${X(I)}" x2="${X(I)}" y1="20" y2="170" stroke="#fff" stroke-width="1.5"/><circle cx="${X(I)}" cy="${Y(m[0]+m[1])}" r="5" fill="#ffd166"/><circle cx="${X(I)}" cy="${Y(m[2]+m[3])}" r="5" fill="#6ec8ff"/>`+
   `<text x="48" y="14" fill="#ffd166" font-size="11">— 脂肪占比</text><text x="130" y="14" fill="#6ec8ff" font-size="11">— 碳水占比</text>`;
  return svgEl(W,H,g);
}
function fatAbs(I,dur,vo2){ const m=withDur(mix(I),dur); const kcal=5*vo2*I*70/1000; return (m[0]+m[1])*kcal/9.4; } // g/min, 70 kg
function fatmaxChart(I,vo2){ const W=360,H=200,X=i=>40+(i-0.1)/0.9*300; let best=0,bi=0,pts=[]; for(let i=0.1;i<=1.0001;i+=0.01){ const f=fatAbs(i,0,vo2); pts.push([i,f]); if(f>best){best=f;bi=i;} }
  const ymax=Math.max(1.0,best*1.2), Y=f=>170-f/ymax*150; const d=pts.map((p,k)=>(k?'L':'M')+X(p[0]).toFixed(1)+','+Y(p[1]).toFixed(1)).join('');
  const zone=`<rect x="${X(bi-0.1)}" y="20" width="${X(bi+0.1)-X(bi-0.1)}" height="150" fill="#3fd19a22"/>`;
  const g=zone+[0,0.5,1].filter(f=>f<=ymax).map(f=>`<line x1="40" x2="340" y1="${Y(f)}" y2="${Y(f)}" stroke="#ffffff22"/><text x="34" y="${Y(f)+4}" fill="#9fb0d8" font-size="10" text-anchor="end">${f}</text>`).join('')+
   [0.25,0.5,0.75,1].map(i=>`<text x="${X(i)}" y="186" fill="#9fb0d8" font-size="10" text-anchor="middle">${i*100}%</text>`).join('')+
   `<text x="190" y="198" fill="#9fb0d8" font-size="10" text-anchor="middle">强度（% VO₂max）</text><text x="44" y="14" fill="#ffd166" font-size="11">脂肪氧化 g/分钟（70 kg 示例）</text>`+
   `<path d="${d}" fill="none" stroke="#ffd166" stroke-width="3"/><text x="${X(bi)}" y="${Y(best)-8}" fill="#3fd19a" font-size="11" text-anchor="middle">Fatmax ≈${Math.round(bi*100)}%</text>`+
   `<line x1="${X(I)}" x2="${X(I)}" y1="20" y2="170" stroke="#fff"/><circle cx="${X(I)}" cy="${Y(fatAbs(I,0,vo2))}" r="5" fill="#fff"/>`;
  return svgEl(W,H,g);
}
function durChart(I,dur){ const W=360,H=200,X=t=>40+t/180*300,Y=f=>170-f*150; let a='',b='';
  for(let t=0;t<=180;t+=3){ const m=withDur(mix(I),t); a+=(a?'L':'M')+X(t)+','+Y(m[0]+m[1]).toFixed(1); b+=(b?'L':'M')+X(t)+','+Y(m[3]).toFixed(1); }
  const m=withDur(mix(I),dur);
  const g=[0,0.5,1].map(f=>`<line x1="40" x2="340" y1="${Y(f)}" y2="${Y(f)}" stroke="#ffffff22"/><text x="34" y="${Y(f)+4}" fill="#9fb0d8" font-size="10" text-anchor="end">${f*100}%</text>`).join('')+
   [0,30,60,90,120,150,180].map(t=>`<text x="${X(t)}" y="186" fill="#9fb0d8" font-size="10" text-anchor="middle">${t}</text>`).join('')+`<text x="190" y="198" fill="#9fb0d8" font-size="10" text-anchor="middle">运动时间（分钟）</text>`+
   `<path d="${a}" fill="none" stroke="#ffd166" stroke-width="3"/><path d="${b}" fill="none" stroke="#6ec8ff" stroke-width="3"/>`+
   `<line x1="${X(dur)}" x2="${X(dur)}" y1="20" y2="170" stroke="#fff"/><text x="48" y="14" fill="#ffd166" font-size="11">— 脂肪占比</text><text x="130" y="14" fill="#6ec8ff" font-size="11">— 肌糖原占比</text>`;
  return svgEl(W,H,g);
}
function parts(kind){
  const I=FUEL.I, dur=FUEL.dur, m=withDur(mix(I),dur), v=FUEL.vo2||50, c=FUEL.calc||(FUEL.calc={age:30,rest:60,k:0.65});
  const ro=`强度 <b>${Math.round(I*100)}% VO₂max</b>${kind=='dur'?' · 时间 <b>'+dur+' 分钟</b>':''}：脂肪 <b>${Math.round((m[0]+m[1])*100)}%</b>（血脂 ${Math.round(m[0]*100)}% + 肌内 ${Math.round(m[1]*100)}%），碳水 <b>${Math.round((m[2]+m[3])*100)}%</b>（肌糖原 ${Math.round(m[3]*100)}% + 血糖 ${Math.round(m[2]*100)}%）`;
  if(kind=='mix') return {plot:mixChart(I,0), ro};
  if(kind=='fatmax') return {plot:fatmaxChart(I,v), ro:`此强度每分钟约氧化脂肪 <b>${fatAbs(I,0,v).toFixed(2)} g</b>，一小时约 <b>${Math.round(fatAbs(I,0,v)*60)} g</b>（体重 70 kg、最大摄氧量 ${v} ml/kg/分钟估算，不含运动后）。`};
  if(kind=='dur') return {plot:durChart(I,dur), ro};
  if(kind=='calc'){ const hr=Math.round(c.rest+(220-2/3*c.age-c.rest)*c.k); return {plot:'', ro:`目标心率 = ${c.rest} + (220 − ⅔×${c.age} − ${c.rest}) × ${c.k} ≈ <b>${hr} 次/分钟</b>`}; }
}
const ctl={
 sI:['强度','% VO₂max',10,100,1,()=>Math.round(FUEL.I*100),v=>FUEL.I=v/100],
 sD:['运动时间','分钟',0,180,5,()=>FUEL.dur,v=>FUEL.dur=v],
 sV:['最大摄氧量','ml/kg/分钟',30,70,1,()=>FUEL.vo2||50,v=>FUEL.vo2=v],
 cA:['年龄','岁',16,75,1,()=>FUEL.calc.age,v=>FUEL.calc.age=v],
 cR:['清晨静息心率','次/分钟',40,90,1,()=>FUEL.calc.rest,v=>FUEL.calc.rest=v]};
const KIND_CTL={mix:['sI'],fatmax:['sI','sV'],dur:['sD','sI'],calc:['cA','cR','cK']};
function render(kind){
  const ex=document.getElementById('extra'); if(!kind){ ex.innerHTML=''; return; }
  FUEL.calc=FUEL.calc||{age:30,rest:60,k:0.65};
  let h='<div class="chart"><div class="plot"></div>';
  KIND_CTL[kind].forEach(id=>{ if(id=='cK'){ h+=`<label>健身系数</label><select id="cK" style="width:100%;padding:6px;border-radius:6px;background:#111830;color:#e9eefc;border:1px solid #ffffff33">${[[0.6,'0.60 · 健康的运动新手'],[0.65,'0.65 · 每周约 2 次耐力训练'],[0.7,'0.70 · 每周 4 天系统训练'],[0.75,'0.75 · 高水平/职业运动员']].map(([v,t])=>`<option value="${v}" ${v==FUEL.calc.k?'selected':''}>${t}</option>`).join('')}</select>`; return; }
    const [n,u,mn,mx,st,get]=ctl[id]; h+=`<label id="${id}L">${n}：${get()} ${u}</label><input type="range" id="${id}" min="${mn}" max="${mx}" step="${st}" value="${get()}">`; });
  h+='<div class="readout"></div></div>'; ex.innerHTML=h;
  const refresh=()=>{ const p=parts(kind); ex.querySelector('.plot').innerHTML=p.plot; ex.querySelector('.readout').innerHTML=p.ro;
    KIND_CTL[kind].forEach(id=>{ if(ctl[id]) document.getElementById(id+'L').textContent=ctl[id][0]+'：'+ctl[id][5]()+' '+ctl[id][1]; }); };
  KIND_CTL[kind].forEach(id=>{ const e=document.getElementById(id); e.addEventListener('input',()=>{ if(id=='cK') FUEL.calc.k=+e.value; else ctl[id][6](+e.value); refresh(); }); });
  refresh();
}
window.onStep=function(i,st){ if(st.I!=null) FUEL.I=st.I; FUEL.dur=st.dur||0; render(st.chart); };
})();
