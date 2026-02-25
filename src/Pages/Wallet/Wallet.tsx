import { useEffect, useState } from "react";
import Portofolio from "../../Services/PortofolioService";
import "./Wallet.css";
import type { total } from "../../Services/Interfaces/TotalInterface";

export default function Wallet() {
  const [stock, setStock] = useState<total>();
  const colors = [
    "#cf39c8",
    "#2196f3",
    "#ff9800",
    "#e91e63",
    "#9c27b0",
    "#00bcd4",
    "#ffeb3b",
    "#795548",
  ];

  const getData = async () => {
    try {
      const response = await Portofolio.getTotal();
      console.log(response);
      setStock(response);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      getData();
    }, 0);
  }, []);

  return (
    <div className="main">
      <div className="walletContainer">
        <h1>Stock Chart</h1>
        <div className="chart">
          {stock?.portfolioChart.map((stock, index) => {
            const currentColor = colors[index % colors.length];
            return (
              <div
                key={index}
                className="inChart"
                style={{ borderLeft: `5px solid ${currentColor}` }}
              >
                <label>Name</label>
                <h2 className="stockName" style={{ color: currentColor }}>
                  {stock.symbol}
                </h2>
                <label>Price</label>
                <h2 className="Price">{stock.value}</h2>
                <label>Shares</label>
                <h2 className="stockShares">{stock.percentage}</h2>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
