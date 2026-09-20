"use client";

import { useLanguage } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";

const PROVIDERS = [
  {
    key: "google",
    name: "Google",
    icon: (
      <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]">
        <path
          fill="#4285f4"
          d="M21 12.2c0-.7-.1-1.3-.2-2H12v3.8h5a4.3 4.3 0 01-1.9 2.8v2.3h3a9 9 0 002.9-6.9zM12 21a8.8 8.8 0 006.1-2.2l-3-2.3a5.5 5.5 0 01-8.2-2.9h-3v2.3A9 9 0 0012 21zM6.9 13.6a5.4 5.4 0 010-3.4V7.9h-3a9 9 0 000 8.1zM12 6.6a4.9 4.9 0 013.4 1.3l2.6-2.6A8.7 8.7 0 0012 3a9 9 0 00-8.1 5l3 2.3a5.4 5.4 0 015.1-3.7z"
        />
      </svg>
    ),
  },
  {
    key: "apple",
    name: "Apple",
    icon: (
      <svg viewBox="0 0 24 24" className="h-[17px] w-[17px] text-text">
        <path
          fill="currentColor"
          d="M16.2 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.5-.2-2.8.8-3.6.8-.7 0-1.8-.8-3-.8-1.6 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.3.9-1.3 1.3-2.6 1.3-2.7 0 0-2.4-.9-2.4-3.6zM14 5.4c.6-.8 1.1-1.9 1-3-1 0-2.2.6-2.9 1.5-.6.7-1.2 1.9-1 2.9 1.1.1 2.2-.6 2.9-1.4z"
        />
      </svg>
    ),
  },
  {
    key: "facebook",
    name: "Facebook",
    icon: (
      <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]">
        <path
          fill="#1877f2"
          d="M22 12a10 10 0 10-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.7-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0022 12z"
        />
      </svg>
    ),
  },
];

/**
 * No backend support yet for OAuth linking — ships as UI only, all providers
 * shown "not connected" (confirmed with product: non-functional for now).
 */
export function ConnectedAccountsSection() {
  const { t } = useLanguage();
  const tt = t.pages.settings.connectedAccounts;

  return (
    <SectionCard>
      <div className="p-4 md:p-5">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="font-heading text-[15px] md:text-[16px] font-semibold text-text">{tt.title}</h2>
          <div className="flex-1" />
          <span className="text-[12.5px] text-muted">{tt.hint}</span>
        </div>
        <div className="divide-y divide-line-2">
          {PROVIDERS.map((provider) => (
            <div key={provider.key} className="flex items-center gap-3 py-3">
              <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] bg-panel-2">
                {provider.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-medium text-text">{provider.name}</div>
                <div className="text-[12.5px] text-muted">{tt.notConnected}</div>
              </div>
              <Button type="button" variant="outline" size="sm" className="shrink-0">
                {tt.connect}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
