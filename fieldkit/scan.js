'use strict';
/* FieldKit Scan & pack — photo → pieces → drag into a bag → inventory.
   Engines: Gemini (free Google AI Studio key saved on this device) or the built-in finder
   (automatic cut-outs + on-device COCO-SSD names, no key, photo stays on the phone). */
const SCAN_KEY_STORE = 'fieldkit_gemini_key_v1';
const SCAN_MODEL_STORE = 'fieldkit_gemini_model_v1';
const SCAN_CATEGORIES = ['Safety','Water & food','Light & power','Fire & fuel','Clothing & shelter','Medical & hygiene','Tools','Kitchen','Documents','Other'];
const SCAN_MAX_PIECES = 40;
const SCAN_CAT_EMOJI = {'Safety':'🧭','Water & food':'💧','Light & power':'🔦','Fire & fuel':'🔥','Clothing & shelter':'🧥','Medical & hygiene':'🩹','Tools':'🔧','Kitchen':'🍳','Documents':'📄','Other':'📦'};
const SCAN_WORD_EMOJI = [
  [/head ?lamp|flash ?light|torch|lantern/i,'🔦'],[/batter/i,'🔋'],[/power ?bank|charger|cable/i,'🔌'],[/radio/i,'📻'],[/phone/i,'📱'],
  [/bottle|water|filter|bladder|canteen/i,'💧'],[/snack|food|bar\b|meal|ration/i,'🍫'],[/coffee|cup|mug/i,'☕'],[/pot|pan|stove|cook/i,'🍳'],[/bowl/i,'🥣'],[/spoon|fork|spork|utensil/i,'🍴'],
  [/knife/i,'🔪'],[/scissor/i,'✂️'],[/multi.?tool|tool|plier|wrench|screwdriver|tape/i,'🔧'],[/rope|cord|paracord/i,'🪢'],
  [/tent|tarp|shelter/i,'⛺'],[/sleeping|blanket|bivy/i,'🛌'],[/jacket|shell|coat|layer|fleece|hoodie/i,'🧥'],[/sock/i,'🧦'],[/glove/i,'🧤'],[/hat|cap\b|beanie/i,'🧢'],[/boot|shoe/i,'🥾'],[/sunglass/i,'🕶️'],
  [/first.?aid|bandage|blister|plaster/i,'🩹'],[/pill|medic|ibuprofen|aspirin/i,'💊'],[/sanitiz|soap|wipe/i,'🧼'],[/sunscreen|lotion|lip/i,'🧴'],[/tooth/i,'🪥'],
  [/compass/i,'🧭'],[/\bmap\b/i,'🗺️'],[/whistle|signal/i,'📢'],[/lighter|match|fire|tinder|ferro/i,'🔥'],[/propane|butane|fuel|canister/i,'🛢️'],
  [/cash|money|wallet/i,'💵'],[/\bid\b|passport|document|card|contact/i,'🪪'],[/umbrella/i,'☂️'],[/backpack|pack\b/i,'🎒'],[/bag|pouch|sack/i,'👜'],[/book|notebook/i,'📘'],[/key/i,'🔑']
];
// COCO-SSD class → [name, category]. Background classes are ignored.
const SCAN_COCO = {bottle:['Water bottle','Water & food'],cup:['Cup','Kitchen'],bowl:['Bowl','Kitchen'],'wine glass':['Glass','Kitchen'],knife:['Knife','Tools'],fork:['Fork','Kitchen'],spoon:['Spoon','Kitchen'],scissors:['Scissors','Tools'],
  'cell phone':['Phone','Safety'],backpack:['Backpack','Other'],handbag:['Bag','Other'],suitcase:['Duffel bag','Other'],umbrella:['Umbrella','Clothing & shelter'],book:['Book','Documents'],toothbrush:['Toothbrush','Medical & hygiene'],
  banana:['Banana','Water & food'],apple:['Apple','Water & food'],orange:['Orange','Water & food'],sandwich:['Sandwich','Water & food'],remote:['Remote','Light & power'],laptop:['Laptop','Light & power'],mouse:['Mouse','Light & power'],keyboard:['Keyboard','Light & power'],
  clock:['Clock','Tools'],tie:['Tie','Clothing & shelter'],'sports ball':['Ball','Other'],frisbee:['Frisbee','Other'],'teddy bear':['Teddy bear','Other'],'hair drier':['Hair dryer','Medical & hygiene'],vase:['Vase','Other'],kite:['Kite','Other'],'baseball bat':['Bat','Other'],'tennis racket':['Racket','Other'],skateboard:['Skateboard','Other']};

let scanState = null; // {kit, img, canvas, w, h, pieces:[], engine, note}
let scanCoco = null, scanCocoLoading = null;

