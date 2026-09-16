import type { Meta, StoryObj } from '@storybook/react';

import { Api, Note, Page, Section, Specimen, Specimens } from '@/showcase';
import { Badge } from '@/ui-staging/badge';
import { Button } from '@/ui-staging/button';
import { Checkbox } from '@/ui-staging/checkbox';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui-staging/table';

const meta = {
  title: 'Staging/Table',
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const rows = [
  { name: 'Input', tier: 'components/ui', spec: 'frozen', tests: 12 },
  { name: 'Button', tier: 'ui-staging', spec: 'none yet', tests: 0 },
  { name: 'Badge', tier: 'ui-staging', spec: 'none yet', tests: 0 },
];

export const Showcase: Story = {
  render: () => (
    <Page
      title="Table"
      tier="staging"
      summary="Styled wrappers around real table elements. It renders data — it does not sort, paginate or select anything, and that is worth knowing before you plan around it."
    >
      <Section
        title="Anatomy"
        description="A caption names the table for someone who cannot see its position on the page. It is the part most often dropped and the one a screen reader needs most."
      >
        <Specimens columns={1}>
          <Specimen label="caption + header + body + footer" full>
            <Table>
              <TableCaption>Components by tier, September 2026.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Component</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Spec</TableHead>
                  <TableHead className="text-right">Tests</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.name}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="font-mono text-xs">{r.tier}</TableCell>
                    <TableCell>
                      {r.spec === 'frozen' ? (
                        <Badge>frozen</Badge>
                      ) : (
                        <Badge variant="secondary">none yet</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{r.tests}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3}>Total</TableCell>
                  <TableCell className="text-right tabular-nums">12</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </Specimen>
        </Specimens>
      </Section>

      <Section
        title="Numeric columns"
        description="Right-aligned and tabular-nums. Without the second half, digits shift column as the values change and the eye cannot compare them down the page."
      >
        <Specimens columns={2}>
          <Specimen label="tabular-nums, right" hint="digits line up" full>
            <Table>
              <TableBody>
                {[1284, 97, 40531].map((n) => (
                  <TableRow key={n}>
                    <TableCell>Row</TableCell>
                    <TableCell className="text-right tabular-nums">{n}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Specimen>
          <Specimen label="default, left" hint="ragged — avoid for numbers" full>
            <Table>
              <TableBody>
                {[1284, 97, 40531].map((n) => (
                  <TableRow key={n}>
                    <TableCell>Row</TableCell>
                    <TableCell>{n}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Specimen>
        </Specimens>
      </Section>

      <Section
        title="With selection and actions"
        description="Both are your code. The component contributes the checkbox column's styling and nothing else about how selection behaves."
      >
        <Specimens columns={1}>
          <Specimen label="composed" full>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox checked="indeterminate" aria-label="Select all" />
                  </TableHead>
                  <TableHead>Component</TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r, i) => (
                  <TableRow key={r.name}>
                    <TableCell>
                      <Checkbox defaultChecked={i === 0} aria-label={`Select ${r.name}`} />
                    </TableCell>
                    <TableCell>{r.name}</TableCell>
                    <TableCell className="text-right">
                      <Button size="xs" variant="ghost">
                        Open
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Specimen>
        </Specimens>
      </Section>

      <Section title="API">
        <Api
          rows={[
            { prop: 'Table', type: 'table', note: 'Wrapped in an overflow container.' },
            { prop: 'TableCaption', type: 'caption', note: 'Renders below the table.' },
            { prop: 'TableHeader / TableBody / TableFooter', type: 'thead / tbody / tfoot' },
            { prop: 'TableHead', type: 'th', note: 'A header cell, not the header row.' },
            { prop: 'TableCell', type: 'td', note: 'Takes colSpan and the rest natively.' },
          ]}
        />
      </Section>

      <Section title="Before you use it">
        <Note tone="warning">
          There is no sorting, no pagination, no virtualisation and no selection logic
          here. For a prototype that is usually fine. For a real table of any size you
          are choosing a headless table library and keeping these as the presentation
          layer — decide that before the screen is built around it.
        </Note>
      </Section>
    </Page>
  ),
};
