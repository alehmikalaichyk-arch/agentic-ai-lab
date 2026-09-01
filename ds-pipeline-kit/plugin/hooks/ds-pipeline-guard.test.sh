#!/bin/bash
# ds-pipeline-guard.test.sh — Self-tests for ds-pipeline-guard.sh
#
# Usage: bash .claude/scripts/__tests__/ds-pipeline-guard.test.sh
# Exit 0 = all tests passed. Exit 1 = ≥1 failure.
#
# Tests are self-contained: no network, no real git, no external services.
# Branch name is controlled via a fake git binary (PATH override) per test.

# The guard sits beside this test, not one level up.
# Use dirname, not ${BASH_SOURCE[0]%/*}: when the script is invoked by bare name
# (`bash ds-pipeline-guard.test.sh`) there is no slash to strip, so the parameter
# expansion returns the filename itself and the path becomes
# "ds-pipeline-guard.test.sh/ds-pipeline-guard.sh". dirname returns "." correctly.
GUARD="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/ds-pipeline-guard.sh"
PASS_COUNT=0
FAIL_COUNT=0

if [ ! -f "$GUARD" ]; then
  echo "ERROR: Guard script not found at: $GUARD" >&2
  exit 1
fi

# ── Helper: clean session file before each test ───────────────────────────────
# The guard uses DS_SESSION_FILE to track session state.
# In tests we control the PID isolation via a unique temp file override.

# Use a dedicated temp file per test group to avoid cross-test contamination.
# Must sit under the guard-owned prefix: the guard discards any DS_SESSION_FILE outside
# "${TMPDIR:-/tmp}/ds-pipeline-session-*" and re-derives its own, which would make every
# session-state test silently exercise a path the harness cannot inspect.
SESSION_FILE=$(mktemp /tmp/ds-pipeline-session-selftest.XXXXXX)   # /tmp literal: the guard's comparison root is fixed
trap 'rm -f "$SESSION_FILE"' EXIT

# Branch isolation for tests that assert behaviour "on a non-protected branch".
# Defined here rather than halfway down the file because five tests below said
# "non-protected branch" in their NAME and then read whatever branch the checkout
# happened to be on. Run the suite from a spec/* branch — which is exactly when the
# guard matters most, during PR-1 — and those five failed. A precondition stated in a
# test's name and not established in its body is not a precondition.
FAKE_BRANCH_DIR=""
make_fake_git() {
  FAKE_BRANCH_DIR=$(mktemp -d)
  cat > "$FAKE_BRANCH_DIR/git" <<FAKEGIT
#!/bin/bash
# an earlier change: skip a leading `-C <dir>` — the guard resolves git relative to the file.
if [ "\$1" = "-C" ]; then shift 2; fi
if [ "\$1" = "rev-parse" ] && [ "\$2" = "--abbrev-ref" ] && [ "\$3" = "HEAD" ]; then
  echo "$1"
  exit 0
fi
exec /usr/bin/git "\$@"
FAKEGIT
  chmod +x "$FAKE_BRANCH_DIR/git"
}
drop_fake_git() {
  [ -n "$FAKE_BRANCH_DIR" ] && rm -rf "$FAKE_BRANCH_DIR"
  FAKE_BRANCH_DIR=""
}

reset_session() {
  > "$SESSION_FILE"
}

# ── Wrapper that injects the session file path ─────────────────────────────────
run_guard() {
  # Replace the session file derivation by overriding DS_SESSION_FILE directly.
  DS_SESSION_FILE="$SESSION_FILE" bash "$GUARD" 2>/dev/null
}

# ── Test 1: Empty JSON input → fail-open (exit 0) ─────────────────────────────
reset_session
actual=$(printf '' | DS_SESSION_FILE="$SESSION_FILE" bash "$GUARD" 2>/dev/null; echo $?)
actual="${actual##*$'\n'}"
if [ "$actual" -eq 0 ]; then
  echo "PASS: Empty JSON input → fail-open (exit 0)"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "FAIL: Empty JSON input → fail-open (expected 0, got $actual)"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# ── Test 2: Malformed JSON input → fail-open (exit 0) ─────────────────────────
reset_session
actual=$(printf 'not json at all {{{' | DS_SESSION_FILE="$SESSION_FILE" bash "$GUARD" 2>/dev/null; echo $?)
actual="${actual##*$'\n'}"
if [ "$actual" -eq 0 ]; then
  echo "PASS: Malformed JSON → fail-open (exit 0)"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "FAIL: Malformed JSON → fail-open (expected 0, got $actual)"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# ── Test 3: JSON with no file_path field → fail-open (exit 0) ─────────────────
reset_session
actual=$(printf '{"tool": "Write", "content": "hello"}' | DS_SESSION_FILE="$SESSION_FILE" bash "$GUARD" 2>/dev/null; echo $?)
actual="${actual##*$'\n'}"
if [ "$actual" -eq 0 ]; then
  echo "PASS: JSON with no file_path → fail-open (exit 0)"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "FAIL: JSON with no file_path → fail-open (expected 0, got $actual)"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# ── Test 4: Non-DS file path → no blast radius (exit 0) ───────────────────────
reset_session
actual=$(printf '{"tool": "Write", "file_path": "services/user-service/Handler.java"}' | DS_SESSION_FILE="$SESSION_FILE" bash "$GUARD" 2>/dev/null; echo $?)
actual="${actual##*$'\n'}"
if [ "$actual" -eq 0 ]; then
  echo "PASS: Non-DS Java file → no blast radius (exit 0)"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "FAIL: Non-DS Java file → no blast radius (expected 0, got $actual)"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# ── Test 5: Spec-only write on a non-protected branch → allow (exit 0) ────────
# Simulates a legitimate PR-1 spec write.
reset_session
actual=$(printf '{"tool": "Write", "file_path": "docs/component-specs/button.md"}' | DS_SESSION_FILE="$SESSION_FILE" bash "$GUARD" 2>/dev/null; echo $?)
actual="${actual##*$'\n'}"
if [ "$actual" -eq 0 ]; then
  echo "PASS: Spec write on non-protected branch → allow (exit 0)"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "FAIL: Spec write on non-protected branch → allow (expected 0, got $actual)"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# ── Test 6: Component source write on a non-protected branch → allow (exit 0) ─
# No prior spec write in session. Branch = feature/button-impl (not protected).
reset_session
make_fake_git "feature/button-impl"
actual=$(printf '{"tool": "Write", "file_path": "src/components/ui/button.tsx"}' | PATH="$FAKE_BRANCH_DIR:$PATH" DS_SESSION_FILE="$SESSION_FILE" bash "$GUARD" 2>/dev/null; echo $?)
drop_fake_git
actual="${actual##*$'\n'}"
if [ "$actual" -eq 0 ]; then
  echo "PASS: Source write on non-protected branch, clean session → allow (exit 0)"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "FAIL: Source write on non-protected branch, clean session → allow (expected 0, got $actual)"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# ── Test 7a: Barrel file write (src/components/index.ts) → allow (exit 0) ─────
# Exact suffix match: this IS the barrel, should be excluded.
reset_session
actual=$(printf '{"tool": "Write", "file_path": "src/components/index.ts"}' | DS_SESSION_FILE="$SESSION_FILE" bash "$GUARD" 2>/dev/null; echo $?)
actual="${actual##*$'\n'}"
if [ "$actual" -eq 0 ]; then
  echo "PASS: Barrel file write (src/components/index.ts) → allow (exit 0)"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "FAIL: Barrel file write (src/components/index.ts) → allow (expected 0, got $actual)"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# ── Test 7b: Barrel file write (src/components/ui/index.ts) on spec/ → allow ──
# False-positive guard: this IS a barrel file, must NOT be blocked even on a spec/ branch.
FAKE_GIT=$(mktemp)
cat > "$FAKE_GIT" <<'FAKEGIT'
#!/bin/bash
# an earlier change: the guard now resolves git relative to the file (`git -C <dir> …`), so the
# branch query arrives with a leading `-C <dir>`. Skip it: these fakes answer for one
# branch regardless of checkout, which is what they were written to do.
if [ "$1" = "-C" ]; then shift 2; fi
if [ "$1" = "rev-parse" ] && [ "$2" = "--abbrev-ref" ] && [ "$3" = "HEAD" ]; then
  echo "spec/button-spec"
  exit 0
fi
exec /usr/bin/git "$@"
FAKEGIT
chmod +x "$FAKE_GIT"
FAKE_GIT_DIR=$(dirname "$FAKE_GIT")
FAKE_GIT_AS_GIT="$FAKE_GIT_DIR/git"
cp "$FAKE_GIT" "$FAKE_GIT_AS_GIT"
chmod +x "$FAKE_GIT_AS_GIT"

