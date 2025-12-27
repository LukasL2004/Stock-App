import { useEffect, useState } from "react";
import StockData from "../../Services/StockInfoService";
import "./LandingPage.css";
import type { Stock } from "../../Services/Interfaces/StockInfoInterface";

export default function LandingPage() {
  const [stock, setStock] = useState<Stock[]>();
  const [name, setName] = useState<string>();

  const getName = (symbol: string) => {
    setName(symbol);
  };

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await StockData.stocks();
        setStock(response);
      } catch (Error) {
        console.log(Error);
      }
    };
    getData();
  }, []);

  return (
    <div className="main">
      <div className="stockContainer">
        <h1 className="title">Stocks</h1>
        {stock?.map((Stock) => (
          <div className="stocks">
            <p onClick={() => getName(Stock.symbol)} className="title">
              {Stock.symbol}
            </p>

            <p className="stockPrice">{Stock.price}</p>
          </div>
        ))}
      </div>
      <div className="displayContainer">
        <div className="display_title">{name}</div>
        <div className="charts"></div>
      </div>
    </div>
  );
}
