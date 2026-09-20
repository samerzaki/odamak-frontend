'use client';

import { AlertCircle } from 'lucide-react';
import { useGoldOverview } from '@/hooks/use-gold-prices';
import { UnifiedGoldChart } from './unified-gold-chart';
import { Skeleton } from '@/components/ui/skeleton';
import { SectionCard } from '@/components/ui/section-card';
import { useLanguage } from '@/contexts/language-context';
import type { GoldHistoryResponse, GoldOverviewItem } from '@/types';

function toChartSeries(item: GoldOverviewItem | null) {
  const points = item?.chart_points_30d ?? [];
  const lastCheckedAt = item?.last_checked.last_checked_at;
  const anchorDate = lastCheckedAt ? new Date(lastCheckedAt) : new Date();
  const validAnchorDate = Number.isNaN(anchorDate.getTime()) ? new Date() : anchorDate;

  return points.map((price, index) => {
    const date = new Date(validAnchorDate);
    date.setUTCDate(date.getUTCDate() - (points.length - 1 - index));
    return { date: date.toISOString(), price };
  });
}

function toGoldChartData(overview: Record<string, GoldOverviewItem | null>): GoldHistoryResponse['data'] {
  const toKaratData = (item: GoldOverviewItem | null) => ({
    currency: item?.currency ?? 'EGP',
    sell_price: item?.price.sell ?? 0,
    buy_price: item?.price.buy ?? 0,
    spread_egp: item?.spread?.egp ?? 0,
    spread_percent: item?.spread?.percent ?? 0,
    chart_points: toChartSeries(item),
    chart_color: item?.chart_color ?? 'gray',
    recorded_at: item?.last_checked.last_checked_at ?? '',
  });

  return {
    period: '30d',
    currency: 'EGP',
    karat_24: toKaratData(overview['24'] ?? null),
    karat_21: toKaratData(overview['21'] ?? null),
    karat_18: toKaratData(overview['18'] ?? null),
  };
}

export function UnifiedGoldChartServer() {
  const { t } = useLanguage();
  const { data: overviewData, isLoading, error } = useGoldOverview();

  // First load only — show full skeleton
  if (isLoading && !overviewData) {
    return <UnifiedGoldChartSkeleton />;
  }

  if (error && !overviewData) {
    return (
      <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          <div>
            <h3 className="font-semibold text-red-900 dark:text-red-300">
              {t.charts.errorLoadingTitle}
            </h3>
            <p className="text-sm text-red-700 dark:text-red-400">
              {error instanceof Error ? error.message : t.charts.errorLoadingChartMessage}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!overviewData?.data.gold) {
    return null;
  }

  return (
    <SectionCard>
      <UnifiedGoldChart
        data={toGoldChartData(overviewData.data.gold)}
        period="30d"
      />
    </SectionCard>
  );
}

export function UnifiedGoldChartSkeleton() {
  return (
    <div className="bg-white dark:bg-card rounded-lg border border-slate-200 dark:border-border shadow-sm p-6">
      <div className="mb-6">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