const scanNorm = s => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
const scanClampCount = n => Math.max(1, Math.min(999, Math.floor(Number(n)) || 1));
function scanEmoji(name, category) {
  for (const [re, e] of SCAN_WORD_EMOJI) if (re.test(name || '')) return e;
  return SCAN_CAT_EMOJI[category] || '📦';
}
function scanCategory(name, fallback) {
  const g = typeof guessCategory === 'function' ? guessCategory(name) : 'Other';
  return g !== 'Other' ? g : (SCAN_CATEGORIES.includes(fallback) ? fallback : 'Other');
}
function scanGetKey() { try { return localStorage.getItem(SCAN_KEY_STORE) || '' } catch { return '' } }

/* ---------- Built-in finder: automatic cut-outs on a plain background ---------- */
function scanSegment(rgba, w, h) {
  const n = w * h, band = Math.max(2, Math.round(Math.min(w, h) * 0.04));
  const R = [], G = [], B = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (x >= band && x < w - band && y >= band && y < h - band) continue;
    const k = (y * w + x) * 4; R.push(rgba[k]); G.push(rgba[k + 1]); B.push(rgba[k + 2]);
  }
  const med = a => { const s = a.slice().sort((p, q) => p - q); return s[s.length >> 1] || 0 };
  const br = med(R), bg = med(G), bb = med(B);
  const dist = new Float32Array(n), border = [];
  for (let i = 0; i < n; i++) {
    const k = i * 4, d = Math.abs(rgba[k] - br) + Math.abs(rgba[k + 1] - bg) + Math.abs(rgba[k + 2] - bb);
    dist[i] = d;
    const x = i % w, y = (i / w) | 0;
    if (x < band || x >= w - band || y < band || y >= h - band) border.push(d);
  }
  border.sort((p, q) => p - q);
  const thr = Math.max(60, (border[Math.floor(border.length * 0.9)] || 0) * 1.6);
  let mask = new Uint8Array(n);
  for (let i = 0; i < n; i++) mask[i] = dist[i] > thr ? 1 : 0;
  const morph = (src, r, grow) => { // square dilate (grow) / erode
    const out = new Uint8Array(n);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let v = grow ? 0 : 1;
      for (let dy = -r; dy <= r && (grow ? !v : v); dy++) { const yy = y + dy; if (yy < 0 || yy >= h) { if (!grow) v = 0; continue }
        for (let dx = -r; dx <= r; dx++) { const xx = x + dx; if (xx < 0 || xx >= w) { if (!grow) { v = 0; break } continue }
          const m = src[yy * w + xx]; if (grow && m) { v = 1; break } if (!grow && !m) { v = 0; break } } }
      out[y * w + x] = v;
    }
    return out;
  };
  mask = morph(morph(mask, 2, true), 1, false);
  const seen = new Uint8Array(n), boxes = [], stack = [];
  const minArea = n * 0.0015, maxArea = n * 0.5;
  for (let s = 0; s < n; s++) {
    if (!mask[s] || seen[s]) continue;
    let x0 = w, y0 = h, x1 = 0, y1 = 0, area = 0;
    stack.push(s); seen[s] = 1;
    while (stack.length) {
      const i = stack.pop(), x = i % w, y = (i / w) | 0; area++;
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      if (x > 0 && mask[i - 1] && !seen[i - 1]) { seen[i - 1] = 1; stack.push(i - 1) }
      if (x < w - 1 && mask[i + 1] && !seen[i + 1]) { seen[i + 1] = 1; stack.push(i + 1) }
      if (y > 0 && mask[i - w] && !seen[i - w]) { seen[i - w] = 1; stack.push(i - w) }
      if (y < h - 1 && mask[i + w] && !seen[i + w]) { seen[i + w] = 1; stack.push(i + w) }
    }
    const edges = (x0 === 0) + (y0 === 0) + (x1 === w - 1) + (y1 === h - 1);
    if (area < minArea || area > maxArea || edges >= 3) continue;
    boxes.push([x0, y0, x1 - x0 + 1, y1 - y0 + 1]);
  }
  return scanMergeBoxes(boxes, Math.round(w * 0.015));
}
function scanMergeBoxes(boxes, gap) {
  let list = boxes.map(b => b.slice()), changed = true;
  const near = (a, b) => a[0] - gap < b[0] + b[2] && b[0] - gap < a[0] + a[2] && a[1] - gap < b[1] + b[3] && b[1] - gap < a[1] + a[3];
  while (changed) {
    changed = false;
    outer: for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) if (near(list[i], list[j])) {
      const a = list[i], b = list[j], x = Math.min(a[0], b[0]), y = Math.min(a[1], b[1]);
      list[i] = [x, y, Math.max(a[0] + a[2], b[0] + b[2]) - x, Math.max(a[1] + a[3], b[1] + b[3]) - y];
      list.splice(j, 1); changed = true; break outer;
    }
  }
  const rowH = Math.max(1, Math.max(0, ...list.map(b => b[3])) * 0.6);
  return list.sort((a, b) => Math.floor(a[1] / rowH) - Math.floor(b[1] / rowH) || a[0] - b[0]);
}
function scanIoU(a, b) {
  const x = Math.max(a[0], b[0]), y = Math.max(a[1], b[1]), x2 = Math.min(a[0] + a[2], b[0] + b[2]), y2 = Math.min(a[1] + a[3], b[1] + b[3]);
  const inter = Math.max(0, x2 - x) * Math.max(0, y2 - y);
  return { iou: inter / (a[2] * a[3] + b[2] * b[3] - inter || 1), coverA: inter / (a[2] * a[3] || 1) };
}
// Combine cut-out boxes with named COCO detections (all in the same pixel space).
function scanCombine(segBoxes, cocoDets) {
  const dets = (cocoDets || []).filter(d => SCAN_COCO[d.class] && d.score >= 0.35);
  const used = new Set(), out = [];
  for (const box of segBoxes) {
    let best = null, bestScore = 0;
    dets.forEach((d, k) => { const m = scanIoU(box, d.bbox); const s = Math.max(m.iou, m.coverA * 0.8); if (s > 0.3 && s > bestScore) { best = k; bestScore = s } });
    if (best !== null) { used.add(best); const [name, category] = SCAN_COCO[dets[best].class]; out.push({ name, category, count: 1, box }) }
    else out.push({ name: '', category: 'Other', count: 1, box });
  }
  dets.forEach((d, k) => { if (!used.has(k) && d.score >= 0.5) { const [name, category] = SCAN_COCO[d.class]; out.push({ name, category, count: 1, box: d.bbox.map(Math.round) }) } });
  return out;
}

