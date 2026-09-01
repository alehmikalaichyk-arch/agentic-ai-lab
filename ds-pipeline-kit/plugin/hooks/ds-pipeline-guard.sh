#!/bin/bash
# ds-pipeline-guard.sh — PreToolUse hook that enforces DS component pipeline PR boundaries.
# Fires on Write or Edit tool calls. Reads tool-call JSON from stdin.
# Exits 2 to block; exits 0 to allow.
# Compatible with bash 3.2 (macOS). No associative arrays. No grep -P. No jq. No Python.
#
# FAIL-OPEN: any ambiguity (missing file_path, unreadable git state, etc.) exits 0.
# This is defense-in-depth only — CI checks are the primary gate.
#
# Enforced rule: ds-component-pipeline (shipped as a skill and as a copyable rule file)
#
# ── CONFIGURATION ─────────────────────────────────────────────────────────────
#
# Values below are DEFAULTS. If ds-kit.config.yml is present at the project root they are
# overridden from it, so the kit keeps ONE configuration surface rather than two that drift.
#
# The read is deliberately minimal — a flat `sed` over three known keys, no YAML parser, no
# jq, no Python — because this hook must stay dependency-free and fast. A missing or
# unparseable config leaves the defaults in place; the hook never fails because of it.
#
# These values feed SUBSTRING MATCHING only. They never reach a write path: the session
# file's location is derived independently and validated against a fixed literal root. Keep
# it that way — routing a config value into the write path would reopen the arbitrary-write
# class that the block further down exists to close.
#
# Protected branch prefixes — branches on which writes to src/components/** are blocked.
# These are branches that should only contain spec work (PR-1), not implementation (PR-2).
PROTECTED_PREFIXES="spec/ decomp/ research/"
#
# DS component source path pattern (relative to repo root, as it appears in file_path).
# A file_path containing this substring is treated as DS component source.
DS_SRC_PATTERN="src/components/"
#
# DS component spec path pattern.
DS_SPEC_PATTERN="docs/component-specs/"
#
# DS retrofit migration addendum path pattern.
# An addendum is the PR-1 document for an EXISTING component that has no frozen spec — see
# .claude/rules/ds-component-pipeline.md → "Existing Component Retrofit — the migration addendum".
# It is treated here exactly as a spec is: it is a PR-1 document, so writing it and the same
# component's source within one session is the same boundary violation.
# What this guard does NOT do: check whether a spec or an addendum EXISTS, or whether the
# component pre-exists. It never has. Both are bound by CI, which has BASE_SHA and fails closed.
# This hook has no PR context at all — no label, no PR body, no BASE_SHA — so an existence-based
# block here would make every spec-less component unwritable at the keyboard, including for
# changes CI would accept. See the rule's "What the guard enforces here".
DS_RETROFIT_PATTERN="docs/component-retrofits/"
#
# Barrel/index exclusion — a file_path whose trailing segment matches one of these exact
# suffixes is NOT treated as component source. Anchored to avoid false matches like
# src/components/index-card/index-card.tsx being excluded.
DS_BARREL_SUFFIXES="src/components/index.ts src/components/index.tsx src/components/ui/index.ts src/components/ui/index.tsx"
#
# Session state temp file — tracks which component names have been written in this session.
# One line per component name written. Keyed on session_id (extracted from the PreToolUse
# payload) so parallel Claude processes sharing a session_id see the same state, while
# distinct sessions remain isolated. Falls back to $$ only if session_id is absent from
# the payload.
# If DS_SESSION_FILE is already set (e.g. by tests), preserve it; otherwise derive it.
#
# ── Load overrides from ds-kit.config.yml, if present ─────────────────────────
ds_cfg="${CLAUDE_PROJECT_DIR:-.}/ds-kit.config.yml"
if [ -r "$ds_cfg" ]; then
  ds_read_key() {
    # $1 = key name. Matches `  key: "value"` or `  key: value`, first hit only.
    sed -n "s/^[[:space:]]*$1:[[:space:]]*\"\{0,1\}\([^\"#]*\)\"\{0,1\}[[:space:]]*$/\1/p" \
      "$ds_cfg" 2>/dev/null | head -1 | sed 's/[[:space:]]*$//'
  }
  ds_v=$(ds_read_key components_composite); [ -n "$ds_v" ] && DS_SRC_PATTERN="$ds_v"
  ds_v=$(ds_read_key specs);                [ -n "$ds_v" ] && DS_SPEC_PATTERN="$ds_v"
  ds_v=$(ds_read_key retrofits);            [ -n "$ds_v" ] && DS_RETROFIT_PATTERN="$ds_v"
  unset ds_v
