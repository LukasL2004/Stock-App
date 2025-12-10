import React, { useEffect, useState } from "react";
import WalletService from "../../Services/WalletService";
import "./Profile.css";
import PopUp from "../../Components/PopUp/PopUp";

export default function Profile() {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [Addamount, setADDAmount] = useState<number>();
  const [WithdrawAmount, setWithdrawAmount] = useState<number>();
  const [investment, setInvestment] = useState<number>();
  const [isOpen, setIsOpen] = useState(false);

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
  const AddFounds = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Sorry an unsespected error happend");
      }
      if (!Addamount) {
        throw new Error("Please use an valid amount");
      }
      const response = await WalletService.AddFounds(token, Addamount);
      await fetchBalance();
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  const WithdrawFounds = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Sorry an unsespected error happend");
      }
      if (!WithdrawAmount) {
        throw new Error("Sorry you don t have enought money in your account");
      }

      const response = await WalletService.Withdraw(token, WithdrawAmount);
      await fetchBalance();
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  // if (variabila) return PopUp();
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="wraper">
      {isOpen && <PopUp onClose={() => setIsOpen(false)} />}
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
            <div className="addFounds">+</div>
            <div className="balance">{balance} $</div>
          </div>
          <div className="statBox">
            <p className="valueTitle">Investments</p>
            <div className="balance">{investment} $</div>
          </div>
        </div>
        <button className="btn" onClick={() => setIsOpen(true)}>
          click
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
