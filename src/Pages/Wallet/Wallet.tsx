import { useEffect, useState } from "react";
import Portofolio from "../../Services/PortofolioService";
import "./Wallet.css";
import type { total } from "../../Services/Interfaces/TotalInterface";
import type { DailyProfit } from "../../Services/Interfaces/ProfitInterface";
import { LuDownload } from "react-icons/lu";
import { FaPlus } from "react-icons/fa";
import InvestmentVisualizer from "../../Components/Reuseable/InvestmentDistribution/InvestmentVisualizer";
import AllocationVisualizer from "../../Components/Reuseable/AllocationVisualizer.tsx/AllocationVisualizer";
import AuditLog from "../../Services/AuditLogService";
import type { AuditLogInterface } from "../../Services/Interfaces/AuditLogInterface";

export default function Wallet() {
  const [stock, setStock] = useState<total>();
  const [profit, setProfit] = useState<DailyProfit>();
  const [audit, setAudit] = useState<AuditLogInterface[]>();

  const auditLog = async () => {
    try {
      const response = await AuditLog.GetAudit();
      setAudit(response);
    } catch (e) {
      console.log(e);
    }
  };

  const getData = async () => {
    try {
      const response = await Portofolio.getTotal();
      const profitResponse = await Portofolio.getProfit("AAPL");
      console.log(response);
      setProfit(profitResponse);
      setStock(response);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      getData();
      auditLog();
    }, 0);
  }, []);

  return (
    <div className="walletMain">
      <div className="topWallet">
        <div className="walletTotal">
          <p className="totalTitle">TOTAL PORTFOLIO VALUE</p>
          <div className="totalSum">
            <h3>{stock?.total}$</h3>
            {(profit?.totalPortfolioProfitDailyPercentage ?? 0) > 0 ? (
              <p style={{ color: "#059669" }}>
                &uarr; {profit?.totalPortfolioProfitDailyPercentage.toFixed(2)}%
              </p>
            ) : (
              <p style={{ color: "red", backgroundColor: "#FFE4E6" }}>
                &darr; {profit?.totalPortfolioProfitDailyPercentage.toFixed(2)}%
              </p>
            )}
          </div>
        </div>
        <div className="buttonSection">
          <button className="addBtn">
            {" "}
            <FaPlus className="icon" /> ADD FOUNDS
          </button>
          <button className="exportBtn">
            <LuDownload className="icon" /> EXPORT
          </button>
        </div>
      </div>
      <div className="walletMainComp">
        <div className="statistics">
          <InvestmentVisualizer></InvestmentVisualizer>
          <div className="assets">
            <h3>Asset Allocation</h3>
            <div className="barChart">
              <div className="asset">
                <p>Equity</p>
              </div>
              <AllocationVisualizer percentage={70}></AllocationVisualizer>
            </div>
            <div className="barChart">
              <div className="asset">
                <p>Fixed Income</p>
              </div>
              <AllocationVisualizer percentage={15}></AllocationVisualizer>
            </div>
            <div className="barChart">
              <div className="asset">
                <p>Crypto</p>
              </div>
              <AllocationVisualizer percentage={0}></AllocationVisualizer>
            </div>
            <div className="barChart">
              <div className="asset">
                <p>Cash</p>
              </div>
              <AllocationVisualizer percentage={15}></AllocationVisualizer>
            </div>
          </div>
        </div>
      </div>
      <div className="walletBottom">
        <div className="historyTop">
          <h3>Recent Transactions</h3>
          <p className="viewAllBtn">View All</p>
        </div>

        <div className="transactionsTable">
          <div className="tableHeader">
            <p>ACTION</p>
            <p>ASSET</p>
            <p>AMOUNT</p>
            <p>PRICE</p>
            <p>DATE</p>
            <p>STATUS</p>
          </div>

          <div className="tableBody">
            {audit?.slice(0, 4).map((item, index) => {
              return (
                <div key={index} className="tableRow">
                  <div className="tdCell">
                    <span className="actionBadge buy">BUY</span>
                  </div>
                  <div className="tdCell assetCell">
                    <span className="assetSymbol">{item.symbol}</span>
                  </div>
                  <div className="tdCell">
                    {Number(item.shares).toFixed(2)} Shares
                  </div>
                  <div className="tdCell boldPrice">
                    ${Number(item.price).toFixed(2)}
                  </div>
                  <div className="tdCell dateCell">{item.date}</div>
                  <div className="tdCell statusCell completed">Completed</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
