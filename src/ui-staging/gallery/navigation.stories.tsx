import type { Meta, StoryObj } from '@storybook/react';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/ui-staging/breadcrumb';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/ui-staging/command';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from '@/ui-staging/menubar';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/ui-staging/navigation-menu';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/ui-staging/pagination';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui-staging/tabs';

import { Case, Grid } from './shared';

/*
 * Staging tier — navigation. Menus open on click; nothing here is a static picture.
 */
const meta = {
  title: 'Staging/Navigation',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Navigation: Story = {
  render: () => (
    <Grid>
      <Case name="tabs">
        <Tabs defaultValue="spec" className="max-w-md">
          <TabsList>
            <TabsTrigger value="spec">Spec</TabsTrigger>
            <TabsTrigger value="impl">Implementation</TabsTrigger>
            <TabsTrigger value="a11y">A11y</TabsTrigger>
          </TabsList>
          <TabsContent value="spec" className="pt-3 text-sm">
            Merged by a human before any code for it existed.
          </TabsContent>
          <TabsContent value="impl" className="pt-3 text-sm">
            Built literally from the frozen spec.
          </TabsContent>
          <TabsContent value="a11y" className="pt-3 text-sm">
            0 blockers, 2 checks that need a person.
          </TabsContent>
        </Tabs>
      </Case>

      <Case name="breadcrumb">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">src</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">ui-staging</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>button.tsx</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Case>

      <Case name="pagination">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                2
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </Case>

      <Case name="navigation-menu">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Pipeline</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-56 gap-1 p-2">
                  <li>
                    <NavigationMenuLink href="#">Requirements</NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink href="#">Specification</NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink href="#">Quality gate</NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </Case>

      <Case name="menubar">
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                New spec <MenubarShortcut>⌘N</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Open prototype</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>View</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Storybook</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </Case>

      <Case name="command">
        <Command className="max-w-sm rounded-md border border-outline-subtle">
          <CommandInput placeholder="Search a component…" />
          <CommandList>
            <CommandEmpty>Nothing matches.</CommandEmpty>
            <CommandGroup heading="Staging">
              <CommandItem>
                Button <CommandShortcut>⌘B</CommandShortcut>
              </CommandItem>
              <CommandItem>Dialog</CommandItem>
              <CommandItem>Table</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </Case>
    </Grid>
  ),
};
