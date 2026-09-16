import type { Meta, StoryObj } from '@storybook/react';

import { Input } from '@/components/ui/input';
import { Api, Facts, Note, Page, Provenance, Section, Specimen, Specimens } from '@/showcase';

/*
 * The governed tier's showcase page.
 *
 * WHAT MAKES THIS DIFFERENT FROM A STAGING PAGE
 * ---------------------------------------------
 * A staging page is one person's reading of registry source. This one cites documents:
 * a spec a human merged before any code for it existed, a test file, and a stage-#7
 * accessibility report. Every number below — every contrast ratio, every height, the
 * count of blockers — is copied from one of them, and the Provenance strip says which.
 *
 * NOTHING HERE IS INVENTED, INCLUDING THE FAILURES. The resting border ships below AA
 * at 1.67:1 and the error message passes by 0.02. Both are on this page because both
 * are in the spec. A documentation page that shows only what went well is marketing.
 *
 * WHY IT LIVES BESIDE THE COMPONENT
 * ---------------------------------
 * `src/components/ui/` is a classified path — a PR touching it is COMPONENT_SOURCE and
 * needs a document on base. Input has one, so this file is free to sit here; that is
 * the tier's privilege, and it is why the staging pages had to live elsewhere.
 */
/*
 * WHY THIS FILE IS NOT IN `src/components/ui/` — measured, not assumed.
 *
 * It was put there first, because that is where Input lives. Two gate facts moved it,
 * and both were found by running `tools/classify-pr-diff.sh` rather than by reading it:
 *
 *   1. The classifier derives a component name from the basename, stripping only
 *      `.test`, `.spec` and `.stories`. `input.custom.stories.tsx` therefore yields
 *      `input.custom`, which fails the safe-name guard (`^[A-Za-z0-9][A-Za-z0-9_-]*$`
 *      — no dots) and makes the classifier **exit 1, failing the whole PR closed**.
 *
 *      Note what this means: `input.custom.stories.tsx` is the name the stage-#6
 *      generated file recommends in its own header for a bespoke story, and this
 *      repository's classifier rejects it. The two artifacts disagree. Recorded here
 *      rather than worked around silently.
 *
 *   2. A dot-free name such as `input-documentation.stories.tsx` clears the guard but
 *      registers a SECOND component name alongside `input`, so a PR touching both
 *      fails `enforce-one-component-per-pr` with COUNT=2.
 *
 *      Together those leave exactly three usable basenames in that directory —
 *      `input.tsx`, `input.test.tsx`, `input.stories.tsx` — and all three are taken.
 *
 * So the documentation page lives beside the showcase kit instead, symmetric with
 * `src/ui-staging/stories/`. Outside every classified path: the classifier returns
 * NONE for it.
 *
 * WHY THE TITLE IS A SIBLING AND NOT `Components/Input/Showcase`.
 *
 * `Components/<ComponentName>` is taken by input.stories.tsx, and that is not an
 * accident to route around: that file states its title convention comes from the #1
 * Context Snapshot, and it is regenerated whole by stage #6.
 *
 * Nesting under it was tried and does not work either — Storybook's explorer renders a
 * component's own stories before any child group, so `Components/Input/Showcase` lands
 * beneath all 19 stage-#6 stories regardless of storySort. A reader opening the
 * component would meet the behavioural harness before the page explaining it.
 *
 * So: a sibling, named by the convention this repository already uses for a
 * non-canonical entry — `Prototypes/HorizontalStepper (draft)`. Order is pinned in
 * .storybook/preview.ts so it sits above `Input` rather than after it.
 */
