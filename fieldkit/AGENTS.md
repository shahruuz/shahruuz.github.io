# FieldKit release rules

User instruction: give every future production push a version and report it in the conversation.

- Start every change by reading the current VERSION and CHANGELOG.md.
- Use semantic versions: fixes are v1.7.x; the next feature release is v1.8.0.
- Every production change must update VERSION, application-version metadata, the visible header/footer version, and CHANGELOG.md together in one commit.
- Include the version in the commit message. After Pages succeeds, report the exact version, deployment status, main changes, and relevant validation in the final response.
- Preserve stable snapshot branches such as fieldkit-v1.7.0-stable; never move or edit them. Create a new snapshot for a newly designated stable release.
- Preserve the fieldkit_inventory_v1 storage key and existing item data during ordinary releases.
- Do not change or remove the fieldkit_empty_start_2026_v1 marker as part of ordinary releases. It exists only for the one-time user-requested packing reset; changing it would erase newly entered packing quantities.
- Keep quantities at zero under Empty; minus at zero archives; permanent deletion belongs in Archive.
- Test behavior affected by a change. Verify Pages after deployment. Do not describe a release as deployed until its deployment succeeds.
