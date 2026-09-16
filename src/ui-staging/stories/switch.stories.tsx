import type { Meta, StoryObj } from '@storybook/react';

import { Api, Note, Page, Section, Specimen, Specimens } from '@/showcase';
import { Label } from '@/ui-staging/label';
import { Switch } from '@/ui-staging/switch';

const meta = {
  title: 'Staging/Switch',
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  render: () => (
    <Page
      title="Switch"
      tier="staging"
      summary="Turns something on or off immediately. Visually it is a Checkbox with rounder corners; behaviourally it is not, and picking the wrong one misleads people about when their change takes effect."
    >
      <Section title="States">
        <Specimens columns={4}>
          <Specimen label="off">
            <Switch />
          </Specimen>
          <Specimen label="on">
            <Switch defaultChecked />
          </Specimen>
          <Specimen label="disabled, off">
            <Switch disabled />
          </Specimen>
          <Specimen label="disabled, on">
            <Switch disabled defaultChecked />
          </Specimen>
        </Specimens>
      </Section>

      <Section
        title="With a label"
        description="The label states what being ON means, in the present tense. 'Dark mode' is readable; 'Toggle dark mode' describes the control rather than the setting."
      >
        <Specimens columns={2}>
          <Specimen label="inline">
            <div className="flex items-center gap-2">
              <Switch id="sb-sw-1" defaultChecked />
              <Label htmlFor="sb-sw-1">Publish Storybook on merge</Label>
            </div>
          </Specimen>
          <Specimen label="settings row" hint="label left, control right">
            <div className="flex w-full max-w-sm items-center justify-between gap-6">
              <div className="grid gap-1">
                <Label htmlFor="sb-sw-2">Require review</Label>
                <p className="text-xs text-fg-subtle">
                  Blocks merge until a non-author approves.
                </p>
              </div>
              <Switch id="sb-sw-2" />
            </div>
          </Specimen>
        </Specimens>
      </Section>

      <Section title="API">
        <Api
          rows={[
            { prop: 'checked', type: 'boolean', note: 'Controlled. Pass with onCheckedChange.' },
            { prop: 'defaultChecked', type: 'boolean', def: 'false', note: 'Uncontrolled.' },
            { prop: 'onCheckedChange', type: '(checked: boolean) => void' },
            { prop: 'disabled', type: 'boolean', def: 'false' },
          ]}
        />
      </Section>

      <Section title="Switch or Checkbox">
        <Note>
          A <strong>Switch</strong> applies the moment it moves — there is no Save
          button waiting for it. A <strong>Checkbox</strong> records an intention that
          something else submits later. If your switch sits above a Save button, it
          should have been a checkbox, and users will discover that by wondering whether
          their change took.
        </Note>
      </Section>
    </Page>
  ),
};