reset_session
actual=$(printf '{"tool": "Write", "file_path": "src/components/ui/index.ts"}' | PATH="$FAKE_GIT_DIR:$PATH" DS_SESSION_FILE="$SESSION_FILE" bash "$GUARD" 2>/dev/null; echo $?)
actual="${actual##*$'\n'}"
rm -f "$FAKE_GIT" "$FAKE_GIT_AS_GIT"

if [ "$actual" -eq 0 ]; then
  echo "PASS: Barrel file (src/components/ui/index.ts) on spec/ branch → allow (exit 0)"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "FAIL: Barrel file on spec/ branch → allow (expected 0, got $actual)"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# ── Test 7c: index-card/index-card.tsx on spec/ branch → block (exit 2) ───────
# False-negative guard: index-card is a real component, NOT a barrel, must be blocked.
FAKE_GIT=$(mktemp)
cat > "$FAKE_GIT" <<'FAKEGIT'
#!/bin/bash
# an earlier change: the guard now resolves git relative to the file (`git -C <dir> …`), so the
# branch query arrives with a leading `-C <dir>`. Skip it: these fakes answer for one
# branch regardless of checkout, which is what they were written to do.
if [ "$1" = "-C" ]; then shift 2; fi
if [ "$1" = "rev-parse" ] && [ "$2" = "--abbrev-ref" ] && [ "$3" = "HEAD" ]; then
  echo "spec/index-card-spec"
  exit 0
fi
exec /usr/bin/git "$@"
FAKEGIT
chmod +x "$FAKE_GIT"
FAKE_GIT_DIR=$(dirname "$FAKE_GIT")
FAKE_GIT_AS_GIT="$FAKE_GIT_DIR/git"
cp "$FAKE_GIT" "$FAKE_GIT_AS_GIT"
chmod +x "$FAKE_GIT_AS_GIT"

reset_session
actual=$(printf '{"tool": "Write", "file_path": "src/components/index-card/index-card.tsx"}' | PATH="$FAKE_GIT_DIR:$PATH" DS_SESSION_FILE="$SESSION_FILE" bash "$GUARD" 2>/dev/null; echo $?)
actual="${actual##*$'\n'}"
rm -f "$FAKE_GIT" "$FAKE_GIT_AS_GIT"

if [ "$actual" -eq 2 ]; then
  echo "PASS: index-card component on spec/ branch → block (exit 2) [was false-negative before barrel fix]"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "FAIL: index-card component on spec/ branch → block (expected 2, got $actual)"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# ── Test 8: Source write on spec/ protected branch → block (exit 2) ───────────
FAKE_GIT=$(mktemp)
cat > "$FAKE_GIT" <<'FAKEGIT'
#!/bin/bash
# an earlier change: the guard now resolves git relative to the file (`git -C <dir> …`), so the
# branch query arrives with a leading `-C <dir>`. Skip it: these fakes answer for one
# branch regardless of checkout, which is what they were written to do.
if [ "$1" = "-C" ]; then shift 2; fi
if [ "$1" = "rev-parse" ] && [ "$2" = "--abbrev-ref" ] && [ "$3" = "HEAD" ]; then
  echo "spec/checkbox-spec"
  exit 0
fi
exec /usr/bin/git "$@"
FAKEGIT
chmod +x "$FAKE_GIT"
FAKE_GIT_DIR=$(dirname "$FAKE_GIT")
FAKE_GIT_AS_GIT="$FAKE_GIT_DIR/git"
cp "$FAKE_GIT" "$FAKE_GIT_AS_GIT"
chmod +x "$FAKE_GIT_AS_GIT"

reset_session
actual=$(printf '{"tool": "Write", "file_path": "src/components/ui/checkbox.tsx"}' | PATH="$FAKE_GIT_DIR:$PATH" DS_SESSION_FILE="$SESSION_FILE" bash "$GUARD" 2>/dev/null; echo $?)
actual="${actual##*$'\n'}"
rm -f "$FAKE_GIT" "$FAKE_GIT_AS_GIT"

if [ "$actual" -eq 2 ]; then
  echo "PASS: Source write on spec/ branch → block (exit 2)"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "FAIL: Source write on spec/ branch → block (expected 2, got $actual)"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# ── Test 9: decomp/ branch + source write → block (exit 2) ────────────────────
FAKE_GIT=$(mktemp)
cat > "$FAKE_GIT" <<'FAKEGIT'
#!/bin/bash
# an earlier change: the guard now resolves git relative to the file (`git -C <dir> …`), so the
# branch query arrives with a leading `-C <dir>`. Skip it: these fakes answer for one
# branch regardless of checkout, which is what they were written to do.
if [ "$1" = "-C" ]; then shift 2; fi
if [ "$1" = "rev-parse" ] && [ "$2" = "--abbrev-ref" ] && [ "$3" = "HEAD" ]; then
  echo "decomp/1234-badge-v1"
  exit 0
fi
exec /usr/bin/git "$@"
FAKEGIT
chmod +x "$FAKE_GIT"
FAKE_GIT_DIR=$(dirname "$FAKE_GIT")
FAKE_GIT_AS_GIT="$FAKE_GIT_DIR/git"
cp "$FAKE_GIT" "$FAKE_GIT_AS_GIT"
chmod +x "$FAKE_GIT_AS_GIT"

reset_session
actual=$(printf '{"tool": "Write", "file_path": "src/components/badge/badge.tsx"}' | PATH="$FAKE_GIT_DIR:$PATH" DS_SESSION_FILE="$SESSION_FILE" bash "$GUARD" 2>/dev/null; echo $?)
actual="${actual##*$'\n'}"
rm -f "$FAKE_GIT" "$FAKE_GIT_AS_GIT"

if [ "$actual" -eq 2 ]; then
  echo "PASS: Source write on decomp/ branch → block (exit 2)"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "FAIL: Source write on decomp/ branch → block (expected 2, got $actual)"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# ── Test 10: research/ branch + source write → block (exit 2) ─────────────────
# Confirms research/ is a protected prefix (has its own test for completeness).
FAKE_GIT=$(mktemp)
cat > "$FAKE_GIT" <<'FAKEGIT'
#!/bin/bash
# an earlier change: the guard now resolves git relative to the file (`git -C <dir> …`), so the
# branch query arrives with a leading `-C <dir>`. Skip it: these fakes answer for one
# branch regardless of checkout, which is what they were written to do.
if [ "$1" = "-C" ]; then shift 2; fi
if [ "$1" = "rev-parse" ] && [ "$2" = "--abbrev-ref" ] && [ "$3" = "HEAD" ]; then
  echo "research/tooltip-exploration"
  exit 0
fi
exec /usr/bin/git "$@"
FAKEGIT
chmod +x "$FAKE_GIT"
FAKE_GIT_DIR=$(dirname "$FAKE_GIT")
FAKE_GIT_AS_GIT="$FAKE_GIT_DIR/git"
cp "$FAKE_GIT" "$FAKE_GIT_AS_GIT"
chmod +x "$FAKE_GIT_AS_GIT"

reset_session
actual=$(printf '{"tool": "Write", "file_path": "src/components/ui/tooltip.tsx"}' | PATH="$FAKE_GIT_DIR:$PATH" DS_SESSION_FILE="$SESSION_FILE" bash "$GUARD" 2>/dev/null; echo $?)
actual="${actual##*$'\n'}"
rm -f "$FAKE_GIT" "$FAKE_GIT_AS_GIT"

if [ "$actual" -eq 2 ]; then
  echo "PASS: Source write on research/ branch → block (exit 2)"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "FAIL: Source write on research/ branch → block (expected 2, got $actual)"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# ── Test 11: In-session spec then source for same component → block (exit 2) ──
# Step 1: write spec for "toggle" → records spec:toggle in session file.
reset_session
printf '{"tool": "Write", "file_path": "docs/component-specs/toggle.md"}' | DS_SESSION_FILE="$SESSION_FILE" bash "$GUARD" 2>/dev/null
# Step 2: write source for "toggle" → should be blocked.
actual=$(printf '{"tool": "Write", "file_path": "src/components/ui/toggle.tsx"}' | DS_SESSION_FILE="$SESSION_FILE" bash "$GUARD" 2>/dev/null; echo $?)
actual="${actual##*$'\n'}"
if [ "$actual" -eq 2 ]; then
  echo "PASS: In-session spec→source mixing (same component) → block (exit 2)"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "FAIL: In-session spec→source mixing → block (expected 2, got $actual)"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# ── Test 12: In-session source then spec for same component → block (exit 2) ──
