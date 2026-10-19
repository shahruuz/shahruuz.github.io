// Included in verify.cjs's isolated VM; no personal browser storage is accessed.
const savedExperience=run('({snapshot:entitySnapshot(),trip:plannerTripId,draft:tripDraft,current,openZone})');
test('Trip progress includes missing units instead of showing a misleading 0/0',()=>{
 run(`journeyResetPacking();items=[
 {id:'xp_lamp',name:'Headlamp',place:'shared',spot:'S2 · top shelf',status:'stock',qty:3,note:'Keep note',photo:'data:image/jpeg;base64,eA==',weightG:90},
 {id:'xp_bottle',name:'Water bottle',place:'dry10',spot:'Side pocket',status:'stock',qty:1},
 {id:'xp_phone',name:'Phone',place:'shared',status:'day',qty:1},
 {id:'xp_map',name:'Paper map',place:'shared',status:'stock',qty:1}];
 const spec={destination:'QA outing',days:2,people:2,style:'hike',when:'',extra:''};
 const p=planNormalize({name:'QA packing',items:[
 {inventoryId:'xp_lamp',quantity:3,person:'Shared',bag:'Day bag',reason:'Light'},
 {inventoryId:'xp_bottle',quantity:1,person:'Person 1',bag:'Day bag',reason:'Water'},
 {inventoryId:'xp_phone',quantity:1,person:'Person 1',bag:'Day bag',reason:'Call',departureDay:true}],
 missing:[{name:'Snacks',quantity:4,reason:'Food',category:'Water & food'}],assumptions:[]},spec);
 p.items[1].packed=1;
 const other=planNormalize({name:'Other outing',items:[{inventoryId:'xp_lamp',quantity:1}],missing:[],assumptions:[]},spec);other.items[0].packed=1;
 tripPlans=[p,other];plannerTripId=p.id;tripDraft=p;current='bags';journeyRemember(p.id);persist();plannerRender();journeyRenderHome();`);
 assert(elements.get('plannerSummary').innerHTML.includes('1 of 9 packed'));
 assert(elements.get('homeNext').innerHTML.includes('of 9'));
 const old=storage.get('fieldkit_inventory_v1');run('plannerRender();journeyRenderHome()');assert.equal(storage.get('fieldkit_inventory_v1'),old);
});
test('Up next names the storage spot, prioritizes collection and keeps missing supplies visible',()=>{
 assert(elements.get('journeyNext').innerHTML.includes('Up next: Headlamp'));
 assert(elements.get('journeyNext').innerHTML.includes('S2 · top shelf'));
 run('planCurrent().items.forEach(r=>r.packed=r.quantity);plannerRender()');
 assert(elements.get('journeyNext').innerHTML.includes('4 still missing'));
 assert(!elements.get('homeNext').innerHTML.includes('Packing complete'));
 run('planCurrent().items[0].packed=0;planCurrent().items[2].packed=0;plannerRender()');
});
test('Trip selection accepts real row clicks while swipe and context menus are suspended',()=>{
 elements.get('tripSelectToggle').onclick();assert.equal(run('journeySelecting'),true);
 const row=swipeFixture('trip-item','xp_lamp'),button=element('tripSelectionButton');button.dataset.tripSelect='xp_lamp';
 button.closest=q=>q==='button'?button:q==='[data-entity-kind][data-entity-id]'?row.row:null;
 assert.equal(clickThrough(button,[elements.get('plannerPacks')]).stopped,false);
 assert.equal(run('journeySelected.has("xp_lamp")'),true);
 row.swipe(70);assert.equal(run('openEntitySwipe'),null);
 gestureEvent('contextmenu',row.content);assert.equal(run('entityContext'),null);
 assert.equal(run('planCurrent().items[0].packed'),0);
});
test('Trip Select all respects To pack only and never selects or acquires missing supplies',()=>{
 elements.get('tripRemainingToggle').onclick();assert.equal(run('journeyRemainingOnly'),true);
 elements.get('tripSelectAll').onclick();assert.equal(run('journeySelected.size'),2);
 assert.equal(run('journeySelected.has("xp_bottle")'),false);
 assert.equal(elements.get('tripSelectAll').textContent,'Deselect all');
 assert(!elements.get('plannerPacks').innerHTML.includes('data-trip-select="xp_bottle"'));
 elements.get('tripSelectAll').onclick();assert.equal(run('journeySelected.size'),0);
 elements.get('tripSelectAll').onclick();assert.equal(run('journeySelected.size'),2);
 assert.equal(run('planCurrent().missing[0].quantity'),4);assert.equal(run('items.length'),4);
});
test('Bulk trip pack caps reserved units, preserves ownership and supports one complete Undo',()=>{
 const before=run('JSON.stringify(items)'),plans=run('JSON.stringify(tripPlans)');
 assert.equal(run('journeyBulkPack(true)'),true);
 assert.equal(run('planCurrent().items[0].packed'),2);assert.equal(run('planCurrent().items[2].packed'),1);
 assert.equal(run('JSON.stringify(items)'),before);assert.equal(run('journeySelecting'),false);
 assert.equal(run('planCurrent().missing[0].quantity'),4);
 run('undoAction()');assert.equal(run('JSON.stringify(tripPlans)'),plans);assert.equal(run('JSON.stringify(items)'),before);
});
test('Bulk packing never unpacks already packed gear after owned stock changes',()=>{
 run('journeyRemainingOnly=false;journeySetSelecting(true);journeySelectAll();items[1].qty=0;persist()');
 assert.equal(run('journeyBulkPack(true)'),true);assert.equal(run('planCurrent().items[1].packed'),1);
 run('items[1].qty=1;persist()');
});
test('Failed bulk packing retains the original trip, ownership and selection for retry',()=>{
 run('journeySetSelecting(true);journeySelectAll()');
 const before=storage.get('fieldkit_inventory_v1'),state=run('JSON.stringify(entitySnapshot())'),setter=context.localStorage.setItem;
 context.localStorage.setItem=(k,v)=>{if(k==='fieldkit_inventory_v1')throw Error('quota');setter(k,v)};
 assert.equal(run('journeyBulkPack(false)'),false);assert.equal(run('JSON.stringify(entitySnapshot())'),state);
 assert.equal(storage.get('fieldkit_inventory_v1'),before);assert.equal(run('journeySelecting'),true);assert.equal(run('journeySelected.size'),3);
 context.localStorage.setItem=setter;
});
test('Unpack selected updates only this trip and supports an exact Undo',()=>{
 const before=run('JSON.stringify(tripPlans)'),owned=run('JSON.stringify(items)');
 assert.equal(run('journeyBulkPack(false)'),true);assert.equal(run('planCurrent().items.every(r=>!r.packed)'),true);
 assert.equal(run('tripPlans[1].items[0].packed'),1);assert.equal(run('JSON.stringify(items)'),owned);
 run('undoAction()');assert.equal(run('JSON.stringify(tripPlans)'),before);
});
test('Trip selection and filters reset when leaving, and finished trips cannot bulk-pack',()=>{
 run('journeySetSelecting(true);journeySelectAll();journeyRemainingOnly=true;plannerClose()');
 assert.equal(run('journeySelecting'),false);assert.equal(run('journeySelected.size'),0);assert.equal(run('journeyRemainingOnly'),false);
 run('plannerOpen(tripPlans[0].id);planCurrent().state="ended";journeySelecting=true;journeySelected.add("xp_lamp")');
 const before=run('JSON.stringify(tripPlans)');assert.equal(run('journeyBulkPack(true)'),false);assert.equal(run('JSON.stringify(tripPlans)'),before);
 run('planCurrent().state="active";journeyResetPacking();plannerRender()');
});
test('Add owned gear uses a unique selector and saves the chosen item to this trip',()=>{
 elements.set('planOwnedChoice',element('planOwnedChoice'));elements.set('planAddSave',element('planAddSave'));
 run('planAddOwned()');assert(elements.get('planSubpanel').innerHTML.includes('id="planOwnedChoice"'));
 assert(!elements.get('planSubpanel').innerHTML.includes('id="planAddOwned"'));
 elements.get('planOwnedChoice').value='xp_map';elements.get('planAddSave').onclick();
 assert.equal(run('planCurrent().items.some(r=>r.inventoryId==="xp_map"&&r.quantity===1&&r.packed===0)'),true);
 assert.equal(run('items.find(i=>i.id==="xp_map").qty'),1);
});
run('journeyResetPacking()');context.window.restoreExperience=savedExperience;
run('entityApply(window.restoreExperience.snapshot);plannerTripId=window.restoreExperience.trip;tripDraft=window.restoreExperience.draft;current=window.restoreExperience.current;openZone=window.restoreExperience.openZone;persist();entityRefresh()');
