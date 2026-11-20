'use strict';
const DEST=[
{id:'goa',n:'Goa',e:'🏖️',c:'Beach',nights:4,p:18000,g:['#ffb347','#ff5e7e'],t:'Sunset shacks, old Portuguese lanes and easy beach days.'},
{id:'manali',n:'Manali',e:'🏔️',c:'Mountain',nights:5,p:22000,g:['#74b9ff','#4834d4'],t:'Snow passes, pine valleys and cosy cafés on the Beas.'},
{id:'jaipur',n:'Jaipur',e:'🏯',c:'Culture',nights:4,p:16000,g:['#ff9a8b','#c0392b'],t:'Forts, bazaars and a palace stay in the Pink City.'},
{id:'kerala',n:'Kerala',e:'🛶',c:'Beach',nights:5,p:24000,g:['#55efc4','#00796b'],t:'Houseboat backwaters, tea hills and slow green mornings.'},
{id:'bali',n:'Bali',e:'🌺',c:'Beach',nights:6,p:52000,g:['#fdcb6e','#e17055'],t:'Rice terraces, temple sunrises and surf-side villas.'},
{id:'tokyo',n:'Tokyo',e:'🗼',c:'City',nights:7,p:95000,g:['#fd79a8','#6c5ce7'],t:'Neon crossings, sushi counters and quiet shrine gardens.'}];
const TIER=[
{id:'ess',n:'Essential',m:1,i:'3-star stay, breakfast, local transfers'},
{id:'com',n:'Comfort',m:1.35,i:'4-star stay, half-board, guided sightseeing'},
{id:'lux',n:'Luxe',m:1.85,i:'5-star stay, all meals, private cab and experiences'}];
const ADD=[
{id:'ins',n:'Travel insurance',p:900,pp:1},{id:'trf',n:'Airport transfers',p:2500,pp:0},
{id:'gui',n:'Private local guide',p:3500,pp:0},{id:'pho',n:'Photoshoot session',p:4000,pp:0}];
const CODES={WANDER10:.10,EARLY5:.05,FIRST15:.15};
const $=s=>document.querySelector(s),inr=n=>'₹'+Math.round(n).toLocaleString('en-IN');
const S={dest:'goa',tier:'com',a:2,c:0,add:new Set(),code:null,filter:'All',q:''};
const dest=()=>DEST.find(d=>d.id===S.dest);

/* ---------- catalogue ---------- */
function renderChips(){
  const cats=['All',...new Set(DEST.map(d=>d.c))];
  $('#chips').innerHTML=cats.map(c=>`<button class="chip" role="tab" aria-selected="${c===S.filter}" data-c="${c}">${c}</button>`).join('');
}
function renderGrid(){
  const q=S.q.toLowerCase();
  const list=DEST.filter(d=>(S.filter==='All'||d.c===S.filter)&&(d.n+d.c+d.t).toLowerCase().includes(q));
  $('#grid').innerHTML=list.map(d=>`<article class="card"><div class="pic" style="background:linear-gradient(135deg,${d.g[0]},${d.g[1]})">${d.e}</div>
  <div class="body"><div class="meta">${d.c} · ${d.nights} nights</div><h3>${d.n}</h3><p>${d.t}</p>
  <div class="foot"><div><b>${inr(d.p)}</b><small>per adult, Essential</small></div><button class="ghost" data-pick="${d.id}">Plan this trip</button></div></div></article>`).join('');
  $('#empty').hidden=list.length>0;
}
$('#chips').onclick=e=>{const b=e.target.closest('.chip');if(!b)return;S.filter=b.dataset.c;renderChips();renderGrid()};
$('#q').oninput=e=>{S.q=e.target.value.trim();renderGrid()};
$('#grid').onclick=e=>{const b=e.target.closest('[data-pick]');if(!b)return;S.dest=b.dataset.pick;syncForm();$('#book').scrollIntoView()};

