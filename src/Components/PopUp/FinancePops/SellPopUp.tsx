import React, { useState } from "react";
import Trading from "../../../Services/StockTradingService";
import type { sell } from "../../../Services/Interfaces/StockTradingInterface";
import { IoMdClose } from "react-icons/io";
import { FaDollarSign } from "react-icons/fa";

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
        <div className="closeBtn">
          <IoMdClose onClick={sellProps.closed} />
        </div>
        <div>
          <h2 className="title">Sell {sellProps.symbol}</h2>
          <h4 className="description">
            Enter the amount you would like to withdraw from your investment
            account.
          </h4>
        </div>
        <form className="popUpForm" onSubmit={handleSell}>
          <div>
            <div className="inputSection">
              <FaDollarSign className="dollar" />
              <input
                value={
                  Sell.withdrawAmount === undefined ? "" : Sell.withdrawAmount
                }
                onChange={(e) => {
                  e.preventDefault();
                  setSell({
                    symbol: sellProps.symbol,
                    currentPrice: sellProps.currentPrice,
                    withdrawAmount: Number(e.target.value),
                  });
                }}
                className="addFoundsInput"
                type="text"
              />
            </div>
          </div>
          <button type="submit" className="btn">
            Add Founds
          </button>
        </form>
        <p className="advice">
          Make sure you don't invest more than you can afford. Deposits are
          typically available within 1-3 business days.
        </p>
      </div>
    </div>
  );
}
