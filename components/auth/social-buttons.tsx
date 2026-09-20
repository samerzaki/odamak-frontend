"use client";

import { useLanguage } from "@/contexts/language-context";

/**
 * Social sign-in row. No backend support yet — buttons render but do nothing
 * (confirmed with product: ship the UI, keep it non-functional for now).
 */
export function SocialButtons() {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-3 gap-2.5">
      <button
        type="button"
        className="flex items-center justify-center gap-2 rounded-[12px] border border-line bg-panel px-2 py-3 text-[13.5px] font-semibold text-text transition-colors hover:border-gold hover:bg-hover"
      >
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0">
          <path
            fill="#4285f4"
            d="M21 12.2c0-.7-.1-1.3-.2-2H12v3.8h5a4.3 4.3 0 01-1.9 2.8v2.3h3a9 9 0 002.9-6.9zM12 21a8.8 8.8 0 006.1-2.2l-3-2.3a5.5 5.5 0 01-8.2-2.9h-3v2.3A9 9 0 0012 21zM6.9 13.6a5.4 5.4 0 010-3.4V7.9h-3a9 9 0 000 8.1zM12 6.6a4.9 4.9 0 013.4 1.3l2.6-2.6A8.7 8.7 0 0012 3a9 9 0 00-8.1 5l3 2.3a5.4 5.4 0 015.1-3.7z"
          />
        </svg>
        <span className="hidden sm:inline">{t.pages.social.google}</span>
      </button>
      <button
        type="button"
        className="flex items-center justify-center gap-2 rounded-[12px] border border-line bg-panel px-2 py-3 text-[13.5px] font-semibold text-text transition-colors hover:border-gold hover:bg-hover"
      >
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0">
          <path
            fill="currentColor"
            d="M16.2 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.5-.2-2.8.8-3.6.8-.7 0-1.8-.8-3-.8-1.6 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.3.9-1.3 1.3-2.6 1.3-2.7 0 0-2.4-.9-2.4-3.6zM14 5.4c.6-.8 1.1-1.9 1-3-1 0-2.2.6-2.9 1.5-.6.7-1.2 1.9-1 2.9 1.1.1 2.2-.6 2.9-1.4z"
          />
        </svg>
        <span className="hidden sm:inline">{t.pages.social.apple}</span>
      </button>
      <button
        type="button"
        className="flex items-center justify-center gap-2 rounded-[12px] border border-line bg-panel px-2 py-3 text-[13.5px] font-semibold text-text transition-colors hover:border-gold hover:bg-hover"
      >
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0">
          <path
            fill="#1877f2"
            d="M22 12a10 10 0 10-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.7-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0022 12z"
          />
        </svg>
        <span className="hidden sm:inline">{t.pages.social.facebook}</span>
      </button>
    </div>
  );
}
