import "./ForgotPassword.css";
import React, { useState } from "react";
import authService from "../../Services/UserService";
import type {
  ForgotPassword,
  resetPassword,
} from "../../Services/Interfaces/UserInterface";

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

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await authService.ResetPassword(reset);
      setStatus(response);
    } catch (e) {
      console.error(e);
    }
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
    <div>
      <div className="FRcontainer">
        <h1>Forgot Password</h1>
        <div className="formContainer">
          <p>{status}</p>
          {checker === false && (
            <div>
              <form onSubmit={forgotPassword}>
                <label htmlFor="email">Email</label>
                <input
                  value={email.email}
                  onChange={(e) => {
                    setEmail({ ...email, email: e.target.value });
                  }}
                  type="email"
                />
                <button type="submit">Submit</button>
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
                  value={reset.password}
                  onChange={(e) =>
                    setReset({ ...reset, password: e.target.value })
                  }
                  type="password"
                />
                <label>Code</label>
                <input
                  value={reset.code}
                  onChange={(e) => setReset({ ...reset, code: e.target.value })}
                  type="password"
                />
                <button type="submit">Submit</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
