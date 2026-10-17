# FieldKit v1.11.2 verification

## Automated checks
- All 38 existing regression checks passed. Coverage includes quantities, Empty/Archive, moves and Undo, weights, kit names, reloads, imports, exports, text backup, malformed storage and quota recovery.
- Inventory application script remains byte-identical to v1.10.1. Storage keys and reset marker unchanged.
- Service worker syntax, CSS block structure, local asset references and HTML duplicate IDs checked.

## Published checks — 2026-10-17
- GitHub Pages run 39070656686 completed successfully for commit d5582225a1317dcfc007e82ef76de603263d8bd8.
- Visually inspected final app and public website at desktop size and in 393 x 852 CSS pixel frames matching iPhone 14 Pro dimensions. Content width 378 pixels with the desktop scrollbar; scrollWidth equals clientWidth on both pages.
- Final v1.11.2 mobile add sheet fits the frame; help expands/collapses; unused Packed/Verify drop areas are collapsed; gear rows remain visible. Plus/minus controls are 44px tall; Add is 48 x 48.
- Notes-theme kit cards, detail sheet and move menu visually inspected during rollout; move sheet fits the 393px frame. Search filters to Whistle; modal close and return navigation work.
- Used public backup-text UI to capture 50 inventory records. Saved Whistle with its existing values, reloaded into v1.11.2 and exported again. Inventory items and kit names compared exactly equal before/after; no record, quantity, note or photo changes.
- Public sample plus/refill and Reset work independently of saved inventory.
- Final public URLs opened and verified: https://shahruuz.github.io/fieldkit/?v=1.11.2 and https://shahruuz.github.io/fieldkit/discover.html?v=1.11.2.
- No spending, tracking, external fonts or new accounts/services.

## Rollback
- Current stable: fieldkit-v1.11.2-stable.
- Previous stable: fieldkit-v1.10.1-stable, c637adbdb8803fe79ba48c0e8631ad0742cf2055.
- Restore prior application files through a new versioned commit; retain inventory storage and reset marker. Never clear browser data.

## Limits
- Phone-size browser frames are not physical iPhone/Safari tests. Hardware camera, installed PWA behavior, real offline use, printing and file transfer were not reverified in this presentation release.
- Managed preview was unavailable because bwrap could not mount proc. Published browser inspection used instead.
