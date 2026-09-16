import type { Meta, StoryObj } from '@storybook/react';

import { Api, Note, Page, Section, Specimen, Specimens } from '@/showcase';
import { Label } from '@/ui-staging/label';
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from '@/ui-staging/native-select';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/ui-staging/select';

const meta = {
  title: 'Staging/Select',
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  render: () => (
    <Page
      title="Select"
      tier="staging"
      summary="One choice from a list that is worth hiding until asked for. Open them — a closed select shows none of what this page is about."
    >
      <Section
        title="Anatomy"
        description="Five parts, and the split matters: the Trigger is what sits in your layout, the Content is what floats above it on a different surface token."
      >
        <Specimens columns={2}>
          <Specimen label="basic" hint="click to open">
            <Select>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Pick a region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="emea">EMEA</SelectItem>
                <SelectItem value="amer">AMER</SelectItem>
                <SelectItem value="apac">APAC</SelectItem>
              </SelectContent>
            </Select>
          </Specimen>
          <Specimen label="grouped + separator">
            <Select>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Pick a stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Before the freeze</SelectLabel>
                  <SelectItem value="req">Requirements</SelectItem>
                  <SelectItem value="spec">Specification</SelectItem>
                </SelectGroup>
                <SelectSeparator />
                <SelectGroup>
                  <SelectLabel>After the freeze</SelectLabel>
                  <SelectItem value="impl">Implementation</SelectItem>
                  <SelectItem value="a11y">Accessibility</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Specimen>
        </Specimens>
      </Section>

      <Section title="States">
        <Specimens columns={4}>
          <Specimen label="placeholder">
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Choose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a">Option A</SelectItem>
              </SelectContent>
            </Select>
          </Specimen>
          <Specimen label="selected">
            <Select defaultValue="a">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a">Option A</SelectItem>
                <SelectItem value="b">Option B</SelectItem>
              </SelectContent>
            </Select>
          </Specimen>
          <Specimen label="disabled">
            <Select disabled>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Locked" />
              </SelectTrigger>
              <SelectContent />
            </Select>
          </Specimen>
          <Specimen label="aria-invalid">
            <Select>
              <SelectTrigger className="w-40" aria-invalid>
                <SelectValue placeholder="Required" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a">Option A</SelectItem>
              </SelectContent>
            </Select>
          </Specimen>
        </Specimens>
      </Section>

      <Section
        title="NativeSelect"
        description="A separate component wrapping a real <select>. It looks close, behaves differently, and on a phone it opens the operating system's own picker."
      >
        <Specimens columns={2}>
          <Specimen label="NativeSelect" hint="real <select>, OS picker on mobile">
            <div className="grid w-full max-w-xs gap-2">
              <Label htmlFor="sb-ns">Region</Label>
              <NativeSelect id="sb-ns" defaultValue="emea">
                <NativeSelectOptGroup label="Primary">
                  <NativeSelectOption value="emea">EMEA</NativeSelectOption>
                  <NativeSelectOption value="amer">AMER</NativeSelectOption>
                </NativeSelectOptGroup>
                <NativeSelectOption value="apac">APAC</NativeSelectOption>
              </NativeSelect>
            </div>
          </Specimen>
          <Specimen label="Select" hint="custom popover, styleable items">
            <div className="grid w-full max-w-xs gap-2">
              <Label htmlFor="sb-cs">Region</Label>
              <Select defaultValue="emea">
                <SelectTrigger id="sb-cs" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="emea">EMEA</SelectItem>
                  <SelectItem value="amer">AMER</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Specimen>
        </Specimens>
      </Section>

      <Section title="API">
        <Api
          rows={[
            { prop: 'value', type: 'string', note: 'Controlled. Pass with onValueChange.' },
            { prop: 'defaultValue', type: 'string', note: 'Uncontrolled.' },
            { prop: 'onValueChange', type: '(value: string) => void' },
            { prop: 'disabled', type: 'boolean', def: 'false', note: 'On the root Select.' },
            {
              prop: 'SelectItem value',
              type: 'string',
              note: 'Required. An empty string is not allowed and will throw.',
            },
          ]}
        />
      </Section>

      <Section title="Which one">
        <Note>
          Pick <strong>NativeSelect</strong> unless you need styled option rows or icons
          inside them. It is smaller, it works before JavaScript loads, and its mobile
          behaviour is the one people already know. <strong>Select</strong> buys
          appearance and costs a popover, a focus trap and a scroll lock.
        </Note>
      </Section>
    </Page>
  ),
};
