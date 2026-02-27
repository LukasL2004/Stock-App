import { useState } from "react";
import "./Navbar.css";
import { useNavigate } from "react-router";
import { MdOutlineTrendingUp } from "react-icons/md";
import { FaRegBell } from "react-icons/fa";

export default function Navbar() {
  const navigate = useNavigate();

  const toHome = () => {
    navigate("/LandingPage");
  };

  function toProfile() {
    navigate("/Profile");
  }

  const toLogOut = () => {
    navigate("/Wallet");
  };

  function Home() {
    navigate("/LandingPage");
  }

  return (
    <div className="nav">
      <div className="left">
        <div onClick={toHome} className="navAppLogo">
          <MdOutlineTrendingUp className="navIcon" />
          <h2 className="appName">WealthGrow</h2>
        </div>
        <div className="navLinks">
          <ul className="links">
            <li onClick={Home}>Home</li>
            <li onClick={toLogOut}>Wallet</li>
            <li>Your chart</li>
          </ul>
        </div>
      </div>
      <div className="profileWrapper">
        <FaRegBell className="bell" />
        <img
          onClick={toProfile}
          className="profileImg"
          src="/poza_cv.jpg"
          alt="profile"
        />
      </div>
    </div>
  );
}
