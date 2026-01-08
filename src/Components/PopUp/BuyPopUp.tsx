import { useState } from "react";
import Trading from "../../Services/StockTradingService";
import type { buy } from "../../Services/Interfaces/StockTradingInterface";

interface buyProps {
  Symbol: string;
  currentPrice: number;
  closed: () => void;
}

export default function BuyPopUp(buyProps: buyProps) {
  const [Buy, setBuy] = useState<buy>({
    symbol: buyProps.Symbol,
    currentPrice: buyProps.currentPrice,
    amountToInvest: 0,
  });

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      console.log("Sending request...", Buy);
      const response = await Trading.buy(Buy);
      console.log("Success:", response);
      buyProps.closed();
    } catch (e) {
      console.error("Error buying stock:", e);
    }
  };

  return (
    <div className="popUpWraper" onClick={buyProps.closed}>
      <div
        className="popUp"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <h1 className="title">Add founds</h1>
        <h3 className="description">
          Make sure you don t invest more then you can afford
        </h3>
        <form onSubmit={handleBuy}>
          <label htmlFor="">Please enter the sum you want to invest</label>
          <input
            value={Buy.amountToInvest === undefined ? "" : Buy.amountToInvest}
            onChange={(e) => {
              e.preventDefault();
              setBuy({
                symbol: buyProps.Symbol,
                currentPrice: buyProps.currentPrice,
                amountToInvest: Number(e.target.value),
              });
            }}
            className="addFoundsInput"
            type="number"
          />
          <button type="submit" className="btn">
            Add Founds
          </button>
        </form>
      </div>
    </div>
  );
}
