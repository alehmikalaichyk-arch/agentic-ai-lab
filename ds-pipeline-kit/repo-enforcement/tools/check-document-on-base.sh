#!/usr/bin/env bash
# =============================================================================
# check-document-on-base.sh
# =============================================================================
# Gate: every component whose SOURCE changed in this pull request must already
# have a merged decision document on the base branch.
#
# A decision document is one of:
#   1. <specs>/<component>.md            — the component spec (PR-1 for a new component)
#   2. <specs>/<component>-base.md       — the "-base" spec naming variant
#   3. <retrofits>/<component>.md        — a retrofit migration addendum, accepted ONLY
#                                          when the component already exists on base
#
# "On the base branch" is the whole point: a document added in THIS pull request does
# not count. That is what makes the human merge of PR-1 a real checkpoint rather than a
# formality an author can satisfy in the same breath as the implementation.
#
# ---------------------------------------------------------------------------
# COMPOUND COMPONENTS
#
# A "compound" component's source is split across more than one file (e.g.
# page-shell.tsx + page-shell-header.tsx), but the pipeline freezes exactly ONE spec for
# the whole compound, named after its primary member. The classifier derives a component
# name from the file path it sees, so a pull request touching only a secondary member
# reports THAT member's name — which by design has no document of its own, and sources
# 1-3 above cannot express "one spec, two source files".
#
# The alias table fixes it: an explicit map from a secondary member's classifier name to
# the PRIMARY member the spec is named after. Two properties are load-bearing:
#
#   * It is an explicit table, NOT a prefix/suffix/substring rule. A fuzzy rule would
#     collapse real, independently-specced siblings that merely share a naming pattern —
#     stripping a trailing "-base" or "-picker" would resolve `input-base` or
#     `date-time-picker` to a name that is not theirs.
#   * It is read from the BASE commit's tree, never from the caller's checkout. This is
#     security-relevant, not a style choice: the whole job of this gate is to decide on
#     what existed BEFORE the pull request. Read from disk, a pull request adding both
#     `src/components/ui/new-widget.tsx` and an alias entry `"new-widget": "button"`
#     would make the gate accept button's already-merged spec as covering the new
#     component — self-granted coverage, bypassing PR-1 entirely.
#
# The table is consulted for the two SPEC probes only. The addendum probe and the
# pre-existence check are unaffected: a retrofit addendum always names the exact
# component it retrofits.
#
# Add an entry only for a secondary member that a spec has deliberately left without its
# own document, and record that decision in the primary spec, so the entry is traceable
# to a spec decision rather than an ad hoc CI workaround.
#
# Inputs (environment):
#   BASE_SHA               — the pull request's base commit. Unset → FAIL CLOSED.
#   REAL_COMPONENTS        — CSV of component names, from classify-pr-diff.sh
#   REAL_COMPONENT_LAYOUTS — CSV of "<A|B|C>:<name>", from classify-pr-diff.sh
#   COMPOUND_SPEC_ALIAS_PATH — repo-relative path of the alias table, default
#                            `compound-spec-alias.json`. Overrides the PATH only;
#                            resolution still happens at BASE_SHA, never from disk.
#
# Exit: 0 = every component is covered (or nothing shippable changed). 1 = at least one is not.
#
# This script is SELF-CONTAINED by design. In the system it came from the blob probe and
# the pre-existence predicate were separate files shared with a third gate; that gate is
# not part of this kit, so keeping them separate would leave three files where one is
# needed and three places for the mode rule to drift apart.
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ---------------------------------------------------------------------------
# Locate ds-kit.config.yml.
#
# Search order, and each entry is there because one of them is wrong somewhere:
#
#   1. $DS_KIT_CONFIG        — explicit wins; this is what the tests set.
#   2. repository root       — where INSTALL.md tells you to put it, and where
#                              this script lives when copied to <repo>/tools/.
#   3. one level up          — same layout, invoked from a subdirectory.
#   4. two levels up         — the position inside the kit itself
#                              (repo-enforcement/tools/), so the kit's own tests
#                              keep working unchanged.
#
# The two-levels-up form used to be the ONLY default, which was correct inside
# the kit and wrong in every repository the kit was installed into: the lookup
# landed outside the repository, every key read back empty, and the script died
# on `set -u` with a bare exit 2 and no message. A gate that fails without saying
# why reads as a broken repository rather than a missing file.
_find_kit_config() {
  local here; here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  local candidate
  if [ -n "${DS_KIT_CONFIG:-}" ]; then printf '%s' "$DS_KIT_CONFIG"; return 0; fi
  if candidate="$(git rev-parse --show-toplevel 2>/dev/null)/ds-kit.config.yml" && [ -f "$candidate" ]; then
    printf '%s' "$candidate"; return 0
  fi
  for candidate in "${here}/../ds-kit.config.yml" "${here}/../../ds-kit.config.yml"; do
    [ -f "$candidate" ] && { printf '%s' "$candidate"; return 0; }
  done
  return 1
}

