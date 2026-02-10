import { useEffect } from "react";
import Portofolio from "../../Services/PortofolioService";
import "./Wallet.css";

export default function Wallet() {
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
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className="main">
      <div className="walletContainer">
        <h1>Stock Chart</h1>
        <div className="chart">
          <div className="inChart">
            <label>Name</label>
            <h2 className="stockName">AAPL</h2>
            <label>Price</label>
            <h2 className="Price">33</h2>
            <label>Shares</label>
            <h2 className="stockShares">33</h2>
          </div>
        </div>
      </div>
    </div>
  );
}
