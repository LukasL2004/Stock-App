import { useEffect, useState } from "react";
import StockData from "../../Services/StockInfoService";
import "./LandingPage.css";
import type { Stock } from "../../Services/Interfaces/StockInfoInterface";

export default function LandingPage() {
  const [stock, setStock] = useState<Stock[]>();
  const [name, setName] = useState<string>("AAPL");
  const [price, setPrice] = useState<number>();
  const [status, setStatus] = useState<string>();

  const getStockInfo = (symbol: string, price: number, status: string) => {
    setName(symbol);
    setPrice(price);
    setStatus(status);
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
        {stock?.map((stock) => (
          <div
            onClick={() =>
              getStockInfo(stock.symbol, stock.price, stock.status)
            }
            className="stocks"
          >
            <p className="title">{stock.symbol}</p>
            <p className="stockPrice">{stock.price} $</p>
          </div>
        ))}
      </div>
      <div className="displayContainer">
        <div className="stockHeader">
          <div className="stockStatus">
            <div className="displayTitle">{name}</div>
            <div className="status">Status: {status}</div>
          </div>
          <div className="price">{price} $</div>
        </div>
        <div className="charts">
          <div className="graph"></div>
          <div className="selectPeriod">
            <div className="period">1 Day</div>
            <div className="period">1 Week</div>
            <div className="period">1 Month</div>
          </div>
        </div>
      </div>
    </div>
  );
}
