# Verifying the pipeline actually loaded

Run this **in a fresh session, in a fresh clone**, before demonstrating anything. It answers one
question: does an agent opening this repository actually get the ten skills, the orchestrator and
the write-time guard — or does it merely have them on disk?

The distinction matters because the failure is silent. A session with no skills loaded behaves
exactly like a session with skills it did not need, right up until the moment the process depends
on one.

---

## Why the checks are shaped this way

**A model will tell you it can see a skill whether or not it can.** Asked "do you have the
ds-governance skill?", the honest answer and the confabulated one are the same sentence. So every
check below asks for something that cannot be produced without the file: a section number, an
exact rule, a command's output.

**The hook is independent of the skills.** It runs in the harness, not in the model, so it can
work when nothing else does — and it can fail while every skill loads fine. Check it separately.

---

## Setup

```bash
git clone https://github.com/alehmikalaichyk-arch/agentic-ai-lab.git
cd agentic-ai-lab
npm install
npm run build:tokens      # generated/ is not committed; the token pages need it
```

Then open a **new** Claude Code session in that directory and paste the prompt below.

---

## The prompt

```
This repository is supposed to ship a design-system component pipeline that loads
automatically: ten skills under .claude/skills/, an orchestrator agent under
.claude/agents/, and a PreToolUse hook wired in .claude/settings.json.

Verify that it actually loaded. Do not tell me what should be there — show me what is.

Answer with evidence, in this order.

1. INVENTORY. List the skills you can invoke by name. Then say which of them come
   from this repository as opposed to your general availability. If you cannot
   distinguish those two, say so plainly rather than guessing.

2. CONTENT PROOF. These facts exist only inside the skill files. Quote each one and
   name the file you read it from. If you cannot find it, say "not found" — do not
   reconstruct it from what the rule sounds like it should say.

   a. In ds-governance, what do sections 6.1 and 6.2 cover, and what is the exact
      rule about the ORDER of a rest-prop spread?
   b. In ds-governance §6.2, what does "inert" NOT promise? State both halves of
      the contract table.
   c. In component-spec-writer, what lifecycle value does the skill refuse to
      write, and what makes a spec frozen instead?
   d. In the ds-component-pipeline rule, what is the review-round budget, and what
      are the THREE finding shapes the blocker / non-blocker split could not
      classify?
   e. In token-guardian, what does it do when it is asked to scan an application
      path rather than the design-system package?

3. ORCHESTRATOR. Is there an agent named ds-pipeline-orchestrator available to you?
   If yes: which tools does it have, and — the point of the question — which two
   are deliberately ABSENT and why?

4. HOOK. The write-time guard is harness-level, so answering from the skill files
   does not test it. Actually exercise it:

   git checkout -b spec/probe
   printf '%s' '{"tool_name":"Write","tool_input":{"file_path":"src/components/ui/probe.tsx"}}' \
     | ./ds-pipeline-kit/plugin/hooks/ds-pipeline-guard.sh ; echo "exit=$?"

   Report the exit code and the message. Then say what exit=0 would have meant.

5. THE REAL TEST. Try to create src/components/ui/probe.tsx with any content while
   still on the spec/probe branch. Report exactly what happened. Do not work around
   it, do not use a shell heredoc to bypass the tool, and do not retry — the point
   is whether the write is refused.

6. VERDICT. One of:
   - LOADED — skills, agent and hook all confirmed, with the evidence above.
   - PARTIAL — name precisely which part is missing.
   - NOT LOADED — the files are on disk and nothing is in effect.

   Then clean up: git checkout main && git branch -D spec/probe
```

---

## Reading the answers

| Answer | What it means |
|---|---|
| §6.1 quoted as "spread `...props` FIRST, own attributes after" | Skill loaded |
| §6.1 described as "spread props carefully" or similar | Confabulated — the skill did not load |
| Step 4 prints `exit=2` and a `BLOCKED` line | Hook works |
| Step 4 prints `exit=0` | The guard resolved no component path — `ds-kit.config.yml` does not match this repository's layout |
| Step 5 refused by the harness before the file appears | The hook is wired into settings, not merely present on disk |
| Step 5 succeeds and the file exists | The hook file works but `.claude/settings.json` is not being read |

**Step 4 passing and step 5 failing is the interesting case**, and the one worth understanding:
the guard script is correct and nothing is calling it. That is the state this repository was in
before the pipeline was deployed into `.claude/` — everything present, nothing in effect.

## If the verdict is NOT LOADED

The likely cause is that skills in `.claude/skills/` are not picked up by your harness version.
The fallback is the plugin route, which is a per-machine step:

```bash
claude plugin marketplace add ./ds-pipeline-kit
claude plugin install ds-component-pipeline@ds-pipeline-kit
claude plugin details ds-component-pipeline    # expect 10 skills, 1 agent, 1 hook
```

Note that `Agents (0)` there means the manifest regressed: `agents` must **not** be declared in
`plugin.json` — the directory is auto-discovered, and declaring it suppresses that.
