# FieldKit v1.15.0 verification

Pre-deployment (local copy, isolated test browser, nonprivate sample data):
- node fieldkit/tests/verify.cjs: 49 of 49 pass.
- 393 × 852 phone viewport and 1280 × 860 desktop: no horizontal overflow, no console errors.
- Workflows exercised in the browser: tap to pack (status packed, count kept), Undo restores the saved "check" status, tap on an empty item restores its last count, + / − stepper, reload persistence, edit sheet (legacy verify item shows "To pack"), Move… menu, Kits overview, kit screen open and back, quick add, Archive view, More.
- Loading and navigating leaves the saved inventory string byte-for-byte unchanged, including legacy "check" items, refill counts, archive timestamps and renamed kits; fieldkit_empty_start_2026_v1 stays "1".
- Text contrast: accent text #8a5d00 and secondary text #6c6c70 are at least 4.5:1 on the app backgrounds.

Not verified: physical iPhone/Safari, installed home-screen app, offline use, camera capture, printing.

Published (2026-10-18, GitHub Pages run 39104137036, commit fcb1a7b, success):
- Regular URL https://shahruuz.github.io/fieldkit/ without a version query reports v1.15.0, shows "v1.15.0" in the header, and loads app.css?v=1.15.0.
- Returning visit is controlled by the service worker with cache fieldkit-shell-1.15.0 and still shows v1.15.0.
- At 393 × 852: no horizontal overflow; Inventory shows To pack / Packed / Empty; Kits shows the overview bar and ring cards; no "verify" text on the page.
- Checked in a separate desktop browser profile that held only the 50 starter items; no personal inventory was opened or changed.
- Screenshots: tests/screenshots/v1.15.0-live-mobile.jpg (live, starter data); v1.15.0-kits-sample.png and v1.15.0-kit-sample.png (pre-deploy, labelled sample data).
