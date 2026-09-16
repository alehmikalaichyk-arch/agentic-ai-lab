import type { Meta, StoryObj } from '@storybook/react';
import { SearchIcon } from 'lucide-react';

import { Api, Note, Page, Section, Specimen, Specimens } from '@/showcase';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from '@/ui-staging/input-group';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/ui-staging/input-otp';
import { Label } from '@/ui-staging/label';

const meta = {
  title: 'Staging/InputGroup & InputOTP',
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  render: () => (
    <Page
      title="InputGroup & InputOTP"
      tier="staging"
      summary="Two specialised text inputs: one that carries an icon, a prefix or a button inside the field, and one built for a code split across boxes."
    >
      <Section
        title="InputGroup — addon placement"
        description="align puts the addon at either end, or on its own line above or below. The field keeps one focus ring around the whole group, which is the point of using it over a flex row."
      >
        <Specimens columns={2}>
          <Specimen label='align="inline-start"' hint="the default" full>
            <InputGroup className="w-full">
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
              <InputGroupInput placeholder="Search components" />
            </InputGroup>
          </Specimen>
          <Specimen label='align="inline-end"' full>
            <InputGroup className="w-full">
              <InputGroupInput placeholder="example.com" />
              <InputGroupAddon align="inline-end">
                <InputGroupText>.dev</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </Specimen>
          <Specimen label="prefix text" full>
            <InputGroup className="w-full">
              <InputGroupAddon>
                <InputGroupText>https://</InputGroupText>
              </InputGroupAddon>
              <InputGroupInput placeholder="acme.example.com" />
            </InputGroup>
          </Specimen>
          <Specimen label="with a button" full>
            <InputGroup className="w-full">
              <InputGroupInput placeholder="Paste a component URL" />
              <InputGroupAddon align="inline-end">
                <InputGroupButton size="xs">Add</InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </Specimen>
        </Specimens>
      </Section>

      <Section
        title="Block addons and textarea"
        description="block-start and block-end give the addon its own row — room for a toolbar above a textarea, or a counter below it."
      >
        <Specimens columns={2}>
          <Specimen label='align="block-end"' full>
            <InputGroup className="w-full">
              <InputGroupTextarea placeholder="What changed, and why?" />
              <InputGroupAddon align="block-end">
                <InputGroupText className="text-xs">0 / 280</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </Specimen>
          <Specimen label='align="block-start"' full>
            <InputGroup className="w-full">
              <InputGroupAddon align="block-start">
                <InputGroupText className="text-xs">Markdown supported</InputGroupText>
              </InputGroupAddon>
              <InputGroupTextarea placeholder="Release note" />
            </InputGroup>
          </Specimen>
        </Specimens>
      </Section>

      <Section
        title="InputOTP"
        description="One value spread across several boxes. Paste a six-digit code into any slot — it distributes across all of them, which is the behaviour people expect and hand-rolled versions usually miss."
      >
        <Specimens columns={2}>
          <Specimen label="maxLength={6}" full>
            <div className="grid gap-2">
              <Label htmlFor="sb-otp">Verification code</Label>
              <InputOTP id="sb-otp" maxLength={6}>
                <InputOTPGroup>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <InputOTPSlot key={i} index={i} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
          </Specimen>
          <Specimen label="with a separator" hint="3 + 3" full>
            <InputOTP maxLength={6}>
              <InputOTPGroup>
                {[0, 1, 2].map((i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                {[3, 4, 5].map((i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </Specimen>
        </Specimens>
      </Section>

      <Section title="API">
        <Api
          rows={[
            {
              prop: 'InputGroupAddon align',
              type: "'inline-start' | 'inline-end' | 'block-start' | 'block-end'",
              def: "'inline-start'",
            },
            {
              prop: 'InputGroupInput',
              type: 'input',
              note: 'Use this, not Input — it drops its own border to share the group ring.',
            },
            { prop: 'InputGroupButton size', type: "'xs' | 'sm' | 'icon-xs' | 'icon-sm'" },
            { prop: 'InputOTP maxLength', type: 'number', note: 'Required. Must equal the slot count.' },
            {
              prop: 'InputOTPSlot index',
              type: 'number',
              note: 'Zero-based, and must be contiguous across groups.',
            },
          ]}
        />
      </Section>

      <Section title="Before you use it">
        <Note>
          An addon is not a label. Both groups above still need a{' '}
          <code className="font-mono text-xs">Label</code> — a magnifying glass tells a
          sighted user this is a search box and tells a screen reader nothing at all.
        </Note>
      </Section>
    </Page>
  ),
};
