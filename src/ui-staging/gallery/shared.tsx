import * as React from 'react';

/*
 * Layout helpers for the staging galleries.
 *
 * Not a `.stories.tsx`, so Storybook's glob ignores it. Deliberately plain: these
 * galleries exist to show what the staging tier contains, and a helper with opinions
 * of its own would start styling the thing being inspected.
 *
 * Everything here uses semantic DS utilities (fg-*, surface-*, outline-*) rather than
 * the shadcn role names the components use. The chrome around a component should not
 * be drawn from the same variables as the component, or a broken mapping would hide
 * itself by breaking the frame identically.
 */

export const Grid = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-surface-page p-6 text-fg-default">{children}</div>
);

export const Case = ({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) => (
  <section className="mb-8">
    <h3 className="mb-1 font-mono text-xs text-fg-subtlest">{name}</h3>
    <div className="rounded-md border border-outline-subtle bg-surface-default p-4">
      {children}
    </div>
  </section>
);

export const Row = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-wrap items-center gap-3">{children}</div>
);

export const Col = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col gap-3">{children}</div>
);
