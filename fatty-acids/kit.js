/* 可复用的消化/细胞几何构件 */
window.KIT=(function(J){
const {THREE,V,mat,ball,rod,tube,flow,curve,part,addLabel}=J;
function blob(parent,pos,sx,sy,sz,color,o,seed){ const geo=new THREE.IcosahedronGeometry(1,3); const p=geo.attributes.position; let s=seed||1;
  for(let i=0;i<p.count;i++){ const x=p.getX(i),y=p.getY(i),z=p.getZ(i); const n=1+0.08*Math.sin(x*3.1+s)*Math.cos(y*2.7+s*2)+0.05*Math.sin(z*4.3+s); p.setXYZ(i,x*n,y*n,z*n);} geo.computeVertexNormals();
  const m=new THREE.Mesh(geo,mat(color,o)); m.scale.set(sx,sy,sz); m.position.copy(pos); parent.add(m); return m; }
// stylised GI tract; returns {curve, groups}
function gut(s,g,opt){ opt=opt||{};
  const P=[V(0,11,0),V(0,8,0),V(0.2,5.5,0),V(1.5,3.8,0),V(3.6,3.2,0)];
  const eso=tube(g,P.slice(0,4),0.35,0xf0a3a3,0.85);
  const stomach=blob(g,V(3.4,2.8,0),2.6,1.8,1.6,0xf27d7d,{opacity:0.9},2); stomach.rotation.z=-0.5;
  const mouth=new THREE.Mesh(new THREE.TorusGeometry(0.9,0.3,10,30),mat(0xf0a3a3)); mouth.position.set(0,11.3,0); mouth.rotation.x=Math.PI/2; g.add(mouth);
  // small intestine: coil
  const si=[V(5.6,2.0,0),V(5.2,0.4,0.4)]; for(let i=0;i<7;i++){ const y=-0.6-i*0.95; si.push(V(i%2? -3.2:3.2, y, 0.6*Math.sin(i))); } si.push(V(-3.8,-7.8,0.3));
  const small=tube(g,si,0.42,0xf6b38c,0.9);
  const li=[V(-3.8,-7.8,0.3),V(-6,-7.6,0),V(-6.6,-1,0),V(-6,3.5,0),V(0,4.6,-0.6),V(6.8,3.8,0),V(7.4,-3,0),V(6.8,-8.6,0),V(3,-9.6,0),V(1.5,-11,0)];
  const large=tube(g,li,0.75,0xc98a6a,0.55);
  const all=curve(P.concat([V(3.4,2.8,0)],si,li.slice(1)));
  const L={};
  L.mouth=addLabel(s,g,V(-2.2,11.4,0),'口腔','Mouth','sm');
  L.stomach=addLabel(s,g,V(6.6,4.6,0),'胃','Stomach','sm');
  L.small=addLabel(s,g,V(0,-3.2,1.6),'小肠','Small intestine','sm');
  L.large=addLabel(s,g,V(-8.6,-1,0),'大肠','Large intestine','sm');
  const out={eso,stomach,mouth,small,large,curve:all,L};
  if(opt.liver){ out.liver=blob(g,V(-3.2,3.6,1.2),3.0,1.5,1.4,0x9c4a3c,{opacity:0.92},5); out.L.liver=addLabel(s,g,V(-4.6,6,1.2),'肝脏','Liver','sm'); }
  if(opt.pancreas){ out.pancreas=blob(g,V(1.6,0.9,1.6),2.4,0.45,0.5,0xf2d08a,{},7); out.L.pancreas=addLabel(s,g,V(-0.8,0.2,2.6),'胰腺','Pancreas','sm'); }
  if(opt.gall){ out.gall=blob(g,V(-1.2,2.2,2.4),0.6,0.9,0.6,0x7fbf5a,{},9); out.L.gall=addLabel(s,g,V(-1.9,1.0,3.4),'胆囊','Gallbladder','sm'); }
  return out;
}
// villus field with brush border; returns group
function villi(s,g,opt){ opt=opt||{}; const G=new THREE.Group(); g.add(G);
  const base=new THREE.Mesh(new THREE.BoxGeometry(22,1,12),mat(0xe88f8f)); base.position.y=-0.5; G.add(base);
  const vg=new THREE.CylinderGeometry(0.55,0.75,4.2,14), tg=new THREE.SphereGeometry(0.55,14,10);
  for(let i=0;i<9;i++) for(let j=0;j<5;j++){ const x=-9+i*2.25+(j%2)*1.1, z=-4.5+j*2.2;
    const c=new THREE.Mesh(vg,mat(0xf4a6a0)); c.position.set(x,2.1,z); G.add(c); const t=new THREE.Mesh(tg,mat(0xf7b8b0)); t.position.set(x,4.2,z); G.add(t);}
  return G;
}
// enterocyte: lumen on top (apical), blood below (basolateral)
function cell(s,g){ const G=new THREE.Group(); g.add(G);
  const body=new THREE.Mesh(new THREE.BoxGeometry(16,8,6),mat(0xf6c9b8,{opacity:0.35,depthWrite:false})); G.add(body);
  const ap=new THREE.Mesh(new THREE.BoxGeometry(16,0.4,6),mat(0xe6a07a)); ap.position.y=4; G.add(ap);
  const bl=new THREE.Mesh(new THREE.BoxGeometry(16,0.4,6),mat(0xe6a07a)); bl.position.y=-4; G.add(bl);
  for(let i=0;i<16;i++){ const m=new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.18,1.2,8),mat(0xf0b090)); m.position.set(-7.5+i,4.8,1.8); G.add(m); const m2=m.clone(); m2.position.z=-1.8; G.add(m2);}
  const nuc=ball(G,V(4.5,-1,0),1.6,0x8a6fc8,{opacity:0.7});
  const vessel=tube(g,[V(-10,-7.5,0),V(0,-7.2,0),V(10,-7.5,0)],1.1,0xd94a4a,0.45);
  addLabel(s,g,V(-9.5,7,0),'肠腔（食物一侧）','Lumen / apical','sm tag');
  addLabel(s,g,V(-9.5,-9.4,0),'毛细血管（血液一侧）','Blood / basolateral','sm tag');
  addLabel(s,g,V(-10.2,0,3),'小肠上皮细胞','Enterocyte','sm');
  return {G,body,nuc,vessel};
}
function pore(parent,pos,color,h){ const m=new THREE.Mesh(new THREE.CylinderGeometry(0.7,0.7,h||1.6,16),mat(color)); m.position.copy(pos); parent.add(m); return m; }
function chain(parent,n,start,dx,color,r){ const G=new THREE.Group(); parent.add(G); const out=[]; for(let i=0;i<n;i++){ out.push(ball(G,V(start.x+i*dx,start.y+(i%2?0.25:-0.25),start.z),r||0.45,color)); if(i) rod(G,out[i-1].position,out[i].position,0.1,0xdddddd);} G.userData.beads=out; return G; }
return {blob,gut,villi,cell,pore,chain};
})(JIG);
