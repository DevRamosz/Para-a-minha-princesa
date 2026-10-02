const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
document.body.classList.add('locked');

const cursor=$('#cursor');
window.addEventListener('mousemove',e=>{cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px'});

const canvas=$('#fxCanvas'),ctx=canvas.getContext('2d');
let particles=[],mx=innerWidth/2,my=innerHeight/2;
function resize(){canvas.width=innerWidth;canvas.height=innerHeight}
resize();addEventListener('resize',resize);
for(let i=0;i<65;i++)particles.push({x:Math.random()*innerWidth,y:Math.random()*innerHeight,vx:(Math.random()-.5)*.22,vy:(Math.random()-.5)*.22,r:Math.random()*1.2+.2});
addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY});
function draw(){
 ctx.clearRect(0,0,canvas.width,canvas.height);
 for(const p of particles){
  p.x+=p.vx;p.y+=p.vy;
  if(p.x<0||p.x>canvas.width)p.vx*=-1;
  if(p.y<0||p.y>canvas.height)p.vy*=-1;
  const dx=p.x-mx,dy=p.y-my,d=Math.hypot(dx,dy);
  if(d<140){p.x+=dx/d*.35;p.y+=dy/d*.35}
  ctx.fillStyle='rgba(255,255,255,.16)';ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();
 }
 requestAnimationFrame(draw)
}draw();

$('#lockIn').addEventListener('click',()=>{
 $('#boot').classList.add('closed');document.body.classList.remove('locked');
 setTimeout(()=>{$('#roundOverlay').classList.add('show');setTimeout(()=>$('#roundOverlay').classList.remove('show'),1600)},500)
});

addEventListener('scroll',()=>{
 const max=document.documentElement.scrollHeight-innerHeight;
 $('#scrollProgress').style.width=(scrollY/max*100)+'%';
 $('#hudRound').textContent=scrollY<innerHeight?'ROUND 01':scrollY<innerHeight*3?'ROUND 02':scrollY<innerHeight*5?'ROUND 03':'MATCH POINT';
});

const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.15});
$$('[data-reveal]').forEach(el=>io.observe(el));

$$('[data-tilt]').forEach(el=>{
 el.addEventListener('mousemove',e=>{
  const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
  el.style.transform=`perspective(900px) rotateY(${x*7}deg) rotateX(${-y*7}deg)`;
 });
 el.addEventListener('mouseleave',()=>el.style.transform='');
});

$$('.magnetic').forEach(el=>{
 el.addEventListener('mousemove',e=>{
  const r=el.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;
  el.style.transform=`translate(${x*.12}px,${y*.12}px)`;
 });
 el.addEventListener('mouseleave',()=>el.style.transform='');
});

$('#pingBtn').addEventListener('click',e=>{
 const p=$('#ping');p.style.left=e.clientX+'px';p.style.top=e.clientY+'px';p.classList.remove('show');void p.offsetWidth;p.classList.add('show')
});

const aim=$('#aimArea'),cross=$('#crosshairFollow');
aim.addEventListener('mousemove',e=>{const r=aim.getBoundingClientRect();cross.style.left=e.clientX-r.left+'px';cross.style.top=e.clientY-r.top+'px'});
let hits=0;
$$('.target').forEach(t=>t.addEventListener('click',()=>{
 if(t.classList.contains('hit'))return;
 t.classList.add('hit');hits++;$('#hitCount').textContent=hits;
 if(hits===5){setTimeout(()=>$('#aceCard').classList.add('show'),300);setTimeout(()=>{const a=$('#aceOverlay');a.classList.add('show');setTimeout(()=>a.classList.remove('show'),1700)},800)}
}));

let spike=45, spikeStarted=false;
const spikeObs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting&&!spikeStarted){spikeStarted=true;setInterval(()=>{if(spike>1)spike--;$('#spikeClock').textContent='00:'+String(spike).padStart(2,'0')},1000)}}),{threshold:.3});
spikeObs.observe($('.spike-console'));
let defStart=0,defRaf=null,defused=false;
function defLoop(){
 const pct=Math.min(100,(performance.now()-defStart)/22);
 $('#defuseFill').style.width=pct+'%';
 if(pct>=100){defused=true;$('#defuseStatus').textContent='STATUS // DEFUSED';$('#defuseBtn').textContent='SPIKE DEFUSED';const a=$('#aceOverlay');a.classList.add('show');setTimeout(()=>a.classList.remove('show'),1600);return}
 defRaf=requestAnimationFrame(defLoop)
}
function defBegin(){if(defused)return;defStart=performance.now();defRaf=requestAnimationFrame(defLoop)}
function defStop(){if(defused)return;cancelAnimationFrame(defRaf);$('#defuseFill').style.width='0%'}
$('#defuseBtn').addEventListener('mousedown',defBegin);$('#defuseBtn').addEventListener('mouseup',defStop);$('#defuseBtn').addEventListener('mouseleave',defStop);
$('#defuseBtn').addEventListener('touchstart',e=>{e.preventDefault();defBegin()},{passive:false});$('#defuseBtn').addEventListener('touchend',defStop);

