import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

// SPLAT WALL v1.1 — sequential show queue + animated throw routine.
const host=document.getElementById("scene");
const scene=new THREE.Scene(); scene.background=new THREE.Color(0x292b2e); scene.fog=new THREE.Fog(0x292b2e,15,30);
const camera=new THREE.PerspectiveCamera(36,1,.1,100); camera.position.set(0,4.6,15.2); camera.lookAt(0,2.5,-1.1);
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5)); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.12;
renderer.domElement.id="gameCanvas"; host.prepend(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xdce8ff,0x45403a,2.1));
const key=new THREE.DirectionalLight(0xffe8cf,3.3); key.position.set(-4,9,7); key.castShadow=true; key.shadow.mapSize.set(1024,1024); scene.add(key);
const fill=new THREE.PointLight(0x8aa8ff,15,22); fill.position.set(5,4,3); scene.add(fill);
const mat=(c,r=.8)=>new THREE.MeshStandardMaterial({color:c,roughness:r});
const floor=new THREE.Mesh(new THREE.PlaneGeometry(40,30),mat(0x292b2d)); floor.rotation.x=-Math.PI/2; floor.position.set(0,-.03,-3); floor.receiveShadow=true; scene.add(floor);

// Wall canvas is persistent; every viewer gets a separate tag slot.
const wall=new THREE.Mesh(new THREE.BoxGeometry(13.2,6.3,.35),mat(0x66676a)); wall.position.set(0,3.15,-3); wall.receiveShadow=true; scene.add(wall);
const canvas=document.createElement("canvas"); canvas.width=1400; canvas.height=670; const ctx=canvas.getContext("2d");
function resetWall(){
 const g=ctx.createLinearGradient(0,0,0,670); g.addColorStop(0,"#77797a"); g.addColorStop(1,"#4c4e50"); ctx.fillStyle=g; ctx.fillRect(0,0,1400,670);
 for(let i=0;i<6500;i++){const v=Math.random()*55;ctx.fillStyle="rgba("+v+","+v+","+v+",.11)";ctx.fillRect(Math.random()*1400,Math.random()*670,Math.random()*3+1,Math.random()*3+1);}
 // subtle panel guides, not visible enough to distract
 ctx.strokeStyle="rgba(255,255,255,.055)";ctx.lineWidth=2;
 for(let i=1;i<4;i++){ctx.beginPath();ctx.moveTo(i*350,24);ctx.lineTo(i*350,646);ctx.stroke();}
}
resetWall();
const wallTex=new THREE.CanvasTexture(canvas); wallTex.colorSpace=THREE.SRGBColorSpace;
const wallArt=new THREE.Mesh(new THREE.PlaneGeometry(13.05,6.15),new THREE.MeshBasicMaterial({map:wallTex}));
wallArt.position.set(0,3.15,-2.815); scene.add(wallArt);