reset_session
make_fake_git "feature/slider-impl"
printf '{"tool": "Write", "file_path": "src/components/ui/slider.tsx"}' | PATH="$FAKE_BRANCH_DIR:$PATH" DS_SESSION_FILE="$SESSION_FILE" bash "$GUARD" 2>/dev/null
actual=$(printf '{"tool": "Write", "file_path": "docs/component-specs/slider.md"}' | PATH="$FAKE_BRANCH_DIR:$PATH" DS_SESSION_FILE="$SESSION_FILE" bash "$GUARD" 2>/dev/null; echo $?)
drop_fake_git
actual="${actual##*$'\n'}"
if [ "$actual" -eq 2 ]; then
  echo "PASS: In-session source→spec mixing (same component) → block (exit 2)"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "FAIL: In-session source→spec mixing → block (expected 2, got $actual)"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# ── Test 13: In-session writes for DIFFERENT components → no cross-contamination
reset_session
# Write spec for "button"
make_fake_git "feature/checkbox-impl"
printf '{"tool": "Write", "file_path": "docs/component-specs/button.md"}' | PATH="$FAKE_BRANCH_DIR:$PATH" DS_SESSION_FILE="$SESSION_FILE" bash "$GUARD" 2>/dev/null
# Write source for "checkbox" (different component) → should be allowed
actual=$(printf '{"tool": "Write", "file_path": "src/components/ui/checkbox.tsx"}' | PATH="$FAKE_BRANCH_DIR:$PATH" DS_SESSION_FILE="$SESSION_FILE" bash "$GUARD" 2>/dev/null; echo $?)
drop_fake_git
actual="${actual##*$'\n'}"
if [ "$actual" -eq 0 ]; then
  echo "PASS: In-session spec for button + source for checkbox (different) → allow (exit 0)"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "FAIL: Different-component session writes → allow (expected 0, got $actual)"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# ── Test 14: BC2 fires across two real invocations without DS_SESSION_FILE ────
# This test verifies that BC2 actually works when the hook derives the session file
# from session_id (the production code path). Two invocations supply the SAME
# session_id — they must share state and BC2 must fire on the second call.
#
# Note: this test does NOT inject DS_SESSION_FILE. The guard derives the session
# file itself from the session_id field in the payload.
#
# BEFORE fix #1, this test failed because each invocation used $$ (new process PID)
# as the session-file suffix, so the second invocation never saw the first one's
# state. AFTER fix #1 it passes because session_id is a stable key shared by both.
FIXED_SESSION_ID="test-stable-session-bc2-$(date +%s)"
SESSION_FILE_DERIVED="${TMPDIR:-/tmp}/ds-pipeline-session-${FIXED_SESSION_ID}"
rm -f "$SESSION_FILE_DERIVED"

# First invocation: write spec for "modal" — records spec:modal
printf '{"tool":"Write","file_path":"docs/component-specs/modal.md","session_id":"%s"}' "$FIXED_SESSION_ID" \
  | bash "$GUARD" 2>/dev/null

# Second invocation: write source for "modal" in the same session — must be blocked
actual=$(printf '{"tool":"Write","file_path":"src/components/ui/modal.tsx","session_id":"%s"}' "$FIXED_SESSION_ID" \
  | bash "$GUARD" 2>/dev/null; echo $?)
actual="${actual##*$'\n'}"
rm -f "$SESSION_FILE_DERIVED"

if [ "$actual" -eq 2 ]; then
  echo "PASS: BC2 fires across two invocations keyed on session_id (no DS_SESSION_FILE injection) → block (exit 2)"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "FAIL: BC2 must fire when spec+source share session_id (expected 2, got $actual) — fix #1 may be missing"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# ═══════════════════════════════════════════════════════════════════════════════
# Visual-draft boundary 
#
# A visual draft lives in `component-prototypes/<c>/` at the design-tokens repo ROOT — NOT under
# `.storybook/`, which was measured to index but not load (see ds-component-pipeline.md). These
# fixtures use the real path so the test file does not advertise the broken one.
#
# They still assert ALLOWED, and that is correct: the guard has no knowledge of the draft directory
# at all. Its two conditions are scoped to `src/components/**` and the PR-1 document paths, so a
# draft is outside both by construction — which is the property this test exists to pin.
# a throwaway rendering the owner reviews BEFORE the spec is frozen. See
# `.claude/rules/ds-component-pipeline.md` → "Visual draft — between stage #4 and PR-1".
#
# The step relies on the guard treating that path as an ordinary file: neither blocking
# condition may fire on it. That is true today because both conditions are scoped to
# `src/components/**`, and a draft is not under it. These tests pin that down, so widening
# DS_SRC_PATTERN (or moving drafts under src/) fails HERE rather than silently blocking
# every future draft write mid-session.
#
# Tests 8 and 11 above are the control: the same two scenarios with a real
# `src/components/**` path DO block. Without them, the three tests below would still pass
# against a guard that had been broken into allowing everything.
#
# Verified by mutation: teaching the guard to classify a draft as component source AND to
# derive a component name from it fails all three below (exit 2 where 0 was expected). A
# half-mutation that classifies but derives no name does NOT fail them — the guard fail-opens
# on an underivable component name, so the observable behaviour is unchanged and there is
# nothing to catch. These tests assert behaviour, not internals; that is deliberate.
# ═══════════════════════════════════════════════════════════════════════════════

# ── Test 15: Draft write on a protected branch → allow (exit 0) ───────────────
# Blocking condition 1 (protected branch + component source). A draft is written on the
# spec branch by definition — it travels in PR-1 — so this is the everyday case, not an edge.
FAKE_GIT=$(mktemp)
cat > "$FAKE_GIT" <<'FAKEGIT'
#!/bin/bash
# an earlier change: the guard now resolves git relative to the file (`git -C <dir> …`), so the
# branch query arrives with a leading `-C <dir>`. Skip it: these fakes answer for one
# branch regardless of checkout, which is what they were written to do.
if [ "$1" = "-C" ]; then shift 2; fi
if [ "$1" = "rev-parse" ] && [ "$2" = "--abbrev-ref" ] && [ "$3" = "HEAD" ]; then
  echo "spec/chip-spec"
  exit 0
fi
exec /usr/bin/git "$@"
FAKEGIT
chmod +x "$FAKE_GIT"
FAKE_GIT_DIR=$(dirname "$FAKE_GIT")
FAKE_GIT_AS_GIT="$FAKE_GIT_DIR/git"
cp "$FAKE_GIT" "$FAKE_GIT_AS_GIT"
chmod +x "$FAKE_GIT_AS_GIT"

reset_session
actual=$(printf '{"tool": "Write", "file_path": "/repo/component-prototypes/chip/chip.stories.tsx"}' | PATH="$FAKE_GIT_DIR:$PATH" DS_SESSION_FILE="$SESSION_FILE" bash "$GUARD" 2>/dev/null; echo $?)
actual="${actual##*$'\n'}"
rm -f "$FAKE_GIT" "$FAKE_GIT_AS_GIT"

if [ "$actual" -eq 0 ]; then
  echo "PASS: Visual draft write on spec/ branch → allow (exit 0)"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "FAIL: Visual draft write on spec/ branch must be allowed (expected 0, got $actual) — the draft path is not src/components/**"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# ── Test 16: Spec then draft, same component, one session → allow (exit 0) ────
# Blocking condition 2 (in-session spec+source mixing). Writing the spec and then drafting
# the component is the intended stage #4 → #4.5 order; it must not read as spec+impl mixing.
reset_session
printf '{"tool": "Write", "file_path": "docs/component-specs/chip.md"}' | DS_SESSION_FILE="$SESSION_FILE" bash "$GUARD" > /dev/null 2>&1
actual=$(printf '{"tool": "Write", "file_path": "component-prototypes/chip/chip.stories.tsx"}' | DS_SESSION_FILE="$SESSION_FILE" bash "$GUARD" 2>/dev/null; echo $?)
actual="${actual##*$'\n'}"

if [ "$actual" -eq 0 ]; then
  echo "PASS: Spec then visual draft for the same component in one session → allow (exit 0)"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "FAIL: Spec then visual draft must be allowed (expected 0, got $actual) — a draft is not component source"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# ── Test 17: Draft then spec, same component, one session → allow (exit 0) ────
# The reverse order, because condition 2 is checked from both sides. This also proves the
# draft write left no `src:<component>` entry in the session file: if it had, the spec write
# that follows would be blocked.
reset_session
printf '{"tool": "Write", "file_path": "component-prototypes/chip/chip.stories.tsx"}' | DS_SESSION_FILE="$SESSION_FILE" bash "$GUARD" > /dev/null 2>&1
actual=$(printf '{"tool": "Write", "file_path": "docs/component-specs/chip.md"}' | DS_SESSION_FILE="$SESSION_FILE" bash "$GUARD" 2>/dev/null; echo $?)
actual="${actual##*$'\n'}"

