(function(){
'use strict';
const $ = id => document.getElementById(id);
const MODELS = window.Sports3DModels;
if (!MODELS) return;
let root=null, renderer=null, scene=null, camera=null, gym=null, sportGroup=null, frame=0;
let active=false, paused=false, sport='volleyball', format='singles', practice=false;
let players=[], userPlayer=null, ball=null, ballMesh=null, score=[0,0], serveTeam=0, serveType=0, serveStage=0;
let gameState='setup', lastTime=0, pointWait=0, cpuHitWait=0, lastBallZ=0, lastBounceSide=null, sameSideBounces=0, lastHitter=0, hitCooldown=0;
let keys={}, move={x:0,z:0}, aimX=0, drift=0, scoreTarget=11, touchHold=null;
const SERVES=[
 {name:'通常サーブ',vy:5.0,vz:9.5,drift:0},
 {name:'ジャンプサーブ',vy:4.5,vz:13.0,drift:0},
 {name:'フローターサーブ',vy:4.9,vz:10.5,drift:1.15},
 {name:'ジャンプフローター',vy:5.4,vz:12.2,drift:1.65}
];
function addStyle(){
 const st=document.createElement('style');st.id='sportsExtraStyles';st.textContent=
 '#sportsExtraRoot{position:fixed;inset:0;z-index:10000;background:#08111d;color:#f7fbff;font-family:system-ui,"Hiragino Sans","Yu Gothic",sans-serif;overflow:hidden}'+
 '#sportsExtraRoot *{box-sizing:border-box}#sportsExtraRoot .seCanvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none}'+
 '#sportsExtraRoot .seShade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(3,10,22,.62),transparent 28%,transparent 66%,rgba(3,10,22,.65));pointer-events:none}'+
 '#sportsExtraRoot .sePanel{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(92vw,480px);max-height:88dvh;overflow:auto;padding:22px;border:1px solid rgba(255,255,255,.22);border-radius:22px;background:linear-gradient(145deg,rgba(14,31,52,.96),rgba(7,15,28,.94));box-shadow:0 24px 70px #0009;text-align:center;backdrop-filter:blur(14px)}'+
 '#sportsExtraRoot h2{font-size:clamp(23px,4vw,32px);margin:4px 0 8px}#sportsExtraRoot p{color:#d6e4f2;line-height:1.6;font-size:14px}'+
 '#sportsExtraRoot .seBtn{display:block;width:100%;margin:9px 0;padding:13px 15px;border:1px solid #ffffff20;border-radius:13px;background:linear-gradient(135deg,#f8fbff,#dcecff);color:#102238;font-weight:800;font-size:16px;cursor:pointer;touch-action:manipulation}'+
 '#sportsExtraRoot .seBtn.secondary{background:#24384f;color:#f4f8fc}#sportsExtraRoot .seBtn.selected{outline:3px solid #55c9ff;background:#e7f9ff}'+
 '#sportsExtraRoot .seTop{position:absolute;left:12px;right:12px;top:calc(env(safe-area-inset-top,0px) + 10px);display:flex;align-items:flex-start;justify-content:space-between;gap:10px;pointer-events:none}'+
 '#sportsExtraRoot .seGlass{pointer-events:auto;border:1px solid #ffffff35;background:rgba(5,14,28,.76);backdrop-filter:blur(12px);border-radius:14px;padding:9px 13px;box-shadow:0 8px 24px #0004}'+
 '#sportsExtraRoot #seScore{font-size:clamp(17px,3vw,24px);font-weight:900;letter-spacing:.02em}#sportsExtraRoot #seStatus{font-size:12px;color:#cfe5f8;margin-top:3px}'+
 '#sportsExtraRoot .seBottom{position:absolute;left:10px;right:10px;bottom:calc(env(safe-area-inset-bottom,0px) + 10px);display:flex;align-items:flex-end;justify-content:space-between;gap:10px;pointer-events:none}'+
 '#sportsExtraRoot .seControls{pointer-events:auto;display:flex;gap:7px;flex-wrap:wrap;align-items:flex-end}'+
 '#sportsExtraRoot .seControls .seBtn{width:auto;min-width:64px;margin:0;padding:12px 13px;font-size:13px;background:rgba(7,20,38,.86);border-color:#ffffff38;color:white;backdrop-filter:blur(12px)}'+
 '#sportsExtraRoot .seControls .seBtn.selected{background:#c8f2ff;color:#0b2134;outline:2px solid #4fc3f7}'+
 '#sportsExtraRoot .seMove{display:grid;grid-template-columns:repeat(3,44px);grid-template-rows:repeat(2,40px);gap:4px;pointer-events:auto}'+
 '#sportsExtraRoot .seMove button{border:1px solid #ffffff44;border-radius:10px;background:#071426d9;color:#fff;font-size:17px;font-weight:800;touch-action:none}'+
 '#sportsExtraRoot .seMove button[data-move="up"]{grid-column:2}#sportsExtraRoot .seMove button[data-move="left"]{grid-column:1;grid-row:2}#sportsExtraRoot .seMove button[data-move="down"]{grid-column:2;grid-row:2}#sportsExtraRoot .seMove button[data-move="right"]{grid-column:3;grid-row:2}'+
 '#sportsExtraRoot .seHit{pointer-events:auto;min-width:94px;padding:17px 20px;border:1px solid #fff8;border-radius:18px;background:linear-gradient(135deg,#ffd86b,#ff9f43);color:#1d2330;font-weight:1000;font-size:17px;box-shadow:0 8px 24px #0005;touch-action:manipulation}'+
 '#sportsExtraRoot .seServeRow{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0}#sportsExtraRoot .seServeRow .seBtn{flex:1;min-width:42%;font-size:13px;padding:10px 6px;margin:0}'+
 '#sportsExtraRoot .seHint{font-size:12px!important;opacity:.88;margin:8px 0 0}#sportsExtraRoot .seHidden{display:none!important}'+
 '@media(max-width:640px){#sportsExtraRoot .sePanel{padding:16px;width:min(94vw,440px)}#sportsExtraRoot .seTop{left:7px;right:7px;top:calc(env(safe-area-inset-top,0px) + 6px)}#sportsExtraRoot .seBottom{left:7px;right:7px;bottom:calc(env(safe-area-inset-bottom,0px) + 6px)}#sportsExtraRoot .seMove{grid-template-columns:repeat(3,36px);grid-template-rows:repeat(2,34px)}#sportsExtraRoot .seControls .seBtn{padding:9px 8px;font-size:11px}#sportsExtraRoot .seHit{padding:14px 16px;font-size:15px;min-width:76px}}';
 document.head.appendChild(st);
}
function makeRoot(){
 addStyle();root=document.createElement('div');root.id='sportsExtraRoot';
 root.innerHTML='<div class="seShade"></div><div class="seTop"><div class="seGlass"><div id="seScore">🏐 0 - 0</div><div id="seStatus">試合準備中</div></div><button class="seBtn secondary" id="seExit" style="width:auto;margin:0;pointer-events:auto">← 競技選択へ</button></div><div class="seBottom seHidden" id="seGameControls"><div class="seMove"><button data-move="up" aria-label="前へ">▲</button><button data-move="left" aria-label="左へ">◀</button><button data-move="down" aria-label="後ろへ">▼</button><button data-move="right" aria-label="右へ">▶</button></div><div class="seControls" id="seServeControls"></div><button class="seHit" id="seHit">サーブ / 打球</button></div><div class="sePanel" id="seSetup"></div><div class="sePanel seHidden" id="sePause"><h2>⏸ ポーズ</h2><p>試合を一時停止しています。</p><button class="seBtn" id="seResume">試合に戻る</button><button class="seBtn secondary" id="seQuit">試合を終了</button></div><div class="sePanel seHidden" id="seResult"><h2 id="seResultTitle">試合終了</h2><p id="seResultText"></p><button class="seBtn" id="seAgain">もう一度</button><button class="seBtn secondary" id="seResultExit">競技選択へ戻る</button></div>';
 document.body.appendChild(root);
 root.querySelector('#seExit').onclick=closeGame;
 root.querySelector('#seResume').onclick=()=>{paused=false;root.querySelector('#sePause').classList.add('seHidden');lastTime=performance.now()};
 root.querySelector('#seQuit').onclick=closeGame;
 root.querySelector('#seResultExit').onclick=closeGame;
 root.querySelector('#seAgain').onclick=()=>{root.querySelector('#seResult').classList.add('seHidden');startGame(sport,format,practice)};
 root.querySelector('#seHit').addEventListener('pointerdown',e=>{e.preventDefault();if(active&&!paused)hitAction()});
 root.querySelectorAll('[data-move]').forEach(b=>{
  const dir=b.dataset.move,down=e=>{e.preventDefault();touchHold=dir;setMove(dir,true)},up=e=>{e.preventDefault();if(touchHold===dir)touchHold=null;setMove(dir,false)};
  b.addEventListener('pointerdown',down);b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('lostpointercapture',up);
 });
 const canvas=document.createElement('canvas');canvas.className='seCanvas';root.prepend(canvas);
 renderer=new THREE.WebGLRenderer({canvas:canvas,antialias:true,alpha:false});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
 scene=new THREE.Scene();scene.background=new THREE.Color(0x9baec2);scene.fog=new THREE.Fog(0x9baec2,30,75);
 camera=new THREE.PerspectiveCamera(48,innerWidth/innerHeight,.1,120);
 scene.add(new THREE.HemisphereLight(0xf1f7ff,0x716b5c,1.05));
 const key=new THREE.DirectionalLight(0xfff1d4,1.65);key.position.set(-8,18,10);key.castShadow=true;key.shadow.mapSize.set(1536,1536);key.shadow.camera.left=-18;key.shadow.camera.right=18;key.shadow.camera.top=22;key.shadow.camera.bottom=-22;scene.add(key);
 const fill=new THREE.DirectionalLight(0xc4e4ff,.5);fill.position.set(10,8,-12);scene.add(fill);
 try{gym=MODELS.gymModel();if(gym.children[0])gym.children[0].rotation=new THREE.Euler(-Math.PI/2,0,0);scene.add(gym)}catch(e){gym=new THREE.Group();scene.add(gym);console.warn('体育館モデルを読み込めませんでした',e)}
 active=true;window.addEventListener('resize',resize);window.addEventListener('keydown',onKeyDown);window.addEventListener('keyup',onKeyUp);
 tick(performance.now());
}
function resize(){if(!renderer||!camera)return;renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()}
function openSport(which){
 sport=which;format=which==='tabletennis'?'singles':'3v3';practice=false;
 const menu=$('menu');if(menu)menu.hidden=true;
 const original=document.querySelector('body > canvas');if(original){original.dataset.seHidden='1';original.style.display='none'}
 if(!root)makeRoot();else root.classList.remove('seHidden');
 root.querySelector('#sePause').classList.add('seHidden');root.querySelector('#seResult').classList.add('seHidden');root.querySelector('#seGameControls').classList.add('seHidden');
 showSetup();
}
function showSetup(){
 const panel=root.querySelector('#seSetup');panel.classList.remove('seHidden');
 root.querySelector('#seGameControls').classList.add('seHidden');
 root.querySelector('#seStatus').textContent='競技と試合形式を選択';
 if(sport==='volleyball'){
  panel.innerHTML='<h2>🏐 バレーボール</h2><p>3対3・体育館コート<br>サーブ、レシーブ、トス、スパイクでラリーを続けよう。</p><button class="seBtn" id="seStart">▶ 3対3の試合を開始</button><button class="seBtn secondary" id="sePractice">🎯 練習モード</button><p class="seHint">操作：WASD / 矢印で移動、Spaceでサーブ・打球。サーブ種類は試合中に選択できます。</p>';
  panel.querySelector('#seStart').onclick=()=>startGame('volleyball','3v3',false);panel.querySelector('#sePractice').onclick=()=>startGame('volleyball','3v3',true);
 }else{
  panel.innerHTML='<h2>🏓 卓球</h2><p>体育館の卓球台で対戦。試合は11点先取・2点差です。</p><div class="seServeRow"><button class="seBtn selected" data-format="singles">👤 シングルス（1対1）</button><button class="seBtn" data-format="doubles">👥 ダブルス（2対2）</button></div><button class="seBtn" id="seStart">▶ 試合を開始</button><button class="seBtn secondary" id="sePractice">🎯 練習モード</button><p class="seHint">操作：WASD / 矢印で左右・前後移動、Spaceでサーブ・打球。</p>';
  panel.querySelectorAll('[data-format]').forEach(b=>b.onclick=()=>{format=b.dataset.format;panel.querySelectorAll('[data-format]').forEach(q=>q.classList.toggle('selected',q===b))});
  panel.querySelector('#seStart').onclick=()=>startGame('tabletennis',format,false);panel.querySelector('#sePractice').onclick=()=>startGame('tabletennis',format,true);
 }
}
function removeGroup(g){if(!g)return;scene.remove(g);g.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());else o.material.dispose()}})}
function startGame(which,fmt,isPractice){
 sport=which;format=fmt;practice=isPractice;score=[0,0];serveTeam=0;serveType=0;serveStage=0;gameState='serve';pointWait=0;cpuHitWait=0;lastBounceSide=null;sameSideBounces=0;lastHitter=0;hitCooldown=0;paused=false;keys={};move={x:0,z:0};players=[];
 root.querySelector('#seSetup').classList.add('seHidden');root.querySelector('#sePause').classList.add('seHidden');root.querySelector('#seResult').classList.add('seHidden');root.querySelector('#seGameControls').classList.remove('seHidden');
 if(sportGroup)removeGroup(sportGroup);sportGroup=new THREE.Group();scene.add(sportGroup);
 if(which==='volleyball')buildVolleyball();else buildTableTennis();
 makeBall();setCamera();updateScore();buildActionButtons();lastTime=performance.now();
}
function makePlayer(team,x,z,num,scale,role){
 const p=MODELS.human(team===0?0x178ce0:0xf05a58,num,team===0?0xe0ac84:0xc68a62);p.scale.setScalar(scale||1);p.position.set(x,0,z);if(team===1)p.rotation.y=Math.PI;p.userData.team=team;p.userData.homeX=x;p.userData.homeZ=z;p.userData.role=role||'cpu';p.userData.swing=0;
 try{p.pose(MODELS.POSES[ sport==='tabletennis'?'卓球の構え':'立ち'])}catch(e){}
 sportGroup.add(p);players.push(p);return p;
}
function buildVolleyball(){
 const court=MODELS.volleyCourt();court.position.y=.012;sportGroup.add(court);
 players=[];userPlayer=makePlayer(0,0,-5.1,7,1,'user');makePlayer(0,-2.7,-6.7,8,1,'ally');makePlayer(0,2.7,-7.5,9,1,'ally');
 makePlayer(1,-2.7,5.1,10,1,'cpu');makePlayer(1,0,6.7,11,1,'cpu');makePlayer(1,2.7,7.5,12,1,'cpu');
 camera.position.set(0,7.6,16.5);camera.lookAt(0,1.1,0);
}
function buildTableTennis(){
 const table=MODELS.ttTable();table.position.y=.015;sportGroup.add(table);
 players=[];const scale=.78;userPlayer=makePlayer(0,0,-1.9,7,scale,'user');
 if(format==='doubles')makePlayer(0,-.55,-2.5,8,scale,'ally');
 makePlayer(1,0,1.9,10,scale,'cpu');if(format==='doubles')makePlayer(1,.55,2.5,11,scale,'cpu');
 camera.position.set(3.5,3.4,5.8);camera.lookAt(0,.75,0);
}
function makeBall(){
 if(ballMesh&&sportGroup)sportGroup.remove(ballMesh);
 const radius=sport==='volleyball'?.115:.021;
 const mat=new THREE.MeshStandardMaterial({color:sport==='volleyball'?0xf5f3df:0xfff5dd,roughness:.48,emissive:sport==='volleyball'?0x111108:0x111111});
 ballMesh=new THREE.Mesh(new THREE.SphereGeometry(radius,24,18),mat);ballMesh.castShadow=true;sportGroup.add(ballMesh);
 ball={pos:new THREE.Vector3(),vel:new THREE.Vector3(),spin:0};resetBall();
}
function resetBall(){
 if(!ball)return;
 if(sport==='volleyball'){
  if(serveTeam===0){ball.pos.set(userPlayer.position.x,2.15,-8.15)}else{ball.pos.set(0,2.15,8.15)}
  ball.vel.set(0,0,0);gameState='serve';serveStage=0;lastBallZ=ball.pos.z;
 }else{
  const z=serveTeam===0?-1.02:1.02;ball.pos.set(0,1.24,z);ball.vel.set(0,0,0);gameState='serve';serveStage=0;lastBounceSide=null;sameSideBounces=0;lastBallZ=z;
 }
 ballMesh.position.copy(ball.pos);ballMesh.visible=true;cpuHitWait=0;
}
function setCamera(){
 if(sport==='volleyball'){camera.position.set(0,7.6,16.5);camera.lookAt(0,1.2,0);camera.fov=50}
 else{camera.position.set(3.5,3.4,5.8);camera.lookAt(0,.72,0);camera.fov=47}
 camera.updateProjectionMatrix();
}
function buildActionButtons(){
 const box=root.querySelector('#seServeControls');box.innerHTML='';
 if(sport==='volleyball'){
  SERVES.forEach((sv,i)=>{const b=document.createElement('button');b.className='seBtn'+(i===serveType?' selected':'');b.textContent=sv.name;b.onclick=()=>{serveType=i;buildActionButtons();root.querySelector('#seStatus').textContent='サーブ：'+sv.name};box.appendChild(b)});
 }else{
  const b=document.createElement('button');b.className='seBtn';b.textContent='サーブ';b.onclick=()=>{if(gameState==='serve')hitAction()};box.appendChild(b);
 }
}
function setMove(dir,on){
 if(dir==='left')move.x=on?-1:0;if(dir==='right')move.x=on?1:0;if(dir==='up')move.z=on?-1:0;if(dir==='down')move.z=on?1:0;
}
function onKeyDown(e){
 if(!root||root.classList.contains('seHidden'))return;
 if(e.code==='Escape'){e.preventDefault();if(!root.querySelector('#seResult').classList.contains('seHidden'))return;if(!root.querySelector('#seSetup').classList.contains('seHidden')){closeGame();return}togglePause();return}
 if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();
 keys[e.code]=true;
 if(e.repeat)return;
 if(e.code==='Space'||e.code==='Enter')hitAction();
 if(sport==='volleyball'&&e.code>='Digit1'&&e.code<='Digit4'){serveType=Number(e.code.slice(-1))-1;buildActionButtons()}
}
function onKeyUp(e){keys[e.code]=false}
function togglePause(){if(!active||!root.querySelector('#seSetup').classList.contains('seHidden')===false)return;paused=!paused;root.querySelector('#sePause').classList.toggle('seHidden',!paused);if(!paused)lastTime=performance.now()}
function hitAction(){
 if(!active||paused||!userPlayer||!ball||!root.querySelector('#seSetup').classList.contains('seHidden')===false)return;
 if(gameState==='serve'){
  if(serveTeam!==0)return;
  if(sport==='volleyball'){
   const sv=SERVES[serveType];ball.vel.set(aimX*1.3,sv.vy,sv.vz);ball.spin=sv.drift;serveStage=1;gameState='rally';lastHitter=0;root.querySelector('#seStatus').textContent='サーブ！ '+sv.name;
   userPlayer.position.z=-7.5;
  }else{
   ball.vel.set(aimX*1.2,2.8,.65);serveStage=1;lastHitter=0;lastBounceSide=null;sameSideBounces=0;gameState='rally';root.querySelector('#seStatus').textContent='サーブ！';
  }
  return;
 }
 if(gameState!=='rally'||hitCooldown>0)return;
 if(sport==='volleyball'){
  const d=ball.pos.distanceTo(new THREE.Vector3(userPlayer.position.x,userPlayer.position.y+1.2,userPlayer.position.z));
  if(ball.pos.z<-.1&&d<2.45&&ball.pos.y<3.45&&ball.pos.y>.25&&ball.vel.z<1.5){
   ball.vel.set((aimX||((Math.random()-.5)*.7))*2.8,5.5,10.1);ball.spin=0;lastHitter=0;hitCooldown=.3;lastBounceSide=null;userPlayer.userData.swing=.3;
   try{userPlayer.pose(MODELS.POSES['スパイク'])}catch(e){}root.querySelector('#seStatus').textContent='スパイク！';
  }else{root.querySelector('#seStatus').textContent='ボールに近づいて打球してください';}
 }else{
  const d=Math.hypot(ball.pos.x-userPlayer.position.x,ball.pos.z-userPlayer.position.z);
  if(ball.pos.z<-.22&&ball.vel.z<0&&d<1.35&&ball.pos.y<1.75&&ball.pos.y>.72){
   ball.vel.set(aimX*2.3,2.0,5.1);lastHitter=0;hitCooldown=.22;lastBounceSide=null;sameSideBounces=0;userPlayer.userData.swing=.22;
   try{userPlayer.pose(MODELS.POSES['卓球の構え'])}catch(e){}root.querySelector('#seStatus').textContent='リターン！';
  }else{root.querySelector('#seStatus').textContent='ボールに近づいて打球してください';}
 }
}
function updatePlayerMovement(dt){
 const x=(keys.KeyA||keys.ArrowLeft?-1:0)+(keys.KeyD||keys.ArrowRight?1:0)+move.x;
 const z=(keys.KeyW||keys.ArrowUp?-1:0)+(keys.KeyS||keys.ArrowDown?1:0)+move.z;
 if(userPlayer){
  const speed=sport==='volleyball'?4.7:2.9;
  userPlayer.position.x=clamp(userPlayer.position.x+x*speed*dt,sport==='volleyball'?-4.0:-.68,sport==='volleyball'?4.0:.68);
  userPlayer.position.z=clamp(userPlayer.position.z+z*speed*dt,sport==='volleyball'?-8.6:-2.65,sport==='volleyball'?-0.6:-.4);
  if(Math.abs(x)+Math.abs(z)>.1){userPlayer.rotation.y=Math.atan2(x,-z);if(sport==='volleyball'&&ball&&ball.pos.z<0&&ball.pos.y>1.4&&ball.pos.z<userPlayer.position.z+.7)userPlayer.rotation.y=0}
 }
}
function updateVolleyball(dt){
 if(gameState==='serve'){
  if(serveTeam===1){pointWait-=dt;if(pointWait<=0){const sv=SERVES[Math.floor(Math.random()*SERVES.length)];ball.vel.set((Math.random()-.5)*1.5,sv.vy, -sv.vz);ball.spin=sv.drift;gameState='rally';serveStage=1;lastHitter=1;root.querySelector('#seStatus').textContent='相手のサーブ！'}}
  return;
 }
 ball.vel.y-=9.81*dt;ball.pos.addScaledVector(ball.vel,dt);
 if(ball.spin){ball.vel.x+=Math.sin(performance.now()/130)*ball.spin*dt;ball.vel.z+=Math.cos(performance.now()/170)*ball.spin*.12*dt}
 if((lastBallZ<0&&ball.pos.z>=0)||(lastBallZ>0&&ball.pos.z<=0)){
  if(ball.pos.y<2.47){point(ball.pos.z>0?1:0,'ネットにかかりました');return}
 }
 lastBallZ=ball.pos.z;
 if(ball.pos.z>0&&ball.vel.z>0&&ball.pos.y<3.15&&ball.pos.y>.25){
  const cpu=players.filter(p=>p.userData.team===1).sort((a,b)=>Math.hypot(a.position.x-ball.pos.x,a.position.z-ball.pos.z)-Math.hypot(b.position.x-ball.pos.x,b.position.z-ball.pos.z))[0];
  if(cpu){cpu.position.x+=cl(ball.pos.x-cpu.position.x,-1.8,1.8)*Math.min(1,dt*3);cpu.position.z=Math.min(8.2,Math.max(2.1,cpu.position.z-dt*2.4));const d=Math.hypot(cpu.position.x-ball.pos.x,cpu.position.z-ball.pos.z);if(d<1.3&&cpuHitWait<=0){cpuHitWait=.55;ball.vel.set((Math.random()-.5)*3.4,5.0,-9.6);lastHitter=1;hitCooldown=.12;try{cpu.pose(MODELS.POSES['トス'])}catch(e){}}}
 }
 players.filter(p=>p.userData.team===0&&p!==userPlayer).forEach((p,i)=>{if(ball.pos.z<-.1){p.position.x+=cl(ball.pos.x-p.position.x,-1.5,1.5)*Math.min(1,dt*2);p.position.z=Math.max(-8,Math.min(-2.2,p.position.z+dt*(i===0?1:-.6))) }});
 if(ball.pos.y<=.12){point(ball.pos.z>0?0:1,ball.pos.z>0?'相手コートに落ちました':'自陣コートに落ちました');return}
 if(Math.abs(ball.pos.x)>5||Math.abs(ball.pos.z)>10||ball.pos.y>13){point(ball.pos.z>0?0:1,'アウト');return}
}
function updateTableTennis(dt){
 if(gameState==='serve'){
  if(serveTeam===1){pointWait-=dt;if(pointWait<=0){ball.pos.set(0,1.24,1.02);ball.vel.set((Math.random()-.5)*.35,2.8,-.65);serveStage=1;gameState='rally';lastHitter=1;lastBounceSide=null;sameSideBounces=0;root.querySelector('#seStatus').textContent='相手のサーブ！'}}
  return;
 }
 ball.vel.y-=9.81*dt;ball.pos.addScaledVector(ball.vel,dt);
 const onTable=Math.abs(ball.pos.x)<=.7625&&Math.abs(ball.pos.z)<=1.37;
 if(ball.pos.y<=.78&&ball.vel.y<0&&onTable){
  ball.pos.y=.78;
  const side=ball.pos.z<0?0:1;
  if(serveStage===1&&side===serveTeam){
   serveStage=2;ball.vel.y=2.15;ball.vel.z=serveTeam===0?4.65:-4.65;ball.vel.x*=.8;lastBounceSide=side;sameSideBounces=1;
  }else if(lastBounceSide===side){
   point(side===0?1:0,'2バウンド');return;
  }else{
   lastBounceSide=side;sameSideBounces=1;ball.vel.y=Math.abs(ball.vel.y)*.78;
   if(side===1&&ball.vel.z>0){ball.vel.z=-Math.max(3.7,Math.abs(ball.vel.z));}
   else if(side===0&&ball.vel.z<0){ball.vel.z=Math.max(3.7,Math.abs(ball.vel.z));}
  }
 }
 if(ball.pos.z>.25&&ball.vel.z>0&&ball.pos.y<1.65&&ball.pos.y>.76&&gameState==='rally'&&lastHitter===0){
  const cpu=players.filter(p=>p.userData.team===1).sort((a,b)=>Math.abs(a.position.x-ball.pos.x)-Math.abs(b.position.x-ball.pos.x))[0];
  if(cpu&&Math.abs(cpu.position.x-ball.pos.x)<.82&&cpuHitWait<=0){
   cpuHitWait=.18;ball.vel.set(clamp(ball.pos.x*.9,-1.5,1.5),2.15,-5.0);lastHitter=1;lastBounceSide=null;sameSideBounces=0;try{cpu.pose(MODELS.POSES['卓球の構え'])}catch(e){}
  }
 }
 players.filter(p=>p.userData.team===1).forEach(p=>{p.position.x+=clamp(ball.pos.x-p.position.x,-.5,.5)*Math.min(1,dt*4);p.position.z=Math.max(1.45,Math.min(2.55,p.position.z))});
 if(ball.pos.y<.72&&!onTable){point(ball.pos.z<0?1:0,'台に入りませんでした');return}
 if(Math.abs(ball.pos.x)>.9||Math.abs(ball.pos.z)>2.8||ball.pos.y>5){point(ball.pos.z<0?1:0,'アウト');return}
}
function point(winner,reason){
 if(practice){resetBall();root.querySelector('#seStatus').textContent='ラリー終了：'+reason+'。もう一度プレイできます';return}
 score[winner]++;updateScore();gameState='point';pointWait=1.1;serveTeam=winner;
 const won=sport==='volleyball'?(score[winner]>=25&&score[winner]-score[1-winner]>=2):(score[winner]>=11&&score[winner]-score[1-winner]>=2);
 if(won){gameState='finished';root.querySelector('#seResultTitle').textContent=winner===0?'🏆 あなたの勝利！':'試合終了';root.querySelector('#seResultText').textContent=(sport==='volleyball'?'バレーボール 3対3':'卓球 '+(format==='doubles'?'ダブルス':'シングルス'))+'　最終スコア '+score[0]+' - '+score[1];root.querySelector('#seResult').classList.remove('seHidden');return}
 root.querySelector('#seStatus').textContent=(winner===0?'あなたの得点！':'相手の得点')+' · '+reason;
 pointWait=1.0;
}
function updateScore(){
 root.querySelector('#seScore').textContent=(sport==='volleyball'?'🏐 ':'🏓 ')+score[0]+' - '+score[1]+(practice?'　練習':'');
 root.querySelector('#seStatus').textContent=sport==='volleyball'?'3対3・25点先取':'卓球・'+(format==='doubles'?'ダブルス':'シングルス')+'・11点先取';
}
function updateGame(dt){
 if(!active||paused)return;
 if(gameState==='finished')return;
 hitCooldown=Math.max(0,hitCooldown-dt);cpuHitWait=Math.max(0,cpuHitWait-dt);
 if(gameState==='point'){pointWait-=dt;if(pointWait<=0)resetBall();return}
 updatePlayerMovement(dt);
 if(sport==='volleyball')updateVolleyball(dt);else updateTableTennis(dt);
 if(ballMesh&&ball)ballMesh.position.copy(ball.pos);
 players.forEach(p=>{if(p.userData.swing>0){p.userData.swing-=dt;if(p.userData.swing<=0){try{p.pose(MODELS.POSES[sport==='tabletennis'?'卓球の構え':'立ち'])}catch(e){}}}});
 if(userPlayer&&sport==='volleyball'&&gameState==='rally'&&ball.pos.z<-.4&&ball.pos.z>userPlayer.position.z-1.8&&Math.hypot(ball.pos.x-userPlayer.position.x,ball.pos.z-userPlayer.position.z)<1.7)root.querySelector('#seStatus').textContent='ボールが近い！ Space / 打球';
 if(userPlayer&&sport==='tabletennis'&&gameState==='rally'&&ball.pos.z<-.3&&ball.vel.z<0&&Math.hypot(ball.pos.x-userPlayer.position.x,ball.pos.z-userPlayer.position.z)<1.25)root.querySelector('#seStatus').textContent='リターンのチャンス！ Space / 打球';
}
function tick(now){
 if(!active)return;frame=requestAnimationFrame(tick);
 const dt=Math.min(.035,Math.max(0,(now-lastTime)/1000||0));lastTime=now;
 if(!paused)updateGame(dt);
 if(renderer&&scene&&camera)renderer.render(scene,camera);
}
function togglePause(){if(!active||gameState==='finished'||!root.querySelector('#seSetup').classList.contains('seHidden')===false)return;paused=!paused;root.querySelector('#sePause').classList.toggle('seHidden',!paused);if(!paused)lastTime=performance.now()}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function closeGame(){
 active=false;paused=false;if(frame)cancelAnimationFrame(frame);window.removeEventListener('resize',resize);window.removeEventListener('keydown',onKeyDown);window.removeEventListener('keyup',onKeyUp);
 if(root){root.remove();root=null}if(renderer){renderer.dispose();renderer=null}scene=null;camera=null;gym=null;sportGroup=null;players=[];ball=null;ballMesh=null;
 const original=document.querySelector('body > canvas[data-se-hidden="1"]');if(original){original.style.display='';delete original.dataset.seHidden}
 const menu=$('menu');if(menu){menu.hidden=false;$('homeActions').hidden=true;$('playPanel').hidden=false;$('formatMenu').hidden=true;$('modeMenu').hidden=true}
 const st=$('sportsExtraStyles');if(st)st.remove();
}
document.querySelectorAll('[data-extra-sport]').forEach(b=>b.addEventListener('click',()=>openSport(b.dataset.extraSport)));
})();