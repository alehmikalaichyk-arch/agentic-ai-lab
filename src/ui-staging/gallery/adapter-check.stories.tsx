import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '@/ui-staging/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/ui-staging/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui-staging/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui-staging/table';

/*
 * What this story is for: proving the adapter works, on real components, before 45
 * more arrive behind these five.
 *
 * Two things are being looked at, and only one of them is colour:
 *
 *   1. Do the shadcn role names resolve? A component rendering with NO background
 *      and NO border means src/shadcn-adapter.css did not reach the stylesheet.
 *   2. Does the GEOMETRY follow? `rounded-md`, `text-sm` and `shadow-xs` resolve
 *      against this repository's own --radius-*, --text-* and --shadow-* namespaces,
 *      which the palette reset does not touch. If a corner or a type size looks
 *      un-DS, the namespace is missing that key — not the adapter's fault.
 *
 * The bottom row is the control. It uses Tailwind's built-in palette, which
 * styles.css deletes. Those two boxes MUST render unstyled. If they ever show
 * colour, the adapter has reopened the palette and the token chain is no longer
 * enforced — which is the one regression this file exists to catch.
 */
const meta = {
  title: 'Staging/Adapter check',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-8">
    <h2 className="mb-3 text-sm font-medium text-fg-subtle">{title}</h2>
    {children}
  </section>
);

export const Gallery: Story = {
  render: () => (
    <div className="bg-background p-6 text-foreground">
      <Section title="Button — every variant">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button disabled>Disabled</Button>
        </div>
      </Section>

      <Section title="Card + Select">
        <div className="flex flex-wrap gap-4">
          <Card className="w-80">
            <CardHeader>
              <CardTitle>Card title</CardTitle>
              <CardDescription>
                Muted foreground on a raised surface.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pick a region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="emea">EMEA</SelectItem>
                  <SelectItem value="amer">AMER</SelectItem>
                  <SelectItem value="apac">APAC</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
            <CardFooter className="gap-2">
              <Button size="sm">Save</Button>
              <Button size="sm" variant="ghost">
                Cancel
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Section>

      <Section title="Table">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Component</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Spec</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Input</TableCell>
              <TableCell>components/ui</TableCell>
              <TableCell>frozen</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Button</TableCell>
              <TableCell>ui-staging</TableCell>
              <TableCell>none yet</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Section>

      <Section title="Control — these MUST stay unstyled">
        <div className="flex gap-3">
          <div className="bg-red-500 p-3 text-white">bg-red-500</div>
          <div className="bg-slate-200 p-3">bg-slate-200</div>
        </div>
      </Section>
    </div>
  ),
};
