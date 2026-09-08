'use client';

import { AlertCircle, Bell, Calculator } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/language-context';
import { useAllSilverPrices } from '@/hooks/use-silver-prices';
import { SilverAllPricesItem } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';
import { Sparkline } from '@/components/ui/sparkline';
import { ChangeChip } from '@/components/ui/change-badge';

const SILVER_NAMES: Record<string, string> = {
  '800': 'Silver 800',
  '925': 'Silver 925',
  '999_swiss': 'Silver 999 Swiss',
  '999_egyptian': 'Silver 999 Egyptian',
  ounce: 'Global Silver Ounce',
};

interface SilverDataItem {
  id: string;
  name: string;
  sellPrice: number;
  buyPrice: number;
  changePercent: number | null;
  trend: 'up' | 'down' | 'neutral';
  chartPoints: number[];
  currency: string;
  isOunce: boolean;
}

function transformApiItem(key: string, data: SilverAllPricesItem, isRTL: boolean): SilverDataItem {
  return {
    id: data.key || key,
    name: isRTL ? data.name : (SILVER_NAMES[key] ?? data.name),
    sellPrice: data.price.sell,
    buyPrice: data.price.buy,
    changePercent: data.change.percent,
    trend: data.change.color === 'green' ? 'up' : data.change.color === 'red' ? 'down' : 'neutral',
    chartPoints: data.chart_points ?? [],
    currency: data.currency,
    isOunce: data.type === 'ounce' || key === 'ounce',
  };
}

function formatCardPrice(price: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: currency === 'USD' ? 2 : 1,
    numberingSystem: 'latn',
  }).format(price);
}

function PriceCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {[1, 2, 3, 4, 5].map((item) => (
        <div key={item} className="card-surface min-w-0 space-y-5 p-5">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-8 w-32" />
          <div className="flex justify-between border-t border-line2 pt-4">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-7 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SilverPage() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const locale = isRTL ? 'ar-EG' : 'en-US';
  const direction = isRTL ? 'rtl' : 'ltr';
  const { data, isLoading, error } = useAllSilverPrices('EGP', '30d');

  const silverItems = Object.entries(data?.data?.silver ?? {})
    .filter((entry): entry is [string, SilverAllPricesItem] => Boolean(entry[1]?.price))
    .map(([key, value]) => transformApiItem(key, value, isRTL));

  const features = [
    { icon: Calculator, title: isRTL ? 'حاسبة الفضة' : 'Silver Calculator', description: isRTL ? 'احسب قيمة الفضة بالوزن' : 'Calculate silver value by weight', href: '/silver/calculator' },
    { icon: Bell, title: isRTL ? 'تنبيهات الأسعار' : 'Price Alerts', description: isRTL ? 'احصل على إشعارات عند تغير الأسعار' : 'Get notified on price changes', href: '/me/alerts' },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={isRTL ? 'الفضة' : 'Silver'}
        title={isRTL ? 'أسعار الفضة' : 'Silver Prices'}
        lead={isRTL ? 'أسعار الفضة المحدثة لحظياً - جميع الأنواع' : 'Live silver prices - All types'}
      />

      {isLoading ? (
        <PriceCardsSkeleton />
      ) : error || !data ? (
        <div className="card-surface border border-down/20 p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-down" />
            <div>
              <h3 className="font-semibold text-text">{isRTL ? 'خطأ في تحميل البيانات' : 'Error loading data'}</h3>
              <p className="text-sm text-muted">{error instanceof Error ? error.message : (isRTL ? 'فشل في تحميل أسعار الفضة' : 'Failed to load silver prices')}</p>
            </div>
          </div>
        </div>
      ) : (
        <section aria-labelledby="silver-prices-title" dir={direction}>
          <h2 id="silver-prices-title" className="mb-4 font-heading text-[18px] font-semibold text-text md:text-[20px]">
            {isRTL ? 'أسعار الفضة حسب النوع' : 'Silver prices by type'}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {silverItems.map((item) => {
              const chartTone = item.trend === 'neutral' ? 'gold' : item.trend;
              const currencyLabel = item.currency === 'EGP' ? (isRTL ? 'ج.م' : 'EGP') : item.currency;

              return (
                <article key={item.id} className="card-surface min-w-0 p-5">
                  <div className="flex w-full items-start justify-between gap-3" dir={direction}>
                    <div className="min-w-0" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                      <h3 className="font-heading text-[14px] font-semibold text-text">{item.name}</h3>
                      <ChangeChip value={item.changePercent} tone={item.trend === 'neutral' ? undefined : item.trend} className="mt-1.5 !gap-0.5 !rounded-md !px-2 !py-1 !text-[10px] !leading-none" />
                    </div>
                  </div>

                  <div className="mt-6" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                    <p className="text-[12px] text-muted">{isRTL ? 'تشتري من الصائغ' : 'You buy at'}</p>
                    <p className="num mt-0.5 text-[25px] font-medium leading-tight tracking-[-0.04em] text-text" dir="ltr" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                      {formatCardPrice(item.sellPrice, item.currency, locale)}
                      <span className="ms-1.5 font-sans text-[11px] font-normal tracking-normal text-dim">{currencyLabel}</span>
                    </p>
                  </div>

                  <div className="mt-5 border-t border-line2 pt-4">
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="text-[11px] text-muted">{isRTL ? 'تبيع للصائغ' : 'You sell at'}</p>
                        {item.isOunce ? (
                          <p className="num mt-0.5 text-[14px] leading-tight text-dim">—</p>
                        ) : (
                          <p className="num mt-0.5 text-[14px] leading-tight text-text" dir="ltr">
                            {formatCardPrice(item.buyPrice, item.currency, locale)}
                            <span className="ms-1 font-sans text-[10px] font-normal text-dim">{currencyLabel}</span>
                          </p>
                        )}
                      </div>
                      <div className="min-w-[72px] text-end">
                        <p className="mb-1 text-[10px] text-muted">{isRTL ? '30 يوم' : '30 Days'}</p>
                        {item.chartPoints.length > 1 && <Sparkline data={item.chartPoints} width={84} height={28} tone={chartTone} className="ms-auto" />}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {features.map((feature) => (
          <Link key={feature.href} href={feature.href} className="group card-surface p-6 transition-shadow hover:shadow-gold">
            <div className="mb-4 inline-flex rounded-lg bg-gold-soft p-3"><feature.icon className="h-6 w-6 text-gold" /></div>
            <h3 className="mb-2 font-heading text-lg font-bold text-text transition-colors group-hover:text-gold">{feature.title}</h3>
            <p className="text-sm text-muted">{feature.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
