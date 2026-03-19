import { useEffect, useState } from "react";
import type { AuditLogInterface } from "../../../Services/Interfaces/AuditLogInterface";
import AuditLog from "../../../Services/AuditLogService";
import "./AuditLog.css";
import { IoClose } from "react-icons/io5";

interface AuditProp {
  closed: () => void;
}

export default function AuditLogPop({ closed }: AuditProp) {
  const [audit, setAudit] = useState<AuditLogInterface[]>();
  const [n, setN] = useState<number>(0);
  const [j, setJ] = useState<number>(5);

  const back = () => {
    if (n > 0) {
      setN(n - 5);
    }
    if (j > 5) {
      setJ(j - 5);
    }
  };

  const forward = () => {
    setN(n + 5);
    setJ(j + 5);
  };

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await AuditLog.GetAudit();
        setAudit(response);
      } catch (e) {
        console.log(e);
      }
    };
    getData();
  }, []);

  return (
    <div onClick={closed} className="popUpWraper">
      <div
        className="auditPopUp"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div
          style={{ marginRight: "0.5rem", cursor: "default" }}
          className="closeBtn"
        >
          <IoClose style={{ cursor: "pointer" }} onClick={closed} />
        </div>
        <div className="auditMain">
          <h1 className="auditTitle">Audit Log</h1>
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
    </div>
  );
}
