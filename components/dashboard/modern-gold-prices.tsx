'use client';

import { GoldPriceCards } from '@/components/gold/gold-price-table';
import type { ModernGoldDataItem } from './modern-gold-prices-server';

interface ModernGoldPricesClientProps {
  goldData: ModernGoldDataItem[];
  referenceTime: string;
}

export function ModernGoldPricesClient({ goldData }: ModernGoldPricesClientProps) {
  return <GoldPriceCards goldData={goldData} />;
}
