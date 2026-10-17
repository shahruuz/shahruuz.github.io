# FieldKit v1.9.2 — published verification record

Release commit: f65f79556660a3a82dbebefa7950e5044055ffd5
GitHub Pages run: 39053580203 — completed / success.
Stable snapshot: fieldkit-v1.9.2-stable.
Pre-redesign rollback: fieldkit-v1.8.0-stable at 61a68a721ad3ab072d155e024d00b05aa503fa0a.

## Final published links
- Product: https://shahruuz.github.io/fieldkit/discover.html?v=1.9.2
- App: https://shahruuz.github.io/fieldkit/?v=1.9.2
- Device harness: https://shahruuz.github.io/fieldkit/tests/device.html?v=1.9.2

## Verified
- 38 Node VM behavior regressions pass, covering legacy records/photos, quantities, state moves, pointer drop/cancel, Undo, archive/restore/delete and cancellation, reload, JSON round trips, strict imports, weights, named kits, refill filtering, recovery, storage quota errors, formula-safe CSV and text-backup UI.
- 41 relative HTML links/assets resolved; application metadata and worker version match 1.9.2; icons and manifest assets exist.
- Published app visibly reports v1.9.2; product footer visibly reports v1.9.2.
- Actual browser quick-add -> full details retained entered name/count; weight and notes saved; reload retained data.
- Actual browser move to Empty, Undo, archive, cancelled deletion, restore and refill worked.
- Actual desktop pointer drag moved gear from Packed to Need verify with count and weight retained.
- Actual mobile frame navigation and kit rename worked; kit totals and names updated consistently.
- Actual JSON text export -> changed quantity -> confirmed restore returned original quantity. Final v1.9.2 text restore and reload also succeeded.
- Interactive marketing demo refill/empty and FAQ expansion worked.
- Published app and product inspected in 393 x 852 CSS-pixel frames. Both have no horizontal overflow (clientWidth equals scrollWidth). Desktop scrollbars consume 15 CSS pixels of each frame's content width; this is not a physical iPhone/Safari test.
- Desktop header navigation and input/heading contrast defects found during v1.9.0 QA were fixed and verified in v1.9.1/1.9.2.
- Versioned URLs avoid stale HTML observed at the plain URL during deployment.
- QA-created gear and renamed kit were removed/restored using a reversible JSON restore. Final app reload showed the original 50 items, zero total quantity and 50 Empty items in the test browser. This is not a read of the owner's separate phone storage.

## Limits
- Browser download-event capture timed out in this environment; no successful end-to-end JSON/CSV file-download-and-upload cycle is claimed. Text backup/restore was verified instead.
- Print button invoked, but the environment exposed no print preview; print layout/output remains unverified.
- Physical iPhone/Safari, home-screen installation, camera capture, keyboard dictation and real loss/restoration of network were not tested.
- Offline worker syntax, versioned precache and request-handling code checked, but actual offline operation is not claimed as browser-verified.
- Browser console showed extension-metadata errors from chrome-extension URLs; no site application error was observed in the retrieved entries.
- Managed local preview was unavailable (bwrap mount failure). Published browser QA was used.
- Free public launch selected by user. No checkout, subscription, cloud sync, analytics, paid advertising, new paid services or charges were introduced. Spend: $0.

This QA record is committed on a separate branch so verification documentation does not trigger another production deployment.