if [ "$actual" -eq 0 ]; then
  echo "PASS: Visual draft then spec for the same component in one session → allow (exit 0)"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "FAIL: Visual draft then spec must be allowed (expected 0, got $actual) — the draft must not be recorded as source"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# ═══════════════════════════════════════════════════════════════════════════════
# Retrofit migration addendum (an earlier change / an earlier change)
#
# A retrofit addendum lives at `docs/component-retrofits/<c>.md` in the design-tokens repo and is
# the PR-1 document for an EXISTING component that has no frozen spec. See
# `.claude/rules/ds-component-pipeline.md` → "Existing Component Retrofit — the migration
# addendum". The guard treats it exactly as it treats a spec: a PR-1 document, on the far side of
# the PR-1/PR-2 boundary from component source.
#
# SCOPE — read this before adding a test that asserts an existence check.
# The guard does NOT check whether a spec or an addendum exists on disk, and never has. Its only
# two blocking conditions are (1) protected branch + source write and (2) in-session mixing of a
# PR-1 document and that component's source. Tests 6 and 24 both demonstrate the consequence: a
# source write for a component with no document of any kind is ALLOWED on a non-protected branch.
# That is deliberate — the hook has no PR label, PR body, or BASE_SHA, so it cannot see the
# multi-component-change exemption, and an existence-based block here would break every sweep. CI
# (an earlier change) binds both existence and pre-existence.
#
# Tests 19-22 are the load-bearing ones: each asserts a block that the guard did NOT perform
# before this change. Tests 23 and 25 are the over-blocking controls — without them, a guard that
# blocked every source write after any addendum write would still pass 19-22.
# ═══════════════════════════════════════════════════════════════════════════════

# ── Helper: pin the current branch for a single guard invocation ───────────────
# Tests below that expect exit 0 for a component SOURCE write must not depend on the branch the
# suite happens to run on: condition 1 would independently produce exit 2 on a spec/, decomp/, or
# research/ branch, turning a real regression into a green run or vice versa. This helper removes
# that ambient dependency. (Unlike the inline fake-git blocks above it uses its own temp DIR, so
# it never drops a `git` binary into the shared temp directory.)

# ── Test 18: Addendum write on a non-protected branch → allow (exit 0) ────────
# The everyday retrofit PR-1 case, mirroring test 5 for a spec.
reset_session
actual=$(printf '{"tool": "Write", "file_path": "docs/component-retrofits/card.md"}' | DS_SESSION_FILE="$SESSION_FILE" bash "$GUARD" 2>/dev/null; echo $?)
actual="${actual##*$'\n'}"
if [ "$actual" -eq 0 ]; then
  echo "PASS: Retrofit addendum write on non-protected branch → allow (exit 0)"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "FAIL: Retrofit addendum write on non-protected branch → allow (expected 0, got $actual)"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# ── Test 19: In-session addendum then source, same component → block (exit 2) ─
# THE reject case for the retrofit path. Before this change the guard allowed this: an addendum
# path was an unclassified file, so nothing was recorded and nothing matched.
reset_session
printf '{"tool": "Write", "file_path": "docs/component-retrofits/card.md"}' | DS_SESSION_FILE="$SESSION_FILE" bash "$GUARD" > /dev/null 2>&1
make_fake_git "chore/card-retrofit-impl"
actual=$(printf '{"tool": "Write", "file_path": "src/components/ui/card.tsx"}' | PATH="$FAKE_BRANCH_DIR:$PATH" DS_SESSION_FILE="$SESSION_FILE" bash "$GUARD" 2>/dev/null; echo $?)
actual="${actual##*$'\n'}"
drop_fake_git
if [ "$actual" -eq 2 ]; then
  echo "PASS: In-session addendum→source mixing (same component) → block (exit 2)"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "FAIL: In-session addendum→source mixing → block (expected 2, got $actual)"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# ── Test 20: In-session source then addendum, same component → block (exit 2) ─
# The reverse direction — condition 2 is checked from both sides.
reset_session
make_fake_git "chore/card-retrofit-impl"
printf '{"tool": "Write", "file_path": "src/components/ui/card.tsx"}' | PATH="$FAKE_BRANCH_DIR:$PATH" DS_SESSION_FILE="$SESSION_FILE" bash "$GUARD" > /dev/null 2>&1
drop_fake_git
actual=$(printf '{"tool": "Write", "file_path": "docs/component-retrofits/card.md"}' | DS_SESSION_FILE="$SESSION_FILE" bash "$GUARD" 2>/dev/null; echo $?)
actual="${actual##*$'\n'}"
if [ "$actual" -eq 2 ]; then
  echo "PASS: In-session source→addendum mixing (same component) → block (exit 2)"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "FAIL: In-session source→addendum mixing → block (expected 2, got $actual)"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# ── Test 21: Addendum resolves to layout A source (src/components/ui/<c>.tsx) ──
# `avatar` is a real layout-A component in design-tokens. One addendum file must match a source
# write in the ui bucket.
reset_session
printf '{"tool": "Write", "file_path": "docs/component-retrofits/avatar.md"}' | DS_SESSION_FILE="$SESSION_FILE" bash "$GUARD" > /dev/null 2>&1
make_fake_git "chore/avatar-retrofit-impl"
actual=$(printf '{"tool": "Write", "file_path": "src/components/ui/avatar.tsx"}' | PATH="$FAKE_BRANCH_DIR:$PATH" DS_SESSION_FILE="$SESSION_FILE" bash "$GUARD" 2>/dev/null; echo $?)
actual="${actual##*$'\n'}"
drop_fake_git
if [ "$actual" -eq 2 ]; then
  echo "PASS: Addendum name resolution — layout A (src/components/ui/avatar.tsx) → block (exit 2)"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "FAIL: Addendum name resolution — layout A (expected 2, got $actual)"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# ── Test 21b: document path shapes the inline code never covered (an earlier change) ────
# Three shapes the suite had no case for, added with the resolver extraction because they are
# exactly what an extraction can silently change: a dotted filename, a nested path, and a
# DOUBLED prefix.
#
# The doubled-prefix case is the load-bearing one. `sed 's|.*p||'` is greedy and strips to the
# LAST occurrence; the shortest-match shell operator `${1#*"$2"}` strips to the FIRST and would
# resolve `docs/component-specs/docs/component-specs/avatar.md` to component `docs` instead of
# `avatar`. That is not a hypothetical difference — it was the first fix proposed in review.
for _shape in \
  "docs/component-specs/avatar.v2.md|dotted filename" \
  "docs/component-specs/nested/avatar.md|nested path" \
  "docs/component-specs/docs/component-specs/avatar.md|doubled prefix"
do
  _path="${_shape%%|*}"; _label="${_shape##*|}"
  reset_session
  printf '{"tool": "Write", "file_path": "%s"}' "$_path" | DS_SESSION_FILE="$SESSION_FILE" bash "$GUARD" > /dev/null 2>&1
  make_fake_git "chore/avatar-impl"
  actual=$(printf '{"tool": "Write", "file_path": "src/components/ui/avatar.tsx"}' | PATH="$FAKE_BRANCH_DIR:$PATH" DS_SESSION_FILE="$SESSION_FILE" bash "$GUARD" 2>/dev/null; echo $?)
  actual="${actual##*$'\n'}"
  drop_fake_git
  # Expected exits, and why each is what it is — all three are the behaviour the inline code
  # already had, pinned rather than changed:
  #   doubled prefix  → `avatar`     → blocks (2).  This is the greedy-strip property.
  #   nested path     → `nested`     → no block (0). Only the FIRST path segment survives.
  #   dotted filename → `avatar.v2`  → no block (0). Only the LAST extension is stripped, so a
  #                                    dotted document name does NOT resolve to its base name.
  #                                    Matches classify-pr-diff.sh's strip_suffix, which also
  #                                    removes one extension: `avatar.v2.tsx` → `avatar.v2`.
  case "$_label" in
    "doubled prefix") _want=2 ;;
    *)                _want=0 ;;
  esac
  if [ "$actual" -eq "$_want" ]; then
    echo "PASS: Document shape — $_label ($_path) → exit $_want"
    PASS_COUNT=$((PASS_COUNT + 1))
  else
    echo "FAIL: Document shape — $_label (expected $_want, got $actual)"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
done