const meta = {
  title: 'Components/Input (documentation)',
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  render: () => (
    <Page
      title="Input"
      tier="governed"
      summary="Accepts one short, single-line text value, and tells the user what the value is for and what is wrong with it. It does not decide what is wrong."
    >
      <Provenance
        rows={[
          {
            what: 'Frozen specification',
            where: 'docs/component-specs/input.md',
            detail: 'v1 · merged to main by a human in PR #28, before any code existed',
          },
          {
            what: 'Requirements brief',
            where: 'docs/component-requirements/input.md',
            detail: '13 numbered requirements, CR-001…CR-013, all traced in the spec',
          },
          {
            what: 'Implementation and tests',
            where: 'src/components/ui/input.tsx · input.test.tsx',
            detail: 'PR #30 — built literally from the frozen spec',
          },
          {
            what: 'Accessibility audit',
            where: '.pipeline-reports/input/07-a11y.md',
            detail: '0 blockers · 0 warnings · 2 checks that need a person',
          },
        ]}
      />

      <Section
        title="Boundary"
        description="Stated against every neighbour it could be confused with, because a boundary given as a single pair is the one that gets crossed."
      >
        <Facts
          head={['Neighbour', 'Owns instead', 'The distinguishing question']}
          rows={[
            {
              cells: [
                'Textarea',
                'Multi-line prose, where the box grows',
                'Does the value have line breaks in it?',
              ],
            },
            {
              cells: ['Select', 'A value chosen from a known set', 'Is the user choosing or typing?'],
            },
            {
              cells: [
                'Search field',
                'A query that drives results elsewhere',
                'Does the value leave the form?',
              ],
            },
            {
              cells: [
                'Numeric stepper',
                'A quantity with increment affordances',
                'Are there controls other than the caret?',
              ],
            },
          ]}
        />
        <div className="mt-3">
          <Note>
            <strong>None of these four exists in this repository.</strong> Every row is a
            boundary drawn in the abstract — recorded so the first of them to ship has
            something to be consistent with, and labelled as untested rather than
            presented as a settled contract.
          </Note>
        </div>
      </Section>

      <Section
        title="What Input never does"
        description="Validate, format, mask, debounce, or decide when to show an error. It renders the error it is told to render."
      >
        <Facts
          head={['Not in v1', 'Why']}
          rows={[
            {
              cells: [
                'A leading icon slot',
                'This repository ships no icon set; adding one is a new runtime dependency and a Requires-Review item, a larger decision than the slot.',
              ],
            },
            {
              cells: ['Prefix and suffix slots', 'Same reasoning, and no requirement.'],
            },
            {
              cells: [
                'Specialised types — email, password, number',
                'Each carries its own keyboard, validation and accessibility contract. `type` is not exposed.',
              ],
            },
            {
              cells: [
                'A success state',
                'outline-input-success exists in the token layer and nothing requires it. A token existing is not a requirement.',
              ],
            },
            {
              cells: [
                'Read-only styling',
                'readOnly reaches the field, but nothing styles it, so it renders as resting. Named so the implementation does not read silence as licence.',
              ],
            },
          ]}
        />
      </Section>

      <Section
        title="Anatomy"
        description="Four parts. The description node is one node that carries either the supporting text or the error — never both, and never two nodes."
      >
        <Specimens columns={1}>
          <Specimen label="root › label › field › description" full>
            <div className="w-full max-w-sm">
              <Input
                label="Workspace name"
                required
                placeholder="acme"
                description="Lowercase letters and dashes."
              />
            </div>
          </Specimen>
        </Specimens>
        <div className="mt-5">
          <Facts
            head={['Part', 'Element', 'Owns']}
            rows={[
              { cells: ['Root', '<div>', 'Layout only. No colour. Receives className.'] },
              {
                cells: [
                  'Label',
                  '<label for>',
                  'Always rendered. The accessible name. Holds the required marker.',
                ],
              },
              {
                cells: [
                  'Field',
                  '<input type="text">',
                  'Surface, border, radius, height, padding. Receives ...rest and the ref.',
                ],
              },
              {
                cells: [
                  'Description',
                  '<p>',
                  'One node, one stable id. Rendered only when there is text or an error.',
                ],
              },
            ]}
          />
        </div>
      </Section>

      <Section
        title="Sizes"
        description="No variant axis. The error state is a state, not a variant — it is driven by data, not chosen by the caller as an appearance."
      >
        <Specimens columns={2}>
          <Specimen label='size="md"' hint="40px · the default" full>
            <div className="w-full">
              <Input label="Regular" placeholder="Standard forms" />
            </div>
          </Specimen>
          <Specimen label='size="sm"' hint="34px · compact" full>
            <div className="w-full">
              <Input size="sm" label="Compact" placeholder="Table filter bars" />
            </div>
          </Specimen>
        </Specimens>
        <div className="mt-3">
          <Note>
            Both sizes share one type size. The height difference is carried by the box,
            not the text — a compact field with smaller text would be a second,
            unrequested axis. Neither sets a height literal; both bind{' '}
            <code className="font-mono text-xs">--ds-shared-height-*</code> through{' '}
            <code className="font-mono text-xs">var()</code>.
          </Note>
        </div>
      </Section>

      <Section
        title="States"
        description="Seven, and the last three are the combinations the requirements brief flagged as unsettled. Each was decided in the spec rather than left to implementation."
      >
        <Specimens columns={3}>
          <Specimen label="resting" full>
            <div className="w-full">
              <Input label="Label" placeholder="Placeholder" />
            </div>
          </Specimen>
          <Specimen label="with supporting text" full>
            <div className="w-full">
              <Input label="Label" description="Supporting text." />
            </div>
          </Specimen>
          <Specimen label="required" hint="marker is aria-hidden" full>
            <div className="w-full">
              <Input label="Label" required />
            </div>
          </Specimen>
          <Specimen label="error" hint="replaces the supporting text" full>
            <div className="w-full">
              <Input label="Email" defaultValue="not-an-email" error="Enter a valid address." />
            </div>
          </Specimen>
          <Specimen label="disabled" full>
            <div className="w-full">
              <Input label="Label" disabled defaultValue="Locked" />
            </div>
          </Specimen>
          <Specimen label="error + disabled" hint="the message is still rendered" full>
            <div className="w-full">
              <Input label="Label" disabled defaultValue="Rejected" error="Rejected by the server." />
            </div>
          </Specimen>
        </Specimens>
        <div className="mt-5">
          <Facts
            head={['State', 'Field appearance', 'Behaviour']}
            rows={[
              { cells: ['resting', 'surface-input · outline-input', 'Editable.'] },
              {
                cells: [
                  'hover',
                  'outline-input-hovered · surface-input-hovered',
                  'Pointer only. Suppressed when disabled.',
                ],
              },
              {
                cells: [
                  'focus',
                  'outline-input-focused + a 2px ring in the SAME token',
                  'Identical for pointer and keyboard.',
                ],
              },
              { cells: ['error', 'outline-input-error', 'Still editable.'] },
              {
                cells: [
                  'error + focus',
                  'border stays error; the ring is added in the error token',
                  'The error keeps its colour; focus is the ring’s presence.',
                ],
              },
              {
                cells: [
                  'disabled',
                  'surface-input-disabled · outline-input-disabled · fg-disabled',
                  'Not editable, not focusable, skipped by Tab.',
                ],
              },
              {
                cells: [
                  'error + disabled',
                  'disabled appearance wins',
                  'The error message is STILL rendered — a server-rejected value the user cannot currently edit is real.',
                ],
              },
            ]}
          />
        </div>
        <div className="mt-3">
          <Note>
            <strong>Focus is never conveyed by fill.</strong>{' '}
            <code className="font-mono text-xs">surface-input-focused</code> is bound by
            nothing — it resolves to the same value as{' '}
            <code className="font-mono text-xs">surface-input</code>, byte-identical, so
            binding it would render exactly nothing. Focus is carried by the border plus
            the ring.
          </Note>
        </div>
      </Section>

      <Section title="API">
        <Api
          rows={[
            {
              prop: 'label',
              type: 'string',
              def: '— required',
              note: 'Visible, and the accessible name. Not optional: a field without one has no name.',
            },
            { prop: 'value', type: 'string', note: 'Controlled. Its presence switches the mode.' },
            { prop: 'defaultValue', type: 'string', note: 'Uncontrolled initial value.' },
            {
              prop: 'onValueChange',
              type: '(value: string) => void',
              note: 'The single change channel, in both modes. Carries the value, not the event.',
            },
            { prop: 'placeholder', type: 'string', note: 'Shown only while the value is empty.' },
            { prop: 'description', type: 'string', note: 'Supporting text. Replaced by error.' },
            {
              prop: 'error',
              type: 'string',
              note: 'Presence sets the error state. An empty string is treated as no error.',
            },
            { prop: 'required', type: 'boolean', def: 'false', note: 'Marker + native attribute.' },
            { prop: 'disabled', type: 'boolean', def: 'false', note: 'Native. Leaves the tab order.' },
            {
              prop: 'size',
              type: "'sm' | 'md'",
              def: "'md'",
              note: 'Shadows the native size attribute, which is deliberately omitted — D2.',
            },
            {
              prop: 'className',
              type: 'string',
              note: 'Lands on the ROOT. ...rest lands on the FIELD. Different elements, deliberately.',
            },
          ]}
        />
        <div className="mt-3">
          <Note>
            <code className="font-mono text-xs">onChange</code> is omitted from the rest
            type alongside the props the component owns. Two independent change channels
            on one element is exactly the ambiguity the controlled contract exists to
            remove.
          </Note>
        </div>
      </Section>

      <Section
        title="Tokens"
        description="Referenced, never defined. No component token is introduced — every row below is a semantic token that already existed."
      >
        <Facts
          head={['Element', 'Token', 'Role']}
          rows={[
            { cells: ['field fill — resting, focus', 'surface-input', 'background'] },
            { cells: ['field fill — hover', 'surface-input-hovered', 'background'] },
            { cells: ['field fill — disabled', 'surface-input-disabled', 'background'] },
            { cells: ['field border — resting', 'outline-input', '1px · below AA, accepted'] },
            { cells: ['field border — hover', 'outline-input-hovered', '1px'] },
            { cells: ['field border — focus', 'outline-input-focused', '1px'] },
            { cells: ['field border — error', 'outline-input-error', '1px'] },
            { cells: ['field border — disabled', 'outline-input-disabled', '1px'] },
            {
              cells: [
                'focus ring',
                'outline-input-focused / -error',
                '2px · always the border’s current token',
              ],
            },
            { cells: ['field height', 'shared-height-md / -sm', 'via var() — an accepted deviation'] },
            { cells: ['field radius', 'radius-sm', '4px'] },
            { cells: ['value text', 'fg-default', 'text'] },
            { cells: ['placeholder', 'fg-subtlest', 'text'] },
            { cells: ['label · supporting text', 'fg-subtle', 'text'] },
            { cells: ['error message · required marker', 'fg-status-danger', 'text · decorative glyph'] },
            {
              cells: [
                'all three type roles',
                'font-body-sm-default',
                'composite, so size, weight and line-height cannot drift apart',
              ],
            },
          ]}
        />
      </Section>

      <Section
        title="Contrast — measured, not asserted"
        description="Computed from the built token output with the WCAG 2.x relative-luminance formula. The two highlighted rows are why this table is on the page."
      >
        <Facts
          head={['Element', 'Pair', 'Ratio', 'Floor', '']}
          align={[2]}
          rows={[
            { cells: ['value text', 'fg-default on surface-input', '18.90:1', '4.5', 'pass'] },
            { cells: ['placeholder', 'fg-subtlest on surface-input', '4.73:1', '4.5', 'pass'] },
            { cells: ['label · supporting', 'fg-subtle on surface-page', '6.73:1', '4.5', 'pass'] },
            {
              cells: ['error message', 'fg-status-danger on surface-page', '4.52:1', '4.5', 'pass, by 0.02'],
              emphasis: true,
            },
            { cells: ['border — hover', 'outline-input-hovered on surface-input', '4.20:1', '3.0', 'pass'] },
            { cells: ['border — focus', 'outline-input-focused on surface-input', '6.45:1', '3.0', 'pass'] },
            { cells: ['border — error', 'outline-input-error on surface-input', '4.77:1', '3.0', 'pass'] },
            { cells: ['focus ring', 'outline-input-focused on surface-page', '6.11:1', '3.0', 'pass'] },
            {
              cells: ['border — resting', 'outline-input on surface-input', '1.67:1', '3.0', 'FAIL — accepted'],
              emphasis: true,
            },
            {
              cells: [
                'disabled text',
                'fg-disabled on surface-input-disabled',
                '2.00:1',
                '—',
                'exempt (1.4.3 excludes disabled)',
              ],
            },
          ]}
        />
        <div className="mt-3 space-y-3">
          <Note tone="warning">
            <strong>The resting border ships below AA, knowingly.</strong> 1.67:1 against
            a 3:1 floor — and every neutral outline token in this palette is. It was
            accepted at the requirements stage and escalated to governance as a
            palette-level finding, rather than hidden inside one component by swapping in
            an accent token that happens to pass.
          </Note>
          <Note tone="warning">
            <strong>The error message passes by 0.02.</strong> Any darkening of the page
            surface or lightening of the danger foreground breaks it, and nothing
            currently guards that — so it is named as a required test facet instead of
            being left to chance.
          </Note>
        </div>
      </Section>

      <Section
        title="Accessibility contract"
        description="Ten numbered requirements in the spec, audited at stage #7 against the WCAG 2.2 AA floor."
      >
        <Facts
          head={['#', 'Requirement', 'How it is met']}
          rows={[
            {
              cells: [
                'A11Y-001',
                'Name',
                'The visible label, via <label for> / id. The id is generated with useId, so two Inputs never collide.',
              ],
            },
            { cells: ['A11Y-002', 'Role', 'The native textbox role. No role attribute is set.'] },
            {
              cells: [
                'A11Y-003',
                'Required',
                'The native attribute. The asterisk is aria-hidden and never reaches the name.',
              ],
            },
            {
              cells: [
                'A11Y-004',
                'Error',
                'aria-invalid while error is set, plus aria-describedby at the description node. No live region.',
              ],
            },
            {
              cells: [
                'A11Y-005',
                'Description',
                'One node, one stable id. aria-describedby is absent entirely when there is neither text nor error.',
              ],
            },
            {
              cells: [
                'A11Y-006',
                'Keyboard',
                'Tab in, Tab out. No key handling of its own — every editing key belongs to the browser.',
              ],
            },
            {
              cells: [
                'A11Y-007',
                'Disabled',
                'The native attribute, which leaves the tab order. aria-disabled is NOT used: it would keep the field focusable.',
              ],
            },
            {
              cells: [
                'A11Y-008',
                'Focus visibility',
                'Two simultaneous signals — a border colour change and a 2px ring — so focus is never carried by hue alone.',
              ],
            },
            {
              cells: [
                'A11Y-009',
                'Target size',
                '40px and 34px against the AA floor of 24px. AAA (44px) is not claimed.',
              ],
            },
            {
              cells: [
                'A11Y-010',
                'Colour is never the only signal',
                'The error carries words, not only a red border. The required state carries a glyph.',
              ],
            },
          ]}
        />
      </Section>

      <Section
        title="What the pipeline produced, and what it could not"
        description="The stage-#7 report in full. The honest part of this section is the last row."
      >
        <Facts
          head={['Measure', 'Result']}
          rows={[
            { cells: ['Blockers', '0'] },
            { cells: ['Warnings', '0'] },
            { cells: ['Requires review', '0'] },
            { cells: ['Applicable requirements', '10 of 18 — 8 excluded as not applicable to this archetype'] },
            { cells: ['Automated checks', '2'] },
            { cells: ['Assisted checks', '6'] },
            {
              cells: [
                'Manual-required checks',
                '2 — aria.role-correct and sr.flow-coherent. An agent cannot close these; a person has to listen.',
              ],
              emphasis: true,
            },
          ]}
        />
        <div className="mt-3">
          <Note>
            Those last two are not a gap in the work — they are the two checks that
            require a human with a screen reader, and the audit says so rather than
            marking them passed. That distinction is the reason to trust the other
            sixteen rows.
          </Note>
        </div>
      </Section>
    </Page>
  ),
};
