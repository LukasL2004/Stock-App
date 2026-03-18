import React, { useState } from "react";
import "../../PopUp/PopUp.css";
import WalletService from "../../../Services/WalletService";
import { IoMdClose } from "react-icons/io";
import { FaDollarSign } from "react-icons/fa";

type PopUpProps = {
  onClose: () => void;
};

export default function AddFoundsPopUp({ onClose }: PopUpProps) {
  const [amount, setAmount] = useState(0);
  const token = localStorage.getItem("token");

  const addFoundsInput = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!token) {
        throw new Error(
          "Sorry an error ocurred please log in again and try again",
        );
      }
      const response = await WalletService.AddFounds(token, amount);
      onClose();
      if (!response) {
        throw new Error("Sorry an error ocurred please try again later");
      }
    } catch (error) {
      console.log(error);
    }
    setAmount(0);
  };

  return (
    <div className="popUpWraper" onClick={onClose}>
      <div
        className="popUp"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="closeBtn">
          <IoMdClose onClick={onClose} />
        </div>
        <div>
          <h2 className="title">Add founds</h2>
          <h4 className="description">
            Enter the amount you would like to deposit into your investment
            account.
          </h4>
        </div>
        <form className="popUpForm" onSubmit={addFoundsInput}>
          <div>
            <div className="inputSection">
              <FaDollarSign className="dollar" />
              <input
                value={amount === undefined ? "" : amount}
                onChange={(e) => {
                  setAmount(Number(e.target.value));
                }}
                className="addFoundsInput"
                type="text"
              />
            </div>
          </div>
          <button type="submit" className="btn">
            Add Founds
          </button>
        </form>
        <p className="advice">
          Make sure you don't invest more than you can afford. Deposits are
          typically available within 1-3 business days.
        </p>
      </div>
    </div>
  );
}
