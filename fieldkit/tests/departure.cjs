// Default departure flow, tested separately from the retained ownership engine above.
run('storageBlocked=false;departureViewingId=null;departureChoosing=false;items=[];tripPlans=[];plannerTripId=null;tripDraft=null;$("plannerLayer").classList.add("hidden");introClose();initDeparture();persist()');
for(const id of ['departureAddName','departureName','departureDays','departurePeople','departureEditName','departureEditQty','departureEditPacked','departureEditNeed','departureEditDay','departureEditPlace','departureEditError'])if(!elements.has(id))elements.set(id,element(id));
test('Template creates a usable checklist with zero inventory and no AI',()=>{
 const owned=run('JSON.stringify(items)');assert(run('departureCreate("travel","San Diego weekend",3,3)'));
 assert.equal(run('JSON.stringify(items)'),owned);assert.equal(run('planCurrent().items.length'),0);assert.equal(run('planCurrent().missing.length'),0);
 assert.equal(run('planCurrent().checklist.find(r=>r.name==="Daily outfits").quantity'),9);
 assert.equal(run('planCurrent().checklist.find(r=>r.name==="Phone & charger").quantity'),3);
 assert(run('planCurrent().checklist.every(r=>r.packed===0)'));
 assert(elements.get('homeNext').innerHTML.includes('To pack'));assert(elements.get('homeNext').innerHTML.includes('Before leaving'));
 assert(!elements.get('homeNext').innerHTML.includes('data-plan-acquire'));
});
test('Packing checklist records confirmation without creating owned stock and supports Undo',()=>{
 run('window.checkId=departureCurrent().checklist[0].id');const before=run('JSON.stringify(tripPlans)');assert(run('departureToggle(window.checkId)'));
 assert.equal(run('departureCurrent().checklist[0].packed'),9);assert.equal(run('items.length'),0);
 assert(elements.get('homeNext').innerHTML.includes('departure-packed'));run('undoAction()');assert.equal(run('JSON.stringify(tripPlans)'),before);
});
test('Quick add goes directly to unpacked checklist and keeps inventory empty',()=>{
 assert(run('departureAdd("Amir’s favorite toy")'));assert.equal(run('departureCurrent().checklist.at(-1).packed'),0);assert.equal(run('items.length'),0);
 assert.equal(run('departureAdd("  ")'),false);assert.equal(run('departureAdd("x".repeat(201))'),false);
});
test('Need to get is an explicit blocker and cannot be silently checked packed',()=>{
 run('departureEdit=window.checkId');assert(run('departureSaveEdit({name:"Travel clothes",quantity:9,packed:0,need:true,day:false,place:"Bedroom"})'));
 assert(elements.get('homeNext').innerHTML.includes('Need to resolve'));assert.equal(run('departureToggle(window.checkId)'),false);
 assert.equal(run('departureCurrent().checklist[0].packed'),0);assert(!elements.get('departureLayer').classList.contains('hidden'));
 assert.equal(run('departureSaveEdit({name:"Travel clothes",quantity:9,packed:1,need:true,day:false,place:"Bedroom"})'),false);
 assert(run('departureSaveEdit({name:"Travel clothes",quantity:9,packed:4,need:false,day:true,place:"Bedroom"})'));
 assert.equal(run('departureCurrent().checklist[0].packed'),4);assert.equal(run('departureCurrent().checklist[0].day'),true);
});
test('Full backup and reload preserve checklist names, partial counts, locations and departure flags',()=>{
 const before=run('JSON.stringify(departureCurrent().checklist)');run('persist();load()');assert.equal(run('JSON.stringify(departureCurrent().checklist)'),before);
 assert.equal(JSON.parse(run('toJson()')).tripPlans[0].checklist[0].place,'Bedroom');
 assert.equal(storage.get('fieldkit_empty_start_2026_v1'),'1');
});
test('Repeating a trip keeps edits but resets all packed counts without changing the original',()=>{
 run('window.originalDeparture=planClone(departureCurrent())');const previous=run('JSON.stringify(window.originalDeparture)');
 assert(run('departureRepeat(window.originalDeparture.id)'));
 assert.equal(run('JSON.stringify(tripPlans.find(p=>p.id===window.originalDeparture.id))'),previous);
 assert(run('departureCurrent().checklist.every(r=>r.packed===0)'));
 assert.equal(run('departureCurrent().checklist[0].name'),'Travel clothes');assert.equal(run('departureCurrent().checklist[0].place'),'Bedroom');
 assert.equal(run('departureCurrent().checklist.length'),10);assert.equal(run('items.length'),0);
});
test('Blank list starts genuinely empty; no template inventory is seeded',()=>{
 assert(run('departureCreate("blank","Custom outing",1,1)'));assert.equal(run('departureStats(departureCurrent()).total'),0);
 assert(elements.get('homeNext').innerHTML.includes('Add your first item'));assert(!elements.get('homeNext').innerHTML.includes('Everything on your list'));
 assert.equal(run('departureCreate("hike","",0,1)'),false);assert.equal(run('departureCreate("wrong","Trip",1,1)'),false);
});
test('Legacy suggestion plus moves directly onto checklist unpacked and does not invent ownership',()=>{
 run('departureCurrent().missing=[{name:"Sun hat",quantity:2,category:"Other",reason:"Sun"}];persist();departureRenderHome()');
 assert(run('departureAcquire("missing:0")'));assert.equal(run('departureCurrent().missing.length'),0);
 assert.equal(run('departureCurrent().checklist[0].name'),'Sun hat');assert.equal(run('departureCurrent().checklist[0].packed'),0);assert.equal(run('items.length'),0);
 run('undoAction()');assert.equal(run('departureCurrent().missing.length'),1);assert.equal(run('departureCurrent().checklist.length'),0);
});
test('Unaccepted suggestions stay optional and do not inflate departure readiness',()=>{assert.equal(run('departureStats(departureCurrent()).total'),0);assert.equal(run('departureStats(departureCurrent()).blocked.length'),0);assert(elements.get('homeNext').innerHTML.includes('Suggested additions'));});
test('Mixed old and new trips retain stock conflicts and accurate combined readiness',()=>{
 run(`{items=[{id:'departure_lamp',name:'Headlamp',qty:1,status:'stock',place:'shared',note:'Keep note',photo:'data:image/jpeg;base64,YWJj'}];
 const p=departureCurrent();p.items=[{inventoryId:'departure_lamp',quantity:1,packed:0,departureDay:false}];
 const other=planNormalize({name:'Other trip',items:[{inventoryId:'departure_lamp',quantity:1}],missing:[]},p.spec);other.items[0].packed=1;tripPlans.push(other);persist();departureRenderHome();}`);
 assert.equal(run('departureStats(departureCurrent()).total'),1);assert.equal(run('departureStats(departureCurrent()).blocked.length'),1);
 assert.equal(run('departureToggle("owned:departure_lamp")'),false);assert.equal(run('departureCurrent().items[0].packed'),0);
 assert(elements.get('departureEditor').innerHTML.includes('0 available'));run('departureCloseEdit()');
 assert(!elements.get('homeNext').innerHTML.includes('Everything on your list is packed'));
});
test('Checklist validation rejects malformed quantities, duplicate IDs and invalid packing',()=>{
 for(const expr of ['[{id:"check_1",name:"Test",quantity:1,packed:2}]','[{id:"bad",name:"Test",quantity:1,packed:0}]','[{id:"check_1",name:"",quantity:1,packed:0}]','[{id:"check_1",name:"Test",quantity:1.5,packed:0}]'])assert.throws(()=>run('departureValidate('+expr+')'));
 assert.throws(()=>run('departureValidate([window.originalDeparture.checklist[0],window.originalDeparture.checklist[0]])'));
});
test('Checklist survives advanced plan normalization and legacy duplicate resets packing',()=>{
 assert.equal(run('planNormalize({items:[],missing:[]},window.originalDeparture.spec,window.originalDeparture).checklist[0].packed'),4);
 run('tripPlans.push(planClone(window.originalDeparture))'); // Replace the matching existing record without retaining duplicates.
 run('tripPlans=tripPlans.filter((p,n,a)=>a.findIndex(x=>x.id===p.id)===n)');
 assert(run('entityDuplicateTrip(window.originalDeparture.id)'));assert.equal(run('tripPlans.at(-1).checklist[0].packed'),0);
});
test('Storage failure rolls back checklist edits without changing inventory or saved data',()=>{
 run('departureActivate(window.originalDeparture.id)');const before=storage.get('fieldkit_inventory_v1'),state=run('JSON.stringify(entitySnapshot())'),setter=context.localStorage.setItem;
 context.localStorage.setItem=(k,v)=>{if(k==='fieldkit_inventory_v1')throw Error('quota');setter(k,v)};
 assert.equal(run('departureAdd("Do not lose this")'),false);assert.equal(run('JSON.stringify(entitySnapshot())'),state);assert.equal(storage.get('fieldkit_inventory_v1'),before);
 context.localStorage.setItem=setter;
});
test('Finishing checklist-only trip preserves all gear and repeating starts empty',()=>{
 assert(run('departureCreate("blank","Finished test",1,1)'));assert(run('departureAdd("Keys")'));run('window.finishId=departureCurrent().checklist[0].id');assert(run('departureToggle(window.finishId)'));
 assert(elements.get('homeNext').innerHTML.includes('Everything on your list is packed'));
 const owned=run('JSON.stringify(items)');assert(run('departureFinish()'));assert.equal(run('departureCurrent().state'),'ended');assert.equal(run('JSON.stringify(items)'),owned);
 const finished=run('departureCurrent().id');assert(run('departureRepeat("'+finished+'")'));assert.equal(run('departureCurrent().checklist[0].packed'),0);
});
test('Restoring a full backup keeps checklist data and the existing gear notes/photos',()=>{
 const backup=JSON.parse(run('toJson()')),expected=JSON.stringify(backup.tripPlans.map(p=>p.checklist));assert(run('replaceInventory(JSON.parse(toJson()))'));
 assert.equal(run('JSON.stringify(tripPlans.map(p=>p.checklist))'),expected);
 assert.equal(run('items[0].note'),'Keep note');assert.equal(run('items[0].photo'),'data:image/jpeg;base64,YWJj');
 assert.equal(storage.get('fieldkit_empty_start_2026_v1'),'1');
});
