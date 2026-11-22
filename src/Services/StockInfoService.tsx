import type { Chart, Stock } from "./Interfaces/StockInfoInterface";
import { request } from "../lib/http";

const BASE = "/api/stocks";

const StockData = {
  stocks: () => request<Stock[]>(`${BASE}/values`),
  chartData: () => request<Chart[]>(`${BASE}/charts`),
};

export default StockData;
