import type { Meta, StoryObj } from '@storybook/react';

import { Api, Note, Page, Section, Specimen, Specimens } from '@/showcase';
import { Checkbox } from '@/ui-staging/checkbox';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from '@/ui-staging/field';
import { Input } from '@/ui-staging/input';
import { Label } from '@/ui-staging/label';
import { Switch } from '@/ui-staging/switch';
import { Textarea } from '@/ui-staging/textarea';

const meta = {
  title: 'Staging/Label & Field',
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  render: () => (
    <Page
      title="Label & Field"
      tier="staging"
      summary="Field is the wrapper that gives a control its name, its help text and its error, with the spacing already decided. Label is the bare element underneath it."
    >
      <Section
        title="Label on its own"
        description="A label's job is the htmlFor/id pair. Get that right and clicking the text focuses the control — which is also how a screen reader learns the control's name."
      >
        <Specimens columns={2}>
          <Specimen label="htmlFor + id" hint="click the text">
            <div className="grid w-full max-w-xs gap-2">
              <Label htmlFor="sb-lb-1">Workspace name</Label>
              <Input id="sb-lb-1" placeholder="acme" />
            </div>
          </Specimen>
          <Specimen label="wrapping a control" hint="no id needed">
            <Label className="flex items-center gap-2">
              <Checkbox />
              Publish Storybook on merge
            </Label>
          </Specimen>
        </Specimens>
      </Section>

      <Section
        title="Field — orientation"
        description="Three. `responsive` is horizontal when there is room and stacks when there is not, which is the right default for a settings list."
      >
        <Specimens columns={3}>
          <Specimen label='orientation="vertical"' hint="the default" full>
            <Field className="w-full">
              <FieldLabel htmlFor="sb-fv">Workspace</FieldLabel>
              <Input id="sb-fv" placeholder="acme" />
              <FieldDescription>Lowercase letters and dashes.</FieldDescription>
            </Field>
          </Specimen>
          <Specimen label='orientation="horizontal"' full>
            <Field orientation="horizontal" className="w-full">
              <FieldContent>
                <FieldLabel htmlFor="sb-fh">Require review</FieldLabel>
                <FieldDescription>Blocks merge until approved.</FieldDescription>
              </FieldContent>
              <Switch id="sb-fh" />
            </Field>
          </Specimen>
          <Specimen label='orientation="responsive"' hint="stacks when narrow" full>
            <Field orientation="responsive" className="w-full">
              <FieldContent>
                <FieldLabel htmlFor="sb-fr">Publish on merge</FieldLabel>
                <FieldDescription>Deploys to GitHub Pages.</FieldDescription>
              </FieldContent>
              <Switch id="sb-fr" defaultChecked />
            </Field>
          </Specimen>
        </Specimens>
      </Section>

      <Section
        title="Errors"
        description="FieldError renders the message; aria-invalid on the control draws the ring. Both are needed — one without the other gives you a message nobody sees or a red box nobody can explain."
      >
        <Specimens columns={2}>
          <Specimen label="invalid" full>
            <Field className="w-full">
              <FieldLabel htmlFor="sb-fe">Email</FieldLabel>
              <Input id="sb-fe" aria-invalid defaultValue="not-an-email" />
              <FieldError>Enter a valid address.</FieldError>
            </Field>
          </Specimen>
          <Specimen label="description + error together" full>
            <Field className="w-full">
              <FieldLabel htmlFor="sb-fe2">Release note</FieldLabel>
              <Textarea id="sb-fe2" aria-invalid rows={3} />
              <FieldDescription>What a reader needs, not what the diff says.</FieldDescription>
              <FieldError>Required.</FieldError>
            </Field>
          </Specimen>
        </Specimens>
      </Section>

      <Section
        title="FieldSet and FieldGroup"
        description="FieldSet names a group of related controls; FieldGroup spaces several fields without naming them. A group of radios or checkboxes needs the first one."
      >
        <Specimens columns={1}>
          <Specimen label="fieldset + legend + group" full>
            <FieldSet className="w-full max-w-md">
              <FieldLegend>Deployment</FieldLegend>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="sb-fs1">Branch</FieldLabel>
                  <Input id="sb-fs1" defaultValue="main" />
                </Field>
                <FieldSeparator />
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>Publish Storybook</FieldTitle>
                    <FieldDescription>On every push to the branch above.</FieldDescription>
                  </FieldContent>
                  <Switch defaultChecked />
                </Field>
              </FieldGroup>
            </FieldSet>
          </Specimen>
        </Specimens>
      </Section>

      <Section title="API">
        <Api
          rows={[
            {
              prop: 'Field orientation',
              type: "'vertical' | 'horizontal' | 'responsive'",
              def: "'vertical'",
            },
            { prop: 'FieldLabel htmlFor', type: 'string', note: 'Must match the control id.' },
            { prop: 'FieldDescription', type: 'node', note: 'Help text. Always visible.' },
            {
              prop: 'FieldError',
              type: 'node',
              note: 'Message only — it does not set aria-invalid for you.',
            },
            { prop: 'FieldSet / FieldLegend', type: 'fieldset / legend', note: 'Names a group.' },
            { prop: 'FieldGroup', type: 'div', note: 'Spacing only, no semantics.' },
          ]}
        />
      </Section>

      <Section title="Before you use it">
        <Note>
          Field wires spacing, not accessibility. You still set{' '}
          <code className="font-mono text-xs">htmlFor</code>/
          <code className="font-mono text-xs">id</code>,{' '}
          <code className="font-mono text-xs">aria-invalid</code> and{' '}
          <code className="font-mono text-xs">aria-describedby</code> yourself — a field
          that looks correct and is wired to nothing is the defect this component makes
          easiest to ship.
        </Note>
      </Section>
    </Page>
  ),
};
