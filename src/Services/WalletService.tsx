import type {
  ChangeAmount,
  InvestmentAmount,
  walletResponse,
} from "./Interfaces/WalletInterface";

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

  Investment: async (token: string): Promise<InvestmentAmount> => {
    try {
      const response: Response = await fetch(`${Api_URL}/Investment`, {
        method: "GET",
        headers: {
          "content-Type": "json-application",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Wallet doesn t found");
      }
      const data: InvestmentAmount = await response.json();
      return data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  AddFounds: async (token: string, amount: number): Promise<ChangeAmount> => {
    try {
      const response: Response = await fetch(`${Api_URL}/AddFounds`, {
        method: "POST",
        headers: {
          "content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: amount }),
      });
      if (!response.ok) {
        throw new Error("Wallet-ul nu a fost gasit");
      }
      const data: ChangeAmount = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  Withdraw: async (token: string, amount: number): Promise<ChangeAmount> => {
    try {
      const response: Response = await fetch(`${Api_URL}/Withdraw`, {
        method: "Post",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: amount }),
      });
      if (!response.ok) {
        throw new Error("Something went wrong");
      }
      const data: ChangeAmount = await response.json();
      return data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
};

export default WalletService;
