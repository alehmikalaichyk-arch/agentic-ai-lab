import type { Meta, StoryObj } from '@storybook/react';

import { Api, Note, Page, Section, Specimen, Specimens } from '@/showcase';
import { Checkbox } from '@/ui-staging/checkbox';
import { Label } from '@/ui-staging/label';

const meta = {
  title: 'Staging/Checkbox',
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  render: () => (
    <Page
      title="Checkbox"
      tier="staging"
      summary="An independent on/off choice. Several checkboxes are several separate decisions — if exactly one answer is allowed, that is a RadioGroup, not a column of checkboxes."
    >
      <Section
        title="States"
        description="Three, not two. `indeterminate` is a real third value and is what a parent checkbox shows when only some of its children are selected."
      >
        <Specimens columns={5}>
          <Specimen label="unchecked">
            <Checkbox />
          </Specimen>
          <Specimen label="checked">
            <Checkbox defaultChecked />
          </Specimen>
          <Specimen label='checked="indeterminate"' hint="partial selection">
            <Checkbox checked="indeterminate" />
          </Specimen>
          <Specimen label="disabled">
            <Checkbox disabled />
          </Specimen>
          <Specimen label="disabled + checked">
            <Checkbox disabled defaultChecked />
          </Specimen>
        </Specimens>
      </Section>

      <Section
        title="With a label"
        description="The label is not decoration — it is the click target. A 16px box on its own is a hard thing to hit and an impossible thing to read."
      >
        <Specimens columns={2}>
          <Specimen label="htmlFor + id">
            <div className="flex items-center gap-2">
              <Checkbox id="sb-cb-1" defaultChecked />
              <Label htmlFor="sb-cb-1">Publish Storybook on merge</Label>
            </div>
          </Specimen>
          <Specimen label="with description">
            <div className="flex items-start gap-2">
              <Checkbox id="sb-cb-2" className="mt-0.5" />
              <div className="grid gap-1">
                <Label htmlFor="sb-cb-2">Run the browser suite</Label>
                <p className="text-xs text-fg-subtle">
                  Slower, but measures real layout instead of jsdom zeroes.
                </p>
              </div>
            </div>
          </Specimen>
        </Specimens>
      </Section>

      <Section
        title="A group"
        description="Rendered as a fieldset so the group has a name of its own. Without it, a screen reader announces four unrelated checkboxes."
      >
        <Specimens columns={1}>
          <Specimen label="fieldset + legend" full>
            <fieldset className="w-full max-w-sm">
              <legend className="mb-2 text-sm font-medium">Gates to run</legend>
              <div className="grid gap-2">
                {[
                  ['typecheck', true],
                  ['lint', true],
                  ['test', true],
                  ['build-storybook', false],
                ].map(([name, on]) => (
                  <div key={String(name)} className="flex items-center gap-2">
                    <Checkbox id={`sb-g-${name}`} defaultChecked={Boolean(on)} />
                    <Label htmlFor={`sb-g-${name}`} className="font-mono text-xs">
                      {name}
                    </Label>
                  </div>
                ))}
              </div>
            </fieldset>
          </Specimen>
        </Specimens>
      </Section>

      <Section title="API">
        <Api
          rows={[
            {
              prop: 'checked',
              type: "boolean | 'indeterminate'",
              note: 'Controlled. Pass with onCheckedChange.',
            },
            {
              prop: 'defaultChecked',
              type: 'boolean',
              def: 'false',
              note: 'Uncontrolled. Do not pass both.',
            },
            { prop: 'onCheckedChange', type: "(checked: boolean | 'indeterminate') => void" },
            { prop: 'disabled', type: 'boolean', def: 'false' },
          ]}
        />
      </Section>

      <Section title="Before you use it">
        <Note>
          `indeterminate` is a display state, never a value a form submits. A parent
          checkbox showing it still has to decide what clicking it means — select all, or
          clear all — and the component does not decide that for you.
        </Note>
      </Section>
    </Page>
  ),
};
