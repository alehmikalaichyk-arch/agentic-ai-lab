import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '@/ui-staging/button';
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from '@/ui-staging/button-group';
import { Checkbox } from '@/ui-staging/checkbox';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/ui-staging/field';
import { Input } from '@/ui-staging/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/ui-staging/input-group';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/ui-staging/input-otp';
import { Label } from '@/ui-staging/label';
import { NativeSelect, NativeSelectOption } from '@/ui-staging/native-select';
import { RadioGroup, RadioGroupItem } from '@/ui-staging/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui-staging/select';
import { Slider } from '@/ui-staging/slider';
import { Switch } from '@/ui-staging/switch';
import { Textarea } from '@/ui-staging/textarea';
import { Toggle } from '@/ui-staging/toggle';
import { ToggleGroup, ToggleGroupItem } from '@/ui-staging/toggle-group';

import { Case, Col, Grid, Row } from './shared';

/*
 * Staging tier — form controls.
 *
 * A catalogue, not documentation. Every component here is unmodified shadcn registry
 * source with no spec, no tests and no a11y audit; see src/ui-staging/README.md. The
 * point of the page is to answer "what do I have to prototype with, and what does it
 * look like in our tokens" in one scroll.
 *
 * NOTE the two inputs. `@/ui-staging/input` is the registry's. The design system's own
 * Input — frozen spec, tests, audited — is under Components/ in this same sidebar. For
 * a prototype either will do; anything that outlives the prototype should use the
 * governed one.
 */
const meta = {
  title: 'Staging/Forms',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Forms: Story = {
  render: () => (
    <Grid>
      <Case name="button">
        <Row>
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button disabled>Disabled</Button>
        </Row>
      </Case>

      <Case name="button-group">
        <ButtonGroup>
          <Button variant="outline">Day</Button>
          <Button variant="outline">Week</Button>
          <ButtonGroupSeparator />
          <ButtonGroupText>UTC</ButtonGroupText>
        </ButtonGroup>
      </Case>

      <Case name="input  /  textarea  /  label">
        <Col>
          <div className="grid max-w-sm gap-2">
            <Label htmlFor="g-email">Email</Label>
            <Input id="g-email" type="email" placeholder="name@example.com" />
          </div>
          <div className="grid max-w-sm gap-2">
            <Label htmlFor="g-note">Note</Label>
            <Textarea id="g-note" placeholder="Anything worth remembering" />
          </div>
          <Input disabled placeholder="Disabled" className="max-w-sm" />
        </Col>
      </Case>

      <Case name="input-group">
        <InputGroup className="max-w-sm">
          <InputGroupAddon>https://</InputGroupAddon>
          <InputGroupInput placeholder="example.com" />
        </InputGroup>
      </Case>

      <Case name="input-otp">
        <InputOTP maxLength={6}>
          <InputOTPGroup>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <InputOTPSlot key={i} index={i} />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </Case>

      <Case name="field">
        <Field className="max-w-sm">
          <FieldLabel htmlFor="g-field">Workspace name</FieldLabel>
          <Input id="g-field" placeholder="acme" />
          <FieldDescription>Lowercase letters and dashes.</FieldDescription>
          <FieldError>That name is taken.</FieldError>
        </Field>
      </Case>

      <Case name="select  /  native-select">
        <Row>
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
          <NativeSelect className="w-56" defaultValue="emea">
            <NativeSelectOption value="emea">EMEA</NativeSelectOption>
            <NativeSelectOption value="amer">AMER</NativeSelectOption>
          </NativeSelect>
        </Row>
      </Case>

      <Case name="checkbox  /  radio-group  /  switch">
        <Row>
          <div className="flex items-center gap-2">
            <Checkbox id="g-cb" defaultChecked />
            <Label htmlFor="g-cb">Checked</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="g-cb2" />
            <Label htmlFor="g-cb2">Unchecked</Label>
          </div>
          <RadioGroup defaultValue="a" className="flex gap-4">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="a" id="g-r1" />
              <Label htmlFor="g-r1">One</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="b" id="g-r2" />
              <Label htmlFor="g-r2">Two</Label>
            </div>
          </RadioGroup>
          <div className="flex items-center gap-2">
            <Switch id="g-sw" defaultChecked />
            <Label htmlFor="g-sw">Enabled</Label>
          </div>
        </Row>
      </Case>

      <Case name="slider">
        <Slider defaultValue={[40]} max={100} step={1} className="max-w-sm" />
      </Case>

      <Case name="toggle  /  toggle-group">
        <Row>
          <Toggle>Bold</Toggle>
          <Toggle defaultPressed>Pressed</Toggle>
          <ToggleGroup type="single" defaultValue="left">
            <ToggleGroupItem value="left">Left</ToggleGroupItem>
            <ToggleGroupItem value="center">Center</ToggleGroupItem>
            <ToggleGroupItem value="right">Right</ToggleGroupItem>
          </ToggleGroup>
        </Row>
      </Case>
    </Grid>
  ),
};
