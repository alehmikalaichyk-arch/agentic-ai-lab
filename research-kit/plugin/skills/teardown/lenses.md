# The two file skeletons

## `teardown.md`: the product lens

```markdown
---
(front matter: the schema lives in research/competitors/README.md)
---

# <Name>

## Verdict
Three to five lines. If a business fact reframes everything, it goes FIRST and
in bold. Then what it is, what to steal, what to refuse, and the wedge.

## Transfers for <host product>
steal / adapt / refuse, each mapped to the host repo's own tiers (read them from
its CLAUDE.md / AGENTS.md / KB) and to the token or recipe it lands on. Then "no counterpart", which is
the wedge and usually the most useful block on the page. Any correction to an
earlier pass is recorded here, in the open, with what caused it.

## Generation N: <what it is> (<how it is dated>)
Evidence line first: exactly what was watched, crawled or measured, and how
each kind of value is labelled.

### IA and object model
Top-level destinations, the object nesting written as a path, role or scope
switches, route map if the tier allows.

### Navigation and shell
Shell archetype, in-object navigation, lifecycle and publish states. Count the
shells; a product with three is telling you something.

### Key screens
A table: file name, then a caption naming THE DECISION the screen exists for.
The gate reads this table, so the heading must be exactly `### Key screens`.

### Concepts and vocabulary
Their nouns, verbs and status words. Controlled vocabularies in full. This is
the section that pays off months later.

### Interaction patterns
One entry per pattern, tagged steal / adapt / refuse, each with the why.

### Style system
Type, colour, radius, elevation, spacing, dark mode, token layer, contrast
failures. Every value labelled.

### AI tier
Where AI appears, its grammar, its voice, and whether it shows provenance.

## Generation N-1 …  (older, shorter, kept as history)

## Method and limits
Tier, dates, what was NOT seen, and every claim you could not verify. If a
previous pass was wrong, say so here as well as in Transfers.
```

**Generations are chronological across every product the company ships.** A
two-sided company will interleave them, and that is fine; say so in the
evidence line. Newest first in the file.

## `pulse.md`: the business lens

```markdown
## YYYY-MM-DD · <window> · N sources swept

**Headline:** only if something reframes the product lens. Otherwise skip it.

**Company**   founding, founders, headcount, funding, HQ; each with a source
**Shipped**   dated, newest first, each with a URL. A generation-sized change
              sets refresh_due and says so on the line.
**Said**      what they claim now, quoted short and attributed
**News**      funding, hires, partners, named customers, pricing changes
**Heard**     reviews and community, quoted with links, ratings and counts
**Hiring**    open roles read as roadmap: engineering means building, sales
              means selling, nothing means neither
**Pricing**   now, and the trajectory from archive snapshots
**Nothing at** every source that returned nothing, WITH the query used
**Watch next** what a future pulse should check first
```

**"Nothing at" is not filler.** A competitor with no trade press, no Hacker News
and no conference presence is telling you what kind of company it is. A sweep
that hides what it did not find cannot produce that result. Distinguish *empty*
from *blocked*: a 403 proves nothing, and must be labelled as blocked.

Entries append oldest-first in the file so the newest is at the bottom and the
history reads as a log. The page renders them newest-first.


## Conventions that keep dossiers machine-readable

Nothing here is enforced, but a later page builder, the `landscape` skill and
a human skimming twenty dossiers all rely on it:

- **`### Key screens` is an exact heading**, and its table's first column is a
  file name. That table is the single source of captions.
- Transfer bullets open with `**Steal.**`, `**Adapt.**`, `**Refuse.**` or
  `**No counterpart.**`, so they can be counted across subjects.
- `pulse.md` entries each start with `## <date> · <window> · N sources swept`.
  **Anything before the first dated heading is the file's intro, not an entry.**
