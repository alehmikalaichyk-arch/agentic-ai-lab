import type { Meta, StoryObj } from '@storybook/react';

import { Api, Note, Page, Section, Specimen, Specimens } from '@/showcase';
import { Button } from '@/ui-staging/button';
import { Progress } from '@/ui-staging/progress';
import { Skeleton } from '@/ui-staging/skeleton';
import { Spinner } from '@/ui-staging/spinner';

const meta = {
  title: 'Staging/Progress, Spinner & Skeleton',
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  render: () => (
    <Page
      title="Progress, Spinner & Skeleton"
      tier="staging"
      summary="Three answers to 'it is not ready yet'. Which one is right depends entirely on whether you know how long it will take and whether you know the shape of what is coming."
    >
      <Section
        title="Progress"
        description="For work whose completion you can actually measure. A progress bar that jumps 0 → 90 → 100 because those were the only three moments you could report is worse than a spinner."
      >
        <Specimens columns={4}>
          <Specimen label="value={0}">
            <Progress value={0} className="w-full" />
          </Specimen>
          <Specimen label="value={40}">
            <Progress value={40} className="w-full" />
          </Specimen>
          <Specimen label="value={100}">
            <Progress value={100} className="w-full" />
          </Specimen>
          <Specimen label="value={undefined}" hint="renders empty, not indeterminate">
            <Progress className="w-full" />
          </Specimen>
        </Specimens>
      </Section>

      <Section
        title="Spinner"
        description="For work of unknown duration. It says something is happening and nothing else — which is the honest message when you have no number to give."
      >
        <Specimens columns={4}>
          <Specimen label="default">
            <Spinner />
          </Specimen>
          <Specimen label='className="size-6"'>
            <Spinner className="size-6" />
          </Specimen>
          <Specimen label="in a button" hint="the common use">
            <Button disabled>
              <Spinner />
              Running gates
            </Button>
          </Specimen>
          <Specimen label="with a label" hint="tell them what is slow">
            <div className="flex items-center gap-2 text-sm text-fg-subtle">
              <Spinner />
              Building Storybook…
            </div>
          </Specimen>
        </Specimens>
      </Section>

      <Section
        title="Skeleton"
        description="For content whose shape you already know. Its whole value is that the layout does not jump when the data lands — a skeleton that is the wrong shape is worse than empty space."
      >
        <Specimens columns={3}>
          <Specimen label="a line">
            <Skeleton className="h-4 w-full" />
          </Specimen>
          <Specimen label="a paragraph">
            <div className="w-full space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </Specimen>
          <Specimen label="a person row" hint="matches the real layout">
            <div className="flex w-full items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          </Specimen>
        </Specimens>
      </Section>

      <Section title="API">
        <Api
          rows={[
            {
              prop: 'Progress value',
              type: 'number | null',
              note: '0–100. Omitting it renders an empty track, not an indeterminate bar.',
            },
            { prop: 'Progress max', type: 'number', def: '100' },
            { prop: 'Spinner className', type: 'string', note: 'size-* sets it. No size prop.' },
            {
              prop: 'Skeleton className',
              type: 'string',
              note: 'Shape is entirely yours — width, height, radius.',
            },
          ]}
        />
      </Section>

      <Section title="Before you use it">
        <div className="space-y-3">
          <Note>
            None of these announces itself. A region that swaps a skeleton for real
            content wants <code className="font-mono text-xs">aria-busy</code> while it
            loads, or a screen-reader user hears nothing change and then finds the page
            silently different.
          </Note>
          <Note tone="warning">
            There is no indeterminate Progress here. Passing no value gives an empty bar
            that reads as "0% and stuck" — use a Spinner when you have no number.
          </Note>
        </div>
      </Section>
    </Page>
  ),
};
