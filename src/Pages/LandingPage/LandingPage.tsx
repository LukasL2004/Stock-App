import { useCallback, useEffect, useState } from "react";
import StockData from "../../Services/StockInfoService";
import "./LandingPage.css";
import type { Stock } from "../../Services/Interfaces/StockInfoInterface";
import Charts from "../../Components/Charts/Charts";
import BuyPopUp from "../../Components/PopUp/FinancePops/BuyPopUp";
import SellPopUp from "../../Components/PopUp/FinancePops/SellPopUp";
import type { portofolioData } from "../../Services/Interfaces/PortofolioInterface";
import Portofolio from "../../Services/PortofolioService";
import type { total } from "../../Services/Interfaces/TotalInterface";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

import type { DailyProfit } from "../../Services/Interfaces/ProfitInterface";

import { FaPlusCircle } from "react-icons/fa";
import { FaMinusCircle } from "react-icons/fa";

export default function LandingPage() {
  const [stock, setStock] = useState<Stock[]>();
  const [name, setName] = useState<string>("AAPL");
  const [price, setPrice] = useState<number>();
  const [closedBuy, setClosedBuy] = useState<boolean>(false);
  const [closedSell, setClosedSell] = useState<boolean>(false);
  const [portofolio, setPortofolio] = useState<portofolioData>();
  const [total, setTotal] = useState<total>();

  const [profit, setProfit] = useState<DailyProfit>();

  const getStockInfo = (symbol: string, price: number) => {
    setName(symbol);
    setPrice(price);
  };

  const fetchData = useCallback(async () => {
    try {
      const stocksRes = await StockData.stocks();
      setStock(stocksRes);
    } catch (err) {
      console.error(err);
    }
    try {
      const portfolioRes = await Portofolio.getData(name);
      setPortofolio(portfolioRes);
    } catch (err) {
      console.warn(err);
    }

    try {
      const totalRes = await Portofolio.getTotal();
      setTotal(totalRes);
    } catch (err) {
      console.warn(err);
    }

    try {
      const prof = await Portofolio.getProfit(name);
      setProfit(prof);
    } catch (e) {
      console.error(e);
    }
  }, [name]);

  useEffect(() => {
    setTimeout(() => {
      fetchData().catch((e) => console.log(e));
    }, 0);
  }, [fetchData]);

  useEffect(() => {
    const socket = new SockJS("http://localhost:8080/ws");
    const client = Stomp.over(socket);
    const email = localStorage.getItem("email");
    client.connect(
      {},
      (frame) => {
        console.log("Your socket is connected", frame);

        client.subscribe(`/topic/${email}`, (message) => {
          console.log("Update received:", message);
          fetchData();
        });
      },
      (error) => {
        console.error(error);
      },
    );
    return () => {
      if (client && client.connected) {
        client.disconnect(() => console.log("unsubscribed"));
      }
    };
  }, [fetchData]);

  return (
    <div className="mainLanding">
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

      <div className="mainCont">
        <div className="stockList">
          <div className="stockTitle">
            <h3>Stocks</h3>
            <p style={{ color: "#136dec" }}>View All</p>
          </div>
          {stock?.map((stock) => {
            return (
              <div
                key={stock.symbol}
                className={`stock ${stock.symbol === name ? "selected" : ""}`}
                onClick={() => {
                  getStockInfo(stock.symbol, stock.price);
                }}
              >
                <h4 className="stockName">{stock.symbol}</h4>
                <div className="pricePlace">
                  <p className="price">{stock.price.toFixed(2)} $</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="chartContaier">
        <Charts name={name}></Charts>
        <div className="stats">
          <div className="stockStats">
            <h4 style={{ color: "#6B7280", padding: "1.3rem  1.3rem  0" }}>
              ACCOUNT AT A GLAZE
            </h4>
            <div className="moneySection">
              <div className="moneyContainer">
                <div className="monCont">
                  <p className="MSTitle">Total Profit</p>
                  <h3
                    style={
                      (portofolio?.profit ?? 0) > 0
                        ? { color: "#10B981" }
                        : { color: "red" }
                    }
                    className="MSMoney"
                  >
                    {(portofolio?.profit ?? 0) > 0
                      ? `+${portofolio?.profit.toFixed(2)}`
                      : portofolio?.profit.toFixed(2)}
                  </h3>
                </div>
                <div className="monCont">
                  <p className="MSTitle">Total Owned</p>
                  <h3 className="MSMoney">{portofolio?.amountOwned}</h3>
                </div>
              </div>
              <div className="stockNeeds">
                <p>Average Price</p>
                <p>{portofolio?.averagePrice}</p>
              </div>
              <div className="stockNeeds">
                <p>Shares Owned</p>
                <p>{portofolio?.shares}</p>
              </div>
              <div className="stockNeeds">
                <p>Portfolio %</p>
                <p>{portofolio?.averagePrice}</p>
              </div>
            </div>
            <div className="btnSection">
              <button
                style={{ background: "#136dec" }}
                onClick={() => setClosedBuy(true)}
                className="bBtn"
              >
                <FaPlusCircle /> buy
              </button>
              <button
                style={{ background: "#F1F5F9", color: "#000" }}
                onClick={() => setClosedSell(true)}
                className="bBtn"
              >
                <FaMinusCircle /> Sell
              </button>
            </div>
          </div>
          <div className="history">
            <h4 style={{ color: "#6B7280", padding: "1.3rem  1.3rem  0" }}>
              ACCOUNT AT A GLAZE
            </h4>
            <div className="containerGrid">
              <div className="gridHelper">
                <div className="histContainers">
                  <p className="histTitle">Total Portfolio</p>
                  <h3 className="histAmount">${total?.total}</h3>
                </div>
                <div className="histContainers">
                  <p className="histTitle">Total Profit</p>
                  <h3
                    style={
                      (profit?.totalPortfolioProfitDaily ?? 0) > 0
                        ? { color: "#10B981" }
                        : { color: "red" }
                    }
                    className="histAmount "
                  >
                    {(profit?.totalPortfolioProfitDaily ?? 0) > 0
                      ? `+${profit?.totalPortfolioProfitDaily.toFixed(2)} $`
                      : profit?.totalPortfolioProfitDaily.toFixed(2)}
                  </h3>
                </div>
              </div>
              <div className="gridHelper">
                <div className="histContainers">
                  <p className="histTitle">Total Portfolio</p>
                  <h3 className="histAmount">${total?.total}</h3>
                </div>
                <div className="histContainers">
                  <p className="histTitle">Total Profit</p>
                  <h3
                    style={
                      (profit?.totalPortfolioProfitDaily ?? 0) > 0
                        ? { color: "#10B981" }
                        : { color: "red" }
                    }
                    className="histAmount "
                  >
                    {(profit?.totalPortfolioProfitDaily ?? 0) > 0
                      ? `+${profit?.totalPortfolioProfitDaily.toFixed(2)} $`
                      : profit?.totalPortfolioProfitDaily.toFixed(2)}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
