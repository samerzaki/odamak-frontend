import { AlertCircle } from 'lucide-react';
import { fetchGoldOverview } from '@/lib/api';
import { GoldOverviewItem } from '@/types';
import { ModernGoldPricesClient } from './modern-gold-prices';
import { Skeleton } from '@/components/ui/skeleton';

export interface ModernGoldDataItem {
  id: string;
  nameKey: 'karat14' | 'karat18' | 'karat21' | 'karat22' | 'karat24' | 'pound' | 'ounce';
  karat: string;
  sellPrice: number;
  buyPrice: number;
  change: number | null;
  changePercent: number | null;
  trend: 'up' | 'down' | 'neutral';
  history: number[];
  currency: string;
  recordedAt: string;
}

function transformToModernGoldDataItem(
  key: string,
  data: GoldOverviewItem
): ModernGoldDataItem {
  const keyMap: Record<string, { id: string; nameKey: ModernGoldDataItem['nameKey']; karat: string }> = {
    '14': { id: 'k14', nameKey: 'karat14', karat: 'k14' },
    '18': { id: 'k18', nameKey: 'karat18', karat: 'k18' },
    '21': { id: 'k21', nameKey: 'karat21', karat: 'k21' },
    '22': { id: 'k22', nameKey: 'karat22', karat: 'k22' },
    '24': { id: 'k24', nameKey: 'karat24', karat: 'k24' },
    'gold_pound': { id: 'pound', nameKey: 'pound', karat: 'pound' },
    'ounce': { id: 'ounce', nameKey: 'ounce', karat: 'ounce' },
  };

  const mapping = keyMap[key];
  let trend: 'up' | 'down' | 'neutral' = 'neutral';
  if (data.change.color === 'green') trend = 'up';
  else if (data.change.color === 'red') trend = 'down';

  return {
    id: mapping.id,
    nameKey: mapping.nameKey,
    karat: mapping.karat,
    sellPrice: data.price.sell,
    buyPrice: data.price.buy,
    change: data.change.value,
    changePercent: data.change.percent,
    trend,
    history: data.chart_points_30d?.length ? data.chart_points_30d : [data.price.sell],
    currency: data.currency,
    recordedAt: data.last_checked.last_checked_at,
  };
}

export async function ModernGoldPricesServer() {
  try {
    const data = await fetchGoldOverview();

    const goldData: ModernGoldDataItem[] = [];
    if (data.data?.gold) {
      Object.entries(data.data.gold).forEach(([key, value]) => {
        if (value && typeof value === 'object' && 'price' in value) {
          goldData.push(transformToModernGoldDataItem(key, value));
        }
      });
    }

    return <ModernGoldPricesClient goldData={goldData} referenceTime={new Date().toISOString()} />;
  } catch (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          <div>
            <h3 className="font-semibold text-red-900 dark:text-red-300">
              خطأ في تحميل البيانات
            </h3>
            <p className="text-sm text-red-700 dark:text-red-400">
              {error instanceof Error ? error.message : 'فشل في تحميل أسعار الذهب'}
            </p>
          </div>
        </div>
      </div>
    );
  }
}

function LoadingSkeleton({ isHero = false }: { isHero?: boolean }) {
  return (
    <div className={`bg-white dark:bg-card rounded-lg border border-slate-200 dark:border-border shadow-sm ${isHero ? 'p-6' : 'p-5'}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-5 w-12" />
        </div>
        <Skeleton className={isHero ? 'h-12 w-32' : 'h-10 w-28'} />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-full" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-8 w-32" />
        </div>
      </div>
    </div>
  );
}

export function ModernGoldPricesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <LoadingSkeleton />
      <LoadingSkeleton />
      <LoadingSkeleton />
      <LoadingSkeleton />
      <LoadingSkeleton />
    </div>
  );
}
