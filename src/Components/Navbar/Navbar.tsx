import { useState } from "react";
import "./Navbar.css";
import { useNavigate } from "react-router";

export default function Navbar() {
  const [isClicked, setIsClicked] = useState(false);
  const navigate = useNavigate();

  function toProfile() {
    navigate("/Profile");
  }

  function logOut() {
    navigate("/Login");
    localStorage.removeItem("token");
    localStorage.removeItem("email");
  }
  const toLogOut = () => {
    navigate("/Wallet");
  };

  function Home() {
    navigate("/LandingPage");
  }

  return (
    <div className="nav">
      <div className="name">
        <p>WealthGrow</p>
      </div>

      <ul className="links">
        <li onClick={Home}>Home</li>
        <li onClick={toLogOut}>Wallet</li>
        <li>Your chart</li>
      </ul>

      <div className="profileWrapper">
        <img
          onClick={() => setIsClicked(!isClicked)}
          className="profileImg"
          src="/poza_cv.jpg"
          alt="profile"
        />

        {isClicked && (
          <ul className="dropdown">
            <li onClick={toProfile} className="dropdownLink">
              Profile
            </li>
            <li onClick={logOut} className="dropdownLink">
              Sign Out
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}