# ── Test 22: Addendum resolves to layout B source (src/components/<c>/…) ───────
# `breadcrumbs` is a real layout-B component. Note the source file is `breadcrumbs-item.tsx`,
# which resolves to the DIRECTORY name `breadcrumbs` — matching the classifier, and matching the
# addendum named for the directory. An addendum named `breadcrumbs-item.md` would match nothing;
# that trap is documented in the rule's naming table.
reset_session
printf '{"tool": "Write", "file_path": "docs/component-retrofits/breadcrumbs.md"}' | DS_SESSION_FILE="$SESSION_FILE" bash "$GUARD" > /dev/null 2>&1
make_fake_git "chore/breadcrumbs-retrofit-impl"
actual=$(printf '{"tool": "Write", "file_path": "src/components/breadcrumbs/breadcrumbs-item.tsx"}' | PATH="$FAKE_BRANCH_DIR:$PATH" DS_SESSION_FILE="$SESSION_FILE" bash "$GUARD" 2>/dev/null; echo $?)
actual="${actual##*$'\n'}"
drop_fake_git
if [ "$actual" -eq 2 ]; then
  echo "PASS: Addendum name resolution — layout B (src/components/breadcrumbs/breadcrumbs-item.tsx) → block (exit 2)"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "FAIL: Addendum name resolution — layout B (expected 2, got $actual)"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# ── Test 23: Addendum for one component + source for another → allow (exit 0) ──
# Over-blocking control for tests 19-22: the block must be keyed on the component name, not on
# "an addendum was written at some point this session".
reset_session
printf '{"tool": "Write", "file_path": "docs/component-retrofits/card.md"}' | DS_SESSION_FILE="$SESSION_FILE" bash "$GUARD" > /dev/null 2>&1
make_fake_git "chore/dialog-retrofit-impl"
actual=$(printf '{"tool": "Write", "file_path": "src/components/ui/dialog.tsx"}' | PATH="$FAKE_BRANCH_DIR:$PATH" DS_SESSION_FILE="$SESSION_FILE" bash "$GUARD" 2>/dev/null; echo $?)
actual="${actual##*$'\n'}"
drop_fake_git
if [ "$actual" -eq 0 ]; then
  echo "PASS: In-session addendum for card + source for dialog (different) → allow (exit 0)"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "FAIL: Different-component addendum/source writes → allow (expected 0, got $actual)"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# ── Test 24: Source write, no document of any kind, clean session → allow ──────
# The task's stated accept case ("component has no frozen spec but does have an addendum →
# allowed") holds, but NOT because of the addendum: this test writes source with NO document at
# all and is also allowed, because the guard performs no existence check. Kept as an explicit
# regression guard AND as the honest record of that scope boundary — on its own it does not
# discriminate. Test 19 is its control: same source path, blocked once an addendum for the same
# component is written in-session. If a future change makes the guard existence-aware, THIS test
# is the one that must be revisited first.
reset_session
make_fake_git "chore/skeleton-retrofit-impl"
actual=$(printf '{"tool": "Write", "file_path": "src/components/ui/skeleton.tsx"}' | PATH="$FAKE_BRANCH_DIR:$PATH" DS_SESSION_FILE="$SESSION_FILE" bash "$GUARD" 2>/dev/null; echo $?)
actual="${actual##*$'\n'}"
drop_fake_git
if [ "$actual" -eq 0 ]; then
  echo "PASS: Source write for a spec-less, addendum-less component on a non-protected branch → allow (exit 0) [guard performs no existence check — CI binds it]"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "FAIL: Source write with no document must still be allowed (expected 0, got $actual) — the guard must not gain an existence check here"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# ── Test 25: Spec then addendum, same component, one session → allow (exit 0) ──
# Over-blocking control on the document side. A spec and an addendum are ALTERNATIVES, not a
# hierarchy (the rule says so), and both sit on the PR-1 side of the boundary — so writing both
# for one component is redundant, not a violation. Also proves the addendum write records itself
# under a document key rather than as `src:`, which would have blocked this.
reset_session
printf '{"tool": "Write", "file_path": "docs/component-specs/status.md"}' | DS_SESSION_FILE="$SESSION_FILE" bash "$GUARD" > /dev/null 2>&1
actual=$(printf '{"tool": "Write", "file_path": "docs/component-retrofits/status.md"}' | DS_SESSION_FILE="$SESSION_FILE" bash "$GUARD" 2>/dev/null; echo $?)
actual="${actual##*$'\n'}"
if [ "$actual" -eq 0 ]; then
  echo "PASS: Spec then addendum for the same component in one session → allow (exit 0)"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "FAIL: Spec then addendum must be allowed (expected 0, got $actual) — both are PR-1 documents"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# ── Test 26: Source write on spec/ branch, retrofit-shaped work → block (exit 2)
# The retrofit path does not relax condition 1. A component source write on a protected branch is
# blocked whether or not the work is a retrofit, and whether or not any document exists — this is
# the "neither spec nor addendum → blocked" case, and it is condition 1 that blocks it, not an
# existence check. Distinct from test 8 only in the component, but it is what pins that the new
# classification did not widen access on protected branches.
FAKE_GIT=$(mktemp)
cat > "$FAKE_GIT" <<'FAKEGIT'
#!/bin/bash
# an earlier change: the guard now resolves git relative to the file (`git -C <dir> …`), so the
# branch query arrives with a leading `-C <dir>`. Skip it: these fakes answer for one
# branch regardless of checkout, which is what they were written to do.
if [ "$1" = "-C" ]; then shift 2; fi
if [ "$1" = "rev-parse" ] && [ "$2" = "--abbrev-ref" ] && [ "$3" = "HEAD" ]; then
  echo "spec/segmented-control-retrofit"
  exit 0
fi
exec /usr/bin/git "$@"
FAKEGIT
chmod +x "$FAKE_GIT"
FAKE_GIT_DIR=$(dirname "$FAKE_GIT")
FAKE_GIT_AS_GIT="$FAKE_GIT_DIR/git"
cp "$FAKE_GIT" "$FAKE_GIT_AS_GIT"
chmod +x "$FAKE_GIT_AS_GIT"

reset_session
actual=$(printf '{"tool": "Write", "file_path": "src/components/ui/segmented-control.tsx"}' | PATH="$FAKE_GIT_DIR:$PATH" DS_SESSION_FILE="$SESSION_FILE" bash "$GUARD" 2>/dev/null; echo $?)
actual="${actual##*$'\n'}"
rm -f "$FAKE_GIT" "$FAKE_GIT_AS_GIT"

if [ "$actual" -eq 2 ]; then
  echo "PASS: Source write for a spec-less component on spec/ branch → block (exit 2)"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "FAIL: Source write on spec/ branch must still block (expected 2, got $actual)"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# ── Test 27: prefix-named component must not inherit another's session entry ──
# Regression guard for the session-state lookup being an EXACT WHOLE-LINE match (`grep -qxF`).
# With a substring match, the session line `spec:checkbox-card` satisfies a lookup for
# `checkbox`, falsely blocking an unrelated component's source write. Six such pairs exist in
# the real inventory; `status`/`status-distribution-bar` is in the retrofit migration set.
# Found by mutation-testing the retrofit change, fixed in the same commit.
reset_session
printf '{"tool": "Write", "file_path": "docs/component-specs/checkbox-card.md"}' | DS_SESSION_FILE="$SESSION_FILE" bash "$GUARD" > /dev/null 2>&1
make_fake_git "chore/checkbox-impl"
actual=$(printf '{"tool": "Write", "file_path": "src/components/ui/checkbox.tsx"}' | PATH="$FAKE_BRANCH_DIR:$PATH" DS_SESSION_FILE="$SESSION_FILE" bash "$GUARD" 2>/dev/null; echo $?)
actual="${actual##*$'\n'}"
drop_fake_git
if [ "$actual" -eq 0 ]; then
  echo "PASS: Spec for 'checkbox-card' does not block source for 'checkbox' → allow (exit 0) [prefix collision]"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "FAIL: Prefix-named component collision (expected 0, got $actual) — session lookup must be an exact whole-line match"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# ── Session-file path containment ──────────────────────────────────────────────
