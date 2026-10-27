const M=(c,r=.8,m=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});
function box(w,h,d,mat,x,y,z,p){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;p.add(o);return o}
function cyl(r1,r2,h,mat,x,y,z,p,seg=16){const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,seg),mat);o.position.set(x,y,z);o.castShadow=true;p.add(o);return o}
function sph(r,mat,x,y,z,p,sx=1,sy=1,sz=1){const o=new THREE.Mesh(new THREE.SphereGeometry(r,20,14),mat);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;p.add(o);return o}
function ctex(w,h,fn){const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.anisotropy=8;return t}
function wood(g,w,h,n){for(let i=0;i<n;i++){g.fillStyle=`hsl(33,${52+i%3*5}%,${55+i*7%10}%)`;g.fillRect(0,i*h/n,w,h/n);g.fillStyle='rgba(0,0,0,.15)';g.fillRect(0,i*h/n,w,1.5)}}
function netT(rx,ry){const t=ctex(64,64,(g)=>{g.strokeStyle='rgba(20,20,20,.9)';g.lineWidth=3;g.strokeRect(0,0,64,64)});t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);return t}
/* ===== 人のモデル ===== */
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
function humanOld(col,num,skin=0xe0ac84){
 const g=new THREE.Group(),sk=M(skin,.6),jm=M(col,.7),sm=M(0x1d2430,.8),wh=M(0xffffff,.6),hr=M(0x2a1d16,.9);
 const J=(p,x,y,z)=>{const j=new THREE.Group();j.position.set(x,y,z);p.add(j);return j};
 const hips=J(g,0,.965,0);g.hips=hips;cyl(.2,.19,.22,sm,0,-.02,0,hips).scale.z=.78;
 const tor=J(hips,0,.08,0);g.tor=tor;const ch=cyl(.23,.18,.54,jm,0,.27,0,tor);ch.scale.z=.72;
 [-1,1].forEach(s=>sph(.07,jm,s*.24,.5,0,tor));
 cyl(.05,.055,.1,sk,0,.59,0,tor);
 const pl=new THREE.Mesh(new THREE.PlaneGeometry(.26,.26),new THREE.MeshBasicMaterial({map:ctex(64,64,(c)=>{c.fillStyle='#'+new THREE.Color(col).getHexString();c.fillRect(0,0,64,64);c.fillStyle='#fff';c.font='bold 46px sans-serif';c.textAlign='center';c.fillText(num,32,50)}),transparent:true}));pl.position.set(0,.3,-.135);pl.rotation.y=Math.PI;tor.add(pl);
 const hd=J(tor,0,.7,0);g.hd=hd;sph(.12,sk,0,.04,0,hd,1,1.15,1.05);
 const hair=new THREE.Mesh(new THREE.SphereGeometry(.13,20,12,0,6.3,0,1.9),hr);hair.scale.set(1,1.15,1.08);hair.position.set(0,.06,-.012);hair.castShadow=true;hd.add(hair);
 [-1,1].forEach(s=>{sph(.016,M(0x111111),s*.045,.07,.115,hd);sph(.025,sk,s*.12,.04,0,hd);sph(.012,sk,0,.03,.125,hd)});
 g.arm=[-1,1].map(s=>{const sh=J(tor,s*.29,.5,0),up=cyl(.052,.044,.3,sk,0,-.15,0,sh);cyl(.065,.06,.13,jm,0,-.06,0,sh);const el=J(sh,0,-.3,0);cyl(.044,.035,.27,sk,0,-.135,0,el);sph(.042,sk,0,-.29,0,el);sh.el=el;sh.s=s;return sh});
 g.leg=[-1,1].map(s=>{const hp=J(hips,s*.09,-.05,0);cyl(.088,.066,.42,sk,0,-.21,0,hp);cyl(.098,.092,.2,sm,0,-.09,0,hp);const kn=J(hp,0,-.42,0);cyl(.06,.045,.42,sk,0,-.21,0,kn);cyl(.066,.056,.2,wh,0,-.31,0,kn);const ft=J(kn,0,-.42,0);box(.1,.07,.26,wh,0,-.04,.06,ft);box(.1,.025,.27,M(0x333b45),0,-.07,.06,ft);hp.kn=kn;return hp});
 const pd=new THREE.Group();cyl(.09,.09,.012,M(0xc4161c,.5),0,-.1,.04,pd).rotation.x=Math.PI/2;box(.025,.09,.02,M(0xb98a4f),0,-.02,.04,pd);pd.position.set(0,-.3,.02);pd.visible=false;g.arm[1].el.add(pd);g.pd=pd;
 g.pose=function(p){const [a,b,lean,AL,AR,jump,paddle]=p;
  g.hips.position.y=.125+.42*Math.cos(a)+.42*Math.cos(b-a)+(jump||0);g.tor.rotation.x=lean;g.hd.rotation.x=-lean*.8;
  g.leg.forEach(l=>{l.rotation.x=-a;l.kn.rotation.x=b;l.children.forEach(()=>0)});
  [AL,AR].forEach((q,i)=>{const s=g.arm[i];s.rotation.x=q[0];s.rotation.z=s.s*q[1];s.el.rotation.x=q[2]});g.pd.visible=!!paddle};
 g.pose(POSES['立ち']);return g}