CFG="$(_find_kit_config || true)"
if [ ! -f "$CFG" ]; then
  echo "::error::ds-kit.config.yml not found. Looked for \$DS_KIT_CONFIG, then the repository root, then one and two directories above $(dirname "${BASH_SOURCE[0]}"). Copy it to the repository root (see the kit's INSTALL.md) or set DS_KIT_CONFIG. Failing closed: without it this gate cannot resolve which paths hold component source." >&2
  exit 1
fi


# --- configuration surface ---------------------------------------------------
read_key() {
  sed -n "s/^[[:space:]]*$1:[[:space:]]*\"\{0,1\}\([^\"#]*\)\"\{0,1\}[[:space:]]*$/\1/p" \
    "$CFG" 2>/dev/null | head -1 | sed 's/[[:space:]]*$//'
}
SPECS=$(read_key specs);                SPECS="${SPECS:-docs/component-specs/}"
RETROFITS=$(read_key retrofits);        RETROFITS="${RETROFITS:-docs/component-retrofits/}"
UI_DIR=$(read_key components_ui);       UI_DIR="${UI_DIR:-src/components/ui/}"
CO_DIR=$(read_key components_composite);CO_DIR="${CO_DIR:-src/components/}"
SPECS="${SPECS%/}/"; RETROFITS="${RETROFITS%/}/"; UI_DIR="${UI_DIR%/}/"; CO_DIR="${CO_DIR%/}/"

# -----------------------------------------------------------------------------
# blob_at_base <path> — is BASE_SHA:<path> a REGULAR FILE BLOB?
#
# `git cat-file -e` and `git show` are deliberately NOT used: both succeed for ANY object
# at the path — a symlink (120000), a tree (a DIRECTORY named `button.md`), or a gitlink —
# which would let a non-file object satisfy an existence check. This reads the `git ls-tree`
# MODE and accepts only 100644 / 100755.
#
# TOTAL predicate: returns 0 or 1, never aborts with git's own status, so a caller can loop
# over candidates without `set -e` terminating the loop mid-way.
# -----------------------------------------------------------------------------
blob_at_base() {
  local path_arg="${1:-}"
  [ -n "$path_arg" ] && [ -n "${BASE_SHA:-}" ] || return 1
  local ls_out mode
  # ls-tree exits 0 with EMPTY output for a valid revision and an absent path, and non-zero
  # only when the revision itself cannot be read. Splitting the two keeps an unresolvable
  # BASE_SHA diagnosable while still failing closed.
  if ! ls_out=$(git ls-tree "${BASE_SHA}" -- "$path_arg" 2>/dev/null); then
    echo "cannot read '${path_arg}' at BASE_SHA '${BASE_SHA}' — unresolvable revision or unreadable repository. Treating the path as absent (fail-closed)." >&2
    return 1
  fi
  mode=$(printf '%s\n' "$ls_out" | awk 'NR==1{print $1}')
  [ "$mode" = "100644" ] || [ "$mode" = "100755" ]
}