fi
unset ds_cfg
#
# ── END CONFIGURATION ─────────────────────────────────────────────────────────

# ── Read stdin ────────────────────────────────────────────────────────────────
input=$(cat)

# ── Derive stable session key ─────────────────────────────────────────────────
# Claude Code delivers a session_id field in the PreToolUse payload. Use it as the
# session-file suffix so all invocations within the same session share state even
# though each PreToolUse fires a fresh process (different $$).
# Fall back to $$ only when session_id is absent (e.g. unit tests that supply a raw
# payload without it — those tests inject DS_SESSION_FILE directly).
#
# Both inputs to this path are untrusted and both are validated, because the session file is
# an APPEND TARGET (see the two `>>` writes below). An unvalidated path here is an
# arbitrary-write primitive, not a cosmetic issue.
#
# 1. A caller-supplied DS_SESSION_FILE is honoured only if it is absolute and contains no `..`
#    segment. Anything else is discarded and a safe path is derived instead — discarding is
#    better than exiting, because exiting would silently disable the boundary check the guard
#    exists to perform.
# 2. session_id is filtered to [A-Za-z0-9-] before it is concatenated. Claude Code sends a UUID
#    (e.g. 61c8fb80-9beb-4b22-b1f6-c02cf0ae97c2), so the allowlist costs nothing real and
#    removes `/` and `.` — the two characters traversal needs.
#
# Measured, so nobody "simplifies" this back: with TMPDIR=/tmp and the fixed
# `ds-pipeline-session-` prefix, a payload of "../../../etc/x" alone does NOT write, because
# `ds-pipeline-session-..` is not an existing directory. But `x/../../../tmp/target/f` DOES
# write as soon as any `ds-pipeline-session-*` DIRECTORY exists — and /tmp is world-writable,
# so a local process can create one. The prefix is not a defence.
# The trusted root for validating a CALLER-SUPPLIED path must not itself come from the caller.
# TMPDIR is caller-supplied: `TMPDIR=$attacker_dir DS_SESSION_FILE=$attacker_dir/ds-pipeline-session-x`
# satisfied the prefix check and wrote there — reproduced. Validating TMPDIR for absoluteness and
# `..` does NOT close it, because the reproduction used an absolute, dot-free directory. So the
# comparison root is the fixed literal /tmp, never TMPDIR.
#
# Rounds 2-5 closed what the WRITE resolves (traversal, origin, referent, inode); this closes what
# the COMPARISON is made against. Tests must therefore place their session file under /tmp.
#
# The DERIVED path below still uses TMPDIR, deliberately: there the guard chooses its own filename,
# so a redirected TMPDIR only moves the guard'"'"'s own file. It is not a containment break.
if [ -n "$DS_SESSION_FILE" ]; then
  ds_session_dir="/tmp"
  case "$DS_SESSION_FILE" in
    # Any `..` segment → reject. Checked first: a prefix match alone would accept
    # "$TMPDIR/ds-pipeline-session-x/../../../etc/passwd".
    */../*|*/..) DS_SESSION_FILE="" ;;
    # Guard-owned prefix only. An absolute path is NOT sufficient on its own —
    # /home/user/.bashrc is absolute and clean, and the two `>>` writes below would
    # append to it. The session file must live where the guard puts its own.
    "$ds_session_dir"/ds-pipeline-session-*) : ;;
    *) DS_SESSION_FILE="" ;;
  esac
  # The case glob's `*` matches `/` too, so "/tmp/ds-pipeline-session-bait/.bashrc" satisfied the
  # prefix. With `bait` a symlink to a directory, `>>` then wrote outside /tmp while the FINAL path
  # was a regular file, so [ -L ] saw nothing. Reproduced.
  # Requiring a DIRECT child of the trusted root closes the whole class: no accepted path has a
  # parent other than /tmp, so no parent component can be substituted.
  if [ -n "$DS_SESSION_FILE" ] && [ "$(dirname "$DS_SESSION_FILE")" != "$ds_session_dir" ]; then
    DS_SESSION_FILE=""
  fi
  # The prefix check validates a STRING; `>>` follows symlinks. A local process can pre-create
  # $TMPDIR/ds-pipeline-session-evil as a symlink to any writable target — the pathname matches
  # the prefix, has no `..`, and the append lands on the target. Reproduced before this line
  # existed: the victim file received `src:card`. Reject the symlink instead of resolving it;
  # the guard has no reason to accept one, so there is nothing to preserve.
  if [ -L "$DS_SESSION_FILE" ]; then
    DS_SESSION_FILE=""
  fi
  # A hard link defeats [ -L ] — a second directory entry to the same inode IS a regular file.
  # `ln $TARGET $TMPDIR/ds-pipeline-session-bait` then makes `>>` write through to $TARGET.
  # Reproduced before this line existed.
  #
  # NOT a privilege escalation: fs.protected_hardlinks=1 (default on modern Linux) only permits
  # linking a file you own or can already read+write, so the guard grants no reach the caller
  # lacks. It IS a containment break — the guard claims to write only inside its own directory —
  # which is why it is closed rather than deferred.
  #
  # stat is not POSIX-portable: -c is GNU, -f is BSD/macOS, and developers here run both.
  # Unparseable output leaves the path accepted (fail-open, consistent with the rest of the guard).
  if [ -n "$DS_SESSION_FILE" ] && [ -e "$DS_SESSION_FILE" ]; then
    ds_link_count=$(stat -c %h "$DS_SESSION_FILE" 2>/dev/null || stat -f %l "$DS_SESSION_FILE" 2>/dev/null)
    case "$ds_link_count" in
      ''|*[!0-9]*) : ;;                                       # unparseable → keep
      *) [ "$ds_link_count" -gt 1 ] && DS_SESSION_FILE="" ;;   # >1 entry → hard link → reject
    esac
    unset ds_link_count
  fi
  unset ds_session_dir
