import * as React from 'react';

/*
 * The presentation kit every component page is built from.
 *
 * WHY IT EXISTS
 * -------------
 * A showcase page has one job: let someone who has never seen the component answer
 * three questions without reading source — what is it, what variants does it have,
 * and what does each state look like. Storybook gives you a canvas and a props
 * table; it does not give you that shape. Without a shared kit each page invents its
 * own, and fifty pages that each invent one are fifty pages nobody trusts to be
 * complete.
 *
 * THE RULE THAT MAKES IT READABLE
 * -------------------------------
 * Every specimen carries its own name, directly under it. A grid of five buttons is
 * decoration; a grid of five buttons captioned default / secondary / destructive /
 * outline / ghost is a reference you can use from across the room. That caption is
 * the difference between a page that looks nice and a page that answers a question,
 * and it is why `Specimen` takes `label` as a required prop rather than an optional
 * one.
 *
 * TOKENS
 * ------
 * The chrome uses this repository's semantic utilities — surface-*, fg-*,
 * outline-* — never the shadcn role names the staged components use. That is
 * deliberate: if the adapter mapping broke, chrome drawn from the same variables
 * would break identically and hide the failure. Chrome and specimen must fail
 * independently.
 */

/* ------------------------------------------------------------------ page shell */

export const Page = ({
  title,
  tier,
  summary,
  children,
}: {
  title: string;
  /** Which tier the component belongs to. Rendered as a badge — see TierBadge. */
  tier: 'governed' | 'staging';
  /** One sentence. What the component is for, not how it is built. */
  summary: string;
  children: React.ReactNode;
}) => (
  <div className="min-h-full bg-surface-default px-8 py-10 text-fg-default">
    <header className="mx-auto mb-10 max-w-5xl">
      <div className="mb-3 flex items-center gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <TierBadge tier={tier} />
      </div>
      <p className="max-w-2xl text-md text-fg-subtle">{summary}</p>
    </header>
    <div className="mx-auto max-w-5xl">{children}</div>
  </div>
);

/*
 * The tier badge is the one piece of chrome that is not decoration. Two components
 * on adjacent sidebar entries can have identical APIs and completely different
 * guarantees — one has a frozen spec, tests and an accessibility audit; the other was
 * pulled from a registry an hour ago. Someone choosing between them needs to see
 * which is which before they read anything else.
 */
const TierBadge = ({ tier }: { tier: 'governed' | 'staging' }) =>
  tier === 'governed' ? (
    <span className="rounded-full bg-surface-status-success px-3 py-1 text-xs font-medium text-fg-status-success">
      Design system · spec, tests, a11y audit
    </span>
  ) : (
    <span className="rounded-full bg-surface-neutral-subtle px-3 py-1 text-xs font-medium text-fg-subtle">
      Staging · no spec, no tests, no audit
    </span>
  );

/* --------------------------------------------------------------------- section */

export const Section = ({
  title,
  description,
  children,
}: {
  title: string;
  /** Optional. Say what the reader should notice, not what they can already see. */
  description?: string;
  children: React.ReactNode;
}) => (
  <section className="mb-10">
    <div className="mb-4 border-b border-outline-default pb-2">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-fg-subtlest">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 max-w-2xl text-sm text-fg-subtle">{description}</p>
      ) : null}
    </div>
    {children}
  </section>
);

/* -------------------------------------------------------------------- specimen */

export const Specimen = ({
  label,
  /** Optional second line — the prop value, a caveat, a measurement. */
  hint,
  /** Lay the specimen out on its own row. For wide things: tables, banners, menus. */
  full,
  children,
}: {
  label: string;
  hint?: string;
  full?: boolean;
  children: React.ReactNode;
}) => (
  <figure className={full ? 'w-full' : ''}>
    <div
      className={[
        // outline-default, not outline-subtle. The page and the specimen are now the
        // same white, so the border is the ONLY thing separating them — and
        // outline-subtle (#f0f2f7) against #ffffff is close to invisible.
        'flex min-h-20 items-center justify-center rounded-md border border-outline-default bg-surface-default p-5',
        full ? 'w-full' : '',
      ].join(' ')}
    >
      {children}
    </div>
    <figcaption className="mt-2 text-center">
      <code className="font-mono text-xs text-fg-default">{label}</code>
      {hint ? <div className="mt-0.5 text-xs text-fg-subtlest">{hint}</div> : null}
    </figcaption>
  </figure>
);

/*
 * Specimens sit in a grid rather than a flex row on purpose: a row lets a long
 * specimen stretch and a short one collapse, so the captions stop lining up and the
 * page reads as a jumble. Equal cells keep the captions on a baseline, which is what
 * makes a grid of twelve scannable instead of exhausting.
 */
export const Specimens = ({
  columns = 4,
  children,
}: {
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
}) => {
  const cols: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-5',
    6: 'grid-cols-3 md:grid-cols-6',
  };
  return <div className={`grid gap-5 ${cols[columns]}`}>{children}</div>;
};

/* ----------------------------------------------------------------------- notes */

/*
 * For the thing a picture cannot say: a known deviation, a token that is below AA, a
 * prop that looks like a defect and is not. Pages without somewhere to put this end
 * up either omitting it or burying it in a comment nobody reads.
 */
export const Note = ({
  tone = 'info',
  children,
}: {
  tone?: 'info' | 'warning';
  children: React.ReactNode;
}) => (
  <div
    className={[
      'rounded-md border-l-2 px-4 py-3 text-sm',
      tone === 'warning'
        ? 'border-outline-status-warning bg-surface-status-warning text-fg-default'
        : 'border-outline-brand bg-surface-brand-subtlest text-fg-default',
    ].join(' ')}
  >
    {children}
  </div>
);

/* -------------------------------------------------------------------- API table */

/*
 * A hand-written prop table, used only where Storybook's generated one cannot help.
 * Autodocs derives its table from the component's TypeScript props; for a component
 * whose props are a spread of React.ComponentProps<'div'> that table is 200 rows of
 * DOM attributes and says nothing. This is for the handful of props that are the
 * component's actual contract.
 */
export const Api = ({
  rows,
}: {
  rows: Array<{ prop: string; type: string; def?: string; note?: string }>;
}) => (
  <div className="overflow-hidden rounded-md border border-outline-default">
    <table className="w-full text-left text-sm">
      <thead className="bg-surface-neutral-subtlest text-xs uppercase tracking-wide text-fg-subtlest">
        <tr>
          <th className="px-4 py-2 font-medium">Prop</th>
          <th className="px-4 py-2 font-medium">Type</th>
          <th className="px-4 py-2 font-medium">Default</th>
          <th className="px-4 py-2 font-medium">Notes</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.prop} className="border-t border-outline-subtle">
            <td className="px-4 py-2 font-mono text-xs text-fg-default">{r.prop}</td>
            <td className="px-4 py-2 font-mono text-xs text-fg-subtle">{r.type}</td>
            <td className="px-4 py-2 font-mono text-xs text-fg-subtle">{r.def ?? '—'}</td>
            <td className="px-4 py-2 text-fg-subtle">{r.note ?? ''}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
