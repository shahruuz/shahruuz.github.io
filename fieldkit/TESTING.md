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

