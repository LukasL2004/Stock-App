import { useState } from "react";
import "../../PopUp/PopUp.css";
import WalletService from "../../../Services/WalletService";

type PopUpProps = {
  onClose: () => void;
};

export default function WithdrawPopUp({ onClose }: PopUpProps) {
  const [amount, setAmount] = useState(0);
  const token = localStorage.getItem("token");

  const withdraw = async () => {
    try {
      if (!token) {
        throw new Error("An error occured please relog and try again");
      }
      const response = await WalletService.Withdraw(token, amount);
      if (!response) {
        throw new Error("An error occured and try again");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <div className="popUpWraper" onClick={onClose}>
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="popUp"
        >
          <h1>Withdraw</h1>
          <form onSubmit={withdraw}>
            <label htmlFor="">Please enter the sum you want to withdraw</label>
            <input
              value={amount === undefined ? "" : amount}
              onChange={(e) => {
                setAmount(Number(e.target.value));
              }}
              type="number"
            />
            <button type="submit" className="btn">
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
