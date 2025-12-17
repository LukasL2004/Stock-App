import type { Stock } from "./Interfaces/StockInfoInterface";

const API_KEY = import.meta.env.VITE_API_KEY || "";
const API_URL = "https://api.twelvedata.com";
const INTERVAL = "15min";
const OUTPUT_SIZE = 1;

console.log("API_KEY:", API_KEY); // Verifică ce valoare are
console.log("All env vars:", import.meta.env);

interface TimeSeriesResponse {
  status: string;
  values: Stock[];
}

const StockData = {
  CandlesData: async (StockName: string): Promise<Stock> => {
    try {
      const response: Response = await fetch(
        `${API_URL}?time_series?symbol=${StockName}&interval=${INTERVAL}&outputsize=${OUTPUT_SIZE}&apikey=${API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data: TimeSeriesResponse = await response.json();

      if (data.status !== "ok" || !data.values || data.values.length === 0) {
        throw new Error("Invalid API response");
      }
      return data.values[0];
    } catch (error) {
      console.error("Error fetching ETF data:", error);
      throw error;
    }
  },
};

export default StockData;