# -----------------------------------------------------------------------------
# tree_has_production_source <ls-tree -r listing>
#
# ALLOWLIST, not a denylist: "not a known artifact" is too weak — a README, a CSS file, a
# JSON file, a .d.ts and a symlink are all non-production. A single awk pass over mode+path
# decides it, and never early-exits, so it cannot hit the SIGPIPE-under-pipefail
# misclassification a `grep -q`-terminated pipeline would on a large listing.
# -----------------------------------------------------------------------------
tree_has_production_source() {
  local listing="$1"
  [ -n "$listing" ] || return 1
  printf '%s\n' "$listing" | awk '
    ($1 == "100644" || $1 == "100755") {
      p = $0; sub(/^[^\t]*\t/, "", p)
      if (p ~ /\.(tsx|ts)$/ && p !~ /\.d\.ts$/ \
          && p !~ /\.(test|spec)\.(tsx|ts)$/ \
          && p !~ /\.stories\.(tsx|ts)$/ \
          && p !~ /\.snap$/ \
          && p !~ /(^|\/)__snapshots__\// \
          && p !~ /(^|\/)__mocks__\//) { found = 1 }
    }
    END { exit(found ? 0 : 1) }'
}

# -----------------------------------------------------------------------------
# component_exists_on_base <tag> <name>
#
# Does the component already exist on base at its EXACT layout path, as production source?
# This is what keeps a genuinely NEW component from slipping past the spec requirement by
# hand-writing a retrofit addendum.
#
# Probing ONLY the component's own layout is deliberate: it closes the cross-layout
# name-collision bypass, where an existing B:<name> would make a brand-new A:<name> look
# pre-existing.
# -----------------------------------------------------------------------------
component_exists_on_base() {
  local tag="${1:-}" name="${2:-}" candidate tree_listing
  # Grammar validation FIRST — independent of repository contents, so a malformed or
  # injected entry can never alias a real component that happens to carry that name.
  printf '%s' "$tag"  | grep -qE '^[ABC]$'                      || return 1
  printf '%s' "$name" | grep -qE '^[A-Za-z0-9][A-Za-z0-9_-]*$'  || return 1
  [ -n "${BASE_SHA:-}" ] || return 1
  case "$tag" in
    A) for candidate in "${UI_DIR}${name}.tsx" "${UI_DIR}${name}.ts"; do
         blob_at_base "$candidate" && return 0
       done ;;
    B) # -r WITH mode/type columns (no --name-only) so descendants that are symlinks or
       # trees are rejected rather than counted.
       tree_listing=$(git ls-tree -r "${BASE_SHA}:${CO_DIR}${name}" 2>/dev/null || true)
       tree_has_production_source "$tree_listing" && return 0 ;;
    C) for candidate in "${CO_DIR}${name}.tsx" "${CO_DIR}${name}.ts"; do
         blob_at_base "$candidate" && return 0
       done ;;
  esac
  return 1
}

# =============================================================================
# Main
# =============================================================================
if [ -z "${BASE_SHA:-}" ]; then
  echo "::error::BASE_SHA is unset — cannot check the base branch for a decision document. Failing the gate closed. (CI must pass the pull request's base SHA.)"
  exit 1
fi

