---
description: Overnight design loop. One surface per cycle, argued and measured against the live deploy.
argument-hint: "[optional surface or theme for this run, e.g. 'the coverage dashboard']"
---

# /design-loop

Improves **how the app looks and reads**. For features, use `/pegbo-loop`.

One cycle is one design move, executed on the main thread. Taste does not
parallelize: coherence across screens comes from one mind holding the whole
picture. Sub-agents are allowed for research only (a Mobbin sweep, a critique of
the next candidate while you implement the current one), never for the design
decision or its implementation.

`CLAUDE.md` is already loaded. Its UI rules are the constraint surface for every
move here and are not repeated below.

Focus for this run: `$ARGUMENTS`

## Each cycle

1. **SENSE.** Screenshot the target on the live deploy. There is no dev server
   in this repo; Playwright is already pointed at Render and the `auth-setup`
   project mints the session, so a spec can reach authenticated surfaces. See
   `prototype-new/docs/PLAYWRIGHT_ACCESS.md`. Evidence before opinion.

2. **ARGUE.** Write three to five sentences in the log before touching code:
   what is weak, what evidence says so, what the move is, and why it beats the
   alternatives you considered. **This is the step that decays first.** When it
   turns into "polish X because X is next", the loop has stopped doing design.

3. **BENCHMARK.** When the move touches a pattern real products ship (a list, a
   record view, a timeline, nav, an empty state), pull three to five shipped
   screens from Mobbin. The standard is "product X does this, we do that, the
   gap costs us this". Cite the URLs in the log. Borrow structure, never
   identity, and the house rules still filter whatever you borrow.

4. **EXECUTE.** Real code, complete implementation, using the frozen primitives
   rather than new ones.

5. **VERIFY.** All four, every cycle:
   - `npx tsc --noEmit` from `prototype-new/` is clean.
   - The relevant Playwright specs pass. If behavior changed by design, update
     the spec deliberately and say so in the log.
   - Screenshots at a wide and a narrow width, actually looked at.
   - If color moved, re-check contrast: body text at 4.5:1, large text at 3:1.

6. **SHIP.** Commit and push. Render redeploys and the next cycle senses the
   real thing.

7. **LOG** to `docs/design-log.md`, then schedule the next wake-up 1200 to 1800
   seconds out.

## Choosing the next surface

In priority order:

1. **Flow coherence.** The screens walked before the destination must speak the
   same language as the destination. Drift upstream undermines the whole demo.
2. **The backlog** in the design log.
3. **Re-measurement.** A surface that changed since it was last critiqued.
4. **Interaction depth.** Keyboard paths on operator lists, empty and loading
   and error states on secondary screens, undo consistency.

## Stopping

Same as `/pegbo-loop`: stop only on an explicit signal or a genuine blocker, and
treat a stop as durable.

## Log entry

```markdown
## Cycle N — <the move> — YYYY-MM-DD

**Argument**: <weakness, evidence, move, why over the alternatives>
**Benchmark**: <deltas and URLs, or "no shipped analog">
**Shipped**: <sha> — <files>
**Verified**: tsc clean · specs pass · screenshots <widths> <· contrast>
**Deferred**: <what this surfaced>
```
