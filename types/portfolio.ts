export type PortfolioAssetType = "gold" | "silver" | "currency" | "crypto";
export type PortfolioFilterType = "all" | PortfolioAssetType;

export type PortfolioNumber = number | string | null;

export interface PortfolioItem {
  id: number;
  type: PortfolioAssetType;
  name: string;
  amount: number | string;
  karat: number | null;
  purity: number | null;
  currency_code: string | null;
  coin_id: string | null;
  buy_price: PortfolioNumber;
  purchase_date: string | null;
  notes: string | null;
  current_price: PortfolioNumber;
  current_value: PortfolioNumber;
  purchase_value: PortfolioNumber;
  cost_basis: PortfolioNumber;
  profit_loss: PortfolioNumber;
  profit_loss_percent: PortfolioNumber;
  created_at: string;
}

export interface PortfolioBreakdownItem {
  current_value: PortfolioNumber;
  purchase_value: PortfolioNumber;
  profit_loss: PortfolioNumber;
  profit_loss_percent: PortfolioNumber;
  assets_count: number;
}

export interface PortfolioSummary {
  total_current_value: PortfolioNumber;
  total_purchase_value: PortfolioNumber;
  total_profit_loss: PortfolioNumber;
  total_profit_loss_percent: PortfolioNumber;
  assets_count: number;
  breakdown: {
    gold: PortfolioBreakdownItem;
    silver: PortfolioBreakdownItem;
    currencies: PortfolioBreakdownItem;
    crypto: PortfolioBreakdownItem;
  };
  allocation: {
    gold_percent: number | null;
    silver_percent: number | null;
    currencies_percent: number | null;
    crypto_percent: number | null;
  };
}

export interface PortfolioCryptoOption {
  coin_id: string;
  symbol: string;
  name: string;
  image?: string | null;
}

export interface PortfolioOptions {
  gold_karats: number[];
  silver_purities: number[];
  currencies: Array<string | { code?: string; currency_code?: string; name?: string; name_en?: string; name_ar?: string }>;
  crypto: PortfolioCryptoOption[];
}

export interface ApiEnvelope<T> {
  status: number;
  success: boolean;
  data: T;
}

export type PortfolioIndexResponse = ApiEnvelope<PortfolioItem[]>;
export type PortfolioSummaryResponse = ApiEnvelope<PortfolioSummary>;
export type PortfolioOptionsResponse = ApiEnvelope<PortfolioOptions>;
export type PortfolioItemResponse = ApiEnvelope<PortfolioItem>;

export interface CreatePortfolioItemRequest {
  type: PortfolioAssetType;
  name: string;
  amount: string;
  buy_price?: string | null;
  purchase_date?: string | null;
  karat?: number;
  purity?: number;
  currency_code?: string;
  coin_id?: string;
  notes?: string | null;
}

export type UpdatePortfolioItemRequest = Partial<CreatePortfolioItemRequest>;
