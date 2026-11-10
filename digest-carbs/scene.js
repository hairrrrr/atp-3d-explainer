(function(J,K){
const {THREE,V,mat,ball,rod,prism,tube,flow,curve,station,part,addLabel}=J;
const GLU=0x4a86ff, FRU=0x43c06b, GAL=0xffc857;
function hexa(p,pos,c){ return prism(p,pos,0.8,6,0.4,c,Math.PI/6); }
function penta(p,pos,c){ return prism(p,pos,0.75,5,0.4,c); }
// 1. molecules
(function(){ const s=station('mol',V(0,0,0)), g=s.group;
  const mono=new THREE.Group(); g.add(mono);
  hexa(mono,V(-6,4,0),GLU); penta(mono,V(-3,4,0),FRU); hexa(mono,V(0,4,0),GAL);
  const di=new THREE.Group(); g.add(di);
  [[GLU,FRU,3.5],[GLU,GLU,0],[GLU,GAL,-3.5]].forEach(([a,b,x],k)=>{});
  hexa(di,V(-7,0,0),GLU); penta(di,V(-5.4,0,0),FRU); rod(di,V(-6.3,0,0),V(-6.0,0,0),0.1,0xffffff);
  hexa(di,V(-2,0,0),GLU); hexa(di,V(-0.3,0,0),GLU);
  hexa(di,V(3,0,0),GLU); hexa(di,V(4.7,0,0),GAL);
  const poly=new THREE.Group(); g.add(poly);
  for(let i=0;i<12;i++) hexa(poly,V(-8+i*1.5,-4+(i%2?0.2:-0.2),0),GLU);
  for(let i=0;i<4;i++) hexa(poly,V(-2+i*1.5,-6.3,0),GLU);
  rod(poly,V(-3.5,-4.2,0),V(-2,-6.3,0),0.08,0xffffff);
  const fib=new THREE.Group(); g.add(fib); for(let i=0;i<6;i++) hexa(fib,V(10,-1.5-i*0.9,0),0x9aa4b8);
  part(s,'mono',mono,[addLabel(s,g,V(-3,6,0),'单糖：葡萄糖 / 果糖 / 半乳糖','Glucose · Fructose · Galactose','sm')]);
  part(s,'di',di,[addLabel(s,g,V(-6.2,-1.6,0),'蔗糖','Sucrose','sm'),addLabel(s,g,V(-1.2,-1.6,0),'麦芽糖','Maltose','sm'),addLabel(s,g,V(3.8,-1.6,0),'乳糖','Lactose','sm')]);
  part(s,'poly',poly,[addLabel(s,g,V(0,-8,0),'多糖：淀粉（最多约 10 万个葡萄糖）/ 糖原','Starch · Glycogen','sm')]);
  part(s,'fiber',fib,[addLabel(s,g,V(10,-7.4,0),'纤维素（不可消化）','Cellulose','sm')]);
  s.updates.push(t=>{ mono.rotation.y=Math.sin(t*0.6)*0.3; });
})();
// 2/5/7. gut overview
(function(){ const s=station('gut',V(60,0,0)), g=s.group;
  const G=K.gut(s,g,{liver:true,pancreas:true});
  const food=flow(g,G.curve,26,0.28,0xfff1b0,0.03);
  const portal=tube(g,[V(1,-3,0.8),V(-1,-0.5,1.4),V(-2.2,2.6,1.5)],0.3,0x7d2f6b,0.75);
  const pflow=flow(g,portal.curve,8,0.2,GLU,0.25);
  const muscleT=tube(g,[V(-3.2,5,1.2),V(-9,6,0),V(-11,0,0)],0.3,0xd94a4a,0.5); const mflow=flow(g,muscleT.curve,6,0.2,GLU,0.2);
  const fibre=flow(g,curve([V(-3.8,-7.8,0.3),V(-6,-7.6,0),V(-6.6,-1,0),V(-6,3.5,0),V(0,4.6,-0.6),V(6.8,3.8,0),V(7.4,-3,0),V(6.8,-8.6,0)]),14,0.25,0x9aa4b8,0.05);
  part(s,'mouth',G.mouth,[G.L.mouth]); part(s,'eso',G.eso.mesh,[]);
  part(s,'stomach',G.stomach,[G.L.stomach,addLabel(s,g,V(7.4,1.4,0),'胃排空速度决定整体节奏','','sm tag')]);
  part(s,'small',G.small.mesh,[G.L.small]); part(s,'large',[G.large.mesh,fibre],[G.L.large,addLabel(s,g,V(-9.5,-6,0),'膳食纤维 → 菌群发酵 → 短链脂肪酸','fibre → SCFA','sm tag')]);
  part(s,'food',food,[]); part(s,'liver',G.liver,[G.L.liver,addLabel(s,g,V(-4.6,4.6,1.2),'肝糖原 80~150 克','','sm tag')]);
  part(s,'pancreas',G.pancreas,[G.L.pancreas]);
  part(s,'portal',[portal.mesh,pflow],[addLabel(s,g,V(-1.6,0.4,2.6),'门静脉','Portal vein','sm')]);
  part(s,'blood',[muscleT.mesh,mflow],[addLabel(s,g,V(-10.5,3.5,0),'血液 → 全身 / 肌肉','','sm')]);
})();
// 3. villi + brush-border enzymes
(function(){ const s=station('villus',V(120,0,0)), g=s.group;
  const vf=K.villi(s,g);
  const chains=[]; for(let k=0;k<6;k++){ const c=new THREE.Group(); g.add(c); const a=hexa(c,V(-0.85,0,0),GLU), b=hexa(c,V(0.85,0,0),k%3==1?FRU:(k%3==2?GAL:GLU)); c.userData={a,b,x:-8+k*3.2,z:(k%2?2:-1.5)}; chains.push(c);}
  const enz=new THREE.Group(); g.add(enz); [-6,-1,4,8].forEach(x=>{ const e=new THREE.Mesh(new THREE.TorusGeometry(0.5,0.18,8,20,Math.PI*1.4),mat(0xb07cff)); e.position.set(x,4.9,0.6); enz.add(e); });
  const amy=new THREE.Group(); g.add(amy); for(let i=0;i<10;i++) hexa(amy,V(-9+i*1.5,9,0),GLU); const pa=new THREE.Mesh(new THREE.IcosahedronGeometry(0.9,1),mat(0xf2d08a,{flatShading:true})); pa.position.set(2.8,10.3,0); amy.add(pa);
  part(s,'villi',vf,[addLabel(s,g,V(-11,1.5,6),'小肠绒毛','Villi','sm')]);
  part(s,'amylase',amy,[addLabel(s,g,V(5.5,11.2,0),'胰淀粉酶切断淀粉链','Pancreatic amylase','sm')]);
  part(s,'brush',enz,[addLabel(s,g,V(8,6.8,0.6),'刷状缘酶：麦芽糖酶 / 蔗糖酶 / 乳糖酶','Brush-border enzymes','sm')]);
  part(s,'pairs',chains,[addLabel(s,g,V(-9,7.2,0),'双糖 → 单糖','','sm tag')]);
  s.updates.push(t=>{ chains.forEach((c,k)=>{ const u=((t*0.25+k/6)%1); c.position.set(c.userData.x, 8-u*3.4, c.userData.z); const sp=u>0.7?(u-0.7)*5:0; c.userData.a.position.x=-0.85-sp; c.userData.b.position.x=0.85+sp; }); pa.rotation.y=t; });
})();
// 4. enterocyte transporters
(function(){ const s=station('cell',V(0,0,-80)), g=s.group;
  const C=K.cell(s,g);
  const sglt=K.pore(g,V(-4,4,0),0x4a86ff), glut5=K.pore(g,V(1,4,0),0x43c06b), glut2=K.pore(g,V(-1.5,-4,0),0xff9f6b), nak=K.pore(g,V(5,-4,0),0xb07cff);
  const gpath=curve([V(-4.5,8,0.9),V(-4,4,0.9),V(-3,0,0.9),V(-1.5,-4,0.9),V(-1,-7.4,0.9)]);
  const fpath=curve([V(1.5,8,0.9),V(1,4,0.9),V(0,0,0.9),V(-1.2,-4,1.2),V(-0.5,-7.4,1.2)]);
  const napath=curve([V(-3.4,8,-0.9),V(-3.6,4,-0.9),V(1,0,-0.9),V(5,-4,-0.9),V(5.5,-7,-0.9)]);
  const kpath=curve([V(6,-7,0.9),V(5,-4,0.9),V(6.5,-1,0.9)]);
  const gf=flow(g,gpath,7,0.3,GLU,0.12), ff=flow(g,fpath,5,0.3,FRU,0.09), nf=flow(g,napath,7,0.2,0xffffff,0.12), kf=flow(g,kpath,3,0.2,0xff66aa,0.2);
  part(s,'sglt',[sglt,gf],[addLabel(s,g,V(-6.8,5.8,0),'SGLT1：葡萄糖/半乳糖 + Na⁺','Na⁺-glucose cotransporter','sm')]);
  part(s,'glut5',[glut5,ff],[addLabel(s,g,V(3.6,5.8,0),'GLUT5：果糖（较慢）','Fructose uniporter','sm')]);
  part(s,'glut2',glut2,[addLabel(s,g,V(-4.4,-5.6,0),'GLUT2：单糖出细胞','Basolateral exit','sm')]);
  part(s,'nak',[nak,nf,kf],[addLabel(s,g,V(8,-5.4,0),'Na⁺/K⁺-ATP 酶','Na⁺/K⁺ pump','sm')]);
  part(s,'cellbody',[C.body,C.nuc],[]); part(s,'vessel',C.vessel.mesh,[]);
})();
// 6. muscle glycogen
(function(){ const s=station('muscle',V(60,0,-80)), g=s.group;
  const fib=new THREE.Group(); g.add(fib);
  for(let i=0;i<7;i++){ const a=i/7*Math.PI*2, r=i?2.4:0; const c=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.1,18,20),mat(0xd96464,{opacity:0.55,depthWrite:false})); c.rotation.z=Math.PI/2; c.position.set(0,Math.cos(a)*r,Math.sin(a)*r); fib.add(c);}
  const gly=new THREE.Group(); g.add(gly); const pts=[];
  for(let k=0;k<26;k++){ const cl=new THREE.Group(); cl.position.set(-8+Math.random()*16,(Math.random()-0.5)*6,(Math.random()-0.5)*6); for(let i=0;i<7;i++) ball(cl,V((Math.random()-0.5)*0.6,(Math.random()-0.5)*0.6,(Math.random()-0.5)*0.6),0.2,0xffe08a,{emissive:0xffcc55,emissiveIntensity:0.35}); gly.add(cl); pts.push(cl);}
  const cap=tube(g,[V(-10,5,0),V(0,4.4,1),V(10,5,0)],0.5,0xd94a4a,0.5); const cf=flow(g,cap.curve,10,0.22,GLU,0.1);
  part(s,'fibers',fib,[addLabel(s,g,V(-10,-4,0),'肌纤维','Muscle fibres','sm')]);
  part(s,'glycogen',gly,[addLabel(s,g,V(4,-4.6,0),'肌糖原颗粒（约 500 克，仅供肌肉自用）','Muscle glycogen','sm tag')]);
  part(s,'cap',[cap.mesh,cf],[addLabel(s,g,V(8,6.4,0),'血糖进入肌细胞','Blood glucose','sm')]);
  s.updates.push(t=>{ pts.forEach((p,i)=>p.scale.setScalar(1+0.15*Math.sin(t*1.5+i))); });
})();
J.start();
})(JIG,KIT);