# The session file is an APPEND TARGET, so an attacker-controlled path is an arbitrary-write
# primitive. Both inputs are untrusted: session_id from the JSON payload, and a caller-supplied
# DS_SESSION_FILE in the environment.
#
# These tests assert CONTAINMENT (nothing is written outside the sandbox), not exit codes — the
# guard is fail-open, so a traversal would have exited 0 while writing. Asserting the exit code
# would have passed against the vulnerable version.
#
# Why the naive repro is not enough: with the fixed `ds-pipeline-session-` prefix, a bare
# "../../../etc/x" does NOT write, because `ds-pipeline-session-..` is not a directory. It writes
# once any `ds-pipeline-session-*` DIRECTORY exists — and /tmp is world-writable. Case 2 creates
# that directory on purpose; without it the test would pass against the vulnerable code.
#
# WHICH OF THESE ARE REGRESSION TESTS, measured by reverting the sanitiser and re-running:
#   cases 2 and 5 FAIL against the vulnerable guard — those two are the regression tests.
#   cases 1, 3 and 4 pass either way, because the missing intermediate directory blocks the
#     write regardless of sanitising. They are boundary documentation, not regression coverage.
#     Kept deliberately: they pin the shapes a future refactor must keep contained, and they are
#     the exact shapes a reader will try first.
# Do not "strengthen" 1/3/4 by pre-creating directories for them without re-running the mutation
# — an unmeasured test that looks strict is worse than one honestly labelled weak.

PATH_SANDBOX=$(mktemp -d)
PATH_DECOY="${TMPDIR:-/tmp}/ds-pipeline-session-selftest-decoy"
mkdir -p "$PATH_DECOY"
trap 'rm -rf "$PATH_SANDBOX" "$PATH_DECOY"; rm -f "$SESSION_FILE"' EXIT

SRC_PAYLOAD='"tool_name": "Write", "tool_input": {"file_path": "src/components/ui/card.tsx"}'

assert_no_escape() {
  # $1 = label, $2 = expected-absent file, $3.. = env assignments + payload runner
  if [ -e "$2" ]; then
    echo "FAIL: $1 — wrote outside the session directory to $2 (arbitrary write)"
    FAIL_COUNT=$((FAIL_COUNT + 1))
    rm -f "$2"
  else
    echo "PASS: $1 → no write outside the session directory"
    PASS_COUNT=$((PASS_COUNT + 1))
  fi
}

# 1. session_id containing slashes
printf '{"session_id": "../../..%s/escaped1", %s}' "$PATH_SANDBOX" "$SRC_PAYLOAD" \
  | env -u DS_SESSION_FILE TMPDIR="${TMPDIR:-/tmp}" bash "$GUARD" >/dev/null 2>&1
assert_no_escape "session_id with slashes and .." "$PATH_SANDBOX/escaped1"

# 2. same, with a ds-pipeline-session-* directory present — the case that actually exploited
#    The decoy DIRECTORY is the whole point: without it the payload cannot traverse, the append
#    fails for want of a path, and assert_no_escape is trivially true. `mkdir -p` above can fail
#    (leftover regular file at that name from an interrupted run, permissions), so its result is
#    asserted rather than assumed — otherwise this reports PASS having exercised nothing.
if [ -d "$PATH_DECOY" ]; then
  printf '{"session_id": "selftest-decoy/../../..%s/escaped2", %s}' "$PATH_SANDBOX" "$SRC_PAYLOAD" \
    | env -u DS_SESSION_FILE TMPDIR="${TMPDIR:-/tmp}" bash "$GUARD" >/dev/null 2>&1
  assert_no_escape "session_id traversing through an existing ds-pipeline-session-* dir" "$PATH_SANDBOX/escaped2"
else
  echo "SKIP: $PATH_DECOY is not a directory — traversal case not exercisable (not a pass)"
fi

# 3. absolute-path session_id
printf '{"session_id": "%s/escaped3", %s}' "$PATH_SANDBOX" "$SRC_PAYLOAD" \
  | env -u DS_SESSION_FILE TMPDIR="${TMPDIR:-/tmp}" bash "$GUARD" >/dev/null 2>&1
assert_no_escape "absolute-path session_id" "$PATH_SANDBOX/escaped3"

# 4. newline in session_id — must not split into a second path
printf '{"session_id": "abc\\ndef", %s}' "$SRC_PAYLOAD" \
  | env -u DS_SESSION_FILE TMPDIR="${TMPDIR:-/tmp}" bash "$GUARD" >/dev/null 2>&1
assert_no_escape "newline in session_id" "${TMPDIR:-/tmp}/def"

# 5. caller-supplied DS_SESSION_FILE containing ..
#    `sub/` must exist, or `>>` fails for want of a directory and the test passes against the
#    vulnerable code too — mutation-verified, this is the same artefact as case 2.
if mkdir -p "$PATH_SANDBOX/sub" && [ -d "$PATH_SANDBOX/sub" ]; then
  printf '{%s}' "$SRC_PAYLOAD" \
    | env DS_SESSION_FILE="$PATH_SANDBOX/sub/../escaped5" TMPDIR="${TMPDIR:-/tmp}" bash "$GUARD" >/dev/null 2>&1
  assert_no_escape "DS_SESSION_FILE with a .. segment" "$PATH_SANDBOX/escaped5"
else
  echo "SKIP: could not create $PATH_SANDBOX/sub — .. case not exercisable (not a pass)"
fi

# 5b. caller-supplied DS_SESSION_FILE that is absolute AND free of `..`, but outside the
#     guard-owned directory. This is the vector an absolute-path-is-enough check misses:
#     /home/user/.bashrc is absolute and clean, and the guard would have appended to it.
#     The sandbox stands in for any writable absolute path.
printf '{%s}' "$SRC_PAYLOAD" \
  | env DS_SESSION_FILE="$PATH_SANDBOX/clean-absolute" TMPDIR="${TMPDIR:-/tmp}" bash "$GUARD" >/dev/null 2>&1
assert_no_escape "DS_SESSION_FILE absolute and clean but outside the guard directory" "$PATH_SANDBOX/clean-absolute"

# 5c. DS_SESSION_FILE whose pathname satisfies the guard-owned prefix but IS A SYMLINK to a
#     target outside it. The prefix check validates a string; `>>` follows symlinks, so a local
#     process can pre-create $TMPDIR/ds-pipeline-session-<x> pointing anywhere writable.
#     Reproduced against the pre-fix guard: the victim received `src:card`.
# Literal /tmp, not ${TMPDIR:-/tmp}: the guard pins its comparison root to the literal /tmp
# (round 6 — TMPDIR is caller-supplied, so it cannot be the trusted root). A bait built from a
# non-default TMPDIR is discarded by that check, the guard derives its own path, the victim stays
# empty, and this test passes without ever reaching the symlink branch. Measured: with the guard's
# `[ -L ]` rejection deliberately broken, this test FAILS under TMPDIR=/tmp and PASSES under
# TMPDIR=/tmp/alt — blind to a broken guard. Same reason 5f below is already literal.
SYMLINK_BAIT="/tmp/ds-pipeline-session-selftest-symlink"
rm -f "$SYMLINK_BAIT"
: > "$PATH_SANDBOX/symlink-victim"
# `ln -s` must be asserted, not assumed. If it fails, the guard is handed a path with no symlink
# at it, creates a fresh regular file, and the victim stays empty — the emptiness check would then
# report PASS having never exercised containment. Same guarded shape as the hard-link cases below.
if ln -s "$PATH_SANDBOX/symlink-victim" "$SYMLINK_BAIT" 2>/dev/null; then
  printf '{%s}' "$SRC_PAYLOAD" \
    | env DS_SESSION_FILE="$SYMLINK_BAIT" TMPDIR="${TMPDIR:-/tmp}" bash "$GUARD" >/dev/null 2>&1
  if [ -s "$PATH_SANDBOX/symlink-victim" ]; then
    echo "FAIL: prefix-matching symlink DS_SESSION_FILE — append followed the link to $PATH_SANDBOX/symlink-victim"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  else
    echo "PASS: prefix-matching symlink DS_SESSION_FILE → rejected, no write through the link"
    PASS_COUNT=$((PASS_COUNT + 1))
  fi
else
  echo "SKIP: could not create the symlink bait in this environment (not a pass)"
fi
rm -f "$SYMLINK_BAIT" "$PATH_SANDBOX/symlink-victim"

# 5d. DS_SESSION_FILE at a guard-owned name that is a HARD LINK to a target outside it.
#     [ -L ] is false for a hard link — it is a second directory entry to the same inode, a
#     regular file — so the symlink check does not cover this. Not a privilege escalation
#     (protected_hardlinks=1 permits linking only what the caller can already write), but a
#     containment break: the guard claims to write only inside its own directory.
# Literal /tmp for the same reason as SYMLINK_BAIT above — the guard's comparison root is fixed.
HARDLINK_BAIT="/tmp/ds-pipeline-session-selftest-hardlink"
rm -f "$HARDLINK_BAIT"
: > "$PATH_SANDBOX/hardlink-victim"
if ln "$PATH_SANDBOX/hardlink-victim" "$HARDLINK_BAIT" 2>/dev/null; then
  printf '{%s}' "$SRC_PAYLOAD" \
    | env DS_SESSION_FILE="$HARDLINK_BAIT" TMPDIR="${TMPDIR:-/tmp}" bash "$GUARD" >/dev/null 2>&1
  if [ -s "$PATH_SANDBOX/hardlink-victim" ]; then
    echo "FAIL: prefix-matching hard-link DS_SESSION_FILE — append reached the linked target"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  else
    echo "PASS: prefix-matching hard-link DS_SESSION_FILE → rejected, no write through the link"
    PASS_COUNT=$((PASS_COUNT + 1))
  fi