fi

if [ -z "$DS_SESSION_FILE" ]; then
  session_id=$(printf '%s' "$input" | sed -n 's/.*"session_id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)
  session_id=$(printf '%s' "$session_id" | tr -cd 'A-Za-z0-9-')
  if [ -n "$session_id" ]; then
    DS_SESSION_FILE="${TMPDIR:-/tmp}/ds-pipeline-session-${session_id}"
  else
    DS_SESSION_FILE="${TMPDIR:-/tmp}/ds-pipeline-session-$$"
  fi
  # Choosing our own filename does not mean we own the directory ENTRY. A local process can
  # pre-create the derived path as a symlink or a hard link before the guard runs, and the two
  # `>>` writes below then follow it — the same containment break the caller-supplied branch
  # closes above, still reachable here because that whole block is gated on DS_SESSION_FILE
  # already being set. Reproduced: with the derived path pre-created as a symlink to a victim
  # file and DS_SESSION_FILE unset, the victim received `spec:toggle`.
  #
  # The LOCATION checks above deliberately do not apply here — the guard picked the name, and a
  # redirected TMPDIR only moves the guard's own file (see the note above the caller-supplied
  # block). What has to be rejected is the REFERENT. Unlink the planted entry rather than
  # blanking the path: `rm` on a symlink or a hard link removes that directory entry only, never
  # the target, and the append then creates a fresh regular file so session tracking survives.
  # A legitimate session file is a regular file with one link and is left untouched.
  #
  # The TOCTOU window between this check and the writes stays open, as deferred in round 5:
  # closing it needs O_NOFOLLOW|O_EXCL on a real descriptor, which POSIX shell cannot express.
  if [ -L "$DS_SESSION_FILE" ]; then
    rm -f "$DS_SESSION_FILE"
  elif [ -e "$DS_SESSION_FILE" ]; then
    # stat is not POSIX-portable: -c is GNU, -f is BSD/macOS. Unparseable output leaves the file
    # in place (fail-open, consistent with the rest of the guard).
    ds_link_count=$(stat -c %h "$DS_SESSION_FILE" 2>/dev/null || stat -f %l "$DS_SESSION_FILE" 2>/dev/null)
    case "$ds_link_count" in
      ''|*[!0-9]*) : ;;
      *) [ "$ds_link_count" -gt 1 ] && rm -f "$DS_SESSION_FILE" ;;
    esac
    unset ds_link_count
  fi
