/* FieldKit trip-first workflow. Stock, home storage and trip packing stay distinct. */
'use strict';
let journeyPackingView='collect',journeySelecting=false,journeyRemainingOnly=false;
const journeySelected=new Set();
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
 const p=journeyPrimary();if(!p){$('homeNext').innerHTML='<div class="journey-empty"><span class="journey-symbol" aria-hidden="true">'+glyph('pack')+'</span><h3>Where are you headed?</h3><p>A checklist that remembers what you own, where it lives, and what still needs packing.</p></div>'}else {
  const n=journeyStats(p),ended=p.state==='ended',label=ended?'Back from your trip':n.collect?'Next: collect your gear':n.day?'Next: departure-day items':n.missing?'Next: missing supplies':n.total?'Packing complete':'Next: add owned gear';
  $('homeNext').innerHTML=`<article class="next-trip"><div class="eyebrow muted">${label}</div><h3>${esc(p.name)}</h3><div class="next-trip-progress">${ring({packed:ended?(p.returnItems||[]).reduce((n,r)=>n+r.returned,0):n.packed,total:ended?(p.returnItems||[]).reduce((n,r)=>n+r.quantity,0):n.total+n.missing},'big',ended?glyph('restore'):`<b>${n.packed}</b><small>of ${n.total+n.missing}</small>`)}<div><p>${esc(p.spec.destination)} · ${p.spec.days} days · ${p.spec.people} people</p><div class="journey-counts">${ended?`<span>${n.returns} to return</span>`:`<span>${n.collect} to collect</span><span>${n.day} before leaving</span><span>${n.missing} missing</span>`}</div></div></div><button type="button" class="btn wide" data-journey-plan="${esc(p.id)}">${ended?'Return gear':n.collect?'Continue packing':n.day?'Departure checklist':n.missing?'Review missing supplies':'Open trip'}</button></article>`;
 }
 $('homeReturns').innerHTML=orderedPlans().filter(t=>!t.hidden&&t.id!==p?.id&&journeyReturns(t).length).map(t=>`<button type="button" class="journey-link-row" data-journey-plan="${esc(t.id)}"><span>${glyph('restore')}</span><span><b>Return gear</b><small>${esc(t.name)}</small></span><b>${journeyStats(t).returns}</b><span aria-hidden="true">›</span></button>`).join('');
}
function journeyCollectionKey(r){const i=items.find(i=>i.id===r.inventoryId);return journeyPackingView==='bag'?(r.person+' · '+r.bag):((ZONES[i?.place]?.name||'Storage not recorded')+(i?.spot?' · '+i.spot:''))}
function journeyRenderPacking(p,rows){
 if(p.state==='ended')return '';
 const pending=[],day=[],packed=[];p.items.forEach((r,n)=>{if(journeyRemainingOnly&&r.packed>=r.quantity)return;const entry={r,html:rows[n]};if(r.packed>=r.quantity)packed.push(entry);else if(r.departureDay)day.push(entry);else pending.push(entry)});
 const groups=new Map();for(const entry of pending){const key=journeyCollectionKey(entry.r);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(entry)}
 const section=(title,entries,extra='')=>`<section class="packing-section ${extra}"><div class="list-heading"><h3>${esc(title)} <span>${entries.reduce((n,e)=>n+Math.max(0,e.r.quantity-e.r.packed),0)||entries.length}</span></h3></div><div class="inventory-group">${entries.map(e=>e.html).join('')}</div></section>`;
 return [...groups].map(([key,entries])=>section((journeyPackingView==='bag'?'Pack into ':'Get from ')+key,entries)).join('')+(day.length?section('Before leaving',day,'departure-section'):'')+(packed.length?section('Packed',packed):'')+(!p.items.length?'<div class="empty-state">'+glyph('box')+'<strong>Start with a suggestion below.</strong>Tap ＋ for gear you have, then ✓ when it is packed.</div>':journeyRemainingOnly&&!pending.length&&!day.length?'<div class="empty-state">'+glyph('check')+'<strong>This list is packed.</strong>'+ (p.missing.length?'Review missing supplies below.':'All items in this plan are packed.')+'</div>':'');
}
function journeyRenderTrip(p){
 const ended=p.state==='ended';journeyRenderTools(p);$('plannerWeights').classList.toggle('hidden',ended||journeyPackingView!=='bag');$('plannerMissingSection').classList.toggle('hidden',ended);$('plannerPackingHead').classList.toggle('hidden',ended);$('plannerPacks').classList.toggle('hidden',ended);$('plannerReturn').classList.toggle('hidden',!ended);
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
 $('refillContent').innerHTML=(needs.length?'<div class="list-heading"><h3>Used on trips <span>'+needs.length+'</span></h3></div><div class="inventory-group">'+needs.map(n=>button(n.item,n.target,n.trip)).join('')+'</div>':'')+missing.map(p=>'<section class="packing-section"><div class="list-heading"><h3>'+esc(p.name)+'</h3></div><div class="inventory-group">'+p.missing.map((m,n)=>`<button type="button" class="journey-link-row" data-missing-trip="${esc(p.id)}" data-missing-index="${n}" data-suggestion-key="${esc(planSuggestionKey(p,m))}"><span class="missing-plus" aria-hidden="true">＋</span><span><b>${esc(m.name)}</b><small>${journeyMissingOwned(p,m)?'Use '+journeyMissingOwned(p,m).quantity+' already owned':esc(m.reason)+' · Add when you have it'}</small></span><b>×${m.quantity}</b><span aria-hidden="true">›</span></button>`).join('')+'</div></section>').join('')+(empty.length?'<details class="empty-refills"><summary>Empty gear <span>'+empty.length+'</span></summary><div class="inventory-group">'+empty.map(i=>button(i,Math.max(1,planInt(i.lastNonzeroQty)),ZONES[i.place]?.name||'Storage')).join('')+'</div></details>':'')+(!needs.length&&!missing.length&&!empty.length?'<div class="empty-state">'+glyph('check')+'<strong>Nothing to refill.</strong>Used supplies and trip shortfalls appear here.</div>':'')+'<p class="hint refill-footnote">Tap ＋ only after adding that many to your supplies.</p>';
 const count=needs.length+missing.reduce((n,p)=>n+p.missing.length,0);$('refillBadge').textContent=count;$('refillBadge').classList.toggle('hidden',!count);
}
function initJourney(){
 $('homeAdd').onclick=()=>quickOpen();initJourneyPacking();
 document.addEventListener('click',e=>{
  const b=e.target.closest?.('[data-journey-plan],[data-journey-gear],[data-journey-refill],[data-trip-view],[data-return-trip],[data-refill-item],[data-missing-trip]');if(!b)return;const d=b.dataset;
  if(d.journeyPlan){plannerOpen(d.journeyPlan);return}
  if(d.journeyGear!==undefined){tabShow('inventory');return}
  if(d.journeyRefill!==undefined){plannerClose();tabShow('refill');return}
  if(d.tripView){journeyPackingView=d.tripView;plannerRender();return}
  if(d.returnTrip){journeySetReturned(d.returnTrip,d.returnItem);return}
  if(d.refillItem){journeyRestock(d.refillItem,Number(d.refillTarget));return}
  if(d.missingTrip){plannerOpen(d.missingTrip);planAcquire(Number(d.missingIndex),d.suggestionKey)}
 });
 journeyRenderHome();journeyRenderRefill();
}


