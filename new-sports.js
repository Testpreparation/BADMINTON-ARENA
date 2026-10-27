/* New sports module: isolated from the existing tennis/badminton engine. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
let overlay,renderer,scene,camera,clock,raf=0,active=false,sport='volleyball',format='singles';
let ball,ballV,players=[],score=[0,0],sets=[0,0],points=0,serveType='normal',phase='ready',lastHit=0,teamTurn=0,serveCount=0,matchText='';
const keys={};
function el(tag,css,txt){const n=document.createElement(tag);n.style.cssText=css;if(txt!==undefined)n.textContent=txt;return n}
function mat(color,roughness=.75){return new THREE.MeshStandardMaterial({color,roughness})}
function addBox(parent,w,h,d,color,x,y,z,material){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material||mat(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function addLine(parent,x1,y1,z1,x2,y2,z2,color=0xffffff,r=.018){const a=new THREE.Vector3(x1,y1,z1),b=new THREE.Vector3(x2,y2,z2),d=b.clone().sub(a);const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d.length(),6),mat(color));m.position.copy(a.add(b).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());parent.add(m);return m}
function ballMesh(color){const m=new THREE.Mesh(new THREE.SphereGeometry(sport==='volleyball'?.32:.12,24,18),mat(color,.35));m.castShadow=true;scene.add(m);return m}
function gym(){scene.background=new THREE.Color(0x9bb0c2);scene.fog=new THREE.Fog(0x9bb0c2,35,85);
scene.add(new THREE.HemisphereLight(0xe5f2ff,0x3b4350,1.6));const l=new THREE.DirectionalLight(0xfff3d5,2.0);l.position.set(-8,18,10);l.castShadow=true;l.shadow.mapSize.set(1024,1024);scene.add(l);
addBox(scene,34,.25,44,0x9d7954,0,-.18,0);
for(let z=-21;z<=21;z+=1.3)addBox(scene,33,.006,.012,0x745238,0,-.045,z);
addBox(scene,34,9,.25,0xd7dfe7,0,4.4,-21.8);addBox(scene,.25,9,44,0xd7dfe7,-17,4.4,0);addBox(scene,.25,9,44,0xd7dfe7,17,4.4,0);
for(let y=1;y<8;y+=1.5){addBox(scene,34,.05,.12,0x71849a,0,y,-21.62);addBox(scene,.12,.05,44,0x71849a,-16.82,y,0);addBox(scene,.12,.05,44,0x71849a,16.82,y,0)}
for(let z=-16;z<=16;z+=8){addBox(scene,34,.12,.18,0x404d5c,0,8.4,z);for(let x=-12;x<=12;x+=6){const lamp=new THREE.Mesh(new THREE.BoxGeometry(2.8,.12,.7),new THREE.MeshBasicMaterial({color:0xfff8dc}));lamp.position.set(x,8.1,z);scene.add(lamp)}}
}
function court(){
if(sport==='volleyball'){
addBox(scene,9,.04,18,0x2676ba,0,.02,0);const white=mat(0xffffff);
[[-4.5,0,4.5,0],[-4.5,-9,4.5,-9],[-4.5,9,4.5,9],[-4.5,-3,4.5,-3],[ -4.5,3,4.5,3]].forEach(a=>addLine(scene,a[0],.05,a[1],a[2],.05,a[3],0xffffff,.035));
addBox(scene,9,.1,.08,0x303944,0,2.43,0);for(let x=-4.7;x<=4.7;x+=.22)addLine(scene,x,2.12,0,x,2.43,0,0xdce4ec,.008);
[-4.7,4.7].forEach(x=>{addBox(scene,.12,2.7,.12,0xeeeeee,x,1.35,0);addBox(scene,.2,.65,.2,0xe34a48,x,2.2,0)});
}else{
addBox(scene,9,.04,12,0x2676ba,0,.02,0);addBox(scene,2.74,.13,1.525,0x1479c7,0,.78,0);
addBox(scene,2.8,.025,.025,0xffffff,0,.86,0);addBox(scene,.025,.025,1.55,0xffffff,0,.86,0);
addBox(scene,.035,.18,1.6,0xffffff,0,.96,0);for(let z=-.76;z<=.76;z+=.12)addLine(scene,-1.37,.88,z,1.37,.88,z,0xdde8f2,.006);
[-1.48,1.48].forEach(x=>addBox(scene,.06,.75,.06,0x454a50,x,.38,0));
}
}
function human(x,z,color,number){
const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
addBox(g,.48,.68,.28,color,0,1.2,0);const head=new THREE.Mesh(new THREE.SphereGeometry(.19,16,12),mat(0xd8a27d));head.position.y=1.68;g.add(head);
addBox(g,.16,.56,.16,0x253243,-.13,.58,.02);addBox(g,.16,.56,.16,0x253243,.13,.58,.02);
addBox(g,.13,.55,.14,color,-.34,1.2,0);addBox(g,.13,.55,.14,color,.34,1.2,0);
const badge=new THREE.Mesh(new THREE.PlaneGeometry(.22,.25),new THREE.MeshBasicMaterial({color:0xffffff}));badge.position.set(0,1.23,.146);g.add(badge);
g.userData.home={x,z};players.push(g);return g
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
const cvs=el('div','position:absolute;inset:0;');cvs.id='newSportCanvas';overlay.appendChild(cvs);
const top=el('div','position:absolute;left:0;right:0;top:env(safe-area-inset-top,8px);display:flex;justify-content:space-between;align-items:center;padding:10px 12px;gap:8px;pointer-events:none;');top.innerHTML='<div id="nsTitle" style="font-weight:800;text-shadow:0 2px 8px #000">SPORTS ARENA</div><div id="nsScore" style="font-size:22px;font-weight:900;background:#111b;padding:8px 14px;border-radius:12px;border:1px solid #ffffff55">0 - 0</div>';overlay.appendChild(top);
const msg=el('div','position:absolute;top:62px;left:50%;transform:translateX(-50%);background:#111b;padding:6px 12px;border-radius:9px;font-size:13px;white-space:nowrap;max-width:92%;text-align:center;');msg.id='nsMessage';overlay.appendChild(msg);
const controls=el('div','position:absolute;left:0;right:0;bottom:calc(env(safe-area-inset-bottom,8px) + 12px);display:flex;justify-content:center;gap:8px;flex-wrap:wrap;padding:0 10px;');
const button=(id,label)=>{const b=el('button','border:0;border-radius:12px;background:#ffd23f;color:#111;font-weight:800;padding:12px 14px;font-size:14px;min-width:74px;touch-action:manipulation;',label);b.id=id;controls.appendChild(b);return b};
if(sport==='volleyball'){
const serve=button('nsServe','サーブ');serve.onclick=doServe;
['normal','jump','floater','jumpfloater'].forEach((s,i)=>{const b=button('nsServe'+i,['通常','ジャンプ','フローター','ジャンプフローター'][i]);b.onclick=()=>{serveType=s;msg.textContent='サーブ：'+b.textContent+' を選択'}});
button('nsReceive','レシーブ').onclick=()=>hit('receive');button('nsSet','トス').onclick=()=>hit('set');button('nsSpike','スパイク').onclick=()=>hit('spike');button('nsBlock','ブロック').onclick=()=>hit('block');
}else{
button('nsServe','サーブ').onclick=doServe;button('nsHit','打ち返す').onclick=()=>hit('hit');button('nsSpin','強打').onclick=()=>hit('smash');
}
button('nsPause','一時停止').onclick=()=>{if(!active)return;active=false;msg.textContent='一時停止中';$('nsPause').textContent='再開';$('nsPause').onclick=()=>{active=true;clock.start();$('nsPause').textContent='一時停止';$('nsPause').onclick=()=>{active=false;msg.textContent='一時停止中';$('nsPause').textContent='再開'}}};
button('nsExit','メニューへ').onclick=close;
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
