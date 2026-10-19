# FieldKit requirements and decisions

Updated 2026-10-18 (America/Denver). Current implementation: v1.27.3. Trip planner contract and full Gemini prompt/schema: PLANNER_SPEC.md.

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
- App opens to Trips (v1.25.0 product direction); My gear keeps the existing inventory workflow.
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
- Local browser storage remains the data model. No cloud sync, telemetry, external fonts or analytics.
- **User, 2026-10-18:** wants a game: take a picture, items become pieces (picture/emoji), drag them into the bag, and the list updates; the initial list comes from the picture. Wants it free and automatic; "it's totally ok if it leaves my phone, being free is more important." Asked to be interrupted only for decisions that make a huge difference.
- **Implemented v1.16.0:** Scan & pack with optional free Google Gemini Smart scan (owner's own key, saved on device) and a built-in on-device finder as the no-key fallback. Owner must create the free key; Claude cannot create accounts.
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

## Trip planner — 2026-10-18
- **User:** create kits from a description (example: 3 day San Diego trip for 3 people), recommend packs and help pack them.
- **Implementation:** free on-device trip templates, editable assumptions and item quantities; personal kits plus shared day/camp kits. New records are unconfirmed suggestions, To pack, separate from existing inventory. No emergency-kit borrowing. Custom kits use the existing inventory payload and backup/recovery workflow.


## v1.19.0 — interview decisions implemented

User decisions: owned-only trip kits, capped quantities and missing list; partial packing and photo preview; explicit notes/photo consent; edit-preserving optimization; acquisition flow; per-person/bag weights; shared stock with conflict warnings; shopping-list sharing; reviewed consumption on trip completion. Routine implementation choices and exact prompt/schema are recorded in PLANNER_SPEC.md. Existing origin and data/reset keys are unchanged.

## v1.20.0 — three-tap introduction

User: a simple introduction at the beginning showing FieldKit capabilities in 2–3 clicks. Implemented: three visual pages, Next / Next / Start using FieldKit; once per device, Skip and Back, replay from More. Independent intro preference; no inventory changes or new AI/network calls.

## v1.21.0 — touch and customization

User requested swiping, long-hold drag/drop and customization across gear, kits, trips and fields, with serious conflicts paused. Implemented entity-row/card interactions, explicit grips and menus, editable domain data, custom gear fields, presets and bag/person targets. Native input/dropdown/switch/navigation gestures are deliberately unchanged to avoid interfering with typing, scrolling or system navigation. IDs, owned-stock caps, acquisition confirmation, emergency protection and fuel storage remain enforced. Ended-trip metadata can be customized; historical packing remains read-only. Duplicate creates an editable active plan with empty packing and current stock caps. No automatic destructive deletion is introduced.

Release guard v1.21.1: new fuel drag/drop into carried/custom kits is blocked. Shared outdoor storage and explicit field editing remain available.

## v1.23.0 — swipe repair

User reported flawed swiping and requested fixes plus a related improvement audit. Current behavior supersedes prior direct swipe actions: a swipe reveals explicit buttons and never changes data alone. One controller handles rows/cards, preserves native vertical scrolling/pinch zoom and browser edges, cancels cleanly and suppresses only the completing gesture click. Packing drag and hold-grip reordering remain distinct. Stock/archive/packing saves are atomic, trip packing supports Undo, and stale AI inventory previews cannot apply. Physical Safari gesture testing is not claimed.

## Unified experience — v1.24.0

User: make the whole experience unified and effortless; fix obvious errors autonomously and publish. Inventory, kits, trips, scan and editors share the Notes visual language and common keyboard/layer behavior. Keep stock and per-trip packing meanings distinct. Preserve data and consent.

## Trip-first workflow — v1.25.0

User approved replacing feature-led inventory management with a complete Plan → Collect → Pack → Return/refill flow. Trips is the default destination; My gear is an ownership directory. No new cataloging prerequisite or AI/key requirement. Preserve current gear, storage, kits, statuses, photos and trips. A unit can be physically packed for one trip at a time. Used stock changes only by explicit confirmation; return tasks do not imply physical return until checked.

## Direct suggestion add — v1.25.1

User: ＋ on suggestions should go directly to my list, and a checkmark means packed. The explicit ＋ action adds the displayed quantity as owned gear/stock when necessary and puts it on the trip list unpacked. No additional acquisition form. Preserve existing owned stock, metadata and packed units; only checklist packing controls mark packing.

## v1.26.0 — packing usefulness and usability

User: explain the benefit over Notes or AI in one sentence, improve the product, and test the overall experience. Implemented: accurate progress including missing suggestions; next physical action with home storage; trip-specific Select / Select all, Pack selected / Unpack selected with stock caps and Undo; To pack only filter; duplicate owned-item selector repair; recovered swipe repair from the unpublished v1.25.2 work. No data migration, new service, cost, or hosting change.

Published browser QA refinement v1.26.1: preserve row keyboard focus and separate the narrow trip-action controls into two equal buttons plus a separate finish action.

## v1.27.0 — less setup, faster departures

User: strip unnecessary inventory listing, prioritize getting ready to leave, evaluate templates instead of AI, fewer stronger features. The default screen is the active packing checklist; navigation is Pack / More. Hotel/weekend, day hike, camping and blank lists create standalone checklist rows without claiming ownership. Repeat preserves edits and resets packing. Need to get blocks a packing check; Before leaving groups late tasks. Existing inventory, quantities, photos, names, archive and reset marker are preserved behind More. Existing stock-linked trip items retain reservations. No new service, AI calls or costs. Legacy advanced inventory and AI functions remain available separately and do not gate the simple workflow. This direction supersedes the inventory-first setup and five-stage default journey.

Default v1.27.1: unaccepted old recommendations are optional collapsed additions. They never inflate the required packing total. Chosen items alone determine progress.
