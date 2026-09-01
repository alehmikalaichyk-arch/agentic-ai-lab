#!/usr/bin/env bash
# =============================================================================
# DS Pipeline Kit — release verification
# =============================================================================
# Run from the kit root:  ./verify.sh
#
# Exit 0 only when every check passes. Anything else means the kit is not
# releasable. Run this before tagging, and after any edit to a skill name.
# =============================================================================
set -uo pipefail
cd "$(dirname "$0")"

FAIL=0
pass() { printf '  \033[32mPASS\033[0m  %s\n' "$1"; }
fail() { printf '  \033[31mFAIL\033[0m  %s\n' "$1"; FAIL=1; }
section() { printf '\n\033[1m%s\033[0m\n' "$1"; }

# `docs` and `build` are scanned too. They were not, and that was a hole: build/ holds the
# generated rule file that gets COPIED INTO the target repository, so anything left in it
# travels further than the plugin does. Two real GitHub logins survived there for exactly
# that reason. `port.py` and this file are excluded deliberately — they legitimately name
# the source, and port.py is not part of the released kit.
SCAN=(plugin repo-enforcement examples templates docs build ds-kit.config.yml README.md INSTALL.md QUICKSTART.md)
EXISTING=()
for p in "${SCAN[@]}"; do [ -e "$p" ] && EXISTING+=("$p"); done

# -----------------------------------------------------------------------------
section "1. De-identification — every one of these must be zero"
# -----------------------------------------------------------------------------
# Patterns are held in an array rather than a single alternation so a failure
# names which one hit. `grep -rIl` skips binaries; --exclude keeps the tooling
# that must legitimately mention the source out of the scan.
# Scanning goes through tools/scan.py, never grep: a bracket range like [Ѐ-ӿ]
# is resolved by LOCALE COLLATION in grep, not by code point, so an em dash
# lands inside it. See tools/scan.py for the measurement.
check_absent() {
  local label="$1" pattern="$2" out
  if out=$(python3 tools/scan.py "$label" "$pattern" "${EXISTING[@]}" 2>&1); then
    pass "$label"
  else
    fail "$label — $(printf '%s\n' "$out" | wc -l | tr -d ' ') hit(s)"
    printf '%s\n' "$out" | sed -n '1,5p' | sed 's/^/          /'
  fi
}

# The organisation-specific patterns live in a file, not in this script.
#
# Two reasons, and the second is the one that bites. First, they are the one thing
# here that cannot be generic: your organisation's name is not the one this kit was
# extracted from. Second — and this is why the file is gitignored — a hardcoded
# `[Pp][Ee][Gg][Bb][Oo]` in a script that ships PUBLICLY announces the very name the
# rest of the kit spent an extraction removing. The check for a brand must not be
# the thing that publishes it.
#
# Format: one extended-regex per line, `#` comments and blank lines ignored.
# Copy .de-identification.example and edit. Without the file, these checks are
# reported as SKIPPED — loudly, never silently passed.
IDENTITY_FILE="${KIT_IDENTITY_FILE:-.de-identification}"
if [ -f "$IDENTITY_FILE" ]; then
  while IFS= read -r line; do
    case "$line" in ''|'#'*) continue ;; esac
    label="${line%%|*}"; pattern="${line#*|}"
    check_absent "$label" "$pattern"
  done < "$IDENTITY_FILE"
else
  printf '  \033[33mSKIP\033[0m  organisation-specific patterns — no %s\n' "$IDENTITY_FILE"
  printf '        Copy .de-identification.example and edit it. Until you do, this section\n'
  printf '        checks NOTHING about your own identifiers.\n'
fi

