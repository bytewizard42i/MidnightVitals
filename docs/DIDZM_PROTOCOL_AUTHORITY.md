# MidnightVitals Protocol Authority

MidnightVitals has one protocol source of truth:

[`../../DIDzMonolith-docs/standards/MIDNIGHTVITALS_PROTOCOL.md`](../../DIDzMonolith-docs/standards/MIDNIGHTVITALS_PROTOCOL.md)

This standalone repository owns implementation packages, adapters, tests,
release artifacts, and implementation-specific documentation. It may support
projects outside DIDzM. It does not independently redefine the protocol.

The four DIDzM engines should point to the root protocol and keep only their
profile-specific configuration and evidence requirements locally.
