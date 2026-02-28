import { useCallback, useEffect, useState } from "react";
import WalletService from "../../Services/WalletService";
import "./Profile.css";
import AddFoundsPopUp from "../../Components/PopUp/FinancePops/AddFoundsPopUp";
import WithdrawPopUp from "../../Components/PopUp/FinancePops/WithdrawPopUp";
import AuditLogPop from "../../Components/PopUp/AuditLogPop/AuditLogPop";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import { CiWallet } from "react-icons/ci";
import { AiOutlineRise } from "react-icons/ai";
import { MdOutlineAddCard } from "react-icons/md";
import { HiOutlineCash } from "react-icons/hi";
import { PiClockCounterClockwise } from "react-icons/pi";

export default function Profile() {
  const [balance, setBalance] = useState<number>(0);

  const [investment, setInvestment] = useState<number>();
  const [addFoundPop, setAddFoundPop] = useState(false);
  const [withdrawFoundPop, setwithdrawFoundPop] = useState(false);
  const [auditLogPop, setAuditLogPop] = useState(false);

  const fetchBalance = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("You are not logged in");
      }
      const balanceResponse = await WalletService.Balance(token);
      setInvestment(balanceResponse.investment);
      setBalance(balanceResponse.balance);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  useEffect(() => {
    const email = localStorage.getItem("email");
    const socket = new SockJS("http://localhost:8080/ws");
    const client = Stomp.over(socket);

    client.connect(
      {},
      () => {
        client.subscribe(`/topic/${email}`, (message) => {
          console.log("Connected to", message);
          fetchBalance();
        });
      },
      (e) => console.error(e),
    );

    return () => {
      if (client && client.connected) {
        client.disconnect(() => console.log("Disconected"));
      }
    };
  }, [fetchBalance]);

  return (
    <div className="wraper">
      {addFoundPop && <AddFoundsPopUp onClose={() => setAddFoundPop(false)} />}
      {withdrawFoundPop && (
        <WithdrawPopUp
          onClose={() => {
            setwithdrawFoundPop(false);
          }}
        />
      )}
      {auditLogPop && (
        <AuditLogPop closed={() => setAuditLogPop(false)}></AuditLogPop>
      )}
      <div className="profile">
        <div className="profileHeader">
          <div className="profilePic">
            <img src="/poza_cv.jpg" alt="" />
          </div>
          <h2 className="username">Laza Lukas</h2>
        </div>
        <div className="valueBoxes">
          <div className="vbox bal">
            <div className="vboxHelper">
              <div className="vboxTopSide">
                <p className="vboxTitle">Balance</p>
                <CiWallet className="vboxIcon" />
              </div>
              <div className="amount">${balance}</div>
            </div>
          </div>
          <div className="vbox">
            <div className="vboxHelper">
              <div className="vboxTopSide">
                <p className="vboxTitle">Investments</p>
                <AiOutlineRise className="vboxIcon" />
              </div>
              <div className="amount">${investment}</div>
            </div>
          </div>
        </div>
        <div className="btnWrapper">
          <button
            className="add ProfileBtn"
            onClick={() => setAddFoundPop(true)}
          >
            <MdOutlineAddCard /> Add founds
          </button>
        </div>
        <div className="btnWrapper">
          <button
            className="sell ProfileBtn"
            onClick={() => setwithdrawFoundPop(true)}
          >
            <HiOutlineCash /> Withdraw
          </button>
        </div>
        <div className="btnWrapper">
          <button
            className="audit ProfileBtn"
            onClick={() => setAuditLogPop(true)}
          >
            <PiClockCounterClockwise /> Audit
          </button>
        </div>
      </div>
    </div>
  );
}

{
  /* <form action="Submit" onSubmit={AddFounds}>
  <input
  value={Addamount === undefined ? "" : Addamount}
  onChange={(e) => {
    setADDAmount(Number(e.target.value));
  }}
  type="number"
  />
  <button type="submit"></button>
  </form>
<form action="Submit" onSubmit={WithdrawFounds}>
<input
value={WithdrawAmount === undefined ? "" : WithdrawAmount}
onChange={(e) => {
  setWithdrawAmount(Number(e.target.value));
}}
type="number"
/>
<button type="submit"></button>
</form> */
}

{
  /* <div className="audit">
  {audit?.map((aud) => (
    <div>
      <div>{aud.date}</div>
      <div>{aud.price}</div>
      <div>{aud.shares}</div>
      <div>{aud.symbol}</div>
      <div>{aud.total}</div>
    </div>
  ))}
</div> */
}
