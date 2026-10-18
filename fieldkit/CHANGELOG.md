# FieldKit changelog

## v1.22.0 — 2026-10-18

- Replaces competing swipe handlers with one axis-locked controller for gear, kit/trip cards, trip items and missing supplies. Swiping reveals buttons; only tapping an action changes data or opens an editor. No automatic full-swipe actions.
- Vertical/diagonal scrolling, direction reversals, canceled touches, lost capture, second fingers, tab/background changes and detached rows cleanly reset translated surfaces. One row stays open at a time; outside taps, scrolling and Escape close it.
- Replaces blanket click delays with suppression of the completing gesture click. Fresh taps and keyboard/assistive actions remain usable immediately. Reorder grips and packing-circle drag keep distinct roles.
- Quantity, archive, packing and deletion failures restore the prior data; trip packing gains Undo. Packing controls at zero/current stock caps no longer offer ineffective actions. Modal focus tracking avoids hidden controls.
- AI previews refuse application after owned inventory changes. Existing inventory, on-device keys, reset marker, photos and custom fields are preserved.
- 114 automated checks, including capture/bubble event dispatch, cancellation paths, explicit swipe actions, save-failure rollback and stale AI preview protection. Physical iPhone/Safari/browser visual verification remains unavailable.
- Rollback: fieldkit-before-v1.22.0 (98b6e09).


## v1.21.1 — 2026-10-18

- Blocks fuel-canister drag/drop into carried or custom kits. Fuel remains in the shared outdoor-storage workflow; quantities and storage notes are preserved.
- 97 regression checks pass, including fuel storage-drop prevention.


## v1.21.0 — 2026-10-18

- Swipe kit/trip cards for customization or actions. Hold any gear/card row for actions; hold the visible ⠿ grip then drag to reorder. Grips also open tap/keyboard move controls. Trip item swipes pack/unpack or open actions; missing-list swipes open acquisition or edit actions.
- Drag owned gear onto a kit/storage destination. Drag trip items onto named person/bag groups; totals update. Pointer cancellation and native edge navigation preserve data. Dedicated emergency stock cannot be moved out by a casual drag; fuel stays in outdoor storage.
- Customize kit name, emoji, color, subtitle, description and protection. Create empty kits; hide/show kits and trips without removing gear or packing. Customize departure checklist names and included kits; add presets.
- Edit trip name, icon, destination, days, people, style, dates and context; duplicate plans with packing reset and quantities capped to current stock. Edit missing-item names/counts/reasons/types, and preserve these edits through AI optimization.
- Gear supports custom categories and up to 20 Label: value fields, included in search, JSON backups and CSV. Existing photo, notes, bin/shelf, quantities and grams remain editable.
- Customization, order and assignments survive reload/cross-tab updates and backup/import. New customization operations support Undo and roll back on save failure. No stock/reset migration or hosting change.
- Deliberately paused: global swiping/dragging on text fields, switches, dropdown options and navigation controls, which would conflict with typing, scrolling and browser navigation. Native controls retain their normal gestures.
- Rollback: fieldkit-before-v1.21.0 (8c238ce).


## v1.20.0 — 2026-10-18

- Three-tap visual introduction on first opening: count and locate gear, plan an owned-stock trip kit with optional Gemini, then pack with checkmarks or confirmed photo matches. Examples are clearly labeled and never enter inventory.
- Next → Next → Start using FieldKit, plus Back and Skip. Remembers completion on this device and reopens from More → FieldKit in 3 taps.
- Accessible modal focus, background isolation, keyboard support and phone-safe-area layout. Replaces the old first-run banner without changing inventory or the existing reset marker.
- Rollback: fieldkit-before-v1.20.0 (dd1ae48).


## v1.19.0 — 2026-10-18

- Plan a trip now references actual owned gear, with capped quantities and a separate acquisition/shopping list. It never creates unowned inventory. Local planning works without a key or connection.
- Gemini optimization with explicit data-sharing consent, notes/photos context, selected past-trip context, structured output validation, edit protection and preview before applying. Fixed free-tier Flash allowlist; quota failures keep the local kit.
- Trip-specific full/partial packing, amber progress, per-person/bag assignments and known-weight totals; cross-trip gear warnings. Snap to pack previews uncertain matches and uses non-additive counts.
- Acquired quantities refill stock and the trip; share/copy missing supplies. Finish trip reviews consumption, resets packing and keeps history. JSON backups preserve plans.
- Existing inventory IDs, photos, locations, quantities, storage key, reset marker and legacy status compatibility preserved. No “Need verify” UI state.
- Rollback source: fieldkit-before-v1.19.0 (0bf7e82).


## v1.18.0 — 2026-10-18

- Kits → Plan a trip: describe destination, days and travelers; review local recommendations for city, beach, hiking, camping or cold trips. Edit trip details, kit names, quantities and selected items before creation.
- Creates one personal kit per traveler plus shared kits, all To pack. Existing gear stays unchanged; no ownership or weather claims, API key, uploads or fees.
- Custom kits survive reload, cross-tab updates, JSON export/import and recovery. Creation saves a recovery snapshot and supports Undo.
- Rollback: fieldkit-before-v1.18.0 (13b5bbd).


