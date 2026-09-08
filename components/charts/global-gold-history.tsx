'use client';

import { useEffect, useRef, useState } from 'react';
import { SectionCard } from '@/components/ui/section-card';
import { useLanguage } from '@/contexts/language-context';
import type { Language } from '@/lib/translations';

type ColorTheme = 'light' | 'dark';

export function GlobalGoldHistory() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();
  const [displayLanguage, setDisplayLanguage] = useState<Language>('ar');
  const [theme, setTheme] = useState<ColorTheme>('light');

  useEffect(() => {
    setDisplayLanguage(language);
  }, [language]);

  useEffect(() => {
    const root = document.documentElement;
    const updateTheme = () => setTheme(root.classList.contains('dark') ? 'dark' : 'light');
    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.replaceChildren();
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js';
    script.type = 'text/javascript';
    script.async = true;
    script.text = JSON.stringify({
      symbols: [['Gold', 'OANDA:XAUUSD|1D']],
      chartOnly: false,
      width: '100%',
      height: 360,
      locale: displayLanguage === 'ar' ? 'ar_AE' : 'en',
      colorTheme: theme,
      autosize: true,
      showVolume: false,
      showMA: false,
      hideDateRanges: false,
      hideMarketStatus: false,
      hideSymbolLogo: true,
      scalePosition: 'right',
      scaleMode: 'Normal',
      fontFamily: 'IBM Plex Sans Arabic, sans-serif',
      fontSize: '10',
      noTimeScale: false,
      valuesTracking: '1',
      changeMode: 'price-and-percent',
      chartType: 'area',
      lineWidth: 2,
      lineColor: 'rgba(11, 51, 167, 1)',
      topColor: 'rgba(11, 51, 167, 0.18)',
      bottomColor: 'rgba(11, 51, 167, 0.02)',
      dateRanges: ['1d|1', '1m|30', '3m|60', '12m|1D', 'all|1M'],
    });
    container.appendChild(script);

    return () => container.replaceChildren();
  }, [displayLanguage, theme]);

  return (
    <SectionCard padded className="min-h-[400px]">
      <div className="mb-4" dir={displayLanguage === 'ar' ? 'rtl' : 'ltr'}>
        <h3 className="font-heading text-[18px] font-semibold text-text md:text-[20px]">
          {displayLanguage === 'ar' ? 'تاريخ سعر الذهب العالمي' : 'Global Gold Price History'}
        </h3>
        <p className="mt-1 text-[11px] text-muted">XAU/USD</p>
      </div>
      <div ref={containerRef} className="min-h-[360px] w-full" />
    </SectionCard>
  );
}
