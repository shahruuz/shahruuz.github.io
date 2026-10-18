# FieldKit v1.16.0 verification

Pre-deployment (local copy, isolated headless Chromium at 393 × 852, nonprivate sample data and synthetic test photos in tests/fixtures):
- node fieldkit/tests/verify.cjs: 57 of 57 pass, including segmentation on a synthetic image, detection/name merging, Gemini response parsing and box conversion, model choice, duplicate merging, save rules (matching gear updated, notes/spot/existing photos kept, other kits and archived items untouched), recovery snapshot + exact Undo, and key validation/never exported.
- Built-in scan on tests/fixtures/scene.jpg: 7 of 7 items cut out and outlined; the cup was named by COCO-SSD; the rest were numbered for renaming. Tap-to-pack, drag-to-bag, cancelled drag, rename (emoji updates), tap-photo-to-add, remove, Save, kit opens with results, Undo restores the inventory.
- Smart scan with Google's API simulated (Playwright route): requests were GET /v1beta/models then POST /v1beta/models/gemini-3.8-flash:generateContent; the key travelled only in the x-goog-api-key header. All 7 items named; Pack all → Save packed all 7 in the chosen kit.
- Simulated HTTP 429 from Google: fell back to the built-in finder with a visible note.
- Core app workflows (tap to pack, Undo, stepper, edit, move menu, kits, quick add, archive, more, desktop) re-run: no overflow, no page errors. Loading leaves saved data byte-for-byte unchanged; fieldkit_empty_start_2026_v1 stays "1".

Not verified: a real Google key against the live Gemini API (requires the owner's free key), real phone camera photos, recognition speed on a physical iPhone, installed home-screen app, offline use.

Published (2026-10-18, GitHub Pages run 39105402882, commit 972d268, success), checked in the desktop app's browser pane (separate profile holding only the 50 starter items; no personal data):
- Regular URL reports v1.16.0 and loads scan.js?v=1.16.0; Scan & pack, the Inventory camera button and More → Smart scan are present.
- Vendor files are served from the site (tf.min.js, model.json, weight shards: HTTP 200).
- A browser request from the live page to generativelanguage.googleapis.com is allowed (HTTP 403 without a key), so Smart scan can reach Gemini directly from the page.
- Real built-in scan of tests/fixtures/scene.jpg on the live site (WebGL): 7 of 7 items found, cup named; first run 17.7 s including the one-time download, repeat run 0.1 s. Board at 393 × 852: no horizontal overflow. Closed without saving; inventory unchanged.
- Screenshots: tests/screenshots/v1.16.0-live-scan.jpg (live), v1.16.0-smart-scan-simulated.png (pre-deploy, simulated Gemini).
