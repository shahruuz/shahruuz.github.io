# FieldKit changelog

## v1.10.0 — 2026-10-17

- Alpine field-guide theme across the app, acquisition page, help and release notes. Deep forest, warm sand and brass palette with editorial serif headings.
- Original lightweight mountain illustration, illustrated inventory header, refined metrics, storage rows, kit cards, forms and bottom navigation.
- Larger contrast between active gear and greyed Empty items; accessible focus and reduced-motion support retained.
- Updated brand marks, install icons and social image; versioned local assets precached for offline use. No external fonts or tracking.
- Theme-only release: application JavaScript and storage behavior unchanged. Existing 38 regressions pass. Published visual verification follows deployment.
- Rollback snapshot: fieldkit-v1.9.2-stable, f65f79556660a3a82dbebefa7950e5044055ffd5.


## v1.9.2 — 2026-10-17

- Versioned launch and information links prevent returning visitors from seeing stale cached HTML after deployment.
- Offline worker revalidates network responses and precaches the versioned app entry.
- Phone viewport QA harness now loads the exact deployed app and product-page version.
- Published v1.9.1 checks passed: visible desktop navigation and search, complete JSON-text backup/restore, actual pointer drag to Need verify and persisted weights/kit names. Behavior tests: 38 pass.


## v1.9.1 — 2026-10-17

- Published-browser QA fixed the desktop navigation stacking, search contrast, kit/stat headings and inherited dark-theme colors.
- Added a JSON text backup/restore fallback for browsers that block file downloads.
- Tightened the mobile product header and headline to fit the phone viewport.
- Retains v1.9.0 behavior and data format; 36 behavior regressions pass.


## v1.9.0 — 2026-10-17

- Free public launch selected by the owner. New discover.html acquisition page, interactive sample, privacy/help, release notes, share image and structured metadata.
- Unified field-journal theme, phone navigation, starter onboarding, refill filter, optional per-unit weights and kit totals, editable kit names and print stylesheet.
- Install manifest and versioned offline app-shell worker. No third-party runtime dependencies, analytics or cloud inventory upload.
- JSON backups retain kit names and weights; recovery snapshot before import/reset; strict import validation and duplicate rejection; unreadable saved data is retained.
- Existing storage keys, one-time packing marker, Empty/Archive workflow and packing move behavior preserved.
- Rollback: immutable fieldkit-v1.8.0-stable at 61a68a721ad3ab072d155e024d00b05aa503fa0a.
- Validation: existing 24 packing regressions pass. Additional release checks and published browser verification are recorded in TESTING.md.


## v1.8.0 — 2026-10-17

- Drag an item by its photo/grip into Packed in bag, Need verify or Empty, on desktop or touch screens. A fixed drop tray avoids dragging through a long list.
- Tap the photo/grip to open the same move choices with a keyboard and touch accessible menu.
- Moves retain the item location, notes and photo; Empty sets quantity to zero and moving out restores the last positive count (at least one). Every move has Undo.
- Inventory and individual kit views show separate packing groups with visible drop destinations.
- Keep archive/delete behavior, the inventory storage key and the one-time empty-start marker.
- Validation: 24 regression checks cover packing moves, Undo, import/reload, retained item details, touch pointer drop/cancel, and the existing Empty/Archive flow.

## v1.7.0 — Stable — 2026-10-17

First explicitly versioned stable baseline.

- Alpine Night theme with mobile bottom navigation, larger touch controls and iPhone safe-area spacing.
- Inventory opens first; zero-quantity gear remains greyed out under Empty.
- Plus refills an empty item; another minus at zero moves it to Archive.
- Archive provides Restore and Delete forever.
- Starter quantities are zero. The one-time packing reset clears active quantities while retaining item details and archived records.
- Existing local inventory, notes, photos and locations use the same storage key.
- App version is visible in the header and footer.

Validation inherited from the stable baseline: 16 behavior checks passed; GitHub Pages deployment and all-empty inventory verified live. This release only adds version labels and release documentation; its application script matches commit 8781666a44cb04cba3f2971123823a30cf9e9cbb.

Stable snapshot branch: fieldkit-v1.7.0-stable.
Future fixes use v1.7.x. The next feature release is v1.8.0.
