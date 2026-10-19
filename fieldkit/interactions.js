/* FieldKit touch interactions: data edits are atomic; inputs keep native gestures. */
'use strict';
let customization={zoneOrder:[],tripOrder:[],zones:{}},entityContext=null,entityReturnFocus=null,entityPreviousOverflow='',touchDrag=null;
const entityClone=x=>JSON.parse(JSON.stringify(x));
const entityText=(x,max=200)=>String(x??'').trim().slice(0,max);
const entityId=()=>Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8);
function validatedCustomization(raw){if(raw===undefined)return {zoneOrder:[],tripOrder:[],zones:{}};if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('Invalid customization');const order=(v)=>{if(v===undefined)return [];if(!Array.isArray(v)||v.length>1000||v.some(id=>typeof id!=='string'||id.length>100))throw Error('Invalid saved order');return [...new Set(v)]};const zones={};if(raw.zones!==undefined&&(!raw.zones||Array.isArray(raw.zones)||typeof raw.zones!=='object'||Object.keys(raw.zones).length>210))throw Error('Invalid kit customization');for(const [id,z]of Object.entries(raw.zones||{})){if(!/^[a-z0-9_]+$/.test(id)||['__proto__','constructor','prototype'].includes(id)||!z||typeof z!=='object')throw Error('Invalid kit identity');zones[id]={emoji:entityText(z.emoji,12),color:/^#[0-9a-f]{6}$/i.test(z.color)?z.color:'#fff3c2',subtitle:entityText(z.subtitle,100),description:entityText(z.description,400),hidden:!!z.hidden,protected:!!z.protected}}const presets={};if(raw.presets!==undefined&&(!raw.presets||typeof raw.presets!=='object'||Array.isArray(raw.presets)||Object.keys(raw.presets).length>30))throw Error('Invalid departure presets');for(const [id,p]of Object.entries(raw.presets||{})){if(!/^(hike|family|camp|evac|preset_[a-z0-9_]+)$/.test(id)||!p||typeof p.name!=='string'||!Array.isArray(p.zones)||p.zones.length>210||p.zones.some(x=>typeof x!=='string'))throw Error('Invalid departure preset');presets[id]={name:entityText(p.name,60),zones:[...new Set(p.zones)]}}return {zoneOrder:order(raw.zoneOrder),tripOrder:order(raw.tripOrder),zones,presets}}
function cleanCustomFields(raw){if(raw===undefined)return {};if(!raw||typeof raw!=='object'||Array.isArray(raw)||Object.keys(raw).length>20)throw Error('Use at most 20 custom fields');const out={};for(const [k,v]of Object.entries(raw)){const name=entityText(k,50);if(!name||['__proto__','constructor','prototype'].includes(name)||typeof v!=='string')throw Error('Invalid custom field');out[name]=entityText(v,400)}return out}
function entityCustomFields(text){const out={};for(const line of String(text).split('\n').filter(s=>s.trim())){const n=line.indexOf(':');if(n<1)throw Error('Use Label: value for each custom field');if(['__proto__','constructor','prototype'].includes(line.slice(0,n).trim()))throw Error('Invalid custom field');out[line.slice(0,n).trim()]=line.slice(n+1).trim()}return cleanCustomFields(out)}
function zoneMeta(id){return customization.zones[id]||{}}
function zoneProtected(id){return ZONES[id]?.group==='emergency'||!!zoneMeta(id).protected}
function orderedIds(preferred,known){return [...preferred.filter(id=>known.includes(id)),...known.filter(id=>!preferred.includes(id))]}
function orderedZones(includeHidden=false){return orderedIds(customization.zoneOrder,Object.keys(ZONES)).filter(id=>includeHidden||!zoneMeta(id).hidden).map(id=>[id,ZONES[id]])}
function orderedPlans(){return orderedIds(customization.tripOrder,tripPlans.slice().reverse().map(p=>p.id)).map(id=>tripPlans.find(p=>p.id===id))}
function entitySnapshot(){return entityClone({items,tripPlans,customization,customKits:customKitData(),zones:zoneNames()})}
function entityApply(state){items=entityClone(state.items);tripPlans=entityClone(state.tripPlans);applyCustomKits(state.customKits);applyZoneNames(state.zones);customization=entityClone(state.customization)}
function entityRefresh(){refreshZoneOptions();refresh();if(!$('plannerLayer').classList.contains('hidden')&&planCurrent())plannerRender();renderHiddenEntities()}
function entityCommit(fn,message){if(storageBlocked)return false;const before=entitySnapshot();try{fn()}catch(e){entityApply(before);toast(e.message||'Nothing changed');return false}if(!persist()){entityApply(before);entityRefresh();toast('Could not save changes');return false}const expected=JSON.stringify(entitySnapshot());entityRefresh();toast(message,()=>{if(JSON.stringify(entitySnapshot())!==expected){toast('Other changes were made; this Undo is no longer available');return}const currentState=entitySnapshot();entityApply(before);if(!persist())entityApply(currentState);entityRefresh();toast('Change undone')});return true}
function entityReorder(kind,id,target,after=false,planId=plannerTripId){if(id===target)return false;const move=(list,key)=>{const a=list.findIndex(x=>key(x)===id),b=list.findIndex(x=>key(x)===target);if(a<0||b<0)throw Error('Move cancelled');const [row]=list.splice(a,1);let at=list.findIndex(x=>key(x)===target)+(after?1:0);list.splice(at,0,row)};return entityCommit(()=>{if(kind==='gear')move(items,x=>x.id);else if(kind==='kit'){const list=orderedZones(true).map(([id])=>id);move(list,x=>x);customization.zoneOrder=list}else if(kind==='trip'){const list=orderedPlans().map(p=>p.id);move(list,x=>x);customization.tripOrder=list}else {const p=tripPlans.find(p=>p.id===planId);if(!p||p.state==='ended')throw Error('Past trips are read-only; duplicate to plan again');if(kind==='trip-item'){move(p.items,x=>x.inventoryId);p.orderLocked=true;}else if(kind==='missing'){const a=Number(id),b=Number(target);if(!p.missing[a]||!p.missing[b])throw Error('Move cancelled');const [row]=p.missing.splice(a,1);p.missing.splice(b+(after?1:0)-(a<b?1:0),0,row)}else throw Error('Move cancelled')}},'Order saved')}
function entityGearGroup(i){return current==='inventory'&&!openZone?(Number(i.qty)>0?'owned':'empty'):itemMoveState(i)}
function entityNudge(kind,id,delta){let list;if(kind==='gear')list=(current==='bags'&&!openZone?activeItems().filter(i=>i.status==='day'&&(departurePresetData()[$('tripSelect').value]?.zones||[]).includes(i.place)).map(i=>i.id):openZone?visibleIds.detail:visibleIds.inventory).filter(key=>{const a=items.find(i=>i.id===id),b=items.find(i=>i.id===key);return a&&b&&entityGearGroup(a)===entityGearGroup(b)&&!!a.archived===!!b.archived});else if(kind==='kit')list=orderedZones().map(([id])=>id);else if(kind==='trip')list=orderedPlans().filter(p=>!p.hidden).map(p=>p.id);else if(kind==='trip-item')list=planCurrent()?.items.map(r=>r.inventoryId);else list=planCurrent()?.missing.map((_,n)=>String(n));const at=list?.indexOf(id),target=list?.[at+delta];if(!target)return false;const ok=entityReorder(kind,id,target,delta>0);if(ok&&kind==='missing'&&entityContext?.kind===kind&&entityContext.id===id)entityContext.id=String(at+delta);return ok}
function entityMoveGear(id,zone){const i=items.find(x=>x.id===id);if(!i||!Object.hasOwn(ZONES,zone))return false;if(/propane|fuel canister|butane|gas cylinder/i.test(i.name)&&zone!=='shared'){toast('Fuel stays in outdoor storage; use item details for deliberate storage edits.');return false}if(i.place!==zone&&zoneProtected(i.place)){toast('Dedicated emergency gear: reassign its storage deliberately in item details.');return false}return entityCommit(()=>{i.place=zone},'Gear moved to '+ZONES[zone].name)}
function entityAssignTrip(id,person,bag){const p=planCurrent(),r=p?.items.find(x=>x.inventoryId===id),i=items.find(x=>x.id===id);if(!p||!r||p.state==='ended')return false;if(/propane|fuel canister|butane|gas cylinder/i.test(i?.name||'')&&bag!=='Outdoor fuel storage'){toast('Fuel stays in outdoor storage');return false}return entityCommit(()=>{r.person=entityText(person,60)||'Shared';r.bag=entityText(bag,60)||'Day bag';r.locked=true},'Bag assignment saved')}
function entityGrip(kind,id,label){return `<button class="entity-grip" type="button" data-drag-kind="${kind}" data-drag-id="${esc(id)}" aria-label="Reorder ${esc(label)}" title="Hold, then drag. Tap for move controls.">⠿</button>`}
function entityCard(kind,id,body,label,readonly=false){if(readonly)return `<div class="entity-card"><div class="entity-surface">${body}</div></div>`;return `<div class="entity-card" data-entity-kind="${kind}" data-entity-id="${esc(id)}">${entitySwipeRails(kind,id)}<div class="entity-surface">${body}${entityGrip(kind,id,label)}<button type="button" class="entity-more" data-entity-menu="${kind}" data-entity-id="${esc(id)}" aria-label="Actions for ${esc(label)}">⋯</button></div></div>`}
function entityLabel(kind,id){if(kind==='gear')return items.find(i=>i.id===id)?.name||'Gear';if(kind==='kit')return ZONES[id]?.name||'Kit';if(kind==='trip')return tripPlans.find(p=>p.id===id)?.name||'Trip';if(kind==='missing')return planCurrent()?.missing[Number(id)]?.name||'Missing item';return items.find(i=>i.id===id)?.name||'Trip item'}
function entityOpen(kind,id){resetEntityGesture();if(!$('entityLayer').classList.contains('hidden')&&entityContext?.kind===kind&&entityContext.id===id)return;entityContext={kind,id,planId:plannerTripId};entityReturnFocus=document.activeElement;entityPreviousOverflow=document.body.style.overflow||'';$('entityTitle').textContent=entityLabel(kind,id);$('entityLayer').classList.remove('hidden');document.body.style.overflow='hidden';entityActions();uiSyncLayers();$('entityClose').focus()}
function entityClose(){if($('entityLayer').classList.contains('hidden'))return;$('entityLayer').classList.add('hidden');document.body.style.overflow=entityPreviousOverflow;entityContext=null;uiSyncLayers();const target=entityReturnFocus?.isConnected?entityReturnFocus:!$('plannerLayer').classList.contains('hidden')?$('plannerClose'):$('detail').classList.contains('show')?$('detailClose'):$('appMain');target.focus({preventScroll:true})}
function entityButton(action,text){return `<button type="button" class="entity-action" data-entity-action="${action}">${text}</button>`}
function entityActions(){const {kind,id}=entityContext;let html=entityButton('edit','✎ Customize');if(kind==='gear'){html+=entityButton('quick','Quick edit')+entityButton('move','Move to kit / storage')+entityButton('status','Packing status');const i=items.find(x=>x.id===id);html+=entityButton('archive',i?.archived?'Restore from Archive':'Archive gear')}if(kind==='kit')html+=entityButton('hide',zoneMeta(id).hidden?'Show kit':'Hide kit');if(kind==='trip')html+=entityButton('duplicate','Duplicate as a new trip')+entityButton('hide',tripPlans.find(p=>p.id===id)?.hidden?'Show trip':'Hide trip');if(kind==='trip-item')html+=entityButton('gear-details','Edit owned gear details')+entityButton('remove','Remove from this trip');if(kind==='missing')html+=entityButton('acquire','Mark acquired')+entityButton('remove','Remove from missing list');html+=entityButton('up','↑ Move up')+entityButton('down','↓ Move down');$('entityBody').innerHTML=html}
function entityForm(html){$('entityBody').innerHTML='<form id="entityForm">'+html+'<div class="entity-form-actions"><button class="btn" type="submit">Save changes</button><button class="btn outline" type="button" data-entity-action="back">Back</button></div><p class="hint" id="entityError" role="status"></p></form>';$('entityBody').querySelector('input,textarea,select')?.focus()}
function entitySaveKit(id,fields){const create=!id;if(create&&Object.keys(customKitData()).length>=200)return false;const name=entityText(fields.name,60);if(!name)return false;id=id||'trip_custom_'+entityId();return entityCommit(()=>{if(create)ZONES[id]={name,icon:'🎒',sub:'MY KIT',desc:'',group:'trip',custom:true};else ZONES[id].name=name;customization.zones[id]={...zoneMeta(id),emoji:entityText(fields.emoji,12),color:/^#[0-9a-f]{6}$/i.test(fields.color)?fields.color:'#fff3c2',subtitle:entityText(fields.subtitle,100),description:entityText(fields.description,400),protected:!!fields.protected};if(!customization.zoneOrder.includes(id))customization.zoneOrder.push(...orderedZones(true).map(([k])=>k).filter(k=>!customization.zoneOrder.includes(k)))},create?'Empty kit created':'Kit customized')}
function entityEditKit(id){const z=ZONES[id]||{name:'',sub:'',desc:''},m=zoneMeta(id);entityForm(`<label>Kit name<input id="entityKitName" maxlength="60" required value="${esc(z.name)}"></label><div class="entity-form-grid"><label>Emoji<input id="entityKitEmoji" maxlength="12" value="${esc(m.emoji||z.icon||'🎒')}"></label><label>Color<input id="entityKitColor" type="color" value="${m.color||'#fff3c2'}"></label></div><label>Subtitle<input id="entityKitSubtitle" maxlength="100" value="${esc(m.subtitle??z.sub)}"></label><label>Description<textarea id="entityKitDescription" maxlength="400">${esc(m.description??z.desc)}</textarea></label><label class="entity-checkbox"><input type="checkbox" id="entityKitProtected" ${zoneProtected(id)?'checked':''} ${ZONES[id]?.group==='emergency'?'disabled':''}>Dedicated emergency gear — exclude from ordinary plans</label>`);$('entityForm').onsubmit=e=>{e.preventDefault();if(entitySaveKit(id,{name:$('entityKitName').value,emoji:$('entityKitEmoji').value,color:$('entityKitColor').value,subtitle:$('entityKitSubtitle').value,description:$('entityKitDescription').value,protected:$('entityKitProtected').checked}))entityClose()}}
function entitySaveTrip(id,fields){const p=tripPlans.find(p=>p.id===id);if(!p)return false;return entityCommit(()=>{p.name=entityText(fields.name,100)||p.name;p.icon=entityText(fields.icon,12)||'🎒';p.spec={...p.spec,destination:entityText(fields.destination,60)||'My trip',days:planInt(fields.days,1,30),people:planInt(fields.people,1,12),style:entityText(fields.style,40)||'travel',when:entityText(fields.when,100),extra:entityText(fields.extra,1000)};plannerEpoch++;plannerCandidate=null},'Trip details saved · quantities kept; Optimize to review new needs')}
function entityEditTrip(id){const p=tripPlans.find(p=>p.id===id);if(!p)return;const s=p.spec;entityForm(`<label>Trip name<input id="entityTripName" maxlength="100" required value="${esc(p.name)}"></label><label>Emoji<input id="entityTripIcon" maxlength="12" value="${esc(p.icon||'🎒')}"></label><label>Destination<input id="entityDestination" maxlength="60" value="${esc(s.destination)}"></label><div class="entity-form-grid"><label>Days<input id="entityDays" type="number" min="1" max="30" value="${s.days}"></label><label>People<input id="entityPeople" type="number" min="1" max="12" value="${s.people}"></label></div><label>Trip style<input id="entityStyle" list="entityStyles" maxlength="40" value="${esc(s.style)}"></label><datalist id="entityStyles"><option value="hike"><option value="family"><option value="camp"><option value="travel"><option value="beach"><option value="snow"><option value="evac"></datalist><label>When<input id="entityWhen" maxlength="100" value="${esc(s.when)}"></label><label>Anything else?<textarea id="entityExtra" maxlength="1000">${esc(s.extra)}</textarea></label><p class="hint">Saved quantities stay as edited. Optimize separately to review changed trip needs.</p>`);$('entityForm').onsubmit=e=>{e.preventDefault();if(entitySaveTrip(id,{name:$('entityTripName').value,icon:$('entityTripIcon').value,destination:$('entityDestination').value,days:$('entityDays').value,people:$('entityPeople').value,style:$('entityStyle').value,when:$('entityWhen').value,extra:$('entityExtra').value}))entityClose()}}
function entityDuplicateTrip(id){const p=tripPlans.find(p=>p.id===id);if(!p||tripPlans.length>=200)return false;return entityCommit(()=>{const next=entityClone(p);next.id='plan_'+entityId();next.name=(p.name+' · Copy').slice(0,100);next.state='active';next.hidden=false;next.createdAt=new Date().toISOString();next.endedAt='';next.returnItems=[];next.consumed=[];const owned=new Map(planEligible(next.spec).map(i=>[i.id,i]));next.items=next.items.flatMap(r=>{const i=owned.get(r.inventoryId),qty=Math.min(r.quantity,planInt(i?.qty));if(qty<r.quantity){const old=next.missing.find(m=>m.inventoryId===r.inventoryId);if(old)old.quantity=planInt(old.quantity+r.quantity-qty,1);else next.missing.push({name:items.find(i=>i.id===r.inventoryId)?.name||'Previously planned gear',quantity:r.quantity-qty,inventoryId:r.inventoryId,reason:'Stock changed since original trip',category:i?.category||'Other'})}return qty?[{...r,quantity:qty,packed:0}]:[]});tripPlans.push(next);customization.tripOrder=[next.id,...orderedPlans().map(p=>p.id).filter(x=>x!==next.id)]},'New trip created · packing starts empty')}
function entitySaveMissing(n,fields){const p=planCurrent(),m=p?.missing[n];if(!p||!m||p.state==='ended'||!entityText(fields.name))return false;return entityCommit(()=>{if(m.name!==entityText(fields.name)){p.missingExcluded=[...(p.missingExcluded||[]),m.inventoryId||m.name.toLowerCase()];m.inventoryId='';}m.locked=true;m.name=entityText(fields.name);m.quantity=planInt(fields.quantity,1);m.reason=entityText(fields.reason,400);m.category=entityText(fields.category,100)||'Other'},'Missing item updated')}
function entityEditMissing(id){const m=planCurrent()?.missing[Number(id)];if(!m)return;entityForm(`<label>Item name<input id="entityMissingName" required maxlength="200" value="${esc(m.name)}"></label><label>Quantity needed<input id="entityMissingQty" type="number" min="1" max="999" value="${m.quantity}"></label><label>Type<input id="entityMissingCategory" maxlength="100" value="${esc(m.category)}"></label><label>Why / notes<textarea id="entityMissingReason" maxlength="400">${esc(m.reason)}</textarea></label>`);$('entityForm').onsubmit=e=>{e.preventDefault();if(entitySaveMissing(Number(id),{name:$('entityMissingName').value,quantity:$('entityMissingQty').value,category:$('entityMissingCategory').value,reason:$('entityMissingReason').value}))entityClose()}}
function entityToggleHidden(kind,id){return entityCommit(()=>{if(kind==='kit')customization.zones[id]={...zoneMeta(id),hidden:!zoneMeta(id).hidden};else {const p=tripPlans.find(p=>p.id===id);if(!p)throw Error('Trip not found');p.hidden=!p.hidden}},'Visibility updated · gear and packing retained')}
function renderHiddenEntities(){const host=$('hiddenEntities');if(!host)return;const kits=orderedZones(true).filter(([id])=>zoneMeta(id).hidden),trips=orderedPlans().filter(p=>p.hidden);host.innerHTML=kits.map(([id,z])=>`<button type="button" class="entity-action" data-show-kind="kit" data-show-id="${id}">Show ${esc(z.name)}</button>`).join('')+trips.map(p=>`<button type="button" class="entity-action" data-show-kind="trip" data-show-id="${esc(p.id)}">Show ${esc(p.name)}</button>`).join('')||'<p class="hint">No hidden kits or trips.</p>'}
function entityAction(action){if(!entityContext)return;const {kind,id}=entityContext;if(action==='back'){entityActions();return}if(action==='up'||action==='down'){entityNudge(kind,id,action==='up'?-1:1);return}if(action==='edit'){if(kind==='kit')entityEditKit(id);else if(kind==='trip')entityEditTrip(id);else if(kind==='missing')entityEditMissing(id);else {entityClose();if(kind==='gear')advancedOpen(items.find(x=>x.id===id)?.place,id);else planEditItem(id)}return}if(action==='quick'||action==='gear-details'){entityClose();if(action==='quick')quickOpen(null,id);else {advancedOpen(items.find(x=>x.id===id)?.place,id)}return}if(action==='move'){entityForm('<label>Move to kit / storage<select id="entityMoveZone">'+orderedZones(true).map(([id,z])=>`<option value="${id}">${esc(z.name)}</option>`).join('')+'</select></label>');$('entityForm').onsubmit=e=>{e.preventDefault();if(entityMoveGear(id,$('entityMoveZone').value))entityClose()};return}if(action==='status'){entityClose();openMove(id);return}if(action==='archive'){entityClose();archiveItem(id);return}if(action==='duplicate'){if(entityDuplicateTrip(id))entityClose();return}if(action==='hide'){if(entityToggleHidden(kind,id))entityClose();return}if(action==='acquire'){entityClose();planAcquire(Number(id));return}if(action==='remove'){if(kind==='trip-item')entityCommit(()=>{const p=planCurrent();if(p.state==='ended')throw Error('Past trips are read-only');p.items=p.items.filter(r=>r.inventoryId!==id);if(!p.excluded.includes(id))p.excluded.push(id)},'Removed from trip · owned stock unchanged');else entityCommit(()=>{const p=planCurrent();if(p.state==='ended')throw Error('Past trips are read-only');const m=p.missing[Number(id)];p.missingExcluded=[...(p.missingExcluded||[]),m.inventoryId||m.name.toLowerCase()];p.missing.splice(Number(id),1)},'Removed from missing list');entityClose()}}
function entityTarget(el){return el?.closest?.('[data-entity-kind][data-entity-id]')||null}
function entityDropIntent(source,target,y){
 if(!target)return null;
 const zone=target.closest?.('[data-drop-zone]');
 if(source.kind==='gear'&&zone){const i=items.find(x=>x.id===source.id),id=zone.dataset.dropZone;if(!i||!ZONES[id]||i.place===id||(/propane|fuel canister|butane|gas cylinder/i.test(i.name)&&id!=='shared')||zoneProtected(i.place))return null;return {type:'zone',el:zone,id,label:'Move to '+ZONES[id].name}}
 const assignment=target.closest?.('[data-assign-person]');
 if(source.kind==='trip-item'&&assignment){const p=planCurrent(),i=items.find(x=>x.id===source.id);if(!p||p.state==='ended'||(/propane|fuel canister|butane|gas cylinder/i.test(i?.name||'')&&assignment.dataset.assignBag!=='Outdoor fuel storage'))return null;return {type:'assignment',el:assignment,person:assignment.dataset.assignPerson,bag:assignment.dataset.assignBag,label:'Move to '+assignment.dataset.assignPerson+' · '+assignment.dataset.assignBag}}
 const row=entityTarget(target);if(!row||row.dataset.entityKind!==source.kind||row.dataset.entityId===source.id)return null;
 if(source.kind==='gear'){const a=items.find(i=>i.id===source.id),b=items.find(i=>i.id===row.dataset.entityId);if(!a||!b||entityGearGroup(a)!==entityGearGroup(b)||!!a.archived!==!!b.archived)return null}
 if((source.kind==='trip-item'||source.kind==='missing')&&planCurrent()?.state==='ended')return null;
 if(source.kind==='trip-item'){const p=planCurrent(),a=p?.items.find(r=>r.inventoryId===source.id),b=p?.items.find(r=>r.inventoryId===row.dataset.entityId);if(!a||!b||a.departureDay!==b.departureDay||(a.packed>=a.quantity)!==(b.packed>=b.quantity)||journeyCollectionKey(a)!==journeyCollectionKey(b))return null}
 const rect=row.getBoundingClientRect?.(),after=!!rect&&Number.isFinite(y)&&y>=rect.top+rect.height/2;
 return {type:'reorder',el:row,id:row.dataset.entityId,after,label:(after?'After ':'Before ')+entityLabel(source.kind,row.dataset.entityId)};
}
function entityApplyDrop(source,intent){if(!intent)return false;if(intent.type==='zone')return entityMoveGear(source.id,intent.id);if(intent.type==='assignment')return entityAssignTrip(source.id,intent.person,intent.bag);return entityReorder(source.kind,source.id,intent.id,intent.after,source.planId)}
function entityDrop(source,target,y){return entityApplyDrop(source,entityDropIntent(source,target,y))}
// A single axis-locked controller owns swipes, row holds and reorder grips.
let openEntitySwipe=null,entityGhostClick=null,resetEntityGesture=()=>{};
function suppressEntityClick(row){entityGhostClick={row,expires:Date.now()+700}}
function consumeEntityGhostClick(e){
 if(!entityGhostClick||Date.now()>entityGhostClick.expires){entityGhostClick=null;return false}
 if(e.detail===0)return false; // Keyboard and assistive activation are always usable.
 const source=entityGhostClick.row,target=entityTarget(e.target);entityGhostClick=null;
 return !!source&&(target===source||target?.dataset.entityKind===source.dataset.entityKind&&target?.dataset.entityId===source.dataset.entityId);
}
function entitySwipeSpecs(kind,id){
 if(kind==='gear'){
  const i=items.find(i=>i.id===id);
  if(!i)return {leading:[],trailing:[]};
  if(i.archived)return {leading:[['restore','Restore','green']],trailing:[['delete','Delete','red']]};
  return {leading:[['plus','＋1','green'],['many','Add…','blue']],trailing:[['edit','Edit','blue'],['minus',Number(i.qty)>0?'−1':'Archive',Number(i.qty)>0?'amber':'red']]};
 }
 if(kind==='kit'||kind==='trip')return {leading:[['edit','Edit','blue']],trailing:[['more','More','gray']]};
 if(kind==='trip-item'){
  const r=planCurrent()?.items.find(r=>r.inventoryId===id),owned=items.find(i=>i.id===id&&!i.archived);
  if(r&&r.packed<r.quantity&&r.packed>=journeyAvailable(planCurrent(),id))return {leading:[['edit','Edit qty','amber']],trailing:[['edit','Edit','blue'],['more','More','gray']]};
  return {leading:[['pack',r?.packed===r?.quantity?'Unpack':'Pack','green']],trailing:[['edit','Edit','blue'],['more','More','gray']]};
 }
 return {leading:[['acquire','Acquired','green']],trailing:[['edit','Edit','blue'],['more','More','gray']]};
}
function entitySwipeRails(kind,id){
 const spec=entitySwipeSpecs(kind,id);
 return ['leading','trailing'].map(side=>`<div class="swipe-actions swipe-actions-${side}" data-swipe-rail="${side}" aria-hidden="true" inert>${spec[side].map(([action,label,color])=>`<button type="button" class="swipe-action swipe-${color}" data-swipe-action="${action}" aria-label="${esc(label)} ${esc(entityLabel(kind,id))}">${esc(label)}</button>`).join('')}</div>`).join('');
}
function entitySwipeSurface(row){return row.querySelector('.entity-surface,.swipe-surface')||row}
function entitySwipeWidth(row,side){return entitySwipeSpecs(row.dataset.entityKind,row.dataset.entityId)[side].length*80}
// A revealed row must remain touchable for the closing swipe. `inert` on its
// surface prevents hit testing in Safari, so only the hidden action rails use it.
const swipeTabStops=new WeakMap(),swipeReturnFocus=new WeakMap();
function paintEntitySwipe(row,offset,settled=false){
 const surface=entitySwipeSurface(row),open=settled&&offset!==0;
 row.classList.toggle('swipe-tracking',!settled&&offset!==0);
 row.classList.toggle('swipe-open',open);
 row.dataset.swipeOffset=String(offset);
 row.dataset.swipeOpen=open?(offset>0?'leading':'trailing'):'';
 surface.style.transform=offset?'translateX('+offset+'px)':'';
 surface.inert=false;if(!open)surface.setAttribute('aria-hidden','false');
 if(open&&!swipeTabStops.has(surface)){
  const stops=[...surface.querySelectorAll('button,input,select,textarea,summary,a[href],[tabindex]')].map(el=>[el,el.getAttribute('tabindex')]);
  swipeTabStops.set(surface,stops);for(const [el]of stops)el.setAttribute('tabindex','-1');
 }else if(!open&&swipeTabStops.has(surface)){
  for(const [el,value]of swipeTabStops.get(surface))if(value===null)el.removeAttribute('tabindex');else el.setAttribute('tabindex',value);
  swipeTabStops.delete(surface);
 }
 for(const rail of row.querySelectorAll('[data-swipe-rail]')){
  const visible=open&&rail.dataset.swipeRail===(offset>0?'leading':'trailing');
  const hadFocus=rail.contains?.(document.activeElement);
  rail.inert=!visible;rail.setAttribute('aria-hidden',String(!visible));
  if(visible&&surface.contains?.(document.activeElement)){swipeReturnFocus.set(row,document.activeElement);rail.querySelector('button')?.focus({preventScroll:true})}
  else if(!open&&hadFocus){const previous=swipeReturnFocus.get(row);if(previous?.isConnected)previous.focus({preventScroll:true})}
 }
 surface.setAttribute('aria-hidden',String(open));if(!open)swipeReturnFocus.delete(row);
}
function closeEntitySwipe(){if(openEntitySwipe){paintEntitySwipe(openEntitySwipe,0,true);openEntitySwipe=null}}
function settleEntitySwipe(row,offset){closeEntitySwipe();paintEntitySwipe(row,offset,true);if(offset)openEntitySwipe=row}
function entitySwipeAction(kind,id,action){
 closeEntitySwipe();
 if(kind==='gear'){
  if(action==='plus')changeQty(id,1);
  else if(action==='many')openQty(id);
  else if(action==='minus')changeQty(id,-1);
  else if(action==='restore')archiveItem(id);
  else if(action==='delete')removeItem(id);
  else if(action==='edit')quickOpen(null,id);
  else entityOpen(kind,id);
 }else if(action==='more')entityOpen(kind,id);
 else if(kind==='kit'||kind==='trip'){entityOpen(kind,id);entityAction('edit')}
 else if(kind==='trip-item'){
  const p=planCurrent(),r=p?.items.find(r=>r.inventoryId===id);
  if(!r||p.state==='ended')return;
  if(action==='pack')planSetPacked(id,r.packed===r.quantity?0:r.quantity);
  else planEditItem(id);
 }else if(planCurrent()?.state!=='ended'){
  if(action==='acquire')planAcquire(Number(id));
  else{entityOpen(kind,id);entityEditMissing(id)}
 }
}
function initEntityGestures(){
 let gesture=null,hold=null,frame=null,over=null;
 const clearHold=()=>{if(hold!==null)clearTimeout(hold);hold=null};
 let dropIntent=null;
 const mark=el=>{if(over){over.classList.remove('entity-drop-over','entity-insert-before','entity-insert-after');over.removeAttribute?.('data-drop-label')}over=el};
 const preview=()=>{
  if(!touchDrag)return;
  // Remove the temporary gap before hit testing: its own layout must not change the destination.
  mark(null);
  const g=touchDrag;dropIntent=entityDropIntent(g,document.elementFromPoint(g.x,g.y),g.y);
  if(dropIntent){over=dropIntent.el;over.classList.add(dropIntent.type==='reorder'?(dropIntent.after?'entity-insert-after':'entity-insert-before'):'entity-drop-over');over.setAttribute?.('data-drop-label','Drop here');}
  $('entityGhost').textContent=entityLabel(g.kind,g.id)+'\n'+(dropIntent?'↓ '+dropIntent.label:'Move over a row or destination');
 };
 const visible=row=>row?.isConnected!==false&&!row.closest?.('.hidden')&&(!row.getClientRects||row.getClientRects().length>0);
 const release=(el,pointer)=>{if(el?.hasPointerCapture?.(pointer))el.releasePointerCapture(pointer)};
 const stopDrag=()=>{
  if(touchDrag){const g=touchDrag;touchDrag=null;g.row.classList.remove('entity-dragging');release(g.handle,g.pointer)}
  if(frame!==null)cancelAnimationFrame(frame);frame=null;mark(null);dropIntent=null;
  $('entityGhost').classList.add('hidden');$('entityDropDock').classList.add('hidden');document.body.classList.remove('entity-drag-active');
 };
 const cancel=()=>{
  const source=touchDrag?.row||gesture?.row;if(touchDrag||gesture?.axis==='x'||gesture?.moved)suppressEntityClick(source);
  clearHold();const old=gesture;gesture=null;
  if(old){paintEntitySwipe(old.row,0,true);release(old.row,old.pointer)}
  stopDrag();closeEntitySwipe();
 };
 resetEntityGesture=cancel;
 const tick=()=>{
  if(!touchDrag)return;
  const g=touchDrag,scroll=g.kind==='trip-item'||g.kind==='missing'?$('plannerLayer').querySelector('.scan-sheet'):openZone?$('detail').querySelector('.sheet'):window;
  const dy=g.y<130?-10:g.y>window.innerHeight-150?10:0;
  if(dy)scroll?.scrollBy({top:dy,behavior:'auto'});
  if(g.kind==='gear'&&g.y>window.innerHeight-140){const dock=$('entityDropDock').querySelector('div'),dx=g.x<45?-9:g.x>window.innerWidth-45?9:0;if(dx)dock?.scrollBy({left:dx,behavior:'auto'})}
  preview();frame=requestAnimationFrame(tick);
 };
 const beginDrag=p=>{
  hold=null;if(!visible(p.row)){cancel();return}
  gesture=null;closeEntitySwipe();touchDrag={...p,x:p.startX,y:p.startY,planId:plannerTripId};
  p.row.classList.add('entity-dragging');document.body.classList.add('entity-drag-active');p.handle.setPointerCapture?.(p.pointer);
  $('entityGhost').textContent=entityLabel(p.kind,p.id);$('entityGhost').classList.remove('hidden');
  $('entityGhost').style.left=Math.max(8,p.startX-80)+'px';$('entityGhost').style.top=Math.max(8,p.startY-70)+'px';
  if(p.kind==='gear'){$('entityDropDock').innerHTML='<small>Drop into kit / storage</small><div>'+orderedZones().map(([id,z])=>`<span data-drop-zone="${id}">${esc(z.name)}</span>`).join('')+'</div>';$('entityDropDock').classList.remove('hidden')}
  frame=requestAnimationFrame(tick);
 };
 document.addEventListener('pointerdown',e=>{
  // A fresh touch is a deliberate action, never a ghost from a previous swipe.
  entityGhostClick=null;
  if(e.isPrimary===false){cancel();return}
  if(e.button!==0||selectMode||journeySelecting)return;
  const row=entityTarget(e.target);
  if(openEntitySwipe&&row!==openEntitySwipe)closeEntitySwipe();
  if(!row||e.clientX<24||e.clientX>window.innerWidth-24)return;
  if(e.target.closest?.('[data-swipe-action]'))return;
  if(gesture||touchDrag)cancel();
  const base=Number(row.dataset.swipeOffset)||0;
  const grip=e.target.closest?.('[data-drag-kind]');
  if(!grip&&e.target.closest?.('input,textarea,select,a,.entity-more,.select-dot'))return;
  const p={kind:row.dataset.entityKind,id:row.dataset.entityId,row,handle:grip,pointer:e.pointerId,startX:e.clientX,startY:e.clientY,dx:0,axis:null,base};
  gesture=p;
  if(grip)hold=setTimeout(()=>beginDrag(p),320);
  else if(!base&&!e.target.closest?.('button,summary'))hold=setTimeout(()=>{
   hold=null;if(gesture!==p||!visible(p.row))return;gesture=null;suppressEntityClick(p.row);entityOpen(p.kind,p.id);
  },500);
 });
 document.addEventListener('pointermove',e=>{
  if(touchDrag?.pointer===e.pointerId){
   e.preventDefault();touchDrag.x=e.clientX;touchDrag.y=e.clientY;
   $('entityGhost').style.left=Math.max(8,Math.min(window.innerWidth-220,e.clientX-80))+'px';$('entityGhost').style.top=Math.max(8,e.clientY-70)+'px';
   preview();return;
  }
  const g=gesture;if(!g||g.pointer!==e.pointerId)return;
  if(!visible(g.row)){cancel();return}
  const dx=e.clientX-g.startX,dy=e.clientY-g.startY,ax=Math.abs(dx),ay=Math.abs(dy);
  if(ax>8||ay>8){g.moved=true;clearHold()}
  if(g.handle){if(ax>8||ay>8){suppressEntityClick(g.row);gesture=null}return}
  if(!g.axis){
   if(ay>=8&&ay>=ax){suppressEntityClick(g.row);gesture=null;paintEntitySwipe(g.row,0,true);closeEntitySwipe();return}
   if(ax<12||ax<ay*1.3)return;
   g.axis='x';g.row.setPointerCapture?.(g.pointer);
   if(openEntitySwipe&&openEntitySwipe!==g.row)closeEntitySwipe();
  }
  // Once horizontal, never switch axes midway and leave a translated row behind.
  e.preventDefault();g.dx=dx;
  const total=g.base+dx,limit=entitySwipeWidth(g.row,total>=0?'leading':'trailing');
  paintEntitySwipe(g.row,Math.max(-limit,Math.min(limit,total)),false);
 },{passive:false});
 document.addEventListener('pointerup',e=>{
  if(touchDrag?.pointer===e.pointerId){
   touchDrag.x=e.clientX;touchDrag.y=e.clientY;preview();const g=touchDrag,intent=dropIntent;stopDrag();clearHold();suppressEntityClick(g.row);
   if(!entityApplyDrop(g,intent))toast('Move cancelled');return;
  }
  const g=gesture;if(!g||g.pointer!==e.pointerId)return;
  gesture=null;clearHold();release(g.row,g.pointer);
  if(!visible(g.row)){paintEntitySwipe(g.row,0,true);closeEntitySwipe();return}
  if(g.axis!=='x'){
   if(g.base||g.moved){suppressEntityClick(g.row);paintEntitySwipe(g.row,0,true);closeEntitySwipe()}
   return;
  }
  suppressEntityClick(g.row);
  g.dx=e.clientX-g.startX;const total=g.base+g.dx,side=total>=0?'leading':'trailing',width=entitySwipeWidth(g.row,side);
  const closing=g.base&&Math.sign(g.base)!==Math.sign(g.dx)&&Math.abs(g.dx)>=32&&Math.sign(total)===Math.sign(g.base);
  const offset=!closing&&Math.abs(total)>=Math.min(32,width*.3)?Math.sign(total)*width:0;
  settleEntitySwipe(g.row,offset);
 });
 document.addEventListener('pointercancel',e=>{if((gesture&&gesture.pointer===e.pointerId)||(touchDrag&&touchDrag.pointer===e.pointerId))cancel()});
 document.addEventListener('lostpointercapture',e=>{if((gesture&&gesture.pointer===e.pointerId&&e.target===gesture.row)||(touchDrag&&touchDrag.pointer===e.pointerId&&e.target===touchDrag.handle))cancel()});
 window.addEventListener('blur',cancel);window.addEventListener('resize',cancel);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)cancel()});
 document.addEventListener('scroll',()=>{if(!touchDrag)closeEntitySwipe()},true);
 document.addEventListener('click',e=>{
  if(selectMode||journeySelecting)return;
  if(consumeEntityGhostClick(e)){e.preventDefault();e.stopImmediatePropagation();return}
  const row=entityTarget(e.target),action=e.target.closest?.('[data-swipe-action]');
  if(action&&row){e.preventDefault();e.stopImmediatePropagation();entitySwipeAction(row.dataset.entityKind,row.dataset.entityId,action.dataset.swipeAction);return}
  if(openEntitySwipe&&row===openEntitySwipe){e.preventDefault();e.stopImmediatePropagation();closeEntitySwipe();return}
  if(openEntitySwipe)closeEntitySwipe();
  const grip=e.target.closest?.('[data-drag-kind]');
  if(grip){e.preventDefault();e.stopImmediatePropagation();entityOpen(grip.dataset.dragKind,grip.dataset.dragId);return}
  const menu=e.target.closest?.('[data-entity-menu]');
  if(menu){e.preventDefault();e.stopImmediatePropagation();entityOpen(menu.dataset.entityMenu,menu.dataset.entityId)}
 },true);
 document.addEventListener('contextmenu',e=>{
  const row=entityTarget(e.target);
  if(selectMode||journeySelecting){if(row)e.preventDefault();return}
  if(row&&!e.target.closest('input,textarea,select')){e.preventDefault();if(touchDrag||e.target.closest('[data-drag-kind]'))return;cancel();entityOpen(row.dataset.entityKind,row.dataset.entityId)}
 });
 document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&(touchDrag||gesture||openEntitySwipe)){e.preventDefault();e.stopImmediatePropagation();cancel()}
 },true);
}

function initEntities(){$('entityClose').onclick=entityClose;$('entityShade').onclick=entityClose;$('entityBody').onclick=e=>{const b=e.target.closest('[data-entity-action]');if(b)entityAction(b.dataset.entityAction)};$('presetCustomize').onclick=()=>entityEditPreset($('tripSelect').value);$('presetNew').onclick=()=>entityEditPreset('');$('newKit').onclick=()=>{entityOpen('kit','');$('entityTitle').textContent='New empty kit';entityEditKit('')};$('detailCustomize').onclick=()=>entityOpen('kit',openZone);$('plannerCustomize').onclick=()=>entityOpen('trip',plannerTripId);$('plannerAssignments').onclick=entityEditAssignments;$('hiddenEntities').onclick=e=>{const b=e.target.closest('[data-show-kind]');if(b)entityToggleHidden(b.dataset.showKind,b.dataset.showId)};
 initEntityGestures();renderHiddenEntities()}
function validatedAssignments(raw){if(raw===undefined)return [];if(!Array.isArray(raw)||raw.length>100)throw Error('Invalid bags / people');return raw.map(a=>{if(!a||typeof a.person!=='string'||typeof a.bag!=='string')throw Error('Invalid bag assignment');return {person:entityText(a.person,60)||'Shared',bag:entityText(a.bag,60)||'Day bag'}})}
function entitySaveAssignments(id,rows){const p=tripPlans.find(p=>p.id===id);if(!p||p.state==='ended')return false;const assignments=validatedAssignments(rows);return entityCommit(()=>{p.assignments=assignments},'Bag and person drop targets saved')}
function entityEditAssignments(){const p=planCurrent();if(!p)return;entityOpen('trip',p.id);$('entityTitle').textContent='Bags & people';const rows=[...new Map([...(p.assignments||[]),...p.items].map(r=>[r.person+'|'+r.bag,{person:r.person,bag:r.bag}])).values()];entityForm('<label>One Person | Bag per line<textarea id="entityAssignmentRows" rows="6" placeholder="Person 1 | Blue backpack&#10;Person 2 | Day bag&#10;Shared | Car">'+esc(rows.map(r=>r.person+' | '+r.bag).join('\n'))+'</textarea></label><p class="hint">These appear as drop targets above your trip items. Hold an item’s ⠿ and drop it onto a bag/person. Existing assignments stay until you move their gear.</p>');$('entityForm').onsubmit=e=>{e.preventDefault();try{const rows=$('entityAssignmentRows').value.split('\n').filter(x=>x.trim()).map(x=>{const at=x.indexOf('|');if(at<0)throw Error('Use Person | Bag on each line');return {person:x.slice(0,at).trim(),bag:x.slice(at+1).trim()}});if(entitySaveAssignments(p.id,rows))entityClose()}catch(err){$('entityError').textContent=err.message}}}
function departurePresetData(){return {...Object.fromEntries(Object.entries(groups).map(([id,zones])=>[id,{name:({hike:'Quick hike',family:'Family / longer hike',camp:'Camping / outdoor trip',evac:'Evacuation'})[id],zones}])),...(customization.presets||{})}}
function entitySavePreset(id,name,zones){if(!entityText(name,60))return false;const fresh=!id;id=id||'preset_'+entityId();if(fresh&&Object.keys(customization.presets||{}).length>=30)return false;return entityCommit(()=>{customization.presets={...(customization.presets||{}),[id]:{name:entityText(name,60),zones:[...new Set(zones)].filter(z=>Object.hasOwn(ZONES,z))}}},'Departure checklist saved')}
function entityEditPreset(id){const preset=departurePresetData()[id]||{name:'',zones:[]};entityOpen('preset',id);$('entityTitle').textContent=id?'Customize departure checklist':'New departure checklist';entityForm(`<label>Checklist name<input id="entityPresetName" required maxlength="60" value="${esc(preset.name)}"></label><p class="hint">Include departure-day gear from these kits:</p>`+orderedZones(true).map(([zone,z])=>`<label class="entity-checkbox"><input type="checkbox" data-preset-zone="${zone}" ${preset.zones.includes(zone)?'checked':''}>${esc(z.name)}</label>`).join(''));$('entityForm').onsubmit=e=>{e.preventDefault();const zones=[...$('entityBody').querySelectorAll('[data-preset-zone]')].filter(el=>el.checked).map(el=>el.dataset.presetZone);if(entitySavePreset(id,$('entityPresetName').value,zones))entityClose()}}
function entitySwipeTripRow(id,content){
 const inner=content.replace(/data-entity-kind="trip-item" data-entity-id="[^"]*"/,'');
 return `<div class="entity-card trip-swipe-row" data-entity-kind="trip-item" data-entity-id="${esc(id)}">${entitySwipeRails('trip-item',id)}<div class="entity-surface">${inner}</div></div>`;
}
