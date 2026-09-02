# Level 1 — The process

**Install cost:** one command. **Permissions needed:** none. **Configuration needed:** none to
start; one file to bind it to your paths.

---

## What Level 1 enforces

**Nothing.**

The process is described but nothing enforces it — the agent follows it for as long as it
follows it. There is no hook, no CI job, no branch rule. An agent can write a spec and its
implementation in the same breath, open one pull request containing both, and no part of Level 1
will object.

That sentence is the most important one on this page. Everything below describes what Level 1
*gives* you, and it is genuinely useful — but if you install only this and then tell your team
"the pipeline is in place", you have told them something untrue.

## What Level 1 gives you

| | |
|---|---|
| Nine skills | The decomposed expertise: what a requirements brief must contain, what a spec must decide, what a story set must cover, what an accessibility pass must check, what a quality gate must aggregate. |
| One orchestrator | Sequences the stages and stops at the human checkpoint. It has no `Write` or `Edit` tool, so it cannot itself collapse two stages into one session. |
| One process rule | The PR boundaries, the checkpoint, the review-round budget, the blocker definition. |
| Templates | Spec, requirements brief, retrofit addendum, pull-request bodies. |

The value is that **the decisions are already made and written down**. Which accessibility
questions belong in the spec rather than surfacing after implementation. Why the quality gate
must run in a different session from the one that wrote the code. Why a contrast finding is
measured against already-shipped components rather than in a vacuum. Why a reviewer's fourth
round of wording preferences becomes a follow-up issue rather than an in-PR fix.

Those are expensive to derive and cheap to copy. That is what Level 1 is.

## The one weakness worth naming

A skill is invoked **by the model, when it judges the description relevant**. That is
probabilistic. The rule ships as a skill so that Level 1 can install in one command — but the
plugin format has no `rules/` directory, and a rule with directory triggers is strictly stronger:
the harness injects it whenever a matching path is touched, whether or not the model thought to
ask.

If your harness supports directory-triggered rules, spend the extra thirty seconds:

```bash
./tools/make-rule.sh
cp build/ds-component-pipeline.rule.md <your-repo>/.claude/rules/ds-component-pipeline.md
```

It is generated from the same source as the skill, so the two cannot drift.

**Know what it costs before you copy it.** The generated file is the full rule — roughly 16,000
tokens — and a file in `.claude/rules/` is loaded into **every** session. The same material as a
skill costs about 120 tokens standing, and the rest only when it runs. Copy the rule when you
have seen the skill fail to fire on work it should have covered; not by default.

## Install

The kit is distributed as a folder. Unpack it, then install the plugin from the path to that
folder — it is itself a marketplace root:

```bash
claude plugin marketplace add /full/path/to/ds-pipeline-kit
claude plugin install ds-component-pipeline@ds-pipeline-kit
```

Then copy `ds-kit.config.yml` to your repository root and edit it. Until you do, the skills use
the documented defaults (`src/components/`, `docs/component-specs/`, `main`), which may or may
not be your layout.

## Verify it installed

```bash
claude plugin details ds-component-pipeline
```

Expect **ten skills, one agent, one hook** — nine stages plus the process rule, which ships as a
skill of its own. In Claude Code the hook is registered by this same install, so Level 2 arrives
with Level 1; in a harness that does not read plugin hooks it stays inert until you register it
by hand — see [Level 2](level-2.md).

## When Level 1 is the right stopping point

- You are evaluating the process before committing to it.
- Your team is small enough that convention holds without machinery.
- You do not control CI on the target repository.
- You are running a workshop and want participants to read the process, not administer it.

## When it is not

The moment someone says "we agreed on this process" and someone else's pull request quietly
ignores it. That is not a discipline problem to be solved with a reminder — it is the signal to
install [Level 2](level-2.md), and then [Level 3](level-3.md).
