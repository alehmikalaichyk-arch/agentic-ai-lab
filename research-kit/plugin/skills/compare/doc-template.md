# Comparison document skeleton

Sections 1–4 are the **registration**: written and dated before any evidence is
read, never edited afterwards. Additions after that point go in section 9 as
post-hoc rows.

```markdown
# <Question as a decision> — comparison

**Registered:** YYYY-MM-DD (sections 1–4 frozen). **Scored:** YYYY-MM-DD.
**Depth:** desk | probe | bake-off. **Decider:** <who>. **Needed by:** <date or "no date">.

## TL;DR
Three to five lines. The recommendation, the row it rests on most, the row it
loses, and any broken prediction that changed the answer. If most values are
asserted rather than measured, say so here.

## 1. Question
What is being decided, for whom, and what changes depending on the answer.

## 2. Options and pins
| Option | What it is | Pinned at (version / commit / date / plan) |

## 3. Criteria and measures
| ID | Criterion | Unit | How measured | Instrument | Control test (positive / negative) |
Cut criteria, each with why it cannot be measured fairly on every option.

## 4. Predictions
| # | Prediction | Favours |
Include the ones that favour the option you do not expect to pick.

## 5. Scoreboard
| ID | Criterion | <A> | <B> | … | Status | Label | Source / evidence |
Status: WIN / LOSE / CONTESTED / DISCLOSED / UNMEASURED (or a per-row rank for
N-way). Label: measured / sampled / asserted / eyeballed.

## 6. Predictions checked
| # | Held / broke | What the evidence showed |

## 7. Recommendation
The pick, the rows it rests on, the rows it loses, and the cheapest
measurement that would flip it.

## 8. Threats not removed
N, who wrote the brief, which side moved after its pin, what the judge could
not see.

## 9. Post-hoc rows
Criteria found during the study. Reported, never used to decide.

## 10. Sources and nothing-at
Numbered sources with URL and access date. Then every source that returned
nothing, with the query; blocked ones marked blocked.
```
