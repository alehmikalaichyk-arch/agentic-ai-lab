import type { Meta, StoryObj } from '@storybook/react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/ui-staging/accordion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/ui-staging/alert-dialog';
import { Button } from '@/ui-staging/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/ui-staging/collapsible';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/ui-staging/context-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/ui-staging/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/ui-staging/drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/ui-staging/dropdown-menu';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/ui-staging/hover-card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/ui-staging/popover';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/ui-staging/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/ui-staging/tooltip';

import { Case, Grid, Row } from './shared';

/*
 * Staging tier — overlays and disclosure.
 *
 * Everything here is closed at rest, which is the honest resting state. Click through
 * them: an overlay's colour mapping is only visible once it is open, and the popover
 * and dialog surfaces are mapped to DIFFERENT tokens (surface-overlay vs
 * surface-raised) than the page behind them.
 */
const meta = {
  title: 'Staging/Overlays',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overlays: Story = {
  render: () => (
    <Grid>
      <Case name="dialog  /  alert-dialog">
        <Row>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Open dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Freeze this spec?</DialogTitle>
                <DialogDescription>
                  Freezing is a merge to main, performed by a person. This dialog is a
                  prototype and does nothing.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button>Merge PR-1</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Open alert dialog</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Discard the draft?</AlertDialogTitle>
                <AlertDialogDescription>
                  A visual draft is scaffolding and is deleted in PR-2 anyway.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep</AlertDialogCancel>
                <AlertDialogAction>Discard</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Row>
      </Case>

      <Case name="sheet  /  drawer">
        <Row>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Open sheet</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Stage reports</SheetTitle>
                <SheetDescription>
                  Four files the quality gate reads in a fresh context.
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>

          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline">Open drawer</Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Token inventory</DrawerTitle>
                <DrawerDescription>196 semantic colour tokens.</DrawerDescription>
              </DrawerHeader>
            </DrawerContent>
          </Drawer>
        </Row>
      </Case>

      <Case name="dropdown-menu  /  context-menu">
        <Row>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Open menu</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Component</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Promote <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>Open spec</DropdownMenuItem>
              <DropdownMenuItem variant="destructive">Remove</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ContextMenu>
            <ContextMenuTrigger className="flex h-16 w-56 items-center justify-center rounded-md border border-dashed border-outline-default text-sm text-fg-subtle">
              Right-click here
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem>Inspect token</ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem>Copy class</ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </Row>
      </Case>

      <Case name="popover  /  tooltip  /  hover-card">
        <Row>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Popover</Button>
            </PopoverTrigger>
            <PopoverContent className="text-sm">
              Mapped to surface-overlay, not surface-raised.
            </PopoverContent>
          </Popover>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">Tooltip</Button>
              </TooltipTrigger>
              <TooltipContent>Inverse surface, by design.</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="link">Hover card</Button>
            </HoverCardTrigger>
            <HoverCardContent className="text-sm">
              Opens on hover after a delay.
            </HoverCardContent>
          </HoverCard>
        </Row>
      </Case>

      <Case name="accordion  /  collapsible">
        <div className="max-w-md space-y-4">
          <Accordion type="single" collapsible>
            <AccordionItem value="one">
              <AccordionTrigger>What is the staging tier?</AccordionTrigger>
              <AccordionContent>
                Registry components with no spec, tests or audit — outside every gate,
                openly.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="two">
              <AccordionTrigger>How does a component leave it?</AccordionTrigger>
              <AccordionContent>
                By moving to src/components/ui/ after the pipeline, as a visible diff.
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                Toggle details
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 text-sm text-fg-subtle">
              Collapsible is the unstyled primitive underneath accordion.
            </CollapsibleContent>
          </Collapsible>
        </div>
      </Case>
    </Grid>
  ),
};
