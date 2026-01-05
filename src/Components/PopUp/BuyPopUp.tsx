import { useEffect, useState } from "react";
import Trading from "../../Services/StockTradingService";
import type { buy } from "../../Services/Interfaces/StockTradingInterface";

interface buyProps {
  Symbol: string;
  currentPrice: number;
}

export default function BuyPopUp(buyProps: buyProps) {
  const [Buy, setBuy] = useState<buy>({
    symbol: "",
    currentPrice: 0,
    amountInvested: 0,
  });

  useEffect(() => {
    const buy = async () => {
      try {
        const response = await Trading.buy(Buy);
        console.log(response);
        return response;
      } catch (e) {
        console.error(e);
      }
    };
    buy();
  }, [Buy]);

  return (
    <div>
      <div></div>
    </div>
  );
}
