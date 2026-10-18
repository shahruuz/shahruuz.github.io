# FieldKit v1.21.0 — touch and customization

| Surface | Swipe | Hold / drag | Tap controls |
| --- | --- | --- | --- |
| Inventory and departure gear | Existing left −1 / archive at zero, right add; Archive deletion still confirms | Hold a row for actions. Hold ⠿ for 320 ms, then reorder within its packing group or drop onto a storage kit | Name opens quick edit; ⠿ opens move/actions; circle packs/unpacks |
| Kit cards | Right opens customization; left opens actions | Hold card for actions; hold ⠿ and drag to reorder | Card opens kit; ⋯ opens actions; New kit creates empty storage |
| Trip cards | Right opens trip details; left opens actions | Hold card for actions; hold ⠿ and drag to reorder | Edit metadata, duplicate, hide/show, move up/down |
| Active trip items | Right packs/unpacks; left opens actions | Hold row for actions; hold ⠿ to reorder or drop onto a person/bag pill | Edit quantity, owned-item swap, person, bag, reason, consumable and departure-day flags |
| Missing supplies | Right opens acquisition confirmation; left opens actions | Hold row for actions; hold ⠿ to reorder | Edit name, count, category and reason, remove with Undo, or confirm acquisition |
| Text, numbers, dropdowns, switches and navigation | Native selection/scroll/navigation gestures | Native editing gestures | Edit directly; global custom gestures are paused to prevent conflicts |

- Kit customization: name, emoji, color, subtitle, description and emergency protection. Hide/show changes cards, never inventory or ownership.
- Full item details: existing name, category, storage, bin, quantity, state, photo, notes and grams; category accepts custom text. Add up to 20 custom `Label: value` fields. They persist in JSON, CSV and search, and are not included in AI requests.
- Trip details: name, emoji, destination, days, people, style, when and additional context. Quantities stay as edited; Optimize reviews new needs separately.
- Bags & people: one `Person | Bag` per line creates drop targets; dropping a row assigns its full planned quantity to that group. Existing occupied groups remain visible. Weights use entered grams and flag unknowns.
- Departure checklists: customize the name and included storage kits, or create a preset.
- Hidden cards can be restored under More → Hidden kits & trips. Hidden active trips still retain packing and conflict warnings.
- Ended-trip metadata remains editable; packing history remains read-only. Duplicate to reuse a trip. Copies reset packing and cap gear to present stock, moving shortfalls to missing.

New reorder/customization operations have Undo and roll back on save failure. Canceled drags make no changes. Dropping gear on a kit changes its storage assignment without changing stock, photos or notes. Dedicated emergency stock cannot be dragged out casually; deliberate storage edits remain available. Fuel cannot be assigned to a carried bag. Missing gear never becomes owned stock through dragging.

All changes remain on the same device/origin. No new accounts, paid services, analytics or automatic uploads were added. Existing Gemini consent and free-key controls remain in place.

Verification: 96 automated checks including simulated gesture events; static and rendered HTML checked for nested controls. No physical iPhone/Safari gesture or visual browser test is claimed. Rollback source: fieldkit-before-v1.21.0, commit 8c238ceceead7f7563424f60d47c8caff11cdbac.
