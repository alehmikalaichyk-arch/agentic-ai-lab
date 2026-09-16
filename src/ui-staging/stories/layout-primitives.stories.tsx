import type { Meta, StoryObj } from '@storybook/react';

import { Api, Note, Page, Section, Specimen, Specimens } from '@/showcase';
import { AspectRatio } from '@/ui-staging/aspect-ratio';
import { Kbd, KbdGroup } from '@/ui-staging/kbd';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/ui-staging/resizable';
import { ScrollArea, ScrollBar } from '@/ui-staging/scroll-area';
import { Separator } from '@/ui-staging/separator';

const meta = {
  title: 'Staging/Layout primitives',
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  render: () => (
    <Page
      title="Layout primitives"
      tier="staging"
      summary="Separator, AspectRatio, ScrollArea, Resizable and Kbd. Small pieces with no opinions of their own — collected here because a page each would say the same three sentences five times."
    >
      <Section
        title="Separator"
        description="Horizontal by default. A vertical one needs a parent with a height, or it collapses to nothing — that is the single most common way this component appears broken."
      >
        <Specimens columns={2}>
          <Specimen label="horizontal" full>
            <div className="w-full space-y-3 text-sm">
              <p>Governed tier</p>
              <Separator />
              <p>Staging tier</p>
            </div>
          </Specimen>
          <Specimen label='orientation="vertical"' hint="parent needs a height">
            <div className="flex h-8 items-center gap-3 text-sm">
              <span>Spec</span>
              <Separator orientation="vertical" />
              <span>Tests</span>
              <Separator orientation="vertical" />
              <span>A11y</span>
            </div>
          </Specimen>
        </Specimens>
      </Section>

      <Section
        title="AspectRatio"
        description="Reserves the box before the content arrives, which is what stops an image loading late from shoving the page down."
      >
        <Specimens columns={3}>
          {([
            ['16 / 9', 16 / 9],
            ['4 / 3', 4 / 3],
            ['1 / 1', 1],
          ] as const).map(([label, ratio]) => (
            <Specimen key={label} label={`ratio={${label}}`} full>
              <div className="w-full">
                <AspectRatio ratio={ratio}>
                  <div className="flex size-full items-center justify-center rounded-md bg-surface-neutral-subtle text-sm text-fg-subtle">
                    {label}
                  </div>
                </AspectRatio>
              </div>
            </Specimen>
          ))}
        </Specimens>
      </Section>

      <Section
        title="ScrollArea"
        description="Replaces the browser's scrollbar with a styled one. It needs a fixed height on the ScrollArea itself — without one there is nothing to overflow and nothing scrolls."
      >
        <Specimens columns={2}>
          <Specimen label="vertical">
            <ScrollArea className="h-32 w-full rounded-md border border-outline-subtle p-3">
              <div className="space-y-2 text-sm">
                {Array.from({ length: 14 }, (_, i) => (
                  <p key={i}>Report line {i + 1}</p>
                ))}
              </div>
            </ScrollArea>
          </Specimen>
          <Specimen label="horizontal" hint="needs an explicit ScrollBar">
            <ScrollArea className="w-full rounded-md border border-outline-subtle">
              <div className="flex gap-3 p-3">
                {Array.from({ length: 10 }, (_, i) => (
                  <div
                    key={i}
                    className="flex size-20 shrink-0 items-center justify-center rounded-md bg-surface-neutral-subtle text-xs"
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </Specimen>
        </Specimens>
      </Section>

      <Section
        title="Resizable"
        description="Drag the handle. Panel sizes are percentages of the group, so they always sum to 100 — you cannot give a panel a pixel width here."
      >
        <Specimens columns={1}>
          <Specimen label='orientation="horizontal"' hint="not `direction` in this version" full>
            <ResizablePanelGroup
              orientation="horizontal"
              className="h-32 w-full rounded-md border border-outline-subtle"
            >
              <ResizablePanel defaultSize={30}>
                <div className="flex h-full items-center justify-center text-sm text-fg-subtle">
                  Sidebar
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={70}>
                <div className="flex h-full items-center justify-center text-sm text-fg-subtle">
                  Content
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </Specimen>
        </Specimens>
      </Section>

      <Section title="Kbd">
        <Specimens columns={3}>
          <Specimen label="single">
            <Kbd>⌘</Kbd>
          </Specimen>
          <Specimen label="KbdGroup">
            <KbdGroup>
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </KbdGroup>
          </Specimen>
          <Specimen label="in a sentence">
            <p className="text-sm text-fg-subtle">
              Press{' '}
              <KbdGroup>
                <Kbd>⌘</Kbd>
                <Kbd>K</Kbd>
              </KbdGroup>{' '}
              to search.
            </p>
          </Specimen>
        </Specimens>
      </Section>

      <Section title="API">
        <Api
          rows={[
            {
              prop: 'Separator orientation',
              type: "'horizontal' | 'vertical'",
              def: "'horizontal'",
              note: 'Vertical needs a sized parent.',
            },
            {
              prop: 'Separator decorative',
              type: 'boolean',
              def: 'true',
              note: 'false exposes it as a real separator to assistive tech.',
            },
            { prop: 'AspectRatio ratio', type: 'number', note: 'width / height, e.g. 16 / 9.' },
            {
              prop: 'ScrollBar orientation',
              type: "'vertical' | 'horizontal'",
              def: "'vertical'",
              note: 'Horizontal must be added by hand.',
            },
            {
              prop: 'ResizablePanelGroup orientation',
              type: "'horizontal' | 'vertical'",
              note: 'NOT `direction` — this registry version wraps the newer Group API.',
            },
            { prop: 'ResizablePanel defaultSize', type: 'number', note: 'Percent of the group.' },
          ]}
        />
      </Section>

      <Section title="Before you use it">
        <Note>
          ScrollArea hides the native scrollbar and draws its own, which also means it
          overrides the scrollbar the operating system was going to give a user who
          configured one. For long document-like content, plain overflow is usually the
          kinder choice.
        </Note>
      </Section>
    </Page>
  ),
};
