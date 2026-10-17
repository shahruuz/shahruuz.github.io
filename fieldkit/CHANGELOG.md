# FieldKit changelog

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
