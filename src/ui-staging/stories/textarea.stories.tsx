import type { Meta, StoryObj } from '@storybook/react';

import { Api, Page, Section, Specimen, Specimens } from '@/showcase';
import { Label } from '@/ui-staging/label';
import { Textarea } from '@/ui-staging/textarea';

const meta = {
  title: 'Staging/Textarea',
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  render: () => (
    <Page
      title="Textarea"
      tier="staging"
      summary="Multi-line free text. Reach for it when the answer is prose; anything with a known set of answers wants a Select or a RadioGroup instead."
    >
      <Section
        title="States"
        description="Same state model as Input, including aria-invalid driving the error ring rather than a prop of its own."
      >
        <Specimens columns={2}>
          <Specimen label="default">
            <Textarea className="w-full" placeholder="What changed, and why?" />
          </Specimen>
          <Specimen label="filled">
            <Textarea
              className="w-full"
              defaultValue={'The round-4 fix ended a grammar disagreement by deriving one detector from the other.'}
            />
          </Specimen>
          <Specimen label="disabled">
            <Textarea className="w-full" disabled defaultValue="Locked while the gate runs." />
          </Specimen>
          <Specimen label="aria-invalid">
            <Textarea className="w-full" aria-invalid defaultValue="Too short." />
          </Specimen>
        </Specimens>
      </Section>

      <Section
        title="Height"
        description="The default is a minimum, not a fixed height — the field grows with the browser's own resize handle. Set rows, or a height utility, when the layout cannot absorb that."
      >
        <Specimens columns={3}>
          <Specimen label="default" hint="min-h, user-resizable">
            <Textarea className="w-full" placeholder="Default" />
          </Specimen>
          <Specimen label="rows={6}">
            <Textarea className="w-full" rows={6} placeholder="Six rows" />
          </Specimen>
          <Specimen label='className="h-24 resize-none"' hint="fixed, no handle">
            <Textarea className="h-24 w-full resize-none" placeholder="Fixed" />
          </Specimen>
        </Specimens>
      </Section>

      <Section title="With a label and a counter">
        <Specimens columns={1}>
          <Specimen label="label + description" full>
            <div className="grid w-full max-w-md gap-2">
              <Label htmlFor="sb-ta">Release note</Label>
              <Textarea id="sb-ta" aria-describedby="sb-ta-hint" rows={4} />
              <p id="sb-ta-hint" className="text-xs text-fg-subtle">
                What a reader needs to know, not what the diff already says.
              </p>
            </div>
          </Specimen>
        </Specimens>
      </Section>

      <Section title="API">
        <Api
          rows={[
            { prop: 'rows', type: 'number', note: 'Native. Sets the initial visible height.' },
            {
              prop: 'aria-invalid',
              type: 'boolean',
              def: 'false',
              note: 'Draws the error border and ring.',
            },
            { prop: 'disabled', type: 'boolean', def: 'false', note: 'Native.' },
            {
              prop: 'className',
              type: 'string',
              note: 'resize-none here is the usual override when the layout is fixed.',
            },
          ]}
        />
      </Section>
    </Page>
  ),
};
