# FieldKit v1.25.1 — ＋ adds, circle packs

Tap ＋ on a suggestion to add its displayed quantity directly to your trip list, unpacked. Existing eligible owned stock is reused; only a stock shortfall increases owned quantity. The new row is brought into view. Its circle packs all planned units and another tap unpacks them; −/+ supports partial packing. Undo reverses an accidental suggestion addition.

This replaces the extra acquisition form for suggestion taps, including suggestions reached from Refill. Edit amounts through the existing suggestion/item menus when needed. Home storage and existing packed quantities are preserved. Stock reservations still prevent packing a unit already packed elsewhere.

# FieldKit v1.25.0 — trip-first controls

Trips is home. Continue the selected active outing, or plan a new one. My gear tracks owned quantities; Refill combines explicit replenishment targets, active-trip shortfalls and an expandable Empty list. Storage kits remain under My gear.

Collect from is the default trip view: pending gear is grouped by its home kit and shelf. Departure-day items and completed packing are separate. Bags & people switches to destination grouping. Name taps open editing; packing circles and −/+ handle whole/partial quantities. Grips and swipe actions remain optional alternatives. Cross-group reordering does not silently relocate storage or assignments.

Packing reserves owned stock across active trips. Finishing records only explicitly consumed units, then reserves remaining packed gear until returned. Return checkmarks never change owned quantities or storage. A return cannot be reversed while those units are packed elsewhere. Refill buttons add the shown quantity after the user has obtained it, with repeat-safe target counts and Undo.

Suggestion ＋ directly adds unpacked gear, reusing owned stock first and adding only any shortfall. Dedicated emergency gear remains excluded from ordinary trips. AI consent and optional photo confirmation are preserved. Return shelf/location records never enter Google planner prompts.

New installs start with no cataloged gear; existing inventories are never emptied by this release. The starter reset remains a deliberate recovery-backed action. Backups contain the new optional return/refill fields.

# FieldKit v1.24.0 — one set of controls

Inventory, kit details and trip checklists share packing circles, −/+ quantity controls, photo thumbnails and swipe-to-reveal actions. Trip quantities show packed / planned; inventory quantities show owned stock. Trip packing never changes owned stock.

Scan gear uses photo rows with the same list rhythm. The scan board remains an explicit preview: Save applies it to inventory, with Undo. Google AI remains optional and existing sharing consent still applies.

Screens use a shared content width and heading scale. Editors share one sheet size. Escape closes the topmost layer or cancels a trip inline editor; underlying screens remain inert until revealed. Scan cancellation returns to the source kit. Full item details Save/Back returns to the source kit or trip.

File buttons retain their native keyboard-accessible inputs. Save failures turn the header indicator red. Refilling and editing preserve prior quantities and notes.

Rollback: `fieldkit-before-v1.24.0` at `72c2679809bc527a0dc02c433e03de14d8134d2c`.

# FieldKit v1.23.0 — swipe, then tap

A swipe reveals buttons. It never changes quantities, packs gear, confirms acquisition, deletes records, or opens an editor by itself. Tap a revealed button to apply it.

| Surface | Swipe right reveals | Swipe left reveals |
| --- | --- | --- |
| Owned gear | +1, Add… | Edit, −1 (Archive when already empty) |
| Archived gear | Restore | Delete (confirmation required) |
| Kit or trip card | Edit | More |
| Active trip gear | Pack / Unpack (Edit qty if stock changed) | Edit, More |
| Missing supplies | Acquired (opens confirmation form) | Edit, More |

Only one row stays open. Tap outside, tap its remaining surface, scroll, swipe it closed, or press Escape to close the buttons. Short, canceled, vertical and ambiguous diagonal movements make no data changes. Native edge navigation, typing, pinch zoom and scrolling remain available.

Hold a row to open its actions. Hold the ⠿ grip, then drag to reorder. Moving the grip before its hold completes cancels instead of opening an unwanted menu. Tap ⠿ or ⋯ for equivalent keyboard/tap controls. Packing-circle drag remains a separate control for moving between packing states.

Drop owned gear onto a kit/storage target without changing its stock. Dedicated emergency gear and fuel retain their drag/drop restrictions. Drop trip gear onto a bag/person pill to assign its full quantity; known-weight totals update.

Kit names, emojis, colors, subtitles, descriptions and protection are customizable. Trip metadata, bag/person targets, missing supplies, departure presets, custom categories and up to 20 custom gear fields remain editable. Hide/show cards from More without deleting gear. Ended-trip packing stays historical; duplicate to reuse a trip with empty packing and present stock caps.

Quantity, archive and packing operations support Undo. Save failures restore prior data. Permanent deletion still requires confirmation and has no Undo; a failed deletion save retains the archived record. AI previews cannot apply if owned stock changed while they were being prepared or reviewed.

No storage/reset key migration, paid services, accounts, analytics or automatic uploads were added. Validation uses disposable fixture records and realistic pointer sequences. Physical iPhone/Safari/browser visual testing is not claimed. Rollback: fieldkit-before-v1.23.0 at 0a1e75c246d0b59274cb29b4c523730e5af47396.
