/* procedural ball-and-stick molecules from atom coordinates (generated offline with RDKit ETKDG+MMFF) */
window.MK=(function(J){ const {THREE,V,mat,ball,rod}=J;
const COL={C:0x9a9a9a,O:0xff3030,H:0xf4f4f4,N:0x4a6cff,S:0xffd23a,P:0xff9a1a};
const RAD={C:0.36,O:0.34,H:0.2,N:0.34,S:0.42,P:0.42};
function mol(parent,d,pos,sc,opt){ opt=opt||{}; sc=sc||1; const G=new THREE.Group(); G.position.copy(pos); G.scale.setScalar(sc); parent.add(G);
  const P=d.a.map(a=>V(a[1],a[2],a[3])); const atoms=d.a.map((a,i)=>ball(G,P[i],RAD[a[0]]||0.3,(opt.col&&opt.col[i])||COL[a[0]]||0xff00ff));
  const bonds=[]; d.b.forEach(([i,j,o])=>{ if(o>=2){ const dv=P[j].clone().sub(P[i]); const off=dv.clone().cross(V(0,0,1)); if(off.length()<0.01) off.set(1,0,0); off.normalize().multiplyScalar(0.09);
      bonds.push(rod(G,P[i].clone().add(off),P[j].clone().add(off),0.06,0xdddddd)); bonds.push(rod(G,P[i].clone().sub(off),P[j].clone().sub(off),0.06,0xdddddd)); }
    else bonds.push(rod(G,P[i],P[j],0.09,0xcfcfcf)); });
  return {G,P,atoms,bonds,t:d.t||{}}; }
function halo(parent,p,color,r){ return ball(parent,p,r||0.62,color,{opacity:0.35,emissive:color,emissiveIntensity:0.8,depthWrite:false}); }
function wpos(m,i){ return m.P[i].clone().multiplyScalar(m.G.scale.x).add(m.G.position); }
function tagged(m,kind){ return Object.keys(m.t).filter(k=>m.t[k]===kind).map(Number); }
return {mol,halo,wpos,tagged,COL};
})(JIG);
