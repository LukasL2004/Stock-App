const API_KEY = "13c86b3f4cd04126a0b3b995885ee0bbdsdsdsds23";
const API_URL = "https://api.twelvedata.com/etf";

const StockData = {
  StockData: async (): Promise<unknown> => {
    try {
      const response: Response = await fetch(`${API_URL}?apikey=${API_KEY}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching ETF data:", error);
      throw error;
    }
  },
};

export default StockData;
