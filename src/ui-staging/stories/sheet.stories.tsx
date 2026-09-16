import type { Meta, StoryObj } from '@storybook/react';

import { Api, Note, Page, Section, Specimen, Specimens } from '@/showcase';
import { Button } from '@/ui-staging/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/ui-staging/drawer';
import { Input } from '@/ui-staging/input';
import { Label } from '@/ui-staging/label';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/ui-staging/sheet';

const meta = {
  title: 'Staging/Sheet & Drawer',
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  render: () => (
    <Page
      title="Sheet & Drawer"
      tier="staging"
      summary="Two panels that slide in from an edge. They look interchangeable and are not: Sheet is a modal on every screen, Drawer is built for touch and drags to dismiss."
    >
      <Section
        title="Sheet — sides"
        description="Four edges. Right is the default and the one a desktop user expects for a detail panel; bottom reads as a mobile pattern even on a wide screen."
      >
        <Specimens columns={4}>
          {(['right', 'left', 'top', 'bottom'] as const).map((side) => (
            <Specimen key={side} label={`side="${side}"`}>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    {side}
                  </Button>
                </SheetTrigger>
                <SheetContent side={side}>
                  <SheetHeader>
                    <SheetTitle>Stage reports</SheetTitle>
                    <SheetDescription>
                      Four files the quality gate reads in a fresh context.
                    </SheetDescription>
                  </SheetHeader>
                </SheetContent>
              </Sheet>
            </Specimen>
          ))}
        </Specimens>
      </Section>

      <Section
        title="Sheet with a form"
        description="The usual job: edit something without losing sight of where it came from. Give it a footer so the primary action does not scroll away."
      >
        <Specimens columns={1}>
          <Specimen label="header + body + footer">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">Edit component</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Edit component</SheetTitle>
                  <SheetDescription>Staging tier — no spec to violate yet.</SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 px-4">
                  <div className="grid gap-2">
                    <Label htmlFor="sb-sh-name">Name</Label>
                    <Input id="sb-sh-name" defaultValue="button" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="sb-sh-tier">Tier</Label>
                    <Input id="sb-sh-tier" defaultValue="ui-staging" disabled />
                  </div>
                </div>
                <SheetFooter>
                  <Button>Save</Button>
                  <SheetClose asChild>
                    <Button variant="ghost">Cancel</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </Specimen>
        </Specimens>
      </Section>

      <Section
        title="Drawer"
        description="Bottom-anchored and draggable. Grab its handle and pull down — that gesture is the reason to pick it over a bottom Sheet."
      >
        <Specimens columns={2}>
          <Specimen label="Drawer" hint="drag the handle to dismiss">
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline">Open drawer</Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Token inventory</DrawerTitle>
                  <DrawerDescription>
                    196 semantic colour tokens across three families.
                  </DrawerDescription>
                </DrawerHeader>
                <DrawerFooter>
                  <Button>Open in Foundations</Button>
                  <DrawerClose asChild>
                    <Button variant="ghost">Close</Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </Specimen>
          <Specimen label='Sheet side="bottom"' hint="no drag — compare the two">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">Open bottom sheet</Button>
              </SheetTrigger>
              <SheetContent side="bottom">
                <SheetHeader>
                  <SheetTitle>Token inventory</SheetTitle>
                  <SheetDescription>Same position, different behaviour.</SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>
          </Specimen>
        </Specimens>
      </Section>

      <Section title="API">
        <Api
          rows={[
            {
              prop: 'SheetContent side',
              type: "'top' | 'right' | 'bottom' | 'left'",
              def: "'right'",
            },
            { prop: 'open / defaultOpen', type: 'boolean', note: 'With onOpenChange.' },
            {
              prop: 'SheetTitle / DrawerTitle',
              type: 'node',
              note: 'Required — it names the panel to assistive technology.',
            },
            {
              prop: 'Drawer direction',
              type: "'top' | 'right' | 'bottom' | 'left'",
              def: "'bottom'",
              note: 'Vaul underneath. Dragging is the point.',
            },
          ]}
        />
      </Section>

      <Section title="Which one">
        <Note>
          <strong>Sheet</strong> for a desktop detail or edit panel — right side, modal,
          keyboard-dismissible. <strong>Drawer</strong> when the primary device is a
          phone and the dismiss gesture matters. Using Drawer on a desktop-first screen
          gives you a bottom panel nobody will think to drag.
        </Note>
      </Section>
    </Page>
  ),
};