// Packing selection belongs to the open trip, never to owned-stock quantities.
function journeyResetPacking(){journeySelecting=false;journeyRemainingOnly=false;journeySelected.clear();document.body.classList.remove('trip-selecting')}
function journeyVisibleItems(p){return p.items.filter(r=>!journeyRemainingOnly||r.packed<r.quantity)}
function journeySetSelecting(on){resetEntityGesture();journeySelecting=!!on;journeySelected.clear();document.body.classList.toggle('trip-selecting',journeySelecting);plannerRender()}
function journeyToggleSelected(id){const p=planCurrent();if(!journeySelecting||!p||p.state==='ended'||!journeyVisibleItems(p).some(r=>r.inventoryId===id))return false;if(journeySelected.has(id))journeySelected.delete(id);else journeySelected.add(id);plannerRender();journeyFocusControl(id,'tripSelect');return true}
function journeySelectAll(){const p=planCurrent();if(!journeySelecting||!p||p.state==='ended')return;const rows=journeyVisibleItems(p),all=rows.length&&rows.every(r=>journeySelected.has(r.inventoryId));for(const r of rows)if(all)journeySelected.delete(r.inventoryId);else journeySelected.add(r.inventoryId);plannerRender()}
function journeyBulkPack(pack){
 const p=planCurrent();if(!journeySelecting||!p||p.state==='ended')return false;
 const changes=journeyVisibleItems(p).filter(r=>journeySelected.has(r.inventoryId)).map(r=>({row:r,packed:pack?Math.max(r.packed,Math.min(r.quantity,journeyAvailable(p,r.inventoryId))):0})).filter(c=>c.row.packed!==c.packed);
 if(!changes.length){toast(pack?'No available gear to pack in this selection':'Selected items are already unpacked');return false}
 const ok=entityCommit(()=>{for(const c of changes)c.row.packed=c.packed},changes.length+' items '+(pack?'packed':'unpacked'));
 if(ok){journeySelecting=false;journeySelected.clear();document.body.classList.remove('trip-selecting');plannerRender();$('tripSelectToggle').focus({preventScroll:true})}
 return ok;
}
function journeyJump(id){
 const p=planCurrent();if(!p||p.state==='ended')return;
 if(id==='missing'){const el=$('plannerMissingSection');el.scrollIntoView({block:'start',behavior:'auto'});el.querySelector('button')?.focus({preventScroll:true});return}
 const row=[...$('plannerPacks').querySelectorAll('[data-entity-id]')].find(el=>el.dataset.entityId===id);row?.scrollIntoView({block:'center',behavior:'auto'});row?.querySelector('button')?.focus({preventScroll:true});
}
function journeyRenderTools(p){
 const ended=p.state==='ended',rows=journeyVisibleItems(p),n=journeyStats(p);
 for(const id of [...journeySelected])if(!rows.some(r=>r.inventoryId===id))journeySelected.delete(id);
 $('tripSelectToggle').textContent=journeySelecting?'Done':'Select';$('tripSelectToggle').setAttribute('aria-pressed',String(journeySelecting));$('tripSelectToggle').disabled=ended||!p.items.length;
 $('tripRemainingToggle').textContent=journeyRemainingOnly?'Show all items':'To pack only';$('tripRemainingToggle').setAttribute('aria-pressed',String(journeyRemainingOnly));$('tripVisibleCount').textContent=rows.length+' item'+(rows.length===1?'':'s');
 $('tripBulkBar').classList.toggle('hidden',!journeySelecting||ended);$('tripSelectionCount').textContent=journeySelected.size+' selected';$('tripSelectAll').textContent=rows.length&&rows.every(r=>journeySelected.has(r.inventoryId))?'Deselect all':'Select all';$('tripSelectAll').disabled=!rows.length;
 $('tripPackSelected').disabled=!rows.some(r=>journeySelected.has(r.inventoryId)&&r.packed<Math.min(r.quantity,journeyAvailable(p,r.inventoryId)));$('tripUnpackSelected').disabled=!rows.some(r=>journeySelected.has(r.inventoryId)&&r.packed>0);
 $('journeyNext').classList.toggle('hidden',ended||journeySelecting);
 if(ended){$('journeyNext').innerHTML='';return}
 const pending=p.items.filter(r=>r.packed<r.quantity),next=pending.find(r=>!r.departureDay&&journeyAvailable(p,r.inventoryId)>r.packed)||pending.find(r=>journeyAvailable(p,r.inventoryId)>r.packed)||pending[0],i=next&&items.find(i=>i.id===next.inventoryId&&!i.archived);
 if(next){const available=journeyAvailable(p,next.inventoryId),blocked=available<=next.packed;
 $('journeyNext').innerHTML=`<button type="button" class="journey-link-row" data-trip-next="${esc(next.inventoryId)}"><span aria-hidden="true">${glyph(blocked?'box':'pack')}</span><span><b>${blocked?'Resolve unavailable gear':next.departureDay?'Before leaving':'Up next'}: ${esc(i?.name||'Unavailable item')}</b><small>${blocked?'Check owned quantity or return gear from another trip':((ZONES[i?.place]?.name||'Storage not recorded')+(i?.spot?' · '+i.spot:''))+' · '+(next.quantity-next.packed)+' to pack'}</small></span><span aria-hidden="true">↓</span></button>`;
 }else if(n.missing)$('journeyNext').innerHTML=`<button type="button" class="journey-link-row" data-trip-next="missing"><span aria-hidden="true">＋</span><span><b>${n.missing} still missing</b><small>Add gear you have. The checkmark records packing.</small></span><span aria-hidden="true">↓</span></button>`;
 else $('journeyNext').innerHTML='<div class="packing-done">'+glyph('check')+'<span><b>'+ (n.total?'Everything in this plan is packed.':'Start with gear for this trip.')+'</b><small>'+(n.total?'Storage locations are saved for your return.':'Use Add gear below to choose owned items.')+'</small></span></div>';
}
function initJourneyPacking(){
 $('tripSelectToggle').onclick=()=>journeySetSelecting(!journeySelecting);
 $('tripRemainingToggle').onclick=()=>{journeyRemainingOnly=!journeyRemainingOnly;journeySelected.clear();plannerRender()};
 $('tripSelectAll').onclick=journeySelectAll;$('tripPackSelected').onclick=()=>journeyBulkPack(true);$('tripUnpackSelected').onclick=()=>journeyBulkPack(false);
 $('journeyNext').onclick=e=>{const b=e.target.closest('[data-trip-next]');if(b)journeyJump(b.dataset.tripNext)};
}

function journeyFocusControl(id,key='planCheck'){
 const controls=[...$('plannerPacks').querySelectorAll('button')];
 const available=b=>!b.disabled&&b.getClientRects().length>0;
 const target=controls.find(b=>b.dataset[key]===id&&available(b))||controls.find(b=>b.dataset.planCheck===id&&available(b))||controls.find(b=>(b.dataset.tripSelect||b.dataset.planCheck)&&available(b));
 (target||$('tripSelectToggle')).focus({preventScroll:true});
}
