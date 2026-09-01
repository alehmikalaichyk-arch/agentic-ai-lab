#!/usr/bin/env bash
# classify-pr-diff.sh
#
# Classifies the PR diff into one of four categories:
#   COMPONENT_SOURCE — PR changes only component source files under src/components/**
#   SPEC_ONLY        — PR changes only PR-1 documents (see below), no component source
#   MIXED            — PR changes both a PR-1 document and component source
#   NONE             — PR changes neither (tokens-only, infra, stories, lib, root files)
#
# A "PR-1 document" is either of the two documents that must be merged BEFORE a component's
# implementation PR, and must never travel in the same PR as that component's source:
#
#   docs/component-specs/**      — a frozen spec (the new-component pipeline)
#   docs/component-retrofits/**  — a retrofit migration addendum (the path for a mechanical
#                                  change to a single EXISTING spec-less component)
#
# They are alternatives, not a hierarchy — see "Precedence" in the monorepo rule
# .claude/rules/ds-component-pipeline.md — so both sit on the PR-1 side of the boundary and
# both set the same flag.
#
# The OUTPUT value stays `SPEC_ONLY` rather than becoming `PR1_DOC_ONLY`. It is a published
# contract consumed by .github/workflows/ds-pr-gates.yml and by the gate tests; renaming it
# would touch three files to buy nothing this comment does not already give.
#
# Usage (called by CI jobs):
#   BASE_SHA="${{ github.event.pull_request.base.sha }}" \
#   HEAD_SHA="${{ github.event.pull_request.head.sha }}" \
#   tools/classify-pr-diff.sh
#
# Output:
#   stdout:                one of COMPONENT_SOURCE | SPEC_ONLY | MIXED | NONE
#   $GITHUB_OUTPUT:        classification=<value>
#                          components=<comma-separated component names>
#                          real_components=<comma-separated non-artifact component names>
#                          real_component_layouts=<comma-separated "<tag>:<name>" pairs;
#                                                  tag A=ui bucket, B=composite dir, C=flat file>
#
# Exit codes:
#   0  — classification complete (including NONE — non-component PRs are always a no-op)
#   1  — BASE_SHA is unset or empty (misconfigured CI)
#
# Requirements:
#   - BASE_SHA env var must be set to github.event.pull_request.base.sha
#   - HEAD_SHA env var should be set to github.event.pull_request.head.sha
#       This is optional and falls back to HEAD when unset.
#       IMPORTANT: on a pull_request event, actions/checkout@v4 checks out the
#       merge ref (refs/pull/N/merge = base ∪ PR head), not the PR head commit.
#       If HEAD_SHA is omitted, git diff will compare BASE_SHA against the merge
#       ref, capturing every change that main accumulated since the branch was cut
#       — not just the PR's own changes.  Always set HEAD_SHA in CI.
#   - Repository must be checked out with fetch-depth: 0 so git diff can reach BASE_SHA
#
# Component name extraction rules (by path pattern):
#
#   src/components/ui/<name>.tsx          → component name = <name> (shadcn canonical layout)
#   src/components/<dir>/<anything>       → component name = <dir> (composite component dir)
#   src/components/<name>.{tsx,ts}        → component name = <name> (flat component, no subdir)
#                                            EXCLUDING index.ts / index.tsx barrel files
#
# In all cases .test and .stories suffixes are stripped from the basename before use
# (button.test.tsx → button, button.stories.tsx → button).

set -euo pipefail

# ── Configuration surface ─────────────────────────────────────────────────────
# Path prefixes come from ds-kit.config.yml so the kit keeps ONE place to edit.
# They are interpolated into regular expressions below, so each is escaped first:
# an unescaped "." in a configured path would match any character and silently
# widen the classifier — the one component in this kit whose over-matching would
# make every gate downstream wrong.
CLASSIFY_CFG="${DS_KIT_CONFIG:-$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/../../ds-kit.config.yml}"
_read_key() {
  sed -n "s/^[[:space:]]*$1:[[:space:]]*\"\{0,1\}\([^\"#]*\)\"\{0,1\}[[:space:]]*$/\1/p" \
    "$CLASSIFY_CFG" 2>/dev/null | head -1 | sed 's/[[:space:]]*$//'
}
_rx() { printf '%s' "$1" | sed 's/[.[\*^$()+?{}|]/\\&/g'; }

