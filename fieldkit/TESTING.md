# FieldKit v1.9.1 validation

## Before deployment
- `node fieldkit/tests/verify.cjs`: 38 behavior checks pass.
- Covered: retained legacy data/photos, quantities, Empty, Archive/restore/delete, confirmation cancel, quick add/edit, search/filters, state moves, pointer drop/cancel, Undo, save/reload, one-time reset guard, JSON round-trip, weights, kit names, refill filter, strict import, duplicate rejection, empty inventory imports, recovery snapshots, malformed data preservation, storage quota failure and spreadsheet formula neutralization.
- JavaScript syntax checks pass for the app, service worker and marketing script.
- 31 relative HTML references resolved locally before adding device test harness.
- No external runtime scripts, fonts, AI calls or analytics dependencies.
- Original code preserved at fieldkit-v1.8.0-stable, commit 61a68a721ad3ab072d155e024d00b05aa503fa0a.

## Browser QA
- Managed local preview unavailable: supervisor failed with `bwrap: Can't mount proc ... Operation not permitted`. `sites-preview status` confirms stopped. No replacement server was started.
- v1.9.0 GitHub Pages run 39052823008 completed successfully for commit 5b6021d2823434173575ba411e2eb83e70aaf732.
- v1.9.0 published browser: new product page rendered; app add → detail form retained name/count; weights and notes saved; reload retained the item; search worked; move-to-Empty, refill, Archive, restore, Undo, and cancelled permanent-delete confirmation behaved correctly.
- Phone frames: 393 × 852 CSS pixels, both product and app inspected visually. Mobile bottom navigation worked, kit rename and per-kit weight updated consistently.
- This QA exposed desktop navigation stacking and contrast defects, corrected in v1.9.1. Marketing mobile header and headline also tightened.
- Browser download-event capture timed out in the test environment. File export/import serialization is covered automatically; a JSON-text backup/restore fallback was added and covered by automated checks. Do not claim end-to-end file transfer was verified.
- Final v1.9.1 published observations will be retained in a separate QA record branch without causing a documentation-only production deployment.
- tests/device.html provides fixed 393 × 852 CSS-pixel frames for the published app and marketing page. This tests responsive browser layout, not physical iPhone hardware or Safari-specific behavior.

## Manual/device limits
- iPhone installation, actual offline reconnection, camera capture, virtual keyboard and physical touch gestures require a device/browser with those capabilities. Do not infer them from VM checks or a desktop viewport.
