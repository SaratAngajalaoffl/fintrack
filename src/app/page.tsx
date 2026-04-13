import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-16">
      <main className="flex max-w-lg flex-col items-center gap-8 text-center">
        <Image
          src="/brand/round_logo.png"
          alt="Fintrack"
          width={128}
          height={128}
          priority
          className="h-28 w-28 object-contain"
        />
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Fintrack
          </h1>
          <p className="text-subtext-1 text-lg leading-relaxed">
            Personal finance tracking — balances, categories, and clarity in one
            place.
          </p>
        </div>
        <p className="text-sm text-subtext-0">
          Theme: Catppuccin Mocha tokens in{" "}
          <code className="rounded bg-surface-0 px-1.5 py-0.5 text-text">
            globals.css
          </code>
        </p>
      </main>
    </div>
  );
}