CFG_UI=$(_read_key components_ui);          CFG_UI="${CFG_UI:-src/components/ui/}"
CFG_CO=$(_read_key components_composite);   CFG_CO="${CFG_CO:-src/components/}"
CFG_SPECS=$(_read_key specs);               CFG_SPECS="${CFG_SPECS:-docs/component-specs/}"
CFG_RETRO=$(_read_key retrofits);           CFG_RETRO="${CFG_RETRO:-docs/component-retrofits/}"
RX_UI=$(_rx "${CFG_UI%/}/"); RX_CO=$(_rx "${CFG_CO%/}/")
RX_SPECS=$(_rx "${CFG_SPECS%/}/"); RX_RETRO=$(_rx "${CFG_RETRO%/}/")
# ── End configuration surface ─────────────────────────────────────────────────

# ---------------------------------------------------------------------------
# Validate required environment variable
# ---------------------------------------------------------------------------
if [ -z "${BASE_SHA:-}" ]; then
  echo "Error: BASE_SHA must be set to github.event.pull_request.base.sha" >&2
  echo "       Set BASE_SHA from the pull_request event context: github.event.pull_request.base.sha" >&2
  exit 1
fi

# ---------------------------------------------------------------------------
# Collect changed files between base SHA and HEAD
# Three-dot diff (merge-base anchored): shows only files changed on the PR branch
# since it diverged from BASE_SHA. This excludes files that were added or modified
# on main AFTER the branch was cut (e.g. spec files from unrelated merged PRs), which
# would otherwise appear as "deleted" in a two-dot diff and incorrectly set HAS_PR1_DOC=1.
# fetch-depth: 0 is required in CI so the merge base is reachable (all three jobs
# in ds-pr-gates.yml use fetch-depth: 0).
# ---------------------------------------------------------------------------
CHANGED_FILES=$(git diff --name-only "$BASE_SHA"..."${HEAD_SHA:-HEAD}")

# ---------------------------------------------------------------------------
# Helper: strip .test / .stories suffix and file extension from a basename
#   button.test.tsx      → button
#   button.stories.tsx   → button
#   button.tsx           → button
#   global-header.tsx    → global-header
# ---------------------------------------------------------------------------
strip_suffix() {
  local base="$1"
  # Remove file extension (.tsx / .ts / .css / .js)
  base="${base%.*}"
  # Remove .test / .spec / .stories suffix if present.
  # This ensures snapshot basenames like button.test.tsx.snap and button.spec.tsx.snap
  # both normalize to component name "button" after strip_suffix.
  base="${base%.test}"
  base="${base%.spec}"
  base="${base%.stories}"
  echo "$base"
}

# ---------------------------------------------------------------------------
# Classify each changed file
# ---------------------------------------------------------------------------
HAS_COMPONENT_SOURCE=0  # files under src/components/...
HAS_PR1_DOC=0           # files under docs/component-specs/ or docs/component-retrofits/
COMPONENT_NAMES=""      # unique component names (comma-separated, snapshots included)
REAL_COMPONENT_NAMES="" # non-snapshot component names only (consumed by the document-on-base gate)
# Layout-qualified real components: "<tag>:<name>" pairs (A=ui bucket, B=composite dir,
# C=flat file), one per real component, deduped by name. Consumed by the document-on-base
# base-existence guard so it verifies each component at its EXACT layout path — a same-name
# component in a different layout on base cannot masquerade a new component as pre-existing.
REAL_COMPONENT_LAYOUTS=""

