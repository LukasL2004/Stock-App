import { useEffect, useState } from "react";
import type { AuditLogInterface } from "../../../Services/Interfaces/AuditLogInterface";
import AuditLog from "../../../Services/AuditLogService";
import "./AuditLog.css";

interface AuditProp {
  closed: () => void;
}

export default function AuditLogPop({ closed }: AuditProp) {
  const [audit, setAudit] = useState<AuditLogInterface[]>();

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
        className="popUp"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="bdy">
          <h1 className="auditTitle">Audit Log</h1>
          <div className="audit">
            {audit?.map((audit) => (
              <div className="tableWrapper">
                <div className="tableObject">
                  <p>Date</p>
                  <div className="table">{audit.date}</div>
                </div>
                <div className="tableObject">
                  <p>Price</p>
                  <div className="table">{audit.price}</div>
                </div>
                <div className="tableObject">
                  <p>Shares</p>
                  <div className="table">{audit.shares}</div>
                </div>
                <div className="tableObject">
                  <p>Symbol</p>
                  <div className="table">{audit.symbol}</div>
                </div>
                <div className="tableObject">
                  <p>Total</p>
                  <div className="table">{audit.total}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
