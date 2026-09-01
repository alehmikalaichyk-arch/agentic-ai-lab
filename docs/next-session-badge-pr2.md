# Next session: take Badge through PR-2

The repository has a merged spec for `Badge` and no implementation. That is not an
oversight — the write-time guard refused to let one session write both, which is the
PR-1 / PR-2 boundary working. This is the session that builds it, and it doubles as
the first real run of the pipeline's agents.

Paste the prompt below into a fresh session opened in a clone of
`https://github.com/alehmikalaichyk-arch/agentic-ai-lab`.

---

## The prompt

```
Repository: https://github.com/alehmikalaichyk-arch/agentic-ai-lab

Context you need, and should verify rather than trust:

- docs/component-specs/badge.md is merged on main. A spec is frozen BY BEING MERGED —
  the file still reads `lifecycle: freeze_candidate` and that is correct. Do not
  "fix" it to frozen.
- There is no implementation. src/components/ui/ is empty and src/index.ts exports
  nothing. This is deliberate.
- The pipeline is deployed in .claude/: 10 skills, 5 agents, a PreToolUse guard.

TASK: take Badge through PR-2 — implementation, tests, stories, accessibility pass,
and the quality gate — following the pipeline rather than working around it.

STEP 0 — prove the pipeline actually loaded before relying on it.
Run the checks in docs/verify-pipeline-loaded.md. If the verdict is anything other
than LOADED, STOP and report which part is missing. Do not proceed by reading the
skill files manually and pretending they loaded: the point of this session is
whether the pipeline works, and a workaround answers a different question.

STEP 1 — set up.
  npm install && npm run build:tokens
  git checkout -b feature/badge-implementation
generated/ is gitignored, so every check silently reads an empty directory without
that build.

STEP 2 — run the stages, delegating each to the agent the config names.
Read ds-kit.config.yml: agents.implementer runs stages #1-#7, agents.gate runs #8.
Use them via the Agent tool — do not run the stages yourself in this session.

  #1 ds-context        #2 ds-governance     #3 token-guardian (pre-scan)
  #5 component-implementation      #6 storybook-stories-generator
  #7 a11y-interaction-review

Stage #4 is already done and merged; do not re-open the spec.

STEP 3 — the gate, in a SEPARATE agent invocation.
Delegate production-quality-gate to agents.gate as a fresh Agent() call, not as a
continuation of the implementing work. In the implementer's context it inherits the
implementer's reading of the spec, and a spec-versus-code mismatch — the thing it
exists to catch — then reads as agreement. Report its verdict verbatim.

STEP 4 — open the PR. A human merges it; you do not.

CONSTRAINTS, and each one is a real boundary rather than a style note:

- Build what the spec says, not what seems better. Where you disagree with the spec,
  say so in the PR body as a follow-up — do not implement your preference. The spec
  was merged by a human; that is what makes it the contract.
- The spec's §6.1 rule is load-bearing: spread `...props` FIRST, own attributes
  after. A spread placed last lets a caller overwrite data-slot.
- Do not narrow the rest type to enforce inertness. §6.2 says why: it would advertise
  as a guarantee something a ref and a listener walk straight past.
- Every design value comes from a semantic token. Primitives have no Tailwind
  utility by construction — if you want one, you are reaching past the semantic layer.
- AC5 says an empty or whitespace-only label renders NOTHING, not an empty pill.
- AC8 claims every variant clears 4.5:1. Verify by measuring the built tokens, not by
  trusting the table.

EVIDENCE I want in the final report:

  - the verdict from step 0, with the quotes it produced
  - which agent ran which stage
  - each check as command -> actual output. Never `npm test | tail`: that returns
    tail's exit code, which is 0 almost always. Redirect, echo $?, then read.
  - the gate's verdict, unedited, including a FAIL
  - the PR URL

If the guard blocks a write, do not work around it with a shell heredoc. Report what
it said — that is a finding about the session, not an obstacle to route around.
```

---

## What a good outcome looks like

The component exists, the gate says PASS with evidence, and the PR is open and
unmerged. Roughly 8 acceptance criteria in the spec, so expect a test file that
addresses each by name.

## What is worth noticing regardless of outcome

**If step 0 fails**, that is the more valuable result — it means a clone does not get
a working pipeline, and everything downstream was theatre. Fix that before anything
else.

**If the gate says FAIL**, that is the pipeline working. A first implementation that
passes a real gate on the first attempt is more often a weak gate than strong code.

**If the agent implements something the spec does not describe** — an `onClick`, a
hover state, a size the spec does not list — that is the failure mode the whole
PR-1 / PR-2 split exists to prevent, and it is worth recording rather than quietly
correcting.