while IFS= read -r file; do
  [ -z "$file" ] && continue

  # PR-1 documents: a frozen spec, or a retrofit migration addendum. Both must be merged
  # before the implementation PR, so both are on the PR-1 side of the spec/impl boundary.
  #
  # The addendum path was NOT matched here originally, and that was a real hole (an earlier change): a
  # PR carrying docs/component-retrofits/<n>.md alongside src/components/ui/<n>.tsx classified
  # COMPONENT_SOURCE rather than MIXED, so enforce-spec-pr-separation never fired — and
  # require-frozen-spec-on-base passed it, because that gate only checks the addendum is
  # PRESENT on base, never that the PR leaves it alone. An already-merged addendum could
  # therefore be rewritten inside the implementation PR with no gate objecting, while the
  # byte-identical shape with a frozen spec was blocked. The asymmetry is the bug.
  #
  # This does NOT weaken the first-addendum case: an addendum added in the same PR as the
  # source is now MIXED and fails at Job 1 instead of Job 3. Two different gates, both closed.
  if echo "$file" | grep -qE "^(${RX_SPECS}|${RX_RETRO})"; then
    HAS_PR1_DOC=1
    continue
  fi

  # ---------------------------------------------------------------------------
  # Component source files — three supported layouts:
  #
  # Layout A (shadcn canonical): src/components/ui/<name>.{tsx,ts,css,js,...}
  #   The shared bucket "ui" is NOT the component name.
  #   Component name = basename of the file (minus extension and .test/.stories).
  #
  # Layout B (composite subdir): src/components/<dir>/<anything>
  #   Where <dir> is NOT "ui" — it IS the component name.
  #
  # Layout C (flat file): src/components/<name>.{tsx,ts}  (no subdir)
  #   Barrel files (index.ts / index.tsx) are excluded — they are not components.
  #   Component name = basename of the file (minus extension).
  # ---------------------------------------------------------------------------

  component=""
  # IS_ARTIFACT=1 marks non-implementation files: snapshots, test files, spec files, stories.
  # These are excluded from REAL_COMPONENT_NAMES so a PR touching only artifacts cannot
  # bypass the document-on-base gate — the gate requires at least one real impl change.
  IS_ARTIFACT=0

  # Layout A: src/components/ui/<file>
  if echo "$file" | grep -qE "^${RX_UI}[^/]+$"; then
    filename=$(basename "$file")
    component=$(strip_suffix "$filename")
    # Test, spec, and stories files are artifacts — not implementation source.
    if echo "$filename" | grep -qE '\.(test|spec)\.(tsx|ts)$|\.stories\.(tsx|ts)$'; then
      IS_ARTIFACT=1
    fi

  # Layout A+snap: src/components/ui/__snapshots__/<name>.test.tsx.snap
  # Snapshot files are generated artifacts for Layout-A components. Map each
  # snapshot back to the component it covers by stripping the .snap extension
  # and then applying the same strip_suffix logic as Layout A.
  # Without this, these files fall through the ui-skip in Layout B and are
  # silently classified as NONE, creating a governance blind spot.
  elif echo "$file" | grep -qE "^${RX_UI}__snapshots__/[^/]+\.snap$"; then
    snap_base=$(basename "$file" .snap)  # e.g. button.test.tsx
    component=$(strip_suffix "$snap_base")
    IS_ARTIFACT=1

  # Layout B: src/components/<dir>/<anything> where <dir> != ui
  elif echo "$file" | grep -qE "^${RX_CO}[^/]+/"; then
    _dir=$(echo "$file" | sed 's|^src/components/\([^/]*\)/.*|\1|')
    # "ui" is the shadcn canonical container, not a component name.
    # Nested files (e.g. __snapshots__) are support files for Layout-A components.
    if [ "$_dir" != "ui" ]; then
      component="$_dir"
      # Test, spec, stories and snap files under a composite subdir are artifacts.
      filename=$(basename "$file")
      if echo "$filename" | grep -qE '\.(test|spec)\.(tsx|ts)$|\.stories\.(tsx|ts)$|\.snap$'; then
        IS_ARTIFACT=1
      fi
    fi

  # Layout C: src/components/<name>.{tsx,ts} flat file (no subdir)
  elif echo "$file" | grep -qE "^${RX_CO}[^/]+\.(tsx|ts)$"; then
    filename=$(basename "$file")
    # Exclude barrel files
    if [ "$filename" = "index.ts" ] || [ "$filename" = "index.tsx" ]; then
      continue
    fi
    component=$(strip_suffix "$filename")
    # Test, spec, and stories files are artifacts.
    if echo "$filename" | grep -qE '\.(test|spec)\.(tsx|ts)$|\.stories\.(tsx|ts)$'; then
      IS_ARTIFACT=1
    fi
  fi

  # If none of the layouts matched, this file is not a component source file.
  [ -z "$component" ] && continue

  # Derive the layout tag from the matched path shape so the document-on-base
  # existence guard can verify each component at its EXACT layout path on base, rather
  # than probing every layout by name (a same-name component in a different layout on
  # base could otherwise make a genuinely new component look pre-existing).
  #   A = src/components/ui/<name>.*   B = src/components/<dir>/...   C = src/components/<name>.*
  if echo "$file" | grep -qE "^${RX_UI}"; then
    layout_tag="A"
  elif echo "$file" | grep -qE "^${RX_CO}[^/]+/"; then
    layout_tag="B"
  else
    layout_tag="C"
  fi

  # Safe-name guard: the component name is derived from a filename, and git permits commas
  # and colons in filenames — characters that would corrupt the comma/colon CSV contracts
  # (components / real_components / real_component_layouts) consumed downstream. Substituting
  # a shared sentinel is NOT safe: two distinct unsafe names would collapse to one, breaking
  # the one-component-per-pr COUNT, and could alias a real spec/component. An unsafe filename
  # in a component path is anomalous, so fail the WHOLE classifier CLOSED — emit an error and
  # exit non-zero BEFORE any GITHUB_OUTPUT is written. Every gate job runs the classifier, so
  # a non-zero exit blocks the PR until the file is renamed to a plain safe token. (The loop
  # uses a here-string, so this exit terminates the script, not a subshell.)
  if ! echo "$component" | grep -qE '^[A-Za-z0-9][A-Za-z0-9_-]*$'; then
    echo "::error::Component name derived from '$file' is not a safe token (got '$component'). Filenames with commas, colons, or characters outside [A-Za-z0-9_-] are not supported — they corrupt the gate's CSV contracts. Rename the file to a plain kebab/alnum component name." >&2
    exit 1
  fi

  HAS_COMPONENT_SOURCE=1

  # Accumulate unique component names (case-sensitive; spec lookup lowercases separately)
  if ! echo ",$COMPONENT_NAMES," | grep -q ",$component,"; then
    if [ -z "$COMPONENT_NAMES" ]; then
      COMPONENT_NAMES="$component"
    else
      COMPONENT_NAMES="$COMPONENT_NAMES,$component"
    fi
  fi

  # Accumulate non-artifact component names separately.
  # REAL_COMPONENT_NAMES is used by the document-on-base gate to require at
  # least one real implementation change — PRs touching only snapshots, test files,
  # or stories must not bypass the one-component-per-PR enforcement via the label.
  if [ "$IS_ARTIFACT" -eq 0 ]; then
    # REAL_COMPONENT_NAMES: dedupe by NAME.
    if ! echo ",$REAL_COMPONENT_NAMES," | grep -q ",$component,"; then
      if [ -z "$REAL_COMPONENT_NAMES" ]; then
        REAL_COMPONENT_NAMES="$component"
      else
        REAL_COMPONENT_NAMES="$REAL_COMPONENT_NAMES,$component"
      fi
    fi

    # REAL_COMPONENT_LAYOUTS: dedupe by the full "<tag>:<name>" PAIR, independently of
    # the name-level dedup above. A component that appears in two layouts (e.g. an
    # existing B:foo AND a new A:foo in the same PR) must record BOTH pairs — otherwise
    # the name dedup would drop the second layout and the existence guard would never
    # check the new layout path, reopening the cross-layout bypass.
    _pair="${layout_tag}:${component}"
    if ! echo ",$REAL_COMPONENT_LAYOUTS," | grep -q ",$_pair,"; then
      if [ -z "$REAL_COMPONENT_LAYOUTS" ]; then
        REAL_COMPONENT_LAYOUTS="$_pair"
      else
        REAL_COMPONENT_LAYOUTS="$REAL_COMPONENT_LAYOUTS,$_pair"
      fi
    fi
  fi

