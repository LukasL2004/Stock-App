import { useEffect, useState } from "react";
import StockData from "../../Services/StockInfoService";
import "./LandingPage.css";
import type { Stock } from "../../Services/Interfaces/StockInfoInterface";
import Charts from "../../Components/Charts/Charts";
import BuyPopUp from "../../Components/PopUp/BuyPopUp";
import SellPopUp from "../../Components/PopUp/SellPopUp";

export default function LandingPage() {
  const [stock, setStock] = useState<Stock[]>();
  const [name, setName] = useState<string>("AAPL");
  const [price, setPrice] = useState<number>();
  const [status, setStatus] = useState<string>();
  const [closedBuy, setClosedBuy] = useState<boolean>(false);
  const [closedSell, setClosedSell] = useState<boolean>(false);

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
      {closedBuy && (
        <BuyPopUp
          Symbol={name}
          currentPrice={price!}
          closed={() => setClosedBuy(false)}
        ></BuyPopUp>
      )}
      {closedSell && (
        <SellPopUp
          symbol={name}
          currentPrice={price!}
          closed={() => setClosedSell(false)}
        ></SellPopUp>
      )}
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
          <div className="graph">
            <Charts name={name}></Charts>
          </div>
          <div className="selectPeriod">
            <button onClick={() => setClosedBuy(true)} className="buyBtn">
              buy
            </button>
            <button onClick={() => setClosedSell(true)} className="buyBtn">
              Sell
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
