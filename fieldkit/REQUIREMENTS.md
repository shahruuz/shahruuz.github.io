# FieldKit requirements and decisions

Updated 2026-10-18 (America/Denver). Release baseline: v1.13.1 (main ce8f776). Published: v1.14.0 (1797085). In progress: v1.15.0.

Each decision is marked **User** (Shahrouz decided or stated it) or **Proposal** (an assistant suggestion that is not approved until the user confirms it).

## Agreed requirements (User)
- Own design, implementation, testing, fixes, deployment and published verification.
- Spend $0. Preserve existing GitHub Pages hosting, origin, path and URL.
- Every deployment has a semantic version, matching app labels and changelog.
- Preserve current inventory, photos, notes, order, quantities, remembered refill counts, locations, kit names, weights and archive state.
- Keep fieldkit_inventory_v1 and fieldkit_empty_start_2026_v1 unchanged. Never repeat the one-time packing reset.
- Quantity 1 → 0 retains the item greyed under Empty on the inventory page.
- Another minus at 0 archives; restore is reversible; permanent deletion only in Archive, with confirmation.
- Support pointer drag and an accessible touch/keyboard move menu for Packed, To pack and Empty. Retain last positive quantity for refill.
- Dedicated go-bag gear stays dedicated; shared gear belongs in Shared station.
- App opens directly to Inventory.
- Test save/reload, packing, backup/restore and mobile at 393 × 852 CSS pixels (iPhone 14 Pro).
- Preserve stable snapshot branches and leave unrelated repository pages untouched.
- Use the personal GitHub account shahruuz. Keep the Her Mind & Wellness account and project separate.

## Design direction
- **User:** "Keep it like native iPhone Notes app theme with more visuals, less explanation."
- **User, 2026-10-17:** Rejected the published v1.13.x design ("Nope, I don't like it"). The two-column gear gallery, illustrated bag covers, pastel category panels, large counters and earlier layouts are **rejected attempts, not approved branding**.
- **User, 2026-10-17 (late):** chose the open-checklist mockup (option B) as the inventory design, with the goal of one picture per kit that updates inventory directly.
- **User, 2026-10-18:** did not like the v1.14.0 checklist theme; asked to reimagine it with a more immersive experience and a workflow that solves organizing once and for all, then said "do your best".
- **User, 2026-10-18:** "Need verify" must go completely.
- **Proposal (implemented v1.15.0):** combined concept — kit overview with progress rings, full-screen kit checklist, tap the circle to pack. Stored "check" values are kept and shown as To pack (no migration). Photo thumbnails show when attached. Pending user review.
- **User, 2026-10-18:** asked about updating inventory from a photo. No free automatic option exists; a paid vision API would need cost and privacy approval. Not built.
- **User:** "More visuals" does not mean dashboards, large counters, decorative marketing copy or a pastel card gallery.

## Other decisions
- **User, 2026-10-17:** Free public launch; charging postponed. No checkout or subscription promises.
- Public acquisition page lives at discover.html; the root opens the app directly so existing users keep their workflow.
- Local browser storage remains the data model. No cloud sync, telemetry, external fonts, analytics or AI API. Photos are manual attachments, not automatic recognition.
- Existing features retained: optional item weights, named kits, refill view, printable packing list, offline shell, starter onboarding and automatic pre-import/reset recovery snapshot.
- Marketing uses an explicitly labelled interactive sample, never the owner's records. No testimonials, unverified claims or invented users.
- A free public app in a public repository has no payment enforcement. A later paid release requires a fresh commercial decision.

## Superseded entries
- The 2026-10-17 entries that made the Gallery the default view, added illustrated kit covers, and described the Notes-inspired yellow/white gallery as the agreed direction were assistant implementations. The user rejected the result; they are kept here only as history.

## Rollback
- Current source snapshot: branch fieldkit-v1.13.1-stable (ce8f776a9b42116c28bb2000052bfa6b43238590).
- Roll back application files from a snapshot branch into a new versioned commit; preserve inventory keys and the packing-reset marker, and never clear browser storage.

## Verification
See TESTING.md for observed results and limits. Desktop browser emulation is not a physical iOS/Safari test.
