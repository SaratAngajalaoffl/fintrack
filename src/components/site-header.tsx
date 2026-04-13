import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-mantle/95 backdrop-blur supports-backdrop-filter:bg-mantle/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center rounded-md focus-visible:outline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-base"
        >
          <Image
            src="/brand/long_logo.png"
            alt="Fintrack"
            width={376}
            height={124}
            className="h-9 w-auto max-w-[min(100%,240px)] object-contain object-left"
            priority
          />
        </Link>
      </div>
    </header>
  );
}
