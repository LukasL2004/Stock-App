import "./ForgotPassword.css";
import React, { useState } from "react";
import authService from "../../Services/UserService";
import type {
  ForgotPassword,
  resetPassword,
} from "../../Services/Interfaces/UserInterface";
import { IoMdClose } from "react-icons/io";
import { MdLockReset } from "react-icons/md";
import { useNavigate } from "react-router";

export default function ForgotPassword() {
  const [email, setEmail] = useState<ForgotPassword>({
    email: "",
  });
  const [reset, setReset] = useState<resetPassword>({
    email: "",
    password: "",
    code: "",
  });
  const [status, setStatus] = useState<string>();
  const [checker, setChecker] = useState<boolean>(false);
  const navigate = useNavigate();

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await authService.ResetPassword(reset);
      setStatus(response);
    } catch (e) {
      console.error(e);
    }
  };

  const toLogin = () => {
    navigate("/Login");
  };

  const forgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await authService.ForgotPassword(email);
      setStatus(response);
      setChecker(true);
      setEmail({ ...email, email: "" });
      setReset({ ...reset, email: email.email });
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <div className="forget">
      <div className="FRcontainer">
        <div className="FpTop">
          {/* <div className="rightElems">
            <MdOutlineTrendingUp className="FpIcon" />
            <h3>WealthGrow</h3>
          </div> */}
          <div className="leftElems">
            <IoMdClose onClick={toLogin} className="close" />
          </div>
        </div>
        <div>
          <div className="FpIcon">
            <MdLockReset className="resetIcon" />
            <h3>Forgot Password</h3>
          </div>
          <p>Please fill the form to reset your password!</p>
        </div>
        <div className="formContainer">
          <p>{status}</p>
          {checker === false && (
            <div>
              <form onSubmit={forgotPassword}>
                <label htmlFor="email">Email</label>
                <input
                  className="remail"
                  value={email.email}
                  onChange={(e) => {
                    setEmail({ ...email, email: e.target.value });
                  }}
                  type="email"
                />
                <button className="subBtn" type="submit">
                  Submit
                </button>
              </form>
            </div>
          )}
          {checker === true && (
            <div>
              <form onSubmit={resetPassword}>
                <label htmlFor="email">Email</label>
                <input
                  className="remail"
                  value={reset.email}
                  onChange={(e) => {
                    setEmail({ ...email, email: e.target.value });
                  }}
                  type="email"
                />
                <label>New Password</label>
                <input
                  className="remail"
                  value={reset.password}
                  onChange={(e) =>
                    setReset({ ...reset, password: e.target.value })
                  }
                  type="password"
                />
                <label>Code</label>
                <input
                  className="remail"
                  value={reset.code}
                  onChange={(e) => setReset({ ...reset, code: e.target.value })}
                  type="password"
                />
                <button className="subBtn" type="submit">
                  Submit
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
