# The business sweep

Dispatch this as a subagent brief. Every finding carries a URL and a date, and
every source that returns nothing gets written down with the query used.

## Company and money
Their about and story pages; Y Combinator or accelerator profile (status field
included, it is how the first run found an acquisition); Crunchbase and
PitchBook (usually 403, snippets only); the founders' own blogs and newsletters,
which are consistently more honest than the press release; press releases on
their own blog. Cross-check: a funding announcement often re-announces an older
round, and the founder's own post will date it correctly.

## Shipped
Blog and changelog with dates; release notes; the help centre measured as an
article-count and new-slug diff; Wayback snapshots of the home, product and
pricing pages, which give you the real product trajectory when there is no
changelog; app-store listings.

## Said
LinkedIn company page and founder profiles; X; YouTube and Loom; podcasts and
conference talks. Logged-out LinkedIn hides recent posts, so bound the claim.

## Heard
G2, Capterra, GetApp, Software Advice, TrustRadius: rating, count, dates, top
praise and top complaint, quoted short. **Check the dates**: reviews often
belong to a predecessor product and say nothing about what ships now. Reddit
via the pullpush archive when Reddit's own search 403s. Hacker News via the
Algolia API. Trade forums. Glassdoor and Indeed.

## Hiring, read as roadmap
Their careers page, Y Combinator's jobs tab, and the ATS slugs directly:
`boards.greenhouse.io/<name>`, `jobs.lever.co/<name>`,
`jobs.ashbyhq.com/<name>`, `apply.workable.com/<name>`. Engineering roles mean
building; sales roles mean selling; nothing at all, alongside a stalled blog,
means a maintained asset.

## Pricing
Current prices wherever they appear, including FAQ copy when there is no
pricing page. Then the trajectory from Wayback. Note contradictions rather than
picking one; the first run found the same product priced two ways on two pages.

## Positioning
Which competitors they name, and which they never mention. **The absence is the
finding.** On the first run, one vendor named about thirty rivals across seventy
comparison pages and never once mentioned its two closest competitors.
