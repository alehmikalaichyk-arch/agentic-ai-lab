---
name: component-implementation
description: >
  Build layer for the design system. Turns a frozen spec from
  component-spec-writer (#4) into conformant React + TypeScript component
  source, authors the component test file, and self-checks against
  token-guardian (#3) before handing off to production-quality-gate (#8).
  First write-enabled skill in the chain: write access is scoped to the
  component's own subtree plus a single barrel export line. Owns source
  code, tests, and spec-to-code translation; does not own the spec,
  the rules, Storybook stories, or the merge decision. Never invents a
  spec or a token — gaps are escalated with a structured payload. Hard
  preflight: a frozen spec (#4), the Rule Set (#2), and the Context
  Snapshot (#1) must exist in session.
tools: Read, Glob, Grep, Write, Edit
---

# component-implementation

The **build layer** of the design system. Where `component-spec-writer`
(#4) produces a frozen spec describing *what to build*, this skill writes the
React + TypeScript source that satisfies that spec, authors the component's
test file, then self-checks against `token-guardian` (#3) before handing off to
`production-quality-gate` (#8).

This is the first skill in the chain that **writes files**. Every skill before
it (#1 context, #2 governance, #3 guardian, #4 spec-writer) is read-only. That
shift defines most of this skill: scoped write paths, a bounded self-check gate,
and an explicit "never invent rules or specs" boundary.

The skill does not decide *what* a component should do (#4 owns the spec) or
*whether the rules are correct* (#2 owns the rules). It turns a frozen spec into
conformant code, proves conformance, and hands off.

**Invoked:**

- Automatically by the `/prototype` orchestration once a spec from #4 is frozen.
- Automatically by the `frontend-engineer` agent when a DS component is required by a feature.
- Manually: "implement the Select v3 spec", "build the Alert component from this spec".

---

## 1. Ownership model

```
component-spec-writer (#4)        →   owns the spec (what to build)
ds-governance (#2)          →   owns the rules
        ↓
component-implementation (#5)     →   owns the source code + tests
(this skill)                      →   owns spec-to-code translation
                                  →   owns self-check invocation
        ↓
token-guardian (#3)               →   detects token/code violations (called as self-check)
storybook-stories-generator (#6)  →   owns Storybook stories
production-quality-gate (#8)      →   blocks merge (build, lint, tests, final guardian run)
```

Implementation **owns**:

- **The component source** — the `.tsx` / `.ts` / `.css` files it writes.
- **The component test file** — `<Component>.test.tsx` (authorship; #8 only runs and gates it).
- **Spec-to-code translation** — choosing the React patterns that satisfy the spec.
- **Self-check invocation** — running #3 against its own output before delivery.
- **Conformance evidence** — files written, completeness summary, and a clean guardian run.

Implementation does **not** own:

- The spec. Gaps → stop and escalate to #4; never improvise.
- The rules or severities (#2 / #3).
- **Storybook stories** — authoring belongs to #6. Implementation does not create or touch `.stories.tsx`.
- The merge decision — #8 owns it; a clean self-check is necessary, not sufficient.
- Build/lint config and test *execution* — #8.

---

## 2. Preflight — hard gate

Before any code is written, confirm in session:

1. A **frozen** spec from `component-spec-writer` (#4) — where *frozen* means **present on `origin/main` in the DS repository**, which is what merging PR-1 achieves. **Fetch first**, then test it structurally:

   ```bash
   c=<component>                                     # lowercase slug, e.g. chip, page-shell
   case "$c" in (*[!a-z0-9-]*|'') echo "invalid component name: $c" >&2; exit 1 ;; esac

   git -C the DS package fetch --quiet origin main || stop   # hard setup failure
   git -C the DS package cat-file -e "origin/main:docs/component-specs/${c}.md"
   ```

   **A failed fetch is a stop, not a shrug.** Without `|| stop` the shell walks on to `cat-file`
   and to the exclusion below, and both then read whatever `origin/main` was *before* the failure
   — so a spec deprecated on real `main` since the last successful fetch passes the presence check
   **and** passes the exclusion. Network blip, expired credential, damaged object store: each
   silently downgrades the gate to whatever this checkout last happened to see. Same rule and same
   wording as `component-spec-writer` §7a.

   **Validate the slug, and quote the object name — they catch different things.** Measured:
   `foo bar` unquoted splits into two arguments and git reads a path nobody asked for; quoting
   fixes that and does nothing for `../../../etc/passwd`, which stays a single well-formed
   argument and resolves outside the spec directory. Only the `case` guard rejects it. The rule
   already fixes component paths as lowercase `docs/component-specs/<component>.md`, so the guard
   costs nothing legitimate.

   This is robustness against a malformed name, **not** a defence against a hostile one: whoever
   supplies the component name to the agent already supplies its instructions. Treat a name with
   a space or a `../` as the far likelier failure, and stop on it.

   The fetch is not optional. `origin/main` is a **local remote-tracking ref** — it moves only when
   you fetch. Skip it and the check reads whatever this checkout last saw, so a spec merged since
   then reads as missing and the preflight refuses work that is in fact unblocked. A spec that
   exists only on a branch is treated as missing.

   **One exclusion, and only one: refuse `deprecated` and `retired`.**

   ```bash
   git -C the DS package show "origin/main:docs/component-specs/${c}.md" \
     | grep -qE '^[[:space:]]*(\*\*Lifecycle\*\*|[Ll]ifecycle):[[:space:]]*["'"'"']?(deprecated|retired)([[:space:]"'"'"']|$)' \
     && stop
   ```

   **This pattern is canonical. `component-spec-writer` §7a carries it byte-identically**, and the
   matrix below is what both are verified against — extract both patterns and compare, then run
   the matrix. Two copies of a security-relevant pattern need one agreed expected set, or they
   drift silently.

   | input | expect | why |
   |---|---|---|
   | `lifecycle: deprecated` | match | lowercase YAML, the commonest form (10 specs) |
   | `  lifecycle: retired` | match | indented — inside the `spec_status` block (10 specs) |
   | `**Lifecycle**: deprecated` | match | bold-markdown header (6 specs) |
   | `Lifecycle: deprecated` | match | plain capital header — see the note below |
   | `lifecycle: "deprecated"` | match | quoted YAML scalar |
   | `lifecycle: 'retired'` | match | single-quoted |
   | `lifecycle: deprecated ` | match | trailing whitespace |
   | `lifecycle: frozen` | **no match** | active spec — must not be excluded |
   | `lifecycle: deprecatedX` | **no match** | not the value |
   | `- [ ] header carries \`Lifecycle: deprecated\`` | **no match** | prose, not a header — the anchor is what makes this safe |

   **On the plain-capital form.** It is covered as a precaution, not because anything uses it:
   **zero** of the 29 specs carry `Lifecycle:` as a header. Review (#134 r9) cited
   `textarea.md` as using it; it does not — its header is `**Lifecycle**:` plus an indented
   `lifecycle: draft` in `spec_status`, and its four `Lifecycle:` strings are prose inside
   backticks on lines beginning `- [ ]`, `|`, `` ` `` and `**Depends on**`, which no anchored
   pattern matches. Included anyway because the asymmetry favours it: over-matching refuses a
   valid spec loudly and is diagnosed in a minute, while under-matching builds against a
   superseded contract silently.

   **The optional quote is not decoration.** `lifecycle: "deprecated"` and `lifecycle: 'retired'`
   are ordinary YAML, and a pattern that jumps straight from the colon to `d`/`r` misses both —
   the spec then reads as active and the exclusion it was written for does nothing. No spec quotes
   the value today, but RA-M3 in `component-spec-writer` tells authors to quote YAML scalars, and
   `calendar.md`'s lifecycle is already prose-annotated free text — exactly the shape someone
   quotes next.

   **Every construct here is POSIX ERE, and that is deliberate** — this runs under whichever
   `grep` the agent has. That means `[[:space:]]` and not `\s`, and it means the trailing
   `([[:space:]"']|$)` and not `\b`: word-boundary `\b` is a GNU extension, absent from POSIX ERE,
   where it degrades to a literal `b` or an error — either way the exclusion silently passes
   everything. Both spellings behave identically on GNU grep and ugrep, which is exactly why the
   `\b` version survived a local check; portability bugs of this class are invisible on the
   machine that wrote them.

   **Read the `origin/main` blob, never the working tree.** The gate above already asks
   `origin/main` whether the spec exists; an exclusion that greps the local checkout answers a
   different question. A working tree can sit behind `main` for any number of reasons — an
   unfetched branch, a stale checkout — so a spec deprecated on `main` still reads as active
   locally, the grep passes, and the preflight authorises implementation against the superseded
   contract it was added to catch. Both halves of the gate must interrogate the same commit.

   Those two are authored *after* a spec is on `main` — they are decisions to stop building it.
   Presence alone cannot distinguish a superseded contract from an active one, so without this
   check a retired spec passes the gate. Today it excludes **zero** specs: none of the 29 carries
   either value. It exists for the first one that does.

   **Do not "fail closed" on an unrecognised value.** Proposed in review (#134 r6): treat any
   `lifecycle:` line that does not match the pattern as *potentially* deprecated. Measured — 18
   specs carry the field and **all 18** fail that pattern, because 16 say `frozen`, one `draft`,
   one free text. Failing closed therefore refuses every spec that has a lifecycle at all. It is
   the positive gate below, arrived at from the opposite direction.

   **This is a negative check, and that is what makes it correct** where the positive one is not.
   Round 1 of #134 proposed requiring `lifecycle: freeze_candidate` instead. Measured against
   all 29 specs, that refuses **28**: 16 say `frozen`, 11 have no field, `textarea.md` says
   `draft`. The lone survivor is `calendar.md`, and only under a prefix match — its value is the
   prose-annotated string `freeze_candidate (becomes `frozen` on GATE A2 approval)`, so under exact
   equality the check refuses all 29. Refusing two named end-states costs nothing and closes a real
   hole; *requiring* one blessed value resurrects the drifting gate this task removed. Do not
   collapse the two into "check the lifecycle field".

   The readiness gate a merged spec actually passed is `review-approved` plus a human merge —
   **presence on `main` is the record of that gate**, which is why it is the signal. A spec whose
   content is wrong is a spec-review failure; a self-declared field would not have caught it, because
   the field says only what its own author believed.

   **Otherwise do not read `lifecycle:`.** The field is not the freeze signal and never was — 11 of the 29 shipped specs carry no `lifecycle` field at all, and `require-document-on-base` reads file presence at the base SHA, not the field. Reading it produces false negatives on specs a human already approved and merged: `textarea.md` merged via PR-1 #124 still reads `draft`, and a field-reading preflight refuses it. See `component-spec-writer` §3.
2. The **Rule Set** from `ds-governance` (#2).
3. The **Context Snapshot** from `ds-context` (#1) — live paths, existing components, token inventory.

Any missing → **stop and report**. Do not guess paths, rules, or spec content.

---

## 3. Boundaries

**Does:**

- Reads the frozen spec (#4), the Rule Set (#2), and the Context Snapshot (#1).
- Writes component source under the scoped tree (§4).
- Implements props, variants, states, controlled/uncontrolled behavior, and ARIA exactly as the spec dictates.
- Wires all styling through semantic/component tokens only (never raw values).
- Authors the component **test file** covering the spec's API surface (§7).
- Runs `token-guardian` (#3) over the files it wrote, as a mandatory bounded self-check.
- Returns an **Implementation Report** (§6).

**Does not:**

- Invent or amend the spec. Gaps → escalate to #4.
- Invent, edit, or add a token. Needs → escalate to #2.
- Author Storybook stories (#6) or create a `.stories.tsx` file.
- Run the test suite, build, or lint (#8). It *authors* tests; it never *runs* them.
- Write outside the scoped tree (no app code, no token defs, no config, no `generated/**`).
- Assign or modify severity (#2 / #3).
- Make the merge decision (#8).
- Run a Figma sync or audit (#9 / #10), or judge UX selection (product layer).

---

## 4. Write scope

The **only** paths this skill may modify:

| Path | Allowed operation |
|---|---|
| `src/components/<Component>/**` | create / edit component source, styles, local `index.ts` |
| `src/components/<Component>/<Component>.test.tsx` | create / edit the component test file |
| `src/components/index.ts` (root barrel) | **append/update only** the single export line for `<Component>` |

Implementation never writes to `tokens/**`, `sd.config.mjs`, `components.json`,
`generated/**`, app code, `.stories.tsx`, or any path outside the scope above.
Barrel edits are limited to the single export line for the component being
built — no reordering, no unrelated exports.

### Read-only inputs

| Path / source | Role |
|---|---|
| #4 frozen spec | The single source of *what to build*. |
| #2 Rule Set | Rules and token architecture the code must satisfy. |
| #1 Context Snapshot | Live paths, existing components, token inventory. |
| `tokens/**/*.json` | Resolve which semantic/component tokens to reference. |
| `components.json` | shadcn alias paths for imports. |
| `src/components/ui/*.tsx` | Existing components — match controlled/uncontrolled and ref-forwarding precedent. |

---

## 5. Build rules

1. **Spec is law.** Implement exactly what the spec declares — props, variants,
   states, ARIA, controlled/uncontrolled contract. If the spec is silent or
   contradictory, **stop and escalate to #4** (§8). Never fill a gap with an
   improvised decision.

2. **Token discipline.** Every design value flows through a semantic or
   component token. No raw hex, no arbitrary Tailwind design values, no
   inline-style design values, no `cn()` bypass. If a needed token does not
   exist, **stop and escalate to #2** — never create the token here.

3. **Pattern conformance.** Match existing component precedent for
   controlled/uncontrolled state and composition (read from #1's sampled
   components). Use Radix primitives where the spec specifies them.

4. **Ref forwarding — spec-driven.** Apply `forwardRef` only when the spec calls
   for it (typically interactive components that need an imperative handle or
   composition target). Not every component needs ref forwarding; do not apply
   it by default.

5. **Imports.** Use shadcn path **aliases** (from `components.json`, e.g. `@/…`)
   for cross-package and shared-layer references (tokens, shared utilities,
   other DS components). Use **relative** imports for files within the
   component's own subtree. This matches the repo's shadcn precedent.

6. **Write only within scope.** Touch only the component subtree and the single
   barrel export line (§4). Never author stories.

---

## 6. Implementation Report

Returned in-session (no report file written):

```yaml
report:
  schema_version: 1
  generated_at: <ISO 8601>
  generator: component-implementation
  component: <Component name>
  spec_reference:
    generator: component-spec-writer
    spec_version: <frozen spec version this build satisfies>

files_written:
  - path: <path>
    action: <created | edited>

implementation_summary:
  props_implemented: <int>
  props_in_spec: <int>
  variants_implemented: <int>
  variants_in_spec: <int>
  states_implemented: <int>          # hover/focus/disabled/loading/error/etc.
  states_in_spec: <int>
  accessibility_contract_present: <bool>   # ARIA roles/labels/keyboard per spec
  test_file_present: <bool>

spec_coverage:
  - requirement: <spec item>
    status: <implemented | not-applicable | deferred>
    note: <optional — only for deferred, with reason and escalation target>

self_check:
  generator: token-guardian
  detection_registry_version: <copied from the guardian run>
  remediation_attempts: <int>        # 0..3
  blocker_count: <int>
  requires_review_count: <int>
  warning_count: <int>
  passed: <bool>                     # true only when blocker_count == 0

handoff:
  ready_for_quality_gate: <bool>     # true only when self_check.passed AND full spec coverage AND no blocking escalation
  escalations:
    - target: <component-spec-writer | ds-governance>
      reason: <enumerated; see §8>
      blocking: <bool>
      detail: <one-line context>
      ref: <spec requirement id | token/rule id>
```

`ready_for_quality_gate: true` is a precondition for #8, never a substitute for
it. #8 still runs build, lint, tests, and a final guardian pass.

---

## 7. Test contract

Implementation authors `<Component>.test.tsx`. Minimum acceptable coverage:

- **render** — component mounts with required props.
- **variants** — one assertion per spec-declared variant.
- **states** — each spec-declared state (disabled, loading, error, etc.).
- **controlled / uncontrolled** — both modes where the spec declares them.
- **keyboard interactions** — each keyboard behavior the spec specifies.
- **ARIA assertions** — roles, labels, and relationships from the spec's accessibility contract.

A spec facet that cannot be tested is marked `deferred` in `spec_coverage` with
a reason — never silently skipped. `test_file_present` in the report reflects
authorship, not adequacy; adequacy is the coverage list above.

---

## 8. Escalation contract

Every escalation carries a fixed shape so the orchestrator routes it
deterministically:

```yaml
escalation:
  target: <component-spec-writer | ds-governance>
  reason: <enumerated below>
  blocking: <bool>       # true = build cannot complete until resolved
  detail: <one-line context>
  ref: <spec requirement id, or token/rule id>
```

**Reason taxonomy:**

| target | reason | blocking |
|---|---|---|
| `component-spec-writer` | `missing-state-definition` | true |
| `component-spec-writer` | `contradictory-spec` | true |
| `component-spec-writer` | `ambiguous-api-contract` | true |
| `component-spec-writer` | `underspecified-accessibility` | true |
| `ds-governance` | `missing-semantic-token` | true |
| `ds-governance` | `missing-component-token` | true |
| `ds-governance` | `rule-conflict` | true |

Any `blocking: true` escalation forces `ready_for_quality_gate: false`.

---

## 9. Self-check — mandatory and bounded

After writing, invoke `token-guardian` (#3) with `scope: path` over the files
just written. Parse the Violation Report.

- `blocker_count > 0` → fix and re-run.
- **Maximum 3 remediation attempts.** If blockers remain after the third run,
  **stop and escalate** (`ds-governance` if the blocker is a rule/token
  gap, otherwise surface to the orchestrator). Never loop indefinitely.
- `requires_review` / `warning` → record in the report; never silently ignore.

Record `remediation_attempts` in the report.

---

## 10. Handoff

Set `ready_for_quality_gate: true` only when **all** of:

- `self_check.passed` (zero blockers), and
- every spec requirement is `implemented` or explicitly `not-applicable`, and
- no `blocking: true` escalation is open.

Anything `deferred` or any blocking escalation forces `false`.

---

## 11. Never

- Never build without a frozen spec from #4.
- Never amend, reinterpret, or improvise the spec — escalate gaps to #4.
- Never define, edit, or add a token — escalate needs to #2.
- Never write a raw design value (hex, arbitrary Tailwind, inline style) into source.
- Never write outside the component subtree and the single barrel export line.
- Never author Storybook stories or create a `.stories.tsx` file — #6 owns them.
- Never assign or second-guess severity — read from guardian / Rule Set.
- Never re-run guardian more than 3 times — escalate instead of looping.
- Never hand off with `blocker_count > 0`.
- Never treat a clean self-check as a merge approval — #8 owns the merge.
- Never run a build, lint, or test suite (#8 owns execution).
- Never edit `generated/**`, tokens, or config.

---

## 12. Dependencies

- **Upstream (hard):** `ds-context` (#1), `ds-governance` (#2), `component-spec-writer` (#4).
- **Self-check (hard):** `token-guardian` (#3).
- **Downstream:** `storybook-stories-generator` (#6) consumes the built component; `production-quality-gate` (#8) gates merge.
- **Required MCP:** `filesystem` (write access scoped to the component subtree).
- **Tools:** `Read`, `Glob`, `Grep`, `Write`, `Edit`. First write-enabled skill in the chain.
