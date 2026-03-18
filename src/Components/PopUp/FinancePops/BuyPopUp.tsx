import { useState } from "react";
import Trading from "../../../Services/StockTradingService";
import type { buy } from "../../../Services/Interfaces/StockTradingInterface";
import { IoMdClose } from "react-icons/io";
import { FaDollarSign } from "react-icons/fa";

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
        <div className="closeBtn">
          <IoMdClose onClick={buyProps.closed} />
        </div>
        <div>
          <h2 className="title">Buy {Buy.symbol}</h2>
          <h4 className="description">
            Enter the amount you would like to deposit into your investment
            account.
          </h4>
        </div>
        <form className="popUpForm" onSubmit={handleBuy}>
          <div className="inputSection">
            <FaDollarSign className="dollar" />
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
              type="text"
            />
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