# --- compound-component alias table -----------------------------------------
# Read at BASE_SHA (see the header). `git show` exits non-zero when the path does not exist
# at BASE_SHA at all — an older base, or a repository with no compound components. That is
# NOT a failure: the table stays empty, every component resolves to its own name, and the
# gate behaves exactly as it did before the table existed.
#
# Parsing goes through python3 rather than jq: python3 is present on every hosted runner,
# jq is not guaranteed on a self-hosted one, and a missing parser must not silently empty a
# table that a legitimate pull request depends on — hence the explicit error below.
COMPOUND_SPEC_ALIAS_PATH="${COMPOUND_SPEC_ALIAS_PATH:-compound-spec-alias.json}"
declare -A COMPOUND_SPEC_ALIAS=()
if ALIAS_JSON_AT_BASE=$(git show "${BASE_SHA}:${COMPOUND_SPEC_ALIAS_PATH}" 2>/dev/null); then
  if ! command -v python3 >/dev/null 2>&1; then
    echo "::error::'${COMPOUND_SPEC_ALIAS_PATH}' exists at BASE_SHA but python3 is unavailable to parse it. Failing closed rather than proceeding with an empty alias table, which would report a spurious missing spec for every compound component."
    exit 1
  fi
  # A malformed table is fatal for the same reason: silently empty and a real compound
  # component looks spec-less. Keys and values are grammar-checked here, so a hand-edited
  # table cannot inject a path fragment into a document lookup.
  if ! ALIAS_TSV=$(printf '%s' "$ALIAS_JSON_AT_BASE" | python3 -c '
import json, re, sys
NAME = re.compile(r"^[a-z0-9][a-z0-9-]*$")
try:
    table = json.load(sys.stdin)
except Exception as e:
    sys.exit("not valid JSON: %s" % e)
if not isinstance(table, dict):
    sys.exit("expected a JSON object of {secondary: primary}")
for k, v in table.items():
    if not isinstance(v, str) or not NAME.match(k) or not NAME.match(v):
        sys.exit("entry %r -> %r is not a lowercase component-name pair" % (k, v))
    if k == v:
        sys.exit("entry %r aliases itself" % k)
    print("%s\t%s" % (k, v))
' 2>&1); then
    echo "::error::'${COMPOUND_SPEC_ALIAS_PATH}' at BASE_SHA (${BASE_SHA}) is unusable — ${ALIAS_TSV}. Failing closed."
    exit 1
  fi
  while IFS=$'\t' read -r alias_key alias_value; do
    [ -n "$alias_key" ] || continue
    COMPOUND_SPEC_ALIAS["$alias_key"]="$alias_value"
  done <<< "$ALIAS_TSV"
fi

REAL_COMPONENTS="${REAL_COMPONENTS:-}"
REAL_COMPONENT_LAYOUTS="${REAL_COMPONENT_LAYOUTS:-}"

# Normalize both CSVs once — split, trim, drop blanks, dedupe — so malformed input
# ("A:button,,", ",A:button,") can neither smuggle a blank entry past the per-component
# checks nor desync the two lists.
NORMALIZED_LAYOUTS=$(printf '%s' "$REAL_COMPONENT_LAYOUTS" | tr ',' '\n' | sed 's/^[[:space:]]*//; s/[[:space:]]*$//' | grep -v '^$' | sort -u || true)
NORMALIZED_NAMES=$(printf '%s' "$REAL_COMPONENTS" | tr ',' '\n' | sed 's/^[[:space:]]*//; s/[[:space:]]*$//' | grep -v '^$' | sort -u || true)

# Artifact-only pull request. The classifier still reports COMPONENT_SOURCE for a diff
# touching only <c>.test.tsx, <c>.stories.tsx or a snapshot, so this job is still reached.
# Nothing shippable changed, so there is nothing for a document to govern.
if [ -z "$NORMALIZED_NAMES" ] && [ -z "$NORMALIZED_LAYOUTS" ]; then
  echo "No real component source changed — the diff touches only artifacts (tests, stories, snapshots). Document check not applicable."
  exit 0
fi

# Desync guards. The classifier emits both lists from one accumulation, so one being empty
# while the other is not means the outputs did not reach this job intact.
if [ -z "$NORMALIZED_LAYOUTS" ]; then
  echo "::error::REAL_COMPONENT_LAYOUTS is empty while REAL_COMPONENTS ('${REAL_COMPONENTS}') is not — cannot resolve each component's layout path, so pre-existence cannot be verified. Failing the gate closed."
  exit 1
fi
if [ -z "$NORMALIZED_NAMES" ]; then
  echo "::error::REAL_COMPONENTS is empty while REAL_COMPONENT_LAYOUTS ('${REAL_COMPONENT_LAYOUTS}') is not — classifier outputs disagree. Failing the gate closed."
  exit 1
fi

FAILED=0

# Completeness guard — every name must carry at least one layout pair. The per-component
# loop below iterates the LAYOUT pairs (only they carry the tag needed for pre-existence),
# so a name with no pair would silently escape every check.
# Fixed-string matching: the name is not yet validated and must not be read as a regex.
while IFS= read -r name; do
  [ -z "$name" ] && continue
  if ! printf '%s\n' "$NORMALIZED_LAYOUTS" | grep -qxF -e "A:${name}" -e "B:${name}" -e "C:${name}"; then
    echo "::error::Component '${name}' appears in REAL_COMPONENTS but has no entry in REAL_COMPONENT_LAYOUTS ('${REAL_COMPONENT_LAYOUTS}') — classifier desync. Failing the gate closed rather than leaving that component unchecked."
    FAILED=1
  fi
done <<< "$NORMALIZED_NAMES"

while IFS= read -r pair; do
  [ -z "$pair" ] && continue
  tag="${pair%%:*}"
  name="${pair#*:}"

  # Fail-closed pair validation BEFORE any lookup — independent of repository contents, so
  # a malformed or injected entry is rejected by grammar and can never alias a real
  # component or document of the same name.
  if ! printf '%s' "$tag" | grep -qE '^[ABC]$' \
    || ! printf '%s' "$name" | grep -qE '^[A-Za-z0-9][A-Za-z0-9_-]*$'; then
    echo "::error::Malformed layout-qualified component entry '${pair}' — expected '<A|B|C>:<safe-name>'. Failing the gate closed rather than guessing which component was meant."
    FAILED=1
    continue
  fi

  # Documents are named after the LOWERCASED component name; the component's own source
  # path keeps its original casing (checked separately, by the pre-existence predicate).
  COMPONENT_LOWER=$(printf '%s' "$name" | tr '[:upper:]' '[:lower:]')

  # Compound alias — spec probes only. The lookup key is the exact lowercased name, so an
  # unaliased component (the overwhelming majority) resolves to itself exactly as before.
  SPEC_COMPONENT_LOWER="$COMPONENT_LOWER"
  if [ -n "${COMPOUND_SPEC_ALIAS[$COMPONENT_LOWER]+set}" ]; then
    SPEC_COMPONENT_LOWER="${COMPOUND_SPEC_ALIAS[$COMPONENT_LOWER]}"
  fi
  ALIAS_NOTE=""
  if [ "$SPEC_COMPONENT_LOWER" != "$COMPONENT_LOWER" ]; then
    ALIAS_NOTE=" (compound alias: '${name}' -> '${SPEC_COMPONENT_LOWER}')"
  fi

  SPEC_PATH="${SPECS}${SPEC_COMPONENT_LOWER}.md"
  ALT_SPEC_PATH="${SPECS}${SPEC_COMPONENT_LOWER}-base.md"
  # NOT aliased — a retrofit addendum always names the exact component it retrofits.
  ADDENDUM_PATH="${RETROFITS}${COMPONENT_LOWER}.md"

  if blob_at_base "$SPEC_PATH"; then
    echo "Spec found for '${name}'${ALIAS_NOTE} at '${SPEC_PATH}' on base (${BASE_SHA}) — OK."
    continue
  fi
  if blob_at_base "$ALT_SPEC_PATH"; then
    echo "Spec found for '${name}'${ALIAS_NOTE} at '${ALT_SPEC_PATH}' (-base variant) on base (${BASE_SHA}) — OK."
    continue
  fi
  if blob_at_base "$ADDENDUM_PATH"; then
    # An addendum only ever covers a change to an EXISTING component. Any non-zero from the
    # predicate is treated as "not pre-existing", so this path cannot fail open.
    if component_exists_on_base "$tag" "$name"; then
      echo "Retrofit addendum found for '${name}' at '${ADDENDUM_PATH}' on base (${BASE_SHA}), and the component already exists there at its Layout-${tag} path — OK."
      continue
    fi
    echo "::error::A retrofit addendum '${ADDENDUM_PATH}' exists on base (${BASE_SHA}) for component '${name}', but '${name}' does NOT already exist on base at its Layout-${tag} path as production source. An addendum covers a visual-system change to an EXISTING component only — a new component must merge its spec (PR-1) at '${SPEC_PATH}' before its implementation pull request."
    FAILED=1
    continue
  fi

  echo "::error::No merged spec and no merged retrofit addendum found for component '${name}'. Expected one of '${SPEC_PATH}', '${ALT_SPEC_PATH}', or '${ADDENDUM_PATH}' on the base branch (${BASE_SHA}). Merge PR-1 first. A document added in THIS pull request does not count: the check reads the base branch, so the PR-1 document must already be merged."
  FAILED=1
done <<< "$NORMALIZED_LAYOUTS"

exit $FAILED
