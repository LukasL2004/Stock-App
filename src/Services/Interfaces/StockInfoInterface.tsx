export interface Stock {
  id: string;
  symbol: string;
  date: string;
  price: number;
  open: number;
  high: number;
  low: number;
  volume: string;
  status: string;
}

export interface Chart {
  symbol: string;
  date: string;
  time: string;
  value: number;
}
