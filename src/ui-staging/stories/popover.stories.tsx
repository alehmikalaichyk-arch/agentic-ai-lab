import type { Meta, StoryObj } from '@storybook/react';
import { HelpCircleIcon } from 'lucide-react';

import { Api, Note, Page, Section, Specimen, Specimens } from '@/showcase';
import { Button } from '@/ui-staging/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/ui-staging/hover-card';
import { Input } from '@/ui-staging/input';
import { Label } from '@/ui-staging/label';
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/ui-staging/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/ui-staging/tooltip';

const meta = {
  title: 'Staging/Popover, Tooltip & HoverCard',
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  render: () => (
    <Page
      title="Popover, Tooltip & HoverCard"
      tier="staging"
      summary="Three small floating surfaces, told apart by what opens them and what may live inside. Getting this choice wrong is the most common way a prototype becomes unusable by keyboard."
    >
      <Section
        title="The three, side by side"
        description="Click, hover-with-no-content, hover-with-content. The trigger and the payload together decide which one you need."
      >
        <Specimens columns={3}>
          <Specimen label="Popover" hint="click — may contain controls">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">Filter</Button>
              </PopoverTrigger>
              <PopoverContent className="grid gap-3">
                <PopoverHeader>
                  <PopoverTitle>Filter components</PopoverTitle>
                  <PopoverDescription>Applies as you type.</PopoverDescription>
                </PopoverHeader>
                <div className="grid gap-2">
                  <Label htmlFor="sb-pop-q">Name contains</Label>
                  <Input id="sb-pop-q" placeholder="but" />
                </div>
              </PopoverContent>
            </Popover>
          </Specimen>
          <Specimen label="Tooltip" hint="hover / focus — text only">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="What is a tier?">
                    <HelpCircleIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Staging components carry no spec.</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Specimen>
          <Specimen label="HoverCard" hint="hover, delayed — rich preview">
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="link">@input</Button>
              </HoverCardTrigger>
              <HoverCardContent className="grid gap-1">
                <p className="text-sm font-medium">Input v1</p>
                <p className="text-xs text-fg-subtle">
                  Frozen spec, 12 tests, a11y audit with zero blockers.
                </p>
              </HoverCardContent>
            </HoverCard>
          </Specimen>
        </Specimens>
      </Section>

      <Section
        title="Placement"
        description="side and align are on the Content, not the trigger. Each will flip itself to stay on screen, so what you set is a preference rather than a guarantee."
      >
        <Specimens columns={4}>
          {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
            <Specimen key={side} label={`side="${side}"`}>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    {side}
                  </Button>
                </PopoverTrigger>
                <PopoverContent side={side} className="text-sm">
                  Opens {side}.
                </PopoverContent>
              </Popover>
            </Specimen>
          ))}
        </Specimens>
      </Section>

      <Section title="API">
        <Api
          rows={[
            { prop: 'open / defaultOpen', type: 'boolean', note: 'With onOpenChange.' },
            {
              prop: 'Content side',
              type: "'top' | 'right' | 'bottom' | 'left'",
              def: "'bottom'",
              note: 'Flips when it would overflow.',
            },
            { prop: 'Content align', type: "'start' | 'center' | 'end'", def: "'center'" },
            { prop: 'Content sideOffset', type: 'number', note: 'Gap from the trigger, in px.' },
            {
              prop: 'TooltipProvider delayDuration',
              type: 'number',
              note: 'Wrap once, high in the tree — not per tooltip.',
            },
          ]}
        />
      </Section>

      <Section title="Choosing between them">
        <div className="space-y-3">
          <Note tone="warning">
            <strong>Never put a control in a Tooltip or a HoverCard.</strong> Both open
            on hover, so a keyboard or touch user cannot reach what is inside. A button,
            a link, an input — anything interactive means you needed a Popover.
          </Note>
          <Note>
            A Tooltip's trigger must be focusable. On an icon-only button it already is;
            on a bare <code className="font-mono text-xs">span</code> it is not, and the
            tooltip becomes mouse-only without anything reporting an error.
          </Note>
        </div>
      </Section>
    </Page>
  ),
};
