import type { buy, portofolio, sell } from "./Interfaces/StockTradingInterface";

const API_URL = "http://localhost:8080/api/portofolio";
const token = localStorage.getItem("token");

const Trading = {
  buy: async (buyData: buy): Promise<portofolio> => {
    try {
      const response: Response = await fetch(`${API_URL}/buy`, {
        method: "POST",
        headers: {
          "content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(buyData),
      });

      if (!response.ok) {
        throw new Error("Sorry you are unable to buy");
      }

      const data: portofolio = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  sell: async (sellData: sell): Promise<portofolio> => {
    try {
      const response: Response = await fetch(`${API_URL}/buy`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: `bearer ${token}`,
        },
        body: JSON.stringify(sellData),
      });

      if (!response.ok) {
        throw new Error("Unable to sell sorry");
      }

      const data: portofolio = await response.json();

      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
};

export default Trading;
