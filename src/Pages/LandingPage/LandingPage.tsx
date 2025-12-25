import { useEffect, useState } from "react";
import StockData from "../../Services/StockInfoService";
import "./LandingPage.css";
import type { Stock } from "../../Services/Interfaces/StockInfoInterface";

export default function LandingPage() {
  const [stock, setStock] = useState<Stock[]>();

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
            <p className="title">{Stock.symbol}</p>

            <p className="stockPrice">{Stock.price}</p>
          </div>
        ))}
      </div>
      <div className="displayContainer">
        <div className="charts"></div>
      </div>
    </div>
  );
}

{
  /* {symbols.map((symbol) => (
  <div key={symbol}>
    <strong>{symbol}</strong>
    {candles[symbol] ? (
      <p>Close: {candles[symbol].close}</p>
    ) : (
      <p>Loading...</p>
    )}
  </div>
))} */
}
