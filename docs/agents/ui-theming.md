## UI and theming rules

1. **Reuse `web/src/components/ui`:** Build screens from the existing kit (`Button`, `ButtonWithTooltip`, `Dialog`, `Field`, `TextField`, `NumericField`, `CurrencyField`, `TextareaField`, `SelectField`, `MultiSelectField`, `RadioField`, `DropdownMenu` / `Menu`, `Card`, `Tooltip`, …). Import from `@/components/ui`. Only add a new primitive in `ui/` when something is genuinely missing; do not duplicate buttons, inputs, or modals ad hoc in feature folders. **New or changed primitives:** update the showcase page.
2. **Styling:** Do not hardcode one-off hex colors for core UI unless the task requires it. Use Mocha tokens (`text-text`, `bg-surface-0`, `border-border`, …) or roles (`primary`, `secondary`, `foreground`, `muted`). Use `cn()` from `@/lib/utils` to merge Tailwind classes.
3. **Tailwind v4:** Add new CSS variables under `:root` and map them in `@theme inline` in `globals.css`.
4. **CSS variables in utilities (canonical classes):** This project uses Tailwind v4's **parentheses shorthand** for `var(...)`. **Do not** write `px-[var(--page-padding-x)]` or `min-w-[var(--radix-select-trigger-width)]`. **Do** write `px-(--page-padding-x)`, `w-(--radix-popover-trigger-width)`, `min-w-(--radix-select-trigger-width)`, etc. For expressions (e.g. `min()` with several arguments), use the same form: `max-h-(min(24rem,var(--radix-select-content-available-height)))`. Use square-bracket arbitrary values `[...]` only when this syntax cannot express the value. This avoids ESLint **`suggestCanonicalClasses`** noise and matches the [Tailwind v4 arbitrary value](https://tailwindcss.com/docs/adding-custom-styles) conventions.
5. **Theme:** The app is **Catppuccin Mocha** (dark). `html` uses **crust** as the outer shell; `body` uses **base** as the main background. A light theme (e.g. Latte) can be added later by extending `:root` or a class on `<html>`.
6. **Logos:** Round / long / short brand assets under `web/public/brand/`. Do not remove without replacing usages.
7. **Forms:** Prefer `*Field` components for labeled controls with errors; use `inputClassName` when styling the inner control and `className` on the field for the outer wrapper. `TooltipProvider` wraps the app in `layout.tsx` for `ButtonWithTooltip` / `Tooltip`.
8. **Icons:** Put static `.svg` / `.png` (and similar) under **`web/public/icons/`**; put shared inline-SVG React icons under **`web/src/components/icons/`**.
9. **Server vs client:** Prefer Server Components for routes and non-interactive UI; keep client boundaries small.

### Catppuccin Mocha reference (implemented)

| Role                  | Hex                               |
| --------------------- | --------------------------------- |
| Primary (red)         | `#f38ba8`                         |
| Secondary (mauve)     | `#cba6f7`                         |
| Text                  | `#cdd6f4`                         |
| Subtext 1 / 0         | `#bac2de` / `#a6adc8`             |
| Overlay 2 → 0         | `#9399b2` → `#7f849c` → `#6c7086` |
| Surface 2 → 0         | `#585b70` → `#45475a` → `#313244` |
| Base / Mantle / Crust | `#1e1e2e` / `#181825` / `#11111b` |
