import { useState } from "react";
import "../../PopUp/PopUp.css";
import WalletService from "../../../Services/WalletService";
import { IoMdClose } from "react-icons/io";
import { FaDollarSign } from "react-icons/fa";

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
          <div className="closeBtn">
            <IoMdClose onClick={onClose} />
          </div>
          <div>
            <h2>Withdraw</h2>
            <h4 className="description">
              {" "}
              Enter the amount you would like to withdraw from your investment
              account.
            </h4>
          </div>
          <form className="popUpForm" onSubmit={withdraw}>
            <div>
              <div className="inputSection">
                <FaDollarSign className="dollar" />
                <input
                  value={amount === undefined ? "" : amount}
                  onChange={(e) => {
                    setAmount(Number(e.target.value));
                  }}
                  type="text"
                />
              </div>
            </div>
            <button type="submit" className="btn">
              Submit
            </button>
          </form>
          <p className="advice">
            Make sure you don't invest more than you can afford. Deposits are
            typically available within 1-3 business days.
          </p>
        </div>
      </div>
    </div>
  );
}
