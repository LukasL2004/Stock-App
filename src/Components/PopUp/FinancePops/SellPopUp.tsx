import React, { useState } from "react";
import Trading from "../../../Services/StockTradingService";
import type { sell } from "../../../Services/Interfaces/StockTradingInterface";
interface sellProps {
  symbol: string;
  currentPrice: number;
  closed: () => void;
}

export default function SellPopUp(sellProps: sellProps) {
  const [Sell, setSell] = useState<sell>({
    symbol: sellProps.symbol,
    currentPrice: sellProps.currentPrice,
    withdrawAmount: 0,
  });

  const handleSell = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await Trading.sell(Sell);
      console.log("Success:", response);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="popUpWraper" onClick={sellProps.closed}>
      <div
        className="popUp"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <h1 className="title">Sell {sellProps.symbol}</h1>
        <form onSubmit={handleSell}>
          <label htmlFor="">Please enter the sum you want to withdraw</label>
          <input
            value={Sell.withdrawAmount === undefined ? "" : Sell.withdrawAmount}
            onChange={(e) => {
              e.preventDefault();
              setSell({
                symbol: sellProps.symbol,
                currentPrice: sellProps.currentPrice,
                withdrawAmount: Number(e.target.value),
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
