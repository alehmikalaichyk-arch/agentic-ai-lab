---
name: landscape
description: "Synthesise a competitive landscape across several players — category map, strategy canvas (factors scored 0-10 per player), ERRC grid (eliminate / reduce / raise / create) and a SWOT per competitor read from our side. Built on teardown dossiers when they exist, never on unsourced impressions. Use when someone asks for \"competitive landscape\", \"market map\", \"SWOT\", \"ERRC\", \"blue ocean\", \"strategy canvas\", \"positioning against competitors\", \"where do we stand\", or wants the competitor set summarised for a deck or a strategy discussion. Load it before answering even when you are only asked for an outline: the canvas and ERRC rules (factors before scores, rows where we score low) are not in this description."
---

# Landscape

The cross-competitor view. `teardown` goes deep on one subject; `landscape`
lays several side by side and says where the open ground is. The format
follows a competitive-set study (SWOT + ERRC) run for one product team.

## Inputs, and the rule about them

**Every cell traces to a source.** Preferred source: the `teardown` dossiers in
`<research-root>/competitors/`. For a player with no dossier, either run a
`teardown` first, or do a short sweep with `teardown/sources.md` and mark that
player **thin** in every table it appears in. Never fill a SWOT from general
knowledge without saying so; an assertion from memory is labelled *eyeballed*
and is the weakest evidence on the page.

Read the business lens before the product lens here too: a player that was sold,
stalled or shrank changes its row in every table.

## Steps

**1. Frame.** One sentence: the market, the buyer, and **our** product's
position as the reader understands it. Read our positioning from the host
repo (`CLAUDE.md`, KB, product docs); if none is written, ask once.

**2. Category map.** Group players by the job they do, not by who they say
they compete with. Per category: what the job is, who is in it, and a one-line
verdict (direct competition / closest in spirit / potential partner /
irrelevant). Place our product last, and say whether it is a category member
or a layer across categories.

**3. Strategy canvas.** 6–10 factors that buyers actually trade off. Score each
player 0 (no offering) to 10 (category maximum). Rules:
- **Register the factors before scoring**, the `compare` rule: a factor added
  after you see the scores is suspect, and is marked post-hoc.
- Include factors where **we score low**. A canvas where we win every row is a
  pitch, not an analysis, and the reader will discount all of it.
- State the scoring basis once, honestly: "expert judgement from public
  sources, <month year>" unless rows are measured.
- After the table, one paragraph on the shape: which rows separate the field,
  where everyone is zero (the open ground), where everyone is high (table
  stakes).

**4. ERRC grid.** From our side: what to **Eliminate** that the industry treats
as mandatory, **Reduce** below the norm, **Raise** above the norm, **Create**
that nobody offers. Every Create item points at a canvas row where every
player scores zero or near it; every Eliminate/Reduce says what it saves us.

**5. SWOT per competitor.** Strengths and weaknesses are the competitor's,
internal. Opportunities and threats are **ours**, created by their position.
Each bullet is one claim with its reason; at least one source per competitor
block; the threats block includes what they could ship cheaply that would blunt
our story.

**6. Watch list.** Per player: the one thing to re-check and when (e.g. a
roadmap collision marked for quarterly re-check). Feed it back into the
dossier's `pulse.md` "Watch next" line if a dossier exists.

## Output

`<research-root>/YYYY-MM-DD-landscape-<market-slug>.md`, from
`doc-template.md`. TL;DR first: the players, how many categories, the one
direct overlap, the wedge in a sentence. No em dashes, no exclamation marks.
A human edits the TL;DR and the ERRC before anything leaves the team; say so
when you hand it back.

## Done check

- [ ] every player either has a dossier or is marked **thin** everywhere it appears
- [ ] canvas factors listed before scores; at least one row where we score low
- [ ] scoring basis stated; every measured row labelled measured
- [ ] every Create item maps to an all-zero (or near) canvas row
- [ ] SWOT O/T written from our side, with at least one source per competitor
- [ ] watch list present; dossiers' "Watch next" updated where they exist