# Stack-independent checks. These do not name any organisation.
check_absent "no non-ASCII identifiers" '[\u0400-\u04FF\u0590-\u05FF\u0900-\u097F]'
# `user` and `you` are the conventional placeholders in an example path and are
# excluded, so the check flags a REAL account name rather than a documented one.
check_absent "no absolute home paths"   '/(?:Users|home)/(?!user/|you/|example/)[a-z][a-z0-9._-]*/'
# Personal identifiers are the one class the brand pattern cannot catch: a GitHub login is
# not the organisation name and does not look like a ticket key. Two survived the first
# extraction, inside a paragraph about an allow-list. A backticked token containing a
# hyphen and no space is the shape they take; the alternation lists the ones that leaked
# plus the generic forms, and any new one is added here the moment it is found.
check_absent "no personal identifiers" '[a-z]{4,}-arch\b|sbarinov|mikalaichyk|@[a-z]+\.[a-z]+@|/Users/[a-z]+/'
# A rule that names an enforcer this kit does not ship reads as governed and is not. These
# are the two the extraction inherited; the fix is to say "not shipped", not to delete the
# convention.
check_absent "no reference to unshipped enforcers" 'spec-contract-drift\.test\.ts|docs/spec-contract-schema\.md'

# -----------------------------------------------------------------------------
section "2. Scope — content that must not have survived"
# -----------------------------------------------------------------------------
check_absent "no submodule / PR-3 model"  '\bsubmodule\b|pointer bump|\bPR-3\b'
check_absent "no sweep exemption machinery" 'cross-cutting-sweep|check-sweep-exemption|route-exemption-status'
check_absent "no coverage gate"           'coverage_gate|coverage_normalize'

# -----------------------------------------------------------------------------
section "3. Cross-reference integrity between skills"
# -----------------------------------------------------------------------------
# A renamed skill breaks the preflight chain SILENTLY: the skill still runs, it
# simply never finds what it is told to read first. Nothing else in the kit
# detects this, which is why it is checked by name, both directions.
SKILL_DIR=plugin/skills
if [ -d "$SKILL_DIR" ]; then
  ON_DISK=$(find "$SKILL_DIR" -mindepth 1 -maxdepth 1 -type d -exec basename {} \; | sort)

  # 3a. every referenced skill name exists on disk.
  # A skill renamed during extraction and missed in one file used to be caught by
  # listing its OLD name here. That list named the source organisation, so it moved
  # to .de-identification instead — see the "legacy skill names" line there.
  REFERENCED=$(grep -rhoE '\b(ds-context|ds-governance|token-guardian|component-requirements-builder|component-spec-writer|component-implementation|storybook-stories-generator|a11y-interaction-review|production-quality-gate|figma-component-builder|figma-to-code-audit|interface-ds-audit|screen-composition-review|screen-token-mapping|remediation-planner)\b' \
      "$SKILL_DIR" plugin/agents plugin/rules 2>/dev/null | sort -u)
  DANGLING=$(comm -13 <(printf '%s\n' "$ON_DISK") <(printf '%s\n' "$REFERENCED"))
  if [ -n "$DANGLING" ]; then
    fail "references to skills that are not in this kit:"
    printf '%s\n' "$DANGLING" | sed 's/^/          /'
  else
    pass "every referenced skill name resolves to a directory"
  fi

  # 3b. directory name matches the `name:` in its own frontmatter
  MISMATCH=0
  while read -r d; do
    declared=$(awk '/^name:/{print $2; exit}' "$SKILL_DIR/$d/SKILL.md" 2>/dev/null)
    if [ "$declared" != "$d" ]; then
      fail "skill directory '$d' declares name '$declared'"
      MISMATCH=1
    fi
  done <<< "$ON_DISK"
  [ "$MISMATCH" -eq 0 ] && pass "every skill's directory name matches its frontmatter name"

  # 3c. each skill's hard preflight names a skill that ships here
  for s in component-spec-writer component-implementation storybook-stories-generator \
           a11y-interaction-review production-quality-gate; do
    [ -f "$SKILL_DIR/$s/SKILL.md" ] || continue
    if ! grep -qE 'ds-context|ds-governance|component-spec-writer|component-implementation' \
           "$SKILL_DIR/$s/SKILL.md"; then
      fail "$s names no upstream skill — preflight chain broken"
    fi
  done
  pass "downstream skills still name their upstream dependencies"
