import { useEffect, useState } from "react";
import Portofolio from "../../Services/PortofolioService";
import "./Wallet.css";
import type { total } from "../../Services/Interfaces/TotalInterface";
import type { DailyProfit } from "../../Services/Interfaces/ProfitInterface";
import { FaMinus } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import InvestmentVisualizer from "../../Components/Reuseable/InvestmentDistribution/InvestmentVisualizer";
import AllocationVisualizer from "../../Components/Reuseable/AllocationVisualizer.tsx/AllocationVisualizer";
import AuditLog from "../../Services/AuditLogService";
import type { AuditLogInterface } from "../../Services/Interfaces/AuditLogInterface";
import AddFoundsPopUp from "../../Components/PopUp/FinancePops/AddFoundsPopUp";
import WithdrawPopUp from "../../Components/PopUp/FinancePops/WithdrawPopUp";

export default function Wallet() {
  const [stock, setStock] = useState<total>();
  const [profit, setProfit] = useState<DailyProfit>();
  const [audit, setAudit] = useState<AuditLogInterface[]>();
  const [n, setN] = useState<number>(0);
  const [j, setJ] = useState<number>(4);
  const [addFoundPop, setAddFoundPop] = useState(false);
  const [withdrawFoundPop, setwithdrawFoundPop] = useState(false);

  const back = () => {
    if (n > 0) {
      setN(n - 4);
    }
    if (j > 4) {
      setJ(j - 4);
    }
  };

  const forward = () => {
    setN(n + 4);
    setJ(j + 4);
  };

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
      {addFoundPop && <AddFoundsPopUp onClose={() => setAddFoundPop(false)} />}
      {withdrawFoundPop && (
        <WithdrawPopUp
          onClose={() => {
            setwithdrawFoundPop(false);
          }}
        />
      )}

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
          <button
            onClick={() => {
              setAddFoundPop(true);
            }}
            className="addBtn"
          >
            {" "}
            <FaPlus className="icon" /> ADD FOUNDS
          </button>
          <button
            onClick={() => {
              setwithdrawFoundPop(true);
            }}
            className="exportBtn"
          >
            <FaMinus className="icon" /> WITHDRAW
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
            {audit?.slice(n, j).map((item, index) => {
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
            <div className="pagination">
              <p onClick={back} className="pages">
                &larr;
              </p>{" "}
              <p onClick={forward} className="pages">
                {" "}
                &rarr;
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
