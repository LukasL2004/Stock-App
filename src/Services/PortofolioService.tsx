import type { portofolioData } from "./Interfaces/PortofolioInterface";
import type { total } from "./Interfaces/TotalInterface";

const API_URL = "http://localhost:8080/api/portofolio";
const token = localStorage.getItem("token");

const Portofolio = {
  getData: async (symbol: string): Promise<portofolioData> => {
    try {
      const response: Response = await fetch(`${API_URL}/${symbol}`, {
        method: "GET",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Something went wrong");
      }

      const data: portofolioData = await response.json();

      return data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  getTotal: async (): Promise<total> => {
    try {
      const response = await fetch(`${API_URL}/total`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error("Totol not found");
      }
      const data: total = await response.json();
      return data;
    } catch (e) {
      console.log(e);
      throw e;
    }
  },
};

export default Portofolio;