## v1.17.0 — 2026-10-18

- **Select mode** on Inventory and inside each kit: tap **Select**, tick several items (or **Select all** for what is on screen), then use the bottom bar: ✓ Pack, ○ To pack, +1, −1, Empty, Move to another kit, or Archive. One Undo reverses the whole batch.
- In **Archive**, Select mode offers Restore and Delete forever for several items at once; permanent deletion still asks for confirmation and only removes archived items.
- Bulk −1 stops at zero (it never archives); bulk Empty and To pack keep remembered counts; saved "verify" items keep their stored status.
- Scan & pack: **Unpack all** next to Pack all.
- 64 regression checks pass (4 new for Select mode).

## v1.16.3 — 2026-10-18

- Smart scan now shows Google's own reason when a key or request is refused (with the key blanked out), instead of a generic "did not accept" message.
- New **Test key** button (Scan screen and More → Smart scan); saving a key tests it automatically.
- If Google's model list is blocked for a key, Smart scan still tries the current free flash models directly (gemini-3.8-flash, 3.5-flash, 2.5-flash, flash-latest) and remembers the one that works.
- 60 regression checks pass.

## v1.16.2 — 2026-10-18

- Fix: Smart scan rejected valid Google keys in newer formats (for example keys containing dots). The key check now accepts any complete key and strips spaces, line breaks and quotes picked up while copying.

## v1.16.1 — 2026-10-18

- Smart scan can be turned on directly from the Scan & pack screen ("Turn on Smart scan (free)"). The scan screen covers the tab bar, so the earlier hint pointing to More could not be followed from there. The More → Smart scan box remains.
- 58 regression checks pass.

## v1.16.0 — 2026-10-18

- New **Scan & pack** game (Kits → Scan & pack, the camera button on Inventory, or Scan photo inside a kit): take one photo of gear laid out, see each item outlined and numbered on the photo, get a game piece per item (photo cut-out, emoji, editable name, count), then tap or drag pieces into the bag. Save adds new gear to the chosen kit, updates matching gear (count, packed state, photo if missing), keeps everything else, writes a recovery snapshot first and offers Undo.
- **Smart scan (optional, free):** with a Google AI Studio key saved under More → Smart scan, photos are sent to Google Gemini, which names and locates every item. The key stays on the device, is never exported, and goes in a request header (never in a URL). The newest available free "flash" model is picked automatically. If Gemini fails or the free limit is reached, the built-in finder is used and the reason is shown.
- **Built-in finder (no key):** automatic cut-outs on a plain background plus on-device COCO-SSD names for everyday objects. Its files (about 18 MB) are self-hosted under vendor/ and downloaded only on first scan, then cached.
- Privacy page updated for Smart scan. User decision: free matters more than keeping photos on the phone.
- 57 regression checks pass (8 new for scanning).
- Rollback: fieldkit-v1.15.0-stable (fcb1a7b).

## v1.15.0 — 2026-10-18

- Removed the "Need verify" state from every screen (user decision). Packing is now To pack → Packed, with Empty kept in the same list.
- Tap the circle to pack or unpack, with Undo. Tapping an empty item packs it with its remembered count. − at zero still archives; deletion stays in Archive with confirmation. Drag onto a section and the Move menu (Edit → Move…) remain available.
- Items saved earlier as "verify" keep that stored value and simply appear under To pack; editing one keeps it unless you change its status. No stored data is migrated.
- Kits screen rebuilt: one overview bar (packed / to pack / empty) and a kit list with progress rings. Kit opens full screen with a large ring, Add gear and the kit checklist. Illustrated kit covers and the gallery are removed.
- New single iPhone-style stylesheet replaces the layered themes; real photo thumbnails show in rows when attached; zero weights are hidden; the List/Gallery switch is retired.
- 49 regression checks pass (6 new: tap-to-pack with Undo, legacy verify display, edit preservation, Move button, empty search, kit rings).
- Rollback: fieldkit-v1.13.1-stable (ce8f776) or v1.14.0 commit 1797085.

## v1.14.0 — 2026-10-18

- Inventory now opens as an iPhone Notes-style checklist, replacing the rejected gallery as the default. Each kit's items are grouped as Packed in bag, Need verify and In storage / day-of, with Empty listed in the same screen.
- Tap a status circle to move gear (Packed, Need verify, Empty) through the existing accessible move menu. Tap − and + to change quantity.
- Kept the List view as an option; the choice is saved separately from inventory. Saved gallery preferences now show the checklist.
- Photos are hidden in the checklist view but remain attached and visible in List view and item details. (Known tradeoff, pending user review.)
- Inventory data, keys, ordering, Empty/Archive rules, packing-reset marker and storage unchanged. Regression checks: 44 of 44 pass.
- Rollback: fieldkit-v1.13.1-stable, ce8f776a9b42116c28bb2000052bfa6b43238590.

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

