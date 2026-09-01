#!/usr/bin/env bash
# =============================================================================
# draft-links.sh — the two links a PR-1 body needs
# =============================================================================
# Stage #4.5 asks the owner to LOOK at a draft before the spec is frozen. That only
# happens if looking costs one click, and neither obvious route gives one:
#
#   the published Storybook  deploys from main, so it cannot show a draft that lives
#                            on a spec branch — it would appear after the merge it
#                            was supposed to inform
#   the CI artifact          is a zip to download and unpack
#
# So the draft is served locally and its exact story URL printed. Not the Storybook
# root — the story. "It is in there somewhere, look for it" is how a checkpoint
# becomes optional.
#
# Usage:
#   ./tools/draft-links.sh                 every draft currently in the repository
#   ./tools/draft-links.sh horizontal-stepper
#
# Reads the RUNNING dev server's index rather than guessing the id from the title:
# Storybook derives ids by its own slug rules, and a guessed id produces a URL that
# loads the shell and silently shows nothing.
# =============================================================================
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

PORT="${STORYBOOK_PORT:-6006}"
BASE="http://localhost:${PORT}"
WANTED="${1:-}"

if ! curl -sf --max-time 3 "${BASE}/index.json" -o /tmp/sb-index.json 2>/dev/null; then
  cat <<MSG
No Storybook responding on ${BASE}.

Start it, leave it running, then re-run this:

  npm run storybook &
  ./tools/draft-links.sh ${WANTED}

The server lives only as long as the session that started it. Say so when you paste
the link — a dead localhost link in a PR body is worse than no link, because the
reviewer assumes they broke something.
MSG
  exit 1
fi

python3 - "$WANTED" "$BASE" <<'PY'
import json, sys
wanted, base = sys.argv[1], sys.argv[2]
index = json.load(open('/tmp/sb-index.json'))
entries = index.get('entries', {})

# A draft is any story whose importPath is under component-prototypes/.
drafts = {
    sid: e for sid, e in entries.items()
    if e.get('importPath', '').startswith('./component-prototypes/')
    and (not wanted or wanted in e.get('importPath', ''))
}

if not drafts:
    if wanted:
        print(f"No draft story found for '{wanted}'.")
        print("Expected: component-prototypes/%s/%s.stories.tsx" % (wanted, wanted))
    else:
        print("No drafts in component-prototypes/ — nothing to link.")
        print("Stage #4.5 produces one before PR-1 opens, unless the component is")
        print("trivially non-visual, in which case the PR body says so in one line.")
    raise SystemExit(1)

print("Visual draft — paste into the PR body under ## Visual:\n")
for sid, e in sorted(drafts.items()):
    print(f"  {e['title']} — {e['name']}")
    print(f"  {base}/?path=/story/{sid}\n")
print("Note in the PR that this is a local server and will stop when the session ends,")
print("and attach screenshots as the durable record.")
PY
