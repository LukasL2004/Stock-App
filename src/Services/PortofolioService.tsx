import type { portofolioData } from "./Interfaces/PortofolioInterface";
import type { DailyProfit } from "./Interfaces/ProfitInterface";
import type { total } from "./Interfaces/TotalInterface";
import { request } from "../lib/http";

const BASE = "/api/portofolio";

const Portofolio = {
  getData: (symbol: string) => request<portofolioData>(`${BASE}/${encodeURIComponent(symbol)}`),
  getTotal: () => request<total>(`${BASE}/total`),
  getProfit: (symbol: string) => request<DailyProfit>(`${BASE}/profit/${encodeURIComponent(symbol)}`),
};

export default Portofolio;
