import React, { useState } from "react";
import "./signUp.css";

import authSercice from "../../Services/UserService";
import type { Login } from "../../Services/Interfaces/UserInterface";
import { useNavigate } from "react-router";

export default function SignUp() {
  const [formData, setFormData] = useState<Login>({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function toLogin() {
    navigate("/Login");
  }

  const submitHendler = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    console.log(formData);

    try {
      await authSercice.register(formData);
      navigate("/Login");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="login">
      <div className="box"></div>
      <div className="loginBox">
        <div className="container">
          <form onSubmit={submitHendler}>
            <div className="switch">
              <h1 onClick={toLogin}>Login</h1>
              <h1>|</h1>
              <h1 className="openedBtn">Sign up</h1>
            </div>
            <h1>STOCKER</h1>
            <h3>Join us today to grow your wealth</h3>
            {error}
            <label htmlFor="Email">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            <label htmlFor="Password">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
            <button className="btn">Submit</button>
          </form>
        </div>
      </div>
    </div>
  );
}
