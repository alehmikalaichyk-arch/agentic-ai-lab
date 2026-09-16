import type { Meta, StoryObj } from '@storybook/react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from 'recharts';

import { Api, Note, Page, Section, Specimen, Specimens } from '@/showcase';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/ui-staging/chart';

const meta = {
  title: 'Staging/Chart',
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const data = [
  { stage: 'req', merged: 4, open: 1 },
  { stage: 'spec', merged: 3, open: 2 },
  { stage: 'impl', merged: 5, open: 1 },
  { stage: 'stories', merged: 2, open: 3 },
  { stage: 'a11y', merged: 3, open: 0 },
];

/*
 * Series colours point at --color-chart-1..5, which src/shadcn-adapter.css binds to
 * this repository's categorical chart ramp. A chart rendering in recharts' own default
 * palette means the adapter's chart block never reached the stylesheet.
 */
const config = {
  merged: { label: 'Merged', color: 'var(--color-chart-1)' },
  open: { label: 'Open', color: 'var(--color-chart-2)' },
};

export const Showcase: Story = {
  render: () => (
    <Page
      title="Chart"
      tier="staging"
      summary="A thin wrapper over recharts that maps a config object to CSS variables and supplies a themed tooltip and legend. The chart itself is still recharts, and its API is the one you will spend your time in."
    >
      <Section
        title="Bar, line and area"
        description="Same data, same config, three recharts components. The wrapper contributes colour and the tooltip; everything about shape is recharts'."
      >
        <Specimens columns={1}>
          <Specimen label="BarChart" full>
            <ChartContainer config={config} className="h-56 w-full">
              <BarChart data={data}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="stage" tickLine={false} axisLine={false} />
                <YAxis width={28} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="merged" fill="var(--color-merged)" radius={4} isAnimationActive={false} />
                <Bar dataKey="open" fill="var(--color-open)" radius={4} isAnimationActive={false} />
              </BarChart>
            </ChartContainer>
          </Specimen>
          <Specimen label="LineChart" full>
            <ChartContainer config={config} className="h-48 w-full">
              <LineChart data={data}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="stage" tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  dataKey="merged"
                  stroke="var(--color-merged)"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ChartContainer>
          </Specimen>
          <Specimen label="AreaChart" full>
            <ChartContainer config={config} className="h-48 w-full">
              <AreaChart data={data}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="stage" tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  dataKey="merged"
                  stroke="var(--color-merged)"
                  fill="var(--color-merged)"
                  fillOpacity={0.15}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ChartContainer>
          </Specimen>
        </Specimens>
      </Section>

      <Section title="API">
        <Api
          rows={[
            {
              prop: 'ChartContainer config',
              type: 'Record<string, { label, color }>',
              note: 'Keys match dataKey. Emits --color-<key> for the subtree.',
            },
            {
              prop: 'ChartContainer className',
              type: 'string',
              note: 'A height is required — the chart fills its parent and has none of its own.',
            },
            { prop: 'ChartTooltip content', type: 'node', note: 'Pass <ChartTooltipContent />.' },
            { prop: 'ChartLegend content', type: 'node', note: 'Pass <ChartLegendContent />.' },
            {
              prop: 'fill / stroke',
              type: 'string',
              note: 'Use var(--color-<key>) so the colour comes from config.',
            },
          ]}
        />
      </Section>

      <Section title="Before you use it">
        <div className="space-y-3">
          <Note tone="warning">
            <strong>Set isAnimationActive={'{false}'} for anything you screenshot.</strong>{' '}
            Recharts animates from zero on every mount and ResponsiveContainer re-mounts
            on resize, so a chart captured across a resize comes out empty. Found here
            the first time these pages were built.
          </Note>
          <Note>
            Series colours come from the adapter's chart-1..5 ramp, which has five
            entries. A chart with more than five series will reuse them — at which point
            the colour stops identifying the series and you need a different
            visualisation, not a sixth colour.
          </Note>
        </div>
      </Section>
    </Page>
  ),
};
