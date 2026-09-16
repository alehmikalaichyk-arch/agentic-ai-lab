import type { Meta, StoryObj } from '@storybook/react';

import { Api, Note, Page, Section, Specimen, Specimens } from '@/showcase';
import { Label } from '@/ui-staging/label';
import { RadioGroup, RadioGroupItem } from '@/ui-staging/radio-group';

const meta = {
  title: 'Staging/RadioGroup',
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  render: () => (
    <Page
      title="RadioGroup"
      tier="staging"
      summary="Exactly one choice from a visible set. Use it when seeing the alternatives is part of the decision; when it is not, a Select costs less room."
    >
      <Section
        title="Orientation"
        description="Vertical by default. Horizontal reads faster for two or three short options and badly for anything longer."
      >
        <Specimens columns={2}>
          <Specimen label="vertical" hint="the default">
            <RadioGroup defaultValue="spec" className="w-full max-w-xs">
              {['requirements', 'spec', 'implementation'].map((v) => (
                <div key={v} className="flex items-center gap-2">
                  <RadioGroupItem value={v} id={`sb-rv-${v}`} />
                  <Label htmlFor={`sb-rv-${v}`}>{v}</Label>
                </div>
              ))}
            </RadioGroup>
          </Specimen>
          <Specimen label='className="flex"' hint="two or three short options only">
            <RadioGroup defaultValue="pass" className="flex gap-4">
              {['pass', 'fail'].map((v) => (
                <div key={v} className="flex items-center gap-2">
                  <RadioGroupItem value={v} id={`sb-rh-${v}`} />
                  <Label htmlFor={`sb-rh-${v}`}>{v}</Label>
                </div>
              ))}
            </RadioGroup>
          </Specimen>
        </Specimens>
      </Section>

      <Section
        title="States"
        description="disabled on the group disables every item; on an item it disables only that one, which is how you show an option that exists but is currently unavailable."
      >
        <Specimens columns={3}>
          <Specimen label="selected / unselected">
            <RadioGroup defaultValue="a">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="a" id="sb-rs-a" />
                <Label htmlFor="sb-rs-a">Selected</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="b" id="sb-rs-b" />
                <Label htmlFor="sb-rs-b">Not selected</Label>
              </div>
            </RadioGroup>
          </Specimen>
          <Specimen label="group disabled">
            <RadioGroup defaultValue="a" disabled>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="a" id="sb-rd-a" />
                <Label htmlFor="sb-rd-a">Selected</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="b" id="sb-rd-b" />
                <Label htmlFor="sb-rd-b">Other</Label>
              </div>
            </RadioGroup>
          </Specimen>
          <Specimen label="one item disabled">
            <RadioGroup defaultValue="a">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="a" id="sb-ri-a" />
                <Label htmlFor="sb-ri-a">Available</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="b" id="sb-ri-b" disabled />
                <Label htmlFor="sb-ri-b" className="text-fg-disabled">
                  Needs a spec first
                </Label>
              </div>
            </RadioGroup>
          </Specimen>
        </Specimens>
      </Section>

      <Section title="API">
        <Api
          rows={[
            { prop: 'value', type: 'string', note: 'Controlled. Pass with onValueChange.' },
            { prop: 'defaultValue', type: 'string', note: 'Uncontrolled.' },
            { prop: 'onValueChange', type: '(value: string) => void' },
            {
              prop: 'disabled',
              type: 'boolean',
              def: 'false',
              note: 'On the group or on a single RadioGroupItem.',
            },
            {
              prop: 'RadioGroupItem value',
              type: 'string',
              note: 'Required, and unique within the group.',
            },
          ]}
        />
      </Section>

      <Section title="Before you use it">
        <Note>
          A radio group with no selection is a real, valid starting state and is often
          the honest one — pre-selecting an option to avoid an empty control silently
          answers the question on the user's behalf.
        </Note>
      </Section>
    </Page>
  ),
};
