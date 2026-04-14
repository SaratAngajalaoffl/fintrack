export const CATPPUCCIN_MOCHA_COLOR_OPTIONS = [
  "text",
  "subtext-1",
  "subtext-0",
  "overlay-2",
  "overlay-1",
  "overlay-0",
  "surface-2",
  "surface-1",
  "surface-0",
  "base",
  "mantle",
  "crust",
  "red",
  "mauve",
] as const;

export type CatppuccinMochaColor =
  (typeof CATPPUCCIN_MOCHA_COLOR_OPTIONS)[number];

export type ExpenseCategoryRow = {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  color: CatppuccinMochaColor;
};

export type ExpenseCategoriesListState = {
  q: string;
  sort: string;
};