fi

# ── Cleanup trap — remove session file on exit ────────────────────────────────
# Only clean up if we own the file (i.e. it was not pre-set by a test).
# We register the trap unconditionally; since tests always pre-set DS_SESSION_FILE
# before the script runs, the rm will be a no-op there (the test controls cleanup).
trap 'rm -f "${TMPDIR:-/tmp}/ds-pipeline-session-$$"' EXIT 2>/dev/null || true

# ── Extract file_path ─────────────────────────────────────────────────────────
# Handles double-quoted JSON values. Falls back to empty string on failure.
file_path=$(printf '%s' "$input" | sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)

# Fail-open: no file_path → allow.
if [ -z "$file_path" ]; then
  exit 0
fi

# ── Is this a DS component source file? ───────────────────────────────────────
# Must contain DS_SRC_PATTERN but NOT be one of the known barrel files (exact match).
is_ds_src=0
case "$file_path" in
  *"$DS_SRC_PATTERN"*)
    # Check for exact barrel suffix match — anchored, not a substring
    is_barrel=0
    for barrel in $DS_BARREL_SUFFIXES; do
      case "$file_path" in
        *"$barrel") is_barrel=1; break ;;
      esac
    done
    if [ "$is_barrel" -eq 0 ]; then
      is_ds_src=1
    fi
    ;;
esac

# ── Is this a DS component spec file? ─────────────────────────────────────────
is_ds_spec=0
case "$file_path" in
  *"$DS_SPEC_PATTERN"*)
    is_ds_spec=1 ;;
esac

# ── Is this a DS retrofit migration addendum? ─────────────────────────────────
# The two document patterns cannot both match: "docs/component-retrofits/" does not contain
# "docs/component-specs/" as a substring, so classification stays unambiguous.
is_ds_retrofit=0
case "$file_path" in
  *"$DS_RETROFIT_PATTERN"*)
    is_ds_retrofit=1 ;;
esac

# Early-exit: not a DS file → allow (no blast radius).
if [ "$is_ds_src" -eq 0 ] && [ "$is_ds_spec" -eq 0 ] && [ "$is_ds_retrofit" -eq 0 ]; then
  exit 0
fi

# ── Extract component name ────────────────────────────────────────────────────
# Derive the component name from the file_path.
# For src/components/<c>/... → component name is <c>
# For src/components/ui/<c>.tsx → component name is <c>
# For docs/component-specs/<c>.md → component name is <c>
# For docs/component-retrofits/<c>.md → component name is <c>
# All four converge on one name, which is what makes the session-state lookup below match
# across a PR-1 document and its component's source regardless of which layout either uses.
component_name=""

if [ "$is_ds_src" -eq 1 ]; then
  # Strip up to and including src/components/
  after_src=$(printf '%s' "$file_path" | sed 's|.*src/components/||')
  # Strip leading "ui/" if present
  after_ui=$(printf '%s' "$after_src" | sed 's|^ui/||')
  # Take the first path segment (directory or filename without extension)
  component_name=$(printf '%s' "$after_ui" | sed 's|/.*||' | sed 's|\.[^.]*$||')
fi

