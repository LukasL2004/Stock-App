import React, { useState } from "react";
import "./login.css";
import { FcGoogle } from "react-icons/fc";
import { MdOutlineTrendingUp } from "react-icons/md";
import { FaApple } from "react-icons/fa";
import authSercice from "../../Services/UserService";
import type { Login } from "../../Services/Interfaces/UserInterface";
import { useNavigate } from "react-router";

export default function Login() {
  const [formData, setFormData] = useState<Login>({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function toSignUp() {
    navigate("/SignUp");
  }

  const submitHendler = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    console.log(formData);

    try {
      const response = await authSercice.login(formData);
      navigate("/Profile");
      console.log(response);
      localStorage.setItem("email", formData.email);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="login">
      <div className="loginPage">
        <MdOutlineTrendingUp className="loginIcon" />
        <h1 className="LoginTitle">WealthGrow</h1>
        <p className="welocomeMsg">
          Welcome back. Please login in your portofolio
        </p>
        <div className="loginContainer">
          <div className="loginHelper">
            <form onSubmit={submitHendler}>
              {error}
              <label className="email" htmlFor="Email">
                Email
              </label>
              <input
                className="loginInp"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <div className="loginPass">
                <label htmlFor="Password">Password</label>
                <p className="forgot">Forgot Password?</p>
              </div>
              <input
                className="loginInp"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
              <div className="remember">
                <input type="checkbox" />
                <p>Remember Me</p>
              </div>
              <button className="loginBtn">Submit</button>
            </form>
            <p className="separator">Or continue with </p>
            <div className="others">
              <div className="thirdParty">
                <FcGoogle className="compIcon" />
                <p>Google</p>
              </div>
              <div className="thirdParty">
                <FaApple className="compIcon" />
                <p>Apple</p>
              </div>
            </div>
          </div>
          <div className="toSignIn">
            <p>Don't have an account?</p>
            <p onClick={toSignUp} className="toSignInBtn">
              Sign Up
            </p>
          </div>
        </div>
        <p className="credentials">© 2023 Stocker Inc. All rights reserved</p>
      </div>
    </div>
  );
}
