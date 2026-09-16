import type { Meta, StoryObj } from '@storybook/react';
import { useForm } from 'react-hook-form';

import { Api, Note, Page, Section, Specimen, Specimens } from '@/showcase';
import { Button } from '@/ui-staging/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui-staging/form';
import { Input } from '@/ui-staging/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui-staging/select';
import { Switch } from '@/ui-staging/switch';
import { Textarea } from '@/ui-staging/textarea';

const meta = {
  title: 'Staging/Form',
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type Values = {
  name: string;
  region: string;
  note: string;
  publish: boolean;
};

/*
 * A real react-hook-form instance rather than a static picture of one. Submit the
 * empty form: the validation, the message and the error ring all come from the
 * resolver, which is the whole point of this component and the part a screenshot
 * cannot show.
 */
const DemoForm = () => {
  const form = useForm<Values>({
    defaultValues: { name: '', region: '', note: '', publish: true },
    mode: 'onSubmit',
  });

  return (
    <Form {...form}>
      <form
        className="grid w-full max-w-md gap-5"
        onSubmit={form.handleSubmit(() => {
          /* a prototype: nothing is submitted anywhere */
        })}
        noValidate
      >
        <FormField
          control={form.control}
          name="name"
          rules={{
            required: 'A workspace name is required.',
            pattern: { value: /^[a-z-]+$/, message: 'Lowercase letters and dashes only.' },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Workspace name</FormLabel>
              <FormControl>
                <Input placeholder="acme" {...field} />
              </FormControl>
              <FormDescription>Used in the URL. It cannot be changed later.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="region"
          rules={{ required: 'Pick a region.' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Region</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pick a region" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="emea">EMEA</SelectItem>
                  <SelectItem value="amer">AMER</SelectItem>
                  <SelectItem value="apac">APAC</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="publish"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between gap-6">
              <div className="grid gap-1">
                <FormLabel>Publish Storybook on merge</FormLabel>
                <FormDescription>Deploys to GitHub Pages.</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button type="submit">Create workspace</Button>
          <Button type="button" variant="ghost" onClick={() => form.reset()}>
            Reset
          </Button>
        </div>
      </form>
    </Form>
  );
};

export const Showcase: Story = {
  render: () => (
    <Page
      title="Form"
      tier="staging"
      summary="A binding between react-hook-form and the controls in this tier. It does not validate anything itself — it wires a field's error to its label, its description and its message."
    >
      <Section
        title="Live"
        description="Submit it empty. Everything that then happens — the messages, the red rings, the focus move — is the wiring this component exists for."
      >
        <Specimens columns={1}>
          <Specimen label="useForm + FormField" full>
            <DemoForm />
          </Specimen>
        </Specimens>
      </Section>

      <Section
        title="What each part does"
        description="Five wrappers, and the ids that connect them are generated — which is why FormLabel needs no htmlFor and FormMessage needs no id."
      >
        <Api
          rows={[
            {
              prop: 'Form',
              type: 'FormProvider',
              note: 'Spread the useForm result into it: <Form {...form}>.',
            },
            {
              prop: 'FormField',
              type: 'control, name, rules, render',
              note: "react-hook-form's Controller. render receives { field }.",
            },
            {
              prop: 'FormItem',
              type: 'div',
              note: 'Generates the id that ties label, control and message together.',
            },
            {
              prop: 'FormControl',
              type: 'Slot',
              note: 'Wraps ONE control and sets its id, aria-describedby and aria-invalid.',
            },
            { prop: 'FormLabel', type: 'label', note: 'htmlFor is supplied. Turns red on error.' },
            {
              prop: 'FormMessage',
              type: 'p',
              note: 'Renders the field error. Empty and silent when valid.',
            },
          ]}
        />
      </Section>

      <Section title="Before you use it">
        <div className="space-y-3">
          <Note>
            <code className="font-mono text-xs">FormControl</code> takes exactly one
            child and forwards props to it. Wrapping two controls, or wrapping a{' '}
            <code className="font-mono text-xs">div</code> that contains one, puts the
            accessibility attributes on the wrong element and the field goes quiet.
          </Note>
          <Note tone="warning">
            Validation rules here are inline for the demo. Real forms usually pass a
            resolver (zod, yup) to <code className="font-mono text-xs">useForm</code> —
            neither ships with this tier, and adding one is a dependency decision rather
            than a component choice.
          </Note>
        </div>
      </Section>
    </Page>
  ),
};
