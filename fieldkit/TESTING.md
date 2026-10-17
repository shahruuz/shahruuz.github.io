# FieldKit v1.13.1 published verification

## Release
- Production commit ce8f776a9b42116c28bb2000052bfa6b43238590. Pages run 39075294889 completed successfully.
- Regular unversioned URL https://shahruuz.github.io/fieldkit/ opened, reloaded and visibly showed v1.13.1, Gallery selected and the new two-column composition on mobile.
- Public website https://shahruuz.github.io/fieldkit/discover.html?v=1.13.1 opened and verified with the new headline, four-card interactive sample and illustrated kit strip.

## Checks
- 44 automated regressions pass. Existing quantity, Empty, Archive, recovery, photos/notes, kit names, weights, moves, Undo, import/export and corruption checks retained.
- New Gallery/List preference is stored as fieldkit_display_v1, independently of inventory. Invalid modes are rejected and kit cover artwork retains original kit actions.
- List selected in the published UI remained selected after reload. Gallery restored and remained selected after the final reload.
- Gallery quantity add changed Whistle 0 to1. An unchanged edit returned it to0 during testing. A subsequent add with a settled UI observation followed by Undo returned it to0 with Quantity restored.
- Before/after full public backup-text exports compare every one of 50 records and all kit names exactly equal. No quantities, notes, photos, storage, source data or item order changed.
- iPhone 14 Pro dimensions: 393 x852 CSS-pixel frames. Both pages clientWidth and scrollWidth378 with the desktop scrollbar; no horizontal overflow.
- Mobile Gallery, illustrated Kits, kit sheet, quick-add form, empty Archive and sample refill/reset inspected. Empty Archive now spans the available width (357px when no vertical scrollbar).
- Static HTML IDs/buttons/assets, application and marketing script syntax, service-worker syntax and CSS structure checked.
- No external fonts, tracking, accounts, paid services or spending added.

## Screenshot
- tests/screenshots/v1.13.1-mobile.jpg is an unaltered capture of the published app/website in the phone frames.
- It contains only default starter records in the dedicated cloud test browser (seed IDs, zero quantities, no photos), not the user's iPhone inventory.

## Rollback and limits
- Current snapshot fieldkit-v1.13.1-stable. Prior snapshot fieldkit-v1.12.1-stable (6fd45b7e1023e933a71d1c192afb84d125ccea8a).
- Restore application source through a new versioned commit, retaining fieldkit_inventory_v1 and fieldkit_empty_start_2026_v1. Never clear browser data.
- Browser phone-size testing is not physical iPhone/Safari testing. Camera, installation, real offline use, printing and file transfer were not reverified in this visual release.
- Local preview infrastructure remains unavailable (bwrap proc mount); published browser QA used.
