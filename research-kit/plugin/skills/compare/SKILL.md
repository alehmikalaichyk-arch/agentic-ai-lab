---
name: compare
description: "Compare two or more options (libraries, vendors, architectures, designs, approaches, prompts, competing implementations of one task) and produce a recommendation that survives a hostile reader. Criteria and predictions are frozen before any evidence is gathered; every row must be measurable on every side; losses are published next to wins. Use when someone asks \"compare X and Y\", \"X vs Y\", \"which should we pick\", \"evaluate the options\", \"is ours actually better\", \"trade-off analysis\", \"bake-off\", \"benchmark these approaches\", or wants a decision between alternatives. Load it before answering even when you are only asked how you would decide: criteria and predictions must be frozen before evidence, and answering from this description alone skips that."
---

# Compare

A comparison whose conclusion was not chosen before the evidence. Built from
three working artefacts of one product team: a competitive-scoreboard
"constitution", an N-of-1 pre-registration, and the blind-judge harness of an
agent bake-off.

## Why this exists

Comparisons go wrong in a small number of ways, and every one of them flatters
whoever ran it:

- the criteria are picked after the evidence, so they fit the favourite;
- a row is one only one side can score on ("story count", "has feature X as we
  define it"), so it is won by definition;
- the instrument (a grep, a script, a judge) is broken and nobody fed it a
  known positive;
- the task is drawn from one side's world, so it measures how well the other
  side reproduces it;
- the author scores their own option;
- the losing rows quietly disappear.

A wins-only table reads as marketing. The LOSE rows are what make it credible.

## Pick the depth first

| Depth | When | Evidence |
|---|---|---|
| **desk** | Choosing between external things you will not build twice: libraries, vendors, services, standards | Docs, source, changelogs, issue trackers, benchmarks others ran, pricing, a small probe each |
| **probe** | A desk comparison with one or two claims cheap enough to check yourself | Desk, plus a scripted check per contested row |
| **bake-off** | Competing ways to do one job you can actually run: prompts, agent setups, two implementations, two design systems on one screen | N independent builds from one neutral brief, mechanical scoring, a blind judge |

Say which depth you chose and why. Default to the cheapest that can change the
decision; escalate a single row, not the whole study.

## Steps

**1. Write the question as a decision.** "Which X do we adopt for Y, given Z"
— who decides, by when, and what changes depending on the answer. If nothing
would change, stop and say so.

**2. Freeze the registration before gathering evidence.** Write sections 1–4 of
`doc-template.md`: options (with pinned versions/revisions/dates), criteria,
how each is measured, and **predictions**, including the ones that favour the
side you do not expect to pick. Commit or save it. Nothing in those sections is
revised after the first piece of evidence is read; a criterion you discover
later gets a new row ID and is marked *post-hoc*.

Criteria rules (the constitution):
1. **A row exists only if every option can be measured on it.** No vanity
   metrics won by definition. Where one option publishes no vocabulary for a
   family, that cell is `n/a`, never 0 and never 100%.
2. **Never blend families.** Colour adoption and spacing adoption are two rows,
   not one average. Cost and quality are two rows.
3. **Pin what you measured.** Version, commit, date, plan tier. A re-measure is
   a new dated capture, not a silent overwrite.
4. **Rows the user cares about but you cannot measure fairly** (taste, "feels
   better") are cut and listed as cut, with the reason. Do not smuggle them back
   in as tie-breakers.

**3. Control-test every instrument before trusting it.** Feed each check a
known
positive and watch it fire; feed it a known negative and watch it stay quiet.
A grep that returns nothing on a binary file, a scanner that reads its own
prose, a judge that scores an empty run 1.0: each of these has produced a
confident wrong answer. Record the control next to the row.

**4. Gather evidence, labelled.** Every value carries one of **measured** (you
ran it), **sampled** (read off an artefact: a screenshot, a log), **asserted**
(their claim, quoted, with URL and date), **eyeballed** (your reading). A desk
comparison is mostly *asserted*; say so in the TL;DR rather than letting it
read as *measured*. Every source that returned nothing is listed with the
query; a 403 is *blocked*, not *empty*.

For parallel sweeps, dispatch one subagent per option with the identical brief
and the frozen criteria, so no option gets a deeper read than another.

**5. Bake-off only: build blind.** Read `blind-judge.md`. The short version:
one neutral brief written from neither side; strip from each builder anything
the other builder does not get; builders do not know a comparison is running;
scoring is mechanical where possible and judged blind, under shuffled labels,
by a context that built nothing, where not.

**6. Score each row.** Status vocabulary, nothing else:

| Status | Means |
|---|---|
| `WIN` / `LOSE` | Measured on every side, the margin is outside the noise you can state |
| `CONTESTED` | Measured, but the margin is inside the noise, or two instruments disagree |
| `DISCLOSED` | Published, deliberately not scored (registered in advance as favouring neither) |
| `UNMEASURED` | Registered, not captured; say what it would cost to capture |

WIN/LOSE are relative to the option the doc is written about; for an N-way
comparison, rank per row instead.

State the noise. With small N, say what chance alone gives: 5 wins of 7 on a
coin flip happens 23% of the time, so it is a hint, not a result.

**7. Check the predictions.** Which held, which broke. A broken prediction is
the most informative line in the document; put it in the TL;DR if it changes
the recommendation.

**8. Recommend, and say what would flip it.** One option, the rows it rests on,
the rows it loses, and the cheapest measurement that would change your mind.
If the honest answer is "no measurable difference", that is the headline and it
outranks every row: pick on cost of ownership and say so.

## Hard rules

- **No self-scoring.** Whoever built or championed an option does not score it.
  In a session that is you: delegate the judgement to a fresh-context subagent
  that gets the evidence, not your conclusion.
- **Losing rows stay in the same table**, with their re-measure history.
- **An option's own rules judge its own output.** Never score option B by
  option A's linter.
- **No predictions, no comparison.** If step 2 was skipped, label the document
  *exploratory* in its title and do not recommend from it.
- **Threats you did not remove are written down** (N=1, the author wrote the
  brief, a side moved after the pin). Bounded, not hidden.

## Output

One document from `doc-template.md`, in the research root (`research/`,
`docs/research/`, or what the host repo's `CLAUDE.md` names), named
`YYYY-MM-DD-compare-<slug>.md`. TL;DR first. No em dashes, no exclamation
marks, never a claim without its source or its measurement.

## Done check

- [ ] registration (options + pins, criteria, measures, predictions) dated before any evidence
- [ ] every row measurable on every option; `n/a` used where a family does not exist; no blended rows
- [ ] every instrument control-tested both ways, control recorded
- [ ] every value labelled measured / sampled / asserted / eyeballed, sources with URL and date
- [ ] LOSE and CONTESTED rows present in the same table as WIN rows
- [ ] scoring done by a context that did not build or champion any option
- [ ] predictions checked, broken ones called out
- [ ] recommendation names what would flip it; threats not removed are listed
