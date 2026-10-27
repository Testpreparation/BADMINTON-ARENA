/* New sports module: isolated from the existing tennis/badminton engine. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
let overlay,renderer,scene,camera,clock,raf=0,active=false,sport='volleyball',format='singles';
let ball,ballV,players=[],score=[0,0],sets=[0,0],points=0,serveType='normal',phase='ready',lastHit=0,teamTurn=0,serveCount=0,matchText='';
const keys={};
function buildProvidedModels(){
const V3=THREE.Vector3;
const M=(c,r=.8,m=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});
function box(w,h,d,mat,x,y,z,p){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;p.add(o);return o}
function cyl(r1,r2,h,mat,x,y,z,p,seg=16){const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,seg),mat);o.position.set(x,y,z);o.castShadow=true;p.add(o);return o}
function sph(r,mat,x,y,z,p,sx=1,sy=1,sz=1){const o=new THREE.Mesh(new THREE.SphereGeometry(r,20,14),mat);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;p.add(o);return o}
function ctex(w,h,fn){const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.anisotropy=8;return t}
function wood(g,w,h,n){for(let i=0;i<n;i++){g.fillStyle=`hsl(33,${52+i%3*5}%,${55+i*7%10}%)`;g.fillRect(0,i*h/n,w,h/n);g.fillStyle='rgba(0,0,0,.15)';g.fillRect(0,i*h/n,w,1.5)}}
function netT(rx,ry){const t=ctex(64,64,(g)=>{g.strokeStyle='rgba(20,20,20,.9)';g.lineWidth=3;g.strokeRect(0,0,64,64)});t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);return t}
function lathe(pts,mat,p,x,y,z,sx=1,sz=1){const o=new THREE.Mesh(new THREE.LatheGeometry(pts.map(a=>new THREE.Vector2(a[0],a[1])),28),mat);o.position.set(x,y,z);o.scale.set(sx,1,sz);o.castShadow=true;p.add(o);return o}
function limb(r1,r2,len,bu,mat,p,x=0,y=0,z=0,sx=1,sz=1){const pts=[[0,-len]];for(let i=0;i<=12;i++){const t=i/12;pts.push([r2+(r1-r2)*t+bu*Math.sin(Math.PI*t),-len+t*len])}pts.push([0,0]);return lathe(pts,mat,p,x,y,z,sx,sz)}
function human(col,num,skin=0xe0ac84){
 const g=new THREE.Group(),hx='#'+new THREE.Color(col).getHexString(),sk=M(skin,.5),sm=M(0x161b24,.85),wh=M(0xffffff,.7),hr=M(0x24180f,.8),sh=M(col,.45),dk=M(0x111111,.5);
 const jm=new THREE.MeshStandardMaterial({map:ctex(128,128,(c,w,h)=>{c.fillStyle=hx;c.fillRect(0,0,w,h);c.fillStyle='rgba(0,0,0,.12)';for(let i=0;i<w;i+=4)c.fillRect(i,0,1,h);c.fillStyle='#fff';c.fillRect(0,0,w,9);c.fillRect(0,h-13,w,13)}),roughness:.9});
 const J=(p,x,y,z)=>{const j=new THREE.Group();j.position.set(x,y,z);p.add(j);return j};
 const hips=J(g,0,.965,0);g.hips=hips;lathe([[0,-.12],[.19,-.1],[.21,0],[.19,.1],[0,.1]],sm,hips,0,0,0,1.12,.8);
 const tor=J(hips,0,.08,0);g.tor=tor;lathe([[0,0],[.17,0],[.19,.1],[.215,.25],[.235,.4],[.24,.46],[.2,.54],[.1,.585],[.06,.6],[0,.6]],jm,tor,0,0,0,1.18,.72);
 limb(.048,.055,.12,0,sk,tor,0,.69,0);const cr=new THREE.Mesh(new THREE.TorusGeometry(.068,.013,8,24),M(0xffffff,.8));cr.rotation.x=Math.PI/2;cr.position.set(0,.6,0);tor.add(cr);
 [-1,1].forEach(s=>sph(.078,jm,s*.255,.49,0,tor));
 [[Math.PI,-.17,.3,.26],[0,.17,.38,.1]].forEach(([ry,z,y,sz])=>{const pl=new THREE.Mesh(new THREE.PlaneGeometry(sz,sz),new THREE.MeshBasicMaterial({map:ctex(64,64,(c)=>{c.fillStyle=hx;c.fillRect(0,0,64,64);c.fillStyle='#fff';c.font='bold 46px sans-serif';c.textAlign='center';c.fillText(num,32,50)}),transparent:true}));pl.position.set(0,y,ry?z:z);pl.rotation.y=ry;tor.add(pl)});
 const hd=J(tor,0,.74,0);g.hd=hd;sph(.115,sk,0,.06,0,hd,.95,1.1,1.02);sph(.08,sk,0,-.01,.035,hd,1,.8,1);sph(.018,sk,0,.04,.12,hd);
 [-1,1].forEach(s=>{sph(.024,sk,s*.108,.05,0,hd,.5,1,.8);sph(.021,wh,s*.043,.08,.1,hd,1,.8,.5);sph(.011,dk,s*.043,.08,.11,hd);box(.04,.008,.01,hr,s*.043,.112,.105,hd)});
 box(.03,.006,.01,M(0x8a3b3b),0,-.005,.112,hd);const hc=new THREE.Mesh(new THREE.SphereGeometry(.122,24,14,0,6.3,0,1.9),hr);hc.scale.set(1,1.1,1.05);hc.position.set(0,.07,-.01);hc.castShadow=true;hd.add(hc);sph(.11,hr,0,.17,.05,hd,1,.35,.7);
 const hb=new THREE.Mesh(new THREE.TorusGeometry(.12,.009,8,28),sh);hb.rotation.x=Math.PI/2;hb.position.set(0,.115,0);hd.add(hb);
 g.arm=[-1,1].map(s=>{const a=J(tor,s*.29,.5,0);limb(.05,.042,.3,.008,sk,a);limb(.068,.063,.12,.003,jm,a);const el=J(a,0,-.3,0);limb(.042,.032,.27,.007,sk,el);limb(.038,.038,.04,0,wh,el,0,-.22,0);sph(.038,sk,0,-.3,0,el,1,1.2,.55);for(let i=0;i<4;i++)cyl(.007,.006,.05,sk,-.021+i*.014,-.345,0,el,6);cyl(.008,.007,.04,sk,s*.036,-.31,.02,el,6).rotation.z=s*.5;a.el=el;a.s=s;return a});
 g.leg=[-1,1].map(s=>{const hp=J(hips,s*.09,-.05,0);limb(.088,.066,.42,.01,sk,hp);limb(.106,.1,.18,0,sm,hp);const kn=J(hp,0,-.42,0);limb(.062,.042,.42,.013,sk,kn);limb(.058,.052,.2,.002,wh,kn,0,-.2,0);cyl(.073,.071,.11,dk,0,-.01,.008,kn);const ft=J(kn,0,-.42,0);box(.1,.025,.27,wh,0,-.062,.06,ft);sph(.05,sh,0,-.03,.075,ft,1,.7,2);sph(.05,sh,0,-.03,-.02,ft,1,.8,1);hp.kn=kn;return hp});
 const pd=new THREE.Group();cyl(.09,.09,.012,M(0xc4161c,.5),0,-.1,.04,pd).rotation.x=Math.PI/2;box(.025,.09,.02,M(0xb98a4f),0,-.02,.04,pd);pd.position.set(0,-.3,.02);pd.visible=false;g.arm[1].el.add(pd);g.pd=pd;
 g.pose=function(p){const [a,b,lean,AL,AR,jump,paddle]=p;g.hips.position.y=.125+.42*Math.cos(a)+.42*Math.cos(b-a)+(jump||0);g.tor.rotation.x=lean;g.hd.rotation.x=-lean*.8;g.leg.forEach(l=>{l.rotation.x=-a;l.kn.rotation.x=b});[AL,AR].forEach((q,i)=>{const s=g.arm[i];s.rotation.x=q[0];s.rotation.z=s.s*q[1];s.el.rotation.x=q[2]});g.pd.visible=!!paddle};
 g.pose(POSES['立ち']);return g}
function gymModel(){const g=new THREE.Group(),Rr=23.1,cy=-12.1,al=.597,FW=2048,FH=3072,px=FW/26,pz=FH/40,X=x=>(x+13)*px,Z=z=>(z+20)*pz,at=(r,a,z=0)=>new V3(r*Math.sin(a),cy+r*Math.cos(a),z);
 const ft=ctex(FW,FH,(c)=>{const n=260,pw=FW/n;for(let i=0;i<n;i++){let y=0;while(y<FH){const l=(1+Math.random()*1.4)*pz;c.fillStyle=`hsl(${31+Math.random()*6},${50+Math.random()*12}%,${56+Math.random()*10}%)`;c.fillRect(i*pw,y,pw+.6,l);c.fillStyle='rgba(60,35,10,.3)';c.fillRect(i*pw,y+l-1,pw,1.5);y+=l}c.fillStyle='rgba(50,30,10,.3)';c.fillRect(i*pw,0,1,FH)}
  c.globalAlpha=.07;for(let i=0;i<3000;i++){c.fillStyle=i%2?'#3a2410':'#fff';c.fillRect(Math.random()*FW,Math.random()*FH,1+Math.random()*2,8+Math.random()*40)}c.globalAlpha=1;
  const ln=(col,f)=>{c.strokeStyle=col;c.lineWidth=5;c.beginPath();f();c.stroke()},rc=(col,a,b,d,e)=>ln(col,()=>c.rect(X(a),Z(b),(d-a)*px,(e-b)*pz)),sg=(col,a,b,d,e)=>ln(col,()=>{c.moveTo(X(a),Z(b));c.lineTo(X(d),Z(e))}),ar=(col,cx,cz,r,a0,a1)=>ln(col,()=>c.ellipse(X(cx),Z(cz),r*px,r*pz,0,a0,a1));
  const bk='#d8423a',vb='#2a62d0',bd='#e6c229';rc(bk,-7.5,-14,7.5,14);sg(bk,-7.5,0,7.5,0);ar(bk,0,0,1.8,0,7);[-1,1].forEach(s=>{rc(bk,-2.45,s>0?8.2:-14,2.45,s>0?14:-8.2);ar(bk,0,s*8.2,1.8,0,7);ar(bk,0,s*12.6,6.75,-s*Math.PI/2-1.2,-s*Math.PI/2+1.2)});
  rc(vb,-4.5,-9,4.5,9);sg(vb,-4.5,-3,4.5,-3);sg(vb,-4.5,3,4.5,3);rc(bd,-3.05,-6.7,3.05,6.7);rc(bd,-2.59,-6.7,2.59,6.7);sg(bd,-3.05,-1.98,3.05,-1.98);sg(bd,-3.05,1.98,3.05,1.98);sg(bd,0,-6.7,0,-1.98);sg(bd,0,1.98,0,6.7)});
 const fl=new THREE.Mesh(new THREE.PlaneGeometry(26,40),new THREE.MeshPhysicalMaterial({map:ft,roughness:.35,clearcoat:.7,clearcoatRoughness:.18}));fl.rotation.x=-Math.PI/2;fl.receiveShadow=true;g.add(fl);
 const pat=(f,rx,ry)=>{const t=ctex(256,256,f);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);return new THREE.MeshStandardMaterial({map:t,roughness:.95})};
 const plF=(c)=>{c.fillStyle='#e8ecef';c.fillRect(0,0,256,256);c.fillStyle='rgba(0,0,0,.05)';for(let i=0;i<400;i++)c.fillRect(Math.random()*256,Math.random()*256,3,3);c.fillStyle='rgba(0,0,0,.1)';c.fillRect(0,0,2,256);c.fillRect(0,0,256,2)},pdF=(c)=>{c.fillStyle='#1f4e8c';c.fillRect(0,0,256,256);c.fillStyle='rgba(255,255,255,.1)';c.fillRect(0,0,256,10);c.fillStyle='rgba(0,0,0,.35)';c.fillRect(0,0,4,256);c.fillRect(0,0,256,4)};
 [-1,1].forEach(s=>{const w=new THREE.Mesh(new THREE.PlaneGeometry(40,7),pat(plF,8,1.4));w.position.set(s*13,3.5,0);w.rotation.y=-s*Math.PI/2;w.receiveShadow=true;g.add(w);const p=new THREE.Mesh(new THREE.PlaneGeometry(40,1.8),pat(pdF,33,1));p.position.set(s*12.98,.9,0);p.rotation.y=-s*Math.PI/2;g.add(p);
  for(let z=-18;z<=18;z+=4.5){const gl=new THREE.Mesh(new THREE.PlaneGeometry(3.2,1.7),new THREE.MeshBasicMaterial({color:0xcfe6ff}));gl.position.set(s*12.95,5.1,z);gl.rotation.y=-s*Math.PI/2;g.add(gl);box(.1,.12,3.4,M(0x4a525c),s*12.9,5.97,z,g);box(.1,.12,3.4,M(0x4a525c),s*12.9,4.23,z,g);box(.1,1.8,.1,M(0x4a525c),s*12.9,5.1,z,g);
   if(Math.abs(z)<14){const sh=new THREE.Mesh(new THREE.BoxGeometry(.02,10,2.6),new THREE.MeshBasicMaterial({color:0xfff1c0,transparent:true,opacity:.07,blending:THREE.AdditiveBlending,depthWrite:false}));sh.position.set(s*9.2,2.6,z);sh.rotation.z=-s*.75;g.add(sh)}}
  for(let z=-16;z<=16;z+=8)box(.3,7,.4,M(0x8f98a3,.5,.4),s*12.85,3.5,z,g)});
 const ep=[new THREE.Vector2(-13,0),new THREE.Vector2(13,0)];for(let i=0;i<=32;i++){const a=al-2*al*i/32;ep.push(new THREE.Vector2(Rr*Math.sin(a),cy+Rr*Math.cos(a)))}
 [-1,1].forEach(s=>{const e=new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape(ep)),pat(plF,.25,.25));e.position.z=s*20;e.rotation.y=s>0?Math.PI:0;g.add(e);const p=new THREE.Mesh(new THREE.PlaneGeometry(26,1.8),pat(pdF,22,1));p.position.set(0,.9,s*19.98);p.rotation.y=s>0?Math.PI:0;g.add(p)});
 const rg=new THREE.PlaneGeometry(2*al,40,64,1),pa=rg.attributes.position;for(let i=0;i<pa.count;i++){const a=pa.getX(i);pa.setXYZ(i,Rr*Math.sin(a),cy+Rr*Math.cos(a),pa.getY(i))}rg.computeVertexNormals();
 const rt=ctex(256,256,(c)=>{c.fillStyle='#dfe4ea';c.fillRect(0,0,256,256);c.fillStyle='rgba(0,0,0,.18)';c.fillRect(0,0,5,256)});rt.wrapS=rt.wrapT=THREE.RepeatWrapping;rt.repeat.set(40,1);g.add(new THREE.Mesh(rg,new THREE.MeshStandardMaterial({map:rt,roughness:.6,metalness:.2})));
 const sm=M(0x7b8794,.45,.6);
 for(let z=-18;z<=18;z+=6){[Rr-.12,Rr-1.6].forEach(r=>{const pts=[];for(let i=0;i<=24;i++)pts.push(at(r,-al+2*al*i/24,z));g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),48,.09,6),sm))});for(let i=0;i<=16;i++){const a=-al+2*al*i/16,p=at(Rr-.86,a,z);cyl(.035,.035,1.48,sm,p.x,p.y,z,g,6).rotation.z=-a}}
 for(let i=0;i<=16;i++){const a=-al+2*al*i/16,p=at(Rr-1.6,a);cyl(.05,.05,40,sm,p.x,p.y,0,g,6).rotation.x=Math.PI/2}
 const lm=new THREE.MeshBasicMaterial({color:0xfff2d0});[-15,-5,5,15].forEach(z=>[-6,0,6].forEach(x=>{const a=Math.asin(x/(Rr-1.6)),y=cy+(Rr-1.6)*Math.cos(a);cyl(.012,.012,.9,sm,x,y-.45,z,g,4);cyl(.5,.15,.32,M(0x9aa3ad,.4,.6),x,y-1.05,z,g,16);const d=new THREE.Mesh(new THREE.CircleGeometry(.48,16),lm);d.rotation.x=Math.PI/2;d.position.set(x,y-1.22,z);g.add(d)}));
 [-10,10].forEach(z=>{const l=new THREE.PointLight(0xfff0d8,.5,40);l.position.set(0,8,z);g.add(l)});
 [-1,1].forEach(s=>{const h=new THREE.Group();h.position.z=s*19.3;g.add(h);const bb=box(1.8,1.05,.05,new THREE.MeshPhysicalMaterial({color:0xffffff,transparent:true,opacity:.35,roughness:.1}),0,3.5,0,h);box(.59,.45,.055,M(0xd8423a),0,3.35,0,h);[-.7,.7].forEach(x=>cyl(.04,.04,3.6,sm,x,5.7,s*.15,h,6));box(1.9,.08,.08,sm,0,3.98,0,h);const rm=new THREE.Mesh(new THREE.TorusGeometry(.23,.015,8,28),M(0xe2571a,.4,.4));rm.rotation.x=Math.PI/2;rm.position.set(0,3.05,-s*.4);h.add(rm);const nt=new THREE.Mesh(new THREE.CylinderGeometry(.23,.14,.4,16,1,true),new THREE.MeshBasicMaterial({map:netT(12,3),transparent:true,side:2}));nt.position.set(0,2.85,-s*.4);h.add(nt);cyl(.02,.02,.4,M(0xe2571a),0,3.05,-s*.17,h,6).rotation.x=Math.PI/2;
  const sb=board(['HOME 21','AWAY 19'],4,1.5,'#ffb000','#ffb000');sb.position.set(-s*6,5.6,s*19.85);sb.rotation.y=s>0?Math.PI:0;g.add(sb);box(4.2,1.7,.1,M(0x15191f),-s*6,5.6,s*19.9,g);
  const dr=M(0x4a525c,.6,.3);box(2.4,2.4,.1,dr,s*8,1.2,s*19.9,g);const ex=new THREE.Mesh(new THREE.PlaneGeometry(.5,.25),new THREE.MeshBasicMaterial({color:0x35e07a}));ex.position.set(s*8,2.7,s*19.82);ex.rotation.y=s>0?Math.PI:0;g.add(ex)});
 for(let z=-19;z<=-10.5;z+=.9)box(.05,2.7,.05,M(0xb08a55),12.85,1.4,z,g);for(let y=.3;y<=2.7;y+=.3)box(.03,.03,8.6,M(0xb08a55),12.82,y,-14.7,g);
 box(.8,.75,3,M(0xcfd5dc),8.3,.38,0,g);[-1,1].forEach(s=>{box(.5,.45,.5,M(0x2b3340),9.1,.23,s*.8,g);box(.45,.45,3,M(0x2b3340),-8.4,.23,s*4,g)});
 [[11.5,-.1],[11.5,.1]].forEach(([x,y],i)=>box(2,.12,1,M(i?0x1d4ed8:0xd8423a),x,.06+i*.14,17,g));
 const cl=new THREE.Mesh(new THREE.CircleGeometry(.4,24),new THREE.MeshBasicMaterial({map:ctex(128,128,(c)=>{c.fillStyle='#fff';c.fillRect(0,0,128,128);c.strokeStyle='#111';c.lineWidth=5;c.beginPath();c.moveTo(64,64);c.lineTo(64,22);c.moveTo(64,64);c.lineTo(94,72);c.stroke()})}));cl.position.set(-12.97,4.6,6);cl.rotation.y=Math.PI/2;g.add(cl);
 stand(g,-9.5,0,-Math.PI/2,26,4,0x1d4ed8,.42,.8,0,'GYM CUP','#0d2a52');return g}
function volleyCourt(){const g=new THREE.Group(),f=new THREE.Mesh(new THREE.PlaneGeometry(24,36),new THREE.MeshPhysicalMaterial({clearcoat:.6,clearcoatRoughness:.25,map:ctex(1024,1024,(c)=>{wood(c,1024,1024,36);const X=x=>(x+12)*1024/24,Z=z=>(z+18)*1024/36;c.fillStyle='rgba(40,90,170,.6)';c.fillRect(X(-7),Z(-12),X(7)-X(-7),Z(12)-Z(-12));c.strokeStyle='#fff';c.lineWidth=6;c.strokeRect(X(-4.5),Z(-9),X(4.5)-X(-4.5),Z(9)-Z(-9));[-3,0,3].forEach(z=>{c.beginPath();c.moveTo(X(-4.5),Z(z));c.lineTo(X(4.5),Z(z));c.stroke()})}),roughness:.3}));f.rotation.x=-Math.PI/2;f.receiveShadow=true;g.add(f);
 [-5.2,5.2].forEach(x=>{cyl(.05,.05,2.55,M(0x333b45),x,1.27,0,g);cyl(.1,.1,1,M(0x2f6fb0),x,.5,0,g)});
 const net=new THREE.Mesh(new THREE.PlaneGeometry(9.8,1),new THREE.MeshBasicMaterial({map:netT(60,6),transparent:true,side:2}));net.position.set(0,1.93,0);g.add(net);box(9.8,.07,.05,M(0xffffff),0,2.45,0,g);box(9.8,.04,.03,M(0xffffff),0,1.43,0,g);
 [-4.5,4.5].forEach(x=>{for(let i=0;i<10;i++)cyl(.012,.012,.1,M(i%2?0xffffff:0xd22),x,1.93+.05+i*.1-.45+.05,0,g,6)});
 const rf=new THREE.Group();box(.7,.08,.7,M(0x888),0,1.55,0,rf);box(.05,1.5,.05,M(0x888),-.3,.77,-.3,rf);box(.05,1.5,.05,M(0x888),.3,.77,-.3,rf);box(.05,1.5,.05,M(0x888),-.3,.77,.3,rf);box(.05,1.5,.05,M(0x888),.3,.77,.3,rf);rf.position.set(6.2,0,0);g.add(rf);
 const bt=ctex(256,128,(c)=>{c.fillStyle='#f4d03f';c.fillRect(0,0,256,128);c.fillStyle='#2e6fd8';for(let i=0;i<4;i++)c.fillRect(i*64,0,22,128)});sph(.11,new THREE.MeshStandardMaterial({map:bt,roughness:.5}),-2,.11,3,g);return g}
function ttTable(){const g=new THREE.Group(),m=new THREE.Mesh(new THREE.PlaneGeometry(14,14),M(0x2b5a3a,.9));m.rotation.x=-Math.PI/2;m.receiveShadow=true;g.add(m);
 box(1.525,.04,2.74,new THREE.MeshPhysicalMaterial({color:0x1d5fa8,roughness:.4,clearcoat:.7,clearcoatRoughness:.15}),0,.74,0,g);const wl=M(0xffffff);box(.012,.003,2.74,wl,0,.762,0,g);[-.7625,.7625].forEach(x=>box(.02,.003,2.74,wl,x,.762,0,g));[-1.37,1.37].forEach(z=>box(1.525,.003,.02,wl,0,.762,z,g));
 const fr=M(0x30343b,.5,.4);[-.7,.7].forEach(x=>[-1.2,1.2].forEach(z=>cyl(.03,.03,.72,fr,x,.36,z,g)));box(1.4,.04,.04,fr,0,.68,-1.2,g);box(1.4,.04,.04,fr,0,.68,1.2,g);box(.04,.04,2.4,fr,-.7,.68,0,g);box(.04,.04,2.4,fr,.7,.68,0,g);
 const nt=new THREE.Mesh(new THREE.PlaneGeometry(1.83,.1525),new THREE.MeshBasicMaterial({map:netT(24,2),transparent:true,side:2}));nt.position.set(0,.84,0);g.add(nt);box(1.83,.012,.012,wl,0,.915,0,g);[-.915,.915].forEach(x=>{cyl(.012,.012,.2,fr,x,.86,0,g);box(.04,.05,.2,fr,x,.78,0,g)});
 const bm=M(0x1d3f73,.6);[-1,1].forEach(s=>box(4,.7,.03,bm,0,.35,s*3.2,g));[-1,1].forEach(s=>box(.03,.7,6.4,bm,s*2,.35,0,g));
 const pd=new THREE.Group();cyl(.09,.09,.012,M(0xc4161c,.5),0,0,0,pd).rotation.x=Math.PI/2;box(.025,.09,.02,M(0xb98a4f),0,-.1,0,pd);pd.position.set(-.35,.78,.7);pd.rotation.set(-1.4,0,.3);g.add(pd);sph(.04,M(0xffffff,.3),.3,.8,.5,g);return g}
function bnr(txt,c1,c2,rep){const t=ctex(512,64,(c,w,h)=>{c.fillStyle=c1;c.fillRect(0,0,w,h);c.fillStyle=c2;c.font='bold 38px sans-serif';c.textAlign='center';c.fillText(txt,256,45)});t.wrapS=THREE.RepeatWrapping;t.repeat.set(rep,1);return new THREE.MeshBasicMaterial({map:t})}
function stand(g,x,z,ry,len,rows,sc,rise,run,roof,bt,bc){const s=new THREE.Group();s.position.set(x,0,z);s.rotation.y=ry;g.add(s);const cm=M(0xb8bcc4,.9);
 for(let i=0;i<rows;i++)box(len,rise*(i+1),run,cm,0,rise*(i+1)/2,i*run+run/2,s);
 const n=Math.floor(len/.6),cnt=n*rows,sm=M(sc,.7),mk=(geo,mat)=>new THREE.InstancedMesh(geo,mat,cnt);
 const A=mk(new THREE.BoxGeometry(.46,.05,.4),sm),B=mk(new THREE.BoxGeometry(.46,.42,.05),sm),P=mk(new THREE.BoxGeometry(.38,.52,.28),M(0xffffff,.8)),H=mk(new THREE.SphereGeometry(.12,10,8),M(0xe0b090,.6)),m4=new THREE.Matrix4(),col=new THREE.Color();let k=0;
 for(let i=0;i<rows;i++)for(let j=0;j<n;j++){const px=-len/2+.3+j*.6,py=rise*(i+1),pz=i*run+run*.55,oc=Math.random()<.85;
  m4.makeTranslation(px,py+.28,pz);A.setMatrixAt(k,m4);m4.makeTranslation(px,py+.5,pz+.19);B.setMatrixAt(k,m4);
  m4.makeTranslation(px,oc?py+.62:-50,pz);P.setMatrixAt(k,m4);col.setHSL(Math.random(),.5,.5);P.setColorAt(k,col);m4.makeTranslation(px,oc?py+1.02:-50,pz);H.setMatrixAt(k,m4);k++}
 [A,B,P,H].forEach(m=>{m.castShadow=true;s.add(m)});
 box(len,.9,.06,M(0x222831),0,.45,-.05,s);const bp=new THREE.Mesh(new THREE.PlaneGeometry(len,.8),bnr(bt||'ACE OPEN',bc||'#0d2a52','#ffffff',Math.round(len/7)));bp.position.set(0,.5,-.09);bp.rotation.y=Math.PI;s.add(bp);
 if(roof){const Hh=rows*rise+4.5,D=rows*run;for(let px=-len/2+.3;px<=len/2;px+=len/5)cyl(.12,.12,Hh,M(0xdadde2),px,Hh/2,D+.1,s,8);const r=box(len+.6,.25,D+3,M(0xf2f4f7,.6),0,Hh,D/2+.2,s);r.rotation.x=.1}return s}
function board(txt,w,h,c1,c2){const t=ctex(512,Math.round(512*h/w),(c,W,H)=>{c.fillStyle='#0b0f18';c.fillRect(0,0,W,H);c.fillStyle=c1;c.font='bold '+Math.round(H*.34)+'px sans-serif';c.textAlign='center';c.fillText(txt[0],W/2,H*.4);c.fillStyle=c2;c.fillText(txt[1],W/2,H*.82)});return new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t}))}
const POSES={
 '立ち':[0,0,0,[.1,.12,-.15],[.1,.12,-.15]],
 'レシーブ':[.9,1.5,.5,[-1.05,-.12,-.05],[-1.05,-.12,-.05]],
 'トス':[.35,.7,-.08,[-2.6,.15,-.5],[-2.6,.15,-.5]],
 'スパイク':[.3,.7,-.3,[-1.2,.1,-.3],[-3.05,0,-.9],.55],
 'ジャンプサーブ':[.3,.7,-.25,[-2.8,.1,-.2],[-3.0,0,-.9],.55],
 '卓球の構え':[.5,.9,.3,[-.4,.3,-.6],[-.9,-.1,-1.0],0,1]}

return {gymModel, human, volleyCourt, ttTable};
}
const providedModels=buildProvidedModels();
let providedGym=null, providedVolleyCourt=null, providedTable=null;

function el(tag,css,txt){const n=document.createElement(tag);n.style.cssText=css;if(txt!==undefined)n.textContent=txt;return n}
function mat(color,roughness=.75){return new THREE.MeshStandardMaterial({color,roughness})}
function addBox(parent,w,h,d,color,x,y,z,material){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material||mat(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function addLine(parent,x1,y1,z1,x2,y2,z2,color=0xffffff,r=.018){const a=new THREE.Vector3(x1,y1,z1),b=new THREE.Vector3(x2,y2,z2),d=b.clone().sub(a);const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d.length(),6),mat(color));m.position.copy(a.add(b).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());parent.add(m);return m}
function ballMesh(color){const m=new THREE.Mesh(new THREE.SphereGeometry(sport==='volleyball'?.32:.12,24,18),mat(color,.35));m.castShadow=true;scene.add(m);return m}
function gym(){
scene.background=new THREE.Color(0xaab8c6);scene.fog=new THREE.Fog(0xaab8c6,45,100);
scene.add(new THREE.HemisphereLight(0xffffff,0x8a7050,.9));
const light=new THREE.DirectionalLight(0xfff4e0,1.25);light.position.set(6,14,9);light.castShadow=true;light.shadow.mapSize.set(2048,2048);scene.add(light);
if(!providedGym)providedGym=providedModels.gymModel();
scene.add(providedGym);
}
function court(){
if(sport==='volleyball'){
if(!providedVolleyCourt)providedVolleyCourt=providedModels.volleyCourt();
scene.add(providedVolleyCourt);
}else{
if(!providedTable){providedTable=providedModels.ttTable();const floor=providedTable.children[0];if(floor)providedTable.remove(floor);}
scene.add(providedTable);
}
}
function human(x,z,color,number){
const g=providedModels.human(color,number);
g.position.set(x,0,z);
g.rotation.y=z>0?Math.PI:0;
g.userData.home={x,z};
scene.add(g);players.push(g);return g;
}
function makeTeams(){
players.forEach(p=>scene.remove(p));players=[];
if(sport==='volleyball'){
for(let i=0;i<3;i++){human(-2.8+i*2.8,5.4,0x2879e8,i+1);human(-2.8+i*2.8,-5.4,0xe34b4b,i+1)}
}else{
const n=format==='doubles'?2:1;
for(let i=0;i<n;i++){human((i-(n-1)/2)*.7,2.5,0x2879e8,i+1);human((i-(n-1)/2)*.7,-2.5,0xe34b4b,i+1)}
}
}
function createUI(){
overlay=el('div','position:fixed;inset:0;z-index:99999;background:#101824;color:#fff;font-family:system-ui,sans-serif;overflow:hidden;');
const style=el('style','');
style.textContent=`
#newSportCanvas{position:absolute;inset:0}
#nsTop{position:absolute;left:0;right:0;top:env(safe-area-inset-top,8px);display:flex;justify-content:space-between;align-items:center;padding:10px 12px;gap:8px;pointer-events:none}
#nsTitle{margin-left:104px;font-weight:800;text-shadow:0 2px 8px #000;font-size:clamp(13px,2.4vw,20px)}
#nsScore{font-size:clamp(16px,3vw,22px);font-weight:900;background:#111b;padding:8px 12px;border-radius:12px;border:1px solid #ffffff55;white-space:nowrap}
#nsMessage{position:absolute;top:calc(env(safe-area-inset-top,8px) + 58px);left:50%;transform:translateX(-50%);background:#111d;padding:7px 12px;border-radius:9px;font-size:clamp(11px,1.8vw,14px);white-space:normal;width:max-content;max-width:90vw;text-align:center;box-sizing:border-box}
#nsControls button{touch-action:manipulation;border:2px solid #ffffffb0;box-shadow:0 3px 12px #0008;font-weight:800;cursor:pointer}
#nsServe{position:absolute;right:calc(env(safe-area-inset-right,0px) + 22px);bottom:calc(env(safe-area-inset-bottom,0px) + 26px);width:clamp(76px,12vw,96px);height:clamp(76px,12vw,96px);border-radius:50%;background:rgba(255,210,63,.92);color:#111;font-size:clamp(14px,2.3vw,18px)}
#nsActionStack{position:absolute;right:calc(env(safe-area-inset-right,0px) + 28px);bottom:calc(env(safe-area-inset-bottom,0px) + 132px);display:flex;flex-direction:column;gap:8px}
#nsActionStack button{min-width:clamp(64px,10vw,82px);min-height:42px;border-radius:14px;background:rgba(255,255,255,.78);color:#111;font-size:clamp(11px,1.8vw,14px);padding:8px}
#nsServeType{position:absolute;left:calc(env(safe-area-inset-left,0px) + 12px);bottom:calc(env(safe-area-inset-bottom,0px) + 24px);max-width:calc(100vw - 150px);background:#101c2cdd;color:white;border:1px solid #ffffff70;border-radius:12px;padding:10px;font-size:13px}
#nsUtility{position:absolute;left:calc(env(safe-area-inset-left,0px) + 12px);top:calc(env(safe-area-inset-top,0px) + 12px);display:flex;gap:6px}
#nsUtility button{border-radius:10px;background:#111b;color:white;border:1px solid #ffffff55;padding:8px 10px;font-size:12px}
@media (orientation:portrait){#nsTitle{margin-left:0;font-size:12px}#nsActionStack{right:calc(env(safe-area-inset-right,0px) + 12px);bottom:calc(env(safe-area-inset-bottom,0px) + 120px)}#nsServe{right:calc(env(safe-area-inset-right,0px) + 12px);bottom:calc(env(safe-area-inset-bottom,0px) + 18px)}#nsServeType{left:calc(env(safe-area-inset-left,0px) + 10px);bottom:calc(env(safe-area-inset-bottom,0px) + 18px);max-width:calc(100vw - 120px)}}
`;
overlay.appendChild(style);
const cvs=el('div','position:absolute;inset:0;');cvs.id='newSportCanvas';overlay.appendChild(cvs);
const top=el('div','');top.id='nsTop';top.innerHTML='<div id="nsTitle">SPORTS ARENA</div><div id="nsScore">0 - 0</div>';overlay.appendChild(top);
const msg=el('div','');msg.id='nsMessage';overlay.appendChild(msg);
const controls=el('div','position:absolute;inset:0;pointer-events:none;');controls.id='nsControls';
const button=(id,label,parent)=>{const b=el('button','',label);b.id=id;b.style.pointerEvents='auto';(parent||controls).appendChild(b);return b};
const utility=el('div','');utility.id='nsUtility';
const pause=button('nsPause','一時停止',utility);
pause.onclick=()=>{if(!active){active=true;clock.start();pause.textContent='一時停止';status('試合再開');return}active=false;status('一時停止中');pause.textContent='再開'};
button('nsExit','メニューへ',utility).onclick=close;
controls.appendChild(utility);
const actions=el('div','');actions.id='nsActionStack';controls.appendChild(actions);
if(sport==='volleyball'){
const serve=button('nsServe','サーブ');serve.onclick=doServe;
const selector=el('select','');selector.id='nsServeType';
selector.innerHTML='<option value="normal">通常サーブ</option><option value="jump">ジャンプサーブ</option><option value="floater">フローターサーブ</option><option value="jumpfloater">ジャンプフローター</option>';
selector.onchange=()=>{serveType=selector.value;status('サーブ：'+selector.options[selector.selectedIndex].text+'を選択')};
controls.appendChild(selector);
button('nsReceive','レシーブ',actions).onclick=()=>hit('receive');
button('nsSet','トス',actions).onclick=()=>hit('set');
button('nsSpike','スパイク',actions).onclick=()=>hit('spike');
button('nsBlock','ブロック',actions).onclick=()=>hit('block');
}else{
button('nsServe','サーブ').onclick=doServe;
button('nsHit','打ち返す',actions).onclick=()=>hit('hit');
button('nsSpin','強打',actions).onclick=()=>hit('smash');
}
overlay.appendChild(controls);document.body.appendChild(overlay);
}
function status(t){const n=$('nsMessage');if(n)n.textContent=t}
function scorePoint(team,reason){score[team]++;phase='point';status((team===0?'あなたのチーム':'CPUチーム')+'の得点：'+reason);if(sport==='volleyball'){const target=sets[0]===2||sets[1]===2?15:25;if(score[team]>=target&&Math.abs(score[0]-score[1])>=2){sets[team]++;score=[0,0];if(sets[team]>=3){status((team===0?'勝利！':'CPUの勝利')+'　セット '+sets[0]+' - '+sets[1]);phase='matchover'}}}else if(score[team]>=11&&Math.abs(score[0]-score[1])>=2){sets[team]++;score=[0,0];if(sets[team]>=3){status((team===0?'勝利！':'CPUの勝利')+'　ゲーム '+sets[0]+' - '+sets[1]);phase='matchover'}}
updateScore();ballV.set(0,0,0);ball.position.set(0,sport==='volleyball'?2.5:1.1,0)}
function updateScore(){const n=$('nsScore');if(n)n.textContent=sport==='volleyball'?score[0]+' - '+score[1]+'　|　'+sets[0]+':'+sets[1]:score[0]+' - '+score[1]+'　|　'+sets[0]+':'+sets[1]}
function doServe(){if(!active||phase==='matchover')return;if(phase!=='ready'&&phase!=='point'){status('ラリー中です');return}phase='rally';const dir=sport==='volleyball'?-1:1;ball.position.set((Math.random()-.5)*.7,sport==='volleyball'?(serveType.includes('jump')?3.2:2.1):1.15,sport==='volleyball'?7:3.5);ballV.set((Math.random()-.5)*.7,sport==='volleyball'?(serveType.includes('jump')?6.8:4.4):1.5,dir*(sport==='volleyball'?(serveType.includes('floater')?10:8):7));if(sport==='volleyball')status('サーブ！ '+({normal:'通常サーブ',jump:'ジャンプサーブ',floater:'フローターサーブ',jumpfloater:'ジャンプフローター'}[serveType]));else status('サーブを打ちました')}
function hit(type){if(!active||phase!=='rally'){status('まずサーブを打ってください');return}const near=ball.position.z>0;const own=near?0:1;if(sport==='volleyball'){if(type==='block'&&near){status('ネット際でブロック！');ballV.y=Math.max(ballV.y,4);ballV.z=-Math.abs(ballV.z)*1.1;ballV.x+=(Math.random()-.5)*2;lastHit=performance.now();return}
if(near){if(type==='receive'){ballV.y=5.5;ballV.z=-1.6;status('レシーブ！次はトス');}else if(type==='set'){ballV.y=7.3;ballV.z=-2.2;status('トス！スパイクできます');}else{ballV.y=8.5;ballV.z=-Math.abs(ballV.z||7)-2;ballV.x+=(Math.random()-.5)*4;status('スパイク！');}lastHit=performance.now();}else status('相手コートにボールがあります');
}else{if(near){ballV.y=2.3+(type==='smash'?2:0);ballV.z=-Math.abs(ballV.z||5)-1;ballV.x+=(Math.random()-.5)*(type==='smash'?2:1);status(type==='smash'?'強打！':'打ち返した！');lastHit=performance.now()}else status('ボールが遠いです')}
}
function tick(){
raf=requestAnimationFrame(tick);if(!renderer||!scene||!camera)return;
if(active&&phase==='rally'){
const dt=Math.min(clock.getDelta(),.04);ballV.y-=sport==='volleyball'?9.81*dt:8.5*dt;ball.position.addScaledVector(ballV,dt);
if(sport==='volleyball'){if(ball.position.y<.34){if(Math.abs(ball.position.z)>9||Math.abs(ball.position.x)>4.5)scorePoint(ball.position.z>0?1:0,'アウト');else scorePoint(ball.position.z>0?1:0,'床に落ちました');}
if(Math.abs(ball.position.z)<.18&&ball.position.y<2.43&&Math.abs(ball.position.x)<4.6&&ballV.z<0){ballV.z=Math.abs(ballV.z)*.55;ballV.y=Math.max(1.2,ballV.y*.4);}}
else {if(ball.position.y<.12){const team=ball.position.z>0?1:0;scorePoint(team,'台に落ちました')}
if(Math.abs(ball.position.z)<.06&&ball.position.y<.95){ballV.z*=-.65;ballV.y=Math.max(1.2,Math.abs(ballV.y)*.65)}}
if(ball.position.z<-8.7||ball.position.z>8.7){scorePoint(ball.position.z<0?0:1,'コート外')}
if(performance.now()-lastHit>3200&&ball.position.z<0){ballV.z=Math.abs(ballV.z)*.7;ballV.x*=.75;lastHit=performance.now();status('CPUが打ち返しました')}
if(performance.now()-lastHit>6500)scorePoint(ball.position.z>0?1:0,'ラリー終了');
}
if(ball){ball.rotation.x+=.025;ball.rotation.z+=.018}
renderer.render(scene,camera)
}
function resize(){if(!renderer||!camera)return;renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()}
function launch(s,f){
sport=s;format=f||'singles';score=[0,0];sets=[0,0];phase='ready';serveType='normal';active=true;
createUI();scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(48,innerWidth/innerHeight,.1,100);camera.position.set(0,sport==='volleyball'?10:8,sport==='volleyball'?18:14);camera.lookAt(0,1.4,0);clock=new THREE.Clock();
renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;$('newSportCanvas').appendChild(renderer.domElement);
gym();court();makeTeams();ball=ballMesh(sport==='volleyball'?0xf4f3eb:0xffa83c);ball.position.set(0,sport==='volleyball'?2.5:1.1,0);ballV=new THREE.Vector3();$('nsTitle').textContent=sport==='volleyball'?'🏐 バレーボール 3対3':'🏓 卓球 '+(format==='doubles'?'ダブルス':'シングルス');status(sport==='volleyball'?'サーブを選んで「サーブ」を押してください。':'サーブを打って試合開始。');updateScore();addEventListener('resize',resize);resize();tick()
}
function close(){active=false;cancelAnimationFrame(raf);removeEventListener('resize',resize);if(renderer){renderer.dispose();renderer=null}if(overlay)overlay.remove();overlay=null;scene=null;camera=null;ball=null;players=[];phase='ready';if(typeof showMainHome==='function')showMainHome()}
window.startNewSportGame=launch;
document.addEventListener('DOMContentLoaded',()=>{
const cpu=$('newSportCpu'),practice=$('newSportPractice');
function startFromButton(){const s=window.nsSelectedSport;launch(s==='tabletennis'?'tabletennis':'volleyball',window.nsSelectedFormat||'singles')}
if(cpu)cpu.onclick=startFromButton;if(practice)practice.onclick=startFromButton;
});
})();
