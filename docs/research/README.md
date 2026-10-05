# docs/research/

Where the research skills write. `teardown`, `compare` and `landscape` look for a
research root in a fixed order — an existing `research/`, then an existing
`docs/research/`, otherwise they create `research/` at the repository root — so this
directory existing is what sends their output here instead.

```
docs/research/
  competitors/
    roster.md                 derived, never hand-edited
    <slug>/teardown.md        product lens, one section per generation
    <slug>/pulse.md           business lens, dated, append-only
  <date>-<topic>-comparison.md
  <date>-<topic>-landscape.md
```

## This repository is public

Anything committed here is published. A teardown names companies, prices and people, and
a landscape states where "we" stand against them — so a dossier written for a real
product says more about that product than its author usually intends.

- **Study material and worked examples:** commit them.
- **Research for a real product or client:** keep it out. Point the skills somewhere else
  by naming a research root in a local `CLAUDE.md`, or run them in another repository
  through the plugin (see `research-kit/README.md`).

CI scans every commit for identifiers of the organisation this repository's tokens were
adapted from. It does not know about anyone else's.

Outside every path the PR gates classify: a file here never changes a pull request's
classification.