else
  # Cross-device TMPDIR vs sandbox, or a hardening policy that forbids the link. Skipped rather
  # than silently passed: a skip that reports as PASS is how a dead test hides.
  echo "SKIP: hard-link case not exercisable here (ln refused — likely cross-device TMPDIR)"
fi
rm -f "$HARDLINK_BAIT" "$PATH_SANDBOX/hardlink-victim"

# 5e. TMPDIR redirect: the caller sets both TMPDIR and a DS_SESSION_FILE matching it. The
#     prefix check must compare against a FIXED root, not against caller-supplied TMPDIR —
#     otherwise the caller supplies both sides of the comparison and it always agrees.
#     Reproduced against the pre-fix guard: the victim received src:card.
TMPDIR_BAIT="$PATH_SANDBOX/tmpdir-root"
if mkdir -p "$TMPDIR_BAIT" && [ -d "$TMPDIR_BAIT" ]; then
  printf '{%s}' "$SRC_PAYLOAD" \
    | env TMPDIR="$TMPDIR_BAIT" DS_SESSION_FILE="$TMPDIR_BAIT/ds-pipeline-session-victim" \
      bash "$GUARD" >/dev/null 2>&1
  assert_no_escape "TMPDIR redirected to a caller-chosen root" "$TMPDIR_BAIT/ds-pipeline-session-victim"
else
  echo "SKIP: could not create $TMPDIR_BAIT — TMPDIR-redirect case not exercisable (not a pass)"
fi

# 5f. Parent directory is a symlink; the final component is a regular file. The prefix glob's
#     `*` matches `/`, so a nested path satisfied it, and [ -L ] on the final path saw nothing.
PARENT_BAIT="/tmp/ds-pipeline-session-selftest-parent"
rm -f "$PARENT_BAIT"
# Asserted for the same reason as 5c: without the symlinked parent there is nothing to resolve
# through, the victim stays empty, and the emptiness check would pass vacuously. The directory and
# the victim file are part of that setup — `ln -s` succeeds against a missing target, so checking
# only the link would still leave a dangling one and a vacuous pass.
if mkdir -p "$PATH_SANDBOX/realdir" && : > "$PATH_SANDBOX/realdir/victim" \
   && ln -s "$PATH_SANDBOX/realdir" "$PARENT_BAIT" 2>/dev/null; then
  printf '{%s}' "$SRC_PAYLOAD" \
    | env DS_SESSION_FILE="$PARENT_BAIT/victim" bash "$GUARD" >/dev/null 2>&1
  # assert_no_escape tests existence, which is wrong here: the victim is pre-created so the guard
  # has something a symlinked parent can resolve to. Assert emptiness instead.
  if [ -s "$PATH_SANDBOX/realdir/victim" ]; then
    echo "FAIL: DS_SESSION_FILE under a symlinked parent directory — append reached $PATH_SANDBOX/realdir/victim"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  else
    echo "PASS: DS_SESSION_FILE under a symlinked parent directory → rejected, no write through the parent"
    PASS_COUNT=$((PASS_COUNT + 1))
  fi
else
  echo "SKIP: could not create the symlinked parent directory in this environment (not a pass)"
fi
rm -f "$PARENT_BAIT"

# 6. a legitimate UUID session_id must still produce a working session file — otherwise the
#    sanitiser would "pass" these tests by disabling session tracking altogether.
UUID_SID="0123abcd-4567-89ef-0123-456789abcdef"
rm -f "${TMPDIR:-/tmp}/ds-pipeline-session-${UUID_SID}"
make_fake_git "feature/card-impl"
printf '{"session_id": "%s", %s}' "$UUID_SID" "$SRC_PAYLOAD" \
  | env -u DS_SESSION_FILE PATH="$FAKE_BRANCH_DIR:$PATH" TMPDIR="${TMPDIR:-/tmp}" bash "$GUARD" >/dev/null 2>&1
drop_fake_git
if grep -qxF "src:card" "${TMPDIR:-/tmp}/ds-pipeline-session-${UUID_SID}" 2>/dev/null; then
  echo "PASS: UUID session_id still records session state (sanitiser did not break tracking)"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "FAIL: UUID session_id no longer records session state — the sanitiser broke the feature"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi
rm -f "${TMPDIR:-/tmp}/ds-pipeline-session-${UUID_SID}"

# 7. the DERIVED path must reject a planted referent too.
#    Cases 1-6 above all reach the containment checks through a caller-supplied DS_SESSION_FILE.
#    When it is unset the guard derives its own path — and choosing the FILENAME does not mean
#    owning the /tmp ENTRY. A local process can pre-create that entry as a symlink or a hard link
#    before the guard runs, and `>>` follows it. Reproduced against the pre-fix guard: the victim
#    file received `spec:toggle` with DS_SESSION_FILE unset.
#    These two cases are the only ones in this file that exercise the derived branch, which is why
#    the earlier symlink/hard-link tests did not catch it.
DERIVED_SID="derivedprobe$$"
DERIVED_PATH="${TMPDIR:-/tmp}/ds-pipeline-session-${DERIVED_SID}"

# 7a. derived path pre-created as a symlink to a victim
: > "$PATH_SANDBOX/derived-symlink-victim"
rm -f "$DERIVED_PATH"
# Asserted, like the hard-link case below. Unguarded, a failed `ln -s` leaves the guard to create
# an ordinary file at the derived path, the victim stays empty, and BOTH assertions below would
# report PASS without the symlink ever existing — the exact vacuous-green shape these tests exist
# to catch in the guard.
if ln -s "$PATH_SANDBOX/derived-symlink-victim" "$DERIVED_PATH" 2>/dev/null; then
  make_fake_git "feature/card-impl"
  printf '{"session_id": "%s", %s}' "$DERIVED_SID" "$SRC_PAYLOAD" \
    | env -u DS_SESSION_FILE PATH="$FAKE_BRANCH_DIR:$PATH" TMPDIR="${TMPDIR:-/tmp}" bash "$GUARD" >/dev/null 2>&1
  drop_fake_git
  if [ -s "$PATH_SANDBOX/derived-symlink-victim" ]; then
    echo "FAIL: derived session path was a symlink — append followed it to $PATH_SANDBOX/derived-symlink-victim"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  else
    echo "PASS: derived session path pre-created as a symlink → no write through the link"
    PASS_COUNT=$((PASS_COUNT + 1))
  fi
  # and tracking must still work afterwards — unlinking the bait must not disable the feature
  if grep -qxF "src:card" "$DERIVED_PATH" 2>/dev/null; then
    echo "PASS: derived session path still records state after rejecting a planted symlink"
    PASS_COUNT=$((PASS_COUNT + 1))
  else
    echo "FAIL: rejecting the planted symlink also disabled session tracking"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
else
  echo "SKIP: could not pre-create the derived path as a symlink in this environment (not a pass)"
fi
rm -f "$DERIVED_PATH" "$PATH_SANDBOX/derived-symlink-victim"

# 7b. derived path pre-created as a hard link to a victim
: > "$PATH_SANDBOX/derived-hardlink-victim"
rm -f "$DERIVED_PATH"
if ln "$PATH_SANDBOX/derived-hardlink-victim" "$DERIVED_PATH" 2>/dev/null; then
  make_fake_git "feature/card-impl"
  printf '{"session_id": "%s", %s}' "$DERIVED_SID" "$SRC_PAYLOAD" \
    | env -u DS_SESSION_FILE PATH="$FAKE_BRANCH_DIR:$PATH" TMPDIR="${TMPDIR:-/tmp}" bash "$GUARD" >/dev/null 2>&1
  drop_fake_git
  if [ -s "$PATH_SANDBOX/derived-hardlink-victim" ]; then
    echo "FAIL: derived session path was a hard link — append wrote through to $PATH_SANDBOX/derived-hardlink-victim"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  else
    echo "PASS: derived session path pre-created as a hard link → no write through the link"
    PASS_COUNT=$((PASS_COUNT + 1))
  fi
else
  # cross-filesystem TMPDIR, or fs.protected_hardlinks refusing the link — the vector is not
  # reachable here, so report honestly rather than claiming a pass the run did not earn.
  echo "SKIP: hard link to the derived path could not be created in this environment (not a pass)"
