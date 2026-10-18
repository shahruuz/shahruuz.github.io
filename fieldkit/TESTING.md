# v1.23.0 verification — 2026-10-18

- 114 automated regression checks pass. New coverage dispatches capture listeners before bubbling listeners and honors cancellation. Cases include diagonal/reversed/short/edge swipes, scroll and pointer cancellation, capture loss, multiple pointers, detached rows, one-open-row behavior, outside/scroll/Escape closure, long-hold cancellation, synthetic vs fresh/keyboard clicks, explicit actions, canceled deletion and no-op stock controls.
- Quantity, archive, packing and deletion quota failures preserve both in-memory and persisted records. Trip pack Undo and stale AI preview rejection are verified.
- All stock-changing swipe actions require a button tap. No full swipe auto-applies changes.
- Checks are disposable JavaScript/DOM fixtures; no physical iPhone/Safari gesture or visual browser test is claimed. Published files are fetched and checked after deployment.
- Rollback: `fieldkit-before-v1.23.0` at `98b6e0974741aee14a10459b0efeba31f5b62312`.

# v1.21.1 verification — 2026-10-18

- 97 automated checks pass. Added fuel-canister storage-drop guard; blocked drops preserve quantities, storage spot and item metadata.
- Previous v1.21.0 gesture/customization validation and physical-device limits below still apply.

# v1.21.0 verification — 2026-10-18

- 96 automated regression checks pass. New cases cover empty custom-kit creation, metadata/fields/order in backups, hide/restore without gear removal, stock-preserving reordering and Undo, emergency protection, trip metadata, bag/person assignments and weights, missing-list edits through optimization, stock-capped trip copies, custom departure presets, quota rollback, hold-before-drag, canceled pointer gestures and native input gestures.
- Static markup checked for nested forms/buttons; JavaScript syntax checks pass.
- Gesture event paths are simulated in disposable fixtures. Browser visual layout, iPhone Safari hardware gestures, camera capture and live Gemini are not verified in this session.
- Paused by design: global gestures on fields, dropdown options, switches and navigation; they conflict with native editing/scrolling/system gestures.
- Rollback: `fieldkit-before-v1.21.0` at `8c238ceceead7f7563424f60d47c8caff11cdbac`.

# v1.20.0 verification — 2026-10-18

- 82 automated regression checks pass. Added first-open intro, exactly three Next taps, preference persistence, replay/Back/Skip, inventory isolation, recovery-mode priority and preference-storage-failure coverage.
- No additional requests, AI calls, sample records, inventory resets or migrations from the introduction.
- Visual browser / physical iPhone verification unavailable in this session.
- Rollback: `fieldkit-before-v1.20.0` at `dd1ae48ec86cb602f9c6df964a0fb258fc41ebd7`.

# v1.19.0 verification — 2026-10-18

- 78 automated regression checks pass via `node fieldkit/tests/verify.cjs`.
- Added owned-stock planner, partial/full packing, weight totals, model-output validation, protected edits, non-additive repeated scans, overlap warnings, acquisition, backup/import, finish-trip consumption, quota failure rollback, consent gating and request contract checks.
- Gemini responses are mocked; no user API key is available in this execution environment. No live Gemini, iPhone Safari, camera or visual browser test is claimed.
- Rollback: `fieldkit-before-v1.19.0` at `0bf7e82a4ef6070050d4b60b76f3b3006a42bbfe`.

# FieldKit v1.16.0 verification

Pre-deployment (local copy, isolated headless Chromium at 393 × 852, nonprivate sample data and synthetic test photos in tests/fixtures):
- node fieldkit/tests/verify.cjs: 57 of 57 pass, including segmentation on a synthetic image, detection/name merging, Gemini response parsing and box conversion, model choice, duplicate merging, save rules (matching gear updated, notes/spot/existing photos kept, other kits and archived items untouched), recovery snapshot + exact Undo, and key validation/never exported.
- Built-in scan on tests/fixtures/scene.jpg: 7 of 7 items cut out and outlined; the cup was named by COCO-SSD; the rest were numbered for renaming. Tap-to-pack, drag-to-bag, cancelled drag, rename (emoji updates), tap-photo-to-add, remove, Save, kit opens with results, Undo restores the inventory.
- Smart scan with Google's API simulated (Playwright route): requests were GET /v1beta/models then POST /v1beta/models/gemini-3.8-flash:generateContent; the key travelled only in the x-goog-api-key header. All 7 items named; Pack all → Save packed all 7 in the chosen kit.
- Simulated HTTP 429 from Google: fell back to the built-in finder with a visible note.
- Core app workflows (tap to pack, Undo, stepper, edit, move menu, kits, quick add, archive, more, desktop) re-run: no overflow, no page errors. Loading leaves saved data byte-for-byte unchanged; fieldkit_empty_start_2026_v1 stays "1".

Not verified: a real Google key against the live Gemini API (requires the owner's free key), real phone camera photos, recognition speed on a physical iPhone, installed home-screen app, offline use.

