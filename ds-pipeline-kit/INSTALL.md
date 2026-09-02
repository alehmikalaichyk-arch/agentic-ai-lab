# INSTALL

Three levels. Install the one you need; each works without the ones above it.
Read [README.md](README.md) first if you have not chosen a level.

---

## Before any level — unpack the kit and check it

The kit is distributed as a **folder**, not as a repository you clone. Everything below assumes
you have unpacked it somewhere and know the full path to it: the directory that contains
`plugin/`, `docs/` and `verify.sh`.

```bash
cd /full/path/to/ds-pipeline-kit
chmod +x verify.sh tools/*.sh plugin/hooks/*.sh repo-enforcement/scripts/*.sh
bash verify.sh
```

The `chmod` restores permission to run the scripts. A ZIP archive loses it on Windows, and the
guard is started **by its path** rather than through an interpreter — without the bit it never
runs, and nothing tells you so. On macOS and Linux the line changes nothing and is safe to run
anyway.

`verify.sh` checks the kit itself. Expect `ALL CHECKS PASSED — kit is releasable`. Anything else
means the copy did not arrive intact; replace it rather than working around it.

---

## Level 1 — the process

```bash
claude plugin marketplace add /full/path/to/ds-pipeline-kit
claude plugin install ds-component-pipeline@ds-pipeline-kit
```

The marketplace source is the **path to this folder**, because the folder is itself a marketplace
root — `.claude-plugin/marketplace.json` sits at its top level. The short `owner/repo` form works
only when the kit is published as a repository of its own, with that manifest in the repository
root; pointed at a repository that merely *contains* the kit, it fails with `Marketplace file not
found`.

Always give the `@ds-pipeline-kit` suffix when installing. Without it the command relies on the
plugin name being unique across every marketplace you have added.

Verify:

```bash
claude plugin details ds-component-pipeline
```

Expect **10 skills, 1 agent, 1 hook**. In Claude Code that hook is registered by the install
itself, so Level 2 arrives with Level 1. In a harness that does not read plugin hooks it stays
inert until you register it by hand — see Level 2.

> There is no `claude plugin validate` command. `claude plugin details` shows the component
> inventory and projected token cost; `claude plugin tag` validates that `plugin.json` and the
> marketplace entry agree before a release. Those two are the release checks.

### Then bind it to your repository

```bash
cp ds-kit.config.yml <your-repo>/ds-kit.config.yml
```

Edit it. Until you do, everything uses the documented defaults — `src/components/`,
`docs/component-specs/`, `main` — which may not be your layout. **Nothing warns you if they are
wrong**; the skills simply describe paths that do not exist.

### Optional but recommended: the deterministic trigger

A skill is invoked by the model when it judges the description relevant — that is probabilistic.
A rule with directory triggers is injected by the harness whenever a matching path is touched.
The plugin format has no `rules/` directory, so this form is copied:

```bash
./tools/make-rule.sh
cp build/ds-component-pipeline.rule.md <your-repo>/.claude/rules/ds-component-pipeline.md
```

The file is **generated** from the same source as the skill, with trigger globs read from your
config. Do not hand-edit it; regenerate it.

---

## Level 2 — plus the write-time guard

**In Claude Code there is nothing to do here.** The plugin declares its own hook, the Level 1
install registers it, and `claude plugin details` reporting `Hooks (1)` is the confirmation.

In a harness that does not read plugin hooks, register it by hand:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          { "type": "command", "command": "/full/path/to/ds-pipeline-kit/plugin/hooks/ds-pipeline-guard.sh" }
        ]
      }
    ]
  }
}
```

### Verify it actually fires

A registered-but-silent hook looks exactly like a firing-and-finding-nothing hook. Prove it:

```bash
cd <your-repo> && git checkout -b spec/probe
printf '%s' '{"tool_name":"Write","tool_input":{"file_path":"src/components/ui/probe.tsx"}}' \
  | /full/path/to/ds-pipeline-kit/plugin/hooks/ds-pipeline-guard.sh ; echo "exit=$?"
```

Expect `exit=2`. If you get `exit=0`, your paths do not match the config — fix that before going
further, or every later check measures nothing.

That probe runs the script directly, so it proves the script and your paths. It does not prove
the harness is calling it, and the two are indistinguishable from outside. Still on `spec/probe`,
ask your agent to create `src/components/ui/probe.tsx` with any content: it should be refused
before the file appears. If the file is created, the guard is correct and nothing is running it.

If you modify the guard, run its suite. All 54 must pass:

```bash
bash plugin/hooks/ds-pipeline-guard.test.sh
```

---

## Level 3 — plus gates that block

### 1. Copy the files

```bash
cp -r repo-enforcement/.github/workflows/*  <your-repo>/.github/workflows/
cp -r repo-enforcement/tools/*             <your-repo>/tools/
cp -r repo-enforcement/scripts/*           <your-repo>/scripts/
cp    ds-kit.config.yml                    <your-repo>/          # if not already there
```

The linter rules in `repo-enforcement/eslint-rules/` are **examples for one stack**. Copy them
only if that stack is yours; otherwise write the equivalents for your linter. Nothing depends on
them. Read their README first — two of the edge cases are not obvious.

### 2. Make the names match

The job names in `pr-gates.yml` become the required status-check names. They must equal
`status_checks` in `ds-kit.config.yml` **exactly**. A mismatch produces a gate that is
configured, appears in the checks UI, and never blocks anything.

| Config key | Job name |
|---|---|
| `status_checks.spec_pr_separation` | `enforce-spec-pr-separation` |
| `status_checks.one_component_per_pr` | `enforce-one-component-per-pr` |
| `status_checks.document_on_base` | `require-document-on-base` |
| `status_checks.review_approved` | `review-approved` |

### 3. Order of operations — do not reverse

1. Merge the workflows to `main`.
2. Open one pull request; let all four checks report at least once.
3. **Then** apply branch protection.

Applying protection before a check has ever run leaves every pull request permanently pending —
including the one that would fix it.

```bash
./repo-enforcement/scripts/apply-branch-protection.sh --repo owner/name          # plan
./repo-enforcement/scripts/apply-branch-protection.sh --repo owner/name --apply  # write
```

**No administrator rights?** [`repo-enforcement/docs/branch-protection-runbook.md`](repo-enforcement/docs/branch-protection-runbook.md)
has the web-interface path and the exact request to send someone who has them.

### 4. Before enabling `review-gate.yml` on a PUBLIC repository

It greens on any non-author approving review, with no allow-list. That is safe on a **private**
repository, where submitting a review already requires repository access. On a public repository
anyone can submit a review — add an identity or permission check first.

### 5. Verify the gates bite

Three probes in the runbook. Two must go red. Run them once, deliberately.

---

## Dependencies

| For | Needs |
|---|---|
| Skills, orchestrator | An agent harness that reads plugin skills, agents and hooks |
| Write-time guard | `bash` 3.2+ — no `jq`, no Python, no `grep -P` |
| Guard test suite | `bash`, `git` |
| CI gates | GitHub Actions, `bash`, `git`, `awk`, `sed`; `python3` only if you use a `compound-spec-alias.json` |
| Branch protection script | `gh` CLI, authenticated with admin rights |
| `verify.sh` | `bash`, `python3` |
| Quality gate stage | Your own build / lint / test / story-build commands |

---

## Uninstall

```bash
claude plugin uninstall ds-component-pipeline
```

For Level 3, remove the workflows and the branch-protection rule. **Remove the protection rule
first** — required checks whose workflows no longer exist leave every pull request pending.
