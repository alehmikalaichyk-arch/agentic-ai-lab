import type { Meta, StoryObj } from '@storybook/react';

import { Api, Note, Page, Section, Specimen, Specimens } from '@/showcase';
import { Label } from '@/ui-staging/label';
import { Slider } from '@/ui-staging/slider';

const meta = {
  title: 'Staging/Slider',
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  render: () => (
    <Page
      title="Slider"
      tier="staging"
      summary="Picks a number from a range by position. Good when the approximate value is what matters and the feedback is immediate; bad whenever the exact number does."
    >
      <Section
        title="Single and range"
        description="The value is always an array. One entry gives one thumb, two give a range — there is no separate range component."
      >
        <Specimens columns={2}>
          <Specimen label="defaultValue={[40]}" full>
            <Slider defaultValue={[40]} max={100} step={1} className="w-full" />
          </Specimen>
          <Specimen label="defaultValue={[20, 80]}" hint="two thumbs" full>
            <Slider defaultValue={[20, 80]} max={100} step={1} className="w-full" />
          </Specimen>
        </Specimens>
      </Section>

      <Section
        title="Step"
        description="A coarse step turns a slider into a small set of choices, and at that point a RadioGroup usually communicates the options better."
      >
        <Specimens columns={3}>
          <Specimen label="step={1}" hint="100 positions" full>
            <Slider defaultValue={[50]} max={100} step={1} className="w-full" />
          </Specimen>
          <Specimen label="step={10}" hint="11 positions" full>
            <Slider defaultValue={[50]} max={100} step={10} className="w-full" />
          </Specimen>
          <Specimen label="step={25}" hint="5 — consider a RadioGroup" full>
            <Slider defaultValue={[50]} max={100} step={25} className="w-full" />
          </Specimen>
        </Specimens>
      </Section>

      <Section title="States and orientation">
        <Specimens columns={3}>
          <Specimen label="disabled" full>
            <Slider defaultValue={[60]} max={100} disabled className="w-full" />
          </Specimen>
          <Specimen label='orientation="vertical"' hint="parent needs a height">
            <div className="flex h-32 justify-center">
              <Slider defaultValue={[60]} max={100} orientation="vertical" />
            </div>
          </Specimen>
          <Specimen label="with a live value" hint="what makes it usable" full>
            <div className="w-full">
              <div className="mb-2 flex items-center justify-between">
                <Label htmlFor="sb-sl">Review round budget</Label>
                <span className="font-mono text-xs tabular-nums text-fg-subtle">2</span>
              </div>
              <Slider id="sb-sl" defaultValue={[2]} max={10} step={1} className="w-full" />
            </div>
          </Specimen>
        </Specimens>
      </Section>

      <Section title="API">
        <Api
          rows={[
            { prop: 'value', type: 'number[]', note: 'Controlled. With onValueChange.' },
            {
              prop: 'defaultValue',
              type: 'number[]',
              note: 'Uncontrolled. Length decides the number of thumbs.',
            },
            { prop: 'min / max', type: 'number', def: '0 / 100' },
            { prop: 'step', type: 'number', def: '1' },
            { prop: 'orientation', type: "'horizontal' | 'vertical'", def: "'horizontal'" },
            { prop: 'disabled', type: 'boolean', def: 'false' },
          ]}
        />
      </Section>

      <Section title="Before you use it">
        <div className="space-y-3">
          <Note>
            <strong>Always show the current value next to it.</strong> A slider with no
            readout forces people to guess where the thumb sits, and on a coarse step
            they cannot tell 60 from 65. The last specimen above is the minimum shape.
          </Note>
          <Note tone="warning">
            A slider is a poor control on touch and a worse one for anyone with limited
            fine motor control. Where the exact number matters — a price, a timeout, a
            count — pair it with a number input or use one instead.
          </Note>
        </div>
      </Section>
    </Page>
  ),
};
