#!/usr/bin/env bash
# =============================================================================
# check-document-on-base.test.sh
# =============================================================================
# Builds a throwaway git repository, commits a base tree, and runs the gate
# against it. Everything the gate reads — the spec, the component source, the
# alias table — is read at BASE_SHA, so a fixture is a commit, not a directory.
#
# Run:  ./repo-enforcement/tools/check-document-on-base.test.sh
# =============================================================================
set -uo pipefail

GATE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/check-document-on-base.sh"
PASS=0; FAIL=0

pass() { printf '  \033[32mPASS\033[0m  %s\n' "$1"; PASS=$((PASS+1)); }
fail() { printf '  \033[31mFAIL\033[0m  %s\n' "$1"; FAIL=$((FAIL+1)); }

# expect <exit-code> <label> <base-sha> <names> <layouts>
expect() {
  local want="$1" label="$2" base="$3" names="$4" layouts="$5" out got
  out=$(BASE_SHA="$base" REAL_COMPONENTS="$names" REAL_COMPONENT_LAYOUTS="$layouts" \
        bash "$GATE" 2>&1); got=$?
  if [ "$got" -eq "$want" ]; then
    pass "$label"
  else
    fail "$label (want exit $want, got $got)"
    printf '%s\n' "$out" | sed 's/^/          /'
  fi
}

TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
cd "$TMP" || exit 1
git init -q .
git config user.email test@example.invalid
git config user.name "gate test"

mkdir -p docs/component-specs src/components/ui
echo '# page-shell spec'          > docs/component-specs/page-shell.md
echo 'export const PageShell = 1' > src/components/ui/page-shell.tsx
printf '{\n  "page-shell-header": "page-shell"\n}\n' > compound-spec-alias.json
cat > ds-kit.config.yml <<'YML'
paths:
  specs: "docs/component-specs/"
  retrofits: "docs/component-retrofits/"
  components_ui: "src/components/ui/"
  components_composite: "src/components/"
YML
git add -A && git commit -qm base
BASE=$(git rev-parse HEAD)
export DS_KIT_CONFIG="$TMP/ds-kit.config.yml"

printf '\n\033[1mCompound-component alias\033[0m\n'

expect 0 "secondary member resolves to the primary component's spec" \
       "$BASE" "page-shell-header" "A:page-shell-header"

expect 1 "a component with no document at all still fails" \
       "$BASE" "brand-new" "A:brand-new"

# The reason the table is read at BASE_SHA rather than from the checkout. Without
# it, a PR shipping both a new component and its own alias entry would grant
# itself another component's spec.
printf '{\n  "page-shell-header": "page-shell",\n  "brand-new": "page-shell"\n}\n' \
  > compound-spec-alias.json
expect 1 "a same-PR alias edit cannot manufacture spec coverage" \
       "$BASE" "brand-new" "A:brand-new"
git checkout -q compound-spec-alias.json

# The table is explicit, not a suffix rule: a sibling that merely looks like a
# compound member is untouched by it.
expect 1 "an unlisted sibling sharing a name prefix is not collapsed" \
       "$BASE" "page-shell-footer" "A:page-shell-footer"

printf '\n\033[1mTable absent or unusable\033[0m\n'

git rm -q --cached compound-spec-alias.json && rm -f compound-spec-alias.json
git commit -qm 'base without an alias table'
expect 0 "a base predating the table behaves exactly as before" \
       "$(git rev-parse HEAD)" "page-shell" "A:page-shell"

printf 'not json at all' > compound-spec-alias.json
git add -A && git commit -qm 'malformed table'
expect 1 "a malformed table fails closed rather than emptying silently" \
       "$(git rev-parse HEAD)" "page-shell" "A:page-shell"

printf '{"page-shell":"page-shell"}' > compound-spec-alias.json
git add -A && git commit -qm 'self-alias'
expect 1 "a self-aliasing entry is rejected" \
       "$(git rev-parse HEAD)" "page-shell" "A:page-shell"

printf '{"page-shell-header":"../../etc/passwd"}' > compound-spec-alias.json
git add -A && git commit -qm 'path fragment'
expect 1 "a value that is not a component name is rejected" \
       "$(git rev-parse HEAD)" "page-shell-header" "A:page-shell-header"

printf '\nTests: %d passed, %d failed\n' "$PASS" "$FAIL"
[ "$FAIL" -eq 0 ]