done <<< "$CHANGED_FILES"

# ---------------------------------------------------------------------------
# Determine classification
# ---------------------------------------------------------------------------
if [ "$HAS_COMPONENT_SOURCE" -eq 1 ] && [ "$HAS_PR1_DOC" -eq 1 ]; then
  CLASSIFICATION="MIXED"
elif [ "$HAS_COMPONENT_SOURCE" -eq 1 ]; then
  CLASSIFICATION="COMPONENT_SOURCE"
elif [ "$HAS_PR1_DOC" -eq 1 ]; then
  CLASSIFICATION="SPEC_ONLY"
else
  CLASSIFICATION="NONE"
fi

# ---------------------------------------------------------------------------
# Emit outputs
# ---------------------------------------------------------------------------
echo "$CLASSIFICATION"

# Write to GITHUB_OUTPUT when running inside GitHub Actions
if [ -n "${GITHUB_OUTPUT:-}" ]; then
  echo "classification=$CLASSIFICATION" >> "$GITHUB_OUTPUT"
  echo "components=$COMPONENT_NAMES" >> "$GITHUB_OUTPUT"
  echo "real_components=$REAL_COMPONENT_NAMES" >> "$GITHUB_OUTPUT"
  echo "real_component_layouts=$REAL_COMPONENT_LAYOUTS" >> "$GITHUB_OUTPUT"
fi

# ---------------------------------------------------------------------------
# NONE classification — exit 0 immediately so non-component PRs are never blocked
# ---------------------------------------------------------------------------
# All classifications exit 0 — enforcement decisions are made by the consuming CI jobs,
# not by this classifier. The classifier's job is only to describe; never to block.
exit 0
