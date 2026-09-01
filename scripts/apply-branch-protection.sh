#!/usr/bin/env bash
# =============================================================================
# apply-branch-protection.sh
# =============================================================================
# Makes the Level 3 gates BINDING by requiring them before merge.
#
# Until this runs, the gates report a red X and nothing stops anyone pressing
# Merge anyway. A failing check that does not block is a notification, not a gate.
#
# DRY RUN BY DEFAULT. Pass --apply to write.
#
#   ./apply-branch-protection.sh --repo owner/name            # show the plan
#   ./apply-branch-protection.sh --repo owner/name --apply    # write it
#
# Requires: gh CLI, authenticated with ADMIN rights on the repository.
# No admin rights? See ../docs/branch-protection-runbook.md for the manual path
# through the web interface, and for what to ask an administrator for.
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Locate ds-kit.config.yml. The two-levels-up form is correct inside the kit
# (repo-enforcement/scripts/) and wrong in every repository the kit is installed
# into, where INSTALL.md puts this file at <repo>/scripts/ — two levels up from
# there is outside the repository. Searched in order: $DS_KIT_CONFIG, the git
# repository root, then one and two levels up.
_find_kit_config() {
  local candidate
  if [ -n "${DS_KIT_CONFIG:-}" ]; then printf '%s' "$DS_KIT_CONFIG"; return 0; fi
  if candidate="$(git rev-parse --show-toplevel 2>/dev/null)/ds-kit.config.yml" && [ -f "$candidate" ]; then
    printf '%s' "$candidate"; return 0
  fi
  for candidate in "${SCRIPT_DIR}/../ds-kit.config.yml" "${SCRIPT_DIR}/../../ds-kit.config.yml"; do
    [ -f "$candidate" ] && { printf '%s' "$candidate"; return 0; }
  done
  return 1
}
CFG="$(_find_kit_config || true)"
if [ ! -f "$CFG" ]; then
  echo "ds-kit.config.yml not found. Looked for \$DS_KIT_CONFIG, the repository root, then one and two directories above ${SCRIPT_DIR}. Without it this script cannot resolve the branch name or the required check names — and applying protection with the wrong check names produces a repository where every pull request is permanently pending." >&2
  exit 1
fi

REPO=""
APPLY=0
while [ $# -gt 0 ]; do
  case "$1" in
    --repo)  REPO="${2:-}"; shift 2 ;;
    --apply) APPLY=1; shift ;;
    -h|--help) sed -n '2,20p' "$0"; exit 0 ;;
    *) echo "unknown argument: $1" >&2; exit 2 ;;
  esac
done

[ -n "$REPO" ] || { echo "--repo owner/name is required" >&2; exit 2; }
command -v gh >/dev/null || { echo "gh CLI not found" >&2; exit 2; }

read_key() {
  sed -n "s/^[[:space:]]*$1:[[:space:]]*\"\{0,1\}\([^\"#]*\)\"\{0,1\}[[:space:]]*$/\1/p" \
    "$CFG" 2>/dev/null | head -1 | sed 's/[[:space:]]*$//'
}
BRANCH=$(read_key main_branch);           BRANCH="${BRANCH:-main}"
C1=$(read_key spec_pr_separation);        C1="${C1:-enforce-spec-pr-separation}"
C2=$(read_key one_component_per_pr);      C2="${C2:-enforce-one-component-per-pr}"
C3=$(read_key document_on_base);          C3="${C3:-require-document-on-base}"
C4=$(read_key review_approved);           C4="${C4:-review-approved}"
REQUIRE_REVIEW=$(read_key require_review_to_merge); REQUIRE_REVIEW="${REQUIRE_REVIEW:-true}"

# One decision, two consumers: the plan that gets read and the JSON that gets written.
# Computing them separately is how a dry run comes to describe something other than
# what --apply does.
if [ "$REQUIRE_REVIEW" = "false" ]; then
  CONTEXTS="\"$C1\", \"$C2\", \"$C3\""
  REVIEW_LINE="  - $C4  (REPORTED, NOT REQUIRED — require_review_to_merge: false)"
else
  CONTEXTS="\"$C1\", \"$C2\", \"$C3\", \"$C4\""
  REVIEW_LINE="  - $C4"
fi

cat <<PLAN
Repository : $REPO
Branch     : $BRANCH
Required checks:
  - $C1
  - $C2
  - $C3
$REVIEW_LINE

Approving reviews required: 0

  Zero is deliberate, and it is the single most misread setting here.
  An automated reviewer with read-only access submits reviews that GitHub does
  NOT count toward required_approving_review_count. Requiring 1 there would mean
  the bot's approval never satisfies it, while the review-approved check — which
  DOES see the bot's review, and any human's — carries the real decision.
  So the count is 0 and '$C4' is what actually opens the merge button.

  A HUMAN STILL PERFORMS THE MERGE. Nothing here grants an agent merge rights.

PLAN

if [ "$APPLY" -eq 0 ]; then
  echo "DRY RUN — nothing written. Re-run with --apply to write."
  exit 0
fi

echo "Applying..."
# Verify the checks have actually reported at least once. A required check that
# has never run leaves every pull request permanently pending, which looks
# identical to a broken pipeline and is the most common way this step goes wrong.
echo "Checking that the workflows have reported at least once on $BRANCH..."
for c in "$C1" "$C2" "$C3" "$C4"; do
  if ! gh api "repos/$REPO/commits/$BRANCH/check-runs" --jq '.check_runs[].name' 2>/dev/null \
       | grep -qxF "$c"; then
    echo "  WARNING: '$c' has never reported on $BRANCH."
    echo "           Requiring it now will leave every pull request pending until it runs."
    echo "           Merge the workflow files first, let one pull request run, then apply this."
  fi
done

gh api -X PUT "repos/$REPO/branches/$BRANCH/protection" \
  --input - <<JSON
{
  "required_status_checks": {
    "strict": true,
    "contexts": [$CONTEXTS]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 0,
    "dismiss_stale_reviews": false
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON

echo "Applied. Verify with:"
echo "  gh api repos/$REPO/branches/$BRANCH/protection --jq '.required_status_checks.contexts'"
