export const CATPPUCCIN_MOCHA_COLOR_OPTIONS = [
  "rosewater",
  "flamingo",
  "pink",
  "red",
  "maroon",
  "peach",
  "yellow",
  "green",
  "teal",
  "sky",
  "sapphire",
  "blue",
  "lavender",
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
