'use client';

import { GoldHistoryResponse } from '@/types';
import { formatPrice, formatDate } from '@/lib/format';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useMemo, useState } from 'react';
import { useLanguage } from '@/contexts/language-context';
import { cn } from '@/lib/utils';

type GoldPeriod = '24h' | '7d' | '30d' | '1y' | 'all';

interface UnifiedGoldChartProps {
  data: GoldHistoryResponse['data'];
  title?: string;
  period?: GoldPeriod;
  onPeriodChange?: (period: GoldPeriod) => void;
  isLoading?: boolean;
}

export function UnifiedGoldChart({ data, title, period = '30d', onPeriodChange, isLoading = false }: UnifiedGoldChartProps) {
  const { t } = useLanguage();
  const effectiveTitle = title ?? t.charts.defaultGoldChartTitle;

  const PERIOD_OPTIONS: { value: GoldPeriod; label: string }[] = [
    { value: '24h', label: t.charts.period24h },
    { value: '7d', label: t.charts.period7d },
    { value: '30d', label: t.charts.period30d },
    { value: '1y', label: t.charts.period1y },
    { value: 'all', label: t.charts.periodAll },
  ];
  // State for toggling chart lines
  const [visibleLines, setVisibleLines] = useState({
    k24: true,
    k21: true,
    k18: true,
  });

  const toggleLine = (lineKey: keyof typeof visibleLines) => {
    setVisibleLines(prev => ({
      ...prev,
      [lineKey]: !prev[lineKey],
    }));
  };

  // Merge all karat data with USD rates into single chart data array
  const chartData = useMemo(() => {
    if (!data) return [];
    const points24 = data.karat_24?.chart_points ?? [];
    const points21 = data.karat_21?.chart_points ?? [];
    const points18 = data.karat_18?.chart_points ?? [];

    // Get the longest array to ensure we have all dates
    const maxLength = Math.max(
      points24.length,
      points21.length,
      points18.length
    );

    const mergedData = [];

    for (let i = 0; i < maxLength; i++) {
      const point24 = points24[i];
      const point21 = points21[i];
      const point18 = points18[i];

      // Use date from first available point
      const date = point24?.date || point21?.date || point18?.date;

      const dataPoint: any = {
        date,
        k24: point24?.price,
        k21: point21?.price,
        k18: point18?.price,
      };

      mergedData.push(dataPoint);
    }

    return mergedData;
  }, [data]);

  const goldDomain = useMemo<[number, number] | ['auto', 'auto']>(() => {
    const visibleKeys = [
      visibleLines.k24 && 'k24',
      visibleLines.k21 && 'k21',
      visibleLines.k18 && 'k18',
    ].filter((key): key is 'k24' | 'k21' | 'k18' => Boolean(key));
    const values = chartData.flatMap((point) =>
      visibleKeys.map((key) => point[key]).filter((value): value is number => Number.isFinite(value))
    );

    if (!values.length) return ['auto', 'auto'];

    const minimum = Math.min(...values);
    const maximum = Math.max(...values);
    const range = maximum - minimum || Math.max(maximum * 0.04, 1);
    const step = 10 ** Math.floor(Math.log10(range));
    const padding = Math.ceil((range * 0.1) / step) * step;

    return [
      Math.floor((minimum - padding) / step) * step,
      Math.ceil((maximum + padding) / step) * step,
    ];
  }, [chartData, visibleLines]);

  if (!data) return null;

  return (
    <div>
      {/* Header */}
      <div className="mb-4 px-5 pt-5 md:px-6 md:pt-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h3 className="font-heading text-[18px] md:text-[20px] font-semibold text-text">{effectiveTitle}</h3>

          {/* Period Selector */}
          {onPeriodChange && (
            <select
              value={period}
              onChange={(e) => onPeriodChange(e.target.value as GoldPeriod)}
              className="h-10 rounded-[11px] border border-line bg-bg px-3 text-[13px] text-text focus:border-gold focus:outline-none"
            >
              {PERIOD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { key: 'k24' as const, label: t.gold.karat24, color: 'var(--gold)' },
            { key: 'k21' as const, label: t.gold.karat21, color: 'var(--up)' },
            { key: 'k18' as const, label: t.gold.karat18, color: 'var(--muted)' },
          ].map(({ key, label, color }) => (
            <button
              key={key}
              type="button"
              aria-pressed={visibleLines[key]}
              onClick={() => toggleLine(key)}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors',
                visibleLines[key]
                  ? 'border-gold-line bg-gold-soft text-text'
                  : 'border-line bg-panel text-muted hover:bg-hover'
              )}
            >
              <span>{label}</span>
              <span className="h-1.5 w-5 rounded-full" style={{ backgroundColor: color }} />
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-96">
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-panel/70 backdrop-blur-[1px] rounded-lg">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-line border-t-gold" />
              <span className="text-sm font-medium text-muted">{t.charts.loadingData}</span>
            </div>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 0, right: 0, left: 0, bottom: 48 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--line2)" />
            <XAxis
              dataKey="date"
              stroke="var(--muted)"
              style={{ fontSize: '11px', direction: 'ltr' }}
              angle={-45}
              textAnchor="end"
              height={70}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
              }}
            />
            <YAxis
              yAxisId="gold"
              domain={goldDomain}
              stroke="var(--muted)"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => `${value.toLocaleString('en-US')}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--panel)',
                border: '1px solid var(--line2)',
                borderRadius: '10px',
                direction: 'rtl',
              }}
              labelFormatter={(label) => formatDate(label, 'PPP')}
              formatter={(value: number | undefined, name: string | undefined) => {
                const labels: Record<string, string> = {
                  k24: t.gold.karat24,
                  k21: t.gold.karat21,
                  k18: t.gold.karat18,
                };

                const field = name ?? '';

                return [
                  formatPrice(value ?? 0),
                  labels[field] || field
                ];
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }}
              formatter={(value) => {
                const labels: Record<string, string> = {
                  k24: t.gold.karat24,
                  k21: t.gold.karat21,
                  k18: t.gold.karat18,
                };
                return labels[value] || value;
              }}
            />

            {/* Gold Price Lines */}
            {visibleLines.k24 && (
              <Line
                yAxisId="gold"
                type="monotone"
                dataKey="k24"
                name={t.gold.karat24}
                stroke="var(--gold)"
                strokeWidth={2}
                dot={{ fill: 'var(--gold)', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5 }}
              />
            )}
            {visibleLines.k21 && (
              <Line
                yAxisId="gold"
                type="monotone"
                dataKey="k21"
                name={t.gold.karat21}
                stroke="var(--up)"
                strokeWidth={2}
                dot={{ fill: 'var(--up)', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5 }}
              />
            )}
            {visibleLines.k18 && (
              <Line
                yAxisId="gold"
                type="monotone"
                dataKey="k18"
                name={t.gold.karat18}
                stroke="var(--muted)"
                strokeWidth={2}
                dot={{ fill: 'var(--muted)', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5 }}
              />
            )}

          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
