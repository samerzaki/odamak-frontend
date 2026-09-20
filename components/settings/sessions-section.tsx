"use client";

import { useEffect, useState } from "react";
import { Monitor, Smartphone } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { SectionCard } from "@/components/ui/section-card";

function detectDevice(userAgent: string): { label: string; icon: typeof Monitor } {
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(userAgent);
  const browserMatch = userAgent.match(/(Chrome|Safari|Firefox|Edg)\/[\d.]+/);
  const browser = browserMatch ? browserMatch[1].replace("Edg", "Edge") : "";
  const osMatch = userAgent.match(/\(([^)]+)\)/);
  const os = osMatch
    ? /Windows/i.test(osMatch[1])
      ? "Windows"
      : /Mac OS X/i.test(osMatch[1])
        ? "macOS"
        : /Android/i.test(osMatch[1])
          ? "Android"
          : /iPhone|iPad/i.test(osMatch[1])
            ? "iOS"
            : ""
    : "";
  const label = [browser, os].filter(Boolean).join(" · ") || userAgent;
  return { label, icon: isMobile ? Smartphone : Monitor };
}

/**
 * No backend support yet for listing/revoking sessions — shows only the
 * current device (read from the browser), never a fabricated device list.
 */
export function SessionsSection() {
  const { t } = useLanguage();
  const tt = t.pages.settings.sessions;
  const [device, setDevice] = useState<{ label: string; icon: typeof Monitor } | null>(null);

  useEffect(() => {
    setDevice(detectDevice(navigator.userAgent));
  }, []);

  return (
    <SectionCard title={tt.title}>
      <div className="p-4 md:p-5">
        <p className="text-[12.5px] text-muted mb-3">{tt.subtitle}</p>
        {device && (
          <div className="flex items-center gap-3 rounded-[11px] border border-line bg-panel-2 p-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-panel">
              <device.icon className="h-4 w-4 text-muted" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-medium text-text truncate">{device.label}</div>
            </div>
            <span className="chip bg-up-soft text-up shrink-0">{tt.thisDevice}</span>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
