/* FieldKit: a trip checklist works without an inventory or an AI service. */
'use strict';
const DEPARTURE_TEMPLATES = {
 travel: {name:'Hotel / weekend',icon:'🧳',days:3,items:[['Daily outfits','days'],['Underwear & socks','days'],['Sleepwear','people'],['Comfortable shoes','people'],['Toiletries','people'],['Phone & charger','people',true],['Wallet, ID & keys',1,true],['Personal essentials','people',true],['Reusable water bottle','people']]},
 hike: {name:'Day hike',icon:'🥾',days:1,items:[['Water — check route & conditions','people',true],['Snacks','people',true],['Weather layers','people'],['Sun protection','people'],['Headlamp','people'],['First-aid kit',1],['Offline route / map',1,true],['Phone & backup power',1,true],['Personal essentials','people',true]]},
 camp: {name:'Camping',icon:'⛺',days:2,items:[['Tent / shelter',1],['Sleeping bag','people'],['Sleeping pad','people'],['Clothes & warm layers','people'],['Headlamp','people'],['First-aid kit',1],['Food — plan meals',1,true],['Water — plan supply / refill',1,true],['Cooking & eating kit',1],['Toiletries & trash bags',1],['Offline directions',1,true],['Phone, keys & personal essentials',1,true]]},
 blank: {name:'Blank list',icon:'＋',days:1,items:[]}
};
let departureChoosing=false,departureTemplate=null,departureEdit=null,departureAdvancedOpen=null,departureViewingId=null;

