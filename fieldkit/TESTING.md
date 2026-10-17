# FieldKit v1.9.0 validation

## Before deployment
- `node fieldkit/tests/verify.cjs`: 36 behavior checks pass.
- Covered: retained legacy data/photos, quantities, Empty, Archive/restore/delete, confirmation cancel, quick add/edit, search/filters, state moves, pointer drop/cancel, Undo, save/reload, one-time reset guard, JSON round-trip, weights, kit names, refill filter, strict import, duplicate rejection, empty inventory imports, recovery snapshots, malformed data preservation, storage quota failure and spreadsheet formula neutralization.
- JavaScript syntax checks pass for the app, service worker and marketing script.
- 31 relative HTML references resolved locally before adding device test harness.
- No external runtime scripts, fonts, AI calls or analytics dependencies.
- Original code preserved at fieldkit-v1.8.0-stable, commit 61a68a721ad3ab072d155e024d00b05aa503fa0a.

## Browser QA
- Managed local preview unavailable: supervisor failed with `bwrap: Can't mount proc ... Operation not permitted`. `sites-preview status` confirms stopped. No replacement server was started.
- Published browser QA pending at commit preparation. Results will be recorded after publication.
- tests/device.html provides fixed 393 × 852 CSS-pixel frames for the published app and marketing page. This tests responsive browser layout, not physical iPhone hardware or Safari-specific behavior.

## Manual/device limits
- iPhone installation, actual offline reconnection, camera capture, virtual keyboard and physical touch gestures require a device/browser with those capabilities. Do not infer them from VM checks or a desktop viewport.
