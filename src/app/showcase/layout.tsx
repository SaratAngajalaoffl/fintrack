import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UI showcase | Fintrack",
  description: "Preview of Fintrack UI primitives and variants",
};

export default function ShowcaseLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
