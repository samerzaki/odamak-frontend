"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "./bottom-nav";
import { Footer } from "./footer";
import { PriceTicker } from "./price-ticker";
import { cn } from "@/lib/utils";
import { isChromelessPath } from "@/lib/navigation";

type AppShellProps = {
  children: React.ReactNode;
  className?: string;
};

export function AppShell({ children, className }: AppShellProps) {
  const pathname = usePathname();

  // Auth pages render their own full-screen shell (components/auth/auth-shell.tsx)
  // and opt out of the site chrome entirely.
  if (isChromelessPath(pathname)) {
    return <>{children}</>;
  }

  return (
    <>
      <PriceTicker />
      <main className={cn("min-h-screen flex flex-col mb-20 md:mb-0", className)}>
        <div className="flex-1 px-4 md:px-8 pt-6 md:pt-8 pb-[110px] min-h-[60vh]">
          <div className="mx-auto max-w-[1300px]">{children}</div>
        </div>
        <Footer />
      </main>
      <BottomNav />
    </>
  );
}