fi
rm -f "$DERIVED_PATH" "$PATH_SANDBOX/derived-hardlink-victim"

# ── an earlier change: the branch is resolved from the FILE's checkout, not the process cwd ─────
#
# Both directions are asserted because only one of them was ever visible. The false positive
# announced itself (a BLOCK naming a branch the author had not checked out); the false negative is
# silent and is the one that matters — a write into a spec/ worktree passing unenforced.
#
# The fake git answers per `-C <dir>` for the worktree question and per $CWD_BRANCH for the bare
# form, so a regression to the cwd-resolving implementation flips both assertions.
BRANCH_FIXTURE_DIR=$(mktemp -d)
mkdir -p "$BRANCH_FIXTURE_DIR/wt-feature/src/components/ui" "$BRANCH_FIXTURE_DIR/wt-spec/src/components/ui"
cat > "$BRANCH_FIXTURE_DIR/git" <<'FAKEGIT946'
#!/bin/bash
if [ "$1" = "-C" ]; then
  # Behave like real git: -C on a path that does not exist is a hard error, not a silent
  # fallback to cwd. Without this the walk-up test below would pass with or without the
  # walk-up, because the stub would happily answer for a directory git could never enter.
  if [ ! -d "$2" ]; then
    echo "fatal: cannot change to '"'"'$2'"'"': No such file or directory" >&2
    exit 128
  fi
  case "$2" in
    */wt-feature/*) resolved="feature/ticket-fixture" ;;
    */wt-spec/*)    resolved="spec/an upstream change-fixture" ;;
    *)              resolved="main" ;;
  esac
  shift 2
  if [ "$1" = "rev-parse" ] && [ "$2" = "--abbrev-ref" ] && [ "$3" = "HEAD" ]; then
    echo "$resolved"
    exit 0
  fi
fi
# Bare form: what the cwd-resolving implementation would have seen.
if [ "$1" = "rev-parse" ] && [ "$2" = "--abbrev-ref" ] && [ "$3" = "HEAD" ]; then
  echo "${CWD_BRANCH:-main}"
  exit 0
fi
exec /usr/bin/git "$@"
FAKEGIT946
chmod +x "$BRANCH_FIXTURE_DIR/git"

# Direction 1 — file in a feature/ worktree, cwd on spec/ → ALLOW (the reproduced false positive)
reset_session
actual=$(printf '{"tool": "Write", "file_path": "%s/wt-feature/src/components/ui/card.tsx"}' "$BRANCH_FIXTURE_DIR" \
  | PATH="$BRANCH_FIXTURE_DIR:$PATH" CWD_BRANCH="spec/ticket-attachment" DS_SESSION_FILE="$SESSION_FILE" bash "$GUARD" 2>/dev/null; echo $?)
actual="${actual##*$'\n'}"
if [ "$actual" -eq 0 ]; then
  echo "PASS: file in feature/ worktree while cwd is on spec/ → allow (exit 0)"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "FAIL: file in feature/ worktree while cwd is on spec/ (expected 0, got $actual)"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# Direction 2 — file in a spec/ worktree, cwd on feature/ → BLOCK (the silent false negative)
reset_session
actual=$(printf '{"tool": "Write", "file_path": "%s/wt-spec/src/components/ui/card.tsx"}' "$BRANCH_FIXTURE_DIR" \
  | PATH="$BRANCH_FIXTURE_DIR:$PATH" CWD_BRANCH="feature/ticket-checkbox" DS_SESSION_FILE="$SESSION_FILE" bash "$GUARD" 2>/dev/null; echo $?)
actual="${actual##*$'\n'}"
if [ "$actual" -eq 2 ]; then
  echo "PASS: file in spec/ worktree while cwd is on feature/ → block (exit 2)"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "FAIL: file in spec/ worktree while cwd is on feature/ (expected 2, got $actual)"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# Direction 2b — a Write creating the FIRST file in a new directory, inside a spec/ worktree.
# This is what the walk-up exists for: `git -C` on a path that does not exist yet exits non-zero,
# and fail-open would turn that into "no branch" — i.e. straight back to not enforcing, in the
# silent direction. The stub above returns 128 for a missing directory precisely so that a
# regression to bare `dirname` fails here instead of passing by accident.
reset_session
actual=$(printf '{"tool": "Write", "file_path": "%s/wt-spec/src/components/brand-new/brand-new.tsx"}' "$BRANCH_FIXTURE_DIR" \
  | PATH="$BRANCH_FIXTURE_DIR:$PATH" CWD_BRANCH="feature/ticket-checkbox" DS_SESSION_FILE="$SESSION_FILE" bash "$GUARD" 2>/dev/null; echo $?)
actual="${actual##*$'\n'}"
if [ "$actual" -eq 2 ]; then
  echo "PASS: first file in a not-yet-existing directory inside a spec/ worktree → block (exit 2)"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "FAIL: first file in a not-yet-existing directory inside a spec/ worktree (expected 2, got $actual)"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# Direction 3 — unresolvable git state stays fail-open, as before the change
reset_session
NOGIT_DIR=$(mktemp -d)
cat > "$NOGIT_DIR/git" <<'FAKEGITFAIL'
#!/bin/bash
exit 128
FAKEGITFAIL
chmod +x "$NOGIT_DIR/git"
actual=$(printf '{"tool": "Write", "file_path": "%s/wt-spec/src/components/ui/card.tsx"}' "$BRANCH_FIXTURE_DIR" \
  | PATH="$NOGIT_DIR:$PATH" DS_SESSION_FILE="$SESSION_FILE" bash "$GUARD" 2>/dev/null; echo $?)
actual="${actual##*$'\n'}"
if [ "$actual" -eq 0 ]; then
  echo "PASS: unresolvable git state → fail-open preserved (exit 0)"
  PASS_COUNT=$((PASS_COUNT + 1))
else
  echo "FAIL: unresolvable git state (expected 0, got $actual)"
  FAIL_COUNT=$((FAIL_COUNT + 1))
fi
rm -rf "$NOGIT_DIR" "$BRANCH_FIXTURE_DIR"

# ── Configuration surface: ds-kit.config.yml overrides the built-in defaults ──
# This behaviour is NEW in the kit (the source guard hardcoded its paths), so it
# needs its own coverage. Two directions matter equally: the configured path must
# START being treated as component source, and the default path must STOP being.
# A test that only checked the first would pass against a guard that ignores the
# config and blocks everything under any "components" directory.

cfg_root=$(mktemp -d /tmp/ds-guard-cfg.XXXXXX)
cat > "$cfg_root/ds-kit.config.yml" <<'CFGEOF'
paths:
  components_ui: "lib/ui/"
  components_composite: "lib/components/"
  specs: "specs/components/"
  retrofits: "specs/retrofits/"
CFGEOF

cfg_repo=$(mktemp -d /tmp/ds-guard-repo.XXXXXX)
git -C "$cfg_repo" init -q .
git -C "$cfg_repo" -c user.email=t@example.invalid -c user.name=t commit -q --allow-empty -m init
git -C "$cfg_repo" checkout -q -b spec/config-probe

# $1 = expected exit, $2 = CLAUDE_PROJECT_DIR, $3 = file_path, $4 = description
check_cfg() {
  reset_session
  actual=$( cd "$cfg_repo" && printf '%s' \
      "{\"tool_name\":\"Write\",\"tool_input\":{\"file_path\":\"$3\"}}" \
    | DS_SESSION_FILE="$SESSION_FILE" CLAUDE_PROJECT_DIR="$2" bash "$GUARD" >/dev/null 2>&1; echo $? )
  if [ "$actual" -eq "$1" ]; then
    echo "PASS: $4"
    PASS_COUNT=$((PASS_COUNT + 1))
  else
    echo "FAIL: $4 (expected $1, got $actual)"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
}

check_cfg 2 "$cfg_root" "lib/components/card.tsx" \
  "config: configured component path is treated as source (blocked on spec/ branch)"
check_cfg 0 "$cfg_root" "src/components/card.tsx" \
  "config: default component path stops being source once config overrides it"
check_cfg 2 "/nonexistent-project-dir" "src/components/card.tsx" \
  "config: missing config file falls back to built-in defaults"
check_cfg 0 "$cfg_root" "specs/components/card.md" \
  "config: configured spec path is not component source"

rm -rf "$cfg_root" "$cfg_repo"

# ── Summary ────────────────────────────────────────────────────────────────────
echo ""
echo "Tests: $PASS_COUNT passed, $FAIL_COUNT failed"

if [ "$FAIL_COUNT" -gt 0 ]; then
  exit 1
fi
exit 0
