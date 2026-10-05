# Bake-off: building and judging blind

For comparisons where you can run each option on the same job: two prompts,
two agent setups, two libraries on one screen, a human PR against agent
variants. Distilled from a real agent bake-off (7 tickets, 5 arms, a blind
judge) and the N-of-1 pre-registration that preceded it.

## The brief

- **Written from neither side.** A task drawn from one option's world measures
  how well the other reproduces it. The first instinct in the source study was
  to port screens designed on the author's own system; it would have flattered
  that system whichever was better. Pick a job neither side has already done.
- **Names no solution:** no component, no value, no library, no file. User
  story, numbered requirements, deliverable states, how it will be viewed.
- **Carries no provenance comment** that tells a builder whose brief it is.

## The builders

- **Same model, same turn ceiling, same tools** for every arm. Record them.
- **Scrub asymmetric context.** If one arm's tree contains the brief, the
  rubric or the ground truth (a `research/` folder, a previous run), remove it
  before that builder starts. Each arm keeps its own real precedent; that is
  symmetric in kind.
- **Builders are not told a comparison is running**, that another arm exists,
  or that anything will be scored.
- **Use a clean profile.** A personal `CLAUDE.md` in the user profile is mixed
  into every arm and into the judge. Set `CLAUDE_CONFIG_DIR` to a profile
  without one.
- **Start every arm from the same commit**, with no network access to where
  the answer lives (the merged PR, the other arm).

## Scoring

1. **Mechanical first.** Write the scoring scripts **before** the builds land,
   so the judgement is in the script, not in the reading. Control-test each
   script on a known-good and a known-bad input.
2. **Each arm judged by its own rules.** Their linter on their output, ours on
   ours. Never one side's ruleset on the other.
3. **Hidden tests** where a reference exists: the reference's tests run against
   every arm, unseen by the builders.
4. **Blind judge for the rest.** A fresh context that built nothing:
   - each arm's change under a shuffled label (A, B, C…); **the label map is
     written outside the judge's reach**;
   - the judge reads unchanged code only at the base commit, never a working
     tree, never git log;
   - read-only: it modifies and runs nothing.
5. **Where the judge's opinion decides a place, check it another way**: a
   browser probe, a deliberately broken build, the reference's tests. A judge
   is an instrument too, and gets the same control test.

## Judge prompt (adapt the context line)

```
You are a senior reviewer. {N} engineers each implemented the same task
independently. Judge them blind.

Inputs: {one patch or file tree per label}
Base code: read only via `git show {BASE}:<path>`. Do not read any working
tree, do not use git log. Read-only: modify and run nothing.

1. Every numbered requirement per implementation: met / partly / not met, with
   file:line evidence. Met means the code does it and a test or the code itself
   clearly proves it.
2. Consistency with surrounding code: where an implementation hand-rolls what
   the touched files or their imports already do, cite both sides.
3. Test quality: would the tests fail if the feature were wrong? Name tests
   that assert implementation details instead of outcomes.
4. Defects per implementation, and the single biggest one of each. Scope creep
   counts only if it harms.
5. Rank all labels, best first, and say which you would merge with the fewest
   changes.

Write the full verdict to {OUT}/verdict.md, then answer with the ranking, one
line per label (requirements met, biggest defect) and the merge pick.
```

## Reading the result

- Report **cost and wall time per arm** next to quality. The bake-off's
  headline was not quality; it was the same quality at a third of the cost.
- **Small N is a hint.** State the chance-alone probability of the observed
  win count (binomial, p=0.5). 5 of 7 is 23%.
- Include a **control item** chosen by a rule before anything was read, that
  no arm was tuned on. It is the only one that tells you about generalisation.
