# FieldKit v1.12.1 verification

- 42 regression checks pass, including new kit shortcut, view reset and explicit move-control checks.
- Existing storage keys and packing reset marker unchanged. All quantity, archive, recovery and persistence checks pass.
- App uses one versioned stylesheet; zero inline theme blocks. JS syntax, CSS block counts, HTML IDs, nested buttons and local asset references checked.
- Rollback: fieldkit-v1.11.2-stable at d5582225a1317dcfc007e82ef76de603263d8bd8.
- Local preview blocked by bwrap proc mount; published visual and workflow verification follows deployment. Physical iPhone/Safari remains unverified.
