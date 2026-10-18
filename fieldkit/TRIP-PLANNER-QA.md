# FieldKit v1.18.0 trip planner QA

- Baseline: 13b5bbd / v1.17.0. Rollback branch fieldkit-before-v1.18.0.
- 69 Node VM regression checks pass, including the existing 64 plus trip parsing, personal/shared scaling, preserving existing items and Undo, custom-kit reload/export/import, and quota rollback.
- Planner uses local rule-based templates, not a language model or live weather. All assumptions are editable.
- Existing quantities, items and packing reset marker are unchanged by opening/reviewing a plan. Creating a plan appends To pack records after saving a recovery snapshot.
- Trip kits are included in the same inventory payload, JSON backups, cross-tab load and kit selectors.
- Browser verification recorded after deployment. Physical iPhone/Safari and installed offline PWA are not verified.
