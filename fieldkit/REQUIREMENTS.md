# FieldKit requirements and decisions

Updated 2026-10-17. Release target: v1.10.1.

## Agreed requirements
- Own design, implementation, testing, fixes, deployment and published verification.
- Spend $0. Preserve existing GitHub Pages hosting and URL.
- Every deployment has a semantic version, matching app labels and changelog.
- Preserve current inventory, photos, notes, order, quantities, locations and archive state.
- Keep fieldkit_inventory_v1 and fieldkit_empty_start_2026_v1 unchanged.
- Quantity 1 → 0 retains the item greyed under Empty on the inventory page.
- Another minus at 0 archives; restore is reversible; permanent deletion only in Archive.
- Support pointer drag and an accessible touch/keyboard move menu for Packed, Need verify and Empty. Retain last positive quantity for refill.
- Dedicated go-bag gear stays dedicated; shared gear belongs in Shared station.
- Test save/reload, packing, backup/restore and mobile at 393 × 852 CSS pixels (iPhone 14 Pro).
- Preserve stable snapshot branches and leave unrelated repository pages untouched.

## Decisions
- 2026-10-17 — Latest user correction supersedes alpine styling: use a native iPhone Notes-inspired theme, more visuals, less explanation. Apply system typography, yellow accents, grouped white lists, colored gear and kit icons. Keep long guidance in expandable help. Preserve behavior, data, free launch and $0 budget.
- 2026-10-17 — User selected **Free public launch**, postponing charging. No checkout or subscription promises.
- Public acquisition page lives at discover.html; existing root opens the app directly so existing users keep their workflow.
- Local browser storage remains the data model. No cloud sync, telemetry, external fonts, analytics or AI API. Photos are manual attachments, not automatic recognition.
- New features: optional item weights, named kits, refill view, printable packing list, offline shell, starter onboarding and automatic pre-import/reset recovery snapshot.
- Marketing uses an explicitly labelled interactive sample, never the owner's records. Do not publish testimonials, unverified claims or invented users.
- A free public app in a public repository has no payment enforcement. A later paid release requires a fresh commercial decision.
- No extra rules were supplied in the bracketed Essential rules placeholder; recovered rules above remain binding.

## Rollback
- Before changes: main 61a68a721ad3ab072d155e024d00b05aa503fa0a, immutable snapshot branch fieldkit-v1.8.0-stable.
- Roll back application files from that branch into a new versioned commit; preserve inventory keys and never clear browser storage. Unregister/remove v1.9 offline worker on downgrade if required.

## Verification
See TESTING.md for observed results and limits. Desktop browser emulation is not a physical iOS/Safari test.