function departureValidate(raw){
 if(raw===undefined)return [];
 if(!Array.isArray(raw)||raw.length>1000)throw Error('Invalid packing checklist');
 const seen=new Set();return raw.map(r=>{
  if(!r||typeof r.id!=='string'||!/^check_[a-z0-9_]+$/.test(r.id)||r.id.length>100||seen.has(r.id)||typeof r.name!=='string'||!r.name.trim()||r.name.length>200||!Number.isInteger(r.quantity)||r.quantity<1||r.quantity>999||!Number.isInteger(r.packed)||r.packed<0||r.packed>r.quantity||r.need&&r.packed>0)throw Error('Invalid checklist item');
  seen.add(r.id);return {id:r.id,name:r.name,quantity:r.quantity,packed:r.packed,day:!!r.day,need:!!r.need,place:planText(r.place,120),note:planText(r.note,400)};
 });
}
function departureRows(p){
 const owned=p.items.map(r=>{const i=items.find(i=>i.id===r.inventoryId&&!i.archived);return {key:'owned:'+r.inventoryId,name:i?.name||'Unavailable gear',quantity:r.quantity,packed:r.packed,day:r.departureDay,need:journeyAvailable(p,r.inventoryId)<r.quantity,place:i?[ZONES[i.place]?.name,i.spot].filter(Boolean).join(' · '):'',note:r.reason||'',owned:true}});
 return [...owned,...(p.checklist||[]).map(r=>({...r,key:r.id})),...p.missing.map((r,n)=>({...r,key:'missing:'+n,packed:0,day:false,need:true,suggestion:true,place:'',note:r.reason||''}))];
}
function departureStats(p){const rows=departureRows(p);return {rows,total:rows.reduce((n,r)=>n+r.quantity,0),packed:rows.reduce((n,r)=>n+r.packed,0),remaining:rows.filter(r=>r.need||r.packed<r.quantity),blocked:rows.filter(r=>r.need)}}
function departureActivate(id){const p=tripPlans.find(p=>p.id===id);if(!p)return false;departureChoosing=false;departureTemplate=null;departureEdit=null;departureViewingId=id;$('departureRenameForm').classList.add('hidden');journeyRemember(id);plannerTripId=id;tripDraft=p;if(current!=='bags')tabShow('bags');departureRenderHome();window.scrollTo({top:0,behavior:'auto'});return true}
function departureCurrent(){return departureChoosing?null:tripPlans.find(p=>p.id===departureViewingId&&!p.hidden)||journeyPrimary()}
function departureStart(){$('departureRenameForm').classList.add('hidden');departureChoosing=true;departureTemplate=null;departureEdit=null;tabShow('bags');departureRenderHome();$('homeNext').scrollIntoView({block:'start',behavior:'auto'})}
function departureRenderPicker(){
 const last=orderedPlans().find(p=>!p.hidden);
 if(!departureTemplate)return '<div class="departure-start"><h3>Start with a list.</h3><p>Edit it as you pack. No inventory setup.</p>'+(last?'<button type="button" class="departure-repeat" data-departure-repeat="'+esc(last.id)+'"><span aria-hidden="true">↻</span><span><b>Repeat your last trip</b><small>'+esc(last.name)+'</small></span><span aria-hidden="true">›</span></button>':'')+'<div class="departure-templates">'+Object.entries(DEPARTURE_TEMPLATES).map(([id,t])=>'<button type="button" data-departure-template="'+id+'"><span aria-hidden="true">'+t.icon+'</span><b>'+esc(t.name)+'</b><span aria-hidden="true">›</span></button>').join('')+'</div>'+(tripPlans.some(p=>p.state!=='ended'&&!p.hidden)?'<button type="button" class="link-btn" data-departure-cancel>Back to packing</button>':'')+'</div>';
 const t=DEPARTURE_TEMPLATES[departureTemplate];
 return '<form id="departureCreateForm" class="departure-setup"><button type="button" class="link-btn" data-departure-pick>‹ Starting lists</button><h3>'+t.icon+' '+esc(t.name)+'</h3><label for="departureName">Trip name</label><input id="departureName" maxlength="100" placeholder="e.g. San Diego weekend" value="'+esc(t.name)+'" required><div class="departure-fields"><label for="departureDays">Days<input id="departureDays" type="number" inputmode="numeric" min="1" max="30" value="'+t.days+'" required></label><label for="departurePeople">People<input id="departurePeople" type="number" inputmode="numeric" min="1" max="12" value="1" required></label></div><button type="submit" class="btn wide">Start packing</button><p class="hint">A starting list, not a complete trip or safety plan. Adjust for your plans and conditions.</p></form>';
}
function departureCreate(templateId,name,days,people){
 const t=DEPARTURE_TEMPLATES[templateId];name=String(name||'').trim();if(!t||!name||name.length>100||!Number.isInteger(days)||days<1||days>30||!Number.isInteger(people)||people<1||people>12)return false;
 if(tripPlans.length>=200){toast('Trip limit reached. Export a backup and hide or manage older trips.');return false}
 const spec={destination:name,days,people,style:templateId==='blank'?'travel':templateId,when:'',extra:''};
 const p=planNormalize({name,items:[],missing:[],assumptions:[]},spec);
 p.checklist=t.items.map(([name,scale,day])=>({id:'check_'+entityId(),name,quantity:scale==='days'?days*people:scale==='people'?people:scale,packed:0,day:!!day,need:false,place:'',note:''}));
 p.engine='Starting list';let ok=entityCommit(()=>{tripPlans.push(p)},'Packing list created');if(ok)departureActivate(p.id);return ok;
}
function departureRow(r,ended){
 const remaining=r.quantity-r.packed,full=!remaining&&!r.need,blocked=r.need;
 return '<div class="departure-row '+(full?'is-packed':'')+'" data-departure-row="'+esc(r.key)+'">'+(r.suggestion?'<button type="button" class="departure-check suggestion-add" data-departure-acquire="'+esc(r.key)+'" aria-label="Add '+esc(r.name)+' to my list" '+(ended?'disabled':'')+'>＋</button>':'<button type="button" class="departure-check" data-departure-pack="'+esc(r.key)+'" aria-label="'+(full?'Unpack ':'Pack ')+esc(r.name)+'" aria-pressed="'+full+'" '+(ended?'disabled':'')+'><span aria-hidden="true">'+(full?'✓':'')+'</span></button>')+
 '<button type="button" class="departure-item" data-departure-edit="'+esc(r.key)+'" '+(ended?'disabled':'')+'><b>'+esc(r.name)+'</b>'+((r.place||blocked||r.packed&&!full)?'<small>'+(blocked?(r.owned?'Check availability':'Need to get'):(r.packed&&!full?r.packed+' of '+r.quantity+' packed':esc(r.place)))+'</small>':'')+'</button>'+(r.quantity>1?'<span class="departure-quantity" aria-label="'+r.packed+' of '+r.quantity+' packed">'+(r.packed&&!full?r.packed+'/':'×')+r.quantity+'</span>':'')+'</div>';
}
function departureRenderHome(){
 const p=departureCurrent(),host=$('homeNext');$('departureOtherTrips').classList.toggle('hidden',!tripPlans.some(p=>!p.hidden));
 $('planOpen').classList.toggle('hidden',!p);$('homeAdd').setAttribute('aria-label','New trip');
 if(!p){host.innerHTML=departureRenderPicker();return}
 const s=departureStats(p),ended=p.state==='ended',ready=s.total>0&&!s.remaining.length;
 const section=(title,rows,extra='')=>rows.length?'<section class="departure-section '+extra+'"><div class="departure-heading"><h4>'+title+'</h4><span>'+rows.length+'</span></div><div class="departure-list">'+rows.map(r=>departureRow(r,ended)).join('')+'</div></section>':'';
 const need=s.remaining.filter(r=>r.need),pack=s.remaining.filter(r=>!r.need&&!r.day),day=s.remaining.filter(r=>!r.need&&r.day),done=s.rows.filter(r=>!r.need&&r.packed>=r.quantity);
 host.innerHTML='<article class="departure-trip"><div class="departure-trip-top"><div><h3>'+esc(p.name)+'</h3><p>'+p.spec.days+' day'+(p.spec.days===1?'':'s')+' · '+p.spec.people+' '+(p.spec.people===1?'person':'people')+'</p></div><button type="button" class="text-btn" data-departure-options aria-expanded="false">•••<span class="sr-only">Trip options</span></button></div><div class="departure-progress"><span>'+ (ended?'Past trip':ready?'List packed':s.total?s.packed+' of '+s.total+' packed':'Add your first item')+'</span><b>'+(ended?'':s.blocked.length?s.blocked.length+' to resolve':day.length?day.length+' before leaving':ready?'✓':'')+'</b></div><div class="departure-meter" role="progressbar" aria-label="Packing progress" aria-valuemin="0" aria-valuemax="'+Math.max(1,s.total)+'" aria-valuenow="'+s.packed+'"><i style="width:'+pctOf(s.packed,s.total)+'%"></i></div><div id="departureOptions" class="departure-options hidden">'+(ended?'':'<button type="button" data-departure-rename>Rename trip</button>')+'<button type="button" data-departure-repeat="'+esc(p.id)+'">↻ Repeat with an empty checklist</button>'+(p.items.length?'<button type="button" data-departure-advanced>Storage, returns &amp; advanced tools</button>':'')+(ended?'':'<button type="button" data-departure-finish>Finish trip</button>')+'</div>'+(ready?'<div class="departure-ready">'+glyph('check')+'<span><b>Everything on your list is packed.</b><small>Give the list a final look before you leave.</small></span></div>':'')+section('Need to resolve',need,'departure-needs')+section('To pack',pack)+section('Before leaving',day,'departure-day')+(done.length?'<details class="departure-packed"><summary>Packed <span>'+done.length+'</span></summary><div class="departure-list">'+done.map(r=>departureRow(r,ended)).join('')+'</div></details>':'')+(ended?'<button class="btn wide" type="button" data-departure-repeat="'+esc(p.id)+'">Repeat this trip</button>':'<form id="departureAddForm" class="departure-add"><label class="sr-only" for="departureAddName">Add an item</label><input id="departureAddName" maxlength="200" placeholder="Add an item…" required autocomplete="off"><button type="submit" aria-label="Add item to packing list">＋</button></form><p class="departure-footnote">Tap a circle when it is packed. Tap the name to edit.</p>')+'</article>';
}
function departureMutate(fn,message){const p=departureCurrent();if(!p||p.state==='ended')return false;return entityCommit(()=>{const live=tripPlans.find(x=>x.id===p.id);fn(live)},message)}
function departureToggle(key){
 const p=departureCurrent(),r=p&&departureRows(p).find(r=>r.key===key);if(!r||p.state==='ended')return false;
 if(r.suggestion)return departureAcquire(key);
 if(r.need&&r.packed<r.quantity){departureOpenEdit(key);return false}
 let ok;if(r.owned){plannerTripId=p.id;ok=planSetPacked(key.slice(6),r.packed===r.quantity?0:r.quantity)}else ok=departureMutate(p=>{const row=p.checklist.find(x=>x.id===key);row.packed=row.packed===row.quantity?0:row.quantity},r.packed===r.quantity?'Unpacked '+r.name:'Packed '+r.name);
 if(ok){departureRenderHome();const button=[...$('homeNext').querySelectorAll('[data-departure-pack]')].find(b=>b.dataset.departurePack===key);const visible=button&&button.getClientRects().length>0;(visible?button:$('departureAddName'))?.focus({preventScroll:true})}return ok;
}
function departureAdd(name){name=String(name||'').trim();if(!name||name.length>200)return false;const p=departureCurrent();if(!p||p.state==='ended'||(p.checklist||[]).length>=1000)return false;return departureMutate(p=>{(p.checklist??=[]).push({id:'check_'+entityId(),name,quantity:1,packed:0,day:false,need:false,place:'',note:''})},'Added to your list · not packed')}
function departureAcquire(key){
 const p=departureCurrent(),index=Number(key.slice(8)),m=p?.missing[index];if(!key.startsWith('missing:')||!Number.isInteger(index)||!m||(p.checklist||[]).length>=1000)return false;
 return departureMutate(p=>{const m=p.missing[index];(p.checklist??=[]).push({id:'check_'+entityId(),name:m.name,quantity:m.quantity,packed:0,day:false,need:false,place:'',note:m.reason||''});p.missing.splice(index,1)},'Added to your list · not packed');
}
function departureRepeat(id){
 const p=tripPlans.find(p=>p.id===id);if(!p||tripPlans.length>=200)return false;
 const next=planClone(p);next.id='plan_'+entityId();next.name=(p.name+' · Next trip').slice(0,100);next.state='active';next.hidden=false;next.createdAt=new Date().toISOString();next.endedAt='';next.returnItems=[];next.consumed=[];
 next.items.forEach(r=>r.packed=0);next.checklist=(next.checklist||[]).map(r=>({...r,id:'check_'+entityId(),packed:0}));
 const ok=entityCommit(()=>{tripPlans.push(next)},'Trip repeated · nothing marked packed');if(ok)departureActivate(next.id);return ok;
}
function departureOpenEdit(key){
 const p=departureCurrent(),r=p&&departureRows(p).find(r=>r.key===key);if(!r||p.state==='ended')return;departureEdit=key;
 const editor=$('departureEditor');editor.innerHTML='<form id="departureEditForm"><div class="quick-head"><h2 id="departureEditorTitle">Edit item</h2><button class="x" type="button" data-departure-close aria-label="Close item editor">×</button></div><label for="departureEditName">Name</label><input id="departureEditName" maxlength="200" value="'+esc(r.name)+'" required '+(r.owned?'readonly':'')+'><div class="departure-fields"><label for="departureEditQty">Quantity<input id="departureEditQty" type="number" inputmode="numeric" min="1" max="999" value="'+r.quantity+'" required></label><label for="departureEditPacked">Packed<input id="departureEditPacked" type="number" inputmode="numeric" min="0" max="999" value="'+r.packed+'" required></label></div>'+(r.owned?'<p class="hint">'+esc(r.place)+' · '+journeyAvailable(p,key.slice(6))+' available. Ownership is managed in More → Saved gear.</p>':'<label class="departure-checkbox"><input id="departureEditNeed" type="checkbox" '+(r.need?'checked':'')+'>Need to get</label>')+'<label class="departure-checkbox"><input id="departureEditDay" type="checkbox" '+(r.day?'checked':'')+'>Before leaving</label><label for="departureEditPlace">Where to find it <span class="hint">Optional</span></label><input id="departureEditPlace" maxlength="120" value="'+esc(r.place)+'" '+(r.owned?'readonly':'')+'><button class="btn wide" type="submit">Save</button><button class="link-btn departure-remove" type="button" data-departure-remove>Remove from this list</button><p id="departureEditError" class="hint" role="alert"></p></form>';
 $('departureLayer').classList.remove('hidden');uiSyncLayers();$('departureEditName').focus({preventScroll:true});
}
function departureSaveEdit(values){
 const p=departureCurrent(),key=departureEdit,r=p&&departureRows(p).find(r=>r.key===key);if(!r||p.state==='ended')return false;
 const {name,quantity,packed,need,day,place}=values;if(!name.trim()||name.length>200||!Number.isInteger(quantity)||quantity<1||quantity>999||!Number.isInteger(packed)||packed<0||packed>quantity||need&&packed>0)return false;
 if(r.owned&&(quantity>planInt(items.find(i=>i.id===key.slice(6))?.qty)||packed>journeyAvailable(p,key.slice(6))))return false;
 const ok=departureMutate(p=>{if(r.owned){Object.assign(p.items.find(x=>x.inventoryId===key.slice(6)),{quantity,packed,departureDay:day,locked:true})}else {const row={id:r.suggestion?'check_'+entityId():key,name:name.trim(),quantity,packed,need:!!need,day:!!day,place:place.slice(0,120),note:r.note||''};if(r.suggestion){p.missing.splice(Number(key.slice(8)),1);(p.checklist??=[]).push(row)}else Object.assign(p.checklist.find(x=>x.id===key),row)}},'Item updated');if(ok)departureCloseEdit();return ok;
}
function departureCloseEdit(){departureEdit=null;$('departureLayer').classList.add('hidden');uiSyncLayers();$('departureAddName')?.focus({preventScroll:true})}
function departureFinish(){const p=departureCurrent();if(!p||p.state==='ended')return false;if(p.items.length){departureAdvancedOpen(p.id);planEndReview();return true}return departureMutate(p=>{p.state='ended';p.endedAt=new Date().toISOString()},'Trip saved for next time')}