else
  fail "plugin/skills/ not found"
fi

# -----------------------------------------------------------------------------
section "4. Packaging"
# -----------------------------------------------------------------------------
for f in plugin/.claude-plugin/plugin.json .claude-plugin/marketplace.json \
         ds-kit.config.yml README.md INSTALL.md; do
  [ -f "$f" ] && pass "present: $f" || fail "missing: $f"
done

# The manifest has to be INSTALLABLE and COMPLETE, which are two different failures.
#
# `agents` is the trap, and it fails in both directions. As a directory string
# (`"./agents/"`, symmetrical with `skills`) the manifest does not validate at all,
# so `claude plugin install` — the command the README gives — refuses it. As a list
# of files it validates AND installs, and the agent silently does not load: the
# installed plugin reports Agents (0). The key that works is no key: agents/ is
# auto-discovered, and declaring it suppresses that.
#
# Measured by installing each form and reading `claude plugin details`. Checked with
# the CLI where available and structurally otherwise, so it cannot regress on a
# machine without one.
if [ -f plugin/.claude-plugin/plugin.json ]; then
  if command -v claude >/dev/null 2>&1; then
    if claude plugin validate plugin >/dev/null 2>&1 \
       && ! python3 -c "
import json, sys
sys.exit(0 if 'agents' in json.load(open('plugin/.claude-plugin/plugin.json')) else 1)"; then
      pass "plugin manifest validates, and leaves agents/ to auto-discovery"
    else
      fail "plugin manifest does NOT validate — 'claude plugin install' will refuse it"
      claude plugin validate plugin 2>&1 | sed -n '2,6p' | sed 's/^/          /'
    fi
  else
    python3 -c "
import json, sys
d = json.load(open('plugin/.claude-plugin/plugin.json'))
sys.exit(1 if 'agents' in d else 0)" \
      && pass "plugin manifest omits 'agents' so agents/ is auto-discovered (CLI absent)" \
      || fail "plugin.json must NOT declare 'agents' — declaring it suppresses auto-discovery and the agent silently does not load"
  fi
fi

if [ -f plugin/.claude-plugin/plugin.json ]; then
  python3 -c "import json,sys; d=json.load(open('plugin/.claude-plugin/plugin.json'));
sys.exit(0 if d.get('name') and d.get('version') else 1)" \
    && pass "plugin.json declares name and version" \
    || fail "plugin.json missing name or version (updates will not propagate without version)"
fi

if [ -f .claude-plugin/marketplace.json ] && [ -f plugin/.claude-plugin/plugin.json ]; then
  python3 - <<'PY' && pass "marketplace.json and plugin.json agree on name and version" || fail "marketplace.json and plugin.json disagree"
import json, sys
m = json.load(open('.claude-plugin/marketplace.json'))
p = json.load(open('plugin/.claude-plugin/plugin.json'))
e = next((x for x in m.get('plugins', []) if x.get('name') == p.get('name')), None)
sys.exit(0 if e and e.get('version') == p.get('version') else 1)
PY
fi

# -----------------------------------------------------------------------------
section "5. Level boundaries — each level must be self-contained"
# -----------------------------------------------------------------------------
for lvl in 1 2 3; do
  [ -f "docs/level-$lvl.md" ] && pass "Level $lvl README present" || fail "docs/level-$lvl.md missing"
done
# The L1 honesty statement is load-bearing: it is the one sentence that stops a
# reader assuming an unenforced process is an enforced one.
if [ -f docs/level-1.md ] && grep -qi "nothing enforces it" docs/level-1.md; then
  pass "Level 1 states plainly that nothing enforces the process"
else
  fail "Level 1 must state that nothing enforces the process"
fi

# -----------------------------------------------------------------------------
printf '\n'
if [ "$FAIL" -eq 0 ]; then
  printf '\033[32mALL CHECKS PASSED — kit is releasable.\033[0m\n'
else
  printf '\033[31mVERIFICATION FAILED — do not release.\033[0m\n'
fi
exit "$FAIL"
