# Level 2 — The process, plus a guard at the keyboard

**Includes all of [Level 1](level-1.md).** **Install cost:** one command plus a settings entry.
**Permissions needed:** the ability to run a hook locally. **Configuration needed:** the same one
file.

---

## What Level 2 enforces

**Two conditions, at write time, on one machine.** Nothing else, and nothing anywhere else.

1. Writing component source while on a branch whose name marks it as spec-only
   (`spec/`, `decomp/`, `research/` by default).
2. Writing a PR-1 document — a spec *or* a retrofit addendum — and that same component's source
   **within one agent session**, in either order.

That second condition is the in-session form of the PR-1 / PR-2 boundary, and it is the one that
does real work: it stops an agent from designing and building in a single breath, which is
precisely the collapse the human checkpoint exists to prevent.

## What Level 2 does NOT enforce

Read this list before relying on the guard, because the gap between what it checks and what
people assume it checks is where the process quietly fails.

| Not checked | Why |
|---|---|
| Whether a spec exists at all | The guard has no pull-request context — no base commit, no labels, no PR body. It cannot tell a legitimately spec-less component from an illegitimate one. |
| Whether the spec was merged | Same reason. "Merged" is a fact about a branch the guard cannot see. |
| Whether the pull request mixes spec and source | A pull request is not a write. Level 3 checks this. |
| Anything at all, if the write happens outside the harness | An editor, a script, a colleague's machine without the plugin. The guard runs where it is installed and nowhere else. |
| Anything at all, when its own state is ambiguous | It is **fail-open by design**: unreadable git state, a missing file path, an unparseable payload — all exit 0 and allow the write. |

**Fail-open is deliberate, not a defect.** A guard that blocked on ambiguity would block real work
for reasons nobody could diagnose, and would be disabled within a week. It is defence in depth
behind CI, never a substitute for it.

## The security posture is not incidental

The guard maintains session state in a temporary file, and that file is an append target. An
unvalidated path there is an arbitrary-write primitive rather than a cosmetic issue. The shipped
script rejects caller-supplied paths that are not direct children of a fixed literal root,
rejects symbolic links, rejects hard links, and filters the session identifier to an allowlist
before concatenating it.

Each of those closes a reproduced escape, not a theoretical one. **If you modify the script,
run its test suite** — it covers all of them:

```bash
bash plugin/hooks/ds-pipeline-guard.test.sh
```

54 tests. All must pass. In particular, do not route a configuration value into the write path;
configuration feeds substring matching only.

## Install

On top of Level 1, register the hook. If your harness reads plugin hooks automatically, the
plugin's `hooks/hooks.json` is enough and there is nothing to do. Otherwise add to your settings:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          { "type": "command", "command": "<path-to-plugin>/hooks/ds-pipeline-guard.sh" }
        ]
      }
    ]
  }
}
```

## Verify it works

Do not assume. A hook that is registered but not firing looks exactly like a hook that is firing
and finding nothing — both produce silence.

```bash
cd <your-repo>
git checkout -b spec/probe
printf '%s' '{"tool_name":"Write","tool_input":{"file_path":"src/components/ui/probe.tsx"}}' \
  | ./path/to/ds-pipeline-guard.sh ; echo "exit=$?"
```

Expect `exit=2` and a message on stderr. If you get `exit=0`, the guard is running but your
paths do not match `ds-kit.config.yml` — fix the config before going further, or every subsequent
check is measuring nothing.

## When Level 2 is the right stopping point

- One or two people build components, and both work through the harness.
- You cannot add CI jobs to the repository yet.
- You want the boundary enforced during authoring while you decide about Level 3.

## When it is not

As soon as more than one person can open a pull request. The guard protects a keyboard, not a
branch — and the branch is what everyone else sees. Go to [Level 3](level-3.md).
