# Competitor dossiers: the folder contract

Copy this file to `<research-root>/competitors/README.md` the first time the
skill runs in a repo. One living dossier per competitor or reference product,
maintained by the `teardown` skill. This folder is data; the method lives in
the skill.

## Layout

```
competitors/
├── README.md            this file
├── roster.md            index table, rewritten from front matter on every run; never hand-edited
└── <slug>/
    ├── teardown.md      product lens, one section per app generation, newest first
    ├── pulse.md         business lens, dated entries, oldest first, append-only
    └── screens/
        └── gen-N/       curated PNGs: at most 24 per generation, at most 250 KB each,
                         named NN-<caption-slug>.png, every one captioned in teardown.md
```

Full harvests (raw CDN pulls, video frames, help-centre shots) stay outside the repo.

## The record: `teardown.md` front matter

The only place these facts are typed. `roster.md` is derived from it.

```yaml
---
name: Acme Freight
slug: acme-freight            # equals the folder name
kind: competitor              # competitor | incumbent | reference
access: none                  # none | screenshots | seat
pulse: on                     # on | off; defaults to off for kind: reference
home: https://example.com
app: null
help: null
changelog: null
careers: null
social: {linkedin: null, x: null, youtube: null}
reviews: {g2: null, capterra: null, trustradius: null}
generation: 1                 # bumped only by `refresh`
torn_down: 2026-10-05         # last product-lens pass
last_pulse: 2026-10-05        # last business-lens pass, or null
refresh_due: false            # set by a pulse that saw a generation-sized change
---
```

- `kind: reference` = studied for patterns, not a rival; the business lens is
  off by default.
- A pulse may only **propose** a new generation (`refresh_due: true`); only
  `refresh` bumps the number. A generation-sized change is a restyle, a new
  top-level destination or a new object type.

## Provenance labels

Mandatory on every value: **measured** (computed styles, a seat run),
**sampled** (pixels from a screenshot), **eyeballed** (a description from a
screenshot or video), **asserted** (a quoted claim with its source).

## `roster.md`

Columns in this order: Name, kind, access, gen, torn down, last pulse. Rows
sorted by kind (competitor, incumbent, reference), then name.