// Character assembled from light geometry with animated shoulder/elbow/hip pivots.
const actor=new THREE.Group(); actor.position.set(-4.8,0,1.15); actor.scale.setScalar(1.22); scene.add(actor);
const skin=mat(0xc98e68), hoodie=mat(0xe5e7df), dark=mat(0x242831), shoe=mat(0x15171b), lime=mat(0xd5ff43), canMat=mat(0xff4f8b,.35);
function box(parent,w,h,d,m,x,y,z){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function ball(parent,r,m,x,y,z,sx=1,sy=1,sz=1){const o=new THREE.Mesh(new THREE.SphereGeometry(r,16,12),m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;parent.add(o);return o;}
const torso=new THREE.Group(); torso.position.y=1.35; actor.add(torso);
box(torso,.82,1.05,.48,hoodie,0,.28,0); box(torso,.86,.15,.5,lime,0,-.25,0);
ball(torso,.34,skin,0,1.12,.02,1,.98,.9); ball(torso,.38,dark,0,1.36,-.01,1,.48,1);
box(torso,.74,.12,.63,dark,0,1.27,.05); box(torso,.25,.1,.08,lime,0,1.2,.36);
ball(torso,.05,dark,-.12,1.12,.31); ball(torso,.05,dark,.12,1.12,.31);
// arms pivot at shoulder, right arm carries a paint bomb.
const leftArm=new THREE.Group();leftArm.position.set(-.48,.62,0);torso.add(leftArm);
box(leftArm,.24,.72,.26,hoodie,0,-.34,0);ball(leftArm,.13,skin,0,-.73,.03);
const rightArm=new THREE.Group();rightArm.position.set(.48,.62,0);torso.add(rightArm);
box(rightArm,.25,.72,.27,hoodie,0,-.34,0);ball(rightArm,.13,skin,0,-.73,.04);
const paintCan=new THREE.Mesh(new THREE.CylinderGeometry(.15,.15,.38,16),canMat);paintCan.rotation.z=Math.PI/2;paintCan.position.set(.18,-.68,.19);paintCan.castShadow=true;rightArm.add(paintCan);
// legs pivot at hips
const leftLeg=new THREE.Group();leftLeg.position.set(-.22,.98,0);actor.add(leftLeg);
box(leftLeg,.28,.75,.3,dark,0,-.36,0);box(leftLeg,.37,.18,.52,shoe,0,-.78,.09);
const rightLeg=new THREE.Group();rightLeg.position.set(.22,.98,0);actor.add(rightLeg);
box(rightLeg,.28,.75,.3,dark,0,-.36,0);box(rightLeg,.37,.18,.52,shoe,0,-.78,.09);

// Queue and round state
const palette=["#ff4f8b","#d5ff43","#55c8ff","#ff9d45","#a987ff","#f4f1e8"];
let selectedColor=palette[0],selectedStyle="block",likes=0,round=1,slotIndex=0,processing=false;
const queue=[],scores=new Map(),projectiles=[];
const queueCount=document.getElementById("queueCount");
const currentViewer=document.getElementById("currentViewer");
const queueList=document.getElementById("queueList");
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function renderQueue(){
 if(queueCount)queueCount.textContent=String(queue.length);
 if(queueList)queueList.innerHTML=queue.slice(0,4).map((q,i)=>'<div class="queue-person"><span>'+(i+1)+'</span><b>'+esc(q.name)+'</b><small>'+esc(q.kindLabel)+'</small></div>').join("")||'<div class="queue-empty">No viewers waiting. Drop your name in chat!</div>';
}
function renderScores(){
 const rows=[...scores.entries()].sort((a,b)=>b[1]-a[1]).slice(0,4),el=document.getElementById("leaderboardRows");
 el.innerHTML=rows.map(([n,s],i)=>'<div class="artist"><span class="rank">0'+(i+1)+'</span><b>'+esc(n)+'</b><span class="score">'+s+' PTS</span></div>').join("")||'<div class="empty-state">Your name could be up here.</div>';
}
const swatches=document.getElementById("palette");
palette.forEach((c,i)=>{const b=document.createElement("button");b.className="swatch"+(!i?" selected":"");b.style.background=c;b.title=c;b.onclick=()=>{selectedColor=c;document.querySelectorAll(".swatch").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");};swatches.append(b);});
document.querySelectorAll(".style-chip").forEach(b=>b.onclick=()=>{document.querySelectorAll(".style-chip").forEach(x=>x.classList.remove("active"));b.classList.add("active");selectedStyle=b.dataset.style;});

function drawTag(name,color,kind,slot,mega){
 const safe=String(name||"GUEST").toUpperCase().replace(/[^\p{L}\p{N} _.-]/gu,"").slice(0,14)||"GUEST";
 const col=slot%4,row=Math.floor(slot/4)%2,cx=175+col*350,cy=170+row*330;
 // Paint splash behind the typography
 for(let i=0;i<(mega?110:66);i++){
  const a=Math.random()*Math.PI*2,d=Math.pow(Math.random(),.68)*(mega?135:98),r=3+Math.random()*(mega?14:10);
  ctx.beginPath();ctx.ellipse(cx+Math.cos(a)*d,cy+Math.sin(a)*d*.57,r,r*.72,a,0,Math.PI*2);
  ctx.fillStyle=color;ctx.globalAlpha=.32+Math.random()*.55;ctx.fill();
 }
 ctx.globalAlpha=1;ctx.save();ctx.translate(cx,cy);ctx.textAlign="center";ctx.textBaseline="middle";
 const fontSize=safe.length>10?66:safe.length>7?78:92;
 ctx.font="900 "+fontSize+"px 'Barlow Condensed',Impact,sans-serif";
 const scale=Math.min(1,300/Math.max(1,ctx.measureText(safe).width));ctx.scale(scale,1);
 ctx.lineJoin="round";ctx.lineWidth=kind==="bubble"?22:18;ctx.strokeStyle="#171719";ctx.strokeText(safe,0,0);
 ctx.lineWidth=8;ctx.strokeStyle="#f4f0e8";ctx.strokeText(safe,0,0);
 ctx.fillStyle=color;ctx.fillText(safe,0,0);
 // little paint drips under letters
 ctx.fillStyle=color;for(let i=0;i<Math.min(8,safe.length);i++){const x=(i-(Math.min(8,safe.length)-1)/2)*18;ctx.beginPath();ctx.ellipse(x,fontSize*.48+Math.random()*13,3,7,0,0,Math.PI*2);ctx.fill();}
 ctx.restore();wallTex.needsUpdate=true;
}
function updateStatus(text){document.getElementById("statusText").textContent=text;}
function showImpact(name){const el=document.getElementById("impactLabel");el.textContent=name+"!";el.classList.remove("show");void el.offsetWidth;el.classList.add("show");document.getElementById("tickerText").textContent=name+" JUST LEFT THEIR MARK ON THE WALL!";}
function sleep(ms){return new Promise(resolve=>setTimeout(resolve,ms));}
function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;}
function tween(ms,fn){return new Promise(resolve=>{const start=performance.now();function step(now){const t=Math.min(1,(now-start)/ms);fn(ease(t),t);if(t<1)requestAnimationFrame(step);else resolve();}requestAnimationFrame(step);});}
function spawnProjectile(item){
 return new Promise(resolve=>{
  const ballMesh=new THREE.Mesh(new THREE.SphereGeometry(item.mega?.25:.17,16,12),new THREE.MeshStandardMaterial({color:item.color,roughness:.28,emissive:item.color,emissiveIntensity:.18}));
  ballMesh.position.set(actor.position.x+.85,2.1,actor.position.z+.2);ballMesh.castShadow=true;scene.add(ballMesh);
  const start=performance.now(),duration=item.mega?1250:1050,targetX=-4.65+(slotIndex%4)*3.1,targetY=Math.floor(slotIndex/4)%2===0?4.55:1.75;
  projectiles.push({mesh:ballMesh,start,duration,item,targetX,targetY,resolve});
 });
}
async function performTurn(item){
 processing=true;currentViewer.textContent=item.name;updateStatus("NEXT UP: "+item.name);document.getElementById("tickerText").textContent=item.name+" — GET READY!";
 // Character walks into throwing position
 await tween(520,(v)=>{actor.position.x=-4.8+v*.65;leftLeg.rotation.x=Math.sin(v*Math.PI)*.65;rightLeg.rotation.x=-Math.sin(v*Math.PI)*.65;torso.rotation.y=-.08*v;});
 leftLeg.rotation.x=0;rightLeg.rotation.x=0;
 // Anticipation: bend body and pull throwing arm back
 updateStatus("AIMING...");
 await tween(430,(v)=>{torso.rotation.x=.12*v;rightArm.rotation.x=-1.05*v;rightArm.rotation.z=-.28*v;leftArm.rotation.x=-.25*v;});
 // Throw: arm snaps forward and body follows
 updateStatus("THROWING "+item.name+"!");
 const flight=spawnProjectile(item);
 await tween(230,(v)=>{rightArm.rotation.x=-1.05+1.9*v;rightArm.rotation.z=-.28+.4*v;torso.rotation.x=.12-.25*v;actor.rotation.y=.12*v;});
 await flight;
 // Recover and show the mark
 await tween(260,(v)=>{rightArm.rotation.x=.85*(1-v);rightArm.rotation.z=.12*(1-v);leftArm.rotation.x=-.25*(1-v);torso.rotation.x=-.13*(1-v);actor.rotation.y=.12*(1-v);});
 if(slotIndex>=8){resetWall();slotIndex=0;round++;document.getElementById("round").textContent=String(round).padStart(2,"0");wallTex.needsUpdate=true;}
 drawTag(item.name,item.color,item.style,slotIndex++,item.mega);wallTex.needsUpdate=true;showImpact(item.name);
 scores.set(item.name,(scores.get(item.name)||0)+(item.mega?10:1));renderScores();
 await sleep(420);
 // Return to start, ready for the next viewer
 await tween(420,(v)=>{actor.position.x=-4.15-v*.65;leftLeg.rotation.x=-Math.sin(v*Math.PI)*.45;rightLeg.rotation.x=Math.sin(v*Math.PI)*.45;});
 leftLeg.rotation.x=0;rightLeg.rotation.x=0;torso.rotation.set(0,0,0);rightArm.rotation.set(0,0,0);leftArm.rotation.set(0,0,0);actor.rotation.set(0,0,0);
 currentViewer.textContent="WAITING";updateStatus("READY FOR NEXT VIEWER");
}
async function processQueue(){
 if(processing)return;processing=true;
 while(queue.length){
  const item=queue.shift();renderQueue();
  try{await performTurn(item);}catch(err){console.error("Turn failed",err);updateStatus("READY TO SPLAT");}
 }
 processing=false;currentViewer.textContent="WAITING";updateStatus("READY TO SPLAT");renderQueue();
}
function enqueue(name,color=selectedColor,style=selectedStyle,mega=false,kindLabel="NAME REQUEST"){
 const clean=String(name||"GUEST").trim().replace(/^@/,"").replace(/[^\p{L}\p{N}_. -]/gu,"").slice(0,14).toUpperCase()||"GUEST";
 if(queue.length>=40){document.getElementById("tickerText").textContent="QUEUE IS FULL — PLEASE TRY AGAIN SOON.";return;}
 queue.push({name:clean,color,style,mega,kindLabel});renderQueue();
 document.getElementById("tickerText").textContent=clean+" JOINED THE THROWING QUEUE · "+queue.length+" WAITING";
 processQueue();
}
function handleEvent(e){
 if(!e)return;const user=String(e.username||"GUEST").toUpperCase();
 if(e.type==="comment"){const requested=String(e.message||"").trim();if(requested)enqueue(requested,selectedColor,selectedStyle,false,"COMMENT");}
 else if(e.type==="like"){likes++;if(likes%12===0)enqueue(user,palette[likes/12%palette.length],"block",false,"LIKE BONUS");}
 else if(e.type==="follow")enqueue(user,palette[Math.floor(Math.random()*palette.length)],"block",false,"FOLLOW BONUS");
 else if(e.type==="gift")enqueue(user,selectedColor,selectedStyle,(Number(e.coins)||0)>=10||!e.coins,"GIFT");
}
document.getElementById("tagForm").addEventListener("submit",e=>{e.preventDefault();const v=document.getElementById("nameInput").value.trim();if(v)enqueue(v);});
document.getElementById("likeBtn").onclick=()=>handleEvent({type:"like",username:"LIVE_VIEWER"});
document.getElementById("followBtn").onclick=()=>handleEvent({type:"follow",username:"NEW_FOLLOWER"});
document.getElementById("giftBtn").onclick=()=>handleEvent({type:"gift",username:"TOP_GIFTER",coins:99});
document.getElementById("clearBtn").onclick=()=>{
 queue.length=0;renderQueue();resetWall();wallTex.needsUpdate=true;scores.clear();slotIndex=0;renderScores();
 document.getElementById("round").textContent=String(++round).padStart(2,"0");document.getElementById("tickerText").textContent="FRESH WALL. WHO'S MAKING THE NEXT MASTERPIECE?";
};
if(window.io){const socket=io();socket.on("connect",()=>document.getElementById("connection").textContent="CONNECTED");socket.on("disconnect",()=>document.getElementById("connection").textContent="LOCAL");socket.on("game:event",handleEvent);}
function resize(){const w=host.clientWidth,h=host.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);}
new ResizeObserver(resize).observe(host);resize();
function animate(now){
 requestAnimationFrame(animate);
 for(let i=projectiles.length-1;i>=0;i--){
  const p=projectiles[i],t=Math.min(1,(now-p.start)/p.duration),x=-3.9+(p.targetX+3.9)*t,y=2.05+(p.targetY-2.05)*t+Math.sin(t*Math.PI)*2.1,z=1.2-4.0*t;
  p.mesh.position.set(x,y,z);p.mesh.rotation.x+=.16;p.mesh.rotation.z+=.12;p.mesh.scale.setScalar(1+t*.2);
  if(t>=1){scene.remove(p.mesh);p.mesh.geometry.dispose();p.mesh.material.dispose();projectiles.splice(i,1);p.resolve();}
 }
 // breathing idle when no throwing action
 if(!processing){torso.position.y=1.35+Math.sin(now*.002)*.025;rightArm.rotation.z=Math.sin(now*.0015)*.025;leftArm.rotation.z=-Math.sin(now*.0015)*.025;}
 renderer.render(scene,camera);
}
requestAnimationFrame(animate);
