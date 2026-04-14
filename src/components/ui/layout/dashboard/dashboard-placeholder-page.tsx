type DashboardPlaceholderPageProps = {
  title: string;
};

export function DashboardPlaceholderPage({
  title,
}: DashboardPlaceholderPageProps) {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        {title}
      </h1>
      <p className="mt-2 text-subtext-1">Placeholder — content coming soon.</p>
    </div>
  );
}