/* ---------- Gemini engine ---------- */
function scanPrompt() {
  return 'You are cataloguing outdoor, backpacking and emergency gear laid out in this photo. ' +
    'List every distinct physical item. Ignore the floor, table, sheet or surface, people, hands and shadows. ' +
    'Group identical items and count them. Use short specific names (1 to 4 words), e.g. "Headlamp", "Water bottle", "First-aid kit", "AA batteries". ' +
    'Return ONLY a JSON array, at most 30 entries, each: {"name": string, "category": one of ' + JSON.stringify(SCAN_CATEGORIES) +
    ', "count": integer, "box_2d": [ymin, xmin, ymax, xmax] normalized 0-1000 for one representative item}.';
}
function scanParseGemini(json, w, h) {
  const text = (json?.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('').trim();
  if (!text) throw Error(json?.promptFeedback?.blockReason ? 'Photo was blocked (' + json.promptFeedback.blockReason + ')' : 'No answer from Gemini');
  let raw = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  const start = raw.search(/[\[{]/); if (start > 0) raw = raw.slice(start);
  let data = JSON.parse(raw);
  if (!Array.isArray(data)) data = data.items || data.boxes || data.objects || [];
  const out = [];
  for (const it of data.slice(0, SCAN_MAX_PIECES)) {
    const name = String(it?.name || it?.label || '').trim().slice(0, 80);
    if (!name) continue;
    let box = null;
    const b = it.box_2d || it.box;
    if (Array.isArray(b) && b.length === 4 && b.every(v => Number.isFinite(Number(v)))) {
      const [y0, x0, y1, x1] = b.map(v => Math.max(0, Math.min(1000, Number(v))));
      if (x1 > x0 && y1 > y0) box = [Math.round(x0 / 1000 * w), Math.round(y0 / 1000 * h), Math.max(1, Math.round((x1 - x0) / 1000 * w)), Math.max(1, Math.round((y1 - y0) / 1000 * h))];
    }
    out.push({ name, category: SCAN_CATEGORIES.includes(it.category) ? it.category : scanCategory(name, 'Other'), count: scanClampCount(it.count ?? it.quantity ?? 1), box });
  }
  return out;
}
function scanPickModel(models) {
  const ok = (models || []).filter(m => (m.supportedGenerationMethods || []).includes('generateContent'))
    .map(m => String(m.name || '').replace(/^models\//, ''))
    .filter(n => /flash/i.test(n) && !/(image|tts|live|audio|embed|thinking-exp|preview-tts)/i.test(n));
  const lite = n => /lite/i.test(n) ? 1 : 0;
  const ver = n => { const m = n.match(/gemini-(\d+(?:\.\d+)?)/); return m ? parseFloat(m[1]) : 0 };
  const stable = n => /preview|exp/i.test(n) ? 1 : 0;
  return ok.sort((a, b) => lite(a) - lite(b) || stable(a) - stable(b) || ver(b) - ver(a) || a.length - b.length)[0] || 'gemini-2.5-flash';
}
async function scanGeminiModel(key, refresh) {
  if (!refresh) { try { const m = localStorage.getItem(SCAN_MODEL_STORE); if (m) return m } catch {} }
  const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=200', { headers: { 'x-goog-api-key': key } });
  if (!r.ok) throw Error(r.status === 400 || r.status === 403 ? 'Google did not accept the saved key' : 'Google model list failed (' + r.status + ')');
  const model = scanPickModel((await r.json()).models);
  try { localStorage.setItem(SCAN_MODEL_STORE, model) } catch {}
  return model;
}
async function scanGemini(dataUrl, w, h, key) {
  const body = JSON.stringify({ contents: [{ parts: [{ text: scanPrompt() }, { inline_data: { mime_type: 'image/jpeg', data: dataUrl.split(',')[1] } }] }],
    generationConfig: { response_mime_type: 'application/json', temperature: 0.2 } });
  for (let attempt = 0; attempt < 2; attempt++) {
    const model = await scanGeminiModel(key, attempt > 0);
    const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key }, body });
    if (r.status === 404 && attempt === 0) continue;
    if (r.status === 429) throw Error('Free Gemini limit reached for now');
    if (r.status === 400 || r.status === 403) { let msg = ''; try { msg = (await r.json())?.error?.message || '' } catch {} throw Error(/api key/i.test(msg) ? 'Google did not accept the saved key' : 'Gemini refused the photo (' + r.status + ')') }
    if (!r.ok) throw Error('Gemini error ' + r.status);
    return scanParseGemini(await r.json(), w, h);
  }
  throw Error('No Gemini model available for this key');
}

/* ---------- Built-in engine (on device) ---------- */
function scanLoadScript(src) {
  return new Promise((ok, fail) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => fail(Error('Could not load ' + src)); document.head.appendChild(s) });
}
async function scanLoadCoco(onStatus) {
  if (scanCoco) return scanCoco;
  if (!scanCocoLoading) scanCocoLoading = (async () => {
    onStatus?.('Getting the built-in item finder ready (first time only, about 18 MB)…');
    if (!window.tf) await scanLoadScript('vendor/tf.min.js?v=1.16.2');
    if (!window.cocoSsd) await scanLoadScript('vendor/coco-ssd.min.js?v=1.16.2');
    scanCoco = await window.cocoSsd.load({ base: 'mobilenet_v2', modelUrl: 'vendor/coco-ssd/model.json' });
    return scanCoco;
  })().catch(e => { scanCocoLoading = null; throw e });
  return scanCocoLoading;
}
async function scanBuiltIn(canvas, onStatus) {
  const w = canvas.width, h = canvas.height, s = Math.min(1, 320 / Math.max(w, h));
  const small = document.createElement('canvas'); small.width = Math.max(1, Math.round(w * s)); small.height = Math.max(1, Math.round(h * s));
  const ctx = small.getContext('2d', { willReadFrequently: true }); ctx.drawImage(canvas, 0, 0, small.width, small.height);
  const seg = scanSegment(ctx.getImageData(0, 0, small.width, small.height).data, small.width, small.height)
    .map(b => [Math.round(b[0] / s), Math.round(b[1] / s), Math.round(b[2] / s), Math.round(b[3] / s)]);
  let dets = [], note = '';
  try { const model = await scanLoadCoco(onStatus); onStatus?.('Naming what it recognizes…'); dets = await model.detect(canvas, 30, 0.3) }
  catch (e) { note = 'Names unavailable offline — tap each name to type it.' }
  return { found: scanCombine(seg, dets), note };
}

/* ---------- Pieces ---------- */
function scanCrop(canvas, box) {
  if (!box) return '';
  const side = Math.min(Math.max(box[2], box[3]) * 1.18, Math.max(canvas.width, canvas.height));
  const cx = box[0] + box[2] / 2, cy = box[1] + box[3] / 2;
  const sx = Math.max(0, Math.min(canvas.width - Math.min(side, canvas.width), cx - side / 2)), sy = Math.max(0, Math.min(canvas.height - Math.min(side, canvas.height), cy - side / 2));
  const c = document.createElement('canvas'); c.width = c.height = 160;
  const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, 160, 160);
  g.drawImage(canvas, sx, sy, Math.min(side, canvas.width), Math.min(side, canvas.height), 0, 0, 160, 160);
  return c.toDataURL('image/jpeg', 0.72);
}
function scanMakePieces(found, cropFn) {
  const pieces = [], byName = new Map();
  let unnamed = 0;
  for (const f of found.slice(0, SCAN_MAX_PIECES)) {
    const name = f.name || 'Item ' + (++unnamed);
    const key = f.name ? scanNorm(name) : null;
    if (key && byName.has(key)) { byName.get(key).count = Math.min(999, byName.get(key).count + scanClampCount(f.count)); continue }
    const p = { id: 'p' + pieces.length + '_' + Math.random().toString(36).slice(2, 6), name, named: !!f.name, category: f.category || 'Other', count: scanClampCount(f.count), box: f.box || null, crop: cropFn ? cropFn(f.box) : '', inBag: false };
    p.emoji = scanEmoji(p.name, p.category);
    pieces.push(p); if (key) byName.set(key, p);
  }
  return pieces;
}

