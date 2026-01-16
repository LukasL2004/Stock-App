interface chartData {
  symbol: string;
  value: number;
  percentage: number;
}

export interface total {
  total: number;
  portfolioChart: chartData[];
}
