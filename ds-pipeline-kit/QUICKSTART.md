# QUICKSTART

Ten minutes to a working Level 1. Full detail — and the levels that actually enforce something —
in [INSTALL.md](INSTALL.md). Read [README.md](README.md) first if you have not chosen a level.

---

## Before you start: does your repository fit?

The kit is not stack-agnostic, and finding that out on the third stage is expensive. Check these
five:

| Needs | Why |
|---|---|
| A component library in its own repository or package | The gates classify a diff into "spec" and "component source". A repository where components live next to an application will classify most pull requests as neither. |
| One directory holding component source | `paths.components_ui` — the classifier reads it to decide what a pull request contains. |
| A place for decision documents | `paths.specs`. A directory is enough; it does not have to exist yet. |
| A token build that emits CSS custom properties | Not strictly required for Level 1, but `token-guardian` and the governance rules have nothing to check without one. |
| An agent harness that reads plugin skills | Level 1 *is* skills. Without a harness you have a set of markdown documents — still useful, but read by people rather than run. |

Missing the last one only? Install anyway and read the skills as process documentation.

---

## 1. Unpack it and check it

The kit arrives as a **folder**, not as a repository you clone. Unpack it, then from inside it:

```bash
chmod +x verify.sh tools/*.sh plugin/hooks/*.sh repo-enforcement/scripts/*.sh
bash verify.sh
```

The `chmod` matters on Windows, where a ZIP archive drops it: the guard is started by its path,
so without the bit it never runs and nothing says so. `verify.sh` should end with
`ALL CHECKS PASSED`.

## 2. Install the plugin

```bash
claude plugin marketplace add /full/path/to/ds-pipeline-kit
claude plugin install ds-component-pipeline@ds-pipeline-kit
claude plugin details ds-component-pipeline     # expect 10 skills, 1 agent, 1 hook
```

The marketplace source is the path to the folder — the folder is itself a marketplace root. The
short `owner/repo` form only works for a kit published as its own repository.

## 3. Bind it to your repository

```bash
cp ds-kit.config.yml <your-repo>/ds-kit.config.yml
```

Then edit it. **This is the whole configuration surface** — if you find a project-specific value
anywhere else in the kit, that is a bug in the kit.

The four keys that matter most, and what breaks when they are wrong:

| Key | Wrong value produces |
|---|---|
| `agents.implementer` / `agents.gate` | An agent that resolves by name and **cannot run a stage**, if it lacks the `Skill` tool. The run stops mid-delegation, not at configuration time. See below. |
| `paths.components_ui` | The guard and the gates classify nothing. Everything passes, and you believe the process is running. |
| `paths.specs` | The document check looks for specs where there are none, and every implementation pull request fails. |
| `main_branch` | The base-branch check reads the wrong branch. |
| `status_checks.*` | A gate that appears in the checks UI and never blocks. The strings must match your CI job names **exactly**. |

**Nothing warns you when a path is wrong.** The skills simply describe paths that do not exist,
which reads exactly like a repository that has not been set up yet.

## 4. Prove it is bound

The cheapest check, and the one that catches a wrong `paths.components_ui`:

```bash
cd <your-repo> && git checkout -b spec/probe
printf '%s' '{"tool_name":"Write","tool_input":{"file_path":"src/components/ui/probe.tsx"}}' \
  | /full/path/to/ds-pipeline-kit/plugin/hooks/ds-pipeline-guard.sh ; echo "exit=$?"
```

`exit=2` means the guard resolved your paths and blocked component source on a spec branch.
`exit=0` means it did not — fix the config before going further, or every later check measures
nothing.

That proved the script. It does not prove anything is *calling* it, and the two look identical
from outside. Still on `spec/probe`, ask your agent to create `src/components/ui/probe.tsx` with
any content. It should be refused before the file appears. If the file is created, the guard is
correct and nothing is running it — the boundary is not there.

---

### The two agents you must supply

The kit ships the orchestrator and no specialists — your harness has its own, and the
roles differ per project. Two requirements on whichever you name:

| | Tools it needs |
|---|---|
| `implementer` | `Skill`, Read, Glob, Grep, Write, Edit, Bash |
| `gate` | `Skill`, Read, Glob, Grep, Bash — and **no** Write, **no** Edit |

**`Skill` is the one that gets forgotten**, and it fails in the least helpful way: the
agent exists, resolves by name, and cannot run a single stage, because every stage is
a skill invocation. Nothing catches it at configuration time — the orchestrator
delegates and the run stops mid-stage. This happened on the first real run of the kit.

The gate's *missing* write access is deliberate. A gate that can fix what it finds
stops being a gate: the finding disappears into a patch, the record of what was wrong
goes with it, and the author never learns the class of mistake. An instruction not to
fix things is a preference; an absent tool is a guarantee.

---

## 5. Your first component

```
/ds-pipeline-orchestrator   (or invoke the skills in order)
```

The order, and what each stage owes you:

| # | Stage | Produces |
|---|---|---|
| 0 | `component-requirements-builder` | Numbered, observable requirements + a feasibility audit against your repository |
| 1 | `ds-context` | What the repository actually contains |
| 2 | `ds-governance` | The rules that apply |
| 3 | `token-guardian` | Existing violations, so the spec is not written against a fiction |
| 4 | `component-spec-writer` | The spec. Stops at `freeze_candidate` — never `frozen` |
| 4.5 | (no skill) | A throwaway visual draft **the owner looks at** |
| — | **PR-1** | Spec + draft, nothing else. **A human merges it.** |
| 5 | `component-implementation` | Source + tests |
| 6 | `storybook-stories-generator` | Stories |
| 7 | `a11y-interaction-review` | The accessibility audit |
| 8 | `production-quality-gate` | PASS/FAIL — **in a different session than stage 5** |
| — | **PR-2** | Implementation. A human merges it. |

## Three things people get wrong in the first week

**Writing `lifecycle: frozen` into a spec.** It is not an authored value. A spec is frozen by
being *merged*; the field only ever records what its author believed. Measured in the source
system: of 29 specs, 11 had no lifecycle field and shipped anyway, 16 said `frozen` because
someone typed it, one still said `draft` after its own PR-1 had merged.

**Running the quality gate in the session that wrote the code.** The gate re-reads the spec and
the source with no memory of the intent behind them. In the same session it inherits the author's
reading of both, and the thing it exists to catch is exactly a mismatch between them.

**Skipping the visual draft because "it is obvious what it looks like".** In the source system,
12 spec revisions landed against 10 initial specs, four of them because the owner saw the
component for the first time after it was built. Those decisions cannot be made from prose.

## When the guard blocks you and you think it is wrong

It probably is not, but it fails open by design and it is not the real gate — CI is. Two common
cases:

- **"same session already wrote the spec"** — correct. Start a new session for the
  implementation. A subagent does not help; the session is the boundary.
- **You are on a `spec/` branch doing unrelated work** — switch to a branch whose name does not
  claim to be a spec branch.

---

## Where to go next

| You want | Read |
|---|---|
| The write-time guard, and what it does *not* catch | [docs/level-2.md](docs/level-2.md) |
| Gates that block a merge for everyone | [docs/level-3.md](docs/level-3.md) |
| Why each rule exists, with the numbers | [examples/reference/measurements.md](examples/reference/measurements.md) |
| To check the kit before relying on it | `./verify.sh` |