/* ---------- form ---------- */
function buildForm(){
  $('#dest').innerHTML=DEST.map(d=>`<option value="${d.id}">${d.e} ${d.n} – ${d.nights} nights</option>`).join('');
  $('#tiers').innerHTML=TIER.map(t=>`<label class="tier"><input type="radio" name="tier" value="${t.id}"><b>${t.n}</b><small>${t.i}</small></label>`).join('');
  $('#addons').innerHTML=ADD.map(a=>`<label class="addon"><input type="checkbox" value="${a.id}"><span>${a.n}</span><span>${inr(a.p)} ${a.pp?'per person':'per trip'}</span></label>`).join('');
  const t=new Date();t.setDate(t.getDate()+7);$('#date').min=iso(new Date(Date.now()+864e5));$('#date').value=iso(t);
}
const iso=d=>d.toISOString().slice(0,10);
function syncForm(){
  $('#dest').value=S.dest;
  document.querySelector(`input[name=tier][value=${S.tier}]`).checked=true;
  $('#a').textContent=S.a;$('#c').textContent=S.c;render();
}
$('#dest').onchange=e=>{S.dest=e.target.value;render()};
$('#tiers').onchange=e=>{S.tier=e.target.value;render()};
$('#addons').onchange=e=>{e.target.checked?S.add.add(e.target.value):S.add.delete(e.target.value);render()};
document.querySelectorAll('.stepper button').forEach(b=>b.onclick=()=>{
  const k=b.dataset.k,v=S[k]+ +b.dataset.d,min=k==='a'?1:0,max=k==='a'?10:8;
  S[k]=Math.min(max,Math.max(min,v));$('#'+k).textContent=S[k];render();
});
$('#applyCoupon').onclick=()=>{
  const v=$('#coupon').value.trim().toUpperCase(),m=$('#couponMsg');
  if(CODES[v]){S.code=v;m.textContent=`Code ${v} applied: ${CODES[v]*100}% off the fare.`;m.style.color='var(--sea)'}
  else{S.code=null;m.textContent=v?'That code is not valid. Try WANDER10, EARLY5 or FIRST15.':'Enter a code first.';m.style.color='var(--bad)'}
  render();
};

/* ---------- cost calculation ---------- */
function calc(){
  const d=dest(),t=TIER.find(x=>x.id===S.tier),n=S.a+S.c,per=d.p*t.m;
  const adults=per*S.a,kids=per*.6*S.c,fare=adults+kids;
  const gRate=n>=8?.10:n>=4?.05:0,group=fare*gRate;
  const cRate=S.code?CODES[S.code]:0,promo=(fare-group)*cRate;
  const extras=ADD.filter(a=>S.add.has(a.id)).map(a=>({n:a.n,v:a.p*(a.pp?n:1)}));
  const exTotal=extras.reduce((s,x)=>s+x.v,0);
  const net=fare-group-promo+exTotal,gst=net*.05,total=net+gst;
  return{d,t,n,per,adults,kids,group,gRate,promo,cRate,extras,gst,total};
}
let shown=0;
function render(){
  const r=calc(),d=r.d;
  const L=(a,b,c='')=>`<div class="ln ${c}"><span>${a}</span><span>${b}</span></div>`;
  $('#pass').style.setProperty('--c1',d.g[0]);$('#pass').style.setProperty('--c2',d.g[1]);
  $('#pass').innerHTML=`<div class="pass-top"><small>${r.t.n} package · ${d.nights} nights</small><h3>${d.e} ${d.n}</h3><small>${r.n} traveller${r.n>1?'s':''} (${S.a} adult${S.a>1?'s':''}${S.c?`, ${S.c} child${S.c>1?'ren':''}`:''})</small></div>
  <div class="pass-mid">${L(`Adults × ${S.a}`,inr(r.adults))}${S.c?L(`Children × ${S.c} (60%)`,inr(r.kids)):''}
  ${r.extras.map(x=>L(x.n,inr(x.v))).join('')}
  ${r.group?L(`Group discount ${r.gRate*100}%`,'− '+inr(r.group),'off'):''}
  ${r.promo?L(`Code ${S.code}`,'− '+inr(r.promo),'off'):''}
  ${L('GST 5%',inr(r.gst))}</div>
  <div class="total"><div><small>Estimated total</small><br><small>${inr(r.total/r.n)} per person</small></div><b id="tot">${inr(shown)}</b></div><div class="bars"></div>`;
  tween(r.total);
}
function tween(to){
  const from=shown,t0=performance.now();
  const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
  (function f(t){const k=reduce?1:Math.min(1,(t-t0)/450);shown=from+(to-from)*(1-Math.pow(1-k,3));
    const el=$('#tot');if(el)el.textContent=inr(shown);if(k<1)requestAnimationFrame(f)})(t0);
}

