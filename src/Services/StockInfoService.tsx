import type { Stock } from "./Interfaces/StockInfoInterface";

const API_URL = "http://localhost:8080/api/stocks/values";
const token = localStorage.getItem("token");

const StockData = {
  stocks: async (): Promise<Stock[]> => {
    try {
      const response = await fetch(`${API_URL}`, {
        method: "GET",
        headers: {
          "content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Something went wrong please try again");
      }
      const data: Stock[] = await response.json();

      return data;
    } catch (Error) {
      console.log(Error);
      throw Error;
    }
  },
};

export default StockData;
