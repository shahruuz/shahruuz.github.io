# FieldKit v1.10.1 theme — published QA

Release commit: c637adbdb8803fe79ba48c0e8631ad0742cf2055
Pages run: 39066873214 — completed / success.
Stable snapshot: fieldkit-v1.10.1-stable.
Rollback: fieldkit-v1.9.2-stable (f65f79556660a3a82dbebefa7950e5044055ffd5).

## Delivered
Alpine field-guide theme: forest, sand and brass; original mountain SVG artwork; serif headings; refined metrics, gear rows, kit cards, forms, navigation, icons and social image.
Presentation-only change. The inventory application script is byte-identical to v1.9.2. Storage keys, reset marker, records and packing behavior are untouched. No charges or external runtime services added.

## Verified
- 38 existing regression checks pass.
- 46 relative references validated; release labels, worker version and manifest assets consistent.
- Both exact published URLs visibly report v1.10.1.
- Desktop inventory and product-page design inspected visually.
- App and website inspected in 393 x 852 CSS-pixel frames with no horizontal overflow (clientWidth and scrollWidth both 378; desktop scrollbars consume 15 CSS pixels).
- Mobile add-item sheet, kit cards, kit detail and packing move menu opened and visually checked without saving inventory changes.
- Final Add item, Refill list, inventory switch and readiness filter controls measured 44 CSS pixels tall.
- Readability pass checked five key text/background token pairs; contrast ranges from 4.58:1 to 5.30:1. This is not a claim of a complete WCAG audit.
- Reload of final app retained the 50 Empty starter items in this test browser. This is not a read of the owner's separate phone storage.
- Final URLs:
  - https://shahruuz.github.io/fieldkit/?v=1.10.1
  - https://shahruuz.github.io/fieldkit/discover.html?v=1.10.1

## Limits
Managed local preview was unavailable (bwrap mount failure); published browser QA used.
No physical iPhone/Safari, installation, camera, print-output or real offline-network verification was performed for this theme-only change. Previous file-transfer verification limits remain. No app functionality was added or changed.

Saved on a QA-only branch to avoid another documentation-only production deployment.
