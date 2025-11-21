import React, { useState } from "react";
import "./login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submitHendler = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    console.log(email, password);

    setEmail("");
    setPassword("");
  };

  return (
    <div className="login">
      <div className="box"></div>
      <div className="loginBox">
        <div className="container">
          <form onSubmit={submitHendler}>
            <h1>STOCKER</h1>
            <h3>Join us today to grow your wealth</h3>
            {error}
            <label htmlFor="Email">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label htmlFor="Password">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button>Submit</button>
          </form>
        </div>
      </div>
    </div>
  );
}
