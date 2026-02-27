import React, { useState } from "react";
import "./signUp.css";
import { FcGoogle } from "react-icons/fc";
import { MdOutlineTrendingUp } from "react-icons/md";
import { FaApple } from "react-icons/fa";
import authSercice from "../../Services/UserService";
import type { SignUp } from "../../Services/Interfaces/UserInterface";
import { useNavigate } from "react-router";

export default function SignUp() {
  const [formData, setFormData] = useState<SignUp>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
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
    <div className="signUp">
      <MdOutlineTrendingUp className="loginIcon" />
      <h1 className="LoginTitle">WealthGrow</h1>
      <h3>Join WealthGrow today to grow your wealth</h3>
      <div className="signupContainer">
        <div className="signupHelper">
          <form onSubmit={submitHendler}>
            {error}
            <div className="inputCont">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                className="signUpInp firstName"
                onChange={(e) => {
                  setFormData({ ...formData, firstName: e.target.value });
                }}
              />
            </div>
            <div className="inputCont">
              <label htmlFor="lastName">Last Name</label>
              <input
                onChange={(e) => {
                  setFormData({ ...formData, lastName: e.target.value });
                }}
                type="text"
                className="signUpInp lastName"
              />
            </div>
            <div className="inputCont">
              <label htmlFor="Email">Email</label>
              <input
                className="signUpInp email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="inputCont">
              <label htmlFor="Password">Password</label>
              <input
                className="signUpInp password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
            <button className="loginBtn">Sign Up</button>
          </form>
          <p className="separator">Or sign up with</p>
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
          <p>Already have an account?</p>
          <p onClick={toLogin} className="toSignInBtn">
            Log in
          </p>
        </div>
      </div>
    </div>
  );
}
