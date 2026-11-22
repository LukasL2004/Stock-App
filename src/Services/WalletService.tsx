import type { ChangeAmount, walletResponse } from "./Interfaces/WalletInterface";
import { request } from "../lib/http";

const BASE = "/api/wallet";

const WalletService = {
  Balance: () => request<walletResponse>(`${BASE}/balance`),
  AddFounds: (amount: number) => request<ChangeAmount>(`${BASE}/AddFounds`, { method: "POST", body: { amount } }),
  Withdraw: (amount: number) => request<ChangeAmount>(`${BASE}/Withdraw`, { method: "POST", body: { amount } }),
};

export default WalletService;