# resolve_document_component <file_path> <directory_prefix>
#
# Resolve <c> from a PR-1 document path `<prefix><c>.md`. ONE function for both kinds, so that
# both PR-1 document kinds and both source layouts converge on ONE component name:
#   docs/component-specs/<c>.md       →  <c>
#   docs/component-retrofits/<c>.md   →  <c>
#   src/components/<c>/...            →  <c>   (layout B, resolved above)
#   src/components/ui/<c>.tsx         →  <c>   (layout A, resolved above)
# That convergence is what makes the session-state lookup below match a PR-1 document against its
# component's source regardless of which kind or layout either uses.
#
# The two callers were byte-identical apart from the prefix (deferred from an earlier change
# round 6). The source resolver is deliberately NOT folded in: it strips an optional `ui/`
# segment, so it is a different transformation, not the same one with a different argument.
#
# The prefix strip uses shell parameter expansion, NOT sed. The inline code this replaced used
# single-quoted literal sed expressions, so it was safe by construction: no evolution of the
# constants could inject a metacharacter into the sed program. Passing the prefix as an argument
# into `sed "s|.*$2||"` would have traded that guarantee for a caller contract in a comment — and
# this guard is FAIL-OPEN, so a prefix containing `|`, `&`, `\` or `[` would not error, it would
# yield an empty component name and let the write through. `"${1##*"$2"}"` matches the prefix
# literally: the inner quotes make it a fixed string rather than a glob.
#
# The inner quotes have no test witness and cannot easily have one: both constants are plain
# path text, so removing them changes nothing observable today (verified by mutation). They are
# the whole point of the change — the construction-safe property — so they stay, and this note
# records that the guarantee rests on reading the code, not on a failing test.
#
# `##`, not `#`. `sed 's|.*p||'` is greedy — it strips to the LAST occurrence — and only the
# longest-match operator reproduces that. On `docs/component-specs/docs/component-specs/x.md`,
# `#` yields component `docs` where sed yields `x`. Pinned by a regression case in the suite.
resolve_document_component() {
  local rest="${1##*"$2"}"
  printf '%s' "$rest" \
    | sed 's|\.[^.]*$||' \
    | sed 's|/.*||'
}

if [ "$is_ds_spec" -eq 1 ]; then
  component_name=$(resolve_document_component "$file_path" "$DS_SPEC_PATTERN")
fi

if [ "$is_ds_retrofit" -eq 1 ]; then
  component_name=$(resolve_document_component "$file_path" "$DS_RETROFIT_PATTERN")
fi

# Fail-open: if we can't determine the component name, allow.
if [ -z "$component_name" ]; then
  exit 0
fi

# ── Block condition 1: protected branch + component source write ──────────────
if [ "$is_ds_src" -eq 1 ]; then
  # Try to get current branch. Fail-open on any error.
  #
  # Resolve git relative to THE FILE, not to the hook process's working directory. Nothing cd's to
  # the file being written, so a bare `git rev-parse` answers for whatever checkout the process
  # happens to sit in — which, with git worktrees, is routinely not the checkout that owns the file.
  # Both directions were broken and only one was visible :
  #
  #   false positive — cwd on `spec/…`, file in a `feature/…` worktree: the write was BLOCKED with a
  #     branch name the author had never checked out. Loud, diagnosed in minutes.
  #   false negative — the inverse, and silent: cwd on any non-protected branch, file in a worktree
  #     that IS on spec/decomp/research, and the write passes with no output. The PR-1/PR-2 boundary
  #     this condition exists to enforce is simply not enforced. With ~12 concurrent design-tokens
  #     worktrees, cwd matching the file's checkout is the exception, not the rule.
  #
  # Walk up to the nearest EXISTING ancestor before handing the path to `git -C`: a Write may create
  # the first file in a new directory, and `git -C` on a non-existent path exits non-zero, which
  # fail-open turns into "no branch" — i.e. back to not enforcing. For a relative path the walk ends
  # at ".", which reproduces the previous behaviour exactly, so nothing that worked before changes.
  current_branch=""
  resolve_dir=$(dirname "$file_path")
  while [ ! -d "$resolve_dir" ] && [ "$resolve_dir" != "/" ] && [ "$resolve_dir" != "." ]; do
    resolve_dir=$(dirname "$resolve_dir")
  done
  current_branch=$(git -C "$resolve_dir" rev-parse --abbrev-ref HEAD 2>/dev/null) || true

  if [ -n "$current_branch" ] && [ "$current_branch" != "HEAD" ]; then
    for prefix in $PROTECTED_PREFIXES; do
      case "$current_branch" in
        "$prefix"*)
          echo "ds-pipeline-guard: BLOCKED — Writing DS component source '$file_path' on protected branch '$current_branch'." >&2
          echo "  Rule: .claude/rules/ds-component-pipeline.md §PR-1 vs PR-2 boundary" >&2
          echo "  Component: $component_name" >&2
          echo "  Implementation (PR-2) must happen on a non-protected branch after PR-1 (spec) is merged." >&2
          exit 2 ;;
      esac
    done
  fi
