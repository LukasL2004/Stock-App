import { useState } from "react";
import "../../PopUp/PopUp.css";
import WalletService from "../../../Services/WalletService";

type PopUpProps = {
  onClose: () => void;
};

export default function AddFoundsPopUp({ onClose }: PopUpProps) {
  const [amount, setAmount] = useState(0);
  const token = localStorage.getItem("token");

  const addFoundsInput = async () => {
    try {
      if (!token) {
        throw new Error(
          "Sorry an error ocurred please log in again and try again",
        );
      }
      const response = await WalletService.AddFounds(token, amount);
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
        <h1 className="title">Add founds</h1>
        <h3 className="description">
          Make sure you don t invest more then you can afford
        </h3>
        <form onSubmit={addFoundsInput}>
          <label htmlFor="">Please enter the sum you want to invest</label>
          <input
            value={amount === undefined ? "" : amount}
            onChange={(e) => {
              setAmount(Number(e.target.value));
            }}
            className="addFoundsInput"
            type="number"
          />
          <button className="btn">Add Founds</button>
        </form>
      </div>
    </div>
  );
}
