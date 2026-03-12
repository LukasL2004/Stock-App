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
import authService from "../../Services/UserService";
import type { User } from "../../Services/Interfaces/UserInterface";
import { RiWallet3Line } from "react-icons/ri";
import type { DailyProfit } from "../../Services/Interfaces/ProfitInterface";
import { MdOutlineTrendingUp } from "react-icons/md";
import { PiPiggyBank } from "react-icons/pi";

export default function LandingPage() {
  const [stock, setStock] = useState<Stock[]>();
  const [name, setName] = useState<string>("AAPL");
  const [price, setPrice] = useState<number>();
  const [status, setStatus] = useState<string>();
  const [closedBuy, setClosedBuy] = useState<boolean>(false);
  const [closedSell, setClosedSell] = useState<boolean>(false);
  const [portofolio, setPortofolio] = useState<portofolioData>();
  const [total, setTotal] = useState<total>();
  const [user, setUser] = useState<User>();
  const [profit, setProfit] = useState<DailyProfit>();

  const getUser = async () => {
    try {
      const response = await authService.getUser();
      setUser(response);
      console.log(response);
    } catch (e) {
      console.log(e);
    }
  };

  const getStockInfo = (symbol: string, price: number, status: string) => {
    setName(symbol);
    setPrice(price);
    setStatus(status);
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
      getUser();
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
      <div className="title">
        <h1>Dashboard</h1>
        <p>
          Welcome back, {user?.firstName}. Here's your portfolio performance
        </p>
      </div>
      <div className="containers">
        <div className="cont">
          <div className="topCont">
            <div className="ContIcon">
              <RiWallet3Line />
            </div>
            <p
              className="profitCont"
              style={
                (profit?.totalPortfolioProfitDailyPercentage ?? 0) > 0
                  ? { background: "#00ff00", color: "#000000" }
                  : { background: "#ff0000", color: "#ffffff" }
              }
            >
              {profit?.totalPortfolioProfitDailyPercentage.toFixed(2)}%
            </p>
          </div>
          <div className="mainCont">
            <p className="details">Total Portofolio Value</p>
            <h2 className="sum">$ {total?.total}</h2>
          </div>
        </div>
        <div className="cont">
          <div className="topCont">
            <div className="ContIcon">
              <MdOutlineTrendingUp />
            </div>
            {(profit?.dailyProfitPercentage ?? 0) > 0 ? (
              <p
                className="profitCont"
                style={{ background: "#00ff00", color: "#000000" }}
              >
                &uarr; High
              </p>
            ) : (
              <p
                className="profitCont"
                style={{ background: "#ff0000", color: "#ffffff" }}
              >
                &darr; Low
              </p>
            )}
          </div>
          <div className="mainCont">
            <p className="details">Total gain/Loss</p>
            <h2 className="sum">$ {profit?.dailyProfitValue.toFixed(2)}</h2>
          </div>
        </div>
        <div className="cont">
          <div className="topCont">
            <div className="ContIcon">
              <PiPiggyBank />
            </div>
            <p className="profitCont"></p>
          </div>
          <div className="mainCont">
            <p className="details">Annual Dividend</p>
            <h2 className="sum">$ 560</h2>
          </div>
        </div>
      </div>
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
            key={stock.symbol}
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
          <div className="stats">
            <div className="avr">Average Price: {portofolio?.averagePrice}</div>
            <div className="shares">Shares: {portofolio?.shares}</div>
            <div className="shares">Profit: {portofolio?.profit}</div>
            <div className="shares">Total: {total?.total}</div>
            <div className="amountOwend">
              Amount Owned: {portofolio?.amountOwned}
              percentage :{" "}
              {total?.portfolioChart.map((chart) => (
                <div>{chart.percentage}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