/* ---------- Save into the inventory ---------- */
function scanApply(kit, pieces) {
  if (!Object.hasOwn(ZONES, kit)) throw Error('Unknown kit');
  const groups = new Map();
  for (const p of pieces) {
    const name = String(p.name || '').trim().slice(0, 200), key = scanNorm(name);
    if (!key) continue;
    const g = groups.get(key);
    if (g) { g.count = Math.min(999, g.count + scanClampCount(p.count)); g.inBag = g.inBag && !!p.inBag; if (!g.crop && p.crop) g.crop = p.crop }
    else groups.set(key, { name, category: SCAN_CATEGORIES.includes(p.category) ? p.category : 'Other', count: scanClampCount(p.count), inBag: !!p.inBag, crop: /^data:image\/jpeg;base64,/.test(p.crop || '') && p.crop.length < 500000 ? p.crop : '' });
  }
  const added = [], updated = [];
  for (const [key, g] of groups) {
    const existing = items.find(i => !i.archived && i.place === kit && scanNorm(i.name) === key);
    if (existing) {
      existing.qty = g.count;
      if (g.inBag) existing.status = 'packed'; else if (existing.status === 'packed') existing.status = 'stock';
      if (!existing.photo && g.crop) existing.photo = g.crop;
      updated.push(existing);
    } else {
      added.push({ id: 'scan' + Date.now().toString(36) + added.length + Math.random().toString(36).slice(2, 6), name: g.name, place: kit, category: g.category, status: g.inBag ? 'packed' : 'stock', qty: g.count,
        spot: defaultSpot(kit, g.category, g.name), note: '', photo: g.crop, source: 'scan', archived: false });
    }
  }
  if (added.length) items.unshift(...added);
  return { added: added.length, updated: updated.length, packed: [...groups.values()].filter(g => g.inBag).length };
}
function scanSave() {
  if (!scanState) return;
  if (typeof storageBlocked !== 'undefined' && storageBlocked) { toast('Recover your saved data before scanning.'); return }
  const kit = scanState.kit, pieces = scanState.pieces.filter(p => String(p.name || '').trim());
  if (!pieces.length) { toast('Nothing to save yet'); return }
  if (!protectSnapshot()) return;
  const before = JSON.stringify(items);
  let result;
  try { result = scanApply(kit, pieces) } catch (e) { items = JSON.parse(before); toast('Could not save: ' + e.message); return }
  if (!persist()) { items = JSON.parse(before); persist(); refresh(); toast('Not saved — storage is full. Remove some photos or export a backup.'); return }
  scanClose(true);
  refresh();
  if (typeof zoneOpen === 'function') zoneOpen(kit);
  const parts = [result.added ? result.added + ' added' : '', result.updated ? result.updated + ' updated' : ''].filter(Boolean).join(', ');
  toast((parts || 'Saved') + ' · ' + result.packed + ' packed in ' + ZONES[kit].name, () => { items = JSON.parse(before); persist(); refresh(); toast('Scan undone') });
}