const POSES={
 '立ち':[0,0,0,[.1,.12,-.15],[.1,.12,-.15]],
 'レシーブ':[.9,1.5,.5,[-1.05,-.12,-.05],[-1.05,-.12,-.05]],
 'トス':[.35,.7,-.08,[-2.6,.15,-.5],[-2.6,.15,-.5]],
 'スパイク':[.3,.7,-.3,[-1.2,.1,-.3],[-3.05,0,-.9],.55],
 'ジャンプサーブ':[.3,.7,-.25,[-2.8,.1,-.2],[-3.0,0,-.9],.55],
 '卓球の構え':[.5,.9,.3,[-.4,.3,-.6],[-.9,-.1,-1.0],0,1]};
/* ===== 体育館のモデル ===== */
function gymModel(){const g=new THREE.Group(),wallM=new THREE.MeshStandardMaterial({map:(t=>{t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(8,2);return t})(ctex(256,256,(c)=>{c.fillStyle='#e9eef3';c.fillRect(0,0,256,256);c.fillStyle='rgba(0,0,0,.07)';c.fillRect(0,0,3,256);c.fillRect(0,0,256,3);c.fillStyle='rgba(0,0,0,.04)';c.fillRect(0,128,256,128)})),roughness:.9}),pad=M(0x1f4e8c);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(26,40),new THREE.MeshStandardMaterial({map:ctex(1024,1024,(c)=>{wood(c,1024,1024,40);const X=x=>(x+13)*1024/26,Z=z=>(z+20)*1024/40;c.fillStyle='rgba(40,90,170,.55)';c.fillRect(X(-7),Z(-12),X(7)-X(-7),Z(12)-Z(-12));c.strokeStyle='#fff';c.lineWidth=6;c.strokeRect(X(-4.5),Z(-9),X(4.5)-X(-4.5),Z(9)-Z(-9));[-3,0,3].forEach(z=>{c.beginPath();c.moveTo(X(-4.5),Z(z));c.lineTo(X(4.5),Z(z));c.stroke()});c.strokeStyle='#ffd';c.lineWidth=3;c.beginPath();c.arc(X(0),Z(0),70,0,7);c.stroke()}),roughness:.3,metalness:.05}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;g.add(floor);
 box(26,9,.3,wallM,0,4.5,-20,g);box(26,9,.3,wallM,0,4.5,20,g);box(.3,9,40,wallM,13,4.5,0,g);box(.3,9,40,wallM,-13,4.5,0,g);box(26,.3,40,M(0xcfd6de),0,9,0,g);
 box(26,1.6,.3,pad,0,.8,-19.8,g);box(26,1.6,.3,pad,0,.8,19.8,g);box(.3,1.6,40,pad,12.8,.8,0,g);box(.3,1.6,40,pad,-12.8,.8,0,g);
 for(let z=-16;z<=16;z+=8){box(26,.5,.4,M(0x59616b),0,8.7,z,g);box(.05,1.2,5,new THREE.MeshBasicMaterial({color:0xcfe8ff}),12.8,6.5,z,g);box(.05,1.2,5,new THREE.MeshBasicMaterial({color:0xcfe8ff}),-12.8,6.5,z,g);for(let x=-6;x<=6;x+=12)box(3,.1,1.2,new THREE.MeshBasicMaterial({color:0xffffff}),x,8.4,z,g)}
 for(let z=-19;z<=19;z+=1.2)box(.06,2.6,.06,M(0x9a7a4e),12.8,1.8,z,g);
 for(let i=0;i<4;i++){box(1.2,.5*(i+1),32,M(0x6b7a8f),-10.2-i*.65,.25*(i+1),0,g);for(let z=-15;z<=15;z+=1.3){const y=.5*(i+1);box(.36,.5,.28,M(new THREE.Color().setHSL(Math.random(),.55,.5)),-10.2-i*.65,y+.3,z,g);sph(.12,M(0xe0b090),-10.2-i*.65,y+.7,z,g)}}
 [-1,1].forEach(s=>{const p=new THREE.Group();box(.08,3,.08,M(0x444),0,1.5,0,p);box(1.8,1.05,.06,M(0xffffff),0,3.4,.1,p);const rim=new THREE.Mesh(new THREE.TorusGeometry(.23,.015,8,24),M(0xe2571a));rim.rotation.x=Math.PI/2;rim.position.set(0,3.05,.45);p.add(rim);p.position.set(s*6,0,-19.6);g.add(p);p.visible=true});
 const sb=box(3,1,.3,M(0x15191f),0,6,-19.7,g);const t=new THREE.Mesh(new THREE.PlaneGeometry(2.8,.8),new THREE.MeshBasicMaterial({map:ctex(256,80,(c)=>{c.fillStyle='#111';c.fillRect(0,0,256,80);c.fillStyle='#ff9d00';c.font='bold 54px monospace';c.textAlign='center';c.fillText('12  :  09',128,60)})}));t.position.set(0,6,-19.54);g.add(t);
 const bn=new THREE.Mesh(new THREE.PlaneGeometry(12,1.5),new THREE.MeshBasicMaterial({map:ctex(1024,128,(c,w,h)=>{c.fillStyle='#c8102e';c.fillRect(0,0,w,h);c.fillStyle='#fff';c.font='bold 76px sans-serif';c.textAlign='center';c.fillText('体育館カップ 2026',512,92)})}));bn.position.set(0,7.5,-19.6);g.add(bn);
 [-1,1].forEach(s=>box(.1,2.4,3,M(0x2f6fb0),s*12.8,1.2,12,g));return g}
/* ===== コートのモデル ===== */
function volleyCourt(){const g=new THREE.Group(),f=new THREE.Mesh(new THREE.PlaneGeometry(24,36),new THREE.MeshStandardMaterial({map:ctex(1024,1024,(c)=>{wood(c,1024,1024,36);const X=x=>(x+12)*1024/24,Z=z=>(z+18)*1024/36;c.fillStyle='rgba(40,90,170,.6)';c.fillRect(X(-7),Z(-12),X(7)-X(-7),Z(12)-Z(-12));c.strokeStyle='#fff';c.lineWidth=6;c.strokeRect(X(-4.5),Z(-9),X(4.5)-X(-4.5),Z(9)-Z(-9));[-3,0,3].forEach(z=>{c.beginPath();c.moveTo(X(-4.5),Z(z));c.lineTo(X(4.5),Z(z));c.stroke()})}),roughness:.3}));f.rotation.x=-Math.PI/2;f.receiveShadow=true;g.add(f);
 [-5.2,5.2].forEach(x=>{cyl(.05,.05,2.55,M(0x333b45),x,1.27,0,g);cyl(.1,.1,1,M(0x2f6fb0),x,.5,0,g)});
 const net=new THREE.Mesh(new THREE.PlaneGeometry(9.8,1),new THREE.MeshBasicMaterial({map:netT(60,6),transparent:true,side:2}));net.position.set(0,1.93,0);g.add(net);box(9.8,.07,.05,M(0xffffff),0,2.45,0,g);box(9.8,.04,.03,M(0xffffff),0,1.43,0,g);
 [-4.5,4.5].forEach(x=>{for(let i=0;i<10;i++)cyl(.012,.012,.1,M(i%2?0xffffff:0xd22),x,1.93+.05+i*.1-.45+.05,0,g,6)});
 const rf=new THREE.Group();box(.7,.08,.7,M(0x888),0,1.55,0,rf);box(.05,1.5,.05,M(0x888),-.3,.77,-.3,rf);box(.05,1.5,.05,M(0x888),.3,.77,-.3,rf);box(.05,1.5,.05,M(0x888),-.3,.77,.3,rf);box(.05,1.5,.05,M(0x888),.3,.77,.3,rf);rf.position.set(6.2,0,0);g.add(rf);
 const bt=ctex(256,128,(c)=>{c.fillStyle='#f4d03f';c.fillRect(0,0,256,128);c.fillStyle='#2e6fd8';for(let i=0;i<4;i++)c.fillRect(i*64,0,22,128)});sph(.11,new THREE.MeshStandardMaterial({map:bt,roughness:.5}),-2,.11,3,g);return g}
function ttTable(){const g=new THREE.Group(),m=new THREE.Mesh(new THREE.PlaneGeometry(14,14),M(0x2b5a3a,.9));m.rotation.x=-Math.PI/2;m.receiveShadow=true;g.add(m);
 box(1.525,.04,2.74,M(0x1d5fa8,.35),0,.74,0,g);const wl=M(0xffffff);box(.012,.003,2.74,wl,0,.762,0,g);[-.7625,.7625].forEach(x=>box(.02,.003,2.74,wl,x,.762,0,g));[-1.37,1.37].forEach(z=>box(1.525,.003,.02,wl,0,.762,z,g));
 const fr=M(0x30343b,.5,.4);[-.7,.7].forEach(x=>[-1.2,1.2].forEach(z=>cyl(.03,.03,.72,fr,x,.36,z,g)));box(1.4,.04,.04,fr,0,.68,-1.2,g);box(1.4,.04,.04,fr,0,.68,1.2,g);box(.04,.04,2.4,fr,-.7,.68,0,g);box(.04,.04,2.4,fr,.7,.68,0,g);
 const nt=new THREE.Mesh(new THREE.PlaneGeometry(1.83,.1525),new THREE.MeshBasicMaterial({map:netT(24,2),transparent:true,side:2}));nt.position.set(0,.84,0);g.add(nt);box(1.83,.012,.012,wl,0,.915,0,g);[-.915,.915].forEach(x=>{cyl(.012,.012,.2,fr,x,.86,0,g);box(.04,.05,.2,fr,x,.78,0,g)});
 const bm=M(0x1d3f73,.6);[-1,1].forEach(s=>box(4,.7,.03,bm,0,.35,s*3.2,g));[-1,1].forEach(s=>box(.03,.7,6.4,bm,s*2,.35,0,g));
 const pd=new THREE.Group();cyl(.09,.09,.012,M(0xc4161c,.5),0,0,0,pd).rotation.x=Math.PI/2;box(.025,.09,.02,M(0xb98a4f),0,-.1,0,pd);pd.position.set(-.35,.78,.7);pd.rotation.set(-1.4,0,.3);g.add(pd);sph(.04,M(0xffffff,.3),.3,.8,.5,g);return g}
window.Sports3DModels={gymModel,human,POSES,volleyCourt,ttTable};
