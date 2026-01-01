import type { Chart, Stock } from "./Interfaces/StockInfoInterface";

const API_URL = "http://localhost:8080/api/stocks";
const token = localStorage.getItem("token");

const StockData = {
  stocks: async (): Promise<Stock[]> => {
    try {
      const response = await fetch(`${API_URL}/values`, {
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
  chartData: async (): Promise<Chart[]> => {
    try {
      const response = await fetch(`${API_URL}/charts`, {
        method: "GET",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Charts are not available");
      }
      const data: Chart[] = await response.json();

      return data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
};

export default StockData;