/* ---------- UI ---------- */
function scanEsc(s) { return typeof esc === 'function' ? esc(s) : String(s) }
function scanSetStep(step) {
  for (const [id, s] of [['scanStart', 'start'], ['scanWorking', 'working'], ['scanBoard', 'board']]) $(id).classList.toggle('hidden', step !== s);
  $('scanBag').classList.toggle('hidden', step !== 'board');
}
function scanKitOptions(selected) {
  $('scanKit').innerHTML = Object.entries(ZONES).map(([id, z]) => `<option value="${id}"${id === selected ? ' selected' : ''}>${scanEsc(z.name)}</option>`).join('');
}
function scanOpen(kit) {
  const k = kit && Object.hasOwn(ZONES, kit) ? kit : (typeof openZone !== 'undefined' && openZone) || $('locationFilter').value || Object.keys(ZONES)[0];
  scanState = { kit: k, pieces: [] };
  scanKitOptions(k);
  scanKeyUI();
  $('scanKeyForm').classList.add('hidden');
  scanSetStep('start');
  $('scanLayer').classList.remove('hidden'); document.body.classList.add('scan-open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => $('scanClose').focus(), 60);
}
function scanSaveKey(k) {
  k = String(k || '').replace(/\s+/g, '').replace(/^["'`]+|["'`]+$/g, '');
  if (!/^[\x21-\x7E]{20,200}$/.test(k)) return 'That does not look like a complete key. Copy the whole key from Google AI Studio and paste it again.';
  try { localStorage.setItem(SCAN_KEY_STORE, k); localStorage.removeItem(SCAN_MODEL_STORE) } catch { return 'Could not save the key on this device.' }
  return '';
}
function scanKeyUI() {
  const k = scanGetKey();
  $('scanEngine').textContent = k ? 'Smart scan' : 'Built-in';
  $('scanKeyHint').textContent = k ? 'Smart scan is on: Google Gemini names your gear automatically.' : 'Without Smart scan, items are cut out automatically and you name them.';
  $('scanKeyToggle').textContent = k ? 'Smart scan is on · change key' : '✨ Turn on Smart scan (free)';
  $('geminiKeyStatus').textContent = k ? 'Key saved on this device (ends …' + k.slice(-4) + ').' : 'No key saved — Scan uses the built-in finder.';
  $('geminiKeyRemove').classList.toggle('hidden', !k);
}
function scanClose(force) {
  if ($('scanLayer').classList.contains('hidden')) return;
  if (!force && scanState?.pieces?.length && !confirm('Leave without saving these items?')) return;
  $('scanLayer').classList.add('hidden'); document.body.classList.remove('scan-open');
  scanState = null;
  if (!$('detail').classList.contains('show')) document.body.style.overflow = '';
}
async function scanFile(file) {
  if (!file || !scanState) return;
  scanSetStep('working');
  const status = t => { $('scanWorkingText').textContent = t };
  status('Reading your photo…');
  try {
    const url = URL.createObjectURL(file), img = new Image();
    img.src = url; await img.decode();
    const s = Math.min(1, 1280 / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement('canvas'); canvas.width = Math.round(img.naturalWidth * s); canvas.height = Math.round(img.naturalHeight * s);
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height); URL.revokeObjectURL(url);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    let found = null, note = '', engine = 'Built-in';
    const key = scanGetKey();
    if (key) {
      status('Smart scan is naming your gear…');
      try { found = await scanGemini(dataUrl, canvas.width, canvas.height, key); engine = 'Smart scan' }
      catch (e) { note = e.message + ' — used the built-in finder instead.' }
    }
    if (!found) { status('Finding each item…'); const r = await scanBuiltIn(canvas, status); found = r.found; note = note || r.note }
    if (!scanState) return;
    Object.assign(scanState, { canvas, dataUrl, w: canvas.width, h: canvas.height, engine, note });
    scanState.pieces = scanMakePieces(found, b => scanCrop(canvas, b));
    $('scanEngine').textContent = engine;
    scanRender(true);
  } catch (e) {
    status('');
    scanSetStep('start');
    toast('Could not read that photo: ' + e.message);
  }
}
function scanAddAt(x, y) {
  if (!scanState?.canvas) return;
  const side = Math.round(Math.min(scanState.w, scanState.h) * 0.22), box = [Math.max(0, Math.round(x - side / 2)), Math.max(0, Math.round(y - side / 2)), side, side];
  const n = scanState.pieces.reduce((m, p) => { const k = /^Item (\d+)$/.exec(String(p.name).trim()); return k ? Math.max(m, +k[1]) : m }, 0) + 1;
  const p = scanMakePieces([{ name: '', category: 'Other', count: 1, box }], b => scanCrop(scanState.canvas, b))[0];
  p.name = 'Item ' + n; p.named = false; p.id = 'p' + Date.now().toString(36);
  scanState.pieces.push(p);
  scanRender();
  const input = document.querySelector(`[data-piece-name="${p.id}"]`); if (input) { input.focus(); input.select() }
}
function scanPieceHtml(p, i) {
  const pic = p.crop ? `<img src="${scanEsc(p.crop)}" alt="" draggable="false">` : `<span class="piece-big-emoji">${p.emoji}</span>`;
  return `<div class="piece${p.inBag ? ' in-bag' : ''}" data-piece="${p.id}"><button type="button" class="piece-pic" data-piece-pack="${p.id}" aria-label="Pack ${scanEsc(p.name)} into the bag">${pic}<span class="piece-num" aria-hidden="true">${i + 1}</span><span class="piece-emoji" aria-hidden="true">${p.emoji}</span>${p.count > 1 ? `<span class="piece-count" aria-hidden="true">×${p.count}</span>` : ''}</button>` +
    `<input class="piece-name${p.named ? '' : ' unnamed'}" data-piece-name="${p.id}" value="${scanEsc(p.name)}" maxlength="80" aria-label="Name of item ${i + 1}" autocomplete="off" enterkeyhint="done">` +
    `<div class="piece-row"><button type="button" data-piece-dec="${p.id}" aria-label="One fewer ${scanEsc(p.name)}">−</button><span class="piece-qty">${p.count}</span><button type="button" data-piece-inc="${p.id}" aria-label="One more ${scanEsc(p.name)}">+</button><button type="button" class="piece-del" data-piece-del="${p.id}" aria-label="Remove ${scanEsc(p.name)} from the scan">${typeof glyph === 'function' ? glyph('trash') : '×'}</button></div></div>`;
}
function scanRender(fresh) {
  const st = scanState; if (!st) return;
  scanSetStep('board');
  if (fresh) $('scanImg').src = st.dataUrl;
  $('scanBoxes').innerHTML = st.pieces.map((p, i) => p.box ? `<span class="scan-box${p.inBag ? ' in-bag' : ''}" style="left:${(p.box[0] / st.w * 100).toFixed(2)}%;top:${(p.box[1] / st.h * 100).toFixed(2)}%;width:${(p.box[2] / st.w * 100).toFixed(2)}%;height:${(p.box[3] / st.h * 100).toFixed(2)}%"><i>${i + 1}</i></span>` : '').join('');
  const floor = st.pieces.map((p, i) => [p, i]).filter(([p]) => !p.inBag), bag = st.pieces.map((p, i) => [p, i]).filter(([p]) => p.inBag);
  $('scanFloor').innerHTML = floor.length ? floor.map(([p, i]) => scanPieceHtml(p, i)).join('') : `<div class="scan-floor-empty">${st.pieces.length ? '🎉 Floor is clear — everything is in the bag.' : 'Nothing found. Tap the photo on each item to add it.'}</div>`;
  $('scanFloorCount').textContent = floor.length;
  $('scanNote').textContent = st.note || '';
  $('scanNote').classList.toggle('hidden', !st.note);
  const total = st.pieces.length, inBag = bag.length, pct = total ? Math.round(inBag / total * 100) : 0;
  $('scanBagTitle').textContent = ZONES[st.kit].name;
  $('scanBagCount').textContent = `${inBag} of ${total} in the bag`;
  $('scanBagFill').setAttribute('y', String(100 - pct)); $('scanBagFill').setAttribute('height', String(pct));
  $('scanBag').classList.toggle('full', total > 0 && inBag === total);
  $('scanBagChips').innerHTML = bag.map(([p]) => `<button type="button" class="bag-chip" data-piece-unpack="${p.id}" aria-label="Take ${scanEsc(p.name)} out of the bag">${p.emoji} ${scanEsc(p.name)}${p.count > 1 ? ' ×' + p.count : ''}</button>`).join('');
  const named = st.pieces.filter(p => String(p.name).trim()).length;
  $('scanSave').textContent = named ? `Save ${named} item${named === 1 ? '' : 's'}` : 'Save';
  $('scanSave').disabled = !named;
}
function scanPiece(id) { return scanState?.pieces.find(p => p.id === id) }
function scanSetBag(id, inBag) {
  const p = scanPiece(id); if (!p || p.inBag === inBag) return;
  p.inBag = inBag;
  scanRender();
  const bagEl = $('scanBag'); bagEl.classList.remove('gulp'); void bagEl.offsetWidth; if (inBag) bagEl.classList.add('gulp');
}
function initScan() {
  for (const id of ['scanOpen', 'invScan']) { const b = $(id); if (b) b.onclick = () => scanOpen() }
  $('detailScan').onclick = () => { const k = openZone; zoneClose(); scanOpen(k) };
  $('scanClose').onclick = () => scanClose();
  $('scanKit').onchange = () => { if (scanState) { scanState.kit = $('scanKit').value; if (scanState.pieces.length) scanRender() } };
  for (const id of ['scanCamera', 'scanLibrary']) $(id).onchange = e => { const f = e.target.files?.[0]; e.target.value = ''; scanFile(f) };
  $('scanRetake').onclick = () => { if (scanState && (!scanState.pieces.length || confirm('Start over with a new photo?'))) { scanState.pieces = []; scanSetStep('start') } };
  $('scanAllIn').onclick = () => { if (!scanState) return; scanState.pieces.forEach(p => p.inBag = true); scanRender() };
  $('scanSave').onclick = scanSave;
  $('scanPhoto').onclick = e => {
    if (!scanState?.w) return;
    const r = $('scanImg').getBoundingClientRect(); if (!r.width) return;
    scanAddAt((e.clientX - r.left) / r.width * scanState.w, (e.clientY - r.top) / r.height * scanState.h);
  };
  $('scanLayer').addEventListener('input', e => {
    const id = e.target.dataset?.pieceName; if (!id) return;
    const p = scanPiece(id); if (!p) return;
    p.name = e.target.value; p.named = true; e.target.classList.remove('unnamed'); p.category = scanCategory(p.name, p.category); p.emoji = scanEmoji(p.name, p.category);
    const tile = e.target.closest('.piece'); const em = tile?.querySelector('.piece-emoji'); if (em) em.textContent = p.emoji;
    const named = scanState.pieces.filter(x => String(x.name).trim()).length; $('scanSave').textContent = named ? `Save ${named} item${named === 1 ? '' : 's'}` : 'Save'; $('scanSave').disabled = !named;
  });
  $('scanLayer').addEventListener('change', e => { if (e.target.dataset?.pieceName) scanRender() });
  $('scanLayer').addEventListener('click', e => {
    if (Date.now() < scanSuppressClick) { e.preventDefault(); return }
    const t = e.target.closest('[data-piece-pack],[data-piece-unpack],[data-piece-inc],[data-piece-dec],[data-piece-del]'); if (!t) return;
    const d = t.dataset;
    if (d.piecePack) scanSetBag(d.piecePack, true);
    else if (d.pieceUnpack) scanSetBag(d.pieceUnpack, false);
    else if (d.pieceInc || d.pieceDec) { const p = scanPiece(d.pieceInc || d.pieceDec); if (p) { p.count = Math.max(1, Math.min(999, p.count + (d.pieceInc ? 1 : -1))); scanRender() } }
    else if (d.pieceDel) { scanState.pieces = scanState.pieces.filter(p => p.id !== d.pieceDel); scanRender() }
  });
  scanInitDrag();
  // Smart scan settings (More)
  const keyStatus = scanKeyUI;
  $('geminiKeyForm').onsubmit = e => {
    e.preventDefault();
    const err = scanSaveKey($('geminiKey').value);
    if (err) { $('geminiKeyStatus').textContent = err; return }
    $('geminiKey').value = ''; keyStatus(); toast('Smart scan is on');
  };
  $('scanKeyToggle').onclick = () => { const f = $('scanKeyForm'); f.classList.toggle('hidden'); if (!f.classList.contains('hidden')) $('scanKeyInput').focus() };
  $('scanKeyForm').onsubmit = e => {
    e.preventDefault();
    const err = scanSaveKey($('scanKeyInput').value);
    $('scanKeyStatus').textContent = err;
    if (err) return;
    $('scanKeyInput').value = ''; $('scanKeyForm').classList.add('hidden'); scanKeyUI(); toast('Smart scan is on');
  };
  $('geminiKeyRemove').onclick = () => { try { localStorage.removeItem(SCAN_KEY_STORE); localStorage.removeItem(SCAN_MODEL_STORE) } catch {} keyStatus(); toast('Smart scan key removed') };
  keyStatus();
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('scanLayer').classList.contains('hidden') && document.activeElement?.tagName !== 'INPUT') scanClose() });
}
let scanSuppressClick = 0;
function scanInitDrag() {
  let drag = null;
  const ghost = () => $('scanGhost');
  const over = (x, y) => { const el = document.elementFromPoint(x, y); return el?.closest?.('[data-scan-drop]')?.dataset.scanDrop || null };
  document.addEventListener('pointerdown', e => {
    const pic = e.target.closest?.('.piece-pic'); if (!pic || e.button !== 0) return;
    drag = { id: pic.dataset.piecePack, x0: e.clientX, y0: e.clientY, moving: false, pointer: e.pointerId, pic };
  });
  document.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.pointer) return;
    if (!drag.moving && Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < 8) return;
    if (!drag.moving) {
      drag.moving = true; drag.pic.setPointerCapture?.(e.pointerId);
      const p = scanPiece(drag.id); ghost().innerHTML = p?.crop ? `<img src="${scanEsc(p.crop)}" alt="">` : `<span>${p?.emoji || '📦'}</span>`;
      ghost().classList.remove('hidden'); $('scanLayer').classList.add('dragging');
    }
    e.preventDefault();
    ghost().style.transform = `translate(${e.clientX - 36}px,${e.clientY - 36}px)`;
    $('scanBag').classList.toggle('drop-hot', over(e.clientX, e.clientY) === 'bag');
  }, { passive: false });
  const end = (e, cancel) => {
    if (!drag || e.pointerId !== drag.pointer) return;
    const d = drag; drag = null;
    ghost().classList.add('hidden'); $('scanLayer').classList.remove('dragging'); $('scanBag').classList.remove('drop-hot');
    if (!d.moving) return;
    scanSuppressClick = Date.now() + 400;
    if (!cancel && over(e.clientX, e.clientY) === 'bag') scanSetBag(d.id, true);
  };
  document.addEventListener('pointerup', e => end(e, false));
  document.addEventListener('pointercancel', e => end(e, true));
}
if (typeof document !== 'undefined' && typeof $ === 'function' && $('scanLayer')) initScan();
