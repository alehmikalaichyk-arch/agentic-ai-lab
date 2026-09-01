# Branch protection — runbook

Making the Level 3 gates binding requires **repository administrator rights**. Most people
installing this kit do not have them, and this page exists so that being blocked on an
administrator does not mean being blocked on the whole level.

Read the order-of-operations section first. Getting it wrong is recoverable but noisy, and
it is the thing that goes wrong most often.

---

## Order of operations — do not reverse it

| Step | What | Why this order |
|---|---|---|
| 1 | Merge the workflow files to `main` | A required check that has never run leaves **every** pull request permanently pending. Nobody can merge, including the person who would fix it. |
| 2 | Let one pull request run all four checks | Confirms the check names match `status_checks` in `ds-kit.config.yml` exactly. A name mismatch here is invisible later — the gate simply never blocks. |
| 3 | Then require them in branch protection | Only now do the names exist to be selected. |

Reversing steps 1 and 3 is the classic failure. It is fixable — an administrator removes the
requirement — but for the interval, the repository is frozen.

---

## Path A — you have administrator rights

```bash
./scripts/apply-branch-protection.sh --repo owner/name            # plan
./scripts/apply-branch-protection.sh --repo owner/name --apply    # write
```

Verify:

```bash
gh api repos/owner/name/branches/main/protection --jq '.required_status_checks.contexts'
```

Expect the four names from `ds-kit.config.yml`. If one is missing or misspelled, that gate is
decorative.

---

## Path B — you do not have administrator rights

You cannot apply this yourself, and no amount of local configuration substitutes for it. What
you *can* do is arrive with an exact, reviewable request.

### What to send an administrator

> Please enable branch protection on `main` in `<owner>/<repo>`:
>
> **Require status checks to pass before merging** — strict (require branches to be up to
> date), with exactly these four:
>
> - `enforce-spec-pr-separation`
> - `enforce-one-component-per-pr`
> - `require-document-on-base`
> - `review-approved`
>
> **Require a pull request before merging** — with **required approvals set to 0**.
>
> Zero is intentional and is the part most likely to be queried. An automated reviewer with
> read-only access submits reviews that GitHub does not count toward the approval number.
> Setting it to 1 would mean the automated approval never satisfies it. The `review-approved`
> check is what actually carries the review decision — it sees both automated and human
> approvals — and it is in the required list above. A human still performs every merge.
>
> Please leave **force pushes** and **branch deletion** disabled. Please do **not** enable
> "include administrators" yet — see below.
>
> These four checks have already run on pull request `<link>`, so the names will appear in
> the picker.

### Through the web interface

Settings → Branches → Add branch protection rule (or Rules → Rulesets on newer layouts):

1. Branch name pattern: `main`
2. ☑ Require a pull request before merging → Required approvals: **0**
3. ☑ Require status checks to pass before merging → ☑ Require branches to be up to date
4. Search and add each of the four check names. **If a name does not appear in the picker,
   that check has never run** — go back to step 2 of the order of operations. Do not type it
   in manually and assume it will bind.
5. ☐ Do not allow force pushes · ☐ Do not allow deletions
6. Leave "Do not allow bypassing the above settings" **off** initially — see below.

---

## Why "include administrators" starts off

Turning it on immediately is the second-most-common way to freeze a repository: if a gate has
a bug, the people who could fix it are also blocked by it.

Run with it off for a week. Once the gates have blocked a real pull request for a real reason
and passed a real one, turn it on. Leaving it off forever is a decision, not an oversight —
make it deliberately.

---

## Verifying the gates actually bite

Configuration that looks right and does nothing is the failure mode this whole page is about.
Prove it once, on purpose:

| Probe | Expected |
|---|---|
| Open a pull request adding `docs/component-specs/probe.md` **and** `src/components/ui/probe.tsx` | `enforce-spec-pr-separation` fails, Merge is blocked |
| Open a pull request adding `src/components/ui/probe.tsx` alone, with no spec on `main` | `require-document-on-base` fails, Merge is blocked |
| Open a pull request adding `docs/component-specs/probe.md` alone | All four pass once someone approves |

If probe 1 or 2 goes green, stop and re-check the check names against `ds-kit.config.yml`
before trusting anything else at Level 3.

---

## If you cannot get administrator rights at all

Level 3 without branch protection still gives you **visible** red checks on every violating
pull request. That is worth having: it turns "someone should have noticed" into "the pull
request is visibly red". It is not enforcement — anyone can still press Merge — so say so
plainly to your team rather than letting a red X be mistaken for a locked door.
