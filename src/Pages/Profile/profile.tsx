import { useEffect, useState } from "react";
import WalletService from "../../Services/WalletService";
import "./Profile.css";
import AddFoundsPopUp from "../../Components/PopUp/AddFoundsPopUp";
import WithdrawPopUp from "../../Components/PopUp/WithdrawPopUp";

export default function Profile() {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const [investment, setInvestment] = useState<number>();
  const [addFoundPop, setAddFoundPop] = useState(false);
  const [withdrawFoundPop, setwithdrawFoundPop] = useState(false);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const token = localStorage.getItem("token");
      setLoading(true);

      if (!token) {
        throw new Error("You are not logged in");
      }
      const balanceResponse = await WalletService.Balance(token);
      const investmentResponse = await WalletService.Investment(token);
      setInvestment(investmentResponse.investment);
      setBalance(balanceResponse.balance);
    } catch (error) {
      console.log(error);
      setError("something doesn t work");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

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
      <div className="profile">
        <div className="profileHeader">
          <div className="profilePic">
            <img src="/poza_cv.jpg" alt="" />
          </div>
          <h2 className="username">Laza Lukas</h2>
        </div>
        <div className="valueSection">
          <div className="statBox">
            <p className="valueTitle">Balance</p>
            <div className="addFounds" onClick={() => setAddFoundPop(true)}>
              +
            </div>
            <div className="balance">{balance} $</div>
          </div>
          <div className="statBox">
            <p className="valueTitle">Investments</p>
            <div className="balance">{investment} $</div>
          </div>
        </div>
        <button className="btn" onClick={() => setAddFoundPop(true)}>
          Add founds
        </button>
        <button className="btn" onClick={() => setwithdrawFoundPop(true)}>
          Withdraw
        </button>
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
