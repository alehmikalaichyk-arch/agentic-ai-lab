import type { Meta, StoryObj } from '@storybook/react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { toast } from 'sonner';

import { Alert, AlertDescription, AlertTitle } from '@/ui-staging/alert';
import { Button } from '@/ui-staging/button';
import { Calendar } from '@/ui-staging/calendar';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/ui-staging/carousel';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/ui-staging/chart';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/ui-staging/resizable';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/ui-staging/sidebar';
import { Toaster } from '@/ui-staging/sonner';

import { Case, Grid, Row } from './shared';

/*
 * Staging tier — feedback, layout and the heavier compositions.
 *
 * The chart is the one to look at twice: its series colours come from chart-1..5,
 * which src/shadcn-adapter.css binds to this repository's categorical chart ramp.
 * A chart rendering in recharts' own default palette would mean the adapter's chart
 * block never reached the stylesheet.
 */
const meta = {
  title: 'Staging/Catalogue/Feedback & layout',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const chartData = [
  { stage: 'req', merged: 4 },
  { stage: 'spec', merged: 3 },
  { stage: 'impl', merged: 5 },
  { stage: 'stories', merged: 2 },
  { stage: 'a11y', merged: 3 },
];

const chartConfig = {
  merged: { label: 'Merged PRs', color: 'var(--color-chart-1)' },
};

export const FeedbackAndLayout: Story = {
  render: () => (
    <Grid>
      <Case name="alert">
        <div className="max-w-md space-y-3">
          <Alert>
            <AlertTitle>Spec merged</AlertTitle>
            <AlertDescription>
              PR-1 is on main, so the spec is frozen. Implementation may start.
            </AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertTitle>Gate failed</AlertTitle>
            <AlertDescription>
              require-document-on-base found no spec at the base commit.
            </AlertDescription>
          </Alert>
        </div>
      </Case>

      <Case name="sonner">
        <Row>
          <Button
            variant="outline"
            onClick={() => toast('Component promoted', { description: 'button → components/ui' })}
          >
            Fire a toast
          </Button>
          <Toaster />
        </Row>
      </Case>

      <Case name="chart">
        <ChartContainer config={chartConfig} className="h-56 w-full max-w-lg">
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="stage" tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            {/* isAnimationActive={false}: recharts animates bar height from zero on
                every mount, and ResponsiveContainer re-mounts on resize. In a
                catalogue that means the bars are invisible until the animation
                finishes — and invisible for good in any screenshot taken across a
                resize. A catalogue should render the same every time it is opened. */}
            <Bar dataKey="merged" fill="var(--color-merged)" radius={4} isAnimationActive={false} />
          </BarChart>
        </ChartContainer>
      </Case>

      <Case name="calendar">
        <Calendar mode="single" className="rounded-md border border-outline-subtle" />
      </Case>

      <Case name="carousel">
        <Carousel className="max-w-xs">
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
      </Case>

      <Case name="resizable">
        {/* `orientation`, not `direction` — this registry version wraps
            react-resizable-panels' newer Group API. */}
        <ResizablePanelGroup
          orientation="horizontal"
          className="h-32 max-w-lg rounded-md border border-outline-subtle"
        >
          <ResizablePanel defaultSize={40}>
            <div className="flex h-full items-center justify-center text-sm">Left</div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={60}>
            <div className="flex h-full items-center justify-center text-sm">Right</div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </Case>

      <Case name="sidebar">
        <div className="h-64 overflow-hidden rounded-md border border-outline-subtle">
          <SidebarProvider>
            <Sidebar collapsible="none">
              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupLabel>Tiers</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton isActive>Components</SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton>Staging</SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton>Prototypes</SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>
            </Sidebar>
            <SidebarInset>
              <div className="flex items-center gap-2 p-4 text-sm">
                <SidebarTrigger />
                Content area
              </div>
            </SidebarInset>
          </SidebarProvider>
        </div>
      </Case>
    </Grid>
  ),
};
