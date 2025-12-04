import type { walletResponse } from "./Interfaces/WalletInterface";

const Api_URL = "http://localhost:8080/api/wallet";

const WalletService = {
  Balance: async (token: string): Promise<walletResponse> => {
    try {
      const response: Response = await fetch(`${Api_URL}/balance`, {
        method: "GET",
        headers: {
          "Content-Type": "aplication/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Wallet-ul nu a fost gasit");
      }
      const data: walletResponse = await response.json();

      return data;
    } catch (error) {
      console.error("Error is ", error);
      throw error;
    }
  },
};

export default WalletService;
