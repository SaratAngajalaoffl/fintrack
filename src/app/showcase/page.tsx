"use client";

import * as React from "react";

import {
  Button,
  ButtonWithTooltip,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  Input,
  Label,
  MultiSelectField,
  NumericField,
  CurrencyField,
  RadioField,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectField,
  SelectItem,
  SelectTrigger,
  SelectValue,
  TextareaField,
  TextField,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui";
import { cn } from "@/utils/tailwind-utils";

type AccountOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

const accountOptions: AccountOption[] = [
  { value: "checking", label: "Checking" },
  { value: "savings", label: "Savings" },
  { value: "credit", label: "Credit card", disabled: true },
];

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="scroll-mt-6 space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm text-subtext-1">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function IconPlus({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className={cn("size-4", className)}
      aria-hidden
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export default function ShowcasePage() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [multi, setMulti] = React.useState<string[]>(["checking"]);
  const [selectField, setSelectField] = React.useState("savings");
  const [selectRaw, setSelectRaw] = React.useState("checking");
  const [radioField, setRadioField] = React.useState("weekly");
  const [radioStandalone, setRadioStandalone] = React.useState("a");
  const [menuChecked, setMenuChecked] = React.useState(true);
  const [menuRadio, setMenuRadio] = React.useState("one");

  return (
    <div className="min-h-full bg-background">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <header className="mb-12 border-b border-border pb-8">
          <p className="text-xs font-medium uppercase tracking-wide text-subtext-0">
            Development
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            UI showcase
          </h1>
          <p className="mt-2 max-w-2xl text-subtext-1">
            Fintrack primitives: buttons, fields, overlays, and menus. Use this
            page to verify styling and behavior after theme or component
            changes.
          </p>
        </header>

        <div className="space-y-14">
          <Section
            title="Button"
            description="Variants and sizes from the shared button styles."
          >
            <Card>
              <CardHeader>
                <CardTitle>Variants</CardTitle>
                <CardDescription>
                  default, secondary, outline, ghost, destructive, link
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="link" className="h-auto px-0">
                  Link style
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sizes</CardTitle>
                <CardDescription>
                  default, sm, lg, icon, icon-sm
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-2">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon" aria-label="Add">
                  <IconPlus />
                </Button>
                <Button size="icon-sm" aria-label="Add small">
                  <IconPlus />
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>States</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button disabled>Disabled</Button>
                <Button variant="outline" disabled>
                  Disabled outline
                </Button>
              </CardContent>
            </Card>
          </Section>

          <Section
            title="Button with tooltip"
            description="Hover or focus the control to see the tooltip (root layout includes TooltipProvider)."
          >
            <Card>
              <CardContent className="flex flex-wrap gap-3 pt-6">
                <ButtonWithTooltip
                  tooltip="Creates a new transaction"
                  variant="default"
                >
                  With tooltip
                </ButtonWithTooltip>
                <ButtonWithTooltip
                  tooltip="Opens settings"
                  tooltipSide="bottom"
                  variant="outline"
                  size="sm"
                >
                  Bottom side
                </ButtonWithTooltip>
              </CardContent>
            </Card>
          </Section>

          <Section title="Tooltip" description="Standalone trigger + content.">
            <Card>
              <CardContent className="flex flex-wrap gap-3 pt-6">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" type="button">
                      Hover me
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Short helper text</TooltipContent>
                </Tooltip>
              </CardContent>
            </Card>
          </Section>

          <Section title="Label">
            <Card>
              <CardContent className="space-y-2 pt-6">
                <Label htmlFor="showcase-label-demo">Standalone label</Label>
                <Input
                  id="showcase-label-demo"
                  placeholder="Associated input"
                />
              </CardContent>
            </Card>
          </Section>

          <Section
            title="Input"
            description="Plain input and grouped adornments."
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Default</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input placeholder="Search…" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Adornments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input startAdornment="USD" placeholder="0.00" />
                  <Input endAdornment="%" placeholder="Rate" />
                </CardContent>
              </Card>
            </div>
          </Section>

          <Section
            title="Fields"
            description="Field wrappers with label, description, and error text."
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <TextField
                label="Text"
                description="Short helper under the control."
                placeholder="Account nickname"
                defaultValue="Main checking"
              />
              <TextField
                label="With error"
                error="This field is required."
                placeholder="Required"
              />
              <NumericField
                label="Numeric"
                description="Decimal-friendly input mode."
                placeholder="0.00"
                defaultValue="1234.56"
              />
              <CurrencyField
                label="Currency"
                currencyCode="USD"
                description="ISO code in the start adornment."
                placeholder="0.00"
                defaultValue="99.00"
              />
              <div className="sm:col-span-2">
                <TextareaField
                  label="Textarea"
                  description="Notes or longer text."
                  placeholder="Optional notes…"
                  rows={4}
                  defaultValue=""
                />
              </div>
            </div>
          </Section>

          <Section title="Select field">
            <SelectField
              label="Account"
              description="Radix select with Field wiring."
              placeholder="Choose an account"
              options={[...accountOptions]}
              value={selectField}
              onValueChange={setSelectField}
            />
          </Section>

          <Section title="Select (primitives)">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Unstyled field shell
                </CardTitle>
                <CardDescription>
                  SelectTrigger, SelectValue, SelectContent, SelectItem
                </CardDescription>
              </CardHeader>
              <CardContent className="max-w-xs">
                <Select value={selectRaw} onValueChange={setSelectRaw}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pick one" />
                  </SelectTrigger>
                  <SelectContent>
                    {[...accountOptions].map((opt) => (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        disabled={opt.disabled}
                      >
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </Section>

          <Section title="Multi-select field">
            <MultiSelectField
              label="Tags"
              description="Multi-value popover with checkboxes."
              options={[
                { value: "food", label: "Food & dining" },
                { value: "transit", label: "Transit" },
                { value: "bills", label: "Bills" },
              ]}
              value={multi}
              onValueChange={setMulti}
              placeholder="Choose categories…"
            />
          </Section>

          <Section title="Radio field">
            <RadioField
              label="Report cadence"
              description="Horizontal layout option."
              name="cadence"
              orientation="horizontal"
              options={[
                { value: "daily", label: "Daily" },
                { value: "weekly", label: "Weekly" },
                { value: "monthly", label: "Monthly" },
              ]}
              value={radioField}
              onValueChange={setRadioField}
            />
          </Section>

          <Section title="Radio group (primitives)">
            <Card>
              <CardContent className="space-y-3 pt-6">
                <Label className="text-subtext-1">Standalone group</Label>
                <RadioGroup
                  value={radioStandalone}
                  onValueChange={setRadioStandalone}
                  className="flex gap-4"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="a" id="rg-a" />
                    <Label htmlFor="rg-a" className="font-normal">
                      Option A
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="b" id="rg-b" />
                    <Label htmlFor="rg-b" className="font-normal">
                      Option B
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </Section>

          <Section title="Card">
            <Card className="max-w-lg">
              <CardHeader>
                <CardTitle>Card title</CardTitle>
                <CardDescription>
                  Header, content, and footer regions with shared borders.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-subtext-1">
                  Card body copy for dashboards, settings panels, or summaries.
                </p>
              </CardContent>
              <CardFooter className="justify-end gap-2">
                <Button variant="outline" size="sm" type="button">
                  Cancel
                </Button>
                <Button size="sm" type="button">
                  Save
                </Button>
              </CardFooter>
            </Card>
          </Section>

          <Section title="Dialog">
            <Card>
              <CardContent className="pt-6">
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" type="button">
                      Open dialog
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Example dialog</DialogTitle>
                      <DialogDescription>
                        Modal content uses the shared overlay and focus trap.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => setDialogOpen(false)}
                      >
                        Close
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setDialogOpen(false)}
                      >
                        Confirm
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </Section>

          <Section
            title="Dropdown menu"
            description="Items, submenu, checkbox, and radio patterns."
          >
            <Card>
              <CardContent className="flex flex-wrap gap-3 pt-6">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" type="button">
                      Open menu ▾
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="start">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onSelect={() => undefined}>
                      New item
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem>Sub action</DropdownMenuItem>
                        <DropdownMenuItem>Another</DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                      checked={menuChecked}
                      onCheckedChange={setMenuChecked}
                    >
                      Show archived
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup
                      value={menuRadio}
                      onValueChange={setMenuRadio}
                    >
                      <DropdownMenuRadioItem value="one">
                        Radio one
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="two">
                        Radio two
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          </Section>
        </div>
      </div>
    </div>
  );
}
