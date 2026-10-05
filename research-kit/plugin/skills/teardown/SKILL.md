---
name: teardown
description: "Tear down a competitor or reference product into a living dossier covering product design (screens, IA, navigation, interaction, vocabulary) and business (what they shipped, said, who reviewed them, who they hire, what it costs). The dossier accumulates across runs instead of restarting. Use when someone says \"tear down X\", \"teardown\", \"competitor check\", \"what's new at X\", \"what did X ship\", \"pulse the competitors\", \"how does X do Y\" when X is a product, or shares a competitor's demo, site or app. Load it before answering even when you are only asked how you would approach the research: the order of the steps is the method (business lens first), and answering from this description alone skips it."
---

# Teardown

A competitor teardown that accumulates instead of restarting. One folder per
subject, refreshed rather than rewritten.

Ported from a teardown skill built for one product team. The method is theirs;
the repository paths, the hosted publish step and the whiteboard export are
removed so this runs in any checkout.

## The one rule that changes the answer

**Run the business lens before you trust the product lens.** On the first run
the screens said "live competitor" and the business sweep said the company had
been sold, the blog had stopped, and five people were left. Same product,
opposite conclusion. A teardown that only looks at the UI will tell the reader
to worry about a corpse.

**And watch every demo they publish, not just the one for your side.** The same
run wrote two confident claims from marketing copy, and the other side's demo
disproved both. If a competitor is two-sided, you are not done after one video.

## Where things live

Pick the research root once per repo, in this order: a path the host repo's
`CLAUDE.md` / `AGENTS.md` names for research; an existing `research/`; an
existing `docs/research/`; else create `research/`. Say which one you chose.

```
<research-root>/competitors/
├── README.md              copy of `folder-contract.md` on first use
├── roster.md              derived from front matter, never hand-edited
└── <slug>/
    ├── teardown.md        product lens, one section per generation, newest first
    ├── pulse.md           business lens, dated, append-only
    └── screens/gen-N/     ≤24 per generation, ≤250 KB each, every one captioned
```

Full harvests (raw CDN pulls, video frames) stay outside the repo, in the
session scratchpad or a directory the user names. The front-matter schema is
in `folder-contract.md`; read it before writing a dossier.

## Modes

| Invocation | What it does |
|---|---|
| `teardown <url or name>` | New subject. Both lenses, from founding to now. |
| `teardown pulse <slug>` | Business delta since `last_pulse`. Appends, never rewrites. |
| `teardown pulse --all` | Every subject with `pulse: on`, then one summary table. |
| `teardown refresh <slug>` | New product generation. Adds a section, bumps `generation`. |

A new-subject run on an existing slug refuses and points at `pulse` or
`refresh`. Nothing is ever overwritten by accident.

## Steps

**1. Set the access tier first**, because it decides both the capture method and
how much every value is worth. `none` (public surfaces only), `screenshots` (a
teammate's own trial or install), `seat` (a session that is already signed in).
Ask only if you cannot infer it. Never enter a login, never solve a CAPTCHA,
never use a seat that is not already signed in.

**2. Run both lenses in parallel.** Dispatch two subagents: one for the public
site and imagery, one for the business sweep. They do not overlap. Brief the
business one from `sources.md`, the site one from `capture.md`. Meanwhile,
watch the videos yourself.

**3. Watch every video they publish.** Count them first. Loom hands you a
transcript for free (`capture.md`). Extract frames, read them, and curate.

**4. Write the dossier.** Skeletons in `lenses.md`. Every value carries
**measured** (computed styles or a fetched stylesheet), **sampled** (pixels),
**eyeballed** (a description from a video or image), or **asserted** (their
claim, quoted with its source). An unlabelled number is a defect.

**5. Rewrite `roster.md`** from the front matters: Name, kind, access, gen,
torn down, last pulse. Sorted by kind (competitor, incumbent, reference), then
name.

**6. Self-check** against the done list below, then hand back the dossier path
and the verdict.

Publishing (a page, a board) is optional and out of scope for this skill. If
the user asks for one, build it from the dossier; never hand-write it.

## Traps this ritual has already hit

- **Never sample colour from a recorded video.** A white page reads as `#b5b5b5`
  in a Loom encode. Anything from a video is *eyeballed*, never *sampled*.
- **Blend a presenter overlay, do not black it out.** A dark fill renders as a
  broken-looking block on every frame. Fill it with the median colour of the
  strip directly above it.
- **Reviews often belong to a predecessor product.** Check the dates before
  quoting a rating as if it describes what ships now.
- **A 403 proves nothing.** Label a source as *blocked*, not *empty*.
- **One `generation` integer cannot model two products on different cadences.**
  Number generations chronologically across both product lines and say so in
  the dossier.

## Style

- The verdict leads with the business fact if there is one that reframes
  everything. Most readers stop after three lines.
- Steal / adapt / refuse, each with the **why**. A bare "don't" gets
  rationalised away later.
- Name the wedge: what they have no counterpart for is the most useful output.
- Outward-facing prose: TL;DR first, no em dashes, no negative parallelism, no
  fake-epiphany setups, no exclamation marks, never a claim without its source.
- **A human hand-edits the verdict before the dossier goes to anyone.** It is
  the one block a reader outside the team is likely to quote. Say so when you
  hand it back.
- Transfers map to the host repo's own vocabulary (its component tiers, tokens,
  domain nouns). Read them from the host repo's `CLAUDE.md` / `AGENTS.md` / KB
  at run time; do not invent a taxonomy.

## Done check

- [ ] every value labelled measured / sampled / eyeballed / asserted
- [ ] every business line carries a URL and a date; sources that returned nothing are listed, with the query, and blocked ones are marked blocked
- [ ] every video they publish was watched, or the unwatched ones are named
- [ ] screens ≤24 per generation, ≤250 KB each, all captioned in `### Key screens`
- [ ] `roster.md` rewritten from front matter
- [ ] nothing entered behind a login the seat did not already have
- [ ] the hand-off says the verdict needs a human edit before sharing
