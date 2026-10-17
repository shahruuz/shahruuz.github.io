# FieldKit changelog

## v1.13.1 — 2026-10-17

- Empty Archive placeholder spans the gallery width and has a centered, rounded layout.
- Verified the regular URL loads the new Gallery. Mobile Gallery/List preference persists across reload; quantity add/Undo and kit artwork checked live.


## v1.13.0 — 2026-10-17

- New default two-column gear Gallery with large image/icon covers and full-width quantity controls. List view remains one tap away and the choice is saved independently of inventory.
- Original illustrated bag covers across the kit gallery; crisp white/black/yellow Notes-inspired styling replaces the previous beige design.
- Entire app stylesheet rewritten. Visible mobile version; regular URL verified after deployment.
- Inventory data, order, keys and all Empty/Archive/packing semantics preserved.
- Rollback: fieldkit-v1.12.1-stable, 6fd45b7e1023e933a71d1c192afb84d125ccea8a.


## v1.12.1 — 2026-10-17

- All/Empty/Archive counts now match the selected kit.
- Tightened visual kit cards and made refill actions consistently yellow.
- Mobile live checks: kit shortcuts, filters, explicit packing moves with Undo, full-screen kit sheet and quick add. No horizontal overflow.
- 42 regression checks pass.


## v1.12.0 — 2026-10-17

- Rebuilt the app hierarchy: gear immediately below search and visual kit shortcuts; All, Empty and Archive views; filters on demand.
- Explicit status buttons open packing moves; visual kit cards and clearer kit detail sheet.
- Secondary statistics, print and installation moved to More. One cohesive application stylesheet replaces accumulated theme layers.
- Storage keys, quantities, photos, notes, order and Empty/Archive semantics preserved.
- Rollback: fieldkit-v1.11.2-stable at d5582225a1317dcfc007e82ef76de603263d8bd8.


## v1.11.2 — 2026-10-17

- Collapsed unused Packed/Verify drop areas so gear appears sooner. Empty destinations reappear during dragging; tap-to-move remains available.
- Live desktop and 393 × 852 browser-frame inspection; add sheet, kits, filters and expandable help checked.
- All 38 regression checks pass; inventory logic unchanged.


## v1.11.1 — 2026-10-17

- Corrected release notes to describe the current Notes-inspired theme and removed superseded alpine copy.
- No inventory logic or data changes.


## v1.11.0 — 2026-10-17

- iPhone Notes-inspired theme: system typography, yellow actions, grouped lists, colorful gear icons and visual kit cards.
- Removed the decorative hero from the app. Shortened copy and moved storage/safety, gestures and advanced guidance into expandable help.
- Matching public website, Notes-style brand mark and updated offline shell. No external assets, tracking or costs.
- Inventory script, storage keys and all inventory data semantics unchanged. All 38 regression checks pass.
- Rollback: fieldkit-v1.10.1-stable at c637adbdb8803fe79ba48c0e8631ad0742cf2055.


## v1.10.1 — 2026-10-17

- Refined small-label and Empty-item contrast while preserving the alpine palette.
- Desktop and 393 x 852 mobile layout inspected live; no horizontal overflow.
- Inventory application script remains byte-identical to v1.9.2; all 38 existing regressions pass.


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
