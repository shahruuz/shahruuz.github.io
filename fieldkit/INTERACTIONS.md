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