/* ---------- validation + enquiries ---------- */
const V={
  name:v=>/^[A-Za-z][A-Za-z .'-]{2,}$/.test(v)?'':'Enter your full name (letters only, at least 3 characters).',
  email:v=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)?'':'Enter a valid email, like name@example.com.',
  phone:v=>/^[6-9]\d{9}$/.test(v)?'':'Enter a 10-digit mobile number starting with 6, 7, 8 or 9.',
  date:v=>!v?'Choose a departure date.':new Date(v)<=new Date()?'Departure must be a future date.':''
};
function check(k){const el=$('#'+k),m=V[k](el.value.trim());$('#e-'+k).textContent=m;el.classList.toggle('bad',!!m);return!m}
Object.keys(V).forEach(k=>$('#'+k).addEventListener('blur',()=>check(k)));
$('#phone').oninput=e=>e.target.value=e.target.value.replace(/\D/g,'');
const store={get(){try{return JSON.parse(localStorage.getItem('wanderly')||'[]')}catch(e){return mem}},
  set(v){mem=v;try{localStorage.setItem('wanderly',JSON.stringify(v))}catch(e){}}};
let mem=[];
$('#form').onsubmit=e=>{
  e.preventDefault();
  const ok=Object.keys(V).map(check).every(Boolean);
  if(!ok){document.querySelector('.bad')?.focus();return}
  const r=calc(),ref='WND-'+Math.random().toString(36).slice(2,8).toUpperCase();
  const rec={ref,name:$('#name').value.trim(),dest:r.d.n,tier:r.t.n,n:r.n,date:$('#date').value,total:Math.round(r.total)};
  store.set([rec,...store.get()]);renderList();
  $('#mt').textContent=`Thanks, ${rec.name.split(' ')[0]}!`;
  $('#mb').textContent=`Reference ${ref}\n${r.d.n}, ${r.t.n} package, ${r.n} traveller${r.n>1?'s':''}\nDeparting ${rec.date}\nEstimated total ${inr(rec.total)}\n\nWe will confirm by email at ${$('#email').value.trim()}.`;
  $('#modal').hidden=false;$('#close').focus();
};
$('#close').onclick=()=>{$('#modal').hidden=true;$('#form').reset();$('#date').value=iso(new Date(Date.now()+7*864e5));S.add.clear();S.code=null;$('#couponMsg').textContent='';S.a=2;S.c=0;syncForm();$('#catalogue').scrollIntoView()};
document.addEventListener('keydown',e=>{if(e.key==='Escape')$('#modal').hidden=true});
function renderList(){
  const l=store.get();
  $('#list').innerHTML=l.length?l.map(x=>`<div class="item"><b>${x.dest} · ${x.tier}</b><small>${x.ref} · ${x.n} traveller${x.n>1?'s':''} · ${x.date}</small><span>${inr(x.total)}</span><button data-del="${x.ref}">Delete enquiry</button></div>`).join(''):'<p class="empty">No enquiries yet. Build a package above and send one.</p>';
}
$('#list').onclick=e=>{const b=e.target.closest('[data-del]');if(b){store.set(store.get().filter(x=>x.ref!==b.dataset.del));renderList()}};

/* ---------- hero departure board ---------- */
let bi=0;
function flip(){
  const d=DEST[bi%DEST.length],el=$('#flap'),word=d.n.toUpperCase(),chars='ABCDEFGHIJKLMNOPQRSTUVWXYZ';let k=0;
  $('#flapPrice').textContent=`from ${inr(d.p)} per adult`;
  const iv=setInterval(()=>{k++;el.textContent=word.split('').map((c,i)=>i<k/2?c:chars[Math.floor(Math.random()*26)]).join('');if(k>=word.length*2){el.textContent=word;clearInterval(iv)}},45);
  bi++;
}
renderChips();renderGrid();buildForm();syncForm();renderList();flip();setInterval(flip,3200);
