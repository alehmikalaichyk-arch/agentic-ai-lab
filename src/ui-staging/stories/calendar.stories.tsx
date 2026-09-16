import type { Meta, StoryObj } from '@storybook/react';

import { Api, Note, Page, Section, Specimen, Specimens } from '@/showcase';
import { Button } from '@/ui-staging/button';
import { Calendar } from '@/ui-staging/calendar';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/ui-staging/carousel';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui-staging/popover';

const meta = {
  title: 'Staging/Calendar & Carousel',
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  render: () => (
    <Page
      title="Calendar & Carousel"
      tier="staging"
      summary="The two heaviest components in the tier — each wraps a third-party library, and each brings that library's API rather than one of its own."
    >
      <Section
        title="Calendar — modes"
        description="react-day-picker underneath. mode decides the shape of the value: a date, an array, or a { from, to } range."
      >
        <Specimens columns={3}>
          <Specimen label='mode="single"' full>
            <Calendar mode="single" className="rounded-md border border-outline-subtle" />
          </Specimen>
          <Specimen label='mode="multiple"' hint="value is an array" full>
            <Calendar mode="multiple" className="rounded-md border border-outline-subtle" />
          </Specimen>
          <Specimen label='mode="range"' hint="value is { from, to }" full>
            <Calendar mode="range" className="rounded-md border border-outline-subtle" />
          </Specimen>
        </Specimens>
      </Section>

      <Section
        title="As a date picker"
        description="There is no DatePicker component in the registry — it is a Calendar inside a Popover, and you assemble it. This is the assembly."
      >
        <Specimens columns={1}>
          <Specimen label="Popover + Calendar">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">Pick a date</Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" />
              </PopoverContent>
            </Popover>
          </Specimen>
        </Specimens>
      </Section>

      <Section
        title="Carousel"
        description="Embla underneath. It scrolls a track; it does not autoplay, loop or paginate unless you ask, and the arrows are components you place yourself."
      >
        <Specimens columns={2}>
          <Specimen label="one per view" full>
            <Carousel className="w-full max-w-xs">
              <CarouselContent>
                {Array.from({ length: 4 }, (_, i) => (
                  <CarouselItem key={i}>
                    <div className="flex h-28 items-center justify-center rounded-md bg-surface-neutral-subtle text-sm">
                      Slide {i + 1}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </Specimen>
          <Specimen label="basis-1/2" hint="two per view, from a utility" full>
            <Carousel className="w-full max-w-xs">
              <CarouselContent>
                {Array.from({ length: 5 }, (_, i) => (
                  <CarouselItem key={i} className="basis-1/2">
                    <div className="flex h-28 items-center justify-center rounded-md bg-surface-neutral-subtle text-sm">
                      {i + 1}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </Specimen>
        </Specimens>
      </Section>

      <Section title="API">
        <Api
          rows={[
            {
              prop: 'Calendar mode',
              type: "'single' | 'multiple' | 'range'",
              note: 'Decides the shape of selected / onSelect.',
            },
            { prop: 'Calendar selected / onSelect', type: 'per mode', note: 'Controlled.' },
            {
              prop: 'Calendar disabled',
              type: 'Matcher',
              note: "react-day-picker's matcher — a date, a range, or a predicate.",
            },
            {
              prop: 'Carousel opts',
              type: 'EmblaOptionsType',
              note: 'e.g. { loop: true, align: "start" }.',
            },
            {
              prop: 'Carousel orientation',
              type: "'horizontal' | 'vertical'",
              def: "'horizontal'",
            },
            {
              prop: 'CarouselItem className',
              type: 'string',
              note: 'basis-* sets how many are visible. There is no itemsPerView prop.',
            },
          ]}
        />
      </Section>

      <Section title="Before you use it">
        <div className="space-y-3">
          <Note tone="warning">
            These two bring react-day-picker and embla into your bundle, and their docs —
            not shadcn's — are where the answers are. If a prototype needs one date
            field, a native{' '}
            <code className="font-mono text-xs">&lt;input type=&quot;date&quot;&gt;</code>{' '}
            costs nothing and works everywhere.
          </Note>
          <Note>
            A carousel hides content behind a gesture, and most people never reach slide
            three. Where every slide matters, a scrollable row or a grid shows more and
            hides nothing.
          </Note>
        </div>
      </Section>
    </Page>
  ),
};
