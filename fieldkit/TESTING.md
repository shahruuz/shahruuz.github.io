# v1.26.1 verification — 2026-10-18

- 165 automated checks pass, including selection focus after redraw and safe focus fallback from a disabled packed-quantity control.
- v1.26.0 published desktop and 393 × 852 CSS-pixel browser checks passed: returning trip/data, progress including missing units, Add owned gear, row selection, Select all, bulk pack, Undo, swipe reveal and inward close. The visual review prompted the action-button spacing and focus refinements in this patch.
- Physical iPhone/Safari, live camera, real Google API, installed PWA and real offline testing remain unverified.
- Rollback: fieldkit-before-v1.26.1 at f73a52cecfc8cac62dd08175a5391aca4c4a3521.

# v1.26.0 verification — 2026-10-18

- 163 automated checks pass: existing inventory, swipe/cancellation, planner, backups, consent and recovery coverage, plus trip progress including missing units, location-based next action, selection click-through, filtered Select all, reserved-stock caps, bulk pack/unpack Undo, failed-save rollback, finished-trip protection and dynamic Add owned gear selector.
- Static HTML checked for duplicate IDs and nested form/button controls. Source diff whitespace checks pass.
- Local supervised preview could not start: bwrap cannot mount proc (environment limitation). Published desktop and 393 × 852 CSS-pixel browser QA follows deployment. No physical iPhone/Safari, live camera or real Google-key test is claimed.
- Rollback: fieldkit-before-v1.26.0 at 2e52e3e25fe8ac2fcea1b6853d7e28bf53913d14.

# v1.25.1 verification — 2026-10-18

- 142 automated checks pass. Suggestion click adds directly without opening a form; it leaves the row unpacked. The checklist circle packs/unpacks without changing owned stock.
- Existing stock and home metadata are reused, only shortfalls increase owned quantities, existing packed units remain packed, and Undo restores stock and suggestions. Tests cover stale click keys, quantity caps, save failures and emergency-gear separation.
- Existing trip-first, return/refill, backup, consent, gesture and inventory checks continue passing. Published runtime files must match this release and the full suite must pass against the downloaded live app.
- No browser visual or physical iPhone testing is claimed.
- Rollback: `fieldkit-before-v1.25.1` at `8162ed15566c0db449775019e7fc09cc7ae4ae53`.

# v1.25.0 verification — 2026-10-18

- 137 automated regression checks pass. New scenario covers a family trip, collection by shelf, departure items, per-bag view, two trips competing for stock, consumed-supply confirmation, invalid finish input, finish Undo and save failure, return reservations, repeated refill, existing-owned fulfillment, backup validation, copying and zero-inventory setup.
- Existing quantity/Empty/Archive, notes/photos, swipe/drag, save-failure rollback, consent, AI preview and nested-editor checks continue passing. Entry-point assertions now reflect Trips home and ownership-only My gear.
- Static app and 16 rendered fragments checked for balanced structure and nested forms/buttons. Runtime JavaScript syntax checks pass. No physical iPhone, Safari gesture, browser visual or live camera/Google-key verification is claimed.
- Published runtime files must match the tested release and the regression suite must pass against downloaded live assets, including journey.js and the manifest.
- Rollback: `fieldkit-before-v1.25.0` at `74c184b61ca8027c61887c9f4c5228af239b62fb`.

# v1.24.0 verification — 2026-10-18

- 123 automated regression checks pass, including nested modal Escape routing, restoring background interaction, kit/trip editor return paths, packed-only weights, refill metadata, file input accessibility, consistent trip gesture targets and save-failure indicators.
- The existing swipe, drag/drop, quantities, Archive, Undo, owned-stock caps, missing supplies, consent and stale AI preview checks continue passing.
- Static app and seven rendered surfaces checked for nested buttons/forms. Runtime JavaScript syntax checks pass.
- Verification uses disposable JavaScript/DOM fixtures. Browser visual and physical iPhone/Safari touch testing are unavailable; no claim of visual verification is made.
- Published runtime files must match this release and the regression suite must pass against downloaded live assets.
- Rollback: `fieldkit-before-v1.24.0` at `72c2679809bc527a0dc02c433e03de14d8134d2c`.

# v1.23.0 verification — 2026-10-18

- 115 automated regression checks pass. New coverage dispatches capture listeners before bubbling listeners and honors cancellation. Cases include diagonal/reversed/short/edge swipes, scroll and pointer cancellation, capture loss, multiple pointers, detached rows, one-open-row behavior, outside/scroll/Escape closure, long-hold cancellation, synthetic vs fresh/keyboard clicks, explicit actions, canceled deletion and no-op stock controls.
- Quantity, archive, packing and deletion quota failures preserve both in-memory and persisted records. Trip pack Undo and stale AI preview rejection are verified.
- All stock-changing swipe actions require a button tap. No full swipe auto-applies changes.
- Checks are disposable JavaScript/DOM fixtures; no physical iPhone/Safari gesture or visual browser test is claimed. Published files are fetched and checked after deployment.
- Rollback: `fieldkit-before-v1.23.0` at `0a1e75c246d0b59274cb29b4c523730e5af47396`.

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


- Drag preview checks cover before/after midpoint selection, self-target rejection, read-only preview, exact placement and removal of gap styling after release.
