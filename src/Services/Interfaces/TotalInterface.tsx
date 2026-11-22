export interface chartData {
  symbol: string;
  value: number;
  percentage: number;
  /** Added by the backend update; optional for older servers. */
  marketValue?: number;
  profit?: number;
}

export interface total {
  /** Cost basis (sum of invested amounts). Kept for backward compatibility. */
  total: number;
  portfolioChart: chartData[];
  investedValue?: number;
  marketValue?: number;
  totalProfit?: number;
  balance?: number;
}
