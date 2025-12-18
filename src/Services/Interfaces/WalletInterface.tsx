export interface Wallet {
  id: number;
  Balance: number;
}

export interface walletResponse {
  id: number;
  balance: number;
  investment: number;
}

export interface ChangeAmount {
  amount: number;
}

export interface InvestmentAmount {
  investment: number;
}
