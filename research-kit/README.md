# research-kit

Three research skills, packaged the way `ds-pipeline-kit/` is: a portable plugin here,
and a live copy under `.claude/skills/` so they work in this repository on clone.

| Skill | What it does |
|---|---|
| `teardown` | A living dossier on one competitor or reference product. Business lens first (what they shipped, said, charge, hire for), then the product lens (screens, IA, vocabulary). `pulse` appends the delta since last time; `refresh` starts a new product generation. It accumulates instead of restarting. |
| `compare` | A comparison between options — libraries, vendors, approaches, implementations — whose conclusion was not chosen before the evidence. Criteria and predictions are frozen first, every row must be measurable on every side, and losses are published next to wins. Three depths: desk, probe, bake-off. |
| `landscape` | The cross-competitor view: category map, strategy canvas scored 0–10, ERRC grid, and a SWOT per player — built on `teardown` dossiers, never on unsourced impressions. |

They trigger from their descriptions; nobody has to name them.

## Two ways they load, and why the names differ

| Where | How | Names |
|---|---|---|
| **This repository** | Nothing to do. `.claude/skills/` holds a copy. | `teardown`, `compare`, `landscape` |
| **Any other repository** | `claude --plugin-dir <path-to>/research-kit/plugin` for one session, or install it (below). | `research:teardown`, `research:compare`, `research:landscape` |

Install for every repository on a machine:

```bash
claude plugin marketplace add <path-to>/research-kit
claude plugin install research@research-kit
```

**The copy is checked.** `tools/check-claude-dir-in-sync.sh` fails CI if
`.claude/skills/<skill>` differs from `research-kit/plugin/skills/<skill>`. Edit the kit,
then re-copy:

```bash
cp -r research-kit/plugin/skills/. .claude/skills/
```

## Where the output goes

Each skill picks a research root in this order: whatever the host repository's
`CLAUDE.md` names, an existing `research/`, an existing `docs/research/`, otherwise it
creates `research/`. Here that resolves to **`docs/research/`**, which exists for exactly
that reason — see its README before committing anything written there.

## Checking that they fire

```bash
claude plugin validate research-kit/plugin

# One case, one arm — cheap
claude plugin eval research-kit/plugin --case compare-fires --ablation none

# Every case, with the plugin and without, with a delta report — this one costs money
claude plugin eval research-kit/plugin -j 3
```

Cases live in `plugin/evals/`: one per skill for triggering, one for `compare` when the
asker has already named a favourite, and a control (a haiku) where nothing should fire.
Run output lands in `plugin/evals/results/`, which is gitignored.

> **Run the two-arm eval from OUTSIDE this repository.** The "without the plugin" arm
> is supposed to have no research skills at all, and inside this repository it still has
> the live copies from `.claude/skills/`. The baseline would be contaminated and the
> delta would read as zero. A scratch directory with nothing in it is the honest place
> to measure from. This has not been measured here — it follows from how the two
> loading paths overlap, and it is the first thing to confirm on a real run.

### What a measurement before the move showed

Three runs per case, both arms, on the version these were adapted from:

| Case | With | Without | What the baseline does not do |
|---|---|---|---|
| compare-fires | 1.00 | 0.00 | the skill is not invoked |
| compare-registers-first | 1.00 | 0.50 | does not freeze criteria and predictions before searching |
| landscape-fires | 1.00 | 0.00 | produces neither a strategy canvas nor an ERRC grid |
| teardown-fires | 1.00 | 0.50 | no measured / sampled / eyeballed / asserted provenance marks |
| unrelated-request (control) | 1.00 | 1.00 | — no false triggers |

**Those numbers do not transfer automatically.** Since then every `description` was
wrapped in quotes — unquoted, each contained a `: ` and `claude plugin validate` rejected
all three skills — and two eval prompts were moved to a different market. Re-run before
quoting the table.

## What to watch on a real run

- **`teardown` on a real competitor:** does it run the business lens first, mark the
  provenance of each claim, and write "Nothing at <source>" rather than leave a gap.
- **`compare`:** does it freeze criteria before searching, and hand the scoring to a fresh
  subagent rather than grade its own work.
- **False triggers:** `compare` firing on every "X or Y?" inside code would be noise. The
  control case covers one unrelated prompt, not that one.