fi

# ── Block condition 2: within-session spec+impl mixing ───────────────────────
# Check if this write would mix spec and source for the same component in one session.
#
# Every session-state lookup below uses `grep -qxF` — EXACT WHOLE-LINE match, fixed string.
# The `-x` is load-bearing, not cosmetic. Session lines are written as `<key>:<component>`, so a
# plain substring match makes any component whose name is a PREFIX of another component's name
# collide: a session entry for `checkbox-card` would satisfy a lookup for `checkbox`, falsely
# BLOCKING an unrelated write. Measured against the real design-tokens inventory (46 components),
# six live pairs collide: accordion/accordion-card, checkbox/checkbox-card, search/search-field,
# select/selectable-entity-card, status/status-distribution-bar, table/table-actions. `status` is
# in the retrofit migration set, so the retrofit path would have walked straight into it.
# Blocks for the genuine same-component case are unaffected — the whole line matches exactly.

if [ "$is_ds_src" -eq 1 ]; then
  # We are writing source. Check whether a PR-1 document for the same component was written
  # this session — either a frozen spec or a retrofit migration addendum. The rule states the
  # two are alternatives, not a hierarchy, so either one on the other side of this boundary is
  # the same violation. They are recorded under distinct keys only so the message names the
  # right one.
  if [ -f "$DS_SESSION_FILE" ]; then
    prior_doc=""
    if grep -qxF "spec:${component_name}" "$DS_SESSION_FILE" 2>/dev/null; then
      prior_doc="spec"
    elif grep -qxF "retro:${component_name}" "$DS_SESSION_FILE" 2>/dev/null; then
      prior_doc="retrofit migration addendum"
    fi
    if [ -n "$prior_doc" ]; then
      echo "ds-pipeline-guard: BLOCKED — Writing DS component source '$file_path' in the same session that already wrote the $prior_doc for '$component_name'." >&2
      echo "  Rule: .claude/rules/ds-component-pipeline.md §PR-1 vs PR-2 boundary" >&2
      echo "  Component: $component_name" >&2
      echo "  The $prior_doc (PR-1) must be merged by a human before implementation (PR-2) begins." >&2
      exit 2
    fi
  fi
  # Record this source write in session state.
  printf 'src:%s\n' "$component_name" >> "$DS_SESSION_FILE" 2>/dev/null || true
fi

# A spec and a retrofit addendum take the SAME side of the PR-1/PR-2 boundary, so one branch
# handles both. doc_key keeps them distinct in session state purely for message accuracy.
doc_kind=""
doc_key=""
if [ "$is_ds_spec" -eq 1 ]; then
  doc_kind="spec"
  doc_key="spec"
elif [ "$is_ds_retrofit" -eq 1 ]; then
  doc_kind="retrofit migration addendum"
  doc_key="retro"
fi

if [ -n "$doc_kind" ]; then
  # We are writing a PR-1 document. Check if source for the same component was written this
  # session.
  if [ -f "$DS_SESSION_FILE" ]; then
    if grep -qxF "src:${component_name}" "$DS_SESSION_FILE" 2>/dev/null; then
      echo "ds-pipeline-guard: BLOCKED — Writing DS component $doc_kind '$file_path' in the same session that already wrote source for '$component_name'." >&2
      echo "  Rule: .claude/rules/ds-component-pipeline.md §PR-1 vs PR-2 boundary" >&2
      echo "  Component: $component_name" >&2
      echo "  The $doc_kind (PR-1) and implementation (PR-2) must be in separate PRs with a human merge checkpoint." >&2
      exit 2
    fi
  fi
  # Record this PR-1 document write in session state.
  printf '%s:%s\n' "$doc_key" "$component_name" >> "$DS_SESSION_FILE" 2>/dev/null || true
fi

# No violation found — allow.
exit 0
