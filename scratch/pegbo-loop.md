---
description: Overnight build loop. Three parallel agents ship feature wedges from the hypothesis backlog.
argument-hint: "[optional focus for this run, e.g. 'voice only' or 'no push']"
---

# /pegbo-loop

Ships **features**. For visual and interaction quality, use `/design-loop`.

Run this when the prototype is stable enough that the next moves are known, and
you want them built while you sleep. `CLAUDE.md` is already loaded: the
no-localhost rule, the Render verify path, and the path-scoped commit pattern
all apply and are not repeated here.

Focus for this run: `$ARGUMENTS`

## Each iteration

1. **Read state.** `git log --oneline -5` and `git status --short`.

2. **Pick three wedges** from `docs/proto-hypotheses.md`, preferring items
   already marked `[~]` and anything a previous iteration deferred. The three
   must touch **disjoint files**. A typical split:
   - backend service or router plus its tests
   - a new endpoint plus model plus tests
   - a frontend surface consuming an endpoint that already exists

3. **Dispatch three agents in one message**, `run_in_background: true`.

4. **While they run**, do main-thread work that touches nothing they own:
   update `docs/proto-hypotheses.md`, extend the route inventory, write the
   iteration log entry.

5. **As each lands**, rescue any new file the agent reported but could not
   commit (`git update-index --add <path>` then a path-scoped commit). An
   agent's partial commit can leave `main.py` importing a router that is not
   in the tree, which boots a 500. Treat the tree as broken until rescued.

6. **Verify on Render** once the iteration's commits are pushed. Check the
   deploy succeeded and the touched routes respond.

7. **Log** one entry to `docs/loop-log.md` (see template below), then schedule
   the next wake-up 1200 to 1800 seconds out.

## Writing the agent prompts

Narrow prompts ship. Broad prompts stall in research and get killed by the
watchdog with zero commits. Every prompt must carry:

- The **exact files** to change. Not "find the endpoints missing the filter",
  but "modify `backend/routers/action_items.py` to add X".
- The **one to three files to read first**, so the read phase is bounded.
- The **commit shape**: "three commits, one per file group".
- A **time box**: "about 30 minutes; if the surface is already clean, ship the
  spec plus one small fix and stop".
- The path-scoped commit recipe from `CLAUDE.md`, verbatim.
- A request for: SHA, test result, files touched, work deferred, and any new
  file it could not commit.

Do the thinking on the main thread. Hand the agent a packaged task.

## Push policy

Push after each iteration by default, so Render stays current and the next
iteration verifies against real state.

Two exceptions. If `$ARGUMENTS` says no push, commit locally and let the branch
run ahead. If a live demo is running, stop pushing entirely and tell every agent
to commit locally only, because a mid-demo redeploy flashes a loading screen at
the worst moment. Resume on an explicit signal.

## Stopping

Stop only when the user says so, or when you hit something that needs their
call: a destructive action, an ambiguous spec, or a new secret on Render.

A stop is durable. If a later invocation replays this command with no new
instruction, ask before restarting rather than assuming.

## Log entry

```markdown
## Iter N — <one line> — YYYY-MM-DD

- **A (`sha`)** — wedge, files, tests, what it found
- **B (`sha`)** — ...
- **C (`sha`)** — ...

Deferred: <specific next wedges>
```