$$('.drag-card').forEach(card=>{
 let dragging=false,ox=0,oy=0;
 function down(e){dragging=true;card.classList.add('dragging');const p=e.touches?e.touches[0]:e;const r=card.getBoundingClientRect();ox=p.clientX-r.left;oy=p.clientY-r.top}
 function move(e){if(!dragging)return;e.preventDefault();const p=e.touches?e.touches[0]:e,b=$('#memoryBoard').getBoundingClientRect();card.style.left=(p.clientX-b.left-ox)+'px';card.style.top=(p.clientY-b.top-oy)+'px';card.style.right='auto';card.style.bottom='auto'}
 function up(){dragging=false;card.classList.remove('dragging')}
 card.addEventListener('mousedown',down);addEventListener('mousemove',move);addEventListener('mouseup',up);
 card.addEventListener('touchstart',down,{passive:false});addEventListener('touchmove',move,{passive:false});addEventListener('touchend',up)
});

let page=0;const pages=$$('.page');
$('#openBook').addEventListener('click',()=>{$('#bookCover').classList.add('open');$('#bookPages').classList.add('show')});
function showPage(n){page=Math.max(0,Math.min(pages.length-1,n));pages.forEach((p,i)=>p.classList.toggle('active',i===page));$('#pageIndicator').textContent=String(page+1).padStart(2,'0')+' / 03'}
$('#nextPage').addEventListener('click',()=>showPage(page+1));$('#prevPage').addEventListener('click',()=>showPage(page-1));


let finalStart = 0;
let finalRaf = null;
let unlocked = false;
let holdingFinal = false;
const FINAL_HOLD_MS = 2200;

function renderFinalProgress() {
  if (!holdingFinal || unlocked) return;

  const elapsed = performance.now() - finalStart;
  const pct = Math.min(100, (elapsed / FINAL_HOLD_MS) * 100);

  $('#finalMeter').style.width = pct + '%';
  $('#meterLabel').textContent = Math.floor(pct) + '%';

  if (pct >= 100) {
    holdingFinal = false;
    unlocked = true;

    $('#finalMeter').style.width = '100%';
    $('#meterLabel').textContent = 'UNLOCKED';
    $('#finalHold').textContent = 'MENSAGEM LIBERADA';
    $('#letter').classList.add('show');

    const a = $('#aceOverlay');
    a.classList.add('show');
    setTimeout(() => a.classList.remove('show'), 1700);
    return;
  }

  finalRaf = requestAnimationFrame(renderFinalProgress);
}

function beginFinalHold(e) {
  if (unlocked) return;
  if (e && e.preventDefault) e.preventDefault();

  holdingFinal = true;
  finalStart = performance.now();
  cancelAnimationFrame(finalRaf);
  finalRaf = requestAnimationFrame(renderFinalProgress);

  if ($('#finalHold').setPointerCapture && e && e.pointerId !== undefined) {
    try {
      $('#finalHold').setPointerCapture(e.pointerId);
    } catch {}
  }
}

function cancelFinalHold() {
  if (unlocked || !holdingFinal) return;

  holdingFinal = false;
  cancelAnimationFrame(finalRaf);
  $('#finalMeter').style.width = '0%';
  $('#meterLabel').textContent = '0%';
}

const finalHoldButton = $('#finalHold');

if (window.PointerEvent) {
  finalHoldButton.addEventListener('pointerdown', beginFinalHold);
  finalHoldButton.addEventListener('pointerup', cancelFinalHold);
  finalHoldButton.addEventListener('pointercancel', cancelFinalHold);
  finalHoldButton.addEventListener('lostpointercapture', cancelFinalHold);
} else {
  finalHoldButton.addEventListener('mousedown', beginFinalHold);
  window.addEventListener('mouseup', cancelFinalHold);
  finalHoldButton.addEventListener('touchstart', beginFinalHold, { passive: false });
  finalHoldButton.addEventListener('touchend', cancelFinalHold);
  finalHoldButton.addEventListener('touchcancel', cancelFinalHold);
}

finalHoldButton.addEventListener('contextmenu', e => e.preventDefault());
finalHoldButton.addEventListener('dragstart', e => e.preventDefault());


setInterval(()=>{
 const arr=$$('.section-head h2,.hero h1'),el=arr[Math.floor(Math.random()*arr.length)];
 if(el)el.animate([{transform:'translateX(0)'},{transform:'translateX(2px)'},{transform:'translateX(-2px)'},{transform:'translateX(0)'}],{duration:160,easing:'steps(2,end)'})
},4200);
