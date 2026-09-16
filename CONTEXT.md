# LeadershipIntel

The publishing context: how writing in Notion becomes a public page on
intelligence.stephendmann.com. This file is a glossary and nothing else.

## Language

**Source**:
Notion. The system where articles are authored and edited.
_Avoid_: CMS, database, backend

**Snapshot**:
The versioned set of article files, managed assets and manifest held in this
repository. The publishing boundary: everything the site renders comes from here.
_Avoid_: export, dump, mirror, cache

**Sync**:
The process that reads the source and proposes a new snapshot. Proposing is not
publishing; a sync result is a candidate until it is validated.
_Avoid_: import, fetch, pull, refresh

**Publish**:
Accepting a validated snapshot and deploying the static build from it.
_Avoid_: deploy, release, ship

**Known-good**:
A snapshot that has passed validation. Production always serves the most recent
known-good snapshot, never an unvalidated one.
_Avoid_: latest, current, valid

**Partial**:
A sync result that is unexpectedly incomplete, empty or malformed. Never a
snapshot, and never replaces a known-good one.
_Avoid_: degraded, broken, failed

**Static build**:
Production output rendered entirely from a snapshot, with no request-time call to
the source and no revalidation interval.
_Avoid_: SSG, prerender, export

**Managed asset**:
A binary the sync downloaded into the snapshot because its original location is
not durable. Distinct from an external asset, which is referenced in place.
_Avoid_: attachment, upload, media

**Manifest**:
The record of where each part of a snapshot came from: source identifiers,
original locations, content hashes and fetch times.
_Avoid_: index, lockfile, metadata
