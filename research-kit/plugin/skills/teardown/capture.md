# Capture, by access tier

## Tier `none`: public surfaces only

Marketing site, product imagery, help centre, demo videos, app-store listings,
review-site screenshots. Nothing behind a login. Colours are **sampled** from
image pixels; claims are **asserted** with their source.

Dispatch a subagent for the site half with an explicit brief: map the sitemap,
save raw HTML and extracted text per page, harvest product imagery at full
resolution (prefer the largest `srcset` candidate, strip resize params), and
read style facts from the fetched stylesheets rather than eyeballing them.
Have it write a manifest naming each image's source page, original URL, pixel
size and what UI it shows.

## Tier `screenshots`: a teammate's own trial or install

They supply the images; you curate and read them. Values are **eyeballed**.

## Tier `seat`: a session that is already signed in

Drive navigation with the Chrome MCP but capture with macOS `screencapture`.
Two traps make the obvious routes fail: the MCP's own screenshot writes no file
anywhere, and its CDP capture renders an emulated viewport, so an open side
panel collapses the app to its mobile layout.

Working recipe (macOS; on Linux use the equivalent window tool or a
headless browser at a fixed viewport): AppleScript a fresh window at a clean size on one display, set
the tab URL, front the window, sleep, then `screencapture -x -R"x,y,w,h"` on
the page area. Escape any modal first. Close the window when done.

Route discovery: nav items are often JS handlers with no `href`. Fetch the
app's own script bundles from the page and regex for route strings.

At this tier you can read computed styles and custom properties, so values are
**measured** and contrast can actually be checked.

## Video: the cheapest evidence there is

**Count their videos before you watch one.** Check the demo pages, the product
page, the footer, and any `<iframe>` or `<video>` in the harvested HTML. A
two-sided product has a demo per side, and skipping one is how the first run
shipped two wrong claims.

**Loom hands you a transcript for free.** The share page HTML carries signed
CDN links:

```bash
curl -sL -A "Mozilla/5.0" "https://www.loom.com/share/<id>" -o loom.html
grep -oE 'https://cdn\.loom\.com/mediametadata/captions/[^"]*' loom.html \
  | head -1 | sed 's/\\u0026/\&/g' | xargs curl -s -o captions.vtt
```

Parse the `.vtt` into ~20-second chunks and you have a timestamped walkthrough
with no transcription run. `yt-dlp` pulls the video itself. Self-hosted `.mp4`
files just need `curl`.

**Frames.** A fixed interval beats scene detection for a narrated demo, because
the interesting moments are where the narrator pauses, not where the pixels
change:

```bash
ffmpeg -v error -i demo.mp4 -vf "fps=1/5,scale=1280:-2" f/t_%03d.png
```

Read them in batches, pick the beats, then re-extract just those at full width
with `-ss`.

## The two video traps

**Never sample colour from a recorded video.** A white page reads as `#b5b5b5`
in a Loom encode. Every colour taken from a video is **eyeballed**. If you want
real values, read the stylesheet or use a seat.

**Blend a presenter overlay, never black it out.** Filling the webcam rectangle
with a dark colour renders as a broken-looking block on every frame, on the page
and on the board. Sample the median colour of the six-pixel strip directly above
the rectangle and fill with that, so the patch disappears.

## Sizing screens for the repo

At most 24 per generation, at most 250 KB each. Resize to 1600 px wide, then
quantise, stepping down until it fits: 256 colours dithered, 256 undithered, 128
undithered, and only then reduce the width. Full harvests stay outside the repo
in the session scratchpad or a directory the user names, never in the repo.
