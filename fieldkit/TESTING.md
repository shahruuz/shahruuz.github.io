# FieldKit v1.12.1 verification

## Automated
- 42 regression checks pass. Existing quantity, Empty, Archive, Undo, moves, weights, kit names, recovery, import/export, photos/notes preservation and reload cases retained.
- New cases verify kit shortcut filtering without data changes, clearing stale archive/refill filters, separate edit/move controls and counts scoped to the selected kit.
- App script and service worker syntax, CSS block structure, local assets, duplicate HTML IDs and nested buttons checked.
- App has zero inline theme blocks and one versioned application stylesheet.

## Published browser verification — 2026-10-17
- GitHub Pages run 39073390626 succeeded for 6fd45b7e1023e933a71d1c192afb84d125ccea8a (v1.12.1).
- Final desktop app and 393 x 852 CSS-pixel phone frames inspected visually. Mobile document clientWidth and scrollWidth both 378, reflecting the desktop scrollbar within the 393px frame. No horizontal page overflow.
- Gear screen now presents rows beneath compact search, kit shortcuts and All/Empty/Archive controls; secondary metrics and tools are in More.
- Final selected Waist bag has 6 rows, All 6, Empty 6, Archive 0. Archive shows zero rows; Empty returns six rows; All clears Empty-only mode. All kits restores 50 rows/count.
- Filters expand within the mobile width, select the kit and clear correctly. Search filters to Whistle.
- Explicit status control opens the move sheet (393px wide, 416px tall, bottom852). Packed changed Whistle to count1; Undo restored it. Full-screen kit detail, visual kit cards, quick add, photo/full-details form and modal return paths inspected.
- Refill shortcut in More returns to the inventory and its Empty section.
- Captured full inventory through public backup-text UI before the rebuild, after packing and Undo, and after an unchanged item save and reload into v1.12.1. All 50 item records and kit names compare exactly equal across exports.
- Final live URL opened and verified: https://shahruuz.github.io/fieldkit/?v=1.12.1.
- No new account, cloud storage, tracking, external font, API service or spending.

## Rollback
- Current snapshot: fieldkit-v1.12.1-stable.
- Prior snapshot: fieldkit-v1.11.2-stable, d5582225a1317dcfc007e82ef76de603263d8bd8.
- Restore source through a new versioned commit; keep fieldkit_inventory_v1 and fieldkit_empty_start_2026_v1. Never clear browser storage.

## Limits
- 393 x 852 desktop browser frames are not a physical iPhone/Safari test. Camera capture, installed PWA behavior, real offline use, printing and file transfer were not reverified in this UI release.
- Managed local preview was blocked by bwrap proc mounting. Published browser inspection used instead.
