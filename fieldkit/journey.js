/* FieldKit trip-first workflow. Stock, home storage and trip packing stay distinct. */
'use strict';
let journeyPackingView='collect';
function journeyValidateRows(raw,kind){
 if(raw===undefined)return [];
 if(!Array.isArray(raw)||raw.length>1000)throw Error('Invalid trip follow-up');
 const ids=new Set();return raw.map(r=>{
  if(!r||typeof r.inventoryId!=='string'||!r.inventoryId||r.inventoryId.length>200||ids.has(r.inventoryId)||!Number.isInteger(r.quantity)||r.quantity<1||r.quantity>999)throw Error('Invalid trip follow-up item');ids.add(r.inventoryId);
  const base={inventoryId:r.inventoryId,quantity:r.quantity,name:planText(r.name,200)};
  if(kind==='return'){if(!Number.isInteger(r.returned)||r.returned<0||r.returned>r.quantity)throw Error('Invalid returned quantity');return {...base,returned:r.returned,place:planText(r.place,100),spot:planText(r.spot,120)}}
  if(!Number.isInteger(r.targetStock)||r.targetStock<1||r.targetStock>999)throw Error('Invalid refill target');return {...base,targetStock:r.targetStock,resolved:!!r.resolved};
 });
}
function journeyReserved(id,except){return tripPlans.filter(p=>p.id!==except).reduce((sum,p)=>sum+(p.state==='ended'?(p.returnItems||[]).filter(r=>r.inventoryId===id).reduce((n,r)=>n+r.quantity-r.returned,0):p.items.filter(r=>r.inventoryId===id).reduce((n,r)=>n+r.packed,0)),0)}
function journeyAvailable(p,id){const i=items.find(x=>x.id===id&&!x.archived);return Math.max(0,planInt(i?.qty)-journeyReserved(id,p?.id))}
function journeyReturns(p){return (p.returnItems||[]).filter(r=>r.returned<r.quantity)}
function journeySettleRefills(){
 tripPlans=tripPlans.map(p=>{let changed=false;const consumed=(p.consumed||[]).map(r=>{const i=items.find(i=>i.id===r.inventoryId&&!i.archived);if(!r.resolved&&i&&i.qty>=r.targetStock){changed=true;return {...r,resolved:true}}return r});return changed?{...p,consumed}:p});
}
function journeyRefillNeeds(){
 const needs=new Map();for(const p of tripPlans)for(const r of p.consumed||[]){const i=items.find(i=>i.id===r.inventoryId&&!i.archived);if(r.resolved||!i||i.qty>=r.targetStock)continue;const old=needs.get(i.id);if(!old||old.target<r.targetStock)needs.set(i.id,{item:i,target:r.targetStock,trip:p.name})}
 return [...needs.values()];
}
function journeyStats(p){const rows=p.items||[],pending=r=>Math.max(0,r.quantity-r.packed);return {total:rows.reduce((n,r)=>n+r.quantity,0),packed:rows.reduce((n,r)=>n+r.packed,0),collect:rows.filter(r=>!r.departureDay).reduce((n,r)=>n+pending(r),0),day:rows.filter(r=>r.departureDay).reduce((n,r)=>n+pending(r),0),missing:p.missing.reduce((n,r)=>n+r.quantity,0),returns:journeyReturns(p).reduce((n,r)=>n+r.quantity-r.returned,0)}}
function journeyPrimary(){let id='';try{id=localStorage.getItem('fieldkit_active_trip_v1')||''}catch{}return tripPlans.find(p=>p.id===id&&!p.hidden&&p.state!=='ended')||orderedPlans().find(p=>!p.hidden&&p.state!=='ended')||orderedPlans().find(p=>!p.hidden&&journeyReturns(p).length)||null}
function journeyRemember(id){try{localStorage.setItem('fieldkit_active_trip_v1',id)}catch{}}
function journeyRenderHome(){
 const p=journeyPrimary();if(!p){$('homeNext').innerHTML='<div class="journey-empty"><span class="journey-symbol" aria-hidden="true">'+glyph('pack')+'</span><h3>Where are you headed?</h3><p>Plan an outing. Add only the gear you need.</p></div>'}else {
  const n=journeyStats(p),ended=p.state==='ended',label=ended?'Back from your trip':n.collect?'Next: collect your gear':n.day?'Next: departure-day items':n.missing?'Next: missing supplies':n.total?'Packing complete':'Next: add owned gear';
  $('homeNext').innerHTML=`<article class="next-trip"><div class="eyebrow muted">${label}</div><h3>${esc(p.name)}</h3><div class="next-trip-progress">${ring({packed:ended?(p.returnItems||[]).reduce((n,r)=>n+r.returned,0):n.packed,total:ended?(p.returnItems||[]).reduce((n,r)=>n+r.quantity,0):n.total},'big',ended?glyph('restore'):`<b>${n.packed}</b><small>of ${n.total}</small>`)}<div><p>${esc(p.spec.destination)} · ${p.spec.days} days · ${p.spec.people} people</p><div class="journey-counts">${ended?`<span>${n.returns} to return</span>`:`<span>${n.collect} to collect</span><span>${n.day} before leaving</span><span>${n.missing} missing</span>`}</div></div></div><button type="button" class="btn wide" data-journey-plan="${esc(p.id)}">${ended?'Return gear':n.collect?'Continue packing':n.day?'Departure checklist':n.missing?'Review missing supplies':'Open trip'}</button></article>`;
 }
 $('homeReturns').innerHTML=orderedPlans().filter(t=>!t.hidden&&t.id!==p?.id&&journeyReturns(t).length).map(t=>`<button type="button" class="journey-link-row" data-journey-plan="${esc(t.id)}"><span>${glyph('restore')}</span><span><b>Return gear</b><small>${esc(t.name)}</small></span><b>${journeyStats(t).returns}</b><span aria-hidden="true">›</span></button>`).join('');
}
function journeyCollectionKey(r){const i=items.find(i=>i.id===r.inventoryId);return journeyPackingView==='bag'?(r.person+' · '+r.bag):((ZONES[i?.place]?.name||'Storage not recorded')+(i?.spot?' · '+i.spot:''))}
function journeyRenderPacking(p,rows){
 if(p.state==='ended')return '';
 const pending=[],day=[],packed=[];p.items.forEach((r,n)=>{const entry={r,html:rows[n]};if(r.packed>=r.quantity)packed.push(entry);else if(r.departureDay)day.push(entry);else pending.push(entry)});
 const groups=new Map();for(const entry of pending){const key=journeyCollectionKey(entry.r);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(entry)}
 const section=(title,entries,extra='')=>`<section class="packing-section ${extra}"><div class="list-heading"><h3>${esc(title)} <span>${entries.reduce((n,e)=>n+Math.max(0,e.r.quantity-e.r.packed),0)||entries.length}</span></h3></div><div class="inventory-group">${entries.map(e=>e.html).join('')}</div></section>`;
 return [...groups].map(([key,entries])=>section((journeyPackingView==='bag'?'Pack into ':'Get from ')+key,entries)).join('')+(day.length?section('Before leaving',day,'departure-section'):'')+(packed.length?section('Packed',packed):'')+(!p.items.length?'<div class="empty-state">'+glyph('box')+'<strong>Add the gear you own.</strong>Missing supplies stay separate below.</div>':'');
}
function journeyRenderTrip(p){
 const ended=p.state==='ended';$('plannerWeights').classList.toggle('hidden',ended||journeyPackingView!=='bag');$('plannerMissingSection').classList.toggle('hidden',ended);$('plannerPackingHead').classList.toggle('hidden',ended);$('plannerPacks').classList.toggle('hidden',ended);$('plannerReturn').classList.toggle('hidden',!ended);
 document.querySelectorAll('[data-trip-view]').forEach(b=>{b.classList.toggle('active',b.dataset.tripView===journeyPackingView);b.setAttribute('aria-pressed',String(b.dataset.tripView===journeyPackingView))});
 if(!ended){$('plannerReturn').innerHTML='';return}
 const rows=p.returnItems||[],total=rows.reduce((n,r)=>n+r.quantity,0),done=rows.reduce((n,r)=>n+r.returned,0);$('plannerSummary').innerHTML='<div class="trip-progress">'+ring({packed:done,total},'big',glyph('restore'))+'<div><b>Trip finished</b><p>'+esc(p.spec.destination)+'</p><small>'+(total?done+' / '+total+' returned to storage':'Kept for your next trip')+'</small></div></div>';
 $('plannerReturn').innerHTML=`<div class="list-heading"><h3>Return to storage <span>${journeyStats(p).returns}</span></h3></div>`+(rows.length?'<div class="inventory-group">'+rows.map(r=>`<div class="return-row"><button type="button" class="move-handle" data-return-trip="${esc(p.id)}" data-return-item="${esc(r.inventoryId)}" aria-pressed="${r.returned===r.quantity}" data-status="${r.returned===r.quantity?'packed':'unpacked'}" aria-label="${r.returned===r.quantity?'Undo return of':'Returned'} ${esc(r.name)}"><span class="dot" aria-hidden="true"></span></button><span><b>${esc(r.name||'Gear')}</b><small>${esc(ZONES[r.place]?.name||'Home storage')}${r.spot?' · '+esc(r.spot):''}</small></span><span class="return-qty">${r.returned}/${r.quantity}</span></div>`).join('')+'</div>':'<p class="hint">No return checklist was recorded for this trip.</p>')+((p.consumed||[]).length?'<button type="button" class="journey-link-row" data-journey-refill><span>'+glyph('restore')+'</span><span><b>Refill used supplies</b><small>Stock changes only when you add supplies.</small></span><span aria-hidden="true">›</span></button>':'');
}
function journeySetReturned(tripId,id){const p=tripPlans.find(p=>p.id===tripId&&p.state==='ended'),r=p?.returnItems?.find(r=>r.inventoryId===id);if(!r)return false;const owned=items.find(i=>i.id===id&&!i.archived);if(r.returned===r.quantity&&journeyReserved(id,p.id)+r.quantity>planInt(owned?.qty)){toast('This gear is now assigned elsewhere. Unpack it there before undoing its return.');return false}return entityCommit(()=>{r.returned=r.returned===r.quantity?0:r.quantity},r.returned===r.quantity?'Return undone':'Returned to storage')}
function journeyRestock(id,target){const i=items.find(i=>i.id===id&&!i.archived);if(!i)return false;target=planInt(target,1);if(i.qty>=target){toast('Already refilled');return false}return changeQty(id,target-i.qty)}
function journeyMissingOwned(p,m){const candidates=planEligible(p.spec).filter(i=>i.id===m.inventoryId||i.name.toLowerCase()===m.name.toLowerCase()).sort((a,b)=>Number(b.id===m.inventoryId)-Number(a.id===m.inventoryId));for(const i of candidates){const planned=p.items.find(r=>r.inventoryId===i.id)?.quantity||0,quantity=Math.min(m.quantity,Math.max(0,journeyAvailable(p,i.id)-planned));if(quantity)return {item:i,quantity}}return null}
function journeyUseOwned(n){const p=planCurrent(),m=p?.missing[n];if(!p||p.state==='ended'||!m)return false;const owned=journeyMissingOwned(p,m);if(!owned)return false;return entityCommit(()=>{const r=p.items.find(r=>r.inventoryId===owned.item.id);if(r){r.quantity+=owned.quantity;r.locked=true}else p.items.push({inventoryId:owned.item.id,quantity:owned.quantity,packed:0,reason:m.reason,person:'Shared',bag:/fuel|propane|butane/i.test(owned.item.name)?'Outdoor fuel storage':'Day bag',consumable:/snack|meal|food|water servings|trash bag/i.test(owned.item.name),departureDay:owned.item.status==='day',locked:true});m.quantity-=owned.quantity;if(!m.quantity)p.missing.splice(n,1)},'Added owned gear to the trip · stock unchanged')}
function journeyRenderRefill(){
 const needs=journeyRefillNeeds(),missing=orderedPlans().filter(p=>p.state!=='ended'&&!p.hidden&&p.missing.length),empty=activeItems().filter(i=>!i.qty&&!needs.some(n=>n.item.id===i.id));
 const button=(i,target,meta)=>`<div class="refill-row"><span><b>${esc(i.name)}</b><small>${esc(meta)} · ${i.qty} owned</small></span><button type="button" class="btn outline small" data-refill-item="${esc(i.id)}" data-refill-target="${target}" aria-label="Add ${target-i.qty} ${esc(i.name)} to owned stock">＋ ${target-i.qty}</button></div>`;
 $('refillContent').innerHTML=(needs.length?'<div class="list-heading"><h3>Used on trips <span>'+needs.length+'</span></h3></div><div class="inventory-group">'+needs.map(n=>button(n.item,n.target,n.trip)).join('')+'</div>':'')+missing.map(p=>'<section class="packing-section"><div class="list-heading"><h3>'+esc(p.name)+'</h3></div><div class="inventory-group">'+p.missing.map((m,n)=>`<button type="button" class="journey-link-row" data-missing-trip="${esc(p.id)}" data-missing-index="${n}"><span class="missing-plus" aria-hidden="true">＋</span><span><b>${esc(m.name)}</b><small>${journeyMissingOwned(p,m)?'Use '+journeyMissingOwned(p,m).quantity+' already owned':esc(m.reason)+' · Add when you have it'}</small></span><b>×${m.quantity}</b><span aria-hidden="true">›</span></button>`).join('')+'</div></section>').join('')+(empty.length?'<details class="empty-refills"><summary>Empty gear <span>'+empty.length+'</span></summary><div class="inventory-group">'+empty.map(i=>button(i,Math.max(1,planInt(i.lastNonzeroQty)),ZONES[i.place]?.name||'Storage')).join('')+'</div></details>':'')+(!needs.length&&!missing.length&&!empty.length?'<div class="empty-state">'+glyph('check')+'<strong>Nothing to refill.</strong>Used supplies and trip shortfalls appear here.</div>':'')+'<p class="hint refill-footnote">Tap ＋ only after adding that many to your supplies.</p>';
 const count=needs.length+missing.reduce((n,p)=>n+p.missing.length,0);$('refillBadge').textContent=count;$('refillBadge').classList.toggle('hidden',!count);
}
function initJourney(){
 $('homeAdd').onclick=()=>quickOpen();
 document.addEventListener('click',e=>{
  const b=e.target.closest?.('[data-journey-plan],[data-journey-gear],[data-journey-refill],[data-trip-view],[data-return-trip],[data-refill-item],[data-missing-trip]');if(!b)return;const d=b.dataset;
  if(d.journeyPlan){plannerOpen(d.journeyPlan);return}
  if(d.journeyGear!==undefined){tabShow('inventory');return}
  if(d.journeyRefill!==undefined){plannerClose();tabShow('refill');return}
  if(d.tripView){journeyPackingView=d.tripView;plannerRender();return}
  if(d.returnTrip){journeySetReturned(d.returnTrip,d.returnItem);return}
  if(d.refillItem){journeyRestock(d.refillItem,Number(d.refillTarget));return}
  if(d.missingTrip){plannerOpen(d.missingTrip);planAcquire(Number(d.missingIndex))}
 });
 journeyRenderHome();journeyRenderRefill();
}
