import type { buy, sell } from "./Interfaces/StockTradingInterface";
import { request } from "../lib/http";

const BASE = "/api/portofolio";

const Trading = {
  buy: (data: buy) => request<{ message: string }>(`${BASE}/buy`, { method: "POST", body: data }),
  sell: (data: sell) => request<{ message: string }>(`${BASE}/sell`, { method: "POST", body: data }),
};

export default Trading;
