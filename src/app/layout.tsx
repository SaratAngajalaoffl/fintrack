import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { InteractiveBackground } from "@/components/ui/common/background";
import { SiteHeader } from "@/components/ui/common/header";
import { Toaster } from "@/components/ui/common/toast";
import { TooltipProvider } from "@/components/ui/common/tooltip";
import { ReactQueryProvider } from "@/services";
import "sonner/dist/styles.css";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fintrack",
  description: "Personal finance tracking",
  icons: {
    icon: [{ url: "/brand/round_logo.png", type: "image/svg+xml" }],
    apple: [{ url: "/brand/round_logo.png", type: "image/svg+xml" }],
    shortcut: "/brand/round_logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <ReactQueryProvider>
          <TooltipProvider>
            <div className="relative flex min-h-full flex-1 flex-col">
              <InteractiveBackground />
              <div className="relative z-10 flex min-h-full flex-1 flex-col">
                <SiteHeader />
                <div className="flex flex-1 flex-col">{children}</div>
              </div>
              <Toaster />
            </div>
          </TooltipProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
