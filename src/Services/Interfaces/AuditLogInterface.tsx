export interface AuditLogInterface {
  id?: number;
  symbol: string;
  total: number;
  date: string;
  price: number;
  shares: number;
  /** "BUY" | "SELL"; older rows have none and are buys. */
  action?: string;
}
