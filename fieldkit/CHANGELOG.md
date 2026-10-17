# FieldKit changelog

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