function initDeparture(){
 // Retain the established ownership tools behind More, separate from packing.
 departureAdvancedOpen=plannerOpen;
 journeyRenderHome=departureRenderHome;
 const originalCards=planRenderCards;planRenderCards=function(){originalCards();if($('departureOtherTrips'))$('departureOtherTrips').classList.toggle('hidden',!tripPlans.length)};
 plannerOpen=function(id){if(typeof id==='string')return departureActivate(id);departureStart()};
 $('homeAdd').onclick=departureStart;$('planOpen').onclick=departureStart;
 $('tripPlanCards').onclick=e=>{const b=e.target.closest('[data-open-plan]');if(b)departureActivate(b.dataset.openPlan)};
 $('homeNext').onclick=e=>{
  const b=e.target.closest('button');if(!b)return;const d=b.dataset;
  if(d.departureTemplate){departureTemplate=d.departureTemplate;departureRenderHome();$('departureName').focus();$('departureName').select?.()}
  else if(d.departureRepeat)departureRepeat(d.departureRepeat);
  else if('departureCancel'in d){departureChoosing=false;departureRenderHome()}
  else if('departurePick'in d){departureTemplate=null;departureRenderHome()}
  else if(d.departurePack)departureToggle(d.departurePack);
  else if(d.departureAcquire)departureAcquire(d.departureAcquire);
  else if(d.departureEdit)departureOpenEdit(d.departureEdit);
  else if('departureOptions'in d){const panel=$('departureOptions'),open=panel.classList.contains('hidden');panel.classList.toggle('hidden',!open);b.setAttribute('aria-expanded',String(open))}
  else if('departureRename'in d){const p=departureCurrent();$('departureRenameName').value=p.name;$('departureRenameForm').classList.remove('hidden');$('departureRenameName').focus();$('departureRenameName').select?.()}
  else if('departureAdvanced'in d)departureAdvancedOpen(departureCurrent().id);
  else if('departureFinish'in d)departureFinish();
 };
 $('homeNext').addEventListener('submit',e=>{e.preventDefault();if(e.target.id==='departureCreateForm')departureCreate(departureTemplate,$('departureName').value,Number($('departureDays').value),Number($('departurePeople').value));else if(e.target.id==='departureAddForm'){const name=$('departureAddName').value;if(!departureAdd(name))$('departureAddName').value=name;$('departureAddName').focus()}});
 $('departureEditor').addEventListener('submit',e=>{e.preventDefault();const p=departureCurrent(),r=departureRows(p).find(r=>r.key===departureEdit);if(!departureSaveEdit({name:$('departureEditName').value,quantity:Number($('departureEditQty').value),packed:Number($('departureEditPacked').value),need:r.owned?false:$('departureEditNeed').checked,day:$('departureEditDay').checked,place:$('departureEditPlace').value}))$('departureEditError').textContent='Check quantities: packed cannot exceed total or available gear. Clear Need to get before packing.'});
 $('departureLayer').onclick=e=>{if(e.target.closest('[data-departure-close]'))departureCloseEdit();if(e.target.closest('[data-departure-remove]')){const key=departureEdit;const ok=departureMutate(p=>{if(key.startsWith('owned:')){const id=key.slice(6);p.items=p.items.filter(x=>x.inventoryId!==id);if(!p.excluded.includes(id))p.excluded.push(id)}else if(key.startsWith('missing:'))p.missing.splice(Number(key.slice(8)),1);else p.checklist=p.checklist.filter(x=>x.id!==key)},'Removed from this list');if(ok)departureCloseEdit()}};
 $('departureRenameForm').onsubmit=e=>{e.preventDefault();const name=$('departureRenameName').value.trim();if(name&&departureMutate(p=>p.name=name.slice(0,100),'Trip renamed'))$('departureRenameForm').classList.add('hidden')};$('departureRenameCancel').onclick=()=>$('departureRenameForm').classList.add('hidden');
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('departureLayer').classList.contains('hidden')){e.preventDefault();departureCloseEdit()}});
 document.addEventListener('click',e=>{const b=e.target.closest('[data-departure-gear],[data-departure-refill]');if(b)tabShow('departureGear'in b.dataset?'inventory':'refill')});
 $('floatAdd').classList.add('hidden');departureRenderHome();
}
