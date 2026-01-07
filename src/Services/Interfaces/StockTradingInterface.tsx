export interface portofolio {
  id: number;
  symbol: string;
  avaragePrice: number;
  amountOwned: number;
  shares: number;
  userId: number;
}

export interface buy {
  symbol: string;
  currentPrice: number;
  amountInvested: number;
}

export interface stockPrice {
  symbol: string;
  currentPrice: number;
}

export interface sell {
  symbol: string;
  currentPrice: number;
  withdrawAmount: number;
}
